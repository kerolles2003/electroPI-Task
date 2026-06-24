---
name: project-architecture
description: Core architecture decisions, module boundaries, and established patterns for electro-PI NestJS backend
metadata:
  type: project
---

Monorepo: NestJS backend at apps/backend, Next.js frontend at apps/frontend.

**Architecture decisions in use:**
- Repository pattern: UserRepository (apps/backend/src/modules/auth/repositories/) wraps all Prisma User table access. Each future module is expected to have its own repository subfolder.
- Mapper pattern: UserMapper (apps/backend/src/modules/auth/mappers/) provides static toProfile() — maps Prisma entity to safe Response DTO.
- Exception hierarchy: AuthUnauthorizedException base -> InvalidCredentialsException, InvalidRefreshTokenException; EmailAlreadyRegisteredException extends ConflictException.
- Provider abstraction scaffolded: MailProvider, StorageProvider, PaymentProvider interfaces exist under src/providers/{mail,storage,payment}/interfaces/ with INJECTION_TOKEN constants defined. Implementations are empty skeletons.
- JWT via HTTP-only cookies (not Authorization header). Two-strategy approach: JwtAccessStrategy + JwtRefreshStrategy, both in auth/strategies/.
- ConfigService used throughout — process.env is only touched in configuration.ts and main.ts (latter is a bug).
- Global PrismaModule (@Global) exports PrismaService everywhere.
- AllExceptionsFilter is global, registered in main.ts without DI (instantiated directly — known limitation).
- @Public() decorator declared but no guard reads it yet.

**Phase state:** Auth module is fully implemented. All other modules (users, cart, categories, products, orders, payments, dashboard) and all providers are empty skeletons.

**Why:** Project is in early build phase (Phase 1/Phase 3 described in comments). Skeleton modules registered in AppModule but contain zero business logic.

**How to apply:** When reviewing future phases, expect repositories, mappers, DTOs, exceptions, constants subfolders in each module matching the auth module pattern.
