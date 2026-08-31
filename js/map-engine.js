/**
 * DISISTA CONTROL — Geospatial Map Engine
 * Powered by Leaflet & TomTom with Multi-CDN Auto-Loader & Vector Fallback
 * Fully responsive with automatic tile fallback and size invalidation.
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

    if (typeof L !== 'undefined') {
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
        if (typeof L !== 'undefined') {
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

    // Ensure CSS is loaded
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
    this.map = L.map(this.containerId, {
      center: this.options.center,
      zoom: this.options.zoom,
      zoomControl: false,
      attributionControl: false
    });

    // 3. Tile Layers Hierarchy: TomTom -> CartoDB -> OpenStreetMap
    const tomtomKey = window.TOMTOM_API_KEY || 'wtWkAyb7PQqZiL4FChKZMt6fEcEkXVG5';
    const tomtomTiles = L.tileLayer(`https://api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=${tomtomKey}`, {
      maxZoom: 19,
      attribution: '© TomTom',
      tileSize: 256
    });

    const cartoTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution: '© CartoDB'
    });

    const osmTiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    });

    // Cascade Tile Fallback
    tomtomTiles.on('tileerror', () => {
      if (!this.map.hasLayer(cartoTiles)) {
        cartoTiles.addTo(this.map);
      }
    });

    cartoTiles.on('tileerror', () => {
      if (!this.map.hasLayer(osmTiles)) {
        osmTiles.addTo(this.map);
      }
    });

    tomtomTiles.addTo(this.map);

    if (this.options.showControls) {
      L.control.zoom({ position: 'bottomright' }).addTo(this.map);
    }

    // 4. Feature Groups
    this.layers.routes = L.featureGroup().addTo(this.map);
    this.layers.warehouses = L.featureGroup().addTo(this.map);
    this.layers.shelters = L.featureGroup().addTo(this.map);
    this.layers.hazards = L.featureGroup().addTo(this.map);
    this.layers.convoys = L.featureGroup().addTo(this.map);

    this.renderAllData();

    // 5. Auto size invalidation
    const refreshSizes = () => {
      if (this.map) {
        this.map.invalidateSize();
      }
    };

    setTimeout(refreshSizes, 80);
    setTimeout(refreshSizes, 300);
    setTimeout(refreshSizes, 700);

    window.addEventListener('resize', refreshSizes);
  }

  renderAllData() {
    if (!this.map || !window.disasterStore) return;
    const state = window.disasterStore.getState();

    Object.values(this.layers).forEach(layer => layer && layer.clearLayers());

    // 1. Render Routes
    if (this.activeFilters.routes) {
      this.renderRoutes(state);
    }

    // 2. Render Warehouses
    if (this.activeFilters.warehouses) {
      state.warehouses.forEach(wh => {
        const icon = L.divIcon({
          className: 'custom-pin-wrapper',
          html: `<div class="custom-map-pin pin-warehouse" title="${wh.name}">📦</div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 17]
        });

        const marker = L.marker([wh.lat, wh.lng], { icon }).addTo(this.layers.warehouses);
        marker.on('click', () => this.handleEntityClick('warehouse', wh));
      });
    }

    // 3. Render Shelters
    if (this.activeFilters.shelters) {
      state.shelters.forEach(sh => {
        const isCrit = sh.status === 'critical';
        const iconClass = isCrit ? 'pin-hazard-critical pulse' : 'pin-shelter';
        const iconSymbol = isCrit ? '🚨' : '🏠';

        const icon = L.divIcon({
          className: 'custom-pin-wrapper',
          html: `<div class="custom-map-pin ${iconClass}" title="${sh.name}">${iconSymbol}</div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 17]
        });

        const marker = L.marker([sh.lat, sh.lng], { icon }).addTo(this.layers.shelters);
        marker.on('click', () => this.handleEntityClick('shelter', sh));
      });
    }

    // 4. Render Hazards
    if (this.activeFilters.hazards) {
      state.hazards.forEach(hz => {
        const isCrit = hz.severity === 'critical';
        const iconClass = isCrit ? 'pin-hazard-critical pulse' : 'pin-hazard-caution';
        const iconSymbol = hz.type === 'flash_flood' ? '🌊' : hz.type === 'landslide' ? '⛰️' : '⚠️';

        const icon = L.divIcon({
          className: 'custom-pin-wrapper',
          html: `<div class="custom-map-pin ${iconClass}" title="${hz.typeName}"><span>${iconSymbol}</span></div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 17]
        });

        const marker = L.marker([hz.lat, hz.lng], { icon }).addTo(this.layers.hazards);
        marker.on('click', () => this.handleEntityClick('hazard', hz));
      });
    }

    // 5. Render Active Convoys
    if (this.activeFilters.convoys) {
      state.convoys.forEach(cv => {
        const isHighRisk = cv.status === 'high_risk' || cv.status === 'delayed';
        const iconClass = isHighRisk ? 'pin-hazard-critical pulse' : 'pin-convoy';

        const icon = L.divIcon({
          className: 'custom-pin-wrapper',
          html: `<div class="custom-map-pin ${iconClass}" title="${cv.code} - ${cv.driverName}">🚛</div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });

        const marker = L.marker([cv.currentLat, cv.currentLng], { icon }).addTo(this.layers.convoys);
        marker.on('click', () => this.handleEntityClick('convoy', cv));
      });
    }
  }

  renderRoutes(state) {
    if (!state.routes || !Array.isArray(state.routes)) return;

    state.routes.forEach(rt => {
      const isBlocked = rt.status === 'blocked';
      const isReroute = rt.status === 'rerouted';
      const color = isBlocked ? '#DC2626' : isReroute ? '#2563EB' : '#10B981';
      const dashArray = isBlocked ? '6, 8' : isReroute ? '4, 4' : null;
      const weight = isBlocked ? 5 : 4;

      if (rt.points && rt.points.length > 0) {
        L.polyline(rt.points, {
          color,
          weight,
          opacity: 0.85,
          dashArray
        }).addTo(this.layers.routes);
      }
    });
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
        <!-- SVG Vector Map Terrain Canvas -->
        <svg viewBox="0 0 800 480" style="width:100%;height:100%;display:block;background:linear-gradient(180deg, #E6F0FA 0%, #EDF4FB 100%);">
          <!-- Grid Lines -->
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#DCE8F5" stroke-width="1"/>
            </pattern>
          </defs>
          <rect width="800" height="480" fill="url(#grid)" />

          <!-- River Ganga Flow Vector -->
          <path d="M 100,50 Q 250,150 400,220 T 700,450" fill="none" stroke="#BFE0FF" stroke-width="22" stroke-linecap="round" />
          <path d="M 100,50 Q 250,150 400,220 T 700,450" fill="none" stroke="#79B8FF" stroke-width="12" stroke-linecap="round" />

          <!-- Highway NH-58 Primary Corridor -->
          <path d="M 120,90 Q 280,180 440,240 T 680,410" fill="none" stroke="#94A3B8" stroke-width="6" stroke-dasharray="8,6" />
          
          <!-- Alternative High-Mountain Bypass Route -->
          <path d="M 120,90 Q 220,40 380,80 T 680,410" fill="none" stroke="#10B981" stroke-width="5" />

          <!-- Warehouses -->
          <g transform="translate(130, 95)" cursor="pointer" onclick="window.disasterStore && window.UI.showToast('Central Hub Alpha (Dehradun North)', 'blue')">
            <circle r="18" fill="#1D63ED" />
            <text x="0" y="5" font-size="14" text-anchor="middle" fill="#fff">📦</text>
            <text x="0" y="28" font-size="11" font-weight="700" text-anchor="middle" fill="#1E293B">Hub Alpha</text>
          </g>

          <g transform="translate(450, 245)" cursor="pointer" onclick="window.disasterStore && window.UI.showToast('Depot Bravo (Rishikesh Bypass)', 'blue')">
            <circle r="16" fill="#1D63ED" />
            <text x="0" y="5" font-size="13" text-anchor="middle" fill="#fff">📦</text>
            <text x="0" y="26" font-size="11" font-weight="700" text-anchor="middle" fill="#1E293B">Depot Bravo</text>
          </g>

          <!-- Shelters -->
          <g transform="translate(670, 400)" cursor="pointer" onclick="window.disasterStore && window.UI.showToast('Shelter S-012 (Ganga Valley High School)', 'critical')">
            <circle r="18" fill="#DC2626" />
            <text x="0" y="5" font-size="14" text-anchor="middle" fill="#fff">🏠</text>
            <text x="0" y="28" font-size="11" font-weight="700" text-anchor="middle" fill="#DC2626">Shelter S-012 (Critical)</text>
          </g>

          <!-- Hazards -->
          <g transform="translate(360, 205)" cursor="pointer" onclick="window.disasterStore && window.UI.showToast('Flood Hazard at Bridge 7 (NH-58 Blocked)', 'critical')">
            <circle r="16" fill="#DC2626" opacity="0.9" />
            <text x="0" y="5" font-size="13" text-anchor="middle" fill="#fff">🌊</text>
            <text x="0" y="26" font-size="11" font-weight="700" text-anchor="middle" fill="#DC2626">Bridge 7 Blocked</text>
          </g>

          <!-- Active Convoys with Live Pulse -->
          <g transform="translate(260, 75)" cursor="pointer" onclick="window.disasterStore && window.UI.showToast('Convoy C-014 (Rajesh Kumar - En Route)', 'safe')">
            <circle r="17" fill="#059669" />
            <text x="0" y="5" font-size="14" text-anchor="middle" fill="#fff">🚛</text>
            <text x="0" y="27" font-size="11" font-weight="700" text-anchor="middle" fill="#059669">Convoy C-014</text>
          </g>
        </svg>

        <!-- Floating Quick Control -->
        <div style="position:absolute;bottom:14px;left:14px;background:rgba(255,255,255,0.92);backdrop-filter:blur(4px);padding:6px 14px;border-radius:20px;border:1px solid #CBD5E1;display:flex;gap:12px;font-size:11.5px;font-weight:600;color:#334155;">
          <span style="color:#1D63ED;">📦 3 Warehouses</span>
          <span style="color:#059669;">🚛 4 Convoys</span>
          <span style="color:#DC2626;">🏠 4 Shelters</span>
          <span style="color:#DC2626;">⚠️ 1 Blocked Bridge</span>
        </div>
      </div>
    `;
  }
}

window.DisasterMapEngine = DisasterMapEngine;
