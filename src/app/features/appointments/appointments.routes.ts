import { Routes } from '@angular/router';

/**
 * Rutas del feature (lazy desde app.routes). El layout es el padre; cada página
 * es su propio chunk vía loadComponent (ARCHITECTURE §4).
 */
export const APPOINTMENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layouts/appointments-layout').then((m) => m.AppointmentsLayout),
    children: [
      {
        path: 'asignacion-de-citas',
        loadComponent: () =>
          import('./pages/appointment-assignment/appointment-assignment').then(
            (m) => m.AppointmentAssignment,
          ),
      },
      {
        path: 'autorizaciones',
        loadComponent: () =>
          import('./pages/authorizations/authorizations').then(
            (m) => m.Authorizations,
          ),
      },
      { path: '', redirectTo: 'asignacion-de-citas', pathMatch: 'full' },
    ],
  },
];
