import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, FileText, CreditCard, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

export default async function AccountantDashboard() {
  const session = await auth();
  const accountantId = session!.user.id;

  // Get assigned clients
  const assignments = await prisma.ownerAccountant.findMany({
    where: { accountantId, isActive: true },
    include: {
      owner: {
        include: {
          properties: {
            include: {
              payments: { where: { status: { in: ["PENDING", "OVERDUE", "PARTIAL"] } } },
              documents: { where: { status: "PENDING" } },
            },
          },
        },
      },
    },
  });

  const clients = assignments.map((a) => a.owner);
  const totalPendingDocs = clients.reduce(
    (sum, c) => sum + c.properties.reduce((s, p) => s + p.documents.length, 0), 0
  );
  const totalPendingPayments = clients.reduce(
    (sum, c) => sum + c.properties.reduce((s, p) => s + p.payments.length, 0), 0
  );
  const totalPendingAmount = clients.reduce(
    (sum, c) => sum + c.properties.reduce(
      (s, p) => s + p.payments.reduce((ps, pay) => ps + pay.amount, 0), 0
    ), 0
  );

  // Pending document validations across all clients
  const pendingDocs = await prisma.document.findMany({
    where: {
      status: "PENDING",
      owner: { assignedTo: { some: { accountantId, isActive: true } } },
    },
    include: { owner: { select: { name: true } }, property: { select: { name: true } } },
    take: 6,
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-800">Panel del Contador</h2>
        <p className="text-stone-500 text-sm">
          {clients.length} clientes asignados — {new Date().toLocaleDateString("es-BO", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Mis Clientes" value={clients.length} subtitle="propietarios" icon={Users} iconColor="text-green-700" iconBg="bg-green-100" />
        <StatCard title="Docs. Pendientes" value={totalPendingDocs} subtitle="por validar" icon={FileText} iconColor="text-blue-600" iconBg="bg-blue-100" />
        <StatCard title="Pagos Pendientes" value={totalPendingPayments} subtitle="obligaciones" icon={CreditCard} iconColor="text-amber-600" iconBg="bg-amber-100" />
        <StatCard title="Monto Pendiente" value={formatCurrency(totalPendingAmount)} subtitle="total" icon={Clock} iconColor="text-red-600" iconBg="bg-red-100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clients summary */}
        <Card>
          <CardHeader>
            <CardTitle>Mis Clientes</CardTitle>
            <Link href="/accountant/clients">
              <Button variant="ghost" size="sm">Ver todos</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {clients.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                <p className="text-stone-500 text-sm">No tienes clientes asignados</p>
              </div>
            ) : (
              <div className="space-y-3">
                {clients.slice(0, 5).map((client) => {
                  const pendingPays = client.properties.reduce((s, p) => s + p.payments.length, 0);
                  const pendingDocsCount = client.properties.reduce((s, p) => s + p.documents.length, 0);
                  return (
                    <Link key={client.id} href={`/accountant/clients/${client.id}`} className="block">
                      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-stone-50 border border-stone-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-green-700 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">{client.name[0]}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-stone-800">{client.name}</p>
                            <p className="text-xs text-stone-500">{client.properties.length} propiedades</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {pendingDocsCount > 0 && (
                            <Badge variant="warning">{pendingDocsCount} docs</Badge>
                          )}
                          {pendingPays > 0 && (
                            <Badge variant="danger">{pendingPays} pagos</Badge>
                          )}
                          {pendingDocsCount === 0 && pendingPays === 0 && (
                            <Badge variant="success">Al día</Badge>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending validations */}
        <Card>
          <CardHeader>
            <CardTitle>Documentos por Validar</CardTitle>
            <Link href="/accountant/validations">
              <Button variant="ghost" size="sm">Ver todos</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {pendingDocs.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                <p className="text-stone-500 text-sm">No hay documentos pendientes</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingDocs.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border border-amber-100 bg-amber-50">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-stone-800">{doc.name}</p>
                        <p className="text-xs text-stone-500">{doc.owner.name} · {doc.property?.name}</p>
                      </div>
                    </div>
                    <div className="text-xs text-stone-400">{formatDate(doc.createdAt)}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
