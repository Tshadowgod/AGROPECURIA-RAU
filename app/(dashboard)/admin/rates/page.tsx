import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function RatesPage() {
  const rates = await prisma.tributaryRate.findMany({
    where: { isActive: true },
    orderBy: [{ year: "desc" }, { region: "asc" }],
  });

  const regionLabel: Record<string, string> = { ALTIPLANO: "Altiplano", VALLES: "Valles", LLANOS: "Llanos" };
  const catLabel: Record<string, string> = { PRIMERA_CLASE: "1ra Clase", SEGUNDA_CLASE: "2da Clase", TERCERA_CLASE: "3ra Clase" };
  const actLabel: Record<string, string> = { AGRICULTURA: "Agricultura", GANADERIA: "Ganadería", MIXTA: "Mixta", FORESTAL: "Forestal" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-stone-800">Tasas RAU</h2>
          <p className="text-stone-500 text-sm">Tasas tributarias vigentes para el cálculo del RAU</p>
        </div>
      </div>

      {/* Static rates table */}
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-green-700" />
              Tasas Vigentes {new Date().getFullYear()}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200">
                  <th className="text-left py-2 pr-4 text-stone-600 font-medium">Región</th>
                  <th className="text-left py-2 pr-4 text-stone-600 font-medium">Categoría</th>
                  <th className="text-right py-2 pr-4 text-stone-600 font-medium">Agricultura</th>
                  <th className="text-right py-2 pr-4 text-stone-600 font-medium">Ganadería</th>
                  <th className="text-right py-2 pr-4 text-stone-600 font-medium">Mixta</th>
                  <th className="text-right py-2 text-stone-600 font-medium">Forestal</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { region: "ALTIPLANO", cat: "PRIMERA_CLASE", a: 45, g: 22.5, m: 33.75, f: 11.25 },
                  { region: "ALTIPLANO", cat: "SEGUNDA_CLASE", a: 30, g: 15, m: 22.5, f: 7.5 },
                  { region: "ALTIPLANO", cat: "TERCERA_CLASE", a: 15, g: 7.5, m: 11.25, f: 3.75 },
                  { region: "VALLES", cat: "PRIMERA_CLASE", a: 55, g: 27.5, m: 41.25, f: 13.75 },
                  { region: "VALLES", cat: "SEGUNDA_CLASE", a: 38, g: 19, m: 28.5, f: 9.5 },
                  { region: "VALLES", cat: "TERCERA_CLASE", a: 20, g: 10, m: 15, f: 5 },
                  { region: "LLANOS", cat: "PRIMERA_CLASE", a: 50, g: 25, m: 37.5, f: 12.5 },
                  { region: "LLANOS", cat: "SEGUNDA_CLASE", a: 35, g: 17.5, m: 26.25, f: 8.75 },
                  { region: "LLANOS", cat: "TERCERA_CLASE", a: 18, g: 9, m: 13.5, f: 4.5 },
                ].map((row) => (
                  <tr key={`${row.region}-${row.cat}`} className="border-b border-stone-100 hover:bg-stone-50">
                    <td className="py-2 pr-4">
                      <span className="font-medium text-green-700">{regionLabel[row.region]}</span>
                    </td>
                    <td className="py-2 pr-4 text-stone-600">{catLabel[row.cat]}</td>
                    <td className="text-right py-2 pr-4 text-stone-700">{row.a} Bs/ha</td>
                    <td className="text-right py-2 pr-4 text-stone-700">{row.g} Bs/ha</td>
                    <td className="text-right py-2 pr-4 text-stone-700">{row.m} Bs/ha</td>
                    <td className="text-right py-2 text-stone-700">{row.f} Bs/ha</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-stone-400 mt-4">
            * Las tasas son actualizables mediante la configuración del sistema. Fuente: Normativa RAU Bolivia.
          </p>
        </CardContent>
      </Card>

      {/* DB rates */}
      {rates.length > 0 && (
        <Card noPadding>
          <div className="p-6 border-b border-stone-100">
            <h3 className="font-semibold text-stone-800">Tasas en Base de Datos</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-stone-500 uppercase">Año</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-stone-500 uppercase">Región</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-stone-500 uppercase">Categoría</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-stone-500 uppercase">Actividad</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-stone-500 uppercase">Tasa Bs/ha</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-stone-500 uppercase">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {rates.map((rate) => (
                  <tr key={rate.id} className="hover:bg-stone-50">
                    <td className="px-6 py-3 font-medium text-stone-800">{rate.year}</td>
                    <td className="px-6 py-3 text-stone-600">{regionLabel[rate.region]}</td>
                    <td className="px-6 py-3 text-stone-600">{catLabel[rate.landCategory]}</td>
                    <td className="px-6 py-3 text-stone-600">{actLabel[rate.activityType]}</td>
                    <td className="px-6 py-3 text-right font-medium text-stone-800">{rate.ratePerHa}</td>
                    <td className="px-6 py-3"><Badge variant="success">Activa</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
