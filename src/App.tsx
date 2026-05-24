import { useEffect, useState, useRef } from 'react';
import { useStore } from './store';
import { loadDemoCases, saveDemoCases, subscribeDemoCases, clearDemoCases } from './lib/demoPersistence';
import { TopBar } from './components/layout/TopBar';
import { AuditDrawer } from './components/layout/AuditDrawer';
import { CaseList } from './components/rrhh/CaseList';
import { CaseDetail } from './components/rrhh/CaseDetail';
import { CandidatePanel } from './components/candidate/CandidatePanel';
import { ToastContainer } from './components/ui/Toast';
import { cn } from './utils/cn';

export default function App() {
  const { seedDemo, isAutoRunning, getSelectedCase, hydrateCases } = useStore();
  const [candidateToken, setCandidateToken] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Parse hash for candidate token and demo mode — track both as state so
  // navigating to /#demo without a candidate token still triggers a re-render.
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const match = hash.match(/candidate=([a-f0-9]+)/i);
      setCandidateToken(match ? match[1] : null);
      setIsDemoMode(hash.includes('demo'));
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Boot: Supabase and seeding only in #demo mode.
  // In normal mode, clear any leftover demo data so the app starts fresh.
  useEffect(() => {
    const isDemo = window.location.hash.includes('demo');
    if (!isDemo) {
      clearDemoCases();
      return;
    }
    let cancelled = false;
    loadDemoCases().then((remoteCases) => {
      if (cancelled) return;
      if (remoteCases && remoteCases.length > 0) {
        hydrateCases(remoteCases);
      } else if (useStore.getState().cases.length === 0) {
        seedDemo();
      }
    });
    return () => { cancelled = true; };
  }, []);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isApplyingRemoteRef = useRef(false);

  // Debounced save on store changes — only in #demo mode
  useEffect(() => {
    const unsub = useStore.subscribe((state) => {
      if (!window.location.hash.includes('demo')) return;
      if (isApplyingRemoteRef.current) return;
      const { cases } = state;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        saveDemoCases(cases);
      }, 600);
    });
    return () => {
      unsub();
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  // Supabase Realtime subscription — only in #demo mode
  useEffect(() => {
    if (!isDemoMode) return;
    const unsub = subscribeDemoCases((remoteCases) => {
      isApplyingRemoteRef.current = true;
      hydrateCases(remoteCases);
      setTimeout(() => { isApplyingRemoteRef.current = false; }, 100);
    });
    return unsub;
  }, [hydrateCases, isDemoMode]);

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

  // Show split-screen ONLY if candidate token is active, or auto-running, or if hash contains "demo"
  const showSplitScreen = isAutoRunning || !!candidateToken || isDemoMode;
  const isCandidateOnlyRoute = !!candidateToken && !isDemoMode;

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

      <div className={cn(
        'relative flex min-h-0 w-full flex-1 flex-col overflow-hidden',
        showSplitScreen && 'min-[1180px]:grid min-[1180px]:grid-cols-[minmax(0,1fr)_clamp(360px,30vw,460px)] min-[1180px]:grid-rows-[minmax(0,1fr)]'
      )}>
        {/* Panel RRHH */}
        <div className={cn(
          'flex flex-col border-b border-[var(--border-default)] min-h-0 overflow-y-auto overflow-x-hidden min-w-0',
          isCandidateOnlyRoute
            ? 'hidden min-[1180px]:flex min-[1180px]:border-b-0 min-[1180px]:border-r'
            : showSplitScreen
              ? 'w-full min-[1180px]:h-full min-[1180px]:border-b-0 min-[1180px]:border-r'
              : 'w-full flex-1 border-b-0'
        )}>
          {/* Inner layout: sidebar cases + detail */}
          <div className="flex-1 flex min-h-0 overflow-hidden">
            <div className={cn(
              "border-r border-[var(--border-subtle)] bg-[var(--bg-subtle)] flex-shrink-0 overflow-hidden flex flex-col",
              selectedCase ? "hidden" : "flex w-full",
              !selectedCase || sidebarOpen ? "md:flex md:w-64 lg:w-[260px]" : "md:hidden"
            )}>
              <CaseList onCollapse={() => setSidebarOpen(false)} />
            </div>
            <div className={cn(
              "flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden bg-[var(--bg-base)]",
              selectedCase ? "flex" : "hidden md:flex"
            )}>
              <CaseDetail
                showCandidatePanel={false}
                sidebarOpen={sidebarOpen}
                onToggleSidebar={() => setSidebarOpen(o => !o)}
              />
            </div>
          </div>
        </div>

        {/* Panel Candidato */}
        <div className={cn(
          'flex flex-col bg-[var(--bg-subtle)] min-h-0 overflow-y-auto overflow-x-hidden min-w-0',
          showSplitScreen ? 'w-full min-[1180px]:h-full min-[1180px]:w-auto' : 'hidden'
        )}>
          {/* Sub-header of the panel */}
          <div className="flex h-[57px] flex-shrink-0 items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[var(--brand-primary-subtle)] text-[11px] font-semibold text-[var(--brand-primary)] tracking-[0.06em] uppercase">
              Formulario del Candidato
            </span>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
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
