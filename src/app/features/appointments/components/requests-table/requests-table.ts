import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  linkedSignal,
  output,
} from '@angular/core';

import { RequestRow } from '../../models/appointment-request-model';
import { NumberedPagination } from '../numbered-pagination/numbered-pagination';

export interface ColumnDef {
  readonly label: string;
  readonly key: keyof RequestRow;
  /** Peso de ancho (fracción del grid). Por defecto 1. */
  readonly flex?: number;
}

/** Acción emitida al pulsar el botón de la última columna. */
export interface RowAction {
  readonly row: RequestRow;
}

/**
 * Tabla presentacional column-driven. Solo renderiza el slice de la página actual
 * (`visibleRows`) → el DOM nunca contiene más de `pageSize` filas aunque lleguen
 * cientos de registros. La diferencia entre pestañas es solo `columns` y
 * `actionLabel`.
 */
@Component({
  selector: 'app-requests-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NumberedPagination],
  template: `
    <div class="mx-auto w-full max-w-[1248px]">
      <!-- Vista tabla (tablet ≥768 con scroll horizontal, completa en desktop) -->
      <div class="hidden overflow-x-auto md:block">
        <div class="min-w-[1248px]" role="table">
          <!-- Encabezado -->
          <div
            class="grid min-h-[46px] items-center bg-table-head"
            role="row"
            [style.grid-template-columns]="gridTemplate()"
          >
            @for (col of columns(); track col.key) {
              <div class="flex min-w-0 items-center justify-center px-1" role="columnheader">
                <span class="text-center text-sub leading-[1.05] text-brand-teal">
                  {{ col.label }}
                </span>
              </div>
            }
            <div class="flex min-w-0 items-center justify-center px-1" role="columnheader">
              <span class="text-center text-sub leading-[1.05] text-brand-teal">
                Respuesta
              </span>
            </div>
          </div>

          <!-- Filas (solo la página visible) -->
          @for (row of visibleRows(); track row.id; let even = $even) {
            <div
              class="grid min-h-10 items-center border-b-[0.5px] border-border-row"
              role="row"
              [class.bg-row-odd]="!even"
              [class.bg-row-even]="even"
              [style.grid-template-columns]="gridTemplate()"
            >
              @for (col of columns(); track col.key) {
                <div class="flex min-w-0 items-center justify-start px-1" role="cell">
                  <span
                    class="w-full truncate text-left text-xs text-ink"
                    [title]="row[col.key]"
                  >
                    {{ row[col.key] }}
                  </span>
                </div>
              }
              <div class="flex min-w-0 items-center justify-center px-1" role="cell">
                <button
                  type="button"
                  class="flex h-8 w-[72px] items-center justify-center rounded-action border border-brand-green text-xs text-brand-green"
                  (click)="action.emit({ row })"
                >
                  {{ actionLabel() }}
                </button>
              </div>
            </div>
          } @empty {
            <div class="flex h-24 items-center justify-center text-sm text-ink-60">
              No hay solicitudes para mostrar.
            </div>
          }
        </div>
      </div>

      <!-- Vista tarjetas (móvil <768): cada fila apilada como label:valor -->
      <div class="flex flex-col gap-3 md:hidden">
        @for (row of visibleRows(); track row.id) {
          <div class="rounded-action border border-border-row bg-row-odd p-4">
            <dl class="flex flex-col gap-2">
              @for (col of columns(); track col.key) {
                <div class="flex items-baseline justify-between gap-3">
                  <dt class="shrink-0 text-sub text-brand-teal">{{ col.label }}</dt>
                  <dd class="min-w-0 truncate text-left text-xs text-ink" [title]="row[col.key]">
                    {{ row[col.key] }}
                  </dd>
                </div>
              }
            </dl>
            <button
              type="button"
              class="mt-4 flex h-10 w-full items-center justify-center rounded-action border border-brand-green text-sm text-brand-green"
              (click)="action.emit({ row })"
            >
              {{ actionLabel() }}
            </button>
          </div>
        } @empty {
          <div class="flex h-24 items-center justify-center text-sm text-ink-60">
            No hay solicitudes para mostrar.
          </div>
        }
      </div>

      <!-- Paginación (compartida) -->
      <div class="flex justify-center pt-8 md:justify-end md:pt-10">
        <app-numbered-pagination
          [page]="page()"
          [total]="rows().length"
          [pageSize]="pageSize()"
          (pageChange)="page.set($event)"
        />
      </div>
    </div>
  `,
})
export class RequestsTable {
  readonly columns = input.required<readonly ColumnDef[]>();
  readonly rows = input.required<readonly RequestRow[]>();
  readonly actionLabel = input.required<string>();
  readonly pageSize = input<number>(10);
  readonly action = output<RowAction>();

  /** Se reinicia a la página 0 cada vez que cambian las filas (nuevo filtro). */
  protected readonly page = linkedSignal<readonly RequestRow[], number>({
    source: this.rows,
    computation: () => 0,
  });

  protected readonly gridTemplate = computed(() =>
    [...this.columns().map((c) => `${c.flex ?? 1}fr`), '1.1fr'].join(' '),
  );

  protected readonly visibleRows = computed(() => {
    const size = this.pageSize();
    const start = this.page() * size;
    return this.rows().slice(start, start + size);
  });
}
