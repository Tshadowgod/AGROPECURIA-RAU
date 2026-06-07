import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Eye, MapPin } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default async function ClientsPage() {
  const session = await auth();

  const assignments = await prisma.ownerAccountant.findMany({
    where: { accountantId: session!.user.id, isActive: true },
    include: {
      owner: {
        include: {
          properties: {
            include: {
              payments: { where: { status: { in: ["PENDING", "OVERDUE"] } } },
              documents: { where: { status: "PENDING" } },
            },
          },
          _count: { select: { properties: true } },
        },
      },
    },
    orderBy: { assignedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-800">Mis Clientes</h2>
        <p className="text-stone-500 text-sm">{assignments.length} propietarios asignados</p>
      </div>

      {assignments.length === 0 ? (
        <Card className="text-center py-16">
          <Users className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-stone-700 mb-2">Sin clientes asignados</h3>
          <p className="text-stone-500 text-sm">El administrador asignará propietarios a tu cuenta</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {assignments.map(({ owner, assignedAt }) => {
            const pendingDocs = owner.properties.reduce((s, p) => s + p.documents.length, 0);
            const pendingPayments = owner.properties.reduce((s, p) => s + p.payments.length, 0);
            const allGood = pendingDocs === 0 && pendingPayments === 0;

            return (
              <Card key={owner.id} className="hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-700 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-lg font-bold">{owner.name[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-stone-800 truncate">{owner.name}</p>
                    <p className="text-xs text-stone-500 truncate">{owner.email}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Propiedades</span>
                    <span className="font-medium flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-green-600" />
                      {owner._count.properties}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">CI</span>
                    <span className="text-stone-700">{owner.ci || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Asignado desde</span>
                    <span className="text-stone-700">{formatDate(assignedAt)}</span>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap mb-4">
                  {pendingDocs > 0 && <Badge variant="warning">{pendingDocs} docs pendientes</Badge>}
                  {pendingPayments > 0 && <Badge variant="danger">{pendingPayments} pagos</Badge>}
                  {allGood && <Badge variant="success">Al día</Badge>}
                </div>

                <Link href={`/accountant/clients/${owner.id}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    <Eye className="w-4 h-4" />
                    Ver Detalle
                  </Button>
                </Link>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
