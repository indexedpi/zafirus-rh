import { useState } from 'react';
import { useStore } from '../../store';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { OverviewTab } from './tabs/OverviewTab';
import { DataTab } from './tabs/DataTab';
import { EmailTab } from './tabs/EmailTab';
import { TasksTab } from './tabs/TasksTab';
import { AuditTab } from './tabs/AuditTab';
import { CaseActions } from './CaseActions';
import { cn } from '../../utils/cn';
import {
  FileText,
  Mail,
  CheckSquare,
  Clock,
  Database,
  ChevronLeft,
  Calendar,
  MapPin,
  ShieldAlert,
  AlertTriangle
} from 'lucide-react';
import { COUNTRIES, TEAMS, CONTRACT_TYPES } from '../../types';

// Spanish navigation labels
const TABS = [
  { id: 'overview', label: 'Resumen', icon: FileText },
  { id: 'data', label: 'Datos', icon: Database },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'tasks', label: 'Tareas', icon: CheckSquare },
  { id: 'audit', label: 'Auditoría', icon: Clock },
];

export function CaseDetail() {
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

  const { employee, candidateData, status, correctionNote } = selectedCase;

  const runningTasks = selectedCase.tasks.filter(t => t.status === 'running').length;
  const failedTasks = selectedCase.tasks.filter(t => t.status === 'failed').length;

  const country = COUNTRIES.find(c => c.code === employee.countryId);
  const team = TEAMS.find(t => t.value === employee.team);
  const contractType = CONTRACT_TYPES.find(c => c.value === employee.contractType);
  const isConsolidated = candidateData?.consolidated === true;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[var(--bg-base)]">
      {/* Redesigned Control Header */}
      <div className="flex flex-col border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] flex-shrink-0">
        <div className="flex items-start gap-3 lg:gap-4 px-4 lg:px-6 py-4">
          {/* Back button for mobile viewports */}
          <button
            onClick={() => selectCase(null)}
            className="md:hidden inline-flex items-center justify-center gap-1 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg px-3 py-2 transition-[background-color,color,border-color] duration-150 min-h-[44px] min-w-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]"
            aria-label="Volver a la lista de casos"
          >
            <ChevronLeft className="w-4 h-4 flex-shrink-0" />
            <span>Volver</span>
          </button>

          <Avatar name={employee.name} lastName={employee.lastName} size="lg" />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-lg lg:text-[22px] font-bold leading-tight text-[var(--text-primary)] truncate">
                {employee.name} {employee.lastName}
              </h2>
              <Badge
                status={status}
                pulse={status === 'candidate_submitted' || status === 'active_pending_automation'}
              />
            </div>

            <div className="flex items-center gap-2.5 mt-1 text-xs text-[var(--text-secondary)] flex-wrap">
              <span>{employee.role}</span>
              <span className="text-[var(--text-tertiary)] font-light">·</span>
              <span className="uppercase font-mono">{team?.label || employee.team}</span>
              <span className="text-[var(--text-tertiary)] font-light">·</span>
              <span>{contractType?.label || employee.contractType}</span>
            </div>

            <div className="flex items-center gap-3 mt-2 text-[11px] text-[var(--text-tertiary)] flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{employee.cityId}, {country?.name || employee.countryId}</span>
              </span>
              <span className="text-[var(--text-tertiary)] font-light">·</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Inicio: {new Date(employee.startDate + 'T00:00:00').toLocaleDateString('es-AR', { dateStyle: 'medium' })}</span>
              </span>
              <span className="text-[var(--text-tertiary)] font-light">·</span>
              <span className="text-[var(--brand-primary)] font-bold uppercase tracking-wider">
                {status === 'draft' && 'Paso: Enviar formulario'}
                {status === 'candidate_invited' && 'Paso: Esperando candidato'}
                {status === 'candidate_submitted' && 'Paso: Iniciar revisión'}
                {status === 'hr_review' && (!isConsolidated ? 'Paso: Consolidar datos' : 'Paso: Aprobar onboarding')}
                {status === 'ready_to_activate' && 'Paso: Activar Workspace'}
                {status === 'active_pending_automation' && 'Paso: Tareas en curso'}
                {status === 'operative' && 'Paso: Colaborador Operativo'}
                {status === 'blocked' && 'Paso: Resolver bloqueo'}
                {status === 'cancelled' && 'Paso: Caso archivado'}
              </span>
            </div>
          </div>
        </div>

        {/* Block or Correction Warnings inside Header */}
        {status === 'blocked' && (
          <div className="px-4 lg:px-6 py-2 bg-[var(--status-error-subtle)] border-t border-b border-[var(--status-error)]/15 flex items-center gap-2.5 text-xs text-[var(--status-error)]">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span className="font-semibold">Caso bloqueado:</span>
            <span className="truncate">{selectedCase.blockReason || 'Sin motivo especificado'}</span>
          </div>
        )}

        {correctionNote && status === 'candidate_invited' && (
          <div className="px-4 lg:px-6 py-2 bg-[var(--status-warning-subtle)] border-t border-b border-[var(--status-warning)]/15 flex items-center gap-2.5 text-xs text-[var(--status-warning)]">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span className="font-semibold">Corrección solicitada:</span>
            <span className="truncate">{correctionNote}</span>
          </div>
        )}
      </div>

      {/* Tabs — scroll horizontal en mobile */}
      <div role="tablist" aria-label="Secciones del caso" className="flex gap-1 px-3 lg:px-6 py-2 border-b border-[var(--border-subtle)] overflow-x-auto bg-[var(--bg-surface)] scrollbar-hide flex-shrink-0">
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
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.02]'
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
