import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';

/**
 * Paginación numerada (pixel-perfect con el diseño): flechas prev/next + números,
 * el número activo subrayado en verde claro. `page` es 0-indexed.
 */
@Component({
  selector: 'app-numbered-pagination',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (totalPages() > 1) {
      <nav
        class="flex items-center gap-[22px] font-roboto text-sm"
        aria-label="Paginación"
      >
        <button
          type="button"
          class="flex size-[10px] items-center justify-center disabled:opacity-30"
          [disabled]="page() === 0"
          (click)="go(page() - 1)"
          aria-label="Anterior"
        >
          <img src="assets/images/page-arrow-left.svg" alt="" class="h-[6px] w-[9px] rotate-90" />
        </button>

        @for (p of visiblePages(); track p) {
          <button
            type="button"
            class="relative pb-1 leading-none"
            [class.text-green-light]="p === page()"
            [class.text-ink-60]="p !== page()"
            (click)="go(p)"
          >
            {{ p + 1 }}
            @if (p === page()) {
              <span
                class="absolute bottom-0 left-1/2 h-0.5 w-[13px] -translate-x-1/2 bg-green-light"
              ></span>
            }
          </button>
        }

        <button
          type="button"
          class="flex size-[10px] items-center justify-center disabled:opacity-30"
          [disabled]="page() >= totalPages() - 1"
          (click)="go(page() + 1)"
          aria-label="Siguiente"
        >
          <img src="assets/images/page-arrow-right.svg" alt="" class="h-[6px] w-[9px] -rotate-90" />
        </button>
      </nav>
    }
  `,
})
export class NumberedPagination {
  readonly page = input.required<number>();
  readonly total = input.required<number>();
  readonly pageSize = input<number>(10);
  readonly pageChange = output<number>();

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.total() / this.pageSize())),
  );

  /** Ventana de máximo 5 números centrada en la página actual. */
  protected readonly visiblePages = computed<number[]>(() => {
    const pages = this.totalPages();
    const current = this.page();
    const windowSize = Math.min(5, pages);
    let start = Math.max(0, current - Math.floor(windowSize / 2));
    start = Math.min(start, pages - windowSize);
    return Array.from({ length: windowSize }, (_, i) => start + i);
  });

  protected go(p: number): void {
    if (p < 0 || p > this.totalPages() - 1 || p === this.page()) return;
    this.pageChange.emit(p);
  }
}
