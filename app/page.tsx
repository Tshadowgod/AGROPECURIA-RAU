import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, BarChart3, Shield, Calculator } from "lucide-react";

export default async function HomePage() {
  const session = await auth();
  if (session) {
    const role = session.user.role;
    if (role === "OWNER") redirect("/owner");
    if (role === "ACCOUNTANT") redirect("/accountant");
    if (role === "ADMIN") redirect("/admin");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700">
      {/* Hero */}
      <header className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">R</span>
          </div>
          <span className="text-white font-bold text-lg">RAU Bolivia</span>
        </div>
        <div className="flex gap-3">
          <Link href="/login">
            <Button variant="white" size="sm">Iniciar Sesión</Button>
          </Link>
          <Link href="/register">
            <Button variant="secondary" size="sm">Registrarse</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <span className="inline-block bg-amber-500/20 text-amber-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-amber-500/30">
            Sistema de Gestión Tributaria Agropecuaria
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
            Régimen Agropecuario<br />
            <span className="text-amber-400">Unificado Bolivia</span>
          </h1>
          <p className="text-green-200 text-lg max-w-2xl mx-auto mb-10">
            Automatice el cálculo y control del RAU. Gestione propiedades, documentos y pagos
            con supervisión contable en tiempo real.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button variant="secondary" size="lg">
                Comenzar Ahora
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="white" size="lg">
                Ingresar al Sistema
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
          {[
            { icon: Calculator, title: "Cálculo Automático", desc: "RAU calculado según normativa vigente boliviana con tasas actualizadas." },
            { icon: BarChart3, title: "Panel Ejecutivo", desc: "Indicadores, gráficos y alertas de vencimiento en tiempo real." },
            { icon: CheckCircle, title: "Validación Contable", desc: "Contador revisa y aprueba documentación con observaciones." },
            { icon: Shield, title: "Seguridad Total", desc: "Roles diferenciados, auditoría completa y respaldo automático." },
          ].map((f) => (
            <div key={f.title} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-2">{f.title}</h3>
              <p className="text-green-200 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Roles */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { role: "Propietario", color: "bg-green-600", items: ["Registrar propiedades", "Ver impuestos calculados", "Subir documentos", "Descargar reportes"] },
            { role: "Contador", color: "bg-amber-600", items: ["Gestionar múltiples clientes", "Validar documentación", "Configurar parámetros", "Exportar a Excel/PDF"] },
            { role: "Administrador", color: "bg-stone-700", items: ["Gestionar usuarios", "Actualizar normativas", "Asignar contadores", "Configurar seguridad"] },
          ].map((r) => (
            <div key={r.role} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className={`inline-block ${r.color} text-white text-sm font-medium px-3 py-1 rounded-full mb-4`}>
                {r.role}
              </div>
              <ul className="space-y-2">
                {r.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-green-100 text-sm">
                    <CheckCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>

      <footer className="text-center py-8 text-green-400 text-sm border-t border-green-800 mt-10">
        © {new Date().getFullYear()} RAU Bolivia — Sistema de Gestión Agropecuaria
      </footer>
    </div>
  );
}
