import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, CreditCard, FileText, AlertTriangle, TrendingUp, CheckCircle } from "lucide-react";
import { formatCurrency, formatDate, daysUntilDue } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function OwnerDashboard() {
  const session = await auth();
  const userId = session!.user.id;

  const [properties, payments, documents, notifications] = await Promise.all([
    prisma.property.findMany({
      where: { ownerId: userId },
      include: { _count: { select: { rauCalcs: true } } },
    }),
    prisma.payment.findMany({
      where: { ownerId: userId },
      include: { property: { select: { name: true } } },
      orderBy: { dueDate: "asc" },
      take: 5,
    }),
    prisma.document.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.notification.findMany({
      where: { userId, isRead: false },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const pendingPayments = payments.filter((p) => p.status === "PENDING" || p.status === "OVERDUE");
  const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
  const overdueCount = payments.filter((p) => p.status === "OVERDUE").length;
  const pendingDocs = documents.filter((d) => d.status === "PENDING").length;

  const paymentStatusVariant = (status: string) => {
    if (status === "PAID") return "success";
    if (status === "OVERDUE") return "danger";
    if (status === "PENDING") return "warning";
    return "default";
  };

  const paymentStatusLabel = (status: string) => {
    if (status === "PAID") return "Pagado";
    if (status === "OVERDUE") return "Vencido";
    if (status === "PENDING") return "Pendiente";
    if (status === "PARTIAL") return "Parcial";
    return status;
  };

  const docStatusVariant = (status: string) => {
    if (status === "APPROVED") return "success";
    if (status === "REJECTED") return "danger";
    return "warning";
  };

  const docStatusLabel = (status: string) => {
    if (status === "APPROVED") return "Aprobado";
    if (status === "REJECTED") return "Rechazado";
    return "Pendiente";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-800">
          Bienvenido, {session!.user.name?.split(" ")[0]}
        </h2>
        <p className="text-stone-500 text-sm mt-1">
          Resumen de tu gestión agropecuaria — {new Date().toLocaleDateString("es-BO", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Mis Propiedades"
          value={properties.length}
          subtitle="propiedades registradas"
          icon={MapPin}
          iconColor="text-green-700"
          iconBg="bg-green-100"
        />
        <StatCard
          title="Pagos Pendientes"
          value={formatCurrency(totalPending)}
          subtitle={`${pendingPayments.length} obligaciones`}
          icon={CreditCard}
          iconColor="text-amber-600"
          iconBg="bg-amber-100"
        />
        <StatCard
          title="Documentos"
          value={pendingDocs}
          subtitle="en revisión"
          icon={FileText}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
        />
        <StatCard
          title="Alertas"
          value={overdueCount + notifications.length}
          subtitle="requieren atención"
          icon={AlertTriangle}
          iconColor="text-red-600"
          iconBg="bg-red-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Properties */}
        <Card>
          <CardHeader>
            <CardTitle>Mis Propiedades</CardTitle>
            <Link href="/owner/properties">
              <Button variant="ghost" size="sm">Ver todas</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {properties.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                <p className="text-stone-500 text-sm">No tienes propiedades registradas</p>
                <Link href="/owner/properties/new">
                  <Button size="sm" className="mt-3">Agregar Propiedad</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {properties.slice(0, 4).map((prop) => (
                  <Link key={prop.id} href={`/owner/properties/${prop.id}`} className="block">
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-stone-50 border border-stone-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-green-700" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-stone-800">{prop.name}</p>
                          <p className="text-xs text-stone-500">{prop.municipality}, {prop.department}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-stone-700">{prop.area} ha</p>
                        <Badge variant={prop.status === "ACTIVE" ? "success" : "warning"}>
                          {prop.status === "ACTIVE" ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payments */}
        <Card>
          <CardHeader>
            <CardTitle>Obligaciones de Pago</CardTitle>
            <Link href="/owner/payments">
              <Button variant="ghost" size="sm">Ver todas</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                <p className="text-stone-500 text-sm">No hay pagos registrados</p>
              </div>
            ) : (
              <div className="space-y-3">
                {payments.map((payment) => {
                  const days = daysUntilDue(payment.dueDate);
                  return (
                    <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg border border-stone-100">
                      <div>
                        <p className="text-sm font-medium text-stone-800">{payment.property.name}</p>
                        <p className="text-xs text-stone-500">
                          Vence: {formatDate(payment.dueDate)}
                          {payment.status === "PENDING" && days <= 30 && days > 0 && (
                            <span className="text-amber-600 font-medium ml-1">({days}d)</span>
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-stone-800">{formatCurrency(payment.amount)}</p>
                        <Badge variant={paymentStatusVariant(payment.status) as "success" | "warning" | "danger" | "default"}>
                          {paymentStatusLabel(payment.status)}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle>Documentos Recientes</CardTitle>
            <Link href="/owner/documents">
              <Button variant="ghost" size="sm">Ver todos</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                <p className="text-stone-500 text-sm">No hay documentos subidos</p>
                <Link href="/owner/documents">
                  <Button size="sm" className="mt-3">Subir Documento</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border border-stone-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-stone-800 truncate max-w-[180px]">{doc.name}</p>
                        <p className="text-xs text-stone-500">{formatDate(doc.createdAt)}</p>
                      </div>
                    </div>
                    <Badge variant={docStatusVariant(doc.status) as "success" | "warning" | "danger"}>
                      {docStatusLabel(doc.status)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Notificaciones</CardTitle>
            <Link href="/owner/notifications">
              <Button variant="ghost" size="sm">Ver todas</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                <p className="text-stone-500 text-sm">No hay notificaciones pendientes</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div key={notif.id} className="flex gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100">
                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-stone-800">{notif.title}</p>
                      <p className="text-xs text-stone-600">{notif.message}</p>
                      <p className="text-xs text-stone-400 mt-1">{formatDate(notif.createdAt)}</p>
                    </div>
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
