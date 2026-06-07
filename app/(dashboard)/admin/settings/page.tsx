import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Settings, Database, Globe, Bell } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-800">Configuración del Sistema</h2>
        <p className="text-stone-500 text-sm">Parámetros generales de la plataforma RAU</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-green-700" />
              Información General
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { label: "Nombre del Sistema", value: "RAU Bolivia" },
              { label: "País", value: "Bolivia" },
              { label: "Moneda", value: "Bolivianos (BOB)" },
              { label: "Año Fiscal Activo", value: new Date().getFullYear().toString() },
              { label: "Fecha de Vencimiento RAU", value: "31 de marzo" },
              { label: "Versión", value: "1.0.0" },
            ].map((item) => (
              <div key={item.label} className="flex justify-between py-2 border-b border-stone-100 last:border-0">
                <span className="text-sm text-stone-600">{item.label}</span>
                <span className="text-sm font-medium text-stone-800">{item.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-green-700" />
              Base de Datos
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-sm font-semibold text-green-700">Neon PostgreSQL</p>
            <p className="text-xs text-green-600 mt-1">Conexión activa y segura</p>
          </div>
          <p className="text-xs text-stone-400">
            La base de datos se encuentra en Neon (PostgreSQL serverless). Los respaldos son automáticos.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-green-700" />
              Notificaciones Automáticas
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { label: "Alerta de vencimiento 30 días antes", active: true },
              { label: "Notificación al aprobar documento", active: true },
              { label: "Notificación al rechazar documento", active: true },
              { label: "Recordatorio semanal de pendientes", active: false },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2">
                <span className="text-sm text-stone-700">{item.label}</span>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${item.active ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"}`}>
                  {item.active ? "Activo" : "Inactivo"}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-green-700" />
              Normativa RAU
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p className="text-stone-600">Fuente normativa: <strong>Decreto Supremo No. 24463</strong></p>
            <p className="text-stone-600">Última actualización de tasas: <strong>{new Date().getFullYear()}</strong></p>
            <p className="text-stone-600">Régimen: <strong>Régimen Agropecuario Unificado (RAU)</strong></p>
            <p className="text-xs text-stone-400 mt-3">
              Las tasas son actualizables desde la sección "Tasas RAU". Cualquier modificación queda registrada en el log de auditoría.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
