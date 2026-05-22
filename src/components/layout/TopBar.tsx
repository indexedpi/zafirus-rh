import { useState, useEffect } from 'react';
import { RotateCcw, ClipboardList, Play, Square, FlaskConical } from 'lucide-react';
import { useStore } from '../../store';
import { ZafirusLogo } from '../ui/ZafirusLogo';

export function TopBar() {
  const { resetDemo, seedDemo, toggleAuditDrawer, isAutoRunning, startAutoRun, stopAutoRun } = useStore();
  const [isDemoMode, setIsDemoMode] = useState(window.location.hash.includes('demo'));

  // Live hash listener to sync presentation/demo toolbar
  useEffect(() => {
    const handleHashChange = () => {
      setIsDemoMode(window.location.hash.includes('demo'));
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleReset = () => {
    if (confirm('¿Reiniciar el demo? Se borrarán todos los casos.')) {
      resetDemo();
      seedDemo();
    }
  };

  return (
    <header className="h-14 bg-[var(--shell-bg)] border-b border-[var(--shell-active-border)] flex items-center justify-between px-4 lg:px-6 flex-shrink-0 z-30">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <ZafirusLogo size={30} glow />
          <span className="text-base font-semibold text-[var(--shell-text)] tracking-wide">Zafirus</span>
        </div>
        <span className="hidden lg:block border-l border-[var(--shell-active-border)] pl-3 text-[var(--shell-muted)] text-sm tracking-wider font-medium">Onboarding</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 lg:gap-2">
        {/* Primary Action: Auditoría (Always visible) */}
        <button
          onClick={toggleAuditDrawer}
          aria-label="Abrir auditoría de eventos"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-[var(--shell-text)]/70 hover:text-[var(--shell-text)] hover:bg-[var(--shell-active)] transition-[background-color,color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] min-h-[36px]"
        >
          <ClipboardList className="w-4 h-4" />
          <span className="hidden lg:inline">Auditoría</span>
        </button>

        {/* Gated Demo Toolbar: Only visible when URL hash contains 'demo' */}
        {isDemoMode && (
          <div className="flex items-center gap-1 lg:gap-2 border-l border-[var(--shell-active-border)] pl-2.5 ml-1 lg:ml-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-900/30 text-[10px] font-bold text-amber-300 border border-amber-500/20 uppercase tracking-wide">
              <FlaskConical className="w-3 h-3" />
              <span>Demo</span>
            </span>

            <button
              onClick={handleReset}
              aria-label="Reiniciar datos de demo"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-[var(--shell-text)]/70 hover:text-[var(--shell-text)] hover:bg-[var(--shell-active)] transition-[background-color,color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] min-h-[36px]"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden lg:inline">Reiniciar</span>
            </button>

            {isAutoRunning ? (
              <button
                onClick={stopAutoRun}
                aria-label="Detener demo automático"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-300 hover:text-red-200 hover:bg-red-900/30 border border-red-500/20 transition-[background-color,color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] min-h-[36px]"
              >
                <Square className="w-4 h-4" />
                <span className="hidden lg:inline">Detener</span>
              </button>
            ) : (
              <button
                onClick={startAutoRun}
                aria-label="Ejecutar demo automático"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-hover)] transition-[background-color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary-glow)] min-h-[36px]"
              >
                <Play className="w-4 h-4" />
                <span className="hidden lg:inline">Auto Demo</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
