import { Component, inject, signal, computed } from '@angular/core';
import { OnboardingMockService } from '../../services/onboarding-mock.service';
import { NewCaseModalComponent } from '../new-case-modal/new-case-modal.component';
import { OnboardingCase, CaseStatus, TEAMS, STATUS_CONFIG } from '../../models/onboarding-case.model';

@Component({
  selector: 'app-case-list',
  standalone: true,
  imports: [NewCaseModalComponent],
  template: `
    <div class="flex flex-col h-full bg-[var(--bg-subtle)]">
      <div class="flex items-center justify-between px-3 py-3 border-b border-[var(--border-subtle)] flex-shrink-0 bg-[var(--bg-surface)]">
        <div class="flex items-center gap-1">
          <svg class="w-4 h-4 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          <span class="text-sm font-semibold text-[var(--text-primary)]">Casos</span>
          <span class="text-xs font-medium text-[var(--text-tertiary)]">({{ svc.cases().length }})</span>
        </div>
        <div class="flex items-center gap-1">
          @if (svc.selectedCase() && svc.sidebarOpen()) {
            <button
              type="button"
              (click)="svc.setSidebarOpen(false)"
              class="hidden md:inline-flex items-center justify-center w-8 h-8 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]"
              aria-label="Contraer lista de casos"
              title="Contraer lista"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          }
          <button
            (click)="modalOpen.set(true)"
            class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)]"
            aria-label="Crear nuevo caso de onboarding"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
            Nuevo
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto scrollbar-hide">
        @if (sortedCases().length === 0) {
          <div class="flex flex-col items-center justify-center h-full text-center px-6 py-12">
            <div class="w-16 h-16 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center mb-4 border border-[var(--border-subtle)]">
              <svg class="w-8 h-8 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <p class="text-sm font-semibold text-[var(--text-secondary)] mb-1">No hay casos todavía</p>
            <p class="text-xs text-[var(--text-tertiary)] mb-4">Creá tu primer caso para comenzar el alta.</p>
            <button
              (click)="modalOpen.set(true)"
              class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)]"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
              </svg>
              Crear primer caso
            </button>
          </div>
        } @else {
          <div class="py-1 space-y-1 px-1.5">
            @for (c of sortedCases(); track c.id) {
              <button
                (click)="svc.selectCase(c.id)"
                class="w-full flex flex-col text-left p-3.5 rounded-lg cursor-pointer outline-none border min-h-[88px] hover:bg-[var(--bg-subtle)] hover:border-[var(--border-default)]"
                [class.border-transparent]="c.id !== svc.selectedCaseId()"
                [style.backgroundColor]="c.id === svc.selectedCaseId() ? 'var(--section-identity-subtle)' : ''"
                [style.borderColor]="c.id === svc.selectedCaseId() ? 'color-mix(in oklab, var(--section-identity) 20%, var(--border-default))' : ''"
              >
                <div class="flex items-center justify-between w-full gap-2">
                  <div class="flex items-center gap-2 min-w-0">
                    <div class="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                         [style.backgroundColor]="'var(--section-identity)'">
                      {{ initials(c.employee.name, c.employee.lastName) }}
                    </div>
                    <span class="text-sm font-bold text-[var(--text-primary)] truncate leading-tight">
                      {{ c.employee.name }} {{ c.employee.lastName }}
                    </span>
                    @if (c.id === svc.selectedCaseId()) {
                      <span class="w-1.5 h-1.5 rounded-full bg-[var(--section-identity)] animate-pulse flex-shrink-0"></span>
                    }
                  </div>
                  <span
                    class="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded border flex items-center gap-1 flex-shrink-0"
                    [style.backgroundColor]="statusConfig(c.status).bgColor"
                    [style.color]="statusConfig(c.status).color"
                    [style.borderColor]="statusConfig(c.status).color + '33'"
                  >
                    {{ statusConfig(c.status).label }}
                  </span>
                </div>
                <div class="flex items-center justify-between text-xs text-[var(--text-tertiary)] mt-2.5">
                  <span class="truncate font-medium max-w-[140px]">
                    {{ c.employee.role }} · {{ teamLabel(c.employee.team) }}
                  </span>
                </div>
                <div class="flex items-center justify-between gap-2 border-t border-[var(--border-subtle)]/60 pt-2 mt-2">
                  <span class="text-[10px] font-semibold text-[var(--text-secondary)] truncate flex items-center gap-1 leading-none">
                    <svg class="w-2.5 h-2.5 text-[var(--section-identity)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                    </svg>
                    <span class="truncate max-w-[150px]">{{ nextAction(c) }}</span>
                  </span>
                  <span class="font-mono text-[9px] text-[var(--text-tertiary)] leading-none flex-shrink-0">
                    {{ formatDate(c.updatedAt) }}
                  </span>
                </div>
              </button>
            }
          </div>
        }
      </div>
    </div>

    <app-new-case-modal [isOpen]="modalOpen()" (closed)="modalOpen.set(false)" />
  `,
})
export class CaseListComponent {
  readonly svc = inject(OnboardingMockService);
  readonly modalOpen = signal(false);

  readonly sortedCases = computed(() => {
    return [...this.svc.cases()].sort((a, b) => {
      const pa = this.priority(a.status);
      const pb = this.priority(b.status);
      if (pa !== pb) return pa - pb;
      return b.updatedAt - a.updatedAt;
    });
  });

  initials(name: string, lastName: string): string {
    return (name.charAt(0) + lastName.charAt(0)).toUpperCase();
  }

  statusConfig(status: CaseStatus) { return STATUS_CONFIG[status]; }

  teamLabel(team: string): string {
    return TEAMS.find(t => t.value === team)?.label || team;
  }

  nextAction(c: OnboardingCase): string {
    if (!this.svc.isDemo()) {
      switch (c.status) {
        case 'draft': return 'Pendiente';
        case 'candidate_invited': return 'En espera';
        case 'candidate_submitted': return 'Listo para revisar';
        case 'hr_review': return c.candidateData?.consolidated ? 'Aprobar caso' : 'Consolidar datos';
        case 'ready_to_activate': return 'Listo para activar';
        case 'active_pending_automation': return 'Automatización en curso';
        case 'operative': return 'Operativo';
        case 'blocked': return `Bloqueado: ${c.blockReason || 'Sin motivo'}`;
        case 'cancelled': return 'Cancelado';
        default: return 'Sin acciones';
      }
    }

    switch (c.status) {
      case 'draft': return 'Enviar formulario';
      case 'candidate_invited': return 'Esperando candidato';
      case 'candidate_submitted': return 'Revisar datos';
      case 'hr_review': return c.candidateData?.consolidated ? 'Aprobar caso' : 'Consolidar datos';
      case 'ready_to_activate': return 'Listo para activar';
      case 'active_pending_automation': return 'Automatización en curso';
      case 'operative': return 'Operativo';
      case 'blocked': return `Bloqueado: ${c.blockReason || 'Sin motivo'}`;
      case 'cancelled': return 'Cancelado';
      default: return 'Sin acciones';
    }
  }

  formatDate(ts: number): string {
    return new Date(ts).toLocaleDateString('es-AR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
  }

  private priority(status: CaseStatus): number {
    const m: Record<string, number> = {
      blocked: 1, candidate_submitted: 2, hr_review: 3, ready_to_activate: 4,
      active_pending_automation: 5, candidate_invited: 6, draft: 7, operative: 8, cancelled: 9,
    };
    return m[status] ?? 10;
  }
}
