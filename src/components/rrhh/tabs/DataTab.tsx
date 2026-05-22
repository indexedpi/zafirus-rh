import React, { useState, useEffect } from 'react';
import { useStore } from '../../../store';
import { Button } from '../../ui/Button';
import {
  Copy,
  ExternalLink,
  Clock,
  CheckCircle2,
  User,
  MapPin,
  Briefcase,
  Shield,
  Users,
  Check,
  FileText,
  AlertTriangle,
  Building
} from 'lucide-react';
import { COUNTRIES, TEAMS, CONTRACT_TYPES, TAX_ID_TYPES, Employee } from '../../../types';
import { cn } from '../../../utils/cn';

// ─── SECTION HEADER SUBCOMPONENT ───
interface SectionHeaderProps {
  icon: React.ComponentType<any>;
  title: string;
  accentToken: string; // e.g., '--section-personal'
}

function SectionHeader({ icon: Icon, title, accentToken }: SectionHeaderProps) {
  return (
    <div className="border-b border-[var(--border-subtle)] pb-2.5 mb-4">

      <div className="flex items-center gap-2.5 pl-2.5 border-l" style={{ borderLeftColor: `var(${accentToken})` }}>
        <Icon className="w-4 h-4 text-[var(--text-secondary)]" aria-hidden="true" />
        <h4 className="text-xs font-bold tracking-wider text-[var(--text-secondary)] uppercase">
          {title}
        </h4>
      </div>
    </div>
  );
}

// ─── EDITABLE FIELD SUBCOMPONENT ───
interface EditableFieldProps {
  label: string;
  value: string | null;
  fieldKey: keyof Employee;
  type?: 'text' | 'date' | 'select';
  options?: { value: string; label: string }[];
  editingField: string | null;
  setEditingField: (key: string | null) => void;
  onSave: (fieldKey: keyof Employee, value: any) => void;
}

function EditableField({
  label,
  value,
  fieldKey,
  type = 'text',
  options = [],
  editingField,
  setEditingField,
  onSave,
  copyable = false
}: EditableFieldProps & { copyable?: boolean }) {
  const isEditing = editingField === fieldKey;
  const [localVal, setLocalVal] = useState(value || '');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    if (isEditing) {
      setLocalVal(value || '');
    }
  }, [value, isEditing]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setLocalVal(value || '');
      setEditingField(null);
    }
  };

  const handleSave = () => {
    if (localVal !== (value || '')) {
      onSave(fieldKey, localVal);
      setSaveStatus('Guardado');
      setTimeout(() => setSaveStatus(null), 2000);
    }
    setEditingField(null);
  };

  const handleBlur = () => {
    handleSave();
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (value) {
      navigator.clipboard.writeText(value);
      useStore.getState().addToast({ type: 'success', title: 'Copiado al portapapeles' });
    }
  };

  if (isEditing) {
    return (
      <div className="flex flex-col gap-1.5 min-w-0 min-h-[52px] justify-center">
        <span className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider leading-none">
          {label}
        </span>
        {type === 'select' ? (
          <select
            autoFocus
            value={localVal}
            onChange={(e) => setLocalVal(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border-focus)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary-glow)] min-h-[44px] transition-[border-color,box-shadow] duration-150 cursor-pointer"
          >
            <option value="" disabled>Seleccionar...</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            autoFocus
            type={type}
            value={localVal}
            onChange={(e) => setLocalVal(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border-focus)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary-glow)] min-h-[44px] transition-[border-color,box-shadow] duration-150"
          />
        )}
      </div>
    );
  }

  const displayValue = () => {
    if (!value) return <span className="text-[var(--text-disabled)] italic font-normal">No especificado</span>;
    if (type === 'select') {
      const found = options.find((o) => o.value === value);
      return found ? found.label : value;
    }
    if (type === 'date') {
      return new Date(value + 'T00:00:00').toLocaleDateString('es-AR', { dateStyle: 'medium' });
    }
    return value;
  };

  return (
    <div
      onClick={() => setEditingField(fieldKey)}
      className="flex flex-col gap-0.5 min-w-0 cursor-pointer group p-2 hover:bg-[var(--bg-subtle)] rounded-lg border border-transparent hover:border-[var(--border-default)] min-h-[52px] justify-center transition-[background-color,border-color] duration-150 focus-visible:outline-none focus-visible:border-[var(--border-focus)] focus-visible:ring-1 focus-visible:ring-[var(--brand-primary-glow)]"
      role="button"
      tabIndex={0}
      aria-label={`Editar ${label}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setEditingField(fieldKey);
        }
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider leading-none">
          {label}
        </span>
        {saveStatus && (
          <span className="text-[10px] text-[var(--status-success)] font-medium animate-fade-in">
            {saveStatus}
          </span>
        )}
      </div>
      <div className="relative mt-1">
        <span className={cn(
          'text-sm font-medium block truncate',
          !value ? 'text-[var(--text-disabled)] font-light' : 'text-[var(--text-primary)]'
        )}>
          {displayValue()}
        </span>
        <div className="absolute inset-y-0 right-0 hidden group-hover:flex items-center gap-1 bg-[var(--bg-elevated)] pl-2 pr-0.5 rounded">
          {copyable && value && (
            <button
              type="button"
              onClick={handleCopy}
              className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
              title="Copiar"
              aria-label="Copiar valor"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          )}
          <span className="text-[10px] text-[var(--brand-primary)] uppercase font-bold pr-1">
            editar
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── CHECK ITEM SUBCOMPONENT ───
interface CheckItemProps {
  label: string;
  done: boolean;
}

function CheckItem({ label, done }: CheckItemProps) {
  return (
    <div className="flex items-center gap-2 py-1">
      {done ? (
        <CheckCircle2 className="w-4 h-4 text-[var(--status-success)] flex-shrink-0" aria-hidden="true" />
      ) : (
        <div className="w-4 h-4 rounded-full border border-[var(--border-default)] flex-shrink-0" aria-hidden="true" />
      )}
      <span className={cn('text-xs transition-colors duration-150', done ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]')}>
        {label}
      </span>
    </div>
  );
}

// ─── STATUS INDICATOR SUBCOMPONENT ───
interface StatusIndicatorProps {
  submitted: boolean;
  consolidated: boolean;
  status: string;
}

function StatusIndicator({ submitted, consolidated, status }: StatusIndicatorProps) {
  let text = 'Pendiente';
  let colorToken = 'var(--text-tertiary)';

  if (consolidated) {
    text = 'Consolidado';
    colorToken = 'var(--status-success)';
  } else if (submitted) {
    text = 'Enviado';
    colorToken = 'var(--status-info)';
  } else if (status === 'candidate_invited') {
    text = 'Invitado';
    colorToken = 'var(--status-warning)';
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide">
      <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: colorToken }} />
      <span style={{ color: colorToken }}>{text}</span>
    </span>
  );
}

// ─── PAYMENT BADGE SUBCOMPONENT ───
interface PaymentBadgeProps {
  method: string | null;
}

function PaymentBadge({ method }: PaymentBadgeProps) {
  if (!method) return null;
  const styles: Record<string, string> = {
    CBU: 'bg-[var(--status-success-subtle)] text-[var(--status-success)] border border-[var(--status-success)]/15',
    WIRE: 'bg-[var(--status-info-subtle)] text-[var(--status-info)] border border-[var(--status-info)]/15',
    CRYPTO: 'bg-[var(--status-warning-subtle)] text-[var(--status-warning)] border border-[var(--status-warning)]/15',
  };
  return (
    <span className={cn('text-xs font-semibold px-2 py-0.5 rounded border font-mono uppercase tracking-wider', styles[method] || 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border-default)]')}>
      {method}
    </span>
  );
}

// ─── PROFILE SUMMARY PANEL SUBCOMPONENT ───
interface ProfileSummaryPanelProps {
  selectedCase: any;
  isPaymentComplete: boolean;
  fiscalStepDone: boolean;
  referencesStepDone: boolean;
  w8StepDone: boolean;
  qrStepDone: boolean;
}

function ProfileSummaryPanel({
  selectedCase,
  isPaymentComplete,
  fiscalStepDone,
  referencesStepDone,
  w8StepDone,
  qrStepDone,
}: ProfileSummaryPanelProps) {
  const { employee, candidateData } = selectedCase;
  const candidateConsolidated = candidateData?.consolidated === true;
  const candidateSubmitted = candidateData?.submittedAt != null;

  const toReview = [];
  const toActivate = [];
  const ready = [];

  if (employee.CUIT) {
    ready.push('CUIT consolidado');
  } else if (fiscalStepDone) {
    toReview.push('CUIT declarado (pendiente consolidar)');
  } else {
    toActivate.push('CUIT pendiente');
  }

  if (employee.CBU) {
    ready.push('CBU consolidado');
  } else if (isPaymentComplete) {
    toReview.push('CBU declarado (pendiente consolidar)');
  } else {
    toActivate.push('CBU pendiente');
  }

  if (referencesStepDone) {
    ready.push('Referencias cargadas');
  } else {
    toActivate.push('Referencias pendientes');
  }

  const needsFiles = candidateData?.needsW8 || candidateData?.hasQrBinance;
  const hasFiles = candidateData?.files && candidateData.files.length > 0;
  if (!needsFiles) {
    ready.push('Documentación validada');
  } else if (hasFiles) {
    toReview.push('Documentación declarada');
  } else {
    toActivate.push('Documentación pendiente');
  }

  if (!employee.corporateEmail) {
    toActivate.push('Email corporativo pendiente');
  } else {
    ready.push('Email corporativo listo');
  }

  if (candidateConsolidated) {
    ready.push('Datos consolidados');
  }

  return (
    <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] p-6 shadow-md">
      <SectionHeader icon={Shield} title="Validación de datos" accentToken="--brand-primary" />

      <div className="space-y-6 text-xs">
        {toReview.length > 0 && (
          <div>
            <h4 className="text-[11px] font-semibold text-[var(--status-warning)] uppercase tracking-wider mb-2">Faltan para revisar</h4>
            <ul className="space-y-1.5">
              {toReview.map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-[var(--text-primary)]">
                  <div className="w-1 h-1 rounded-full bg-[var(--status-warning)]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {toActivate.length > 0 && (
          <div>
            <h4 className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Faltan para activar</h4>
            <ul className="space-y-1.5">
              {toActivate.map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <div className="w-1 h-1 rounded-full bg-[var(--text-tertiary)]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {ready.length > 0 && (
          <div>
            <h4 className="text-[11px] font-semibold text-[var(--status-success)] uppercase tracking-wider mb-2">Listo</h4>
            <ul className="space-y-1.5">
              {ready.map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <Check className="w-3.5 h-3.5 text-[var(--status-success)] flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export function DataTab() {
  const { getSelectedCase, updateEmployee, consolidateCandidateData, sendCandidateForm, addToast } = useStore();
  const selectedCase = getSelectedCase();
  const [editingField, setEditingField] = useState<string | null>(null);

  if (!selectedCase) return null;

  const { employee, candidateData, candidateToken, status } = selectedCase;

  const handleFieldSave = (key: keyof Employee, value: any) => {
    updateEmployee(selectedCase.id, { [key]: value });
    setEditingField(null);
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/#candidate=${candidateToken}`;
    navigator.clipboard.writeText(link);
    addToast({ type: 'success', title: 'Enlace copiado al portapapeles' });
  };

  const handleConsolidate = () => {
    consolidateCandidateData(selectedCase.id);
  };

  const handleSendInvite = () => {
    sendCandidateForm(selectedCase.id);
  };

  const candidateSubmitted = candidateData?.submittedAt != null;
  const candidateConsolidated = candidateData?.consolidated === true;

  // Payment completeness by selected method
  const isPaymentComplete = (() => {
    if (!candidateData) return false;
    if (candidateData.paymentMethod === 'CBU') {
      return !!candidateData.cbu;
    }
    if (candidateData.paymentMethod === 'WIRE') {
      return !!candidateData.bankName && !!candidateData.accountNumber && !!candidateData.swift;
    }
    if (candidateData.paymentMethod === 'CRYPTO') {
      return !!candidateData.walletType && !!candidateData.walletAddress;
    }
    return false;
  })();

  // Candidate info rows
  const taxIdType = TAX_ID_TYPES.find(t => t.code === candidateData?.taxIdType);

  // Dynamic steps verification
  const fiscalStepDone = !!candidateData?.taxIdType && !!candidateData?.taxIdValue;
  const referencesStepDone = (candidateData?.references?.length ?? 0) > 0;
  const w8StepDone = !candidateData?.needsW8 || (candidateData?.files?.some(f => f.fileType === 'w8') ?? false);
  const qrStepDone = !candidateData?.hasQrBinance || (candidateData?.files?.some(f => f.fileType === 'qr_binance') ?? false);
  const paymentStepDone = isPaymentComplete;

  return (
    <div className="space-y-6">
      {/* ─── Main Split Layout ─── */}
      <div className="flex flex-col lg:flex-row items-start gap-6 relative">
        {/* Left Column (Cards) */}
        <div className="flex-1 w-full space-y-6 min-w-0">
          {/* Employee Data Card */}
          <div className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)] p-6" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <SectionHeader icon={User} title="Datos de Directorio del Empleado" accentToken="--section-personal" />

            <div className="space-y-6">
              {/* Personal Data */}
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <EditableField
                    label="Nombre"
                    value={employee.name}
                    fieldKey="name"
                    copyable
                    editingField={editingField}
                    setEditingField={setEditingField}
                    onSave={handleFieldSave}
                  />
                  <EditableField
                    label="Apellido"
                    value={employee.lastName}
                    fieldKey="lastName"
                    copyable
                    editingField={editingField}
                    setEditingField={setEditingField}
                    onSave={handleFieldSave}
                  />
                  <EditableField
                    label="Email Personal"
                    value={employee.email}
                    fieldKey="email"
                    copyable
                    editingField={editingField}
                    setEditingField={setEditingField}
                    onSave={handleFieldSave}
                  />
                  <EditableField
                    label="Documento / DNI"
                    value={employee.CI}
                    fieldKey="CI"
                    copyable
                    editingField={editingField}
                    setEditingField={setEditingField}
                    onSave={handleFieldSave}
                  />
                  <EditableField
                    label="Fecha de Nacimiento"
                    value={employee.birthday}
                    fieldKey="birthday"
                    type="date"
                    editingField={editingField}
                    setEditingField={setEditingField}
                    onSave={handleFieldSave}
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <SectionHeader icon={MapPin} title="Ubicación Física Principal" accentToken="--section-location" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <EditableField
                    label="País"
                    value={employee.countryId}
                    fieldKey="countryId"
                    type="select"
                    options={COUNTRIES.map(c => ({ value: c.code, label: c.name }))}
                    editingField={editingField}
                    setEditingField={setEditingField}
                    onSave={handleFieldSave}
                  />
                  <EditableField
                    label="Provincia / Estado"
                    value={employee.provinceId}
                    fieldKey="provinceId"
                    editingField={editingField}
                    setEditingField={setEditingField}
                    onSave={handleFieldSave}
                  />
                  <EditableField
                    label="Ciudad"
                    value={employee.cityId}
                    fieldKey="cityId"
                    editingField={editingField}
                    setEditingField={setEditingField}
                    onSave={handleFieldSave}
                  />
                </div>
              </div>

              {/* Work Position */}
              <div>
                <SectionHeader icon={Briefcase} title="Asignación Operativa" accentToken="--section-work" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <EditableField
                    label="Fecha de Inicio"
                    value={employee.startDate}
                    fieldKey="startDate"
                    type="date"
                    editingField={editingField}
                    setEditingField={setEditingField}
                    onSave={handleFieldSave}
                  />
                  <EditableField
                    label="Rol / Puesto"
                    value={employee.role}
                    fieldKey="role"
                    editingField={editingField}
                    setEditingField={setEditingField}
                    onSave={handleFieldSave}
                  />
                  <EditableField
                    label="Equipo"
                    value={employee.team}
                    fieldKey="team"
                    type="select"
                    options={TEAMS}
                    editingField={editingField}
                    setEditingField={setEditingField}
                    onSave={handleFieldSave}
                  />
                  <EditableField
                    label="Tipo de Contrato"
                    value={employee.contractType}
                    fieldKey="contractType"
                    type="select"
                    options={CONTRACT_TYPES}
                    editingField={editingField}
                    setEditingField={setEditingField}
                    onSave={handleFieldSave}
                  />
                  <EditableField
                    label="Responsable Directo"
                    value={employee.managerName}
                    fieldKey="managerName"
                    editingField={editingField}
                    setEditingField={setEditingField}
                    onSave={handleFieldSave}
                  />
                </div>
              </div>

              {/* Consolidated Data */}
              <div>
                <SectionHeader icon={CheckCircle2} title="Datos Fiscales y de Cobro Consolidados" accentToken="--section-fiscal" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <EditableField
                    label="CUIT / CUIL Consolidado"
                    value={employee.CUIT}
                    fieldKey="CUIT"
                    editingField={editingField}
                    setEditingField={setEditingField}
                    onSave={handleFieldSave}
                  />
                  <EditableField
                    label="CBU Consolidado"
                    value={employee.CBU}
                    fieldKey="CBU"
                    editingField={editingField}
                    setEditingField={setEditingField}
                    onSave={handleFieldSave}
                  />
                  <EditableField
                    label="Email Corporativo"
                    value={employee.corporateEmail}
                    fieldKey="corporateEmail"
                    copyable
                    editingField={editingField}
                    setEditingField={setEditingField}
                    onSave={handleFieldSave}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Candidate Data Card */}
          <div className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)] p-6" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center justify-between mb-4">
              <SectionHeader icon={Users} title="Declaración Jurada del Candidato" accentToken="--section-payment" />
              <StatusIndicator submitted={candidateSubmitted} consolidated={candidateConsolidated} status={status} />
            </div>

            {/* ── State 1: No invite yet ── */}
            {!candidateSubmitted && status === 'draft' && (
              <div className="text-center py-8 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] flex flex-col items-center">
                <Clock className="w-10 h-10 text-[var(--text-tertiary)] mb-3 animate-pulse" />
                <p className="text-sm font-medium text-[var(--text-secondary)] max-w-md">
                  El portal de declaración jurada no ha sido enviado.
                </p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1 max-w-sm mb-4">
                  Envía el formulario al candidato para iniciar la carga de datos.
                </p>
                <Button onClick={handleSendInvite} className="min-h-[44px]">
                  Enviar formulario de onboarding
                </Button>
              </div>
            )}

            {/* ── State 2: Invited but not submitted ── */}
            {!candidateSubmitted && status === 'candidate_invited' && (
              <div className="text-center py-8 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] flex flex-col items-center">
                <Clock className="w-10 h-10 text-[var(--text-tertiary)] mb-3" />
                <p className="text-sm font-medium text-[var(--text-secondary)] max-w-md">
                  Esperando respuesta del candidato.
                </p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1 max-w-sm mb-5">
                  El candidato ha recibido el token. Debe completar CUIT, referencias y método de cobro.
                </p>
                <div className="flex items-center justify-center flex-wrap gap-2 max-w-md">
                  <Button variant="secondary" size="sm" onClick={handleCopyLink} className="min-h-[44px] px-4">
                    <Copy className="w-4 h-4 flex-shrink-0" />
                    <span>Copiar enlace de formulario</span>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => window.open(`#candidate=${candidateToken}`, '_blank')} className="min-h-[44px] px-4">
                    <ExternalLink className="w-4 h-4 flex-shrink-0" />
                    <span>Abrir formulario de candidato</span>
                  </Button>
                </div>
              </div>
            )}

            {/* ── State 3: Submitted and Consolidated checks ── */}
            {candidateSubmitted && (
              <div className="space-y-6">
                {/* Checklist & Fast verification */}
                <div className="px-4 py-3 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)]">
                  <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2.5">
                    Lista de Control Operativo
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
                    <CheckItem label="Identificador Fiscal" done={fiscalStepDone} />
                    <CheckItem label="Método de Cobro" done={paymentStepDone} />
                    <CheckItem label="Referencias Registradas" done={referencesStepDone} />
                    <CheckItem label="Documento W-8" done={w8StepDone} />
                    <CheckItem label="Código QR" done={qrStepDone} />
                    <CheckItem label="Auditoría Verificada" done={candidateSubmitted && candidateConsolidated} />
                  </div>
                </div>

                {/* Declared values */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-[var(--border-subtle)] pt-5">
                  <div>
                    <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">
                      Identificación Fiscal
                    </p>
                    <div className="space-y-2 bg-[var(--bg-surface)] p-3 rounded-lg border border-[var(--border-subtle)]">
                      <div className="flex justify-between text-xs">
                        <span className="text-[var(--text-secondary)]">Tipo declarado:</span>
                        <span className="font-medium text-[var(--text-primary)]">{taxIdType?.label || candidateData?.taxIdType || 'Ninguno'}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-[var(--text-secondary)]">Valor declarado:</span>
                        <span className="font-mono font-semibold text-[var(--brand-primary)] select-all">{candidateData?.taxIdValue || '—'}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                        Método de Cobro
                      </p>
                      <PaymentBadge method={candidateData?.paymentMethod || null} />
                    </div>
                    <div className="space-y-2 bg-[var(--bg-surface)] p-3 rounded-lg border border-[var(--border-subtle)]">
                      <div className="flex justify-between text-xs">
                        <span className="text-[var(--text-secondary)]">Método seleccionado:</span>
                        <span className="font-medium text-[var(--text-primary)]">
                          {candidateData?.paymentMethod === 'CBU' ? 'CBU (Argentina)' :
                           candidateData?.paymentMethod === 'WIRE' ? 'Transferencia Bancaria' :
                           candidateData?.paymentMethod === 'CRYPTO' ? 'Liquidación Crypto' : '—'}
                        </span>
                      </div>
                      {candidateData?.paymentMethod === 'CBU' && (
                        <div className="flex justify-between text-xs">
                          <span className="text-[var(--text-secondary)]">CBU:</span>
                          <span className="font-mono font-semibold text-[var(--brand-primary)] select-all">{candidateData.cbu || '—'}</span>
                        </div>
                      )}
                      {candidateData?.paymentMethod === 'WIRE' && (
                        <div className="text-xs space-y-1">
                          <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Banco:</span><span className="text-[var(--text-primary)] truncate max-w-[120px]">{candidateData.bankName}</span></div>
                          <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Cuenta:</span><span className="font-mono">{candidateData.accountNumber}</span></div>
                          <div className="flex justify-between"><span className="text-[var(--text-secondary)]">SWIFT:</span><span className="font-mono">{candidateData.swift}</span></div>
                        </div>
                      )}
                      {candidateData?.paymentMethod === 'CRYPTO' && (
                        <div className="text-xs space-y-1">
                          <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Wallet:</span><span className="text-[var(--text-primary)]">{candidateData.walletType}</span></div>
                          <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Dirección:</span><span className="font-mono truncate max-w-[120px]">{candidateData.walletAddress}</span></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* References & Files Lists */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-[var(--border-subtle)] pt-5">
                  <div>
                    <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">
                      Referencias Laborales ({candidateData?.references?.length || 0})
                    </p>
                    {candidateData?.references && candidateData.references.length > 0 ? (
                      <div className="space-y-2">
                        {candidateData.references.map((ref) => (
                          <div key={ref.id} className="bg-[var(--bg-surface)] p-2.5 rounded-lg border border-[var(--border-subtle)] text-xs">
                            <div className="flex justify-between font-medium text-[var(--text-primary)]">
                              <span>{ref.fullName}</span>
                              <span className="text-[var(--text-tertiary)]">{ref.relationship}</span>
                            </div>
                            <div className="flex justify-between text-[var(--text-secondary)] mt-1">
                              <span>{ref.company}</span>
                              <span>{ref.phone || ref.email}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[var(--text-tertiary)] italic font-light">Sin referencias declaradas.</p>
                    )}
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">
                                            Documentación
                    </p>
                    {(!candidateData?.needsW8 && !candidateData?.hasQrBinance) ? (
                      <p className="text-xs text-[var(--text-tertiary)] italic font-light">No se requieren archivos adicionales para este caso.</p>
                    ) : (candidateData?.files && candidateData.files.length > 0) ? (
                      <div className="space-y-2">
                        {candidateData.files.map((file) => (
                          <div key={file.id} className="bg-[var(--bg-surface)] p-2.5 rounded-lg border border-[var(--border-subtle)] text-xs flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <div className="truncate max-w-[160px]">
                                <p className="font-medium text-[var(--text-primary)] truncate">{file.name}</p>
                                <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5 font-mono uppercase">{file.fileType} • {Math.round(file.sizeBytes / 1024)} KB</p>
                              </div>
                              <span className="text-[10px] text-[var(--status-success)] font-medium px-1.5 py-0.5 rounded bg-[var(--status-success-subtle)]">
                                Subido
                              </span>
                            </div>
                            <div className="flex items-center gap-2 border-t border-[var(--border-subtle)] pt-2">
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(file.name); useStore.getState().addToast({ type: 'success', title: 'Copiado al portapapeles' }); }}
                                className="text-[10px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 uppercase tracking-wider"
                              >
                                <Copy className="w-3 h-3" /> Copiar nombre
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[var(--status-warning)] italic font-medium">Archivos pendientes</p>
                    )}
                  </div>
                </div>

                                {/* Consolidation CTA Area */}
                <div className="border-t border-[var(--border-subtle)] pt-6">
                  {!candidateConsolidated ? (
                    <div className="p-4 bg-[var(--brand-primary-subtle)] border border-[var(--brand-primary)]/20 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                          <Shield className="w-4 h-4 text-[var(--brand-primary)]" />
                          Consolidar datos del candidato
                        </p>
                        <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-md leading-relaxed">
                          Esta acción copia los datos fiscales y de cobro al perfil operativo del empleado.
                        </p>
                      </div>
                      <Button onClick={handleConsolidate} className="w-full sm:w-auto min-h-[44px] flex-shrink-0 px-5">
                        Consolidar datos del candidato
                      </Button>
                    </div>
                  ) : (
                    <div className="p-4 bg-[var(--status-success-subtle)] border border-[var(--status-success)]/20 rounded-lg flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[var(--status-success)] flex-shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-[var(--status-success)]">
                          Datos consolidados
                        </p>
                        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                          CUIT • CBU / datos de cobro
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Right Column (ProfileSummaryPanel) */}
        <div className="w-full lg:w-80 flex-shrink-0 lg:sticky lg:top-4 space-y-4">
          <ProfileSummaryPanel
            selectedCase={selectedCase}
            isPaymentComplete={isPaymentComplete}
            fiscalStepDone={fiscalStepDone}
            referencesStepDone={referencesStepDone}
            w8StepDone={w8StepDone}
            qrStepDone={qrStepDone}
          />
        </div>
      </div>
    </div>
  );
}
