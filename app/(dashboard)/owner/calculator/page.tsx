"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calculator, Info } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface SimResult {
  ratePerHa: number;
  baseAmount: number;
  adjustments: number;
  totalAmount: number;
  dueDate: string;
  year: number;
}

export default function CalculatorPage() {
  const [form, setForm] = useState({
    region: "",
    landCategory: "",
    activityType: "",
    area: "",
  });
  const [result, setResult] = useState<SimResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCalculate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.region || !form.landCategory || !form.activityType || !form.area) return;

    setLoading(true);
    const res = await fetch("/api/calculations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        region: form.region,
        landCategory: form.landCategory,
        activityType: form.activityType,
        area: parseFloat(form.area),
        simulate: true,
      }),
    });

    const data = await res.json();
    setResult(data);
    setLoading(false);
  }

  const regionRates: Record<string, Record<string, Record<string, number>>> = {
    ALTIPLANO: {
      PRIMERA_CLASE: { AGRICULTURA: 45, GANADERIA: 22.5, MIXTA: 33.75, FORESTAL: 11.25 },
      SEGUNDA_CLASE: { AGRICULTURA: 30, GANADERIA: 15, MIXTA: 22.5, FORESTAL: 7.5 },
      TERCERA_CLASE: { AGRICULTURA: 15, GANADERIA: 7.5, MIXTA: 11.25, FORESTAL: 3.75 },
    },
    VALLES: {
      PRIMERA_CLASE: { AGRICULTURA: 55, GANADERIA: 27.5, MIXTA: 41.25, FORESTAL: 13.75 },
      SEGUNDA_CLASE: { AGRICULTURA: 38, GANADERIA: 19, MIXTA: 28.5, FORESTAL: 9.5 },
      TERCERA_CLASE: { AGRICULTURA: 20, GANADERIA: 10, MIXTA: 15, FORESTAL: 5 },
    },
    LLANOS: {
      PRIMERA_CLASE: { AGRICULTURA: 50, GANADERIA: 25, MIXTA: 37.5, FORESTAL: 12.5 },
      SEGUNDA_CLASE: { AGRICULTURA: 35, GANADERIA: 17.5, MIXTA: 26.25, FORESTAL: 8.75 },
      TERCERA_CLASE: { AGRICULTURA: 18, GANADERIA: 9, MIXTA: 13.5, FORESTAL: 4.5 },
    },
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-800">Simulador RAU</h2>
        <p className="text-stone-500 text-sm">Calcula el impuesto RAU según la normativa boliviana vigente</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-green-700" />
              Datos del Predio
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCalculate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Región"
                required
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
                options={[
                  { value: "ALTIPLANO", label: "Altiplano" },
                  { value: "VALLES", label: "Valles" },
                  { value: "LLANOS", label: "Llanos" },
                ]}
                placeholder="Seleccionar"
              />
              <Select
                label="Categoría del Suelo"
                required
                value={form.landCategory}
                onChange={(e) => setForm({ ...form, landCategory: e.target.value })}
                options={[
                  { value: "PRIMERA_CLASE", label: "Primera Clase" },
                  { value: "SEGUNDA_CLASE", label: "Segunda Clase" },
                  { value: "TERCERA_CLASE", label: "Tercera Clase" },
                ]}
                placeholder="Seleccionar"
              />
              <Select
                label="Tipo de Actividad"
                required
                value={form.activityType}
                onChange={(e) => setForm({ ...form, activityType: e.target.value })}
                options={[
                  { value: "AGRICULTURA", label: "Agricultura" },
                  { value: "GANADERIA", label: "Ganadería" },
                  { value: "MIXTA", label: "Mixta" },
                  { value: "FORESTAL", label: "Forestal" },
                ]}
                placeholder="Seleccionar"
              />
              <Input
                label="Superficie (ha)"
                type="number"
                step="0.01"
                min="0.01"
                required
                value={form.area}
                onChange={(e) => setForm({ ...form, area: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <Button type="submit" loading={loading} className="w-full">
              <Calculator className="w-4 h-4" />
              Calcular RAU
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">Resultado del Cálculo RAU {result.year}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-green-200">
                <span className="text-stone-600">Tasa por Hectárea</span>
                <span className="font-medium text-stone-800">{formatCurrency(result.ratePerHa)}/ha</span>
              </div>
              <div className="flex justify-between py-2 border-b border-green-200">
                <span className="text-stone-600">Área</span>
                <span className="font-medium text-stone-800">{form.area} ha</span>
              </div>
              <div className="flex justify-between py-2 border-b border-green-200">
                <span className="text-stone-600">Monto Base</span>
                <span className="font-medium text-stone-800">{formatCurrency(result.baseAmount)}</span>
              </div>
              <div className="flex justify-between py-3 bg-green-700 rounded-lg px-4 -mx-0">
                <span className="text-white font-semibold">Total a Pagar</span>
                <span className="text-white font-bold text-lg">{formatCurrency(result.totalAmount)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-stone-600 mt-2">
                <Info className="w-4 h-4 text-amber-500" />
                <span>Fecha de vencimiento: <strong>{formatDate(result.dueDate)}</strong></span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rate table */}
      <Card>
        <CardHeader>
          <CardTitle>Tabla de Tasas RAU 2024</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200">
                  <th className="text-left py-2 text-stone-600 font-medium">Región / Categoría</th>
                  <th className="text-right py-2 text-stone-600 font-medium">Agricultura</th>
                  <th className="text-right py-2 text-stone-600 font-medium">Ganadería</th>
                  <th className="text-right py-2 text-stone-600 font-medium">Mixta</th>
                  <th className="text-right py-2 text-stone-600 font-medium">Forestal</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(regionRates).map(([region, cats]) =>
                  Object.entries(cats).map(([cat, rates], i) => (
                    <tr key={`${region}-${cat}`} className="border-b border-stone-100">
                      <td className="py-2 text-stone-700">
                        {i === 0 && <span className="font-medium text-green-700 mr-1">{region}</span>}
                        {cat.replace("_", " ")}
                      </td>
                      <td className="text-right py-2 text-stone-700">{rates.AGRICULTURA} Bs/ha</td>
                      <td className="text-right py-2 text-stone-700">{rates.GANADERIA} Bs/ha</td>
                      <td className="text-right py-2 text-stone-700">{rates.MIXTA} Bs/ha</td>
                      <td className="text-right py-2 text-stone-700">{rates.FORESTAL} Bs/ha</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-stone-400 mt-3">* Tasas vigentes para la gestión fiscal 2024. Actualizable por el administrador.</p>
        </CardContent>
      </Card>
    </div>
  );
}
