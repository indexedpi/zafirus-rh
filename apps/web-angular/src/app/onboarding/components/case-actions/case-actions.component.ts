import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OnboardingMockService } from '../../services/onboarding-mock.service';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-case-actions',
  standalone: true,
  imports: [ModalComponent, FormsModule],
  template: `
    @if (svc.selectedCase(); as c) {
      <div class="px-4 lg:px-6 py-4 border-t border-[var(--border-subtle)] bg-[var(--bg-subtle)]">
        <div class="flex items-center justify-between gap-3 flex-wrap">
          <div class="text-xs text-[var(--text-tertiary)] hidden lg:block">
            @switch (c.status) {
              @case ('draft')                      { El caso está en borrador. Enviá el formulario al candidato para continuar. }
              @case ('candidate_invited')          { Formulario enviado. Esperando respuesta del candidato. }
              @case ('candidate_submitted')        { El candidato envió sus datos. Listo para revisión. }
              @case ('hr_review')                  { Revisá los detalles del candidato y aprobá, solicitá corrección o bloqueá el caso. }
              @case ('ready_to_activate')          { Perfil verificado. El caso está listo para activación operativa. }
              @case ('active_pending_automation')  { Tareas automáticas de directorio y accesos en curso... }
              @case ('operative')                  { Onboarding completado. El colaborador está activo. }
              @case ('blocked')                    { Bloqueado: {{ c.blockReason || 'Sin motivo especificado' }} }
              @case ('cancelled')                  { Este caso fue cancelado. }
            }
          </div>

          <div class="flex items-center gap-2 lg:gap-3 flex-wrap">
            @if (c.status === 'draft') {
              <button (click)="svc.sendCandidateForm(c.id)" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] min-h-[44px]">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                Enviar formulario
              </button>
            }

            @if (c.status === 'candidate_submitted') {
              <button (click)="svc.startReview(c.id)" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] min-h-[44px]">
                Iniciar revisión
              </button>
            }

            @if (c.status === 'hr_review') {
              <button (click)="showBlockModal.set(true)" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-[var(--text-secondary)] border border-[var(--border-default)] hover:bg-[var(--bg-subtle)] min-h-[44px]">
                Bloquear caso
              </button>
              <button (click)="showCorrectionModal.set(true)" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-[var(--text-primary)] bg-[var(--bg-elevated)] border border-[var(--border-default)] hover:bg-[var(--bg-subtle)] min-h-[44px]">
                Solicitar corrección
              </button>
              <button (click)="svc.approve(c.id)" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] min-h-[44px]">
                Aprobar caso
              </button>
            }

            @if (c.status === 'ready_to_activate') {
              <button (click)="svc.activate(c.id)" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] min-h-[44px]">
                Activar onboarding
              </button>
            }

            @if (c.status === 'blocked') {
              <button (click)="svc.cancel(c.id)" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[var(--status-error)] hover:opacity-90 min-h-[44px]">
                Cancelar caso
              </button>
              <button (click)="svc.unblock(c.id)" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] min-h-[44px]">
                Desbloquear caso
              </button>
            }

            @if (c.status === 'draft' || c.status === 'candidate_invited' || c.status === 'hr_review') {
              <button (click)="handleCancel(c.id)" class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-[var(--text-tertiary)] hover:text-[var(--status-error)] hover:bg-[var(--status-error-subtle)] min-h-[44px]">
                Cancelar caso
              </button>
            }
          </div>
        </div>
      </div>

      <!-- Correction Modal -->
      <app-modal [isOpen]="showCorrectionModal()" title="Solicitar corrección de onboarding" (onClose)="showCorrectionModal.set(false)">
        <div class="space-y-4">
          <p class="text-sm text-[var(--text-secondary)]">Se enviará una solicitud de corrección al candidato con este comentario:</p>
          <div>
            <label class="block text-[11px] font-medium text-[var(--text-tertiary)] mb-1">Motivo de corrección</label>
            <textarea [(ngModel)]="correctionNote" rows="4" placeholder="Ej.: el número de CUIT tiene un dígito inválido..."
              class="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--border-focus)] resize-none"></textarea>
          </div>
          <div class="flex justify-end gap-3">
            <button (click)="showCorrectionModal.set(false)" class="px-4 py-2 rounded-lg text-sm font-semibold border border-[var(--border-default)] text-[var(--text-secondary)]">Cancelar</button>
            <button (click)="handleCorrection(c.id)" class="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)]">Enviar solicitud</button>
          </div>
        </div>
      </app-modal>

      <!-- Block Modal -->
      <app-modal [isOpen]="showBlockModal()" title="Bloquear caso de onboarding" (onClose)="showBlockModal.set(false)">
        <div class="space-y-4">
          <p class="text-sm text-[var(--text-secondary)]">El caso quedará bloqueado hasta que un operador lo desbloquee manualmente.</p>
          <div>
            <label class="block text-[11px] font-medium text-[var(--text-tertiary)] mb-1">Motivo del bloqueo</label>
            <textarea [(ngModel)]="blockReason" rows="4" placeholder="Ej.: verificación pendiente o documentación ilegible..."
              class="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--border-focus)] resize-none"></textarea>
          </div>
          <div class="flex justify-end gap-3">
            <button (click)="showBlockModal.set(false)" class="px-4 py-2 rounded-lg text-sm font-semibold border border-[var(--border-default)] text-[var(--text-secondary)]">Cancelar</button>
            <button (click)="handleBlock(c.id)" class="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[var(--status-error)] hover:opacity-90">Bloquear caso</button>
          </div>
        </div>
      </app-modal>
    }
  `,
})
export class CaseActionsComponent {
  readonly svc = inject(OnboardingMockService);
  readonly showCorrectionModal = signal(false);
  readonly showBlockModal = signal(false);
  correctionNote = '';
  blockReason = '';

  handleCorrection(caseId: string): void {
    if (!this.correctionNote.trim()) { this.svc.addToast('warning', 'Indicá el motivo de la corrección.'); return; }
    this.svc.requestCorrection(caseId, this.correctionNote);
    this.showCorrectionModal.set(false);
    this.correctionNote = '';
  }

  handleBlock(caseId: string): void {
    if (!this.blockReason.trim()) { this.svc.addToast('warning', 'Indicá el motivo del bloqueo.'); return; }
    this.svc.block(caseId, this.blockReason);
    this.showBlockModal.set(false);
    this.blockReason = '';
  }

  handleCancel(caseId: string): void {
    if (confirm('¿Seguro que querés cancelar este caso? Esta acción no se puede deshacer.')) {
      this.svc.cancel(caseId);
    }
  }
}
