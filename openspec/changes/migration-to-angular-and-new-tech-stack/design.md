# Design: Migration to Angular and New Tech Stack

## Technical Approach

Angular becomes the only runtime shell. `app.component.ts` should stop hard-coding onboarding and instead host the router shell plus shared chrome. `/demo` becomes the canonical entry, with a route-level shell that reproduces the React split-screen demo and reads hash/fragment state for demo mode, token gating, and fallback selection. Live workspace, auth, and HTTP API integration stay outside this slice.

The Angular domain stays signal-driven. `OnboardingMockService` remains the source of truth for demo flows, but it should be treated as a facade over domain mutations and selectors, not as view logic. Existing standalone components (`case-list`, `case-detail`, tabs, candidate panel/wizard) keep their current composition and bind to the facade only.

## Architecture Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Routing shell | Add explicit Angular routing for `/demo` | Makes the demo real in the app, removes the root-only bypass, and matches the React shell entry point. |
| State model | Keep signals in a single onboarding facade | Preserves current Angular patterns and keeps parity logic centralized for case, candidate, email, task, and audit flows. |
| Entity mapping | Mirror React contracts in `onboarding-case.model.ts`, defer backend renames | Avoids premature backend coupling while keeping a clear path to the phase-2 API entities. |
| Persistence boundary | Isolate session/demo storage and Supabase demo replication behind one adapter | Preserves demo parity without leaking workspace/API behavior into `/demo`. |
| React deprecation | Mark `legacy/react-demo` as archived reference only | Keeps React available for parity checks while preventing new dependency on the old runtime. |

## Data Flow

`/demo` -> route shell -> onboarding facade -> feature components -> persistence adapter

```
Route fragment/query
   -> Demo shell
   -> Onboarding facade (signals + mutations)
   -> Case / candidate / email / audit / task components
   -> Demo persistence (sessionStorage + optional Supabase demo sync)
```

The facade owns state transitions and derived status, while components only render and dispatch actions. The persistence adapter writes demo state only; live workspace/API calls remain stubbed and isolated for the later backend slice.

## File Changes

| File | Action | Description |
|---|---|---|
| `apps/web-angular/src/app/app.routes.ts` | Create | Route map with `/demo` as the canonical demo path. |
| `apps/web-angular/src/app/app.config.ts` | Modify | Provide router and route-level app wiring. |
| `apps/web-angular/src/app/app.component.ts` | Modify | Replace hard-coded onboarding shell with router outlet and shared chrome. |
| `apps/web-angular/src/app/onboarding/pages/onboarding-page/onboarding-page.component.ts` | Modify | Become the routed demo shell and hash/fragment interpreter. |
| `apps/web-angular/src/app/onboarding/services/onboarding-mock.service.ts` | Modify | Keep domain logic, add explicit persistence and parity selectors. |
| `apps/web-angular/src/app/onboarding/models/onboarding-case.model.ts` | Modify | Keep React-equivalent contracts and document backend rename mapping. |
| `docs/migration/HANDOFF.md` | Modify | Declare React as archived reference and the backend slice as deferred. |

## Visual Parity Strategy

Use `docs/migration/QA_PARITY_CHECKLIST.md` as the acceptance matrix and compare Angular `/demo` against the React reference at fixed states: empty shell, invited case, review case, candidate wizard, email preview, task automation, and audit drawer. Compare screenshots at the same viewport set and require state-by-state diffs to be explained before merge.

## Sequencing and Risks

1. Ship routing/shell first so `/demo` is real before any deeper parity work.
2. Lock the domain facade and model mapping next, so every tab reads the same source of truth.
3. Finish tab parity and candidate flow after the shell is stable.
4. Add demo persistence boundary last, then hand off backend integration to the deferred slice.

This should be split into PRs that stay under the 3000-line review budget. The biggest risks are shell churn leaking into every component, backend enum drift (`active_pending_automation` vs `activating`), and accidentally coupling demo persistence to future API code.

## Open Questions

- None blocking. Backend and workspace integration are intentionally deferred to the next slice.
