import { Component } from '@angular/core';
import { ZafirusLogoComponent } from '../zafirus-logo/zafirus-logo.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [ZafirusLogoComponent],
  template: `
    <aside class="w-[56px] flex-shrink-0 bg-[var(--shell-bg)] flex flex-col items-center py-4 gap-6 border-r border-[var(--shell-active-border)]">
      <div class="flex items-center justify-center w-9 h-9">
        <app-zafirus-logo [size]="28" />
      </div>
      <nav class="flex flex-col items-center gap-2 flex-1">
        <button
          class="w-9 h-9 rounded-lg bg-[var(--shell-active)] flex items-center justify-center text-white"
          title="Onboarding"
          aria-label="Onboarding"
        >
          <svg class="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </button>
      </nav>
      <div class="flex flex-col items-center gap-2 pb-2">
        <div
          class="w-7 h-7 rounded-full bg-[var(--brand-primary)] flex items-center justify-center text-[10px] font-bold text-white"
          title="RRHH"
        >
          RH
        </div>
      </div>
    </aside>
  `,
})
export class SidebarComponent {}
