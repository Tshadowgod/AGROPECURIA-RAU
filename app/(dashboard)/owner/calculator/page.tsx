"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  TABLA_RAU_2024, ZONAS_LABEL, ACTIVIDAD_LABEL,
  calcularRAU, getSubzonasPorZona,
  type ZonaRAU, type SubzonaRAU, type TipoActividadRAU, type ResultadoRAU,
} from "@/lib/rau-calculator";

const ZONAS = (Object.keys(ZONAS_LABEL) as ZonaRAU[]).map((z) => ({ value: z, label: ZONAS_LABEL[z] }));

export default function CalculatorPage() {
  const [zona, setZona] = useState<ZonaRAU | "">("");
  const [subzona, setSubzona] = useState<SubzonaRAU | "">("");
  const [actividad, setActividad] = useState<TipoActividadRAU | "">("");
  const [hectareas, setHectareas] = useState("");
  const [gestion, setGestion] = useState(new Date().getFullYear().toString());
  const [resultado, setResultado] = useState<ResultadoRAU | null>(null);
  const [loading, setLoading] = useState(false);

  const subzonas = zona ? getSubzonasPorZona(zona) : [];

  function handleZonaChange(z: string) {
    setZona(z as ZonaRAU);
    setSubzona("");
    setResultado(null);
  }

  function calcular(e: React.FormEvent) {
    e.preventDefault();
    if (!subzona || !actividad || !hectareas) return;
    setLoading(true);
    try {
      const res = calcularRAU(subzona as SubzonaRAU, actividad as TipoActividadRAU, parseFloat(hectareas), parseInt(gestion));
      setResultado(res);
    } catch {}
    setLoading(false);
  }

  // Obtener rango de la subzona seleccionada para mostrar en UI
  const tasaRow = subzona ? TABLA_RAU_2024.find((r) => r.subzona === subzona) : null;
  const minHa = tasaRow && actividad
    ? actividad === "AGRICOLA_OTROS" ? tasaRow.agricolaMin : tasaRow.pecuariaMin
    : null;
  const maxHa = tasaRow && actividad
    ? actividad === "AGRICOLA_OTROS" ? tasaRow.agricolaMax : tasaRow.pecuariaMax
    : null;
  const tasa = tasaRow && actividad
    ? actividad === "AGRICOLA_OTROS" ? tasaRow.tasaAgricola : tasaRow.tasaPecuaria
    : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-800">Simulador RAU</h2>
        <p className="text-stone-500 text-sm">
          Cálculo oficial según DS 24463 — Tabla de Cuotas Fijas por Hectárea Gestión {gestion}
        </p>
      </div>

      {/* Fórmula */}
      <div className="bg-green-700 text-white rounded-xl p-4 flex items-center gap-3">
        <Calculator className="w-6 h-6 text-amber-300 flex-shrink-0" />
        <div>
          <p className="font-bold">Fórmula RAU = Hectáreas × Cuota Fija por Hectárea</p>
          <p className="text-green-200 text-xs mt-0.5">Vencimiento anual: 31 de octubre — Formulario 701 V.3</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos del Predio</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={calcular} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Gestión */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Gestión Fiscal <span className="text-red-500">*</span>
                </label>
                <select
                  value={gestion}
                  onChange={(e) => setGestion(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {[2024, 2023, 2022].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              {/* Zona */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Zona <span className="text-red-500">*</span>
                </label>
                <select
                  value={zona}
                  onChange={(e) => handleZonaChange(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Seleccionar zona</option>
                  {ZONAS.map((z) => (
                    <option key={z.value} value={z.value}>{z.label}</option>
                  ))}
                </select>
              </div>

              {/* Subzona */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Subzona / Sitio <span className="text-red-500">*</span>
                </label>
                <select
                  value={subzona}
                  onChange={(e) => { setSubzona(e.target.value as SubzonaRAU); setResultado(null); }}
                  required
                  disabled={!zona}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                >
                  <option value="">Seleccionar subzona</option>
                  {subzonas.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              {/* Actividad */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Tipo de Actividad <span className="text-red-500">*</span>
                </label>
                <select
                  value={actividad}
                  onChange={(e) => { setActividad(e.target.value as TipoActividadRAU); setResultado(null); }}
                  required
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Seleccionar actividad</option>
                  <option value="AGRICOLA_OTROS">Agrícola / Avicultura / Apicultura / Floricultura / Cunicultura / Piscicultura</option>
                  <option value="PECUARIA">Pecuaria</option>
                </select>
              </div>

              {/* Hectáreas */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Superficie (hectáreas) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={hectareas}
                    onChange={(e) => { setHectareas(e.target.value); setResultado(null); }}
                    required
                    placeholder="Ej: 75.00"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  {tasa !== null && minHa !== null && maxHa !== null && (
                    <p className="text-xs text-stone-400 mt-1">
                      Rango para esta subzona/actividad: <strong>{minHa}</strong> ha min — <strong>{maxHa}</strong> ha máx · Tasa: <strong>Bs. {tasa}/ha</strong>
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full" size="lg">
              <Calculator className="w-4 h-4" />
              Calcular RAU
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Resultado */}
      {resultado && (
        <div>
          {resultado.esNoImponible ? (
            <Card className="border-blue-200 bg-blue-50">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Info className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-blue-800 text-lg">NO IMPONIBLE</h3>
                  <p className="text-blue-700 text-sm mt-1">{resultado.mensaje}</p>
                  <div className="mt-3 bg-blue-100 rounded-lg p-3 text-sm text-blue-700">
                    <strong>Trámite:</strong> Certificado de No Imponibilidad RAU — Formulario 280 V.3<br />
                    <strong>Plazo:</strong> 1 al 31 de octubre de cada gestión<br />
                    <strong>Costo:</strong> Gratuito (SIN — www.impuestos.gob.bo)
                  </div>
                </div>
              </div>
            </Card>
          ) : resultado.superaMaximo ? (
            <Card className="border-red-200 bg-red-50">
              <div className="flex gap-4">
                <XCircle className="w-10 h-10 text-red-500 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-red-800 text-lg">EXCEDE LÍMITE RAU</h3>
                  <p className="text-red-700 text-sm mt-1">{resultado.mensaje}</p>
                  <p className="text-red-600 text-xs mt-2">Debe inscribirse en el Régimen General de tributación del SIN.</p>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="border-green-300 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Resultado RAU — Gestión {resultado.gestion}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  {[
                    ["Zona / Subzona", resultado.subzonaLabel],
                    ["Actividad", ACTIVIDAD_LABEL[resultado.tipoActividad]],
                    ["Superficie declarada", `${resultado.hectareas} ha`],
                    ["Rango permitido", `${resultado.minHa} — ${resultado.maxHa} ha`],
                    ["Tasa por hectárea", `Bs. ${resultado.tasa.toFixed(2)}/ha`],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between py-2 border-b border-green-200">
                      <span className="text-sm text-stone-600">{k}</span>
                      <span className="text-sm font-medium text-stone-800">{v}</span>
                    </div>
                  ))}
                </div>

                {/* Total destacado */}
                <div className="bg-green-700 text-white rounded-xl px-5 py-4 flex justify-between items-center mb-4">
                  <div>
                    <p className="text-green-200 text-xs">TOTAL A PAGAR</p>
                    <p className="font-bold text-2xl">{formatCurrency(resultado.montoTotal)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-200 text-xs">VENCIMIENTO</p>
                    <p className="font-bold">{formatDate(resultado.vencimiento)}</p>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
                  <strong>Formulario requerido:</strong> {resultado.formulario}<br />
                  <strong>Pago en:</strong> Cualquier entidad financiera autorizada (Banco Unión, BNB, Mercantil Santa Cruz, BISA, etc.)<br />
                  <strong>Plazo:</strong> Del 1 al 31 de octubre de {resultado.gestion}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Tabla oficial completa */}
      <Card>
        <CardHeader>
          <CardTitle>Tabla Oficial de Cuotas — Gestión 2024</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-green-700 text-white">
                  <th className="text-left px-3 py-2 font-medium">Zona</th>
                  <th className="text-left px-3 py-2 font-medium">Subzona / Sitio</th>
                  <th className="text-center px-3 py-2 font-medium">Min ha</th>
                  <th className="text-center px-3 py-2 font-medium">Máx ha</th>
                  <th className="text-right px-3 py-2 font-medium">Agrícola/Otros Bs/ha</th>
                  <th className="text-right px-3 py-2 font-medium">Pecuaria Bs/ha</th>
                </tr>
              </thead>
              <tbody>
                {TABLA_RAU_2024.map((row, i) => (
                  <tr key={i} className={`border-b border-stone-100 ${i % 2 === 0 ? "bg-white" : "bg-stone-50"} hover:bg-green-50`}>
                    <td className="px-3 py-1.5 font-medium text-green-700">{ZONAS_LABEL[row.zona]}</td>
                    <td className="px-3 py-1.5 text-stone-700">{row.subzonaLabel}</td>
                    <td className="px-3 py-1.5 text-center text-stone-600">{row.agricolaMin}</td>
                    <td className="px-3 py-1.5 text-center text-stone-600">{row.agricolaMax}</td>
                    <td className="px-3 py-1.5 text-right font-medium text-stone-800">{row.tasaAgricola.toFixed(2)}</td>
                    <td className="px-3 py-1.5 text-right font-medium text-stone-800">
                      {row.tasaPecuaria > 0 ? row.tasaPecuaria.toFixed(2) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-stone-400 mt-3">
            Fuente: Anexo II — DS 24463 actualizado por RND. Las cuotas se actualizan hasta el 30 de septiembre de cada año.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
