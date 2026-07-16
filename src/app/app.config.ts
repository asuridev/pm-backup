import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideTanStackQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { provideKeycloak } from 'keycloak-angular';

import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth-interceptor';

/**
 * La ruta `/callback` se carga dentro del iframe oculto de `ApigeeSession`, y
 * eso bootstrapea la app entera otra vez. Sin esta guarda, `login-required`
 * volvería a dispararse dentro del iframe y el flujo entraría en bucle.
 */
const isApigeeCallbackFrame =
  window.self !== window.top && window.location.pathname === '/callback';

export const appConfig: ApplicationConfig = {
  providers: [
    // `login-required` fuerza que un usuario sin sesión sea redirigido
    // directamente al login de Keycloak durante el bootstrap (sin página
    // intermedia). `provideKeycloak` cablea el app initializer automáticamente.
    ...(isApigeeCallbackFrame
      ? []
      : [
          provideKeycloak({
            config: environment.keycloak,
            initOptions: {
              onLoad: 'login-required',
            },
          }),
        ]),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideTanStackQuery(new QueryClient())
  ]
};
