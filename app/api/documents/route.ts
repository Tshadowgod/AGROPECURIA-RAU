import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  let where: Record<string, unknown> = {};

  if (session.user.role === "OWNER") {
    where = { ownerId: session.user.id };
  } else if (session.user.role === "ACCOUNTANT") {
    where = { owner: { assignedTo: { some: { accountantId: session.user.id, isActive: true } } } };
  }

  if (status) where.status = status;

  const docs = await prisma.document.findMany({
    where,
    include: {
      owner: { select: { name: true } },
      property: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(docs);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();

  const doc = await prisma.document.create({
    data: {
      ownerId: session.user.id,
      propertyId: body.propertyId || null,
      type: body.type,
      name: body.name,
      fileName: body.fileName || body.name,
      fileUrl: body.fileUrl || "#",
      fileSize: body.fileSize || 0,
      mimeType: body.mimeType || "application/pdf",
    },
  });

  return NextResponse.json(doc, { status: 201 });
}
