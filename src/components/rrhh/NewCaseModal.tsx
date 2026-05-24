import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { useStore, CreateCaseData } from '../../store';
import { COUNTRIES, TEAMS, CONTRACT_TYPES, Team, ContractType } from '../../types';
import {
  User, MapPin, Briefcase, CalendarDays,
  CheckCircle2, AlertCircle,
} from 'lucide-react';
import { cn } from '../../utils/cn';

// ─── SECTION COLORS ──────────────────────────────────────────────────────────
const C = {
  identity: '#459CDB',   // brand blue  — identity/contact
  location: '#27AE60',   // emerald     — location
  position: '#9B51E0',   // violet      — role/structure
  agenda:   '#64748B',   // slate       — optional agenda
} as const;

// ─── REQUIRED FIELDS ─────────────────────────────────────────────────────────
const REQUIRED_KEYS: (keyof CreateCaseData)[] = [
  'firstName', 'lastName', 'CI', 'birthday', 'personalEmail',
  'countryId', 'provinceId', 'cityId',
  'role', 'team', 'contractType', 'managerName', 'startDate',
];

// ─── EMPTY FORM STATE ────────────────────────────────────────────────────────
const EMPTY_FORM: CreateCaseData = {
  firstName: '',
  lastName: '',
  CI: '',
  birthday: '',
  personalEmail: '',
  countryId: 'AR',
  provinceId: '',
  cityId: '',
  startDate: '',
  role: '',
  team: 'engineering',
  contractType: 'employee',
  managerName: '',
  welcomeMeetingTime: '',
  welcomeMeetingLink: '',
  managerMeetingTime: '',
  managerMeetingLink: '',
  onboardingFolderUrl: '',
  kitRedesUrl: '',
};

// ─── MODAL SECTION WRAPPER ────────────────────────────────────────────────────

interface ModalSectionProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  color: string;
  optional?: boolean;
  cols?: 2 | 3;
  children: React.ReactNode;
}

function ModalSection({ icon: Icon, label, color, optional, cols = 2, children }: ModalSectionProps) {
  return (
    <div>
      {/* Category header */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className="flex items-center justify-center w-6 h-6 rounded-lg flex-shrink-0"
          style={{ backgroundColor: color + '18' }}
          aria-hidden="true"
        >
          <Icon className="w-3 h-3" style={{ color }} />
        </span>
        <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color }}>
          {label}
        </span>
        {optional && (
          <span className="text-[10px] text-[var(--text-tertiary)] font-medium">· opcional</span>
        )}
      </div>

      {/* Fields grid */}
      <div className={cn(
        'grid grid-cols-1 gap-3',
        cols === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'
      )}>
        {children}
      </div>
    </div>
  );
}

// ─── SUMMARY ROW ─────────────────────────────────────────────────────────────

function SummaryRow({ label, value, warning }: { label: string; value: string | null; warning?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <span className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
        {label}
      </span>
      {value ? (
        <span className="text-xs font-medium text-[var(--text-primary)] break-words leading-snug">{value}</span>
      ) : warning ? (
        <span className="text-xs text-[var(--status-warning)] italic font-normal">Incompleto</span>
      ) : (
        <span className="text-xs text-[var(--text-disabled)] italic font-normal">Sin completar</span>
      )}
    </div>
  );
}

// ─── LIVE SUMMARY PANEL ───────────────────────────────────────────────────────

function CaseSummaryPanel({ formData, attempted }: { formData: CreateCaseData; attempted: boolean }) {
  const fullName = [formData.firstName, formData.lastName].filter(Boolean).join(' ');
  const country  = COUNTRIES.find(c => c.code === formData.countryId)?.name;
  const location = [formData.cityId, country].filter(Boolean).join(', ');
  const team     = TEAMS.find(t => t.value === formData.team)?.label;
  const roleArea = [formData.role, team].filter(Boolean).join(' · ');
  const startFormatted = formData.startDate
    ? new Date(formData.startDate + 'T00:00:00').toLocaleDateString('es-AR', { dateStyle: 'medium' })
    : null;

  const pending  = REQUIRED_KEYS.filter(k => !formData[k]).length;
  const isReady  = pending === 0;

  return (
    <div className="bg-[var(--bg-subtle)] rounded-xl border border-[var(--border-subtle)] p-4">
      {/* Panel header */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-[var(--border-subtle)]">
        <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
          Resumen
        </span>
        {isReady ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--status-success)] bg-[var(--status-success-subtle)] px-1.5 py-0.5 rounded border border-[var(--status-success)]/20 uppercase tracking-wider flex-shrink-0">
            <CheckCircle2 className="w-2.5 h-2.5" aria-hidden="true" />
            Listo
          </span>
        ) : (
          <span className="text-[10px] font-medium text-[var(--text-tertiary)] flex-shrink-0">
            {pending} pendiente{pending !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Derived summary rows */}
      <div className="space-y-3">
        <SummaryRow
          label="Colaborador"
          value={fullName || null}
          warning={!fullName && attempted}
        />
        <SummaryRow
          label="Posición"
          value={roleArea || null}
          warning={!formData.role && attempted}
        />
        <SummaryRow label="Ubicación" value={location || null} />
        <SummaryRow label="Inicio" value={startFormatted} />
        <SummaryRow label="Manager" value={formData.managerName || null} />
      </div>

      {/* Readiness hint */}
      <div className="mt-4 pt-3 border-t border-[var(--border-subtle)]">
        <p className="text-[10px] text-[var(--text-tertiary)] leading-relaxed">
          {isReady
            ? 'Todos los campos mínimos están completos.'
            : 'Completá los campos obligatorios para crear el caso.'
          }
        </p>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

interface NewCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewCaseModal({ isOpen, onClose }: NewCaseModalProps) {
  const createCase = useStore(state => state.createCase);
  const [formData, setFormData] = useState<CreateCaseData>(EMPTY_FORM);
  const [attempted, setAttempted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const updateField = <K extends keyof CreateCaseData>(field: K, value: CreateCaseData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (attempted) {
      // Clear global error once user starts fixing fields
      const updated = { ...formData, [field]: value };
      if (!REQUIRED_KEYS.some(k => !updated[k])) setErrorMsg(null);
    }
  };

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setAttempted(false);
    setErrorMsg(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isMissing = REQUIRED_KEYS.some(k => !formData[k]);
    if (isMissing) {
      setAttempted(true);
      setErrorMsg('Completá los campos obligatorios para crear el caso.');
      return;
    }
    createCase(formData);
    resetForm();
    onClose();
  };

  // Per-field error: only shows after a failed submit attempt
  const fieldErr = (key: keyof CreateCaseData): string | undefined => {
    if (!attempted) return undefined;
    if (!REQUIRED_KEYS.includes(key)) return undefined;
    return !formData[key] ? 'Este dato es necesario' : undefined;
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nuevo caso de onboarding" size="xl">

      {/* Description + draft chip */}
      <div className="flex items-start justify-between gap-4 mb-5 pb-4 border-b border-[var(--border-subtle)]">
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          Creá el perfil base del colaborador. Después vas a poder enviarle el formulario para completar datos fiscales, cobro y documentación.
        </p>
        <span className="inline-flex text-[10px] font-bold text-[var(--text-tertiary)] bg-[var(--bg-subtle)] px-2 py-1 rounded-full border border-[var(--border-default)] uppercase tracking-wider whitespace-nowrap flex-shrink-0">
          Borrador inicial
        </span>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Primary: form sections ── */}
          <div className="flex-1 min-w-0 space-y-6">

            {/* Identidad */}
            <ModalSection icon={User} label="Identidad" color={C.identity}>
              <Input
                label="Nombre"
                placeholder="Ej.: María"
                value={formData.firstName}
                onChange={e => updateField('firstName', e.target.value)}
                error={fieldErr('firstName')}
                autoFocus
              />
              <Input
                label="Apellido"
                placeholder="Ej.: García"
                value={formData.lastName}
                onChange={e => updateField('lastName', e.target.value)}
                error={fieldErr('lastName')}
              />
              <Input
                label="Email personal"
                type="email"
                placeholder="Ej.: maria@email.com"
                value={formData.personalEmail}
                onChange={e => updateField('personalEmail', e.target.value)}
                helper="Aquí recibirá el formulario de onboarding"
                error={fieldErr('personalEmail')}
              />
              <Input
                label="Documento / DNI"
                placeholder="Ej.: 38123456"
                value={formData.CI}
                onChange={e => updateField('CI', e.target.value)}
                error={fieldErr('CI')}
              />
              <Input
                label="Fecha de nacimiento"
                type="date"
                value={formData.birthday}
                onChange={e => updateField('birthday', e.target.value)}
                error={fieldErr('birthday')}
              />
            </ModalSection>

            {/* Ubicación */}
            <ModalSection icon={MapPin} label="Ubicación" color={C.location} cols={3}>
              <Select
                label="País"
                value={formData.countryId}
                onChange={e => updateField('countryId', e.target.value)}
                options={COUNTRIES.map(c => ({ value: c.code, label: c.name }))}
                error={fieldErr('countryId')}
              />
              <Input
                label="Provincia / Estado"
                placeholder="Ej.: Buenos Aires"
                value={formData.provinceId}
                onChange={e => updateField('provinceId', e.target.value)}
                error={fieldErr('provinceId')}
              />
              <Input
                label="Ciudad"
                placeholder="Ej.: CABA"
                value={formData.cityId}
                onChange={e => updateField('cityId', e.target.value)}
                error={fieldErr('cityId')}
              />
            </ModalSection>

            {/* Posición */}
            <ModalSection icon={Briefcase} label="Posición" color={C.position}>
              <Input
                label="Rol / Puesto"
                placeholder="Ej.: Frontend Developer"
                value={formData.role}
                onChange={e => updateField('role', e.target.value)}
                error={fieldErr('role')}
              />
              <Select
                label="Equipo"
                value={formData.team}
                onChange={e => updateField('team', e.target.value as Team)}
                options={TEAMS.map(t => ({ value: t.value, label: t.label }))}
                error={fieldErr('team')}
              />
              <Select
                label="Tipo de contrato"
                value={formData.contractType}
                onChange={e => updateField('contractType', e.target.value as ContractType)}
                options={CONTRACT_TYPES.map(c => ({ value: c.value, label: c.label }))}
                error={fieldErr('contractType')}
              />
              <Input
                label="Responsable directo"
                placeholder="Ej.: Carlos Méndez"
                value={formData.managerName}
                onChange={e => updateField('managerName', e.target.value)}
                error={fieldErr('managerName')}
              />
              <Input
                label="Fecha de ingreso"
                type="date"
                value={formData.startDate}
                helper="Fecha estimada de inicio"
                onChange={e => updateField('startDate', e.target.value)}
                error={fieldErr('startDate')}
              />
            </ModalSection>

            {/* Agenda inicial (optional) */}
            <ModalSection icon={CalendarDays} label="Agenda inicial" color={C.agenda} optional>
              <Input
                label="Horario onboarding RRHH"
                placeholder="Ej.: 19/05 - 9:30 hs"
                value={formData.welcomeMeetingTime}
                onChange={e => updateField('welcomeMeetingTime', e.target.value)}
              />
              <Input
                label="Link Meet RRHH"
                type="url"
                placeholder="https://meet.google.com/..."
                value={formData.welcomeMeetingLink}
                onChange={e => updateField('welcomeMeetingLink', e.target.value)}
              />
              <Input
                label="Horario reunión con manager"
                placeholder="Ej.: 19/05 - 12:00 hs"
                value={formData.managerMeetingTime}
                onChange={e => updateField('managerMeetingTime', e.target.value)}
              />
              <Input
                label="Link Meet manager"
                type="url"
                placeholder="https://meet.google.com/..."
                value={formData.managerMeetingLink}
                onChange={e => updateField('managerMeetingLink', e.target.value)}
              />
              <Input
                label="Link carpeta de onboarding"
                type="url"
                placeholder="https://drive.google.com/..."
                value={formData.onboardingFolderUrl}
                onChange={e => updateField('onboardingFolderUrl', e.target.value)}
              />
              <Input
                label="Link Kit de Redes"
                type="url"
                placeholder="https://drive.google.com/..."
                value={formData.kitRedesUrl}
                onChange={e => updateField('kitRedesUrl', e.target.value)}
              />
            </ModalSection>

          </div>

          {/* ── Secondary: live summary (sticky desktop, inline mobile) ── */}
          <div className="w-full lg:w-[240px] flex-shrink-0 lg:sticky lg:top-0 lg:self-start">
            <CaseSummaryPanel formData={formData} attempted={attempted} />
          </div>

        </div>

        {/* Global validation error */}
        {errorMsg && (
          <div
            className="mt-5 p-3 bg-[var(--status-error-subtle)] border border-[var(--status-error)]/20 rounded-lg flex items-center gap-2.5"
            role="alert"
            aria-live="polite"
          >
            <AlertCircle className="w-4 h-4 text-[var(--status-error)] flex-shrink-0" aria-hidden="true" />
            <p className="text-sm font-medium text-[var(--status-error)]">{errorMsg}</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5 pt-4 border-t border-[var(--border-subtle)]">
          <p className="text-xs text-[var(--text-tertiary)] hidden sm:block">
            El caso quedará en borrador hasta enviar el formulario al candidato.
          </p>
          <div className="flex justify-end gap-3 w-full sm:w-auto">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              className="w-full sm:w-auto min-h-[44px]"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto min-h-[44px]"
            >
              Crear caso
            </Button>
          </div>
        </div>

      </form>
    </Modal>
  );
}
