import { prisma } from '../../config/database.js';
import { InsufficientInventoryError, NotFoundError, InvalidStateTransitionError } from '../../shared/errors/AppError.js';
import { wsManager } from '../../plugins/websocket.js';

export interface CreateSupplySwapParams {
  fromWarehouseId: string;
  toWarehouseId: string;
  supplyId: string;
  quantity: number;
  reason: string;
  requestedBy: string;
}

export class SupplySwapService {
  public async listSwaps() {
    const swaps = await prisma.supplySwapRequest.findMany({
      include: {
        fromWarehouse: { select: { name: true, code: true } },
        toWarehouse: { select: { name: true, code: true } },
        items: { include: { supply: true } },
        convoys: { select: { code: true, status: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return swaps.map(sw => ({
      id: sw.id,
      code: sw.code,
      fromWarehouseName: sw.fromWarehouse.name,
      toWarehouseName: sw.toWarehouse.name,
      fromWarehouseId: sw.fromWarehouseId,
      toWarehouseId: sw.toWarehouseId,
      status: sw.status,
      reason: sw.reason,
      progressPct: sw.progressPct,
      item: sw.items[0]?.supply.name || 'Emergency Relief Supplies',
      quantity: sw.items[0]?.quantity || 0,
      unit: sw.items[0]?.unit || 'Units',
      convoyId: sw.convoys[0]?.code || null,
      createdAt: sw.createdAt
    }));
  }

  public async createSwap(params: CreateSupplySwapParams) {
    const { fromWarehouseId, toWarehouseId, supplyId, quantity, reason } = params;

    const sourceItem = await prisma.inventoryItem.findUnique({
      where: { warehouseId_supplyId: { warehouseId: fromWarehouseId, supplyId } },
      include: { supply: true }
    });

    if (!sourceItem) {
      throw new NotFoundError('InventoryItem', `${fromWarehouseId}/${supplyId}`);
    }

    if (sourceItem.quantityAvailable < quantity) {
      throw new InsufficientInventoryError(sourceItem.quantityAvailable, quantity);
    }

    const count = await prisma.supplySwapRequest.count();
    const code = `SWAP-${800 + count + 1}`;

    const swap = await prisma.supplySwapRequest.create({
      data: {
        code,
        fromWarehouseId,
        toWarehouseId,
        reason,
        status: 'PENDING_APPROVAL',
        items: {
          create: {
            supplyId,
            quantity,
            unit: sourceItem.supply.unit
          }
        }
      },
      include: { items: true }
    });

    wsManager.broadcast('supply_swap.created', swap);
    return swap;
  }

  public async approveSwap(swapId: string, approvedBy: string) {
    return await prisma.$transaction(async (tx) => {
      const swap = await tx.supplySwapRequest.findUnique({
        where: { id: swapId },
        include: { items: true }
      });

      if (!swap) {
        throw new NotFoundError('SupplySwapRequest', swapId);
      }

      if (swap.status !== 'PENDING_APPROVAL' && swap.status !== 'OFFERED') {
        throw new InvalidStateTransitionError('SupplySwapRequest', swap.status, 'APPROVED');
      }

      // Reserve stock in source warehouse
      for (const item of swap.items) {
        const inv = await tx.inventoryItem.findUnique({
          where: { warehouseId_supplyId: { warehouseId: swap.fromWarehouseId, supplyId: item.supplyId } }
        });

        if (!inv || inv.quantityAvailable < item.quantity) {
          throw new InsufficientInventoryError(inv?.quantityAvailable || 0, item.quantity);
        }

        const newReserved = inv.quantityReserved + item.quantity;
        const newAvailable = inv.quantityOnHand - newReserved;

        await tx.inventoryItem.update({
          where: { id: inv.id },
          data: {
            quantityReserved: newReserved,
            quantityAvailable: newAvailable
          }
        });

        await tx.inventoryTransaction.create({
          data: {
            warehouseId: swap.fromWarehouseId,
            inventoryItemId: inv.id,
            type: 'RESERVE',
            quantityDelta: item.quantity,
            quantityOnHandAfter: inv.quantityOnHand,
            quantityReservedAfter: newReserved,
            quantityAvailableAfter: newAvailable,
            reason: `Reserved for Supply Swap ${swap.code}`,
            performedBy: approvedBy
          }
        });
      }

      const approved = await tx.supplySwapRequest.update({
        where: { id: swapId },
        data: {
          status: 'APPROVED',
          approvedBy,
          approvedAt: new Date()
        }
      });

      wsManager.broadcast('supply_swap.approved', { swapId, approvedBy });
      return approved;
    });
  }

  public async receiveSwap(swapId: string, receivedBy: string) {
    return await prisma.$transaction(async (tx) => {
      const swap = await tx.supplySwapRequest.findUnique({
        where: { id: swapId },
        include: { items: true }
      });

      if (!swap) {
        throw new NotFoundError('SupplySwapRequest', swapId);
      }

      if (swap.status === 'DELIVERED') {
        return swap; // Idempotent delivery
      }

      for (const item of swap.items) {
        // 1. Deduct from Source Warehouse (Release reservation & decrease on-hand)
        const sourceInv = await tx.inventoryItem.findUnique({
          where: { warehouseId_supplyId: { warehouseId: swap.fromWarehouseId, supplyId: item.supplyId } }
        });

        if (sourceInv) {
          const newOnHand = Math.max(0, sourceInv.quantityOnHand - item.quantity);
          const newReserved = Math.max(0, sourceInv.quantityReserved - item.quantity);
          const newAvailable = newOnHand - newReserved;

          await tx.inventoryItem.update({
            where: { id: sourceInv.id },
            data: {
              quantityOnHand: newOnHand,
              quantityReserved: newReserved,
              quantityAvailable: newAvailable
            }
          });
        }

        // 2. Add to Destination Warehouse
        const destInv = await tx.inventoryItem.findUnique({
          where: { warehouseId_supplyId: { warehouseId: swap.toWarehouseId, supplyId: item.supplyId } }
        });

        if (destInv) {
          const newOnHand = destInv.quantityOnHand + item.quantity;
          const newAvailable = newOnHand - destInv.quantityReserved;

          await tx.inventoryItem.update({
            where: { id: destInv.id },
            data: {
              quantityOnHand: newOnHand,
              quantityAvailable: newAvailable,
              healthStatus: newAvailable <= destInv.criticalThreshold ? 'CRITICAL' : 'SAFE'
            }
          });

          await tx.inventoryTransaction.create({
            data: {
              warehouseId: swap.toWarehouseId,
              inventoryItemId: destInv.id,
              type: 'TRANSFER_IN',
              quantityDelta: item.quantity,
              quantityOnHandAfter: newOnHand,
              quantityReservedAfter: destInv.quantityReserved,
              quantityAvailableAfter: newAvailable,
              reason: `Transferred via Supply Swap ${swap.code}`,
              performedBy: receivedBy
            }
          });
        }
      }

      const delivered = await tx.supplySwapRequest.update({
        where: { id: swapId },
        data: {
          status: 'DELIVERED',
          deliveredAt: new Date(),
          progressPct: 100
        }
      });

      wsManager.broadcast('supply_swap.delivered', { swapId });
      return delivered;
    });
  }
}

export const supplySwapService = new SupplySwapService();
