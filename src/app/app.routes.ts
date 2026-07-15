import { Routes } from '@angular/router';

import { authGuard } from './features/auth/guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/appointments/appointments.routes').then(
        (m) => m.APPOINTMENTS_ROUTES,
      ),
  },
];
