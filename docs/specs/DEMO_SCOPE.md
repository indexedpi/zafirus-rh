> Legacy note: this file predates the Phase 7 design constitution. Current canonical design rules live in /DESIGN.md.

# DEMO_SCOPE.md
# Scope del demo funcional — Zafirus Onboarding

> Versión: 0.2 — Split-screen / single URL
> Sin identity-resolution. Con grupos. Diseño dark unificado.
> El demo es un POC funcional con intención de ir a producción si es aprobado.

---

## Objetivo del demo

Mostrar el loop completo de onboarding end-to-end en **una sola URL** con **split-screen** que permite ver simultáneamente:
- El panel de RRHH (izquierda)
- El formulario del candidato (derecha)

Ambos lados están en vivo y se sincronizan: una acción en uno actualiza al otro.

```
RRHH crea caso (izq)
    ↓
RRHH envía formulario al candidato → form aparece en panel derecho
    ↓
Candidato declara explícitamente todos sus datos (derecha)
    ↓
Submit → panel izquierdo refresca a hr_review
    ↓
RRHH revisa, sugerencia de email + grupos visible
    ↓
RRHH aprueba y activa
    ↓
Tareas automáticas se ejecutan (simuladas) en panel izquierdo
    ↓
Estado llega a operative
    ↓
Audit log muestra toda la secuencia
```

---

## Stack del demo

```
Backend:   NestJS 10+ · TypeORM · PostgreSQL 15 (Docker local)
Frontend:  Angular 17 · Tailwind CSS 3 · Sora
Auth:      Mock single-user en demo (sin login)
Files:     Almacenamiento local (carpeta /uploads) o S3 mock
Queue:     SIN BullMQ en demo — ejecución síncrona simulada con timeouts
Google:    Mock adapter (sin API real)
```

---

## Layout del demo: split-screen sobre /demo

Ver `DESIGN_SYSTEM.md` sección 11 para especificación visual completa.

```
┌─────────────────────────────────────────────────────────────────────┐
│ TOPBAR (height: 56px, bg: var(--bg-surface))                       │
│ [Logo Zafirus] Onboarding Demo      [↻ Reset] [📋 Audit] [▶ Auto] │
├─────────────────────────────────────┬───────────────────────────────┤
│                                     │                               │
│ PANEL RRHH (50% width)              │ PANEL CANDIDATO (50% width)   │
│ bg: var(--bg-base)                  │ bg: var(--bg-subtle)          │
│ tag: [RRHH]                         │ tag: [CANDIDATO]              │
│                                     │                               │
│ ┌─ Cases sidebar (overflow-y) ───┐  │ ┌─ Wizard (centrado vert) ──┐ │
│ │ + Nuevo caso                   │  │ │                           │ │
│ │ ─ Juan Lopez · hr_review · AR  │  │ │ Paso 2 de 6               │ │
│ │ ─ María Pérez · operative · PE │  │ │ ━━━━●○○○○                  │ │
│ │ ─ Lucas Gómez · draft · CL     │  │ │                           │ │
│ └────────────────────────────────┘  │ │ [Pregunta del paso]       │ │
│                                     │ │ [Input del candidato]     │ │
│ ┌─ Case detail (active) ─────────┐  │ │                           │ │
│ │ Tabs:                          │  │ │ [Atrás] [Siguiente]       │ │
│ │ Overview · Data · Email ·      │  │ └───────────────────────────┘ │
│ │ Tasks · Files · Audit          │  │                               │
│ │                                │  │ Estado vacío si no hay token  │
│ │ Contenido de la tab activa     │  │ activo: "Esperando que RRHH   │
│ │                                │  │  envíe formulario..."         │
│ │ Acciones contextuales abajo    │  │                               │
│ └────────────────────────────────┘  │                               │
│                                     │                               │
└─────────────────────────────────────┴───────────────────────────────┘
                Toast notifications: bottom-right de la pantalla completa
```

### Botones del topbar

**↻ Reset**: borra el estado del demo (DELETE en todas las tablas excepto seed de grupos) y recarga con 3 casos demo.

**📋 Audit**: abre drawer lateral con el audit log completo (todos los eventos de la base, paginados).

**▶ Auto**: ejecuta una demostración automática paso por paso para presentar el sistema sin interacción manual (avanza cada 3 segundos con highlight visual).

### Sincronización entre paneles

| Acción en panel izquierdo | Efecto en panel derecho |
|---|---|
| RRHH selecciona caso en `candidate_invited` | Form del candidato aparece con token cargado |
| RRHH selecciona caso en otro estado | Panel derecho muestra "Sin formulario activo" |
| RRHH cambia de caso | Panel derecho cambia su contexto |

| Acción en panel derecho | Efecto en panel izquierdo |
|---|---|
| Candidato avanza un paso | Panel izquierdo muestra indicador "candidato escribiendo..." |
| Candidato hace submit | Caso refresca a `candidate_submitted`, badge cambia con animación de pulse |

Polling: el frontend hace `GET /api/onboarding-cases/:id` cada 2 segundos cuando hay caso activo, para mostrar cambios en vivo. (En producción se usaría WebSocket, pero polling es suficiente para demo.)

---

## Lo que SÍ se construye en el demo

### Backend — NestJS

**Módulo `onboarding`**
- `POST   /api/onboarding-cases` — crear caso (RRHH)
- `GET    /api/onboarding-cases` — listar casos
- `GET    /api/onboarding-cases/:id` — detalle
- `PATCH  /api/onboarding-cases/:id` — actualizar datos RRHH (rol, equipo, fecha)
- `POST   /api/onboarding-cases/:id/send-candidate-form` — genera token, marca `candidate_invited`
- `POST   /api/onboarding-cases/:id/start-review` — RRHH → `hr_review`
- `POST   /api/onboarding-cases/:id/request-correction` — RRHH pide correción → vuelve a `candidate_invited`
- `POST   /api/onboarding-cases/:id/approve` — RRHH → `ready_to_activate`
- `POST   /api/onboarding-cases/:id/activate` — RRHH → `active_pending_automation` + dispara tasks
- `POST   /api/onboarding-cases/:id/block` — bloquear con motivo
- `POST   /api/onboarding-cases/:id/unblock` — desbloquear → `hr_review`
- `POST   /api/onboarding-cases/:id/cancel` — cancelar

**Módulo `candidate-submissions`** (rutas públicas, sin auth)
- `GET   /api/candidate-submissions/:token` — obtener submission (con datos previos si existe correction)
- `PATCH /api/candidate-submissions/:token` — guardar progreso (cada paso del wizard)
- `POST  /api/candidate-submissions/:token/submit` — submit final
- `POST  /api/candidate-submissions/:token/files` — subir archivo (W-8 / QR / DNI)
- `DELETE /api/candidate-submissions/:token/files/:fileId` — borrar archivo

**Módulo `email`**
- `POST  /api/onboarding-cases/:id/email-preview/generate` — genera previews
- `GET   /api/onboarding-cases/:id/email-preview` — obtiene preview
- `PATCH /api/onboarding-cases/:id/email-preview` — RRHH edita
- `POST  /api/onboarding-cases/:id/email-preview/approve`

Genera todo lo siguiente al disparar generate:
1. `suggestedEmail` con regla `{inicial}{apellido}@zafirus.tech` + verificación de colisión contra catálogo mock
2. `suggestedGroupsJson`: lista de grupos evaluada por `GroupRulesEvaluatorService`
3. `signatureHtml`: HTML con variables reemplazadas
4. `welcomeBody`: email de bienvenida al usuario
5. `groupWelcomeMessagesJson`: mensaje personalizado para cada grupo
6. `internalAnnouncementBody`: anuncio para all@

**Módulo `groups`**
- `GET /api/groups` — catálogo de grupos
- `GET /api/groups/rules` — reglas activas
- `POST /api/groups/evaluate` — recibe `CaseContext` y devuelve grupos que aplican

Seed de grupos y reglas al iniciar la base (ver `GROUPS_SUBSYSTEM.md` sección 10).

**Módulo `automations`** (simulado en demo)
- Al activar el caso, crea `OnboardingTask` records:
  - `CREATE_GOOGLE_USER` (immediate)
  - `ADD_GOOGLE_GROUPS` (immediate, depende de la anterior)
  - `CONFIGURE_GMAIL_SIGNATURE` (immediate, depende de CREATE)
  - `SEND_WELCOME_EMAIL` (immediate)
  - `ANNOUNCE_IN_GROUPS` (immediate, fan-out: una task por grupo)
  - `POST_INTERNAL_ANNOUNCEMENT` (immediate)
  - `REQUEST_DEVICE` (immediate)
  - `NOTIFY_ADMINISTRATION` (immediate)
- Mock adapter simula éxito con timeout aleatorio entre 1-4 segundos por task
- Aleatoriamente (con feature flag `DEMO_FORCE_FAILURE`) una task puede fallar para mostrar el flujo de retry
- `GET   /api/onboarding-cases/:id/tasks` — lista de tasks del caso
- `GET   /api/onboarding-tasks/:taskId/runs` — historial de intentos
- `POST  /api/onboarding-tasks/:taskId/retry`
- `POST  /api/onboarding-tasks/:taskId/skip`
- `POST  /api/onboarding-tasks/:taskId/run-manually`

**Módulo `audit`**
- Registra automáticamente cada cambio de estado del caso y cada acción RRHH
- `GET /api/onboarding-cases/:id/audit` — historial del caso
- `GET /api/audit` — log global (para drawer del topbar)

**Módulo `demo`** (solo en modo demo)
- `POST /api/demo/reset` — limpia todo y vuelve a seed
- `POST /api/demo/seed` — carga datos de ejemplo
- `POST /api/demo/auto-run/:caseId` — ejecuta el flujo completo de un caso automáticamente con delays para mostrar la animación

---

### Frontend — Angular + Tailwind

**`/demo`** — Única ruta del demo (split-screen)

#### Panel izquierdo (RRHH)

**Sidebar de casos (sticky, scroll independiente)**
- Header: "Casos" + botón "+ Nuevo"
- Lista de cases (`GET /onboarding-cases`)
- Por cada case:
  - Avatar circular con iniciales (color por hash del nombre)
  - Nombre completo
  - Badge de estado (ver design system)
  - País residencia
- Caso activo destacado con `border-left: 3px solid var(--brand-primary)`
- Click selecciona el caso → carga en panel detail

**Botón "+ Nuevo caso" → Modal**
- Campos: firstName, lastName, personalEmail (donde se envía el form), role, team, contractType, startDate
- Submit crea caso en `draft` y lo selecciona

**Case detail (área principal del panel izquierdo)**
- Header: nombre + badge + botón menú (cancelar, etc)
- Tabs:
  - **Overview** — timeline vertical de cambios de estado + datos básicos del caso
  - **Datos del candidato** — todos los datos enviados por el candidato; si está en `candidate_invited` muestra "Esperando que el candidato complete el formulario" + botón "Copiar link"
  - **Email & Grupos** — email sugerido, grupos sugeridos (chips), preview de firma HTML, preview de welcome al usuario, preview de mensajes por grupo, preview de anuncio interno; botón aprobar
  - **Tareas** — tabla de OnboardingTasks con estado, intentos, último error en lenguaje de negocio; drawer al hacer click muestra historial de AutomationRun
  - **Archivos** — lista de EmployeeFile con preview/download
  - **Audit** — timeline de AuditEvent del caso

**Acciones contextuales (botones en sticky bottom según estado)**
- `draft`: "Enviar formulario al candidato"
- `candidate_invited`: "Copiar link del candidato" + indicador de tiempo restante
- `candidate_submitted`: "Iniciar revisión"
- `hr_review`: "Aprobar" / "Pedir corrección" / "Bloquear"
- `ready_to_activate`: "Activar"
- `active_pending_automation`: estado pasivo, espera workers
- `blocked`: "Desbloquear" / "Cancelar"
- `operative`: estado final
- `cancelled`: estado final

#### Panel derecho (Candidato)

**Estado vacío** (cuando no hay caso seleccionado o el caso no está en `candidate_invited`)
- Centrado vertical, icon grande
- Texto: "Esperando que RRHH envíe un formulario..."

**Wizard (cuando hay token activo)**
Layout centrado vertical, max-width 480px

Pasos del wizard (6 pasos):

**Paso 1 — Bienvenida e identidad básica**
- Display: "Bienvenida/o a Zafirus"
- Inputs:
  - firstName (pre-rellenado por RRHH, editable)
  - lastName (pre-rellenado, editable)
  - birthDate (date picker)
  - personalEmail (read-only, pre-rellenado)

**Paso 2 — Ubicación geográfica (declaración explícita)**
- "Necesitamos saber dos cosas distintas:"
- Select: País de nacionalidad (lista ISO)
- Select: País de residencia actual (lista ISO)
- Input: Ciudad
- Input: Provincia/Estado/Región (label dinámico según país)
- Helper text: "Estos datos no se infieren de tu identificador fiscal. Por favor, indicálos explícitamente."

**Paso 3 — Identificador fiscal**
- Select: Tipo de identificador
  - CUIT (Argentina)
  - CUIL (Argentina)
  - RUC (Perú)
  - CPF (Brasil)
  - CNPJ (Brasil)
  - RUT (Chile)
  - NIT (Colombia)
  - SSN (USA)
  - PASSPORT (Pasaporte, cualquier país)
  - OTHER (Otro)
- Input: Valor del identificador (con máscara según tipo)
- Validación: solo formato (longitud, caracteres permitidos), no validación contra APIs externas

**Paso 4 — Método de cobro**
- Radio: ¿Cómo querés cobrar?
  - CBU (Argentina, cuenta bancaria local)
  - WIRE (transferencia internacional)
  - CRYPTO (Binance / wallet crypto)
- Helper: "Esta elección es independiente de tu país de residencia."

Según selección:
- Si CBU: input CBU (22 dígitos)
- Si WIRE: bank name, account number, SWIFT, beneficiary address + checkbox "Necesito completar formulario W-8"
- Si CRYPTO: wallet type (Binance/Other), wallet address + checkbox "Voy a subir un QR de Binance"

**Paso 5 — Referencias**
- "Agregá al menos una referencia laboral"
- Por cada referencia (mínimo 1, máximo 3):
  - fullName
  - relationship
  - company
  - email
  - phone
- Botón "+ Agregar otra"

**Paso 6 — Archivos**
- "Subí los archivos que correspondan"
- Si declaró W-8 en paso 4: dropzone para W-8 (PDF)
- Si declaró QR Binance en paso 4: dropzone para QR (PNG/JPG)
- Opcional siempre: DNI o pasaporte
- Files se suben a `POST /api/candidate-submissions/:token/files`
- Muestra archivos ya subidos con opción de eliminar

**Confirmación final**
- "Revisá tus datos antes de enviar"
- Resumen de todo
- Botón "Enviar" → `POST /submit`
- Confirmación visual + estado final del wizard: "¡Listo! Ya podés cerrar esta ventana."

**Persistencia de progreso**
- Cada cambio dispara `PATCH /candidate-submissions/:token` con autosave
- Si el candidato cierra y vuelve a abrir el link, retoma desde donde dejó
- Si el link expiró: pantalla de "Link expirado, contactá a RRHH"

**Modo corrección**
- Si el caso está en `candidate_invited` por segunda vez (RRHH pidió corrección), arriba del wizard aparece banner amarillo:
  - "RRHH solicitó las siguientes correcciones: [texto]"
- Wizard navega al paso correspondiente

---

## Lo que NO se construye en el demo

| Feature | Motivo |
|---|---|
| BullMQ + Redis real | Overhead innecesario, simulamos con timeouts |
| Google Workspace API real | Necesita credenciales y dominio configurado |
| EventBridge Scheduler real | AWS infra, no agrega al loop del demo |
| Roles y permisos granulares | Mock single-user en demo |
| Multi-dominio | Hardcoded `@zafirus.tech` |
| Settings panel completo | CRUD secundario, no muestra el loop |
| Firma digital de documentos | Fuera de scope |
| Integración Pipe/Pipefy | Adapter transicional, no prioritario |
| WebSockets | Polling cada 2 segundos es suficiente |
| Identity resolution / APIs externas | Decisión explícita: el candidato declara todo |
| Validación de dígito verificador de CUIT | El sistema no asume, valida solo formato |
| Multi-idioma | Demo solo en español |

---

## Criterio de aceptación del demo

El demo está aprobado cuando se puede ejecutar este flujo sin intervención manual del desarrollador en la única URL `/demo`:

```
PANEL IZQUIERDO (RRHH):
1.  Hacer click en "+ Nuevo caso"
2.  Completar: firstName="Juan", lastName="Lopez", personalEmail="juan@gmail.com",
    role="Backend Engineer", team="engineering", contractType="employee",
    startDate=próxima semana
3.  Click "Crear" → caso en draft
4.  Click "Enviar formulario al candidato" → caso pasa a candidate_invited

PANEL DERECHO (CANDIDATO) se activa con el wizard.

5.  Candidato completa paso 1 (datos básicos editables)
6.  Candidato completa paso 2:
    - País nacionalidad: Argentina
    - País residencia: Argentina
    - Ciudad: Rosario, Provincia: Santa Fe
7.  Candidato completa paso 3:
    - Tipo: CUIT
    - Valor: 20-34567890-1
8.  Candidato completa paso 4:
    - Método: CBU
    - CBU: 0070234565000000123456
9.  Candidato completa paso 5: 1 referencia
10. Candidato completa paso 6: sin archivos (no declaró W-8 ni QR)
11. Submit → en el panel izquierdo el caso se actualiza a candidate_submitted con pulse animation

PANEL IZQUIERDO de nuevo:
12. RRHH hace click "Iniciar revisión" → hr_review
13. RRHH abre tab "Email & Grupos":
    - suggestedEmail: jlopez@zafirus.tech
    - suggestedGroups: [engineering@, argentina@, latam@, all@]
    - Preview de firma HTML visible
    - Preview de welcome al usuario
    - Preview de 4 mensajes (uno por grupo)
    - Preview de anuncio interno
14. RRHH click "Aprobar email y grupos"
15. RRHH click "Aprobar" en el caso → ready_to_activate
16. RRHH click "Activar" → active_pending_automation

Tasks aparecen en tab "Tareas" y se ejecutan con timeouts simulados:
17. CREATE_GOOGLE_USER → running (3s) → success
18. ADD_GOOGLE_GROUPS → running (2s) → success (con 4 group_memberships)
19. CONFIGURE_GMAIL_SIGNATURE → running → success
20. SEND_WELCOME_EMAIL → running → success
21. ANNOUNCE_IN_GROUPS → fan-out: 4 sub-tasks (una por grupo) → all success
22. POST_INTERNAL_ANNOUNCEMENT → success
23. REQUEST_DEVICE → success
24. NOTIFY_ADMINISTRATION → success

25. Todas las tasks success → caso pasa a operative con animación de éxito
26. Tab Audit muestra la secuencia completa de eventos con timestamps y actores
27. Topbar drawer Audit (global) también lo refleja
```

---

## Variables de entorno necesarias

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=zafirus
DB_PASSWORD=zafirus_dev
DB_NAME=zafirus_onboarding

# JWT (mock en demo)
JWT_SECRET=demo_secret_change_in_prod

# App
PORT=3000
FRONTEND_URL=http://localhost:4200
CANDIDATE_FORM_BASE_URL=http://localhost:4200/demo

# Demo flags
GOOGLE_WORKSPACE_MODE=mock           # mock | live
AUTOMATIONS_MODE=simulated           # simulated | queue
DEMO_FORCE_FAILURE=false             # si true, una task fallará random para mostrar retry
DEMO_TASK_DELAY_MIN_MS=1000
DEMO_TASK_DELAY_MAX_MS=4000
DEMO_AUTO_SEED=true                  # carga 3 casos de ejemplo al iniciar

# S3 (puede quedar vacío en demo, usa local /uploads)
S3_BUCKET=
S3_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

---

## Docker Compose

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: zafirus
      POSTGRES_PASSWORD: zafirus_dev
      POSTGRES_DB: zafirus_onboarding
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  api:
    build:
      context: ./backend
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USER: zafirus
      DB_PASSWORD: zafirus_dev
      DB_NAME: zafirus_onboarding
      JWT_SECRET: demo_secret_change_in_prod
      GOOGLE_WORKSPACE_MODE: mock
      AUTOMATIONS_MODE: simulated
      DEMO_AUTO_SEED: "true"
    ports:
      - "3000:3000"
    depends_on:
      - postgres
    volumes:
      - uploads_data:/app/uploads

  frontend:
    build:
      context: ./frontend
    environment:
      API_URL: http://localhost:3000
    ports:
      - "4200:4200"

volumes:
  postgres_data:
  uploads_data:
```
