import { Plus, Users, Lock, Clock, CheckCircle, AlertTriangle, FileText, Globe, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../../store';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { NewCaseModal } from './NewCaseModal';
import { cn } from '../../utils/cn';
import { COUNTRIES, TEAMS } from '../../types';

export function CaseList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { cases, selectedCaseId, selectCase } = useStore();

  // B3. Local priority sorting based on operational urgency
  const getCasePriority = (status: string) => {
    switch (status) {
      case 'blocked': return 1;
      case 'candidate_submitted': return 2;
      case 'hr_review': return 3;
      case 'ready_to_activate': return 4;
      case 'active_pending_automation': return 5;
      case 'candidate_invited': return 6;
      case 'draft': return 7;
      case 'operative': return 8;
      case 'cancelled': return 9;
      default: return 10;
    }
  };

  // Spanish operational action hints
  const getNextCaseAction = (c: any) => {
    switch (c.status) {
      case 'draft': return 'Enviar formulario';
      case 'candidate_invited': return 'Esperando candidato';
      case 'candidate_submitted': return 'Revisar datos';
      case 'hr_review':
        return c.candidateData?.consolidated ? 'Aprobar caso' : 'Consolidar datos';
      case 'ready_to_activate': return 'Listo para activar';
      case 'active_pending_automation': return 'Automatización en curso';
      case 'operative': return 'Operativo';
      case 'blocked': return `Bloqueado: ${c.blockReason || 'Sin motivo especificado'}`;
      case 'cancelled': return 'Cancelado';
      default: return 'Sin acciones';
    }
  };

  const getCaseStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Borrador';
      case 'candidate_invited': return 'Invitado';
      case 'candidate_submitted': return 'Enviado';
      case 'hr_review': return 'En revisión';
      case 'ready_to_activate': return 'Listo';
      case 'active_pending_automation': return 'Procesando';
      case 'operative': return 'Operativo';
      case 'blocked': return 'Bloqueado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getCaseStatusTone = (status: string) => {
    switch (status) {
      case 'blocked': return { bg: 'bg-[var(--status-error-subtle)]', text: 'text-[var(--status-error)]', border: 'border-[var(--status-error)]/20' };
      case 'candidate_submitted': return { bg: 'bg-[var(--status-info-subtle)]', text: 'text-[var(--status-info)]', border: 'border-[var(--status-info)]/20' };
      case 'hr_review': return { bg: 'bg-[var(--status-warning-subtle)]', text: 'text-[var(--status-warning)]', border: 'border-[var(--status-warning)]/20' };
      case 'ready_to_activate': return { bg: 'bg-[var(--status-info-subtle)]', text: 'text-[var(--status-info)]', border: 'border-[var(--status-info)]/20' };
      case 'active_pending_automation': return { bg: 'bg-[var(--status-warning-subtle)] text-amber-400', text: 'text-[var(--status-warning)]', border: 'border-[var(--status-warning)]/20' };
      case 'operative': return { bg: 'bg-[var(--status-success-subtle)]', text: 'text-[var(--status-success)]', border: 'border-[var(--status-success)]/20' };
      default: return { bg: 'bg-[var(--bg-elevated)]', text: 'text-[var(--text-secondary)]', border: 'border-[var(--border-default)]' };
    }
  };

  const getCaseIcon = (status: string) => {
    switch (status) {
      case 'blocked': return <Lock className="w-3.5 h-3.5 text-[var(--status-error)]" />;
      case 'candidate_submitted': return <ArrowRight className="w-3.5 h-3.5 text-[var(--status-info)]" />;
      case 'hr_review': return <AlertTriangle className="w-3.5 h-3.5 text-[var(--status-warning)]" />;
      case 'ready_to_activate': return <CheckCircle className="w-3.5 h-3.5 text-[var(--status-info)]" />;
      case 'active_pending_automation': return <Clock className="w-3.5 h-3.5 text-[var(--status-warning)]" />;
      case 'operative': return <CheckCircle className="w-3.5 h-3.5 text-[var(--status-success)]" />;
      default: return <FileText className="w-3.5 h-3.5 text-[var(--text-secondary)]" />;
    }
  };

  const sortedCases = [...cases].sort((a, b) => {
    const pA = getCasePriority(a.status);
    const pB = getCasePriority(b.status);
    if (pA !== pB) return pA - pB;
    return b.updatedAt - a.updatedAt;
  });

  return (
    <div className="flex flex-col h-full bg-[var(--bg-subtle)] border-r border-[var(--border-subtle)]">
      <div className="flex items-center justify-between px-3 py-3 border-b border-[var(--border-subtle)] flex-shrink-0 bg-[var(--bg-surface)]">
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4 text-[var(--text-tertiary)]" />
          <span className="text-sm font-semibold text-[var(--text-primary)]">Casos</span>
          <span className="text-xs font-medium text-[var(--text-tertiary)]">({cases.length})</span>
        </div>
        <Button size="sm" onClick={() => setIsModalOpen(true)} className="min-h-[32px] px-2.5 text-xs" aria-label="Create new onboarding case">
          <Plus className="w-3.5 h-3.5" />
          <span>Nuevo</span>
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-[var(--border-subtle)] scrollbar-hide">
        {sortedCases.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
            <div className="w-16 h-16 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center mb-4 border border-[var(--border-subtle)]">
              <Users className="w-8 h-8 text-[var(--text-tertiary)]" />
            </div>
            <p className="text-sm font-semibold text-[var(--text-secondary)] mb-1">No se encontraron casos de onboarding</p>
            <p className="text-xs text-[var(--text-tertiary)] mb-4">Crea un nuevo caso para comenzar el onboarding operativo.</p>
            <Button size="sm" onClick={() => setIsModalOpen(true)} className="min-h-[44px]">
              <Plus className="w-4 h-4" />
              <span>Nuevo caso de onboarding</span>
            </Button>
          </div>
        ) : (
          <div className="py-1 space-y-1 px-1.5">
            {sortedCases.map(c => {
              const country = COUNTRIES.find(co => co.code === c.employee.countryId);
              const team = TEAMS.find(t => t.value === c.employee.team);
              const isSelected = c.id === selectedCaseId;
              const tone = getCaseStatusTone(c.status);
              const nextAction = getNextCaseAction(c);
              const formattedDate = new Date(c.updatedAt).toLocaleDateString('es-AR', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              });

              return (
                <button
                  key={c.id}
                  onClick={() => selectCase(c.id)}
                  className={cn(
                    'w-full flex flex-col text-left p-3.5 rounded-lg transition-[background-color,border-color,box-shadow] duration-150 cursor-pointer outline-none border border-transparent min-h-[88px]',
                    'hover:bg-white/[0.02] hover:border-[var(--border-subtle)]',
                    isSelected
                      ? 'bg-[var(--brand-primary-subtle)] border-l border-l-[var(--brand-primary)] ring-1 ring-[var(--brand-primary)]/10'
                      : 'border-l border-l-transparent'
                  )}
                  aria-label={`View onboarding case for ${c.employee.name} ${c.employee.lastName}`}
                >
                  {/* Header - Name & Pulse dot & Status badge */}
                  <div className="flex items-center justify-between w-full gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar name={c.employee.name} lastName={c.employee.lastName} size="sm" className="flex-shrink-0" />
                      <span className="text-sm font-bold text-[var(--text-primary)] truncate leading-tight">
                        {c.employee.name} {c.employee.lastName}
                      </span>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-primary)] animate-pulse flex-shrink-0" />
                      )}
                    </div>
                    <span className={cn('text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded border flex items-center gap-1 flex-shrink-0', tone.bg, tone.text, tone.border)}>
                      {getCaseIcon(c.status)}
                      <span>{getCaseStatusLabel(c.status)}</span>
                    </span>
                  </div>

                  {/* Metadata line */}
                  <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)] mt-2.5">
                    <span className="truncate font-medium max-w-[140px]">
                      {c.employee.role} · <span className="uppercase font-mono text-[10px]">{team?.label || c.employee.team}</span>
                    </span>
                    {country && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)] flex-shrink-0">
                        <Globe className="w-3 h-3" />
                        <span>{country.code}</span>
                      </span>
                    )}
                  </div>

                  {/* Action clue & Timestamp line */}
                  <div className="flex items-center justify-between gap-2 border-t border-[var(--border-subtle)]/60 pt-2 mt-2">
                    <span className="text-[10px] font-semibold text-[var(--text-secondary)] truncate flex items-center gap-1 leading-none">
                      <ArrowRight className="w-2.5 h-2.5 text-[var(--brand-primary)] flex-shrink-0" />
                      <span className="truncate max-w-[150px]" title={nextAction}>{nextAction}</span>
                    </span>
                    <span className="font-mono text-[9px] text-[var(--text-tertiary)] leading-none flex-shrink-0">
                      {formattedDate}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <NewCaseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
