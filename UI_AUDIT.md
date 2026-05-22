# UI Audit - Phase 7

## P0: Build/Flow Breaking
- None currently.

## P1: Trust/Product Demo Issues
- None currently. Brand colors, missing data flows, EmailTab previews, and audit trail credibility have been fully resolved through Phases 7A–7G.

## P2: Visual Polish Issues
- **contenteditable cursor stability risk**: Fixed in 7B, but deeply embedded text selections might still misbehave under edge cases.
- **TasksTab integration**: Needs operational log feedback interface rather than purely static mock states (Phase 7D). [FIXED]
- **Overview/Audit traceability**: Overview previously mixed identity-adjacent content and Audit dumped raw `JSON.stringify` blobs. Both rebuilt in Phase 7F. [FIXED]
- **Stale `{/* Readiness */}` comment in `EmailTab.tsx`**: Replaced in Phase 7G by `{/* Template status panel */}`. [FIXED]
- **"Ver en Auditoría" passive label**: Replaced in Phase 7G with a real **"Ver auditoría completa"** button wired through `CaseDetail` → `OverviewTab` props. [FIXED]

## P3: Nice-to-have
- **CandidateWizard**: Could benefit from improved microcopy on empty states. [FIXED — Phase 7E]

## Phase 7E — CandidateWizard remaining risks
- File uploads are in-memory only (no persistence, no virus scan, no size limit beyond browser default). Acceptable for the frontend prototype.
- Reference auto-seeding adds an empty contact on first render to avoid showing the empty state as the default.
- `IntakeProgressStepper` titles are hidden under `sm:`; at 375 px users rely on numbered dots.
- W-8 / QR Binance file types are surfaced conditionally; if flags toggle off after upload, stale files may remain (store contract owned by `src/store.ts`).
- No token-expiry UI for the candidate flow yet.

## Phase 7F — Overview / Audit remaining risks
- Recent activity in `OverviewTab` and per-event timestamps in `AuditTab` are relative/local; a production version should expose absolute timezone-aware timestamps on hover.
- Sensitive-field redaction is heuristic (key allowlist + length/URL heuristic); intentionally over-redacting.
- Filter classification of audit events is heuristic and matches today's `makeAudit` call sites in `src/store.ts`.

## Phase 7H — Light workspace remaining risks
- `TaskOutputPanel` in `TasksTab` uses hardcoded `bg-[#0f172a]` and `text-slate-300` — intentional terminal aesthetic. If the overall design direction changes, this should be tokenized via a `--console-bg` / `--console-text` token pair.
- `EmailSignatureBanner` in `EmailTab` uses `bg-[var(--bg-base)]` for the logo container — now renders as light gray, which is correct. The gray-200/gray-800 hardcoded classes in the email preview are intentional (email client simulation must stay light regardless of app theme).
- `DataTab.SectionHeader` uses inline `borderLeftColor` for section accent colors. These are cosmetic only and use token references; no functional risk.
- `CandidateWizard.CorrectionNotice` uses `bg-[var(--bg-base)]` for the note body — now renders as light gray `#f0f2f5`. Acceptable contrast against warning-subtle background.
- Status subtles updated to real opaque light colors (`#f0fdf4`, `#fef2f2`, etc.) which may look slightly bolder than before — this is by design for WCAG compliance on light backgrounds.

## Phase 7G — Final QA remaining risks
- Memory-only state: any browser refresh resets the demo unless `seedDemo` runs on first load (it does, but cases created mid-session are lost on hard reload).
- Split-screen RRHH / Candidato at 375 px collapses to a single-pane switcher; this is correct for mobile but is a behavior the presenter must walk the audience through.
- `Avatar`, `Badge`, and other primitives in `src/components/ui/*` were not exhaustively re-audited; visual sweep covered their consumers in the QA-target list.
- Pre-existing `Cancelar` modal flow uses the function name `handleCancelar` (Spanish identifier mixed into otherwise English code). Not a visible-copy issue and not in Phase 7G's "must touch" scope; flagged for the future refactor.
- The `forceUpdate` 500 ms tick in `App.tsx` is intentional for live demo cross-panel sync; in production it should be replaced by a proper subscription.
