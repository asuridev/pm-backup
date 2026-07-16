import { computed } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';

import { ApigeeToken } from '../models/apigee-token-model';

export type ApigeeTokenStatus = 'idle' | 'pending' | 'ready' | 'error';

interface ApigeeTokenState {
  accessToken: string | null;
  refreshToken: string | null;
  /** Epoch ms; `null` mientras no haya token. */
  expiresAt: number | null;
  status: ApigeeTokenStatus;
}

const initialState: ApigeeTokenState = {
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
  status: 'idle',
};

/** Margen para no usar un token que expira mientras la petición viaja. */
const EXPIRY_SKEW_MS = 30_000;

/**
 * Estado síncrono del token de Apigee (ARCHITECTURE §2), equivalente a
 * `AuthStore` pero para el segundo proveedor. Vive solo en memoria: al recargar
 * la página el flujo se repite, que es silencioso.
 *
 * Sin HTTP ni `rxMethod`: quien lo hidrata vía `patchState` es `ApigeeSession`.
 */
export const ApigeeTokenStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ accessToken, expiresAt }) => ({
    isValid: computed(
      () =>
        accessToken() !== null &&
        expiresAt() !== null &&
        Date.now() < expiresAt()! - EXPIRY_SKEW_MS,
    ),
  })),
  withMethods((store) => ({
    /** El flujo arrancó: hay una vuelta de `/authorize` en curso. */
    setPending(): void {
      patchState(store, { status: 'pending' });
    },
    setToken(token: ApigeeToken): void {
      patchState(store, {
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
        expiresAt: token.expiresAt,
        status: 'ready',
      });
    },
    /** Descarta cualquier token previo: un flujo fallido no deja residuos. */
    setError(): void {
      patchState(store, { ...initialState, status: 'error' });
    },
  })),
);
