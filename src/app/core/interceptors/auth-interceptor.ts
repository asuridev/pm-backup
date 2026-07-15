import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import Keycloak from 'keycloak-js';

import { environment } from '../../../environments/environment';

/**
 * Adjunta `Authorization: Bearer <token>` a las peticiones salientes hacia el
 * gateway de emisión (`environment.apiUrl`), leyendo el token del adapter
 * Keycloak (ARCHITECTURE §3). No toca las peticiones a assets locales (mocks).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const keycloak = inject(Keycloak);
  const token = keycloak.token;

  if (!token || !req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  return next(
    req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }),
  );
};
