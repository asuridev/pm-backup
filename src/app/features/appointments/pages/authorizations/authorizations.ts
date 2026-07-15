import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';

import { RequestFilters } from '../../components/request-filters/request-filters';
import { ColumnDef, RequestsTable } from '../../components/requests-table/requests-table';
import { AppointmentsQueries } from '../../queries/appointments-queries';
import {
  RequestFilter,
  mapDtoToRow,
} from '../../models/appointment-request-model';
import { filterRowsBySearch } from '../../models/filter-rows';

const COLUMNS: readonly ColumnDef[] = [
  { label: 'Nombre del cliente', key: 'nombre' },
  { label: 'Apellido', key: 'apellido' },
  { label: 'Cédula', key: 'cedula' },
  { label: 'Número de celular', key: 'celular' },
  { label: 'Correo electrónico', key: 'correo', flex: 1.6 },
  { label: 'Valor asegurado', key: 'valorAsegurado' },
  { label: 'Código de seguridad', key: 'codigoSeguridad' },
  { label: 'Fecha de solicitud', key: 'fechaSolicitud' },
  { label: 'Fecha de respuesta', key: 'fechaRespuesta' },
  { label: 'Número de aprobación', key: 'numeroAprobacion' },
  { label: 'Estado', key: 'statusLabel' },
];

@Component({
  selector: 'app-authorizations',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RequestFilters, RequestsTable],
  template: `
    <app-request-filters
      (partnerChange)="partnerId.set($event)"
      (viewChange)="view.set($event)"
      (searchChange)="search.set($event)"
    />

    @if (query.isPending()) {
      <p class="pt-12 text-center text-sm text-ink-60">Cargando solicitudes…</p>
    } @else if (query.isError()) {
      <p class="pt-12 text-center text-sm text-brand-green">
        No se pudo cargar la información. Intenta de nuevo.
      </p>
    } @else {
      <div class="pt-8">
        <app-requests-table
          [columns]="columns"
          [rows]="rows()"
          actionLabel="Redefinir"
        />
      </div>
    }
  `,
})
export class Authorizations {
  private queries = inject(AppointmentsQueries);

  protected readonly columns = COLUMNS;
  protected readonly partnerId = signal<string | undefined>(undefined);
  protected readonly view = signal<RequestFilter>('ALL');
  protected readonly search = signal('');

  protected readonly query = injectQuery(() => {
    const view = this.view();
    return this.queries.list({
      partnerId: this.partnerId(),
      eventStatus: view === 'ALL' ? undefined : view,
    });
  });

  protected readonly rows = computed(() =>
    filterRowsBySearch((this.query.data() ?? []).map(mapDtoToRow), this.search()),
  );
}
