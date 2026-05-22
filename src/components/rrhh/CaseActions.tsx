import { useState } from 'react';
import { useStore } from '../../store';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Textarea } from '../ui/Input';
import {
  Send,
  Play,
  Check,
  AlertTriangle,
  Lock,
  Unlock,
  XCircle,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';

export function CaseActions() {
  const {
    getSelectedCase,
    sendCandidateForm,
    startReview,
    requestCorrection,
    approve,
    activate,
    block,
    unblock,
    cancel,
    addToast,
  } = useStore();

  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [correctionNote, setCorrectionNote] = useState('');
  const [blockReason, setBlockReason] = useState('');

  const selectedCase = getSelectedCase();
  if (!selectedCase) return null;

  const { status, id } = selectedCase;

  const handleSendForm = () => {
    sendCandidateForm(id);
  };

  const handleStartReview = () => {
    startReview(id);
  };

  const handleCorrection = () => {
    if (!correctionNote.trim()) {
      addToast({ type: 'warning', title: 'Indicá el motivo de la corrección.' });
      return;
    }
    requestCorrection(id, correctionNote);
    setShowCorrectionModal(false);
    setCorrectionNote('');
  };

  const handleApprove = () => {
    approve(id);
  };

  const handleActivate = () => {
    activate(id);
  };

  const handleBlock = () => {
    if (!blockReason.trim()) {
      addToast({ type: 'warning', title: 'Indicá el motivo del bloqueo.' });
      return;
    }
    block(id, blockReason);
    setShowBlockModal(false);
    setBlockReason('');
  };

  const handleUnblock = () => {
    unblock(id);
  };

  const handleCancelar = () => {
    if (confirm('¿Seguro que querés cancelar este caso? Esta acción no se puede deshacer.')) {
      cancel(id);
    }
  };

  return (
    <>
      <div className="px-4 lg:px-6 py-4 border-t border-[var(--border-subtle)] bg-[var(--bg-subtle)] safe-bottom">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="text-xs text-[var(--text-tertiary)] hidden lg:block">
            {status === 'draft' && 'El caso está en borrador. Enviá el formulario al candidato para continuar.'}
            {status === 'candidate_invited' && 'Formulario enviado. Esperando respuesta del candidato.'}
            {status === 'candidate_submitted' && 'El candidato envió sus datos. Listo para revisión.'}
            {status === 'hr_review' && 'Revisá los detalles del candidato y aprobá, solicitá corrección o bloqueá el caso.'}
            {status === 'ready_to_activate' && 'Perfil verificado. El caso está listo para activación operativa.'}
            {status === 'active_pending_automation' && 'Tareas automáticas de directorio y accesos en curso...'}
            {status === 'operative' && 'Onboarding completado. El colaborador está activo.'}
            {status === 'blocked' && `Bloqueado: ${selectedCase.blockReason || 'Sin motivo especificado'}`}
            {status === 'cancelled' && 'Este caso fue cancelado.'}
          </div>

          <div className="flex items-center gap-2 lg:gap-3 flex-wrap">
            {status === 'draft' && (
              <Button onClick={handleSendForm} className="min-h-[44px]">
                <Send className="w-4 h-4" />
                Enviar formulario
              </Button>
            )}

            {status === 'candidate_submitted' && (
              <Button onClick={handleStartReview} className="min-h-[44px]">
                <ArrowRight className="w-4 h-4" />
                Iniciar revisión
              </Button>
            )}

            {status === 'hr_review' && (
              <>
                <Button variant="ghost" onClick={() => setShowBlockModal(true)} className="min-h-[44px]">
                  <Lock className="w-4 h-4" />
                  Bloquear caso
                </Button>
                <Button variant="secondary" onClick={() => setShowCorrectionModal(true)} className="min-h-[44px]">
                  <MessageSquare className="w-4 h-4" />
                  Solicitar corrección
                </Button>
                <Button onClick={handleApprove} className="min-h-[44px]">
                  <Check className="w-4 h-4" />
                  Aprobar caso
                </Button>
              </>
            )}

            {status === 'ready_to_activate' && (
              <Button onClick={handleActivate} className="min-h-[44px]">
                <Play className="w-4 h-4" />
                Activar onboarding
              </Button>
            )}

            {status === 'blocked' && (
              <>
                <Button variant="danger" size="sm" onClick={handleCancelar} className="min-h-[44px]">
                  <XCircle className="w-4 h-4" />
                  Cancelar caso
                </Button>
                <Button onClick={handleUnblock} className="min-h-[44px]">
                  <Unlock className="w-4 h-4" />
                  Desbloquear caso
                </Button>
              </>
            )}

            {(status === 'draft' || status === 'candidate_invited' || status === 'hr_review') && (
              <Button variant="ghost" size="sm" onClick={handleCancelar} className="min-h-[44px]">
                <XCircle className="w-4 h-4" />
                Cancelar caso
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Correction Modal */}
      <Modal
        isOpen={showCorrectionModal}
        onClose={() => setShowCorrectionModal(false)}
        title="Solicitar corrección de onboarding"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            Se enviará una solicitud de corrección al candidato con este comentario:
          </p>
          <Textarea
            label="Motivo de corrección"
            value={correctionNote}
            onChange={(e) => setCorrectionNote(e.target.value)}
            placeholder="Ej.: el número de CUIT tiene un dígito inválido, por favor volvé a cargar el documento..."
            rows={4}
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowCorrectionModal(false)} className="min-h-[44px]">
              Cancelar
            </Button>
            <Button onClick={handleCorrection} className="min-h-[44px]">
              <AlertTriangle className="w-4 h-4" />
              Enviar solicitud
            </Button>
          </div>
        </div>
      </Modal>

      {/* Block Modal */}
      <Modal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        title="Bloquear caso de onboarding"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            El caso quedará bloqueado hasta que un operador lo desbloquee manualmente.
          </p>
          <Textarea
            label="Motivo del bloqueo"
            value={blockReason}
            onChange={(e) => setBlockReason(e.target.value)}
            placeholder="Ej.: verificación pendiente o documentación ilegible..."
            rows={4}
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowBlockModal(false)} className="min-h-[44px]">
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleBlock} className="min-h-[44px]">
              <Lock className="w-4 h-4" />
              Bloquear caso
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
