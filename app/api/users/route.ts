import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role");

  const users = await prisma.user.findMany({
    where: role ? { role: role as "OWNER" | "ACCOUNTANT" | "ADMIN" } : {},
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      ci: true,
      isActive: true,
      createdAt: true,
      _count: { select: { properties: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id, ...data } = await req.json();
  const user = await prisma.user.update({
    where: { id },
    data,
  });

  return NextResponse.json(user);
}
