import { Injectable, signal, computed, inject } from '@angular/core';
import {
  OnboardingCase, Employee, CandidateData, CandidateFile, Reference, EmailTemplate,
  GroupSuggestion, OnboardingTask, AuditEvent, CaseStatus,
  TaskType, Team, ContractType, CreateCaseData, Toast,
  SEED_GROUPS, LATAM_COUNTRIES, TASK_LABELS,
} from '../models/onboarding-case.model';
import { IWorkspaceApi, WORKSPACE_API } from './workspace-api.interface';
import { formatCuit, isFutureDate, isPastDate, isValidEmail, validateCuit } from '../../shared/utils/cuit-validator';

// ── Helpers ──

let _idCounter = 0;
function uid(): string {
  _idCounter++;
  return `${Date.now().toString(36)}-${_idCounter.toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function generateCorporateEmail(first: string, last: string): string {
  const initial = removeAccents(first.charAt(0).toLowerCase());
  const surname = removeAccents(last.split(' ')[0].toLowerCase().replace(/[^a-z]/g, ''));
  return `${initial}${surname}@zafirus.tech`;
}

function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let pw = '';
  for (let i = 0; i < 12; i++) pw += chars.charAt(Math.floor(Math.random() * chars.length));
  return pw;
}

function makeAudit(
  action: string, entityType: string, entityId: string,
  actorType: 'user' | 'system' | 'integration' = 'user',
  actorId = 'rrhh',
  details?: Record<string, unknown>
): AuditEvent {
  return { id: uid(), timestamp: Date.now(), actorType, actorId, action, entityType, entityId, details };
}

function makeTask(
  type: TaskType,
  owner: 'system' | 'rrhh' | 'candidate' | 'admin' | 'it' = 'system',
  meta?: Record<string, unknown>
): OnboardingTask {
  return { id: uid(), type, status: 'pending', owner, startedAt: null, completedAt: null, attempts: 0, lastError: null, metadata: meta };
}

function evaluateGroups(employee: Employee): GroupSuggestion[] {
  const result: GroupSuggestion[] = [];
  const add = (email: string) => {
    const g = SEED_GROUPS.find(sg => sg.email === email);
    if (g) result.push({ ...g, status: 'pending', workspaceGroupId: null });
  };
  add('all@zafirus.tech');
  add(`${employee.team}@zafirus.tech`);
  if (employee.countryId === 'AR') add('argentina@zafirus.tech');
  if (LATAM_COUNTRIES.includes(employee.countryId)) add('latam@zafirus.tech');
  else add('international@zafirus.tech');
  if (employee.contractType === 'contractor') add('contractors@zafirus.tech');
  return [...new Map(result.map(g => [g.email, g])).values()];
}

function createInitialCandidateData(): CandidateData {
  return {
    taxIdType: '', taxIdValue: '', paymentMethod: '', cbu: '', bankName: '',
    accountNumber: '', swift: '', beneficiaryAddress: '', needsW8: false,
    walletType: '', walletAddress: '', hasQrBinance: false,
    references: [], files: [], currentStep: 1, completedSteps: [], submittedAt: null, consolidated: false,
  };
}

type WizardCandidateField = 'taxId' | 'cbu' | 'bank' | 'references' | 'files' | null;

const DEFAULT_EMAIL_HTML = `<h1 style="font-size: 24px; font-weight: 700; margin-bottom: 24px;">¡BIENVENIDA/O A ZAFIRUS TECHNOLOGIES!</h1>

<p>¡<span class="var-pill" data-variable="firstName" contenteditable="false">Nombre</span>, nos alegra mucho que te sumes al equipo!</p>

<p>Tu fecha de ingreso es el: <span class="var-pill" data-variable="startDateFormatted" contenteditable="false">DD/MM/AAAA</span></p>

<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">

<h2 style="font-size: 18px; font-weight: 600; margin-bottom: 12px;">💻 Google Workspace</h2>

<p>Nuestra plataforma principal de trabajo es Google Workspace.</p>

<p><strong>Datos de acceso:</strong></p>
<p>📩 Usuario: <span class="var-pill" data-variable="corporateEmail" contenteditable="false">usuario@zafirus.tech</span></p>
<p>🔐 Contraseña temporal: <span class="var-pill" data-variable="temporaryPassword" contenteditable="false">************</span></p>

<p><em>Debés cambiar la contraseña en tu primer login.</em></p>

<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">

<h2 style="font-size: 18px; font-weight: 600; margin-bottom: 12px;">📂 Carpeta de onboarding</h2>

<p>Acceso: <span class="var-pill" data-variable="onboardingFolderUrl" contenteditable="false">https://drive.google.com/drive/folders/onboarding</span></p>

<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">

<h2 style="font-size: 18px; font-weight: 600; margin-bottom: 12px;">🎨 Kit de Redes</h2>

<p>Kit: <span class="var-pill" data-variable="kitRedesUrl" contenteditable="false">https://drive.google.com/kit-redes</span></p>

<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">

<h2 style="font-size: 18px; font-weight: 600; margin-bottom: 12px;">🗓️ Agenda</h2>

<p>• <span class="var-pill" data-variable="welcomeMeetingTime" contenteditable="false">DD/MM - HH:mm</span>: Alta con RRHH<br>
👉 <span class="var-pill" data-variable="welcomeMeetingLink" contenteditable="false">meet.google.com/xxxx-xxxx-xxx</span></p>

<p>• <span class="var-pill" data-variable="managerMeetingTime" contenteditable="false">DD/MM - HH:mm</span>: Reunión con <span class="var-pill" data-variable="managerName" contenteditable="false">Nombre y apellido</span><br>
👉 <span class="var-pill" data-variable="managerMeetingLink" contenteditable="false">meet.google.com/xxxx-xxxx-xxx</span></p>

<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">

<h2 style="font-size: 18px; font-weight: 600; margin-bottom: 12px;">📋 Formulario de onboarding</h2>

<p>Completá tus datos fiscales y bancarios aquí:</p>
<p>👉 <span class="var-pill" data-variable="candidateFormUrl" contenteditable="false">https://zafirustech.com/onboarding/form/...</span></p>

<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">

<p>¡Te damos la bienvenida! 🙌</p>
<p>Equipo de RRHH · Zafirus Technologies</p>`;

interface EmailTemplatePreset {
  id: string;
  title: string;
  tone: string;
  description: string;
  previewLines: [string, string];
  subject: string;
  bodyHtml: string;
}

const EMAIL_TEMPLATE_PRESETS: EmailTemplatePreset[] = [
  {
    id: 'standard',
    title: 'Bienvenida estándar',
    tone: 'Cálida',
    description: 'Plantilla general con variables base, agenda y recursos de arranque.',
    previewLines: [
      'Hola <Nombre>,',
      'Te damos la bienvenida con accesos, agenda y recursos listos para arrancar.',
    ],
    subject: '¡Bienvenida/o a Zafirus Technologies!',
    bodyHtml: DEFAULT_EMAIL_HTML,
  },
  {
    id: 'technical',
    title: 'Bienvenida técnica',
    tone: 'Operativa',
    description: 'Incluye acceso, VPN, herramientas y los pasos técnicos iniciales.',
    previewLines: [
      'Hola <Nombre>,',
      'Tu arranque técnico incluye accesos, VPN, herramientas y links de trabajo.',
    ],
    subject: 'Bienvenida técnica | Zafirus Technologies',
    bodyHtml: `<h1 style="font-size: 24px; font-weight: 700; margin-bottom: 24px;">¡ARRANQUE TÉCNICO LISTO!</h1>

<p>Hola <span class="var-pill" data-variable="firstName" contenteditable="false">Nombre</span>, ya está preparado tu onboarding técnico.</p>

<p>Vas a encontrar accesos, VPN, herramientas y recursos en la siguiente guía para empezar sin fricción.</p>

<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">

<h2 style="font-size: 18px; font-weight: 600; margin-bottom: 12px;">🔐 Accesos iniciales</h2>

<p>📩 Usuario corporativo: <span class="var-pill" data-variable="corporateEmail" contenteditable="false">usuario@zafirus.tech</span></p>
<p>🔑 Contraseña temporal: <span class="var-pill" data-variable="temporaryPassword" contenteditable="false">************</span></p>

<p>📂 Carpeta de onboarding: <span class="var-pill" data-variable="onboardingFolderUrl" contenteditable="false">https://drive.google.com/drive/folders/onboarding</span></p>
<p>🧰 Kit de redes y utilidades: <span class="var-pill" data-variable="kitRedesUrl" contenteditable="false">https://drive.google.com/kit-redes</span></p>

<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">

<h2 style="font-size: 18px; font-weight: 600; margin-bottom: 12px;">🗓️ Coordinación</h2>

<p>• <span class="var-pill" data-variable="welcomeMeetingTime" contenteditable="false">DD/MM - HH:mm</span> — Alta con RRHH<br>
👉 <span class="var-pill" data-variable="welcomeMeetingLink" contenteditable="false">meet.google.com/xxxx-xxxx-xxx</span></p>

<p>• <span class="var-pill" data-variable="managerMeetingTime" contenteditable="false">DD/MM - HH:mm</span> — Reunión con <span class="var-pill" data-variable="managerName" contenteditable="false">Nombre y apellido</span><br>
👉 <span class="var-pill" data-variable="managerMeetingLink" contenteditable="false">meet.google.com/xxxx-xxxx-xxx</span></p>

<p>• Formulario del candidato: <span class="var-pill" data-variable="candidateFormUrl" contenteditable="false">https://zafirustech.com/onboarding/form/...</span></p>

<p>¡Quedamos a disposición para cualquier duda técnica!</p>`,
  },
  {
    id: 'executive',
    title: 'Bienvenida ejecutiva',
    tone: 'Formal',
    description: 'Versión breve y sobria para liderazgos o perfiles de dirección.',
    previewLines: [
      'Estimado/a <Nombre>,',
      'Le compartimos los pasos clave para su incorporación.',
    ],
    subject: 'Bienvenida/o a Zafirus Technologies',
    bodyHtml: `<h1 style="font-size: 24px; font-weight: 700; margin-bottom: 24px;">BIENVENIDA/O A ZAFIRUS TECHNOLOGIES</h1>

<p>Estimado/a <span class="var-pill" data-variable="firstName" contenteditable="false">Nombre</span>:</p>

<p>Le damos la bienvenida a Zafirus Technologies y confirmamos su incorporación para el <span class="var-pill" data-variable="startDateFormatted" contenteditable="false">DD/MM/AAAA</span>.</p>

<p>Compartimos los accesos iniciales y la agenda de arranque para acompañar su primer día.</p>

<p>• Usuario corporativo: <span class="var-pill" data-variable="corporateEmail" contenteditable="false">usuario@zafirus.tech</span></p>
<p>• Contraseña temporal: <span class="var-pill" data-variable="temporaryPassword" contenteditable="false">************</span></p>
<p>• Reunión de bienvenida: <span class="var-pill" data-variable="welcomeMeetingTime" contenteditable="false">DD/MM - HH:mm</span> · <span class="var-pill" data-variable="welcomeMeetingLink" contenteditable="false">meet.google.com/xxxx-xxxx-xxx</span></p>
<p>• Reunión con su responsable: <span class="var-pill" data-variable="managerMeetingTime" contenteditable="false">DD/MM - HH:mm</span> · <span class="var-pill" data-variable="managerName" contenteditable="false">Nombre y apellido</span></p>

<p>Equipo de RRHH · Zafirus Technologies</p>`,
  },
];

function createEmailTemplate(subject: string, bodyHtml: string, overrides: Partial<EmailTemplate> = {}): EmailTemplate {
  return {
    subject,
    bodyHtml,
    welcomeMeetingTime: '',
    welcomeMeetingLink: '',
    managerMeetingTime: '',
    managerMeetingLink: '',
    onboardingFolderUrl: '',
    kitRedesUrl: '',
    temporaryPassword: generateTemporaryPassword(),
    approvedAt: null,
    sentAt: null,
    scheduledFor: null,
    status: 'draft',
    ...overrides,
  };
}

@Injectable({ providedIn: 'root' })
export class OnboardingMockService {
  // ── Signals ──
  readonly emailTemplates = EMAIL_TEMPLATE_PRESETS;
  readonly cases = signal<OnboardingCase[]>([]);
  readonly selectedCaseId = signal<string | null>(null);
  readonly toasts = signal<Toast[]>([]);
  readonly candidateViewOpen = signal(false);
  readonly sidebarOpen = signal(true);
  readonly workspaceMode = signal(true);
  readonly wizardMode = signal(false);
  readonly autoExecuteTasks = signal(true);
  readonly autoSendEmail = signal(false);
  readonly autoRun = this.wizardMode;
  readonly wizardActiveTab = signal<string>('overview');
  readonly wizardCandidateField = signal<WizardCandidateField>(null);
  readonly wizardCandidateStep = signal(0);
  readonly candidateResponseCountdown = signal<number | null>(null);
  readonly wizardCaseIndex = signal(0);
  readonly isDemo = computed(() => !this.workspaceMode());

  private readonly DEMO_STORAGE_KEY = 'zafirus-demo-state';
  private readonly WORKSPACE_STORAGE_KEY = 'zafirus-workspace-state';
  private autoRunIntervalId: ReturnType<typeof setInterval> | null = null;
  private candidateResponseCountdownId: ReturnType<typeof setInterval> | null = null;
  private wizardCycleBusy = false;
  private readonly workspaceApi = inject<IWorkspaceApi>(WORKSPACE_API);

  readonly selectedCase = computed(() => {
    const id = this.selectedCaseId();
    return this.cases().find(c => c.id === id) ?? null;
  });

  readonly demoSummary = computed(() => {
    const selected = this.selectedCase();
    return {
      caseCount: this.cases().length,
      selectedCaseId: this.selectedCaseId(),
      candidateViewOpen: this.candidateViewOpen(),
      sidebarOpen: this.sidebarOpen(),
      selectedCaseStatus: selected?.status ?? null,
      selectedTaskCount: selected?.tasks.length ?? 0,
      selectedFailedTaskCount: selected?.tasks.filter(t => t.status === 'failed').length ?? 0,
      selectedAuditCount: selected?.auditLog.length ?? 0,
    };
  });

  constructor() {
    // _initFromStorage is triggered by setWorkspaceMode(false) when route activates preview mode
  }

  private _resetState(): void {
    this._stopAutoRun();
    this._clearCandidateResponseCountdown();
    this.cases.set([]);
    this.selectedCaseId.set(null);
    this.wizardCaseIndex.set(0);
    this.toasts.set([]);
    this.candidateViewOpen.set(false);
    this.sidebarOpen.set(true);
    this.wizardMode.set(false);
    this.autoExecuteTasks.set(true);
    this.autoSendEmail.set(false);
    this.wizardActiveTab.set('overview');
    this.wizardCandidateField.set(null);
    this.wizardCandidateStep.set(0);
    _idCounter = 0;
  }

  // ── CRUD ──

  selectCase(id: string | null): boolean {
    if (id === null) {
      this.selectedCaseId.set(null);
      this._persistToStorage();
      return true;
    }

    if (!this.cases().some(c => c.id === id)) {
      return false;
    }

    this.selectedCaseId.set(id);
    this._persistToStorage();
    return true;
  }

  selectDefaultCase(): boolean {
    const first = this.cases()[0];
    if (!first) return false;
    this.selectedCaseId.set(first.id);
    this._persistToStorage();
    return true;
  }

  selectCaseByCandidateToken(token: string): boolean {
    if (!this.isDemo()) return false;

    const match = this.cases().find(c => c.candidateToken === token);
    if (!match) return false;
    this.selectedCaseId.set(match.id);
    this._persistToStorage();
    return true;
  }

  setCandidateViewOpen(open: boolean): void {
    if (!this.isDemo()) {
      this.candidateViewOpen.set(false);
      this._persistToStorage();
      return;
    }

    this.candidateViewOpen.set(open);
    this._persistToStorage();
  }

  setSidebarOpen(open: boolean): void {
    this.sidebarOpen.set(open);
    this._persistToStorage();
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(open => !open);
    this._persistToStorage();
  }

  setWorkspaceMode(val: boolean): void {
    this.workspaceMode.set(val);
    if (val) {
      this.ensureWorkspaceState();
      return;
    }

    this.loadFromStorage();
  }

  loadFromStorage(): void {
    if (!this.isDemo()) return;

    this._loadStateFromStorage(sessionStorage, this.DEMO_STORAGE_KEY);
    if (this.cases().length === 0) {
      this.seedDemo();
    }

    if (this.autoRun()) this._startAutoRun();
  }

  toggleAutoRun(): void {
    if (!this.isDemo()) {
      this.wizardMode.set(false);
      this._stopAutoRun();
      this._clearCandidateResponseCountdown();
      this._persistToStorage();
      return;
    }

    if (this.wizardMode()) {
      this.wizardMode.set(false);
      this._stopAutoRun();
      this._clearCandidateResponseCountdown();
      this._persistToStorage();
      return;
    }

    this.wizardMode.set(true);
    this._startAutoRun();
    this._runAutoRunCycle();
    this._persistToStorage();
  }

  ensureDemoSeeded(): void {
    if (this.cases().length === 0) {
      this.seedDemo();
    }
  }

  ensureWorkspaceState(): void {
    if (this.isDemo()) return;

    this._resetState();
    this.cases.set([]);
    this.selectedCaseId.set(null);
    this._persistToStorage();
  }

  resetDemo(): void {
    this.resetToSeed();
  }

  resetToSeed(): void {
    try {
      sessionStorage.removeItem(this.DEMO_STORAGE_KEY);
    } catch (err: any) {
      void err;
    }

    this._resetState();
    this.seedDemo();
  }

  private validateCreateCaseData(data: CreateCaseData): string | null {
    if (!data.firstName.trim()) return 'Completá el nombre.';
    if (!data.lastName.trim()) return 'Completá el apellido.';
    if (!isValidEmail(data.personalEmail)) return 'Ingresá un correo personal válido.';

    const cuitValidation = validateCuit(data.CI);
    if (!cuitValidation.valid) return cuitValidation.error ?? 'El CUIT no es válido.';

    if (!data.birthday) return 'Completá la fecha de nacimiento.';
    if (isFutureDate(data.birthday)) return 'La fecha de nacimiento no puede ser futura.';

    if (!data.countryId.trim()) return 'Completá el país.';
    if (!data.provinceId.trim()) return 'Completá la provincia.';
    if (!data.cityId.trim()) return 'Completá la ciudad.';
    if (!data.role.trim()) return 'Completá el puesto.';
    if (!data.team) return 'Completá el equipo.';
    if (!data.contractType) return 'Completá el tipo de contrato.';
    if (!data.managerName.trim()) return 'Completá el responsable directo.';
    if (!data.startDate) return 'Completá la fecha de ingreso.';
    if (isPastDate(data.startDate)) return 'La fecha de ingreso no puede ser pasada.';

    return null;
  }

  createCase(data: CreateCaseData): OnboardingCase {
    const validationError = this.validateCreateCaseData(data);
    if (validationError) {
      throw new Error(validationError);
    }

    const now = Date.now();
    const employee: Employee = {
      guid: uid(), name: data.firstName, lastName: data.lastName,
      CI: formatCuit(data.CI), CUIT: null, birthday: data.birthday,
      email: data.personalEmail, corporateEmail: null, CBU: null,
      cityId: data.cityId, provinceId: data.provinceId, countryId: data.countryId,
      startDate: data.startDate, status: 'inactive', role: data.role,
      team: data.team, contractType: data.contractType, managerName: data.managerName,
    };

    const suggestedEmail = generateCorporateEmail(data.firstName, data.lastName);
    const suggestedGroups = evaluateGroups(employee);

    const emailTemplate = createEmailTemplate('¡Bienvenida/o a Zafirus Technologies!', DEFAULT_EMAIL_HTML, {
      welcomeMeetingTime: data.welcomeMeetingTime || '',
      welcomeMeetingLink: data.welcomeMeetingLink || '',
      managerMeetingTime: data.managerMeetingTime || '',
      managerMeetingLink: data.managerMeetingLink || '',
      onboardingFolderUrl: data.onboardingFolderUrl || '',
      kitRedesUrl: data.kitRedesUrl || '',
    });

    const id = uid();
    const newCase: OnboardingCase = {
      id, employee, status: 'draft',
      candidateToken: uid(), candidateTokenExpiresAt: now + 7 * 24 * 3600000,
      candidateData: createInitialCandidateData(), emailTemplate,
      suggestedEmail, suggestedGroups, tasks: [],
      auditLog: [makeAudit('case_created', 'onboarding_case', id)],
      correctionNote: null, blockReason: null, createdAt: now, updatedAt: now,
    };

    this.cases.update(cs => [...cs, newCase]);
    this.selectedCaseId.set(id);
    this.addToast('success', 'Caso creado', `${data.firstName} ${data.lastName}`);
    this._persistToStorage();
    return newCase;
  }

  updateEmployee(caseId: string, updates: Partial<Employee>): void {
    this.cases.update(cs => cs.map(c =>
      c.id === caseId ? { ...c, employee: { ...c.employee, ...updates }, updatedAt: Date.now() } : c
    ));
    this._persistToStorage();
  }

  // ── Status transitions ──

  sendCandidateForm(caseId: string): void {
    this._transition(caseId, 'draft', 'candidate_invited', 'candidate_form_sent');
    this.addToast('info', 'Formulario enviado', 'El candidato puede completar sus datos');
    this._setWizardTab('data');
  }

  submitCandidateForm(caseId: string): void {
    this._clearCandidateResponseCountdown();
    this.wizardCandidateField.set(null);
    this.wizardCandidateStep.set(0);
    this.cases.update(cs => cs.map(c =>
      c.id === caseId && c.status === 'candidate_invited' ? {
        ...c, status: 'candidate_submitted' as CaseStatus,
        candidateData: c.candidateData ? { ...c.candidateData, submittedAt: Date.now() } : null,
        auditLog: [...c.auditLog, makeAudit('candidate_form_submitted', 'onboarding_case', caseId, 'user', 'candidate')],
        updatedAt: Date.now(),
      } : c
    ));
    this.addToast('success', 'Formulario recibido');
    this._setWizardTab('data');
    this._persistToStorage();
  }

  startReview(caseId: string): void {
    this._transition(caseId, 'candidate_submitted', 'hr_review', 'review_started');
    this._setWizardTab('overview');
  }

  requestCorrection(caseId: string, note: string): void {
    this.cases.update(cs => cs.map(c =>
      c.id === caseId && c.status === 'hr_review' ? {
        ...c, status: 'candidate_invited' as CaseStatus, correctionNote: note,
        candidateToken: uid(), candidateTokenExpiresAt: Date.now() + 7 * 24 * 3600000,
        candidateData: c.candidateData ? { ...c.candidateData, submittedAt: null } : null,
        auditLog: [...c.auditLog, makeAudit('correction_requested', 'onboarding_case', caseId, 'user', 'rrhh', { note })],
        updatedAt: Date.now(),
      } : c
    ));
    this.addToast('warning', 'Corrección solicitada');
    this._persistToStorage();
  }

  approve(caseId: string): void {
    this._transition(caseId, 'hr_review', 'ready_to_activate', 'case_approved');
    this.addToast('success', 'Caso aprobado', 'Listo para activar');
  }

  activate(caseId: string): void {
    const c = this.cases().find(x => x.id === caseId);
    if (!c || c.status !== 'ready_to_activate') return;

    const corporateEmail = c.suggestedEmail || generateCorporateEmail(c.employee.name, c.employee.lastName);
    const tasks: OnboardingTask[] = [
      makeTask('CREATE_GOOGLE_USER', 'system', { email: corporateEmail }),
      makeTask('ADD_GOOGLE_GROUPS', 'system', { groups: c.suggestedGroups.map(g => g.email) }),
      makeTask('CONFIGURE_GMAIL_SIGNATURE', 'system'),
      makeTask('SEND_WELCOME_EMAIL', 'system', { to: [corporateEmail, c.employee.email] }),
    ];
    c.suggestedGroups.forEach(g => tasks.push(makeTask('ANNOUNCE_IN_GROUPS', 'system', { groupEmail: g.email, groupName: g.displayName })));
    tasks.push(makeTask('POST_INTERNAL_ANNOUNCEMENT', 'system'));
    tasks.push(makeTask('REQUEST_DEVICE', 'it'));

    this.cases.update(cs => cs.map(x =>
      x.id === caseId ? {
        ...x, status: 'active_pending_automation' as CaseStatus,
        employee: { ...x.employee, corporateEmail }, tasks,
        auditLog: [...x.auditLog, makeAudit('case_activated', 'onboarding_case', caseId)],
        updatedAt: Date.now(),
      } : x
    ));
    this.addToast(
      'info',
      'Activación iniciada',
      this.autoExecuteTasks()
        ? 'Ejecutando tareas automáticas…'
        : 'Las tareas quedarán pendientes para ejecución manual.'
    );
    this._setWizardTab('tasks');
    this._persistToStorage();

    if (this.autoSendEmail() && c.emailTemplate?.status === 'draft') {
      void this.sendEmail(caseId);
    }

    this._runNextTask(caseId);
  }

  block(caseId: string, reason: string): void {
    this.cases.update(cs => cs.map(c =>
      c.id === caseId ? {
        ...c, status: 'blocked' as CaseStatus, blockReason: reason,
        auditLog: [...c.auditLog, makeAudit('case_blocked', 'onboarding_case', caseId, 'user', 'rrhh', { reason })],
        updatedAt: Date.now(),
      } : c
    ));
    this.addToast('error', 'Caso bloqueado');
    this._persistToStorage();
  }

  unblock(caseId: string): void {
    this.cases.update(cs => cs.map(c =>
      c.id === caseId && c.status === 'blocked' ? {
        ...c, status: 'hr_review' as CaseStatus, blockReason: null,
        auditLog: [...c.auditLog, makeAudit('case_unblocked', 'onboarding_case', caseId)],
        updatedAt: Date.now(),
      } : c
    ));
    this.addToast('info', 'Caso desbloqueado');
    this._persistToStorage();
  }

  cancel(caseId: string): void {
    this.cases.update(cs => cs.map(c =>
      c.id === caseId ? {
        ...c, status: 'cancelled' as CaseStatus,
        auditLog: [...c.auditLog, makeAudit('case_cancelled', 'onboarding_case', caseId)],
        updatedAt: Date.now(),
      } : c
    ));
    this.addToast('info', 'Caso cancelado');
    this._persistToStorage();
  }

  // ── Candidate ──

  updateCandidateData(caseId: string, data: Partial<CandidateData>): void {
    this.cases.update(cs => cs.map(c =>
      c.id === caseId ? {
        ...c, candidateData: c.candidateData ? { ...c.candidateData, ...data } : null,
        updatedAt: Date.now(),
      } : c
    ));
    this._persistToStorage();
  }

  async simulateFormFill(step = 0): Promise<void> {
    if (!this.isDemo() || !this.wizardMode()) return;

    const c = this._getWizardCase();
    if (!c || c.status !== 'candidate_invited' || !c.candidateData) return;

    const caseId = c.id;
    const references: Reference[] = [
      {
        id: uid(),
        fullName: 'Carla Benítez',
        relationship: 'Ex manager',
        company: 'Northwind Studio',
        email: 'carla.benitez@northwind.dev',
        phone: '+54 11 5555-0101',
      },
      {
        id: uid(),
        fullName: 'Tomás Medina',
        relationship: 'HR partner',
        company: 'Atlas Retail',
        email: 'tomas.medina@atlas.com',
        phone: '+54 11 5555-0202',
      },
    ];

    const files: CandidateFile[] = [
      { id: uid(), fileType: 'w8', name: 'W-8 BEN firmado.pdf', sizeBytes: 184320 },
      { id: uid(), fileType: 'qr_binance', name: 'Comprobante_Binance.png', sizeBytes: 92342 },
    ];

    const steps = [
      {
        field: 'taxId' as const,
        title: 'Paso 1: CUIL',
        message: 'Completando la identificación fiscal.',
        data: { taxIdType: 'CUIL', taxIdValue: '20-12345678-3', needsW8: false, currentStep: 1, completedSteps: [1] },
      },
      {
        field: 'cbu' as const,
        title: 'Paso 2: CBU',
        message: 'Cargando el CBU y el método de cobro.',
        data: { paymentMethod: 'CBU' as const, cbu: '0000003100000000000000', accountNumber: '000123456789', currentStep: 2, completedSteps: [1, 2] },
      },
      {
        field: 'bank' as const,
        title: 'Paso 3: Banco',
        message: 'Completando banco y datos de transferencia.',
        data: { bankName: 'Banco Galicia', beneficiaryAddress: 'Av. Corrientes 1234, CABA', swift: 'GALISARBA', currentStep: 3, completedSteps: [1, 2, 3] },
      },
      {
        field: 'references' as const,
        title: 'Paso 4: Referencias',
        message: 'Agregando referencias laborales.',
        data: { references, currentStep: 4, completedSteps: [1, 2, 3, 4] },
      },
      {
        field: 'files' as const,
        title: 'Paso 5: Archivos',
        message: 'Adjuntando comprobantes y respaldos.',
        data: { files, hasQrBinance: true, currentStep: 5, completedSteps: [1, 2, 3, 4, 5] },
      },
    ];

    for (let index = step; index < steps.length; index++) {
      const current = steps[index];
      this.wizardCandidateField.set(current.field);
      this.wizardCandidateStep.set(index + 1);
      this.addToast('info', current.title, current.message);
      this.updateCandidateData(caseId, current.data);
      await this._delay(650);
    }

    this.wizardCandidateField.set(null);
    this.wizardCandidateStep.set(steps.length);
  }

  consolidateCandidateData(caseId: string): void {
    this.cases.update(cs => cs.map(c => {
      if (c.id !== caseId || !c.candidateData) return c;
      const updatedData = { ...c.candidateData, consolidated: true };
      const tasks = [...c.tasks];
      if (!tasks.find(t => t.type === 'NOTIFY_ADMINISTRATION')) {
        tasks.push(makeTask('NOTIFY_ADMINISTRATION', 'admin'));
      }
      return {
        ...c, candidateData: updatedData, tasks,
        auditLog: [...c.auditLog, makeAudit('candidate_data_consolidated', 'onboarding_case', caseId)],
        updatedAt: Date.now(),
      };
    }));
    this.addToast('success', 'Datos consolidados');
    this._persistToStorage();
    // Run if in automation phase
    const c = this.cases().find(x => x.id === caseId);
    if (c?.status === 'active_pending_automation') this._runNextTask(caseId);
  }

  // ── Email ──

  updateEmailTemplate(caseId: string, updates: Partial<EmailTemplate>): void {
    this.cases.update(cs => cs.map(c => {
      if (c.id !== caseId || !c.emailTemplate || c.emailTemplate.status === 'sent') return c;
      return {
        ...c,
        emailTemplate: { ...c.emailTemplate, ...updates },
        updatedAt: Date.now(),
      };
    }));
    this._persistToStorage();
  }

  applyEmailTemplate(caseId: string, templateId: string): boolean {
    const template = this.emailTemplates.find(item => item.id === templateId);
    if (!template) return false;

    let applied = false;
    this.cases.update(cs => cs.map(c => {
      if (c.id !== caseId) return c;
      applied = true;
      return {
        ...c,
        emailTemplate: createEmailTemplate(template.subject, template.bodyHtml),
        auditLog: [...c.auditLog, makeAudit('email_template_applied', 'email_template', caseId, 'user', 'rrhh', { templateId: template.id })],
        updatedAt: Date.now(),
      };
    }));

    if (applied) this._persistToStorage();
    return applied;
  }

  /** @deprecated Use sendEmail(caseId) instead. */
  approveEmail(caseId: string): void {
    void this.sendEmail(caseId);
  }

  scheduleEmail(caseId: string, scheduledFor: number): void {
    const c = this.cases().find(x => x.id === caseId);
    if (!c?.emailTemplate) return;

    if (scheduledFor <= Date.now()) {
      this.addToast('error', 'No se puede programar un envío en el pasado.');
      return;
    }

    this.cases.update(cs => cs.map(item =>
      item.id === caseId && item.emailTemplate ? {
        ...item,
        emailTemplate: {
          ...item.emailTemplate,
          approvedAt: null,
          scheduledFor,
          sentAt: null,
          status: 'scheduled',
        },
        auditLog: [...item.auditLog, makeAudit('email_scheduled', 'email_template', caseId, 'user', 'rrhh', { scheduledFor })],
        updatedAt: Date.now(),
      } : item
    ));

    this.addToast('info', 'Correo programado', `Se enviará el ${this._formatShortDate(scheduledFor)}`);
    this._persistToStorage();
  }

  cancelScheduledEmail(caseId: string): void {
    const c = this.cases().find(x => x.id === caseId);
    if (!c?.emailTemplate || c.emailTemplate.status !== 'scheduled') return;

    this.cases.update(cs => cs.map(item =>
      item.id === caseId && item.emailTemplate ? {
        ...item,
        emailTemplate: {
          ...item.emailTemplate,
          approvedAt: null,
          scheduledFor: null,
          sentAt: null,
          status: 'draft',
        },
        auditLog: [...item.auditLog, makeAudit('email_schedule_cancelled', 'email_template', caseId)],
        updatedAt: Date.now(),
      } : item
    ));

    this.addToast('info', 'Programación cancelada');
    this._persistToStorage();
  }

  async sendEmail(caseId: string): Promise<boolean> {
    const c = this.cases().find(x => x.id === caseId);
    if (!c?.emailTemplate) return false;

    try {
      const result = await this.workspaceApi.sendWelcomeEmail(
        c.employee.email,
        c.emailTemplate.subject,
        c.emailTemplate.bodyHtml,
      );

      if (!result.success) {
        this.addToast('error', 'No se pudo enviar el correo', result.error || 'La API devolvió un error');
        return false;
      }

      const sentAt = Date.now();
      const wasSent = !!c.emailTemplate.sentAt;

      this.cases.update(cs => cs.map(item =>
        item.id === caseId && item.emailTemplate ? {
          ...item,
          emailTemplate: {
            ...item.emailTemplate,
            approvedAt: null,
            sentAt,
            scheduledFor: null,
            status: 'sent',
          },
          auditLog: [...item.auditLog, makeAudit('email_sent', 'email_template', caseId, 'integration', 'workspace', { messageId: result['messageId'] ?? null })],
          updatedAt: sentAt,
        } : item
      ));

      this.addToast('success', wasSent ? `Correo reenviado a ${c.employee.name} ${c.employee.lastName}` : `Correo enviado a ${c.employee.name} ${c.employee.lastName}`);
      console.debug('[OnboardingMockService] sendEmail success', { caseId, result });
      this._persistToStorage();
      return true;
    } catch (error) {
      console.debug('[OnboardingMockService] sendEmail error', { caseId, error });
      this.addToast('error', 'No se pudo enviar el correo');
      return false;
    }
  }

  retryTask(caseId: string, taskId: string): void {
    this.cases.update(cs => cs.map(c =>
      c.id === caseId ? {
        ...c, tasks: c.tasks.map(t => t.id === taskId ? { ...t, status: 'pending' as const, lastError: null } : t),
      } : c
    ));
    this._runTask(caseId, taskId);
  }

  executeTask(caseId: string, taskId: string): void {
    const c = this.cases().find(x => x.id === caseId);
    if (!c) return;

    const task = c.tasks.find(t => t.id === taskId);
    if (!task || task.status !== 'pending') return;

    this._runTask(caseId, taskId);
  }

  executeAllPending(caseId: string): void {
    const c = this.cases().find(x => x.id === caseId);
    if (!c) return;

    c.tasks.filter(t => t.status === 'pending').forEach(task => this._runTask(caseId, task.id));
  }

  skipTask(caseId: string, taskId: string): void {
    this.cases.update(cs => cs.map(c =>
      c.id === caseId ? {
        ...c,
        tasks: c.tasks.map(t => t.id === taskId ? { ...t, status: 'skipped' as const, completedAt: Date.now() } : t),
        auditLog: [...c.auditLog, makeAudit('task_skipped', 'onboarding_task', taskId)],
        updatedAt: Date.now(),
      } : c
    ));
    this._checkOperative(caseId);
  }

  // ── Toasts ──

  addToast(type: Toast['type'], title: string, message?: string): void {
    const id = uid();
    this.toasts.update(ts => [...ts, { id, type, title, message }]);
    setTimeout(() => this.removeToast(id), 5000);
  }

  removeToast(id: string): void {
    this.toasts.update(ts => ts.filter(t => t.id !== id));
  }

  // ── Seed demo ──

  seedDemo(): void {
    const now = Date.now();
    const day = 24 * 3600000;
    const inDays = (days: number) => new Date(now + days * day).toISOString().split('T')[0];
    const hoursAgo = (hours: number) => now - hours * 3600000;

    const makeCandidateData = (overrides: Partial<CandidateData> = {}): CandidateData => ({
      ...createInitialCandidateData(),
      ...overrides,
    });

    const makeEmailTemplate = (status: EmailTemplate['status'], sentAt: number | null = null, scheduledFor: number | null = null): EmailTemplate => ({
      subject: '¡Bienvenida/o a Zafirus Technologies!',
      bodyHtml: DEFAULT_EMAIL_HTML,
      welcomeMeetingTime: '',
      welcomeMeetingLink: '',
      managerMeetingTime: '',
      managerMeetingLink: '',
      onboardingFolderUrl: 'https://drive.google.com/drive/folders/onboarding',
      kitRedesUrl: 'https://drive.google.com/drive/folders/kitredes',
      temporaryPassword: 'A7mK2pQ9rT4x',
      approvedAt: null,
      sentAt,
      scheduledFor,
      status,
    } as EmailTemplate);

    const makeTaskState = (type: TaskType, status: 'pending' | 'success', owner: OnboardingTask['owner'] = 'system', metadata?: Record<string, unknown>, offsetHours = 2): OnboardingTask => ({
      ...makeTask(type, owner, metadata),
      status,
      startedAt: status === 'success' ? hoursAgo(offsetHours) : null,
      completedAt: status === 'success' ? hoursAgo(offsetHours - 0.5) : null,
    });

    type SeedCaseConfig = {
      data: CreateCaseData;
      status: CaseStatus;
      updatedHoursAgo: number;
      employeeStatus?: 'active' | 'inactive';
      candidateData?: CandidateData;
      emailTemplate?: EmailTemplate;
      suggestedEmail?: string | null;
      suggestedGroups?: GroupSuggestion[];
      tasks?: OnboardingTask[];
      auditActions?: Array<{ action: string; actorType?: 'user' | 'system' | 'integration'; actorId?: string; details?: Record<string, unknown> }>;
      correctionNote?: string | null;
      blockReason?: string | null;
    };

    const makeSeedCase = (config: SeedCaseConfig): OnboardingCase => {
      const id = uid();
      const employee: Employee = {
        guid: uid(),
        name: config.data.firstName,
        lastName: config.data.lastName,
        CI: config.data.CI,
        CUIT: null,
        birthday: config.data.birthday,
        email: config.data.personalEmail,
        corporateEmail: config.employeeStatus === 'active' ? (config.suggestedEmail ?? generateCorporateEmail(config.data.firstName, config.data.lastName)) : null,
        CBU: null,
        cityId: config.data.cityId,
        provinceId: config.data.provinceId,
        countryId: config.data.countryId,
        startDate: config.data.startDate,
        status: config.employeeStatus ?? 'inactive',
        role: config.data.role,
        team: config.data.team,
        contractType: config.data.contractType,
        managerName: config.data.managerName,
      };

      const suggestedEmail = config.suggestedEmail ?? generateCorporateEmail(config.data.firstName, config.data.lastName);
      const suggestedGroups = config.suggestedGroups ?? evaluateGroups(employee);

      return {
        id,
        employee,
        status: config.status,
        candidateToken: uid(),
        candidateTokenExpiresAt: now + 7 * day,
        candidateData: config.candidateData ?? makeCandidateData(),
        emailTemplate: config.emailTemplate ?? makeEmailTemplate(
          config.status === 'active_pending_automation' || config.status === 'operative' ? 'sent' : 'draft',
          config.status === 'active_pending_automation' || config.status === 'operative' ? hoursAgo(7) : null,
        ),
        suggestedEmail,
        suggestedGroups,
        tasks: config.tasks ?? [],
        auditLog: [
          makeAudit('case_created', 'onboarding_case', id),
          ...(config.auditActions ?? []).map(action => makeAudit(action.action, 'onboarding_case', id, action.actorType ?? 'user', action.actorId ?? 'rrhh', action.details)),
        ],
        correctionNote: config.correctionNote ?? null,
        blockReason: config.blockReason ?? null,
        createdAt: hoursAgo(config.updatedHoursAgo + 24),
        updatedAt: hoursAgo(config.updatedHoursAgo),
      };
    };

    const seededCases: OnboardingCase[] = [
      makeSeedCase({
        data: {
          firstName: 'Sofía', lastName: 'López', CI: '30123456', birthday: '1992-03-15',
          personalEmail: 'sofia.lopez@gmail.com', countryId: 'AR', provinceId: 'Buenos Aires', cityId: 'CABA',
          startDate: inDays(18), role: 'Product Manager', team: 'product', contractType: 'employee', managerName: 'Carlos Ruiz',
          welcomeMeetingTime: '15/01 - 10:00 hs', welcomeMeetingLink: 'https://meet.google.com/abc-defg-hij',
          managerMeetingTime: '15/01 - 14:00 hs', managerMeetingLink: 'https://meet.google.com/xyz-uvwx-rst',
          onboardingFolderUrl: 'https://drive.google.com/drive/folders/onboarding',
          kitRedesUrl: 'https://drive.google.com/drive/folders/kitredes',
        },
        status: 'draft',
        updatedHoursAgo: 72,
      }),
      makeSeedCase({
        data: {
          firstName: 'Lucas', lastName: 'Gómez', CI: '35789012', birthday: '1995-08-22',
          personalEmail: 'lucas.gomez@hotmail.com', countryId: 'CL', provinceId: 'Metropolitana', cityId: 'Santiago',
          startDate: inDays(12), role: 'Diseño UX', team: 'design', contractType: 'contractor', managerName: 'Ana Silva',
        },
        status: 'candidate_invited',
        updatedHoursAgo: 60,
        auditActions: [{ action: 'candidate_form_sent', actorType: 'system', actorId: 'automation' }],
      }),
      makeSeedCase({
        data: {
          firstName: 'Valentina', lastName: 'Martínez', CI: '38900441', birthday: '1994-11-02',
          personalEmail: 'valentina.martinez@proton.me', countryId: 'UY', provinceId: 'Montevideo', cityId: 'Montevideo',
          startDate: inDays(8), role: 'Desarrolladora Frontend', team: 'engineering', contractType: 'employee', managerName: 'Diego Torres',
        },
        status: 'candidate_submitted',
        updatedHoursAgo: 48,
        candidateData: makeCandidateData({
          taxIdType: 'CUIL',
          taxIdValue: '20-38900441-2',
          paymentMethod: 'CBU',
          cbu: '0000003100000000000001',
          bankName: 'Banco Galicia',
          accountNumber: '000123456781',
          references: [
            { id: uid(), fullName: 'Ana Belén Ríos', relationship: 'Lead', company: 'Mapache Studio', email: 'ana.rios@mapache.dev', phone: '+54 11 5555-0303' },
            { id: uid(), fullName: 'Julián Vega', relationship: 'Colleague', company: 'Pixel Works', email: 'julian.vega@pixelworks.io', phone: '+54 11 5555-0404' },
          ],
          files: [{ id: uid(), fileType: 'w8', name: 'W-8 BEN firmado.pdf', sizeBytes: 184320 }],
          currentStep: 5,
          completedSteps: [1, 2, 3, 4, 5],
          submittedAt: hoursAgo(6),
          consolidated: false,
        }),
        auditActions: [
          { action: 'candidate_form_sent', actorType: 'system', actorId: 'automation' },
          { action: 'candidate_form_submitted', actorType: 'user', actorId: 'candidate' },
        ],
      }),
      makeSeedCase({
        data: {
          firstName: 'Diego', lastName: 'Navarro', CI: '34222001', birthday: '1990-05-19',
          personalEmail: 'diego.navarro@outlook.com', countryId: 'AR', provinceId: 'Córdoba', cityId: 'Córdoba',
          startDate: inDays(5), role: 'Analista de RRHH', team: 'rrhh', contractType: 'employee', managerName: 'Marta Molina',
        },
        status: 'hr_review',
        updatedHoursAgo: 36,
        candidateData: makeCandidateData({
          taxIdType: 'CUIL',
          taxIdValue: '20-34222001-4',
          paymentMethod: 'CBU',
          cbu: '0000003100000000000002',
          bankName: 'Banco Nación',
          accountNumber: '000123456782',
          references: [{ id: uid(), fullName: 'Marina Costa', relationship: 'Former manager', company: 'Andes Labs', email: 'marina.costa@andes.dev', phone: '+54 11 5555-0505' }],
          files: [{ id: uid(), fileType: 'w8', name: 'Formulario fiscal.pdf', sizeBytes: 213000 }],
          currentStep: 5,
          completedSteps: [1, 2, 3, 4, 5],
          submittedAt: hoursAgo(12),
          consolidated: true,
        }),
        auditActions: [
          { action: 'candidate_form_sent', actorType: 'system', actorId: 'automation' },
          { action: 'candidate_form_submitted', actorType: 'user', actorId: 'candidate' },
          { action: 'review_started', actorType: 'user', actorId: 'rrhh' },
        ],
      }),
      makeSeedCase({
        data: {
          firstName: 'Camila', lastName: 'Torres', CI: '40111223', birthday: '1993-07-08',
          personalEmail: 'camila.torres@icloud.com', countryId: 'PE', provinceId: 'Lima', cityId: 'Lima',
          startDate: inDays(3), role: 'Operations Lead', team: 'leadership', contractType: 'employee', managerName: 'Nicolás Prado',
        },
        status: 'ready_to_activate',
        updatedHoursAgo: 24,
        candidateData: makeCandidateData({
          taxIdType: 'RUC',
          taxIdValue: '20123456789',
          paymentMethod: 'WIRE',
          bankName: 'BBVA Perú',
          accountNumber: '0011223344',
          swift: 'BCPUPLPX',
          beneficiaryAddress: 'Av. Arequipa 1234, Lima',
          references: [{ id: uid(), fullName: 'Esteban Pardo', relationship: 'Peer', company: 'Nexo SA', email: 'esteban.pardo@nexo.com', phone: '+51 1 555 0606' }],
          files: [{ id: uid(), fileType: 'w8', name: 'ID y contrato.pdf', sizeBytes: 287640 }],
          currentStep: 5,
          completedSteps: [1, 2, 3, 4, 5],
          submittedAt: hoursAgo(20),
          consolidated: true,
        }),
        emailTemplate: makeEmailTemplate('draft'),
        auditActions: [
          { action: 'candidate_form_sent', actorType: 'system', actorId: 'automation' },
          { action: 'candidate_form_submitted', actorType: 'user', actorId: 'candidate' },
          { action: 'review_started', actorType: 'user', actorId: 'rrhh' },
          { action: 'case_approved', actorType: 'user', actorId: 'rrhh' },
        ],
      }),
      makeSeedCase({
        data: {
          firstName: 'Juan', lastName: 'Herrera', CI: '36333009', birthday: '1989-02-11',
          personalEmail: 'juan.herrera@gmail.com', countryId: 'MX', provinceId: 'Ciudad de México', cityId: 'CDMX',
          startDate: inDays(2), role: 'Backend Engineer', team: 'engineering', contractType: 'employee', managerName: 'Patricia Campos',
        },
        status: 'active_pending_automation',
        updatedHoursAgo: 12,
        employeeStatus: 'active',
        candidateData: makeCandidateData({
          taxIdType: 'RFC',
          taxIdValue: 'HEJ890211ABC',
          paymentMethod: 'WIRE',
          bankName: 'BBVA México',
          accountNumber: '9876543210',
          swift: 'BCMRMXMM',
          beneficiaryAddress: 'Paseo de la Reforma 100, CDMX',
          references: [{ id: uid(), fullName: 'Sara López', relationship: 'Manager', company: 'Orbit Labs', email: 'sara.lopez@orbit.io', phone: '+52 55 5555 0707' }],
          files: [{ id: uid(), fileType: 'w8', name: 'Constancia fiscal.pdf', sizeBytes: 194512 }],
          currentStep: 5,
          completedSteps: [1, 2, 3, 4, 5],
          submittedAt: hoursAgo(30),
          consolidated: true,
        }),
        emailTemplate: makeEmailTemplate('sent', hoursAgo(6)),
        suggestedGroups: evaluateGroups({
          guid: 'seed', name: 'Juan', lastName: 'Herrera', CI: '36333009', CUIT: null, birthday: '1989-02-11', email: 'juan.herrera@gmail.com', corporateEmail: 'jherrera@zafirus.tech', CBU: null,
          cityId: 'CDMX', provinceId: 'Ciudad de México', countryId: 'MX', startDate: inDays(2), status: 'active', role: 'Backend Engineer', team: 'engineering', contractType: 'employee', managerName: 'Patricia Campos',
        }).map((group, index) => ({ ...group, status: index < 2 ? 'added' as const : 'pending' as const, workspaceGroupId: index < 2 ? uid() : null })),
        tasks: [
          makeTaskState('CREATE_GOOGLE_USER', 'success', 'system', { email: 'jherrera@zafirus.tech' }, 5),
          makeTaskState('ADD_GOOGLE_GROUPS', 'success', 'system', { groups: ['all@zafirus.tech', 'engineering@zafirus.tech'] }, 4),
          makeTaskState('CONFIGURE_GMAIL_SIGNATURE', 'pending', 'system', undefined, 3),
          makeTaskState('SEND_WELCOME_EMAIL', 'pending', 'system', { to: ['jherrera@zafirus.tech', 'juan.herrera@gmail.com'] }, 3),
          makeTaskState('ANNOUNCE_IN_GROUPS', 'pending', 'system', { groupEmail: 'all@zafirus.tech', groupName: 'Todo el equipo' }, 3),
          makeTaskState('POST_INTERNAL_ANNOUNCEMENT', 'pending', 'system', undefined, 3),
          makeTaskState('REQUEST_DEVICE', 'pending', 'it', undefined, 3),
          makeTaskState('NOTIFY_ADMINISTRATION', 'pending', 'admin', undefined, 3),
        ],
        auditActions: [
          { action: 'candidate_form_sent', actorType: 'system', actorId: 'automation' },
          { action: 'candidate_form_submitted', actorType: 'user', actorId: 'candidate' },
          { action: 'review_started', actorType: 'user', actorId: 'rrhh' },
          { action: 'case_approved', actorType: 'user', actorId: 'rrhh' },
          { action: 'case_activated', actorType: 'system', actorId: 'automation' },
        ],
      }),
      makeSeedCase({
        data: {
          firstName: 'Lucía', lastName: 'Ramírez', CI: '33445566', birthday: '1991-09-27',
          personalEmail: 'lucia.ramirez@gmail.com', countryId: 'AR', provinceId: 'Mendoza', cityId: 'Mendoza',
          startDate: inDays(1), role: 'Finance Analyst', team: 'administration', contractType: 'employee', managerName: 'Gonzalo Fernández',
        },
        status: 'operative',
        updatedHoursAgo: 3,
        employeeStatus: 'active',
        candidateData: makeCandidateData({
          taxIdType: 'CUIL',
          taxIdValue: '27-33445566-8',
          paymentMethod: 'CBU',
          cbu: '0000003100000000000003',
          bankName: 'Banco Patagonia',
          accountNumber: '000123456783',
          references: [{ id: uid(), fullName: 'Marcos León', relationship: 'Manager', company: 'Southwind Co', email: 'marcos.leon@southwind.dev', phone: '+54 11 5555 0808' }],
          files: [{ id: uid(), fileType: 'w8', name: 'Documentación completa.pdf', sizeBytes: 304120 }],
          currentStep: 5,
          completedSteps: [1, 2, 3, 4, 5],
          submittedAt: hoursAgo(40),
          consolidated: true,
        }),
        emailTemplate: makeEmailTemplate('sent', hoursAgo(9)),
        suggestedGroups: evaluateGroups({
          guid: 'seed', name: 'Lucía', lastName: 'Ramírez', CI: '33445566', CUIT: null, birthday: '1991-09-27', email: 'lucia.ramirez@gmail.com', corporateEmail: 'lramirez@zafirus.tech', CBU: null,
          cityId: 'Mendoza', provinceId: 'Mendoza', countryId: 'AR', startDate: inDays(1), status: 'active', role: 'Finance Analyst', team: 'administration', contractType: 'employee', managerName: 'Gonzalo Fernández',
        }).map(group => ({ ...group, status: 'added' as const, workspaceGroupId: uid() })),
        tasks: [
          makeTaskState('CREATE_GOOGLE_USER', 'success', 'system', { email: 'lramirez@zafirus.tech' }, 8),
          makeTaskState('ADD_GOOGLE_GROUPS', 'success', 'system', { groups: ['all@zafirus.tech', 'administration@zafirus.tech', 'argentina@zafirus.tech'] }, 7),
          makeTaskState('CONFIGURE_GMAIL_SIGNATURE', 'success', 'system', undefined, 6),
          makeTaskState('SEND_WELCOME_EMAIL', 'success', 'system', { to: ['lramirez@zafirus.tech', 'lucia.ramirez@gmail.com'] }, 5),
          makeTaskState('ANNOUNCE_IN_GROUPS', 'success', 'system', { groupEmail: 'all@zafirus.tech', groupName: 'Todo el equipo' }, 4),
          makeTaskState('POST_INTERNAL_ANNOUNCEMENT', 'success', 'system', undefined, 3),
          makeTaskState('REQUEST_DEVICE', 'success', 'it', undefined, 2),
          makeTaskState('NOTIFY_ADMINISTRATION', 'success', 'admin', undefined, 1),
        ],
        auditActions: [
          { action: 'candidate_form_sent', actorType: 'system', actorId: 'automation' },
          { action: 'candidate_form_submitted', actorType: 'user', actorId: 'candidate' },
          { action: 'review_started', actorType: 'user', actorId: 'rrhh' },
          { action: 'case_approved', actorType: 'user', actorId: 'rrhh' },
          { action: 'case_activated', actorType: 'system', actorId: 'automation' },
          { action: 'case_operative', actorType: 'system', actorId: 'automation' },
        ],
      }),
    ];

    this.cases.set(seededCases);
    this.selectedCaseId.set(seededCases[0]?.id ?? null);
    this.wizardCaseIndex.set(0);
    this.candidateViewOpen.set(false);
    this.sidebarOpen.set(true);
    this._persistToStorage();
  }

  // ── Internal task engine ──

  private _delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private _getWizardCase(): OnboardingCase | null {
    return this.cases()[this.wizardCaseIndex()] ?? null;
  }

  private _advanceWizardCaseIndex(): void {
    this.wizardCaseIndex.update(index => index + 1);

    const nextCase = this.cases()[this.wizardCaseIndex()] ?? null;
    if (nextCase) {
      this.selectedCaseId.set(nextCase.id);
    } else {
      this.wizardMode.set(false);
      this._stopAutoRun();
    }

    this._persistToStorage();
  }

  private _setWizardTab(tab: string): void {
    if (!this.wizardMode()) return;
    this.wizardActiveTab.set(tab);
  }

  private _clearCandidateResponseCountdown(): void {
    if (this.candidateResponseCountdownId !== null) {
      clearInterval(this.candidateResponseCountdownId);
      this.candidateResponseCountdownId = null;
    }
    this.candidateResponseCountdown.set(null);
  }

  private _startCandidateResponseCountdown(caseId: string): void {
    if (!this.wizardMode() || this.candidateResponseCountdownId !== null) return;

    let remaining = 8;
    this.candidateResponseCountdown.set(remaining);
    this.addToast('info', 'Esperando respuesta del candidato...', 'Se enviará automáticamente en 8 segundos.');

    this.candidateResponseCountdownId = setInterval(() => {
      const c = this.cases().find(x => x.id === caseId);
      if (!c || c.status !== 'candidate_invited' || !this.wizardMode()) {
        this._clearCandidateResponseCountdown();
        return;
      }

      remaining -= 1;
      if (remaining <= 0) {
        this._clearCandidateResponseCountdown();
        this.submitCandidateForm(caseId);
        return;
      }

      this.candidateResponseCountdown.set(remaining);
    }, 1000);
  }

  private _formatShortDate(timestamp: number): string {
    return new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: '2-digit' }).format(new Date(timestamp));
  }

  private _taskProgressMessage(taskType: TaskType): string {
    switch (taskType) {
      case 'CREATE_GOOGLE_USER': return 'Creando usuario Google...';
      case 'ADD_GOOGLE_GROUPS': return 'Agregando a grupos...';
      case 'CONFIGURE_GMAIL_SIGNATURE': return 'Configurando firma de Gmail...';
      case 'SEND_WELCOME_EMAIL': return 'Enviando correo de bienvenida...';
      case 'ANNOUNCE_IN_GROUPS': return 'Anunciando en grupos...';
      case 'POST_INTERNAL_ANNOUNCEMENT': return 'Publicando anuncio interno...';
      case 'REQUEST_DEVICE': return 'Solicitando dispositivo...';
      case 'NOTIFY_ADMINISTRATION': return 'Notificando a Administración...';
      default: return 'Ejecutando tarea...';
    }
  }

  private _statusToWizardTab(status: CaseStatus): string | null {
    switch (status) {
      case 'candidate_invited': return 'data';
      case 'candidate_submitted': return 'data';
      case 'hr_review': return 'overview';
      case 'ready_to_activate': return 'overview';
      case 'active_pending_automation': return 'tasks';
      default: return null;
    }
  }

  private _transition(caseId: string, from: CaseStatus, to: CaseStatus, action: string): void {
    this.cases.update(cs => cs.map(c =>
      c.id === caseId && c.status === from ? {
        ...c, status: to,
        auditLog: [...c.auditLog, makeAudit(action, 'onboarding_case', caseId)],
        updatedAt: Date.now(),
      } : c
    ));
    const wizardTab = this._statusToWizardTab(to);
    if (wizardTab) this._setWizardTab(wizardTab);
    this._persistToStorage();
  }

  private _runNextTask(caseId: string): void {
    if (!this.autoExecuteTasks()) return;

    const c = this.cases().find(x => x.id === caseId);
    if (!c) return;

    const SEQ: TaskType[] = ['CREATE_GOOGLE_USER', 'ADD_GOOGLE_GROUPS', 'CONFIGURE_GMAIL_SIGNATURE', 'SEND_WELCOME_EMAIL'];
    const PAR: TaskType[] = ['ANNOUNCE_IN_GROUPS', 'POST_INTERNAL_ANNOUNCEMENT', 'REQUEST_DEVICE', 'NOTIFY_ADMINISTRATION'];

    const nextSeq = c.tasks.find(t => SEQ.includes(t.type) && t.status === 'pending');
    if (nextSeq) { this._runTask(caseId, nextSeq.id); return; }
    if (c.tasks.some(t => SEQ.includes(t.type) && t.status === 'running')) return;

    c.tasks.filter(t => PAR.includes(t.type) && t.status === 'pending').forEach(t => this._runTask(caseId, t.id));
  }

  private _runTask(caseId: string, taskId: string): void {
    const c = this.cases().find(x => x.id === caseId);
    if (!c) return;
    const task = c.tasks.find(t => t.id === taskId);
    if (!task || task.status === 'running' || task.status === 'success') return;

    this.cases.update(cs => cs.map(x =>
      x.id === caseId ? {
        ...x, tasks: x.tasks.map(t =>
          t.id === taskId ? { ...t, status: 'running' as const, startedAt: Date.now(), attempts: t.attempts + 1 } : t
        ), updatedAt: Date.now(),
      } : x
    ));

    this._persistToStorage();

    void this._fireWorkspaceApi(task.type, c);

    const delay = 1000 + Math.random() * 2000;
    setTimeout(() => {
      const success = Math.random() > 0.05;
      this.cases.update(cs => cs.map(x =>
        x.id === caseId ? {
          ...x,
          tasks: x.tasks.map(t =>
            t.id === taskId ? {
              ...t, status: (success ? 'success' : 'failed') as any,
              completedAt: Date.now(),
              lastError: success ? null : 'Error de conexión con el servicio externo. Reintentá manualmente.',
            } : t
          ),
          suggestedGroups: task.type === 'ADD_GOOGLE_GROUPS' && success
            ? x.suggestedGroups.map(g => ({ ...g, status: 'added' as const }))
            : x.suggestedGroups,
          auditLog: [...x.auditLog, makeAudit(success ? 'task_completed' : 'task_failed', 'onboarding_task', taskId, 'system', 'automation', { taskType: task.type })],
          updatedAt: Date.now(),
        } : x
      ));

      this._persistToStorage();
      if (success) this._checkOperative(caseId);
    }, delay);
  }

  private async _fireWorkspaceApi(taskType: TaskType, c: OnboardingCase): Promise<void> {
    try {
      const employee = c.employee;
      const corporateEmail = c.suggestedEmail ?? generateCorporateEmail(employee.name, employee.lastName);
      const password = c.emailTemplate?.temporaryPassword ?? generateTemporaryPassword();
      const groupEmail = c.suggestedGroups[0]?.email ?? 'all@zafirus.tech';
      const message = `Nuevo onboarding: ${employee.name} ${employee.lastName}`;

      let result: Record<string, unknown> | null = null;

      switch (taskType) {
        case 'CREATE_GOOGLE_USER':
          result = await this.workspaceApi.createGoogleUser(corporateEmail, password, employee.name, employee.lastName);
          break;
        case 'ADD_GOOGLE_GROUPS':
          result = await this.workspaceApi.addUserToGroups(employee.guid, c.suggestedGroups.map(group => group.email));
          break;
        case 'CONFIGURE_GMAIL_SIGNATURE':
          result = await this.workspaceApi.configureGmailSignature(
            employee.guid,
            `${employee.name} ${employee.lastName}\n${employee.role}`
          );
          break;
        case 'SEND_WELCOME_EMAIL':
          result = await this.workspaceApi.sendWelcomeEmail(
            employee.email,
            c.emailTemplate?.subject ?? 'Bienvenida/o a Zafirus Technologies',
            c.emailTemplate?.bodyHtml ?? ''
          );
          break;
        case 'ANNOUNCE_IN_GROUPS':
        case 'POST_INTERNAL_ANNOUNCEMENT':
          result = await this.workspaceApi.announceInGroup(groupEmail, message);
          break;
        case 'REQUEST_DEVICE':
          result = await this.workspaceApi.requestDevice(employee.guid, employee.contractType === 'contractor' ? 'contractor-kit' : 'laptop');
          break;
        case 'NOTIFY_ADMINISTRATION':
          result = await this.workspaceApi.provisionWorkspace(employee.guid);
          break;
        default:
          return;
      }

      console.debug('[OnboardingMockService] workspace api result', { caseId: c.id, taskType, result });
    } catch (error) {
      console.debug('[OnboardingMockService] workspace api error', { caseId: c.id, taskType, error });
    }
  }

  private _checkOperative(caseId: string): void {
    const c = this.cases().find(x => x.id === caseId);
    if (!c || c.status !== 'active_pending_automation') return;
    if (c.tasks.every(t => t.status === 'success' || t.status === 'skipped')) {
      this.cases.update(cs => cs.map(x =>
        x.id === caseId ? {
          ...x, status: 'operative' as CaseStatus,
          employee: { ...x.employee, status: 'active' as const },
          auditLog: [...x.auditLog, makeAudit('case_operative', 'onboarding_case', caseId, 'system', 'automation')],
          updatedAt: Date.now(),
        } : x
      ));
      if (this.wizardMode() && this.isDemo() && this.cases()[this.wizardCaseIndex()]?.id === caseId) {
        this._advanceWizardCaseIndex();
      }
      this.addToast('success', '¡Alta completada!', `${c.employee.name} ${c.employee.lastName} está operativo`);
      this._persistToStorage();
    } else {
      this._runNextTask(caseId);
    }
  }

  private _startAutoRun(): void {
    if (!this.isDemo()) return;
    if (this.autoRunIntervalId !== null) return;
    this.autoRunIntervalId = setInterval(() => void this._runAutoRunCycle(), 6000);
  }

  private _stopAutoRun(): void {
    if (this.autoRunIntervalId === null) return;
    clearInterval(this.autoRunIntervalId);
    this.autoRunIntervalId = null;
  }

  private async _runAutoRunCycle(): Promise<void> {
    if (!this.wizardMode() || !this.isDemo()) {
      this._stopAutoRun();
      return;
    }

    if (this.wizardCycleBusy) return;
    this.wizardCycleBusy = true;

    try {
      const c = this._getWizardCase();
      if (!c) {
        this.wizardMode.set(false);
        this._stopAutoRun();
        return;
      }

      if (c.status === 'operative') {
        this._advanceWizardCaseIndex();
        return;
      }

      if (c.status === 'cancelled' || c.status === 'blocked') return;

      if (c.status === 'draft') {
        this.addToast('info', 'Paso 1: Enviando formulario', 'Abriendo el flujo guiado.');
        await this._delay(2000);
        this.sendCandidateForm(c.id);
        return;
      }

      if (c.status === 'candidate_invited') {
        if (this.candidateResponseCountdown() !== null) return;
        this._setWizardTab('data');
        await this.simulateFormFill(this.wizardCandidateStep());
        this._startCandidateResponseCountdown(c.id);
        return;
      }

      if (c.status === 'candidate_submitted') {
        this.addToast('info', 'Paso 3: Revisando datos', 'Derivando el caso a RRHH.');
        await this._delay(2000);
        this.startReview(c.id);
        return;
      }

      if (c.status === 'hr_review') {
        this.addToast('info', 'Revisando datos del candidato...', 'Validando la información antes de aprobar.');
        await this._delay(c.candidateData?.consolidated ? 3500 : 2000);
        if (c.candidateData && !c.candidateData.consolidated) {
          this.consolidateCandidateData(c.id);
          return;
        }

        this.addToast('info', 'Paso 4: Aprobando alta', 'Liberando la activación automática.');
        await this._delay(1500);
        this.approve(c.id);
        const updated = this.cases().find(x => x.id === c.id);
        if (updated?.status === 'ready_to_activate') {
          await this._delay(1000);
          this.activate(c.id);
        }
        return;
      }

      if (c.status === 'ready_to_activate') {
        this.addToast('info', 'Paso 5: Activando alta', 'Iniciando automatización.');
        await this._delay(2000);
        this.activate(c.id);
        return;
      }

      if (c.status !== 'active_pending_automation') return;

      if (!this.autoExecuteTasks()) return;

      const failedTasks = c.tasks.filter(t => t.status === 'failed');
      if (failedTasks.length > 0) {
        failedTasks.forEach(t => this.retryTask(c.id, t.id));
        return;
      }

      const nextTask = c.tasks.find(t => t.status === 'pending');
      if (nextTask) {
        const taskIndex = c.tasks.findIndex(t => t.id === nextTask.id) + 1;
        this.addToast('info', `Tarea ${taskIndex}/${c.tasks.length}: ${this._taskProgressMessage(nextTask.type)}`);
      }

      this._runNextTask(c.id);
    } finally {
      this.wizardCycleBusy = false;
    }
  }

  private _loadStateFromStorage(storage: Storage, key: string): boolean {
    try {
      const raw = storage.getItem(key);
      this._resetState();
      if (!raw) {
        return false;
      }

      const data = JSON.parse(raw);
      if (Array.isArray(data.cases)) {
        this.cases.set(data.cases.map((item: OnboardingCase) => {
          if (!item.emailTemplate) return item;
          return {
            ...item,
            emailTemplate: {
              ...item.emailTemplate,
              status: ((item.emailTemplate as any).status === 'approved' ? 'draft' : item.emailTemplate.status) as EmailTemplate['status'],
            },
          };
        }));
      }
      if (data.selectedCaseId !== undefined) this.selectedCaseId.set(data.selectedCaseId);
      if (data.candidateViewOpen !== undefined) this.candidateViewOpen.set(data.candidateViewOpen);
      if (data.sidebarOpen !== undefined) this.sidebarOpen.set(data.sidebarOpen);
      if (data.wizardMode !== undefined) this.wizardMode.set(data.wizardMode);
      else if (data.autoRun !== undefined) this.wizardMode.set(data.autoRun);
      if (data.autoExecuteTasks !== undefined) this.autoExecuteTasks.set(data.autoExecuteTasks);
      if (data.wizardCaseIndex !== undefined) this.wizardCaseIndex.set(data.wizardCaseIndex);
      if (data.wizardActiveTab !== undefined) this.wizardActiveTab.set(data.wizardActiveTab);
      if (data._idCounter !== undefined) _idCounter = data._idCounter;

      if (this.selectedCaseId() && !this.cases().some(c => c.id === this.selectedCaseId())) {
        this.selectedCaseId.set(null);
      }

      return true;
    } catch (err: any) {
      void err;
      return false;
    }
  }

  private _persistToStorage(): void {
    try {
      const storage = this.isDemo() ? sessionStorage : localStorage;
      const key = this.isDemo() ? this.DEMO_STORAGE_KEY : this.WORKSPACE_STORAGE_KEY;
      storage.setItem(key, JSON.stringify({
        cases: this.cases(),
        selectedCaseId: this.selectedCaseId(),
        candidateViewOpen: this.candidateViewOpen(),
        sidebarOpen: this.sidebarOpen(),
        autoExecuteTasks: this.autoExecuteTasks(),
        autoRun: this.autoRun(),
        wizardMode: this.wizardMode(),
        wizardCaseIndex: this.wizardCaseIndex(),
        wizardActiveTab: this.wizardActiveTab(),
        _idCounter,
      }));
    } catch (err: any) {
      void err;
    }
  }
}
