import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, AlertTriangle, Clock } from "lucide-react";
import { formatCurrency, formatDate, daysUntilDue } from "@/lib/utils";

export default async function CalendarPage() {
  const session = await auth();

  const payments = await prisma.payment.findMany({
    where: {
      owner: { assignedTo: { some: { accountantId: session!.user.id, isActive: true } } },
      status: { in: ["PENDING", "OVERDUE"] },
    },
    include: {
      property: { select: { name: true } },
      owner: { select: { name: true } },
    },
    orderBy: { dueDate: "asc" },
  });

  const now = new Date();
  const next30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const next90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  const urgent = payments.filter((p) => new Date(p.dueDate) <= next30);
  const upcoming = payments.filter((p) => new Date(p.dueDate) > next30 && new Date(p.dueDate) <= next90);
  const future = payments.filter((p) => new Date(p.dueDate) > next90);

  const monthlyCalendar = payments.reduce<Record<string, typeof payments>>((acc, p) => {
    const key = new Date(p.dueDate).toLocaleString("es-BO", { month: "long", year: "numeric" });
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-800">Calendario Tributario</h2>
        <p className="text-stone-500 text-sm">Vencimientos y obligaciones de todos tus clientes</p>
      </div>

      {/* Urgency summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <p className="font-semibold text-red-700">Urgente (30 días)</p>
          </div>
          <p className="text-2xl font-bold text-red-700">{urgent.length}</p>
          <p className="text-sm text-red-600">{formatCurrency(urgent.reduce((s, p) => s + p.amount, 0))}</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <p className="font-semibold text-amber-700">Próximo (90 días)</p>
          </div>
          <p className="text-2xl font-bold text-amber-700">{upcoming.length}</p>
          <p className="text-sm text-amber-600">{formatCurrency(upcoming.reduce((s, p) => s + p.amount, 0))}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <p className="font-semibold text-blue-700">Futuro</p>
          </div>
          <p className="text-2xl font-bold text-blue-700">{future.length}</p>
          <p className="text-sm text-blue-600">{formatCurrency(future.reduce((s, p) => s + p.amount, 0))}</p>
        </div>
      </div>

      {/* Calendar by month */}
      {Object.keys(monthlyCalendar).length === 0 ? (
        <Card className="text-center py-16">
          <Calendar className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-stone-700 mb-2">Sin vencimientos pendientes</h3>
          <p className="text-stone-500 text-sm">Todos los clientes están al día</p>
        </Card>
      ) : (
        Object.entries(monthlyCalendar).map(([month, items]) => (
          <Card key={month}>
            <CardHeader>
              <CardTitle className="capitalize">{month}</CardTitle>
              <Badge variant="warning">{items.length} vencimientos</Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {items.map((p) => {
                  const days = daysUntilDue(p.dueDate);
                  const isOverdue = days < 0;
                  return (
                    <div
                      key={p.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        isOverdue ? "bg-red-50 border-red-200" : days <= 30 ? "bg-amber-50 border-amber-200" : "bg-stone-50 border-stone-200"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium text-stone-800">
                          {p.owner.name} — {p.property.name}
                        </p>
                        <p className="text-xs text-stone-500">
                          Vence: {formatDate(p.dueDate)}
                          {isOverdue
                            ? <span className="text-red-600 font-medium ml-1">(Vencido hace {Math.abs(days)}d)</span>
                            : <span className="text-amber-600 font-medium ml-1">({days}d restantes)</span>
                          }
                        </p>
                      </div>
                      <p className="font-bold text-stone-800">{formatCurrency(p.amount)}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
