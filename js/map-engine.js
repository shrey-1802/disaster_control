/**
 * DISISTA CONTROL — Geospatial Map Engine
 * Powered by Leaflet with White + Light Blue Workplace Map System
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
  }

  init() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    if (typeof L !== 'undefined') {
      try {
        this.initLeafletMap(container);
      } catch (err) {
        console.warn("Leaflet init error, using fallback vector map:", err);
        this.initFallbackMap(container);
      }
    } else {
      this.initFallbackMap(container);
    }
  }

  initLeafletMap(container) {
    this.map = L.map(this.containerId, {
      center: this.options.center,
      zoom: this.options.zoom,
      zoomControl: false,
      attributionControl: false
    });

    // Clean light basemap from CartoDB Voyager
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(this.map);

    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    this.layers.routes = L.featureGroup().addTo(this.map);
    this.layers.warehouses = L.featureGroup().addTo(this.map);
    this.layers.shelters = L.featureGroup().addTo(this.map);
    this.layers.hazards = L.featureGroup().addTo(this.map);
    this.layers.convoys = L.featureGroup().addTo(this.map);

    this.renderAllData();
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
          html: `<div class="custom-map-pin ${iconClass}" title="${cv.code}">🚛</div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 17]
        });

        const marker = L.marker([cv.currentLat, cv.currentLng], { icon }).addTo(this.layers.convoys);
        marker.on('click', () => this.handleEntityClick('convoy', cv));
      });
    }
  }

  renderRoutes(state) {
    // Primary Arterial Highway
    const blockedHighwayPoints = [
      [30.3450, 78.0550], // Hub Alpha
      [30.2500, 78.1200], // Song River
      [30.1800, 78.2300], // Flash Flood point
      [30.1350, 78.3220]  // Shelter S-012
    ];

    // Primary safe segment (Blue)
    L.polyline(blockedHighwayPoints.slice(0, 3), {
      color: '#318ED0',
      weight: 4,
      dashArray: '6, 8',
      opacity: 0.85
    }).addTo(this.layers.routes);

    // Submerged/Blocked segment (Red)
    L.polyline(blockedHighwayPoints.slice(2), {
      color: '#D94B55',
      weight: 5,
      opacity: 0.95
    }).addTo(this.layers.routes);

    // Alternative Rerouted Bypass Path (Green / Safe)
    const alternateReroutePoints = [
      [30.2500, 78.1200],
      [30.2100, 78.2900], // High mountain ridge pass
      [30.1350, 78.3220]
    ];

    L.polyline(alternateReroutePoints, {
      color: '#20A66A',
      weight: 4,
      dashArray: '8, 8',
      opacity: 0.95
    }).addTo(this.layers.routes);
  }

  setLayerFilter(layerKey, isVisible) {
    this.activeFilters[layerKey] = isVisible;
    if (this.layers[layerKey]) {
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

  initFallbackMap(container) {
    container.innerHTML = `
      <div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#F8FBFF;color:#172B3A;padding:20px;text-align:center;border:1px solid #E2EAF2;">
        <div style="font-size:32px;margin-bottom:10px;">🗺️</div>
        <div style="font-weight:700;font-size:18px;margin-bottom:6px;color:#172B3A;">India Relief Operational Map Active</div>
        <div style="font-size:13px;color:#5F7180;max-width:400px;">
          Sector 7 (Dehradun - Rishikesh Corridor): 4 Active Convoys, 3 Warehouses, 4 Shelters, 4 Hazards tracked.
        </div>
      </div>
    `;
  }
}

window.DisasterMapEngine = DisasterMapEngine;
