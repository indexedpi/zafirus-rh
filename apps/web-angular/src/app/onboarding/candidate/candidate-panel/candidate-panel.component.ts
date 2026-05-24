import { Component, inject } from '@angular/core';
import { OnboardingMockService } from '../../services/onboarding-mock.service';
import { CandidateWizardComponent } from '../candidate-wizard/candidate-wizard.component';

@Component({
  selector: 'app-candidate-panel',
  standalone: true,
  imports: [CandidateWizardComponent],
  template: `
    @if (svc.selectedCase(); as c) {
      @if (c.status === 'candidate_invited') {
        <app-candidate-wizard />
      } @else if (c.candidateData?.submittedAt && c.status !== 'draft') {
        <div class="h-full flex flex-col items-center justify-center text-center px-6 bg-[var(--bg-subtle)]">
          <svg class="w-16 h-16 text-[var(--status-success)] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <h2 class="text-lg font-bold text-[var(--text-primary)] mb-2">Formulario enviado</h2>
          <p class="text-sm text-[var(--text-secondary)] max-w-sm">Gracias. RRHH ya recibió tus datos.</p>
          @if (c.status === 'operative') {
            <div class="mt-6 p-4 bg-[var(--status-success-subtle)] rounded-lg border max-w-sm" style="border-color: rgba(22,163,74,0.15)">
              <p class="text-sm font-bold text-[var(--status-success)]">Proceso de alta completo</p>
              <p class="text-xs text-[var(--text-secondary)] mt-0.5">{{ c.employee.name }} {{ c.employee.lastName }} está activo y operativo.</p>
            </div>
          }
        </div>
      } @else {
        <div class="h-full flex flex-col items-center justify-center text-center px-6 bg-[var(--bg-subtle)]">
          <div class="w-20 h-20 rounded-xl bg-[var(--bg-elevated)] flex items-center justify-center mb-4 border border-[var(--border-default)]">
            <svg class="w-10 h-10 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6l4 2"/></svg>
          </div>
          <h2 class="text-lg font-bold text-[var(--text-primary)] mb-2">Formulario no disponible</h2>
          <p class="text-sm text-[var(--text-secondary)] max-w-sm">
            {{ c.status === 'draft' ? 'El caso está en borrador. Enviá el formulario al candidato desde las acciones de RRHH.' : 'El formulario de ingreso no está activo para este estado del caso.' }}
          </p>
        </div>
      }
    } @else {
      <div class="h-full flex flex-col items-center justify-center text-center px-6 bg-[var(--bg-subtle)]">
        <div class="w-16 h-16 rounded-xl bg-[var(--bg-elevated)] flex items-center justify-center mb-4 border border-[var(--border-default)]">
          <svg class="w-8 h-8 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
        </div>
        <h2 class="text-lg font-bold text-[var(--text-primary)] mb-2">Formulario no disponible</h2>
        <p class="text-sm text-[var(--text-secondary)] max-w-sm">Seleccioná un caso en estado "Invitado" para ver el formulario del candidato.</p>
      </div>
    }
  `,
})
export class CandidatePanelComponent {
  readonly svc = inject(OnboardingMockService);
}
