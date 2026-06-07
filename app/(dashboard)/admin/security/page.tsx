import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Activity } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function SecurityPage() {
  const auditLogs = await prisma.auditLog.findMany({
    include: { user: { select: { name: true, email: true, role: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const actionColors: Record<string, string> = {
    CREATE: "success",
    UPDATE: "info",
    DELETE: "danger",
    LOGIN: "default",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-800">Seguridad y Auditoría</h2>
        <p className="text-stone-500 text-sm">Registro de actividades del sistema</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
          <Shield className="w-7 h-7 text-green-700 mb-2" />
          <p className="text-sm font-semibold text-green-700">Sistema Seguro</p>
          <p className="text-xs text-green-600 mt-1">Autenticación JWT activa</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <Activity className="w-7 h-7 text-blue-700 mb-2" />
          <p className="text-sm font-semibold text-blue-700">Registros de Auditoría</p>
          <p className="text-2xl font-bold text-blue-700">{auditLogs.length}</p>
        </div>
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-5">
          <Shield className="w-7 h-7 text-stone-500 mb-2" />
          <p className="text-sm font-semibold text-stone-700">Roles Activos</p>
          <p className="text-xs text-stone-500 mt-1">Admin · Contador · Propietario</p>
        </div>
      </div>

      <Card noPadding>
        <div className="p-6 border-b border-stone-100 flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-700" />
          <h3 className="font-semibold text-stone-800">Log de Actividades</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-stone-500 uppercase">Usuario</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-stone-500 uppercase">Acción</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-stone-500 uppercase">Entidad</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-stone-500 uppercase">IP</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-stone-500 uppercase">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-stone-400">No hay registros de auditoría</td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50">
                    <td className="px-6 py-3">
                      <p className="font-medium text-stone-800">{log.user.name}</p>
                      <p className="text-xs text-stone-400">{log.user.email}</p>
                    </td>
                    <td className="px-6 py-3">
                      <Badge variant={(actionColors[log.action] || "default") as "success" | "info" | "danger" | "default"}>
                        {log.action}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 text-stone-600">{log.entity}</td>
                    <td className="px-6 py-3 text-stone-400">{log.ipAddress || "—"}</td>
                    <td className="px-6 py-3 text-stone-500">{formatDate(log.createdAt)}</td>
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
