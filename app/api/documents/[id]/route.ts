import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role === "OWNER") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const doc = await prisma.document.update({
    where: { id },
    data: {
      status: body.status,
      observations: body.observations,
      reviewedBy: session.user.id,
      reviewedAt: new Date(),
    },
  });

  // Notify owner
  if (body.status === "APPROVED" || body.status === "REJECTED") {
    await prisma.notification.create({
      data: {
        userId: doc.ownerId,
        type: "VALIDACION",
        title: body.status === "APPROVED" ? "Documento aprobado" : "Documento rechazado",
        message: body.status === "APPROVED"
          ? `Tu documento "${doc.name}" ha sido aprobado.`
          : `Tu documento "${doc.name}" fue rechazado. ${body.observations ? "Motivo: " + body.observations : ""}`,
      },
    });
  }

  return NextResponse.json(doc);
}
