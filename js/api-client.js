/**
 * DISISTA CONTROL — API Client Bridge & Real-Time WebSocket Telemetry
 * Connects Frontend UI seamlessly to the Fastify + Prisma Production Backend.
 * Features automatic offline fallback & JWT session management.
 */

const isLocalEnv = !window.location.hostname || 
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1' || 
  window.location.protocol === 'file:';

const API_CONFIG = {
  baseUrl: isLocalEnv ? 'http://localhost:3000/api/v1' : '/api/v1',
  wsUrl: isLocalEnv ? 'ws://localhost:3000/ws/telemetry' : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/telemetry`,
  tokenKey: 'DISISTA_AUTH_TOKEN',
  timeoutMs: 6000
};

class ApiClient {
  constructor() {
    this.token = localStorage.getItem(API_CONFIG.tokenKey) || null;
    this.isBackendOnline = false;
    this.ws = null;
    this.wsSubscribers = new Set();
    this.initHealthCheck();
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem(API_CONFIG.tokenKey, token);
    } else {
      localStorage.removeItem(API_CONFIG.tokenKey);
    }
  }

  getToken() {
    return this.token || localStorage.getItem(API_CONFIG.tokenKey);
  }

  async initHealthCheck() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${API_CONFIG.baseUrl.replace('/api/v1', '')}/health`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        this.isBackendOnline = true;
        console.log('⚡ [DISISTA API] Connected to live backend server at', API_CONFIG.baseUrl);
        this.connectWebSocket();
      }
    } catch {
      this.isBackendOnline = false;
      console.log('ℹ️ [DISISTA API] Backend offline/unreachable. Operating in local simulation mode.');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${API_CONFIG.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const error = new Error(data?.error?.message || `Request failed with status ${response.status}`);
        error.status = response.status;
        error.code = data?.error?.code || 'HTTP_ERROR';
        error.details = data?.error?.details;
        throw error;
      }

      this.isBackendOnline = true;
      return data;
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  }

  // --- 1. AUTHENTICATION ---
  async login(operatorId, password, role, pincode) {
    const res = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ operatorId, password, role, pincode })
    });

    if (res?.data?.accessToken) {
      this.setToken(res.data.accessToken);
    }
    return res.data;
  }

  async getMe() {
    const res = await this.request('/auth/me');
    return res.data;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (e) {
      console.warn('Logout API error:', e);
    } finally {
      this.setToken(null);
    }
  }

  // --- 2. DASHBOARD ---
  async getDashboard() {
    const res = await this.request('/dashboard');
    return res.data;
  }

  // --- 3. WAREHOUSES & INVENTORY ---
  async getWarehouses() {
    const res = await this.request('/warehouses');
    return res.data;
  }

  async getWarehouseInventory(warehouseId) {
    const res = await this.request(`/warehouses/${warehouseId}/inventory`);
    return res.data;
  }

  async adjustStock(params) {
    const res = await this.request('/inventory/adjust', {
      method: 'POST',
      body: JSON.stringify(params)
    });
    return res.data;
  }

  async receiveStock(params) {
    const res = await this.request('/inventory/receive', {
      method: 'POST',
      body: JSON.stringify(params)
    });
    return res.data;
  }

  // --- 4. SHELTERS ---
  async getShelters() {
    const res = await this.request('/shelters');
    return res.data;
  }

  async updateShelterDemand(shelterId, supplyId, availableUnits, requiredDaily) {
    const res = await this.request(`/shelters/${shelterId}/demand`, {
      method: 'POST',
      body: JSON.stringify({ supplyId, availableUnits, requiredDaily })
    });
    return res.data;
  }

  // --- 5. HAZARDS ---
  async getHazards(activeOnly = false) {
    const res = await this.request(`/hazards?activeOnly=${activeOnly}`);
    return res.data;
  }

  async createHazard(hazardData) {
    const res = await this.request('/hazards', {
      method: 'POST',
      body: JSON.stringify(hazardData)
    });
    return res.data;
  }

  async verifyHazard(hazardId) {
    const res = await this.request(`/hazards/${hazardId}/verify`, { method: 'POST' });
    return res.data;
  }

  async resolveHazard(hazardId) {
    const res = await this.request(`/hazards/${hazardId}/resolve`, { method: 'POST' });
    return res.data;
  }

  // --- 6. CONVOYS & MISSIONS ---
  async getConvoys() {
    const res = await this.request('/convoys');
    return res.data;
  }

  async updateConvoyStatus(convoyId, status, notes) {
    const res = await this.request(`/convoys/${convoyId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, notes })
    });
    return res.data;
  }

  async updateConvoyLocation(convoyId, latitude, longitude) {
    const res = await this.request(`/convoys/${convoyId}/location`, {
      method: 'POST',
      body: JSON.stringify({ latitude, longitude })
    });
    return res.data;
  }

  async confirmConvoyDelivery(convoyId) {
    const res = await this.request(`/convoys/${convoyId}/deliver`, { method: 'POST' });
    return res.data;
  }

  async getDriverMission() {
    const res = await this.request('/drivers/me/mission');
    return res.data;
  }

  // --- 7. ROUTES & MAP ---
  async calculateRoute(originLat, originLng, destLat, destLng, convoyId) {
    const res = await this.request('/routes/calculate', {
      method: 'POST',
      body: JSON.stringify({ originLat, originLng, destLat, destLng, convoyId })
    });
    return res.data;
  }

  async getMapOverview() {
    const res = await this.request('/map/overview');
    return res.data;
  }

  // --- 8. SUPPLY SWAP ---
  async getSupplySwaps() {
    const res = await this.request('/supply-swaps');
    return res.data;
  }

  async createSupplySwap(fromWarehouseId, toWarehouseId, supplyId, quantity, reason) {
    const res = await this.request('/supply-swaps', {
      method: 'POST',
      body: JSON.stringify({ fromWarehouseId, toWarehouseId, supplyId, quantity, reason })
    });
    return res.data;
  }

  async approveSupplySwap(swapId) {
    const res = await this.request(`/supply-swaps/${swapId}/approve`, { method: 'POST' });
    return res.data;
  }

  async receiveSupplySwap(swapId) {
    const res = await this.request(`/supply-swaps/${swapId}/receive`, { method: 'POST' });
    return res.data;
  }

  // --- 9. ALERTS ---
  async getAlerts(criticalOnly = false) {
    const res = await this.request(`/alerts?criticalOnly=${criticalOnly}`);
    return res.data;
  }

  async acknowledgeAlert(alertId, comment) {
    const res = await this.request(`/alerts/${alertId}/acknowledge`, {
      method: 'POST',
      body: JSON.stringify({ comment })
    });
    return res.data;
  }

  async escalateAlert(alertId, comment) {
    const res = await this.request(`/alerts/${alertId}/escalate`, {
      method: 'POST',
      body: JSON.stringify({ comment })
    });
    return res.data;
  }

  // --- 10. OFFLINE SYNC ---
  async pushSyncBatch(events) {
    const res = await this.request('/sync/push', {
      method: 'POST',
      body: JSON.stringify({ events })
    });
    return res.data;
  }

  // --- 11. REPORTS ---
  async getReportsOverview() {
    const res = await this.request('/reports/operations');
    return res.data;
  }

  // --- 12. WEBSOCKET REAL-TIME TELEMETRY ---
  connectWebSocket() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      this.ws = new WebSocket(API_CONFIG.wsUrl);

      this.ws.onopen = () => {
        console.log('📡 [DISISTA WEBSOCKET] Telemetry stream connected.');
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.wsSubscribers.forEach(cb => cb(message));
        } catch (e) {
          console.warn('WS message parse error:', e);
        }
      };

      this.ws.onclose = () => {
        // Reconnect after 5 seconds if disconnected
        setTimeout(() => this.connectWebSocket(), 5000);
      };

      this.ws.onerror = () => {
        // Silent catch for dev mode
      };
    } catch {
      // WebSocket unsupported or blocked
    }
  }

  subscribeWs(callback) {
    this.wsSubscribers.add(callback);
    return () => this.wsSubscribers.delete(callback);
  }
}

// Global Singleton
window.apiClient = new ApiClient();
