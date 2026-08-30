import { prisma } from '../../config/database.js';
import { NotFoundError } from '../../shared/errors/AppError.js';
import { wsManager } from '../../plugins/websocket.js';

export interface CreateHazardParams {
  type: string;
  typeName: string;
  severity: string;
  locationName: string;
  latitude: number;
  longitude: number;
  description: string;
  roadClosure?: boolean;
  reportedBy: string;
  userId: string;
}

export class HazardsService {
  public async listHazards(onlyActive = false) {
    return await prisma.hazard.findMany({
      where: onlyActive ? { status: { in: ['ACTIVE', 'VERIFIED'] } } : undefined,
      orderBy: { createdAt: 'desc' }
    });
  }

  public async getHazard(id: string) {
    const hazard = await prisma.hazard.findUnique({
      where: { id },
      include: { reports: true, alerts: true }
    });

    if (!hazard) {
      throw new NotFoundError('Hazard', id);
    }

    return hazard;
  }

  public async createHazard(params: CreateHazardParams) {
    const count = await prisma.hazard.count();
    const code = `HAZ-00${count + 1}`;

    const hazard = await prisma.$transaction(async (tx) => {
      const created = await tx.hazard.create({
        data: {
          code,
          type: params.type as any,
          typeName: params.typeName,
          severity: (params.severity || 'HIGH') as any,
          status: 'ACTIVE',
          locationName: params.locationName,
          latitude: params.latitude,
          longitude: params.longitude,
          description: params.description,
          roadClosure: params.roadClosure ?? true,
          reportedBy: params.reportedBy,
          reports: {
            create: {
              userId: params.userId,
              type: params.type as any,
              latitude: params.latitude,
              longitude: params.longitude,
              locationName: params.locationName,
              description: params.description
            }
          }
        }
      });

      // Auto-generate Alert
      await tx.alert.create({
        data: {
          code: `ALT-${Math.floor(100 + Math.random() * 900)}`,
          severity: params.severity === 'CRITICAL' ? 'CRITICAL' : 'CAUTION',
          status: 'NEW',
          title: `${params.typeName}: ${params.locationName}`,
          details: params.description,
          source: `Field Unit (${params.reportedBy})`,
          sourceType: 'hazard',
          hazardId: created.id
        }
      });

      // Mark affected convoy routes as STALE
      await tx.route.updateMany({
        where: { routeStatus: 'VALID' },
        data: { routeStatus: 'STALE' }
      });

      return created;
    });

    wsManager.broadcast('hazard.created', hazard);
    return hazard;
  }

  public async verifyHazard(id: string, verifiedBy: string) {
    const hazard = await prisma.hazard.update({
      where: { id },
      data: {
        status: 'VERIFIED',
        verifiedAt: new Date()
      }
    });

    wsManager.broadcast('hazard.verified', { id, verifiedBy });
    return hazard;
  }

  public async resolveHazard(id: string) {
    const hazard = await prisma.hazard.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        roadClosure: false,
        resolvedAt: new Date()
      }
    });

    wsManager.broadcast('hazard.resolved', { id });
    return hazard;
  }
}

export const hazardsService = new HazardsService();
