export type Team = 'engineering' | 'design' | 'product' | 'rrhh' | 'administration' | 'leadership';
export type ContractType = 'employee' | 'contractor' | 'intern';

export type CaseStatus =
  | 'draft'
  | 'candidate_invited'
  | 'candidate_submitted'
  | 'hr_review'
  | 'ready_to_activate'
  | 'active_pending_automation'
  | 'operative'
  | 'blocked'
  | 'cancelled';

export type TaskType =
  | 'CREATE_GOOGLE_USER'
  | 'ADD_GOOGLE_GROUPS'
  | 'CONFIGURE_GMAIL_SIGNATURE'
  | 'SEND_WELCOME_EMAIL'
  | 'ANNOUNCE_IN_GROUPS'
  | 'POST_INTERNAL_ANNOUNCEMENT'
  | 'REQUEST_DEVICE'
  | 'NOTIFY_ADMINISTRATION';

export type TaskStatus = 'pending' | 'running' | 'success' | 'failed' | 'skipped' | 'manual_required';

export interface OnboardingCase {
  id: string;
  employee: Employee;
  status: CaseStatus;
  candidateToken: string | null;
  candidateTokenExpiresAt: number | null;
  candidateData: CandidateData | null;
  emailTemplate: EmailTemplate | null;
  suggestedEmail: string | null;
  suggestedGroups: GroupSuggestion[];
  tasks: OnboardingTask[];
  auditLog: AuditEvent[];
  correctionNote: string | null;
  blockReason: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface Employee {
  guid: string;
  name: string;
  lastName: string;
  CI: string;
  CUIT: string | null;
  birthday: string;
  email: string;
  corporateEmail: string | null;
  CBU: string | null;
  cityId: string;
  provinceId: string;
  countryId: string;
  startDate: string;
  status: 'active' | 'inactive';
  role: string;
  team: Team;
  contractType: ContractType;
  managerName: string;
}

export interface EmailTemplate {
  subject: string;
  bodyHtml: string;
  welcomeMeetingTime: string;
  welcomeMeetingLink: string;
  managerMeetingTime: string;
  managerMeetingLink: string;
  onboardingFolderUrl: string;
  kitRedesUrl: string;
  temporaryPassword: string;
  approvedAt: number | null;
  sentAt: number | null;
}

export interface GroupSuggestion {
  email: string;
  displayName: string;
  category: 'team' | 'country' | 'all' | 'cross';
  status: 'pending' | 'added' | 'failed';
  workspaceGroupId: string | null;
}

export interface OnboardingTask {
  id: string;
  type: TaskType;
  status: TaskStatus;
  owner: 'system' | 'rrhh' | 'candidate' | 'admin' | 'it';
  startedAt: number | null;
  completedAt: number | null;
  attempts: number;
  lastError: string | null;
  metadata?: Record<string, unknown>;
}

export interface AuditEvent {
  id: string;
  timestamp: number;
  actorType: 'user' | 'system' | 'integration';
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, unknown>;
}

export interface Reference {
  id: string;
  fullName: string;
  relationship: string;
  company: string;
  email: string;
  phone: string;
}

export interface CandidateFile {
  id: string;
  fileType: 'w8' | 'qr_binance';
  name: string;
  sizeBytes: number;
  dataUrl?: string;
}

export interface CandidateData {
  taxIdType: string;
  taxIdValue: string;
  paymentMethod: 'CBU' | 'WIRE' | 'CRYPTO' | '';
  cbu: string;
  bankName: string;
  accountNumber: string;
  swift: string;
  beneficiaryAddress: string;
  needsW8: boolean;
  walletType: string;
  walletAddress: string;
  hasQrBinance: boolean;
  references: Reference[];
  files: CandidateFile[];
  currentStep: number;
  completedSteps: number[];
  submittedAt: number | null;
  consolidated: boolean;
}

export interface CreateCaseData {
  firstName: string;
  lastName: string;
  CI: string;
  birthday: string;
  personalEmail: string;
  countryId: string;
  provinceId: string;
  cityId: string;
  startDate: string;
  role: string;
  team: Team;
  contractType: ContractType;
  managerName: string;
  welcomeMeetingTime?: string;
  welcomeMeetingLink?: string;
  managerMeetingTime?: string;
  managerMeetingLink?: string;
  onboardingFolderUrl?: string;
  kitRedesUrl?: string;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}

// Constants
export const STATUS_CONFIG: Record<CaseStatus, { label: string; color: string; bgColor: string }> = {
  draft:                      { label: 'Borrador',    color: 'var(--text-secondary)', bgColor: 'rgba(255,255,255,0.06)' },
  candidate_invited:          { label: 'Invitado',    color: 'var(--status-info)',     bgColor: 'var(--status-info-subtle)' },
  candidate_submitted:        { label: 'Enviado',     color: 'var(--status-info)',     bgColor: 'var(--status-info-subtle)' },
  hr_review:                  { label: 'En revisión', color: 'var(--status-warning)',  bgColor: 'var(--status-warning-subtle)' },
  ready_to_activate:          { label: 'Listo',       color: 'var(--status-info)',     bgColor: 'var(--status-info-subtle)' },
  active_pending_automation:  { label: 'Procesando',  color: 'var(--status-warning)',  bgColor: 'var(--status-warning-subtle)' },
  operative:                  { label: 'Operativo',   color: 'var(--status-success)',  bgColor: 'var(--status-success-subtle)' },
  blocked:                    { label: 'Bloqueado',   color: 'var(--status-error)',    bgColor: 'var(--status-error-subtle)' },
  cancelled:                  { label: 'Cancelado',   color: 'var(--text-tertiary)',   bgColor: 'rgba(255,255,255,0.06)' },
};

export const TASK_LABELS: Record<TaskType, string> = {
  CREATE_GOOGLE_USER:         'Crear usuario en Google Workspace',
  ADD_GOOGLE_GROUPS:          'Agregar a grupos',
  CONFIGURE_GMAIL_SIGNATURE:  'Configurar firma de Gmail',
  SEND_WELCOME_EMAIL:         'Enviar email de bienvenida',
  ANNOUNCE_IN_GROUPS:         'Anunciar en grupos',
  POST_INTERNAL_ANNOUNCEMENT: 'Publicar anuncio interno',
  REQUEST_DEVICE:             'Solicitar dispositivo',
  NOTIFY_ADMINISTRATION:      'Notificar a Administración',
};

export const COUNTRIES = [
  { code: 'AR', name: 'Argentina' },
  { code: 'BR', name: 'Brasil' },
  { code: 'CL', name: 'Chile' },
  { code: 'CO', name: 'Colombia' },
  { code: 'MX', name: 'México' },
  { code: 'PE', name: 'Perú' },
  { code: 'UY', name: 'Uruguay' },
  { code: 'EC', name: 'Ecuador' },
  { code: 'BO', name: 'Bolivia' },
  { code: 'PY', name: 'Paraguay' },
  { code: 'VE', name: 'Venezuela' },
  { code: 'US', name: 'Estados Unidos' },
  { code: 'ES', name: 'España' },
  { code: 'OTHER', name: 'Otro' },
];

export const LATAM_COUNTRIES = ['AR', 'BR', 'CL', 'CO', 'MX', 'PE', 'UY', 'EC', 'BO', 'PY', 'VE'];

export const TAX_ID_TYPES = [
  { code: 'CUIT',     label: 'CUIT (Argentina)',  mask: '##-########-#' },
  { code: 'CUIL',     label: 'CUIL (Argentina)',  mask: '##-########-#' },
  { code: 'RUC',      label: 'RUC (Perú)',        mask: '###########' },
  { code: 'CPF',      label: 'CPF (Brasil)',      mask: '###.###.###-##' },
  { code: 'CNPJ',     label: 'CNPJ (Brasil)',     mask: '##.###.###/####-##' },
  { code: 'RUT',      label: 'RUT (Chile)',       mask: '##.###.###-#' },
  { code: 'NIT',      label: 'NIT (Colombia)',    mask: '#########-#' },
  { code: 'SSN',      label: 'SSN (USA)',         mask: '###-##-####' },
  { code: 'PASSPORT', label: 'Pasaporte',         mask: '' },
  { code: 'OTHER',    label: 'Otro',              mask: '' },
];

export const TEAMS: { value: Team; label: string }[] = [
  { value: 'engineering',     label: 'Engineering' },
  { value: 'design',          label: 'Design' },
  { value: 'product',         label: 'Product' },
  { value: 'rrhh',            label: 'RRHH' },
  { value: 'administration',  label: 'Administración' },
  { value: 'leadership',      label: 'Leadership' },
];

export const CONTRACT_TYPES: { value: ContractType; label: string }[] = [
  { value: 'employee',   label: 'Empleado' },
  { value: 'contractor', label: 'Contratista' },
  { value: 'intern',     label: 'Pasante' },
];

export const SEED_GROUPS: Omit<GroupSuggestion, 'status' | 'workspaceGroupId'>[] = [
  { email: 'all@zafirus.tech',           displayName: 'Todo el equipo', category: 'all' },
  { email: 'engineering@zafirus.tech',   displayName: 'Engineering',    category: 'team' },
  { email: 'design@zafirus.tech',        displayName: 'Design',         category: 'team' },
  { email: 'product@zafirus.tech',       displayName: 'Product',        category: 'team' },
  { email: 'rrhh@zafirus.tech',          displayName: 'RRHH',           category: 'team' },
  { email: 'argentina@zafirus.tech',     displayName: 'Argentina',      category: 'country' },
  { email: 'latam@zafirus.tech',         displayName: 'LATAM',          category: 'country' },
  { email: 'international@zafirus.tech', displayName: 'Internacional',  category: 'country' },
  { email: 'contractors@zafirus.tech',   displayName: 'Contractors',    category: 'cross' },
];
