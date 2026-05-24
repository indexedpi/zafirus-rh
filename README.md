# Zafirus Onboarding System

Internal onboarding platform for Zafirus Technologies.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Angular + Tailwind CSS |
| Backend | NestJS |
| ORM | TypeORM |
| Database | PostgreSQL |

## Monorepo structure

```
apps/
├── web-angular/     # Angular frontend
└── api-nest/        # NestJS backend API
docs/
├── migration/       # React → Angular migration reference
├── PRODUCT.md       # Product purpose, users, design principles
└── GOOGLE_WORKSPACE_INTEGRATION_PLAN.md  # Phase 8 integration spec
```

## Setup

### Frontend

```bash
cd apps/web-angular
npm install
npm run start       # development server
npm run build       # production build
```

### Backend

```bash
cd apps/api-nest
npm install
npm run start:dev   # development with watch
npm run build       # production build
```

## Environment

Copy `.env.example` to `.env` in each app and fill in the required values. Never commit `.env` files with real credentials.

## Status

Angular and NestJS migration from React/Vite demo. Frontend works with mock state. Backend builds independently. Not yet wired end-to-end or production-deployed.

## Legacy reference

The React/Vite implementation is preserved on the `legacy/react-demo` branch for reference.
