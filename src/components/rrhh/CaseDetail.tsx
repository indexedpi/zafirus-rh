import { useState } from 'react';
import { useStore } from '../../store';
import { OverviewTab } from './tabs/OverviewTab';
import { DataTab } from './tabs/DataTab';
import { EmailTab } from './tabs/EmailTab';
import { TasksTab } from './tabs/TasksTab';
import { AuditTab } from './tabs/AuditTab';
import { CaseActions } from './CaseActions';
import { cn } from '../../utils/cn';
import { FileText, Mail, CheckSquare, Clock, Database, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';

interface CaseDetailProps {
  showCandidatePanel?: boolean;
  onShowCandidatePanel?: () => void;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

// Spanish navigation labels
const TABS = [
  { id: 'overview', label: 'Resumen', icon: FileText },
  { id: 'data', label: 'Datos', icon: Database },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'tasks', label: 'Tareas', icon: CheckSquare },
  { id: 'audit', label: 'Auditoría', icon: Clock },
];

export function CaseDetail({ showCandidatePanel, onShowCandidatePanel, sidebarOpen, onToggleSidebar }: CaseDetailProps = {}) {
  const [activeTab, setActiveTab] = useState('overview');
  const selectedCase = useStore(state => state.getSelectedCase());
  const selectCase = useStore(state => state.selectCase);

  // Restrained clean empty state for no selected case in Spanish
  if (!selectedCase) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12">
        <div className="w-16 h-16 rounded-xl bg-[var(--bg-elevated)] flex items-center justify-center mb-4 border border-[var(--border-default)]" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <FileText className="w-8 h-8 text-[var(--text-tertiary)]" aria-hidden="true" />
        </div>
        <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1 uppercase tracking-wider">No hay un caso seleccionado</h3>
        <p className="text-xs text-[var(--text-secondary)] max-w-sm">
          Seleccioná un caso de la lista para revisar datos, estado de activación y tareas pendientes.
        </p>
      </div>
    );
  }

  const runningTasks = selectedCase.tasks.filter(t => t.status === 'running').length;
  const failedTasks = selectedCase.tasks.filter(t => t.status === 'failed').length;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[var(--bg-base)]">

      {/* Tab strip — back button left, tabs center-left, candidato switch right */}
      <div className="flex items-center gap-1 px-2 lg:px-4 py-2 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] flex-shrink-0">
        <button
          onClick={() => selectCase(null)}
          className="md:hidden flex-shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]"
          aria-label="Volver a la lista de casos"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
        </button>

        {!sidebarOpen && onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="hidden md:inline-flex flex-shrink-0 items-center justify-center w-9 h-9 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]"
            aria-label="Mostrar lista de casos"
            title="Mostrar lista"
          >
            <ChevronsRight className="w-4 h-4" aria-hidden="true" />
          </button>
        )}

        <div role="tablist" aria-label="Secciones del caso" className="flex gap-1 overflow-x-auto scrollbar-hide flex-1 min-w-0">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const hasBadge = tab.id === 'tasks' && (runningTasks > 0 || failedTasks > 0);

          return (
            <button
              key={tab.id}
              id={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`tabpanel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-1.5 lg:gap-2 px-3 py-2 rounded-lg text-xs lg:text-sm font-semibold transition-[background-color,color] duration-150 relative flex-shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]',
                activeTab === tab.id
                  ? 'bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
              )}
            >
              <Icon className="w-3.5 h-3.5 lg:w-4 lg:h-4" aria-hidden="true" />
              <span>{tab.label}</span>
              {hasBadge && (
                <span className={cn(
                  'ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold min-w-[18px] text-center border',
                  failedTasks > 0
                    ? 'bg-[var(--status-error-subtle)] text-[var(--status-error)] border-[var(--status-error)]/15'
                    : 'bg-[var(--status-info-subtle)] text-[var(--status-info)] border-[var(--status-info)]/15'
                )}>
                  {failedTasks > 0 ? failedTasks : runningTasks}
                </span>
              )}
            </button>
          );
        })}
        </div>

        {showCandidatePanel && onShowCandidatePanel && (
          <button
            onClick={onShowCandidatePanel}
            className="lg:hidden flex-shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand-primary)] bg-[var(--brand-primary-subtle)] px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity min-h-[36px]"
            aria-label="Ver panel de candidato"
          >
            <span>Candidato</span>
            <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={activeTab}
        className="flex-1 overflow-y-auto px-4 lg:px-6 py-4"
      >
        {activeTab === 'overview' && <OverviewTab onOpenAudit={() => setActiveTab('audit')} />}
        {activeTab === 'data' && <DataTab />}
        {activeTab === 'email' && <EmailTab />}
        {activeTab === 'tasks' && <TasksTab />}
        {activeTab === 'audit' && <AuditTab />}
      </div>

      {/* Actions */}
      <CaseActions />
    </div>
  );
}
