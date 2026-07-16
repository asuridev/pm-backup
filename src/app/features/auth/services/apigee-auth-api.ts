import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApigeeToken, ApigeeTokenDto } from '../models/apigee-token-model';

const TOKEN_PATH = '/token';

/**
 * Única puerta HTTP contra el Authorization Server de Apigee (CONSTITUTION §1,
 * §4). Solo transporta y mapea; el flujo lo orquesta `ApigeeSession`.
 */
@Injectable({ providedIn: 'root' })
export class ApigeeAuthApiService {
  private http = inject(HttpClient);

  /** Paso 3 del flujo: canjea el `code` del callback por un access token. */
  exchangeCode(code: string, verifier: string): Observable<ApigeeToken> {
    const body = new HttpParams()
      .set('grant_type', 'authorization_code')
      .set('code', code)
      .set('redirect_uri', environment.apigee.redirectUri)
      .set('client_id', environment.apigee.clientId)
      .set('code_verifier', verifier);

    return this.http
      .post<ApigeeTokenDto>(
        `${environment.apigee.authUrl}${TOKEN_PATH}`,
        // `HttpParams` como body ⇒ Angular pone el content-type
        // `application/x-www-form-urlencoded` que exige el endpoint.
        body,
      )
      .pipe(
        map((dto) => ({
          accessToken: dto.access_token,
          refreshToken: dto.refresh_token,
          expiresAt: Date.now() + dto.expires_in * 1000,
        })),
      );
  }
}
