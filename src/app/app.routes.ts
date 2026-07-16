import { Routes } from '@angular/router';

import { authGuard } from './features/auth/guards/auth-guard';
import { apigeeTokenGuard } from './features/auth/guards/apigee-token-guard';

export const routes: Routes = [
  {
    // `redirect_uri` de Apigee. Se carga dentro de un iframe oculto y sin
    // guards: no representa una pantalla del portal, solo captura el `code`.
    path: 'callback',
    loadComponent: () =>
      import('./features/auth/pages/apigee-callback/apigee-callback').then(
        (m) => m.ApigeeCallback,
      ),
  },
  {
    path: '',
    canActivate: [authGuard, apigeeTokenGuard],
    loadChildren: () =>
      import('./features/appointments/appointments.routes').then(
        (m) => m.APPOINTMENTS_ROUTES,
      ),
  },
];
