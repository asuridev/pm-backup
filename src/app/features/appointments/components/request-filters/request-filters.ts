import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { PARTNERS } from '../../data/partners';
import { RequestFilter } from '../../models/appointment-request-model';
import { AppointmentFiltersStore } from '../../store/appointment-filters.store';

interface ViewOption {
  readonly label: string;
  readonly value: RequestFilter;
}

const VIEW_OPTIONS: readonly ViewOption[] = [
  { label: 'Todos', value: 'ALL' },
  { label: 'Pendientes', value: 'PE' },
  { label: 'Autorizados', value: 'AU' },
  { label: 'Rechazados', value: 'RE' },
];

/**
 * Bloque de filtros compartido por ambas pestañas: select de socio, búsqueda por
 * nombre/cédula (client-side) y filtro "Ver:" (→ eventStatus). Reactive Forms
 * (CONSTITUTION §8). Escribe cada cambio en `AppointmentFiltersStore`, del que
 * también lee su selección — así el bloque se rehidrata al volver a montarse.
 */
@Component({
  selector: 'app-request-filters',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  host: { '(document:click)': 'closeSocio()' },
  template: `
    <div
      class="mx-auto flex w-full max-w-[1248px] flex-col gap-6 pt-8 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-x-12 md:gap-y-4"
    >
      <div class="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:gap-8 md:w-auto">
        <!-- Select de socio (dropdown custom: hover con color de marca, no el azul nativo) -->
        <label class="flex w-full flex-col gap-2.5 sm:w-[335px]">
          <span class="text-label text-brand-green">Seleccionar socio</span>
          <div class="relative">
            <button
              type="button"
              class="flex h-[36.55px] w-full items-center justify-between rounded-input border-[1.08px] border-border-input bg-white px-2.5 text-base text-ink-60 outline-none"
              (click)="toggleSocio($event)"
            >
              <span>{{ selectedLabel() }}</span>
              <img
                src="images/dropdown-arrow.svg"
                alt=""
                class="h-[6px] w-[12px] transition-transform"
                [class.rotate-180]="socioOpen()"
              />
            </button>

            @if (socioOpen()) {
              <ul
                class="absolute top-full left-0 z-20 mt-1 max-h-64 w-full overflow-auto rounded-input border-[1.08px] border-border-input bg-white py-1 shadow-lg"
              >
                @for (partner of partners; track partner.id) {
                  <li>
                    <button
                      type="button"
                      class="block w-full px-2.5 py-2 text-left text-base hover:bg-brand-green hover:text-white"
                      [class.text-brand-green]="store.partnerId() === partner.id"
                      [class.text-ink-60]="store.partnerId() !== partner.id"
                      (click)="selectSocio(partner.id)"
                    >
                      {{ partner.name }}
                    </button>
                  </li>
                }
              </ul>
            }
          </div>
        </label>

        <!-- Búsqueda -->
        <label class="flex w-full flex-col gap-2.5 sm:w-[335px]">
          <span class="text-label text-brand-green">Buscar</span>
          <div class="relative">
            <input
              type="text"
              [formControl]="form.controls.search"
              placeholder="Busca por nombre o cédula"
              class="h-[36.55px] w-full rounded-input border-[1.08px] border-border-input bg-white px-2.5 pr-9 text-base font-light text-ink placeholder:text-medium-40 outline-none"
            />
            <img
              src="images/search.svg"
              alt=""
              class="pointer-events-none absolute top-1/2 right-2.5 h-[14px] w-[13px] -translate-y-1/2"
            />
          </div>
        </label>
      </div>

      <!-- Ver: -->
      <div class="flex flex-wrap items-center gap-x-8 gap-y-2 text-label">
        <span class="text-ink">Ver:</span>
        <div class="flex flex-wrap items-end gap-4 text-brand-teal">
          @for (opt of viewOptions; track opt.value) {
            <button
              type="button"
              [class.underline]="opt.value === store.view()"
              (click)="setView(opt.value)"
            >
              {{ opt.label }}
            </button>
          }
        </div>
      </div>
    </div>
  `,
})
export class RequestFilters {
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  protected readonly store = inject(AppointmentFiltersStore);
  protected readonly partners = PARTNERS;
  protected readonly viewOptions = VIEW_OPTIONS;

  /** Estado del dropdown custom de socio (UI efímera, no va al store). */
  protected readonly socioOpen = signal(false);
  protected readonly selectedLabel = computed(
    () => PARTNERS.find((p) => p.id === this.store.partnerId())?.name ?? '',
  );

  protected readonly form = this.fb.nonNullable.group({
    partnerId: this.store.partnerId(),
    search: this.store.search(),
  });

  constructor() {
    this.form.controls.partnerId.valueChanges
      .pipe(distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((id) => this.store.setPartner(id));

    this.form.controls.search.valueChanges
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((text) => this.store.setSearch(text.trim()));
  }

  protected setView(value: RequestFilter): void {
    this.store.setView(value);
  }

  protected toggleSocio(event: Event): void {
    // Evita que el click burbujee al listener de documento y lo cierre al instante.
    event.stopPropagation();
    this.socioOpen.update((open) => !open);
  }

  protected selectSocio(id: string): void {
    this.form.controls.partnerId.setValue(id);
    this.socioOpen.set(false);
  }

  protected closeSocio(): void {
    this.socioOpen.set(false);
  }
}
