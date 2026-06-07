import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Users, BarChart3 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function AccountantReportsPage() {
  const session = await auth();
  const accountantId = session!.user.id;

  const assignments = await prisma.ownerAccountant.findMany({
    where: { accountantId, isActive: true },
    include: {
      owner: {
        include: {
          properties: {
            include: {
              payments: true,
              rauCalcs: true,
            },
          },
        },
      },
    },
  });

  const clients = assignments.map((a) => {
    const owner = a.owner;
    const totalPaid = owner.properties.reduce(
      (s, p) => s + p.payments.filter((pay) => pay.status === "PAID").reduce((ps, pay) => ps + pay.amount, 0), 0
    );
    const totalPending = owner.properties.reduce(
      (s, p) => s + p.payments.filter((pay) => pay.status === "PENDING").reduce((ps, pay) => ps + pay.amount, 0), 0
    );
    const totalRau = owner.properties.reduce(
      (s, p) => s + p.rauCalcs.reduce((cs, c) => cs + c.totalAmount, 0), 0
    );
    return { owner, totalPaid, totalPending, totalRau, propertiesCount: owner.properties.length };
  });

  const grandTotal = clients.reduce((s, c) => s + c.totalRau, 0);
  const grandPaid = clients.reduce((s, c) => s + c.totalPaid, 0);
  const grandPending = clients.reduce((s, c) => s + c.totalPending, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-stone-800">Reportes Contables</h2>
          <p className="text-stone-500 text-sm">Resumen tributario de todos tus clientes</p>
        </div>
        <Button variant="secondary">
          <Download className="w-4 h-4" />
          Exportar Excel
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <p className="text-sm text-blue-600 font-medium">RAU Total Gestionado</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{formatCurrency(grandTotal)}</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
          <p className="text-sm text-emerald-600 font-medium">Total Pagado</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{formatCurrency(grandPaid)}</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <p className="text-sm text-amber-600 font-medium">Total Pendiente</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">{formatCurrency(grandPending)}</p>
        </div>
      </div>

      {/* Clients report table */}
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-700" />
              Estado por Cliente
            </div>
          </CardTitle>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4" />
            PDF
          </Button>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <div className="text-center py-8 text-stone-400">Sin clientes asignados</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-200">
                    <th className="text-left py-2 pr-4 text-stone-600 font-medium">Cliente</th>
                    <th className="text-right py-2 pr-4 text-stone-600 font-medium">Propiedades</th>
                    <th className="text-right py-2 pr-4 text-stone-600 font-medium">RAU Total</th>
                    <th className="text-right py-2 pr-4 text-stone-600 font-medium">Pagado</th>
                    <th className="text-right py-2 pr-4 text-stone-600 font-medium">Pendiente</th>
                    <th className="text-left py-2 text-stone-600 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map(({ owner, totalPaid, totalPending, totalRau, propertiesCount }) => (
                    <tr key={owner.id} className="border-b border-stone-100">
                      <td className="py-3 pr-4">
                        <p className="font-medium text-stone-800">{owner.name}</p>
                        <p className="text-xs text-stone-500">{owner.email}</p>
                      </td>
                      <td className="py-3 pr-4 text-right text-stone-600">{propertiesCount}</td>
                      <td className="py-3 pr-4 text-right font-bold text-stone-800">{formatCurrency(totalRau)}</td>
                      <td className="py-3 pr-4 text-right text-emerald-600 font-medium">{formatCurrency(totalPaid)}</td>
                      <td className="py-3 pr-4 text-right text-amber-600 font-medium">{formatCurrency(totalPending)}</td>
                      <td className="py-3">
                        <Badge variant={totalPending === 0 ? "success" : totalPending > 0 ? "warning" : "default"}>
                          {totalPending === 0 ? "Al día" : "Pendiente"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t-2 border-stone-200">
                  <tr>
                    <td colSpan={2} className="py-3 pr-4 font-bold text-stone-800">TOTAL</td>
                    <td className="py-3 pr-4 text-right font-bold text-stone-800">{formatCurrency(grandTotal)}</td>
                    <td className="py-3 pr-4 text-right font-bold text-emerald-700">{formatCurrency(grandPaid)}</td>
                    <td className="py-3 pr-4 text-right font-bold text-amber-700">{formatCurrency(grandPending)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
