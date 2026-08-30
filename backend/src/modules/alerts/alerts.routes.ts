import type { FastifyPluginAsync } from 'fastify';
import { alertsService } from './alerts.service.js';
import { successResponse } from '../../shared/utils/response.js';

export const alertRoutes: FastifyPluginAsync = async (app) => {
  // GET /api/v1/alerts
  app.get('/', { preHandler: [app.authenticate] }, async (request, reply) => {
    const query = request.query as { criticalOnly?: string };
    const list = await alertsService.listAlerts(query.criticalOnly === 'true');
    return reply.send(successResponse(list, { requestId: request.id }));
  });

  // POST /api/v1/alerts/:id/acknowledge
  app.post('/:id/acknowledge', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = (request.body || {}) as { comment?: string };
    const updated = await alertsService.acknowledgeAlert(id, request.user.userId, body.comment);
    return reply.send(successResponse(updated, { requestId: request.id }));
  });

  // POST /api/v1/alerts/:id/escalate
  app.post('/:id/escalate', { preHandler: [app.authenticate, app.authorize(['CONTROL_ROOM'])] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = (request.body || {}) as { comment?: string };
    const escalated = await alertsService.escalateAlert(id, request.user.userId, body.comment);
    return reply.send(successResponse(escalated, { requestId: request.id }));
  });
};
