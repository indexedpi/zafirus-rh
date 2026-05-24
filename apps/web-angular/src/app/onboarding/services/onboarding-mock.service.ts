import { Injectable, signal, computed } from '@angular/core';
import {
  OnboardingCase, Employee, CandidateData, EmailTemplate,
  GroupSuggestion, OnboardingTask, AuditEvent, CaseStatus,
  TaskType, Team, ContractType, CreateCaseData, Toast,
  SEED_GROUPS, LATAM_COUNTRIES,
} from '../models/onboarding-case.model';

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

const DEFAULT_EMAIL_HTML = `<h1 style="font-size: 24px; font-weight: 700; margin-bottom: 24px;">¡BIENVENIDA/O A ZAFIRUS TECHNOLOGIES!</h1>

<p>¡<span class="var-pill" data-variable="firstName" contenteditable="false">Lucas</span>, nos alegra mucho que te sumes al equipo!</p>

<p>Tu fecha de ingreso es el: <span class="var-pill" data-variable="startDateFormatted" contenteditable="false">28/5/2026</span></p>

<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">

<h2 style="font-size: 18px; font-weight: 600; margin-bottom: 12px;">💻 Google Workspace</h2>

<p>Nuestra plataforma principal de trabajo es Google Workspace.</p>

<p><strong>Datos de acceso:</strong></p>
<p>📩 Usuario: <span class="var-pill" data-variable="corporateEmail" contenteditable="false">lgomez@zafirus.tech</span></p>
<p>🔐 Contraseña temporal: <span class="var-pill" data-variable="temporaryPassword" contenteditable="false">JT54MJaxzkzR</span></p>

<p><em>Debés cambiar la contraseña en tu primer login.</em></p>

<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">

<h2 style="font-size: 18px; font-weight: 600; margin-bottom: 12px;">📂 Carpeta de onboarding</h2>

<p>Acceso: <span class="var-pill" data-variable="onboardingFolderUrl" contenteditable="false">https://drive.google.com/drive/folders/demo</span></p>

<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">

<h2 style="font-size: 18px; font-weight: 600; margin-bottom: 12px;">🎨 Kit de Redes</h2>

<p>Kit: <span class="var-pill" data-variable="kitRedesUrl" contenteditable="false">https://drive.google.com/kit-redes-demo</span></p>

<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">

<h2 style="font-size: 18px; font-weight: 600; margin-bottom: 12px;">🗓️ Agenda</h2>

<p>• <span class="var-pill" data-variable="welcomeMeetingTime" contenteditable="false">19/05 - 9:30 hs</span>: Onboarding con RRHH<br>
👉 <span class="var-pill" data-variable="welcomeMeetingLink" contenteditable="false">meet.google.com/rh</span></p>

<p>• <span class="var-pill" data-variable="managerMeetingTime" contenteditable="false">19/05 - 12:00 hs</span>: Reunión con <span class="var-pill" data-variable="managerName" contenteditable="false">Ana Silva</span><br>
👉 <span class="var-pill" data-variable="managerMeetingLink" contenteditable="false">meet.google.com/ana</span></p>

<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">

<h2 style="font-size: 18px; font-weight: 600; margin-bottom: 12px;">📋 Formulario de onboarding</h2>

<p>Completá tus datos fiscales y bancarios aquí:</p>
<p>👉 <span class="var-pill" data-variable="candidateFormUrl" contenteditable="false">https://zafirustech.com/onboarding/form/123</span></p>

<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">

<p>¡Te damos la bienvenida! 🙌</p>
<p>Equipo de RRHH · Zafirus Technologies</p>`;

@Injectable({ providedIn: 'root' })
export class OnboardingMockService {
  // ── Signals ──
  readonly cases = signal<OnboardingCase[]>([]);
  readonly selectedCaseId = signal<string | null>(null);
  readonly toasts = signal<Toast[]>([]);
  readonly candidateViewOpen = signal(false);

  readonly selectedCase = computed(() => {
    const id = this.selectedCaseId();
    return this.cases().find(c => c.id === id) ?? null;
  });

  // ── CRUD ──

  selectCase(id: string | null): void {
    this.selectedCaseId.set(id);
  }

  createCase(data: CreateCaseData): OnboardingCase {
    const now = Date.now();
    const employee: Employee = {
      guid: uid(), name: data.firstName, lastName: data.lastName,
      CI: data.CI, CUIT: null, birthday: data.birthday,
      email: data.personalEmail, corporateEmail: null, CBU: null,
      cityId: data.cityId, provinceId: data.provinceId, countryId: data.countryId,
      startDate: data.startDate, status: 'inactive', role: data.role,
      team: data.team, contractType: data.contractType, managerName: data.managerName,
    };

    const suggestedEmail = generateCorporateEmail(data.firstName, data.lastName);
    const suggestedGroups = evaluateGroups(employee);

    const emailTemplate: EmailTemplate = {
      subject: '¡Bienvenida/o a Zafirus Technologies!',
      bodyHtml: DEFAULT_EMAIL_HTML,
      welcomeMeetingTime: data.welcomeMeetingTime || '',
      welcomeMeetingLink: data.welcomeMeetingLink || '',
      managerMeetingTime: data.managerMeetingTime || '',
      managerMeetingLink: data.managerMeetingLink || '',
      onboardingFolderUrl: data.onboardingFolderUrl || '',
      kitRedesUrl: data.kitRedesUrl || '',
      temporaryPassword: generateTemporaryPassword(),
      approvedAt: null, sentAt: null,
    };

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
    return newCase;
  }

  updateEmployee(caseId: string, updates: Partial<Employee>): void {
    this.cases.update(cs => cs.map(c =>
      c.id === caseId ? { ...c, employee: { ...c.employee, ...updates }, updatedAt: Date.now() } : c
    ));
  }

  // ── Status transitions ──

  sendCandidateForm(caseId: string): void {
    this._transition(caseId, 'draft', 'candidate_invited', 'candidate_form_sent');
    this.addToast('info', 'Formulario enviado', 'El candidato puede completar sus datos');
  }

  submitCandidateForm(caseId: string): void {
    this.cases.update(cs => cs.map(c =>
      c.id === caseId && c.status === 'candidate_invited' ? {
        ...c, status: 'candidate_submitted' as CaseStatus,
        candidateData: c.candidateData ? { ...c.candidateData, submittedAt: Date.now() } : null,
        auditLog: [...c.auditLog, makeAudit('candidate_form_submitted', 'onboarding_case', caseId, 'user', 'candidate')],
        updatedAt: Date.now(),
      } : c
    ));
    this.addToast('success', 'Formulario recibido');
  }

  startReview(caseId: string): void {
    this._transition(caseId, 'candidate_submitted', 'hr_review', 'review_started');
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
    this.addToast('info', 'Activación iniciada', 'Ejecutando tareas automáticas…');
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
  }

  // ── Candidate ──

  updateCandidateData(caseId: string, data: Partial<CandidateData>): void {
    this.cases.update(cs => cs.map(c =>
      c.id === caseId ? {
        ...c, candidateData: c.candidateData ? { ...c.candidateData, ...data } : null,
        updatedAt: Date.now(),
      } : c
    ));
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
    // Run if in automation phase
    const c = this.cases().find(x => x.id === caseId);
    if (c?.status === 'active_pending_automation') this._runNextTask(caseId);
  }

  // ── Email ──

  updateEmailTemplate(caseId: string, updates: Partial<EmailTemplate>): void {
    this.cases.update(cs => cs.map(c =>
      c.id === caseId && c.emailTemplate ? {
        ...c, emailTemplate: { ...c.emailTemplate, ...updates }, updatedAt: Date.now(),
      } : c
    ));
  }

  approveEmail(caseId: string): void {
    this.cases.update(cs => cs.map(c =>
      c.id === caseId && c.emailTemplate ? {
        ...c,
        emailTemplate: { ...c.emailTemplate, approvedAt: Date.now() },
        auditLog: [...c.auditLog, makeAudit('email_approved', 'email_template', caseId)],
        updatedAt: Date.now(),
      } : c
    ));
    this.addToast('success', 'Email aprobado');
  }

  // ── Tasks ──

  retryTask(caseId: string, taskId: string): void {
    this.cases.update(cs => cs.map(c =>
      c.id === caseId ? {
        ...c, tasks: c.tasks.map(t => t.id === taskId ? { ...t, status: 'pending' as const, lastError: null } : t),
      } : c
    ));
    this._runTask(caseId, taskId);
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
    const cases: CreateCaseData[] = [
      {
        firstName: 'María', lastName: 'Pérez', CI: '30123456', birthday: '1992-03-15',
        personalEmail: 'maria.perez@gmail.com', countryId: 'AR', provinceId: 'Buenos Aires', cityId: 'CABA',
        startDate: new Date(Date.now() + 14 * 24 * 3600000).toISOString().split('T')[0],
        role: 'Product Manager', team: 'product', contractType: 'employee', managerName: 'Carlos Ruiz',
        welcomeMeetingTime: '15/01 - 10:00 hs', welcomeMeetingLink: 'https://meet.google.com/abc-defg-hij',
        managerMeetingTime: '15/01 - 14:00 hs', managerMeetingLink: 'https://meet.google.com/xyz-uvwx-rst',
        onboardingFolderUrl: 'https://drive.google.com/drive/folders/onboarding',
        kitRedesUrl: 'https://drive.google.com/drive/folders/kitredes',
      },
      {
        firstName: 'Lucas', lastName: 'Gómez', CI: '35789012', birthday: '1995-08-22',
        personalEmail: 'lucas.gomez@hotmail.com', countryId: 'CL', provinceId: 'Metropolitana', cityId: 'Santiago',
        startDate: new Date(Date.now() + 7 * 24 * 3600000).toISOString().split('T')[0],
        role: 'UX Designer', team: 'design', contractType: 'contractor', managerName: 'Ana Silva',
      },
    ];
    cases.forEach(d => this.createCase(d));
  }

  // ── Internal task engine ──

  private _transition(caseId: string, from: CaseStatus, to: CaseStatus, action: string): void {
    this.cases.update(cs => cs.map(c =>
      c.id === caseId && c.status === from ? {
        ...c, status: to,
        auditLog: [...c.auditLog, makeAudit(action, 'onboarding_case', caseId)],
        updatedAt: Date.now(),
      } : c
    ));
  }

  private _runNextTask(caseId: string): void {
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

      if (success) this._checkOperative(caseId);
    }, delay);
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
      this.addToast('success', '¡Onboarding completado!', `${c.employee.name} ${c.employee.lastName} está operativo`);
    } else {
      this._runNextTask(caseId);
    }
  }
}
