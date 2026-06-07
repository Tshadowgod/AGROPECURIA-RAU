import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateRau } from "@/lib/rau-calculator";
import { z } from "zod";

const simSchema = z.object({
  region: z.enum(["ALTIPLANO", "VALLES", "LLANOS"]),
  landCategory: z.enum(["PRIMERA_CLASE", "SEGUNDA_CLASE", "TERCERA_CLASE"]),
  activityType: z.enum(["AGRICULTURA", "GANADERIA", "MIXTA", "FORESTAL"]),
  area: z.number().positive(),
  year: z.number().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const { propertyId, simulate, ...params } = body;

  const data = simSchema.parse(params);
  const result = calculateRau(
    data.region,
    data.landCategory,
    data.activityType,
    data.area,
    data.year
  );

  if (simulate) {
    return NextResponse.json(result);
  }

  if (!propertyId) {
    return NextResponse.json({ error: "propertyId requerido" }, { status: 400 });
  }

  // Find or create rate
  let rate = await prisma.tributaryRate.findFirst({
    where: {
      year: result.year,
      region: data.region,
      landCategory: data.landCategory,
      activityType: data.activityType,
      isActive: true,
    },
  });

  if (!rate) {
    rate = await prisma.tributaryRate.create({
      data: {
        year: result.year,
        region: data.region,
        landCategory: data.landCategory,
        activityType: data.activityType,
        ratePerHa: result.ratePerHa,
      },
    });
  }

  const calc = await prisma.rauCalculation.create({
    data: {
      propertyId,
      rateId: rate.id,
      year: result.year,
      area: data.area,
      baseAmount: result.baseAmount,
      totalAmount: result.totalAmount,
      dueDate: result.dueDate,
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
