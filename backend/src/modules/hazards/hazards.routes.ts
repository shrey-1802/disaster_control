import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { hazardsService } from './hazards.service.js';
import { successResponse } from '../../shared/utils/response.js';

const createHazardSchema = z.object({
  type: z.string().default('FLASH_FLOOD'),
  typeName: z.string().min(1),
  severity: z.string().default('HIGH'),
  locationName: z.string().min(1),
  latitude: z.number(),
  longitude: z.number(),
  description: z.string().min(1),
  roadClosure: z.boolean().optional()
});

export const hazardRoutes: FastifyPluginAsync = async (app) => {
  // GET /api/v1/hazards
  app.get('/', { preHandler: [app.authenticate] }, async (request, reply) => {
    const query = request.query as { activeOnly?: string };
    const list = await hazardsService.listHazards(query.activeOnly === 'true');
    return reply.send(successResponse(list, { requestId: request.id }));
  });

  // GET /api/v1/hazards/:id
  app.get('/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const hazard = await hazardsService.getHazard(id);
    return reply.send(successResponse(hazard, { requestId: request.id }));
  });

  // POST /api/v1/hazards
  app.post('/', { preHandler: [app.authenticate] }, async (request, reply) => {
    const body = createHazardSchema.parse(request.body);
    const created = await hazardsService.createHazard({
      ...body,
      reportedBy: request.user.operatorId,
      userId: request.user.userId
    });
    return reply.status(201).send(successResponse(created, { requestId: request.id }));
  });

  // POST /api/v1/hazards/:id/verify
  app.post('/:id/verify', { preHandler: [app.authenticate, app.authorize(['CONTROL_ROOM'])] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const verified = await hazardsService.verifyHazard(id, request.user.operatorId);
    return reply.send(successResponse(verified, { requestId: request.id }));
  });

  // POST /api/v1/hazards/:id/resolve
  app.post('/:id/resolve', { preHandler: [app.authenticate, app.authorize(['CONTROL_ROOM'])] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const resolved = await hazardsService.resolveHazard(id);
    return reply.send(successResponse(resolved, { requestId: request.id }));
  });
};
