import { useStore } from '../../../store';
import { User, Cpu, Zap } from 'lucide-react';
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

const ACTOR_ICONS = {
  user: User,
  system: Cpu,
  integration: Zap,
};

const ACTOR_LABELS = {
  user: 'Usuario',
  system: 'Sistema',
  integration: 'Integración',
};

function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function AuditTab() {
  const selectedCase = useStore(state => state.getSelectedCase());

  if (!selectedCase) return null;

  const events = [...selectedCase.auditLog].sort((a, b) => b.timestamp - a.timestamp);

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-12">
        <div className="w-12 h-12 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center mb-3">
          <Cpu className="w-6 h-6 text-[var(--text-tertiary)]" />
        </div>
        <p className="text-[var(--text-secondary)]">Sin eventos registrados</p>
      </div>
    );
  }

  return (
    <div className="relative pl-6 border-l border-[var(--border-default)]">
      {events.map((event, index) => {
        const ActorIcon = ACTOR_ICONS[event.actorType] || User;
        const label = ACTION_LABELS[event.action] || event.action;
        const actorLabel = ACTOR_LABELS[event.actorType] || event.actorType;

        return (
          <div
            key={event.id}
            className={cn(
              'relative pb-6',
              index === events.length - 1 && 'pb-0'
            )}
          >
            <div
              className="absolute left-[-29px] top-1 w-2.5 h-2.5 rounded-full border-2 border-[var(--brand-primary)] bg-[var(--bg-base)]"
            />
            <div className="bg-[var(--bg-elevated)] rounded-xl p-5 border border-[var(--border-subtle)]">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--bg-surface)] flex items-center justify-center flex-shrink-0">
                  <ActorIcon className="w-4 h-4 text-[var(--text-secondary)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-[var(--text-tertiary)]">{actorLabel}</span>
                    <span className="text-xs text-[var(--text-tertiary)]">·</span>
                    <span className="text-xs text-[var(--text-tertiary)]">
                      {formatDateTime(event.timestamp)}
                    </span>
                  </div>
                  {event.details && Object.keys(event.details).length > 0 && (
                    <div className="mt-2 text-xs bg-[var(--bg-surface)] rounded px-2 py-1.5 font-mono text-[var(--text-secondary)]">
                      {JSON.stringify(event.details, null, 2)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
