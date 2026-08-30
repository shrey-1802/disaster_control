import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { routesService } from './routes.service.js';
import { prisma } from '../../config/database.js';
import { successResponse } from '../../shared/utils/response.js';

const calculateRouteSchema = z.object({
  convoyId: z.string().optional(),
  originLat: z.number(),
  originLng: z.number(),
  destLat: z.number(),
  destLng: z.number()
});

export const routeRoutes: FastifyPluginAsync = async (app) => {
  // POST /api/v1/routes/calculate
  app.post('/calculate', { preHandler: [app.authenticate] }, async (request, reply) => {
    const body = calculateRouteSchema.parse(request.body);
    const result = await routesService.calculateOperationalRoute(body);
    return reply.send(successResponse(result, { requestId: request.id }));
  });

  // GET /api/v1/routes/:id
  app.get('/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const route = await routesService.getRoute(id);
    return reply.send(successResponse(route, { requestId: request.id }));
  });
};

export const mapRoutes: FastifyPluginAsync = async (app) => {
  // GET /api/v1/map/overview
  app.get('/overview', { preHandler: [app.authenticate] }, async (request, reply) => {
    const [warehouses, shelters, hazards, convoys, routes] = await Promise.all([
      prisma.warehouse.findMany({ select: { id: true, name: true, code: true, latitude: true, longitude: true, status: true } }),
      prisma.shelter.findMany({ select: { id: true, name: true, code: true, latitude: true, longitude: true, population: true, daysOfCover: true, urgency: true } }),
      prisma.hazard.findMany({ where: { status: { in: ['ACTIVE', 'VERIFIED'] } }, select: { id: true, code: true, typeName: true, severity: true, latitude: true, longitude: true, roadClosure: true, locationName: true } }),
      prisma.convoy.findMany({ where: { status: { notIn: ['DELIVERED', 'CANCELLED'] } }, select: { id: true, code: true, currentLat: true, currentLng: true, status: true, priority: true, destName: true, etaMinutes: true } }),
      prisma.route.findMany({ take: 5, orderBy: { createdAt: 'desc' } })
    ]);

    return reply.send(
      successResponse({
        sector: 'Sector 7 (Himalayan Corridor - Dehradun/Rishikesh)',
        warehouses,
        shelters,
        hazards,
        convoys,
        routes: routes.map(r => ({ ...r, polylineGeoJson: JSON.parse(r.polylineGeoJson) }))
      }, { requestId: request.id })
    );
  });
};
