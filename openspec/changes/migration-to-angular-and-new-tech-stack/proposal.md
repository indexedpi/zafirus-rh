# Proposal: Migration to Angular and New Tech Stack

## Intent

Port all React prototype behavior, logic, entities, and frontend into the Angular final app. Deprecate React. Fix Angular `/demo` routing. Stop only when React and Angular show **no visual, usage, or logic differences** per QA_PARITY_CHECKLIST.md.

## Scope

### In Scope
1. Angular `/demo` route with hash-based split-screen shell parity
2. Mock service state matching React store (case lifecycle, candidate flow, tasks, audit)
3. Component-by-component parity verified against React reference
4. Mark `legacy/react-demo` as archived reference
5. Persistence boundary parity (Supabase/sessionStorage in mock)

### Out of Scope
- Workspace integration, real email, file uploads
- Live API wiring (NestJS ↔ Angular HTTP)
- Auth, production deployment, Docker, migrations

## Capabilities

### New Capabilities
- `demo-routing`: Angular `/demo` route, hash-based shell, split-screen, token gating
- `case-lifecycle`: Case CRUD, status transitions, contextual actions, auto-run banner
- `candidate-wizard`: 4-step wizard, submission, DataTab feedback
- `email-editor`: Editable body, variable pills, preview, approval workflow
- `audit-log`: Timeline, filters, redaction, global audit drawer
- `task-management`: Tasks ring, retry/skip actions

### Modified Capabilities
None — no existing specs in `openspec/specs/`.

## Approach

Direct parity on Angular mock shell (per exploration). Two slices:

1. **Slice A — UI/Behavior**: Port React state + behavior to Angular mock. Route `/demo`. Verify against React.
2. **Slice B — Backend**: Swap mock for HTTP adapters to NestJS. Deferred.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `apps/web-angular/src/app/app.config.ts` | Modified | Add Angular routing |
| `apps/web-angular/src/app/app.component.ts` | Modified | Root → route-aware shell |
| `apps/web-angular/src/app/` | New | Route components for `/demo` |
| `apps/web-angular/.../onboarding/services/` | Modified | Match React store behavior |
| `apps/web-angular/.../onboarding/models/` | Modified | Align with React types.ts |
| `apps/web-angular/.../shared/` | Modified | Split-screen, global audit drawer |
| `legacy/react-demo/` | Deprecated | Mark archived reference |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `/demo` routing requires shell restructure | High | Isolate in one slice |
| React store has unmigrated flows | Med | QA checklist per flow |
| Backend status enum mismatch | Low | Document for next slice |
| Parity diff from improvements | Med | Flag deviances with docs |

## Rollback Plan

Revert the parity branch. Keep `legacy/react-demo` as fallback. Angular pre-migration state intact.

## Dependencies

- `legacy/react-demo` branch accessible for reference
- `apps/web-angular` buildable and serving

## Success Criteria

- [ ] `/demo` route loads Angular shell matching React hash-shell visually
- [ ] QA_PARITY_CHECKLIST.md all ✅ for migrated flows
- [ ] No visual/usage diff between React and Angular for case lifecycle, candidate wizard, email editor, tasks, audit
- [ ] React prototype marked deprecated/archived in docs
