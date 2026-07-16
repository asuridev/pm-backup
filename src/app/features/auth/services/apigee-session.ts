import { DOCUMENT, Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  ApigeeCallbackMessage,
  isApigeeCallbackMessage,
} from '../models/apigee-callback-model';
import { PkceHandshake } from '../models/pkce-model';
import { ApigeeAuthApiService } from './apigee-auth-api';
import { ApigeeTokenStore } from '../store/apigee-token.store';
import { createPkceChallenge } from './pkce';

/** Clave del handshake; debe sobrevivir a la navegación del iframe. */
const HANDSHAKE_KEY = 'apigee.pkce.handshake';

/** El `/authorize` no pide interacción del usuario, así que responde rápido. */
const AUTHORIZE_TIMEOUT_MS = 10_000;

/**
 * Orquesta el flujo OAuth2 Authorization Code + PKCE contra Apigee, análogo a
 * `KeycloakSession` pero para el segundo proveedor: Keycloak autentica al
 * usuario, esto obtiene el token que exigen las APIs de `apigee.apiUrl`.
 *
 * El `/authorize` se navega en un iframe oculto para no sacar al usuario de la
 * pantalla, y el code vuelve por `postMessage` desde `ApigeeCallback`.
 *
 * Cadena: guard → ApigeeSession → ApigeeAuthApiService → HttpClient.
 */
@Injectable({ providedIn: 'root' })
export class ApigeeSession {
  private document = inject(DOCUMENT);
  private api = inject(ApigeeAuthApiService);
  private store = inject(ApigeeTokenStore);

  /** Deduplica llamadas concurrentes (varios guards en una navegación). */
  private inFlight: Promise<void> | null = null;

  /**
   * Garantiza un token vigente en el store. Nunca lanza: si el flujo falla
   * (proveedor caído, `invalid_redirect_uri`, framing bloqueado, timeout) deja
   * `status: 'error'` para que la navegación siga su curso.
   */
  ensureToken(): Promise<void> {
    if (this.store.isValid()) {
      return Promise.resolve();
    }
    this.inFlight ??= this.runFlow().finally(() => (this.inFlight = null));
    return this.inFlight;
  }

  private async runFlow(): Promise<void> {
    this.store.setPending();

    try {
      const { verifier, challenge, state } = await createPkceChallenge();
      this.saveHandshake({ verifier, state });

      const callback = await this.requestCode(this.buildAuthorizeUrl(challenge, state));

      if (callback.error || !callback.code) {
        throw new Error(callback.error ?? 'El proveedor no devolvió un code.');
      }

      const handshake = this.readHandshake();
      if (!handshake || handshake.state !== callback.state) {
        throw new Error('El `state` del callback no coincide con el enviado.');
      }

      const token = await firstValueFrom(
        this.api.exchangeCode(callback.code, handshake.verifier),
      );

      this.store.setToken(token);
    } catch (error) {
      console.error('[apigee] No se pudo obtener el token de acceso.', error);
      this.store.setError();
    } finally {
      this.clearHandshake();
    }
  }

  /** Paso 1: URL del `/authorize` con los parámetros PKCE. */
  private buildAuthorizeUrl(challenge: string, state: string): string {
    const params = new HttpParams()
      .set('response_type', 'code')
      .set('client_id', environment.apigee.clientId)
      .set('code_challenge_method', 'S256')
      .set('code_challenge', challenge)
      .set('redirect_uri', environment.apigee.redirectUri)
      .set('scope', environment.apigee.scope)
      .set('idp', environment.apigee.idp)
      .set('state', state);

    return `${environment.apigee.authUrl}/authorize?${params.toString()}`;
  }

  /**
   * Pasos 1-2: navega el `/authorize` en un iframe oculto y espera el
   * `postMessage` que emite `ApigeeCallback` al aterrizar el redirect.
   */
  private requestCode(url: string): Promise<ApigeeCallbackMessage> {
    return new Promise((resolve, reject) => {
      const iframe = this.document.createElement('iframe');
      iframe.hidden = true;
      iframe.setAttribute('aria-hidden', 'true');
      iframe.title = 'Autorización Apigee';

      const cleanup = (): void => {
        clearTimeout(timer);
        window.removeEventListener('message', onMessage);
        iframe.remove();
      };

      const onMessage = (event: MessageEvent): void => {
        if (event.origin !== window.location.origin) {
          return;
        }
        if (!isApigeeCallbackMessage(event.data)) {
          return;
        }
        cleanup();
        resolve(event.data);
      };

      const timer = setTimeout(() => {
        cleanup();
        reject(
          new Error(
            `El callback no respondió en ${AUTHORIZE_TIMEOUT_MS} ms. ` +
              'Revisa que el redirect_uri esté registrado en la app de Apigee ' +
              'y que el proveedor permita ser embebido en un iframe.',
          ),
        );
      }, AUTHORIZE_TIMEOUT_MS);

      window.addEventListener('message', onMessage);
      iframe.src = url;
      this.document.body.appendChild(iframe);
    });
  }

  private saveHandshake(handshake: PkceHandshake): void {
    sessionStorage.setItem(HANDSHAKE_KEY, JSON.stringify(handshake));
  }

  private readHandshake(): PkceHandshake | null {
    const raw = sessionStorage.getItem(HANDSHAKE_KEY);
    return raw ? (JSON.parse(raw) as PkceHandshake) : null;
  }

  /** El verifier es un secreto de un solo uso: no debe sobrevivir al canje. */
  private clearHandshake(): void {
    sessionStorage.removeItem(HANDSHAKE_KEY);
  }
}
