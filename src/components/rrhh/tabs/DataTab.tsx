import React, { useState, useEffect } from 'react';
import { useStore } from '../../../store';
import { Button } from '../../ui/Button';
import { ZafirusLogo } from '../../ui/ZafirusLogo';
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
      {/* Visual constraint: border-l (1px) instead of border-l-2 */}
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
  onSave
}: EditableFieldProps) {
  const isEditing = editingField === fieldKey;
  const [localVal, setLocalVal] = useState(value || '');

  useEffect(() => {
    if (isEditing) {
      setLocalVal(value || '');
    }
  }, [value, isEditing]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSave(fieldKey, localVal);
    } else if (e.key === 'Escape') {
      setLocalVal(value || '');
      setEditingField(null);
    }
  };

  const handleBlur = () => {
    onSave(fieldKey, localVal);
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
      className="flex flex-col gap-0.5 min-w-0 cursor-pointer group p-2 hover:bg-white/[0.02] rounded-lg border border-transparent hover:border-[var(--border-subtle)] min-h-[52px] justify-center transition-[background-color,border-color] duration-150"
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
      <span className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider leading-none">
        {label}
      </span>
      <span className="text-sm font-medium text-[var(--text-primary)] truncate flex items-center justify-between mt-1">
        <span className={cn(!value && 'text-[var(--text-disabled)] font-light', 'truncate')}>{displayValue()}</span>
        <span className="text-[10px] text-[var(--brand-primary)] opacity-0 group-hover:opacity-100 transition-opacity duration-150 uppercase font-bold flex items-center gap-1 flex-shrink-0 pl-2">
          editar
        </span>
      </span>
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
  qrStepDone
}: ProfileSummaryPanelProps) {
  const { status, employee, candidateData } = selectedCase;
  const candidateSubmitted = candidateData?.submittedAt != null;
  const candidateConsolidated = candidateData?.consolidated === true;

  const getNextCaseActionText = () => {
    switch (status) {
      case 'draft': return 'Enviar formulario de invitación al candidato.';
      case 'candidate_invited': return 'Candidato completando el formulario.';
      case 'candidate_submitted': return 'Datos recibidos. Iniciar revisión del caso.';
      case 'hr_review': return !candidateConsolidated ? 'Revisar y consolidar respuestas del candidato.' : 'Verificar detalles y aprobar el caso.';
      case 'ready_to_activate': return 'Confirmar activación y configurar Workspace.';
      case 'active_pending_automation': return 'Automatización en curso en Google Workspace.';
      case 'operative': return 'Onboarding completado con éxito. Colaborador activo.';
      case 'blocked': return `Resolver bloqueo: ${selectedCase.blockReason}`;
      case 'cancelled': return 'Caso cancelado y archivado.';
      default: return 'Sin acciones pendientes.';
    }
  };

  return (
    <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] p-6 shadow-md">
      <SectionHeader icon={Shield} title="Resumen del Estado del Caso" accentToken="--brand-primary" />

      <div className="space-y-4 text-xs">
        {/* States widgets */}
        <div className="space-y-2">
          {/* Case State */}
          <div className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)]">
            <span className="text-[var(--text-secondary)] flex items-center gap-2">
              <Briefcase className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
              Estado del Caso
            </span>
            <span className="font-semibold text-[var(--text-primary)] uppercase tracking-wider">
              {status}
            </span>
          </div>

          {/* Candidate Portal State */}
          <div className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)]">
            <span className="text-[var(--text-secondary)] flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
              Portal Candidato
            </span>
            <div className="flex items-center gap-1.5">
              {candidateSubmitted ? (
                <Check className="w-3.5 h-3.5 text-[var(--status-success)]" />
              ) : status === 'candidate_invited' ? (
                <Clock className="w-3.5 h-3.5 text-[var(--status-warning)]" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
              )}
              <span className="font-medium text-[var(--text-primary)]">
                {candidateSubmitted ? 'Enviado' : status === 'candidate_invited' ? 'Invitado' : 'Borrador'}
              </span>
            </div>
          </div>

          {/* Fiscal State */}
          <div className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)]">
            <span className="text-[var(--text-secondary)] flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
              Datos Fiscales
            </span>
            <div className="flex items-center gap-1.5">
              {employee.CUIT ? (
                <Check className="w-3.5 h-3.5 text-[var(--status-success)]" />
              ) : fiscalStepDone ? (
                <Clock className="w-3.5 h-3.5 text-[var(--status-info)]" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
              )}
              <span className={cn('font-medium', employee.CUIT ? 'text-[var(--status-success)]' : 'text-[var(--text-tertiary)]')}>
                {employee.CUIT ? 'Consolidado' : fiscalStepDone ? 'Declarado' : 'Falta CUIT'}
              </span>
            </div>
          </div>

          {/* Payment State */}
          <div className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)]">
            <span className="text-[var(--text-secondary)] flex items-center gap-2">
              <Building className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
              Datos de Cobro
            </span>
            <div className="flex items-center gap-1.5">
              {employee.CBU ? (
                <Check className="w-3.5 h-3.5 text-[var(--status-success)]" />
              ) : isPaymentComplete ? (
                <Clock className="w-3.5 h-3.5 text-[var(--status-info)]" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
              )}
              <span className={cn('font-medium', employee.CBU ? 'text-[var(--status-success)]' : 'text-[var(--text-tertiary)]')}>
                {employee.CBU ? 'Consolidado' : isPaymentComplete ? 'Declarado' : 'Falta CBU'}
              </span>
            </div>
          </div>

          {/* References State */}
          <div className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)]">
            <span className="text-[var(--text-secondary)] flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
              Referencias
            </span>
            <div className="flex items-center gap-1.5">
              {referencesStepDone ? (
                <Check className="w-3.5 h-3.5 text-[var(--status-success)]" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
              )}
              <span className={cn('font-medium', referencesStepDone ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]')}>
                {referencesStepDone ? `${candidateData?.references?.length || 0} Cargadas` : 'Pendiente'}
              </span>
            </div>
          </div>

          {/* Documents State */}
          <div className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)]">
            <span className="text-[var(--text-secondary)] flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
              Documentos
            </span>
            <div className="flex items-center gap-1.5">
              {w8StepDone && qrStepDone ? (
                <Check className="w-3.5 h-3.5 text-[var(--status-success)]" />
              ) : (
                <Clock className="w-3.5 h-3.5 text-[var(--status-warning)]" />
              )}
              <span className="font-medium text-[var(--text-primary)]">
                {candidateData?.files?.length || 0} Subidos
              </span>
            </div>
          </div>

          {/* Consolidation State */}
          <div className="flex items-center justify-between py-2">
            <span className="text-[var(--text-secondary)] flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
              Consolidación
            </span>
            <div className="flex items-center gap-1.5">
              {candidateConsolidated ? (
                <Check className="w-3.5 h-3.5 text-[var(--status-success)]" />
              ) : (
                <Clock className="w-3.5 h-3.5 text-[var(--status-warning)]" />
              )}
              <span className={cn('font-medium', candidateConsolidated ? 'text-[var(--status-success)]' : 'text-[var(--status-warning)]')}>
                {candidateConsolidated ? 'Datos consolidados' : 'Datos sin consolidar'}
              </span>
            </div>
          </div>
        </div>

        {/* Actionable alert box */}
        <div className="mt-6 p-4 bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-default)]">
          <p className="font-bold text-[var(--text-primary)] mb-1 uppercase tracking-wider text-[10px]">
            Próxima Acción
          </p>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {getNextCaseActionText()}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── INFO ROW SUBCOMPONENT ───
export interface InfoRowProps {
  label: string;
  value: string;
  highlight?: boolean;
}

export function InfoRow({ label, value, highlight }: InfoRowProps) {
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <span className="text-xs text-[var(--text-tertiary)] leading-tight">{label}</span>
      <span className={cn(
        'text-sm font-medium text-[var(--text-primary)] truncate',
        highlight && 'text-[var(--brand-primary)]'
      )}>
        {value || '—'}
        {highlight && <Check className="w-3 h-3 inline-block ml-1 text-[var(--status-success)]" />}
      </span>
    </div>
  );
}

// ─── MAIN DATA TAB COMPONENT ───
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
    const link = `${window.location.origin}/demo#candidate=${candidateToken}`;
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

  // ─── A4. Fix payment completeness logic ───
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

  // Calculate profile completeness
  const coreFields = [
    employee.name,
    employee.lastName,
    employee.CI,
    employee.birthday,
    employee.email,
    employee.countryId,
    employee.provinceId,
    employee.cityId,
    employee.startDate,
    employee.role,
    employee.team,
    employee.contractType,
    employee.managerName
  ];
  const totalFieldsCount = coreFields.length;
  const filledFieldsCount = coreFields.filter(f => !!f).length;
  const completionPercentage = Math.round((filledFieldsCount / totalFieldsCount) * 100);

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
      {/* ─── ProfileHero ─── */}
      <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] p-6 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        {/* Watermark */}
        <div className="absolute -right-8 -bottom-8 pointer-events-none opacity-5">
          <ZafirusLogo size={200} />
        </div>

        <div className="flex items-center gap-4 z-10">
          <div className="w-16 h-16 rounded-full bg-[var(--brand-primary-subtle)] border border-[var(--brand-primary)]/20 flex items-center justify-center text-2xl font-semibold text-[var(--brand-primary)] flex-shrink-0 select-none">
            {employee.name?.charAt(0)}{employee.lastName?.charAt(0)}
          </div>
          <div className="min-w-0">
            <h2 className="text-[22px] font-bold leading-tight text-[var(--text-primary)] truncate">
              {employee.name} {employee.lastName}
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1 flex items-center gap-1.5 flex-wrap">
              <span>{employee.role}</span>
              <span className="text-[var(--text-tertiary)] font-light">|</span>
              <span className="uppercase font-mono text-xs tracking-wider">{TEAMS.find(t => t.value === employee.team)?.label || employee.team}</span>
              <span className="text-[var(--text-tertiary)] font-light">|</span>
              <span className="text-xs bg-[var(--bg-elevated)] px-2 py-0.5 rounded border border-[var(--border-subtle)]">
                {CONTRACT_TYPES.find(c => c.value === employee.contractType)?.label || employee.contractType}
              </span>
            </p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1.5 flex items-center gap-1 flex-wrap">
              <MapPin className="w-3 h-3" />
              <span>{employee.cityId || 'Sin ubicación'}, {COUNTRIES.find(c => c.code === employee.countryId)?.name || employee.countryId}</span>
              <span className="mx-1.5 font-light">·</span>
              <Briefcase className="w-3 h-3" />
              <span>Inicio: {new Date(employee.startDate + 'T00:00:00').toLocaleDateString('es-AR', { dateStyle: 'medium' })}</span>
            </p>
          </div>
        </div>

        {/* Completeness widget */}
        <div className="w-full md:w-48 flex-shrink-0 z-10">
          <div className="flex justify-between text-xs font-medium mb-2">
            <span className="text-[var(--text-secondary)] uppercase tracking-wider">Progreso del Perfil</span>
            <span className="text-[var(--brand-primary)] font-bold">{completionPercentage}%</span>
          </div>
          <div className="h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
            <div
              className="h-full bg-[var(--brand-primary)] rounded-full transition-[width] duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

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
                    editingField={editingField}
                    setEditingField={setEditingField}
                    onSave={handleFieldSave}
                  />
                  <EditableField
                    label="Apellido"
                    value={employee.lastName}
                    fieldKey="lastName"
                    editingField={editingField}
                    setEditingField={setEditingField}
                    onSave={handleFieldSave}
                  />
                  <EditableField
                    label="Email Personal"
                    value={employee.email}
                    fieldKey="email"
                    editingField={editingField}
                    setEditingField={setEditingField}
                    onSave={handleFieldSave}
                  />
                  <EditableField
                    label="Documento / DNI"
                    value={employee.CI}
                    fieldKey="CI"
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
                    <CheckItem label="Auditoría Verificada" done={true} />
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
                      Documentos Subidos ({candidateData?.files?.length || 0})
                    </p>
                    {candidateData?.files && candidateData.files.length > 0 ? (
                      <div className="space-y-2">
                        {candidateData.files.map((file) => (
                          <div key={file.id} className="bg-[var(--bg-surface)] p-2.5 rounded-lg border border-[var(--border-subtle)] text-xs flex items-center justify-between">
                            <div className="truncate max-w-[160px]">
                              <p className="font-medium text-[var(--text-primary)] truncate">{file.name}</p>
                              <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5 font-mono uppercase">{file.fileType}</p>
                            </div>
                            <span className="text-[10px] text-[var(--text-secondary)] bg-[var(--bg-elevated)] px-2 py-0.5 rounded border border-[var(--border-subtle)]">
                              {Math.round(file.sizeBytes / 1024)} KB
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[var(--text-tertiary)] italic font-light">Sin documentos declarados.</p>
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
                          Acción Requerida: Consolidar Datos del Candidato
                        </p>
                        <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-md leading-relaxed">
                          Al confirmar, se copiarán los datos declarados (CUIT, CBU) al perfil del empleado en el directorio.
                        </p>
                      </div>
                      <Button onClick={handleConsolidate} className="w-full sm:w-auto min-h-[44px] flex-shrink-0 px-5">
                        Consolidar datos del candidato →
                      </Button>
                    </div>
                  ) : (
                    <div className="p-4 bg-[var(--status-success-subtle)] border border-[var(--status-success)]/20 rounded-lg flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[var(--status-success)] flex-shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-[var(--status-success)]">
                          Datos consolidados con éxito
                        </p>
                        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                          Los detalles fiscales y bancarios han sido verificados e integrados al perfil oficial.
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
