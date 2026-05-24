# Zafirus RH — Development Handoff

## Repository

```
https://github.com/indexedpi/zafirus-rh
Branch: migration/angular-clean-v1
```

## Project Structure

```
zafirus-rh/
├── src/                          # React demo (untouched, read-only reference)
├── apps/
│   ├── web-angular/              # Angular 19 frontend (Phase 1)
│   └── api-nest/                 # NestJS backend (Phase 2)
├── docs/
│   └── migration/
│       ├── MIGRATION_PLAN.md     # Overall migration roadmap
│       ├── REACT_TO_ANGULAR_MAP.md
│       ├── UI_REFERENCE.md
│       ├── QA_PARITY_CHECKLIST.md
│       ├── API_CONTRACT.md       # REST endpoint reference
│       ├── BACKEND_PHASE_2.md    # Backend setup & architecture
│       └── HANDOFF.md            # This file
└── package.json                  # React root (Vite)
```

## Running Each App

### React Demo (reference only)
```bash
cd zafirus-rh
npm install
npm run dev              # http://localhost:5173
```

### Angular Frontend
```bash
cd apps/web-angular
npm install
npx ng serve             # http://localhost:4200
```

### NestJS Backend
```bash
cd apps/api-nest
docker-compose up -d     # Start PostgreSQL (optional)
cp .env.example .env     # Configure env
npm install
npm run start:dev        # http://localhost:3000/api

# Seed demo data
curl -X POST http://localhost:3000/api/dev/seed
```

## Build Commands

```bash
# React
cd zafirus-rh && npm run build

# Angular
cd apps/web-angular && npm run build

# NestJS
cd apps/api-nest && npm run build
```

## Current State (Phase 2 Complete)

### ✅ Done
- Angular frontend with full RRHH onboarding UI
- Angular candidate flow (4-step wizard)
- Angular EmailTab (editor + variable sidebar + preview)
- NestJS API with TypeORM entities
- PostgreSQL schema (6 entities)
- REST endpoints for full case lifecycle
- DTO validation with class-validator
- Audit event logging with sensitive data redaction
- Seed/demo data endpoint
- CORS configured for local dev

### ⏳ Next Phases
| Phase | Scope                                    |
|-------|------------------------------------------|
| 3     | Auth (JWT/OAuth), file uploads           |
| 4     | Google Workspace integration, real tasks  |
| 5     | Angular ↔ NestJS integration (HTTP)      |
| 6     | Production deployment, migrations        |

### ❌ Intentionally Not Done
- No authentication
- No Google API calls
- No real email sending
- No file storage
- No WebSocket/SSE
- No Swagger docs
- No Prisma, no GraphQL

## Key Design Decisions

1. **Angular signals** (not NgRx) for frontend state
2. **TypeORM** (not Prisma) for database access
3. **synchronize: false** by default — migrations required for production
4. **No auth yet** — all endpoints are open
5. **Status enum** uses `activating` instead of Angular's `active_pending_automation`
6. **Audit events** are immutable and redact sensitive data
7. **Candidate submission** is a separate entity from the case
8. **Email template** tracks approval and change-after-approval state

## Important Files

| Purpose                 | Path                                              |
|-------------------------|---------------------------------------------------|
| Angular mock service    | `apps/web-angular/src/app/onboarding/services/onboarding-mock.service.ts` |
| NestJS case service     | `apps/api-nest/src/cases/cases.service.ts`        |
| TypeORM entities        | `apps/api-nest/src/*/**.entity.ts`                |
| Database config         | `apps/api-nest/src/database/database.module.ts`   |
| CLI data source         | `apps/api-nest/src/database/data-source.ts`       |
| Seed service            | `apps/api-nest/src/database/seed.service.ts`      |
| DTOs                    | `apps/api-nest/src/cases/dto/`                    |
| Enums                   | `apps/api-nest/src/common/enums/`                 |
