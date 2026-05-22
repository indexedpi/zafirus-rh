# QA Checklist - Final Hardening

- [ ] **Build**: `npm run build` ejecuta correctamente con `vite-plugin-singlefile`.
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
- [ ] **Immutable files untouched**: `src/store.ts` y `src/types.ts` no han sido modificados.

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
