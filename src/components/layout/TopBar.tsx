import { useState, useEffect } from 'react';
import { RotateCcw, ClipboardList, Play, Square, FlaskConical } from 'lucide-react';
import { Button } from '../ui/Button';
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
    <header className="h-14 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] flex items-center justify-between px-4 lg:px-6 flex-shrink-0 z-30">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <ZafirusLogo size={30} glow />
          <span className="text-base font-semibold text-[var(--text-primary)] tracking-wide">Zafirus</span>
        </div>
        <span className="hidden lg:block border-l border-[var(--border-subtle)] pl-3 text-[var(--text-tertiary)] text-sm tracking-wider font-medium">Onboarding</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 lg:gap-2">
        {/* Primary Action: Auditoría (Always visible) */}
        <Button variant="ghost" size="sm" onClick={toggleAuditDrawer} aria-label="Abrir auditoría de eventos" className="min-h-[36px]">
          <ClipboardList className="w-4 h-4" />
          <span className="hidden lg:inline">Auditoría</span>
        </Button>

        {/* Gated Demo Toolbar: Only visible when URL hash contains 'demo' */}
        {isDemoMode && (
          <div className="flex items-center gap-1 lg:gap-2 border-l border-[var(--border-subtle)] pl-2.5 ml-1 lg:ml-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--status-warning-subtle)] text-[10px] font-bold text-[var(--status-warning)] border border-[var(--status-warning)]/15 uppercase tracking-wide">
              <FlaskConical className="w-3 h-3" />
              <span>Demo</span>
            </span>

            <Button variant="ghost" size="sm" onClick={handleReset} aria-label="Reiniciar datos de demo" className="min-h-[36px]">
              <RotateCcw className="w-4 h-4" />
              <span className="hidden lg:inline">Reiniciar</span>
            </Button>

            {isAutoRunning ? (
              <Button variant="danger" size="sm" onClick={stopAutoRun} aria-label="Detener demo automático" className="min-h-[36px]">
                <Square className="w-4 h-4" />
                <span className="hidden lg:inline">Detener</span>
              </Button>
            ) : (
              <Button variant="primary" size="sm" onClick={startAutoRun} aria-label="Ejecutar demo automático" className="min-h-[36px]">
                <Play className="w-4 h-4" />
                <span className="hidden lg:inline">Auto Demo</span>
              </Button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
