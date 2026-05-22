## Exploration: gitlab-repo-and-docs-organization

### Current State
- Repo is freshly initialized on `main`; no GitLab remote and no `.gitignore`.
- Top-level app already exists under `src/` with Vite/React/Tailwind tooling and a generated `dist/`.
- Legacy docs live in `specsdeprecadosviejos/` as 9 flat markdown files.
- No `README.md`, `CONTRIBUTING.md`, or `docs/` hierarchy yet.
- Detected stack in `package.json` is React 19.2.6 + Vite 7.3.2 + TypeScript + Tailwind 4.1, which differs from older context notes.

### Affected Areas
- `specsdeprecadosviejos/` — source material to relocate into `docs/specs/`
- `docs/` — new docs hierarchy
- `.gitignore` — ignore dependencies/build output
- `README.md`, `CONTRIBUTING.md` — root docs
- `.git/hooks/` or repo hook config — optional standardization

### Approaches
1. **Migrate legacy docs into `docs/specs/` and add guides**
   - Pros: preserves existing knowledge, minimal rewrite, clear navigation
   - Cons: needs reference cleanup
   - Effort: Medium
2. **Rewrite docs from scratch and keep legacy folder untouched**
   - Pros: clean slate
   - Cons: duplicates content, loses continuity
   - Effort: High

### Recommendation
Migrate the legacy docs into `docs/specs/` and add focused guides/README/CONTRIBUTING. That keeps the current knowledge base authoritative while making the repo easier to onboard and review.

### Risks
- Reference/link breakage after moving files
- GitLab bootstrap blocked by missing namespace/auth details
- Docs drift if setup text doesn’t match the actual stack

### Ready for Proposal
Yes
