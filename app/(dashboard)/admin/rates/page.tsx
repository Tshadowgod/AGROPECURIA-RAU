import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calculator, Info } from "lucide-react";
import { TABLA_RAU_2024, ZONAS_LABEL } from "@/lib/rau-calculator";

export default function RatesPage() {
  const zonas = ["ALTIPLANO_PUNA", "VALLES", "SUBTROPICAL", "TROPICAL"] as const;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-800">Tabla de Tasas RAU 2026</h2>
        <p className="text-stone-500 text-sm">
          Cuotas fijas por hectárea — Anexo II DS 24463 actualizado por RND
        </p>
      </div>

      {/* Fórmula */}
      <div className="bg-green-700 text-white rounded-xl p-4 flex items-start gap-3">
        <Calculator className="w-6 h-6 text-amber-300 flex-shrink-0 mt-0.5" />
        <div className="space-y-1 text-sm">
          <p className="font-bold text-base">RAU = Hectáreas × Cuota Fija por Hectárea (Bs.)</p>
          <p className="text-green-200">Vencimiento: <strong className="text-white">31 de octubre</strong> de cada gestión — Formulario 701 V.3</p>
          <p className="text-green-200">Actualización de tasas: hasta el <strong className="text-white">30 de septiembre</strong> de cada año mediante RND</p>
        </div>
      </div>

      {/* Tabla por zona */}
      {zonas.map((zona) => {
        const rows = TABLA_RAU_2024.filter((r) => r.zona === zona);
        return (
          <Card key={zona} noPadding>
            <div className={`px-6 py-3 border-b border-stone-100 ${
              zona === "ALTIPLANO_PUNA" ? "bg-blue-50" :
              zona === "VALLES" ? "bg-green-50" :
              zona === "SUBTROPICAL" ? "bg-amber-50" : "bg-teal-50"
            }`}>
              <h3 className="font-bold text-stone-800">{ZONAS_LABEL[zona]}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-stone-50">
                  <tr>
                    <th className="text-left px-6 py-2 text-xs font-medium text-stone-500 uppercase">Subzona / Sitio</th>
                    <th className="text-center px-4 py-2 text-xs font-medium text-stone-500 uppercase">Mín ha</th>
                    <th className="text-center px-4 py-2 text-xs font-medium text-stone-500 uppercase">Máx ha</th>
                    <th className="text-right px-4 py-2 text-xs font-medium text-green-700 uppercase">Agrícola / Otros Bs/ha</th>
                    <th className="text-right px-4 py-2 text-xs font-medium text-amber-700 uppercase">Pecuaria Bs/ha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {rows.map((row) => (
                    <tr key={row.subzona} className="hover:bg-stone-50">
                      <td className="px-6 py-2.5 text-stone-700">{row.subzonaLabel}</td>
                      <td className="px-4 py-2.5 text-center text-stone-600">{row.agricolaMin}</td>
                      <td className="px-4 py-2.5 text-center text-stone-600">{row.agricolaMax}</td>
                      <td className="px-4 py-2.5 text-right font-bold text-green-700">{row.tasaAgricola.toFixed(2)}</td>
                      <td className="px-4 py-2.5 text-right font-bold text-amber-700">
                        {row.tasaPecuaria > 0 ? row.tasaPecuaria.toFixed(2) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        );
      })}

      {/* Multas */}
      <Card>
        <CardHeader>
          <CardTitle>Multas por Incumplimiento de Deberes Formales (RAU)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200">
                  <th className="text-left py-2 text-stone-600 font-medium">Incumplimiento</th>
                  <th className="text-right py-2 text-stone-600 font-medium">Sanción</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["No inscripción en el Régimen Tributario", "Clausura hasta regularizar"],
                  ["No exhibir NIT con leyenda 'NO EMITE FACTURA'", "200 UFV"],
                  ["No tener el último formulario de liquidación y pago", "300 UFV"],
                  ["Obtener Certificado de No Imponibilidad fuera de plazo", "50 UFV"],
                  ["No actualizar datos en el Registro de Contribuyentes", "1.000 UFV"],
                  ["No entregar documentación requerida por la AT", "1.500 UFV"],
                  ["Entrega parcial de información requerida", "1.000 UFV"],
                  ["No presentar Form. 701 en la forma y plazos establecidos", "50 UFV"],
                ].map(([inc, sancion]) => (
                  <tr key={inc} className="border-b border-stone-100">
                    <td className="py-2 text-stone-700">{inc}</td>
                    <td className="py-2 text-right font-bold text-red-600">{sancion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* No Imponibilidad */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2 text-blue-800">
              <Info className="w-5 h-5" />
              Certificado de No Imponibilidad RAU
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <p className="font-semibold text-blue-700 mb-1">Formulario</p>
              <p className="text-stone-700">280 V.3</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <p className="font-semibold text-blue-700 mb-1">Plazo</p>
              <p className="text-stone-700">1 al 31 de octubre</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <p className="font-semibold text-blue-700 mb-1">Costo</p>
              <p className="text-stone-700">Gratuito</p>
            </div>
          </div>
          <p className="text-blue-700 text-xs mt-3">
            Los propietarios cuya superficie esté por debajo del límite mínimo de su zona/subzona deben tramitar este certificado anualmente ante el SIN (www.impuestos.gob.bo).
          </p>
        </CardContent>
      </Card>

      {/* Donde pagar */}
      <Card>
        <CardHeader>
          <CardTitle>Entidades Financieras Autorizadas para el Pago</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {[
              "Banco Unión S.A.", "Banco Nacional de Bolivia", "Banco Mercantil Santa Cruz",
              "Banco Solidario S.A.", "Banco BISA S.A.", "La Primera EFV",
              "Banco de la Comunidad", "Coop. San Martín", "Banco Ecofuturo",
              "Banco Fie S.A.", "Banco de Crédito", "Banco Prodem",
              "Banco Fortaleza", "Banco Fassil", "Banco Ganadero",
            ].map((banco) => (
              <div key={banco} className="bg-stone-50 rounded-lg px-3 py-2 text-xs text-stone-700 text-center border border-stone-200">
                {banco}
              </div>
            ))}
          </div>
          <p className="text-xs text-stone-400 mt-3">Presentar el Formulario 701 V.3 impreso en cualquiera de estas entidades.</p>
        </CardContent>
      </Card>
    </div>
  );
}
