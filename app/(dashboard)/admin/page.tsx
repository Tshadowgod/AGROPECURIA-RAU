import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, MapPin, CreditCard, FileText, Shield, Settings } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

export default async function AdminDashboard() {
  const [userCounts, properties, recentUsers, pendingDocs] = await Promise.all([
    prisma.user.groupBy({ by: ["role"], _count: true }),
    prisma.property.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" }, take: 5,
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    }),
    prisma.document.count({ where: { status: "PENDING" } }),
  ]);

  const owners = userCounts.find((u) => u.role === "OWNER")?._count || 0;
  const accountants = userCounts.find((u) => u.role === "ACCOUNTANT")?._count || 0;
  const admins = userCounts.find((u) => u.role === "ADMIN")?._count || 0;

  const roleLabel: Record<string, string> = { OWNER: "Propietario", ACCOUNTANT: "Contador", ADMIN: "Admin" };
  const roleVariant = (r: string) => r === "ADMIN" ? "danger" : r === "ACCOUNTANT" ? "info" : "success";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-800">Panel de Administración</h2>
        <p className="text-stone-500 text-sm">Control total del sistema RAU Bolivia</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Propietarios" value={owners} subtitle="usuarios" icon={Users} iconColor="text-green-700" iconBg="bg-green-100" />
        <StatCard title="Contadores" value={accountants} subtitle="usuarios" icon={Shield} iconColor="text-blue-600" iconBg="bg-blue-100" />
        <StatCard title="Propiedades" value={properties} subtitle="registradas" icon={MapPin} iconColor="text-amber-600" iconBg="bg-amber-100" />
        <StatCard title="Docs. Pendientes" value={pendingDocs} subtitle="por validar" icon={FileText} iconColor="text-red-600" iconBg="bg-red-100" />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { href: "/admin/users", icon: Users, label: "Gestionar Usuarios", color: "bg-green-700" },
          { href: "/admin/rates", icon: CreditCard, label: "Tasas RAU", color: "bg-amber-600" },
          { href: "/admin/assignments", icon: Shield, label: "Asignaciones", color: "bg-blue-600" },
          { href: "/admin/settings", icon: Settings, label: "Configuración", color: "bg-stone-600" },
        ].map((action) => (
          <Link key={action.href} href={action.href}>
            <div className={`${action.color} rounded-xl p-5 text-white hover:opacity-90 transition-opacity cursor-pointer`}>
              <action.icon className="w-7 h-7 mb-3 opacity-90" />
              <p className="font-semibold text-sm">{action.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent users */}
        <Card>
          <CardHeader>
            <CardTitle>Usuarios Recientes</CardTitle>
            <Link href="/admin/users">
              <Button variant="ghost" size="sm">Ver todos</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-stone-50 border border-stone-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-green-700 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{user.name[0]}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-stone-800">{user.name}</p>
                      <p className="text-xs text-stone-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Badge variant={roleVariant(user.role) as "success" | "info" | "danger"}>
                      {roleLabel[user.role]}
                    </Badge>
                    {!user.isActive && <Badge variant="danger">Inactivo</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System info */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-green-800 mb-1">Sistema Activo</p>
                <p className="text-xs text-green-600">Plataforma RAU Bolivia funcionando correctamente</p>
              </div>
              {[
                { label: "Total de Propietarios", value: `${owners} usuarios` },
                { label: "Total de Contadores", value: `${accountants} usuarios` },
                { label: "Propiedades Registradas", value: `${properties} predios` },
                { label: "Documentos Pendientes", value: `${pendingDocs} revisiones` },
                { label: "Año Fiscal", value: new Date().getFullYear().toString() },
              ].map((item) => (
                <div key={item.label} className="flex justify-between py-2 border-b border-stone-100 last:border-0">
                  <span className="text-sm text-stone-600">{item.label}</span>
                  <span className="text-sm font-medium text-stone-800">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
