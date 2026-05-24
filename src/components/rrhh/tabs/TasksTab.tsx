import React, { useState } from 'react';
import { useStore } from '../../../store';
import { Button } from '../../ui/Button';
import {
  RotateCcw, SkipForward, CheckCircle2, XCircle, Clock, Loader2,
  Sparkles, Terminal, ChevronDown, ChevronUp, ShieldAlert
} from 'lucide-react';
import { TaskType, OnboardingTask } from '../../../types';
import { cn } from '../../../utils/cn';

// ─── STATIC DATA ──────────────────────────────────────────────────────────────

const INTEGRATION_ADAPTERS: { action: string; adapter: string; category: string }[] = [
  { action: 'Crear usuario',     adapter: 'Admin SDK · users.insert',        category: 'Google Workspace' },
  { action: 'Agregar a grupos',  adapter: 'Admin SDK · members.insert',       category: 'Google Workspace' },
  { action: 'Configurar firma',  adapter: 'Gmail Settings adapter',            category: 'Google Workspace' },
  { action: 'Enviar bienvenida', adapter: 'Gmail API / SMTP',                  category: 'Comunicaciones'  },
  { action: 'Solicitar equipo',  adapter: 'Notificación interna',              category: 'Administración'  },
];

const TASK_SPANISH_LABELS: Record<string, string> = {
  CREATE_GOOGLE_USER:         'Crear usuario de Google Workspace',
  ADD_GOOGLE_GROUPS:          'Agregar a grupos internos',
  CONFIGURE_GMAIL_SIGNATURE:  'Configurar firma de Gmail',
  SEND_WELCOME_EMAIL:         'Enviar email de bienvenida',
  ANNOUNCE_IN_GROUPS:         'Anunciar en grupos internos',
  POST_INTERNAL_ANNOUNCEMENT: 'Publicar anuncio interno',
  REQUEST_DEVICE:             'Solicitar equipo',
  NOTIFY_ADMINISTRATION:      'Notificar a Administración',
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function getTaskLabel(type: TaskType, metadata?: Record<string, unknown>): string {
  if (type === 'ANNOUNCE_IN_GROUPS' && metadata?.groupName) {
    return `Anunciar en ${metadata.groupName}`;
  }
  return TASK_SPANISH_LABELS[type] || type;
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'pending':         return 'Pendiente';
    case 'running':         return 'En curso';
    case 'success':         return 'Completada';
    case 'failed':          return 'Fallida';
    case 'skipped':         return 'Omitida';
    case 'manual_required': return 'Requiere intervención';
    default:                return status;
  }
}

function getTaskIcon(status: string) {
  switch (status) {
    case 'success':         return <CheckCircle2 className="w-4 h-4 text-[var(--status-success)]" />;
    case 'failed':          return <XCircle      className="w-4 h-4 text-[var(--status-error)]" />;
    case 'manual_required': return <ShieldAlert  className="w-4 h-4 text-[var(--status-warning)]" />;
    case 'running':         return <Loader2      className="w-4 h-4 text-[var(--status-info)] animate-spin" />;
    case 'skipped':         return <SkipForward  className="w-4 h-4 text-[var(--text-tertiary)]" />;
    default:                return <Clock        className="w-4 h-4 text-[var(--text-tertiary)]" />;
  }
}

function getOwnerLabel(owner: string): string {
  switch (owner) {
    case 'system': return 'Automático';
    case 'it':     return 'IT';
    case 'admin':  return 'Administración';
    default:       return owner;
  }
}

// ─── PROGRESS RING ────────────────────────────────────────────────────────────

function ProgressRing({ percent, isComplete }: { percent: number; isComplete: boolean }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  const color = isComplete ? 'var(--status-success)' : 'var(--brand-primary)';

  return (
    <div className="relative flex-shrink-0" style={{ width: 44, height: 44 }}>
      <svg width={44} height={44} viewBox="0 0 44 44" aria-hidden="true">
        <circle cx={22} cy={22} r={r} fill="none" stroke="var(--border-subtle)" strokeWidth={3} />
        <circle
          cx={22} cy={22} r={r}
          fill="none"
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform="rotate(-90 22 22)"
          style={{ transition: 'stroke-dashoffset 300ms ease-out, stroke 300ms ease-out' }}
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center text-[10px] font-bold tabular-nums"
        style={{ color }}
      >
        {percent}%
      </span>
    </div>
  );
}

// ─── PROGRESS HEADER ──────────────────────────────────────────────────────────

function AutomationProgressHeader({ tasks }: { tasks: OnboardingTask[] }) {
  const total     = tasks.length;
  const completed = tasks.filter(t => t.status === 'success' || t.status === 'skipped').length;
  const running   = tasks.filter(t => t.status === 'running').length;
  const attention = tasks.filter(t => t.status === 'failed' || t.status === 'manual_required').length;
  const pending   = tasks.filter(t => t.status === 'pending').length;
  const percent   = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isComplete = percent === 100;

  return (
    <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] px-4 py-3.5" style={{ boxShadow: 'var(--shadow-sm)' }}>
      {/* Ring + title + score — single row */}
      <div className="flex items-center gap-3.5">
        <ProgressRing percent={percent} isComplete={isComplete} />

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2 mb-2">
            <span className="text-sm font-bold text-[var(--text-primary)] leading-none">
              Activación operativa
            </span>
            <span className="text-[11px] font-semibold tabular-nums text-[var(--text-tertiary)] flex-shrink-0">
              {completed}/{total}
            </span>
          </div>

          {/* Progress rail */}
          <div
            className="h-1.5 w-full bg-[var(--bg-subtle)] rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Progreso de activación: ${percent}% completado`}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${percent}%`,
                backgroundColor: isComplete ? 'var(--status-success)' : 'var(--brand-primary)',
                transition: 'width 300ms ease-out, background-color 300ms ease-out',
              }}
            />
          </div>
        </div>
      </div>

      {/* Status chips — only render chips that are non-zero or always-relevant */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 pl-[52px]">
        {running > 0 && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--status-info)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-info)] flex-shrink-0" aria-hidden="true" />
            {running} en curso
          </span>
        )}
        {attention > 0 && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--status-error)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-error)] flex-shrink-0" aria-hidden="true" />
            {attention} requieren atención
          </span>
        )}
        {pending > 0 && (
          <span className="inline-flex items-center gap-1 text-[11px] text-[var(--text-tertiary)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-tertiary)] flex-shrink-0" aria-hidden="true" />
            {pending} pendientes
          </span>
        )}
        {isComplete && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--status-success)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-success)] flex-shrink-0" aria-hidden="true" />
            Todo completado
          </span>
        )}
        {!running && !attention && !pending && !isComplete && (
          <span className="text-[11px] text-[var(--text-tertiary)]">{total} tareas en total</span>
        )}
      </div>
    </div>
  );
}

// ─── EVIDENCE PANEL ───────────────────────────────────────────────────────────

function TaskOutputPanel({ task, selectedCase }: { task: OnboardingTask; selectedCase: any }) {
  const getOutput = (): string => {
    switch (task.type) {
      case 'CREATE_GOOGLE_USER':
        if (task.status === 'pending') return 'Preparada para crear la cuenta corporativa.';
        if (task.status === 'running') return 'Creando usuario en Google Workspace…';
        if (task.status === 'failed')  return 'No se pudo crear el usuario.\nRevisá el error y reintentá la tarea.';
        if (task.status === 'success') {
          const email = selectedCase.employee.corporateEmail || selectedCase.suggestedEmail || 'colaborador@zafirus.tech';
          return `Usuario corporativo creado.\nEmail: ${email}`;
        }
        break;
      case 'ADD_GOOGLE_GROUPS':
        if (task.status === 'success') return 'Grupos asignados correctamente.';
        if (task.status === 'failed')  return 'No se pudo completar la asignación a grupos.';
        break;
      case 'CONFIGURE_GMAIL_SIGNATURE':
        if (task.status === 'success') return 'Firma corporativa preparada con datos del colaborador.';
        break;
      case 'SEND_WELCOME_EMAIL':
        if (task.status === 'pending' || task.status === 'running') {
          const approved = selectedCase.emailTemplate?.approvedAt != null;
          return approved ? 'Plantilla aprobada. Lista para envío.' : 'Plantilla pendiente de aprobación en la pestaña Email.';
        }
        if (task.status === 'success') return 'Email de bienvenida preparado para envío.';
        break;
      case 'REQUEST_DEVICE':
        return 'Solicitud de equipo enviada a Administración.';
      case 'NOTIFY_ADMINISTRATION':
        return 'Administración notificada sobre el alta.';
    }
    if (task.status === 'pending') return 'Esperando ejecución.';
    if (task.status === 'running') return 'Ejecutando proceso…';
    if (task.status === 'success') return 'Operación completada.';
    if (task.status === 'failed')  return 'Operación fallida.';
    if (task.status === 'skipped') return 'Operación omitida intencionalmente.';
    return 'Sin registro todavía.';
  };

  return (
    <div className="rounded-lg overflow-hidden border border-[var(--border-subtle)]">
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-subtle)] border-b border-[var(--border-subtle)]">
        <Terminal className="w-3 h-3 text-[var(--text-tertiary)]" aria-hidden="true" />
        <span className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
          Evidencia operativa
        </span>
      </div>
      <div className="px-3 py-2.5 bg-[var(--bg-surface)] text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap break-words font-mono">
        {getOutput()}
      </div>
    </div>
  );
}

// ─── TASK ROW ─────────────────────────────────────────────────────────────────

function TaskRow({ task, selectedCase }: { task: OnboardingTask; selectedCase: any }) {
  const { retryTask, skipTask } = useStore();

  const autoExpand = task.status === 'failed' || task.status === 'running' || task.status === 'manual_required';
  const [expanded, setExpanded] = useState(autoExpand);

  const label      = getTaskLabel(task.type, task.metadata);
  const ownerLabel = getOwnerLabel(task.owner);
  const formatTime = (ts: number | null) =>
    ts ? new Date(ts).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : '—';

  const isAlert   = task.status === 'failed' || task.status === 'manual_required';
  const isSuccess = task.status === 'success';
  const isSkipped = task.status === 'skipped';

  const statusPillClass = cn(
    'text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border flex-shrink-0 leading-none',
    isSuccess
      ? 'bg-[var(--status-success-subtle)] text-[var(--status-success)] border-[var(--status-success)]/20'
      : isAlert
        ? 'bg-[var(--status-error-subtle)] text-[var(--status-error)] border-[var(--status-error)]/20'
        : task.status === 'running'
          ? 'bg-[var(--status-info-subtle)] text-[var(--status-info)] border-[var(--status-info)]/20'
          : 'bg-[var(--bg-base)] text-[var(--text-tertiary)] border-[var(--border-default)]'
  );

  return (
    <div
      className={cn(
        'bg-[var(--bg-surface)] border rounded-xl overflow-hidden',
        isAlert   ? 'border-[var(--status-error)]/25' : 'border-[var(--border-subtle)]',
        isSuccess || isSkipped ? 'opacity-90' : ''
      )}
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      {/* Row header — real button for keyboard access */}
      <button
        type="button"
        aria-expanded={expanded}
        aria-label={expanded ? `Ocultar detalle de ${label}` : `Ver detalle de ${label}`}
        className={cn(
          'w-full flex items-center justify-between gap-3 px-3.5 py-3 text-left',
          'hover:bg-[var(--bg-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary-glow)]',
          'transition-colors duration-150',
          isAlert && 'bg-[var(--status-error-subtle)]/20'
        )}
        onClick={() => setExpanded(prev => !prev)}
      >
        {/* Left: icon + name + owner stacked */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <span className="flex-shrink-0 mt-0.5 self-start">{getTaskIcon(task.status)}</span>
          <div className="min-w-0">
            <span className="text-sm font-medium text-[var(--text-primary)] block truncate leading-snug">
              {label}
            </span>
            <span className="text-[11px] text-[var(--text-tertiary)] block mt-0.5">
              {ownerLabel}
            </span>
          </div>
        </div>

        {/* Right: status pill + chevron */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={statusPillClass}>{getStatusLabel(task.status)}</span>
          {expanded
            ? <ChevronUp   className="w-3.5 h-3.5 text-[var(--text-tertiary)]" aria-hidden="true" />
            : <ChevronDown className="w-3.5 h-3.5 text-[var(--text-tertiary)]" aria-hidden="true" />
          }
        </div>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="px-4 pb-4 pt-3 border-t border-[var(--border-subtle)] bg-[var(--bg-base)]">

          {/* Metadata strip — 3 fields */}
          <div className="grid grid-cols-3 gap-3 mb-3.5">
            {[
              { label: 'Inicio',    value: formatTime(task.startedAt) },
              { label: 'Fin',       value: formatTime(task.completedAt) },
              { label: 'Intentos',  value: String(task.attempts) },
            ].map(field => (
              <div key={field.label} className="flex flex-col gap-0.5">
                <span className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                  {field.label}
                </span>
                <span className="text-xs text-[var(--text-primary)] tabular-nums">{field.value}</span>
              </div>
            ))}
          </div>

          {/* Error block */}
          {task.lastError && (
            <div className="mb-3 p-3 rounded-lg bg-[var(--status-error-subtle)] border border-[var(--status-error)]/20 text-xs text-[var(--status-error)] whitespace-pre-wrap break-words">
              <strong className="text-[10px] font-bold uppercase tracking-wider block mb-1">
                Error registrado
              </strong>
              {task.lastError}
            </div>
          )}

          {/* Evidence panel */}
          <TaskOutputPanel task={task} selectedCase={selectedCase} />

          {/* Action buttons */}
          {(task.status === 'failed' || task.status === 'manual_required') && (
            <div className="flex flex-wrap gap-2 pt-3.5 mt-3.5 border-t border-[var(--border-subtle)]">
              {task.status === 'failed' && (
                <>
                  <Button variant="secondary" size="sm" onClick={() => retryTask(selectedCase.id, task.id)}>
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reintentar
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => skipTask(selectedCase.id, task.id)}>
                    <SkipForward className="w-3.5 h-3.5" />
                    Omitir
                  </Button>
                </>
              )}
              {task.status === 'manual_required' && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--status-warning)] bg-[var(--status-warning-subtle)] px-2.5 py-1 rounded border border-[var(--status-warning)]/20">
                  <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />
                  Requiere intervención manual
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── TASK GROUP ───────────────────────────────────────────────────────────────

interface TaskGroupProps {
  title: string;
  tasks: OnboardingTask[];
  selectedCase: any;
  dotColor?: string;
  defaultCollapsed?: boolean;
}

function TaskGroup({ title, tasks, selectedCase, dotColor, defaultCollapsed = false }: TaskGroupProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  if (tasks.length === 0) return null;

  return (
    <div>
      <button
        type="button"
        aria-expanded={!collapsed}
        aria-label={collapsed ? `Expandir grupo ${title}` : `Colapsar grupo ${title}`}
        className={cn(
          'flex items-center gap-2 py-2 w-full text-left',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary-glow)] rounded'
        )}
        onClick={() => setCollapsed(prev => !prev)}
      >
        {dotColor && (
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: dotColor }}
            aria-hidden="true"
          />
        )}
        <span
          className="text-[11px] font-bold uppercase tracking-wider"
          style={{ color: dotColor ?? 'var(--text-tertiary)' }}
        >
          {title}
        </span>
        <span className="text-[10px] font-semibold text-[var(--text-tertiary)] bg-[var(--bg-subtle)] px-1.5 py-0.5 rounded-full border border-[var(--border-subtle)]">
          {tasks.length}
        </span>
        <span className="ml-auto">
          {collapsed
            ? <ChevronDown className="w-3.5 h-3.5 text-[var(--text-tertiary)]" aria-hidden="true" />
            : <ChevronUp   className="w-3.5 h-3.5 text-[var(--text-tertiary)]" aria-hidden="true" />
          }
        </span>
      </button>

      {!collapsed && (
        <div className="space-y-2 pb-3">
          {tasks.map(t => (
            <TaskRow key={t.id} task={t} selectedCase={selectedCase} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── INTEGRATION HINT ─────────────────────────────────────────────────────────

function AutomationIntegrationHint() {
  return (
    <div
      className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] overflow-hidden"
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[var(--brand-primary)]" aria-hidden="true" />
          <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
            Integración futura
          </h3>
        </div>
        <p className="text-[11px] text-[var(--text-secondary)] mt-1 leading-relaxed">
          Adapters modelados para conectar con Google Workspace y procesos internos.
        </p>
      </div>

      {/* Adapter list */}
      <div className="divide-y divide-[var(--border-subtle)]">
        {INTEGRATION_ADAPTERS.map(item => (
          <div key={item.action} className="px-4 py-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="text-xs font-medium text-[var(--text-primary)] block leading-snug">
                {item.action}
              </span>
              <span className="text-[10px] font-mono text-[var(--text-tertiary)] mt-0.5 block break-all">
                {item.adapter}
              </span>
            </div>
            <span className="text-[10px] font-medium text-[var(--text-tertiary)] bg-[var(--bg-subtle)] border border-[var(--border-subtle)] px-1.5 py-0.5 rounded whitespace-nowrap flex-shrink-0 self-start">
              {item.category}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────

function EmptyAutomationState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[240px] text-center py-12 px-6">
      <Clock className="w-10 h-10 text-[var(--text-tertiary)] mb-3" aria-hidden="true" />
      <p className="text-sm font-bold text-[var(--text-primary)]">
        Todavía no hay tareas de activación
      </p>
      <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-xs">
        Las tareas se generan cuando el caso avanza hacia la activación operativa.
      </p>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export function TasksTab() {
  const selectedCase = useStore(state => state.getSelectedCase());

  if (!selectedCase) return null;

  const { tasks, status } = selectedCase;

  if (status !== 'active_pending_automation' && status !== 'operative' && tasks.length === 0) {
    return <EmptyAutomationState />;
  }

  const runningTasks   = tasks.filter(t => t.status === 'running');
  const attentionTasks = tasks.filter(t => t.status === 'failed' || t.status === 'manual_required');
  const pendingTasks   = tasks.filter(t => t.status === 'pending');
  const successTasks   = tasks.filter(t => t.status === 'success');
  const skippedTasks   = tasks.filter(t => t.status === 'skipped');

  const hasActiveWork = runningTasks.length > 0 || attentionTasks.length > 0 || pendingTasks.length > 0;

  return (
    <div className="space-y-4 pb-6">
      {/* Compact progress summary */}
      <AutomationProgressHeader tasks={tasks} />

      {/* Operative completion state */}
      {status === 'operative' && !hasActiveWork && (
        <div className="flex items-center gap-3 bg-[var(--status-success-subtle)] border border-[var(--status-success)]/25 rounded-xl px-4 py-3.5">
          <Sparkles className="w-5 h-5 text-[var(--status-success)] flex-shrink-0" aria-hidden="true" />
          <div>
            <p className="text-sm font-bold text-[var(--status-success)] leading-snug">
              Onboarding completado
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Todas las tareas se ejecutaron o fueron omitidas de forma segura.
            </p>
          </div>
        </div>
      )}

      {/* Task groups — priority order: running > attention > pending > completed > skipped */}
      <div>
        <TaskGroup
          title="En curso"
          tasks={runningTasks}
          selectedCase={selectedCase}
          dotColor="var(--status-info)"
        />
        <TaskGroup
          title="Requieren atención"
          tasks={attentionTasks}
          selectedCase={selectedCase}
          dotColor="var(--status-error)"
        />
        <TaskGroup
          title="Pendientes"
          tasks={pendingTasks}
          selectedCase={selectedCase}
        />
        <TaskGroup
          title="Completadas"
          tasks={successTasks}
          selectedCase={selectedCase}
          dotColor="var(--status-success)"
          defaultCollapsed={hasActiveWork}
        />
        <TaskGroup
          title="Omitidas"
          tasks={skippedTasks}
          selectedCase={selectedCase}
        />
      </div>

      {/* Integration readiness — secondary, below task list */}
      <AutomationIntegrationHint />
    </div>
  );
}
