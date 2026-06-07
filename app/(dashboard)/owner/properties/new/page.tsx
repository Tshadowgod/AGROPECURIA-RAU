"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin } from "lucide-react";
import Link from "next/link";

export default function NewPropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      landCategory: form.get("landCategory"),
      region: form.get("region"),
      activityType: form.get("activityType"),
      registrationNum: form.get("registrationNum") || undefined,
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

  const departments = [
    "La Paz", "Cochabamba", "Santa Cruz", "Oruro", "Potosí",
    "Tarija", "Chuquisaca", "Beni", "Pando",
  ].map((d) => ({ value: d, label: d }));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/owner/properties">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-stone-800">Nueva Propiedad</h2>
          <p className="text-stone-500 text-sm">Registra tu predio agropecuario</p>
        </div>
      </div>

      <Card>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
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
                <Input label="Ubicación / Dirección" name="location" required placeholder="Camino vecinal km 15" />
              </div>
              <Input label="Municipio" name="municipality" required placeholder="Ej: Warnes" />
              <Select
                label="Departamento"
                name="department"
                required
                options={departments}
                placeholder="Seleccionar"
              />
            </div>
          </div>

          {/* Technical Data */}
          <div>
            <h3 className="font-semibold text-stone-800 mb-4">Datos Técnicos para RAU</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Superficie (hectáreas)"
                name="area"
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
              />
              <Select
                label="Región"
                name="region"
                required
                options={[
                  { value: "ALTIPLANO", label: "Altiplano" },
                  { value: "VALLES", label: "Valles" },
                  { value: "LLANOS", label: "Llanos" },
                ]}
                placeholder="Seleccionar región"
              />
              <Select
                label="Categoría del Suelo"
                name="landCategory"
                required
                options={[
                  { value: "PRIMERA_CLASE", label: "Primera Clase" },
                  { value: "SEGUNDA_CLASE", label: "Segunda Clase" },
                  { value: "TERCERA_CLASE", label: "Tercera Clase" },
                ]}
                placeholder="Seleccionar categoría"
              />
              <Select
                label="Tipo de Actividad"
                name="activityType"
                required
                options={[
                  { value: "AGRICULTURA", label: "Agricultura" },
                  { value: "GANADERIA", label: "Ganadería" },
                  { value: "MIXTA", label: "Mixta" },
                  { value: "FORESTAL", label: "Forestal" },
                ]}
                placeholder="Seleccionar actividad"
              />
            </div>
          </div>

          {/* Optional */}
          <div>
            <h3 className="font-semibold text-stone-800 mb-4">Datos Adicionales</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Número de Registro"
                name="registrationNum"
                placeholder="Ej: REG-2024-001"
              />
              <Input
                label="Coordenadas GPS"
                name="coordinates"
                placeholder="-17.5, -63.5"
              />
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-stone-700 mb-1">Descripción</label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Descripción adicional del predio..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-stone-100">
            <Button type="submit" loading={loading}>
              Registrar Propiedad
            </Button>
            <Link href="/owner/properties">
              <Button type="button" variant="outline">Cancelar</Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
