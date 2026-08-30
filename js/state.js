/**
 * DISISTA CONTROL — Centralized Reactive State Management & Mock Database
 * Backed by LocalStorage with real-time mutators and seed initialization.
 */

const STORAGE_KEY = 'DISISTA_CONTROL_STATE_V2';

// Standard Indian Disaster Relief Corridor Seed Data (Himalayan / River Basin Sector)
const DEFAULT_STATE = {
  activeSector: {
    name: "Northern Himalayan Relief Corridor (Sector 7)",
    pincode: "248001",
    district: "Dehradun - Rishikesh Disaster Division",
    state: "Uttarakhand",
    lat: 30.3165,
    lng: 78.0322,
    zoom: 11
  },
  
  networkRiskScore: 78, // 78 / 100 — HIGH
  roadAccessibility: {
    accessiblePct: 72,
    restrictedPct: 18,
    blockedPct: 10
  },

  warehouses: [
    {
      id: "WH-001",
      name: "Central Logistics Hub Alpha",
      locationName: "Dehradun North Terminal",
      lat: 30.3450,
      lng: 78.0550,
      capacity: 50000,
      inventory: [
        { id: "ITEM-INS", name: "Insulin Vials (Cold Chain)", category: "Cold-Chain Medical", total: 2400, reserved: 1800, criticalThreshold: 1000, unit: "Vials", temp: "3.4°C" },
        { id: "ITEM-BLD", name: "O-Negative Blood Bags", category: "Cold-Chain Medical", total: 600, reserved: 450, criticalThreshold: 300, unit: "Bags", temp: "3.8°C" },
        { id: "ITEM-WTR", name: "Potable Water Purifiers (10L)", category: "Essentials", total: 12500, reserved: 3200, criticalThreshold: 2500, unit: "Packs", temp: "N/A" },
        { id: "ITEM-NUT", name: "Infant Nutrition Powder", category: "Nutrition", total: 4200, reserved: 1100, criticalThreshold: 800, unit: "Tins", temp: "N/A" },
        { id: "ITEM-TRM", name: "Trauma Surgical Kits", category: "Medical", total: 350, reserved: 120, criticalThreshold: 100, unit: "Kits", temp: "N/A" }
      ]
    },
    {
      id: "WH-002",
      name: "Regional Depot Bravo",
      locationName: "Rishikesh Bypass Hub",
      lat: 30.1080,
      lng: 78.2950,
      capacity: 35000,
      inventory: [
        { id: "ITEM-INS", name: "Insulin Vials (Cold Chain)", category: "Cold-Chain Medical", total: 350, reserved: 300, criticalThreshold: 800, unit: "Vials", temp: "4.1°C" },
        { id: "ITEM-BLD", name: "O-Negative Blood Bags", category: "Cold-Chain Medical", total: 180, reserved: 140, criticalThreshold: 200, unit: "Bags", temp: "3.9°C" },
        { id: "ITEM-WTR", name: "Potable Water Purifiers (10L)", category: "Essentials", total: 8900, reserved: 1500, criticalThreshold: 2000, unit: "Packs", temp: "N/A" },
        { id: "ITEM-NUT", name: "Infant Nutrition Powder", category: "Nutrition", total: 850, reserved: 600, criticalThreshold: 700, unit: "Tins", temp: "N/A" },
        { id: "ITEM-TRM", name: "Trauma Surgical Kits", category: "Medical", total: 95, reserved: 80, criticalThreshold: 100, unit: "Kits", temp: "N/A" }
      ]
    },
    {
      id: "WH-003",
      name: "Emergency Reserve Charlie",
      locationName: "Haridwar Staging Area",
      lat: 29.9457,
      lng: 78.1642,
      capacity: 40000,
      inventory: [
        { id: "ITEM-INS", name: "Insulin Vials (Cold Chain)", category: "Cold-Chain Medical", total: 3200, reserved: 600, criticalThreshold: 900, unit: "Vials", temp: "3.2°C" },
        { id: "ITEM-BLD", name: "O-Negative Blood Bags", category: "Cold-Chain Medical", total: 850, reserved: 200, criticalThreshold: 250, unit: "Bags", temp: "3.5°C" },
        { id: "ITEM-WTR", name: "Potable Water Purifiers (10L)", category: "Essentials", total: 14000, reserved: 2800, criticalThreshold: 3000, unit: "Packs", temp: "N/A" },
        { id: "ITEM-NUT", name: "Infant Nutrition Powder", category: "Nutrition", total: 3100, reserved: 500, criticalThreshold: 600, unit: "Tins", temp: "N/A" },
        { id: "ITEM-TRM", name: "Trauma Surgical Kits", category: "Medical", total: 520, reserved: 90, criticalThreshold: 120, unit: "Kits", temp: "N/A" }
      ]
    }
  ],

  shelters: [
    {
      id: "S-012",
      name: "Shelter S-012 (Ganga Valley High School)",
      location: "Upper Rishikesh Valley",
      lat: 30.1350,
      lng: 78.3220,
      occupancy: 640,
      capacity: 700,
      daysOfCover: 1.2,
      status: "critical", // critical, caution, safe
      isIsolated: true,
      sparklineData: [2.8, 2.4, 1.9, 1.6, 1.2],
      needs: [
        { item: "Insulin Vials", qtyNeeded: 100, currentStock: 12, unit: "Vials", urgency: "critical" },
        { item: "O-Negative Blood", qtyNeeded: 25, currentStock: 4, unit: "Bags", urgency: "critical" },
        { item: "Potable Water (10L)", qtyNeeded: 500, currentStock: 140, unit: "Packs", urgency: "caution" }
      ],
      incomingConvoyId: "C-014"
    },
    {
      id: "S-008",
      name: "Shelter S-008 (Doon Community Complex)",
      location: "Clement Town Sector 4",
      lat: 30.2650,
      lng: 78.0120,
      occupancy: 420,
      capacity: 500,
      daysOfCover: 1.8,
      status: "caution",
      isIsolated: false,
      sparklineData: [3.5, 3.1, 2.6, 2.1, 1.8],
      needs: [
        { item: "Potable Water (10L)", qtyNeeded: 800, currentStock: 250, unit: "Packs", urgency: "caution" },
        { item: "Infant Nutrition", qtyNeeded: 120, currentStock: 30, unit: "Tins", urgency: "caution" }
      ],
      incomingConvoyId: "C-021"
    },
    {
      id: "S-021",
      name: "Shelter S-021 (Shivalik Relief Camp)",
      location: "Sahaspur West Sector",
      lat: 30.3850,
      lng: 77.8200,
      occupancy: 310,
      capacity: 450,
      daysOfCover: 3.5,
      status: "safe",
      isIsolated: false,
      sparklineData: [3.8, 3.7, 3.6, 3.5, 3.5],
      needs: [
        { item: "Trauma Surgical Kits", qtyNeeded: 20, currentStock: 15, unit: "Kits", urgency: "safe" }
      ],
      incomingConvoyId: null
    },
    {
      id: "S-014",
      name: "Shelter S-014 (Rajaji Buffer Camp)",
      location: "Chila Foothills Corridor",
      lat: 29.9850,
      lng: 78.2100,
      occupancy: 580,
      capacity: 600,
      daysOfCover: 0.9,
      status: "critical",
      isIsolated: true,
      sparklineData: [2.1, 1.7, 1.3, 1.0, 0.9],
      needs: [
        { item: "Insulin Vials", qtyNeeded: 150, currentStock: 8, unit: "Vials", urgency: "critical" },
        { item: "Potable Water (10L)", qtyNeeded: 900, currentStock: 120, unit: "Packs", urgency: "critical" }
      ],
      incomingConvoyId: "C-019"
    }
  ],

  convoys: [
    {
      id: "C-014",
      code: "CONVOY-DELTA-14",
      driverName: "Rajesh Kumar (Operator ID: DRV-401)",
      driverPhone: "+91 98765 43210",
      originId: "WH-001",
      originName: "Central Logistics Hub Alpha",
      destId: "S-012",
      destName: "Shelter S-012",
      cargo: "100 Insulin Vials + 20 Blood Bags",
      cargoCategory: "Cold-Chain Medical",
      coldChainTemp: "3.6°C",
      status: "delayed", // on_route, delayed, rerouted, high_risk, delivered
      riskLevel: "high", // low, medium, high, critical
      etaMinutes: 45,
      currentLat: 30.2200,
      currentLng: 78.1800,
      routeId: "ROUTE-58-B",
      routeStatus: "Flash Flood Warning 2km Ahead",
      alertMessage: "Submerged bridge detected on Primary Arterial Route 4. Alternative hill pass required."
    },
    {
      id: "C-021",
      code: "CONVOY-ECHO-21",
      driverName: "Priya Sharma (Operator ID: DRV-402)",
      driverPhone: "+91 98765 43211",
      originId: "WH-003",
      originName: "Emergency Reserve Charlie",
      destId: "S-008",
      destName: "Shelter S-008",
      cargo: "500 Potable Water Packs + 80 Infant Nutrition",
      cargoCategory: "Essentials",
      coldChainTemp: "N/A",
      status: "on_route",
      riskLevel: "medium",
      etaMinutes: 28,
      currentLat: 30.1200,
      currentLng: 78.0800,
      routeId: "ROUTE-72-A",
      routeStatus: "Clear via Southern Bypass",
      alertMessage: null
    },
    {
      id: "C-019",
      code: "CONVOY-FOXTROT-19",
      driverName: "Vikram Singh (Operator ID: DRV-403)",
      driverPhone: "+91 98765 43212",
      originId: "WH-002",
      originName: "Regional Depot Bravo",
      destId: "S-014",
      destName: "Shelter S-014",
      cargo: "150 Insulin Vials + 400 Water Packs",
      cargoCategory: "Critical Medical",
      coldChainTemp: "3.9°C",
      status: "high_risk",
      riskLevel: "critical",
      etaMinutes: 62,
      currentLat: 30.0400,
      currentLng: 78.2400,
      routeId: "ROUTE-CHILA-01",
      routeStatus: "Active Landslide Debris Flow",
      alertMessage: "Road partially blocked at Mile 14. Speed reduced to 10 km/h."
    },
    {
      id: "C-008",
      code: "CONVOY-ALPHA-08",
      driverName: "Amitabh Sen (Operator ID: DRV-404)",
      driverPhone: "+91 98765 43213",
      originId: "WH-001",
      originName: "Central Logistics Hub Alpha",
      destId: "WH-002",
      destName: "Regional Depot Bravo",
      cargo: "Supply Swap: 800 Water Purifiers",
      cargoCategory: "Rebalance Transfer",
      coldChainTemp: "N/A",
      status: "rerouted",
      riskLevel: "low",
      etaMinutes: 35,
      currentLat: 30.2800,
      currentLng: 78.1400,
      routeId: "ROUTE-ALT-09",
      routeStatus: "Rerouted via Eastern Bypass",
      alertMessage: null
    }
  ],

  hazards: [
    {
      id: "HAZ-001",
      type: "flash_flood", // flash_flood, landslide, damaged_bridge, blocked_road, debris
      typeName: "Flash Flood & Inundation",
      locationName: "NH-58 River Crossing (Bridge 7)",
      lat: 30.1800,
      lng: 78.2300,
      severity: "critical", // low, medium, high, critical
      verified: true,
      verifiedBy: "HQ Operations Commander",
      reportedBy: "Convoy C-014 (Rajesh Kumar)",
      reportedAt: "18 mins ago",
      timestamp: Date.now() - 18 * 60 * 1000,
      description: "River tributary overflowed by 1.8 meters across a 120-meter stretch. Fast moving current impassable for relief trucks.",
      roadBlocked: true,
      affectedConvoys: ["C-014", "C-019"]
    },
    {
      id: "HAZ-002",
      type: "landslide",
      typeName: "Hillside Debris Flow & Rockfall",
      locationName: "Chila Hill Pass (Mile 14)",
      lat: 30.0500,
      lng: 78.2600,
      severity: "high",
      verified: true,
      verifiedBy: "District Admin Dehradun",
      reportedBy: "Field Observer Unit 3",
      reportedAt: "34 mins ago",
      timestamp: Date.now() - 34 * 60 * 1000,
      description: "Heavy mud and boulder accumulation blocking the northbound lane. Single-lane clearance in progress by heavy machinery.",
      roadBlocked: false,
      affectedConvoys: ["C-019"]
    },
    {
      id: "HAZ-003",
      type: "damaged_bridge",
      typeName: "Structural Bridge Fracture",
      locationName: "Song River Secondary Span",
      lat: 30.2500,
      lng: 78.1200,
      severity: "critical",
      verified: true,
      verifiedBy: "Civil Engineering Response Team",
      reportedBy: "District Emergency Patrol",
      reportedAt: "1 hr ago",
      timestamp: Date.now() - 60 * 60 * 1000,
      description: "Pillar foundation shifted after tremor. Weight capacity strictly reduced to under 3 tons. Heavy relief convoys must avoid.",
      roadBlocked: true,
      affectedConvoys: ["C-008"]
    },
    {
      id: "HAZ-004",
      type: "blocked_road",
      typeName: "Fallen High-Tension Cables",
      locationName: "Doiwala Arterial Junction",
      lat: 30.1700,
      lng: 78.1100,
      severity: "medium",
      verified: false,
      verifiedBy: null,
      reportedBy: "Field Driver DRV-405",
      reportedAt: "5 mins ago",
      timestamp: Date.now() - 5 * 60 * 1000,
      description: "Electrical poles collapsed across two lanes. State electricity board dispatched for de-energization.",
      roadBlocked: true,
      affectedConvoys: []
    }
  ],

  supplySwaps: [
    {
      id: "SWAP-101",
      fromWarehouseId: "WH-001",
      fromWarehouseName: "Hub Alpha (Central)",
      toWarehouseId: "WH-002",
      toWarehouseName: "Depot Bravo",
      item: "Insulin Vials (Cold Chain)",
      quantity: 500,
      unit: "Vials",
      reason: "Critical shortage at Shelter S-012 connected to Depot Bravo",
      status: "in_transit", // proposed, approved, in_transit, completed
      convoyId: "C-014",
      progressPct: 65,
      createdAt: "45 mins ago"
    },
    {
      id: "SWAP-102",
      fromWarehouseId: "WH-003",
      fromWarehouseName: "Reserve Charlie",
      toWarehouseId: "WH-002",
      toWarehouseName: "Depot Bravo",
      item: "Potable Water Purifiers (10L)",
      quantity: 1200,
      unit: "Packs",
      reason: "Surplus rebalancing to cover isolated valley shelters",
      status: "approved",
      convoyId: "C-008",
      progressPct: 30,
      createdAt: "1 hr ago"
    },
    {
      id: "SWAP-103",
      fromWarehouseId: "WH-003",
      fromWarehouseName: "Reserve Charlie",
      toWarehouseId: "WH-001",
      toWarehouseName: "Hub Alpha (Central)",
      item: "Infant Nutrition Powder",
      quantity: 400,
      unit: "Tins",
      reason: "Stock replenishment request for Doon sector shelters",
      status: "proposed",
      convoyId: null,
      progressPct: 0,
      createdAt: "10 mins ago"
    }
  ],

  alerts: [
    {
      id: "ALT-001",
      title: "Shelter S-012 Insulin Depletion Imminent (1.2 Days Cover)",
      source: "Automated Supply Triage Sensor",
      severity: "critical",
      timestamp: "12 mins ago",
      acknowledged: false,
      escalated: true,
      details: "Refrigerated stock down to 12 vials. Convoy C-014 currently delayed by Bridge 7 flood."
    },
    {
      id: "ALT-002",
      title: "Convoy C-014 Encountered Uncharted Flood Barrier",
      source: "Field Driver Telemetry",
      severity: "critical",
      timestamp: "18 mins ago",
      acknowledged: true,
      escalated: false,
      details: "Water depth exceeds safe threshold. Emergency reroute required to prevent cargo cold-chain failure."
    },
    {
      id: "ALT-003",
      title: "NH-58 River Bridge Structural Integrity Alert",
      source: "Geotechnical Seismic Probe",
      severity: "critical",
      timestamp: "32 mins ago",
      acknowledged: false,
      escalated: false,
      details: "Pillar stress sensors registered displacement. Reroute 3 active convoys onto Eastern bypass."
    },
    {
      id: "ALT-004",
      title: "Depot Bravo Low Insulin Stock Warning (350 Vials Remaining)",
      source: "Warehouse Inventory Watchdog",
      severity: "caution",
      timestamp: "1 hr ago",
      acknowledged: true,
      escalated: false,
      details: "Stock level fell below critical threshold of 800 vials. Supply Swap SWAP-101 initiated from Hub Alpha."
    }
  ],

  liveActivities: [
    { time: "02:48", type: "hazard", text: "⚠ New hazard reported at Doiwala Arterial Junction by Driver DRV-405" },
    { time: "02:44", type: "reroute", text: "🚛 Convoy C-014 rerouted via Eastern Pass by Control Room Commander" },
    { time: "02:40", type: "alert", text: "🚨 Shelter S-012 escalated to HQ Command — Critical Insulin Shortage" },
    { time: "02:35", type: "swap", text: "🔄 Supply Swap SWAP-101 (500 Insulin Vials) dispatched from Hub Alpha" },
    { time: "02:28", type: "system", text: "📡 Offline telemetry synchronized for Sector 7 field units" }
  ],

  offlineSyncQueue: []
};

// PIN Code Resolver for Indian Disaster Management Sectors
const PINCODE_DIRECTORY = {
  "248001": { district: "Dehradun - Rishikesh Disaster Division", state: "Uttarakhand", lat: 30.3165, lng: 78.0322, name: "Northern Himalayan Relief Corridor (Sector 7)" },
  "781001": { district: "Kamrup Metropolitan / Guwahati", state: "Assam", lat: 26.1445, lng: 91.7362, name: "Brahmaputra Flood Relief Zone" },
  "110001": { district: "Central Delhi Logistics Command", state: "Delhi NCR", lat: 28.6139, lng: 77.2090, name: "National Capital Disaster Reserve" },
  "682001": { district: "Ernakulam Coastal Relief Division", state: "Kerala", lat: 9.9312, lng: 76.2673, name: "Coastal Monsoonal Response Sector" },
  "400001": { district: "South Mumbai Maritime & Urban Zone", state: "Maharashtra", lat: 18.9388, lng: 72.8354, name: "Western Seaboard Emergency Sector" },
  "171001": { district: "Shimla Mountain Relief Sector", state: "Himachal Pradesh", lat: 31.1048, lng: 77.1734, name: "High-Altitude Logistics Corridor" }
};

class DisasterControlStore {
  constructor() {
    this.state = this.loadState();
    this.listeners = [];
  }

  loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Storage parse error, resetting state:", e);
    }
    this.saveState(DEFAULT_STATE);
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Storage save failed:", e);
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.saveState(this.state);
    this.listeners.forEach(fn => fn(this.state));
  }

  getState() {
    return this.state;
  }

  // --- Mutator Actions ---

  resolvePincode(pincode) {
    const cleanPin = String(pincode).trim();
    if (PINCODE_DIRECTORY[cleanPin]) {
      this.state.activeSector = {
        ...PINCODE_DIRECTORY[cleanPin],
        pincode: cleanPin
      };
      this.notify();
      return this.state.activeSector;
    }
    // Default fallback
    this.state.activeSector = {
      name: `Custom Sector (PIN: ${cleanPin})`,
      pincode: cleanPin,
      district: "Assigned District Relief Command",
      state: "India Emergency Grid",
      lat: 30.3165,
      lng: 78.0322,
      zoom: 11
    };
    this.notify();
    return this.state.activeSector;
  }

  addHazard(hazardData) {
    const newHazard = {
      id: "HAZ-" + Math.floor(100 + Math.random() * 900),
      verified: hazardData.verified || false,
      verifiedBy: hazardData.verifiedBy || null,
      reportedAt: "Just now",
      timestamp: Date.now(),
      roadBlocked: hazardData.roadBlocked !== undefined ? hazardData.roadBlocked : true,
      affectedConvoys: hazardData.affectedConvoys || [],
      ...hazardData
    };
    this.state.hazards.unshift(newHazard);
    this.state.liveActivities.unshift({
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: "hazard",
      text: `⚠ New hazard reported: ${newHazard.typeName} at ${newHazard.locationName}`
    });
    this.notify();
    return newHazard;
  }

  verifyHazard(hazardId, verifierName) {
    const hazard = this.state.hazards.find(h => h.id === hazardId);
    if (hazard) {
      hazard.verified = true;
      hazard.verifiedBy = verifierName || "District Command Admin";
      this.state.liveActivities.unshift({
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: "hazard",
        text: `✅ Hazard ${hazard.id} verified by ${hazard.verifiedBy}`
      });
      this.notify();
    }
  }

  toggleRoadBlock(hazardId) {
    const hazard = this.state.hazards.find(h => h.id === hazardId);
    if (hazard) {
      hazard.roadBlocked = !hazard.roadBlocked;
      this.state.liveActivities.unshift({
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: "system",
        text: `🚧 Road segment at ${hazard.locationName} marked ${hazard.roadBlocked ? 'BLOCKED' : 'OPEN'}`
      });
      this.notify();
    }
  }

  rerouteConvoy(convoyId, newRouteName, newEtaMinutes) {
    const convoy = this.state.convoys.find(c => c.id === convoyId);
    if (convoy) {
      convoy.status = "rerouted";
      convoy.riskLevel = "caution";
      convoy.routeId = newRouteName || "ROUTE-ALT-EAST";
      convoy.routeStatus = `Rerouted via ${newRouteName || 'Eastern Bypass'}`;
      convoy.etaMinutes = newEtaMinutes || (convoy.etaMinutes + 25);
      convoy.alertMessage = null;
      
      this.state.liveActivities.unshift({
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: "reroute",
        text: `🚛 Convoy ${convoy.id} successfully rerouted via ${convoy.routeId}`
      });
      this.notify();
    }
  }

  createSupplySwap(swapData) {
    const newSwap = {
      id: "SWAP-" + Math.floor(100 + Math.random() * 900),
      status: "approved",
      progressPct: 15,
      createdAt: "Just now",
      convoyId: "C-014",
      ...swapData
    };
    this.state.supplySwaps.unshift(newSwap);
    this.state.liveActivities.unshift({
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: "swap",
      text: `🔄 Supply Swap ${newSwap.id} (${newSwap.quantity} ${newSwap.unit} of ${newSwap.item}) created`
    });
    this.notify();
    return newSwap;
  }

  acknowledgeAlert(alertId) {
    const alert = this.state.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      this.notify();
    }
  }

  escalateAlert(alertId) {
    const alert = this.state.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.escalated = true;
      this.state.liveActivities.unshift({
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: "alert",
        text: `🚨 ALERT ESCALATED TO HQ COMMAND: ${alert.title}`
      });
      this.notify();
    }
  }

  confirmDelivery(convoyId) {
    const convoy = this.state.convoys.find(c => c.id === convoyId);
    if (convoy) {
      convoy.status = "delivered";
      convoy.etaMinutes = 0;
      
      // Update destination shelter stock if matching
      const shelter = this.state.shelters.find(s => s.id === convoy.destId);
      if (shelter) {
        shelter.daysOfCover = Math.min(5.0, Number((shelter.daysOfCover + 2.4).toFixed(1)));
        shelter.status = "safe";
        shelter.isIsolated = false;
      }
      
      this.state.liveActivities.unshift({
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: "system",
        text: `✅ MISSION COMPLETED: Convoy ${convoy.id} delivered cargo to ${convoy.destName}`
      });
      this.notify();
    }
  }

  queueOfflineReport(report) {
    this.state.offlineSyncQueue.push({
      ...report,
      queuedAt: new Date().toISOString()
    });
    this.notify();
  }

  syncOfflineQueue() {
    const count = this.state.offlineSyncQueue.length;
    if (count > 0) {
      this.state.offlineSyncQueue.forEach(item => {
        this.addHazard({
          typeName: item.type,
          locationName: item.location || "Field GPS Coordinates",
          severity: item.severity || "high",
          description: item.description || "Submitted via offline mobile telemetry",
          reportedBy: "Field Driver (Offline Sync)"
        });
      });
      this.state.offlineSyncQueue = [];
      this.state.liveActivities.unshift({
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: "system",
        text: `📡 ${count} offline field reports synchronized with central disaster database`
      });
      this.notify();
    }
    return count;
  }

  resetToDefault() {
    this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    this.notify();
  }
}

// Global Store Instance
window.disasterStore = new DisasterControlStore();
