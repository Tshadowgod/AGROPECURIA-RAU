"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Download, Eye, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

const docTypeLabels: Record<string, string> = {
  CARNET_IDENTIDAD: "Carnet de Identidad",
  NIT: "NIT",
  TITULO_PROPIEDAD: "Título de Propiedad",
  CERTIFICACION: "Certificación",
  FORMULARIO_TRIBUTARIO: "Formulario Tributario",
  COMPROBANTE_PAGO: "Comprobante de Pago",
  OTRO: "Otro",
};

export default function DocumentsPage() {
  const [docs, setDocs] = useState<{
    id: string; name: string; type: string; status: string;
    createdAt: string; observations?: string; fileUrl: string; fileSize: number;
  }[]>([]);

  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch("/api/documents").then((r) => r.json()).then(setDocs).catch(() => {});
  }, []);

  const statusVariant = (s: string) => s === "APPROVED" ? "success" : s === "REJECTED" ? "danger" : "warning";
  const statusLabel = (s: string) => ({ APPROVED: "Aprobado", REJECTED: "Rechazado", PENDING: "En Revisión" }[s] || s);

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-stone-800">Mis Documentos</h2>
          <p className="text-stone-500 text-sm">{docs.length} documentos registrados</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Upload className="w-4 h-4" />
          Subir Documento
        </Button>
      </div>

      {showForm && (
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle>Nuevo Documento</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setUploading(true);
                const form = new FormData(e.currentTarget as HTMLFormElement);

                // Simulate upload - in production connect to Vercel Blob
                await new Promise((r) => setTimeout(r, 800));

                const newDoc = {
                  id: Math.random().toString(),
                  name: form.get("name") as string,
                  type: form.get("type") as string,
                  status: "PENDING",
                  createdAt: new Date().toISOString(),
                  fileUrl: "#",
                  fileSize: 102400,
                };
                setDocs([newDoc, ...docs]);
                setShowForm(false);
                setUploading(false);
              }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Nombre del Documento <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  required
                  placeholder="Ej: Carnet de Identidad - Juan Pérez"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Tipo <span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  required
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {Object.entries(docTypeLabels).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-stone-700 mb-1">Archivo</label>
                <div className="border-2 border-dashed border-stone-300 rounded-lg p-8 text-center cursor-pointer hover:border-green-400 transition-colors">
                  <Upload className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                  <p className="text-sm text-stone-500">Arrastra tu archivo aquí o haz clic para seleccionar</p>
                  <p className="text-xs text-stone-400 mt-1">PDF, JPG, PNG — máx. 10MB</p>
                  <input name="file" type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" />
                </div>
              </div>
              <div className="sm:col-span-2 flex gap-3">
                <Button type="submit" loading={uploading}>Subir Documento</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {docs.length === 0 ? (
        <Card className="text-center py-16">
          <FileText className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-stone-700 mb-2">No hay documentos</h3>
          <p className="text-stone-500 text-sm">Sube tus documentos requeridos para validación</p>
        </Card>
      ) : (
        <Card noPadding>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-stone-500 uppercase">Documento</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-stone-500 uppercase">Tipo</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-stone-500 uppercase">Fecha</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-stone-500 uppercase">Estado</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-stone-500 uppercase">Observaciones</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-stone-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {docs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-stone-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-stone-800">{doc.name}</p>
                          <p className="text-xs text-stone-400">{formatSize(doc.fileSize)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-600">{docTypeLabels[doc.type] || doc.type}</td>
                    <td className="px-6 py-4 text-sm text-stone-600">{formatDate(doc.createdAt)}</td>
                    <td className="px-6 py-4">
                      <Badge variant={statusVariant(doc.status) as "success" | "danger" | "warning"}>
                        {statusLabel(doc.status)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {doc.observations ? (
                        <div className="flex items-center gap-1 text-amber-600 text-xs">
                          <AlertCircle className="w-3 h-3" />
                          <span className="truncate max-w-[150px]">{doc.observations}</span>
                        </div>
                      ) : (
                        <span className="text-stone-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
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
