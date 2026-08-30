/**
 * DISISTA CONTROL — Authentication, Session & Role-Based Access Control (RBAC)
 * 3 Operational Roles: Control Room, Warehouse Manager, Field Driver
 */

const AUTH_STORAGE_KEY = 'DISISTA_CONTROL_AUTH_SESSION';

const ROLES = {
  control_room: {
    id: "control_room",
    title: "Control Room Commander",
    badge: "HQ Command",
    icon: "🎯",
    description: "Central command and operational decision-making with full network oversight.",
    permissions: {
      canRerouteGlobal: true,
      canBlockRoads: true,
      canVerifyHazards: true,
      canApproveSwaps: true,
      canEscalateHQ: true,
      canManageInventory: true,
      canDispatchConvoys: true,
      fieldModeOnly: false
    }
  },
  warehouse_manager: {
    id: "warehouse_manager",
    title: "Logistics & Warehouse Manager",
    badge: "Warehouse Mgr",
    icon: "📦",
    description: "Manage warehouse inventory, identify shortages/surpluses, and initiate Supply Swaps.",
    permissions: {
      canRerouteGlobal: false,
      canBlockRoads: false,
      canVerifyHazards: false,
      canApproveSwaps: true,
      canEscalateHQ: false,
      canManageInventory: true,
      canDispatchConvoys: false,
      fieldModeOnly: false
    }
  },
  field_driver: {
    id: "field_driver",
    title: "Relief Convoy Field Driver",
    badge: "Field Driver",
    icon: "🚛",
    description: "Mission execution, real-time route alerts, 1-tap hazard reporting, and offline sync.",
    permissions: {
      canRerouteGlobal: false,
      canBlockRoads: false,
      canVerifyHazards: false,
      canApproveSwaps: false,
      canEscalateHQ: false,
      canManageInventory: false,
      canDispatchConvoys: false,
      fieldModeOnly: true
    }
  }
};

class AuthManager {
  constructor() {
    this.session = this.loadSession();
  }

  loadSession() {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // If legacy session had district_admin, fall back to control_room
        if (parsed.role === 'district_admin') {
          parsed.role = 'control_room';
          parsed.roleTitle = 'Control Room Commander';
        }
        return parsed;
      }
    } catch (e) {
      console.warn("Error loading auth session:", e);
    }
    // Default session is Control Room
    return {
      role: "control_room",
      operatorId: "HQ-CMD-001",
      name: "Commander A. Sharma",
      pincode: "248001",
      district: "Dehradun - Rishikesh Disaster Division",
      authenticated: true,
      loginTime: new Date().toISOString()
    };
  }

  saveSession(session) {
    this.session = session;
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  }

  login(role, operatorId, pincode, customName) {
    const roleConfig = ROLES[role] || ROLES.control_room;
    
    // Resolve location from pincode using DisasterStore
    let sector = null;
    if (window.disasterStore) {
      sector = window.disasterStore.resolvePincode(pincode || "248001");
    }

    const session = {
      role: roleConfig.id,
      roleTitle: roleConfig.title,
      operatorId: operatorId || `${role.toUpperCase().slice(0, 3)}-${Math.floor(100 + Math.random() * 900)}`,
      name: customName || (role === 'field_driver' ? 'Rajesh Kumar (Driver)' : 'Command Officer'),
      pincode: pincode || "248001",
      district: sector ? sector.district : "Dehradun Division",
      state: sector ? sector.state : "Uttarakhand",
      authenticated: true,
      loginTime: new Date().toISOString()
    };

    this.saveSession(session);
    return session;
  }

  quickDemoLogin(roleId) {
    const defaultCredentials = {
      control_room: { id: "HQ-CMD-001", name: "HQ Commander A. Sharma", pin: "248001" },
      warehouse_manager: { id: "WH-MGR-02", name: "Logistics Lead S. Negi", pin: "248001" },
      field_driver: { id: "DRV-401", name: "Rajesh Kumar (Convoy C-014)", pin: "248001" }
    };

    const cred = defaultCredentials[roleId] || defaultCredentials.control_room;
    return this.login(roleId, cred.id, cred.pin, cred.name);
  }

  logout() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    window.location.href = "login.html";
  }

  getCurrentUser() {
    return this.session;
  }

  getRoleConfig() {
    return ROLES[this.session.role] || ROLES.control_room;
  }

  hasPermission(permissionName) {
    const config = this.getRoleConfig();
    return !!config.permissions[permissionName];
  }

  switchRole(roleId) {
    this.quickDemoLogin(roleId);
    window.location.reload();
  }
}

window.authManager = new AuthManager();
