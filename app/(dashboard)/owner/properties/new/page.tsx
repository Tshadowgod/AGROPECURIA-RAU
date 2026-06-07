"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin } from "lucide-react";
import Link from "next/link";
import { ZONAS_LABEL, getSubzonasPorZona, type ZonaRAU } from "@/lib/rau-calculator";

const ZONAS = (Object.keys(ZONAS_LABEL) as ZonaRAU[]).map((z) => ({ value: z, label: ZONAS_LABEL[z] }));

const DEPARTAMENTOS = [
  "La Paz", "Cochabamba", "Santa Cruz", "Oruro", "Potosí",
  "Tarija", "Chuquisaca", "Beni", "Pando",
];

export default function NewPropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [zona, setZona] = useState<ZonaRAU | "">("");
  const [subzonas, setSubzonas] = useState<{ value: string; label: string }[]>([]);

  function handleZona(z: string) {
    setZona(z as ZonaRAU);
    setSubzonas(z ? getSubzonasPorZona(z as ZonaRAU) : []);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const data = {
      name: form.get("name"),
      location: form.get("location"),
      municipality: form.get("municipality"),
      department: form.get("department"),
      area: parseFloat(form.get("area") as string),
      zona: form.get("zona"),
      subzona: form.get("subzona"),
      tipoActividad: form.get("tipoActividad"),
      produccion: form.get("produccion") || undefined,
      registrationNum: form.get("registrationNum") || undefined,
      tituloPropiedad: form.get("tituloPropiedad") || undefined,
      coordinates: form.get("coordinates") || undefined,
      description: form.get("description") || undefined,
    };

    const res = await fetch("/api/properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const json = await res.json();
      setError(json.error || "Error al guardar");
      setLoading(false);
      return;
    }

    router.push("/owner/properties");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/owner/properties">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-stone-800">Nueva Propiedad</h2>
          <p className="text-stone-500 text-sm">Registra tu predio agropecuario en el RAU</p>
        </div>
      </div>

      <Card>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información General */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-4 h-4 text-green-700" />
              </div>
              <h3 className="font-semibold text-stone-800">Información General</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Input label="Nombre del Predio" name="name" required placeholder="Ej: Hacienda La Esperanza" />
              </div>
              <div className="sm:col-span-2">
                <Input label="Ubicación / Dirección" name="location" required placeholder="Km 18 carretera Santa Cruz–Warnes" />
              </div>
              <Input label="Municipio" name="municipality" required placeholder="Ej: Warnes" />
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Departamento <span className="text-red-500">*</span>
                </label>
                <select
                  name="department"
                  required
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Seleccionar</option>
                  {DEPARTAMENTOS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Datos RAU */}
          <div>
            <h3 className="font-semibold text-stone-800 mb-4">Datos para el Cálculo RAU</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Superficie (hectáreas)" name="area" type="number" step="0.01" min="0.01" required placeholder="75.00" />
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Zona <span className="text-red-500">*</span>
                </label>
                <select
                  name="zona"
                  required
                  value={zona}
                  onChange={(e) => handleZona(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Seleccionar zona</option>
                  {ZONAS.map((z) => <option key={z.value} value={z.value}>{z.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Subzona / Sitio <span className="text-red-500">*</span>
                </label>
                <select
                  name="subzona"
                  required
                  disabled={!zona}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                >
                  <option value="">Seleccionar subzona</option>
                  {subzonas.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Tipo de Actividad <span className="text-red-500">*</span>
                </label>
                <select
                  name="tipoActividad"
                  required
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Seleccionar</option>
                  <option value="AGRICOLA_OTROS">Agrícola / Avicultura / Apicultura / Floricultura / Cunicultura / Piscicultura</option>
                  <option value="PECUARIA">Pecuaria</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <Input label="Tipo de producción" name="produccion" placeholder="Ej: Soya, Maíz, Ganadería vacuna, Apicultura..." />
              </div>
            </div>
          </div>

          {/* Datos Legales */}
          <div>
            <h3 className="font-semibold text-stone-800 mb-4">Datos Legales</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="N° Título de Propiedad" name="tituloPropiedad" placeholder="Escritura Pública N.º 245/2024" />
              <Input label="N° Registro" name="registrationNum" placeholder="REG-SCZ-2024-001" />
              <Input label="Coordenadas GPS" name="coordinates" placeholder="-17.5, -63.5" />
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-stone-700 mb-1">Descripción</label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Descripción adicional del predio..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-stone-100">
            <Button type="submit" loading={loading}>Registrar Propiedad</Button>
            <Link href="/owner/properties">
              <Button type="button" variant="outline">Cancelar</Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
