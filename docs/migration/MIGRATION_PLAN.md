# Zafirus — Migration Plan: React → Angular

## Overview

This document describes the migration from the existing React/Vite/Zustand demo to an Angular + Tailwind frontend app.

## Company Target Stack

| Layer     | Technology         | Status         |
|-----------|--------------------|----------------|
| Frontend  | Angular + Tailwind | ✅ Phase A–D   |
| Backend   | NestJS             | ⏳ Next phase  |
| ORM       | TypeORM            | ⏳ Next phase  |

## Repository Structure

```
zafirus-rh/
├── src/                    # React source (untouched, read-only reference)
├── apps/
│   └── web-angular/        # Angular frontend (standalone components + Tailwind)
├── docs/
│   └── migration/          # Migration documentation
└── package.json            # React root build
```

## Migration Phases

### Phase A — Clean Angular scaffold ✅
- Angular 19 standalone + Tailwind CSS setup
- Zafirus visual shell (sidebar, topbar, logo)
- Spanish UI copy
- Real Zafirus SVG logo

### Phase B — RRHH mock frontend ✅
- Onboarding case CRUD with Angular signals
- CaseList, CaseDetail, CaseActions, NewCaseModal
- All 5 tabs: Resumen, Datos, Email, Tareas, Auditoría
- Mock service with full state management

### Phase C — Candidate flow ✅
- Candidate wizard (4 steps)
- CandidatePanel with state-aware views
- Data flows back to RRHH DataTab
- Audit events appended

### Phase D — EmailTab ✅
- Full editable email body with contenteditable
- Variable pills (data-variable spans)
- Internal variable sidebar with groups
- Edit/Preview modes
- Dynamic Zafirus signature
- Approval workflow with change tracking
- Security considerations documented

### Phase E — Backend (NOT in this run)
- NestJS API
- TypeORM entities
- Real auth, real file uploads

## Stack Decisions

- **No NgRx**: State managed via Angular signals/computed in a single injectable service
- **No Angular Material**: All UI built with Tailwind CSS
- **No external component library**: Custom components only
- **No backend**: Frontend-only mock for this phase

## Build Commands

```bash
cd apps/web-angular
npm install
npm run build       # or: npx ng build
npx ng serve        # dev server
```

## Phase 2 — NestJS + TypeORM Backend ✅

Created `apps/api-nest/` with:

- NestJS 10 + TypeORM + PostgreSQL
- 6 entities: Employee, OnboardingCase, CandidateSubmission, EmailTemplate, OnboardingTask, AuditEvent
- Full REST API for case lifecycle
- DTO validation with class-validator
- Audit logging with sensitive data redaction
- Seed endpoint (`POST /api/dev/seed`)
- CORS for Angular/React local dev
- No auth, no Google APIs, no file storage

See `BACKEND_PHASE_2.md` and `API_CONTRACT.md` for details.
