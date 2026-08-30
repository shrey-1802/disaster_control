import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { syncService } from './sync.service.js';
import { successResponse } from '../../shared/utils/response.js';

const syncBatchSchema = z.object({
  events: z.array(
    z.object({
      clientEventId: z.string().min(1),
      deviceId: z.string().min(1),
      operationType: z.string().min(1),
      clientTimestamp: z.string(),
      payload: z.record(z.any())
    })
  )
});

export const syncRoutes: FastifyPluginAsync = async (app) => {
  // POST /api/v1/sync/push
  app.post('/push', { preHandler: [app.authenticate] }, async (request, reply) => {
    const body = syncBatchSchema.parse(request.body);
    const summary = await syncService.processSyncBatch(body.events, request.user.userId);
    return reply.send(successResponse(summary, { requestId: request.id }));
  });

  // GET /api/v1/sync/status
  app.get('/status', { preHandler: [app.authenticate] }, async (request, reply) => {
    const status = await syncService.getQueueStatus();
    return reply.send(successResponse(status, { requestId: request.id }));
  });
};
