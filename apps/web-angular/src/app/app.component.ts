import { Component } from '@angular/core';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { TopBarComponent } from './shared/components/top-bar/top-bar.component';
import { ToastContainerComponent } from './shared/components/toast/toast.component';
import { OnboardingPageComponent } from './onboarding/pages/onboarding-page/onboarding-page.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SidebarComponent, TopBarComponent, ToastContainerComponent, OnboardingPageComponent],
  template: `
    <div class="h-screen flex overflow-hidden bg-[var(--bg-base)]">
      <app-sidebar />
      <div class="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden">
        <app-top-bar />
        <app-onboarding-page />
      </div>
    </div>
    <app-toast-container />
  `,
})
export class AppComponent {}
