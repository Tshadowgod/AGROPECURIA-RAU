import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, User, Building2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function AccountantSettingsPage() {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    select: { name: true, email: true, phone: true, ci: true, nit: true, createdAt: true },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-800">Configuración</h2>
        <p className="text-stone-500 text-sm">Tu perfil y preferencias del sistema</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-green-700" />
              Datos del Contador
            </div>
          </CardTitle>
          <Badge variant="info">Contador</Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { label: "Nombre Completo", value: user?.name },
              { label: "Correo Electrónico", value: user?.email },
              { label: "Teléfono", value: user?.phone || "No registrado" },
              { label: "Carnet de Identidad", value: user?.ci || "No registrado" },
              { label: "NIT", value: user?.nit || "No registrado" },
              { label: "Cuenta creada", value: user?.createdAt ? formatDate(user.createdAt) : "—" },
            ].map((item) => (
              <div key={item.label} className="flex justify-between py-2 border-b border-stone-100 last:border-0">
                <span className="text-sm text-stone-600">{item.label}</span>
                <span className="text-sm font-medium text-stone-800">{item.value}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-stone-400 mt-4">
            Para actualizar tus datos, contacta al administrador del sistema.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-green-700" />
              Parámetros Tributarios
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-green-800 mb-1">Año Fiscal Activo</p>
              <p className="text-2xl font-bold text-green-700">{new Date().getFullYear()}</p>
            </div>
            <div className="bg-stone-50 rounded-lg p-4">
              <p className="text-sm font-medium text-stone-700 mb-2">Vencimiento RAU</p>
              <p className="text-sm text-stone-600">31 de marzo del año siguiente al período fiscal</p>
            </div>
            <div className="bg-stone-50 rounded-lg p-4">
              <p className="text-sm font-medium text-stone-700 mb-2">Moneda</p>
              <p className="text-sm text-stone-600">Bolivianos (BOB) — Bs.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
