import React, { useState, useEffect } from 'react';
import { useStore } from '../../store';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { CheckCircle, AlertTriangle, ChevronLeft, ChevronRight, Send, Plus, Trash2, CheckCircle2, ShieldCheck, Building, CreditCard, Bitcoin, FileText } from 'lucide-react';
import { TAX_ID_TYPES, Reference, CandidateData } from '../../types';
import { cn } from '../../utils/cn';
import { v4 as uuidv4 } from 'uuid';
import { ZafirusLogo } from '../ui/ZafirusLogo';

// ─── TYPES ─────────────────────────────────────────────────────────────────────

interface IntakeStep {
  id: number;
  title: string;
}

interface WizardStepProps {
  data: CandidateData;
  updateData: (updates: Partial<CandidateData>) => void;
  showErrors: boolean;
}

// ─── SUBCOMPONENTS ─────────────────────────────────────────────────────────────

function CandidateWelcomeHeader({ employeeName }: { employeeName: string }) {
  return (
    <div className="flex flex-col items-center justify-center pt-8 pb-4 px-6 text-center">
      <div className="mb-5">
        <ZafirusLogo size={40} glow={false} className="text-[var(--brand-primary)]" />
      </div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
        Bienvenida/o a Zafirus
      </h1>
      <p className="text-sm font-medium text-[var(--text-secondary)] mt-2 max-w-sm leading-relaxed">
        Hola, {employeeName}. Completá tus datos para avanzar con el alta operativa.
      </p>
    </div>
  );
}

function CorrectionNotice({ note }: { note: string | null }) {
  if (!note) return null;
  return (
    <div className="bg-[var(--status-warning-subtle)] border border-[var(--status-warning)]/20 rounded-xl p-5 mb-6 text-left shadow-sm">
      <h3 className="text-sm font-bold text-[var(--status-warning)] mb-1.5 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4" />
        RRHH solicitó una corrección
      </h3>
      <p className="text-sm text-[var(--text-primary)] font-medium mb-3">
        Revisá el comentario y actualizá los datos necesarios.
      </p>
      <div className="bg-[var(--bg-base)] p-3 rounded-lg border border-[var(--border-subtle)] text-sm text-[var(--text-secondary)] leading-relaxed">
        {note}
      </div>
    </div>
  );
}

function IntakeProgressStepper({ steps, currentStepId }: { steps: IntakeStep[], currentStepId: number }) {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-3 mb-8 overflow-x-auto scrollbar-hide px-2 py-1">
      {steps.map((s, i) => {
        const isPast = steps.findIndex(st => st.id === currentStepId) > i;
        const isCurrent = s.id === currentStepId;
        return (
          <div key={s.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className={cn(
                "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors border",
                isCurrent ? "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)] shadow-sm" :
                isPast ? "bg-[var(--status-success-subtle)] text-[var(--status-success)] border-[var(--status-success)]" :
                "bg-[var(--bg-elevated)] text-[var(--text-tertiary)] border-[var(--border-default)]"
              )}>
                {isPast ? <CheckCircle className="w-4 h-4" /> : (i + 1)}
              </div>
              <span className={cn(
                "text-[9px] sm:text-[10px] font-bold uppercase tracking-wider hidden sm:block",
                isCurrent ? "text-[var(--brand-primary)]" :
                isPast ? "text-[var(--text-primary)]" :
                "text-[var(--text-tertiary)]"
              )}>
                {s.title}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn(
                "w-3 sm:w-6 h-[2px] mx-1 sm:mx-2 rounded-full",
                isPast ? "bg-[var(--status-success)]" : "bg-[var(--border-subtle)]"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function RequiredFieldsNotice() {
  return (
    <div className="bg-[var(--status-error-subtle)] border border-[var(--status-error)]/20 rounded-xl p-4 mb-6 flex items-start gap-3 shadow-sm">
      <AlertTriangle className="w-5 h-5 text-[var(--status-error)] flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-bold text-[var(--status-error)]">Faltan campos obligatorios en este paso.</p>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">Revisá los datos marcados para continuar.</p>
      </div>
    </div>
  );
}

function StepShell({ title, helper, children }: { title: string, helper: string, children: React.ReactNode }) {
  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 sm:p-8 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">{title}</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1.5 leading-relaxed">{helper}</p>
      </div>
      {children}
    </div>
  );
}

// ─── STEPS ───────────────────────────────────────────────────────────────────

function FiscalStep({ data, updateData, showErrors }: WizardStepProps) {
  const isTypeError = showErrors && !data.taxIdType;
  const isValueError = showErrors && !data.taxIdValue;

  return (
    <StepShell
      title="Identificación fiscal"
      helper="Usamos este dato para registrar correctamente tu alta administrativa."
    >
      <div className="space-y-5">
        <div>
          <Select
            label="Tipo de identificación"
            value={data.taxIdType}
            onChange={(e) => updateData({ taxIdType: e.target.value })}
            options={TAX_ID_TYPES.map(t => ({ value: t.code, label: t.label }))}
            placeholder="Seleccioná un tipo"
          />
          {isTypeError && <p className="text-xs text-[var(--status-error)] font-medium mt-1.5">Este dato es necesario para continuar.</p>}
        </div>

        <div>
          <Input
            label="Número de identificación"
            value={data.taxIdValue}
            onChange={(e) => updateData({ taxIdValue: e.target.value })}
            placeholder={TAX_ID_TYPES.find(t => t.code === data.taxIdType)?.mask || 'Ingresá el número'}
          />
          {isValueError && <p className="text-xs text-[var(--status-error)] font-medium mt-1.5">Este dato es necesario para continuar.</p>}
        </div>
      </div>
    </StepShell>
  );
}

function PaymentMethodCard({ selected, onSelect, icon: Icon, title, description }: any) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'w-full flex items-center justify-between p-4 rounded-xl border-2 text-left transition-[border-color,background-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary-glow)]',
        selected
          ? 'border-[var(--brand-primary)] bg-[var(--brand-primary-subtle)]'
          : 'border-[var(--border-default)] hover:border-[var(--border-focus)] bg-[var(--bg-base)]'
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center border",
          selected ? "bg-[var(--brand-primary)] border-[var(--brand-primary)] text-white" : "bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-tertiary)]"
        )}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className={cn("text-sm font-bold", selected ? "text-[var(--brand-primary)]" : "text-[var(--text-primary)]")}>{title}</p>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">{description}</p>
        </div>
      </div>
      <div className={cn(
        'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
        selected ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]' : 'border-[var(--border-default)]'
      )}>
        {selected && <CheckCircle className="w-3 h-3 text-white" />}
      </div>
    </button>
  );
}

function PaymentStep({ data, updateData, showErrors }: WizardStepProps) {
  return (
    <StepShell
      title="Datos de cobro"
      helper="Seleccioná cómo querés registrar tus datos de cobro para el alta."
    >
      <div className="space-y-3 mb-6">
        <PaymentMethodCard
          selected={data.paymentMethod === 'CBU'}
          onSelect={() => updateData({ paymentMethod: 'CBU' })}
          icon={Building}
          title="CBU"
          description="Transferencia bancaria local"
        />
        <PaymentMethodCard
          selected={data.paymentMethod === 'WIRE'}
          onSelect={() => updateData({ paymentMethod: 'WIRE' })}
          icon={CreditCard}
          title="Transferencia internacional"
          description="Wire transfer / Swift"
        />
        <PaymentMethodCard
          selected={data.paymentMethod === 'CRYPTO'}
          onSelect={() => updateData({ paymentMethod: 'CRYPTO' })}
          icon={Bitcoin}
          title="Cripto"
          description="Billetera virtual"
        />
      </div>

      {showErrors && !data.paymentMethod && (
        <p className="text-xs text-[var(--status-error)] font-medium mb-6">Este dato es necesario para continuar.</p>
      )}

      {data.paymentMethod === 'CBU' && (
        <div className="space-y-4 p-5 bg-[var(--bg-base)] rounded-xl border border-[var(--border-subtle)]">
          <div>
            <Input
              label="CBU o CVU (22 dígitos)"
              value={data.cbu}
              onChange={(e) => updateData({ cbu: e.target.value })}
              placeholder="Ej: 0000000000000000000000"
            />
            {showErrors && !data.cbu && <p className="text-xs text-[var(--status-error)] font-medium mt-1.5">Ingresá un CBU válido.</p>}
          </div>
        </div>
      )}

      {data.paymentMethod === 'WIRE' && (
        <div className="space-y-4 p-5 bg-[var(--bg-base)] rounded-xl border border-[var(--border-subtle)]">
          <div>
            <Input
              label="Nombre del banco"
              value={data.bankName}
              onChange={(e) => updateData({ bankName: e.target.value })}
            />
            {showErrors && !data.bankName && <p className="text-xs text-[var(--status-error)] font-medium mt-1.5">Este dato es necesario para continuar.</p>}
          </div>
          <div>
            <Input
              label="Número de cuenta"
              value={data.accountNumber}
              onChange={(e) => updateData({ accountNumber: e.target.value })}
            />
            {showErrors && !data.accountNumber && <p className="text-xs text-[var(--status-error)] font-medium mt-1.5">Este dato es necesario para continuar.</p>}
          </div>
          <div>
            <Input
              label="Código SWIFT / BIC"
              value={data.swift}
              onChange={(e) => updateData({ swift: e.target.value })}
            />
            {showErrors && !data.swift && <p className="text-xs text-[var(--status-error)] font-medium mt-1.5">Este dato es necesario para continuar.</p>}
          </div>
          <div className="pt-3 border-t border-[var(--border-subtle)] mt-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={data.needsW8}
                onChange={(e) => updateData({ needsW8: e.target.checked })}
                className="mt-1 w-4 h-4 rounded border-[var(--border-default)] bg-[var(--bg-elevated)]"
              />
              <span className="text-sm font-medium text-[var(--text-primary)] leading-tight">
                Necesito completar formulario W-8<br/>
                <span className="text-xs text-[var(--text-secondary)] font-normal mt-1 block">Obligatorio para residentes fuera de USA recibiendo Wire.</span>
              </span>
            </label>
          </div>
        </div>
      )}

      {data.paymentMethod === 'CRYPTO' && (
        <div className="space-y-4 p-5 bg-[var(--bg-base)] rounded-xl border border-[var(--border-subtle)]">
          <div>
            <Select
              label="Tipo de wallet"
              value={data.walletType}
              onChange={(e) => updateData({ walletType: e.target.value })}
              options={[
                { value: 'BINANCE', label: 'Binance (Recomendado)' },
                { value: 'OTHER', label: 'Otra wallet' },
              ]}
              placeholder="Seleccioná..."
            />
            {showErrors && !data.walletType && <p className="text-xs text-[var(--status-error)] font-medium mt-1.5">Este dato es necesario para continuar.</p>}
          </div>
          <div>
            <Input
              label="Dirección de wallet / Binance ID"
              value={data.walletAddress}
              onChange={(e) => updateData({ walletAddress: e.target.value })}
            />
            {showErrors && !data.walletAddress && <p className="text-xs text-[var(--status-error)] font-medium mt-1.5">Este dato es necesario para continuar.</p>}
          </div>
          <div className="pt-3 border-t border-[var(--border-subtle)] mt-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={data.hasQrBinance}
                onChange={(e) => updateData({ hasQrBinance: e.target.checked })}
                className="mt-1 w-4 h-4 rounded border-[var(--border-default)] bg-[var(--bg-elevated)]"
              />
              <span className="text-sm font-medium text-[var(--text-primary)] leading-tight">
                Voy a adjuntar una captura del QR de mi wallet<br/>
                <span className="text-xs text-[var(--text-secondary)] font-normal mt-1 block">Agiliza la configuración de tu primer pago.</span>
              </span>
            </label>
          </div>
        </div>
      )}
    </StepShell>
  );
}

function ReferencesStep({ data, updateData, showErrors }: WizardStepProps) {
  const references: Reference[] = data.references || [];

  const addReference = () => {
    updateData({
      references: [...references, {
        id: uuidv4(), fullName: '', relationship: '', company: '', email: '', phone: '',
      }]
    });
  };

  useEffect(() => {
    if (references.length === 0) addReference();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateReference = (id: string, updates: Partial<Reference>) => {
    updateData({
      references: references.map((r: Reference) => r.id === id ? { ...r, ...updates } : r)
    });
  };

  const removeReference = (id: string) => {
    updateData({
      references: references.filter((r: Reference) => r.id !== id)
    });
  };

  const hasError = showErrors && (references.length === 0 || references.some((r: Reference) => !r.fullName || !r.email));

  return (
    <StepShell
      title="Referencias"
      helper="Agregá al menos una referencia para continuar con el alta."
    >
      <div className="space-y-5">
        {references.length === 0 && (
          <div className="bg-[var(--bg-base)] rounded-xl p-6 border border-dashed border-[var(--border-default)] text-center">
            <p className="text-sm font-bold text-[var(--text-primary)] mb-1">
              Todavía no agregaste referencias.
            </p>
            <p className="text-xs text-[var(--text-secondary)]">
              Agregá una referencia para continuar.
            </p>
          </div>
        )}

        {references.map((ref, index) => (
          <div key={ref.id} className="bg-[var(--bg-base)] rounded-xl p-5 border border-[var(--border-subtle)] relative">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border-subtle)]">
              <span className="text-sm font-bold text-[var(--text-primary)]">
                Contacto {index + 1}
              </span>
              {references.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeReference(ref.id)}
                  aria-label={`Eliminar referencia ${index + 1}`}
                  className="text-[11px] font-bold text-[var(--status-error)] hover:bg-[var(--status-error-subtle)] px-2 py-1 rounded uppercase tracking-wider transition-colors flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary-glow)]"
                >
                  <Trash2 className="w-3 h-3" /> Eliminar referencia
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Nombre y apellido"
                  value={ref.fullName}
                  onChange={(e) => updateReference(ref.id, { fullName: e.target.value })}
                />
                {showErrors && !ref.fullName && <p className="text-xs text-[var(--status-error)] font-medium mt-1">Este dato es necesario para continuar.</p>}
              </div>
              <Input
                label="Relación"
                value={ref.relationship}
                onChange={(e) => updateReference(ref.id, { relationship: e.target.value })}
              />
              <Input
                label="Empresa"
                value={ref.company}
                onChange={(e) => updateReference(ref.id, { company: e.target.value })}
              />
              <div>
                <Input
                  label="Email"
                  type="email"
                  value={ref.email}
                  onChange={(e) => updateReference(ref.id, { email: e.target.value })}
                />
                {showErrors && !ref.email && <p className="text-xs text-[var(--status-error)] font-medium mt-1">Este dato es necesario para continuar.</p>}
              </div>
              <Input
                label="Teléfono"
                value={ref.phone}
                onChange={(e) => updateReference(ref.id, { phone: e.target.value })}
              />
            </div>
          </div>
        ))}

        {references.length < 3 && (
          <Button type="button" variant="secondary" onClick={addReference} className="w-full min-h-[48px] border-dashed bg-transparent hover:bg-[var(--bg-elevated)]">
            <Plus className="w-4 h-4 mr-1.5" /> Agregar referencia
          </Button>
        )}

        {hasError && (
          <p className="text-sm font-medium text-[var(--status-error)] mt-2 bg-[var(--status-error-subtle)] px-3 py-2 rounded">
            Revisá los datos obligatorios de las referencias para continuar.
          </p>
        )}
      </div>
    </StepShell>
  );
}

function FilesStep({ data, updateData }: Pick<WizardStepProps, 'data' | 'updateData'>) {
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'w8' | 'qr_binance') => {
    const file = e.target.files?.[0];
    if (file) {
      updateData({
        files: [...(data.files || []), {
          id: uuidv4(),
          fileType,
          name: file.name,
          sizeBytes: file.size,
        }]
      });
    }
  };

  const removeFile = (id: string) => {
    updateData({ files: data.files.filter((f: any) => f.id !== id) });
  };

  const hasW8 = data.files?.some((f: any) => f.fileType === 'w8');
  const hasQr = data.files?.some((f: any) => f.fileType === 'qr_binance');

  return (
    <StepShell
      title="Documentación"
      helper="Subí los archivos adicionales requeridos para tu método de cobro."
    >
      <div className="space-y-6">
        {data.needsW8 && (
          <div className="bg-[var(--bg-base)] rounded-xl p-6 border border-dashed border-[var(--border-default)] text-center">
            <div className="mx-auto w-12 h-12 bg-[var(--bg-elevated)] rounded-full flex items-center justify-center mb-3">
              <FileText className="w-6 h-6 text-[var(--text-tertiary)]" />
            </div>
            <p className="text-sm font-bold text-[var(--text-primary)] mb-1">Formulario W-8</p>
            <p className="text-xs text-[var(--text-secondary)] mb-4">Requerido para transferencias internacionales.</p>

            {hasW8 ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--status-success-subtle)] text-[var(--status-success)] text-xs font-bold rounded">
                <CheckCircle className="w-4 h-4" /> Subido
              </span>
            ) : (
              <>
                <input type="file" accept=".pdf" className="hidden" id="w8-upload" onChange={(e) => handleUpload(e, 'w8')} />
                <label htmlFor="w8-upload" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-medium text-sm rounded-lg cursor-pointer hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors shadow-sm">
                  <Plus className="w-4 h-4" /> Seleccionar PDF
                </label>
              </>
            )}
          </div>
        )}

        {data.hasQrBinance && (
          <div className="bg-[var(--bg-base)] rounded-xl p-6 border border-dashed border-[var(--border-default)] text-center">
            <div className="mx-auto w-12 h-12 bg-[var(--bg-elevated)] rounded-full flex items-center justify-center mb-3">
              <FileText className="w-6 h-6 text-[var(--text-tertiary)]" />
            </div>
            <p className="text-sm font-bold text-[var(--text-primary)] mb-1">Captura del QR de tu wallet</p>
            <p className="text-xs text-[var(--text-secondary)] mb-4">Acelera la configuración del primer pago.</p>

            {hasQr ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--status-success-subtle)] text-[var(--status-success)] text-xs font-bold rounded">
                <CheckCircle className="w-4 h-4" /> Subido
              </span>
            ) : (
              <>
                <input type="file" accept="image/png,image/jpeg" className="hidden" id="qr-upload" onChange={(e) => handleUpload(e, 'qr_binance')} />
                <label htmlFor="qr-upload" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-medium text-sm rounded-lg cursor-pointer hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors shadow-sm">
                  <Plus className="w-4 h-4" /> Seleccionar imagen
                </label>
              </>
            )}
          </div>
        )}

        {data.files?.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-[var(--border-subtle)]">
            <p className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Archivos adjuntos</p>
            {data.files.map((file: any) => (
              <div key={file.id} className="flex items-center justify-between bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg px-4 py-3 shadow-sm">
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-[var(--text-primary)] truncate">{file.name}</span>
                  <span className="text-xs text-[var(--text-secondary)] font-mono mt-0.5">{file.fileType.toUpperCase()} • {Math.round(file.sizeBytes / 1024)} KB</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(file.id)}
                  aria-label={`Eliminar archivo ${file.name}`}
                  className="p-2 text-[var(--text-tertiary)] hover:text-[var(--status-error)] hover:bg-[var(--status-error-subtle)] rounded-md transition-colors flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary-glow)]"
                  title="Eliminar archivo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </StepShell>
  );
}

function ReviewStep({ data }: Pick<WizardStepProps, 'data'>) {
  const missingFiles = (data.needsW8 && !data.files?.some((f: any) => f.fileType === 'w8')) ||
                       (data.hasQrBinance && !data.files?.some((f: any) => f.fileType === 'qr_binance'));

  const missingRef = data.references?.length === 0 || data.references.some((r: Reference) => !r.fullName || !r.email);

  // Method-specific payment completeness — paymentMethod alone is not enough.
  const isPaymentComplete = (() => {
    if (data.paymentMethod === 'CBU') {
      return !!data.cbu;
    }
    if (data.paymentMethod === 'WIRE') {
      return !!data.bankName && !!data.accountNumber && !!data.swift;
    }
    if (data.paymentMethod === 'CRYPTO') {
      return !!data.walletType && !!data.walletAddress;
    }
    return false;
  })();

  const isReady = !missingFiles && !missingRef && data.taxIdType && data.taxIdValue && isPaymentComplete;

  return (
    <StepShell
      title="Revisión"
      helper="Revisá el estado de tu información antes de enviar."
    >
      <div className="space-y-3 mb-8">
        <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-base)] border border-[var(--border-subtle)]">
          <span className="text-sm font-bold text-[var(--text-primary)]">Identificación fiscal</span>
          {data.taxIdType && data.taxIdValue ? <CheckCircle2 className="w-5 h-5 text-[var(--status-success)]" /> : <AlertTriangle className="w-5 h-5 text-[var(--status-error)]" />}
        </div>
        <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-base)] border border-[var(--border-subtle)]">
          <span className="text-sm font-bold text-[var(--text-primary)]">Datos de cobro</span>
          {isPaymentComplete ? <CheckCircle2 className="w-5 h-5 text-[var(--status-success)]" /> : <AlertTriangle className="w-5 h-5 text-[var(--status-error)]" />}
        </div>
        <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-base)] border border-[var(--border-subtle)]">
          <span className="text-sm font-bold text-[var(--text-primary)]">Referencias</span>
          {!missingRef ? <CheckCircle2 className="w-5 h-5 text-[var(--status-success)]" /> : <AlertTriangle className="w-5 h-5 text-[var(--status-error)]" />}
        </div>
        {(data.needsW8 || data.hasQrBinance) && (
          <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-base)] border border-[var(--border-subtle)]">
            <span className="text-sm font-bold text-[var(--text-primary)]">Documentación</span>
            {!missingFiles ? <CheckCircle2 className="w-5 h-5 text-[var(--status-success)]" /> : <AlertTriangle className="w-5 h-5 text-[var(--status-warning)]" />}
          </div>
        )}
      </div>

      <div className={cn(
        "rounded-xl p-5 text-center border",
        isReady ? "bg-[var(--brand-primary-subtle)] border-[var(--brand-primary)]/20" : "bg-[var(--status-warning-subtle)] border-[var(--status-warning)]/20"
      )}>
        <p className={cn("text-base font-bold mb-1.5", isReady ? "text-[var(--brand-primary)]" : "text-[var(--status-warning)]")}>
          {isReady ? "Todo listo para enviar" : "Hay datos pendientes"}
        </p>
        <p className="text-sm font-medium text-[var(--text-primary)]">
          RRHH revisará tus datos y continuará con el alta operativa.
        </p>
      </div>
    </StepShell>
  );
}

function SuccessState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6 py-12 max-w-md mx-auto">
      <div className="w-24 h-24 bg-[var(--status-success-subtle)] rounded-full flex items-center justify-center mb-6 shadow-sm">
        <ShieldCheck className="w-12 h-12 text-[var(--status-success)]" />
      </div>
      <h2 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight mb-3">
        Formulario enviado
      </h2>
      <p className="text-base text-[var(--text-secondary)] mb-8 leading-relaxed">
        Gracias. RRHH ya recibió tus datos y continuará con el alta operativa.
      </p>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-4 w-full">
        <p className="text-sm font-medium text-[var(--text-primary)]">
          Si necesitás corregir algo, contactá al equipo de Personas de Zafirus.
        </p>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────

export function CandidateWizard({ token }: { token: string }) {
  const { getCaseByToken, updateCandidateData, submitCandidateForm } = useStore();
  const caseData = getCaseByToken(token);

  const [step, setStep] = useState(1);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    if (caseData?.candidateData?.currentStep) {
      setStep(caseData.candidateData.currentStep);
    }
  }, [caseData?.candidateData?.currentStep]);

  if (!caseData) return null; // handled by CandidatePanel

  if (caseData.candidateData?.submittedAt && !caseData.correctionNote) {
    return <SuccessState />;
  }

  const { employee, candidateData, correctionNote } = caseData;
  const data = candidateData || {
    taxIdType: '', taxIdValue: '', paymentMethod: '', cbu: '', bankName: '', accountNumber: '', swift: '', beneficiaryAddress: '', needsW8: false, walletType: '', walletAddress: '', hasQrBinance: false, references: [], files: [], currentStep: 1, completedSteps: [], submittedAt: null, consolidated: false,
  };

  const updateData = (updates: Partial<typeof data>) => {
    updateCandidateData(caseData.id, updates);
  };

  const needsFiles = data.needsW8 || data.hasQrBinance;

  const getSteps = () => {
    const s = [
      { id: 1, title: 'Identificación' },
      { id: 2, title: 'Cobro' },
      { id: 3, title: 'Referencias' },
    ];
    if (needsFiles) s.push({ id: 4, title: 'Archivos' });
    s.push({ id: 5, title: 'Revisión' });
    return s;
  };

  const stepsList = getSteps();
  const currentIndex = stepsList.findIndex(s => s.id === step);
  const isLastStep = currentIndex === stepsList.length - 1;

  const canProceed = () => {
    if (step === 1) return !!data.taxIdType && !!data.taxIdValue;
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
      setShowErrors(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setShowErrors(false);
    const nextStepId = stepsList[currentIndex + 1].id;
    const completedSteps = [...(data.completedSteps || [])];
    if (!completedSteps.includes(step)) completedSteps.push(step);

    updateData({ currentStep: nextStepId, completedSteps });
    setStep(nextStepId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    setShowErrors(false);
    const prevStepId = stepsList[currentIndex - 1].id;
    updateData({ currentStep: prevStepId });
    setStep(prevStepId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = () => {
    submitCandidateForm(caseData.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex min-h-full flex-col bg-[var(--bg-subtle)]">
      <div className="flex-1 w-full max-w-2xl mx-auto flex flex-col pt-2 sm:pt-6">

        <CandidateWelcomeHeader employeeName={employee.name} />

        <div className="px-4 sm:px-6 w-full mt-4">
          <CorrectionNotice note={correctionNote} />

          <IntakeProgressStepper steps={stepsList} currentStepId={step} />

          {showErrors && <RequiredFieldsNotice />}

          <div className="mb-8">
            {step === 1 && <FiscalStep data={data} updateData={updateData} showErrors={showErrors} />}
            {step === 2 && <PaymentStep data={data} updateData={updateData} showErrors={showErrors} />}
            {step === 3 && <ReferencesStep data={data} updateData={updateData} showErrors={showErrors} />}
            {step === 4 && needsFiles && <FilesStep data={data} updateData={updateData} />}
            {step === 5 && <ReviewStep data={data} />}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 bg-[var(--bg-surface)] border-t border-[var(--border-subtle)] p-4 sm:p-5">
        <div className="max-w-2xl mx-auto flex flex-col-reverse gap-3 sm:flex-row sm:gap-0 sm:items-center sm:justify-between">
          <Button
            variant="secondary"
            onClick={goBack}
            disabled={currentIndex === 0}
            aria-label="Volver al paso anterior"
            className="min-h-[48px] px-4 sm:px-6 w-full sm:w-auto justify-center"
          >
            <ChevronLeft className="w-5 h-5 mr-1" /> <span className="hidden sm:inline">Atrás</span>
          </Button>

          {isLastStep ? (
            <Button
              onClick={handleSubmit}
              className="min-h-[48px] px-6 sm:px-8 shadow-sm text-sm sm:text-base w-full sm:w-auto justify-center"
            >
              Enviar formulario <Send className="w-5 h-5 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={goNext}
              className="min-h-[48px] px-6 sm:px-8 shadow-sm text-sm sm:text-base w-full sm:w-auto justify-center"
            >
              Siguiente <ChevronRight className="w-5 h-5 ml-1.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
