import { useStore } from '../../../store';
import { Button } from '../../ui/Button';
import { TaskBadge } from '../../ui/Badge';
import { RotateCcw, SkipForward, CheckCircle, XCircle, Clock, Loader2, Sparkles } from 'lucide-react';
import { TASK_LABELS, TaskType } from '../../../types';
import { cn } from '../../../utils/cn';

function getTaskLabel(type: TaskType, metadata?: Record<string, unknown>): string {
  if (type === 'ANNOUNCE_IN_GROUPS' && metadata?.groupName) {
    return `Anunciar en ${metadata.groupName}`;
  }
  return TASK_LABELS[type];
}

export function TasksTab() {
  const { getSelectedCase, retryTask, skipTask } = useStore();
  const selectedCase = getSelectedCase();

  if (!selectedCase) return null;

  const { tasks, status } = selectedCase;

  if (status !== 'active_pending_automation' && status !== 'operative' && tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-12">
        <Clock className="w-12 h-12 text-[var(--text-tertiary)] mb-3" />
        <p className="text-[var(--text-secondary)]">Sin tareas automáticas</p>
        <p className="text-xs text-[var(--text-tertiary)] mt-1">
          Las tareas se crearán al activar el caso
        </p>
      </div>
    );
  }

  const getTaskIcon = (taskStatus: string) => {
    switch (taskStatus) {
      case 'success': return <CheckCircle className="w-5 h-5 text-[var(--status-success)]" />;
      case 'failed': return <XCircle className="w-5 h-5 text-[var(--status-error)]" />;
      case 'running': return <Loader2 className="w-5 h-5 text-[var(--status-info)] animate-spin" />;
      case 'skipped': return <SkipForward className="w-5 h-5 text-[var(--text-tertiary)]" />;
      default: return <Clock className="w-5 h-5 text-[var(--text-tertiary)]" />;
    }
  };

  // Group tasks by phase for visual clarity
  const sequentialTypes: TaskType[] = ['CREATE_GOOGLE_USER', 'ADD_GOOGLE_GROUPS', 'CONFIGURE_GMAIL_SIGNATURE', 'SEND_WELCOME_EMAIL'];
  const seqTasks = tasks.filter(t => sequentialTypes.includes(t.type));
  const announceTasks = tasks.filter(t => t.type === 'ANNOUNCE_IN_GROUPS');
  const parallelTasks = tasks.filter(t => t.type === 'POST_INTERNAL_ANNOUNCEMENT' || t.type === 'REQUEST_DEVICE');
  const conditionalTasks = tasks.filter(t => t.type === 'NOTIFY_ADMINISTRATION');

  const completedCount = tasks.filter(t => t.status === 'success' || t.status === 'skipped').length;

  const renderTask = (task: typeof tasks[0]) => (
    <div
      key={task.id}
      className={cn(
        'bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)] p-5',
        task.status === 'running' && 'border-[var(--status-info)] shadow-[0_0_0_1px_var(--status-info-subtle)]',
        task.status === 'success' && status !== 'operative' && 'opacity-80',
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{getTaskIcon(task.status)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-[var(--text-primary)]">
              {getTaskLabel(task.type, task.metadata)}
            </span>
            <TaskBadge status={task.status} />
          </div>
          <p className="text-xs text-[var(--text-tertiary)] mt-1">
            {task.owner === 'system' ? 'Automático' : task.owner === 'it' ? 'IT' : task.owner === 'admin' ? 'Administración' : task.owner}
            {task.attempts > 0 && ` · ${task.attempts} intento(s)`}
            {task.completedAt && ` · ${new Date(task.completedAt).toLocaleTimeString('es-AR')}`}
          </p>
          {task.lastError && (
            <p className="text-xs text-[var(--status-error)] mt-2 bg-[var(--status-error-subtle)] px-2 py-1 rounded">
              {task.lastError}
            </p>
          )}
        </div>
        {task.status === 'failed' && (
          <div className="flex gap-2 flex-shrink-0">
            <Button variant="secondary" size="sm" onClick={() => retryTask(selectedCase.id, task.id)}>
              <RotateCcw className="w-3.5 h-3.5" /> Reintentar
            </Button>
            <Button variant="ghost" size="sm" onClick={() => skipTask(selectedCase.id, task.id)}>
              <SkipForward className="w-3.5 h-3.5" /> Omitir
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Operative success banner */}
      {status === 'operative' && tasks.length > 0 && (
        <div className="animate-task-success bg-[var(--status-success-subtle)] border border-[var(--status-success)] rounded-xl p-5 text-center mb-6">
          <Sparkles className="w-8 h-8 text-[var(--status-success)] mx-auto mb-2" />
          <p className="text-base font-semibold text-[var(--status-success)]">
            Onboarding completado
          </p>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Todas las automatizaciones se ejecutaron exitosamente.
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {tasks.filter(t => t.status === 'success').map(t => (
              <span key={t.id} className="text-xs px-2 py-0.5 rounded-full bg-[var(--status-success-subtle)] text-[var(--status-success)] border border-[var(--status-success)]/30">
                ✓ {getTaskLabel(t.type, t.metadata)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Phase 1: Sequential */}
      {seqTasks.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">
            Fase 1 — Secuencial (cada una espera la anterior)
          </h4>
          <div className="space-y-2">{seqTasks.map(renderTask)}</div>
        </div>
      )}

      {/* Phase 2: Announce in groups (fan-out) */}
      {announceTasks.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">
            Fase 2 — Anuncio en grupos ({announceTasks.length} grupos)
          </h4>
          <div className="space-y-2">{announceTasks.map(renderTask)}</div>
        </div>
      )}

      {/* Phase 3: Parallel */}
      {parallelTasks.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">
            Fase 2 — En paralelo
          </h4>
          <div className="space-y-2">{parallelTasks.map(renderTask)}</div>
        </div>
      )}

      {/* Phase 4: Conditional — only after candidate data consolidated */}
      {conditionalTasks.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">
            Condicional — Al confirmar datos del candidato
          </h4>
          <div className="space-y-2">{conditionalTasks.map(renderTask)}</div>
        </div>
      )}

      {/* Progress bar */}
      <div className="pt-4 border-t border-[var(--border-subtle)]">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-[var(--text-secondary)]">Progreso</span>
          <span className="text-[var(--text-primary)] font-medium">
            {completedCount} / {tasks.length} completadas
          </span>
        </div>
        <div className="h-2 bg-[var(--bg-surface)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--status-success)] transition-[width] duration-500 rounded-full"
            style={{ width: `${tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0}%` }}
          />
        </div>
      </div>
    </div>
  );
}
