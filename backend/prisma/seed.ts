import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Starting DISISTA CONTROL Production Database Seed...');

  // 1. Roles
  const roleControlRoom = await prisma.role.upsert({
    where: { code: 'CONTROL_ROOM' },
    create: { code: 'CONTROL_ROOM', name: 'Control Room Commander', description: 'Central operations, network routing, hazard verification' },
    update: {}
  });

  const roleWarehouseManager = await prisma.role.upsert({
    where: { code: 'WAREHOUSE_MANAGER' },
    create: { code: 'WAREHOUSE_MANAGER', name: 'Warehouse Manager', description: 'Inventory management, stock allocations, supply swap initiation' },
    update: {}
  });

  const roleFieldDriver = await prisma.role.upsert({
    where: { code: 'FIELD_DRIVER' },
    create: { code: 'FIELD_DRIVER', name: 'Relief Convoy Field Driver', description: 'Mission telemetry, field observations, delivery confirmation' },
    update: {}
  });

  console.log('✓ Roles seeded.');

  // 2. Warehouses
  const whAlpha = await prisma.warehouse.upsert({
    where: { code: 'WH-001' },
    create: {
      code: 'WH-001',
      name: 'Central Logistics Hub Alpha',
      locationName: 'Dehradun North Industrial Sector',
      latitude: 30.3450,
      longitude: 78.0550,
      pincode: '248001',
      capacityUnits: 50000,
      status: 'operational'
    },
    update: {}
  });

  const whBravo = await prisma.warehouse.upsert({
    where: { code: 'WH-002' },
    create: {
      code: 'WH-002',
      name: 'Regional Depot Bravo',
      locationName: 'Rishikesh East Bypass Corridor',
      latitude: 30.1120,
      longitude: 78.3050,
      pincode: '249201',
      capacityUnits: 25000,
      status: 'operational'
    },
    update: {}
  });

  const whCharlie = await prisma.warehouse.upsert({
    where: { code: 'WH-003' },
    create: {
      code: 'WH-003',
      name: 'Emergency Reserve Charlie',
      locationName: 'Haridwar South Strategic Depot',
      latitude: 29.9450,
      longitude: 78.1640,
      pincode: '249401',
      capacityUnits: 35000,
      status: 'operational'
    },
    update: {}
  });

  console.log('✓ Warehouses seeded.');

  // 3. Users with Argon2 Password Hashing
  const passwordHash = await argon2.hash('disaster2026');

  const userCmd = await prisma.user.upsert({
    where: { operatorId: 'HQ-CMD-001' },
    create: {
      operatorId: 'HQ-CMD-001',
      name: 'Commander A. Sharma',
      passwordHash,
      roleId: roleControlRoom.id,
      pincode: '248001',
      district: 'Dehradun - Rishikesh Disaster Division',
      state: 'Uttarakhand'
    },
    update: {}
  });

  const userWhMgr = await prisma.user.upsert({
    where: { operatorId: 'WH-MGR-02' },
    create: {
      operatorId: 'WH-MGR-02',
      name: 'Logistics Chief V. Patel',
      passwordHash,
      roleId: roleWarehouseManager.id,
      assignedWarehouseId: whAlpha.id,
      pincode: '248001',
      district: 'Dehradun Division',
      state: 'Uttarakhand'
    },
    update: {}
  });

  const userDriver = await prisma.user.upsert({
    where: { operatorId: 'DRV-401' },
    create: {
      operatorId: 'DRV-401',
      name: 'Lead Driver R. Singh',
      passwordHash,
      roleId: roleFieldDriver.id,
      pincode: '248001',
      district: 'Dehradun - Rishikesh Division',
      state: 'Uttarakhand'
    },
    update: {}
  });

  console.log('✓ Users seeded (Credentials: HQ-CMD-001, WH-MGR-02, DRV-401 / disaster2026).');

  // 4. Critical Supplies
  const supplyInsulin = await prisma.supply.upsert({
    where: { code: 'ITEM-INS' },
    create: { code: 'ITEM-INS', name: 'Insulin Vials (Cold Chain)', category: 'medical', unit: 'Vials', isColdChain: true, targetTempCelsius: 3.5 },
    update: {}
  });

  const supplyBlood = await prisma.supply.upsert({
    where: { code: 'ITEM-BLD' },
    create: { code: 'ITEM-BLD', name: 'O-Negative Blood Bags', category: 'medical', unit: 'Units', isColdChain: true, targetTempCelsius: 4.0 },
    update: {}
  });

  const supplyWater = await prisma.supply.upsert({
    where: { code: 'ITEM-WTR' },
    create: { code: 'ITEM-WTR', name: 'Potable Water Purifiers (10L)', category: 'water', unit: 'Packs', isColdChain: false },
    update: {}
  });

  const supplyNutrition = await prisma.supply.upsert({
    where: { code: 'ITEM-NUT' },
    create: { code: 'ITEM-NUT', name: 'Infant Nutrition Powder', category: 'nutrition', unit: 'Packs', isColdChain: false },
    update: {}
  });

  const supplyTrauma = await prisma.supply.upsert({
    where: { code: 'ITEM-TRM' },
    create: { code: 'ITEM-TRM', name: 'Trauma Surgical Kits', category: 'trauma', unit: 'Kits', isColdChain: false },
    update: {}
  });

  console.log('✓ Supplies seeded.');

  // 5. Warehouse Inventory Items (Available = Total - Reserved)
  await prisma.inventoryItem.upsert({
    where: { warehouseId_supplyId: { warehouseId: whAlpha.id, supplyId: supplyInsulin.id } },
    create: { warehouseId: whAlpha.id, supplyId: supplyInsulin.id, quantityOnHand: 2400, quantityReserved: 1800, quantityAvailable: 600, criticalThreshold: 300, minThreshold: 600, healthStatus: 'SAFE', currentTemp: 3.4 },
    update: {}
  });

  await prisma.inventoryItem.upsert({
    where: { warehouseId_supplyId: { warehouseId: whAlpha.id, supplyId: supplyWater.id } },
    create: { warehouseId: whAlpha.id, supplyId: supplyWater.id, quantityOnHand: 12500, quantityReserved: 3200, quantityAvailable: 9300, criticalThreshold: 2000, minThreshold: 4000, healthStatus: 'SAFE' },
    update: {}
  });

  await prisma.inventoryItem.upsert({
    where: { warehouseId_supplyId: { warehouseId: whAlpha.id, supplyId: supplyBlood.id } },
    create: { warehouseId: whAlpha.id, supplyId: supplyBlood.id, quantityOnHand: 600, quantityReserved: 450, quantityAvailable: 150, criticalThreshold: 100, minThreshold: 250, healthStatus: 'LOW', currentTemp: 3.8 },
    update: {}
  });

  await prisma.inventoryItem.upsert({
    where: { warehouseId_supplyId: { warehouseId: whBravo.id, supplyId: supplyInsulin.id } },
    create: { warehouseId: whBravo.id, supplyId: supplyInsulin.id, quantityOnHand: 350, quantityReserved: 300, quantityAvailable: 50, criticalThreshold: 100, minThreshold: 200, healthStatus: 'CRITICAL', currentTemp: 4.1 },
    update: {}
  });

  await prisma.inventoryItem.upsert({
    where: { warehouseId_supplyId: { warehouseId: whBravo.id, supplyId: supplyNutrition.id } },
    create: { warehouseId: whBravo.id, supplyId: supplyNutrition.id, quantityOnHand: 850, quantityReserved: 600, quantityAvailable: 250, criticalThreshold: 200, minThreshold: 400, healthStatus: 'LOW' },
    update: {}
  });

  console.log('✓ Inventory seeded.');

  // 6. Relief Shelters & Demands
  const shelterS12 = await prisma.shelter.upsert({
    where: { code: 'S-012' },
    create: {
      code: 'S-012',
      name: 'Govt Inter College Relief Shelter',
      locationName: 'Rishikesh Hill Sector Block 4',
      latitude: 30.1350,
      longitude: 78.3220,
      population: 1850,
      maxCapacity: 2200,
      isIsolated: true,
      isolationReason: 'NH-58 River Bridge 7 submerged by flash flood',
      daysOfCover: 0.8,
      urgency: 'CRITICAL'
    },
    update: {}
  });

  const shelterS04 = await prisma.shelter.upsert({
    where: { code: 'S-004' },
    create: {
      code: 'S-004',
      name: 'Community Hall & Stadium Camp',
      locationName: 'Chila Valley Gateway',
      latitude: 30.0820,
      longitude: 78.2710,
      population: 2600,
      maxCapacity: 3000,
      daysOfCover: 1.8,
      urgency: 'HIGH'
    },
    update: {}
  });

  await prisma.shelterDemand.upsert({
    where: { shelterId_supplyId: { shelterId: shelterS12.id, supplyId: supplyInsulin.id } },
    create: { shelterId: shelterS12.id, supplyId: supplyInsulin.id, requiredDaily: 120, availableUnits: 20, deficitUnits: 340, daysRemaining: 0.2, urgency: 'CRITICAL' },
    update: {}
  });

  await prisma.shelterDemand.upsert({
    where: { shelterId_supplyId: { shelterId: shelterS12.id, supplyId: supplyWater.id } },
    create: { shelterId: shelterS12.id, supplyId: supplyWater.id, requiredDaily: 1800, availableUnits: 1200, deficitUnits: 4200, daysRemaining: 0.7, urgency: 'CRITICAL' },
    update: {}
  });

  console.log('✓ Shelters & Demands seeded.');

  // 7. Dynamic Hazards
  await prisma.hazard.upsert({
    where: { code: 'HAZ-001' },
    create: {
      code: 'HAZ-001',
      type: 'FLASH_FLOOD',
      typeName: 'Flash Flood & River Inundation',
      severity: 'CRITICAL',
      status: 'ACTIVE',
      locationName: 'NH-58 River Crossing (Bridge 7)',
      latitude: 30.1800,
      longitude: 78.2300,
      description: 'Song River surge overtopped Bridge 7 piers by 1.8 meters. Bridge deck impassable for standard traffic.',
      roadClosure: true,
      bypassAvailable: true,
      bypassRouteName: 'High Mountain Ridge Pass (Alt Pass 2)',
      reportedBy: 'Field Recon Unit 4',
      verifiedAt: new Date()
    },
    update: {}
  });

  await prisma.hazard.upsert({
    where: { code: 'HAZ-002' },
    create: {
      code: 'HAZ-002',
      type: 'LANDSLIDE',
      typeName: 'Hillside Debris Flow',
      severity: 'HIGH',
      status: 'ACTIVE',
      locationName: 'Chila Hill Pass (Mile 14)',
      latitude: 30.1550,
      longitude: 78.2680,
      description: 'Heavy mudslide restricting road to single-lane convoy clearance under earthmover escort.',
      roadClosure: false,
      reportedBy: 'State Police Patrol'
    },
    update: {}
  });

  console.log('✓ Hazards seeded.');

  // 8. Relief Convoys
  const convoy14 = await prisma.convoy.upsert({
    where: { code: 'C-014' },
    create: {
      code: 'C-014',
      vehicleNo: 'UK-07-GA-4892',
      driverId: userDriver.id,
      driverPhone: '+91 98450 12345',
      sourceWarehouseId: whAlpha.id,
      destShelterId: shelterS12.id,
      destName: 'Govt Inter College Relief Shelter (S-012)',
      status: 'EN_ROUTE',
      priority: 'CRITICAL',
      currentLat: 30.2100,
      currentLng: 78.2900,
      coldChainTemp: 3.4,
      coldChainViable: true,
      etaMinutes: 35,
      actualDeparture: new Date(),
      items: {
        create: [
          { supplyId: supplyInsulin.id, quantity: 500, unit: 'Vials', tempMonitored: true },
          { supplyId: supplyWater.id, quantity: 1200, unit: 'Packs', tempMonitored: false }
        ]
      }
    },
    update: {}
  });

  console.log('✓ Convoys seeded.');

  // 9. Supply Swap Request
  await prisma.supplySwapRequest.upsert({
    where: { code: 'SWAP-801' },
    create: {
      code: 'SWAP-801',
      fromWarehouseId: whAlpha.id,
      toWarehouseId: whBravo.id,
      status: 'IN_TRANSIT',
      reason: 'Urgent Insulin replenishment for isolated Shelter S-012 deficit',
      progressPct: 65,
      approvedBy: userCmd.operatorId,
      approvedAt: new Date(),
      items: {
        create: {
          supplyId: supplyInsulin.id,
          quantity: 500,
          unit: 'Vials'
        }
      }
    },
    update: {}
  });

  // 10. Operational Alerts
  await prisma.alert.upsert({
    where: { code: 'ALT-901' },
    create: {
      code: 'ALT-901',
      severity: 'CRITICAL',
      status: 'NEW',
      title: 'Flash Flood: NH-58 River Crossing Impassable',
      details: 'River surge overtopped bridge deck by 1.8 meters. Convoys C-014 and C-019 automatically rerouted via Mountain Ridge Bypass.',
      source: 'Song River Hydro Gauge',
      sourceType: 'hazard'
    },
    update: {}
  });

  await prisma.alert.upsert({
    where: { code: 'ALT-902' },
    create: {
      code: 'ALT-902',
      severity: 'CRITICAL',
      status: 'NEW',
      title: 'Critical Insulin Stockout: Shelter S-012',
      details: 'Available supply below 20 vials (0.2 days of cover). Relief Convoy C-014 in transit via High Mountain Ridge.',
      source: 'Shelter S-012 Telemetry',
      sourceType: 'shelter'
    },
    update: {}
  });

  console.log('🎉 DISISTA CONTROL Production Database Seeding Complete!');
}

seed()
  .catch((e) => {
    console.error('Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
