import React, { useState, useEffect } from 'react';
import { useStore } from '../../../store';
import { Button } from '../../ui/Button';
import {
  Copy, ExternalLink, Clock, CheckCircle2, User, MapPin, Briefcase,
  Shield, Users, Check, AlertTriangle, Building2, Landmark, CreditCard,
} from 'lucide-react';
import { COUNTRIES, TEAMS, CONTRACT_TYPES, TAX_ID_TYPES, Employee } from '../../../types';
import { cn } from '../../../utils/cn';

// ─── SECTION COLOR PALETTE ───────────────────────────────────────────────────
// Mirrors --section-* tokens in index.css, used for icon pill + label tint
const C = {
  directory:  '#459CDB',  // brand blue    — identity/profile
  location:   '#27AE60',  // emerald       — location
  work:       '#9B51E0',  // violet        — role/structure
  fiscal:     '#F2994A',  // amber         — consolidated operational
  candidate:  '#0891B2',  // cyan          — candidate declared data
  docs:       '#64748B',  // slate         — documentation
  payment:    '#2D9CDB',  // sky blue      — payment method
} as const;

// ─── CATEGORY HEADER ─────────────────────────────────────────────────────────

interface CategoryHeaderProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  color: string;
  helper?: string;
}

function CategoryHeader({ icon: Icon, label, color, helper }: CategoryHeaderProps) {
  return (
    <div className="flex items-start gap-3 pb-3 mb-4 border-b border-[var(--border-subtle)]">
      <span
        className="flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0 mt-0.5"
        style={{ backgroundColor: color + '18' }}
        aria-hidden="true"
      >
        <Icon className="w-3.5 h-3.5" style={{ color }} />
      </span>
      <div className="min-w-0">
        <span className="text-[11px] font-bold uppercase tracking-wider block leading-snug" style={{ color }}>
          {label}
        </span>
        {helper && (
          <span className="text-[11px] text-[var(--text-tertiary)] mt-0.5 block">{helper}</span>
        )}
      </div>
    </div>
  );
}

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────

interface StatusBadgeProps {
  submitted: boolean;
  consolidated: boolean;
  caseStatus: string;
}

function StatusBadge({ submitted, consolidated, caseStatus }: StatusBadgeProps) {
  if (consolidated) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--status-success)] bg-[var(--status-success-subtle)] px-2 py-0.5 rounded border border-[var(--status-success)]/20 flex-shrink-0 uppercase tracking-wider">
        <Check className="w-3 h-3" aria-hidden="true" /> Consolidado
      </span>
    );
  }
  if (submitted) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--status-info)] bg-[var(--status-info-subtle)] px-2 py-0.5 rounded border border-[var(--status-info)]/20 flex-shrink-0 uppercase tracking-wider">
        <CheckCircle2 className="w-3 h-3" aria-hidden="true" /> Enviado
      </span>
    );
  }
  if (caseStatus === 'candidate_invited') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--status-warning)] bg-[var(--status-warning-subtle)] px-2 py-0.5 rounded border border-[var(--status-warning)]/20 flex-shrink-0 uppercase tracking-wider">
        <Clock className="w-3 h-3" aria-hidden="true" /> Esperando
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--text-tertiary)] bg-[var(--bg-subtle)] px-2 py-0.5 rounded border border-[var(--border-default)] flex-shrink-0 uppercase tracking-wider">
      <Clock className="w-3 h-3" aria-hidden="true" /> Pendiente
    </span>
  );
}

// ─── PAYMENT BADGE ────────────────────────────────────────────────────────────

function PaymentBadge({ method }: { method: string | null }) {
  if (!method) return null;
  const styles: Record<string, string> = {
    CBU:    'bg-[var(--status-success-subtle)] text-[var(--status-success)] border-[var(--status-success)]/15',
    WIRE:   'bg-[var(--status-info-subtle)] text-[var(--status-info)] border-[var(--status-info)]/15',
    CRYPTO: 'bg-[var(--status-warning-subtle)] text-[var(--status-warning)] border-[var(--status-warning)]/15',
  };
  return (
    <span className={cn(
      'text-[10px] font-bold px-1.5 py-0.5 rounded border font-mono uppercase tracking-wider',
      styles[method] ?? 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border-default)]'
    )}>
      {method}
    </span>
  );
}

// ─── EDITABLE FIELD ───────────────────────────────────────────────────────────
// Full behavior preserved: Enter saves, Escape cancels, blur saves if changed,
// tab order works, copy button, "Guardado" feedback, missing state.

interface EditableFieldProps {
  label: string;
  value: string | null;
  fieldKey: keyof Employee;
  type?: 'text' | 'date' | 'select';
  options?: { value: string; label: string }[];
  copyable?: boolean;
  editingField: string | null;
  setEditingField: (key: string | null) => void;
  onSave: (fieldKey: keyof Employee, value: any) => void;
}

function EditableField({
  label, value, fieldKey, type = 'text', options = [],
  copyable = false, editingField, setEditingField, onSave,
}: EditableFieldProps) {
  const isEditing = editingField === fieldKey;
  const [localVal, setLocalVal] = useState(value || '');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    if (isEditing) setLocalVal(value || '');
  }, [value, isEditing]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); handleSave(); }
    else if (e.key === 'Escape') { setLocalVal(value || ''); setEditingField(null); }
  };

  const handleSave = () => {
    if (localVal !== (value || '')) {
      onSave(fieldKey, localVal);
      setSaveStatus('Guardado');
      setTimeout(() => setSaveStatus(null), 2000);
    }
    setEditingField(null);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (value) {
      navigator.clipboard.writeText(value);
      useStore.getState().addToast({ type: 'success', title: 'Copiado al portapapeles' });
    }
  };

  const displayValue = () => {
    if (!value) return <span className="text-[var(--text-disabled)] italic font-normal">No especificado</span>;
    if (type === 'select') {
      const found = options.find(o => o.value === value);
      return found ? found.label : value;
    }
    if (type === 'date') {
      return new Date(value + 'T00:00:00').toLocaleDateString('es-AR', { dateStyle: 'medium' });
    }
    return value;
  };

  if (isEditing) {
    return (
      <div className="flex flex-col gap-1.5 min-w-0 min-h-[52px] justify-center">
        <span className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
          {label}
        </span>
        {type === 'select' ? (
          <select
            autoFocus
            value={localVal}
            onChange={e => setLocalVal(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border-focus)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary-glow)] min-h-[44px] transition-[border-color,box-shadow] duration-150 cursor-pointer"
          >
            <option value="" disabled>Seleccionar...</option>
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        ) : (
          <input
            autoFocus
            type={type}
            value={localVal}
            onChange={e => setLocalVal(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border-focus)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary-glow)] min-h-[44px] transition-[border-color,box-shadow] duration-150"
          />
        )}
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-0.5 min-w-0 cursor-pointer group p-2 hover:bg-[var(--bg-subtle)] rounded-lg border border-transparent hover:border-[var(--border-default)] min-h-[52px] justify-center transition-[background-color,border-color] duration-150 focus-visible:outline-none focus-visible:border-[var(--border-focus)] focus-visible:ring-1 focus-visible:ring-[var(--brand-primary-glow)]"
      onClick={() => setEditingField(fieldKey)}
      role="button"
      tabIndex={0}
      aria-label={`Editar ${label}`}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setEditingField(fieldKey); }
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
          {label}
        </span>
        {saveStatus && (
          <span className="text-[10px] text-[var(--status-success)] font-medium animate-fade-in">
            {saveStatus}
          </span>
        )}
      </div>
      <div className="relative mt-0.5">
        <span className={cn('text-sm font-medium block truncate',
          !value ? 'text-[var(--text-disabled)] font-light italic' : 'text-[var(--text-primary)]'
        )}>
          {displayValue()}
        </span>
        <div className="absolute inset-y-0 right-0 hidden group-hover:flex items-center gap-1 bg-[var(--bg-elevated)] pl-2 pr-0.5 rounded">
          {copyable && value && (
            <button
              type="button"
              onClick={handleCopy}
              className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
              aria-label={`Copiar ${label}`}
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          )}
          <span className="text-[10px] text-[var(--brand-primary)] uppercase font-bold pr-1">editar</span>
        </div>
      </div>
    </div>
  );
}

// ─── CHECK ITEM ───────────────────────────────────────────────────────────────

function CheckItem({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center gap-2 py-0.5">
      {done
        ? <CheckCircle2 className="w-3.5 h-3.5 text-[var(--status-success)] flex-shrink-0" aria-hidden="true" />
        : <div className="w-3.5 h-3.5 rounded-full border-2 border-[var(--border-default)] flex-shrink-0" aria-hidden="true" />
      }
      <span className={cn('text-xs', done ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]')}>
        {label}
      </span>
    </div>
  );
}

// ─── DATA READINESS STRIP ─────────────────────────────────────────────────────

function DataReadinessStrip({ selectedCase }: { selectedCase: any }) {
  const { employee, candidateData, status } = selectedCase;

  const consolidated = candidateData?.consolidated === true;
  const submitted    = candidateData?.submittedAt != null;

  // Operational fields completeness: CUIT + CBU + corporateEmail
  const opFilled = [employee.CUIT, employee.CBU, employee.corporateEmail].filter(Boolean).length;

  const needsDocs = candidateData?.needsW8 || candidateData?.hasQrBinance;
  const hasDocs   = (candidateData?.files?.length ?? 0) > 0;

  const candidateColor = consolidated ? 'var(--status-success)'
    : submitted ? 'var(--status-info)'
    : 'var(--text-tertiary)';

  const candidateLabel = consolidated     ? 'Candidato consolidado'
    : submitted                           ? 'Formulario recibido'
    : status === 'candidate_invited'      ? 'Candidato invitado'
    : 'Formulario pendiente';

  const opColor = opFilled === 3 ? 'var(--status-success)'
    : opFilled > 0               ? 'var(--status-warning)'
    : 'var(--text-tertiary)';

  return (
    <div
      className="flex flex-wrap items-center gap-x-3 gap-y-2 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] px-4 py-3"
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider flex-shrink-0">
        Estado
      </span>
      <span className="w-px h-4 bg-[var(--border-subtle)] flex-shrink-0" aria-hidden="true" />

      {/* Candidate signal */}
      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium flex-shrink-0" style={{ color: candidateColor }}>
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: candidateColor }} aria-hidden="true" />
        {candidateLabel}
      </span>

      <span className="w-px h-4 bg-[var(--border-subtle)] flex-shrink-0 hidden sm:block" aria-hidden="true" />

      {/* Operational fields */}
      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium flex-shrink-0" style={{ color: opColor }}>
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: opColor }} aria-hidden="true" />
        Datos operativos {opFilled}/3
      </span>

      {needsDocs && (
        <>
          <span className="w-px h-4 bg-[var(--border-subtle)] flex-shrink-0 hidden sm:block" aria-hidden="true" />
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-medium flex-shrink-0"
            style={{ color: hasDocs ? 'var(--status-success)' : 'var(--status-warning)' }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: hasDocs ? 'var(--status-success)' : 'var(--status-warning)' }}
              aria-hidden="true"
            />
            {hasDocs ? 'Documentación declarada' : 'Documentación pendiente'}
          </span>
        </>
      )}
    </div>
  );
}

// ─── VALIDATION MODULE ────────────────────────────────────────────────────────
// Secondary sticky panel: readiness signals with color-coded items

interface ValidationModuleProps {
  selectedCase: any;
  isPaymentComplete: boolean;
  fiscalStepDone: boolean;
  referencesStepDone: boolean;
  w8StepDone: boolean;
  qrStepDone: boolean;
}

function ValidationModule({
  selectedCase, isPaymentComplete, fiscalStepDone,
  referencesStepDone, w8StepDone, qrStepDone,
}: ValidationModuleProps) {
  const { employee, candidateData } = selectedCase;
  const consolidated = candidateData?.consolidated === true;

  const toReview:   string[] = [];
  const toActivate: string[] = [];
  const ready:      string[] = [];

  if (employee.CUIT) {
    ready.push('CUIT consolidado');
  } else if (fiscalStepDone) {
    toReview.push('CUIT declarado — consolidar');
  } else {
    toActivate.push('CUIT pendiente');
  }

  if (employee.CBU) {
    ready.push('CBU consolidado');
  } else if (isPaymentComplete) {
    toReview.push('Cobro declarado — consolidar');
  } else {
    toActivate.push('Datos de cobro pendientes');
  }

  if (referencesStepDone) {
    ready.push('Referencias cargadas');
  } else {
    toActivate.push('Referencias pendientes');
  }

  const needsFiles = candidateData?.needsW8 || candidateData?.hasQrBinance;
  const hasFiles   = (candidateData?.files?.length ?? 0) > 0;
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

  if (consolidated) ready.push('Datos consolidados');

  return (
    <div
      className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] p-4"
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      <CategoryHeader
        icon={Shield}
        label="Validación"
        color={C.directory}
        helper="Completitud del caso"
      />

      <div className="space-y-4 text-xs">
        {toReview.length > 0 && (
          <div>
            <span className="text-[10px] font-bold text-[var(--status-warning)] uppercase tracking-wider block mb-2">
              Para revisar
            </span>
            <div className="space-y-1.5">
              {toReview.map((item, i) => (
                <div key={i} className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg bg-[var(--status-warning-subtle)] border border-[var(--status-warning)]/15">
                  <AlertTriangle className="w-3 h-3 text-[var(--status-warning)] flex-shrink-0" aria-hidden="true" />
                  <span className="text-[var(--text-primary)]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {toActivate.length > 0 && (
          <div>
            <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider block mb-2">
              Pendientes
            </span>
            <div className="space-y-1">
              {toActivate.map((item, i) => (
                <div key={i} className="flex items-center gap-2 py-1 px-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--border-default)] flex-shrink-0" aria-hidden="true" />
                  <span className="text-[var(--text-secondary)]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {ready.length > 0 && (
          <div>
            <span className="text-[10px] font-bold text-[var(--status-success)] uppercase tracking-wider block mb-2">
              Listo
            </span>
            <div className="space-y-1">
              {ready.map((item, i) => (
                <div key={i} className="flex items-center gap-2 py-1 px-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--status-success)] flex-shrink-0" aria-hidden="true" />
                  <span className="text-[var(--text-secondary)]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

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

  const candidateSubmitted    = candidateData?.submittedAt != null;
  const candidateConsolidated = candidateData?.consolidated === true;

  const isPaymentComplete = (() => {
    if (!candidateData) return false;
    if (candidateData.paymentMethod === 'CBU')    return !!candidateData.cbu;
    if (candidateData.paymentMethod === 'WIRE')   return !!candidateData.bankName && !!candidateData.accountNumber && !!candidateData.swift;
    if (candidateData.paymentMethod === 'CRYPTO') return !!candidateData.walletType && !!candidateData.walletAddress;
    return false;
  })();

  const taxIdType         = TAX_ID_TYPES.find(t => t.code === candidateData?.taxIdType);
  const fiscalStepDone    = !!candidateData?.taxIdType && !!candidateData?.taxIdValue;
  const referencesStepDone = (candidateData?.references?.length ?? 0) > 0;
  const w8StepDone        = !candidateData?.needsW8 || (candidateData?.files?.some(f => f.fileType === 'w8') ?? false);
  const qrStepDone        = !candidateData?.hasQrBinance || (candidateData?.files?.some(f => f.fileType === 'qr_binance') ?? false);

  return (
    <div className="space-y-4 pb-6">
      {/* ── Data readiness strip ── */}
      <DataReadinessStrip selectedCase={selectedCase} />

      {/* ── Main split layout ── */}
      <div className="flex flex-col lg:flex-row items-start gap-4">

        {/* Primary column: category section cards */}
        <div className="flex-1 w-full space-y-4 min-w-0">

          {/* ─ Directorio operativo ─ */}
          <div
            className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] p-4"
            style={{ boxShadow: 'var(--shadow-sm)' }}
          >
            <CategoryHeader
              icon={User}
              label="Directorio operativo"
              color={C.directory}
              helper="Datos identificatorios del empleado"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div id="dtab-field-name">
                <EditableField
                  label="Nombre" value={employee.name} fieldKey="name" copyable
                  editingField={editingField} setEditingField={setEditingField} onSave={handleFieldSave}
                />
              </div>
              <EditableField
                label="Apellido" value={employee.lastName} fieldKey="lastName" copyable
                editingField={editingField} setEditingField={setEditingField} onSave={handleFieldSave}
              />
              <EditableField
                label="Email personal" value={employee.email} fieldKey="email" copyable
                editingField={editingField} setEditingField={setEditingField} onSave={handleFieldSave}
              />
              <EditableField
                label="Documento / DNI" value={employee.CI} fieldKey="CI" copyable
                editingField={editingField} setEditingField={setEditingField} onSave={handleFieldSave}
              />
              <EditableField
                label="Fecha de nacimiento" value={employee.birthday} fieldKey="birthday" type="date"
                editingField={editingField} setEditingField={setEditingField} onSave={handleFieldSave}
              />
            </div>
          </div>

          {/* ─ Ubicación ─ */}
          <div
            className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] p-4"
            style={{ boxShadow: 'var(--shadow-sm)' }}
          >
            <CategoryHeader
              icon={MapPin}
              label="Ubicación"
              color={C.location}
              helper="País, provincia y ciudad de residencia"
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <EditableField
                label="País" value={employee.countryId} fieldKey="countryId" type="select"
                options={COUNTRIES.map(c => ({ value: c.code, label: c.name }))}
                editingField={editingField} setEditingField={setEditingField} onSave={handleFieldSave}
              />
              <EditableField
                label="Provincia / Estado" value={employee.provinceId} fieldKey="provinceId"
                editingField={editingField} setEditingField={setEditingField} onSave={handleFieldSave}
              />
              <EditableField
                label="Ciudad" value={employee.cityId} fieldKey="cityId"
                editingField={editingField} setEditingField={setEditingField} onSave={handleFieldSave}
              />
            </div>
          </div>

          {/* ─ Rol y estructura ─ */}
          <div
            className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] p-4"
            style={{ boxShadow: 'var(--shadow-sm)' }}
          >
            <CategoryHeader
              icon={Briefcase}
              label="Rol y estructura"
              color={C.work}
              helper="Asignación operativa y dependencia funcional"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div id="dtab-field-startDate">
                <EditableField
                  label="Fecha de inicio" value={employee.startDate} fieldKey="startDate" type="date"
                  editingField={editingField} setEditingField={setEditingField} onSave={handleFieldSave}
                />
              </div>
              <EditableField
                label="Rol / Puesto" value={employee.role} fieldKey="role"
                editingField={editingField} setEditingField={setEditingField} onSave={handleFieldSave}
              />
              <EditableField
                label="Equipo" value={employee.team} fieldKey="team" type="select" options={TEAMS}
                editingField={editingField} setEditingField={setEditingField} onSave={handleFieldSave}
              />
              <EditableField
                label="Tipo de contrato" value={employee.contractType} fieldKey="contractType" type="select" options={CONTRACT_TYPES}
                editingField={editingField} setEditingField={setEditingField} onSave={handleFieldSave}
              />
              <div id="dtab-field-managerName">
                <EditableField
                  label="Responsable directo" value={employee.managerName} fieldKey="managerName"
                  editingField={editingField} setEditingField={setEditingField} onSave={handleFieldSave}
                />
              </div>
            </div>
          </div>

          {/* ─ Datos operativos (post-consolidación) ─ */}
          <div
            className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] p-4"
            style={{ boxShadow: 'var(--shadow-sm)' }}
          >
            <CategoryHeader
              icon={Building2}
              label="Datos operativos"
              color={C.fiscal}
              helper="Campos completados post-consolidación del candidato"
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <EditableField
                label="CUIT / CUIL" value={employee.CUIT} fieldKey="CUIT"
                editingField={editingField} setEditingField={setEditingField} onSave={handleFieldSave}
              />
              <EditableField
                label="CBU" value={employee.CBU} fieldKey="CBU"
                editingField={editingField} setEditingField={setEditingField} onSave={handleFieldSave}
              />
              <div id="dtab-field-corporateEmail">
                <EditableField
                  label="Email corporativo" value={employee.corporateEmail} fieldKey="corporateEmail" copyable
                  editingField={editingField} setEditingField={setEditingField} onSave={handleFieldSave}
                />
              </div>
            </div>
          </div>

          {/* ─ Declaración del candidato ─ */}
          <div
            className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] p-4"
            style={{ boxShadow: 'var(--shadow-sm)' }}
          >
            {/* Section header with status badge */}
            <div className="flex items-start justify-between gap-3 pb-3 mb-4 border-b border-[var(--border-subtle)]">
              <div className="flex items-start gap-3 min-w-0">
                <span
                  className="flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: C.candidate + '18' }}
                  aria-hidden="true"
                >
                  <Users className="w-3.5 h-3.5" style={{ color: C.candidate }} />
                </span>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold uppercase tracking-wider block leading-snug" style={{ color: C.candidate }}>
                    Declaración del candidato
                  </span>
                  <span className="text-[11px] text-[var(--text-tertiary)] mt-0.5 block">
                    Datos declarados en el formulario de ingreso
                  </span>
                </div>
              </div>
              <StatusBadge
                submitted={candidateSubmitted}
                consolidated={candidateConsolidated}
                caseStatus={status}
              />
            </div>

            {/* State 1: draft, form not sent */}
            {!candidateSubmitted && status === 'draft' && (
              <div className="py-8 bg-[var(--bg-subtle)] rounded-xl border border-[var(--border-subtle)] flex flex-col items-center text-center px-4">
                <Clock className="w-10 h-10 text-[var(--text-tertiary)] mb-3" aria-hidden="true" />
                <p className="text-sm font-medium text-[var(--text-secondary)]">
                  El formulario no fue enviado.
                </p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1 max-w-sm mb-4">
                  Enviá el formulario al candidato para que cargue sus datos fiscales y de cobro.
                </p>
                <Button onClick={() => sendCandidateForm(selectedCase.id)} className="min-h-[44px]">
                  Enviar formulario de onboarding
                </Button>
              </div>
            )}

            {/* State 2: invited, waiting */}
            {!candidateSubmitted && status === 'candidate_invited' && (
              <div className="py-8 bg-[var(--bg-subtle)] rounded-xl border border-[var(--border-subtle)] flex flex-col items-center text-center px-4">
                <Clock className="w-10 h-10 text-[var(--text-tertiary)] mb-3" aria-hidden="true" />
                <p className="text-sm font-medium text-[var(--text-secondary)]">
                  Esperando respuesta del candidato.
                </p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1 max-w-sm mb-5">
                  Debe completar CUIT, referencias y método de cobro.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button variant="secondary" size="sm" onClick={handleCopyLink} className="min-h-[44px] px-4">
                    <Copy className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                    Copiar enlace
                  </Button>
                  <Button
                    variant="ghost" size="sm"
                    onClick={() => window.open(`#candidate=${candidateToken}`, '_blank')}
                    className="min-h-[44px] px-4"
                  >
                    <ExternalLink className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                    Abrir formulario
                  </Button>
                </div>
              </div>
            )}

            {/* State 3: submitted — show all declared data */}
            {candidateSubmitted && (
              <div className="space-y-5">

                {/* Verification checklist */}
                <div className="px-4 py-3 bg-[var(--bg-subtle)] rounded-xl border border-[var(--border-subtle)]">
                  <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">
                    Lista de verificación
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                    <CheckItem label="Identificador fiscal"      done={fiscalStepDone} />
                    <CheckItem label="Método de cobro"           done={isPaymentComplete} />
                    <CheckItem label="Referencias laborales"     done={referencesStepDone} />
                    <CheckItem label="Documento W-8"             done={w8StepDone} />
                    <CheckItem label="Código QR"                 done={qrStepDone} />
                    <CheckItem label="Consolidación completada"  done={candidateConsolidated} />
                  </div>
                </div>

                {/* Fiscal + Payment side by side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {/* Fiscal declared */}
                  <div className="bg-[var(--bg-subtle)] rounded-xl border border-[var(--border-subtle)] p-3.5">
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className="flex items-center justify-center w-5 h-5 rounded-md flex-shrink-0"
                        style={{ backgroundColor: C.fiscal + '20' }}
                        aria-hidden="true"
                      >
                        <Landmark className="w-3 h-3" style={{ color: C.fiscal }} />
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: C.fiscal }}>
                        Fiscal
                      </span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-[var(--text-secondary)]">Tipo</span>
                        <span className="font-medium text-[var(--text-primary)] text-right">
                          {taxIdType?.label || candidateData?.taxIdType || 'Ninguno'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-[var(--text-secondary)]">Valor</span>
                        <span className="font-mono font-semibold text-[var(--brand-primary)] select-all">
                          {candidateData?.taxIdValue || '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment declared */}
                  <div className="bg-[var(--bg-subtle)] rounded-xl border border-[var(--border-subtle)] p-3.5">
                    <div className="flex items-center justify-between mb-3 gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="flex items-center justify-center w-5 h-5 rounded-md flex-shrink-0"
                          style={{ backgroundColor: C.payment + '20' }}
                          aria-hidden="true"
                        >
                          <CreditCard className="w-3 h-3" style={{ color: C.payment }} />
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: C.payment }}>
                          Cobro
                        </span>
                      </div>
                      <PaymentBadge method={candidateData?.paymentMethod || null} />
                    </div>
                    <div className="space-y-1.5 text-xs">
                      {candidateData?.paymentMethod === 'CBU' && (
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-[var(--text-secondary)] flex-shrink-0">CBU</span>
                          <span className="font-mono font-semibold text-[var(--brand-primary)] select-all truncate">
                            {candidateData.cbu || '—'}
                          </span>
                        </div>
                      )}
                      {candidateData?.paymentMethod === 'WIRE' && (
                        <>
                          <div className="flex justify-between gap-2">
                            <span className="text-[var(--text-secondary)] flex-shrink-0">Banco</span>
                            <span className="text-[var(--text-primary)] truncate text-right">{candidateData.bankName}</span>
                          </div>
                          <div className="flex justify-between gap-2">
                            <span className="text-[var(--text-secondary)] flex-shrink-0">Cuenta</span>
                            <span className="font-mono truncate">{candidateData.accountNumber}</span>
                          </div>
                          <div className="flex justify-between gap-2">
                            <span className="text-[var(--text-secondary)] flex-shrink-0">SWIFT</span>
                            <span className="font-mono">{candidateData.swift}</span>
                          </div>
                        </>
                      )}
                      {candidateData?.paymentMethod === 'CRYPTO' && (
                        <>
                          <div className="flex justify-between gap-2">
                            <span className="text-[var(--text-secondary)] flex-shrink-0">Wallet</span>
                            <span className="text-[var(--text-primary)]">{candidateData.walletType}</span>
                          </div>
                          <div className="flex justify-between gap-2">
                            <span className="text-[var(--text-secondary)] flex-shrink-0">Dirección</span>
                            <span className="font-mono truncate">{candidateData.walletAddress}</span>
                          </div>
                        </>
                      )}
                      {!candidateData?.paymentMethod && (
                        <span className="text-[var(--text-disabled)] italic text-xs">No declarado</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* References + Documentation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {/* References */}
                  <div>
                    <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2.5">
                      Referencias ({candidateData?.references?.length || 0})
                    </p>
                    {candidateData?.references && candidateData.references.length > 0 ? (
                      <div className="space-y-2">
                        {candidateData.references.map(ref => (
                          <div
                            key={ref.id}
                            className="bg-[var(--bg-subtle)] p-2.5 rounded-lg border border-[var(--border-subtle)] text-xs"
                          >
                            <div className="flex justify-between items-baseline gap-2 font-medium text-[var(--text-primary)]">
                              <span className="truncate">{ref.fullName}</span>
                              <span className="text-[var(--text-tertiary)] text-[10px] flex-shrink-0">{ref.relationship}</span>
                            </div>
                            <div className="flex justify-between text-[var(--text-secondary)] mt-1 gap-2">
                              <span className="truncate">{ref.company}</span>
                              <span className="flex-shrink-0">{ref.phone || ref.email}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[var(--text-tertiary)] italic">Sin referencias declaradas.</p>
                    )}
                  </div>

                  {/* Documentation / files */}
                  <div>
                    <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2.5">
                      Documentación
                    </p>
                    {(!candidateData?.needsW8 && !candidateData?.hasQrBinance) ? (
                      <p className="text-xs text-[var(--text-tertiary)] italic">
                        No se requieren archivos para este caso.
                      </p>
                    ) : (candidateData?.files && candidateData.files.length > 0) ? (
                      <div className="space-y-2">
                        {candidateData.files.map(file => (
                          <div
                            key={file.id}
                            className="bg-[var(--bg-subtle)] p-2.5 rounded-lg border border-[var(--border-subtle)] text-xs"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="font-medium text-[var(--text-primary)] truncate">{file.name}</p>
                                <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5 font-mono uppercase">
                                  {file.fileType} · {Math.round(file.sizeBytes / 1024)} KB
                                </p>
                              </div>
                              <span className="text-[10px] text-[var(--status-success)] font-medium px-1.5 py-0.5 rounded bg-[var(--status-success-subtle)] flex-shrink-0">
                                Subido
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(file.name);
                                useStore.getState().addToast({ type: 'success', title: 'Copiado al portapapeles' });
                              }}
                              className="mt-2 pt-2 w-full border-t border-[var(--border-subtle)] text-[10px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 uppercase tracking-wider focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--brand-primary-glow)] rounded"
                              aria-label={`Copiar nombre de ${file.name}`}
                            >
                              <Copy className="w-3 h-3" aria-hidden="true" />
                              Copiar nombre
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[var(--status-warning)] font-medium">Archivos pendientes</p>
                    )}
                  </div>
                </div>

                {/* Consolidation CTA */}
                <div className="pt-2 border-t border-[var(--border-subtle)]">
                  {!candidateConsolidated ? (
                    <div className="p-4 bg-[var(--brand-primary-subtle)] border border-[var(--brand-primary)]/20 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                          <Shield className="w-4 h-4 text-[var(--brand-primary)]" aria-hidden="true" />
                          Consolidar datos del candidato
                        </p>
                        <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-md leading-relaxed">
                          Copia los datos fiscales y de cobro al perfil operativo del empleado.
                        </p>
                      </div>
                      <Button
                        onClick={() => consolidateCandidateData(selectedCase.id)}
                        className="w-full sm:w-auto min-h-[44px] flex-shrink-0 px-5"
                      >
                        Consolidar datos
                      </Button>
                    </div>
                  ) : (
                    <div className="p-4 bg-[var(--status-success-subtle)] border border-[var(--status-success)]/20 rounded-xl flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[var(--status-success)] flex-shrink-0" aria-hidden="true" />
                      <div>
                        <p className="text-sm font-bold text-[var(--status-success)]">Datos consolidados</p>
                        <p className="text-xs text-[var(--text-secondary)] mt-0.5">CUIT · CBU / datos de cobro</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Secondary column: sticky validation module */}
        <div className="w-full lg:w-[280px] flex-shrink-0 lg:sticky lg:top-4 space-y-4">
          <ValidationModule
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
