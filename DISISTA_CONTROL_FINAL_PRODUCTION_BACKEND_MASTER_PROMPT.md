# DISISTA CONTROL — FINAL PRODUCTION BACKEND MASTER PROMPT
## Senior Backend Developer / Backend Architect Implementation Specification

> **Purpose:** Use this document as the master instruction for an AI coding agent or senior backend developer to build the complete production-grade backend for the already-developed DISISTA CONTROL frontend.
>
> **Important:** The frontend already exists. Do NOT redesign, rewrite, or replace the frontend. Build the backend to match its existing pages, roles, workflows, API expectations, and data structures.
>
> **Primary stack:** Node.js + TypeScript + Fastify + MySQL 8.
>
> **Routing / mapping provider:** TomTom APIs.
>
> **Database:** MySQL 8.x.
>
> **Architecture target:** Production-ready, secure, testable, observable, maintainable, and deployable.

---

# 1. PRODUCT CONTEXT

DISISTA CONTROL is an emergency relief operations platform for situations where earthquakes, hillside debris flows, river overflow, flooding, damaged bridges, submerged intersections, and other dynamic hazards make conventional route information unreliable.

The system coordinates:

- Control Room operations
- Warehouse inventory
- Field drivers
- Relief convoys
- Shelters and demand
- Hazards
- Alerts
- Supply Swap between warehouses
- Live map information
- Field Mode
- Offline synchronization
- Delivery confirmation
- Operational reporting

The core operational problem is not simply navigation.

The backend must maintain a unified operational picture connecting:

**Hazards → Roads/routes → Convoys → Warehouses → Supplies → Shelters → Alerts → Field observations**

The frontend must be able to obtain consistent, validated, role-appropriate information from one backend.

---

# 2. SOURCE-OF-TRUTH RULE

Use the existing DISISTA CONTROL frontend and UI/UX specification as the source of truth for:

- Page names
- Navigation
- Role access
- Existing workflows
- KPI concepts
- Live map behavior
- Convoy workflow
- Shelter workflow
- Hazard Log workflow
- Supply Swap workflow
- Alerts workflow
- Settings
- Field Mode
- Offline Sync
- Login role selection

The final UI/UX specification explicitly preserves these core workflows and requires a professional white + light-blue operational interface. The backend must therefore provide stable data contracts for those workflows rather than inventing unrelated functionality. fileciteturn2file8L680-L706

The UI specification also defines a consistent page structure, navigation model, KPI/stat cards, tables, data bars, alerts, and role-based navigation. Backend responses must support these components with real data and explicit empty/loading/error states. fileciteturn2file6L431-L466

---

# 3. EXISTING FRONTEND ARCHITECTURE

Assume the frontend has this architecture:

```text
frontend/
├── login.html
├── dashboard.html
├── live-map.html
├── convoy-dispatch.html
├── shelter-board.html
├── hazard-log.html
├── alerts.html
├── settings.html
├── css/
│   ├── tokens.css
│   ├── base.css
│   └── components.css
└── js/
    └── pages/
        ├── liveMap.js
        ├── convoyDispatch.js
        ├── shelterBoard.js
        ├── hazardLog.js
        ├── alerts.js
        └── settings.js
```

Do not create backend assumptions that force frontend restructuring.

If an existing frontend API call is discovered, preserve its intent and create the corresponding backend contract.

---

# 4. USER ROLES

The final product uses three operational roles:

## 4.1 CONTROL ROOM

Purpose:

Central operational coordination.

Can:

- View system-wide dashboard
- View live map
- Monitor all convoys
- Monitor warehouses
- Monitor shelters
- View hazards
- Verify/coordinate operational hazards according to authorization
- Manage critical alerts
- Acknowledge/escalate alerts
- Coordinate convoy operations
- View supply availability
- Monitor Supply Swap activity
- View reports
- Configure authorized operational settings

Must not directly manipulate data outside its authorization scope.

---

## 4.2 WAREHOUSE MANAGER

Purpose:

Manage inventory and make sure critical supplies are available where needed.

Can:

- View own warehouse inventory
- Add/update stock
- Record stock movements
- Identify surplus
- Identify shortages
- View shelter demand
- Offer surplus through Supply Swap
- Request supplies from another warehouse
- Monitor transfers
- Monitor related convoys
- View relevant hazards
- Respond to inventory alerts
- Confirm receipt of transferred supplies

Cannot:

- Dispatch the entire convoy network
- Globally block roads
- Modify verified field hazards without authorization
- Manage unrelated warehouses
- Perform system administration

Core workflow:

```text
Inventory
   ↓
Identify surplus / shortage
   ↓
Supply Swap
   ↓
Transfer approval
   ↓
Convoy / shipment
   ↓
Delivery
   ↓
Inventory update
   ↓
Availability restored
```

---

## 4.3 FIELD DRIVER

Purpose:

Execute an assigned relief mission and provide real-time field information.

Can:

- View assigned convoy
- View cargo
- View destination
- View assigned route
- Receive rerouting instructions
- Update convoy status
- Acknowledge instructions
- Report blocked roads
- Report flooding
- Report damaged bridges
- Submit hazard observations
- Use Field Mode
- Work offline
- Sync queued updates
- Confirm delivery

Cannot:

- Dispatch other convoys
- Modify warehouse inventory directly
- Approve Supply Swap
- Globally block roads
- Manage other drivers

Core workflow:

```text
Receive mission
   ↓
Travel
   ↓
Monitor route
   ↓
Observe hazard
   ↓
Report hazard
   ↓
Receive instruction / reroute
   ↓
Continue mission
   ↓
Deliver
   ↓
Confirm delivery
```

---

# 5. RECOMMENDED BACKEND STACK

Use:

```text
Runtime:
Node.js 22 LTS+

Language:
TypeScript

Framework:
Fastify

Database:
MySQL 8.x

ORM / Query Layer:
Prisma OR Drizzle
```

Preferred choice:

**Fastify + TypeScript + Prisma + MySQL**

Reason:

- Strong TypeScript support
- Clear schema
- Migration system
- Type-safe database access
- Good production maintainability
- Easy testing
- Good performance
- Suitable for REST APIs

Supporting libraries:

```text
@fastify/cors
@fastify/helmet
@fastify/rate-limit
@fastify/jwt
@fastify/swagger
@fastify/swagger-ui
@fastify/sensible
zod or TypeBox
pino
bcrypt/argon2
uuid
dotenv
```

For password hashing prefer:

**Argon2id**

Do not store plain passwords.

---

# 6. BACKEND ARCHITECTURE

Use a modular layered architecture.

```text
backend/
├── src/
│   ├── app.ts
│   ├── server.ts
│   │
│   ├── config/
│   │   ├── env.ts
│   │   ├── database.ts
│   │   └── tomtom.ts
│   │
│   ├── plugins/
│   │   ├── auth.ts
│   │   ├── cors.ts
│   │   ├── helmet.ts
│   │   ├── rateLimit.ts
│   │   ├── swagger.ts
│   │   └── errorHandler.ts
│   │
│   ├── middleware/
│   │   ├── authenticate.ts
│   │   ├── authorize.ts
│   │   ├── requestId.ts
│   │   └── audit.ts
│   │
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── dashboard/
│   │   ├── warehouses/
│   │   ├── inventory/
│   │   ├── shelters/
│   │   ├── hazards/
│   │   ├── convoys/
│   │   ├── routes/
│   │   ├── supplySwap/
│   │   ├── alerts/
│   │   ├── fieldMode/
│   │   ├── sync/
│   │   ├── reports/
│   │   └── settings/
│   │
│   ├── integrations/
│   │   └── tomtom/
│   │
│   ├── database/
│   │   ├── prisma/
│   │   ├── migrations/
│   │   └── seed/
│   │
│   ├── shared/
│   │   ├── types/
│   │   ├── constants/
│   │   ├── errors/
│   │   ├── validators/
│   │   ├── utils/
│   │   └── pagination/
│   │
│   └── tests/
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── .env.example
├── Dockerfile
├── docker-compose.yml
├── package.json
├── tsconfig.json
├── README.md
└── .gitignore
```

---

# 7. LAYER RESPONSIBILITIES

Every module should follow:

```text
Route
  ↓
Controller
  ↓
Service
  ↓
Repository / ORM
  ↓
MySQL
```

External APIs:

```text
Service
  ↓
TomTom Adapter
  ↓
TomTom API
```

Do not place business logic directly inside route handlers.

Do not put SQL queries inside controllers.

Do not expose Prisma/database objects directly to the frontend.

Map external API responses into internal DTOs.

---

# 8. DATABASE DESIGN

Create a normalized relational MySQL database.

Core entities:

```text
users
roles
warehouses
inventory_items
inventory_transactions
supplies
shelters
shelter_demands
hazards
hazard_reports
roads / route_events
convoys
convoy_items
vehicles
drivers
routes
route_snapshots
supply_swap_requests
supply_swap_items
alerts
alert_acknowledgements
field_reports
offline_sync_queue
audit_logs
notifications
system_settings
```

Use UUIDs for externally exposed identifiers.

Keep internal numeric IDs only if there is a strong database-performance reason.

---

# 9. DATABASE RELATIONSHIPS

Conceptual relationship:

```text
USER
 ├── ROLE
 ├── DRIVER
 └── WAREHOUSE MANAGER

WAREHOUSE
 ├── INVENTORY
 ├── INVENTORY TRANSACTIONS
 └── SUPPLY SWAP

SUPPLY
 ├── INVENTORY ITEM
 ├── CONVOY ITEM
 └── SHELTER DEMAND

SHELTER
 └── SHELTER DEMAND

CONVOY
 ├── VEHICLE
 ├── DRIVER
 ├── ROUTE
 ├── CONVOY ITEMS
 ├── HAZARDS
 └── ALERTS

HAZARD
 ├── FIELD REPORTS
 ├── ROUTE IMPACT
 └── ALERTS

SUPPLY SWAP
 ├── SOURCE WAREHOUSE
 ├── DESTINATION WAREHOUSE
 ├── ITEMS
 └── TRANSFER CONVOY

ALERT
 ├── SOURCE ENTITY
 ├── ACKNOWLEDGEMENTS
 └── ESCALATION HISTORY
```

---

# 10. CRITICAL INVENTORY MODEL

Do not only store a single stock number.

For every supply type support:

```text
quantity_on_hand
quantity_reserved
quantity_available
minimum_threshold
critical_threshold
maximum_capacity
unit
expiry_date
batch_number
```

Formula:

```text
available =
quantity_on_hand
-
quantity_reserved
```

Inventory state:

```text
SAFE
LOW
CRITICAL
OUT_OF_STOCK
```

Never allow:

```text
available < 0
```

Use transactions and row locking for inventory changes.

---

# 11. INVENTORY TRANSACTION SAFETY

Inventory modifications must be atomic.

Example:

```text
BEGIN TRANSACTION

SELECT inventory row FOR UPDATE

validate requested quantity

update quantity

insert inventory_transaction

update related Supply Swap / shipment state

COMMIT
```

If any step fails:

```text
ROLLBACK
```

Never update inventory and shipment records independently when they represent one business operation.

---

# 12. SUPPLY SWAP

Supply Swap is a core differentiating workflow.

It connects warehouse surplus with warehouse/shelter shortages.

Workflow:

```text
Warehouse A has surplus
        ↓
Manager creates offer
        ↓
System validates available quantity
        ↓
Warehouse B requests / accepts
        ↓
Authorized approval
        ↓
Inventory reserved
        ↓
Transfer shipment created
        ↓
Convoy created / linked
        ↓
Dispatch
        ↓
Transit
        ↓
Delivered
        ↓
Destination inventory increased
        ↓
Source reservation released / stock reduced
```

States:

```text
DRAFT
OFFERED
REQUESTED
PENDING_APPROVAL
APPROVED
REJECTED
RESERVED
IN_TRANSIT
DELIVERED
CANCELLED
EXPIRED
```

Do not physically subtract source stock merely because an offer is created.

Use:

```text
reserved quantity
```

until the transfer becomes committed.

---

# 13. SHELTER DEMAND

A shelter should report demand by supply type.

Example:

```text
Shelter A

Potable Water
Required: 10,000 L
Available: 3,000 L
Shortage: 7,000 L

Infant Nutrition
Required: 800 units
Available: 150 units
Shortage: 650 units

Insulin
Required: 120 units
Available: 20 units
Shortage: 100 units

Blood Bags
Required: 80
Available: 15
Shortage: 65
```

The backend should calculate:

```text
shortage = required - available
```

and classify urgency.

Possible urgency:

```text
NORMAL
HIGH
CRITICAL
```

Never calculate these only in frontend JavaScript.

The backend is authoritative.

---

# 14. HAZARD SYSTEM

Hazards are dynamic operational information.

Supported examples:

```text
FLOOD
FLASH_FLOOD
LANDSLIDE
DEBRIS_FLOW
DAMAGED_BRIDGE
SUBMERGED_ROAD
BLOCKED_ROAD
ROAD_COLLAPSE
WATERLOGGING
OTHER
```

Each hazard should contain:

```text
id
type
severity
latitude
longitude
description
reported_by
reported_at
verified_at
status
affected_road/reference
source
expires_at
```

Severity:

```text
LOW
MEDIUM
HIGH
CRITICAL
```

Status:

```text
REPORTED
UNDER_REVIEW
VERIFIED
ACTIVE
RESOLVED
REJECTED
EXPIRED
```

A field driver may report a hazard.

A verified operational hazard must not be silently overwritten.

Maintain history.

---

# 15. FIELD REPORTS

Field reports must be append-oriented.

Never destroy the original report.

Store:

```text
report_id
driver_id
convoy_id
report_type
latitude
longitude
description
photo_reference
client_timestamp
server_timestamp
offline_created
sync_status
verification_status
```

This is important because field devices may lose connectivity.

---

# 16. CONVOY SYSTEM

Convoys should contain:

```text
convoy_id
vehicle_id
driver_id
source_warehouse_id
destination_type
destination_id
status
priority
cargo_weight
route_id
eta
actual_departure
actual_arrival
created_at
updated_at
```

Convoy statuses:

```text
PLANNED
DISPATCHED
ACKNOWLEDGED
EN_ROUTE
DELAYED
REROUTING
STOPPED
ARRIVED
DELIVERED
CANCELLED
```

Driver updates should create a status history rather than only overwriting the current state.

---

# 17. ROUTE MODEL

Never trust a route as permanently valid during a disaster.

Store:

```text
route_id
convoy_id
origin
destination
provider
provider_route_id
distance
estimated_duration
calculated_at
risk_score
route_status
```

A route can become:

```text
VALID
CAUTION
BLOCKED
STALE
REQUIRES_RECALCULATION
```

The backend must be capable of recalculating a route when a relevant hazard changes.

---

# 18. TOMTOM INTEGRATION

Use TomTom as the external mapping/routing provider.

Never expose the TomTom API key to the browser unless the specific API contract explicitly requires client-side access and the key is restricted appropriately.

Preferred architecture:

```text
Frontend
   ↓
DISISTA Backend
   ↓
TomTom Adapter
   ↓
TomTom API
```

Use environment variables:

```env
TOMTOM_API_KEY=
TOMTOM_BASE_URL=
```

Never commit the real key.

Never hard-code:

```text
const TOMTOM_API_KEY = "actual-secret";
```

---

# 19. TOMTOM ADAPTER

Create a dedicated adapter:

```text
src/integrations/tomtom/
├── tomtom.client.ts
├── tomtom.routes.ts
├── tomtom.search.ts
├── tomtom.traffic.ts
├── tomtom.types.ts
└── tomtom.errors.ts
```

Do not call TomTom directly from every service.

All external API access should pass through the adapter.

This makes it possible to:

- Mock TomTom during tests
- Replace TomTom later
- Centralize retries
- Centralize timeouts
- Centralize logging
- Centralize API-key handling
- Normalize provider errors

---

# 20. TOMTOM ROUTING WORKFLOW

When a convoy requires routing:

```text
Validate origin
Validate destination
Load active hazards
Request route from TomTom
Normalize response
Calculate operational risk
Store route snapshot
Return route DTO
```

Do not blindly assume:

```text
TomTom route = safe route
```

TomTom provides routing information; DISISTA's operational layer must combine it with application hazard information.

---

# 21. ROUTE RISK

Create an internal route-risk calculation.

Possible factors:

```text
active hazards near route
hazard severity
road blockage
bridge damage
flood depth
route freshness
known field reports
route deviation
```

Example conceptual score:

```text
0–20     LOW
21–50    MODERATE
51–75    HIGH
76–100   CRITICAL
```

The exact mathematical model may be improved later.

Keep the risk engine isolated:

```text
src/modules/routes/risk.service.ts
```

Do not hard-code the risk algorithm throughout the application.

---

# 22. ROUTE STALENESS

Every route should have:

```text
calculated_at
expires_at
```

When relevant hazard information changes, a route may become stale.

Example:

```text
Route calculated
      ↓
New bridge damage reported
      ↓
Hazard becomes active
      ↓
Affected route detected
      ↓
Route marked STALE
      ↓
Convoy receives route warning
      ↓
Authorized system recalculates route
```

---

# 23. ALERT ENGINE

Alerts should be generated from operational events.

Examples:

```text
Critical shelter shortage
Warehouse inventory below critical threshold
Convoy route blocked
Convoy stopped unexpectedly
New critical hazard
Flood reported near active convoy
Bridge damage near active route
Supply Swap approval required
Offline device has unsynced critical report
```

Alert fields:

```text
id
type
severity
title
message
source_type
source_id
created_at
expires_at
status
```

Severity:

```text
INFO
WARNING
CRITICAL
```

Status:

```text
NEW
ACKNOWLEDGED
ESCALATED
RESOLVED
DISMISSED
```

The frontend specification explicitly defines informational, warning, and critical alert hierarchy with acknowledge/escalate/view-details actions. fileciteturn1file4L393-L415

---

# 24. ALERT ACKNOWLEDGEMENT

An acknowledgement must be recorded.

Do not simply set:

```text
alert.is_read = true
```

Instead maintain:

```text
alert_acknowledgements
```

with:

```text
alert_id
user_id
acknowledged_at
action
comment
```

This creates an operational audit trail.

---

# 25. DASHBOARD API

Dashboard must be role-aware.

## Control Room dashboard

Return:

```text
active convoys
delayed convoys
critical hazards
critical alerts
warehouse shortages
critical shelter shortages
active Supply Swaps
offline field devices
network operational status
```

## Warehouse Manager dashboard

Return:

```text
available inventory
critical inventory
low-stock items
surplus items
shelter demand
incoming transfers
outgoing transfers
related convoys
warehouse alerts
```

## Field Driver dashboard

Return:

```text
assigned convoy
cargo
destination
current status
ETA
route risk
active route hazards
latest instructions
unacknowledged alerts
offline sync count
```

Never send system-wide data to a warehouse manager or driver merely because the frontend hides it.

Authorization must happen server-side.

---

# 26. API DESIGN

Base path:

```text
/api/v1
```

Use versioning from the beginning.

---

# 27. AUTHENTICATION API

```http
POST /api/v1/auth/login
POST /api/v1/auth/logout
POST /api/v1/auth/refresh
GET  /api/v1/auth/me
```

Login request:

```json
{
  "operatorId": "WH-001",
  "password": "..."
}
```

Response:

```json
{
  "success": true,
  "data": {
    "user": {},
    "accessToken": "...",
    "expiresIn": 900
  }
}
```

Use short-lived access tokens.

Use secure refresh-token strategy.

Never return password hashes.

---

# 28. DASHBOARD API

```http
GET /api/v1/dashboard
GET /api/v1/dashboard/kpis
GET /api/v1/dashboard/activity
GET /api/v1/dashboard/critical-items
```

The backend determines the response according to authenticated role.

---

# 29. WAREHOUSE API

```http
GET    /api/v1/warehouses
GET    /api/v1/warehouses/:id
GET    /api/v1/warehouses/:id/inventory
GET    /api/v1/warehouses/:id/shortages
GET    /api/v1/warehouses/:id/surplus
GET    /api/v1/warehouses/:id/transactions
```

Authorization:

- Control Room: authorized warehouses
- Warehouse Manager: own warehouse
- Field Driver: no inventory modification access

---

# 30. INVENTORY API

```http
GET  /api/v1/inventory
GET  /api/v1/inventory/:id
POST /api/v1/inventory/receive
POST /api/v1/inventory/adjust
POST /api/v1/inventory/reserve
POST /api/v1/inventory/release
GET  /api/v1/inventory/transactions
```

Every mutation must:

- Validate quantity
- Validate authorization
- Validate supply
- Validate warehouse ownership
- Use transaction
- Create audit log
- Return updated state

---

# 31. SHELTER API

```http
GET  /api/v1/shelters
GET  /api/v1/shelters/:id
GET  /api/v1/shelters/:id/demand
POST /api/v1/shelters/:id/demand
PATCH /api/v1/shelters/:id/demand/:demandId
GET  /api/v1/shelters/critical
```

---

# 32. HAZARD API

```http
GET  /api/v1/hazards
GET  /api/v1/hazards/active
GET  /api/v1/hazards/:id
POST /api/v1/hazards
PATCH /api/v1/hazards/:id/status
POST /api/v1/hazards/:id/verify
POST /api/v1/hazards/:id/resolve
```

Field driver:

```text
POST /api/v1/hazards
```

with restricted fields.

Control Room:

```text
verify
resolve
manage operational status
```

Do not allow driver privilege escalation through request-body fields.

---

# 33. CONVOY API

```http
GET  /api/v1/convoys
GET  /api/v1/convoys/:id
POST /api/v1/convoys
PATCH /api/v1/convoys/:id
POST /api/v1/convoys/:id/dispatch
POST /api/v1/convoys/:id/acknowledge
POST /api/v1/convoys/:id/status
POST /api/v1/convoys/:id/reroute
POST /api/v1/convoys/:id/deliver
GET  /api/v1/convoys/:id/history
```

Every status change creates a history record.

---

# 34. DRIVER API

```http
GET /api/v1/drivers/me
GET /api/v1/drivers/me/convoy
POST /api/v1/drivers/me/location
POST /api/v1/drivers/me/status
POST /api/v1/drivers/me/hazard-report
POST /api/v1/drivers/me/delivery-confirmation
```

A driver can only operate on the driver's assigned convoy.

---

# 35. LIVE MAP API

```http
GET /api/v1/map/overview
GET /api/v1/map/hazards
GET /api/v1/map/convoys
GET /api/v1/map/warehouses
GET /api/v1/map/shelters
GET /api/v1/map/routes
GET /api/v1/map/nearby
```

Use query filters:

```text
bbox
lat
lng
radius
severity
status
type
```

Do not send thousands of records unnecessarily.

Use bounding-box and pagination strategies.

---

# 36. ROUTING API

```http
POST /api/v1/routes/calculate
GET  /api/v1/routes/:id
POST /api/v1/routes/:id/recalculate
GET  /api/v1/routes/:id/risk
```

Backend calls TomTom.

Frontend never needs the TomTom secret.

---

# 37. SUPPLY SWAP API

```http
GET  /api/v1/supply-swaps
GET  /api/v1/supply-swaps/:id
POST /api/v1/supply-swaps
POST /api/v1/supply-swaps/:id/request
POST /api/v1/supply-swaps/:id/approve
POST /api/v1/supply-swaps/:id/reject
POST /api/v1/supply-swaps/:id/accept
POST /api/v1/supply-swaps/:id/cancel
POST /api/v1/supply-swaps/:id/dispatch
POST /api/v1/supply-swaps/:id/receive
GET  /api/v1/supply-swaps/:id/history
```

All inventory effects must be transactional.

---

# 38. ALERT API

```http
GET  /api/v1/alerts
GET  /api/v1/alerts/critical
GET  /api/v1/alerts/:id
POST /api/v1/alerts/:id/acknowledge
POST /api/v1/alerts/:id/escalate
POST /api/v1/alerts/:id/resolve
```

---

# 39. FIELD MODE + OFFLINE SYNC

Field operations may lose connectivity.

The backend must support idempotent synchronization.

Every offline mutation should include:

```text
client_event_id
device_id
client_timestamp
operation_type
payload
```

The server should store:

```text
client_event_id UNIQUE
```

Before applying an operation:

```text
if client_event_id already processed:
    return previous result
else:
    process operation
```

This prevents duplicate:

- Hazard reports
- Status updates
- Delivery confirmations
- Location updates

---

# 40. SYNC API

```http
POST /api/v1/sync/push
GET  /api/v1/sync/status
POST /api/v1/sync/ack
```

Example:

```json
{
  "events": [
    {
      "clientEventId": "device-123-event-456",
      "operation": "HAZARD_REPORT",
      "clientTimestamp": "2026-08-31T03:20:00Z",
      "payload": {}
    }
  ]
}
```

Response should classify:

```text
APPLIED
DUPLICATE
REJECTED
CONFLICT
REQUIRES_REVIEW
```

Do not silently discard failed offline operations.

---

# 41. REAL-TIME UPDATES

Use WebSocket or Server-Sent Events for operational changes.

Preferred:

```text
WebSocket
```

Channels/events:

```text
hazard.created
hazard.updated
alert.created
alert.escalated
convoy.status_changed
convoy.rerouted
inventory.changed
shelter.demand_changed
supply_swap.updated
driver.location_updated
sync.completed
```

The backend should send only data the authenticated user is authorized to see.

---

# 42. LOCATION UPDATES

Driver location updates can be high-frequency.

Do not write every GPS event directly into the main database without control.

Use:

```text
rate limiting
batching
throttling
time-based sampling
```

Store:

```text
latest driver location
```

separately from historical tracking where appropriate.

If high-volume history is needed, design a time-series-compatible storage strategy later.

For the hackathon/initial production version, MySQL can store sampled location history with proper indexes.

---

# 43. AUTHORIZATION

Implement RBAC.

Never rely on:

```text
frontend hides button
```

as authorization.

Backend must check:

```text
authenticated user
role
resource ownership
resource scope
operation
```

Example:

```text
Warehouse Manager
DELETE /warehouses/other-warehouse/inventory
→ 403 FORBIDDEN
```

Driver:

```text
PATCH /convoys/not-assigned/status
→ 403 FORBIDDEN
```

---

# 44. SECURITY

Implement:

- HTTPS in production
- Helmet
- CORS allowlist
- Rate limiting
- Input validation
- SQL injection protection through ORM/parameterized queries
- Secure password hashing
- JWT validation
- Refresh-token protection
- Request size limits
- Error sanitization
- Audit logging
- Secret management
- Environment variables
- Dependency auditing

Never return stack traces to clients in production.

---

# 45. VALIDATION

Every request body, query parameter, path parameter, and external API response must be validated.

Reject invalid:

```text
latitude
longitude
quantity
enum values
UUIDs
timestamps
IDs
pagination
```

Latitude:

```text
-90 to 90
```

Longitude:

```text
-180 to 180
```

Quantities:

```text
>= 0
```

Never trust frontend validation.

---

# 46. STANDARD API RESPONSE

Success:

```json
{
  "success": true,
  "data": {},
  "meta": {
    "requestId": "..."
  }
}
```

List:

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 100,
    "requestId": "..."
  }
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "INVENTORY_INSUFFICIENT",
    "message": "Requested quantity is greater than available stock."
  },
  "meta": {
    "requestId": "..."
  }
}
```

Never expose internal SQL errors.

---

# 47. HTTP STATUS CODES

Use correctly:

```text
200 OK
201 Created
204 No Content
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Entity
429 Too Many Requests
500 Internal Server Error
502 Bad Gateway
503 Service Unavailable
```

Do not return `200` for failed business operations.

---

# 48. ERROR CATALOG

Create typed application errors:

```text
AUTH_INVALID_CREDENTIALS
AUTH_TOKEN_EXPIRED
AUTH_FORBIDDEN
RESOURCE_NOT_FOUND
VALIDATION_FAILED
INVENTORY_INSUFFICIENT
INVENTORY_RESERVATION_FAILED
SUPPLY_SWAP_INVALID_STATE
CONVOY_INVALID_STATE
CONVOY_NOT_ASSIGNED
HAZARD_INVALID_STATE
ROUTE_UNAVAILABLE
ROUTE_STALE
TOMTOM_TIMEOUT
TOMTOM_RATE_LIMITED
TOMTOM_UNAVAILABLE
SYNC_DUPLICATE
SYNC_CONFLICT
DATABASE_UNAVAILABLE
INTERNAL_ERROR
```

---

# 49. TOMTOM FAILURE HANDLING

TomTom may:

- timeout
- rate-limit
- return invalid response
- become temporarily unavailable
- reject a route
- return no route

The backend must not crash.

Use:

```text
timeout
retry with exponential backoff
circuit breaker
structured error mapping
logging
fallback operational behavior
```

Do not repeatedly retry a request that is clearly invalid.

Do not expose TomTom's raw error directly to the user.

---

# 50. CACHING

Cache carefully.

Good candidates:

```text
static geocoding
non-critical map metadata
warehouse metadata
shelter metadata
configuration
```

Do not blindly cache:

```text
critical inventory
active convoy state
critical alerts
safety-critical hazard state
```

For safety-critical data, freshness is more important than cache performance.

---

# 51. DATABASE INDEXING

Add indexes for common operational queries.

Examples:

```text
users(operator_id)
users(role_id)

inventory(warehouse_id, supply_id)
inventory(warehouse_id, status)

shelter_demands(shelter_id, supply_id)
shelter_demands(urgency)

hazards(status, severity)
hazards(latitude, longitude)
hazards(reported_at)

convoys(status)
convoys(driver_id, status)
convoys(destination_id, status)

alerts(status, severity)
alerts(created_at)

supply_swap_requests(status)
supply_swap_requests(source_warehouse_id)
supply_swap_requests(destination_warehouse_id)

audit_logs(user_id, created_at)
```

Use spatial indexes where appropriate and supported by the selected MySQL design.

---

# 52. TRANSACTION BOUNDARIES

Use database transactions for:

```text
inventory reservation
inventory transfer
Supply Swap approval
Supply Swap receiving
delivery confirmation
convoy dispatch + reservation
critical state transitions
```

Example delivery transaction:

```text
BEGIN

validate convoy
validate assigned destination
validate delivery state

mark convoy delivered

decrease in-transit source quantity if required

increase destination inventory

insert inventory transaction

insert convoy history

resolve related delivery alert

insert audit log

COMMIT
```

---

# 53. AUDIT LOG

Log consequential operations:

```text
login
logout
inventory adjustment
inventory reservation
Supply Swap creation
Supply Swap approval
Supply Swap rejection
convoy dispatch
convoy reroute
hazard verification
hazard resolution
alert acknowledgement
alert escalation
delivery confirmation
settings changes
role changes
```

Fields:

```text
id
user_id
action
entity_type
entity_id
old_value
new_value
ip_address
user_agent
created_at
```

Do not log passwords, API keys, access tokens, or other secrets.

---

# 54. OBSERVABILITY

Use structured logging.

Each request must have:

```text
requestId
userId when authenticated
route
method
statusCode
duration
```

For external TomTom calls:

```text
provider
endpoint category
duration
status
requestId
```

Never log:

```text
TOMTOM_API_KEY
password
JWT
refresh token
sensitive personal data
```

---

# 55. HEALTH ENDPOINTS

Create:

```http
GET /health
GET /health/live
GET /health/ready
```

Example:

```text
/live
→ process is alive

/ready
→ API + database + required dependencies are ready
```

Do not make readiness dependent on every optional external provider.

---

# 56. CONFIGURATION

Use:

```env
NODE_ENV=production
PORT=3000

DATABASE_URL=

JWT_SECRET=
JWT_ACCESS_EXPIRY=
JWT_REFRESH_SECRET=

TOMTOM_API_KEY=
TOMTOM_BASE_URL=

CORS_ORIGINS=

LOG_LEVEL=

RATE_LIMIT_MAX=
RATE_LIMIT_WINDOW=
```

Provide:

```text
.env.example
```

with blank secrets.

Never commit `.env`.

---

# 57. API DOCUMENTATION

Use OpenAPI / Swagger.

Every endpoint must document:

- Request parameters
- Request body
- Response
- Authentication
- Role access
- Error codes

Expose documentation in development.

For production, protect or disable public Swagger according to deployment requirements.

---

# 58. FRONTEND-BACKEND CONTRACT

Before coding, inspect the frontend JavaScript files and identify:

```text
fetch()
axios()
XMLHttpRequest
WebSocket
localStorage
sessionStorage
```

Create an API contract table:

```text
Frontend page
↓
API endpoint
↓
HTTP method
↓
request
↓
response
↓
role
↓
error states
```

Do not invent a response shape that contradicts existing frontend code.

If the frontend currently expects a specific field name, either preserve it or introduce a small API adapter without breaking the UI.

---

# 59. PAGE-TO-BACKEND MAPPING

## login.html

Needs:

```text
POST /auth/login
GET /auth/me
POST /auth/refresh
```

## dashboard.html

Needs:

```text
GET /dashboard
GET /dashboard/kpis
GET /dashboard/activity
GET /dashboard/critical-items
```

## live-map.html

Needs:

```text
GET /map/overview
GET /map/hazards
GET /map/convoys
GET /map/warehouses
GET /map/shelters
GET /map/routes
```

## convoy-dispatch.html

Needs:

```text
GET /convoys
POST /convoys
POST /convoys/:id/dispatch
POST /convoys/:id/status
POST /convoys/:id/reroute
```

## shelter-board.html

Needs:

```text
GET /shelters
GET /shelters/:id/demand
GET /shelters/critical
```

## hazard-log.html

Needs:

```text
GET /hazards
GET /hazards/active
POST /hazards
POST /hazards/:id/verify
POST /hazards/:id/resolve
```

## alerts.html

Needs:

```text
GET /alerts
POST /alerts/:id/acknowledge
POST /alerts/:id/escalate
POST /alerts/:id/resolve
```

## settings.html

Needs:

```text
GET /settings
PATCH /settings
GET /auth/me
```

Supply Swap endpoints should be implemented even if the current frontend places the workflow inside another page/module.

---

# 60. EMPTY / LOADING / ERROR DATA CONTRACTS

Backend must distinguish:

```text
No records
vs
API failure
vs
permission denied
vs
data not loaded
```

Never return:

```json
[]
```

for a database outage.

Instead return an appropriate error.

This allows the frontend to display a correct empty state rather than falsely reporting "no data".

The UI specification explicitly requires honest empty states instead of fake charts or unexplained empty boxes. fileciteturn1file4L343-L364

---

# 61. PAGINATION

For lists use:

```text
page
pageSize
```

or cursor pagination for high-volume resources.

Set safe limits:

```text
default = 25
maximum = 100
```

Never allow:

```text
?pageSize=1000000
```

---

# 62. FILTERING

Support operational filtering:

```text
status
severity
type
warehouse
shelter
driver
convoy
date range
priority
```

Validate every filter.

---

# 63. SORTING

Allow only whitelisted sort fields.

Never construct raw SQL from an arbitrary query string.

Bad:

```text
ORDER BY ${req.query.sort}
```

Good:

```text
allowedSortFields = {
  createdAt: "created_at",
  severity: "severity",
  status: "status"
}
```

---

# 64. DATA CONSISTENCY RULES

The backend must enforce:

### Inventory

```text
available >= 0
reserved >= 0
```

### Convoy

```text
DELIVERED cannot return to EN_ROUTE
CANCELLED cannot be dispatched
```

### Supply Swap

```text
APPROVED → RESERVED → IN_TRANSIT → DELIVERED
```

### Hazard

```text
RESOLVED cannot silently become ACTIVE
```

unless an explicitly authorized reopen workflow exists.

### Delivery

A delivery confirmation must be idempotent.

Repeated delivery confirmation should not double-add inventory.

---

# 65. SECURITY TESTING

Test:

```text
unauthenticated access
wrong role
wrong warehouse
wrong convoy
wrong driver
IDOR
SQL injection
invalid UUID
invalid quantities
oversized requests
rate limiting
expired token
revoked token
duplicate offline event
replayed delivery event
```

Particularly test:

**IDOR — Insecure Direct Object Reference**

Example:

```text
Warehouse Manager A
tries:
GET /warehouses/B/inventory
```

must fail if unauthorized.

---

# 66. AUTOMATED TESTING

Minimum:

```text
unit tests
integration tests
API tests
authorization tests
database transaction tests
TomTom adapter tests
offline sync tests
```

Critical workflows must have integration tests:

### Supply Swap

```text
create
approve
reserve
dispatch
deliver
inventory verification
```

### Convoy

```text
create
dispatch
acknowledge
en route
hazard
reroute
deliver
```

### Hazard

```text
report
verify
route impact
alert
resolve
```

### Offline

```text
offline event
push
apply
duplicate push
conflict
```

---

# 67. TOMTOM MOCKING

Do not call real TomTom APIs during automated tests.

Create:

```text
MockTomTomClient
```

Tests should simulate:

```text
success
no route
timeout
429
500
malformed response
```

Production uses:

```text
TomTomClient
```

Testing uses:

```text
MockTomTomClient
```

---

# 68. SEED DATA

Create development seed data with:

- 3 roles
- Multiple users
- Multiple warehouses
- Multiple shelters
- Critical supplies
- Normal supplies
- Inventory transactions
- Convoys
- Drivers
- Vehicles
- Hazards
- Alerts
- Supply Swap requests
- Shelter demand

Seed data must be realistic enough to demonstrate all frontend states.

Do not use real personal information.

---

# 69. DATABASE MIGRATIONS

Use versioned migrations.

Never manually modify production schema.

Workflow:

```text
schema change
↓
migration
↓
migration test
↓
backup
↓
deployment
↓
migration
↓
application deployment
```

Do not use destructive automatic schema synchronization in production.

---

# 70. DEPLOYMENT

Target:

```text
Docker
+
Node.js
+
MySQL
```

Provide:

```text
Dockerfile
docker-compose.yml
.env.example
README.md
```

Production architecture:

```text
Internet
   ↓
Reverse Proxy / Load Balancer
   ↓
DISISTA API
   ↓
MySQL
   ↓
TomTom
```

Optional:

```text
Redis
```

for rate limiting, caching, WebSocket scaling, and background jobs when needed.

Do not add Redis unless there is a clear requirement.

---

# 71. BACKGROUND JOBS

Use a queue for non-blocking tasks when necessary:

```text
alert generation
route refresh
expired Supply Swap cleanup
expired hazard cleanup
notification delivery
report generation
```

For initial implementation, keep jobs modular so BullMQ/Redis can be added without rewriting business logic.

---

# 72. BACKUP AND RECOVERY

Production database should have:

```text
automated backups
point-in-time recovery where available
backup retention policy
restore testing
```

Do not claim the system is production-ready without a tested recovery procedure.

---

# 73. CORS

Allow only known frontend origins.

Example:

```env
CORS_ORIGINS=https://app.example.com
```

Do not use:

```text
*
```

for production authenticated APIs.

---

# 74. RATE LIMITING

Apply global rate limits and stricter limits for:

```text
login
refresh
hazard creation
location updates
sync
route calculation
```

Do not rate-limit so aggressively that legitimate field operations fail.

---

# 75. IDEMPOTENCY

All consequential POST operations should support idempotency where appropriate.

Especially:

```text
delivery confirmation
Supply Swap approval
inventory receive
offline sync
hazard submission
convoy dispatch
```

Support:

```text
Idempotency-Key
```

or a domain-specific `clientEventId`.

---

# 76. CONCURRENCY

Handle simultaneous operations.

Example:

Two warehouse managers attempt to reserve:

```text
500 insulin units
```

when only:

```text
600 available
```

The database transaction must ensure the combined reservation never exceeds availability.

Use:

```text
row locking
transaction isolation
atomic updates
```

Do not rely on:

```text
SELECT available
then UPDATE later
```

without locking.

---

# 77. TIME HANDLING

Store timestamps in UTC.

Use:

```text
DATETIME / TIMESTAMP
```

consistently.

Frontend may display local time.

Backend should not mix:

```text
IST
UTC
browser local time
```

without explicit conversion.

---

# 78. FILES / PHOTOS

If field drivers submit hazard photos:

Do not store large binary files directly in normal MySQL rows unless there is a deliberate requirement.

Prefer object storage.

Database stores:

```text
storage_key
mime_type
size
uploaded_by
created_at
```

Validate:

```text
file type
file size
extension
content type
```

---

# 79. NOTIFICATIONS

Build a notification abstraction.

Possible channels:

```text
in-app
WebSocket
email
SMS
```

For initial version, implement:

```text
in-app
WebSocket
```

Do not hard-code email/SMS providers into business services.

---

# 80. REPORTING

Provide endpoints:

```http
GET /api/v1/reports/operations
GET /api/v1/reports/inventory
GET /api/v1/reports/convoys
GET /api/v1/reports/hazards
GET /api/v1/reports/supply-swaps
```

Reports must be generated from authoritative database state.

Do not calculate critical report values from frontend cached state.

---

# 81. FRONTEND COMPATIBILITY

The backend must return fields in stable, predictable formats.

Avoid unnecessary breaking changes.

Create DTOs:

```text
DashboardDTO
WarehouseDTO
InventoryDTO
ShelterDTO
DemandDTO
HazardDTO
ConvoyDTO
RouteDTO
SupplySwapDTO
AlertDTO
UserDTO
```

Never expose ORM entities directly.

---

# 82. PRODUCTION QUALITY CHECKLIST

Before declaring completion:

```text
[ ] TypeScript builds successfully
[ ] No TypeScript errors
[ ] No lint errors
[ ] No unhandled promise rejections
[ ] Environment validation works
[ ] Database migrations work
[ ] Database seed works
[ ] Authentication works
[ ] RBAC works
[ ] All protected endpoints reject unauthenticated users
[ ] Ownership checks work
[ ] Inventory transactions are atomic
[ ] Supply Swap transactions are atomic
[ ] Delivery is idempotent
[ ] Offline sync is idempotent
[ ] TomTom failures are handled
[ ] TomTom key is never exposed
[ ] API documentation generated
[ ] Health checks work
[ ] Logging works
[ ] Error format is consistent
[ ] CORS is restricted
[ ] Rate limiting works
[ ] SQL injection protection verified
[ ] IDOR protection verified
[ ] Tests pass
[ ] Docker build succeeds
[ ] Docker compose starts
[ ] Production environment variables documented
```

---

# 83. IMPLEMENTATION ORDER

Do NOT implement everything randomly.

Follow this sequence.

## PHASE 0 — DISCOVERY

1. Inspect every frontend HTML file.
2. Inspect every frontend JS file.
3. Extract API calls.
4. Identify required fields.
5. Identify role-specific UI.
6. Identify current localStorage/sessionStorage usage.
7. Build frontend-to-backend contract.
8. Identify missing backend requirements.

Deliver:

```text
API_CONTRACT.md
```

---

## PHASE 1 — PROJECT FOUNDATION

Create:

```text
Node.js
TypeScript
Fastify
Prisma
MySQL
environment validation
logging
error handling
Swagger
security plugins
```

Verify:

```text
npm run build
npm run lint
npm test
```

---

## PHASE 2 — DATABASE

Create:

```text
schema
migrations
indexes
constraints
seed data
```

Verify:

```text
migration up
migration reset in development
seed
queries
transactions
```

---

## PHASE 3 — AUTHENTICATION

Implement:

```text
login
refresh
logout
me
RBAC
authorization middleware
```

Test all three roles.

---

## PHASE 4 — WAREHOUSE + INVENTORY

Implement:

```text
warehouses
supplies
inventory
inventory transactions
threshold calculations
```

Test concurrency.

---

## PHASE 5 — SHELTERS + DEMAND

Implement:

```text
shelters
demand
shortage calculation
urgency
critical shortage alerts
```

---

## PHASE 6 — HAZARDS

Implement:

```text
hazard reports
verification
resolution
hazard history
field reports
```

---

## PHASE 7 — CONVOYS

Implement:

```text
vehicles
drivers
convoys
cargo
status history
delivery
```

---

## PHASE 8 — TOMTOM

Implement:

```text
TomTom client
routing
geocoding if required
traffic/routing information where supported
timeouts
retry
error handling
route persistence
```

---

## PHASE 9 — ROUTE RISK

Connect:

```text
TomTom route
+
DISISTA hazards
+
field reports
=
operational route risk
```

---

## PHASE 10 — SUPPLY SWAP

Implement:

```text
offer
request
approval
reservation
transfer
convoy link
delivery
inventory update
```

---

## PHASE 11 — ALERTS

Connect operational events to alerts.

---

## PHASE 12 — REAL-TIME

Implement:

```text
WebSocket
event broadcasting
role-scoped subscriptions
```

---

## PHASE 13 — FIELD MODE + SYNC

Implement:

```text
clientEventId
offline queue
push
deduplication
conflict handling
acknowledgement
```

---

## PHASE 14 — DASHBOARDS

Implement role-specific dashboard aggregation endpoints.

---

## PHASE 15 — REPORTING

Implement operational reports.

---

## PHASE 16 — HARDENING

Run:

```text
security tests
authorization tests
load tests
failure tests
TomTom failure tests
database failure tests
offline tests
```

---

## PHASE 17 — DEPLOYMENT

Verify:

```text
Docker build
Docker startup
migration
health checks
logs
environment configuration
HTTPS/reverse proxy compatibility
```

---

# 84. AGENT OPERATING RULES

If an AI coding agent is implementing this:

### Rule 1
Do not make assumptions silently.

If frontend behavior is unclear, inspect the existing frontend first.

### Rule 2
Do not rewrite the frontend.

### Rule 3
Do not remove existing workflows.

### Rule 4
Do not expose API secrets.

### Rule 5
Do not trust frontend authorization.

### Rule 6
Do not duplicate business logic in multiple modules.

### Rule 7
Do not use fake operational data in production paths.

### Rule 8
Do not swallow errors.

### Rule 9
Do not return HTTP 200 for failed operations.

### Rule 10
Do not use database destructive operations in production.

### Rule 11
Do not make external API calls without timeout handling.

### Rule 12
Do not allow duplicate offline operations.

### Rule 13
Do not modify inventory without a transaction.

### Rule 14
Do not modify critical operational history destructively.

### Rule 15
Every new feature must have:
- validation
- authorization
- error handling
- tests
- logging where consequential
- documentation

---

# 85. DEFINITION OF DONE

The backend is considered complete only when:

```text
Frontend
   ↓
Login
   ↓
Authenticated session
   ↓
Role-based dashboard
   ↓
Live map
   ↓
Hazards
   ↓
Convoys
   ↓
Warehouses
   ↓
Inventory
   ↓
Shelters
   ↓
Demand
   ↓
Supply Swap
   ↓
Transfers
   ↓
Routes
   ↓
TomTom
   ↓
Field updates
   ↓
Offline sync
   ↓
Alerts
   ↓
Delivery
   ↓
Inventory reconciliation
```

works as one connected operational system.

---

# 86. FINAL ACCEPTANCE TEST

Run a complete disaster scenario:

### Scenario

1. Warehouse A has surplus potable water.
2. Shelter X has a critical water shortage.
3. Warehouse Manager creates Supply Swap.
4. Authorized user approves it.
5. Inventory is reserved.
6. Convoy is created.
7. TomTom route is calculated.
8. A field driver receives the convoy.
9. Driver begins route.
10. A flood hazard is reported.
11. Hazard becomes active.
12. Existing route becomes stale.
13. Alert is generated.
14. Control Room sees the alert.
15. Driver receives updated operational instruction.
16. Driver continues using Field Mode.
17. Driver temporarily loses connectivity.
18. Driver submits an offline hazard observation.
19. Connectivity returns.
20. Sync uploads the observation.
21. Duplicate sync attempt is rejected safely.
22. Driver reaches destination.
23. Delivery is confirmed.
24. Source inventory is reconciled.
25. Destination inventory is increased.
26. Shelter shortage is recalculated.
27. Critical shortage alert is resolved.
28. Audit history contains all consequential actions.

If this complete workflow passes, the backend architecture is functioning as intended.

---

# 87. IMPORTANT PRODUCTION PRINCIPLE

Do not build DISISTA CONTROL as:

```text
Frontend
+
CRUD API
+
Map API
```

Build it as:

```text
Operational State Platform
```

The backend must maintain relationships between:

```text
WHAT SUPPLIES EXIST?
        ↓
WHERE ARE THEY?
        ↓
WHO NEEDS THEM?
        ↓
WHAT HAZARDS AFFECT MOVEMENT?
        ↓
WHICH CONVOY IS MOVING THEM?
        ↓
IS THE ROUTE STILL VALID?
        ↓
WHAT DID THE FIELD TEAM OBSERVE?
        ↓
WHAT ACTION WAS TAKEN?
        ↓
WAS THE SUPPLY DELIVERED?
        ↓
DID THE SHORTAGE ACTUALLY CHANGE?
```

That relationship is the core of DISISTA CONTROL.

---

# 88. FINAL COMMAND TO THE CODING AGENT

**Act as a Senior Backend Engineer, Backend Architect, Database Engineer, Security Engineer, and API Engineer.**

First inspect the existing frontend.

Then produce:

```text
1. API_CONTRACT.md
2. database schema
3. migrations
4. backend architecture
5. authentication
6. RBAC
7. inventory services
8. shelter services
9. hazard services
10. convoy services
11. route services
12. TomTom integration
13. Supply Swap
14. alerts
15. WebSocket events
16. offline sync
17. dashboard aggregation
18. reports
19. tests
20. Docker configuration
21. environment documentation
22. production README
```

Build incrementally.

After every phase:

```text
install
→ build
→ lint
→ test
→ inspect errors
→ fix
→ rerun
```

Never move forward while the previous phase is broken.

At the end verify:

```text
npm run build
npm run lint
npm test
docker build
docker compose up
health endpoint
database migration
database seed
frontend API integration
```

**Do not claim production-ready until the complete acceptance scenario passes and all critical tests pass.**

---

# 89. ENVIRONMENT VARIABLE POLICY

The developer will provide the TomTom API key separately.

Use:

```env
TOMTOM_API_KEY=<provided-by-developer>
```

Never place the real key inside:

```text
source code
Git
README
frontend JavaScript
HTML
Dockerfile
database
logs
screenshots
API responses
```

If the key is supplied during development, store it only in the local `.env` file or approved secret manager.

---

# 90. FINAL ARCHITECTURE SUMMARY

```text
                    ┌──────────────────────┐
                    │ DISISTA FRONTEND     │
                    │ HTML / CSS / JS      │
                    └──────────┬───────────┘
                               │ HTTPS
                               ▼
                    ┌──────────────────────┐
                    │ FASTIFY API          │
                    │ TypeScript            │
                    └──────────┬───────────┘
                               │
             ┌─────────────────┼──────────────────┐
             │                 │                  │
             ▼                 ▼                  ▼
      ┌────────────┐    ┌──────────────┐   ┌─────────────┐
      │ Auth/RBAC  │    │ Domain       │   │ TomTom      │
      │ Security   │    │ Services     │   │ Adapter     │
      └────────────┘    └──────┬───────┘   └──────┬──────┘
                               │                  │
                               ▼                  ▼
                         ┌───────────┐      ┌─────────────┐
                         │  MySQL    │      │ TomTom APIs │
                         │  8.x      │      └─────────────┘
                         └───────────┘

Domain services:
────────────────────────────────────────────
Dashboard
Warehouses
Inventory
Shelters
Hazards
Convoys
Routes
Supply Swap
Alerts
Field Mode
Offline Sync
Reports
Settings
────────────────────────────────────────────

Core operational loop:

Hazard
  ↓
Route impact
  ↓
Convoy risk
  ↓
Alert
  ↓
Field action
  ↓
Delivery
  ↓
Inventory update
  ↓
Shelter availability
  ↓
Operational state updated
```

**This is the master backend implementation specification. Preserve the frontend, build the backend around the existing UI/UX contracts, keep TomTom behind the server, use MySQL as the authoritative transactional data store, and make every critical relief operation auditable, role-controlled, idempotent, and failure-tolerant.**
