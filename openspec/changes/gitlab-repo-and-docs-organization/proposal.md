# Proposal: GitLab Repo and Docs Organization

## Intent

Establish the RH repo as a GitLab-managed project and replace the flat legacy spec dump with a predictable docs layout. This reduces onboarding friction, gives agents one docs entrypoint, and makes future docs changes reviewable.

## Scope

### In Scope
- Create/configure the GitLab project via `glab`, set `origin`, and establish initial repo metadata.
- Add project `.gitignore` and any minimal git hooks needed.
- Reorganize docs into `docs/specs/`, `docs/guides/`, `docs/decisions/`, `docs/templates/`.
- Add `README.md`, `CONTRIBUTING.md`, `docs/guides/gitlab-workflow.md`, `docs/guides/development-setup.md`.
- Move the 9 legacy spec files into `docs/specs/` and update references.

### Out of Scope
- Product feature work in `src/`
- Backend/NestJS implementation
- Rewriting the legacy specs' business content

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- None

## Approach

- Preserve existing content, relocate first, then normalize naming and navigation.
- Use `glab` for project bootstrap and standard GitLab workflows (`branch`, `mr`, and remote setup).
- Keep docs concise and role-oriented: overview, setup, contribution, GitLab flow.

## Affected Areas

| Area | Impact | Description |
|---|---|---|
| `specsdeprecadosviejos/` | Removed/Moved | Legacy docs relocated into `docs/specs/` |
| `docs/` | New | New docs hierarchy and guides |
| `README.md` | New | Project entrypoint |
| `CONTRIBUTING.md` | New | Contribution rules |
| `.gitignore` | New | Ignore Node/Vite outputs |

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Broken links after moving docs | Medium | Update references in one pass; keep redirects if needed |
| GitLab bootstrap blocked by auth/namespace | Medium | Confirm GitLab URL, project path, and token up front |
| Docs drift from code reality | Medium | Base setup docs on detected stack and keep them short |

## Rollback Plan

- Revert the docs move.
- Restore the legacy folder layout.
- Remove GitLab remote/project config if bootstrap is incomplete.

## Dependencies

- GitLab namespace/project path and authenticated `glab` session.
- Final decision on whether hooks are required beyond standard repo hygiene.

## Success Criteria

- [ ] Repo has a working GitLab remote and initial commit.
- [ ] Docs live under `docs/` with the requested subfolders.
- [ ] Root docs (`README.md`, `CONTRIBUTING.md`) exist and point to the new docs structure.
- [ ] Legacy specs are no longer maintained in a flat root folder.
