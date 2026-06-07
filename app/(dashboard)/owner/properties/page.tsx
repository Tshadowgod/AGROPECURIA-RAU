import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Plus, Eye, Pencil } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { getLandCategoryLabel, getRegionLabel, getActivityLabel } from "@/lib/rau-calculator";

export default async function PropertiesPage() {
  const session = await auth();
  const properties = await prisma.property.findMany({
    where: { ownerId: session!.user.id },
    include: { _count: { select: { rauCalcs: true, payments: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-stone-800">Mis Propiedades</h2>
          <p className="text-stone-500 text-sm">{properties.length} propiedades registradas</p>
        </div>
        <Link href="/owner/properties/new">
          <Button>
            <Plus className="w-4 h-4" />
            Nueva Propiedad
          </Button>
        </Link>
      </div>

      {properties.length === 0 ? (
        <Card className="text-center py-16">
          <MapPin className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-stone-700 mb-2">No tienes propiedades</h3>
          <p className="text-stone-500 text-sm mb-6">Registra tu primera propiedad agropecuaria</p>
          <Link href="/owner/properties/new">
            <Button>
              <Plus className="w-4 h-4" />
              Agregar Propiedad
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {properties.map((prop) => (
            <Card key={prop.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-green-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-800 text-sm">{prop.name}</h3>
                    <p className="text-xs text-stone-500">{prop.municipality}</p>
                  </div>
                </div>
                <Badge variant={prop.status === "ACTIVE" ? "success" : "warning"}>
                  {prop.status === "ACTIVE" ? "Activo" : "Inactivo"}
                </Badge>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-500">Departamento</span>
                  <span className="text-stone-700 font-medium">{prop.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Área</span>
                  <span className="text-stone-700 font-medium">{prop.area} ha</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Región</span>
                  <span className="text-stone-700 font-medium">{getRegionLabel(prop.region)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Categoría</span>
                  <span className="text-stone-700 font-medium">{getLandCategoryLabel(prop.landCategory)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Actividad</span>
                  <span className="text-stone-700 font-medium">{getActivityLabel(prop.activityType)}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-stone-100">
                <div className="flex gap-2 text-xs text-stone-500 flex-1">
                  <span>{prop._count.rauCalcs} cálculos</span>
                  <span>·</span>
                  <span>{prop._count.payments} pagos</span>
                </div>
                <div className="flex gap-1">
                  <Link href={`/owner/properties/${prop.id}`}>
                    <Button variant="ghost" size="icon">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href={`/owner/properties/${prop.id}/edit`}>
                    <Button variant="ghost" size="icon">
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
