> Legacy note: this file predates the Phase 7 design constitution. Current canonical design rules live in /DESIGN.md.

# DATA_MODEL.md
# Modelo de datos — Zafirus Onboarding

> Versión: 0.2 — Sin identity-resolution. Con grupos.
> Todas las entidades usan TypeORM con PostgreSQL.
> `synchronize: false` siempre. Migrations obligatorias.

---

## Principio clave

```
Employee     = la persona
OnboardingCase = el proceso de alta

Son entidades independientes.
Employee.status activa cuando OnboardingCase llega a 'operative'.
Un caso puede cancelarse sin borrar la persona.
```

**Nada se infiere:** todos los datos sensibles del candidato (nacionalidad, residencia, método de cobro, tipo de identificador fiscal) son declarados explícitamente por el candidato en el formulario. El sistema solo valida formato.

---

## Entidades

### `employees`

```typescript
@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ nullable: true }) firstName?: string;
  @Column({ nullable: true }) lastName?: string;
  @Column({ nullable: true }) personalEmail?: string;
  @Column({ nullable: true }) corporateEmail?: string;

  // Declaraciones explícitas del candidato
  @Column({ nullable: true }) countryOfNationality?: string;  // ISO 3166-1 alpha-2
  @Column({ nullable: true }) countryOfResidence?: string;    // ISO 3166-1 alpha-2
  @Column({ nullable: true }) city?: string;
  @Column({ nullable: true }) province?: string;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive'],
    default: 'inactive',
  })
  status: 'active' | 'inactive';

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
```

---

### `onboarding_cases`

```typescript
@Entity('onboarding_cases')
export class OnboardingCase {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => Employee, { nullable: true })
  employee?: Employee;

  @Column({
    type: 'enum',
    enum: [
      'draft',
      'candidate_invited',
      'candidate_submitted',
      'hr_review',
      'ready_to_activate',
      'active_pending_automation',
      'operative',
      'blocked',
      'cancelled',
    ],
    default: 'draft',
  })
  status: OnboardingCaseStatus;

  // Datos que carga RRHH (no el candidato)
  @Column({ nullable: true }) role?: string;
  @Column({ nullable: true }) team?: string;
  @Column({ nullable: true }) contractType?: string;     // employee | contractor
  @Column({ nullable: true, type: 'date' }) startDate?: Date;
  @Column({ nullable: true }) managerName?: string;
  @Column({ nullable: true }) managerEmail?: string;

  // Estado del proceso
  @Column({ nullable: true }) blockedReason?: string;
  @Column({ nullable: true }) createdBy?: string;
  @Column({ nullable: true }) assignedTo?: string;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
```

**Transiciones de estado:**
```
draft                     → candidate_invited        (RRHH: send-candidate-form)
candidate_invited         → candidate_submitted      (candidato: submit)
candidate_submitted       → hr_review                (RRHH: start-review)
hr_review                 → ready_to_activate        (RRHH: approve)
hr_review                 → blocked                  (RRHH: block)
hr_review                 → candidate_invited        (RRHH: request-correction → re-invita)
ready_to_activate         → active_pending_automation (RRHH: activate)
active_pending_automation → operative                (sistema: all immediate tasks success)
active_pending_automation → blocked                  (sistema: task failed + max retries)
blocked                   → hr_review                (RRHH: unblock)
cualquier estado          → cancelled                (RRHH: cancel)
```

---

### `candidate_submissions`

```typescript
@Entity('candidate_submissions')
export class CandidateSubmission {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => OnboardingCase)
  onboardingCase: OnboardingCase;

  @Column() tokenHash: string;               // hash del token, nunca el token en claro

  @Column({
    type: 'enum',
    enum: ['pending', 'submitted', 'expired', 'needs_correction', 'rejected'],
    default: 'pending',
  })
  status: CandidateSubmissionStatus;

  // === DATOS DECLARADOS POR EL CANDIDATO ===

  // Identidad
  @Column({ nullable: true }) firstName?: string;
  @Column({ nullable: true }) lastName?: string;
  @Column({ nullable: true }) personalEmail?: string;
  @Column({ nullable: true, type: 'date' }) birthDate?: Date;

  // Ubicación geográfica (declarada, no inferida)
  @Column({ nullable: true }) countryOfNationality?: string;   // ISO alpha-2
  @Column({ nullable: true }) countryOfResidence?: string;     // ISO alpha-2
  @Column({ nullable: true }) city?: string;
  @Column({ nullable: true }) province?: string;

  // Identificador fiscal (el candidato elige tipo y valor)
  @Column({ nullable: true }) taxIdType?: string;              // CUIT | CUIL | RUC | CPF | SSN | PASSPORT | OTHER
  @Column({ nullable: true }) taxIdValue?: string;

  // Método de cobro (el candidato elige cómo cobra, independiente de dónde vive)
  @Column({
    type: 'enum',
    enum: ['CBU', 'WIRE', 'CRYPTO'],
    nullable: true,
  })
  paymentMethod?: 'CBU' | 'WIRE' | 'CRYPTO';

  // Datos según método
  @Column({ nullable: true }) cbu?: string;                    // si paymentMethod=CBU
  @Column({ nullable: true }) wireBankName?: string;           // si paymentMethod=WIRE
  @Column({ nullable: true }) wireAccountNumber?: string;
  @Column({ nullable: true }) wireSwiftCode?: string;
  @Column({ nullable: true }) wireBeneficiaryAddress?: string;
  @Column({ nullable: true }) cryptoWalletType?: string;       // BINANCE | OTHER
  @Column({ nullable: true }) cryptoWalletAddress?: string;

  // Indicadores que dispara declaraciones del candidato (no se asumen)
  @Column({ default: false }) declaresNeedsW8: boolean;        // candidato indica si debe completar W-8
  @Column({ default: false }) declaresNeedsBinanceQR: boolean; // candidato indica si subirá QR

  // Corrección requerida
  @Column({ nullable: true }) correctionRequested?: string;    // texto libre de RRHH

  @Column({ nullable: true, type: 'timestamp' }) submittedAt?: Date;
  @Column({ nullable: true, type: 'timestamp' }) expiresAt?: Date;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
```

---

### `employee_files`

```typescript
@Entity('employee_files')
export class EmployeeFile {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => Employee, { nullable: true })
  employee?: Employee;

  @ManyToOne(() => OnboardingCase, { nullable: true })
  onboardingCase?: OnboardingCase;

  @Column({
    type: 'enum',
    enum: ['candidate', 'rrhh', 'system'],
  })
  uploadedBy: string;

  @Column({
    type: 'enum',
    enum: ['W8', 'QR_BINANCE', 'DNI', 'PASSPORT', 'CONTRACT', 'OTHER'],
  })
  fileType: string;

  @Column() storageKey: string;
  @Column({ nullable: true }) originalFilename?: string;
  @Column({ nullable: true }) mimeType?: string;
  @Column({ nullable: true }) sizeBytes?: number;

  @Column({
    type: 'enum',
    enum: ['pending_review', 'approved', 'rejected'],
    default: 'pending_review',
  })
  status: string;

  @CreateDateColumn() createdAt: Date;
  @Column({ nullable: true, type: 'timestamp' }) reviewedAt?: Date;
  @Column({ nullable: true }) reviewedBy?: string;
}
```

---

### `employee_references`

```typescript
@Entity('employee_references')
export class EmployeeReference {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => Employee, { nullable: true })
  employee?: Employee;

  @ManyToOne(() => OnboardingCase)
  onboardingCase: OnboardingCase;

  @Column() fullName: string;
  @Column({ nullable: true }) relationship?: string;
  @Column({ nullable: true }) company?: string;
  @Column({ nullable: true }) email?: string;
  @Column({ nullable: true }) phone?: string;
  @Column({ nullable: true, type: 'text' }) notes?: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'contacted', 'verified', 'rejected'],
    default: 'pending',
  })
  status: string;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
```

---

### `email_groups`

```typescript
@Entity('email_groups')
export class EmailGroup {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ unique: true }) email: string;
  @Column() displayName: string;
  @Column({ nullable: true }) description?: string;

  @Column({
    type: 'enum',
    enum: ['team', 'country', 'role', 'cross', 'all'],
  })
  category: string;

  @Column({ default: true }) active: boolean;

  @Column({ nullable: true }) welcomeSubjectTemplate?: string;
  @Column({ nullable: true, type: 'text' }) welcomeBodyTemplate?: string;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
```

---

### `email_group_rules`

```typescript
@Entity('email_group_rules')
export class EmailGroupRule {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => EmailGroup) group: EmailGroup;

  @Column() name: string;

  @Column({ type: 'jsonb' })
  conditionJson: Record<string, unknown>;

  @Column({ default: 100 }) priority: number;
  @Column({ default: true }) active: boolean;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
```

Ver `GROUPS_SUBSYSTEM.md` para la estructura de `conditionJson`.

---

### `group_memberships`

```typescript
@Entity('group_memberships')
export class GroupMembership {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => Employee) employee: Employee;
  @ManyToOne(() => EmailGroup) group: EmailGroup;

  @Column({
    type: 'enum',
    enum: ['pending', 'active', 'failed', 'removed'],
    default: 'pending',
  })
  status: string;

  @Column({ nullable: true }) externalMemberId?: string;
  @Column({ nullable: true, type: 'timestamp' }) addedAt?: Date;
  @Column({ nullable: true, type: 'timestamp' }) removedAt?: Date;
  @Column({ nullable: true }) addedBy?: string;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
```

---

### `email_previews`

```typescript
@Entity('email_previews')
export class EmailPreview {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => OnboardingCase)
  onboardingCase: OnboardingCase;

  // Email corporativo sugerido por la regla rígida
  @Column({ nullable: true }) suggestedEmail?: string;        // jlopez@zafirus.tech
  @Column({ nullable: true }) selectedEmail?: string;         // confirmado por RRHH
  @Column({ default: false }) emailCollisionDetected: boolean;

  // Grupos sugeridos por el evaluator
  @Column({ type: 'jsonb', nullable: true }) suggestedGroupsJson?: string[];     // [emails]
  @Column({ type: 'jsonb', nullable: true }) selectedGroupsJson?: string[];      // confirmado RRHH

  // Contenidos generados
  @Column({ nullable: true, type: 'text' }) signatureHtml?: string;
  @Column({ nullable: true }) welcomeSubject?: string;
  @Column({ nullable: true, type: 'text' }) welcomeBody?: string;

  // Mensajes a cada grupo (jsonb con array de { groupEmail, subject, body })
  @Column({ type: 'jsonb', nullable: true }) groupWelcomeMessagesJson?: Array<{
    groupEmail: string;
    subject: string;
    body: string;
  }>;

  // Anuncio interno general (a all@)
  @Column({ nullable: true }) internalAnnouncementSubject?: string;
  @Column({ nullable: true, type: 'text' }) internalAnnouncementBody?: string;

  // Scheduling
  @Column({ nullable: true, type: 'timestamp' }) scheduledSendAt?: Date;

  @Column({
    type: 'enum',
    enum: ['draft', 'approved', 'sent', 'blocked'],
    default: 'draft',
  })
  status: string;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
```

---

### `onboarding_tasks`

```typescript
@Entity('onboarding_tasks')
export class OnboardingTask {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => OnboardingCase)
  onboardingCase: OnboardingCase;

  @Column() type: string;
  // Tipos:
  //   CREATE_GOOGLE_USER
  //   ADD_GOOGLE_GROUPS
  //   CONFIGURE_GMAIL_SIGNATURE
  //   SEND_WELCOME_EMAIL
  //   ANNOUNCE_IN_GROUPS               (uno por grupo, fan-out)
  //   POST_INTERNAL_ANNOUNCEMENT       (a all@)
  //   REQUEST_DEVICE
  //   NOTIFY_ADMINISTRATION

  @Column({
    type: 'enum',
    enum: ['system', 'rrhh', 'candidate', 'admin', 'it'],
  })
  owner: string;

  @Column({
    type: 'enum',
    enum: ['manual', 'automatic', 'scheduled'],
  })
  mode: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'running', 'success', 'failed', 'skipped', 'manual_required'],
    default: 'pending',
  })
  status: string;

  @Column({ nullable: true, type: 'timestamp' }) scheduledAt?: Date;
  @Column({ nullable: true, type: 'timestamp' }) completedAt?: Date;
  @Column({ nullable: true }) idempotencyKey?: string;
  @Column({ default: 0 }) attempts: number;
  @Column({ type: 'jsonb', nullable: true }) metadataJson?: Record<string, unknown>;
  @Column({ nullable: true }) lastError?: string;
  @Column({ nullable: true }) lastErrorCode?: string;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
```

---

### `automation_runs`

```typescript
@Entity('automation_runs')
export class AutomationRun {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => OnboardingTask)
  task: OnboardingTask;

  @Column() provider: string;     // 'google-workspace' | 'groups' | 'device-request' | 'administration'
  @Column() action: string;       // 'createUser' | 'addMember' | 'announceJoin' | 'notifyBankAccount'

  @Column({
    type: 'enum',
    enum: ['queued', 'running', 'success', 'failed', 'retrying'],
    default: 'queued',
  })
  status: string;

  @Column({ default: 1 }) attempt: number;
  @Column({ nullable: true }) idempotencyKey?: string;
  @Column({ nullable: true }) externalResourceId?: string;

  @Column({ type: 'jsonb', nullable: true }) requestPayload?: Record<string, unknown>;
  @Column({ type: 'jsonb', nullable: true }) responsePayload?: Record<string, unknown>;

  @Column({ nullable: true }) errorCode?: string;
  @Column({ nullable: true }) errorMessage?: string;
  @Column({ nullable: true, type: 'text' }) errorDetail?: string;

  @Column({ nullable: true, type: 'timestamp' }) startedAt?: Date;
  @Column({ nullable: true, type: 'timestamp' }) finishedAt?: Date;

  @CreateDateColumn() createdAt: Date;
}
```

**Códigos de error para UI (`errorCode`):**
```
EMAIL_ALREADY_EXISTS        → "El email jlopez@zafirus.tech ya existe en Workspace. Elegir otro nombre."
GOOGLE_RATE_LIMIT           → "Google procesará el intento en breve. Reintentando automáticamente."
GROUP_NOT_FOUND             → "El grupo X no existe en Workspace. Verificar catálogo."
GROUP_MEMBER_ALREADY_EXISTS → "El usuario ya es miembro de este grupo. Marcando como exitoso."
INVALID_DOMAIN              → "El dominio configurado no coincide con Google Workspace."
DEVICE_REQUEST_DUPLICATE    → "Ya existe una solicitud de dispositivo para este caso."
ADMINISTRATION_UNREACHABLE  → "No se pudo notificar a Administración. Reintento programado."
UNKNOWN_ERROR               → "Error inesperado. Contactar soporte técnico."
```

---

### `audit_events`

```typescript
@Entity('audit_events')
export class AuditEvent {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ nullable: true }) onboardingCaseId?: string;
  @Column({ nullable: true }) employeeId?: string;

  @Column({
    type: 'enum',
    enum: ['user', 'system', 'integration'],
  })
  actorType: string;

  @Column({ nullable: true }) actorId?: string;
  @Column() action: string;
  @Column({ nullable: true }) entityType?: string;
  @Column({ nullable: true }) entityId?: string;

  @Column({ type: 'jsonb', nullable: true }) beforeJson?: Record<string, unknown>;
  @Column({ type: 'jsonb', nullable: true }) afterJson?: Record<string, unknown>;
  @Column({ type: 'jsonb', nullable: true }) metadataJson?: Record<string, unknown>;

  @CreateDateColumn() createdAt: Date;
}
```

---

## Índices mínimos (primera migración)

```sql
CREATE INDEX idx_onboarding_cases_status              ON onboarding_cases(status);
CREATE INDEX idx_onboarding_cases_start_date          ON onboarding_cases(start_date);
CREATE INDEX idx_onboarding_cases_team                ON onboarding_cases(team);

CREATE INDEX idx_onboarding_tasks_status              ON onboarding_tasks(status);
CREATE INDEX idx_onboarding_tasks_type                ON onboarding_tasks(type);
CREATE INDEX idx_onboarding_tasks_case_id             ON onboarding_tasks(onboarding_case_id);

CREATE INDEX idx_automation_runs_status               ON automation_runs(status);
CREATE INDEX idx_automation_runs_task_id              ON automation_runs(task_id);

CREATE INDEX idx_audit_events_case_id                 ON audit_events(onboarding_case_id);
CREATE INDEX idx_audit_events_created_at              ON audit_events(created_at);

CREATE INDEX idx_candidate_submissions_token_hash     ON candidate_submissions(token_hash);
CREATE INDEX idx_candidate_submissions_status         ON candidate_submissions(status);

CREATE INDEX idx_email_group_rules_group_id           ON email_group_rules(group_id);
CREATE INDEX idx_email_group_rules_active             ON email_group_rules(active);

CREATE INDEX idx_group_memberships_employee_id        ON group_memberships(employee_id);
CREATE INDEX idx_group_memberships_status             ON group_memberships(status);
```
