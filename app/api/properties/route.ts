import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(2),
  location: z.string().min(2),
  municipality: z.string().min(2),
  department: z.string().min(2),
  area: z.number().positive(),
  zona: z.enum(["ALTIPLANO_PUNA", "VALLES", "SUBTROPICAL", "TROPICAL"]),
  subzona: z.string().min(1),
  tipoActividad: z.enum(["AGRICOLA_OTROS", "PECUARIA"]),
  produccion: z.string().optional(),
  registrationNum: z.string().optional(),
  tituloPropiedad: z.string().optional(),
  coordinates: z.string().optional(),
  description: z.string().optional(),
});

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const ownerId = searchParams.get("ownerId");

  const where =
    session.user.role === "OWNER"
      ? { ownerId: session.user.id }
      : ownerId ? { ownerId } : {};

  const properties = await prisma.property.findMany({
    where,
    include: {
      owner: { select: { name: true, email: true } },
      _count: { select: { payments: true, documents: true, rauCalcs: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(properties);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const data = createSchema.parse(body);

  const property = await prisma.property.create({
    data: { ...data, ownerId: session.user.id } as Parameters<typeof prisma.property.create>[0]["data"],
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "CREATE",
      entity: "Property",
      entityId: property.id,
      newValues: JSON.parse(JSON.stringify(data)),
    },
  });

  return NextResponse.json(property, { status: 201 });
}
