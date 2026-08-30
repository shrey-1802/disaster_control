# DISISTA CONTROL — 8 Standalone Screen Prompts

Each block below is fully self-contained — copy just the one you need into your agent, in any order, in any session. All 8 repeat the shared design system so none of them depend on another block being read first.

---

## PROMPT 1 — Login (`login.html`)

You're extending the existing Relief Supply Chain Resilience & Rerouting System frontend (vanilla HTML/CSS/JS), part of the DISISTA CONTROL platform ("Relief Route Intelligence"). This task is scoped to ONE screen: `login.html`. Reuse existing auth/routing scaffolding already in the codebase — don't duplicate it. Where something isn't specified, make a production-grade decision and note it in a short comment; don't stop to ask.

**Design system:** Deep navy/indigo canvas; violet/purple accent on primary actions; status colors Green=Safe/Confirmed, Amber=Caution/Warning, Red/Pink=Critical, Purple=Active/Info, Gray=Neutral. Logo: circular "D," white on dark, next to "DISISTA CONTROL" + tagline "Relief Route Intelligence." Tab title: `DISISTA CONTROL — Operational Portal`.

**Screen spec:** No top nav on this screen (pre-auth). Centered card: "Portal Sign In" + "Select Role Above" status badge, subtitle "Enter operational credentials to access your designated command module." Fields: Target Operational Role (dropdown: Control Room / District Admin / Warehouse Manager / Field Driver), Operator Identification / Badge ID (text), Security Passcode (password) — inputs use a light mint-green fill against the dark page. Primary CTA: "AUTHENTICATE & ENTER PORTAL →." Below the card, a separate white "QUICK DEMO ONE-CLICK LOGIN" panel with 4 buttons (2×2 grid) that instantly log in as each of the 4 roles — build as a dev-only shortcut and gate it out of production builds.

**Behavior:** On successful auth, set the session role and route to the appropriate default landing screen (Live Map is a reasonable default for all roles). The selected role must persist into the app shell (nav, permissions) for every screen that follows.

---

## PROMPT 2 — Live Map (`live-map.html`)

You're extending the existing Relief Supply Chain Resilience & Rerouting System frontend (vanilla HTML/CSS/JS), part of the DISISTA CONTROL platform ("Relief Route Intelligence"). This task is scoped to ONE screen: `live-map.html`. Reuse existing auth, routing, and shared components already in the codebase — don't duplicate them. Where something isn't specified, make a production-grade decision and note it in a short comment; don't stop to ask.

**Design system:** Deep navy/indigo canvas app-wide; real content sits in white/near-white cards. Violet/purple accent on primary buttons and active nav. Status colors: Green=Safe/Confirmed, Amber=Caution/Warning, Red/Pink=Critical/Blocked, Purple=Active/Info, Gray=Neutral. Persistent two-row top nav on every authenticated screen: Row 1 = logo "D" + "DISISTA CONTROL" + tagline (left) → Live Map, Convoy Dispatch, Shelter Board, Hazard Log, Supply Swap (center) → "SYNCED [x] AGO" pill, Field Mode ON/OFF toggle, role/context badge, Logout (right). Row 2 = Alerts, Settings. Active nav item fills purple. Tab title: `DISISTA CONTROL — Live Operational Map`.

**Screen spec:** No eyebrow label — the full-bleed map is the primary content. Map engine: Leaflet + OpenStreetMap tiles, footer attribution "Leaflet | © OpenStreetMap contributors | DISISTA CONTROL." Left floating panel: "Network Layers" ("Reset View" button), toggleable overlays with live counts (Convoys, Hazards, Shelters, Supply Hubs), a "Status Tier Legend" (Safe / Caution / Blocked), and a "Road Block Command" panel whose broadcast button pushes live rerouting alerts to active convoys. Right floating panel: "Network Inspector" — idle guidance ("Click any convoy arrow, hazard marker, or shelter icon...") until an entity is clicked, then shows telemetry / reroute calculations / hazard verification for it, plus a "Block a Road Segment" action.

**Access control on this screen:** Control Room — full network access, including road blocking. District Admin — district operations only, no road blocking. Warehouse Manager — own warehouse, its shelters, convoys, hazards, and routes only, no road blocking. Field Driver — assigned route plus relevant hazards only, no road blocking. Gate the "Road Block Command" panel and "Block a Road Segment" action to Control Room only — hide the controls entirely for other roles rather than disabling them.

---

## PROMPT 3 — Convoy Dispatch (`convoy-dispatch.html`)

You're extending the existing Relief Supply Chain Resilience & Rerouting System frontend (vanilla HTML/CSS/JS), part of the DISISTA CONTROL platform ("Relief Route Intelligence"). This task is scoped to ONE screen: `convoy-dispatch.html`. Reuse existing auth, routing, and shared components already in the codebase — don't duplicate them. Where something isn't specified, make a production-grade decision and note it in a short comment; don't stop to ask.

**Design system:** Deep navy/indigo canvas app-wide; real content sits in white/near-white cards. Violet/purple accent on primary buttons and active nav. Status colors: Green=Safe/Confirmed, Amber=Caution/Warning, Red/Pink=Critical, Purple=Active/Info, Gray=Neutral. Persistent two-row top nav on every authenticated screen: Row 1 = logo "D" + "DISISTA CONTROL" + tagline (left) → Live Map, Convoy Dispatch, Shelter Board, Hazard Log, Supply Swap (center) → "SYNCED [x] AGO" pill, Field Mode ON/OFF toggle, role/context badge, Logout (right). Row 2 = Alerts, Settings. Active nav item fills purple. Tab title: `DISISTA CONTROL — Convoy Dispatch`.

**Screen spec:** Eyebrow label above content: "FLEET MISSION CONTROL." KPI row (4 white cards): Total Active Missions, On Route (Safe), Rerouted (In Transit), Stranded/High Risk — each with a big bold number and a muted description line. "+ Dispatch New Convoy" primary button, top right. Search bar: "Search by convoy name, driver, cargo, origin, or destination..." Filter row: Cargo Priority (dropdown), Convoy Status (dropdown), Sort By (dropdown, default "Composite Risk Index (High → Low)"), "Reset Filters" button. Table columns: checkbox | Convoy ID & Cargo | Origin → Destination | Composite Risk Index (colored horizontal bar) | Status Tier (badge, e.g. On Route / Rerouted) | Driver & Ack Status (badge, e.g. Acknowledged / Ack Timeout) | ETA | Actions.

**Access control on this screen:** Control Room — full table, can create/monitor/reroute/manage all convoys. District Admin — full table filtered to their district, can monitor and coordinate rerouting but not create new convoys. Warehouse Manager — table filtered to convoys tied to their warehouse, view-only (no dispatch/reroute actions). Field Driver — should see only their own assigned convoy, not the full table; build a simplified single-mission view for this role rather than reusing the multi-row table. Filter all data server-side by role — don't rely on client-side hiding alone.

---

## PROMPT 4 — Shelter Board (`shelter-board.html`)

You're extending the existing Relief Supply Chain Resilience & Rerouting System frontend (vanilla HTML/CSS/JS), part of the DISISTA CONTROL platform ("Relief Route Intelligence"). This task is scoped to ONE screen: `shelter-board.html`. Reuse existing auth, routing, and shared components already in the codebase — don't duplicate them. Where something isn't specified, make a production-grade decision and note it in a short comment; don't stop to ask.

**Design system:** Deep navy/indigo canvas app-wide; real content sits in white/near-white cards. Violet/purple accent on primary buttons and active nav. Status colors: Green=Safe/Confirmed, Amber=Caution/Warning, Red/Pink=Critical, Purple=Active/Info, Gray=Neutral. Persistent two-row top nav on every authenticated screen: Row 1 = logo "D" + "DISISTA CONTROL" + tagline (left) → Live Map, Convoy Dispatch, Shelter Board, Hazard Log, Supply Swap (center) → "SYNCED [x] AGO" pill, Field Mode ON/OFF toggle, role/context badge, Logout (right). Row 2 = Alerts, Settings. Active nav item fills purple. Tab title: `DISISTA CONTROL — Shelter Board`.

**Screen spec:** Eyebrow label: "REGIONAL DEMAND TELEMETRY." KPI row (4 white cards): Monitored Shelters, Isolated (No Road Access), Critical Supply (<1.5 Days), Adequate Cover (>3 Days). "+ Request Emergency Rebalancing" primary button, top right, alongside a current-scope badge (e.g. "District 4 (Northern Rift)"). Search bar: "Search shelters by name, region, or supply type..." Filter row: Urgency Tier (dropdown), Shortage Type (dropdown), "Reset Filters" button. Shelter cards (grid): cover-days badge (e.g. "1.5 DAYS COVER"), big bold days-remaining number, population count, district name, a supply-trend sparkline, "Incoming: Convoy [id] (ETA [time])," and "View Sparkline" / "Request Supply Swap →" buttons. Isolated shelters get a distinct card variant — no cover-days data, instead an "◆ ISOLATED (NO ROAD ACCESS)" badge and an isolation notice naming the specific blocked bridge/corridor and confirming no warehouse has a safe path.

**Access control on this screen:** Control Room — full network visibility across all shelters. District Admin — district-scoped shelters and shortages. Warehouse Manager — shelters relevant to their warehouse's supply catchment, demand/shortage view only (no rebalancing request action). Field Driver — should see only their assigned destination shelter's info, not the full board; build a simplified single-shelter view for this role.

---

## PROMPT 5 — Hazard Log (`hazard-log.html`)

You're extending the existing Relief Supply Chain Resilience & Rerouting System frontend (vanilla HTML/CSS/JS), part of the DISISTA CONTROL platform ("Relief Route Intelligence"). This task is scoped to ONE screen: `hazard-log.html`. Reuse existing auth, routing, and shared components already in the codebase — don't duplicate them. Where something isn't specified, make a production-grade decision and note it in a short comment; don't stop to ask.

**Design system:** Deep navy/indigo canvas app-wide; real content sits in white/near-white cards. Violet/purple accent on primary buttons and active nav. Status colors: Green=Safe/Confirmed, Amber=Caution/Warning, Red/Pink=Critical/Blocked/Impassable, Purple=Active/Info, Gray=Neutral. Persistent two-row top nav on every authenticated screen: Row 1 = logo "D" + "DISISTA CONTROL" + tagline (left) → Live Map, Convoy Dispatch, Shelter Board, Hazard Log, Supply Swap (center) → "SYNCED [x] AGO" pill, Field Mode ON/OFF toggle, role/context badge, Logout (right). Row 2 = Alerts, Settings. Active nav item fills purple. Tab title: `DISISTA CONTROL — Field Hazard Reporting`.

**Screen spec:** Eyebrow label: "FIELD INCIDENT REPORTING," with a "Field Ops Active" status badge top right. Two-column layout. Left: "Submit Field Hazard Report" card, badge "Auto-GPS Geolocated." Fields: Hazard Location / Road Segment (text, pre-filled from GPS, e.g. "Route 4 — Mile 14.2 (Lat 14.625, Lng 120.980)"), Observed Problem Type (dropdown, e.g. "🌊 Flash Flood / High Water Depth"), Severity Level (dropdown, e.g. "Hazardous (Caution — Slow Clearance)"), Observation Details (textarea, placeholder "Describe water depth, vehicle clearance limitations, or visible damage..."). Full-width submit button: "⚡ SUBMIT FIELD REPORT TO CONTROL ROOM →." Right: "Recent Hazard Reports Feed," labeled "Reverse Chronological." Each report card shows a status badge (RESTRICTED / IMPASSABLE / HAZARDOUS / HAZARDOUS (Unconfirmed)), Source (Field Observation / Field Driver (Unit N)), timestamp, and Confidence % with Confirmed/Unconfirmed state. Conflicting reports show an info note ("Fusion Conflict: Newer field report being used for routing pending Control Room verification.") plus a "✓ Verify Report & Promote Status" button.

**Access control on this screen:** Control Room — full feed, can view/verify/manage, including the "Verify & Promote Status" action. District Admin — district-scoped feed, can view and verify. Warehouse Manager — read-only view of hazards relevant to their warehouse/routes, no submit form. Field Driver — this is their primary screen: full access to the submit form, feed limited to reports relevant to their current route/mission.

---

## PROMPT 6 — Supply Swap (`supply-swap.html`)

You're extending the existing Relief Supply Chain Resilience & Rerouting System frontend (vanilla HTML/CSS/JS), part of the DISISTA CONTROL platform ("Relief Route Intelligence"). This task is scoped to ONE screen: `supply-swap.html`. Reuse existing auth, routing, and shared components already in the codebase — don't duplicate them. Where something isn't specified, make a production-grade decision and note it in a short comment; don't stop to ask.

**Design system:** Deep navy/indigo canvas app-wide; real content sits in white/near-white cards. Violet/purple accent on primary buttons, active nav, and active tab underline. Status colors: Green=Safe/Confirmed, Amber=Caution/Warning, Red/Pink=Critical, Purple=Active/Info, Gray=Neutral. Persistent two-row top nav on every authenticated screen: Row 1 = logo "D" + "DISISTA CONTROL" + tagline (left) → Live Map, Convoy Dispatch, Shelter Board, Hazard Log, Supply Swap (center) → "SYNCED [x] AGO" pill, Field Mode ON/OFF toggle, role/context badge, Logout (right). Row 2 = Alerts, Settings. Active nav item fills purple. Tab title: `DISISTA CONTROL — Inter-Warehouse Rebalancing`.

**Screen spec:** Eyebrow label: "INTER-WAREHOUSE REBALANCING SYSTEM," with a status badge "Read-Only Network Rollup (Control Room / District Admin)" and a "Shelter Need Ping" button. KPI row (4 white cards): Active Offers Posted, Pending Requests, Active Transfers, Critical Matches. Tabbed sub-view below: "Offer Supply" / "Request Supply" / "Active Transfers," active tab gets a purple underline. Offer Supply tab: list of warehouse cards, each with warehouse name, an "[N] Units Available" badge (green), and a progress bar showing the stock level.

**Access control on this screen:** Control Room and District Admin — read-only network rollup as shown by the badge; they can view offers/requests/transfers but cannot create or accept a swap. Warehouse Manager — full access: create offers, request supply, accept/track transfers. Field Driver — no access to this screen at all; exclude it from their nav entirely.

---

## PROMPT 7 — Alerts (`alerts.html`)

You're extending the existing Relief Supply Chain Resilience & Rerouting System frontend (vanilla HTML/CSS/JS), part of the DISISTA CONTROL platform ("Relief Route Intelligence"). This task is scoped to ONE screen: `alerts.html`. Reuse existing auth, routing, and shared components already in the codebase — don't duplicate them. Where something isn't specified, make a production-grade decision and note it in a short comment; don't stop to ask.

**Design system:** Deep navy/indigo canvas app-wide; real content sits in white/near-white cards. Violet/purple accent on primary buttons and active nav. Status colors: Green=Safe/Confirmed, Amber=Caution/Warning, Red/Pink=Critical, Purple=Active/Info, Gray=Neutral. Persistent two-row top nav on every authenticated screen: Row 1 = logo "D" + "DISISTA CONTROL" + tagline (left) → Live Map, Convoy Dispatch, Shelter Board, Hazard Log, Supply Swap (center) → "SYNCED [x] AGO" pill, Field Mode ON/OFF toggle, role/context badge, Logout (right). Row 2 = Alerts, Settings (Alerts active on this screen). Active nav item fills purple. Tab title: `DISISTA CONTROL — Alerts Inbox`.

**Screen spec:** Eyebrow label: "COMMAND CENTER ALERTS," with a live critical-count badge top right (e.g. "9 Critical Active"). Main card: "System-Wide Critical Alerts Feed" with an "Acknowledge All" button top right. Each alert item shows a status pill row (e.g. CRITICAL, ESCALATED TO HQ, ACKNOWLEDGED), a description of the incident, a "Reported [time]" timestamp, and per-alert action buttons ("Acknowledge Alert," "Escalate to HQ Command") — once an action is taken, that button is replaced by the resulting status pill (e.g. "Acknowledge Alert" → "✓ ACKNOWLEDGED" pill) rather than staying clickable.

**Access control on this screen:** Control Room — full feed, view/acknowledge/escalate everything. District Admin — district-scoped alerts, can acknowledge and escalate to Control Room. Warehouse Manager — warehouse/supply-related alerts only. Field Driver — mission-critical alerts only, filtered to their own convoy/route. Filter the feed server-side per role rather than showing everything and hiding client-side.

---

## PROMPT 8 — Settings (`settings.html`)

You're extending the existing Relief Supply Chain Resilience & Rerouting System frontend (vanilla HTML/CSS/JS), part of the DISISTA CONTROL platform ("Relief Route Intelligence"). This task is scoped to ONE screen: `settings.html`. Reuse existing auth, routing, and shared components already in the codebase — don't duplicate them. Where something isn't specified, make a production-grade decision and note it in a short comment; don't stop to ask.

**Design system:** Deep navy/indigo canvas app-wide; real content sits in white/near-white cards. Violet/purple accent on primary buttons and active nav. Status colors: Green=Safe/Confirmed/Healthy, Amber=Caution/Warning, Red/Pink=Critical, Purple=Active/Info, Gray=Neutral. Persistent two-row top nav on every authenticated screen: Row 1 = logo "D" + "DISISTA CONTROL" + tagline (left) → Live Map, Convoy Dispatch, Shelter Board, Hazard Log, Supply Swap (center) → "SYNCED [x] AGO" pill, Field Mode ON/OFF toggle, role/context badge, Logout (right). Row 2 = Alerts, Settings (Settings active on this screen). Active nav item fills purple. Tab title: `DISISTA CONTROL — System Settings`.

**Screen spec:** Eyebrow label: "PLATFORM CONFIGURATION," with a "System Healthy" badge top right. Card grid (2 columns): "Field Mode Accessibility Override" (badge "Token Override," description of what it does — larger touch targets ≥44px, 18px base text, thicker hairline borders for daylight field-tablet use — full-width "Disable Field Mode" / "Enable Field Mode" toggle button); "Offline Sync Queue" (badge "Queue Empty" / count, description of local queuing and flush-on-reconnect behavior with a 3-attempt retry limit, "Force Sync Now" / "Clear Queue" buttons); "Interface Language" (badge "i18n Ready," dropdown "System Display Language" e.g. "English (United States / Government Default)"); "Data Freshness Telemetry" (badge "Live," staleness indicator); "Keyboard Shortcuts" (badge "Global," reference table, e.g. Ctrl+K → "Open global command palette"); "Your Account" (badge showing current role, e.g. "HQ Operations," fields for Role, Access Level [screen count], Field Mode state, and a "Sign Out" button).

**Access control on this screen:** Control Room — sees the full page exactly as specified above. District Admin and Warehouse Manager — see a role-appropriate subset (their own account card, language, Field Mode override if relevant to their device) but not network-wide admin cards like Data Freshness Telemetry. Field Driver — sees a minimal view centered on Field Mode Override and Offline Sync Queue (their two full-access items per the platform's access matrix) plus their Account card; exclude admin-only cards entirely rather than disabling them.

**Behavior:** Field Mode must be a real global state (persisted, reflected in the top nav toggle on every screen) — implement it as an actual CSS/state toggle, not cosmetic copy. Offline Sync must actually queue actions in local persistent storage and flush them on reconnect with the stated 3-attempt retry limit.
