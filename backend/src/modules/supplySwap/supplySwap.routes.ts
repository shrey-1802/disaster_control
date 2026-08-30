import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { supplySwapService } from './supplySwap.service.js';
import { successResponse } from '../../shared/utils/response.js';

const createSwapSchema = z.object({
  fromWarehouseId: z.string().min(1),
  toWarehouseId: z.string().min(1),
  supplyId: z.string().min(1),
  quantity: z.number().positive(),
  reason: z.string().min(1)
});

export const supplySwapRoutes: FastifyPluginAsync = async (app) => {
  // GET /api/v1/supply-swaps
  app.get('/', { preHandler: [app.authenticate] }, async (request, reply) => {
    const list = await supplySwapService.listSwaps();
    return reply.send(successResponse(list, { requestId: request.id }));
  });

  // POST /api/v1/supply-swaps
  app.post('/', { preHandler: [app.authenticate, app.authorize(['CONTROL_ROOM', 'WAREHOUSE_MANAGER'])] }, async (request, reply) => {
    const body = createSwapSchema.parse(request.body);
    const created = await supplySwapService.createSwap({
      ...body,
      requestedBy: request.user.operatorId
    });
    return reply.status(201).send(successResponse(created, { requestId: request.id }));
  });

  // POST /api/v1/supply-swaps/:id/approve
  app.post('/:id/approve', { preHandler: [app.authenticate, app.authorize(['CONTROL_ROOM'])] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const approved = await supplySwapService.approveSwap(id, request.user.operatorId);
    return reply.send(successResponse(approved, { requestId: request.id }));
  });

  // POST /api/v1/supply-swaps/:id/receive
  app.post('/:id/receive', { preHandler: [app.authenticate, app.authorize(['WAREHOUSE_MANAGER', 'CONTROL_ROOM'])] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const received = await supplySwapService.receiveSwap(id, request.user.operatorId);
    return reply.send(successResponse(received, { requestId: request.id }));
  });
};
