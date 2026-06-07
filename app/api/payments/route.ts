import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const ownerId = searchParams.get("ownerId") || (session.user.role === "OWNER" ? session.user.id : null);

  const payments = await prisma.payment.findMany({
    where: ownerId ? { ownerId } : {},
    include: {
      property: { select: { name: true } },
      calculation: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(payments);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const payment = await prisma.payment.create({
    data: {
      propertyId: body.propertyId,
      ownerId: session.user.role === "OWNER" ? session.user.id : body.ownerId,
      calculationId: body.calculationId,
      amount: body.amount,
      dueDate: new Date(body.dueDate),
      paymentDate: body.paymentDate ? new Date(body.paymentDate) : null,
      status: body.status || "PENDING",
      receiptNumber: body.receiptNumber,
      notes: body.notes,
    },
  });

  return NextResponse.json(payment, { status: 201 });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const { id, ...data } = body;

  const payment = await prisma.payment.update({
    where: { id },
    data: {
      ...data,
      paymentDate: data.paymentDate ? new Date(data.paymentDate) : undefined,
    },
  });

  return NextResponse.json(payment);
}
