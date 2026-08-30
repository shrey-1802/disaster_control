import type { FastifyInstance } from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import sensible from '@fastify/sensible';
import { env } from '../config/env.js';

export async function registerSecurityPlugins(app: FastifyInstance): Promise<void> {
  // 1. Fastify Sensible (HTTP helpers)
  await app.register(sensible);

  // 2. Helmet Security Headers
  await app.register(helmet, {
    contentSecurityPolicy: env.NODE_ENV === 'production'
  });

  // 3. CORS
  const origins = env.CORS_ORIGINS === '*' ? true : env.CORS_ORIGINS.split(',').map(s => s.trim());
  await app.register(cors, {
    origin: origins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true
  });

  // 4. Rate Limiting
  await app.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_TIME_WINDOW,
    errorResponseBuilder: (req, context) => ({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Rate limit exceeded. Try again in ${Math.ceil(context.ttl / 1000)} seconds.`
      },
      meta: {
        requestId: req.id,
        timestamp: new Date().toISOString()
      }
    })
  });
}
