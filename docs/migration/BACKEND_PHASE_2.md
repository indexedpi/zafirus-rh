# Phase 2 — NestJS + TypeORM Backend Scaffold

## Overview

This phase creates the backend API for the Zafirus RRHH onboarding system,
modeling the same domain as the Angular mock service but with persistent storage.

## Stack

| Component     | Technology              |
|---------------|-------------------------|
| Framework     | NestJS 10               |
| ORM           | TypeORM                 |
| Database      | PostgreSQL              |
| Validation    | class-validator         |
| Config        | @nestjs/config          |

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ (or use Docker)

### Quick Start

```bash
# 1. Start PostgreSQL (optional — use docker-compose)
cd apps/api-nest
docker-compose up -d

# 2. Configure environment
cp .env.example .env
# Edit .env if needed

# 3. Install dependencies
npm install

# 4. Build
npm run build

# 5. Run in dev mode
npm run start:dev

# 6. Seed demo data
curl -X POST http://localhost:3000/api/dev/seed
```

### Environment Variables

| Variable          | Default     | Description                     |
|-------------------|-------------|---------------------------------|
| PORT              | 3000        | HTTP port                       |
| DATABASE_HOST     | localhost   | PostgreSQL host                 |
| DATABASE_PORT     | 5432        | PostgreSQL port                 |
| DATABASE_USER     | postgres    | Database user                   |
| DATABASE_PASSWORD | postgres    | Database password               |
| DATABASE_NAME     | zafirus_rh  | Database name                   |
| DATABASE_SSL      | false       | Enable SSL                      |
| NODE_ENV          | development | Environment                     |
| TYPEORM_SYNC      | false       | Auto-sync schema (dev only!)    |

## Modules

| Module                | Entity              | Description                       |
|-----------------------|---------------------|-----------------------------------|
| employees             | Employee            | Core employee directory           |
| cases                 | OnboardingCase      | Onboarding lifecycle              |
| candidate-submissions | CandidateSubmission | Candidate-declared data           |
| email-templates       | EmailTemplate       | Welcome email management          |
| tasks                 | OnboardingTask      | Activation task tracking          |
| audit                 | AuditEvent          | Immutable event log               |
| database              | —                   | TypeORM config + seed             |

## Entities

### Employee
UUID PK, firstName, lastName, personalEmail, corporateEmail, documentId,
role, area, location, startDate, managerName, taxIdValue, bankAccount.

### OnboardingCase
UUID PK, employee FK, status (enum), candidateToken, blockReason,
cancelReason, candidateSubmittedAt, dataConsolidatedAt, approvedAt, activatedAt.

### CandidateSubmission
UUID PK, case FK, taxIdType, taxIdValue, paymentMethod, bankAccount,
walletAddress, internationalBankData (jsonb), references (jsonb),
documents (jsonb), rawPayload (jsonb), submittedAt.

### EmailTemplate
UUID PK, case FK, subject, bodyHtml (text), variables (jsonb),
signature (jsonb), approved, changedAfterApproval, approvedAt.

### OnboardingTask
UUID PK, case FK, type (enum), label, status (enum), output (jsonb),
attempts, startedAt, completedAt, failedAt.

### AuditEvent
UUID PK, case FK, actorType (enum), actorName, action, category,
details (jsonb), createdAt.

## Status Mapping: Angular ↔ Backend

| Angular Mock             | Backend Enum              | Notes                    |
|--------------------------|---------------------------|--------------------------|
| draft                    | draft                     | Same                     |
| candidate_invited        | candidate_invited         | Same                     |
| candidate_submitted      | candidate_submitted       | Same                     |
| hr_review                | hr_review                 | Same                     |
| ready_to_activate        | ready_to_activate         | Same                     |
| active_pending_automation| activating                | Renamed for clarity      |
| operative                | operative                 | Same                     |
| blocked                  | blocked                   | Same                     |
| cancelled                | cancelled                 | Same                     |

## Database Schema Management

**synchronize is always false by default.**

For local development, you may temporarily set `TYPEORM_SYNC=true` in `.env`,
but **never** use synchronize in staging or production.

For production: use TypeORM migrations.

```bash
# Generate a migration from entity changes
npx typeorm migration:generate -d src/database/data-source.ts src/database/migrations/YourMigration

# Run pending migrations
npx typeorm migration:run -d src/database/data-source.ts
```

## What Is Mock-Only

- Task creation on activation — creates DB rows but does not call Google APIs
- Seed data — creates demo employees/cases via `POST /api/dev/seed`
- No real email sending
- No file storage
- No authentication/authorization

## What Is Intentionally Not Implemented

- Authentication (Passport, JWT, OAuth) — Phase 3
- Google Workspace integration — Phase 4
- Gmail sending — Phase 4
- File upload/storage — Phase 3–4
- Real task execution engine — Phase 4
- WebSocket/SSE for live updates — Future
- Rate limiting — Production hardening
- Swagger/OpenAPI docs — Optional enhancement
