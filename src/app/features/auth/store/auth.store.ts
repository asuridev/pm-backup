import { computed, effect, inject } from '@angular/core';
import { signalStore, withComputed, withHooks, withState, patchState } from '@ngrx/signals';
import Keycloak from 'keycloak-js';
import {
  KEYCLOAK_EVENT_SIGNAL,
  KeycloakEventType,
  ReadyArgs,
  typeEventArgs,
} from 'keycloak-angular';

/**
 * Perfil mínimo derivado del token (síncrono, sin HTTP adicional).
 */
interface SessionProfile {
  username: string;
  fullName: string;
  email: string;
}

interface AuthState {
  authenticated: boolean;
  profile: SessionProfile | null;
  roles: readonly string[];
}

const initialState: AuthState = {
  authenticated: false,
  profile: null,
  roles: [],
};

/**
 * Estado síncrono de sesión (ARCHITECTURE §2). Se hidrata desde las señales de
 * keycloak-angular leyendo el token ya parseado por el adapter — no dispara
 * ninguna llamada HTTP. Los componentes lo consumen por DI (nunca tocan el
 * adapter directamente para leer identidad).
 */
export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ profile }) => ({
    displayName: computed(
      () => profile()?.fullName ?? profile()?.username ?? '',
    ),
  })),
  withHooks({
    onInit(store) {
      const keycloak = inject(Keycloak);
      const keycloakEvent = inject(KEYCLOAK_EVENT_SIGNAL);

      const sync = (authenticated: boolean): void => {
        const token = keycloak.tokenParsed;
        patchState(store, {
          authenticated,
          profile:
            authenticated && token
              ? {
                  username: token['preferred_username'] ?? '',
                  fullName:
                    token['name'] ??
                    [token['given_name'], token['family_name']]
                      .filter(Boolean)
                      .join(' '),
                  email: token['email'] ?? '',
                }
              : null,
          roles: authenticated ? (token?.realm_access?.roles ?? []) : [],
        });
      };

      effect(() => {
        const event = keycloakEvent();

        switch (event.type) {
          case KeycloakEventType.Ready:
            sync(typeEventArgs<ReadyArgs>(event.args));
            break;
          case KeycloakEventType.AuthSuccess:
          case KeycloakEventType.AuthRefreshSuccess:
            sync(true);
            break;
          case KeycloakEventType.AuthLogout:
          case KeycloakEventType.TokenExpired:
            sync(false);
            break;
        }
      });
    },
  }),
);
