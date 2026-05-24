import { Component, inject } from '@angular/core';
import { OnboardingMockService } from '../../../onboarding/services/onboarding-mock.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  template: `
    <div class="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 max-w-sm">
      @for (toast of svc.toasts(); track toast.id) {
        <div
          class="flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg animate-slide-in"
          [class]="toastClass(toast.type)"
        >
          <div class="flex-1 min-w-0">
            <p class="text-sm font-bold">{{ toast.title }}</p>
            @if (toast.message) {
              <p class="text-xs mt-0.5 opacity-80">{{ toast.message }}</p>
            }
          </div>
          <button
            (click)="svc.removeToast(toast.id)"
            class="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded opacity-60 hover:opacity-100"
            aria-label="Cerrar"
          >×</button>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  readonly svc = inject(OnboardingMockService);

  toastClass(type: string): string {
    switch (type) {
      case 'success': return 'bg-[var(--status-success-subtle)] border-[var(--status-success)]/20 text-[var(--status-success)]';
      case 'error':   return 'bg-[var(--status-error-subtle)] border-[var(--status-error)]/20 text-[var(--status-error)]';
      case 'warning': return 'bg-[var(--status-warning-subtle)] border-[var(--status-warning)]/20 text-[var(--status-warning)]';
      default:        return 'bg-[var(--status-info-subtle)] border-[var(--status-info)]/20 text-[var(--status-info)]';
    }
  }
}
