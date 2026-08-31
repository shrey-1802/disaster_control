import Fastify, { type FastifyInstance } from 'fastify';
import { env } from './config/env.js';
import { setupErrorHandler } from './plugins/errorHandler.js';
import { registerSecurityPlugins } from './plugins/security.js';
import { registerSwagger } from './plugins/swagger.js';
import { registerAuthPlugin } from './plugins/auth.js';
import { registerWebSocketPlugin } from './plugins/websocket.js';

// Domain Route Plugins
import { authRoutes } from './modules/auth/auth.routes.js';
import { dashboardRoutes } from './modules/dashboard/dashboard.routes.js';
import { warehouseRoutes } from './modules/warehouses/warehouses.routes.js';
import { inventoryRoutes } from './modules/inventory/inventory.routes.js';
import { shelterRoutes } from './modules/shelters/shelters.routes.js';
import { hazardRoutes } from './modules/hazards/hazards.routes.js';
import { convoyRoutes, driverRoutes } from './modules/convoys/convoys.routes.js';
import { routeRoutes, mapRoutes } from './modules/routes/routes.routes.js';
import { supplySwapRoutes } from './modules/supplySwap/supplySwap.routes.js';
import { alertRoutes } from './modules/alerts/alerts.routes.js';
import { syncRoutes } from './modules/sync/sync.routes.js';
import { reportRoutes } from './modules/reports/reports.routes.js';
import { settingRoutes } from './modules/settings/settings.routes.js';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
      transport: env.NODE_ENV === 'development' ? { target: 'pino-pretty' } : undefined
    }
  });

  // 1. Error Handling & Security Plugins
  setupErrorHandler(app);
  await registerSecurityPlugins(app);
  await registerSwagger(app);
  await registerAuthPlugin(app);
  await registerWebSocketPlugin(app);

  // 2. Health Check Probes
  app.get('/health', async (_req, reply) => {
    return reply.send({ status: 'OK', uptime: process.uptime() });
  });

  app.get('/health/live', async (_req, reply) => {
    return reply.send({ status: 'LIVE' });
  });

  app.get('/health/ready', async (_req, reply) => {
    return reply.send({ status: 'READY', service: 'DISISTA CONTROL API' });
  });

  // 3. API Version 1 Routes
  await app.register(authRoutes, { prefix: '/api/v1/auth' });
  await app.register(dashboardRoutes, { prefix: '/api/v1/dashboard' });
  await app.register(warehouseRoutes, { prefix: '/api/v1/warehouses' });
  await app.register(inventoryRoutes, { prefix: '/api/v1/inventory' });
  await app.register(shelterRoutes, { prefix: '/api/v1/shelters' });
  await app.register(hazardRoutes, { prefix: '/api/v1/hazards' });
  await app.register(convoyRoutes, { prefix: '/api/v1/convoys' });
  await app.register(driverRoutes, { prefix: '/api/v1/drivers' });
  await app.register(routeRoutes, { prefix: '/api/v1/routes' });
  await app.register(mapRoutes, { prefix: '/api/v1/map' });
  await app.register(supplySwapRoutes, { prefix: '/api/v1/supply-swaps' });
  await app.register(alertRoutes, { prefix: '/api/v1/alerts' });
  await app.register(syncRoutes, { prefix: '/api/v1/sync' });
  await app.register(reportRoutes, { prefix: '/api/v1/reports' });
  await app.register(settingRoutes, { prefix: '/api/v1/settings' });

  return app;
}

