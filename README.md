<div align="center">

# electro-PI · FoodHub

**A full-stack, bilingual food-delivery platform.**

Browse a categorised menu, build a cart, check out, and track orders — with a
production-grade NestJS API and a polished, RTL-aware Next.js storefront.

[Architecture](#architecture) · [Features](#features) · [Quick start](#quick-start) · [API](#api) · [Project layout](#project-layout)

</div>

---

## Overview

**electro-PI** is a TypeScript monorepo that delivers an end-to-end online
ordering experience. The backend is a modular NestJS + Prisma API built around
clean separation of concerns (controllers → services → repositories) and
pluggable providers for mail, payments, and storage. The frontend — branded
**FoodHub** — is a Next.js App Router storefront with a first-class Arabic (RTL)
and English (LTR) experience.

| | |
|---|---|
| **Backend** | NestJS 10 · Prisma 5 · PostgreSQL 16 · JWT auth · Swagger |
| **Frontend** | Next.js 14 · React 18 · Tailwind CSS · shadcn/ui · next-intl · TanStack Query · Zustand |
| **Tooling** | npm workspaces · Docker Compose · TypeScript 5 · GitHub Actions CI |

## Features

### Customer storefront
- 🍽️ **Menu & discovery** — categorised product browsing, product detail pages, and a sidebar cart with quantity controls.
- 🛒 **Cart & checkout** — persistent cart with a guided, step-style checkout flow.
- 📦 **Orders** — order placement and status tracking.
- 🌐 **Bilingual, RTL-first** — English (LTR) and Arabic (RTL) as equal first-class experiences via `next-intl`, routed under `/[locale]`.
- 🎨 **Premium brand identity** — the "Late-Night Brasserie" design system (amber accent, Fraunces / DM Sans / Cairo type).

### Admin dashboard
- 📊 **Analytics dashboard** — sales and operational metrics.
- 🗂️ **Product management** — create, update, and manage catalogue items with image uploads.
- 🧾 **Order management** — review and advance customer orders.

### Platform & security
- 🔐 **Authentication** — JWT access/refresh tokens (HTTP-only cookies), registration, login, and role-based access control.
- ✉️ **Email verification & password reset** — token-based flows with templated emails.
- 🪪 **Session management** — list active sessions and revoke individually or all at once.
- 📝 **Audit log** — security-relevant actions are recorded.
- 🔌 **Pluggable providers** — swap implementations via environment config:
  - **Mail:** Resend · Brevo · local (console)
  - **Payments:** Stripe (online) · Cash on Delivery
  - **Storage:** Cloudinary · local
- 🛡️ **Hardening** — Helmet, rate limiting (`@nestjs/throttler`), global validation pipe, and a global exception filter.

## Architecture

```
electro-PI/
├── apps/
│   ├── backend/          NestJS API (Prisma, providers, modular features)
│   └── frontend/         Next.js storefront + admin (App Router, i18n)
├── packages/
│   └── shared-types/     Types shared between backend and frontend
├── .github/workflows/    CI (builds both apps)
└── docker-compose.yml     Postgres + backend + frontend
```

The backend follows a consistent module shape — each feature
(`auth`, `users`, `products`, `categories`, `cart`, `orders`, `payments`,
`dashboard`) is organised into `controllers`, `services`, `repositories`, `dto`,
`entities`, `mappers`, and `exceptions`. Cross-cutting providers (mail, payment,
storage) live under `src/providers` behind interfaces so concrete vendors can be
swapped without touching business logic.

## Tech stack

**Backend** — NestJS 10, Prisma 5, PostgreSQL 16, Passport/JWT, class-validator,
bcrypt, Helmet, `@nestjs/throttler`, `@nestjs/swagger`.

**Frontend** — Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS,
shadcn/ui (Radix), next-intl, TanStack Query, Zustand, React Hook Form, Zod.

## Prerequisites

- **Node.js** 20+
- **npm** 9+
- **Docker** (recommended, for PostgreSQL and full-stack runs)

## Quick start

### 1. Clone & install

```bash
git clone <repository-url>
cd electro-PI
npm install            # installs all workspaces from the repo root
```

### 2. Configure environment

```bash
cp apps/backend/.env.example  apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
```

Then edit `apps/backend/.env`. At minimum, set:

- `DATABASE_URL` — e.g. `postgresql://electro:electro@localhost:5433/electro_pi`
- `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` — **required** (boot fails if unset). Generate with `openssl rand -hex 64`.

Provider credentials (Stripe, Cloudinary, Resend/Brevo) are optional in
development; `MAIL_PROVIDER` defaults to `local` and logs emails to the console.

### 3. Start PostgreSQL

```bash
docker compose up -d postgres   # host port 5433 → container 5432
```

### 4. Set up the database

```bash
cd apps/backend
npm run prisma:generate         # generate the typed Prisma client
npm run prisma:migrate          # apply migrations (DB must be running)
npm run db:seed                 # seed categories and products
```

### 5. Run in development

```bash
# from the repo root
npm run dev:backend             # http://localhost:3001  (Swagger at /docs)
npm run dev:frontend            # http://localhost:3000  (redirects to /en)
```

## Full stack with Docker

Build and run Postgres, backend, and frontend together:

```bash
docker compose up --build
```

| Service   | URL                                            |
|-----------|------------------------------------------------|
| Frontend  | http://localhost:3000                          |
| Backend   | http://localhost:3001 · Swagger at `/docs`     |
| Postgres  | localhost:5433                                 |

> When running inside the Docker network, the backend reaches the database at
> `postgres:5432`; from the host machine, use `localhost:5433`.

## API

Interactive OpenAPI docs are served at **`http://localhost:3001/docs`** when the
backend is running. Routes are grouped by feature:

| Prefix             | Responsibility                                   |
|--------------------|--------------------------------------------------|
| `auth`             | Register, login, refresh, logout, email verification, password reset, sessions |
| `users`            | User profiles                                    |
| `products`         | Catalogue browsing & management                  |
| `categories`       | Category browsing & management                   |
| `cart`             | Cart and line items                              |
| `orders`           | Order placement & tracking                       |
| `payments`         | Payment intents & webhooks                       |
| `admin/orders`     | Admin order management                           |
| `admin/dashboard`  | Analytics & metrics                              |

## Localization

- Locales: **`en`** (LTR) and **`ar`** (RTL), routed under `/[locale]` via `next-intl`.
- `/` redirects to the default locale (`/en`); direction is applied on `<html dir>`.
- Arabic is treated as a first-class experience — Cairo replaces the display
  serif in RTL, with logical CSS properties throughout.

## Project layout

```
apps/backend/
├── prisma/
│   ├── schema.prisma     # Domain model (User, Session, Product, Order, Payment, …)
│   └── seed.ts           # Categories & products
├── src/
│   ├── common/           # Filters, guards, decorators, pipes, DTOs, logger
│   ├── config/           # Typed config loader + fail-fast env validation
│   ├── prisma/           # Global Prisma module & connection lifecycle
│   ├── providers/        # mail / payment / storage (interface-driven)
│   ├── modules/          # auth, users, products, categories, cart, orders, payments, dashboard
│   └── main.ts           # Bootstrap, ValidationPipe, Helmet, Swagger

apps/frontend/
├── messages/{en,ar}.json # Translations
├── src/
│   ├── app/[locale]/     # auth, products, cart, checkout, orders, admin
│   ├── components/       # ui (shadcn) + feature components
│   ├── stores/           # Zustand stores (cart)
│   ├── lib/ hooks/       # Utilities and shared hooks
│   └── i18n.ts middleware.ts
```

## Scripts

Run from the repository root:

| Command                  | Description                          |
|--------------------------|--------------------------------------|
| `npm run dev:backend`    | Start the NestJS API in watch mode   |
| `npm run dev:frontend`   | Start the Next.js dev server         |
| `npm run build:backend`  | Build the backend                    |
| `npm run build:frontend` | Build the frontend                   |
| `npm run build`          | Build all workspaces                 |

Backend workspace (`apps/backend`): `prisma:generate`, `prisma:migrate`, `db:seed`.

## License

Private and unlicensed. All rights reserved.
