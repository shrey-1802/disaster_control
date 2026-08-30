export const ROLES = {
  CONTROL_ROOM: 'CONTROL_ROOM',
  WAREHOUSE_MANAGER: 'WAREHOUSE_MANAGER',
  FIELD_DRIVER: 'FIELD_DRIVER'
} as const;

export type RoleName = keyof typeof ROLES;

export const ROLE_PERMISSIONS = {
  CONTROL_ROOM: [
    'dashboard:view',
    'map:view',
    'convoys:manage',
    'convoys:dispatch',
    'convoys:reroute',
    'hazards:verify',
    'hazards:resolve',
    'alerts:manage',
    'alerts:escalate',
    'supply_swap:approve',
    'reports:view',
    'settings:manage'
  ],
  WAREHOUSE_MANAGER: [
    'dashboard:view',
    'map:view',
    'inventory:manage',
    'inventory:adjust',
    'inventory:receive',
    'supply_swap:create',
    'supply_swap:receive',
    'shelters:view',
    'alerts:view',
    'reports:view'
  ],
  FIELD_DRIVER: [
    'dashboard:view',
    'map:view',
    'convoy:view_assigned',
    'convoy:update_status',
    'convoy:confirm_delivery',
    'hazard:report',
    'offline:sync'
  ]
} as const;
