import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import Keycloak from 'keycloak-js';

import { environment } from '../../../environments/environment';
import { ApigeeSession } from '../../features/auth/services/apigee-session';
import { ApigeeTokenStore } from '../../features/auth/store/apigee-token.store';

/**
 * Adjunta `Authorization: Bearer <token>` según el destino de la petición
 * (ARCHITECTURE §3), porque el portal habla con dos proveedores distintos:
 *
 * - `apigee.apiUrl` → token de `ApigeeTokenStore`, obtenido por `ApigeeSession`.
 * - `apiUrl` (gateway de emisión) → token del adapter Keycloak.
 *
 * No toca las peticiones a assets locales (mocks) ni al `/token` de Apigee, que
 * se autentica con el `code_verifier` en el body y rechazaría un Bearer.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.startsWith(environment.apigee.authUrl)) {
    return next(req);
  }

  if (req.url.startsWith(environment.apigee.apiUrl)) {
    const session = inject(ApigeeSession);
    const store = inject(ApigeeTokenStore);

    // Aquí sí se espera el flujo: es el punto donde el token hace falta de
    // verdad. `ensureToken` deduplica y resuelve al instante si ya hay uno
    // vigente (el guard lo precalienta al entrar al portal). Si falla, la
    // petición sale sin Bearer y deja que el proveedor responda 401.
    return from(session.ensureToken()).pipe(
      switchMap(() => {
        const token = store.accessToken();
        return next(
          token
            ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
            : req,
        );
      }),
    );
  }

  const keycloak = inject(Keycloak);
  const token = keycloak.token;

  if (!token || !req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  return next(
    req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }),
  );
};
