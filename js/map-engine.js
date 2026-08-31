/**
 * DISISTA CONTROL — Geospatial Map Engine
 * Powered by Leaflet GIS + CartoDB / TomTom Telemetry
 * High-performance, multi-fallback, zero-blank-screen architecture.
 */

class DisasterMapEngine {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.options = Object.assign({
      center: [30.2200, 78.1800], // Default: Dehradun - Rishikesh Disaster Corridor
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
    this._isLoadingLeaflet = false;
  }

  init() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    // Ensure container has visible dimensions
    if (!container.style.height && container.clientHeight === 0) {
      container.style.height = "480px";
    }

    if (typeof window.L !== 'undefined') {
      try {
        this.initLeafletMap(container);
      } catch (err) {
        console.warn("Leaflet map initialization notice:", err);
        this.initInteractiveVectorMap(container);
      }
    } else {
      this.loadLeafletAndInit(container);
    }
  }

  loadLeafletAndInit(container) {
    if (this._isLoadingLeaflet) return;
    this._isLoadingLeaflet = true;

    // Show clean loading state while fetching map engine
    container.innerHTML = `
      <div style="width:100%;height:100%;min-height:380px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#F8FBFF;color:#172B3A;gap:12px;border:1px solid #E2EAF2;border-radius:12px;">
        <div style="width:36px;height:36px;border:3px solid #E2EAF2;border-top-color:#1D63ED;border-radius:50%;animation:spin 0.8s linear infinite;"></div>
        <div style="font-weight:700;font-size:14px;color:#172B3A;">Connecting to Geospatial Telemetry Grid...</div>
        <style>@keyframes spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}</style>
      </div>
    `;

    // Dynamic multi-CDN injector
    const loadScript = (url, fallbackUrl) => {
      const script = document.createElement('script');
      script.src = url;
      script.onload = () => {
        if (typeof window.L !== 'undefined') {
          this.initLeafletMap(container);
        } else {
          this.initInteractiveVectorMap(container);
        }
      };
      script.onerror = () => {
        if (fallbackUrl) {
          loadScript(fallbackUrl, null);
        } else {
          this.initInteractiveVectorMap(container);
        }
      };
      document.head.appendChild(script);
    };

    // Ensure Leaflet CSS is loaded
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
      document.head.appendChild(link);
    }

    loadScript(
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js',
      'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js'
    );
  }

  initLeafletMap(container) {
    const L = window.L;
    if (!L) {
      this.initInteractiveVectorMap(container);
      return;
    }

    // 1. Properly clean any prior map instance on this container
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

    // 2. Instantiate Leaflet Map
    this.map = L.map(container, {
      center: this.options.center,
      zoom: this.options.zoom,
      zoomControl: false,
      attributionControl: false
    });

    // 3. Reliable Crisp Basemap (CartoDB Voyager + OSM Fallback)
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

    // 4. Feature Groups for Pins & Routes
    this.layers.routes = L.featureGroup().addTo(this.map);
    this.layers.warehouses = L.featureGroup().addTo(this.map);
    this.layers.shelters = L.featureGroup().addTo(this.map);
    this.layers.hazards = L.featureGroup().addTo(this.map);
    this.layers.convoys = L.featureGroup().addTo(this.map);

    this.renderAllData();

    // 5. Responsive Size Invalidation
    const refreshSizes = () => {
      if (this.map) {
        this.map.invalidateSize();
      }
    };

    setTimeout(refreshSizes, 50);
    setTimeout(refreshSizes, 200);
    setTimeout(refreshSizes, 500);

    window.addEventListener('resize', refreshSizes);
  }

  renderAllData() {
    if (!this.map || !window.disasterStore || !window.L) return;
    const L = window.L;
    const state = window.disasterStore.getState();

    Object.values(this.layers).forEach(layer => layer && layer.clearLayers());

    // 1. Render Routes (Primary Corridor & Mountain Bypass)
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
    // Primary NH-58 Arterial Route (Blocked at Bridge 7)
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
    }).addTo(this.layers.routes).bindPopup('<strong>NH-58 River Crossing (Bridge 7)</strong><br><span style="color:#DC2626;font-weight:700;">BLOCKED: Flash Flood Overtopping</span>');

    // Eastern Mountain Ridge Bypass (Active Safe Route)
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
    }).addTo(this.layers.routes).bindPopup('<strong>Route 9-East: Mountain Ridge Pass</strong><br><span style="color:#10B981;font-weight:700;">ACTIVE & CLEAR: Verified Bypass</span>');
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
    }
  }

  handleEntityClick(type, entity) {
    if (this.onSelectEntity) {
      this.onSelectEntity(type, entity);
    }
  }

  initInteractiveVectorMap(container) {
    container.innerHTML = `
      <div style="width:100%;height:100%;min-height:440px;position:relative;background:#F0F6FC;border:1px solid #D8E4F0;border-radius:12px;overflow:hidden;font-family:var(--font-sans);">
        <svg viewBox="0 0 800 480" style="width:100%;height:100%;display:block;background:linear-gradient(180deg, #E6F0FA 0%, #EDF4FB 100%);">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#DCE8F5" stroke-width="1"/>
            </pattern>
          </defs>
          <rect width="800" height="480" fill="url(#grid)" />

          <!-- River Ganga Flow Vector -->
          <path d="M 100,50 Q 250,150 400,220 T 700,450" fill="none" stroke="#BFE0FF" stroke-width="22" stroke-linecap="round" />
          <path d="M 100,50 Q 250,150 400,220 T 700,450" fill="none" stroke="#79B8FF" stroke-width="12" stroke-linecap="round" />

          <!-- Highway NH-58 Primary Corridor (Blocked) -->
          <path d="M 120,90 Q 280,180 440,240 T 680,410" fill="none" stroke="#EF4444" stroke-width="5" stroke-dasharray="8,6" />
          
          <!-- Alternative High-Mountain Bypass Route (Safe) -->
          <path d="M 120,90 Q 220,40 380,80 T 680,410" fill="none" stroke="#10B981" stroke-width="4" />

          <!-- Warehouses -->
          <g transform="translate(130, 95)" cursor="pointer" onclick="window.UI && window.UI.showToast('Central Logistics Hub Alpha (50,000 Capacity)', 'blue')">
            <circle r="18" fill="#1D63ED" stroke="#fff" stroke-width="2" />
            <text x="0" y="5" font-size="14" text-anchor="middle" fill="#fff">📦</text>
            <text x="0" y="28" font-size="11" font-weight="700" text-anchor="middle" fill="#1E293B">Hub Alpha</text>
          </g>

          <g transform="translate(450, 245)" cursor="pointer" onclick="window.UI && window.UI.showToast('Regional Depot Bravo (Rishikesh Bypass)', 'blue')">
            <circle r="16" fill="#1D63ED" stroke="#fff" stroke-width="2" />
            <text x="0" y="5" font-size="13" text-anchor="middle" fill="#fff">📦</text>
            <text x="0" y="26" font-size="11" font-weight="700" text-anchor="middle" fill="#1E293B">Depot Bravo</text>
          </g>

          <!-- Shelters -->
          <g transform="translate(670, 400)" cursor="pointer" onclick="window.UI && window.UI.showToast('Shelter S-012 (Ganga Valley High School - 1.2 Days Cover)', 'critical')">
            <circle r="18" fill="#DC2626" stroke="#fff" stroke-width="2" />
            <text x="0" y="5" font-size="14" text-anchor="middle" fill="#fff">🏠</text>
            <text x="0" y="28" font-size="11" font-weight="700" text-anchor="middle" fill="#DC2626">Shelter S-012 (Critical)</text>
          </g>

          <!-- Hazards -->
          <g transform="translate(360, 205)" cursor="pointer" onclick="window.UI && window.UI.showToast('Flood Hazard at Bridge 7 (NH-58 Blocked)', 'critical')">
            <circle r="16" fill="#EF4444" stroke="#fff" stroke-width="2" />
            <text x="0" y="5" font-size="13" text-anchor="middle" fill="#fff">🌊</text>
            <text x="0" y="26" font-size="11" font-weight="700" text-anchor="middle" fill="#DC2626">Bridge 7 Blocked</text>
          </g>

          <!-- Active Convoys -->
          <g transform="translate(260, 75)" cursor="pointer" onclick="window.UI && window.UI.showToast('Convoy C-014 (Rajesh Kumar - On Alternate Mountain Pass)', 'safe')">
            <circle r="17" fill="#0D9488" stroke="#fff" stroke-width="2" />
            <text x="0" y="5" font-size="14" text-anchor="middle" fill="#fff">🚛</text>
            <text x="0" y="27" font-size="11" font-weight="700" text-anchor="middle" fill="#0D9488">Convoy C-014</text>
          </g>
        </svg>

        <div style="position:absolute;bottom:14px;left:14px;background:rgba(255,255,255,0.92);backdrop-filter:blur(4px);padding:6px 14px;border-radius:20px;border:1px solid #CBD5E1;display:flex;gap:12px;font-size:11.5px;font-weight:600;color:#334155;">
          <span style="color:#1D63ED;">📦 3 Warehouses</span>
          <span style="color:#0D9488;">🚛 4 Convoys</span>
          <span style="color:#DC2626;">🏠 4 Shelters</span>
          <span style="color:#EF4444;">⚠️ 1 Blocked Bridge</span>
        </div>
      </div>
    `;
  }
}

window.DisasterMapEngine = DisasterMapEngine;
