# electro-PI — Phase 0: Planning

**Status:** Planning only · No code, schemas, or structures generated · Markdown output only

---

## 0. Project Understanding

electro-PI is an **online food/menu ordering platform** with two audiences:

- **Customers** browse a menu, build a cart, check out, pay (online or cash on delivery), and track their order.
- **Admins** manage products and monitor incoming orders.

The system is **bilingual (Arabic / English)** with full RTL/LTR support, and supports **two payment methods** (online gateway + cash on delivery).

This document defines *what* will be built. It deliberately makes **no** implementation decisions about files, schemas, or folder layout — those belong to later phases.

---

## 1. Feature Definitions

### 1.1 Customer Features

| Feature | Definition | In scope |
|---|---|---|
| **Authentication** | Customer can register, log in, log out, and maintain an authenticated session. Identity is required to place and track orders. | ✅ |
| **Browse Menu** | Customer views the list of available products, organized by category, with name, description, price, image, and availability — in their selected language. | ✅ |
| **Cart** | Customer adds/removes products, changes quantities, and views a running subtotal. Cart persists for the session. | ✅ |
| **Checkout** | Customer confirms cart contents, provides delivery details, selects a payment method (online or COD), and submits the order. | ✅ |
| **Order Tracking** | Customer views the current status of their placed orders and a history of past orders. | ✅ |

### 1.2 Admin Features

| Feature | Definition | In scope |
|---|---|---|
| **Product Management** | Admin creates, edits, deactivates, and removes products (including bilingual name/description, price, category, image, availability). | ✅ |
| **Order Monitoring** | Admin views incoming and historical orders and advances their status through the order lifecycle. | ✅ |

### 1.3 Cross-Cutting Features

| Feature | Definition | In scope |
|---|---|---|
| **Localization (AR / EN)** | All customer-facing and admin-facing UI text is translatable; layout adapts to RTL (Arabic) and LTR (English). Product content is stored bilingually. | ✅ |
| **Online Payment** | Customer pays at checkout through an external payment provider. | ✅ |
| **Cash on Delivery** | Customer chooses to pay in cash upon delivery; order is accepted without upfront payment. | ✅ |

> **Out of scope (not requested):** loyalty/points, coupons/discounts, ratings/reviews, delivery-driver assignment, multi-restaurant/vendor support, real-time chat. These are explicitly **not** part of this project unless a later phase requires them.

---

## 2. Backend Modules

Modules are conceptual boundaries only (no code, no structure implied here).

| Module | Responsibility |
|---|---|
| **Auth** | Registration, login, session/token issuance, role-based access control. |
| **Users** | Customer and admin account profiles. |
| **Products** | Product records; bilingual content; price, image, availability. |
| **Categories** | Product categories used to organize the menu. |
| **Cart** | Cart contents and quantity management prior to checkout. |
| **Orders** | Order creation, lifecycle/status transitions, order history. |
| **Payments** | Payment-method handling, online-gateway integration, payment status reconciliation. |
| **Localization** | Language handling and bilingual content support across modules. |

> Modules map to the required features only. Each follows the **provider pattern** where an external dependency exists (notably Payments and Storage), so concrete providers can be swapped without touching business logic.

---

## 3. Frontend Pages

### 3.1 Customer-Facing

| Page | Purpose |
|---|---|
| **Home / Menu** | Browse products by category. |
| **Product Details** | View a single product's full details. |
| **Cart** | Review and adjust cart items. |
| **Checkout** | Enter delivery details, choose payment method, confirm order. |
| **Payment Success** | Confirmation outcome after a successful online payment. |
| **Payment Failed** | Failure outcome after an unsuccessful online payment. |
| **Order Tracking** | View live status of a specific order. |
| **Order History** | List of the customer's past orders. |
| **Login** | Authenticate an existing customer. |
| **Register** | Create a customer account. |

### 3.2 Admin-Facing

| Page | Purpose |
|---|---|
| **Admin Login** | Authenticate an admin. |
| **Dashboard** | Overview of orders at a glance. |
| **Products List** | View/search all products. |
| **Product Create** | Create a new product (bilingual fields). |
| **Product Edit** | Edit an existing product (bilingual fields). |
| **Orders List** | Monitor all incoming/historical orders. |
| **Order Detail** | Inspect one order and update its status. |
| **Analytics Overview** | High-level overview metrics for the store. |

### 3.3 Cross-Cutting UI

- **Language switcher** (AR ⇄ EN) available globally, with RTL/LTR layout switching via **next-intl**.

---

## 4. User Roles

| Role | Description | Capabilities |
|---|---|---|
| **Guest** | Unauthenticated visitor. | Browse menu, build a cart. Must authenticate before checkout. |
| **Customer** | Authenticated end user. | Everything a guest can do, plus checkout, pay, and track/view own orders. |
| **Admin** | Operator/staff. | Manage products; monitor and update all orders. |

> Two authenticated roles (**Customer**, **Admin**) drive role-based access control. **Guest** is a pre-authentication state, not a stored role. No finer-grained roles (e.g. super-admin, kitchen, courier) are introduced — none were requested.

---

## 5. Order Statuses

Single linear lifecycle with explicit terminal states:

| Status | Meaning |
|---|---|
| **PENDING** | Order submitted; awaiting confirmation. For online payment, awaiting successful payment. |
| **CONFIRMED** | Order accepted by the restaurant (payment captured for online, or COD accepted). |
| **PREPARING** | Order is being prepared. |
| **OUT_FOR_DELIVERY** | Order has left for delivery. |
| **DELIVERED** | Order successfully delivered (terminal). |
| **CANCELLED** | Order cancelled before delivery (terminal). |

**Typical flow:** `PENDING → CONFIRMED → PREPARING → OUT_FOR_DELIVERY → DELIVERED`
**Cancellation:** any non-terminal status → `CANCELLED`.

### 5.1 Payment Status (separate from order status)

Order status and payment state are tracked independently so COD and online flows share one order lifecycle:

| Payment Status | Meaning |
|---|---|
| **UNPAID** | No payment captured (default for COD until delivery). |
| **PENDING** | Online payment initiated, awaiting provider confirmation. |
| **PAID** | Payment captured. |
| **FAILED** | Online payment attempt failed. |
| **REFUNDED** | Payment returned after capture. |

---

## 6. External Providers

Each external dependency is accessed through the **provider pattern** (an abstraction with swappable implementations), so vendors can change without touching business logic.

| Provider type | Role | Notes for later phases |
|---|---|---|
| **Payment Gateway** | Process online card/wallet payments at checkout. | Active implementation: **StripeProvider**. Must support payment initiation + status confirmation. |
| **Cash on Delivery** | "Provider" implementation that requires no external call — fulfills the same payment abstraction so checkout treats both methods uniformly. | Active implementation: **CashOnDeliveryProvider** (internal; no third party). |
| **File / Image Storage** | Store and serve product images. | Active implementation: **CloudinaryProvider**. |
| **Mail** | Send transactional emails to customers. | Active implementation: **ResendProvider**. |

> Active provider implementations: payment = **StripeProvider** + **CashOnDeliveryProvider**, storage = **CloudinaryProvider**, mail = **ResendProvider**. All are accessed behind their respective provider abstractions.

---

## 7. Architecture Decisions

| Decision | Choice | Rationale |
|---|---|---|
| **Backend framework** | NestJS | Modular by design; aligns with feature-based module boundaries and dependency injection for the provider pattern. |
| **ORM / DB** | Prisma + PostgreSQL | Relational data (users, products, orders) with strong typing and migrations. |
| **Auth** | JWT via HTTP-only cookies (access + refresh tokens) | Access/refresh token pair stored in HTTP-only cookies; role-based access control for Customer vs. Admin. |
| **API docs** | Swagger | Self-documenting contract for the backend API consumed by the frontend. |
| **Application style** | Separate backend (NestJS) + frontend (Next.js) | NestJS exposes the API; Next.js is the client application. |
| **Frontend framework** | Next.js + TypeScript | Typed React framework for the customer and admin applications. |
| **Styling / UI** | TailwindCSS + shadcn/ui | Utility-first styling with an accessible component system; eases RTL/LTR theming. |
| **Server state** | TanStack Query | Caching and synchronization of menu/order data from the API. |
| **Client state** | Zustand (cart only) | Lightweight local state, scoped to the cart. |
| **Forms / validation** | React Hook Form + Zod | Typed, schema-validated forms shared across checkout, auth, and product create/edit. |
| **Localization** | next-intl (AR / EN) | Internationalized routing/content with RTL/LTR layout support. |
| **Provider pattern** | Applied to Payments, Storage, and Mail | Decouples external vendors; satisfies SOLID (Dependency Inversion) and keeps swaps low-cost. |
| **Storage provider** | Active implementation: **CloudinaryProvider** | Hosted image storage/delivery for product images, behind the storage abstraction. |
| **Payment providers** | Active implementations: **StripeProvider**, **CashOnDeliveryProvider** | Both fulfill the same payment abstraction so checkout handles online and COD uniformly. |
| **Mail provider** | Active implementation: **ResendProvider** | Transactional email behind the mail abstraction. |
| **Roles** | Two persisted roles: **CUSTOMER**, **ADMIN** | **Guest** is a temporary unauthenticated state and is **not** persisted. |
| **Architecture style** | Modular, feature-based | Each feature owns its module/pages; reduces coupling and improves maintainability. |
| **Infrastructure** | Docker + GitHub Actions | Reproducible environments and CI from the start. |
| **Payment abstraction** | Treat COD as a payment provider variant | Lets checkout handle both methods through one uniform flow, avoiding branching business logic. |
| **Bilingual data model approach** | Store product name/description per language | Required for true AR/EN content (not just UI translation); concrete shape deferred to schema phase. |

---

## Phase 0 Boundaries (explicitly honored)

- ❌ No code, folder structures, DTOs, entities, NestJS files, controllers, services, or Prisma schema generated.
- ✅ Planning artifacts only: features, modules, pages, roles, order statuses, providers, and architecture rationale.

---

## Resolved Decisions

Previously open questions, now decided for this prototype:

1. **Payment provider** — Active implementation is **MockPaymentProvider**. Real gateways are deferred to future phases.
2. **Guest cart** — The guest cart **persists after login** (it is merged into the authenticated customer's cart).
3. **Admin registration** — Admins are **seeded manually**. Admin self-registration is **not allowed**.

---

# Phase 1 Boundaries

Phase 1 will focus exclusively on:

* ERD
* Entities
* Relationships
* Enums
* Prisma Schema
* Seed Strategy

Forbidden during Phase 1:

* NestJS files
* Controllers
* Services
* DTOs
* Folder structure
* Package installation
* Business logic
