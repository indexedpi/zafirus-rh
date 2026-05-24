# Demo Script — Zafirus RH

## Quick start

```bash
npm install
npm run dev
```

The app runs fully in-memory without any external services.

---

## Demo mode (`/#demo`)

Append `#demo` to the URL to unlock presentation tools:

```
http://localhost:5173/#demo
```

What `#demo` enables:
- **Split-screen** — RRHH panel on the left, Candidate form on the right
- **Auto Demo** button in the TopBar — runs the full onboarding flow automatically
- **Reiniciar** button — resets all cases back to demo seed data
- **Demo badge** in the TopBar

Normal mode (`/`) shows none of this — it's a clean operational interface.

---

## Candidate tokens

When a case is in the **Formulario enviado** state, the RRHH panel generates a candidate link with a hash token:

```
http://localhost:5173/#candidate=<token>
```

Opening that URL shows the candidate intake wizard without the RRHH panel. In `#demo` mode, both panels are visible side by side. The token is synthetic (no backend auth yet) and decoded from the case ID.

---

## Supabase local (optional — multi-tab persistence)

Without Supabase the app works in-memory. State is lost on page reload (use **Reiniciar** to re-seed). With Supabase local, state persists across reloads and syncs between tabs in real time.

### Setup

Requires Docker.

```bash
npx supabase start
```

Copy the `anon` key from the command output into `.env.local`:

```
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_PUBLISHABLE_KEY=<anon key>
```

Only use the **anon / publishable** key. Never put `service_role` or secret keys in `.env.local` or anywhere in the frontend.

```bash
npm run dev
```

### Stop

```bash
npx supabase stop
```

> Supabase local binds to the local machine only. Do not run on untrusted public networks.

### Multi-tab test

1. Open `http://localhost:5173/#demo`
2. Select a case → send candidate form → copy the candidate link
3. Open the candidate link in a second tab
4. Complete and submit the candidate form
5. Return to the RRHH tab — the case updates via Realtime (or after refresh)
6. Refresh both tabs — state persists

---

## Demo walkthrough (step by step)

> **Pitch de apertura:** Zafirus RH centraliza el alta operativa — reemplaza tickets dispersos, planillas y mensajes sueltos con una sola superficie trazable.

### Rutas
- **Modo producto**: `/` — experiencia real, sin herramientas de presentación
- **Modo presentación**: `/#demo` — panel partido + Auto Demo + Reiniciar

### Paso a paso

1. **Crear caso** — modal con datos base del colaborador
2. **Enviar formulario** — despachar el formulario al candidato desde la barra de acciones
3. **Intake del candidato** — panel derecho (en `#demo`): identificación fiscal, datos de cobro, referencias, archivos condicionales
4. **Candidato envía** — el caso vuelve al panel de RRHH
5. **Revisar datos** — pestaña Datos, validar todo lo declarado
6. **Consolidar** — confirmar CBU/CUIT y marcar como consolidados
7. **Aprobar** — barra de acciones, liberar la activación
8. **Activar onboarding** — las tareas operativas comienzan
9. **Inspeccionar tareas** — pestaña Tareas, ver avance, reintentos, evidencia simulada
10. **Operativo** — overlay de confirmación
11. **Auditoría** — pestaña Auditoría (o "Ver auditoría completa" en Resumen)

---

## Qué es real

- Flujo end-to-end del frontend completo
- Validaciones en cada paso (intake, revisión, activación)
- Simulación realista de tareas con estados pending/running/success/failed/skipped
- Registro de auditoría cronológico con filtros y redacción de datos sensibles
- Vista previa del email de bienvenida con identidad visual Zafirus

## Qué está mockeado

- Persistencia: Supabase local (opcional) o memoria (default)
- Carga de archivos: solo metadatos locales, sin upload real
- Automatizaciones: `setTimeout` simulado, sin Google Workspace ni Admin SDK
- Envío de emails: solo preview, no se envía nada
- Tokens del candidato: sintéticos, sin backend de auth

## Limitaciones conocidas

- Sin Supabase, un reload reinicia el estado (usar **Reiniciar** para re-sembrar)
- A 375 px el panel partido colapsa a un solo panel con interruptor RRHH / Candidato
- Algunos detalles de auditoría muestran **"Dato sensible oculto"**: es intencional
