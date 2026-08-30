import type { FastifyPluginAsync } from 'fastify';
import { dashboardService } from './dashboard.service.js';
import { successResponse } from '../../shared/utils/response.js';

export const dashboardRoutes: FastifyPluginAsync = async (app) => {
  // GET /api/v1/dashboard
  app.get('/', { preHandler: [app.authenticate] }, async (request, reply) => {
    const data = await dashboardService.getDashboardData(request.user);
    return reply.send(successResponse(data, { requestId: request.id }));
  });
};
