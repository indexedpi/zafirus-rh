> Legacy note: this file predates the Phase 7 design constitution. Current canonical design rules live in /DESIGN.md.

# AGENTS_CONTEXT.md
# Contexto base del proyecto — Zafirus Onboarding System

> **Leer antes de cualquier tarea.**
> Este documento es la fuente de orientación para todos los agentes que trabajen en este proyecto.
> Los specs referenciados son documentos vivos — se actualizan a medida que el producto evoluciona.
> Ante cualquier contradicción entre este documento y un spec, **el spec gana**.

---

## 1. Qué es este sistema

**Sistema de Alta de Operativa Global** — plataforma interna de Zafirus Technologies para reemplazar el trabajo manual de RRHH en procesos de onboarding de colaboradores.

**Problema que resuelve:** 4 personas hacen actualmente tareas repetitivas (perseguir al candidato por datos, crear Gmail manualmente, redactar bienvenidas, notificar a Administración, coordinar dispositivos). Con lógica e integraciones, ese trabajo se automatiza y RRHH solo maneja excepciones.

**Alcance del sistema:**
- Pre-onboarding: solicitar CUIT y referencias al candidato
- Informar cuenta bancaria a Administración
- Solicitar W-8 a colaboradores extranjeros
- Gestión de QR Binance (pago crypto)
- Alta en Gmail (Google Workspace) — automática
- Solicitud de dispositivos — automática
- Correo de bienvenida + firma + kit de redes — automático post-Gmail
- Comunicación interna del ingreso — automática

**Lo que NO es este sistema (aún):**
- No reemplaza nómina ni liquidación de sueldos
- No es un HRMS completo (reemplaza PeopleForce en onboarding solamente)
- No tiene módulo de bajas/offboarding
- La API interna de la empresa se integra por separado (otra conversación)

---

## 2. Estado actual del proyecto

### Demo aprobada (base de trabajo activa)

```
Archivo:    zafirus-onboarding-demo-scope.zip
Stack:      React 18 + Vite + TypeScript + Tailwind CSS
Estado:     APROBADO — es la base sobre la que se construye
Función:    Demo funcional split-screen en una sola URL
            Panel izquierdo: RRHH
            Panel derecho: Candidato
            Sin backend real — todo en memoria (store.ts)
```

Esta demo muestra el flujo end-to-end pero tiene simplificaciones de demo que la Fase 2 corrige.

### Cambios activos (Fase 2 en curso)

Los siguientes cambios están **especificados pero no implementados aún**:

1. RRHH llena todos los datos personales del empleado (no el candidato)
2. Candidato responde solo 4 items: CUIT, referencias, cuenta bancaria, archivos (W-8/QR)
3. El welcome email incluye el link del formulario del candidato
4. Editor de email WYSIWYG con variables como pills (quality Claude.ai/Notion)
5. Orden de automatizaciones estricto: Gmail → grupos → firma → welcome → resto
6. Modelo de datos simplificado: `employee` + `employeeFile` según spec del jefe

### Spec files (fuente de verdad)

Todos los archivos están en `/specs/`. Son la documentación activa del sistema.

| Archivo | Propósito | Versión |
|---|---|---|
| `AGENTS_CONTEXT.md` | **Este archivo** — orientación para agentes | v1 |
| `SPEC_INDEX.md` | **Índice de specs** — catálogo de todos los documentos | v1 |
| `PHASE2_SCOPE.md` | **Delta activo** — qué cambia en Fase 2 vs demo aprobada | v1 |
| `EMAIL_EDITOR_SPEC.md` | **Pieza crítica** — spec completa del editor de bienvenida | v1 |
| `DEMO_SCOPE.md` | Scope completo del demo (Fase 1 + Fase 2 fusionadas) | v2 |
| `DATA_MODEL.md` | Entidades, TypeORM entities, índices | v2 |
| `ARCHITECTURE.md` | Stack, módulos NestJS, rutas Angular, AWS | v2 |
| `DESIGN_SYSTEM.md` | Tokens de diseño, componentes, layout del demo | v2 |
| `GROUPS_SUBSYSTEM.md` | Subsistema de grupos Google Workspace | v1 |

---

## 3. Restricciones que ningún agente puede ignorar

```
FIJO — NO CAMBIAR SIN AUTORIZACIÓN EXPLÍCITA:
────────────────────────────────────────────────
1. Stack tecnológico:
   Frontend: React 18 + Vite + TypeScript + Tailwind
   (futuro backend: NestJS + TypeORM + PostgreSQL + AWS)

2. Dominio de email: @zafirus.tech
   Regla de naming: {inicial_nombre}{apellido}@zafirus.tech
   Ejemplo: Juan Lopez → jlopez@zafirus.tech

3. Branding:
   Tipografía: Sora
   Brand primary: #459CDB
   Logo: https://zafirus.tech/images/zafirus-logo.svg
   Todo el dashboard: dark theme
   Área de composición de email: light (white)
   Idioma: español

4. Modelo de entidades (viene del jefe):
   employee { guid, name, lastName, CI, CUIT, birthday, email,
              CBU, cityId, provinceId, countryId, startDate,
              status (active|inactive) }
   employeeFile { guid, employeeGuid(FK), date, fileType(QR|W8) }

5. Variables del email de bienvenida:
   Las variables definidas en EMAIL_EDITOR_SPEC.md sección 3 NO se
   pueden agregar ni quitar. RRHH puede editar el texto libremente
   pero no puede crear variables nuevas ni eliminar las existentes
   del sistema de templates.

6. La API interna de la empresa NO se toca en este contexto.
   Se integrará en una conversación separada.
```

---

## 4. Cola de tareas en orden

Las tareas están priorizadas. No empezar la siguiente sin completar la anterior, salvo que sean explícitamente paralelas.

---

### TAREA 1 — Desarrollo Fase 2 (activa)

**Estado:** En spec, pendiente de implementación
**Base:** `zafirus-onboarding-demo-scope.zip`
**Spec principal:** `PHASE2_SCOPE.md` + `EMAIL_EDITOR_SPEC.md`
**Output esperado:** Proyecto React modificado, funcional en local

Qué construir:
- [ ] Modificar `types.ts`: nuevas interfaces `Employee`, `EmployeeFile`, `EmailTemplate`, `GroupSuggestion`; simplificar `CandidateData`
- [ ] Expandir `NewCaseModal` con 3 secciones (datos personales + operativos + variables agenda)
- [ ] Simplificar wizard candidato de 6 pasos a 4 (eliminar paso de datos personales y ubicación)
- [ ] Construir el editor WYSIWYG (ver `EMAIL_EDITOR_SPEC.md` completo — es la pieza más importante)
- [ ] Restructurar tab "Datos": sección RRHH (editable) + sección candidato (read-only + confirmar)
- [ ] Implementar orden estricto de tasks: Gmail → grupos → firma → welcome → paralelo
- [ ] `NOTIFY_ADMINISTRATION` se dispara al consolidar CBU del candidato (no en activate)
- [ ] Grupos como placeholders con evaluator (ver `PHASE2_SCOPE.md` sección 7)

Criterio de aceptación: 14 pasos del flujo en `PHASE2_SCOPE.md` sección 8 corren sin error.

---

### TAREA 2 — Investigación de integraciones (paralela a Tarea 1)

**Estado:** Pendiente
**Spec principal:** `ARCHITECTURE.md` sección 14 + `GROUPS_SUBSYSTEM.md` secciones 7-8
**Output esperado:** Documento `INTEGRATION_RESEARCH.md` con hallazgos y decisiones

Investigar:
- [ ] **Google Workspace Admin SDK Directory API**
  - Crear usuario: `POST /admin/directory/v1/users`
  - Verificar disponibilidad email: `GET /admin/directory/v1/users/{email}` (404 = disponible)
  - Agregar a grupo: `POST /admin/directory/v1/groups/{groupKey}/members`
  - Scopes necesarios, service account, domain-wide delegation
  - Rate limits y quotas

- [ ] **Gmail API**
  - Configurar firma: `PUT /gmail/v1/users/{userId}/settings/sendAs/{sendAsEmail}`
  - Enviar email: `POST /gmail/v1/users/{userId}/messages/send` (RFC 2822 base64url)
  - Scope: `gmail.settings.sharing` para firma, `gmail.send` para envío
  - Cómo actuar en nombre de un usuario recién creado (domain delegation)

- [ ] **Google Workspace Groups**
  - Listar grupos del dominio para reemplazar el seed hardcodeado
  - Cómo obtener el `workspaceGroupId` real de cada grupo

- [ ] **BullMQ + ElastiCache Redis**
  - Setup local para desarrollo
  - Integración con NestJS (`@nestjs/bullmq`)
  - Configuración para ECS Fargate (workers separados)

- [ ] **AWS Secrets Manager**
  - Cómo almacenar Google SA credentials (JSON key)
  - Cómo leerlas desde NestJS en runtime

Documentar: qué funciona, qué necesita configuración manual en Google Cloud Console, qué scopes necesita aprobar el admin de Workspace.

---

### TAREA 3 — Conexiones reales y troubleshooting

**Estado:** Pendiente (requiere TAREA 2 completada)
**Spec principal:** `GROUPS_SUBSYSTEM.md` completo + `ARCHITECTURE.md` módulo `google-workspace`
**Output esperado:** Google Workspace Adapter real funcionando, al menos en staging

Qué implementar:
- [ ] `GoogleWorkspaceAdapter` real (reemplaza el mock del demo)
  ```
  createUser(email, firstName, lastName, tempPassword)
  addUserToGroup(userEmail, groupEmail)
  configureSignature(userEmail, signatureHtml)
  sendEmail(from, to, subject, htmlBody)
  listGroups(domain)   // para poblar el catálogo de grupos
  ```
- [ ] Manejo de errores con `errorCode` traducidos a lenguaje de negocio
  (ver `DATA_MODEL.md` sección `automation_runs` — códigos de error UI)
- [ ] Retry logic: `USER_ALREADY_EXISTS` no reintenta, `RATE_LIMIT` sí, con backoff

Troubleshooting esperado:
- Domain-wide delegation necesita activación manual en Admin Console de Workspace
- Service Account necesita roles específicos en Google Cloud IAM
- La firma se configura con `sendAs` pero el usuario nuevo puede no tener `sendAs` creado aún — hay que crearlo primero
- `messages.send` con delegación requiere que el service account tenga el scope `gmail.send`

---

### TAREA 4 — Testing

**Estado:** Pendiente (requiere TAREA 1 completada, paralela a TAREA 3)
**Output esperado:** Suite de tests con cobertura en los flows críticos

Qué testear (en orden de prioridad):

```
Crítico:
- Orden de tasks: Gmail siempre antes de welcome email
- Email naming: Juan Lopez → jlopez@zafirus.tech (con acentos, doble apellido)
- Collision detection de email corporativo
- Evaluador de grupos: qué grupos asigna por país, equipo, contractType
- Pills del editor: no pueden ser editados parcialmente
- Variables del template: todas se resuelven antes de enviar
- CBU consolidation: dispara NOTIFY_ADMINISTRATION automáticamente

Importante:
- Estado del candidato form: token válido / expirado / ya enviado
- Tab Datos: sección candidato aparece solo si hay candidateData
- Wizard 4 pasos: flujo completo sin errores
- Reset demo: limpia estado y restaura seed correctamente

E2E (futuro):
- Flujo completo end-to-end (Cypress / Playwright)
- Con mock de Google Workspace API
```

---

### TAREA 5 — Diseño final (polish)

**Estado:** Pendiente (requiere TAREA 1 completada)
**Spec principal:** `DESIGN_SYSTEM.md` completo
**Output esperado:** UI production-ready, pixel-perfect

Qué pulir:
- [ ] Typography scale aplicada consistentemente (ver `DESIGN_SYSTEM.md` sección 3)
- [ ] Animaciones del demo: transitions al cambiar de estado, pulse animation en badge al actualizar
- [ ] Estado vacío de cada sección (empty states con icon + texto + acción)
- [ ] Loading states: skeleton screens mientras se esperan datos
- [ ] Error states: mensaje en lenguaje de negocio (no stack traces)
- [ ] Mobile consideration: en viewport < 1024px, paneles se apilan con toggle
- [ ] Email editor: light mode con tipografía cuidada, espaciado correcto, pills bien posicionados
- [ ] Accesibilidad: focus-visible en todos los interactivos, ARIA roles en toasts/badges

Nota: el diseño no es una reescritura — es un pass de polish sobre el código existente.

---

### TAREA 6 — API interna (fuera de scope actual)

**Estado:** Se discute en conversación separada
**Nota:** No tocar, no asumir, no integrar hasta tener instrucciones explícitas.

---

## 5. Glosario

| Término | Definición |
|---|---|
| **Case / Caso** | `OnboardingCase` — el proceso de alta de UNA persona. No es la persona, es el expediente. |
| **Employee** | La persona. `Employee.status` activa cuando el caso llega a `operative`. |
| **Candidate** | La persona antes del alta, cuando aún completa su formulario. |
| **CUIT** | Clave Única de Identificación Tributaria (Argentina). Lo provee el candidato. |
| **CBU** | Clave Bancaria Uniforme (22 dígitos, Argentina). Lo provee el candidato. Va a Administración. |
| **W-8** | Formulario del IRS (USA) para contratistas extranjeros. Solo aplica a wire transfer. |
| **QR Binance** | Imagen QR del wallet de Binance. Solo aplica si el candidato cobra en crypto. |
| **Kit de Redes** | Carpeta de Google Drive con brandbook, banner LinkedIn, fondos Meet, firma institucional. |
| **Pill** | Variable del email editor. `span` no editable con el valor de la variable. |
| **Grupos** | Grupos de Google Workspace. Por ahora: seed + evaluator. Futuro: Workspace API real. |
| **Consolidar** | Acción de RRHH que toma CUIT y CBU del formulario del candidato y los guarda en `employee`. |
| **Source of truth** | PostgreSQL (en producción). En demo: store.ts en memoria. |
| **Demo** | `zafirus-onboarding-demo-scope` — el build aprobado, base de trabajo. |
| **Fase 2** | Conjunto de cambios activos definidos en `PHASE2_SCOPE.md`. |
| **Mock adapter** | Implementación falsa de Google Workspace que simula éxito/fallo sin llamadas reales. |
| **Worker** | Proceso asíncrono que ejecuta una `OnboardingTask`. En demo: timeout simulado. |
| **Idempotency** | Propiedad de una tarea: ejecutarla N veces produce el mismo resultado que ejecutarla 1 vez. |

---

## 6. Convenciones del código

```
Idioma del código:    inglés (variables, funciones, comentarios técnicos)
Idioma de la UI:      español (labels, placeholders, mensajes, toasts)
Nombrado:             camelCase para variables/funciones, PascalCase para componentes
CSS:                  Tailwind classes primero, CSS variables para tokens de diseño
Emails:               siempre minúsculas, sin tildes, sin espacios → jlopez@zafirus.tech
Fechas:               ISO 8601 en store (YYYY-MM-DD), formateadas en display (DD/MM/YYYY)
GUIDs:                UUID v4 generados con `crypto.randomUUID()`
Timestamps:           `Date.now()` (ms desde epoch) en el demo
```

---

## 7. Cómo correr el demo actual

```bash
# Extraer el demo aprobado
unzip zafirus-onboarding-demo-scope.zip -d zafirus-demo
cd zafirus-demo

# Instalar dependencias
npm install

# Correr en desarrollo
npm run dev
# → http://localhost:5173

# El demo carga automáticamente 3 casos de ejemplo al iniciar.
# Botón "Reset" en el topbar para volver al estado inicial.
# Botón "Auto" para ver el flujo completo animado.
```

---

## 8. Contacto y escalamiento

Ante ambigüedades no resueltas en los specs:
1. Documentar la ambigüedad en el archivo spec relevante (PR / comentario)
2. No asumir — preguntar
3. Si es urgente: implementar la opción más conservadora y marcar con `// TODO: confirmar con producto`

Los specs son documentos vivos. Si una tarea requiere un cambio al spec, documentarlo explícitamente.
