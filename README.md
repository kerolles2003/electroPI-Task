# electro-PI

Online ordering platform — monorepo (NestJS backend + Next.js frontend).

> **Phase 1.5 — Bootstrap & Infrastructure.** This repository currently contains
> only **bootable foundations**: no controllers, services, DTOs, guards,
> repositories, endpoints, auth, or database queries. Feature modules and
> frontend feature folders are intentionally empty placeholders.

## Structure

```
electro-PI/
├── apps/
│   ├── backend/                 # NestJS + Prisma
│   │   ├── prisma/
│   │   │   ├── schema.prisma     # Frozen Phase 1 domain model
│   │   │   └── seed.ts           # Placeholder seed (no writes yet)
│   │   ├── src/
│   │   │   ├── common/
│   │   │   │   ├── filters/all-exceptions.filter.ts   # Global exception filter (placeholder)
│   │   │   │   └── logger/app-logger.service.ts        # Logger placeholder
│   │   │   ├── config/
│   │   │   │   ├── configuration.ts                    # Typed config loader
│   │   │   │   └── env.validation.ts                   # Env validation (fail-fast)
│   │   │   ├── prisma/
│   │   │   │   ├── prisma.module.ts                    # Global Prisma module
│   │   │   │   └── prisma.service.ts                   # Connection lifecycle only
│   │   │   ├── modules/          # Empty feature module placeholders
│   │   │   │   ├── auth/ users/ products/ categories/
│   │   │   │   └── cart/ orders/ payments/
│   │   │   ├── app.module.ts
│   │   │   └── main.ts           # Bootstrap + ValidationPipe + Swagger
│   │   ├── Dockerfile
│   │   ├── nest-cli.json
│   │   ├── tsconfig*.json
│   │   └── .env.example
│   └── frontend/                 # Next.js + TS + Tailwind + shadcn/ui + next-intl
│       ├── messages/{en,ar}.json
│       ├── src/
│       │   ├── app/[locale]/{layout,page}.tsx
│       │   ├── app/globals.css
│       │   ├── components/ui/ features/ hooks/ lib/ stores/   # Placeholders
│       │   ├── i18n.ts middleware.ts lib/utils.ts
│       ├── Dockerfile
│       ├── tailwind.config.ts  components.json
│       ├── next.config.mjs  tsconfig.json
│       └── .env.example
├── .github/workflows/ci.yml      # CI skeleton (build both apps)
├── docker-compose.yml            # postgres + backend + frontend
└── package.json                  # npm workspaces
```

## Prerequisites

- Node.js 20+
- npm 9+
- Docker (optional, for Postgres / full stack)

## Setup

### 1. Environment files

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
```

### 2. Install dependencies

```bash
npm install            # installs all workspaces from the repo root
```

### 3. Database (Docker)

```bash
docker compose up -d postgres
```

### 4. Prisma client + schema

```bash
cd apps/backend
npm run prisma:generate          # generate the typed client
npm run prisma:migrate           # create the initial migration (requires DB running)
```

### 5. Run in development

```bash
# from the repo root
npm run dev:backend              # http://localhost:3001  (Swagger: /docs)
npm run dev:frontend             # http://localhost:3000  (redirects to /en)
```

## Full stack via Docker

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend:  http://localhost:3001 (Swagger at `/docs`)
- Postgres: localhost:5432

## Localization

- Locales: `en` (LTR) and `ar` (RTL), routed under `/[locale]` via `next-intl`.
- `/` redirects to the default locale (`/en`). RTL/LTR is applied on `<html dir>`.

## Notes

- `PrismaService` manages the connection lifecycle only — it holds no business
  logic or queries.
- Auth and provider secrets in `.env.example` are placeholders; their features
  are implemented in later phases.
