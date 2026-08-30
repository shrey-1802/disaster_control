# DISISTA CONTROL — API CONTRACT & SPECIFICATION
## Version: 1.0.0 (Production) • Base Path: `/api/v1`

---

## 1. Global Standards & Envelope

All API endpoints strictly follow the standard JSON response envelope:

### Success Response Envelope
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "requestId": "req_01hz8k...",
    "timestamp": "2026-08-31T04:15:00.000Z"
  }
}
```

### Paginated List Envelope
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 100,
    "totalPages": 4,
    "requestId": "req_01hz8k...",
    "timestamp": "2026-08-31T04:15:00.000Z"
  }
}
```

### Error Response Envelope
```json
{
  "success": false,
  "error": {
    "code": "INVENTORY_INSUFFICIENT",
    "message": "Requested quantity exceeds available stock.",
    "details": { "available": 50, "requested": 100 }
  },
  "meta": {
    "requestId": "req_01hz8k...",
    "timestamp": "2026-08-31T04:15:00.000Z"
  }
}
```

---

## 2. Authentication & Session (`/api/v1/auth`)

| Method | Endpoint | Description | Allowed Roles | Request Body | Response Data |
|---|---|---|---|---|---|
| `POST` | `/auth/login` | Authenticate with role, badge ID, passcode | `public` | `{ "operatorId": "HQ-CMD-001", "password": "...", "role": "control_room", "pincode": "248001" }` | `{ "user": UserDTO, "accessToken": "jwt...", "refreshToken": "..." }` |
| `POST` | `/auth/refresh` | Refresh expired access token | `public` | `{ "refreshToken": "..." }` | `{ "accessToken": "jwt...", "expiresIn": 900 }` |
| `GET` | `/auth/me` | Fetch active user session & profile | `authenticated` | — | `UserDTO` |
| `POST` | `/auth/logout` | Revoke active refresh token | `authenticated` | `{ "refreshToken": "..." }` | `{ "message": "Logged out successfully." }` |

---

## 3. Role-Based Dashboard (`/api/v1/dashboard`)

| Method | Endpoint | Description | Allowed Roles | Query Params | Response Data |
|---|---|---|---|---|---|
| `GET` | `/dashboard` | Role-tailored aggregated dashboard data | `all 3 roles` | — | `DashboardDTO` (Control Room / Warehouse Mgr / Field Driver) |
| `GET` | `/dashboard/kpis` | KPI stat tiles for active sector | `all 3 roles` | `sectorPin` | `Array<KpiStatDTO>` |
| `GET` | `/dashboard/activity` | Recent operational activity stream | `all 3 roles` | `limit=10` | `Array<ActivityLogDTO>` |
| `GET` | `/dashboard/critical-items`| High-priority issues requiring action | `all 3 roles` | — | `Array<CriticalItemDTO>` |

---

## 4. Warehouses & Inventory (`/api/v1/warehouses`, `/api/v1/inventory`)

| Method | Endpoint | Description | Allowed Roles | Request Body / Query |
|---|---|---|---|---|
| `GET` | `/warehouses` | List all regional depots & hubs | `control_room`, `warehouse_manager` | `pincode=248001` |
| `GET` | `/warehouses/:id` | Get warehouse details & metrics | `control_room`, `warehouse_manager` | — |
| `GET` | `/warehouses/:id/inventory` | List items with `Available = Total - Reserved` | `control_room`, `warehouse_manager` | `category`, `status` |
| `POST` | `/inventory/receive` | Receive incoming shipment into warehouse | `control_room`, `warehouse_manager` | `{ "warehouseId": "...", "supplyId": "...", "quantity": 500, "batch": "..." }` |
| `POST` | `/inventory/adjust` | Adjust stock count with audit reason | `control_room`, `warehouse_manager` | `{ "warehouseId": "...", "supplyId": "...", "delta": -20, "reason": "Damaged" }` |
| `GET` | `/inventory/transactions` | Query audit log of all stock changes | `control_room`, `warehouse_manager` | `warehouseId`, `page`, `pageSize` |

---

## 5. Supply Swap & Rebalancing (`/api/v1/supply-swaps`)

| Method | Endpoint | Description | Allowed Roles | Request Body |
|---|---|---|---|---|
| `GET` | `/supply-swaps` | List active & past cross-hub swaps | `control_room`, `warehouse_manager` | `status`, `warehouseId` |
| `POST` | `/supply-swaps` | Initiate cross-hub supply transfer | `control_room`, `warehouse_manager` | `{ "fromWarehouseId": "...", "toWarehouseId": "...", "supplyId": "...", "quantity": 500, "reason": "..." }` |
| `POST` | `/supply-swaps/:id/approve` | Authorize transfer & reserve stock | `control_room` | `{ "approvalNotes": "..." }` |
| `POST` | `/supply-swaps/:id/dispatch`| Assign convoy & dispatch shipment | `control_room`, `warehouse_manager` | `{ "convoyId": "C-014" }` |
| `POST` | `/supply-swaps/:id/receive` | Confirm receipt & reconcile inventory | `warehouse_manager` | `{ "receivedQuantity": 500 }` |

---

## 6. Relief Shelters & Urgency (`/api/v1/shelters`)

| Method | Endpoint | Description | Allowed Roles |
|---|---|---|---|
| `GET` | `/shelters` | List all relief shelters with days-of-cover | `all 3 roles` |
| `GET` | `/shelters/:id` | Get shelter profile, population, supply status | `all 3 roles` |
| `GET` | `/shelters/:id/demand` | Detailed required vs available vs deficit breakdown | `all 3 roles` |
| `POST` | `/shelters/:id/demand` | Update shelter population or supply requisition | `control_room`, `warehouse_manager` |
| `GET` | `/shelters/critical` | Query isolated or critical deficit shelters | `control_room`, `warehouse_manager` |

---

## 7. Dynamic Hazard System (`/api/v1/hazards`)

| Method | Endpoint | Description | Allowed Roles | Request Body |
|---|---|---|---|---|
| `GET` | `/hazards` | List all reported & verified hazards | `all 3 roles` | `status`, `severity`, `bbox` |
| `GET` | `/hazards/active` | Query active road blocks & flood zones | `all 3 roles` | — |
| `POST` | `/hazards` | Submit field hazard observation | `all 3 roles` | `{ "type": "flash_flood", "latitude": 30.18, "longitude": 78.23, "locationName": "...", "description": "..." }` |
| `POST` | `/hazards/:id/verify` | Verify hazard & trigger route recalculation | `control_room` | `{ "severity": "critical", "roadClosure": true }` |
| `POST` | `/hazards/:id/resolve`| Mark hazard resolved & restore route corridors | `control_room` | `{ "resolutionNotes": "..." }` |

---

## 8. Convoy Dispatch & Telemetry (`/api/v1/convoys`, `/api/v1/drivers`)

| Method | Endpoint | Description | Allowed Roles |
|---|---|---|---|
| `GET` | `/convoys` | List active convoys with cold-chain telemetry | `control_room`, `warehouse_manager` |
| `POST` | `/convoys` | Create new convoy mission with manifest | `control_room` |
| `POST` | `/convoys/:id/dispatch` | Dispatch convoy & initiate route tracking | `control_room` |
| `POST` | `/convoys/:id/status` | Update convoy status (`en_route`, `delayed`, etc.) | `control_room`, `field_driver` (assigned only) |
| `POST` | `/convoys/:id/deliver` | Confirm delivery & update destination inventory | `control_room`, `field_driver` (assigned only) |
| `GET` | `/drivers/me/mission` | Fetch assigned convoy mission for current driver | `field_driver` |
| `POST` | `/drivers/me/location`| Update current GPS coordinates (throttled) | `field_driver` |

---

## 9. Live Map & TomTom Routing (`/api/v1/map`, `/api/v1/routes`)

| Method | Endpoint | Description | Allowed Roles |
|---|---|---|---|
| `GET` | `/map/overview` | Complete Sector 7 GeoJSON features for map engine | `all 3 roles` |
| `POST` | `/routes/calculate`| Request TomTom highway route with DISISTA hazard overlay | `control_room`, `warehouse_manager` |
| `GET` | `/routes/:id/risk` | Calculate dynamic route risk score (0–100) | `all 3 roles` |

---

## 10. Alerts & Incident Triage (`/api/v1/alerts`)

| Method | Endpoint | Description | Allowed Roles |
|---|---|---|---|
| `GET` | `/alerts` | Operational incident triage stream | `all 3 roles` |
| `POST` | `/alerts/:id/acknowledge` | Acknowledge alert with audit trail | `all 3 roles` |
| `POST` | `/alerts/:id/escalate` | Escalate incident to National HQ | `control_room` |

---

## 11. Resilient Offline Synchronization (`/api/v1/sync`)

| Method | Endpoint | Description | Allowed Roles |
|---|---|---|---|
| `POST` | `/sync/push` | Idempotent batch upload of offline field telemetry | `all 3 roles` |
| `GET` | `/sync/status` | Check synchronization queue status | `all 3 roles` |

---

## 12. Operational Reports & Analytics (`/api/v1/reports`)

| Method | Endpoint | Description | Allowed Roles |
|---|---|---|---|
| `GET` | `/reports/operations` | Quantitative supply chain resilience & delivery success | `control_room`, `warehouse_manager` |
| `GET` | `/reports/export-csv` | Stream CSV export of hazards, convoys & stock | `control_room`, `warehouse_manager` |
