import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../config/database.js';
import { successResponse } from '../../shared/utils/response.js';

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  pincode: z.string().length(6).optional(),
  district: z.string().optional(),
  state: z.string().optional()
});

export const settingRoutes: FastifyPluginAsync = async (app) => {
  // GET /api/v1/settings
  app.get('/', { preHandler: [app.authenticate] }, async (request, reply) => {
    const user = await prisma.user.findUnique({
      where: { id: request.user.userId },
      include: { role: true }
    });

    return reply.send(
      successResponse({
        user: {
          name: user?.name,
          operatorId: user?.operatorId,
          role: user?.role.name,
          pincode: user?.pincode,
          district: user?.district,
          state: user?.state
        },
        gridConnection: {
          status: 'ONLINE',
          pingMs: 18,
          sector: 'Sector 7 (Himalayan Relief Grid)'
        }
      }, { requestId: request.id })
    );
  });

  // PATCH /api/v1/settings/profile
  app.patch('/profile', { preHandler: [app.authenticate] }, async (request, reply) => {
    const body = updateProfileSchema.parse(request.body);
    const updated = await prisma.user.update({
      where: { id: request.user.userId },
      data: body
    });

    return reply.send(successResponse(updated, { requestId: request.id }));
  });
};
