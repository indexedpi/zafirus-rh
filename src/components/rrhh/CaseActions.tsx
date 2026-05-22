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
      addToast({ type: 'warning', title: 'Please specify the correction details.' });
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
      addToast({ type: 'warning', title: 'Please specify the block reason.' });
      return;
    }
    block(id, blockReason);
    setShowBlockModal(false);
    setBlockReason('');
  };

  const handleUnblock = () => {
    unblock(id);
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel this onboarding case? This action is irreversible.')) {
      cancel(id);
    }
  };

  return (
    <>
      <div className="px-4 lg:px-6 py-4 border-t border-[var(--border-subtle)] bg-[var(--bg-subtle)] safe-bottom">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="text-xs text-[var(--text-tertiary)] hidden lg:block">
            {status === 'draft' && 'Onboarding case is in draft. Send the form to candidate to continue.'}
            {status === 'candidate_invited' && 'Form dispatched. Awaiting candidate input.'}
            {status === 'candidate_submitted' && 'Candidate has submitted form data. Ready to review.'}
            {status === 'hr_review' && 'Review candidate details and approve, request correction, or block.'}
            {status === 'ready_to_activate' && 'Profile verified. Case ready for operational activation.'}
            {status === 'active_pending_automation' && 'Automated directory and access tasks in progress...'}
            {status === 'operative' && 'Onboarding completed successfully! Employee is active.'}
            {status === 'blocked' && `Blocked: ${selectedCase.blockReason || 'No reason specified'}`}
            {status === 'cancelled' && 'This onboarding case is cancelled.'}
          </div>

          <div className="flex items-center gap-2 lg:gap-3 flex-wrap">
            {status === 'draft' && (
              <Button onClick={handleSendForm} className="min-h-[44px]">
                <Send className="w-4 h-4" />
                Send Form to Candidate
              </Button>
            )}

            {status === 'candidate_submitted' && (
              <Button onClick={handleStartReview} className="min-h-[44px]">
                <ArrowRight className="w-4 h-4" />
                Start Review
              </Button>
            )}

            {status === 'hr_review' && (
              <>
                <Button variant="ghost" onClick={() => setShowBlockModal(true)} className="min-h-[44px]">
                  <Lock className="w-4 h-4" />
                  Block Case
                </Button>
                <Button variant="secondary" onClick={() => setShowCorrectionModal(true)} className="min-h-[44px]">
                  <MessageSquare className="w-4 h-4" />
                  Request Correction
                </Button>
                <Button onClick={handleApprove} className="min-h-[44px]">
                  <Check className="w-4 h-4" />
                  Approve Case
                </Button>
              </>
            )}

            {status === 'ready_to_activate' && (
              <Button onClick={handleActivate} className="min-h-[44px]">
                <Play className="w-4 h-4" />
                Activate Onboarding
              </Button>
            )}

            {status === 'blocked' && (
              <>
                <Button variant="danger" size="sm" onClick={handleCancel} className="min-h-[44px]">
                  <XCircle className="w-4 h-4" />
                  Cancel Case
                </Button>
                <Button onClick={handleUnblock} className="min-h-[44px]">
                  <Unlock className="w-4 h-4" />
                  Unblock Case
                </Button>
              </>
            )}

            {(status === 'draft' || status === 'candidate_invited' || status === 'hr_review') && (
              <Button variant="ghost" size="sm" onClick={handleCancel} className="min-h-[44px]">
                <XCircle className="w-4 h-4" />
                Cancel File
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Correction Modal */}
      <Modal
        isOpen={showCorrectionModal}
        onClose={() => setShowCorrectionModal(false)}
        title="Request Onboarding Correction"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            A correction request notification will be dispatched to the candidate with this comment:
          </p>
          <Textarea
            label="Correction Reason"
            value={correctionNote}
            onChange={(e) => setCorrectionNote(e.target.value)}
            placeholder="e.g., CUIT number digit is invalid, please re-upload document..."
            rows={4}
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowCorrectionModal(false)} className="min-h-[44px]">
              Cancel
            </Button>
            <Button onClick={handleCorrection} className="min-h-[44px]">
              <AlertTriangle className="w-4 h-4" />
              Send Request
            </Button>
          </div>
        </div>
      </Modal>

      {/* Block Modal */}
      <Modal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        title="Block Onboarding Case"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            The onboarding file will be marked as Blocked until manual clearance is granted by an operator.
          </p>
          <Textarea
            label="Blocking Reason"
            value={blockReason}
            onChange={(e) => setBlockReason(e.target.value)}
            placeholder="e.g., Background check pending or ID documents unreadable..."
            rows={4}
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowBlockModal(false)} className="min-h-[44px]">
              Cancel
            </Button>
            <Button variant="danger" onClick={handleBlock} className="min-h-[44px]">
              <Lock className="w-4 h-4" />
              Block File
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
