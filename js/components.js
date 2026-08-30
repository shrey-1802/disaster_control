/**
 * DISISTA CONTROL — Reusable UI Components & Renderers
 * Tailored for 3 Roles: Control Room, Warehouse Manager, Field Driver
 * Fully Responsive with Mobile Navigation Drawer & Touch Optimizations
 */

const UI = {
  // 1. Top Navbar Renderer
  renderNavbar(activePage) {
    const user = window.authManager.getCurrentUser();
    const roleConfig = window.authManager.getRoleConfig();
    const state = window.disasterStore.getState();

    const criticalAlertsCount = state.alerts.filter(a => !a.acknowledged && a.severity === 'critical').length;

    // Filter menu items based on 3-role permissions
    const allNavLinks = [
      { id: "dashboard", label: "Dashboard", href: "dashboard.html", icon: "📊", roles: ["control_room", "warehouse_manager", "field_driver"] },
      { id: "live-map", label: "Live Map", href: "live-map.html", icon: "🗺️", roles: ["control_room", "warehouse_manager", "field_driver"] },
      { id: "convoy-dispatch", label: "Convoys", href: "convoy-dispatch.html", icon: "🚛", roles: ["control_room", "warehouse_manager"] },
      { id: "shelter-board", label: "Shelters", href: "shelter-board.html", icon: "🏠", roles: ["control_room", "warehouse_manager"] },
      { id: "hazard-log", label: "Hazards", href: "hazard-log.html", icon: "⚠️", roles: ["control_room", "warehouse_manager", "field_driver"] },
      { id: "supply-swap", label: "Supply Swap", href: "supply-swap.html", icon: "🔄", roles: ["control_room", "warehouse_manager"] },
      { id: "warehouse-inventory", label: "Inventory", href: "warehouse-inventory.html", icon: "📦", roles: ["control_room", "warehouse_manager"] },
      { id: "alerts", label: "Alerts", href: "alerts.html", icon: "🚨", badge: criticalAlertsCount, roles: ["control_room", "warehouse_manager", "field_driver"] },
      { id: "reports", label: "Reports", href: "reports.html", icon: "📈", roles: ["control_room", "warehouse_manager"] },
      { id: "settings", label: "Settings", href: "settings.html", icon: "⚙️", roles: ["control_room", "warehouse_manager", "field_driver"] }
    ];

    const allowedLinks = allNavLinks.filter(l => l.roles.includes(user.role));

    const navLinksHtml = allowedLinks.map(link => {
      const isActive = link.id === activePage ? 'active' : '';
      const badgeHtml = link.badge > 0 ? `<span class="badge-count">${link.badge}</span>` : '';
      return `
        <a href="${link.href}" class="nav-link ${isActive}">
          <span>${link.icon}</span>
          <span>${link.label}</span>
          ${badgeHtml}
        </a>
      `;
    }).join('');

    return `
      <header class="top-navbar">
        <div class="brand-section">
          <a href="dashboard.html" style="display:flex;align-items:center;gap:12px;">
            <div class="brand-logo">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div class="brand-title">
              <span class="brand-name">DISISTA CONTROL</span>
              <span class="brand-subtitle">Emergency Supply Chain Matrix</span>
            </div>
          </a>
        </div>

        <nav class="nav-menu" id="primary-nav-menu">
          ${navLinksHtml}
        </nav>

        <div class="nav-controls">
          <div class="network-live-indicator" title="Connected to Central Emergency Telemetry">
            <div class="pulse-dot"></div>
            <span>LIVE GRID</span>
          </div>

          <div class="sector-badge" title="Active Disaster Operation Sector">
            <span>📍</span>
            <span>PIN: <strong>${user.pincode || '248001'}</strong></span>
          </div>

          <button class="role-badge-btn" onclick="UI.openRoleSwitcherModal()" title="Current Active Role (Click to Switch)">
            <div class="role-avatar">${roleConfig.icon}</div>
            <span>${roleConfig.badge}</span>
            <span style="font-size:10px;opacity:0.6;">▼</span>
          </button>
        </div>
      </header>
    `;
  },

  // 2. Stat / KPI Card (Light Card Pattern §3.3)
  createKpiCard(options) {
    const {
      icon,
      eyebrow,
      value,
      caption,
      accent = "blue",
      trendHtml = ""
    } = options;

    return `
      <div class="kpi-card accent-${accent}">
        <div class="kpi-header">
          <span class="kpi-eyebrow">${eyebrow}</span>
          <span class="kpi-icon">${icon}</span>
        </div>
        <div class="kpi-numeral">${value}</div>
        <div class="kpi-caption">
          ${trendHtml}
          <span>${caption}</span>
        </div>
      </div>
    `;
  },

  // 3. Status Pill
  createStatusPill(status, customLabel) {
    const map = {
      safe: { label: "Safe / Confirmed", class: "safe", icon: "✓" },
      on_route: { label: "On Route", class: "safe", icon: "🚛" },
      stable: { label: "Stable", class: "safe", icon: "✓" },
      delivered: { label: "Delivered", class: "safe", icon: "✓" },

      caution: { label: "Caution / Warning", class: "caution", icon: "⚠️" },
      delayed: { label: "Delayed", class: "caution", icon: "⏱" },
      rerouted: { label: "Rerouted", class: "caution", icon: "🔄" },
      low: { label: "Low Stock", class: "caution", icon: "⚠️" },

      critical: { label: "Critical / Blocked", class: "critical", icon: "🚨" },
      high_risk: { label: "High Risk", class: "critical", icon: "🔴" },
      isolated: { label: "Isolated Shelter", class: "critical", icon: "🚫" },

      info: { label: "Info Notice", class: "info", icon: "ℹ" }
    };

    const config = map[status] || { label: status, class: "passive-neutral", icon: "•" };
    const label = customLabel || config.label;

    return `
      <span class="status-pill ${config.class}">
        <span>${config.icon}</span>
        <span>${label}</span>
      </span>
    `;
  },

  // 4. Data Level / Progress Bar
  createDataBar(options) {
    const {
      title,
      current,
      max,
      unit = "units",
      variant = "safe"
    } = options;

    const pct = Math.min(100, Math.max(0, Math.round((current / max) * 100)));

    return `
      <div class="bar-container">
        <div class="bar-header">
          <span class="bar-title">${title}</span>
          <span class="bar-label">${current.toLocaleString()} / ${max.toLocaleString()} ${unit} (${pct}%)</span>
        </div>
        <div class="bar-track">
          <div class="bar-fill fill-${variant}" style="width: ${pct}%;"></div>
        </div>
      </div>
    `;
  },

  // 5. SVG Sparkline or Honest Empty State
  createSparkline(dataPoints) {
    if (!dataPoints || dataPoints.length < 2) {
      return `<div class="sparkline-empty">Not enough history yet</div>`;
    }

    const min = Math.min(...dataPoints);
    const max = Math.max(...dataPoints);
    const range = max - min || 1;

    const width = 100;
    const height = 26;

    const points = dataPoints.map((val, idx) => {
      const x = (idx / (dataPoints.length - 1)) * (width - 6) + 3;
      const y = height - 4 - ((val - min) / range) * (height - 8);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    return `
      <div class="sparkline-wrapper" title="Historical Days of Cover Trend">
        <svg class="sparkline-svg" viewBox="0 0 ${width} ${height}">
          <polyline class="sparkline-path" points="${points}" />
        </svg>
      </div>
    `;
  },

  // 6. Info Banner
  createInfoBanner(text, title = "System Notice") {
    return `
      <div class="info-banner">
        <span class="info-banner-icon">ℹ</span>
        <div class="info-banner-text">
          <strong>${title}:</strong> ${text}
        </div>
      </div>
    `;
  },

  // 7. Toast Notification Trigger
  showToast(message, type = "info") {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'critical' ? '🚨' : type === 'caution' ? '⚠️' : type === 'safe' ? '✅' : 'ℹ️';
    
    toast.innerHTML = `
      <span style="font-size:18px;">${icon}</span>
      <div style="flex:1;">${message}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  },

  // 8. Role Switcher Modal (3 Roles Only)
  openRoleSwitcherModal() {
    let modal = document.getElementById('role-switcher-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'role-switcher-modal';
      modal.className = 'modal-backdrop';
      modal.innerHTML = `
        <div class="modal-box">
          <div class="modal-header">
            <div class="modal-title">Switch Active Role / Mode</div>
            <button class="modal-close" onclick="UI.closeRoleSwitcherModal()">✕</button>
          </div>
          <p style="font-size:13.5px;color:var(--text-secondary);margin-bottom:16px;">
            Select one of the 3 operational roles to preview the customized workspace, permissions, and dashboards.
          </p>
          <div style="display:flex;flex-direction:column;gap:10px;">
            <button class="btn btn-secondary" style="justify-content:flex-start;padding:12px;" onclick="window.authManager.switchRole('control_room')">
              <span style="font-size:22px;margin-right:8px;">🎯</span>
              <div style="text-align:left;">
                <div style="font-weight:700;color:var(--text-primary);">1. Control Room Commander</div>
                <div style="font-size:12px;color:var(--text-secondary);">Central command, network risk score, global rerouting & road blocking</div>
              </div>
            </button>
            <button class="btn btn-secondary" style="justify-content:flex-start;padding:12px;" onclick="window.authManager.switchRole('warehouse_manager')">
              <span style="font-size:22px;margin-right:8px;">📦</span>
              <div style="text-align:left;">
                <div style="font-weight:700;color:var(--text-primary);">2. Warehouse Manager</div>
                <div style="font-size:12px;color:var(--text-secondary);">Inventory control (Available = Total - Reserved) & Supply Swaps</div>
              </div>
            </button>
            <button class="btn btn-secondary" style="justify-content:flex-start;padding:12px;" onclick="window.authManager.switchRole('field_driver')">
              <span style="font-size:22px;margin-right:8px;">🚛</span>
              <div style="text-align:left;">
                <div style="font-weight:700;color:var(--text-primary);">3. Relief Convoy Field Driver</div>
                <div style="font-size:12px;color:var(--text-secondary);">Field Mode, 1-tap hazard reporter, offline sync & delivery sign-off</div>
              </div>
            </button>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary btn-sm" onclick="window.authManager.logout()">Logout</button>
            <button class="btn btn-primary btn-sm" onclick="UI.closeRoleSwitcherModal()">Close</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    modal.classList.add('open');
  },

  closeRoleSwitcherModal() {
    const modal = document.getElementById('role-switcher-modal');
    if (modal) modal.classList.remove('open');
  }
};

window.UI = UI;
