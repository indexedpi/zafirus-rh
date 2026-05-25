# Tasks: Migration to Angular and New Tech Stack

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | 1,200-2,400 for first apply slice; 3,500+ full parity |
| 3000-line budget risk | Low for first slice; High for full change |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 shell/state foundation → PR 2 shell/navigation/viewport fixes → PR 3 flow parity → PR 4 persistence/docs |
| Delivery strategy | auto-forecast |
| Chain strategy | feature-branch-chain |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High
3000-line budget risk: Low for first slice; High for full change

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|---|---|---|---|
| 1 | `/demo` route, shell, hash/token parsing, facade parity baseline | PR 1 | First apply slice; enables manual visual comparison |
| 2 | Shell navigation, viewport-height scroll regions, favicon/root route, sidebar behavior | PR 2 | Current apply slice; fixes manual QA defects before deeper parity |
| 3 | Case/candidate/email/task/audit component parity | PR 3 | Deferred from the previous second-slice plan |
| 4 | Demo persistence, docs, React archive marker | PR 4 | Depends on stable parity flows |

## Phase 1: Angular Routing Shell

 - [x] 1.1 Create `apps/web-angular/src/app/app.routes.ts` with `/demo`, root redirect, and placeholder deferred routes.
 - [x] 1.2 Modify `apps/web-angular/src/app/app.config.ts` to provide Angular router with the new routes.
 - [x] 1.3 Modify `apps/web-angular/src/app/app.component.ts` to use `RouterOutlet` while preserving sidebar, top bar, and toast chrome.

## Phase 2: Demo Shell State Parity

 - [x] 2.1 Update `apps/web-angular/src/app/onboarding/pages/onboarding-page/onboarding-page.component.ts` to interpret hash/fragment demo modes and safe fallbacks.
 - [x] 2.2 Add token-gating and candidate panel open-state behavior through `OnboardingMockService`, not component-local logic.
 - [x] 2.3 Add facade selectors/mutations in `apps/web-angular/src/app/onboarding/services/onboarding-mock.service.ts` for selected case, candidate mode, task/audit summaries, and demo reset.
- [ ] 2.4 Align `apps/web-angular/src/app/onboarding/models/onboarding-case.model.ts` with React-equivalent demo contracts and document backend status rename mapping.

## Phase 2b: Shell Navigation and Viewport Fixes

  - [x] 2.5 Restore `/` as a normal landing route while keeping `/demo` accessible.
  - [x] 2.6 Wire the sidebar to navigate between home and demo routes.
  - [x] 2.7 Constrain the shell and email tab to viewport-height internal scroll regions.
  - [x] 2.8 Add SVG favicon and browser metadata for the app brand.
  - [x] 2.9 Match the reference-style shell geometry with a wide persistent left sidebar and inset content canvas while preserving `/demo` onboarding content.
  - [x] 2.10 Polish the onboarding shell copy and layout: Spanish UI text, simulated Google sign-in, closable candidate panel, and viewport whitespace cleanup.

## Phase 3: First-Slice Verification

 - [x] 3.1 Add/update Angular specs for `/demo` route rendering, root redirect, hash fallback, and token gating in `apps/web-angular/src/app/**/*.spec.ts`.
- [ ] 3.2 Run `cd apps/web-angular && npm test -- --watch=false` and fix first-slice regressions.
- [ ] 3.3 Run `cd apps/web-angular && npm run build` before handing off to manual visual verify.

## Phase 4: Manual Visual Handoff

- [ ] 4.1 Update `docs/migration/QA_PARITY_CHECKLIST.md` with first-slice states: empty shell, selected case, candidate panel, hash fallback, token-gated view.
- [ ] 4.2 Update `docs/migration/HANDOFF.md` noting React remains archived reference and backend/API integration is deferred.
