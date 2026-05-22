> Legacy note: this file predates the Phase 7 design constitution. Current canonical design rules live in /DESIGN.md.

# ARCHITECTURE.md
# Sistema de Alta Operativa Global — Zafirus

> Versión: 0.2 — Demo scope con split-screen
> Stack: Angular + Tailwind · NestJS · TypeORM · PostgreSQL · AWS

---

## 1. Objetivo

Reemplazar el trabajo manual de 4 personas en el proceso de pre-onboarding y alta de colaboradores.
El sistema centraliza datos, automatiza integraciones y deja a RRHH solo las decisiones que requieren criterio humano.

**Regla madre:** RRHH no carga manualmente lo que el candidato puede ingresar directamente.
El candidato declara TODOS sus datos. El sistema no asume, no deduce, no infiere por API externa.

---

## 2. Stack oficial

```
Frontend:   Angular 17+ · Tailwind CSS · Sora
Backend:    NestJS (Node.js)
ORM:        TypeORM (synchronize: false en producción, migrations obligatorias)
DB:         PostgreSQL (AWS RDS en producción, Docker local en desarrollo)
Cloud:      AWS (RDS · S3 · Secrets Manager · ECS Fargate · ElastiCache Redis)
Queue:      BullMQ + Redis (automatizaciones con retry)
Scheduler:  AWS EventBridge (CRON bienvenida y comunicación interna)
Files:      Amazon S3
External:   Google Workspace Admin SDK + Gmail API
```

---

## 3. Arquitectura general

```
[Angular + Tailwind]  ←→  Panel operativo RRHH
         ↓
[NestJS API]
         ├── TypeORM Repositories
         │       ↓
         │   [PostgreSQL / RDS]  ← source of truth
         │
         ├── S3 Service  ← archivos W-8, QR Binance, documentos
         │
         └── Automation Orchestrator
                 ↓
           [BullMQ Queue / Redis]
                 ↓
           [NestJS Workers]
                 ├── Google Workspace Adapter   (crear usuario + grupos + firma)
                 ├── Administration Adapter     (notificación CBU)
                 ├── Device Request Adapter     (solicitud de equipo)
                 └── Communications Adapter     (bienvenida + anuncio interno)

[Formulario público candidato]  →  NestJS API (ruta pública, token único)
```

**Principio central:**
- PostgreSQL guarda el estado real del negocio
- La cola ejecuta tareas desacopladas del request/response
- Los adapters hablan con sistemas externos
- Angular muestra, aprueba y permite override
- El formulario del candidato es una ruta pública separada del panel interno
- En el demo, ambas vistas coexisten en split-screen sobre la misma URL `/demo`

---

## 4. Responsabilidades por actor

| Actor | Qué hace | Qué NO hace |
|---|---|---|
| **Candidato** | Declara todos sus datos: nacionalidad, residencia, identificador fiscal, método de cobro, referencias, archivos | Acceder al panel interno |
| **RRHH** | Crea caso, carga rol/equipo/fecha inicio, revisa datos del candidato, aprueba alta | Perseguir al candidato, crear Gmail manualmente, redactar bienvenidas, inferir datos |
| **Sistema** | Valida formatos básicos, sugiere email según regla rígida, evalúa reglas de grupos, ejecuta automatizaciones, audita todo | Asumir nacionalidad por identificador fiscal, decidir excepciones |
| **Administración** | Recibe datos bancarios automáticamente | Perseguir a RRHH por CBU |
| **IT** | Recibe solicitud de dispositivo trazable | Depender de mensajes sueltos |

---

## 5. Módulos NestJS

### 5.1 `onboarding`
Núcleo del negocio. Crea y mueve el `OnboardingCase` por estados. Coordina revisiones RRHH y dispara tareas automáticas.

### 5.2 `candidate-submissions`
Formulario público del candidato. Token único con expiración. El candidato declara explícitamente:
- País de nacionalidad
- País de residencia
- Tipo de identificador fiscal (CUIT / CUIL / RUC / CPF / SSN / Pasaporte / etc.)
- Valor del identificador
- Método de cobro (CBU local / transferencia internacional / crypto)
- Datos bancarios o wallet según método
- Referencias laborales
- Archivos requeridos (W-8 si cobra desde el exterior, QR Binance si crypto)

Validaciones básicas de formato (longitud, caracteres válidos) pero **no** consultas a APIs externas para inferir datos.

### 5.3 `email`
Genera email corporativo con regla **rígida y única**:
```
{primera_inicial_nombre}{apellido}@zafirus.tech (todo minúsculas, sin acentos)

Juan Lopez → jlopez@zafirus.tech
María Pérez → mperez@zafirus.tech
Carlos Hernández Saavedra → chernandez@zafirus.tech (primer apellido)
```

Verifica colisión contra Google Workspace Directory antes de confirmar.
Si hay colisión, agrega número incremental: `jlopez2@zafirus.tech`.

Genera:
- `signatureHtml`: firma HTML con variables del empleado (nombre, rol, email, logo Zafirus)
- `welcomeEmail`: email de bienvenida al ingresante
- `groupWelcomeMessages`: mensajes personalizados a cada grupo donde se suma el nuevo usuario

RRHH puede previsualizar y editar antes de ejecutar.

### 5.4 `google-workspace`
Adapter externo para Google Workspace Admin SDK + Gmail API.

Operaciones:
```
createUser(email, firstName, lastName, password)
addUserToGroups(email, [groupEmail1, groupEmail2, ...])
configureSignature(email, signatureHtml)
sendEmailFromSystem(to, subject, body)         // para welcome al usuario
sendGroupAnnouncement(groupEmail, subject, body) // para anunciar al grupo
checkEmailAvailability(email) → boolean
```

Implementación real detrás de una interfaz `IGoogleWorkspaceAdapter`. Mock implementation `MockGoogleWorkspaceAdapter` para demo.

### 5.5 `groups`
Subsistema de gestión de grupos de Google Workspace. Ver `GROUPS_SUBSYSTEM.md` para detalle.

Responsabilidades:
- Mantener catálogo de grupos existentes (`email_groups`)
- Mantener reglas de asignación (`email_group_rules`)
- Evaluar qué grupos corresponden a un caso según rol/equipo/país/método de cobro
- Generar mensajes de bienvenida específicos por grupo

### 5.6 `automations`
Crea `OnboardingTask` records. Encola jobs en BullMQ. Workers ejecutan y registran `AutomationRun`. Soporta retry, skip, y run manual con override panel.

Errores de worker traducidos a lenguaje de negocio antes de llegar al frontend (ver códigos en DATA_MODEL.md).

### 5.7 `files`
Sube a S3 con key estructurada: `onboarding-cases/{caseId}/files/{fileId}`
Guarda solo metadata en PostgreSQL (storageKey, mimeType, sizeBytes, status).
URLs firmadas con expiración para acceso.

### 5.8 `audit`
Registra cada acción relevante. Ningún evento crítico ocurre sin `AuditEvent`.
Actor: `user | system | integration`

---

## 6. Estructura de carpetas NestJS

```
src/
  app.module.ts
  config/
    database.config.ts
    aws.config.ts
    google.config.ts

  auth/
    auth.module.ts
    guards/
    decorators/

  employees/
    employees.module.ts
    employees.service.ts
    entities/
      employee.entity.ts
      employee-file.entity.ts
      employee-reference.entity.ts

  onboarding/
    onboarding.module.ts
    onboarding.controller.ts
    onboarding.service.ts
    onboarding-state-machine.service.ts
    onboarding-task-factory.service.ts
    entities/
      onboarding-case.entity.ts
      onboarding-task.entity.ts

  candidate-submissions/
    candidate-submissions.module.ts
    candidate-submissions.controller.ts
    candidate-submissions.service.ts
    entities/
      candidate-submission.entity.ts

  email/
    email.module.ts
    email-naming.service.ts
    email-preview.service.ts
    entities/
      email-preview.entity.ts
      email-template.entity.ts

  groups/
    groups.module.ts
    groups.service.ts
    group-rules-evaluator.service.ts
    entities/
      email-group.entity.ts
      email-group-rule.entity.ts
      group-membership.entity.ts

  automations/
    automations.module.ts
    automation-orchestrator.service.ts
    processors/
      google-workspace.processor.ts
      device-request.processor.ts
      administration.processor.ts
      communications.processor.ts
    entities/
      automation-run.entity.ts

  integrations/
    google-workspace/
      google-workspace.adapter.ts
      google-workspace.mock.adapter.ts
      interfaces/
        google-workspace-adapter.interface.ts
    administration/
      administration.adapter.ts
    devices/
      device-request.adapter.ts

  files/
    files.module.ts
    s3-storage.service.ts

  audit/
    audit.module.ts
    audit.service.ts
    entities/
      audit-event.entity.ts

  demo/
    demo.module.ts
    demo.controller.ts
    demo-reset.service.ts
    demo-seed.service.ts
```

---

## 7. Rutas Angular

### Producción (futuro)
```
/onboarding                           Lista de casos activos
/onboarding/new                       Crear nuevo caso
/onboarding/:id/overview              Resumen del caso + timeline
/onboarding/:id/candidate-data        Datos enviados por el candidato
/onboarding/:id/email                 Preview email, firma, bienvenida, grupos
/onboarding/:id/tasks                 Tareas automáticas + estado + runs
/onboarding/:id/files                 Archivos del caso
/onboarding/:id/audit                 Log completo de eventos

/settings/email-templates             Templates de bienvenida e interno
/settings/groups                      Catálogo de grupos y reglas
/settings/integrations                Estado de conectores

/candidate/:token                     Formulario público del candidato
```

### Demo (única URL pública)
```
/demo                                 Split-screen: RRHH izquierda · Candidato derecha
                                      Todas las pantallas dentro de cada panel
                                      Sincronización en tiempo real entre ambos lados
```

---

## 8. Seguridad

### Roles internos (post-demo)
```
RRHH_ADMIN       Acceso completo
RRHH_OPERATOR    Operación de casos, sin settings
ADMINISTRATION   Solo vista de datos bancarios del caso
IT_OPERATOR      Solo vista y gestión de solicitudes de dispositivo
AUDITOR          Solo lectura de audit log
SYSTEM           Worker / proceso interno
```

En demo: un único rol mock que tiene todos los permisos.

### Datos sensibles (tratamiento especial)
```
CBU · cuenta bancaria · QR Binance · W-8 · documentos fiscales
```
Reglas:
- Cifrado en reposo en S3
- Acceso solo por rol (en producción)
- URLs firmadas con expiración para archivos
- Audit log para cada acceso
- No exponer en responses generales de lista

---

## 9. Infraestructura AWS (producción)

| Componente | Servicio AWS |
|---|---|
| PostgreSQL | RDS PostgreSQL Multi-AZ |
| Archivos | S3 (bucket privado + signed URLs) |
| Secrets | Secrets Manager (KMS) |
| API NestJS | ECS Fargate |
| Workers NestJS | ECS Fargate (servicio separado) |
| Redis / BullMQ | ElastiCache Redis |
| CRON comunicaciones | EventBridge Scheduler |
| Logs | CloudWatch |

---

## 10. Reglas de TypeORM

```typescript
TypeOrmModule.forRoot({
  synchronize: false,       // siempre false en prod
  migrations: [...],        // obligatorias
});
```

- `jsonb` para: `rawResponseJson`, `metadataJson`, `requestPayload`, `responsePayload`, `variablesJson`, `conditionJson`
- Columnas reales para: `status`, `email`, `countryCode`, `startDate`, `taskType`, `employeeId`
- Índices desde la primera migración (ver DATA_MODEL.md)

---

## 11. Flujo completo del sistema

```
1.  RRHH crea OnboardingCase con datos mínimos (nombre, rol, equipo, fecha inicio)
2.  RRHH envía formulario al candidato → token único + email
3.  Candidato abre link y declara explícitamente:
    - País nacionalidad + país residencia
    - Identificador fiscal (tipo + valor)
    - Método de cobro + datos asociados
    - Referencias
    - Archivos (W-8 si aplica, QR Binance si aplica)
4.  Candidato hace submit → caso pasa a candidate_submitted
5.  Sistema sugiere email corporativo según regla rígida
6.  Sistema evalúa reglas de grupos según datos del caso → lista de grupos sugeridos
7.  Sistema genera preview de:
    - Email corporativo (jlopez@zafirus.tech)
    - Firma HTML
    - Email de bienvenida al ingresante
    - Mensajes a cada grupo donde se sumará el usuario
    - Anuncio interno general
8.  RRHH revisa todo en hr_review
9.  RRHH aprueba → caso pasa a ready_to_activate
10. RRHH activa → caso pasa a active_pending_automation
11. Workers ejecutan:
    - createUser en Google Workspace
    - addUserToGroups con la lista evaluada
    - configureSignature
    - sendEmailFromSystem (bienvenida al usuario)
    - sendGroupAnnouncement (uno por grupo, presentando al nuevo)
    - notifyAdministration (CBU)
    - requestDevice
12. Cada tarea genera AutomationRun trazable
13. Si todas las tareas inmediatas pasan → caso pasa a operative
14. CRON dispara comunicaciones programadas para startDate
```
