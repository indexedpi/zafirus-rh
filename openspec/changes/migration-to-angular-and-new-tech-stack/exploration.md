## Exploration: Migration to Angular and new tech stack

### Current State
- The React prototype is not in the working tree; it lives on `legacy/react-demo` and is documented in `docs/migration/*`.
- React used a single hash-based demo shell (`App.tsx`) that switched between split-screen demo, candidate token view, and demo mode persistence.
- React state lived in `src/store.ts` (Zustand), with demo persistence via `sessionStorage` plus Supabase `demo_cases` replication.
- Angular is the current implementation on `apps/web-angular/`: standalone components, Angular signals, Tailwind, and an in-memory `OnboardingMockService`.
- Angular currently renders a single full-screen onboarding shell; there is no Angular router, so `/demo` is not actually routed in-app yet.

### Affected Areas
- `legacy/react-demo:src/App.tsx` — split-screen shell, hash/demo gating, Supabase/demo boot flow.
- `legacy/react-demo:src/store.ts` — canonical business logic for case lifecycle, candidate flow, tasks, audit, auto-run, and demo persistence.
- `legacy/react-demo:src/types.ts` — canonical frontend data contracts and task/status enums.
- `legacy/react-demo:src/lib/supabase.ts`, `demoPersistence.ts` — persistence boundary for demo state.
- `apps/web-angular/src/app/app.component.ts` — current shell; needs `/demo` routing support and parity with React shell.
- `apps/web-angular/src/app/onboarding/services/onboarding-mock.service.ts` — Angular state/business logic port; currently in-memory only.
- `apps/web-angular/src/app/onboarding/models/onboarding-case.model.ts` — Angular domain model; close to React types but not identical.
- `apps/web-angular/src/app/onboarding/**` — RRHH panels, tabs, and candidate wizard parity surface.
- `docs/migration/REACT_TO_ANGULAR_MAP.md`, `UI_REFERENCE.md`, `QA_PARITY_CHECKLIST.md`, `MIGRATION_PLAN.md`, `HANDOFF.md` — migration canon and acceptance references.
- `apps/api-nest/src/**` — backend contract and entity boundaries for the later HTTP integration phase.

### Approaches
1. **Direct parity completion on Angular mock shell** — finish the Angular UI/state to match React behavior first, then swap mock service calls for API calls.
   - Pros: fastest route to visual/usage parity; easiest to verify against React reference; keeps scope focused.
   - Cons: duplicates business logic temporarily; may need cleanup when HTTP integration lands.
   - Effort: Medium

2. **Contract-first migration to backend-backed Angular** — wire Angular directly to NestJS/API boundaries while aligning UI.
   - Pros: less rework later; clearer production path; better separation of concerns.
   - Cons: higher integration risk; harder to keep parity while backend gaps remain; more moving parts.
   - Effort: High

### Recommendation
Start with **Direct parity completion on Angular mock shell**, using the legacy React branch as the reference for exact behavior and layout. Once parity is proven on `/demo`, replace the mock service boundary with backend/API adapters in a second slice. This reduces ambiguity and avoids mixing parity work with integration work.

### Risks
- `/demo` is not yet a real Angular route; current app is root-mounted only.
- React source is outside the working tree, so parity checks must pull from `legacy/react-demo`.
- Angular mock state diverges from React in some flows: no Supabase/session persistence, no auto-run banner logic, no audit drawer/global state, no split-screen token gating.
- Backend status mappings differ slightly (`active_pending_automation` vs `activating` in API docs), so contract alignment is required before HTTP wiring.
- Workspace/API integration is intentionally incomplete; placeholders must stay isolated from UI parity work.

### Ready for Proposal
Yes — the next step should be a proposal that splits the change into:
1. Angular parity completion for `/demo` (UI + local behavior), and
2. a separate backend-integration slice for API/workspace wiring.
