"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { UserCheck, Plus, X } from "lucide-react";

interface User { id: string; name: string; email: string; }
interface Assignment {
  id: string; ownerId: string; accountantId: string; isActive: boolean;
  owner: { name: string; email: string };
  accountant: { name: string; email: string };
}

export default function AssignmentsPage() {
  const [owners, setOwners] = useState<User[]>([]);
  const [accountants, setAccountants] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [form, setForm] = useState({ ownerId: "", accountantId: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/users?role=OWNER").then((r) => r.json()),
      fetch("/api/users?role=ACCOUNTANT").then((r) => r.json()),
      fetch("/api/assignments").then((r) => r.json()),
    ]).then(([o, a, asgn]) => {
      setOwners(Array.isArray(o) ? o : []);
      setAccountants(Array.isArray(a) ? a : []);
      setAssignments(Array.isArray(asgn) ? asgn : []);
    });
  }, []);

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const newAssignment = await res.json();
      setAssignments([newAssignment, ...assignments]);
      setForm({ ownerId: "", accountantId: "" });
    }
    setLoading(false);
  }

  async function removeAssignment(id: string) {
    const res = await fetch(`/api/assignments/${id}`, { method: "DELETE" });
    if (res.ok) {
      setAssignments(assignments.filter((a) => a.id !== id));
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-800">Asignaciones</h2>
        <p className="text-stone-500 text-sm">Asigna contadores a propietarios</p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Nueva Asignación</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAssign} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <Select
              label="Propietario"
              required
              value={form.ownerId}
              onChange={(e) => setForm({ ...form, ownerId: e.target.value })}
              options={owners.map((o) => ({ value: o.id, label: o.name }))}
              placeholder="Seleccionar propietario"
            />
            <Select
              label="Contador"
              required
              value={form.accountantId}
              onChange={(e) => setForm({ ...form, accountantId: e.target.value })}
              options={accountants.map((a) => ({ value: a.id, label: a.name }))}
              placeholder="Seleccionar contador"
            />
            <Button type="submit" loading={loading}>
              <Plus className="w-4 h-4" />
              Asignar
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Assignments list */}
      <Card noPadding>
        <div className="p-6 border-b border-stone-100">
          <h3 className="font-semibold text-stone-800">Asignaciones Activas</h3>
        </div>
        <div className="divide-y divide-stone-100">
          {assignments.length === 0 ? (
            <div className="text-center py-12 text-stone-400">
              <UserCheck className="w-10 h-10 mx-auto mb-3" />
              <p className="text-sm">No hay asignaciones</p>
            </div>
          ) : (
            assignments.map((a) => (
              <div key={a.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-xs text-stone-500 mb-0.5">Propietario</p>
                    <p className="text-sm font-medium text-stone-800">{a.owner.name}</p>
                    <p className="text-xs text-stone-400">{a.owner.email}</p>
                  </div>
                  <div className="text-stone-400">→</div>
                  <div>
                    <p className="text-xs text-stone-500 mb-0.5">Contador</p>
                    <p className="text-sm font-medium text-stone-800">{a.accountant.name}</p>
                    <p className="text-xs text-stone-400">{a.accountant.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={a.isActive ? "success" : "default"}>
                    {a.isActive ? "Activa" : "Inactiva"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAssignment(a.id)}
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
