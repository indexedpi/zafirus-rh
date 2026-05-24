# QA Checklist - Final Hardening

- [x] **Build**: `npm run build` ejecuta correctamente con `vite-plugin-singlefile`.
- [ ] **Normal mode**: No se muestran botones de demo, auto-demo ni placeholders de desarrollo en `/`.
- [ ] **Demo mode**: Herramientas de presentación (Auto Demo, Reset, Panel dividido) funcionan al usar `/#demo`.
- [ ] **Create case**: Modal valida campos obligatorios y crea el caso exitosamente.
- [ ] **Candidate invite**: Flujo de invitación genera el enlace y actualiza el estado.
- [ ] **Candidate form**: Proceso wizard carga condicionalmente archivos y valida datos antes de enviar.
- [ ] **Data review**: Pestaña de datos refleja exactamente lo enviado por el candidato.
- [ ] **Consolidation**: Permite consolidar CBU/CUIT sin duplicar la vista principal de identidad.
- [ ] **Activation**: Botón de "Activar onboarding" inicia correctamente las tareas.
- [ ] **Tasks**: Tareas reflejan los estados correctos (pending, running, success, failed, skipped).
- [ ] **Audit**: Pestaña de auditoría e historial del Overview registran eventos cronológicamente.
- [ ] **Mobile 375px**: Sin scroll horizontal. Los botones, modales y layouts se apilan limpiamente.
- [ ] **Copy language**: Todo el copy visible es español de producto coherente.
- [ ] **No demo leakage**: Links generados son reales (no inyectan `/demo` explícitamente).
- [ ] **No duplicate identity**: ProfileHero eliminado. `CaseDetail` gobierna la identidad.
- [x] **Immutable files untouched**: `src/store.ts` y `src/types.ts` no han sido modificados.

## Phase 7D Extensions
- [ ] TasksTab output panels render correctly.
- [ ] Failed task retry triggers existing action.
- [ ] Skipped task renders without crashing.
- [ ] Manual-required task rendering is highlighted.
- [ ] Long error strings wrap safely on mobile widths.
- [ ] Google Workspace integration plan exists.
- [ ] No real API calls are executed.

## Phase 7E Extensions
- [ ] CandidateWizard mobile 375px renders without horizontal scroll.
- [ ] CandidateWizard correction mode surfaces HR note calmly.
- [ ] CandidateWizard missing-field validation flags inline correctly.
- [ ] CandidateWizard conditional files step skips safely if no W-8 or Binance QR is needed.
- [ ] CandidateWizard review step outlines what will be sent to HR.
- [ ] CandidateWizard success state confirms submission calmly.
- [ ] CandidatePanel invalid token gracefully returns error.
- [ ] No demo leakage candidate-facing.

## Phase 7E Verification Pass (code-level, verified in source)
- [x] `ReviewStep` "Datos de cobro" uses method-specific completeness (CBU / WIRE / CRYPTO), not just `paymentMethod`.
- [x] `ReviewStep.isReady` uses the same method-specific completeness.
- [x] References helper copy declares that at least one reference is required.
- [x] Empty references state shows the required two-line Spanish copy.
- [x] Required labels present: Agregar referencia, Eliminar referencia, Nombre y apellido, Relación, Email, Teléfono.
- [x] Footer "Atrás" button has `aria-label="Volver al paso anterior"`.
- [x] Payment method cards expose `aria-pressed`.
- [x] File remove button has `aria-label="Eliminar archivo {file.name}"`.
- [x] Reference remove button has an `aria-label`.
- [x] Icon-only interactive elements include visible focus rings.
- [x] Footer at 375px stacks with `flex-col-reverse sm:flex-row`.
- [x] `CandidatePanel` no longer mentions "portal autodeclarativo".

## Phase 7F — Overview / Audit Extensions
- [ ] Overview muestra la etapa actual del trayecto con indicador visual no solo basado en color.
- [ ] Overview muestra "Siguiente hito" coherente con el estado del caso.
- [ ] Overview muestra entre 0 y 5 eventos recientes en "Actividad reciente".
- [ ] Overview no duplica nombre, rol, equipo, ubicación ni fecha de ingreso que ya gobierna `CaseDetail`.
- [ ] Overview banner aparece solo cuando el caso está bloqueado, cancelado, o con corrección pendiente.
- [ ] Auditoría muestra encabezado "Auditoría del caso" y subtítulo correspondiente.
- [ ] Auditoría muestra timeline cronológica con orden seleccionable.
- [ ] Auditoría filtra correctamente por Todos / RRHH / Candidato / Sistema / Tareas.
- [ ] Auditoría muestra estado vacío en Español.
- [ ] Auditoría no renderiza JSON crudo.
- [ ] Auditoría redacta datos sensibles con "Dato sensible oculto".
- [ ] Auditoría no expone enums crudos como UI primaria; acciones desconocidas → "Acción registrada".
- [ ] Auditoría a 375 px: filtros, badges, fechas y rows envuelven sin scroll horizontal.

## Phase 7F Verification Pass (code-level, verified in source)
- [x] `OverviewTab` no importa ni renderiza componentes de identidad.
- [x] `OverviewTab` define `JOURNEY_STAGES` con las 7 etapas Spanish y deriva la actual con `resolveCurrentIndex`.
- [x] `OverviewTab` muestra "Siguiente hito" con copia corta por estado.
- [x] `OverviewTab` limita `Actividad reciente` a 5 eventos.
- [x] `AuditTab` reemplazó `JSON.stringify` por `dl` estructurado.
- [x] `AuditTab` redacta con "Dato sensible oculto" tokens, passwords, CBU, wallet, swift, taxIdValue, links privados.
- [x] `AuditTab` filtra y permite alternar orden cronológico.
- [x] Acciones no mapeadas caen a "Acción registrada".

## Phase 7G — Final QA (code-level, verified in source)
- [x] Sweep de tokens prohibidos vacío en `src/`: `transition-all`, `transition: all`, `ease-spring`, `ease-bounce`, `ease-elastic`, `#549dd6`, `rgba(84,157,214`, `border-l-2`, `border-l-4`, `Operations Room`, `Control Dashboard`, `Readiness`, `raw JSON`, `Cancelarar`, `Screenshot`, `Link inválido`, `/demo#candidate`. — **Nota**: `opencode-config/` también saneado en Fix Pass A/B (refs a `#549dd6`, `Zafiro blue`, `React 18` corregidas).
- [x] `select-none` solo aparece en el logo decorativo `ZafirusLogo`.
- [x] Stale `{/* Readiness */}` en `EmailTab.tsx` reemplazado por `{/* Template status panel */}`.
- [x] `TopBar` solo muestra Auto Demo / Reiniciar / badge "Demo" si `window.location.hash.includes('demo')`.
- [x] `App.tsx` solo muestra split-screen si `isAutoRunning || candidateToken || hash.includes('demo')`.
- [x] Modal de nuevo caso: footer usa `flex-col sm:flex-row` con `w-full sm:w-auto` y `min-h-[44px]`.
- [x] Barra de acciones (`CaseActions`) usa `flex-wrap` y `min-h-[44px]` en cada CTA visible.
- [x] Tab strip de `CaseDetail` usa `overflow-x-auto scrollbar-hide` (sin scroll horizontal de página).
- [x] Wizard del candidato: footer sticky usa `flex-col-reverse sm:flex-row` (Phase 7E preserved).
- [x] `OverviewTab` recibe `onOpenAudit` desde `CaseDetail`; botón "Ver auditoría completa" funciona, con fallback honesto "Disponible en la pestaña Auditoría" si la prop está ausente.
- [x] `AuditTab` mantiene redacción y filtros (Phase 7F preserved).
- [x] No hay archivos temporales (`patch_*.py`, `*.tmp`, `*.bak`).
- [x] `src/store.ts` y `src/types.ts` siguen sin modificarse.
- [x] `npm run build` pasa después de Phase 7G.

## Phase 7H — Light Workspace System (code-level, verified in source)
- [x] `src/index.css` tokens updated: `--bg-base` `#f0f2f5`, `--bg-subtle` `#e8ebef`, `--bg-surface` `#ffffff`, `--bg-elevated` `#ffffff`, `--text-primary` `#0f172a`, `--text-secondary` `#475569`, border tokens → light slate palette, shadows → light ambient.
- [x] Shell tokens added: `--shell-bg`, `--shell-bg-soft`, `--shell-text`, `--shell-muted`, `--shell-active`, `--shell-active-border`.
- [x] Status subtle tokens use real light backgrounds (`#f0fdf4`, `#fef2f2`, `#fffbeb`, `#f0f9ff`).
- [x] `TopBar.tsx` uses `--shell-bg` (deep navy), white/shell-text for logo and nav, native buttons with shell hover states.
- [x] Pattern SVG background removed from `body` (not appropriate for light canvas).
- [x] `hover:bg-white/[0.02]` replaced with `hover:bg-[var(--bg-subtle)]` in CaseList and CaseDetail.
- [x] `TasksTab` console panel retains intentional dark terminal style (`bg-[#0f172a]`).
- [x] Email preview retains intentional white surface.
- [x] Forbidden sweep: no `bg-[#05080f]`, `bg-[#0c1120]`, `bg-[#101d30]`, `bg-slate-900`, `bg-slate-950`.
- [x] `src/store.ts` and `src/types.ts` unchanged.
- [x] `npm run build` passes.

## Phase 7H — Light workspace runtime checklist (presenter)
- [ ] TopBar is deep navy — white Zafirus logo, white text, muted nav items.
- [ ] Main content canvas is light gray — not dark.
- [ ] Cards (DataTab, TasksTab, AuditTab, OverviewTab) are white with subtle borders.
- [ ] CaseList sidebar uses `--bg-subtle` (light gray), not dark.
- [ ] Selected case in CaseList shows brand-subtle blue tint, not dark.
- [ ] Task output/console panels remain dark (terminal style).
- [ ] Email preview remains white.
- [ ] No neon glow buttons anywhere in the workspace.
- [ ] Mobile 375px: no horizontal scroll, no layout breaks.

## Phase 7G — Manual runtime checklist (presenter)
- [ ] Abrir `/` y verificar que no aparecen badges, botones ni copy de demo.
- [ ] Abrir `/#demo` y verificar que aparecen badge "Demo", "Reiniciar", "Auto Demo".
- [ ] Recorrer Crear → Enviar → Intake → Revisar → Consolidar → Aprobar → Activar → Tareas → Operativo → Auditoría sin caminos muertos.
- [ ] En Resumen, click en "Ver auditoría completa" debe cambiar a la pestaña Auditoría.
- [ ] A 375 px, ningún paso del recorrido produce scroll horizontal de la página.
- [ ] Auditoría redacta datos sensibles y filtra por Todos / RRHH / Candidato / Sistema / Tareas.

## Supabase Local Demo Persistence

### Build & type safety
- [ ] `npm run build` passes
- [ ] `npx tsc --noEmit` passes (or pre-existing errors only)

### Supabase configured mode
- [ ] Cases load from Supabase on boot
- [ ] Case changes save to Supabase (debounced, no polling)
- [ ] Candidate submission in tab 2 visible in tab 1 via realtime or refresh
- [ ] State survives browser refresh
- [ ] No service_role / Secret key in any file

### Supabase offline / missing env
- [ ] App loads without `.env.local`
- [ ] Dev warning logged (not error)
- [ ] Demo seeds normally in single-tab mode
- [ ] No crash

### Forbidden patterns
- [ ] No `service_role` in source
- [ ] No `SUPABASE_SERVICE` in source
- [ ] No `sb_secret` in source
- [ ] No `forceUpdate` in source
- [ ] No `setInterval(` in source
- [ ] No `#549dd6` in source
- [ ] No `transition-all` in source
- [ ] No `/demo#candidate` in source
- [ ] No hardcoded Supabase keys
