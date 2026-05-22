import { X, Clock, User, Cpu, Zap } from 'lucide-react';
import { useStore } from '../../store';
import { cn } from '../../utils/cn';

const ACTION_LABELS: Record<string, string> = {
  case_created: 'Caso creado',
  candidate_form_sent: 'Formulario enviado',
  candidate_form_submitted: 'Formulario completado',
  review_started: 'Revisión iniciada',
  correction_requested: 'Corrección solicitada',
  case_approved: 'Caso aprobado',
  case_activated: 'Caso activado',
  case_blocked: 'Caso bloqueado',
  case_unblocked: 'Caso desbloqueado',
  case_cancelled: 'Caso cancelado',
  case_operative: 'Caso operativo',
  task_completed: 'Tarea completada',
  task_failed: 'Tarea fallida',
  task_skipped: 'Tarea omitida',
  email_approved: 'Email aprobado',
  candidate_data_consolidated: 'Datos consolidados',
};

const ACTOR_ICONS = {
  user: User,
  system: Cpu,
  integration: Zap,
};

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
  });
}

export function AuditDrawer() {
  const { isAuditDrawerOpen, toggleAuditDrawer, getAllAuditEvents } = useStore();

  if (!isAuditDrawerOpen) return null;

  const events = getAllAuditEvents();

  return (
    <>
      <div
        className="fixed inset-0 bg-[var(--bg-overlay)] z-40"
        onClick={toggleAuditDrawer}
      />
      <div className="fixed right-0 top-0 bottom-0 w-[400px] bg-[var(--bg-surface)] border-l border-[var(--border-subtle)] z-50 flex flex-col animate-slide-in-right">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Audit Log</h2>
          <button
            onClick={toggleAuditDrawer}
            className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-white/[0.05] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Clock className="w-12 h-12 text-[var(--text-tertiary)] mb-3" />
              <p className="text-[var(--text-secondary)]">No hay eventos registrados</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">Los eventos aparecerán aquí</p>
            </div>
          ) : (
            <div className="relative pl-6 border-l border-[var(--border-default)]">
              {events.map((event, index) => {
                const ActorIcon = ACTOR_ICONS[event.actorType] || User;
                const label = ACTION_LABELS[event.action] || event.action;

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
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center flex-shrink-0">
                        <ActorIcon className="w-4 h-4 text-[var(--text-secondary)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
                        <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                          {formatDate(event.timestamp)} · {formatTime(event.timestamp)}
                        </p>
                        {event.details && Object.keys(event.details).length > 0 && (
                          <p className="text-xs text-[var(--text-secondary)] mt-1 bg-[var(--bg-elevated)] rounded px-2 py-1 inline-block">
                            {JSON.stringify(event.details)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
