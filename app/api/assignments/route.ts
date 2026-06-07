import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const assignments = await prisma.ownerAccountant.findMany({
    include: {
      owner: { select: { name: true, email: true } },
      accountant: { select: { name: true, email: true } },
    },
    orderBy: { assignedAt: "desc" },
  });

  return NextResponse.json(assignments);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { ownerId, accountantId } = await req.json();

  const assignment = await prisma.ownerAccountant.upsert({
    where: { ownerId_accountantId: { ownerId, accountantId } },
    update: { isActive: true },
    create: { ownerId, accountantId },
    include: {
      owner: { select: { name: true, email: true } },
      accountant: { select: { name: true, email: true } },
    },
  });

  return NextResponse.json(assignment, { status: 201 });
}
