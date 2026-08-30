import { prisma } from '../../config/database.js';
import { tomtomClient } from '../../integrations/tomtom/tomtom.client.js';

export interface CalculateRouteParams {
  convoyId?: string;
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
}

export class RoutesService {
  public async calculateOperationalRoute(params: CalculateRouteParams) {
    const { convoyId, originLat, originLng, destLat, destLng } = params;

    // 1. Call TomTom Routing Adapter
    const routeResult = await tomtomClient.calculateRoute({
      origin: { latitude: originLat, longitude: originLng },
      destination: { latitude: destLat, longitude: destLng }
    });

    // 2. Fetch Active Hazards to calculate dynamic risk
    const activeHazards = await prisma.hazard.findMany({
      where: { status: { in: ['ACTIVE', 'VERIFIED'] } }
    });

    let riskScore = 12; // Base risk in mountainous terrain
    let hasCriticalBlock = false;

    // Proximity risk calculation
    for (const h of activeHazards) {
      const distToOrigin = Math.hypot(h.latitude - originLat, h.longitude - originLng);
      const distToDest = Math.hypot(h.latitude - destLat, h.longitude - destLng);

      if (distToOrigin < 0.08 || distToDest < 0.08) {
        if (h.severity === 'CRITICAL' || h.roadClosure) {
          riskScore += 45;
          hasCriticalBlock = true;
        } else {
          riskScore += 20;
        }
      }
    }

    riskScore = Math.min(100, Math.max(0, riskScore));
    const routeStatus = hasCriticalBlock ? 'BLOCKED' : riskScore > 40 ? 'CAUTION' : 'VALID';

    // 3. Store Route in Database
    const savedRoute = await prisma.route.create({
      data: {
        convoyId,
        provider: routeResult.provider,
        originLat,
        originLng,
        destLat,
        destLng,
        distanceKm: routeResult.distanceKm,
        durationMinutes: routeResult.durationMinutes,
        riskScore,
        routeStatus: routeStatus as any,
        polylineGeoJson: JSON.stringify(routeResult.geometryGeoJson)
      }
    });

    return {
      ...savedRoute,
      polylineGeoJson: routeResult.geometryGeoJson,
      summary: routeResult.summary
    };
  }

  public async getRoute(id: string) {
    const route = await prisma.route.findUnique({ where: { id } });
    if (!route) return null;

    return {
      ...route,
      polylineGeoJson: JSON.parse(route.polylineGeoJson)
    };
  }
}

export const routesService = new RoutesService();
