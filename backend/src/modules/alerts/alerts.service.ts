import { prisma } from '../../config/database.js';
import { NotFoundError } from '../../shared/errors/AppError.js';
import { wsManager } from '../../plugins/websocket.js';

export class AlertsService {
  public async listAlerts(criticalOnly = false) {
    return await prisma.alert.findMany({
      where: criticalOnly ? { severity: 'CRITICAL' } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        acknowledgements: {
          include: { user: { select: { name: true, operatorId: true } } }
        }
      }
    });
  }

  public async acknowledgeAlert(alertId: string, userId: string, comment?: string) {
    const alert = await prisma.alert.findUnique({ where: { id: alertId } });
    if (!alert) {
      throw new NotFoundError('Alert', alertId);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const a = await tx.alert.update({
        where: { id: alertId },
        data: {
          acknowledged: true,
          status: alert.status === 'NEW' ? 'ACKNOWLEDGED' : alert.status
        }
      });

      await tx.alertAcknowledgement.create({
        data: {
          alertId,
          userId,
          action: 'ACKNOWLEDGE',
          comment: comment || 'Acknowledged by operational personnel.'
        }
      });

      return a;
    });

    wsManager.broadcast('alert.acknowledged', { alertId, userId });
    return updated;
  }

  public async escalateAlert(alertId: string, userId: string, comment?: string) {
    const alert = await prisma.alert.findUnique({ where: { id: alertId } });
    if (!alert) {
      throw new NotFoundError('Alert', alertId);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const a = await tx.alert.update({
        where: { id: alertId },
        data: {
          escalated: true,
          status: 'ESCALATED',
          escalatedToHqAt: new Date()
        }
      });

      await tx.alertAcknowledgement.create({
        data: {
          alertId,
          userId,
          action: 'ESCALATE',
          comment: comment || 'Incident ESCALATED to National Disaster Headquarters.'
        }
      });

      return a;
    });

    wsManager.broadcast('alert.escalated', { alertId, userId });
    return updated;
  }
}

export const alertsService = new AlertsService();
