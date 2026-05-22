import { useMemo, useState } from 'react';
import { useStore } from '../../../store';
import { User, Cpu, Zap, ArrowDownUp, ClipboardList } from 'lucide-react';
import { cn } from '../../../utils/cn';
import type { AuditEvent } from '../../../types';

// ─── Action labels (Spanish) ────────────────────────────────────────────────
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
  task_started: 'Tarea iniciada',
  task_completed: 'Tarea completada',
  task_failed: 'Tarea fallida',
  task_skipped: 'Tarea omitida',
  email_approved: 'Plantilla de email aprobada',
  candidate_data_consolidated: 'Datos consolidados',
};

function actionLabel(action: string): string {
  return ACTION_LABELS[action] || 'Acción registrada';
}

// ─── Detail key labels (Spanish) ────────────────────────────────────────────
const DETAIL_KEY_LABELS: Record<string, string> = {
  note: 'Nota',
  reason: 'Motivo',
  status: 'Estado',
  taskType: 'Tarea',
  taskId: 'ID de tarea',
  recipient: 'Destinatario',
  group: 'Grupo',
  email: 'Email',
};

// Fields that must be redacted from the UI to protect candidate privacy or
// avoid exposing artifacts that look like credentials.
const SENSITIVE_KEYS = new Set([
  'token',
  'candidateToken',
  'password',
  'temporaryPassword',
  'secret',
  'apiKey',
  'access_token',
  'refresh_token',
  'cbu',
  'CBU',
  'walletAddress',
  'accountNumber',
  'swift',
  'taxIdValue',
  'meetingLink',
  'welcomeMeetingLink',
  'managerMeetingLink',
  'onboardingFolderUrl',
  'kitRedesUrl',
  'dataUrl',
]);

const REDACTED = 'Dato sensible oculto';

function formatDetailKey(key: string): string {
  return DETAIL_KEY_LABELS[key] || key.replace(/[_-]/g, ' ');
}

function formatDetailValue(key: string, value: unknown): string {
  if (SENSITIVE_KEYS.has(key)) return REDACTED;
  if (value === null || value === undefined) return '—';
  if (typeof value === 'string') {
    // Heuristic: redact long opaque tokens / URLs that look like private links.
    if (value.length > 80) return REDACTED;
    if (/^https?:\/\//.test(value) && /(token|password|secret|invite|t=|key=)/i.test(value)) {
      return REDACTED;
    }
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  // Object / array: don't dump JSON in the UI.
  return REDACTED;
}

function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ─── Actor classification ───────────────────────────────────────────────────
type ActorGroup = 'rrhh' | 'candidato' | 'sistema' | 'tareas';

function classifyEvent(event: AuditEvent): ActorGroup {
  if (event.action.startsWith('task_')) return 'tareas';
  if (event.actorType === 'system' || event.actorType === 'integration') return 'sistema';
  if (event.actorId === 'candidate') return 'candidato';
  return 'rrhh';
}

function actorBadge(group: ActorGroup): { label: string; className: string; Icon: typeof User } {
  switch (group) {
    case 'rrhh':
      return { label: 'RRHH', className: 'bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]', Icon: User };
    case 'candidato':
      return { label: 'Candidato', className: 'bg-[var(--status-info-subtle)] text-[var(--status-info)]', Icon: User };
    case 'sistema':
      return { label: 'Sistema', className: 'bg-[var(--status-success-subtle)] text-[var(--status-success)]', Icon: Cpu };
    case 'tareas':
      return { label: 'Tareas', className: 'bg-[var(--status-warning-subtle)] text-[var(--status-warning)]', Icon: Zap };
  }
}

const FILTERS: { id: 'all' | ActorGroup; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'rrhh', label: 'RRHH' },
  { id: 'candidato', label: 'Candidato' },
  { id: 'sistema', label: 'Sistema' },
  { id: 'tareas', label: 'Tareas' },
];

export function AuditTab() {
  const selectedCase = useStore(state => state.getSelectedCase());
  const [filter, setFilter] = useState<'all' | ActorGroup>('all');
  const [sort, setSort] = useState<'desc' | 'asc'>('desc');

  const baseEvents = selectedCase?.auditLog ?? [];

  const visibleEvents = useMemo(() => {
    let arr = [...baseEvents];
    if (filter !== 'all') {
      arr = arr.filter(e => classifyEvent(e) === filter);
    }
    arr.sort((a, b) => sort === 'desc' ? b.timestamp - a.timestamp : a.timestamp - b.timestamp);
    return arr;
  }, [baseEvents, filter, sort]);

  if (!selectedCase) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <header>
        <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">Auditoría del caso</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Registro cronológico de cambios y acciones relevantes.
        </p>
      </header>

      {/* Filters + sort */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Filtrar eventos por origen" className="flex flex-wrap gap-1.5">
          {FILTERS.map(f => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(f.id)}
                className={cn(
                  'text-xs font-semibold px-3 py-1.5 rounded-md border transition-[background-color,border-color,color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]',
                  active
                    ? 'bg-[var(--brand-primary-subtle)] border-[var(--brand-primary)]/30 text-[var(--brand-primary)]'
                    : 'bg-transparent border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)]'
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setSort(s => s === 'desc' ? 'asc' : 'desc')}
          aria-label="Cambiar orden cronológico"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 py-1.5 rounded-md border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-[background-color,border-color,color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]"
        >
          <ArrowDownUp className="w-3.5 h-3.5" aria-hidden="true" />
          {sort === 'desc' ? 'Más recientes primero' : 'Más antiguos primero'}
        </button>
      </div>

      {/* Empty state */}
      {visibleEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)] px-6">
          <div className="w-12 h-12 rounded-full bg-[var(--bg-surface)] flex items-center justify-center mb-3">
            <ClipboardList className="w-6 h-6 text-[var(--text-tertiary)]" aria-hidden="true" />
          </div>
          <p className="text-sm font-medium text-[var(--text-primary)]">
            {baseEvents.length === 0
              ? 'Todavía no hay eventos de auditoría para este caso.'
              : 'No hay eventos para este filtro.'}
          </p>
          {baseEvents.length > 0 && filter !== 'all' && (
            <button
              type="button"
              onClick={() => setFilter('all')}
              className="mt-3 text-xs font-semibold text-[var(--brand-primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] rounded"
            >
              Ver todos los eventos
            </button>
          )}
        </div>
      ) : (
        <ol className="relative pl-6 border-l border-[var(--border-default)]">
          {visibleEvents.map((event, index) => {
            const group = classifyEvent(event);
            const { label: actorLabelText, className: actorClass, Icon: ActorIcon } = actorBadge(group);
            const label = actionLabel(event.action);

            const detailEntries = event.details
              ? Object.entries(event.details).filter(([, v]) => v !== null && v !== undefined && v !== '')
              : [];

            return (
              <li
                key={event.id}
                className={cn('relative pb-6', index === visibleEvents.length - 1 && 'pb-0')}
              >
                <span
                  aria-hidden="true"
                  className="absolute left-[-29px] top-3 w-2.5 h-2.5 rounded-full border-2 border-[var(--brand-primary)] bg-[var(--bg-base)]"
                />
                <article className="bg-[var(--bg-elevated)] rounded-xl p-5 border border-[var(--border-subtle)] min-w-0">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[var(--bg-surface)] flex items-center justify-center flex-shrink-0">
                      <ActorIcon className="w-4 h-4 text-[var(--text-secondary)]" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <p className="text-sm font-semibold text-[var(--text-primary)] break-words">
                          {label}
                        </p>
                        <span className={cn(
                          'text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide flex-shrink-0',
                          actorClass
                        )}>
                          {actorLabelText}
                        </span>
                      </div>

                      <p className="text-xs text-[var(--text-tertiary)] mt-1">
                        {formatDateTime(event.timestamp)}
                      </p>

                      {detailEntries.length > 0 && (
                        <dl className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
                          {detailEntries.map(([key, value]) => (
                            <div key={key} className="min-w-0">
                              <dt className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">
                                {formatDetailKey(key)}
                              </dt>
                              <dd className="text-[var(--text-primary)] font-medium break-words">
                                {formatDetailValue(key, value)}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      )}
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
