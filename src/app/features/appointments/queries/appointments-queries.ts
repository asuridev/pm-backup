import { Injectable, inject } from '@angular/core';
import { queryOptions } from '@tanstack/angular-query-experimental';
import { firstValueFrom } from 'rxjs';

import {
  AppointmentsApiService,
  RequestQueryParams,
} from '../services/appointments-api';

/**
 * queryOptions() del feature (ARCHITECTURE §3). El cambio de socio o de "Ver:"
 * cambia la queryKey y dispara el refetch automáticamente.
 */
@Injectable({ providedIn: 'root' })
export class AppointmentsQueries {
  private api = inject(AppointmentsApiService);

  list(params: RequestQueryParams) {
    return queryOptions({
      queryKey: ['appointments', 'requests', params] as const,
      queryFn: () => firstValueFrom(this.api.getAppointmentRequests(params)),
    });
  }
}
