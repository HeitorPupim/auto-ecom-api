# AutoEcom Backend - Development Roadmap

## Overview
This document outlines the development roadmap for the AutoEcom backend API built with Fastify, TypeScript, Prisma, and PostgreSQL.

---

## ✅ Completed

- [x] Project setup (Fastify + TypeScript)
- [x] Prisma 7 configuration
- [x] Database schema (User + MercadoLibreAccount)
- [x] PostgreSQL connection

---

## ⚙️ Phase 0: Queue Infrastructure Setup

> **Architecture Decision**: MercadoLibre webhooks must respond in <500ms. We'll use BullMQ + Redis to immediately respond 200 OK, then process webhooks asynchronously.

### Redis Setup (VPS)
- [ ] Install Redis on VPS (same server as PostgreSQL)
  ```bash
  sudo apt update
  sudo apt install redis-server
  sudo systemctl enable redis-server
  sudo systemctl start redis-server
  ```
- [ ] Configure Redis
  - Set password for security
  - Configure persistence (AOF + RDB)
  - Set max memory policy
  - Update `/etc/redis/redis.conf`
- [ ] Test Redis connection from backend
- [ ] Add Redis connection string to `.env`
  ```
  REDIS_URL=redis://localhost:6379
  # or with password: redis://:password@localhost:6379
  ```

### BullMQ Setup
- [x] Install dependencies
  ```bash
  npm install bullmq ioredis
  npm install --save-dev @types/ioredis
  ```
- [x] Create queue infrastructure
  - [x] `src/queues/index.ts` - Queue setup and exports
  - [x] `src/queues/ml-webhook.queue.ts` - ML webhook queue
  - [x] `src/queues/ml-sync.queue.ts` - ML data sync queue
  - [x] `src/queues/tinyerp-sync.queue.ts` - TinyERP sync queue
- [x] Create worker processes
  - [x] `src/workers/ml-webhook.worker.ts` - Process ML webhooks
  - [x] `src/workers/ml-sync.worker.ts` - Sync ML data
  - [x] `src/workers/tinyerp-sync.worker.ts` - Sync TinyERP data
- [x] Add separate worker process script
  - [x] `src/workers/index.ts` - Start all workers
  - [x] Add npm script: `"worker": "tsx src/workers/index.ts"`

### Monitoring (Optional but Recommended)
- [ ] Install Bull Board for job monitoring
  ```bash
  npm install @bull-board/api @bull-board/fastify
  ```
- [ ] Create `/admin/queues` dashboard route
- [ ] Protected with admin auth
- [ ] View job status, failures, retries

---

## 🚀 Phase 1: Core Authentication & User Management

### User Authentication
- [x] Install and configure `bcrypt` for password hashing
- [x] Install and configure `@fastify/jwt` for token-based auth
- [x] Create `/auth/register` endpoint
  - [x] Hash passwords with bcrypt
  - [x] Create user in database
  - [x] Return JWT token
- [x] Create `/auth/login` endpoint
  - [x] Validate credentials
  - [x] Return JWT token
- [x] Create `/auth/me` endpoint (protected)
  - [x] Return current user info
- [x] Implement JWT authentication middleware
- [x] Install and configure `zod` for request validation
- [x] Create Zod schemas for auth endpoints (register, login)
- [x] Add request validation middleware using Zod schemas

### User Management
- [ ] Create `/users/:id` GET endpoint (protected)
- [ ] Create `/users/:id` PUT endpoint (update profile)
- [ ] Create `/users/:id` DELETE endpoint

---

## 🔗 Phase 2: MercadoLibre OAuth Integration

### OAuth Flow
- [x] Research and document ML OAuth flow
- [x] Create ML app credentials (store in `.env`)
- [x] Create `/ml/auth/start` endpoint
  - [x] Generate authorization URL
  - [x] Store state parameter for security
- [x] Create `/ml/auth/callback` endpoint
  - [x] Exchange code for access_token
  - [x] Fetch ML user info (`/users/me`)
  - [x] Store account in `MercadoLibreAccount` table
  - [x] Associate with logged-in user
- [x] Create `/ml/accounts` GET endpoint
  - [x] List user's connected ML accounts
- [x] Create `/ml/accounts/:id` DELETE endpoint
  - [x] Disconnect ML account

### Token Management
- [ ] Create background job to refresh expiring tokens
  - Query accounts where `expiresAt` < 1 hour
  - Refresh tokens using ML API
  - Update database
- [ ] Create manual token refresh endpoint `/ml/accounts/:id/refresh`

---

## 📦 Phase 3: MercadoLibre Data Sync

### Products/Listings
- [ ] Create `/ml/listings` GET endpoint
  - Fetch listings from ML API for connected accounts
- [ ] Create database model for `Listing`
- [ ] Implement sync job to pull listings periodically
- [ ] Create `/ml/listings/:id` GET endpoint (single listing)

### Orders Management (Orders V2)
- [ ] **Database Schema**
  - `Order` model: `id`, `externalId` (ML ID), `totalAmount`, `shippingCost`, `marketplaceFee`, `netAmount`, `status`, `date`, `buyerId`.
  - `OrderItem` model: `sku`, `title`, `quantity`, `unitPrice`, `fullUnitPrice`.
  - Relations: `Order` -> `MercadoLibreAccount`, `Order` -> `OrderItem[]`.

- [ ] **Webhook Handling (`orders_v2`)**
  - [ ] Update `/webhooks/ml` to handle `orders_v2` topic.
  - [ ] Enqueue `ml-sync` job with `resource` ID (Order ID).

- [ ] **Order Processing Worker**
  - [ ] Fetch full order details from `GET /orders/:id`.
  - [ ] Fetch order feedback/payments if needed for precise fee calculation.
  - [ ] Calculate financial breakdown:
    - `total`: Gross amount paid by buyer.
    - `shipping`: Cost of shipping (if paid by seller).
    - `fee`: Marketplace commission (listing fee + taxes).
    - `net`: `total` - `shipping` - `fee`.
  - [ ] Upsert `Order` and `OrderItem`s to database.

- [ ] **API Endpoints**
  - [ ] `GET /orders`: List orders with pagination, sorting, and filters.
    - Filters: `dateRange`, `status`, `accountId`, `channel`.
  - [ ] `GET /orders/:id`: Get single order details with items.


### Webhooks
- [x] Create `/webhooks/ml` POST endpoint
  - [x] **FAST RESPONSE REQUIRED** (<500ms)
  - [x] Validate ML webhook signature
  - [x] Add job to BullMQ queue immediately
  - [x] Return 200 OK (under 100ms total)
- [ ] Implement webhook signature validation
  - Use ML secret key from `.env`
  - Verify `x-signature` header
- [x] Create webhook processor (BullMQ worker)
  - [x] Handle notifications (new order, listing update, etc.)
  - [ ] Fetch full data from ML API
  - [ ] Update database accordingly
  - [x] Retry logic for failures
- [ ] Register webhook URLs with ML API
- [ ] Handle different webhook topics:
  - `orders` - New orders, status changes
  - `items` - Listing updates
  - `questions` - New questions on listings
  - `claims` - Dispute/claim events

---

## 🏢 Phase 4: TinyERP Integration

> **API Documentation:** https://erp.tiny.com.br/public-api/v3/swagger/index.html#/

### OAuth/API Setup
- [x] Research TinyERP API authentication (API Token-based)
- [x] Create database model for `TinyERPAccount`
  - Store API token, account info, isActive status
- [x] Create `/tinyerp/auth/connect` endpoint
  - Validate and store API token
  - Fetch account info from TinyERP
  - Associate with logged-in user
- [x] Create `/tinyerp/accounts` GET endpoint
  - List user's connected TinyERP accounts
- [x] Create `/tinyerp/accounts/:id` DELETE endpoint
  - Disconnect TinyERP account

### Products Sync
- [ ] Create `GET /tinyerp/products` endpoint
  - Fetch products from TinyERP API (`/api/produtos`)
- [ ] Create `POST /tinyerp/products/sync` endpoint
  - Sync products from ML to TinyERP
  - Map ML listing fields to TinyERP product fields
- [x] Implement automatic product sync job

### Orders Sync
- [ ] Create `POST /tinyerp/orders` endpoint
  - Push ML orders to TinyERP (`/api/nota.fiscal.incluir.php`)
  - Create invoices automatically
- [ ] Create `GET /tinyerp/orders/:id` endpoint
  - Fetch order/invoice status from TinyERP
- [ ] Implement automatic order forwarding job

### Inventory Sync
- [ ] Create `GET /tinyerp/inventory` endpoint
  - Fetch stock levels from TinyERP
- [ ] Create `POST /tinyerp/inventory/sync` endpoint
  - Update ML listings with TinyERP stock levels
- [ ] Implement bidirectional inventory sync job

### Additional TinyERP Features
- [ ] Shipping label generation integration
- [ ] Financial reporting sync
- [ ] Customer data sync between platforms

---

## 🤖 Phase 5: Automation Engine

### Automation Rules
- [ ] Create database model for `Automation`
  - Store automation type, trigger, action, config
- [ ] Create `/automations` CRUD endpoints
- [ ] Implement automation execution engine
  - Price sync
  - Inventory sync
  - Order forwarding to ERP
  - Auto-response to questions

### Background Jobs
- [ ] Set up job queue (BullMQ + Redis or similar)
- [ ] Create scheduled jobs for syncs
- [ ] Create job monitoring/logging

---

## 📊 Phase 6: Analytics & Reporting

### BI Endpoints
- [ ] Create `/analytics/sales` endpoint
  - Sales metrics by period
- [ ] Create `/analytics/inventory` endpoint
  - Stock levels across platforms
- [ ] Create `/analytics/performance` endpoint
  - Listing performance metrics

---

## 🛡️ Phase 7: Security & Production Readiness

### Security
- [ ] Implement rate limiting (@fastify/rate-limit)
- [ ] Add CORS configuration
- [ ] Encrypt OAuth tokens at rest (crypto module)
- [ ] Add request logging
- [ ] Add error tracking (Sentry or similar)

### Testing
- [ ] Write unit tests for services
- [ ] Write integration tests for endpoints
- [ ] Add CI/CD pipeline

### Documentation
- [ ] Generate API documentation (Swagger/OpenAPI)
- [ ] Write deployment guide
- [ ] Document environment variables

---

## 🚢 Phase 8: Deployment

- [ ] Configure production environment variables
- [ ] Set up VPS deployment (Hostinger)
- [ ] Configure Nginx reverse proxy
- [ ] Set up SSL/TLS certificates
- [ ] Configure PM2 or systemd for process management
- [ ] Set up database backups
- [ ] Configure monitoring (logs, metrics, uptime)

---

## Future Enhancements

- [ ] Support for Shopee API
- [ ] Support for Amazon Seller API
- [ ] Multi-language support
- [ ] Advanced pricing rules
- [ ] AI-powered product description generation
- [ ] Mobile app API endpoints
