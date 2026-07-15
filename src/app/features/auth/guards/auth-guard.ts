import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import Keycloak from 'keycloak-js';
import { AuthGuardData, createAuthGuard } from 'keycloak-angular';

/**
 * Guard de refuerzo: protege las rutas del portal exigiendo sesión activa. Con
 * `onLoad: 'login-required'` el adapter ya fuerza el login en el bootstrap;
 * este guard cubre el caso en que la sesión se pierda tras la carga (p. ej.
 * token expirado sin refresco), reenviando al login de Keycloak (ARCHITECTURE §4).
 */
const isAccessAllowed = async (
  _route: unknown,
  _state: unknown,
  { authenticated }: AuthGuardData,
): Promise<boolean> => {
  if (authenticated) {
    return true;
  }

  await inject(Keycloak).login({ redirectUri: window.location.href });
  return false;
};

export const authGuard = createAuthGuard<CanActivateFn>(isAccessAllowed);
