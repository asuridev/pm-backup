import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  AppointmentRequestDto,
  AppointmentResponseDto,
  EventStatus,
} from '../models/appointment-request-model';

export interface RequestQueryParams {
  /** Omitido → "Todos". */
  eventStatus?: EventStatus;
  /** Omitido → todos los socios. */
  partnerId?: string;
}

const MOCK_URL = 'mock/appointments-mock.json';
const REQUESTS_PATH = '/emission/v2/requests/appointment';

/**
 * Única puerta HTTP del feature (CONSTITUTION §1, §4). Envuelve `HttpClient` y
 * conmuta entre data mockeada (`environment.useMocks`) y el endpoint real.
 */
@Injectable({ providedIn: 'root' })
export class AppointmentsApiService {
  private http = inject(HttpClient);

  getAppointmentRequests(
    params: RequestQueryParams = {},
  ): Observable<AppointmentRequestDto[]> {
    return environment.useMocks
      ? this.fromMock(params)
      : this.fromApi(params);
  }

  private fromMock(
    params: RequestQueryParams,
  ): Observable<AppointmentRequestDto[]> {
    return this.http.get<AppointmentResponseDto>(MOCK_URL).pipe(
      map((res) => res.bodyResponse ?? []),
      // El mock no trae `partnerId`; solo se puede simular el filtro por estado.
      map((rows) =>
        params.eventStatus
          ? rows.filter((r) => r.event.status === params.eventStatus)
          : rows,
      ),
    );
  }

  private fromApi(
    params: RequestQueryParams,
  ): Observable<AppointmentRequestDto[]> {
    let httpParams = new HttpParams();
    if (params.eventStatus) {
      httpParams = httpParams.set('eventStatus', params.eventStatus);
    }
    if (params.partnerId) {
      httpParams = httpParams.set('partnerId', params.partnerId);
    }
    return this.http
      .get<AppointmentResponseDto>(`${environment.apiUrl}${REQUESTS_PATH}`, {
        params: httpParams,
      })
      .pipe(map((res) => res.bodyResponse ?? []));
  }
}
