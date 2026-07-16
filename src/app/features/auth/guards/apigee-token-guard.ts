import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';

import { ApigeeSession } from '../services/apigee-session';

/**
 * Precalienta el token de Apigee al entrar al portal, una vez que Keycloak ya
 * validó la sesión (por eso se encadena DESPUÉS de `authGuard`, siguiendo el
 * orden por capas de ARCHITECTURE §4).
 *
 * Deliberadamente NO espera el flujo: el token habilita las APIs de Apigee pero
 * no condiciona el acceso al portal, y esperarlo congelaría la navegación hasta
 * el timeout cuando el proveedor no responde. Quien sí garantiza el token es
 * `authInterceptor`, justo antes de la petición que lo necesita; aquí solo se
 * adelanta el trabajo para que ya esté listo cuando llegue esa petición.
 */
export const apigeeTokenGuard: CanActivateFn = () => {
  void inject(ApigeeSession).ensureToken();
  return true;
};
