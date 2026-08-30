import { prisma } from '../../config/database.js';
import { NotFoundError } from '../../shared/errors/AppError.js';

export class SheltersService {
  public async listShelters() {
    const shelters = await prisma.shelter.findMany({
      include: {
        demands: {
          include: { supply: true }
        }
      }
    });

    return shelters.map(s => {
      const criticalShortages = s.demands.filter(d => d.urgency === 'CRITICAL');
      const minDaysCover = s.demands.length > 0
        ? Math.min(...s.demands.map(d => d.daysRemaining))
        : s.daysOfCover;

      return {
        id: s.id,
        code: s.code,
        name: s.name,
        locationName: s.locationName,
        latitude: s.latitude,
        longitude: s.longitude,
        population: s.population,
        maxCapacity: s.maxCapacity,
        isIsolated: s.isIsolated,
        isolationReason: s.isolationReason,
        daysOfCover: Math.round(minDaysCover * 10) / 10,
        urgency: s.urgency,
        criticalDemandsCount: criticalShortages.length,
        demands: s.demands.map(d => ({
          id: d.id,
          supplyCode: d.supply.code,
          supplyName: d.supply.name,
          unit: d.supply.unit,
          requiredDaily: d.requiredDaily,
          availableUnits: d.availableUnits,
          deficitUnits: d.deficitUnits,
          daysRemaining: d.daysRemaining,
          urgency: d.urgency
        }))
      };
    });
  }

  public async getShelter(shelterId: string) {
    const shelter = await prisma.shelter.findUnique({
      where: { id: shelterId },
      include: {
        demands: {
          include: { supply: true }
        }
      }
    });

    if (!shelter) {
      throw new NotFoundError('Shelter', shelterId);
    }

    return shelter;
  }

  public async updateDemand(shelterId: string, supplyId: string, availableUnits: number, requiredDaily: number) {
    const deficit = Math.max(0, requiredDaily * 3 - availableUnits);
    const daysRemaining = requiredDaily > 0 ? Math.round((availableUnits / requiredDaily) * 10) / 10 : 99;
    const urgency = daysRemaining < 1.0 ? 'CRITICAL' : daysRemaining < 2.5 ? 'HIGH' : 'NORMAL';

    const demand = await prisma.shelterDemand.upsert({
      where: { shelterId_supplyId: { shelterId, supplyId } },
      create: {
        shelterId,
        supplyId,
        requiredDaily,
        availableUnits,
        deficitUnits: deficit,
        daysRemaining,
        urgency: urgency as any
      },
      update: {
        requiredDaily,
        availableUnits,
        deficitUnits: deficit,
        daysRemaining,
        urgency: urgency as any
      }
    });

    // Update parent shelter overall urgency
    if (urgency === 'CRITICAL') {
      await prisma.shelter.update({
        where: { id: shelterId },
        data: { urgency: 'CRITICAL', daysOfCover: daysRemaining }
      });
    }

    return demand;
  }
}

export const sheltersService = new SheltersService();
