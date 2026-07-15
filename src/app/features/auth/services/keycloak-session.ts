import { Injectable, inject } from '@angular/core';
import Keycloak from 'keycloak-js';

/**
 * Única puerta a la API imperativa del adapter Keycloak (login/logout). Los
 * componentes la consumen por DI y nunca instancian `keycloak-js` directamente.
 * La lectura reactiva de la sesión vive en `AuthStore`.
 */
@Injectable({ providedIn: 'root' })
export class KeycloakSession {
  private keycloak = inject(Keycloak);

  /** Redirige al login de Keycloak; al volver, aterriza en la URL actual. */
  login(): Promise<void> {
    return this.keycloak.login({ redirectUri: window.location.href });
  }

  /** Cierra la sesión y vuelve a la raíz del portal. */
  logout(): Promise<void> {
    return this.keycloak.logout({ redirectUri: window.location.origin });
  }
}
