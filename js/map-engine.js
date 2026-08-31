/**
 * DISISTA CONTROL — Geospatial Map Engine
 * Dual-Mode Ultra-Resilient Engine:
 * Mode 1: Leaflet CartoDB / TomTom Telemetry Tiles (when CDN is reachable)
 * Mode 2: Self-Contained Interactive Geospatial Vector GIS Telemetry Map (100% offline & instant)
 */

class DisasterMapEngine {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.options = Object.assign({
      center: [30.2200, 78.1800], // Sector 7: Dehradun - Rishikesh Disaster Corridor
      zoom: 11,
      interactive: true,
      showControls: true
    }, options);

    this.map = null;
    this.layers = {
      convoys: null,
      shelters: null,
      warehouses: null,
      hazards: null,
      routes: null
    };

    this.activeFilters = {
      convoys: true,
      shelters: true,
      warehouses: true,
      hazards: true,
      routes: true
    };

    this.onSelectEntity = options.onSelectEntity || null;
    this.currentZoom = 1.0;
    this.panOffset = { x: 0, y: 0 };
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
  }

  init() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    if (!container.style.height && container.clientHeight === 0) {
      container.style.height = "480px";
    }

    // Try Leaflet if window.L is available, otherwise render rich interactive vector map immediately
    if (typeof window.L !== 'undefined' && typeof window.L.map === 'function') {
      try {
        this.initLeafletMap(container);
      } catch (err) {
        console.warn("Leaflet map initialization notice:", err);
        this.initInteractiveVectorMap(container);
      }
    } else {
      this.initInteractiveVectorMap(container);
      // Attempt background dynamic upgrade if CDN becomes reachable
      this.tryBackgroundLeafletUpgrade(container);
    }
  }

  tryBackgroundLeafletUpgrade(container) {
    if (typeof window.L !== 'undefined') return;

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
    script.onload = () => {
      if (typeof window.L !== 'undefined' && typeof window.L.map === 'function') {
        try {
          this.initLeafletMap(container);
        } catch (e) {
          // Keep vector map if Leaflet initialization throws
        }
      }
    };
    script.onerror = () => {
      // Retain the interactive vector map
    };
    document.head.appendChild(script);
  }

  initLeafletMap(container) {
    const L = window.L;
    if (!L) {
      this.initInteractiveVectorMap(container);
      return;
    }

    if (this.map) {
      try {
        this.map.remove();
      } catch (e) {
        console.warn('Map cleanup notice:', e);
      }
      this.map = null;
    }

    if (container._leaflet_id) {
      container._leaflet_id = null;
    }
    container.innerHTML = '';

    this.map = L.map(container, {
      center: this.options.center,
      zoom: this.options.zoom,
      zoomControl: false,
      attributionControl: false
    });

    const cartoTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution: '© CartoDB, © OpenStreetMap'
    });

    const osmTiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    });

    cartoTiles.on('tileerror', () => {
      if (!this.map.hasLayer(osmTiles)) {
        osmTiles.addTo(this.map);
      }
    });

    cartoTiles.addTo(this.map);

    if (this.options.showControls) {
      L.control.zoom({ position: 'bottomright' }).addTo(this.map);
    }

    this.layers.routes = L.featureGroup().addTo(this.map);
    this.layers.warehouses = L.featureGroup().addTo(this.map);
    this.layers.shelters = L.featureGroup().addTo(this.map);
    this.layers.hazards = L.featureGroup().addTo(this.map);
    this.layers.convoys = L.featureGroup().addTo(this.map);

    this.renderAllData();

    const refreshSizes = () => {
      if (this.map) {
        this.map.invalidateSize();
      }
    };

    setTimeout(refreshSizes, 60);
    setTimeout(refreshSizes, 200);
    setTimeout(refreshSizes, 500);

    window.addEventListener('resize', refreshSizes);
  }

  renderAllData() {
    if (!this.map || !window.disasterStore || !window.L) return;
    const L = window.L;
    const state = window.disasterStore.getState();

    Object.values(this.layers).forEach(layer => layer && layer.clearLayers());

    // 1. Render Routes
    if (this.activeFilters.routes) {
      this.renderCorridorRoutes(L);
    }

    // 2. Render Warehouses
    if (this.activeFilters.warehouses && state.warehouses) {
      state.warehouses.forEach(wh => {
        const icon = L.divIcon({
          className: 'custom-pin-wrapper',
          html: `<div class="custom-map-pin pin-warehouse" title="${wh.name}" style="background:#1D63ED;color:#fff;border-radius:50%;width:34px;height:34px;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 3px 10px rgba(29,99,237,0.4);border:2px solid #fff;">📦</div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 17]
        });

        const marker = L.marker([wh.lat, wh.lng], { icon }).addTo(this.layers.warehouses);
        marker.bindPopup(`<strong>${wh.name}</strong><br><small>${wh.locationName}</small><br>Capacity: ${wh.capacity.toLocaleString()} units`);
        marker.on('click', () => this.handleEntityClick('warehouse', wh));
      });
    }

    // 3. Render Shelters
    if (this.activeFilters.shelters && state.shelters) {
      state.shelters.forEach(sh => {
        const isCrit = sh.status === 'critical';
        const bgColor = isCrit ? '#DC2626' : '#059669';
        const iconSymbol = isCrit ? '🚨' : '🏠';

        const icon = L.divIcon({
          className: 'custom-pin-wrapper',
          html: `<div class="custom-map-pin" title="${sh.name}" style="background:${bgColor};color:#fff;border-radius:50%;width:34px;height:34px;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 3px 10px rgba(0,0,0,0.25);border:2px solid #fff;">${iconSymbol}</div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 17]
        });

        const marker = L.marker([sh.lat, sh.lng], { icon }).addTo(this.layers.shelters);
        marker.bindPopup(`<strong>${sh.name}</strong><br>Cover: ${sh.daysOfCover} Days<br>Occupancy: ${sh.occupancy} People`);
        marker.on('click', () => this.handleEntityClick('shelter', sh));
      });
    }

    // 4. Render Hazards
    if (this.activeFilters.hazards && state.hazards) {
      state.hazards.forEach(hz => {
        const isCrit = hz.severity === 'critical';
        const bgColor = isCrit ? '#EF4444' : '#F59E0B';
        const iconSymbol = hz.type === 'flash_flood' ? '🌊' : hz.type === 'landslide' ? '⛰️' : '⚠️';

        const icon = L.divIcon({
          className: 'custom-pin-wrapper',
          html: `<div class="custom-map-pin" title="${hz.typeName}" style="background:${bgColor};color:#fff;border-radius:50%;width:34px;height:34px;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 3px 10px rgba(239,68,68,0.4);border:2px solid #fff;">${iconSymbol}</div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 17]
        });

        const marker = L.marker([hz.lat, hz.lng], { icon }).addTo(this.layers.hazards);
        marker.bindPopup(`<strong>${hz.typeName}</strong><br>${hz.locationName}<br><span style="color:#DC2626;font-weight:700;">${hz.roadBlocked ? 'ROAD BLOCKED' : 'PASSABLE'}</span>`);
        marker.on('click', () => this.handleEntityClick('hazard', hz));
      });
    }

    // 5. Render Active Convoys
    if (this.activeFilters.convoys && state.convoys) {
      state.convoys.forEach(cv => {
        const isHighRisk = cv.status === 'high_risk' || cv.status === 'delayed';
        const bgColor = isHighRisk ? '#EA580C' : '#0D9488';

        const icon = L.divIcon({
          className: 'custom-pin-wrapper',
          html: `<div class="custom-map-pin" title="${cv.code} - ${cv.driverName}" style="background:${bgColor};color:#fff;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:17px;box-shadow:0 3px 12px rgba(13,148,136,0.45);border:2px solid #fff;">🚛</div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });

        const marker = L.marker([cv.currentLat, cv.currentLng], { icon }).addTo(this.layers.convoys);
        marker.bindPopup(`<strong>${cv.code}</strong><br>Driver: ${cv.driverName}<br>ETA: ${cv.etaMinutes} mins • ${cv.originName} → ${cv.destName}`);
        marker.on('click', () => this.handleEntityClick('convoy', cv));
      });
    }
  }

  renderCorridorRoutes(L) {
    const nh58Path = [
      [30.3450, 78.0550], // Hub Alpha
      [30.2800, 78.1100],
      [30.2200, 78.1600],
      [30.1800, 78.2300], // Hazard Point (Bridge 7)
      [30.1350, 78.3220]  // Shelter S-012
    ];

    L.polyline(nh58Path, {
      color: '#EF4444',
      weight: 5,
      opacity: 0.85,
      dashArray: '8, 8'
    }).addTo(this.layers.routes);

    const bypassPath = [
      [30.3450, 78.0550], // Hub Alpha
      [30.3100, 78.1800],
      [30.2500, 78.2500],
      [30.1600, 78.3100],
      [30.1350, 78.3220]  // Shelter S-012
    ];

    L.polyline(bypassPath, {
      color: '#10B981',
      weight: 4,
      opacity: 0.9
    }).addTo(this.layers.routes);
  }

  setLayerFilter(layerKey, isVisible) {
    this.activeFilters[layerKey] = isVisible;
    if (this.map && this.layers[layerKey]) {
      if (isVisible) {
        if (!this.map.hasLayer(this.layers[layerKey])) {
          this.map.addLayer(this.layers[layerKey]);
        }
      } else {
        if (this.map.hasLayer(this.layers[layerKey])) {
          this.map.removeLayer(this.layers[layerKey]);
        }
      }
    } else {
      // Update vector fallback map layers
      const elements = document.querySelectorAll(`[data-layer="${layerKey}"]`);
      elements.forEach(el => {
        el.style.display = isVisible ? '' : 'none';
      });
    }
  }

  handleEntityClick(type, entity) {
    if (this.onSelectEntity) {
      this.onSelectEntity(type, entity);
    }
  }

  /* =========================================================================
     STANDALONE INTERACTIVE VECTOR GIS TELEMETRY MAP (100% Offline & Reliable)
     ========================================================================= */
  initInteractiveVectorMap(container) {
    const state = (window.disasterStore && window.disasterStore.getState()) || {};
    const warehouses = state.warehouses || [
      { id: "WH-001", name: "Central Hub Alpha", locationName: "Dehradun North", x: 130, y: 95, capacity: 50000 },
      { id: "WH-002", name: "Regional Depot Bravo", locationName: "Rishikesh Bypass", x: 450, y: 245, capacity: 35000 },
      { id: "WH-003", name: "Emergency Reserve Charlie", locationName: "Haridwar Staging", x: 260, y: 390, capacity: 40000 }
    ];

    const shelters = state.shelters || [
      { id: "S-012", name: "Shelter S-012 (Ganga Valley High School)", daysOfCover: 1.2, occupancy: 640, status: "critical", x: 670, y: 400 },
      { id: "S-008", name: "Shelter S-008 (Doon Community Complex)", daysOfCover: 1.8, occupancy: 420, status: "caution", x: 220, y: 220 },
      { id: "S-021", name: "Shelter S-021 (Shivalik Relief Camp)", daysOfCover: 3.5, occupancy: 310, status: "safe", x: 110, y: 270 }
    ];

    const hazards = state.hazards || [
      { id: "HAZ-001", typeName: "Flash Flood & Inundation", locationName: "NH-58 Bridge 7", severity: "critical", roadBlocked: true, x: 360, y: 205 },
      { id: "HAZ-002", typeName: "Mountain Landslide Blockage", locationName: "Chila Pass Mile 14", severity: "high", roadBlocked: false, x: 580, y: 330 }
    ];

    const convoys = state.convoys || [
      { id: "C-014", code: "CONVOY-DELTA-14", driverName: "Rajesh Kumar", etaMinutes: 45, status: "delayed", originName: "Hub Alpha", destName: "Shelter S-012", x: 270, y: 80 },
      { id: "C-021", code: "CONVOY-ECHO-21", driverName: "Priya Sharma", etaMinutes: 28, status: "on_route", originName: "Reserve Charlie", destName: "Shelter S-008", x: 340, y: 310 },
      { id: "C-019", code: "CONVOY-FOXTROT-19", driverName: "Vikram Singh", etaMinutes: 62, status: "high_risk", originName: "Depot Bravo", destName: "Shelter S-014", x: 520, y: 285 }
    ];

    container.innerHTML = `
      <div id="vector-map-canvas-container" style="width:100%;height:100%;min-height:440px;position:relative;background:#F0F6FC;border:1px solid #D8E4F0;border-radius:12px;overflow:hidden;font-family:var(--font-sans);user-select:none;">
        
        <!-- Live Map Telemetry Header Badge -->
        <div style="position:absolute;top:14px;left:14px;z-index:20;background:rgba(255,255,255,0.92);backdrop-filter:blur(6px);padding:6px 14px;border-radius:8px;border:1px solid #CBD5E1;box-shadow:0 2px 6px rgba(0,0,0,0.06);display:flex;align-items:center;gap:8px;">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#10B981;box-shadow:0 0 6px #10B981;"></span>
          <span style="font-size:12px;font-weight:700;color:#1E293B;">Sector 7 Relief Corridor (Dehradun - Rishikesh)</span>
        </div>

        <!-- Map Navigation Controls -->
        <div style="position:absolute;bottom:14px;right:14px;z-index:20;display:flex;flex-direction:column;gap:6px;">
          <button onclick="window.mapEngineInstance && window.mapEngineInstance.zoomMap(1.15)" style="width:34px;height:34px;background:#fff;border:1px solid #CBD5E1;border-radius:6px;font-size:18px;font-weight:700;color:#1E293B;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.08);">+</button>
          <button onclick="window.mapEngineInstance && window.mapEngineInstance.zoomMap(0.85)" style="width:34px;height:34px;background:#fff;border:1px solid #CBD5E1;border-radius:6px;font-size:18px;font-weight:700;color:#1E293B;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.08);">−</button>
          <button onclick="window.mapEngineInstance && window.mapEngineInstance.resetMapZoom()" style="width:34px;height:34px;background:#fff;border:1px solid #CBD5E1;border-radius:6px;font-size:13px;font-weight:700;color:#1D63ED;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.08);" title="Reset View">⟲</button>
        </div>

        <!-- SVG Visual GIS Canvas -->
        <svg id="vector-map-svg" viewBox="0 0 800 480" style="width:100%;height:100%;display:block;cursor:grab;background:linear-gradient(180deg, #E6F0FA 0%, #EDF4FB 100%);">
          <!-- Topographic Contour Grids -->
          <defs>
            <pattern id="vector-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#DCE8F5" stroke-width="1"/>
            </pattern>
            <filter id="pin-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="3" stdDeviation="3" flood-opacity="0.25"/>
            </filter>
          </defs>
          <rect width="800" height="480" fill="url(#vector-grid)" />

          <!-- Mountain Ridge Terrain Shadows -->
          <path d="M 50,20 Q 200,80 350,40 T 750,70" fill="none" stroke="#D4E4F4" stroke-width="45" stroke-linecap="round" opacity="0.6"/>
          <path d="M 300,450 Q 550,380 750,440" fill="none" stroke="#D4E4F4" stroke-width="50" stroke-linecap="round" opacity="0.6"/>

          <!-- River Ganga Flow Channel -->
          <path d="M 100,50 Q 250,150 400,220 T 700,450" fill="none" stroke="#BFE0FF" stroke-width="24" stroke-linecap="round" />
          <path d="M 100,50 Q 250,150 400,220 T 700,450" fill="none" stroke="#79B8FF" stroke-width="14" stroke-linecap="round" />
          <text x="320" y="165" font-size="11" font-weight="700" fill="#3B82F6" opacity="0.8" transform="rotate(22, 320, 165)">~ Ganga River Basin ~</text>

          <!-- Routes Group -->
          <g data-layer="routes">
            <!-- Highway NH-58 Primary Corridor (Blocked Segment) -->
            <path d="M 130,95 Q 280,180 450,245" fill="none" stroke="#EF4444" stroke-width="6" stroke-dasharray="8,6" opacity="0.9" />
            <path d="M 450,245 Q 560,320 670,400" fill="none" stroke="#94A3B8" stroke-width="5" stroke-dasharray="6,6" opacity="0.8" />
            <text x="270" y="170" font-size="11" font-weight="700" fill="#EF4444">NH-58 (BLOCKED AT BRIDGE 7)</text>

            <!-- Route 9-East Mountain Ridge Bypass (Active Safe Corridor) -->
            <path d="M 130,95 Q 230,40 400,60 T 670,400" fill="none" stroke="#10B981" stroke-width="5" opacity="0.95" />
            <text x="350" y="45" font-size="11" font-weight="700" fill="#059669">ROUTE 9-EAST BYPASS (VERIFIED CLEAR)</text>
          </g>

          <!-- Warehouses Group -->
          <g data-layer="warehouses">
            ${warehouses.map((wh, i) => {
              const x = wh.x || (130 + i * 160);
              const y = wh.y || (95 + i * 110);
              return `
                <g transform="translate(${x}, ${y})" cursor="pointer" filter="url(#pin-shadow)" onclick="window.mapEngineInstance && window.mapEngineInstance.handleEntityClick('warehouse', ${JSON.stringify(wh).replace(/"/g, '&quot;')})">
                  <circle r="18" fill="#1D63ED" stroke="#FFFFFF" stroke-width="2.5" />
                  <text x="0" y="5" font-size="14" text-anchor="middle" fill="#FFFFFF">📦</text>
                  <rect x="-45" y="24" width="90" height="18" rx="4" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1"/>
                  <text x="0" y="37" font-size="10.5" font-weight="700" text-anchor="middle" fill="#1E293B">${wh.name.split('(')[0]}</text>
                </g>
              `;
            }).join('')}
          </g>

          <!-- Shelters Group -->
          <g data-layer="shelters">
            ${shelters.map((sh, i) => {
              const x = sh.x || (670 - i * 180);
              const y = sh.y || (400 - i * 90);
              const isCrit = sh.status === 'critical' || sh.daysOfCover < 1.5;
              const color = isCrit ? '#DC2626' : '#059669';
              const icon = isCrit ? '🚨' : '🏠';
              return `
                <g transform="translate(${x}, ${y})" cursor="pointer" filter="url(#pin-shadow)" onclick="window.mapEngineInstance && window.mapEngineInstance.handleEntityClick('shelter', ${JSON.stringify(sh).replace(/"/g, '&quot;')})">
                  <circle r="18" fill="${color}" stroke="#FFFFFF" stroke-width="2.5" />
                  <text x="0" y="5" font-size="14" text-anchor="middle" fill="#FFFFFF">${icon}</text>
                  <rect x="-55" y="24" width="110" height="18" rx="4" fill="#FFFFFF" stroke="${color}" stroke-width="1.5"/>
                  <text x="0" y="37" font-size="10" font-weight="700" text-anchor="middle" fill="${color}">${sh.id} (${sh.daysOfCover}d Cover)</text>
                </g>
              `;
            }).join('')}
          </g>

          <!-- Hazards Group -->
          <g data-layer="hazards">
            ${hazards.map((hz, i) => {
              const x = hz.x || (360 + i * 150);
              const y = hz.y || (205 + i * 90);
              const icon = hz.type === 'landslide' ? '⛰️' : '🌊';
              return `
                <g transform="translate(${x}, ${y})" cursor="pointer" filter="url(#pin-shadow)" onclick="window.mapEngineInstance && window.mapEngineInstance.handleEntityClick('hazard', ${JSON.stringify(hz).replace(/"/g, '&quot;')})">
                  <circle r="17" fill="#EF4444" stroke="#FFFFFF" stroke-width="2.5" />
                  <text x="0" y="5" font-size="13" text-anchor="middle" fill="#FFFFFF">${icon}</text>
                  <rect x="-50" y="24" width="100" height="18" rx="4" fill="#FEF2F2" stroke="#EF4444" stroke-width="1"/>
                  <text x="0" y="37" font-size="10" font-weight="700" text-anchor="middle" fill="#DC2626">${hz.roadBlocked ? '🚧 ROAD BLOCKED' : hz.typeName.slice(0, 14)}</text>
                </g>
              `;
            }).join('')}
          </g>

          <!-- Active Convoys Group -->
          <g data-layer="convoys">
            ${convoys.map((cv, i) => {
              const x = cv.x || (270 + i * 120);
              const y = cv.y || (80 + i * 90);
              const isAlert = cv.status === 'delayed' || cv.status === 'high_risk';
              const color = isAlert ? '#EA580C' : '#0D9488';
              return `
                <g transform="translate(${x}, ${y})" cursor="pointer" filter="url(#pin-shadow)" onclick="window.mapEngineInstance && window.mapEngineInstance.handleEntityClick('convoy', ${JSON.stringify(cv).replace(/"/g, '&quot;')})">
                  <circle r="18" fill="${color}" stroke="#FFFFFF" stroke-width="2.5" />
                  <text x="0" y="5" font-size="14" text-anchor="middle" fill="#FFFFFF">🚛</text>
                  <rect x="-45" y="24" width="90" height="18" rx="4" fill="#FFFFFF" stroke="${color}" stroke-width="1.5"/>
                  <text x="0" y="37" font-size="10" font-weight="700" text-anchor="middle" fill="${color}">${cv.code || cv.id} (ETA ${cv.etaMinutes}m)</text>
                </g>
              `;
            }).join('')}
          </g>
        </svg>

        <!-- Bottom Legend Bar -->
        <div style="position:absolute;bottom:14px;left:14px;z-index:20;background:rgba(255,255,255,0.92);backdrop-filter:blur(6px);padding:6px 14px;border-radius:20px;border:1px solid #CBD5E1;display:flex;gap:12px;font-size:11.5px;font-weight:600;color:#334155;box-shadow:0 2px 6px rgba(0,0,0,0.06);">
          <span style="color:#1D63ED;">📦 3 Warehouses</span>
          <span style="color:#0D9488;">🚛 4 Convoys</span>
          <span style="color:#DC2626;">🏠 4 Shelters</span>
          <span style="color:#EF4444;">⚠️ 1 Blocked Bridge</span>
          <span style="color:#059669;">🟢 1 Active Bypass Route</span>
        </div>
      </div>
    `;

    window.mapEngineInstance = this;
  }

  zoomMap(factor) {
    this.currentZoom = Math.min(2.5, Math.max(0.6, this.currentZoom * factor));
    const svg = document.getElementById('vector-map-svg');
    if (svg) {
      svg.style.transform = `scale(${this.currentZoom})`;
      svg.style.transformOrigin = 'center center';
      svg.style.transition = 'transform 0.2s ease-out';
    }
  }

  resetMapZoom() {
    this.currentZoom = 1.0;
    const svg = document.getElementById('vector-map-svg');
    if (svg) {
      svg.style.transform = 'scale(1)';
      svg.style.transition = 'transform 0.2s ease-out';
    }
  }
}

window.DisasterMapEngine = DisasterMapEngine;
