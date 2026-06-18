import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL ?? "" });
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

async function main() {
  console.log("🌱 Seeding RAU Bolivia...");

  // ── Usuarios ──────────────────────────────────────────────────────────
  const adminPass = await bcrypt.hash("admin2024", 12);
  await prisma.user.upsert({
    where: { email: "admin@raubolivia.bo" },
    update: {},
    create: {
      name: "Administrador RAU",
      email: "admin@raubolivia.bo",
      password: adminPass,
      role: "ADMIN",
    },
  });

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
      nit: "5678901089",
    },
  });

  const ownerPass = await bcrypt.hash("propietario2024", 12);
  const owner = await prisma.user.upsert({
    where: { email: "propietario@raubolivia.bo" },
    update: {},
    create: {
      name: "Carla Mamani Diaz",
      email: "propietario@raubolivia.bo",
      password: ownerPass,
      role: "OWNER",
      ci: "8945678",
      phone: "+591 70987654",
      nit: "1029876543",
    },
  });

  // ── Asignación contador → propietario ─────────────────────────────────
  await prisma.ownerAccountant.upsert({
    where: { ownerId_accountantId: { ownerId: owner.id, accountantId: accountant.id } },
    update: {},
    create: { ownerId: owner.id, accountantId: accountant.id },
  });

  // ── Tasas RAU 2024 oficiales (tabla DS 24463 actualizada) ─────────────
  const tasas2024 = [
    // ALTIPLANO Y PUNA
    { subzona: "NORTE_RIBERANA_TITICACA", act: "AGRICOLA_OTROS", rate: 49.06, min: 10, max: 160 },
    { subzona: "NORTE_RIBERANA_TITICACA", act: "PECUARIA", rate: 3.03, min: 10, max: 160 },
    { subzona: "NORTE_CON_TITICACA", act: "AGRICOLA_OTROS", rate: 44.34, min: 10, max: 160 },
    { subzona: "NORTE_CON_TITICACA", act: "PECUARIA", rate: 3.03, min: 10, max: 160 },
    { subzona: "NORTE_SIN_TITICACA", act: "AGRICOLA_OTROS", rate: 34.77, min: 20, max: 300 },
    { subzona: "NORTE_SIN_TITICACA", act: "PECUARIA", rate: 3.03, min: 20, max: 300 },
    { subzona: "CENTRAL_CON_POOPO", act: "AGRICOLA_OTROS", rate: 36.72, min: 15, max: 240 },
    { subzona: "CENTRAL_CON_POOPO", act: "PECUARIA", rate: 3.15, min: 15, max: 240 },
    { subzona: "CENTRAL_SIN_POOPO", act: "AGRICOLA_OTROS", rate: 28.51, min: 30, max: 500 },
    { subzona: "CENTRAL_SIN_POOPO", act: "PECUARIA", rate: 1.62, min: 30, max: 500 },
    { subzona: "SUR_SEMIDESERTICA", act: "AGRICOLA_OTROS", rate: 15.87, min: 35, max: 700 },
    { subzona: "SUR_SEMIDESERTICA", act: "PECUARIA", rate: 1.78, min: 35, max: 700 },
    { subzona: "SUR_ANDINA_PUNA", act: "AGRICOLA_OTROS", rate: 15.87, min: 35, max: 700 },
    { subzona: "SUR_ANDINA_PUNA", act: "PECUARIA", rate: 1.78, min: 35, max: 700 },
    // VALLES
    { subzona: "VALLES_ABT_CBB_RIEGO", act: "AGRICOLA_OTROS", rate: 136.96, min: 6, max: 100 },
    { subzona: "VALLES_ABT_CBB_RIEGO", act: "PECUARIA", rate: 6.17, min: 6, max: 100 },
    { subzona: "VALLES_ABT_CBB_SECANO", act: "AGRICOLA_OTROS", rate: 45.54, min: 12, max: 200 },
    { subzona: "VALLES_ABT_CBB_SECANO", act: "PECUARIA", rate: 1.57, min: 12, max: 200 },
    { subzona: "VALLES_ABT_CBB_VITICOLA", act: "AGRICOLA_OTROS", rate: 155.07, min: 3, max: 48 },
    { subzona: "OTROS_VALLES_RIEGO", act: "AGRICOLA_OTROS", rate: 136.96, min: 6, max: 120 },
    { subzona: "OTROS_VALLES_RIEGO", act: "PECUARIA", rate: 6.17, min: 6, max: 120 },
    { subzona: "OTROS_VALLES_SECANO", act: "AGRICOLA_OTROS", rate: 45.54, min: 12, max: 300 },
    { subzona: "OTROS_VALLES_SECANO", act: "PECUARIA", rate: 1.57, min: 12, max: 300 },
    { subzona: "OTROS_VALLES_VITICOLA", act: "AGRICOLA_OTROS", rate: 155.07, min: 3, max: 48 },
    { subzona: "VALLES_CERR_SERRANIAS", act: "AGRICOLA_OTROS", rate: 65.93, min: 0, max: 160 },
    { subzona: "VALLES_CERR_SERRANIAS", act: "PECUARIA", rate: 2.90, min: 0, max: 160 },
    { subzona: "VALLES_CERR_OTROS_RIEGO", act: "AGRICOLA_OTROS", rate: 142.64, min: 4, max: 60 },
    { subzona: "VALLES_CERR_OTROS_RIEGO", act: "PECUARIA", rate: 5.84, min: 4, max: 60 },
    { subzona: "VALLES_CERR_OTROS_SECANO", act: "AGRICOLA_OTROS", rate: 65.93, min: 8, max: 120 },
    { subzona: "VALLES_CERR_OTROS_SECANO", act: "PECUARIA", rate: 2.90, min: 8, max: 120 },
    { subzona: "VALLES_CERR_OTROS_VITICOLA", act: "AGRICOLA_OTROS", rate: 155.07, min: 3, max: 48 },
    { subzona: "CABECERAS_VALLE_SECANO", act: "AGRICOLA_OTROS", rate: 21.80, min: 20, max: 400 },
    { subzona: "CABECERAS_VALLE_SECANO", act: "PECUARIA", rate: 1.70, min: 20, max: 400 },
    // SUBTROPICAL
    { subzona: "YUNGAS", act: "AGRICOLA_OTROS", rate: 57.44, min: 10, max: 300 },
    { subzona: "YUNGAS", act: "PECUARIA", rate: 3.03, min: 500, max: 10000 },
    { subzona: "SANTA_CRUZ", act: "AGRICOLA_OTROS", rate: 35.51, min: 50, max: 1000 },
    { subzona: "SANTA_CRUZ", act: "PECUARIA", rate: 2.61, min: 500, max: 10000 },
    { subzona: "CHACO", act: "AGRICOLA_OTROS", rate: 3.69, min: 80, max: 1200 },
    { subzona: "CHACO", act: "PECUARIA", rate: 1.37, min: 500, max: 10000 },
    // TROPICAL
    { subzona: "BENI_PANDO_ITURRALDE", act: "AGRICOLA_OTROS", rate: 32.57, min: 50, max: 1000 },
    { subzona: "BENI_PANDO_ITURRALDE", act: "PECUARIA", rate: 2.61, min: 500, max: 10000 },
  ] as const;

  const zonaMap: Record<string, "ALTIPLANO_PUNA" | "VALLES" | "SUBTROPICAL" | "TROPICAL"> = {
    NORTE_RIBERANA_TITICACA: "ALTIPLANO_PUNA",
    NORTE_CON_TITICACA: "ALTIPLANO_PUNA",
    NORTE_SIN_TITICACA: "ALTIPLANO_PUNA",
    CENTRAL_CON_POOPO: "ALTIPLANO_PUNA",
    CENTRAL_SIN_POOPO: "ALTIPLANO_PUNA",
    SUR_SEMIDESERTICA: "ALTIPLANO_PUNA",
    SUR_ANDINA_PUNA: "ALTIPLANO_PUNA",
    VALLES_ABT_CBB_RIEGO: "VALLES",
    VALLES_ABT_CBB_SECANO: "VALLES",
    VALLES_ABT_CBB_VITICOLA: "VALLES",
    OTROS_VALLES_RIEGO: "VALLES",
    OTROS_VALLES_SECANO: "VALLES",
    OTROS_VALLES_VITICOLA: "VALLES",
    VALLES_CERR_SERRANIAS: "VALLES",
    VALLES_CERR_OTROS_RIEGO: "VALLES",
    VALLES_CERR_OTROS_SECANO: "VALLES",
    VALLES_CERR_OTROS_VITICOLA: "VALLES",
    CABECERAS_VALLE_SECANO: "VALLES",
    YUNGAS: "SUBTROPICAL",
    SANTA_CRUZ: "SUBTROPICAL",
    CHACO: "SUBTROPICAL",
    BENI_PANDO_ITURRALDE: "TROPICAL",
  };

  for (const t of tasas2024) {
    await prisma.tributaryRate.upsert({
      where: { year_subzona_tipoActividad: { year: 2026, subzona: t.subzona, tipoActividad: t.act } },
      update: {},
      create: {
        year: 2026,
        zona: zonaMap[t.subzona],
        subzona: t.subzona,
        tipoActividad: t.act,
        ratePerHa: t.rate,
        minHectareas: t.min,
        maxHectareas: t.max,
      },
    });
  }
  console.log("✅ Tasas RAU 2026 cargadas (tabla oficial DS 24463)");

  // ── Propiedades NutriAgro SRL ──────────────────────────────────────────
  // NutriAgro SRL: Soya 75 ha — Santa Cruz, Zona Subtropical subzona Santa Cruz
  // RAU = 75 × 35.51 = 2,663.25 Bs
  const propSoya = await prisma.property.upsert({
    where: { registrationNum: "REG-SCZ-2026-001" },
    update: {},
    create: {
      ownerId: owner.id,
      name: "Hacienda La Esperanza — NutriAgro SRL",
      location: "Km 18 carretera Santa Cruz–Warnes",
      municipality: "Santa Cruz de la Sierra",
      department: "Santa Cruz",
      area: 75,
      zona: "SUBTROPICAL",
      subzona: "SANTA_CRUZ",
      tipoActividad: "AGRICOLA_OTROS",
      produccion: "Soya",
      status: "ACTIVE",
      registrationNum: "REG-SCZ-2026-001",
      tituloPropiedad: "Escritura Pública N.º 245/2026",
      description: "Predio agropecuario de 75 ha destinadas a producción de soya. NutriAgro SRL, Lic. LF-AGRO-SCZ-2025-018.",
    },
  });

  // Segunda propiedad — ganadería
  const propGanaderia = await prisma.property.upsert({
    where: { registrationNum: "REG-SCZ-2026-002" },
    update: {},
    create: {
      ownerId: owner.id,
      name: "Estancia Los Pinos",
      location: "Sector Yapacani Norte",
      municipality: "Yapacaní",
      department: "Santa Cruz",
      area: 650,
      zona: "SUBTROPICAL",
      subzona: "SANTA_CRUZ",
      tipoActividad: "PECUARIA",
      produccion: "Ganadería vacuna",
      status: "ACTIVE",
      registrationNum: "REG-SCZ-2026-002",
      description: "Estancia ganadera con 250 cabezas de ganado bovino.",
    },
  });

  // ── Cálculos RAU ──────────────────────────────────────────────────────
  const rateSoya = await prisma.tributaryRate.findFirst({
    where: { year: 2026, subzona: "SANTA_CRUZ", tipoActividad: "AGRICOLA_OTROS" },
  });
  const rateGanad = await prisma.tributaryRate.findFirst({
    where: { year: 2026, subzona: "SANTA_CRUZ", tipoActividad: "PECUARIA" },
  });

  // Soya: 75 ha × 35.51 = 2,663.25 Bs
  if (rateSoya) {
    const calcSoya = await prisma.rauCalculation.create({
      data: {
        propertyId: propSoya.id,
        rateId: rateSoya.id,
        gestion: 2026,
        hectareas: 75,
        areaNoAprov: 0,
        baseAmount: 75 * 35.51,
        totalAmount: 75 * 35.51,
        dueDate: new Date("2026-10-31"),
        status: "PENDING",
        formulario: "701 V.3",
      },
    });

    await prisma.payment.create({
      data: {
        propertyId: propSoya.id,
        ownerId: owner.id,
        calculationId: calcSoya.id,
        amount: 2663.25,
        dueDate: new Date("2026-10-31"),
        status: "PENDING",
        currency: "BOB",
      },
    });
  }

  // Ganadería: 650 ha × 2.61 = 1,696.50 Bs (pagado)
  if (rateGanad) {
    const calcGanad = await prisma.rauCalculation.create({
      data: {
        propertyId: propGanaderia.id,
        rateId: rateGanad.id,
        gestion: 2025,
        hectareas: 650,
        areaNoAprov: 0,
        baseAmount: 650 * 2.61,
        totalAmount: 650 * 2.61,
        dueDate: new Date("2025-10-31"),
        status: "PAID",
        formulario: "701 V.3",
        approvedBy: accountant.id,
        approvedAt: new Date("2025-10-20"),
      },
    });

    await prisma.payment.create({
      data: {
        propertyId: propGanaderia.id,
        ownerId: owner.id,
        calculationId: calcGanad.id,
        amount: 1696.50,
        dueDate: new Date("2025-10-31"),
        paymentDate: new Date("2025-10-20"),
        status: "PAID",
        receiptNumber: "REC-2025-0731",
        entidadPago: "Banco Unión S.A.",
        currency: "BOB",
      },
    });
  }

  // ── Documentos de NutriAgro ────────────────────────────────────────────
  const docsNutriAgro = [
    { type: "CARNET_IDENTIDAD", name: "C.I. Carla Mamani Díaz — 8945678 SC", status: "APPROVED" },
    { type: "NIT", name: "NIT 1029876543 — NutriAgro SRL", status: "APPROVED" },
    { type: "TITULO_PROPIEDAD", name: "Escritura Pública N.º 245/2024 — La Esperanza", status: "APPROVED" },
    { type: "LICENCIA_FUNCIONAMIENTO", name: "Licencia LF-AGRO-SCZ-2025-018", status: "PENDING" },
    { type: "REGISTRO_SANITARIO", name: "Registro Sanitario RSA-2025-0674", status: "PENDING" },
    { type: "CERTIFICADO_USO_SUELO", name: "Cert. Uso de Suelo CUS-2025-124", status: "PENDING" },
    { type: "LICENCIA_AMBIENTAL", name: "Licencia Ambiental LA-2025-089", status: "PENDING" },
    { type: "REGISTRO_PRODUCTOR_AGROP", name: "Registro Productor RPA-2025-221", status: "PENDING" },
    { type: "FORMULARIO_701", name: "Form. 701 V.3 — Gestión 2026", status: "PENDING" },
  ] as const;

  for (const doc of docsNutriAgro) {
    await prisma.document.create({
      data: {
        ownerId: owner.id,
        propertyId: propSoya.id,
        type: doc.type,
        name: doc.name,
        fileName: doc.name.toLowerCase().replace(/\s+/g, "_") + ".pdf",
        fileUrl: "#",
        fileSize: 512000,
        mimeType: "application/pdf",
        status: doc.status,
      },
    });
  }

  // ── Notificaciones ─────────────────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      {
        userId: owner.id,
        type: "VENCIMIENTO",
        title: "Vencimiento RAU — 31 de octubre",
        message: "El pago del Formulario 701 V.3 de Hacienda La Esperanza (Soya) vence el 31 de octubre de 2026. Monto: Bs. 2,663.25",
        isRead: false,
      },
      {
        userId: owner.id,
        type: "VALIDACION",
        title: "Documentos en revisión",
        message: "Tienes 7 documentos pendientes de validación por tu contador.",
        isRead: false,
      },
      {
        userId: owner.id,
        type: "PAGO",
        title: "Pago registrado — Gestión 2025",
        message: "Se confirmó el pago RAU de Estancia Los Pinos (Gestión 2025) por Bs. 1,696.50 en Banco Unión.",
        isRead: true,
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Seed completado exitosamente");
  console.log("─────────────────────────────────────────────");
  console.log("👤 Admin:        admin@raubolivia.bo       / admin2024");
  console.log("👤 Contador:     contador@raubolivia.bo    / contador2024");
  console.log("👤 Propietario:  propietario@raubolivia.bo / propietario2024");
  console.log("🏡 Empresa:      NutriAgro SRL — Soya 75ha, Santa Cruz");
  console.log("📋 RAU Soya:     75 ha × Bs.35.51 = Bs. 2,663.25 (pendiente 31/oct)");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
