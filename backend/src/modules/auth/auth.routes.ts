import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { authService } from './auth.service.js';
import { successResponse } from '../../shared/utils/response.js';

const loginSchema = z.object({
  operatorId: z.string().min(1, 'Operator ID is required'),
  password: z.string().min(1, 'Passcode is required'),
  role: z.string().optional(),
  pincode: z.string().optional()
});

export const authRoutes: FastifyPluginAsync = async (app) => {
  // POST /api/v1/auth/login
  app.post('/login', async (request, reply) => {
    const body = loginSchema.parse(request.body);
    const { user, roleCode } = await authService.login({
      operatorId: body.operatorId,
      passcode: body.password,
      role: body.role,
      pincode: body.pincode
    });

    const accessToken = app.jwt.sign({
      userId: user.id,
      operatorId: user.operatorId,
      role: roleCode,
      assignedWarehouseId: user.assignedWarehouseId,
      pincode: user.pincode
    });

    return reply.send(
      successResponse({
        user,
        accessToken,
        expiresIn: 900
      }, { requestId: request.id })
    );
  });

  // GET /api/v1/auth/me
  app.get('/me', { preHandler: [app.authenticate] }, async (request, reply) => {
    const user = await authService.getProfile(request.user.userId);
    return reply.send(successResponse(user, { requestId: request.id }));
  });

  // POST /api/v1/auth/logout
  app.post('/logout', { preHandler: [app.authenticate] }, async (request, reply) => {
    return reply.send(
      successResponse({ message: 'Session terminated successfully.' }, { requestId: request.id })
    );
  });
};
