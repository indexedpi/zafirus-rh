import { useEffect, useState, useRef } from 'react';
import { useStore } from './store';
import { TopBar } from './components/layout/TopBar';
import { AuditDrawer } from './components/layout/AuditDrawer';
import { CaseList } from './components/rrhh/CaseList';
import { CaseDetail } from './components/rrhh/CaseDetail';
import { CandidatePanel } from './components/candidate/CandidatePanel';
import { ToastContainer } from './components/ui/Toast';
import { PenTool, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from './utils/cn';

export default function App() {
  const { seedDemo, cases, isAutoRunning, getSelectedCase } = useStore();
  const [, forceUpdate] = useState(0);
  const [candidateToken, setCandidateToken] = useState<string | null>(null);
  const [mobilePanel, setMobilePanel] = useState<'rrhh' | 'candidato'>('rrhh');

  // Parse hash for candidate token and demo mode
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const match = hash.match(/candidate=([a-f0-9]+)/i);
      if (match) {
        setCandidateToken(match[1]);
      } else {
        setCandidateToken(null);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Seed demo data on first load
  useEffect(() => {
    if (cases.length === 0) {
      seedDemo();
    }
  }, []);

  // Force re-render frequently for real-time sync
  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate(n => n + 1);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const selectedCase = getSelectedCase();

  // Operative overlay
  const [showOperativeOverlay, setShowOperativeOverlay] = useState(false);
  const prevStatusRef = useRef<string | null>(null);

  useEffect(() => {
    const currentStatus = selectedCase?.status;
    if (prevStatusRef.current !== 'operative' && currentStatus === 'operative') {
      setShowOperativeOverlay(true);
      setTimeout(() => setShowOperativeOverlay(false), 3000);
    }
    prevStatusRef.current = currentStatus ?? null;
  }, [selectedCase?.status]);

  const candidateIsWriting = selectedCase?.status === 'candidate_invited' &&
    selectedCase.candidateData && selectedCase.candidateData.currentStep > 1 &&
    !selectedCase.candidateData.submittedAt;

  // Show split-screen ONLY if candidate token is active, or auto-running, or if hash contains "demo"
  const showSplitScreen = isAutoRunning || !!candidateToken || window.location.hash.includes('demo');

  return (
    <div className="h-screen flex flex-col bg-[var(--bg-base)] overflow-hidden">
      <TopBar />

      {/* Auto-run banner in professional Spanish */}
      {isAutoRunning && (
        <div className="bg-[var(--brand-primary)] text-white text-center py-1.5 text-sm font-medium flex items-center justify-center gap-2 flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          Demostración automática en curso — los paneles de control se sincronizan en vivo
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden relative">
        {/* Panel RRHH — Left Column */}
        <div className={cn(
          'flex-col border-r border-[var(--border-default)] flex-shrink-0 h-full overflow-hidden',
          // On mobile: flex if mobilePanel === 'rrhh', otherwise hidden
          mobilePanel === 'rrhh' ? 'flex w-full' : 'hidden',
          // On desktop: if split screen is enabled, it takes 1/2 width. Otherwise, it takes full width (w-full).
          showSplitScreen ? 'lg:flex lg:w-1/2' : 'lg:flex lg:w-full'
        )}>
          {/* Sub-header of the panel */}
          <div className="px-4 py-2 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] flex items-center justify-between flex-shrink-0 h-11">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[var(--brand-primary-subtle)] text-[11px] font-semibold text-[var(--brand-primary)] tracking-[0.06em] uppercase">
              Panel de RRHH
            </span>
            <div className="flex items-center gap-3">
              {candidateIsWriting && (
                <span className="inline-flex items-center gap-1.5 text-xs text-[var(--status-info)] animate-pulse">
                  <PenTool className="w-3.5 h-3.5" />
                  Candidato escribiendo…
                </span>
              )}
              {showSplitScreen && (
                <button
                  onClick={() => setMobilePanel('candidato')}
                  className="lg:hidden inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand-primary)] bg-[var(--brand-primary-subtle)] px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity min-h-[36px]"
                  aria-label="Ver panel de candidato"
                >
                  <span>Candidato</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
          {/* Inner layout: sidebar cases + detail */}
          <div className="flex-1 flex min-h-0 overflow-hidden">
            <div className={cn(
              "w-full md:w-64 lg:w-[260px] border-r border-[var(--border-subtle)] bg-[var(--bg-subtle)] flex-shrink-0 overflow-hidden flex flex-col",
              selectedCase ? "hidden md:flex" : "flex"
            )}>
              <CaseList />
            </div>
            <div className={cn(
              "flex-1 flex flex-col min-w-0 bg-[var(--bg-base)]",
              selectedCase ? "flex" : "hidden md:flex"
            )}>
              <CaseDetail />
            </div>
          </div>
        </div>

        {/* Panel Candidato — Right Column (only if split-screen is active, or if mobilePanel === 'candidato') */}
        <div className={cn(
          'flex-col bg-[var(--bg-subtle)] flex-shrink-0 h-full overflow-hidden',
          // Mobile: show if mobilePanel === 'candidato'
          (mobilePanel === 'candidato' && showSplitScreen) ? 'flex w-full' : 'hidden',
          // Desktop: only show if showSplitScreen is true
          showSplitScreen ? 'lg:flex lg:w-1/2' : 'lg:hidden'
        )}>
          {/* Sub-header of the panel */}
          <div className="px-4 py-2 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] flex items-center justify-between flex-shrink-0 h-11">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[var(--brand-primary-subtle)] text-[11px] font-semibold text-[var(--brand-primary)] tracking-[0.06em] uppercase">
              Formulario del Candidato
            </span>
            <button
              onClick={() => setMobilePanel('rrhh')}
              className="lg:hidden inline-flex items-center gap-1 text-xs font-semibold text-[var(--text-secondary)] bg-[var(--bg-elevated)] px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity min-h-[36px]"
              aria-label="Ver panel de RRHH"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>RRHH</span>
            </button>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto">
            <CandidatePanel token={candidateToken} />
          </div>
        </div>
      </div>

      <AuditDrawer />
      <ToastContainer />

      {showOperativeOverlay && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center animate-operative-overlay"
          style={{ background: 'var(--bg-overlay)', pointerEvents: 'none' }}
        >
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="36" stroke="var(--status-success)" strokeWidth="3" opacity="0.2"/>
            <circle cx="40" cy="40" r="36" stroke="var(--status-success)" strokeWidth="3"
              style={{ strokeDasharray: '226', strokeDashoffset: '226',
                       animation: 'checkDraw 0.6s ease-out 0.2s forwards' }}/>
            <path d="M24 40 L36 52 L56 30" stroke="var(--status-success)" strokeWidth="4"
              strokeLinecap="round" strokeLinejoin="round" className="animate-check-draw"/>
          </svg>
          <p className="text-2xl font-bold text-[var(--status-success)] mt-4">
            ¡Onboarding completado!
          </p>
          <p className="text-[var(--text-secondary)] mt-2">
            {selectedCase?.employee.name} {selectedCase?.employee.lastName} ya es parte del equipo
          </p>
        </div>
      )}
    </div>
  );
}
