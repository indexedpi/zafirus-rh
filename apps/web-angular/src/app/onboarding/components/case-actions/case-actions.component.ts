import { Component, inject } from '@angular/core';
import { OnboardingMockService } from '../../services/onboarding-mock.service';

@Component({
  selector: 'app-case-actions',
  standalone: true,
  styles: [`
    :host {
      display: block;
      width: 100%;
      min-width: 0;
    }
  `],
  template: `
    <div class="w-full px-4 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-subtle)] flex items-center justify-between gap-3 lg:px-6">
      <span class="text-xs text-[var(--text-tertiary)] truncate">
        @if (svc.selectedCase(); as c) {
          {{ statusText(c) }}
        } @else {
          Sin caso seleccionado
        }
      </span>

      <div class="flex items-center gap-2 shrink-0 whitespace-nowrap">
        @if (svc.selectedCase(); as c) {
          @if (svc.isDemo()) {
            <button
              type="button"
              (click)="svc.toggleAutoRun()"
              class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold min-h-[44px] border transition-colors"
              [class]="svc.autoRun()
                ? 'bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)] border-[var(--brand-primary-subtle)] hover:opacity-90'
                : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border-default)] hover:bg-[var(--bg-subtle)]'"
              [attr.aria-pressed]="svc.autoRun()"
              [attr.aria-label]="svc.autoRun() ? 'Desactivar auto-run' : 'Activar auto-run'"
              [attr.title]="svc.autoRun() ? 'Auto-run activo' : 'Auto-run inactivo'"
            >
              Auto-run {{ svc.autoRun() ? 'ON' : 'OFF' }}
            </button>

            <button
              type="button"
              (click)="svc.resetToSeed()"
              class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold min-h-[44px] border border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] transition-colors"
              aria-label="Reiniciar demo"
              title="Reiniciar demo"
            >
              Reiniciar demo
            </button>

            <button
              type="button"
              (click)="openCandidatePanel()"
              class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold min-h-[44px] border border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] transition-colors"
              aria-label="Ver candidato"
              title="Ver candidato"
            >
              Ver candidato
            </button>
          }

          @switch (c.status) {
            @case ('draft') {
              <button (click)="svc.sendCandidateForm(c.id)" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] min-h-[44px]">
                Enviar correo
              </button>
            }
            @case ('hr_review') {
              <button (click)="svc.approve(c.id)" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] min-h-[44px]">
                Aprobar
              </button>
            }
            @case ('ready_to_activate') {
              <button (click)="svc.activate(c.id)" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] min-h-[44px]">
                Activar
              </button>
            }
          }

          <button (click)="svc.cancel(c.id)" class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold min-h-[44px] text-[var(--text-tertiary)] hover:text-[var(--status-error)] hover:bg-[var(--status-error-subtle)] transition-colors">
            Cancelar caso
          </button>
        } @else {
          <span class="text-xs text-[var(--text-tertiary)]"></span>
        }
      </div>
    </div>

  `,
})
export class CaseActionsComponent {
  readonly svc = inject(OnboardingMockService);

  openCandidatePanel(): void {
    this.svc.setCandidateViewOpen(true);
  }

  statusText(caseItem: { status: string; blockReason?: string | null }): string {
    switch (caseItem.status) {
      case 'draft': return 'El caso está en borrador. Enviá el formulario al candidato para continuar.';
      case 'candidate_invited': return 'Formulario enviado. Esperando respuesta del candidato.';
      case 'candidate_submitted': return 'El candidato envió sus datos. Listo para revisión.';
      case 'hr_review': return 'Revisá los detalles del candidato y aprobá el caso.';
      case 'ready_to_activate': return 'Perfil verificado. El caso está listo para activación operativa.';
      case 'active_pending_automation': return 'Tareas automáticas de directorio y accesos en curso...';
      case 'operative': return 'Alta completada. El colaborador está activo.';
      case 'blocked': return `Bloqueado: ${caseItem.blockReason || 'Sin motivo especificado'}`;
      case 'cancelled': return 'Este caso fue cancelado.';
      default: return 'Estado del caso actualizado.';
    }
  }
}
