import { useStore } from '../../store';
import { CandidateWizard } from './CandidateWizard';
import { Clock, FileText, CheckCircle, ShieldCheck, AlertTriangle } from 'lucide-react';

interface CandidatePanelProps {
  token: string | null;
}

export function CandidatePanel({ token }: CandidatePanelProps) {
  const { getSelectedCase } = useStore();
  const selectedCase = getSelectedCase();

  const isDemoMode = window.location.hash.includes('demo');

  // Use token from props, or from selected case if in candidate_invited status
  const activeToken = token || (
    selectedCase?.status === 'candidate_invited' ? selectedCase.candidateToken : null
  );

  // If selected case is in candidate_submitted or later, show what the candidate sees
  if (selectedCase && !activeToken) {
    // Show the submitted confirmation state in Spanish
    if (selectedCase.candidateData?.submittedAt) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-center px-6 bg-[var(--bg-subtle)]">
          <CheckCircle className="w-16 h-16 text-[var(--status-success)] mb-4 animate-fade-in" />
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">
            Formulario enviado
          </h2>
          <p className="text-sm text-[var(--text-secondary)] max-w-sm">
            Gracias. RRHH ya recibió tus datos.
          </p>
          {selectedCase.status === 'operative' && (
            <div className="mt-6 p-4 bg-[var(--status-success-subtle)] rounded-lg border border-[var(--status-success)]/15 max-w-sm">
              <div className="flex items-center gap-3 text-left">
                <ShieldCheck className="w-5 h-5 text-[var(--status-success)] flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-[var(--status-success)]">Proceso de alta completo</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    {selectedCase.employee.name} {selectedCase.employee.lastName} está activo y operativo en la nómina.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Gated placeholders inside demo mode vs normal product mode
    if (isDemoMode) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-center px-6 bg-[var(--bg-subtle)]">
          <div className="w-20 h-20 rounded-xl bg-[var(--bg-elevated)] flex items-center justify-center mb-4 border border-[var(--border-default)]">
            <Clock className="w-10 h-10 text-[var(--text-tertiary)]" />
          </div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">
            Formulario no disponible
          </h2>
          <p className="text-sm text-[var(--text-secondary)] max-w-sm">
            {selectedCase.status === 'draft'
              ? 'El caso está en borrador. Enviá el formulario al candidato desde las acciones de RRHH.'
              : 'El formulario de ingreso del candidato no está activo para este estado del caso.'
            }
          </p>
        </div>
      );
    }
  }

  // Gated placeholders for no active case token
  if (!activeToken) {
    if (isDemoMode) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-center px-6 bg-[var(--bg-subtle)]">
          <div className="w-20 h-20 rounded-xl bg-[var(--bg-elevated)] flex items-center justify-center mb-4 border border-[var(--border-default)]">
            <FileText className="w-10 h-10 text-[var(--text-tertiary)]" />
          </div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">
            Formulario no disponible
          </h2>
          <p className="text-sm text-[var(--text-secondary)] max-w-sm">
            Seleccioná un caso en estado "Invitado" en Zafirus para visualizar el formulario del candidato.
          </p>
        </div>
      );
    }

    // Normal mode (production-like view for direct link access with missing or expired token)
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-6 bg-[var(--bg-subtle)]">
        <div className="w-16 h-16 rounded-xl bg-[var(--bg-elevated)] flex items-center justify-center mb-4 border border-[var(--border-default)]">
          <AlertTriangle className="w-8 h-8 text-[var(--status-warning)]" />
        </div>
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">
          Enlace no disponible
        </h2>
        <p className="text-sm text-[var(--text-secondary)] max-w-sm">
          Contactá al equipo de Personas de Zafirus.
        </p>
      </div>
    );
  }

  return <CandidateWizard token={activeToken} />;
}
