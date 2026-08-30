# DISISTA CONTROL — Production Backend Architecture & Deployment Guide
## High-Throughput Disaster Relief Supply Chain & Operational Intelligence Platform

---

## 1. System Architecture Overview

DISISTA CONTROL is built as an authoritative **Operational State Platform** connecting:
`Hazards` ➔ `Roads/Routes` ➔ `Convoys` ➔ `Warehouses` ➔ `Atomic Inventory` ➔ `Relief Shelters` ➔ `Supply Swap Rebalancing` ➔ `Incident Alerts` ➔ `Field Mode & Offline Sync`.

```
                    ┌─────────────────────────┐
                    │    DISISTA FRONTEND     │
                    │   HTML / Vanilla CSS / JS│
                    └───────────┬─────────────┘
                                │ HTTPS / WSS
                                ▼
                    ┌─────────────────────────┐
                    │      FASTIFY 5 API      │
                    │   Node.js 22 LTS (TS)   │
                    └───────────┬─────────────┘
                                │
              ┌─────────────────┼──────────────────┐
              │                 │                  │
              ▼                 ▼                  ▼
       ┌────────────┐    ┌──────────────┐   ┌─────────────┐
       │ Auth / RBAC│    │ Domain       │   │ TomTom      │
       │ (Argon2id) │    │ Services     │   │ Adapter     │
       └────────────┘    └──────┬───────┘   └──────┬──────┘
                                │                  │
                                ▼                  ▼
                         ┌────────────┐     ┌─────────────┐
                         │  MySQL 8   │     │ TomTom APIs │
                         │ (Prisma)   │     └─────────────┘
                         └────────────┘
```

---

## 2. Prerequisites

- **Node.js**: `v22.x` or `v24.x` LTS
- **Package Manager**: `npm` 10+
- **Database**: MySQL 8.x (or via Docker)
- **TomTom API Key**: Provided via `TOMTOM_API_KEY` (Automated mock fallback available in development)

---

## 3. Quickstart & Local Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and adjust database credentials:
```bash
cp .env.example .env
```

### 3. Generate Prisma Client & Run Migrations
```bash
npx prisma generate
npx prisma db push
npm run prisma:seed
```

### 4. Start Development Server
```bash
npm run dev
```

The API will start at: `http://localhost:3000`
Interactive OpenAPI / Swagger Documentation: `http://localhost:3000/docs`
WebSocket Telemetry Stream: `ws://localhost:3000/ws/telemetry`

---

## 4. Production Deployment via Docker Compose

To deploy the entire production stack (Fastify API + MySQL 8 Container):

```bash
cd backend
docker compose up --build -d
```

### Verification & Health Probes:
- **Liveness Probe**: `GET http://localhost:3000/health/live`
- **Readiness Probe**: `GET http://localhost:3000/health/ready`

---

## 5. Seed Accounts & Roles

| Role | Operator Badge ID | Passcode | Scope |
|---|---|---|---|
| **Control Room Commander** | `HQ-CMD-001` | `disaster2026` | Global command, route risk, hazard verification, road blocks, alerts escalation |
| **Warehouse Manager** | `WH-MGR-02` | `disaster2026` | Hub Alpha stock allocation, receive shipment, initiate Supply Swap transfers |
| **Relief Convoy Field Driver** | `DRV-401` | `disaster2026` | Convoy C-014 telemetry, 1-tap hazard reporting, offline queue sync, delivery confirm |
