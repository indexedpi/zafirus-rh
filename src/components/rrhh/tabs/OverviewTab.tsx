import { useStore } from '../../../store';
import { ShieldAlert, XCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '../../../utils/cn';
import type { AuditEvent, CaseStatus } from '../../../types';

// ─── Action labels (Spanish) ────────────────────────────────────────────────
// Source of truth lives in store.ts; we only translate for display.
const ACTION_LABELS: Record<string, string> = {
  case_created: 'Caso creado',
  candidate_form_sent: 'Formulario enviado al candidato',
  candidate_form_submitted: 'Datos enviados por candidato',
  review_started: 'Revisión RRHH iniciada',
  correction_requested: 'Corrección solicitada',
  case_approved: 'Caso aprobado',
  case_activated: 'Activación iniciada',
  case_blocked: 'Caso bloqueado',
  case_unblocked: 'Caso desbloqueado',
  case_cancelled: 'Caso cancelado',
  case_operative: 'Caso operativo',
  task_completed: 'Tarea completada',
  task_failed: 'Tarea fallida',
  task_skipped: 'Tarea omitida',
  email_approved: 'Plantilla de email aprobada',
  candidate_data_consolidated: 'Datos consolidados',
};

function actionLabel(action: string): string {
  return ACTION_LABELS[action] || 'Acción registrada';
}

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `hace ${days}d`;
  return new Date(timestamp).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ─── Journey stages ─────────────────────────────────────────────────────────
// Canonical Phase 7F stage labels. Internal status ids stay in English.
const JOURNEY_STAGES: { id: CaseStatus; label: string }[] = [
  { id: 'draft', label: 'Borrador' },
  { id: 'candidate_invited', label: 'Formulario enviado' },
  { id: 'candidate_submitted', label: 'Datos recibidos' },
  { id: 'hr_review', label: 'Revisión RRHH' },
  { id: 'ready_to_activate', label: 'Listo para activar' },
  { id: 'active_pending_automation', label: 'Automatización' },
  { id: 'operative', label: 'Operativo' },
];

function nextMilestone(status: CaseStatus, hasFailedTasks: boolean): string {
  switch (status) {
    case 'draft': return 'Enviar formulario al candidato';
    case 'candidate_invited': return 'Esperar respuesta del candidato';
    case 'candidate_submitted': return 'Revisar datos enviados';
    case 'hr_review': return 'Consolidar datos y aprobar caso';
    case 'ready_to_activate': return 'Activar onboarding';
    case 'active_pending_automation':
      return hasFailedTasks ? 'Resolver tareas con atención' : 'Automatización en curso';
    case 'operative': return 'Caso operativo';
    case 'blocked': return 'Resolver bloqueo para retomar el alta';
    case 'cancelled': return 'Caso cancelado';
    default: return 'Sin acciones pendientes';
  }
}

// Resolve which stage the case currently maps to, including blocked/cancelled
// cases (which fall outside the linear journey).
function resolveCurrentIndex(status: CaseStatus, auditLog: AuditEvent[]): number {
  const directIndex = JOURNEY_STAGES.findIndex(s => s.id === status);
  if (directIndex !== -1) return directIndex;

  if (status === 'blocked' || status === 'cancelled') {
    const reached = auditLog.reduce((max, e) => {
      const idByAction: Record<string, CaseStatus | undefined> = {
        case_created: 'draft',
        candidate_form_sent: 'candidate_invited',
        candidate_form_submitted: 'candidate_submitted',
        review_started: 'hr_review',
        case_approved: 'ready_to_activate',
        case_activated: 'active_pending_automation',
        case_operative: 'operative',
      };
      const stageId = idByAction[e.action];
      if (!stageId) return max;
      const idx = JOURNEY_STAGES.findIndex(s => s.id === stageId);
      return idx > max ? idx : max;
    }, 0);
    return reached;
  }

  return 0;
}

function actorBadgeLabel(event: AuditEvent): string {
  if (event.actorType === 'system' || event.actorType === 'integration') return 'Sistema';
  if (event.actorId === 'candidate') return 'Candidato';
  return 'RRHH';
}

function actorBadgeClass(event: AuditEvent): string {
  if (event.actorType === 'system' || event.actorType === 'integration') {
    return 'bg-[var(--status-success-subtle)] text-[var(--status-success)]';
  }
  if (event.actorId === 'candidate') {
    return 'bg-[var(--status-info-subtle)] text-[var(--status-info)]';
  }
  return 'bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]';
}

interface OverviewTabProps {
  onOpenAudit?: () => void;
}

export function OverviewTab({ onOpenAudit }: OverviewTabProps = {}) {
  const selectedCase = useStore(state => state.getSelectedCase());
  if (!selectedCase) return null;

  const { auditLog, status, blockReason, tasks, correctionNote } = selectedCase;
  const hasFailedTasks = tasks.some(t => t.status === 'failed');
  const currentIndex = resolveCurrentIndex(status, auditLog);
  const sortedEvents = [...auditLog].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);

  const isBlocked = status === 'blocked';
  const isCancelled = status === 'cancelled';
  const isOperative = status === 'operative';

  return (
    <div className="space-y-6">
      {/* Top status banner — only when the case is outside the calm happy path */}
      {(isBlocked || isCancelled || correctionNote) && (
        <div className={cn(
          'rounded-xl border p-4 flex items-start gap-3',
          isBlocked
            ? 'bg-[var(--status-error-subtle)] border-[var(--status-error)]/20'
            : isCancelled
              ? 'bg-[var(--bg-elevated)] border-[var(--border-default)]'
              : 'bg-[var(--status-warning-subtle)] border-[var(--status-warning)]/20'
        )}>
          {isBlocked ? (
            <ShieldAlert className="w-5 h-5 text-[var(--status-error)] flex-shrink-0 mt-0.5" aria-hidden="true" />
          ) : isCancelled ? (
            <XCircle className="w-5 h-5 text-[var(--text-tertiary)] flex-shrink-0 mt-0.5" aria-hidden="true" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-[var(--status-warning)] flex-shrink-0 mt-0.5" aria-hidden="true" />
          )}
          <div className="min-w-0">
            <p className={cn(
              'text-sm font-bold',
              isBlocked ? 'text-[var(--status-error)]' : isCancelled ? 'text-[var(--text-primary)]' : 'text-[var(--status-warning)]'
            )}>
              {isBlocked ? 'Caso bloqueado' : isCancelled ? 'Caso cancelado' : 'Corrección solicitada al candidato'}
            </p>
            {isBlocked && blockReason && (
              <p className="text-xs text-[var(--text-secondary)] mt-1 break-words">{blockReason}</p>
            )}
            {correctionNote && !isBlocked && !isCancelled && (
              <p className="text-xs text-[var(--text-secondary)] mt-1 break-words">{correctionNote}</p>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Journey */}
        <section
          aria-label="Trayecto del caso"
          className="flex-1 min-w-0 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)] p-6"
        >
          <div className="flex items-baseline justify-between mb-6 gap-3 flex-wrap">
            <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
              Trayecto del caso
            </h3>
            <span className="text-[11px] font-medium text-[var(--text-tertiary)]">
              Paso {Math.min(currentIndex + 1, JOURNEY_STAGES.length)} de {JOURNEY_STAGES.length}
            </span>
          </div>

          <ol className="relative">
            {JOURNEY_STAGES.map((stage, index) => {
              const isPast = index < currentIndex || isOperative && index <= currentIndex;
              const isCurrent = index === currentIndex && !isOperative;
              const isLast = index === JOURNEY_STAGES.length - 1;

              let state: 'completed' | 'current' | 'pending' | 'blocked' | 'cancelled' = 'pending';
              if (isPast) state = 'completed';
              if (isCurrent) state = 'current';
              if (isCurrent && isBlocked) state = 'blocked';
              if (isCurrent && isCancelled) state = 'cancelled';
              if (isOperative && isLast) state = 'completed';

              return (
                <li key={stage.id} className="relative flex items-start pb-6 last:pb-0">
                  {!isLast && (
                    <span
                      aria-hidden="true"
                      className={cn(
                        'absolute left-3 top-6 bottom-0 w-px -ml-px',
                        state === 'completed' ? 'bg-[var(--brand-primary)]' : 'bg-[var(--border-subtle)]'
                      )}
                    />
                  )}
                  <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-[var(--bg-elevated)] z-10 flex-shrink-0 mr-3">
                    {state === 'completed' && (
                      <CheckCircle2 className="w-5 h-5 text-[var(--brand-primary)]" aria-label="Etapa completada" />
                    )}
                    {state === 'current' && (
                      <span className="w-3 h-3 rounded-full bg-[var(--brand-primary)] ring-4 ring-[var(--brand-primary-subtle)]" aria-label="Etapa actual" />
                    )}
                    {state === 'pending' && (
                      <span className="w-2.5 h-2.5 rounded-full border-2 border-[var(--border-default)]" aria-label="Etapa pendiente" />
                    )}
                    {state === 'blocked' && (
                      <ShieldAlert className="w-5 h-5 text-[var(--status-error)]" aria-label="Etapa bloqueada" />
                    )}
                    {state === 'cancelled' && (
                      <XCircle className="w-5 h-5 text-[var(--text-tertiary)]" aria-label="Etapa cancelada" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className={cn(
                      'text-sm',
                      state === 'current' ? 'text-[var(--brand-primary)] font-bold' :
                      state === 'completed' ? 'text-[var(--text-primary)] font-medium' :
                      state === 'blocked' ? 'text-[var(--status-error)] font-bold' :
                      state === 'cancelled' ? 'text-[var(--text-tertiary)] line-through font-medium' :
                      'text-[var(--text-secondary)] font-medium'
                    )}>
                      {stage.label}
                    </p>
                    {state === 'current' && (
                      <p className="text-[11px] uppercase tracking-wider font-semibold text-[var(--brand-primary)] mt-1">
                        Etapa actual
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        {/* Right column: next milestone + recent activity */}
        <aside className="w-full lg:w-80 flex-shrink-0 space-y-6 min-w-0">
          <div className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)] p-6">
            <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">
              Siguiente hito
            </h3>
            <p className="text-sm font-semibold text-[var(--text-primary)] leading-snug break-words">
              {nextMilestone(status, hasFailedTasks)}
            </p>
            {isOperative && (
              <p className="text-xs text-[var(--status-success)] mt-2 font-medium">
                El alta operativa fue completada.
              </p>
            )}
          </div>

          <div className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)] p-6">
            <div className="flex items-baseline justify-between mb-4 gap-3 flex-wrap">
              <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                Actividad reciente
              </h3>
              {onOpenAudit ? (
                <button
                  type="button"
                  onClick={onOpenAudit}
                  className="text-[10px] font-semibold text-[var(--brand-primary)] inline-flex items-center gap-1 uppercase tracking-wider hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] rounded"
                >
                  Ver auditoría completa <ArrowRight className="w-3 h-3" aria-hidden="true" />
                </button>
              ) : (
                <span className="text-[10px] text-[var(--text-tertiary)] inline-flex items-center gap-1 uppercase tracking-wider">
                  Disponible en la pestaña Auditoría
                </span>
              )}
            </div>

            {sortedEvents.length === 0 ? (
              <p className="text-sm text-[var(--text-tertiary)]">Sin actividad registrada</p>
            ) : (
              <ul className="relative pl-5">
                {sortedEvents.map((event, i, arr) => (
                  <li key={event.id} className="relative pb-4 last:pb-0">
                    {i < arr.length - 1 && (
                      <span
                        aria-hidden="true"
                        className="absolute bg-[var(--border-subtle)]"
                        style={{ left: '-13px', top: '13px', bottom: '-4px', width: '1px' }}
                      />
                    )}
                    <span
                      aria-hidden="true"
                      className="absolute z-10 rounded-full border-2 border-[var(--border-default)] bg-[var(--bg-base)]"
                      style={{ left: '-17px', top: '4px', width: '8px', height: '8px' }}
                    />
                    <p className="text-sm font-medium text-[var(--text-primary)] break-words">
                      {actionLabel(event.action)}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={cn(
                        'text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide',
                        actorBadgeClass(event)
                      )}>
                        {actorBadgeLabel(event)}
                      </span>
                      <span className="text-xs text-[var(--text-tertiary)]">
                        {formatRelativeTime(event.timestamp)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
