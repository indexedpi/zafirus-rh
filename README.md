# Zafirus Onboarding System

Plataforma interna de Zafirus Technologies para automatizar el proceso de onboarding de colaboradores.

## Stack

- React 19 + TypeScript
- Vite 7 + vite-plugin-singlefile
- Tailwind CSS v4
- Zustand
- Lucide React
- Supabase (optional — realtime persistence)

## Setup

```bash
npm install
npm run dev       # development server
npm run build     # production build (single-file HTML)
```

## Demo mode

Append `#demo` to the URL to unlock the split-screen, Auto Demo runner, and Reset controls.
See [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md) for the full walkthrough including Supabase local setup and candidate token routing.

## Protected files

`src/store.ts` and `src/types.ts` are immutable state and product contracts — do not modify.

## Documentation

| File | Contents |
|---|---|
| [DESIGN.md](DESIGN.md) | Visual constitution — color tokens, typography, motion, accessibility rules |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Workflow, conventions, merge request process |
| [docs/PHASE_PLAN.md](docs/PHASE_PLAN.md) | Phase history (7A–7H complete) and Phase 8 scope |
| [docs/PRODUCT.md](docs/PRODUCT.md) | Product purpose, users, design principles |
| [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md) | End-to-end demo walkthrough |
| [docs/QA_CHECKLIST.md](docs/QA_CHECKLIST.md) | QA checklist per phase |
| [docs/UI_AUDIT.md](docs/UI_AUDIT.md) | Known issues and audit findings per phase |
| [docs/GOOGLE_WORKSPACE_INTEGRATION_PLAN.md](docs/GOOGLE_WORKSPACE_INTEGRATION_PLAN.md) | Phase 8 backend integration plan |
| [docs/specs/](docs/specs/) | Phase 2 architecture specs (NestJS backend, future) |
| [docs/guides/](docs/guides/) | Development setup and GitLab workflow guides |

## Status

Phase 7H complete. Phase 8 (Google Workspace Integration) is next.
