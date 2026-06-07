"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Search, ToggleLeft, ToggleRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface User {
  id: string; name: string; email: string; role: string;
  phone?: string; ci?: string; isActive: boolean; createdAt: string;
  _count: { properties: number };
}

const roleLabels: Record<string, string> = { OWNER: "Propietario", ACCOUNTANT: "Contador", ADMIN: "Administrador" };
const roleVariant = (r: string) => r === "ADMIN" ? "danger" : r === "ACCOUNTANT" ? "info" : "success";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = roleFilter !== "ALL" ? `?role=${roleFilter}` : "";
    fetch(`/api/users${params}`)
      .then((r) => r.json())
      .then((data) => { setUsers(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [roleFilter]);

  async function toggleActive(id: string, isActive: boolean) {
    const res = await fetch("/api/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: !isActive }),
    });
    if (res.ok) {
      setUsers(users.map((u) => u.id === id ? { ...u, isActive: !isActive } : u));
    }
  }

  const filtered = users.filter(
    (u) => u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-800">Gestión de Usuarios</h2>
        <p className="text-stone-500 text-sm">{users.length} usuarios registrados</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o correo..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div className="flex gap-2">
          {["ALL", "OWNER", "ACCOUNTANT", "ADMIN"].map((r) => (
            <Button
              key={r}
              variant={roleFilter === r ? "primary" : "outline"}
              size="sm"
              onClick={() => setRoleFilter(r)}
            >
              {r === "ALL" ? "Todos" : roleLabels[r]}
            </Button>
          ))}
        </div>
      </div>

      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-stone-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-stone-500 uppercase">Usuario</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-stone-500 uppercase">Rol</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-stone-500 uppercase">CI</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-stone-500 uppercase">Propiedades</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-stone-500 uppercase">Registro</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-stone-500 uppercase">Estado</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-stone-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-stone-400">Cargando...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-stone-400">No hay usuarios</td></tr>
              ) : (
                filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-stone-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{user.name[0]}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-stone-800">{user.name}</p>
                          <p className="text-xs text-stone-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={roleVariant(user.role) as "success" | "info" | "danger"}>
                        {roleLabels[user.role]}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-600">{user.ci || "—"}</td>
                    <td className="px-6 py-4 text-sm text-stone-600">{user._count.properties}</td>
                    <td className="px-6 py-4 text-sm text-stone-600">{formatDate(user.createdAt)}</td>
                    <td className="px-6 py-4">
                      <Badge variant={user.isActive ? "success" : "danger"}>
                        {user.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleActive(user.id, user.isActive)}
                        title={user.isActive ? "Desactivar" : "Activar"}
                      >
                        {user.isActive
                          ? <ToggleRight className="w-5 h-5 text-green-600" />
                          : <ToggleLeft className="w-5 h-5 text-stone-400" />
                        }
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
