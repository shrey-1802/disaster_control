import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fastifyJwt from '@fastify/jwt';
import { env } from '../config/env.js';
import { ForbiddenError, InvalidCredentialsError } from '../shared/errors/AppError.js';
import type { JwtPayload } from '../shared/types/index.js';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    authorize: (allowedRoles: string[]) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JwtPayload;
    user: JwtPayload;
  }
}

export async function registerAuthPlugin(app: FastifyInstance): Promise<void> {
  await app.register(fastifyJwt, {
    secret: env.JWT_ACCESS_SECRET,
    sign: {
      expiresIn: `${env.JWT_ACCESS_EXPIRY}s`
    }
  });

  // Authentication Decorator
  app.decorate('authenticate', async (request: FastifyRequest, _reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch {
      throw new InvalidCredentialsError('Invalid, expired, or missing Bearer authorization token.');
    }
  });

  // RBAC Authorization Decorator
  app.decorate('authorize', (allowedRoles: string[]) => {
    return async (request: FastifyRequest, _reply: FastifyReply) => {
      const user = request.user;
      if (!user || !user.role) {
        throw new ForbiddenError('User session lacks role attribution.');
      }

      const normalizedUserRole = user.role.toUpperCase();
      const normalizedAllowed = allowedRoles.map(r => r.toUpperCase());

      if (!normalizedAllowed.includes(normalizedUserRole)) {
        throw new ForbiddenError(`Access denied. Role '${user.role}' is not authorized for this endpoint.`);
      }
    };
  });
}
