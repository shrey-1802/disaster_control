import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { inventoryService } from './inventory.service.js';
import { successResponse } from '../../shared/utils/response.js';

const adjustSchema = z.object({
  warehouseId: z.string().min(1),
  supplyId: z.string().min(1),
  quantityDelta: z.number(),
  reason: z.string().min(1)
});

const receiveSchema = z.object({
  warehouseId: z.string().min(1),
  supplyId: z.string().min(1),
  quantity: z.number().positive(),
  batchNumber: z.string().optional()
});

export const inventoryRoutes: FastifyPluginAsync = async (app) => {
  // POST /api/v1/inventory/adjust
  app.post('/adjust', { preHandler: [app.authenticate, app.authorize(['CONTROL_ROOM', 'WAREHOUSE_MANAGER'])] }, async (request, reply) => {
    const body = adjustSchema.parse(request.body);
    const result = await inventoryService.adjustStock({
      warehouseId: body.warehouseId,
      supplyId: body.supplyId,
      quantityDelta: body.quantityDelta,
      reason: body.reason,
      performedBy: request.user.operatorId
    });

    return reply.send(successResponse(result, { requestId: request.id }));
  });

  // POST /api/v1/inventory/receive
  app.post('/receive', { preHandler: [app.authenticate, app.authorize(['CONTROL_ROOM', 'WAREHOUSE_MANAGER'])] }, async (request, reply) => {
    const body = receiveSchema.parse(request.body);
    const result = await inventoryService.receiveStock({
      warehouseId: body.warehouseId,
      supplyId: body.supplyId,
      quantity: body.quantity,
      batchNumber: body.batchNumber,
      performedBy: request.user.operatorId
    });

    return reply.send(successResponse(result, { requestId: request.id }));
  });

  // GET /api/v1/inventory/transactions
  app.get('/transactions', { preHandler: [app.authenticate] }, async (request, reply) => {
    const query = request.query as { warehouseId?: string };
    const transactions = await inventoryService.getTransactions(query.warehouseId);
    return reply.send(successResponse(transactions, { requestId: request.id }));
  });
};
