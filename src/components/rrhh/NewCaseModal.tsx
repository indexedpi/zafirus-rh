import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { useStore, CreateCaseData } from '../../store';
import { COUNTRIES, TEAMS, CONTRACT_TYPES, Team, ContractType } from '../../types';

interface NewCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewCaseModal({ isOpen, onClose }: NewCaseModalProps) {
  const createCase = useStore(state => state.createCase);
  const [formData, setFormData] = useState<CreateCaseData>({
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
  });


  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check required fields
    const requiredKeys: (keyof CreateCaseData)[] = [
      'firstName', 'lastName', 'CI', 'birthday', 'personalEmail',
      'countryId', 'provinceId', 'cityId', 'startDate',
      'role', 'team', 'contractType', 'managerName'
    ];

    const isMissing = requiredKeys.some(k => !formData[k]);

    if (isMissing) {
      setErrorMsg('Completá los campos obligatorios para crear el caso.');
      return;
    }

    setErrorMsg(null);
    createCase(formData);
    onClose();
    setFormData({
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
    });
  };

  const updateField = <K extends keyof CreateCaseData>(field: K, value: CreateCaseData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (

    <Modal isOpen={isOpen} onClose={onClose} title="Nuevo caso de onboarding" size="xl">
      <div className="mb-6">
        <p className="text-sm text-[var(--text-secondary)]">
          Creá el perfil base del colaborador. Después vas a poder enviarle el formulario para completar datos fiscales y de cobro.
        </p>
      </div>
      <form onSubmit={handleSubmit}>

        {/* Section A: Employee Data */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 border-b border-[var(--border-subtle)] pb-2">
            Datos personales y ubicación
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Input
              label="Nombre"
              value={formData.firstName}
              onChange={e => updateField('firstName', e.target.value)}
              required
            />
            <Input
              label="Apellido"
              value={formData.lastName}
              onChange={e => updateField('lastName', e.target.value)}
              required
            />
            <Input
              label="DNI / Documento"
              value={formData.CI}
              onChange={e => updateField('CI', e.target.value)}
              required
            />
            <Input
              label="Fecha de nacimiento"
              type="date"
              value={formData.birthday}
              onChange={e => updateField('birthday', e.target.value)}
              required
            />
            <Input
              label="Email personal"
              type="email"
              value={formData.personalEmail}
              onChange={e => updateField('personalEmail', e.target.value)}
              helper="Aquí recibirá el formulario de onboarding"
              required
            />
            <Select
              label="País"
              value={formData.countryId}
              onChange={e => updateField('countryId', e.target.value)}
              options={COUNTRIES.map(c => ({ value: c.code, label: c.name }))}
              required
            />
            <Input
              label="Provincia / Estado"
              value={formData.provinceId}
              onChange={e => updateField('provinceId', e.target.value)}
              required
            />
            <Input
              label="Ciudad"
              value={formData.cityId}
              onChange={e => updateField('cityId', e.target.value)}
              required
            />
            <Input
              label="Fecha de ingreso"
              type="date"
              value={formData.startDate}
              onChange={e => updateField('startDate', e.target.value)}
              required
            />
          </div>
        </div>

        {/* Section B: Operational Data */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 border-b border-[var(--border-subtle)] pb-2">
            Posición y estructura
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Input
              label="Rol / Posición"
              value={formData.role}
              onChange={e => updateField('role', e.target.value)}
              required
            />
            <Select
              label="Equipo"
              value={formData.team}
              onChange={e => updateField('team', e.target.value as Team)}
              options={TEAMS.map(t => ({ value: t.value, label: t.label }))}
              required
            />
            <Select
              label="Tipo de contrato"
              value={formData.contractType}
              onChange={e => updateField('contractType', e.target.value as ContractType)}
              options={CONTRACT_TYPES.map(c => ({ value: c.value, label: c.label }))}
              required
            />
            <Input
              label="Responsable directo"
              value={formData.managerName}
              onChange={e => updateField('managerName', e.target.value)}
              required
            />
          </div>
        </div>

        {/* Section C: Agenda Variables */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 border-b border-[var(--border-subtle)] pb-2 flex items-baseline gap-2">
            Agenda inicial <span className="text-xs font-normal text-[var(--text-tertiary)]">(opcional)</span>
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Input
              label="Horario onboarding RRHH"
              value={formData.welcomeMeetingTime}
              onChange={e => updateField('welcomeMeetingTime', e.target.value)}
              placeholder="ej: 19/05 - 9:30 hs"
            />
            <Input
              label="Link Meet RRHH"
              type="url"
              value={formData.welcomeMeetingLink}
              onChange={e => updateField('welcomeMeetingLink', e.target.value)}
              placeholder="https://meet.google.com/..."
            />
            <Input
              label="Horario reunión con manager"
              value={formData.managerMeetingTime}
              onChange={e => updateField('managerMeetingTime', e.target.value)}
              placeholder="ej: 19/05 - 12:00 hs"
            />
            <Input
              label="Link Meet manager"
              type="url"
              value={formData.managerMeetingLink}
              onChange={e => updateField('managerMeetingLink', e.target.value)}
              placeholder="https://meet.google.com/..."
            />
            <Input
              label="Link carpeta de onboarding"
              type="url"
              value={formData.onboardingFolderUrl}
              onChange={e => updateField('onboardingFolderUrl', e.target.value)}
              placeholder="https://drive.google.com/..."
            />
            <Input
              label="Link Kit de Redes"
              type="url"
              value={formData.kitRedesUrl}
              onChange={e => updateField('kitRedesUrl', e.target.value)}
              placeholder="https://drive.google.com/..."
            />
          </div>
        </div>


        {errorMsg && (
          <div className="mb-4 p-3 bg-[var(--status-error-subtle)] border border-[var(--status-error)]/20 rounded-lg">
            <p className="text-sm font-medium text-[var(--status-error)]">{errorMsg}</p>
          </div>
        )}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[var(--border-subtle)]">
          <p className="text-xs text-[var(--text-tertiary)] hidden sm:block">
            El caso quedará en borrador hasta enviar el formulario al candidato.
          </p>
          <div className="flex justify-end gap-3 w-full sm:w-auto">
            <Button type="button" variant="secondary" onClick={onClose} className="w-full sm:w-auto min-h-[44px]">
              Cancelar
            </Button>
            <Button type="submit" className="w-full sm:w-auto min-h-[44px]">
              Crear caso
            </Button>
          </div>
        </div>

      </form>
    </Modal>
  );
}
