import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

import { DEFAULT_PARTNER_ID } from '../data/partners';
import { RequestFilter } from '../models/appointment-request-model';

interface AppointmentFiltersState {
  partnerId: string;
  view: RequestFilter;
  search: string;
}

const initialState: AppointmentFiltersState = {
  partnerId: DEFAULT_PARTNER_ID,
  view: 'PE',
  search: '',
};

/**
 * Selección de los filtros compartida por ambas pestañas: estado síncrono de UI
 * (ARCHITECTURE §2) — los datos siguen viniendo de TanStack Query.
 *
 * Feature-provided: se registra en los `providers` de la ruta del layout, que no
 * se destruye al navegar entre pestañas → la selección sobrevive el cambio de
 * tab y se reinicia al salir del feature.
 */
export const AppointmentFiltersStore = signalStore(
  withState(initialState),
  withMethods((store) => ({
    setPartner(partnerId: string): void {
      patchState(store, { partnerId });
    },
    setView(view: RequestFilter): void {
      patchState(store, { view });
    },
    setSearch(search: string): void {
      patchState(store, { search });
    },
  })),
);
