import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import {
  OnboardingCase,
  Employee,
  CandidateData,
  EmailTemplate,
  GroupSuggestion,
  OnboardingTask,
  AuditEvent,
  CaseStatus,
  TaskType,
  Team,
  ContractType,
  SEED_GROUPS,
  LATAM_COUNTRIES,
  Reference,
} from './types';

// ============================================
// HELPER FUNCTIONS
// ============================================

function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function generateCorporateEmail(firstName: string, lastName: string): string {
  const initial = removeAccents(firstName.charAt(0).toLowerCase());
  const surname = removeAccents(lastName.split(' ')[0].toLowerCase().replace(/[^a-z]/g, ''));
  return `${initial}${surname}@zafirus.tech`;
}

function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

function generateToken(): string {
  return uuidv4().replace(/-/g, '').substring(0, 32);
}

function evaluateGroups(employee: Employee): GroupSuggestion[] {
  const result: GroupSuggestion[] = [];

  const allGroup = SEED_GROUPS.find(g => g.email === 'all@zafirus.tech');
  if (allGroup) result.push({ ...allGroup, status: 'pending', workspaceGroupId: null });

  const teamGroup = SEED_GROUPS.find(g => g.email === `${employee.team}@zafirus.tech`);
  if (teamGroup) result.push({ ...teamGroup, status: 'pending', workspaceGroupId: null });

  if (employee.countryId === 'AR') {
    const argGroup = SEED_GROUPS.find(g => g.email === 'argentina@zafirus.tech');
    if (argGroup) result.push({ ...argGroup, status: 'pending', workspaceGroupId: null });
  }

  if (LATAM_COUNTRIES.includes(employee.countryId)) {
    const latamGroup = SEED_GROUPS.find(g => g.email === 'latam@zafirus.tech');
    if (latamGroup) result.push({ ...latamGroup, status: 'pending', workspaceGroupId: null });
  } else {
    const intGroup = SEED_GROUPS.find(g => g.email === 'international@zafirus.tech');
    if (intGroup) result.push({ ...intGroup, status: 'pending', workspaceGroupId: null });
  }

  if (employee.contractType === 'contractor') {
    const contGroup = SEED_GROUPS.find(g => g.email === 'contractors@zafirus.tech');
    if (contGroup) result.push({ ...contGroup, status: 'pending', workspaceGroupId: null });
  }

  return [...new Map(result.map(g => [g.email, g])).values()];
}

// ============================================
// DEFAULT EMAIL TEMPLATE
// ============================================

const DEFAULT_EMAIL_TEMPLATE = `<h1 style="font-size: 24px; font-weight: 700; margin-bottom: 24px;">¡BIENVENIDA/O A ZAFIRUS TECHNOLOGIES!</h1>

<p>¡<span class="var-pill" data-variable="firstName" contenteditable="false">{{firstName}}</span>, nos alegra mucho que te sumes al equipo!</p>

<p>Tu fecha de ingreso es el: <span class="var-pill" data-variable="startDateFormatted" contenteditable="false">{{startDateFormatted}}</span></p>

<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">

<h2 style="font-size: 18px; font-weight: 600; margin-bottom: 12px;">💻 Google Workspace</h2>

<p>Nuestra plataforma principal de trabajo es Google Workspace.</p>

<p><strong>Datos de acceso:</strong></p>
<p>📩 Usuario: <span class="var-pill" data-variable="corporateEmail" contenteditable="false">{{corporateEmail}}</span></p>
<p>🔐 Contraseña temporal: <span class="var-pill" data-variable="temporaryPassword" contenteditable="false">{{temporaryPassword}}</span></p>

<p><em>Debés cambiar la contraseña en tu primer login.</em></p>

<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">

<h2 style="font-size: 18px; font-weight: 600; margin-bottom: 12px;">📂 Carpeta de onboarding</h2>

<p>Acceso: <span class="var-pill" data-variable="onboardingFolderUrl" contenteditable="false">{{onboardingFolderUrl}}</span></p>

<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">

<h2 style="font-size: 18px; font-weight: 600; margin-bottom: 12px;">🎨 Kit de Redes</h2>

<p>Kit: <span class="var-pill" data-variable="kitRedesUrl" contenteditable="false">{{kitRedesUrl}}</span></p>

<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">

<h2 style="font-size: 18px; font-weight: 600; margin-bottom: 12px;">🗓️ Agenda</h2>

<p>• <span class="var-pill" data-variable="welcomeMeetingTime" contenteditable="false">{{welcomeMeetingTime}}</span>: Onboarding con RRHH<br>
👉 <span class="var-pill" data-variable="welcomeMeetingLink" contenteditable="false">{{welcomeMeetingLink}}</span></p>

<p>• <span class="var-pill" data-variable="managerMeetingTime" contenteditable="false">{{managerMeetingTime}}</span>: Reunión con <span class="var-pill" data-variable="managerName" contenteditable="false">{{managerName}}</span><br>
👉 <span class="var-pill" data-variable="managerMeetingLink" contenteditable="false">{{managerMeetingLink}}</span></p>

<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">

<h2 style="font-size: 18px; font-weight: 600; margin-bottom: 12px;">📋 Formulario de onboarding</h2>

<p>Completá tus datos fiscales y bancarios aquí:</p>
<p>👉 <span class="var-pill" data-variable="candidateFormUrl" contenteditable="false">{{candidateFormUrl}}</span></p>

<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">

<p>¡Te damos la bienvenida! 🙌</p>
<p>Equipo de RRHH · Zafirus Technologies</p>`;

function createDefaultEmailTemplate(): EmailTemplate {
  return {
    subject: '¡Bienvenida/o a Zafirus Technologies!',
    bodyHtml: DEFAULT_EMAIL_TEMPLATE,
    welcomeMeetingTime: '',
    welcomeMeetingLink: '',
    managerMeetingTime: '',
    managerMeetingLink: '',
    onboardingFolderUrl: '',
    kitRedesUrl: '',
    temporaryPassword: generateTemporaryPassword(),
    approvedAt: null,
    sentAt: null,
  };
}

function createInitialCandidateData(): CandidateData {
  return {
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
}

function makeAudit(action: string, entityType: string, entityId: string, actorType: 'user' | 'system' | 'integration' = 'user', actorId = 'rrhh', details?: Record<string, unknown>): AuditEvent {
  return {
    id: uuidv4(),
    timestamp: Date.now(),
    actorType,
    actorId,
    action,
    entityType,
    entityId,
    details,
  };
}

function makeTask(type: TaskType, owner: 'system' | 'rrhh' | 'candidate' | 'admin' | 'it' = 'system', meta?: Record<string, unknown>): OnboardingTask {
  return {
    id: uuidv4(),
    type,
    status: 'pending',
    owner,
    startedAt: null,
    completedAt: null,
    attempts: 0,
    lastError: null,
    metadata: meta,
  };
}

// ============================================
// STORE INTERFACE
// ============================================

interface StoreState {
  cases: OnboardingCase[];
  selectedCaseId: string | null;
  toasts: Toast[];
  isAuditDrawerOpen: boolean;
  isAutoRunning: boolean;
  autoRunTimers: ReturnType<typeof setTimeout>[];

  // Actions
  createCase: (data: CreateCaseData) => OnboardingCase;
  selectCase: (id: string | null) => void;
  updateCase: (id: string, updates: Partial<OnboardingCase>) => void;
  updateEmployee: (caseId: string, updates: Partial<Employee>) => void;

  // Status transitions
  sendCandidateForm: (caseId: string) => void;
  submitCandidateForm: (caseId: string) => void;
  startReview: (caseId: string) => void;
  requestCorrection: (caseId: string, note: string) => void;
  approve: (caseId: string) => void;
  activate: (caseId: string) => void;
  block: (caseId: string, reason: string) => void;
  unblock: (caseId: string) => void;
  cancel: (caseId: string) => void;

  // Candidate form
  updateCandidateData: (caseId: string, data: Partial<CandidateData>) => void;
  consolidateCandidateData: (caseId: string) => void;

  // Email
  updateEmailTemplate: (caseId: string, updates: Partial<EmailTemplate>) => void;
  approveEmail: (caseId: string) => void;

  // Tasks
  runTask: (caseId: string, taskId: string) => void;
  retryTask: (caseId: string, taskId: string) => void;
  skipTask: (caseId: string, taskId: string) => void;
  runNextTask: (caseId: string) => void;
  checkOperative: (caseId: string) => void;

  // Demo
  resetDemo: () => void;
  seedDemo: () => void;
  startAutoRun: () => void;
  stopAutoRun: () => void;
  hydrateCases: (cases: OnboardingCase[]) => void;

  // Audit
  toggleAuditDrawer: () => void;
  getAllAuditEvents: () => AuditEvent[];

  // Toasts
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;

  // Helpers
  getSelectedCase: () => OnboardingCase | null;
  getCaseByToken: (token: string) => OnboardingCase | null;
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}

interface CreateCaseData {
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

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const useStore = create<StoreState>((set, get) => ({
  cases: [],
  selectedCaseId: null,
  toasts: [],
  isAuditDrawerOpen: false,
  isAutoRunning: false,
  autoRunTimers: [],

  // ────────────────────────────────────────────
  // CRUD
  // ────────────────────────────────────────────

  createCase: (data) => {
    const now = Date.now();
    const employeeGuid = uuidv4();
    const caseId = uuidv4();
    const token = generateToken();

    const employee: Employee = {
      guid: employeeGuid,
      name: data.firstName,
      lastName: data.lastName,
      CI: data.CI,
      CUIT: null,
      birthday: data.birthday,
      email: data.personalEmail,
      corporateEmail: null,
      CBU: null,
      cityId: data.cityId,
      provinceId: data.provinceId,
      countryId: data.countryId,
      startDate: data.startDate,
      status: 'inactive',
      role: data.role,
      team: data.team,
      contractType: data.contractType,
      managerName: data.managerName,
    };

    const suggestedEmail = generateCorporateEmail(data.firstName, data.lastName);
    const suggestedGroups = evaluateGroups(employee);

    const emailTemplate = createDefaultEmailTemplate();
    emailTemplate.welcomeMeetingTime = data.welcomeMeetingTime || '';
    emailTemplate.welcomeMeetingLink = data.welcomeMeetingLink || '';
    emailTemplate.managerMeetingTime = data.managerMeetingTime || '';
    emailTemplate.managerMeetingLink = data.managerMeetingLink || '';
    emailTemplate.onboardingFolderUrl = data.onboardingFolderUrl || '';
    emailTemplate.kitRedesUrl = data.kitRedesUrl || '';

    const newCase: OnboardingCase = {
      id: caseId,
      employee,
      status: 'draft',
      candidateToken: token,
      candidateTokenExpiresAt: now + 7 * 24 * 60 * 60 * 1000,
      candidateData: createInitialCandidateData(),
      emailTemplate,
      suggestedEmail,
      suggestedGroups,
      tasks: [],
      auditLog: [makeAudit('case_created', 'onboarding_case', caseId, 'user', 'rrhh', { status: 'draft' })],
      correctionNote: null,
      blockReason: null,
      createdAt: now,
      updatedAt: now,
    };

    set(state => ({
      cases: [...state.cases, newCase],
      selectedCaseId: caseId,
    }));

    get().addToast({ type: 'success', title: 'Caso creado', message: `${data.firstName} ${data.lastName}` });
    return newCase;
  },

  selectCase: (id) => set({ selectedCaseId: id }),

  updateCase: (id, updates) => {
    set(state => ({
      cases: state.cases.map(c =>
        c.id === id ? { ...c, ...updates, updatedAt: Date.now() } : c
      ),
    }));
  },

  updateEmployee: (caseId, updates) => {
    set(state => ({
      cases: state.cases.map(c =>
        c.id === caseId ? { ...c, employee: { ...c.employee, ...updates }, updatedAt: Date.now() } : c
      ),
    }));
  },

  // ────────────────────────────────────────────
  // STATUS TRANSITIONS
  // ────────────────────────────────────────────

  sendCandidateForm: (caseId) => {
    const c = get().cases.find(c => c.id === caseId);
    if (!c || c.status !== 'draft') return;

    set(state => ({
      cases: state.cases.map(c =>
        c.id === caseId ? {
          ...c,
          status: 'candidate_invited' as CaseStatus,
          auditLog: [...c.auditLog, makeAudit('candidate_form_sent', 'onboarding_case', caseId)],
          updatedAt: Date.now(),
        } : c
      ),
    }));

    get().addToast({ type: 'info', title: 'Formulario enviado', message: 'El candidato puede completar sus datos' });
  },

  submitCandidateForm: (caseId) => {
    const c = get().cases.find(c => c.id === caseId);
    if (!c || c.status !== 'candidate_invited') return;

    set(state => ({
      cases: state.cases.map(c =>
        c.id === caseId ? {
          ...c,
          status: 'candidate_submitted' as CaseStatus,
          candidateData: c.candidateData ? { ...c.candidateData, submittedAt: Date.now() } : null,
          auditLog: [...c.auditLog, makeAudit('candidate_form_submitted', 'onboarding_case', caseId, 'user', 'candidate')],
          updatedAt: Date.now(),
        } : c
      ),
    }));

    get().addToast({ type: 'success', title: 'Formulario recibido', message: 'El candidato completó sus datos' });
  },

  startReview: (caseId) => {
    const c = get().cases.find(c => c.id === caseId);
    if (!c || c.status !== 'candidate_submitted') return;

    set(state => ({
      cases: state.cases.map(c =>
        c.id === caseId ? {
          ...c,
          status: 'hr_review' as CaseStatus,
          auditLog: [...c.auditLog, makeAudit('review_started', 'onboarding_case', caseId)],
          updatedAt: Date.now(),
        } : c
      ),
    }));
  },

  requestCorrection: (caseId, note) => {
    const c = get().cases.find(c => c.id === caseId);
    if (!c || c.status !== 'hr_review') return;

    const newToken = generateToken();
    set(state => ({
      cases: state.cases.map(c =>
        c.id === caseId ? {
          ...c,
          status: 'candidate_invited' as CaseStatus,
          correctionNote: note,
          candidateToken: newToken,
          candidateTokenExpiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
          candidateData: c.candidateData ? { ...c.candidateData, submittedAt: null } : null,
          auditLog: [...c.auditLog, makeAudit('correction_requested', 'onboarding_case', caseId, 'user', 'rrhh', { note })],
          updatedAt: Date.now(),
        } : c
      ),
    }));
    get().addToast({ type: 'warning', title: 'Corrección solicitada' });
  },

  approve: (caseId) => {
    const c = get().cases.find(c => c.id === caseId);
    if (!c || c.status !== 'hr_review') return;

    set(state => ({
      cases: state.cases.map(c =>
        c.id === caseId ? {
          ...c,
          status: 'ready_to_activate' as CaseStatus,
          auditLog: [...c.auditLog, makeAudit('case_approved', 'onboarding_case', caseId)],
          updatedAt: Date.now(),
        } : c
      ),
    }));
    get().addToast({ type: 'success', title: 'Caso aprobado', message: 'Listo para activar' });
  },

  // ────────────────────────────────────────────
  // ACTIVATE — creates tasks in correct order
  //
  //  Sequential (each waits for previous):
  //   1. CREATE_GOOGLE_USER
  //   2. ADD_GOOGLE_GROUPS
  //   3. CONFIGURE_GMAIL_SIGNATURE
  //   4. SEND_WELCOME_EMAIL  (includes candidate form link)
  //
  //  Parallel (after SEND_WELCOME_EMAIL):
  //   5. ANNOUNCE_IN_GROUPS  (fan-out: one task per group)
  //   6. POST_INTERNAL_ANNOUNCEMENT
  //   7. REQUEST_DEVICE
  //
  //  Conditional (on candidate data consolidation):
  //   8. NOTIFY_ADMINISTRATION  ← added later, NOT here
  // ────────────────────────────────────────────

  activate: (caseId) => {
    const c = get().cases.find(c => c.id === caseId);
    if (!c || c.status !== 'ready_to_activate') return;

    const corporateEmail = c.suggestedEmail || generateCorporateEmail(c.employee.name, c.employee.lastName);

    // Build tasks
    const tasks: OnboardingTask[] = [
      makeTask('CREATE_GOOGLE_USER', 'system', { email: corporateEmail }),
      makeTask('ADD_GOOGLE_GROUPS', 'system', { groups: c.suggestedGroups.map(g => g.email) }),
      makeTask('CONFIGURE_GMAIL_SIGNATURE', 'system'),
      makeTask('SEND_WELCOME_EMAIL', 'system', { to: [corporateEmail, c.employee.email] }),
    ];

    // ANNOUNCE_IN_GROUPS fan-out: one sub-task per group
    c.suggestedGroups.forEach(g => {
      tasks.push(makeTask('ANNOUNCE_IN_GROUPS', 'system', { groupEmail: g.email, groupName: g.displayName }));
    });

    // Parallel tasks
    tasks.push(makeTask('POST_INTERNAL_ANNOUNCEMENT', 'system'));
    tasks.push(makeTask('REQUEST_DEVICE', 'it'));

    // NOTE: NOTIFY_ADMINISTRATION is NOT created here.
    // It's created in consolidateCandidateData() when RRHH confirms the CBU.

    set(state => ({
      cases: state.cases.map(c =>
        c.id === caseId ? {
          ...c,
          status: 'active_pending_automation' as CaseStatus,
          employee: { ...c.employee, corporateEmail },
          tasks,
          auditLog: [...c.auditLog, makeAudit('case_activated', 'onboarding_case', caseId)],
          updatedAt: Date.now(),
        } : c
      ),
    }));

    get().addToast({ type: 'info', title: 'Activación iniciada', message: 'Ejecutando tareas automáticas…' });

    // Kick off the sequential chain
    get().runNextTask(caseId);
  },

  // ────────────────────────────────────────────
  // TASK EXECUTION ENGINE
  // ────────────────────────────────────────────

  runNextTask: (caseId: string) => {
    const c = get().cases.find(c => c.id === caseId);
    if (!c) return;

    // Sequential types — must run in order, each waits for previous success
    const SEQUENTIAL: TaskType[] = [
      'CREATE_GOOGLE_USER',
      'ADD_GOOGLE_GROUPS',
      'CONFIGURE_GMAIL_SIGNATURE',
      'SEND_WELCOME_EMAIL',
    ];

    // Parallel types — all start together after sequential are done
    const PARALLEL: TaskType[] = [
      'ANNOUNCE_IN_GROUPS',
      'POST_INTERNAL_ANNOUNCEMENT',
      'REQUEST_DEVICE',
      'NOTIFY_ADMINISTRATION',
    ];

    // 1. Check if there's a sequential task still pending
    const nextSeq = c.tasks.find(t => SEQUENTIAL.includes(t.type) && t.status === 'pending');
    if (nextSeq) {
      get().runTask(caseId, nextSeq.id);
      return;
    }

    // 2. Check if any sequential is still running (wait for it)
    const seqRunning = c.tasks.some(t => SEQUENTIAL.includes(t.type) && t.status === 'running');
    if (seqRunning) return;

    // 3. All sequential done — kick off all pending parallel
    const pendingParallel = c.tasks.filter(t => PARALLEL.includes(t.type) && t.status === 'pending');
    pendingParallel.forEach(t => get().runTask(caseId, t.id));
  },

  runTask: (caseId, taskId) => {
    const c = get().cases.find(c => c.id === caseId);
    if (!c) return;
    const task = c.tasks.find(t => t.id === taskId);
    if (!task || task.status === 'running' || task.status === 'success') return;

    const now = Date.now();

    // Mark as running
    set(state => ({
      cases: state.cases.map(cs =>
        cs.id === caseId ? {
          ...cs,
          tasks: cs.tasks.map(t =>
            t.id === taskId ? { ...t, status: 'running' as const, startedAt: now, attempts: t.attempts + 1 } : t
          ),
          updatedAt: now,
        } : cs
      ),
    }));

    // Simulate execution with random delay 1-3s
    const delay = 1000 + Math.random() * 2000;
    setTimeout(() => {
      const success = Math.random() > 0.05; // 95% success rate

      const completedAt = Date.now();
      const audit = makeAudit(
        success ? 'task_completed' : 'task_failed',
        'onboarding_task', taskId,
        'system', 'automation',
        { taskType: task.type, ...(task.metadata || {}) },
      );

      set(state => ({
        cases: state.cases.map(cs =>
          cs.id === caseId ? {
            ...cs,
            tasks: cs.tasks.map(t =>
              t.id === taskId ? {
                ...t,
                status: (success ? 'success' : 'failed') as OnboardingTask['status'],
                completedAt,
                lastError: success ? null : 'Error de conexión con el servicio externo. Reintentá manualmente.',
              } : t
            ),
            // Mark groups as "added" if ADD_GOOGLE_GROUPS succeeded
            suggestedGroups: task.type === 'ADD_GOOGLE_GROUPS' && success
              ? cs.suggestedGroups.map(g => ({ ...g, status: 'added' as const }))
              : cs.suggestedGroups,
            auditLog: [...cs.auditLog, audit],
            updatedAt: completedAt,
          } : cs
        ),
      }));

      if (success) {
        get().checkOperative(caseId);
      }
    }, delay);
  },

  // Check if all tasks done → move to operative
  checkOperative: (caseId: string) => {
    const c = get().cases.find(c => c.id === caseId);
    if (!c || c.status !== 'active_pending_automation') return;

    const allDone = c.tasks.every(t => t.status === 'success' || t.status === 'skipped');

    if (allDone) {
      set(state => ({
        cases: state.cases.map(cs =>
          cs.id === caseId ? {
            ...cs,
            status: 'operative' as CaseStatus,
            employee: { ...cs.employee, status: 'active' },
            auditLog: [...cs.auditLog, makeAudit('case_operative', 'onboarding_case', caseId, 'system', 'automation')],
            updatedAt: Date.now(),
          } : cs
        ),
      }));
      get().addToast({ type: 'success', title: '¡Onboarding completado!', message: `${c.employee.name} ${c.employee.lastName} está operativo` });
    } else {
      // More tasks to run
      get().runNextTask(caseId);
    }
  },

  retryTask: (caseId, taskId) => {
    set(state => ({
      cases: state.cases.map(c =>
        c.id === caseId ? {
          ...c,
          tasks: c.tasks.map(t =>
            t.id === taskId ? { ...t, status: 'pending' as const, lastError: null } : t
          ),
        } : c
      ),
    }));
    get().runTask(caseId, taskId);
  },

  skipTask: (caseId, taskId) => {
    set(state => ({
      cases: state.cases.map(c =>
        c.id === caseId ? {
          ...c,
          tasks: c.tasks.map(t =>
            t.id === taskId ? { ...t, status: 'skipped' as const, completedAt: Date.now() } : t
          ),
          auditLog: [...c.auditLog, makeAudit('task_skipped', 'onboarding_task', taskId)],
          updatedAt: Date.now(),
        } : c
      ),
    }));
    get().checkOperative(caseId);
  },

  // ────────────────────────────────────────────
  // BLOCK / UNBLOCK / CANCEL
  // ────────────────────────────────────────────

  block: (caseId, reason) => {
    set(state => ({
      cases: state.cases.map(c =>
        c.id === caseId ? {
          ...c,
          status: 'blocked' as CaseStatus,
          blockReason: reason,
          auditLog: [...c.auditLog, makeAudit('case_blocked', 'onboarding_case', caseId, 'user', 'rrhh', { reason })],
          updatedAt: Date.now(),
        } : c
      ),
    }));
    get().addToast({ type: 'warning', title: 'Caso bloqueado', message: reason });
  },

  unblock: (caseId) => {
    set(state => ({
      cases: state.cases.map(c =>
        c.id === caseId ? {
          ...c,
          status: 'hr_review' as CaseStatus,
          blockReason: null,
          auditLog: [...c.auditLog, makeAudit('case_unblocked', 'onboarding_case', caseId)],
          updatedAt: Date.now(),
        } : c
      ),
    }));
  },

  cancel: (caseId) => {
    set(state => ({
      cases: state.cases.map(c =>
        c.id === caseId ? {
          ...c,
          status: 'cancelled' as CaseStatus,
          auditLog: [...c.auditLog, makeAudit('case_cancelled', 'onboarding_case', caseId)],
          updatedAt: Date.now(),
        } : c
      ),
    }));
    get().addToast({ type: 'info', title: 'Caso cancelado' });
  },

  // ────────────────────────────────────────────
  // CANDIDATE DATA
  // ────────────────────────────────────────────

  updateCandidateData: (caseId, data) => {
    set(state => ({
      cases: state.cases.map(c =>
        c.id === caseId ? {
          ...c,
          candidateData: c.candidateData ? { ...c.candidateData, ...data } : null,
          updatedAt: Date.now(),
        } : c
      ),
    }));
  },

  consolidateCandidateData: (caseId) => {
    const c = get().cases.find(c => c.id === caseId);
    if (!c || !c.candidateData) return;

    const hasPaymentInfo = c.candidateData.cbu || c.candidateData.accountNumber || c.candidateData.walletAddress;

    // Build the updated tasks array: add NOTIFY_ADMINISTRATION if payment info and not already present
    const newTasks = [...c.tasks];
    if (hasPaymentInfo && !c.tasks.find(t => t.type === 'NOTIFY_ADMINISTRATION')) {
      newTasks.push(makeTask('NOTIFY_ADMINISTRATION', 'admin', {
        paymentMethod: c.candidateData.paymentMethod,
        cbu: c.candidateData.cbu || undefined,
      }));
    }

    set(state => ({
      cases: state.cases.map(cs =>
        cs.id === caseId ? {
          ...cs,
          employee: {
            ...cs.employee,
            CUIT: cs.candidateData?.taxIdValue || null,
            CBU: cs.candidateData?.cbu || null,
          },
          candidateData: cs.candidateData ? { ...cs.candidateData, consolidated: true } : null,
          tasks: newTasks,
          auditLog: [...cs.auditLog, makeAudit('candidate_data_consolidated', 'onboarding_case', caseId)],
          updatedAt: Date.now(),
        } : cs
      ),
    }));

    get().addToast({ type: 'success', title: 'Datos consolidados', message: 'CUIT y datos bancarios guardados en el perfil' });

    // Auto-run the NOTIFY_ADMINISTRATION task
    if (hasPaymentInfo) {
      const updatedCase = get().cases.find(c => c.id === caseId);
      const notifyTask = updatedCase?.tasks.find(t => t.type === 'NOTIFY_ADMINISTRATION' && t.status === 'pending');
      if (notifyTask) {
        get().runTask(caseId, notifyTask.id);
      }
    }
  },

  // ────────────────────────────────────────────
  // EMAIL
  // ────────────────────────────────────────────

  updateEmailTemplate: (caseId, updates) => {
    set(state => ({
      cases: state.cases.map(c =>
        c.id === caseId ? {
          ...c,
          emailTemplate: c.emailTemplate ? { ...c.emailTemplate, ...updates } : null,
          updatedAt: Date.now(),
        } : c
      ),
    }));
  },

  approveEmail: (caseId) => {
    set(state => ({
      cases: state.cases.map(c =>
        c.id === caseId ? {
          ...c,
          emailTemplate: c.emailTemplate ? { ...c.emailTemplate, approvedAt: Date.now() } : null,
          auditLog: [...c.auditLog, makeAudit('email_approved', 'email_template', caseId)],
          updatedAt: Date.now(),
        } : c
      ),
    }));
    get().addToast({ type: 'success', title: 'Email aprobado' });
  },

  // ────────────────────────────────────────────
  // DEMO MANAGEMENT
  // ────────────────────────────────────────────

  hydrateCases: (cases) => set({ cases }),

  resetDemo: () => {
    // Clear all auto-run timers
    get().autoRunTimers.forEach(t => clearTimeout(t));
    set({ cases: [], selectedCaseId: null, toasts: [], isAuditDrawerOpen: false, isAutoRunning: false, autoRunTimers: [] });
    get().addToast({ type: 'info', title: 'Demo reiniciado' });
  },

  seedDemo: () => {
    const sampleCases: CreateCaseData[] = [
      {
        firstName: 'María',
        lastName: 'Pérez',
        CI: '30123456',
        birthday: '1992-03-15',
        personalEmail: 'maria.perez@gmail.com',
        countryId: 'AR',
        provinceId: 'Buenos Aires',
        cityId: 'CABA',
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        role: 'Product Manager',
        team: 'product',
        contractType: 'employee',
        managerName: 'Carlos Ruiz',
        welcomeMeetingTime: '15/01 - 10:00 hs',
        welcomeMeetingLink: 'https://meet.google.com/abc-defg-hij',
        managerMeetingTime: '15/01 - 14:00 hs',
        managerMeetingLink: 'https://meet.google.com/xyz-uvwx-rst',
        onboardingFolderUrl: 'https://drive.google.com/drive/folders/onboarding',
        kitRedesUrl: 'https://drive.google.com/drive/folders/kitredes',
      },
      {
        firstName: 'Lucas',
        lastName: 'Gómez',
        CI: '35789012',
        birthday: '1995-08-22',
        personalEmail: 'lucas.gomez@hotmail.com',
        countryId: 'CL',
        provinceId: 'Metropolitana',
        cityId: 'Santiago',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        role: 'UX Designer',
        team: 'design',
        contractType: 'contractor',
        managerName: 'Ana Silva',
      },
    ];
    sampleCases.forEach(data => get().createCase(data));
    get().addToast({ type: 'info', title: 'Casos de ejemplo cargados' });
  },

  // ────────────────────────────────────────────
  // AUTO-RUN DEMO
  // Full automated walk-through: creates a new case, fills candidate
  // data, approves, activates, waits for tasks, consolidates.
  // Each step happens with a visible delay so the viewer can follow.
  // ────────────────────────────────────────────

  startAutoRun: () => {
    const store = get();
    if (store.isAutoRunning) return;

    // Clear existing cases for clean demo
    store.autoRunTimers.forEach(t => clearTimeout(t));
    set({ cases: [], selectedCaseId: null, isAutoRunning: true, autoRunTimers: [] });

    const timers: ReturnType<typeof setTimeout>[] = [];
    const delay = (ms: number) => new Promise<void>(resolve => {
      const t = setTimeout(resolve, ms);
      timers.push(t);
    });

    let caseId = '';

    const run = async () => {
      try {
        get().addToast({ type: 'info', title: '▶ Auto Demo iniciado', message: 'Observá el flujo completo de onboarding' });

        // ── Step 1: RRHH creates case ──
        await delay(1500);
        const newCase = get().createCase({
          firstName: 'Juan',
          lastName: 'Lopez',
          CI: '34567890',
          birthday: '1994-06-12',
          personalEmail: 'juan.lopez@gmail.com',
          countryId: 'AR',
          provinceId: 'Santa Fe',
          cityId: 'Rosario',
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          role: 'Backend Engineer',
          team: 'engineering',
          contractType: 'employee',
          managerName: 'Ágata Fidani',
          welcomeMeetingTime: '19/05 - 9:30 hs',
          welcomeMeetingLink: 'https://meet.google.com/demo-rrhh',
          managerMeetingTime: '19/05 - 12:00 hs',
          managerMeetingLink: 'https://meet.google.com/demo-manager',
          onboardingFolderUrl: 'https://drive.google.com/drive/folders/onboarding-demo',
          kitRedesUrl: 'https://drive.google.com/drive/folders/kit-redes-demo',
        });
        caseId = newCase.id;

        if (!get().isAutoRunning) return;

        // ── Step 2: RRHH approves email ──
        await delay(2500);
        if (!get().isAutoRunning) return;
        get().addToast({ type: 'info', title: '📧 RRHH aprueba email de bienvenida' });
        get().approveEmail(caseId);

        // ── Step 3: RRHH sends candidate form ──
        await delay(2500);
        if (!get().isAutoRunning) return;
        get().addToast({ type: 'info', title: '📤 RRHH envía formulario al candidato' });
        get().sendCandidateForm(caseId);

        // ── Step 4: Candidate fills step 1 — Tax ID ──
        await delay(3000);
        if (!get().isAutoRunning) return;
        get().addToast({ type: 'info', title: '✏️ Candidato completa identificación fiscal' });
        get().updateCandidateData(caseId, {
          taxIdType: 'CUIT',
          taxIdValue: '20-34567890-1',
          currentStep: 2,
          completedSteps: [1],
        });

        // ── Step 5: Candidate fills step 2 — Payment ──
        await delay(2500);
        if (!get().isAutoRunning) return;
        get().addToast({ type: 'info', title: '💳 Candidato selecciona método de cobro: CBU' });
        get().updateCandidateData(caseId, {
          paymentMethod: 'CBU',
          cbu: '0070234565000000123456',
          currentStep: 3,
          completedSteps: [1, 2],
        });

        // ── Step 6: Candidate fills step 3 — References ──
        await delay(2500);
        if (!get().isAutoRunning) return;
        get().addToast({ type: 'info', title: '📋 Candidato agrega referencia laboral' });
        const ref: Reference = {
          id: uuidv4(),
          fullName: 'Carlos Mendoza',
          relationship: 'Jefe directo',
          company: 'TechCorp SA',
          email: 'carlos.mendoza@techcorp.com',
          phone: '+54 341 555-0101',
        };
        get().updateCandidateData(caseId, {
          references: [ref],
          currentStep: 3,
          completedSteps: [1, 2, 3],
        });

        // ── Step 7: Candidate submits ──
        await delay(2500);
        if (!get().isAutoRunning) return;
        get().addToast({ type: 'info', title: '🚀 Candidato envía formulario' });
        get().submitCandidateForm(caseId);

        // ── Step 8: RRHH starts review ──
        await delay(3000);
        if (!get().isAutoRunning) return;
        get().addToast({ type: 'info', title: '🔍 RRHH inicia revisión' });
        get().startReview(caseId);

        // ── Step 9: RRHH approves ──
        await delay(2500);
        if (!get().isAutoRunning) return;
        get().addToast({ type: 'info', title: '✅ RRHH aprueba el caso' });
        get().approve(caseId);

        // ── Step 10: RRHH activates — tasks begin ──
        await delay(2500);
        if (!get().isAutoRunning) return;
        get().addToast({ type: 'info', title: '⚡ RRHH activa — tareas automáticas inician' });
        get().activate(caseId);

        // ── Wait for all tasks to finish ──
        const waitForTasks = () => new Promise<void>((resolve) => {
          const check = () => {
            const c = get().cases.find(c => c.id === caseId);
            if (!c || !get().isAutoRunning) { resolve(); return; }
            const allDone = c.tasks.every(t => t.status === 'success' || t.status === 'skipped' || t.status === 'failed');
            if (allDone) { resolve(); return; }
            const t = setTimeout(check, 500);
            timers.push(t);
          };
          check();
        });
        await waitForTasks();

        // ── Step 11: RRHH consolidates candidate data ──
        await delay(2500);
        if (!get().isAutoRunning) return;
        get().addToast({ type: 'info', title: '📦 RRHH confirma datos del candidato → NOTIFY_ADMINISTRATION se dispara' });
        get().consolidateCandidateData(caseId);

        // ── Wait for NOTIFY_ADMINISTRATION ──
        await delay(4000);

        // ── Done ──
        if (!get().isAutoRunning) return;
        get().addToast({ type: 'success', title: '🎉 Demo completado', message: 'Revisa el Audit Log para ver toda la secuencia' });
        set({ isAutoRunning: false });

      } catch {
        set({ isAutoRunning: false });
      }
    };

    set({ autoRunTimers: timers });
    run();
  },

  stopAutoRun: () => {
    get().autoRunTimers.forEach(t => clearTimeout(t));
    set({ isAutoRunning: false, autoRunTimers: [] });
    get().addToast({ type: 'info', title: 'Auto Demo detenido' });
  },

  // ────────────────────────────────────────────
  // AUDIT
  // ────────────────────────────────────────────

  toggleAuditDrawer: () => {
    set(state => ({ isAuditDrawerOpen: !state.isAuditDrawerOpen }));
  },

  getAllAuditEvents: () => {
    const events: AuditEvent[] = [];
    get().cases.forEach(c => {
      events.push(...c.auditLog);
    });
    return events.sort((a, b) => b.timestamp - a.timestamp);
  },

  // ────────────────────────────────────────────
  // TOASTS
  // ────────────────────────────────────────────

  addToast: (toast) => {
    const id = uuidv4();
    set(state => ({ toasts: [...state.toasts, { ...toast, id }] }));
    setTimeout(() => get().removeToast(id), 5000);
  },

  removeToast: (id) => {
    set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }));
  },

  // ────────────────────────────────────────────
  // HELPERS
  // ────────────────────────────────────────────

  getSelectedCase: () => {
    const { cases, selectedCaseId } = get();
    return cases.find(c => c.id === selectedCaseId) || null;
  },

  getCaseByToken: (token) => {
    return get().cases.find(c => c.candidateToken === token) || null;
  },
}));

export type { Toast, CreateCaseData };
