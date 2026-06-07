import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, BarChart3 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getLandCategoryLabel, getRegionLabel, getActivityLabel } from "@/lib/rau-calculator";

export default async function ReportsPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [properties, payments] = await Promise.all([
    prisma.property.findMany({
      where: { ownerId: userId },
      include: {
        rauCalcs: { include: { rate: true } },
        payments: true,
      },
    }),
    prisma.payment.findMany({
      where: { ownerId: userId },
      include: { property: { select: { name: true } } },
      orderBy: { dueDate: "desc" },
    }),
  ]);

  const totalPaid = payments.filter((p) => p.status === "PAID").reduce((s, p) => s + p.amount, 0);
  const totalPending = payments.filter((p) => p.status === "PENDING").reduce((s, p) => s + p.amount, 0);
  const totalOverdue = payments.filter((p) => p.status === "OVERDUE").reduce((s, p) => s + p.amount, 0);

  const statusLabel = (s: string) => ({ PAID: "Pagado", OVERDUE: "Vencido", PENDING: "Pendiente", PARTIAL: "Parcial" }[s] || s);
  const statusVariant = (s: string) => s === "PAID" ? "success" : s === "OVERDUE" ? "danger" : "warning";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-stone-800">Reportes</h2>
          <p className="text-stone-500 text-sm">Descarga y consulta tus informes tributarios</p>
        </div>
        <Button variant="secondary">
          <Download className="w-4 h-4" />
          Exportar Todo
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
          <p className="text-sm text-emerald-600 font-medium">Total Pagado</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <p className="text-sm text-amber-600 font-medium">Total Pendiente</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">{formatCurrency(totalPending)}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <p className="text-sm text-red-600 font-medium">Total Vencido</p>
          <p className="text-2xl font-bold text-red-700 mt-1">{formatCurrency(totalOverdue)}</p>
        </div>
      </div>

      {/* Properties report */}
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-700" />
              Resumen por Propiedad
            </div>
          </CardTitle>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4" />
            Excel
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200">
                  <th className="text-left py-2 pr-4 text-stone-600 font-medium">Propiedad</th>
                  <th className="text-left py-2 pr-4 text-stone-600 font-medium">Región</th>
                  <th className="text-left py-2 pr-4 text-stone-600 font-medium">Área</th>
                  <th className="text-left py-2 pr-4 text-stone-600 font-medium">Actividad</th>
                  <th className="text-right py-2 pr-4 text-stone-600 font-medium">Cálculos</th>
                  <th className="text-right py-2 text-stone-600 font-medium">Total RAU</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((prop) => {
                  const totalRau = prop.rauCalcs.reduce((s, c) => s + c.totalAmount, 0);
                  return (
                    <tr key={prop.id} className="border-b border-stone-100">
                      <td className="py-2 pr-4 font-medium text-stone-800">{prop.name}</td>
                      <td className="py-2 pr-4 text-stone-600">{getRegionLabel(prop.region)}</td>
                      <td className="py-2 pr-4 text-stone-600">{prop.area} ha</td>
                      <td className="py-2 pr-4 text-stone-600">{getActivityLabel(prop.activityType)}</td>
                      <td className="py-2 pr-4 text-right text-stone-600">{prop.rauCalcs.length}</td>
                      <td className="py-2 text-right font-bold text-green-700">{formatCurrency(totalRau)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Payment history */}
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-700" />
              Historial de Pagos
            </div>
          </CardTitle>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4" />
            PDF
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200">
                  <th className="text-left py-2 pr-4 text-stone-600 font-medium">Propiedad</th>
                  <th className="text-left py-2 pr-4 text-stone-600 font-medium">Monto</th>
                  <th className="text-left py-2 pr-4 text-stone-600 font-medium">Vencimiento</th>
                  <th className="text-left py-2 pr-4 text-stone-600 font-medium">Pago</th>
                  <th className="text-left py-2 pr-4 text-stone-600 font-medium">Recibo</th>
                  <th className="text-left py-2 text-stone-600 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-stone-400">No hay pagos registrados</td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} className="border-b border-stone-100">
                      <td className="py-2 pr-4 font-medium text-stone-800">{p.property.name}</td>
                      <td className="py-2 pr-4 font-bold text-stone-800">{formatCurrency(p.amount)}</td>
                      <td className="py-2 pr-4 text-stone-600">{formatDate(p.dueDate)}</td>
                      <td className="py-2 pr-4 text-stone-600">{p.paymentDate ? formatDate(p.paymentDate) : "—"}</td>
                      <td className="py-2 pr-4 text-stone-600">{p.receiptNumber || "—"}</td>
                      <td className="py-2">
                        <Badge variant={statusVariant(p.status) as "success" | "warning" | "danger"}>
                          {statusLabel(p.status)}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
