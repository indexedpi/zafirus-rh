import React, { useState } from 'react';
import { useStore } from '../../../store';
import { Button } from '../../ui/Button';
import { RotateCcw, SkipForward, CheckCircle2, XCircle, Clock, Loader2, Sparkles, Terminal, ChevronDown, ChevronUp, ShieldAlert } from 'lucide-react';
import { TaskType, OnboardingTask } from '../../../types';
import { cn } from '../../../utils/cn';

const TASK_SPANISH_LABELS: Record<string, string> = {
  CREATE_GOOGLE_USER: 'Crear usuario de Google Workspace',
  ADD_GOOGLE_GROUPS: 'Agregar a grupos internos',
  CONFIGURE_GMAIL_SIGNATURE: 'Configurar firma de Gmail',
  SEND_WELCOME_EMAIL: 'Enviar email de bienvenida',
  ANNOUNCE_IN_GROUPS: 'Anunciar en grupos internos',
  POST_INTERNAL_ANNOUNCEMENT: 'Publicar anuncio interno',
  REQUEST_DEVICE: 'Solicitar equipo',
  NOTIFY_ADMINISTRATION: 'Notificar a Administración'
};

function getTaskLabel(type: TaskType, metadata?: Record<string, unknown>): string {
  const baseLabel = TASK_SPANISH_LABELS[type] || type;
  if (type === 'ANNOUNCE_IN_GROUPS' && metadata?.groupName) {
    return `Anunciar en ${metadata.groupName}`;
  }
  return baseLabel;
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'pending': return 'Pendiente';
    case 'running': return 'En curso';
    case 'success': return 'Completada';
    case 'failed': return 'Fallida';
    case 'skipped': return 'Omitida';
    case 'manual_required': return 'Requiere intervención';
    default: return status;
  }
}

function getTaskIcon(taskStatus: string) {
  switch (taskStatus) {
    case 'success': return <CheckCircle2 className="w-4 h-4 text-[var(--status-success)]" />;
    case 'failed': return <XCircle className="w-4 h-4 text-[var(--status-error)]" />;
    case 'manual_required': return <ShieldAlert className="w-4 h-4 text-[var(--status-warning)]" />;
    case 'running': return <Loader2 className="w-4 h-4 text-[var(--status-info)] animate-spin" />;
    case 'skipped': return <SkipForward className="w-4 h-4 text-[var(--text-tertiary)]" />;
    default: return <Clock className="w-4 h-4 text-[var(--text-tertiary)]" />;
  }
}

// ─── LOCAL SUBCOMPONENTS ─────────────────────────────────────────────

function AutomationProgressHeader({ tasks }: { tasks: OnboardingTask[] }) {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'success' || t.status === 'skipped').length;
  const running = tasks.filter(t => t.status === 'running').length;
  const attention = tasks.filter(t => t.status === 'failed' || t.status === 'manual_required').length;
  const pending = tasks.filter(t => t.status === 'pending').length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-[var(--text-primary)]">Activación operativa</h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Seguimiento de tareas automáticas y manuales necesarias para dejar el caso operativo.</p>
        </div>
        <div className="text-xl font-bold text-[var(--brand-primary)]">
          {percent}%
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-[var(--bg-elevated)] rounded-full overflow-hidden mb-4 border border-[var(--border-subtle)]">
        <div
          className="h-full bg-[var(--brand-primary)] rounded-full transition-[width] duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
        <div className="flex flex-col min-w-0">
          <span className="text-[var(--text-tertiary)] truncate">Total de tareas</span>
          <span className="font-medium text-[var(--text-primary)]">{total}</span>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[var(--text-tertiary)] truncate">Completadas</span>
          <span className="font-medium text-[var(--status-success)]">{completed}</span>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[var(--text-tertiary)] truncate">En curso</span>
          <span className="font-medium text-[var(--status-info)]">{running}</span>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[var(--text-tertiary)] truncate">Requieren atención</span>
          <span className={cn("font-medium", attention > 0 ? "text-[var(--status-error)]" : "text-[var(--text-primary)]")}>{attention}</span>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[var(--text-tertiary)] truncate">Pendientes</span>
          <span className="font-medium text-[var(--text-primary)]">{pending}</span>
        </div>
      </div>
    </div>
  );
}

function TaskOutputPanel({ task, selectedCase }: { task: OnboardingTask, selectedCase: any }) {
  const getOutput = () => {
    switch (task.type) {
      case 'CREATE_GOOGLE_USER':
        if (task.status === 'pending') return 'Preparada para crear la cuenta corporativa.';
        if (task.status === 'running') return 'Creando usuario en Google Workspace...';
        if (task.status === 'failed') return 'No se pudo crear el usuario.\nRevisá el error y reintentá la tarea.';
        if (task.status === 'success') {
          const email = selectedCase.employee.corporateEmail || selectedCase.suggestedEmail || 'colaborador@zafirus.tech';
          return `Usuario corporativo creado.\nEmail: ${email}`;
        }
        break;
      case 'ADD_GOOGLE_GROUPS':
        if (task.status === 'success') return 'Grupos asignados correctamente.';
        if (task.status === 'failed') return 'No se pudo completar la asignación a grupos.';
        break;
      case 'CONFIGURE_GMAIL_SIGNATURE':
        if (task.status === 'success') return 'Firma corporativa preparada con datos del colaborador.';
        break;
      case 'SEND_WELCOME_EMAIL':
        if (task.status === 'pending' || task.status === 'running') {
          const approved = selectedCase.emailTemplate?.approvedAt != null;
          return approved ? 'Plantilla aprobada.' : 'Plantilla pendiente de aprobación.';
        }
        if (task.status === 'success') return 'Email de bienvenida preparado para envío.';
        break;
      case 'REQUEST_DEVICE':
        return 'Solicitud de equipo enviada a Administración.';
      case 'NOTIFY_ADMINISTRATION':
        return 'Administración notificada sobre el alta.';
      default:
        break;
    }

    // Default fallback
    if (task.status === 'pending') return 'Esperando ejecución...';
    if (task.status === 'running') return 'Ejecutando proceso...';
    if (task.status === 'success') return 'Operación completada.';
    if (task.status === 'failed') return 'Operación fallida.';
    if (task.status === 'skipped') return 'Operación omitida intencionalmente.';
    return 'Sin registro todavía.';
  };

  return (
    <div className="bg-[#0f172a] rounded-md p-3 border border-slate-700 font-mono text-[11px] text-slate-300 leading-relaxed overflow-x-auto mt-3">
      <div className="flex items-center gap-1.5 mb-2 text-slate-500 uppercase tracking-wider text-[9px] font-bold">
        <Terminal className="w-3 h-3" /> Vista de ejecución
      </div>
      <div className="whitespace-pre-wrap break-words">{getOutput()}</div>
    </div>
  );
}

function TaskRow({ task, selectedCase }: { task: OnboardingTask, selectedCase: any }) {
  const { retryTask, skipTask } = useStore();

  // Auto-expand if failed or running or manual
  const [expanded, setExpanded] = useState(task.status === 'failed' || task.status === 'running' || task.status === 'manual_required');

  const ownerLabel = task.owner === 'system' ? 'Automático' :
                     task.owner === 'it' ? 'IT' :
                     task.owner === 'admin' ? 'Administración' : task.owner;

  const formatDate = (ts: number | null) => ts ? new Date(ts).toLocaleTimeString('es-AR') : '—';

  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg overflow-hidden transition-colors">
      {/* Row Header */}
      <div
        className={cn(
          "flex items-start sm:items-center justify-between p-3.5 cursor-pointer hover:bg-[var(--bg-surface)]",
          task.status === 'failed' && "bg-[var(--status-error-subtle)]/30"
        )}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex-shrink-0 mt-0.5 sm:mt-0">{getTaskIcon(task.status)}</div>
            <span className="text-sm font-medium text-[var(--text-primary)] truncate">
              {getTaskLabel(task.type, task.metadata)}
            </span>
          </div>
          <div className="flex items-center gap-2 pl-6 sm:pl-0 flex-wrap">
            <span className={cn(
              "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded flex-shrink-0",
              task.status === 'success' ? 'bg-[var(--status-success-subtle)] text-[var(--status-success)] border border-[var(--status-success)]/20' :
              task.status === 'failed' || task.status === 'manual_required' ? 'bg-[var(--status-error-subtle)] text-[var(--status-error)] border border-[var(--status-error)]/20' :
              task.status === 'running' ? 'bg-[var(--status-info-subtle)] text-[var(--status-info)] border border-[var(--status-info)]/20' :
              'bg-[var(--bg-base)] text-[var(--text-secondary)] border border-[var(--border-default)]'
            )}>
              {getStatusLabel(task.status)}
            </span>
            <span className="text-xs text-[var(--text-tertiary)] flex-shrink-0">
              {ownerLabel}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
          {expanded ? <ChevronUp className="w-4 h-4 text-[var(--text-tertiary)]" /> : <ChevronDown className="w-4 h-4 text-[var(--text-tertiary)]" />}
        </div>
      </div>

      {/* Expanded Body */}
      {expanded && (
        <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-base)]">

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-[var(--text-tertiary)] uppercase tracking-wider text-[10px] font-semibold">Inicio</span>
              <span className="text-[var(--text-primary)] truncate">{formatDate(task.startedAt)}</span>
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-[var(--text-tertiary)] uppercase tracking-wider text-[10px] font-semibold">Finalización</span>
              <span className="text-[var(--text-primary)] truncate">{formatDate(task.completedAt)}</span>
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-[var(--text-tertiary)] uppercase tracking-wider text-[10px] font-semibold">Intentos</span>
              <span className="text-[var(--text-primary)] truncate">{task.attempts}</span>
            </div>
          </div>

          {task.lastError && (
            <div className="mt-4 p-3 rounded bg-[var(--status-error-subtle)] border border-[var(--status-error)]/20 text-xs text-[var(--status-error)] whitespace-pre-wrap break-words">
              <strong className="font-bold uppercase tracking-wider text-[10px]">Error registrado:</strong><br />
              {task.lastError}
            </div>
          )}

          <TaskOutputPanel task={task} selectedCase={selectedCase} />

          {/* Action Buttons */}
          {(task.status === 'failed' || task.status === 'manual_required') && (
            <div className="flex flex-wrap gap-2 pt-4 mt-4 border-t border-[var(--border-subtle)]">
              {task.status === 'failed' && (
                <>
                  <Button variant="secondary" size="sm" onClick={() => retryTask(selectedCase.id, task.id)}>
                    <RotateCcw className="w-3.5 h-3.5" /> Reintentar
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => skipTask(selectedCase.id, task.id)}>
                    <SkipForward className="w-3.5 h-3.5" /> Omitir
                  </Button>
                </>
              )}
              {task.status === 'manual_required' && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--status-warning)] bg-[var(--status-warning-subtle)] px-2.5 py-1 rounded border border-[var(--status-warning)]/20">
                  <ShieldAlert className="w-3.5 h-3.5" /> Requiere intervención manual
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TaskGroup({ title, tasks, selectedCase, colorClass }: { title: string, tasks: OnboardingTask[], selectedCase: any, colorClass?: string }) {
  if (tasks.length === 0) return null;
  return (
    <div className="mb-6 last:mb-0">
      <h3 className={cn("text-xs font-bold uppercase tracking-wider mb-3", colorClass || "text-[var(--text-tertiary)]")}>
        {title} ({tasks.length})
      </h3>
      <div className="space-y-2">
        {tasks.map(t => <TaskRow key={t.id} task={t} selectedCase={selectedCase} />)}
      </div>
    </div>
  );
}

function AutomationIntegrationHint() {
  return (
    <div className="mt-8 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)] p-5">
      <h3 className="text-sm font-bold text-[var(--text-primary)] mb-2">Preparado para integración real</h3>
      <p className="text-xs text-[var(--text-secondary)] mb-4">
        Estas tareas están modeladas para conectarse luego con Google Workspace, Gmail y procesos internos mediante un backend seguro.
      </p>

      <div className="space-y-2 text-xs font-mono text-[var(--text-secondary)] bg-[var(--bg-base)] p-3 rounded border border-[var(--border-default)]">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 border-b border-[var(--border-subtle)] pb-2">
          <span className="font-semibold text-[var(--text-primary)]">Crear usuario</span>
          <span className="text-[var(--text-tertiary)] break-words text-left sm:text-right">Admin SDK Directory: users.insert</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 border-b border-[var(--border-subtle)] pb-2 pt-1">
          <span className="font-semibold text-[var(--text-primary)]">Agregar a grupos</span>
          <span className="text-[var(--text-tertiary)] break-words text-left sm:text-right">Admin SDK Directory: members.insert</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 border-b border-[var(--border-subtle)] pb-2 pt-1">
          <span className="font-semibold text-[var(--text-primary)]">Configurar firma</span>
          <span className="text-[var(--text-tertiary)] break-words text-left sm:text-right">Gmail / Workspace settings adapter</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 border-b border-[var(--border-subtle)] pb-2 pt-1">
          <span className="font-semibold text-[var(--text-primary)]">Enviar bienvenida</span>
          <span className="text-[var(--text-tertiary)] break-words text-left sm:text-right">Gmail API / SMTP service</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 pt-1">
          <span className="font-semibold text-[var(--text-primary)]">Solicitar equipo</span>
          <span className="text-[var(--text-tertiary)] break-words text-left sm:text-right">Integración interna o notificación a Administración</span>
        </div>
      </div>
    </div>
  );
}

function EmptyAutomationState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-12 px-6 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-default)]">
      <Clock className="w-10 h-10 text-[var(--text-tertiary)] mb-3" />
      <p className="text-sm font-bold text-[var(--text-primary)]">Todavía no hay tareas de activación</p>
      <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-sm">
        Las tareas se generan cuando el caso avanza hacia la activación operativa.
      </p>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────

export function TasksTab() {
  const { getSelectedCase } = useStore();
  const selectedCase = getSelectedCase();

  if (!selectedCase) return null;

  const { tasks, status } = selectedCase;

  if (status !== 'active_pending_automation' && status !== 'operative' && tasks.length === 0) {
    return <EmptyAutomationState />;
  }

  const runningTasks = tasks.filter(t => t.status === 'running');
  const attentionTasks = tasks.filter(t => t.status === 'failed' || t.status === 'manual_required');
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const successTasks = tasks.filter(t => t.status === 'success');
  const skippedTasks = tasks.filter(t => t.status === 'skipped');

  return (
    <div className="space-y-6">
      <AutomationProgressHeader tasks={tasks} />

      {status === 'operative' && attentionTasks.length === 0 && runningTasks.length === 0 && pendingTasks.length === 0 && (
        <div className="bg-[var(--status-success-subtle)] border border-[var(--status-success)]/30 rounded-xl p-4 text-center">
          <Sparkles className="w-6 h-6 text-[var(--status-success)] mx-auto mb-2" />
          <p className="text-sm font-bold text-[var(--status-success)]">Onboarding completado</p>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">Todas las tareas se ejecutaron correctamente o fueron omitidas de forma segura.</p>
        </div>
      )}

      <div>
        <TaskGroup title="En curso" tasks={runningTasks} selectedCase={selectedCase} colorClass="text-[var(--status-info)]" />
        <TaskGroup title="Requieren atención" tasks={attentionTasks} selectedCase={selectedCase} colorClass="text-[var(--status-error)]" />
        <TaskGroup title="Pendientes" tasks={pendingTasks} selectedCase={selectedCase} />
        <TaskGroup title="Completadas" tasks={successTasks} selectedCase={selectedCase} />
        <TaskGroup title="Omitidas" tasks={skippedTasks} selectedCase={selectedCase} />
      </div>

      <AutomationIntegrationHint />
    </div>
  );
}
