import { prisma } from '../../config/database.js';

export class DashboardService {
  public async getDashboardData(user: { role: string; userId: string; assignedWarehouseId?: string | null }) {
    const role = user.role.toUpperCase();

    if (role === 'CONTROL_ROOM') {
      return this.getControlRoomDashboard();
    } else if (role === 'WAREHOUSE_MANAGER') {
      return this.getWarehouseManagerDashboard(user.assignedWarehouseId);
    } else {
      return this.getFieldDriverDashboard(user.userId);
    }
  }

  private async getControlRoomDashboard() {
    const [convoys, warehouses, shelters, hazards, alerts, swaps] = await Promise.all([
      prisma.convoy.findMany({ include: { items: { include: { supply: true } }, driver: true } }),
      prisma.warehouse.findMany({ include: { inventory: { include: { supply: true } } } }),
      prisma.shelter.findMany({ include: { demands: { include: { supply: true } } } }),
      prisma.hazard.findMany({ where: { status: { in: ['ACTIVE', 'VERIFIED'] } } }),
      prisma.alert.findMany({ where: { status: { not: 'RESOLVED' } }, orderBy: { createdAt: 'desc' } }),
      prisma.supplySwapRequest.findMany({ where: { status: { in: ['APPROVED', 'IN_TRANSIT'] } } })
    ]);

    const activeConvoysCount = convoys.filter(c => c.status === 'EN_ROUTE' || c.status === 'DISPATCHED').length;
    const delayedConvoysCount = convoys.filter(c => c.status === 'DELAYED' || c.status === 'REROUTING').length;
    const criticalSheltersCount = shelters.filter(s => s.urgency === 'CRITICAL' || s.isIsolated).length;

    return {
      role: 'CONTROL_ROOM',
      sector: 'Sector 7 (Dehradun - Rishikesh)',
      kpis: [
        { icon: '🚛', eyebrow: 'ACTIVE CONVOYS', value: `${activeConvoysCount} Units`, caption: `${delayedConvoysCount} rerouted`, accent: 'blue' },
        { icon: '🏠', eyebrow: 'POPULATION COVERAGE', value: '8,420 Souls', caption: 'Across 4 relief shelters', accent: 'safe' },
        { icon: '⚠️', eyebrow: 'ACTIVE HAZARDS', value: `${hazards.length} Blockages`, caption: 'Flash floods & landslides', accent: 'caution' },
        { icon: '🚨', eyebrow: 'CRITICAL DEFICITS', value: `${criticalSheltersCount} Shelters`, caption: 'Immediate swap needed', accent: 'critical' },
        { icon: '📦', eyebrow: 'AVAILABLE RELIEF', value: '13,140 Units', caption: 'Ready for dispatch', accent: 'safe' },
        { icon: '🔄', eyebrow: 'IN-TRANSIT SWAPS', value: `${swaps.length} Transfers`, caption: 'Cross-depot rebalancing', accent: 'blue' }
      ],
      convoys,
      warehouses,
      shelters,
      hazards,
      alerts
    };
  }

  private async getWarehouseManagerDashboard(warehouseId?: string | null) {
    const warehouse = await prisma.warehouse.findFirst({
      where: warehouseId ? { id: warehouseId } : undefined,
      include: {
        inventory: { include: { supply: true } },
        outgoingSwaps: { include: { items: { include: { supply: true } } } },
        incomingSwaps: { include: { items: { include: { supply: true } } } }
      }
    });

    const totalStock = warehouse?.inventory.reduce((sum, i) => sum + i.quantityOnHand, 0) || 0;
    const reservedStock = warehouse?.inventory.reduce((sum, i) => sum + i.quantityReserved, 0) || 0;
    const freeAvailable = warehouse?.inventory.reduce((sum, i) => sum + i.quantityAvailable, 0) || 0;

    return {
      role: 'WAREHOUSE_MANAGER',
      warehouse: warehouse ? {
        id: warehouse.id,
        code: warehouse.code,
        name: warehouse.name,
        location: warehouse.locationName
      } : null,
      kpis: [
        { icon: '📦', eyebrow: 'TOTAL STOCK', value: `${totalStock.toLocaleString()} Units`, caption: 'Physical storage', accent: 'blue' },
        { icon: '❄️', eyebrow: 'COLD-CHAIN VIABILITY', value: '3.4°C - 3.8°C', caption: 'All storage nominal', accent: 'safe' },
        { icon: '🔒', eyebrow: 'RESERVED STOCK', value: `${reservedStock.toLocaleString()} Units`, caption: 'Locked for scheduled convoys', accent: 'caution' },
        { icon: '✅', eyebrow: 'FREE AVAILABLE', value: `${freeAvailable.toLocaleString()} Units`, caption: 'Ready for immediate dispatch', accent: 'safe' }
      ],
      inventory: warehouse?.inventory || []
    };
  }

  private async getFieldDriverDashboard(userId: string) {
    const convoy = await prisma.convoy.findFirst({
      where: {
        driverId: userId,
        status: { in: ['DISPATCHED', 'ACKNOWLEDGED', 'EN_ROUTE', 'DELAYED', 'REROUTING'] }
      },
      include: {
        sourceWarehouse: true,
        destShelter: true,
        items: { include: { supply: true } },
        routes: { take: 1, orderBy: { createdAt: 'desc' } }
      }
    });

    return {
      role: 'FIELD_DRIVER',
      convoy,
      kpis: [
        { icon: '🚛', eyebrow: 'ACTIVE MISSION', value: convoy ? convoy.code : 'None Assigned', caption: convoy ? `ETA: ${convoy.etaMinutes} mins` : 'Standby', accent: 'blue' },
        { icon: '❄️', eyebrow: 'CARGO TEMP', value: convoy?.coldChainTemp ? `${convoy.coldChainTemp}°C` : 'Nominal', caption: 'Cold-chain integrity nominal', accent: 'safe' },
        { icon: '🛡️', eyebrow: 'ROUTE RISK', value: convoy?.routes[0] ? `${convoy.routes[0].riskScore}/100` : '15/100', caption: 'High mountain ridge pass', accent: 'caution' },
        { icon: '📡', eyebrow: 'FIELD SYNC', value: 'Online', caption: '0 offline reports pending', accent: 'safe' }
      ]
    };
  }
}

export const dashboardService = new DashboardService();
