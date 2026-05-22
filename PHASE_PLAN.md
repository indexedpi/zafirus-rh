# Phase Plan - Zafirus RH UI Polish

## Phase 7A — Design System Foundation
- **Status:** Complete (DESIGN.md).

## Phase 7B — EmailTab: Real Welcome Email Composer & Preview
- **Status:** Complete. Editor separated from actual Zafirus-branded preview.

## Phase 7C — DataTab: Keyboard-first Editable Data Room
- **Status:** Complete. Keyboard-first interactions, copy capabilities, clean data grouping, and clear CTA actions implemented.

## Phase 7D — TasksTab: Real Automation Output Console
- **Status:** Complete. Tasks now show simulated execution output, grouped logically with retry bounds and clear integration hints.

## Phase 7E — CandidateWizard: Human Intake Experience
- **Status:** Complete (verification pass closed). Method-specific payment completeness, honest references copy, accessibility polish, mobile-safe footer.

## Phase 7F — Overview / Audit: Journey and Traceability
- **Status:** Complete. Overview owns journey + next milestone + recent activity; Audit owns timeline with filters, sort, Spanish action labels, key/value details and sensitive-data redaction.

## Phase 7G — Final Visual QA & Presentation Polish
- **Status:** Complete.
- Objective violations swept: removed stale `{/* Readiness */}` comment in `EmailTab.tsx` (replaced by `{/* Template status panel */}`). No remaining `transition-all`, `transition: all`, `ease-spring/bounce/elastic`, `#549dd6`, `rgba(84,157,214`, `border-l-2`, `border-l-4`, `Operations Room`, `Control Dashboard`, `raw JSON`, `Cancelarar`, `Screenshot`, `Link inválido`, `/demo#candidate`, or `Readiness` in source.
- `select-none` remains only on the decorative `ZafirusLogo` as allowed by the rule.
- End-to-end happy path inspected: Crear → Enviar → Intake → Revisar → Consolidar → Aprobar → Activar → Tareas → Operativo → Auditoría. No dead buttons, no English visible copy, no demo leakage outside `#demo`.
- Presentation mode QA: `TopBar` correctly gates Auto Demo / Reiniciar / Demo badge behind `isDemoMode = window.location.hash.includes('demo')`. Split-screen RRHH/Candidato only appears with `#demo`, candidate token in hash, or `isAutoRunning`.
- Mobile QA at 375 px: NewCaseModal footer stacks via `flex-col sm:flex-row`; CaseActions uses `flex-wrap` with `min-h-[44px]` on every CTA; CaseDetail tab strip uses `overflow-x-auto scrollbar-hide`; CandidateWizard footer uses `flex-col-reverse sm:flex-row` (Phase 7E); AuditTab filter chips and detail grid wrap; OverviewTab uses `min-w-0` + `break-words` throughout. No horizontal page scroll risks detected.
- Overview / Audit link decision (Part E): **Option 2 — wired locally**. `CaseDetail` now passes `onOpenAudit={() => setActiveTab('audit')}` to `OverviewTab`. The recent-activity card shows a real **"Ver auditoría completa"** button that switches tabs; if the prop is ever omitted, it falls back to the honest passive label **"Disponible en la pestaña Auditoría"**. No global state introduced.

## Phase 8 — Google Workspace Integration Implementation
- **Goal:** Backend and integration phase. This is **not** a visual redesign.
- Scope (planning + execution): Admin SDK auth (service account / domain-wide delegation), user provisioning (`directory.users.insert`), group membership (`directory.members`), Gmail signature configuration (`gmail.users.settings.sendAs`), idempotency, retry policy, audit feed from real integration events back into the `auditLog` contract defined in `src/types.ts`.
- See `GOOGLE_WORKSPACE_INTEGRATION_PLAN.md` for the technical mapping started in Phase 7D.
