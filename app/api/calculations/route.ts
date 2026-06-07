import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calcularRAU, type SubzonaRAU, type TipoActividadRAU } from "@/lib/rau-calculator";
import { z } from "zod";

const simSchema = z.object({
  subzona: z.string(),
  tipoActividad: z.enum(["AGRICOLA_OTROS", "PECUARIA"]),
  hectareas: z.number().positive(),
  gestion: z.number().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const { propertyId, simulate, ...params } = body;

  const data = simSchema.parse(params);
  const result = calcularRAU(
    data.subzona as SubzonaRAU,
    data.tipoActividad as TipoActividadRAU,
    data.hectareas,
    data.gestion
  );

  if (simulate) return NextResponse.json(result);

  if (!propertyId) {
    return NextResponse.json({ error: "propertyId requerido" }, { status: 400 });
  }

  let rate = await prisma.tributaryRate.findFirst({
    where: {
      year: result.gestion,
      subzona: data.subzona as SubzonaRAU,
      tipoActividad: data.tipoActividad,
      isActive: true,
    },
  });

  if (!rate) {
    return NextResponse.json({ error: "Tasa no encontrada para esta zona/actividad" }, { status: 400 });
  }

  const calc = await prisma.rauCalculation.create({
    data: {
      propertyId,
      rateId: rate.id,
      gestion: result.gestion,
      hectareas: data.hectareas,
      baseAmount: result.montoBase,
      totalAmount: result.montoTotal,
      dueDate: result.vencimiento,
      esNoImponible: result.esNoImponible,
      status: result.esNoImponible ? "PENDING" : "PENDING",
    },
  });

  return NextResponse.json(calc, { status: 201 });
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const propertyId = searchParams.get("propertyId");

  const calcs = await prisma.rauCalculation.findMany({
    where: propertyId ? { propertyId } : {},
    include: { rate: true, property: { select: { name: true, ownerId: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(calcs);
}
