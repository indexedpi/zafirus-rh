import { cn } from '../../utils/cn';
import { CaseStatus, STATUS_CONFIG } from '../../types';

interface BadgeProps {
  status: CaseStatus;
  className?: string;
  pulse?: boolean;
}

export function Badge({ status, className, pulse }: BadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
        pulse && 'animate-pulse-border border-2',
        className
      )}
      style={{
        backgroundColor: config.bgColor,
        color: config.color,
        borderColor: pulse ? config.color : 'transparent',
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: config.color }}
      />
      {config.label}
    </span>
  );
}

interface TaskBadgeProps {
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped' | 'manual_required';
  className?: string;
}

export function TaskBadge({ status, className }: TaskBadgeProps) {
  const configs = {
    pending: { label: 'Pendiente', color: 'var(--text-tertiary)', bgColor: 'rgba(255,255,255,0.06)' },
    running: { label: 'Ejecutando', color: 'var(--status-info)', bgColor: 'var(--status-info-subtle)' },
    success: { label: 'Completado', color: 'var(--status-success)', bgColor: 'var(--status-success-subtle)' },
    failed: { label: 'Fallido', color: 'var(--status-error)', bgColor: 'var(--status-error-subtle)' },
    skipped: { label: 'Omitido', color: 'var(--text-tertiary)', bgColor: 'rgba(255,255,255,0.06)' },
    manual_required: { label: 'Manual', color: 'var(--status-warning)', bgColor: 'var(--status-warning-subtle)' },
  };

  const config = configs[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium',
        className
      )}
      style={{
        backgroundColor: config.bgColor,
        color: config.color,
      }}
    >
      {status === 'running' && (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      )}
      {config.label}
    </span>
  );
}
