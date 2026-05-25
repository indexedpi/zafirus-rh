import { Component, inject, signal } from '@angular/core';
import { OnboardingMockService } from '../../../services/onboarding-mock.service';
import { AuditEvent } from '../../../models/onboarding-case.model';

type AuditFilter = 'all' | 'rrhh' | 'candidato' | 'sistema' | 'tareas';

const ACTION_LABELS: Record<string, string> = {
  case_created: 'Caso creado', candidate_form_sent: 'Formulario enviado al candidato',
  candidate_form_submitted: 'Datos enviados por el candidato', review_started: 'Revisión de RRHH iniciada',
  correction_requested: 'Corrección solicitada', case_approved: 'Caso aprobado',
  case_activated: 'Activación iniciada', case_blocked: 'Caso bloqueado',
  case_unblocked: 'Caso desbloqueado', case_cancelled: 'Caso cancelado',
  case_operative: 'Caso operativo', candidate_data_consolidated: 'Datos consolidados',
  task_started: 'Tarea iniciada', task_completed: 'Tarea completada',
  task_failed: 'Tarea fallida', task_skipped: 'Tarea omitida',
   email_approved: 'Correo aprobado',
};

const SENSITIVE_KEYS = new Set([
  'token', 'candidateToken', 'password', 'temporaryPassword', 'secret',
  'cbu', 'walletAddress', 'taxIdValue',
]);

const FILTERS: { id: AuditFilter; label: string }[] = [
  { id: 'all', label: 'Todos' }, { id: 'rrhh', label: 'RRHH' },
  { id: 'candidato', label: 'Candidato' }, { id: 'sistema', label: 'Sistema' },
  { id: 'tareas', label: 'Tareas' },
];

@Component({
  selector: 'app-audit-tab',
  standalone: true,
  template: `
    @if (svc.selectedCase(); as c) {
      <div class="space-y-4">
        <!-- Summary strip -->
        <div class="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)] p-4 flex items-center justify-between">
          <span class="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Eventos totales</span>
          <span class="text-sm font-bold text-[var(--text-primary)]">{{ c.auditLog.length }}</span>
        </div>

        <!-- Filters -->
        <div class="flex gap-1 overflow-x-auto scrollbar-hide">
          @for (f of filters; track f.id) {
            <button
              (click)="activeFilter.set(f.id)"
              class="px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0"
              [class]="activeFilter() === f.id
                ? 'bg-[var(--brand-primary)] text-white'
                : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-default)] hover:bg-[var(--bg-subtle)]'"
            >{{ f.label }}</button>
          }
        </div>

        <!-- Timeline -->
        @if (filtered(c.auditLog).length === 0) {
          <p class="text-sm text-[var(--text-tertiary)] text-center py-8">Sin eventos para este filtro.</p>
        } @else {
          <div class="space-y-1">
            @for (ev of filtered(c.auditLog); track ev.id) {
              <div class="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)] p-4">
                <div class="flex items-start justify-between gap-3">
                  <div class="flex items-start gap-3 min-w-0">
                    <div class="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                      [style.backgroundColor]="categoryColor(ev)"></div>
                    <div class="min-w-0">
                      <p class="text-sm font-medium text-[var(--text-primary)]">{{ actionLabel(ev.action) }}</p>
                      <div class="flex items-center gap-2 mt-1 flex-wrap">
                        <span class="text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide"
                          [class]="actorClass(ev)">
                          {{ actorLabel(ev) }}
                        </span>
                        <span class="text-[10px] text-[var(--text-tertiary)] font-mono">{{ formatTimestamp(ev.timestamp) }}</span>
                      </div>
                      @if (ev.details) {
                        <div class="mt-2 space-y-0.5">
                          @for (entry of safeDetails(ev.details); track entry.key) {
                            <p class="text-[10px] text-[var(--text-tertiary)]">
                              <span class="font-semibold">{{ entry.label }}:</span> {{ entry.value }}
                            </p>
                          }
                        </div>
                      }
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    }
  `,
})
export class AuditTabComponent {
  readonly svc = inject(OnboardingMockService);
  readonly activeFilter = signal<AuditFilter>('all');
  readonly filters = FILTERS;

  filtered(log: AuditEvent[]): AuditEvent[] {
    const sorted = [...log].sort((a, b) => b.timestamp - a.timestamp);
    const f = this.activeFilter();
    if (f === 'all') return sorted;
    return sorted.filter(ev => {
      if (f === 'rrhh') return ev.actorType === 'user' && ev.actorId !== 'candidate';
      if (f === 'candidato') return ev.actorId === 'candidate';
      if (f === 'sistema') return ev.actorType === 'system' || ev.actorType === 'integration';
      if (f === 'tareas') return ev.action.startsWith('task_');
      return true;
    });
  }

  actionLabel(action: string): string { return ACTION_LABELS[action] || 'Acción registrada'; }

  actorLabel(ev: AuditEvent): string {
    if (ev.actorType === 'system' || ev.actorType === 'integration') return 'Sistema';
    if (ev.actorId === 'candidate') return 'Candidato';
    return 'RRHH';
  }

  actorClass(ev: AuditEvent): string {
    if (ev.actorType === 'system' || ev.actorType === 'integration') return 'bg-[var(--status-success-subtle)] text-[var(--status-success)]';
    if (ev.actorId === 'candidate') return 'bg-[var(--status-info-subtle)] text-[var(--status-info)]';
    return 'bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]';
  }

  categoryColor(ev: AuditEvent): string {
    if (ev.action.startsWith('task_')) return 'var(--status-info)';
    if (ev.action.includes('blocked') || ev.action.includes('cancelled')) return 'var(--status-error)';
    if (ev.action.includes('approved') || ev.action.includes('operative')) return 'var(--status-success)';
    if (ev.action.includes('candidate')) return '#0891B2';
    return 'var(--brand-primary)';
  }

  formatTimestamp(ts: number): string {
    return new Date(ts).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  safeDetails(details: Record<string, unknown>): { key: string; label: string; value: string }[] {
    return Object.entries(details).map(([key, val]) => ({
      key,
      label: key,
      value: SENSITIVE_KEYS.has(key) ? 'Dato sensible oculto' : String(val),
    }));
  }
}
