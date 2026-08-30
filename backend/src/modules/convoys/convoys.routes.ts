import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { convoysService } from './convoys.service.js';
import { successResponse } from '../../shared/utils/response.js';

const statusSchema = z.object({
  status: z.enum(['PLANNED', 'DISPATCHED', 'ACKNOWLEDGED', 'EN_ROUTE', 'DELAYED', 'REROUTING', 'STOPPED', 'ARRIVED', 'DELIVERED', 'CANCELLED']),
  notes: z.string().optional()
});

const locationSchema = z.object({
  latitude: z.number(),
  longitude: z.number()
});

export const convoyRoutes: FastifyPluginAsync = async (app) => {
  // GET /api/v1/convoys
  app.get('/', { preHandler: [app.authenticate] }, async (request, reply) => {
    const list = await convoysService.listConvoys();
    return reply.send(successResponse(list, { requestId: request.id }));
  });

  // GET /api/v1/convoys/:id
  app.get('/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const convoy = await convoysService.getConvoy(id);
    return reply.send(successResponse(convoy, { requestId: request.id }));
  });

  // POST /api/v1/convoys/:id/status
  app.post('/:id/status', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = statusSchema.parse(request.body);
    const updated = await convoysService.updateStatus(id, body.status, body.notes, request.user.operatorId);
    return reply.send(successResponse(updated, { requestId: request.id }));
  });

  // POST /api/v1/convoys/:id/location
  app.post('/:id/location', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = locationSchema.parse(request.body);
    const updated = await convoysService.updateLocation(id, body.latitude, body.longitude);
    return reply.send(successResponse(updated, { requestId: request.id }));
  });

  // POST /api/v1/convoys/:id/deliver
  app.post('/:id/deliver', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const delivered = await convoysService.confirmDelivery(id, request.user.operatorId);
    return reply.send(successResponse(delivered, { requestId: request.id }));
  });
};

export const driverRoutes: FastifyPluginAsync = async (app) => {
  // GET /api/v1/drivers/me/mission
  app.get('/me/mission', { preHandler: [app.authenticate] }, async (request, reply) => {
    const mission = await convoysService.getDriverMission(request.user.userId);
    return reply.send(successResponse(mission, { requestId: request.id }));
  });
};
