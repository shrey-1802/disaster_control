import { prisma } from '../../config/database.js';
import { NotFoundError, InvalidStateTransitionError } from '../../shared/errors/AppError.js';
import { wsManager } from '../../plugins/websocket.js';

export interface CreateConvoyParams {
  code?: string;
  vehicleNo: string;
  driverId: string;
  driverPhone?: string;
  sourceWarehouseId: string;
  destShelterId?: string;
  destName: string;
  priority?: string;
  cargoItems: Array<{ supplyId: string; quantity: number; unit: string; tempMonitored?: boolean }>;
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
}

export class ConvoysService {
  public async listConvoys() {
    const convoys = await prisma.convoy.findMany({
      include: {
        driver: { select: { id: true, name: true, operatorId: true } },
        sourceWarehouse: { select: { id: true, name: true, code: true } },
        items: { include: { supply: true } },
        routes: { take: 1, orderBy: { createdAt: 'desc' } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return convoys.map(c => ({
      id: c.id,
      code: c.code,
      vehicleNo: c.vehicleNo,
      vehicleType: c.vehicleType,
      driverName: c.driver.name,
      driverId: c.driver.id,
      driverPhone: c.driverPhone,
      originName: c.sourceWarehouse.name,
      destName: c.destName,
      status: c.status,
      priority: c.priority,
      currentLat: c.currentLat,
      currentLng: c.currentLng,
      coldChainTemp: c.coldChainTemp,
      coldChainViable: c.coldChainViable,
      etaMinutes: c.etaMinutes,
      items: c.items.map(i => ({
        name: i.supply.name,
        quantity: i.quantity,
        unit: i.unit,
        isColdChain: i.supply.isColdChain
      })),
      route: c.routes[0] || null
    }));
  }

  public async getConvoy(id: string) {
    const convoy = await prisma.convoy.findUnique({
      where: { id },
      include: {
        driver: true,
        sourceWarehouse: true,
        items: { include: { supply: true } },
        statusHistory: { orderBy: { createdAt: 'desc' } },
        routes: { take: 1, orderBy: { createdAt: 'desc' } }
      }
    });

    if (!convoy) {
      throw new NotFoundError('Convoy', id);
    }

    return convoy;
  }

  public async getDriverMission(driverUserId: string) {
    const convoy = await prisma.convoy.findFirst({
      where: {
        driverId: driverUserId,
        status: { in: ['DISPATCHED', 'ACKNOWLEDGED', 'EN_ROUTE', 'DELAYED', 'REROUTING'] }
      },
      include: {
        sourceWarehouse: true,
        items: { include: { supply: true } },
        routes: { take: 1, orderBy: { createdAt: 'desc' } }
      }
    });

    return convoy;
  }

  public async updateLocation(convoyId: string, lat: number, lng: number) {
    const updated = await prisma.convoy.update({
      where: { id: convoyId },
      data: { currentLat: lat, currentLng: lng }
    });

    wsManager.broadcast('convoy.location', { convoyId, lat, lng });
    return updated;
  }

  public async updateStatus(convoyId: string, status: string, notes?: string, operatorId?: string) {
    const convoy = await prisma.convoy.findUnique({ where: { id: convoyId } });
    if (!convoy) {
      throw new NotFoundError('Convoy', convoyId);
    }

    if (convoy.status === 'DELIVERED') {
      throw new InvalidStateTransitionError('Convoy', 'DELIVERED', status);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const c = await tx.convoy.update({
        where: { id: convoyId },
        data: { status: status as any }
      });

      await tx.convoyStatusHistory.create({
        data: {
          convoyId,
          status: status as any,
          latitude: convoy.currentLat,
          longitude: convoy.currentLng,
          notes,
          updatedBy: operatorId || 'SYSTEM'
        }
      });

      return c;
    });

    wsManager.broadcast('convoy.status', { convoyId, status });
    return updated;
  }

  public async confirmDelivery(convoyId: string, operatorId: string) {
    return await prisma.$transaction(async (tx) => {
      const convoy = await tx.convoy.findUnique({
        where: { id: convoyId },
        include: { items: true, destShelter: true }
      });

      if (!convoy) {
        throw new NotFoundError('Convoy', convoyId);
      }

      if (convoy.status === 'DELIVERED') {
        return convoy; // Idempotent delivery
      }

      const delivered = await tx.convoy.update({
        where: { id: convoyId },
        data: {
          status: 'DELIVERED',
          actualArrival: new Date()
        }
      });

      // Update destination shelter demand and days-of-cover if bound to a shelter
      if (convoy.destShelterId) {
        for (const item of convoy.items) {
          const demand = await tx.shelterDemand.findUnique({
            where: { shelterId_supplyId: { shelterId: convoy.destShelterId, supplyId: item.supplyId } }
          });

          if (demand) {
            const newAvail = demand.availableUnits + item.quantity;
            const newDeficit = Math.max(0, demand.requiredDaily * 3 - newAvail);
            const daysRemaining = Math.round((newAvail / demand.requiredDaily) * 10) / 10;
            const urgency = daysRemaining < 1.0 ? 'CRITICAL' : daysRemaining < 2.5 ? 'HIGH' : 'NORMAL';

            await tx.shelterDemand.update({
              where: { id: demand.id },
              data: {
                availableUnits: newAvail,
                deficitUnits: newDeficit,
                daysRemaining,
                urgency: urgency as any
              }
            });
          }
        }
      }

      await tx.convoyStatusHistory.create({
        data: {
          convoyId,
          status: 'DELIVERED',
          latitude: convoy.currentLat,
          longitude: convoy.currentLng,
          notes: 'Delivery safely completed and offloaded.',
          updatedBy: operatorId
        }
      });

      wsManager.broadcast('convoy.delivered', { convoyId });
      return delivered;
    });
  }
}

export const convoysService = new ConvoysService();
