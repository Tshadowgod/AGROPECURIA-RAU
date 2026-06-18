import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { CreditCard, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { formatCurrency, formatDate, effectivePaymentStatus } from "@/lib/utils";

export default async function PaymentsPage() {
  const session = await auth();

  const payments = (
    await prisma.payment.findMany({
      where: { ownerId: session!.user.id },
      include: { property: { select: { name: true } }, calculation: true },
      orderBy: { dueDate: "asc" },
    })
  ).map((p) => ({ ...p, status: effectivePaymentStatus(p.status, p.dueDate) }));

  const total = payments.reduce((s, p) => s + p.amount, 0);
  const paid = payments.filter((p) => p.status === "PAID").reduce((s, p) => s + p.amount, 0);
  const pending = payments.filter((p) => p.status === "PENDING").reduce((s, p) => s + p.amount, 0);
  const overdue = payments.filter((p) => p.status === "OVERDUE").reduce((s, p) => s + p.amount, 0);

  const statusVariant = (s: string) => s === "PAID" ? "success" : s === "OVERDUE" ? "danger" : s === "PARTIAL" ? "info" : "warning";
  const statusLabel = (s: string) => ({ PAID: "Pagado", OVERDUE: "Vencido", PENDING: "Pendiente", PARTIAL: "Parcial" }[s] || s);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-800">Historial de Pagos</h2>
        <p className="text-stone-500 text-sm">Control de tus obligaciones tributarias RAU</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Registrado" value={formatCurrency(total)} icon={CreditCard} iconColor="text-green-700" iconBg="bg-green-100" />
        <StatCard title="Pagado" value={formatCurrency(paid)} icon={CheckCircle} iconColor="text-emerald-600" iconBg="bg-emerald-100" />
        <StatCard title="Pendiente" value={formatCurrency(pending)} icon={Clock} iconColor="text-amber-600" iconBg="bg-amber-100" />
        <StatCard title="Vencido" value={formatCurrency(overdue)} icon={AlertTriangle} iconColor="text-red-600" iconBg="bg-red-100" />
      </div>

      <Card noPadding>
        <div className="p-6 border-b border-stone-100">
          <CardTitle>Todas las Obligaciones</CardTitle>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-stone-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-stone-500 uppercase">Propiedad</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-stone-500 uppercase">Monto</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-stone-500 uppercase">Vencimiento</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-stone-500 uppercase">Pago</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-stone-500 uppercase">Estado</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-stone-500 uppercase">Recibo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-stone-500">No hay pagos registrados</td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-stone-800">{p.property.name}</td>
                    <td className="px-6 py-4 text-sm font-bold text-stone-800">{formatCurrency(p.amount)}</td>
                    <td className="px-6 py-4 text-sm text-stone-600">{formatDate(p.dueDate)}</td>
                    <td className="px-6 py-4 text-sm text-stone-600">{p.paymentDate ? formatDate(p.paymentDate) : "—"}</td>
                    <td className="px-6 py-4">
                      <Badge variant={statusVariant(p.status) as "success" | "danger" | "warning" | "info"}>
                        {statusLabel(p.status)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-600">{p.receiptNumber || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
