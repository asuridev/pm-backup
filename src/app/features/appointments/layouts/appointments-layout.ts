import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AppHeader } from '../components/app-header/app-header';
import { AppFooter } from '../components/app-footer/app-footer';

/**
 * Shell del feature: header + tabs (Asignación de citas / Autorizaciones) +
 * contenido de la página activa + footer. Las tabs usan routerLinkActive para
 * el estado visual; los guards (si aplican) van en la ruta, no aquí (§4).
 */
@Component({
  selector: 'app-appointments-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AppHeader, AppFooter],
  template: `
    <div class="flex min-h-screen flex-col bg-white">
      <app-header />

      <nav class="flex w-full">
        <a
          routerLink="asignacion-de-citas"
          routerLinkActive
          #citas="routerLinkActive"
          class="flex h-14 flex-1 items-center justify-center gap-1.5 px-2 text-center text-base md:h-[66px] md:gap-2.5 md:text-lg"
          [class.bg-white]="citas.isActive"
          [class.border-t-8]="citas.isActive"
          [class.border-brand-teal]="citas.isActive"
          [class.text-brand-teal]="citas.isActive"
          [class.bg-light]="!citas.isActive"
          [class.border]="!citas.isActive"
          [class.border-medium-40]="!citas.isActive"
          [class.text-ink-80]="!citas.isActive"
        >
          <img src="images/tab-citas.svg" alt="" class="h-6 w-6 shrink-0 md:h-[34px] md:w-[34px]" />
          <span>Asignación de citas</span>
        </a>

        <a
          routerLink="autorizaciones"
          routerLinkActive
          #autor="routerLinkActive"
          class="flex h-14 flex-1 items-center justify-center gap-1.5 px-2 text-center text-base md:h-[66px] md:gap-2.5 md:text-lg"
          [class.bg-white]="autor.isActive"
          [class.border-t-8]="autor.isActive"
          [class.border-brand-teal]="autor.isActive"
          [class.text-brand-teal]="autor.isActive"
          [class.bg-light]="!autor.isActive"
          [class.border]="!autor.isActive"
          [class.border-medium-40]="!autor.isActive"
          [class.text-ink-80]="!autor.isActive"
        >
          <img src="images/tab-autorizaciones.svg" alt="" class="h-[17px] w-6 shrink-0 md:h-[24px] md:w-[34px]" />
          <span>Autorizaciones</span>
        </a>
      </nav>

      <main class="flex-1 px-4 pb-10 md:px-12 md:pb-16 lg:px-24">
        <router-outlet />
      </main>

      <app-footer />
    </div>
  `,
})
export class AppointmentsLayout {}
