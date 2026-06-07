"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle, XCircle, Eye } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Doc {
  id: string;
  name: string;
  type: string;
  status: string;
  createdAt: string;
  owner: { name: string };
  property?: { name: string } | null;
}

const docTypeLabels: Record<string, string> = {
  CARNET_IDENTIDAD: "Carnet de Identidad",
  NIT: "NIT",
  TITULO_PROPIEDAD: "Título de Propiedad",
  CERTIFICACION: "Certificación",
  FORMULARIO_TRIBUTARIO: "Formulario Tributario",
  COMPROBANTE_PAGO: "Comprobante de Pago",
  OTRO: "Otro",
};

export default function ValidationsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [filter, setFilter] = useState<"PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const [obs, setObs] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch(`/api/documents?status=${filter}`)
      .then((r) => r.json())
      .then((data) => setDocs(Array.isArray(data) ? data : []))
      .catch(() => setDocs([]));
  }, [filter]);

  async function updateStatus(id: string, status: "APPROVED" | "REJECTED") {
    const res = await fetch(`/api/documents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, observations: obs[id] || undefined }),
    });
    if (res.ok) {
      setDocs(docs.filter((d) => d.id !== id));
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-800">Validación de Documentos</h2>
        <p className="text-stone-500 text-sm">Revisa y aprueba los documentos de tus clientes</p>
      </div>

      <div className="flex gap-2">
        {(["PENDING", "APPROVED", "REJECTED"] as const).map((s) => (
          <Button
            key={s}
            variant={filter === s ? "primary" : "outline"}
            size="sm"
            onClick={() => setFilter(s)}
          >
            {s === "PENDING" ? "Pendientes" : s === "APPROVED" ? "Aprobados" : "Rechazados"}
          </Button>
        ))}
      </div>

      {docs.length === 0 ? (
        <Card className="text-center py-16">
          <CheckCircle className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-stone-700 mb-2">No hay documentos {filter === "PENDING" ? "pendientes" : filter === "APPROVED" ? "aprobados" : "rechazados"}</h3>
        </Card>
      ) : (
        <div className="space-y-4">
          {docs.map((doc) => (
            <Card key={doc.id}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-semibold text-stone-800">{doc.name}</p>
                    <Badge variant="info">{docTypeLabels[doc.type] || doc.type}</Badge>
                  </div>
                  <p className="text-sm text-stone-500">
                    Cliente: <strong>{doc.owner.name}</strong>
                    {doc.property && <> · Predio: <strong>{doc.property.name}</strong></>}
                    · {formatDate(doc.createdAt)}
                  </p>

                  {filter === "PENDING" && (
                    <div className="mt-3 space-y-3">
                      <textarea
                        placeholder="Observaciones (opcional)"
                        value={obs[doc.id] || ""}
                        onChange={(e) => setObs({ ...obs, [doc.id]: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(doc.id, "_blank")}
                        >
                          <Eye className="w-4 h-4" />
                          Ver
                        </Button>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => updateStatus(doc.id, "APPROVED")}
                        >
                          <CheckCircle className="w-4 h-4" />
                          Aprobar
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => updateStatus(doc.id, "REJECTED")}
                        >
                          <XCircle className="w-4 h-4" />
                          Rechazar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
