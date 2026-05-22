> Legacy note: this file predates the Phase 7 design constitution. Current canonical design rules live in /DESIGN.md.

# PHASE2_SCOPE.md
# Fase 2 del demo — Delta sobre `zafirus-onboarding-demo-scope`

> Base aprobada: React 18 + Vite + TypeScript + Tailwind + Zustand-style store
> Esta fase modifica la base existente. NO es un rewrite — es un delta preciso.
> Stack permanece idéntico.

---

## 1. El flujo nuevo (completo)

```
RRHH crea caso
  → Llena TODOS los datos personales del empleado en modal expandido
  → Llena variables de la agenda en el modal (meeting times, links, Drive URLs)
  → El sistema genera email corporativo sugerido (jlopez@zafirus.tech)
  → El sistema pre-rellena el template de bienvenida con las variables

RRHH edita el email de bienvenida
  → Editor WYSIWYG light mode (ver EMAIL_EDITOR_SPEC.md)
  → Variables como pills — no editables individualmente
  → Texto libre editado a gusto de RRHH
  → Kit de redes incluido como sección del mismo email

RRHH aprueba → activa

SISTEMA ejecuta workers en orden estricto:
  1. CREATE_GOOGLE_USER       → crea jlopez@zafirus.tech + contraseña temporal
  2. ADD_GOOGLE_GROUPS        → agrega a grupos (placeholders, Workspace API futura)
  3. CONFIGURE_GMAIL_SIGNATURE → sube signatureHtml al Gmail creado
  4. SEND_WELCOME_EMAIL       → manda a {corporateEmail} + {personalEmail}
                                  → EL LINK DEL FORMULARIO VA DENTRO DE ESTE EMAIL

En paralelo después:
  5. REQUEST_DEVICE
  6. POST_INTERNAL_ANNOUNCEMENT
  → NOTIFY_ADMINISTRATION se dispara automáticamente cuando el candidato envía su CBU

CANDIDATO abre el link que recibió en el welcome email
  → Formulario público con token (3 pasos)
  → Paso 1: Identificación fiscal (CUIT / tipo + número)
  → Paso 2: Método de cobro (CBU / Wire / Crypto)
  → Paso 3: Referencias (mínimo 1)
  → Paso 4: Archivos condicionales (W-8 si wire extranjero, QR si crypto)

Los datos del candidato aparecen en la tab "Datos" del caso
  → Tab tiene DOS secciones:
    SECCIÓN A: Datos empleado (RRHH-filled, editables)
    SECCIÓN B: Datos candidato (candidate-filled, read-only con botón confirmar)
  → CUIT y CBU se "consolidan" al employee record al confirmar
  → Admin es notificado automáticamente al recibir CBU (NOTIFY_ADMINISTRATION)
```

---

## 2. Cambios al modelo de datos (`src/types.ts`)

### `Employee` (nuevo, reemplaza campos sueltos en OnboardingCase)

```typescript
export interface Employee {
  guid: string;
  name: string;
  lastName: string;
  CI: string;                   // DNI / documento de identidad
  CUIT: string | null;          // Llenado por candidato
  birthday: string;             // ISO date
  email: string;                // personal email
  corporateEmail: string | null; // asignado por sistema
  CBU: string | null;           // llenado por candidato
  cityId: string;
  provinceId: string;
  countryId: string;
  startDate: string;
  status: 'active' | 'inactive';
  // Campos operativos (RRHH llena al crear)
  role: string;
  team: Team;
  contractType: ContractType;
  managerName: string;
}
```

### `EmployeeFile` (nuevo)

```typescript
export interface EmployeeFile {
  guid: string;
  employeeGuid: string;         // FK
  date: number;                 // timestamp
  fileType: 'QR' | 'W8';
  name: string;
  sizeBytes: number;
  dataUrl?: string;             // base64 para demo (en prod: S3 key)
}
```

### `CandidateData` (simplificado drásticamente)

```typescript
export interface CandidateData {
  // Identificación
  taxIdType: string;
  taxIdValue: string;           // CUIT value → se consolida en employee.CUIT

  // Cobro
  paymentMethod: 'CBU' | 'WIRE' | 'CRYPTO' | '';
  cbu: string;                  // si CBU → se consolida en employee.CBU
  bankName: string;             // si WIRE
  accountNumber: string;        // si WIRE
  swift: string;                // si WIRE
  beneficiaryAddress: string;   // si WIRE
  needsW8: boolean;             // si WIRE extranjero
  walletType: string;           // si CRYPTO
  walletAddress: string;        // si CRYPTO
  hasQrBinance: boolean;        // si CRYPTO

  // Referencias
  references: Reference[];

  // Files
  files: CandidateFile[];       // fileType: 'w8' | 'qr_binance'

  // Estado del wizard
  currentStep: number;
  completedSteps: number[];
  submittedAt: number | null;
  consolidated: boolean;        // si RRHH ya confirmó los datos
}
```

### `EmailTemplate` (nuevo)

```typescript
export interface EmailTemplate {
  subject: string;
  // El body se guarda como HTML con data-variable en los pills
  bodyHtml: string;
  // Variables de agenda (editables en modal de creación)
  welcomeMeetingTime: string;
  welcomeMeetingLink: string;
  managerMeetingTime: string;
  managerMeetingLink: string;
  onboardingFolderUrl: string;
  kitRedesUrl: string;
  temporaryPassword: string;    // generado por sistema, editable por RRHH
  // Estado
  approvedAt: number | null;
  sentAt: number | null;
}
```

### `OnboardingCase` (modificado)

```typescript
export interface OnboardingCase {
  id: string;
  employee: Employee;           // reemplaza los campos sueltos firstName, lastName, etc.
  status: CaseStatus;
  candidateToken: string | null;
  candidateTokenExpiresAt: number | null;
  candidateData: CandidateData | null;
  emailTemplate: EmailTemplate | null;
  suggestedEmail: string | null;
  suggestedGroups: GroupSuggestion[];  // ver abajo
  tasks: OnboardingTask[];
  auditLog: AuditEvent[];
  correctionNote: string | null;
  blockReason: string | null;
  createdAt: number;
  updatedAt: number;
}
```

### `GroupSuggestion` (grupos como placeholders)

```typescript
export interface GroupSuggestion {
  email: string;          // engineering@zafirus.tech
  displayName: string;    // Engineering
  category: 'team' | 'country' | 'all' | 'cross';
  status: 'pending' | 'added' | 'failed';
  // Placeholder — se llenará con Workspace API en producción
  workspaceGroupId: string | null;
}

export const SEED_GROUPS: Omit<GroupSuggestion, 'status' | 'workspaceGroupId'>[] = [
  { email: 'all@zafirus.tech', displayName: 'Todo el equipo', category: 'all' },
  { email: 'engineering@zafirus.tech', displayName: 'Engineering', category: 'team' },
  { email: 'design@zafirus.tech', displayName: 'Design', category: 'team' },
  { email: 'product@zafirus.tech', displayName: 'Product', category: 'team' },
  { email: 'rrhh@zafirus.tech', displayName: 'RRHH', category: 'team' },
  { email: 'argentina@zafirus.tech', displayName: 'Argentina', category: 'country' },
  { email: 'latam@zafirus.tech', displayName: 'LATAM', category: 'country' },
  { email: 'international@zafirus.tech', displayName: 'Internacional', category: 'country' },
  { email: 'contractors@zafirus.tech', displayName: 'Contractors', category: 'cross' },
];
```

---

## 3. Cambios al wizard del candidato

**De 6 pasos → 4 pasos. Steps 1 y 2 (datos personales y ubicación) ELIMINADOS.**

### Paso 1 — Identificación fiscal (antes Step 3)
```
Select: Tipo de identificador
  CUIT · CUIL · RUC · CPF · NIT · RUT · PASSPORT · OTHER
Input: Número (con máscara según tipo seleccionado)
Helper: solo validación de formato, sin APIs externas
```

### Paso 2 — Método de cobro (antes Step 4)
```
Radio: ¿Cómo querés cobrar?
  💳 CBU (Argentina)   → Input: CBU 22 dígitos
  🌐 Wire Transfer     → bank, account, SWIFT, address
                         + checkbox "Necesito completar W-8"
  ₿ Crypto (Binance)  → wallet type, address
                         + checkbox "Subiré QR de Binance"
Helper: "Esta elección es independiente de tu país de residencia."
```

### Paso 3 — Referencias (antes Step 5)
```
M�nimo 1, máximo 3
Por referencia: fullName, relationship, company, email, phone
```

### Paso 4 — Archivos (condicional)
```
Solo aparece si: needsW8 === true OR hasQrBinance === true
Dropzone W-8: PDF (.pdf), max 5MB
Dropzone QR:  PNG/JPG, max 2MB
```

Luego: pantalla de confirmación/submit.

---

## 4. NewCaseModal expandido (RRHH)

El modal de crear caso ahora tiene DOS secciones:

### Sección A — Datos del empleado
```
firstName         Input text      "Nombre"
lastName          Input text      "Apellido"
CI                Input text      "DNI / Documento de identidad"
birthday          Input date      "Fecha de nacimiento"
personalEmail     Input email     "Email personal (recibirá el formulario aquí)"
countryId         Select          (lista ISO countries)
provinceId        Input text      "Provincia / Estado / Región"
cityId            Input text      "Ciudad"
startDate         Input date      "Fecha de ingreso"
```

### Sección B — Datos operativos
```
role              Input text      "Rol / Posición"
team              Select          (engineering / design / product / ...)
contractType      Select          (employee / contractor / intern)
managerName       Input text      "Responsable directo"
```

### Sección C — Variables de agenda (se insertan en el email template)
```
welcomeMeetingTime  Input text  "Horario del onboarding RRHH"   p.ej: "19/05 - 9:30 hs"
welcomeMeetingLink  Input url   "Link Google Meet — RRHH"
managerMeetingTime  Input text  "Horario reunión con manager"    p.ej: "19/05 - 12:00 hs"
managerMeetingLink  Input url   "Link Google Meet — Manager"
onboardingFolderUrl Input url   "Link carpeta de onboarding"
kitRedesUrl         Input url   "Link Kit de Redes"
```

Al crear el caso, estos valores se insertan automáticamente en el template del email.
RRHH puede editarlos después desde el editor.

---

## 5. Tab "Datos" (antes DataTab.tsx)

Nueva estructura de dos secciones:

```
┌─ DATOS DEL EMPLEADO ───────────────────────────────────────────┐
│  (campos editables, RRHH-filled, siempre visibles)             │
│  nombre · apellido · CI · birthday · email personal           │
│  país · provincia · ciudad · fecha inicio                      │
│  rol · equipo · contractType · manager                         │
│  [Editar]                                                      │
└────────────────────────────────────────────────────────────────┘

┌─ DATOS DEL CANDIDATO ──────────────────────────────────────────┐
│  Estado: ○ Pendiente / ● Recibido / ✓ Confirmado              │
│                                                                 │
│  Si pendiente:                                                  │
│  "Esperando que el candidato complete el formulario"           │
│  [Copiar link] [Reenviar email]                                 │
│                                                                 │
│  Si recibido (candidate.submittedAt != null):                  │
│  CUIT: 20-34567890-1                                           │
│  Método de cobro: CBU                                          │
│  CBU: 0070234565000000123456                                    │
│  Referencias: 1 referencia — [Ver]                             │
│  Archivos: ninguno                                             │
│                                                                 │
│  [✓ Confirmar y guardar en perfil del empleado]               │
│                                                                 │
│  Si consolidado:                                               │
│  CUIT → guardado en employee ✓                                 │
│  CBU → guardado en employee ✓ (admin notificado automáticamente)│
└────────────────────────────────────────────────────────────────┘
```

---

## 6. Orden de tareas automáticas (store.ts)

```typescript
// Inmediatas, secuenciales (cada una espera la anterior)
const SEQUENTIAL_TASKS: TaskType[] = [
  'CREATE_GOOGLE_USER',         // delay 2-3s
  'ADD_GOOGLE_GROUPS',          // delay 1-2s (fan-out por grupo)
  'CONFIGURE_GMAIL_SIGNATURE',  // delay 1s
  'SEND_WELCOME_EMAIL',         // delay 1s — incluye link del candidato
];

// En paralelo, después de que SEND_WELCOME_EMAIL completa
const PARALLEL_TASKS: TaskType[] = [
  'REQUEST_DEVICE',
  'POST_INTERNAL_ANNOUNCEMENT',
];

// Condicional — se dispara al consolidar datos del candidato
// (no en el activate inicial)
const ON_CANDIDATE_SUBMIT: TaskType[] = [
  'NOTIFY_ADMINISTRATION',      // solo si CBU o datos bancarios presentes
];
```

`ADD_GOOGLE_GROUPS` genera sub-tasks: una por cada grupo en `suggestedGroups`.
Al terminar, cada grupo muestra mensaje: "Agregado a engineering@zafirus.tech ✓"

---

## 7. Grupos como placeholders (futuro: Workspace API)

```typescript
// En store.ts — evaluateGroups(employee: Employee): GroupSuggestion[]
function evaluateGroups(employee: Employee): GroupSuggestion[] {
  const result: GroupSuggestion[] = [];

  // Siempre all@
  result.push({ ...SEED_GROUPS.find(g => g.email === 'all@zafirus.tech')!, status: 'pending', workspaceGroupId: null });

  // Team
  const teamGroup = SEED_GROUPS.find(g => g.email === `${employee.team}@zafirus.tech`);
  if (teamGroup) result.push({ ...teamGroup, status: 'pending', workspaceGroupId: null });

  // País / región
  const latam = ['AR','BR','CL','CO','MX','PE','UY','EC','BO','PY'];
  if (employee.countryId === 'AR') result.push({ ...SEED_GROUPS.find(g => g.email === 'argentina@zafirus.tech')!, status: 'pending', workspaceGroupId: null });
  if (latam.includes(employee.countryId)) result.push({ ...SEED_GROUPS.find(g => g.email === 'latam@zafirus.tech')!, status: 'pending', workspaceGroupId: null });
  if (!latam.includes(employee.countryId)) result.push({ ...SEED_GROUPS.find(g => g.email === 'international@zafirus.tech')!, status: 'pending', workspaceGroupId: null });

  // Contractors
  if (employee.contractType === 'contractor') result.push({ ...SEED_GROUPS.find(g => g.email === 'contractors@zafirus.tech')!, status: 'pending', workspaceGroupId: null });

  return [...new Map(result.map(g => [g.email, g])).values()];
}

// TODO: reemplazar con llamada a Google Workspace Directory API
// GET /admin/directory/v1/groups?domain=zafirus.tech
// POST /admin/directory/v1/groups/{groupKey}/members
```

---

## 8. Criterio de aceptación del demo Fase 2

```
1. RRHH abre /demo → modal "Nuevo caso" expandido
2. Completa datos personales + agenda (welcomeMeetingLink, kitRedesUrl, etc.)
3. El sistema genera jlopez@zafirus.tech automáticamente
4. RRHH abre tab "Email" → ve el editor WYSIWYG con el template pre-rellenado
5. RRHH edita el texto (Ctrl+B, @variable, etc.) sin tocar los pills
6. RRHH aprueba → activa
7. Tasks ejecutan en orden: Gmail → grupos → firma → welcome
8. Welcome email preview muestra el link del formulario embebido
9. Panel derecho (candidato) se activa con el formulario simplificado (4 pasos)
10. Candidato completa: CUIT=20-34567890-1, CBU, 1 referencia
11. Tab "Datos" muestra sección candidato con los datos recibidos
12. RRHH hace click "Confirmar" → CUIT y CBU se consolidan
13. NOTIFY_ADMINISTRATION se dispara automáticamente con el CBU
14. Audit log muestra toda la secuencia
```
