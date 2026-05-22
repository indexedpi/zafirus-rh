import { useState, useEffect } from 'react';
import { useStore } from '../../store';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Clock, CheckCircle, AlertTriangle, ChevronLeft, ChevronRight, Send, Plus, Trash2 } from 'lucide-react';
import { TAX_ID_TYPES, Reference } from '../../types';
import { cn } from '../../utils/cn';
import { v4 as uuidv4 } from 'uuid';

interface CandidateWizardProps {
  token: string;
}

const STEPS = [
  { id: 1, title: 'Identificación fiscal' },
  { id: 2, title: 'Método de cobro' },
  { id: 3, title: 'Referencias' },
  { id: 4, title: 'Archivos' },
];

export function CandidateWizard({ token }: CandidateWizardProps) {
  const { getCaseByToken, updateCandidateData, submitCandidateForm, addToast } = useStore();
  const caseData = getCaseByToken(token);

  const [step, setStep] = useState(1);

  // Redirect to correct step if candidate has progress
  useEffect(() => {
    if (caseData?.candidateData?.currentStep) {
      setStep(caseData.candidateData.currentStep);
    }
  }, [caseData?.candidateData?.currentStep]);

  if (!caseData) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <AlertTriangle className="w-16 h-16 text-[var(--status-warning)] mb-4" />
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
          Link inválido o expirado
        </h2>
        <p className="text-[var(--text-secondary)]">
          Contactá a RRHH para recibir un nuevo link de formulario.
        </p>
      </div>
    );
  }

  if (caseData.candidateData?.submittedAt) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <CheckCircle className="w-16 h-16 text-[var(--status-success)] mb-4" />
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
          ¡Formulario enviado!
        </h2>
        <p className="text-[var(--text-secondary)]">
          Gracias por completar tus datos. Ya podés cerrar esta ventana.
        </p>
      </div>
    );
  }

  if (caseData.status !== 'candidate_invited') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <Clock className="w-16 h-16 text-[var(--text-tertiary)] mb-4" />
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
          Formulario no disponible
        </h2>
        <p className="text-[var(--text-secondary)]">
          Este formulario ya fue procesado o no está disponible en este momento.
        </p>
      </div>
    );
  }

  const { employee, candidateData, correctionNote } = caseData;
  const data = candidateData || {
    taxIdType: '',
    taxIdValue: '',
    paymentMethod: '',
    cbu: '',
    bankName: '',
    accountNumber: '',
    swift: '',
    beneficiaryAddress: '',
    needsW8: false,
    walletType: '',
    walletAddress: '',
    hasQrBinance: false,
    references: [],
    files: [],
    currentStep: 1,
    completedSteps: [],
    submittedAt: null,
    consolidated: false,
  };

  const updateData = (updates: Partial<typeof data>) => {
    updateCandidateData(caseData.id, updates);
  };

  const canProceed = () => {
    if (step === 1) {
      return data.taxIdType && data.taxIdValue;
    }
    if (step === 2) {
      if (!data.paymentMethod) return false;
      if (data.paymentMethod === 'CBU' && !data.cbu) return false;
      if (data.paymentMethod === 'WIRE' && (!data.bankName || !data.accountNumber || !data.swift)) return false;
      if (data.paymentMethod === 'CRYPTO' && (!data.walletType || !data.walletAddress)) return false;
      return true;
    }
    if (step === 3) {
      return data.references?.length > 0 && data.references.every((r: Reference) => r.fullName && r.email);
    }
    return true;
  };

  const goNext = () => {
    if (!canProceed()) {
      addToast({ type: 'warning', title: 'Completá los campos requeridos' });
      return;
    }
    const completedSteps = [...(data.completedSteps || [])];
    if (!completedSteps.includes(step)) {
      completedSteps.push(step);
    }
    updateData({ currentStep: step + 1, completedSteps });
    setStep(step + 1);
  };

  const goBack = () => {
    updateData({ currentStep: step - 1 });
    setStep(step - 1);
  };

  const handleSubmit = () => {
    submitCandidateForm(caseData.id);
    addToast({ type: 'success', title: '¡Formulario enviado!' });
  };

  // Check if step 4 is needed
  const needsFiles = data.needsW8 || data.hasQrBinance;
  const maxStep = needsFiles ? 4 : 3;
  const isLastStep = step === maxStep;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[var(--border-subtle)]">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            ¡Bienvenido/a a Zafirus, {employee.name}!
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">
            Completá los siguientes datos para continuar con tu onboarding
          </p>
        </div>

        {/* Correction banner */}
        {correctionNote && (
          <div className="bg-[var(--status-warning-subtle)] border border-[var(--status-warning)] rounded-lg px-4 py-3 mb-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[var(--status-warning)] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-[var(--status-warning)]">
                  RRHH solicitó las siguientes correcciones:
                </p>
                <p className="text-sm text-[var(--text-primary)] mt-1">{correctionNote}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stepper */}
        <div className="flex items-center justify-center gap-2">
          {STEPS.filter(s => s.id <= maxStep).map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors',
                  step === s.id && 'bg-[var(--brand-primary)] text-white',
                  step > s.id && 'bg-[var(--status-success-subtle)] text-[var(--status-success)] border border-[var(--status-success)]',
                  step < s.id && 'bg-[var(--bg-elevated)] text-[var(--text-tertiary)] border border-[var(--border-default)]'
                )}
              >
                {step > s.id ? <CheckCircle className="w-4 h-4" /> : s.id}
              </div>
              {i < STEPS.filter(s => s.id <= maxStep).length - 1 && (
                <div
                  className={cn(
                    'w-12 h-0.5 mx-2',
                    step > s.id ? 'bg-[var(--status-success)]' : 'bg-[var(--border-default)]'
                  )}
                />
              )}
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-[var(--text-secondary)] mt-2">
          Paso {step} de {maxStep}: {STEPS.find(s => s.id === step)?.title}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-lg mx-auto">
          {step === 1 && (
            <Step1
              data={data}
              updateData={updateData}
            />
          )}
          {step === 2 && (
            <Step2
              data={data}
              updateData={updateData}
            />
          )}
          {step === 3 && (
            <Step3
              data={data}
              updateData={updateData}
            />
          )}
          {step === 4 && needsFiles && (
            <Step4
              data={data}
              updateData={updateData}
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-[var(--border-subtle)] bg-[var(--bg-subtle)]">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={goBack}
            disabled={step === 1}
          >
            <ChevronLeft className="w-4 h-4" />
            Atrás
          </Button>

          {isLastStep ? (
            <Button onClick={handleSubmit}>
              <Send className="w-4 h-4" />
              Enviar formulario
            </Button>
          ) : (
            <Button onClick={goNext}>
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Step 1: Tax ID
function Step1({ data, updateData }: { data: any; updateData: (d: any) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
          Identificación fiscal
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Indicá tu identificador fiscal principal.
        </p>
      </div>

      <Select
        label="Tipo de identificador"
        value={data.taxIdType}
        onChange={(e) => updateData({ taxIdType: e.target.value })}
        options={TAX_ID_TYPES.map(t => ({ value: t.code, label: t.label }))}
        placeholder="Seleccioná un tipo"
      />

      <Input
        label="Número"
        value={data.taxIdValue}
        onChange={(e) => updateData({ taxIdValue: e.target.value })}
        placeholder={TAX_ID_TYPES.find(t => t.code === data.taxIdType)?.mask || 'Ingresá el número'}
        helper="Solo validamos el formato, no contra APIs externas."
      />
    </div>
  );
}

// Step 2: Payment Method
function Step2({ data, updateData }: { data: any; updateData: (d: any) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
          Método de cobro
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          ¿Cómo preferís recibir tus pagos? Esta elección es independiente de tu país de residencia.
        </p>
      </div>

      <div className="space-y-3">
        <PaymentOption
          selected={data.paymentMethod === 'CBU'}
          onSelect={() => updateData({ paymentMethod: 'CBU', needsW8: false, hasQrBinance: false })}
          icon="💳"
          title="CBU (Argentina)"
          description="Cuenta bancaria argentina"
        />
        <PaymentOption
          selected={data.paymentMethod === 'WIRE'}
          onSelect={() => updateData({ paymentMethod: 'WIRE', hasQrBinance: false })}
          icon="🌐"
          title="Transferencia internacional"
          description="Banco extranjero vía SWIFT"
        />
        <PaymentOption
          selected={data.paymentMethod === 'CRYPTO'}
          onSelect={() => updateData({ paymentMethod: 'CRYPTO', needsW8: false })}
          icon="₿"
          title="Crypto (Binance)"
          description="Wallet de criptomonedas"
        />
      </div>

      <div className={cn('payment-fields-enter', data.paymentMethod === 'CBU' && 'visible')}>
        <div className="pt-2">
          <Input
            label="CBU"
            value={data.cbu}
            onChange={(e) => updateData({ cbu: e.target.value })}
            placeholder="22 dígitos"
            helper="Encontrás tu CBU en tu homebanking o app del banco."
          />
        </div>
      </div>

      <div className={cn('payment-fields-enter', data.paymentMethod === 'WIRE' && 'visible')}>
        <div className="space-y-4 pt-2">
          <Input
            label="Nombre del banco"
            value={data.bankName}
            onChange={(e) => updateData({ bankName: e.target.value })}
          />
          <Input
            label="Número de cuenta"
            value={data.accountNumber}
            onChange={(e) => updateData({ accountNumber: e.target.value })}
          />
          <Input
            label="Código SWIFT"
            value={data.swift}
            onChange={(e) => updateData({ swift: e.target.value })}
          />
          <Input
            label="Dirección del beneficiario"
            value={data.beneficiaryAddress}
            onChange={(e) => updateData({ beneficiaryAddress: e.target.value })}
          />
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={data.needsW8}
              onChange={(e) => updateData({ needsW8: e.target.checked })}
              className="w-4 h-4 rounded border-[var(--border-default)] bg-[var(--bg-elevated)]"
            />
            <span className="text-sm text-[var(--text-primary)]">
              Necesito completar formulario W-8 (residentes fuera de USA)
            </span>
          </label>
        </div>
      </div>

      <div className={cn('payment-fields-enter', data.paymentMethod === 'CRYPTO' && 'visible')}>
        <div className="space-y-4 pt-2">
          <Select
            label="Tipo de wallet"
            value={data.walletType}
            onChange={(e) => updateData({ walletType: e.target.value })}
            options={[
              { value: 'BINANCE', label: 'Binance' },
              { value: 'OTHER', label: 'Otra wallet' },
            ]}
            placeholder="Seleccioná..."
          />
          <Input
            label="Dirección de wallet / Binance ID"
            value={data.walletAddress}
            onChange={(e) => updateData({ walletAddress: e.target.value })}
          />
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={data.hasQrBinance}
              onChange={(e) => updateData({ hasQrBinance: e.target.checked })}
              className="w-4 h-4 rounded border-[var(--border-default)] bg-[var(--bg-elevated)]"
            />
            <span className="text-sm text-[var(--text-primary)]">
              Voy a subir QR de Binance
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}

function PaymentOption({ selected, onSelect, icon, title, description }: {
  selected: boolean;
  onSelect: () => void;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full flex items-center gap-4 p-4 rounded-lg border text-left transition-[border-color,background-color] duration-150',
        selected
          ? 'border-[var(--brand-primary)] bg-[var(--brand-primary-subtle)]'
          : 'border-[var(--border-default)] hover:border-[var(--border-strong)] bg-[var(--bg-elevated)]'
      )}
    >
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-sm font-medium text-[var(--text-primary)]">{title}</p>
        <p className="text-xs text-[var(--text-secondary)]">{description}</p>
      </div>
      <div className={cn(
        'ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center',
        selected
          ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]'
          : 'border-[var(--border-default)]'
      )}>
        {selected && <CheckCircle className="w-3 h-3 text-white" />}
      </div>
    </button>
  );
}

// Step 3: References
function Step3({ data, updateData }: { data: any; updateData: (d: any) => void }) {
  const references: Reference[] = data.references || [];

  const addReference = () => {
    updateData({
      references: [...references, {
        id: uuidv4(),
        fullName: '',
        relationship: '',
        company: '',
        email: '',
        phone: '',
      }]
    });
  };

  // Auto-add first reference if none exist
  useEffect(() => {
    if (references.length === 0) {
      addReference();
    }
  }, []);

  const updateReference = (id: string, updates: Partial<Reference>) => {
    updateData({
      references: references.map(r => r.id === id ? { ...r, ...updates } : r)
    });
  };

  const removeReference = (id: string) => {
    updateData({
      references: references.filter(r => r.id !== id)
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
          Referencias laborales
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Agregá al menos una referencia laboral. Máximo 3.
        </p>
      </div>

      {references.map((ref, index) => (
        <div key={ref.id} className="bg-[var(--bg-elevated)] rounded-lg p-4 border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-[var(--text-primary)]">
              Referencia {index + 1}
            </span>
            {references.length > 1 && (
              <button
                onClick={() => removeReference(ref.id)}
                className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--status-error)] hover:bg-[var(--status-error-subtle)]"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nombre completo"
              value={ref.fullName}
              onChange={(e) => updateReference(ref.id, { fullName: e.target.value })}
            />
            <Input
              label="Relación"
              value={ref.relationship}
              onChange={(e) => updateReference(ref.id, { relationship: e.target.value })}
              placeholder="ej: Jefe directo"
            />
            <Input
              label="Empresa"
              value={ref.company}
              onChange={(e) => updateReference(ref.id, { company: e.target.value })}
            />
            <Input
              label="Email"
              type="email"
              value={ref.email}
              onChange={(e) => updateReference(ref.id, { email: e.target.value })}
            />
            <Input
              label="Teléfono"
              value={ref.phone}
              onChange={(e) => updateReference(ref.id, { phone: e.target.value })}
            />
          </div>
        </div>
      ))}

      {references.length < 3 && (
        <Button variant="secondary" onClick={addReference} className="w-full">
          <Plus className="w-4 h-4" />
          Agregar referencia
        </Button>
      )}

      {references.length === 0 && (
        <p className="text-sm text-[var(--status-warning)] text-center">
          Agregá al menos una referencia para continuar.
        </p>
      )}
    </div>
  );
}

// Step 4: Files
function Step4({ data, updateData }: { data: any; updateData: (d: any) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
          Archivos
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Subí los archivos que correspondan según tu método de cobro.
        </p>
      </div>

      {data.needsW8 && (
        <div className="bg-[var(--bg-elevated)] rounded-lg p-6 border border-dashed border-[var(--border-default)] text-center">
          <p className="text-sm font-medium text-[var(--text-primary)] mb-2">
            Formulario W-8 (PDF)
          </p>
          <p className="text-xs text-[var(--text-tertiary)] mb-4">
            Requerido para transferencias internacionales
          </p>
          <input
            type="file"
            accept=".pdf"
            className="hidden"
            id="w8-upload"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                updateData({
                  files: [...(data.files || []), {
                    id: uuidv4(),
                    fileType: 'w8',
                    name: file.name,
                    sizeBytes: file.size,
                  }]
                });
              }
            }}
          />
          <label
            htmlFor="w8-upload"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--brand-primary)] text-white rounded-lg cursor-pointer hover:bg-[var(--brand-primary-hover)] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Subir W-8
          </label>
        </div>
      )}

      {data.hasQrBinance && (
        <div className="bg-[var(--bg-elevated)] rounded-lg p-6 border border-dashed border-[var(--border-default)] text-center">
          <p className="text-sm font-medium text-[var(--text-primary)] mb-2">
            QR de Binance (PNG/JPG)
          </p>
          <p className="text-xs text-[var(--text-tertiary)] mb-4">
            Screenshot del QR de tu wallet
          </p>
          <input
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            id="qr-upload"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                updateData({
                  files: [...(data.files || []), {
                    id: uuidv4(),
                    fileType: 'qr_binance',
                    name: file.name,
                    sizeBytes: file.size,
                  }]
                });
              }
            }}
          />
          <label
            htmlFor="qr-upload"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--brand-primary)] text-white rounded-lg cursor-pointer hover:bg-[var(--brand-primary-hover)] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Subir QR
          </label>
        </div>
      )}

      {data.files?.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-[var(--text-primary)]">Archivos subidos:</p>
          {data.files.map((file: any) => (
            <div key={file.id} className="flex items-center justify-between bg-[var(--bg-surface)] rounded px-3 py-2">
              <span className="text-sm text-[var(--text-primary)]">{file.name}</span>
              <button
                onClick={() => updateData({ files: data.files.filter((f: any) => f.id !== file.id) })}
                className="p-1 text-[var(--text-tertiary)] hover:text-[var(--status-error)]"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
