import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL ?? "" });
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin
  const adminPass = await bcrypt.hash("admin2024", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@raubolivia.bo" },
    update: {},
    create: {
      name: "Administrador RAU",
      email: "admin@raubolivia.bo",
      password: adminPass,
      role: "ADMIN",
      isActive: true,
    },
  });

  // Create accountant
  const accPass = await bcrypt.hash("contador2024", 12);
  const accountant = await prisma.user.upsert({
    where: { email: "contador@raubolivia.bo" },
    update: {},
    create: {
      name: "Carlos Mamani Quispe",
      email: "contador@raubolivia.bo",
      password: accPass,
      role: "ACCOUNTANT",
      ci: "5678901",
      phone: "+591 71234567",
      isActive: true,
    },
  });

  // Create owner
  const ownerPass = await bcrypt.hash("propietario2024", 12);
  const owner = await prisma.user.upsert({
    where: { email: "propietario@raubolivia.bo" },
    update: {},
    create: {
      name: "Juan Carlos Flores",
      email: "propietario@raubolivia.bo",
      password: ownerPass,
      role: "OWNER",
      ci: "1234567",
      phone: "+591 70987654",
      nit: "1234567089",
      isActive: true,
    },
  });

  // Assign accountant to owner
  await prisma.ownerAccountant.upsert({
    where: { ownerId_accountantId: { ownerId: owner.id, accountantId: accountant.id } },
    update: {},
    create: { ownerId: owner.id, accountantId: accountant.id },
  });

  // Create properties
  const prop1 = await prisma.property.upsert({
    where: { registrationNum: "REG-2024-001" },
    update: {},
    create: {
      ownerId: owner.id,
      name: "Hacienda La Esperanza",
      location: "Camino a Warnes km 25",
      municipality: "Warnes",
      department: "Santa Cruz",
      area: 150.5,
      landCategory: "PRIMERA_CLASE",
      region: "LLANOS",
      activityType: "AGRICULTURA",
      status: "ACTIVE",
      registrationNum: "REG-2024-001",
      description: "Hacienda con cultivos de soya y girasol",
    },
  });

  const prop2 = await prisma.property.upsert({
    where: { registrationNum: "REG-2024-002" },
    update: {},
    create: {
      ownerId: owner.id,
      name: "Estancia Los Pinos",
      location: "Sector Yapacani Norte",
      municipality: "Yapacaní",
      department: "Santa Cruz",
      area: 320.0,
      landCategory: "SEGUNDA_CLASE",
      region: "LLANOS",
      activityType: "GANADERIA",
      status: "ACTIVE",
      registrationNum: "REG-2024-002",
      description: "Estancia ganadera con 200 cabezas",
    },
  });

  // Create tributary rates
  const rateConfigs = [
    { region: "LLANOS" as const, cat: "PRIMERA_CLASE" as const, act: "AGRICULTURA" as const, rate: 50 },
    { region: "LLANOS" as const, cat: "SEGUNDA_CLASE" as const, act: "GANADERIA" as const, rate: 17.5 },
    { region: "ALTIPLANO" as const, cat: "PRIMERA_CLASE" as const, act: "AGRICULTURA" as const, rate: 45 },
  ];

  for (const cfg of rateConfigs) {
    await prisma.tributaryRate.upsert({
      where: { year_region_landCategory_activityType: { year: 2024, region: cfg.region, landCategory: cfg.cat, activityType: cfg.act } },
      update: {},
      create: {
        year: 2024,
        region: cfg.region,
        landCategory: cfg.cat,
        activityType: cfg.act,
        ratePerHa: cfg.rate,
        isActive: true,
      },
    });
  }

  // Create payments
  const rate1 = await prisma.tributaryRate.findFirst({
    where: { year: 2024, region: "LLANOS", landCategory: "PRIMERA_CLASE", activityType: "AGRICULTURA" },
  });
  const rate2 = await prisma.tributaryRate.findFirst({
    where: { year: 2024, region: "LLANOS", landCategory: "SEGUNDA_CLASE", activityType: "GANADERIA" },
  });

  if (rate1) {
    const calc1 = await prisma.rauCalculation.create({
      data: {
        propertyId: prop1.id,
        rateId: rate1.id,
        year: 2024,
        area: 150.5,
        baseAmount: 150.5 * 50,
        totalAmount: 150.5 * 50,
        dueDate: new Date("2025-03-31"),
        status: "PENDING",
      },
    });

    await prisma.payment.create({
      data: {
        propertyId: prop1.id,
        ownerId: owner.id,
        calculationId: calc1.id,
        amount: 7525,
        dueDate: new Date("2025-03-31"),
        status: "PENDING",
        currency: "BOB",
      },
    });
  }

  if (rate2) {
    const calc2 = await prisma.rauCalculation.create({
      data: {
        propertyId: prop2.id,
        rateId: rate2.id,
        year: 2024,
        area: 320,
        baseAmount: 320 * 17.5,
        totalAmount: 320 * 17.5,
        dueDate: new Date("2025-03-31"),
        status: "PAID",
        approvedBy: accountant.id,
        approvedAt: new Date("2024-12-15"),
      },
    });

    await prisma.payment.create({
      data: {
        propertyId: prop2.id,
        ownerId: owner.id,
        calculationId: calc2.id,
        amount: 5600,
        dueDate: new Date("2025-03-31"),
        paymentDate: new Date("2024-12-15"),
        status: "PAID",
        receiptNumber: "REC-2024-0542",
        currency: "BOB",
      },
    });
  }

  // Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: owner.id,
        type: "VENCIMIENTO",
        title: "Vencimiento próximo",
        message: "El pago RAU de Hacienda La Esperanza vence el 31 de marzo de 2025.",
        isRead: false,
      },
      {
        userId: owner.id,
        type: "PAGO",
        title: "Pago registrado",
        message: "Se registró el pago RAU de Estancia Los Pinos por Bs. 5,600.00",
        isRead: true,
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Seed completado");
  console.log("📧 Admin: admin@raubolivia.bo / admin2024");
  console.log("📧 Contador: contador@raubolivia.bo / contador2024");
  console.log("📧 Propietario: propietario@raubolivia.bo / propietario2024");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
