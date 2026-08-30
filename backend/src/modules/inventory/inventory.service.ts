import { prisma } from '../../config/database.js';
import { InsufficientInventoryError, NotFoundError } from '../../shared/errors/AppError.js';
import { wsManager } from '../../plugins/websocket.js';

export interface StockAdjustmentParams {
  warehouseId: string;
  supplyId: string;
  quantityDelta: number;
  reason: string;
  performedBy: string;
}

export interface StockReceiveParams {
  warehouseId: string;
  supplyId: string;
  quantity: number;
  batchNumber?: string;
  performedBy: string;
}

export class InventoryService {
  public async getWarehouseInventory(warehouseId: string) {
    const warehouse = await prisma.warehouse.findUnique({
      where: { id: warehouseId },
      include: {
        inventory: {
          include: { supply: true }
        }
      }
    });

    if (!warehouse) {
      throw new NotFoundError('Warehouse', warehouseId);
    }

    return warehouse.inventory.map(item => ({
      id: item.id,
      supplyId: item.supply.id,
      code: item.supply.code,
      name: item.supply.name,
      category: item.supply.category,
      unit: item.supply.unit,
      isColdChain: item.supply.isColdChain,
      currentTemp: item.currentTemp,
      totalStock: item.quantityOnHand,
      reservedStock: item.quantityReserved,
      availableStock: item.quantityAvailable,
      criticalThreshold: item.criticalThreshold,
      minThreshold: item.minThreshold,
      healthStatus: item.healthStatus
    }));
  }

  public async adjustStock(params: StockAdjustmentParams) {
    const { warehouseId, supplyId, quantityDelta, reason, performedBy } = params;

    return await prisma.$transaction(async (tx) => {
      const item = await tx.inventoryItem.findUnique({
        where: { warehouseId_supplyId: { warehouseId, supplyId } }
      });

      if (!item) {
        throw new NotFoundError('InventoryItem', `${warehouseId}/${supplyId}`);
      }

      const newOnHand = item.quantityOnHand + quantityDelta;
      const newAvailable = newOnHand - item.quantityReserved;

      if (newOnHand < 0 || newAvailable < 0) {
        throw new InsufficientInventoryError(item.quantityAvailable, Math.abs(quantityDelta));
      }

      const healthStatus = newAvailable <= item.criticalThreshold
        ? 'CRITICAL'
        : newAvailable <= item.minThreshold
        ? 'LOW'
        : 'SAFE';

      const updated = await tx.inventoryItem.update({
        where: { id: item.id },
        data: {
          quantityOnHand: newOnHand,
          quantityAvailable: newAvailable,
          healthStatus: healthStatus as any
        }
      });

      await tx.inventoryTransaction.create({
        data: {
          warehouseId,
          inventoryItemId: item.id,
          type: quantityDelta >= 0 ? 'ADJUST_UP' : 'ADJUST_DOWN',
          quantityDelta,
          quantityOnHandAfter: newOnHand,
          quantityReservedAfter: item.quantityReserved,
          quantityAvailableAfter: newAvailable,
          reason,
          performedBy
        }
      });

      wsManager.broadcast('inventory.updated', {
        warehouseId,
        supplyId,
        available: newAvailable,
        total: newOnHand
      });

      return updated;
    });
  }

  public async receiveStock(params: StockReceiveParams) {
    const { warehouseId, supplyId, quantity, batchNumber, performedBy } = params;

    return await prisma.$transaction(async (tx) => {
      const item = await tx.inventoryItem.findUnique({
        where: { warehouseId_supplyId: { warehouseId, supplyId } }
      });

      if (!item) {
        throw new NotFoundError('InventoryItem', `${warehouseId}/${supplyId}`);
      }

      const newOnHand = item.quantityOnHand + quantity;
      const newAvailable = newOnHand - item.quantityReserved;
      const healthStatus = newAvailable <= item.criticalThreshold ? 'CRITICAL' : 'SAFE';

      const updated = await tx.inventoryItem.update({
        where: { id: item.id },
        data: {
          quantityOnHand: newOnHand,
          quantityAvailable: newAvailable,
          batchNumber: batchNumber || item.batchNumber,
          healthStatus: healthStatus as any
        }
      });

      await tx.inventoryTransaction.create({
        data: {
          warehouseId,
          inventoryItemId: item.id,
          type: 'RECEIVE',
          quantityDelta: quantity,
          quantityOnHandAfter: newOnHand,
          quantityReservedAfter: item.quantityReserved,
          quantityAvailableAfter: newAvailable,
          reason: `Incoming shipment receipt (Batch: ${batchNumber || 'N/A'})`,
          performedBy
        }
      });

      wsManager.broadcast('inventory.received', {
        warehouseId,
        supplyId,
        receivedQuantity: quantity,
        totalAvailable: newAvailable
      });

      return updated;
    });
  }

  public async getTransactions(warehouseId?: string, limit = 20) {
    return await prisma.inventoryTransaction.findMany({
      where: warehouseId ? { warehouseId } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        warehouse: { select: { name: true, code: true } },
        inventoryItem: { include: { supply: { select: { name: true, unit: true } } } }
      }
    });
  }
}

export const inventoryService = new InventoryService();
