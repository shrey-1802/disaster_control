import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { sheltersService } from './shelters.service.js';
import { successResponse } from '../../shared/utils/response.js';

const demandSchema = z.object({
  supplyId: z.string().min(1),
  availableUnits: z.number().nonnegative(),
  requiredDaily: z.number().positive()
});

export const shelterRoutes: FastifyPluginAsync = async (app) => {
  // GET /api/v1/shelters
  app.get('/', { preHandler: [app.authenticate] }, async (request, reply) => {
    const list = await sheltersService.listShelters();
    return reply.send(successResponse(list, { requestId: request.id }));
  });

  // GET /api/v1/shelters/:id
  app.get('/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const shelter = await sheltersService.getShelter(id);
    return reply.send(successResponse(shelter, { requestId: request.id }));
  });

  // POST /api/v1/shelters/:id/demand
  app.post('/:id/demand', { preHandler: [app.authenticate, app.authorize(['CONTROL_ROOM', 'WAREHOUSE_MANAGER'])] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = demandSchema.parse(request.body);
    const updated = await sheltersService.updateDemand(id, body.supplyId, body.availableUnits, body.requiredDaily);
    return reply.send(successResponse(updated, { requestId: request.id }));
  });
};
