import type { FastifyInstance } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

export async function registerSwagger(app: FastifyInstance): Promise<void> {
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'DISISTA CONTROL — Relief Supply Chain Intelligence API',
        description: 'High-throughput authoritative operational state platform for disaster relief, convoy routing, atomic inventory rebalancing, and hazard intelligence.',
        version: '1.0.0'
      },
      servers: [
        { url: 'http://localhost:3000', description: 'Local Development Server' },
        { url: 'https://api.disistacontrol.org', description: 'Production National HQ API' }
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      }
    }
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true
    },
    staticCSP: true
  });
}
