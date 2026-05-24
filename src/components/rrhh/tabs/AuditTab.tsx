import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import {
  BookOpen,
  ArrowDownUp,
  Clock3,
  Cpu,
  Database,
  FileText,
  ListChecks,
  Mail,
  ShieldAlert,
  Sparkles,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import { useStore } from '../../../store';
import { cn } from '../../../utils/cn';
import type { AuditEvent } from '../../../types';

type AuditCategory = 'case' | 'candidate' | 'data' | 'email' | 'task' | 'security' | 'system';
type AuditFilter = 'all' | 'rrhh' | 'candidato' | 'sistema' | 'tareas';

const ACTION_LABELS: Record<string, string> = {
  case_created: 'Caso creado',
  candidate_form_sent: 'Formulario enviado al candidato',
  candidate_form_submitted: 'Datos enviados por el candidato',
  review_started: 'Revisión de RRHH iniciada',
  correction_requested: 'Corrección solicitada',
  case_approved: 'Caso aprobado',
  case_activated: 'Activación iniciada',
  case_blocked: 'Caso bloqueado',
  case_unblocked: 'Caso desbloqueado',
  case_cancelled: 'Caso cancelado',
  case_operative: 'Caso operativo',
  candidate_data_consolidated: 'Datos consolidados',
  task_started: 'Tarea iniciada',
  task_completed: 'Tarea completada',
  task_failed: 'Tarea fallida',
  task_skipped: 'Tarea omitida',
  email_approved: 'Plantilla de email aprobada',
};

const DETAIL_LABELS: Record<string, string> = {
  note: 'Nota',
  reason: 'Motivo',
  status: 'Estado',
  taskType: 'Tarea',
  taskId: 'ID de tarea',
  recipient: 'Destinatario',
  group: 'Grupo',
  email: 'Email',
  paymentMethod: 'Método de pago',
  cbu: 'CBU',
  walletAddress: 'Dirección',
  taxIdValue: 'Identificación fiscal',
  entityType: 'Entidad',
};

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
  'walletAddress',
  'taxIdValue',
  'meetingLink',
  'onboardingFolderUrl',
  'candidateUrl',
  'onboardingUrl',
  'temporaryPassword',
]);

const REDACTED = 'Dato sensible oculto';

const FILTERS: { id: AuditFilter; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'rrhh', label: 'RRHH' },
  { id: 'candidato', label: 'Candidato' },
  { id: 'sistema', label: 'Sistema' },
  { id: 'tareas', label: 'Tareas' },
];

function actionLabel(action: string): string {
  return ACTION_LABELS[action] || 'Acción registrada';
}

function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function looksLikeUrl(value: string): boolean {
  return /https?:\/\//i.test(value) || /\bwww\./i.test(value) || /\b[a-z0-9.-]+\.[a-z]{2,}(?:\/|\?|$)/i.test(value);
}

function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEYS.has(key) || /(?:url|link)$/i.test(key);
}

function formatDetailValue(key: string, value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (isSensitiveKey(key)) return REDACTED;

  if (Array.isArray(value)) {
    if (value.length === 0) return '—';
    const values = value.map(item => formatDetailValue(key, item));
    if (values.includes(REDACTED)) return REDACTED;
    return values.slice(0, 3).join(', ') + (values.length > 3 ? '…' : '');
  }

  if (typeof value === 'object') return REDACTED;
  if (typeof value === 'string') {
    if (looksLikeUrl(value)) return REDACTED;
    if (value.length > 120) return REDACTED;
    return value;
  }

  return String(value);
}

function getAuditCategory(event: AuditEvent): AuditCategory {
  if (event.actorType === 'system' || event.actorType === 'integration' || event.action === 'case_operative') {
    return 'system';
  }
  if (event.action.startsWith('task_')) return 'task';
  if (event.action.startsWith('email_')) return 'email';
  if (event.action === 'candidate_data_consolidated') return 'data';
  if (event.action === 'candidate_form_sent' || event.action === 'candidate_form_submitted') return 'candidate';
  if (event.action === 'case_blocked' || event.action === 'case_unblocked' || event.action === 'case_cancelled') {
    return 'security';
  }
  return 'case';
}

function getAuditGroup(event: AuditEvent): Exclude<AuditFilter, 'all'> {
  const category = getAuditCategory(event);
  if (category === 'candidate') return 'candidato';
  if (category === 'task') return 'tareas';
  if (category === 'system') return 'sistema';
  return 'rrhh';
}

function getEventSource(event: AuditEvent): string {
  if (event.actorType === 'system' || event.actorType === 'integration') {
    return event.actorId === 'automation' ? 'Automatización' : 'Sistema';
  }
  if (event.actorId === 'candidate') return 'Candidato';
  return 'RRHH';
}

function getCategoryStyle(category: AuditCategory): {
  label: string;
  icon: LucideIcon;
  textClassName: string;
  bgClassName: string;
  borderClassName: string;
  accent: string;
} {
  switch (category) {
    case 'case':
      return {
        label: 'Caso',
        icon: FileText,
        textClassName: 'text-[var(--brand-primary)]',
        bgClassName: 'bg-[var(--brand-primary-subtle)]',
        borderClassName: 'border-[var(--border-subtle)]/60',
        accent: 'color-mix(in srgb, var(--border-subtle) 60%, transparent)',
      };
    case 'candidate':
      return {
        label: 'Candidato',
        icon: UserRound,
        textClassName: 'text-[var(--status-info)]',
        bgClassName: 'bg-[var(--status-info-subtle)]',
        borderClassName: 'border-[var(--border-subtle)]/60',
        accent: 'color-mix(in srgb, var(--border-subtle) 60%, transparent)',
      };
    case 'data':
      return {
        label: 'Datos',
        icon: Database,
        textClassName: 'text-[var(--status-warning)]',
        bgClassName: 'bg-[var(--status-warning-subtle)]',
        borderClassName: 'border-[var(--border-subtle)]/60',
        accent: 'color-mix(in srgb, var(--border-subtle) 60%, transparent)',
      };
    case 'email':
      return {
        label: 'Email',
        icon: Mail,
        textClassName: 'text-[var(--status-success)]',
        bgClassName: 'bg-[var(--status-success-subtle)]',
        borderClassName: 'border-[var(--border-subtle)]/60',
        accent: 'color-mix(in srgb, var(--border-subtle) 60%, transparent)',
      };
    case 'task':
      return {
        label: 'Tarea',
        icon: ListChecks,
        textClassName: 'text-[var(--text-secondary)]',
        bgClassName: 'bg-[var(--bg-subtle)]',
        borderClassName: 'border-[var(--border-subtle)]/60',
        accent: 'color-mix(in srgb, var(--border-subtle) 60%, transparent)',
      };
    case 'security':
      return {
        label: 'Seguridad',
        icon: ShieldAlert,
        textClassName: 'text-[var(--status-error)]',
        bgClassName: 'bg-[var(--status-error-subtle)]',
        borderClassName: 'border-[var(--border-subtle)]/60',
        accent: 'color-mix(in srgb, var(--border-subtle) 60%, transparent)',
      };
    case 'system':
      return {
        label: 'Sistema',
        icon: Cpu,
        textClassName: 'text-[var(--text-tertiary)]',
        bgClassName: 'bg-[var(--bg-subtle)]',
        borderClassName: 'border-[var(--border-subtle)]/60',
        accent: 'color-mix(in srgb, var(--border-subtle) 60%, transparent)',
      };
  }
}

function getFilterStyle(filter: Exclude<AuditFilter, 'all'>): {
  label: string;
  countKey: keyof AuditSummary;
  textClassName: string;
  bgClassName: string;
  borderClassName: string;
  accent: string;
} {
  switch (filter) {
    case 'rrhh':
      return {
        label: 'RRHH',
        countKey: 'rrhh',
        textClassName: 'text-[var(--brand-primary)]',
        bgClassName: 'bg-[var(--brand-primary-subtle)]',
        borderClassName: 'border-[var(--border-subtle)]/60',
        accent: 'color-mix(in srgb, var(--border-subtle) 60%, transparent)',
      };
    case 'candidato':
      return {
        label: 'Candidato',
        countKey: 'candidato',
        textClassName: 'text-[var(--status-info)]',
        bgClassName: 'bg-[var(--status-info-subtle)]',
        borderClassName: 'border-[var(--border-subtle)]/60',
        accent: 'color-mix(in srgb, var(--border-subtle) 60%, transparent)',
      };
    case 'sistema':
      return {
        label: 'Sistema',
        countKey: 'sistema',
        textClassName: 'text-[var(--text-tertiary)]',
        bgClassName: 'bg-[var(--bg-subtle)]',
        borderClassName: 'border-[var(--border-subtle)]/60',
        accent: 'color-mix(in srgb, var(--border-subtle) 60%, transparent)',
      };
    case 'tareas':
      return {
        label: 'Tareas',
        countKey: 'tareas',
        textClassName: 'text-[var(--status-success)]',
        bgClassName: 'bg-[var(--status-success-subtle)]',
        borderClassName: 'border-[var(--border-subtle)]/60',
        accent: 'color-mix(in srgb, var(--border-subtle) 60%, transparent)',
      };
  }
}

type AuditSummary = {
  total: number;
  rrhh: number;
  candidato: number;
  sistema: number;
  tareas: number;
  atencion: number;
};

function RedactedValue() {
  return (
    <span className="inline-flex items-center rounded-full border border-[var(--border-subtle)]/60 bg-[var(--status-warning-subtle)] px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[var(--status-warning)]">
      {REDACTED}
    </span>
  );
}

function AuditDetails({ details }: { details?: Record<string, unknown> }) {
  if (!details) return null;

  const entries = Object.entries(details).filter(([, value]) => value !== null && value !== undefined && value !== '');
  if (entries.length === 0) return null;

  return (
    <dl className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
      {entries.map(([key, value]) => {
        const formatted = formatDetailValue(key, value);
        return (
          <div key={key} className="min-w-0 rounded-lg border border-[var(--border-subtle)]/60 bg-[var(--bg-surface)] px-3 py-2">
            <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
              {DETAIL_LABELS[key] || key.replace(/[_-]/g, ' ')}
            </dt>
            <dd className="mt-1 text-xs font-medium text-[var(--text-primary)] break-words">
              {formatted === REDACTED ? <RedactedValue /> : formatted}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

function AuditSummaryStrip({ summary }: { summary: AuditSummary }) {
  const items: { label: string; value: number; tone: 'default' | 'info' | 'success' | 'warning' | 'danger'; accent: string }[] = [
    { label: 'Total', value: summary.total, tone: 'default', accent: 'var(--border-subtle)' },
    { label: 'RRHH', value: summary.rrhh, tone: 'default', accent: 'var(--brand-primary)' },
    { label: 'Candidato', value: summary.candidato, tone: 'info', accent: 'var(--status-info)' },
    { label: 'Sistema', value: summary.sistema, tone: 'success', accent: 'var(--status-success)' },
    { label: 'Tareas', value: summary.tareas, tone: 'warning', accent: 'var(--status-warning)' },
    { label: 'Atención', value: summary.atencion, tone: 'danger', accent: 'var(--status-error)' },
  ];

  return (
    <section aria-label="Resumen de auditoría" className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
      {items.map(item => {
        const toneClass =
          item.tone === 'info' ? 'text-[var(--status-info)] bg-[var(--status-info-subtle)] border-[var(--border-subtle)]/60' :
          item.tone === 'success' ? 'text-[var(--status-success)] bg-[var(--status-success-subtle)] border-[var(--border-subtle)]/60' :
          item.tone === 'warning' ? 'text-[var(--status-warning)] bg-[var(--status-warning-subtle)] border-[var(--border-subtle)]/60' :
          item.tone === 'danger' ? 'text-[var(--status-error)] bg-[var(--status-error-subtle)] border-[var(--border-subtle)]/60' :
          'text-[var(--text-primary)] bg-[var(--bg-elevated)] border-[var(--border-subtle)]/60';

        return (
          <div
            key={item.label}
            className={cn(
              'rounded-xl border px-3 py-2.5 ring-1 ring-inset',
              toneClass
            )}
            style={{
              '--tw-ring-color': 'color-mix(in srgb, var(--border-subtle) 55%, transparent)',
            } as CSSProperties}
          >
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
              {item.label}
            </div>
            <div className="mt-1 text-xl font-bold tabular-nums leading-none text-[var(--text-primary)]">
              {item.value}
            </div>
          </div>
        );
      })}
    </section>
  );
}

function AuditFilterChips({
  currentFilter,
  counts,
  onChange,
}: {
  currentFilter: AuditFilter;
  counts: AuditSummary;
  onChange: (filter: AuditFilter) => void;
}) {
  return (
    <div role="toolbar" aria-label="Filtrar auditoría" className="flex flex-wrap gap-2">
      {FILTERS.map(filter => {
        const active = currentFilter === filter.id;
        const count = filter.id === 'all' ? counts.total : counts[getFilterStyle(filter.id).countKey];
        const style = filter.id === 'all' ? null : getFilterStyle(filter.id);

        return (
          <button
            key={filter.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(filter.id)}
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition-[background-color,border-color,color,box-shadow] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]',
              active
                ? filter.id === 'all'
                  ? 'border-[var(--border-subtle)]/60 bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)] ring-1 ring-inset'
                  : cn(style?.bgClassName, style?.textClassName, style?.borderClassName, 'ring-1 ring-inset')
                : 'border-[var(--border-subtle)]/60 bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--border-default)]/70 hover:text-[var(--text-primary)]'
            )}
            style={
              active && style
                ? ({ '--tw-ring-color': style.accent } as CSSProperties)
                : undefined
            }
          >
            <span>{filter.label}</span>
            <span className={cn('rounded-full px-1.5 py-0.5 text-[10px] tabular-nums', active ? 'bg-white/40 text-current' : 'bg-[var(--bg-subtle)] text-[var(--text-tertiary)]')}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function AuditEventCard({ event }: { event: AuditEvent }) {
  const category = getAuditCategory(event);
  const categoryStyle = getCategoryStyle(category);
  const CategoryIcon = categoryStyle.icon;
  const details = event.details;

  return (
    <article
      className={cn(
             'rounded-2xl border border-[var(--border-subtle)]/60 bg-[var(--bg-elevated)] p-3.5 shadow-[0_1px_0_rgba(0,0,0,0.02)] transition-[background-color,border-color,box-shadow] duration-150 hover:border-[var(--border-default)]/70 sm:p-4'
      )}
    >
      <div className="flex items-start gap-3 min-w-0">
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ring-1 ring-inset',
            categoryStyle.bgClassName,
            categoryStyle.textClassName,
            categoryStyle.borderClassName
          )}
          style={{ '--tw-ring-color': categoryStyle.accent } as CSSProperties}
          aria-hidden="true"
        >
          <CategoryIcon className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold leading-5 text-[var(--text-primary)] break-words">
                {actionLabel(event.action)}
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-tertiary)]">
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-surface)] px-2 py-0.5 font-medium text-[var(--text-secondary)]">
                  <Sparkles className="h-3 w-3" aria-hidden="true" />
                  {categoryStyle.label}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock3 className="h-3 w-3" aria-hidden="true" />
                  {formatTimestamp(event.timestamp)}
                </span>
              </div>
            </div>

            <span
              className={cn(
                'inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em]',
                categoryStyle.bgClassName,
                categoryStyle.textClassName,
                categoryStyle.borderClassName
              )}
              style={{ '--tw-ring-color': categoryStyle.accent } as CSSProperties}
            >
              {categoryStyle.label}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]">
            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border-subtle)]/60 bg-[var(--bg-surface)] px-2 py-0.5">
              <BookOpen className="h-3 w-3 text-[var(--text-tertiary)]" aria-hidden="true" />
              {getEventSource(event)}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border-subtle)]/60 bg-[var(--bg-surface)] px-2 py-0.5">
              <UserRound className="h-3 w-3 text-[var(--text-tertiary)]" aria-hidden="true" />
              {event.actorType === 'system' || event.actorType === 'integration' ? 'Sistema' : event.actorId === 'candidate' ? 'Candidato' : 'RRHH'}
            </span>
          </div>

          <AuditDetails details={details} />
        </div>
      </div>
    </article>
  );
}

function EmptyAuditState({ hasFilter, onClear }: { hasFilter: boolean; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-[var(--border-subtle)]/60 bg-[var(--bg-elevated)] px-5 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border-subtle)]/60 bg-[var(--bg-surface)] text-[var(--text-tertiary)]">
        <ShieldAlert className="h-5 w-5" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-[var(--text-primary)]">
        {hasFilter ? 'No hay eventos para este filtro' : 'Aún no hay eventos de auditoría'}
      </h3>
      <p className="mt-1 max-w-sm text-sm leading-6 text-[var(--text-secondary)]">
        {hasFilter
          ? 'Probá otro filtro o volvé a Todos para revisar toda la actividad registrada.'
          : 'Cuando RRHH, el candidato, el sistema o las tareas generen actividad, vas a verla acá.'}
      </p>
      {hasFilter && (
        <button
          type="button"
          onClick={onClear}
          className="mt-4 inline-flex items-center rounded-full border border-[var(--border-subtle)]/60 bg-[var(--brand-primary-subtle)] px-3 py-2 text-xs font-semibold text-[var(--brand-primary)] transition-[background-color,border-color,color] duration-150 hover:border-[var(--border-default)]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]"
        >
          Volver a Todos
        </button>
      )}
    </div>
  );
}

export function AuditTab() {
  const selectedCase = useStore(state => state.getSelectedCase());
  const [filter, setFilter] = useState<AuditFilter>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const baseEvents = selectedCase?.auditLog ?? [];

  const summary = useMemo<AuditSummary>(() => {
    const initial: AuditSummary = { total: 0, rrhh: 0, candidato: 0, sistema: 0, tareas: 0, atencion: 0 };

    for (const event of baseEvents) {
      const category = getAuditCategory(event);
      const group = getAuditGroup(event);

      initial.total += 1;
      initial[group] += 1;

      if (category === 'data' || category === 'email' || category === 'security') {
        initial.atencion += 1;
      }
    }

    return initial;
  }, [baseEvents]);

  const visibleEvents = useMemo(() => {
    const filtered = filter === 'all' ? baseEvents : baseEvents.filter(event => getAuditGroup(event) === filter);
    return [...filtered].sort((a, b) => (sortOrder === 'desc' ? b.timestamp - a.timestamp : a.timestamp - b.timestamp));
  }, [baseEvents, filter, sortOrder]);

  if (!selectedCase) return null;

  return (
    <div className="space-y-4 sm:space-y-5">
      <header className="space-y-1">
        <h2 className="text-lg font-bold tracking-tight text-[var(--text-primary)]">Auditoría</h2>
        <p className="text-sm leading-6 text-[var(--text-secondary)]">
          Línea de tiempo compacta con foco en actividad, origen y datos sensibles ocultos.
        </p>
      </header>

      <AuditSummaryStrip summary={summary} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <AuditFilterChips currentFilter={filter} counts={summary} onChange={setFilter} />

        <button
          type="button"
          onClick={() => setSortOrder(current => (current === 'desc' ? 'asc' : 'desc'))}
          aria-label="Cambiar orden cronológico"
          className={cn(
            'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition-[background-color,border-color,color,box-shadow] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]',
            'border-[var(--border-subtle)]/60 bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--border-default)]/70 hover:text-[var(--text-primary)]'
          )}
        >
          <ArrowDownUp className="h-3.5 w-3.5" aria-hidden="true" />
          {sortOrder === 'desc' ? 'Más recientes primero' : 'Más antiguos primero'}
        </button>
      </div>

      {visibleEvents.length === 0 ? (
        <EmptyAuditState hasFilter={filter !== 'all'} onClear={() => setFilter('all')} />
      ) : (
        <ol className="space-y-3">
          {visibleEvents.map(event => (
            <li key={event.id}>
              <AuditEventCard event={event} />
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
