import { Component, inject } from '@angular/core';
import { OnboardingMockService } from '../../services/onboarding-mock.service';
import { CandidateWizardComponent } from '../candidate-wizard/candidate-wizard.component';

@Component({
  selector: 'app-candidate-panel',
  standalone: true,
  imports: [CandidateWizardComponent],
  template: `
    @if (svc.isDemo()) {
      <div class="flex h-full min-h-0 flex-col bg-[var(--bg-subtle)]">
      <div class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        @if (svc.selectedCase(); as c) {
          @if (c.status === 'candidate_invited') {
            <app-candidate-wizard />
          } @else if (c.candidateData?.submittedAt && c.status !== 'draft') {
            <div class="flex h-full flex-col items-center justify-center px-6 text-center">
              <svg class="mb-4 h-16 w-16 text-[var(--status-success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <h2 class="mb-2 text-lg font-bold text-[var(--text-primary)]">Formulario enviado</h2>
              <p class="max-w-sm text-sm text-[var(--text-secondary)]">Gracias. RRHH ya recibió tus datos.</p>
              @if (c.status === 'operative') {
                <div class="mt-6 max-w-sm rounded-lg border bg-[var(--status-success-subtle)] p-4" style="border-color: rgba(22,163,74,0.15)">
                  <p class="text-sm font-bold text-[var(--status-success)]">Alta completada</p>
                  <p class="mt-0.5 text-xs text-[var(--text-secondary)]">{{ c.employee.name }} {{ c.employee.lastName }} ya está activa/o y operativa/o.</p>
                </div>
              }
            </div>
          } @else {
            <div class="flex h-full flex-col items-center justify-center px-6 text-center">
              <div class="mb-4 flex h-20 w-20 items-center justify-center rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)]">
                <svg class="h-10 w-10 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6l4 2"/></svg>
              </div>
              <h2 class="mb-2 text-lg font-bold text-[var(--text-primary)]">Formulario no disponible</h2>
              <p class="max-w-sm text-sm text-[var(--text-secondary)]">
                {{ c.status === 'draft' ? 'El caso está en borrador. Enviá el formulario al candidato desde las acciones de RRHH.' : 'El formulario de ingreso no está activo para este estado del caso.' }}
              </p>
            </div>
          }
        } @else {
          <div class="flex h-full flex-col items-center justify-center px-6 text-center">
            <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)]">
              <svg class="h-8 w-8 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <h2 class="mb-2 text-lg font-bold text-[var(--text-primary)]">Formulario no disponible</h2>
            <p class="max-w-sm text-sm text-[var(--text-secondary)]">Seleccioná un caso en estado "Invitado" para ver el formulario del candidato.</p>
          </div>
        }
      </div>
      </div>
    }
  `,
})
export class CandidatePanelComponent {
  readonly svc = inject(OnboardingMockService);
}
