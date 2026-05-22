import { useStore } from '../../../store';
import { User, Briefcase, MapPin, Calendar, Mail, Check, Circle, AlertTriangle, ShieldAlert, XCircle } from 'lucide-react';
import { COUNTRIES, TEAMS, CONTRACT_TYPES } from '../../../types';
import { cn } from '../../../utils/cn';

const ACTION_LABELS: Record<string, string> = {
  case_created: 'Caso creado',
  candidate_form_sent: 'Formulario enviado al candidato',
  candidate_form_submitted: 'Candidato completó formulario',
  review_started: 'Revisión RRHH iniciada',
  correction_requested: 'Corrección solicitada',
  case_approved: 'Caso aprobado',
  case_activated: 'Caso activado',
  case_blocked: 'Caso bloqueado',
  case_unblocked: 'Caso desbloqueado',
  case_cancelled: 'Caso cancelado',
  case_operative: 'Onboarding completado',
  task_completed: 'Tarea completada',
  task_failed: 'Tarea fallida',
  task_skipped: 'Tarea omitida',
  email_approved: 'Email aprobado',
  candidate_data_consolidated: 'Datos del candidato consolidados',
};

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  return new Date(timestamp).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
}

export function OverviewTab() {
  const selectedCase = useStore(state => state.getSelectedCase());
  if (!selectedCase) return null;

  const { employee, auditLog, status, blockReason } = selectedCase;
  const sortedEvents = [...auditLog].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);

  const getNextCaseActionText = () => {
    switch (status) {
      case 'draft': return 'Enviar formulario de invitación al candidato.';
      case 'candidate_invited': return 'Esperando respuesta del candidato.';
      case 'candidate_submitted': return 'Iniciar revisión del caso.';
      case 'hr_review': return 'Verificar detalles y aprobar el caso.';
      case 'ready_to_activate': return 'Confirmar activación y configurar Workspace.';
      case 'active_pending_automation': return 'Automatización en curso en Google Workspace.';
      case 'operative': return 'Onboarding completado. Colaborador activo.';
      case 'blocked': return `Resolver bloqueo: ${blockReason}`;
      case 'cancelled': return 'Caso cancelado y archivado.';
      default: return 'Sin acciones pendientes.';
    }
  };

  const getTimelineSteps = () => {
    const steps = [
      { id: 'draft', label: 'Borrador' },
      { id: 'candidate_invited', label: 'Candidato invitado' },
      { id: 'candidate_submitted', label: 'Datos enviados' },
      { id: 'hr_review', label: 'Revisión RRHH' },
      { id: 'ready_to_activate', label: 'Listo para activar' },
      { id: 'active_pending_automation', label: 'Automatización' },
      { id: 'operative', label: 'Operativo' },
    ];

    let currentIndex = steps.findIndex(s => s.id === status);
    if (currentIndex === -1) {
      if (status === 'blocked' || status === 'cancelled') {
        const historyIds = auditLog.map(e => {
          if (e.action === 'case_created') return 'draft';
          if (e.action === 'candidate_form_sent') return 'candidate_invited';
          if (e.action === 'candidate_form_submitted') return 'candidate_submitted';
          if (e.action === 'review_started') return 'hr_review';
          if (e.action === 'case_approved') return 'ready_to_activate';
          if (e.action === 'case_activated') return 'active_pending_automation';
          if (e.action === 'case_operative') return 'operative';
          return null;
        }).filter(Boolean);
        const maxReached = historyIds.reduce((maxIdx, id) => Math.max(maxIdx, steps.findIndex(s => s.id === id)), 0);
        currentIndex = maxReached;
      } else {
        currentIndex = 0;
      }
    }

    return steps.map((step, index) => {
      const isPast = index < currentIndex;
      const isCurrent = index === currentIndex;
      let state = isPast ? 'completed' : isCurrent ? 'current' : 'pending';
      if (isCurrent && status === 'blocked') state = 'blocked';
      if (isCurrent && status === 'cancelled') state = 'cancelled';
      return { ...step, state };
    });
  };

  const steps = getTimelineSteps();

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Timeline */}
        <div className="flex-1 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)] p-6">
          <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-6">
            Trayecto del caso
          </h3>
          <div className="relative">
            {steps.map((step, index) => {
              const isLast = index === steps.length - 1;
              return (
                <div key={step.id} className="relative flex items-start pb-6 last:pb-0">
                  {!isLast && (
                    <span
                      className={cn(
                        "absolute left-3 top-6 bottom-0 w-0.5 -ml-px",
                        step.state === 'completed' ? "bg-[var(--brand-primary)]" : "bg-[var(--border-subtle)]"
                      )}
                      aria-hidden="true"
                    />
                  )}
                  <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-[var(--bg-elevated)] z-10 flex-shrink-0 mr-3">
                    {step.state === 'completed' && <div className="w-2.5 h-2.5 rounded-full bg-[var(--brand-primary)]" />}
                    {step.state === 'current' && <div className="w-2.5 h-2.5 rounded-full bg-[var(--brand-primary)] animate-pulse" />}
                    {step.state === 'pending' && <div className="w-2 h-2 rounded-full border-2 border-[var(--border-subtle)]" />}
                    {step.state === 'blocked' && <ShieldAlert className="w-4 h-4 text-[var(--status-error)]" />}
                    {step.state === 'cancelled' && <XCircle className="w-4 h-4 text-[var(--text-tertiary)]" />}
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className={cn(
                      "text-sm font-medium",
                      step.state === 'completed' ? "text-[var(--text-primary)]" :
                      step.state === 'current' ? "text-[var(--brand-primary)] font-bold" :
                      step.state === 'blocked' ? "text-[var(--status-error)] font-bold" :
                      step.state === 'cancelled' ? "text-[var(--text-tertiary)] line-through" :
                      "text-[var(--text-secondary)]"
                    )}>
                      {step.label}
                    </p>
                    {step.state === 'current' && status === 'blocked' && (
                      <p className="text-xs text-[var(--status-error)] mt-1">{blockReason}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Action & Audit */}
        <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
          <div className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)] p-6">
            <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
              Próximo paso
            </h3>
            <p className="text-sm font-medium text-[var(--text-primary)] leading-snug">
              {getNextCaseActionText()}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-4">
              Actividad reciente
            </h3>
            <div className="relative pl-6">
              {sortedEvents.map((event, i, arr) => (
                <div key={event.id} className="relative pb-5 last:pb-0">
                  {i < arr.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="absolute bg-[var(--border-subtle)]"
                      style={{ left: '-19.5px', top: '13px', bottom: '-4px', width: '1px' }}
                    />
                  )}
                  <div
                    className="absolute z-10 rounded-full border-2 border-[var(--border-default)] bg-[var(--bg-base)]"
                    style={{ left: '-24px', top: '3px', width: '10px', height: '10px' }}
                  />
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        {ACTION_LABELS[event.action] || event.action}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={cn(
                          'text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide',
                          event.actorType === 'user' && 'bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]',
                          event.actorType === 'system' && 'bg-[var(--status-success-subtle)] text-[var(--status-success)]',
                          event.actorType === 'integration' && 'bg-[var(--status-info-subtle)] text-[var(--status-info)]',
                        )}>
                          {event.actorType === 'user' ? 'RRHH' : event.actorType === 'system' ? 'Sistema' : 'Integración'}
                        </span>
                        <span className="text-xs text-[var(--text-tertiary)]">
                          {formatRelativeTime(event.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {sortedEvents.length === 0 && (
                <p className="text-sm text-[var(--text-tertiary)]">Sin actividad registrada</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
