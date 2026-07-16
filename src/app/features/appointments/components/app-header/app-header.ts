import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { AuthStore } from '../../../auth/store/auth.store';
import { KeycloakSession } from '../../../auth/services/keycloak-session';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="w-full">
      <!-- Barra superior: fecha/hora -->
      <div class="bg-brand-green">
        <div class="mx-auto flex h-9 max-w-[1440px] items-center pl-4 md:pl-12 lg:pl-[97px]">
          <span class="truncate font-condensed text-base tracking-[1.3px] text-light-20 md:text-xl">
            {{ dateLabel() }}
          </span>
        </div>
      </div>

      <!-- Barra principal: logo + título + usuario -->
      <div class="bg-light-20">
        <div
          class="mx-auto flex h-16 max-w-[1440px] items-center px-4 md:h-[75px] md:px-8 lg:px-12 2xl:pl-[78px] 2xl:pr-[60px]"
        >
          <img
            src="assets/images/logo.png"
            alt="BNP Paribas Cardif"
            class="h-9 w-auto shrink-0 md:h-[44px]"
          />
          <span class="mx-4 hidden h-[42px] w-px shrink-0 bg-medium-40 md:block lg:mx-[22px]"></span>
          <span
            class="hidden shrink-0 font-condensed text-base tracking-[1.3px] whitespace-nowrap text-ink-40 sm:inline md:text-xl"
          >
            PORTAL DE MÉDICOS CARDIF
          </span>
          <span class="ml-6 hidden shrink-0 text-base whitespace-nowrap text-black xl:inline">
            Seguros para un mundo en evolución
          </span>

          <div class="ml-auto flex shrink-0 items-center gap-3 md:gap-8">
            <span class="hidden text-xs whitespace-nowrap text-brand-teal xl:inline">Autorizaciones</span>
            <div class="flex min-w-0 items-center gap-2">
              <span
                class="flex h-4 w-[15px] shrink-0 items-center justify-center rounded-[2.7px] border-[0.7px] border-brand-green"
              >
                <img src="assets/images/user-icon.svg" alt="" class="h-[11px] w-[10px]" />
              </span>
              <span class="hidden max-w-[220px] truncate text-xs text-brand-teal lg:inline">
                {{ displayName() }}
              </span>
              <button
                type="button"
                (click)="logout()"
                aria-label="Cerrar sesión"
                class="flex shrink-0 items-center"
              >
                <img src="assets/images/chevron-down.svg" alt="" class="size-3 rotate-180" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  `,
})
export class AppHeader {
  private readonly authStore = inject(AuthStore);
  private readonly session = inject(KeycloakSession);

  protected readonly displayName = this.authStore.displayName;
  protected readonly dateLabel = signal(this.buildDateLabel());

  protected logout(): void {
    void this.session.logout();
  }

  private buildDateLabel(): string {
    const now = new Date();
    // Diseño: día de la semana en MAYÚSCULA + fecha + hora con a.m./p.m. en
    // minúscula, sin coma (ej. "VIERNES 24/2019 05:00 a.m.").
    const weekday = new Intl.DateTimeFormat('es-CO', { weekday: 'long' })
      .format(now)
      .toUpperCase();
    const date = new Intl.DateTimeFormat('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(now);
    const time = new Intl.DateTimeFormat('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(now);
    return `${weekday} ${date} ${time}`;
  }
}
