import type { FastifyPluginAsync } from 'fastify';
import { prisma } from '../../config/database.js';
import { inventoryService } from '../inventory/inventory.service.js';
import { successResponse } from '../../shared/utils/response.js';

export const warehouseRoutes: FastifyPluginAsync = async (app) => {
  // GET /api/v1/warehouses
  app.get('/', { preHandler: [app.authenticate] }, async (request, reply) => {
    const warehouses = await prisma.warehouse.findMany({
      include: {
        inventory: {
          include: { supply: true }
        }
      }
    });

    const data = warehouses.map(wh => {
      const totalStock = wh.inventory.reduce((sum, item) => sum + item.quantityOnHand, 0);
      const totalReserved = wh.inventory.reduce((sum, item) => sum + item.quantityReserved, 0);
      const totalAvailable = wh.inventory.reduce((sum, item) => sum + item.quantityAvailable, 0);
      const criticalCount = wh.inventory.filter(i => i.healthStatus === 'CRITICAL').length;

      return {
        id: wh.id,
        code: wh.code,
        name: wh.name,
        locationName: wh.locationName,
        latitude: wh.latitude,
        longitude: wh.longitude,
        pincode: wh.pincode,
        capacityUnits: wh.capacityUnits,
        totalStock,
        totalReserved,
        totalAvailable,
        criticalDeficitsCount: criticalCount,
        status: wh.status
      };
    });

    return reply.send(successResponse(data, { requestId: request.id }));
  });

  // GET /api/v1/warehouses/:id/inventory
  app.get('/:id/inventory', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const items = await inventoryService.getWarehouseInventory(id);
    return reply.send(successResponse(items, { requestId: request.id }));
  });
};
