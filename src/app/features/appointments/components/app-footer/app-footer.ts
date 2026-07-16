import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="w-full">
      <div class="h-0.5 bg-brand-green"></div>
      <div class="bg-light">
        <div
          class="mx-auto flex min-h-[47px] max-w-[1440px] items-center gap-4 px-4 py-2 md:px-12 md:py-0 lg:pl-[95px] lg:pr-[95px]"
        >
          <img src="assets/images/logo.png" alt="BNP Paribas Cardif" class="h-[26px] w-auto shrink-0" />
          <span class="ml-6 hidden text-base text-black md:inline lg:ml-[110px]">
            Seguros para un mundo en evolución
          </span>
          <span class="ml-auto text-xs font-bold tracking-tight text-black">
            © BNP PARIBAS - 2020
          </span>
        </div>
      </div>
    </footer>
  `,
})
export class AppFooter {}
