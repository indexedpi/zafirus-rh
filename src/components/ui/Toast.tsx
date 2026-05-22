import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useStore, Toast as ToastType } from '../../store';

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors = {
  success: 'var(--status-success)',
  error: 'var(--status-error)',
  warning: 'var(--status-warning)',
  info: 'var(--status-info)',
};

function ToastItem({ toast }: { toast: ToastType }) {
  const removeToast = useStore(state => state.removeToast);
  const Icon = icons[toast.type];

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 bg-[var(--bg-elevated)] border rounded-xl px-4 py-3 animate-slide-in-up transition-[border-color,background-color] duration-150',
        'min-w-[300px] max-w-[400px]'
      )}
      style={{ borderColor: colors[toast.type], boxShadow: 'var(--shadow-lg)' }}
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: colors[toast.type] }} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--text-primary)]">{toast.title}</p>
        {toast.message && (
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-white/[0.05] transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useStore(state => state.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
