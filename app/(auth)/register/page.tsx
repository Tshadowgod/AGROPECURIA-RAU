"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const data = {
      name: form.get("name"),
      email: form.get("email"),
      password: form.get("password"),
      role: form.get("role"),
      phone: form.get("phone"),
      ci: form.get("ci"),
    };

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Error al registrar");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/login"), 2000);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">R</span>
            </div>
            <div className="text-left">
              <p className="text-white font-bold text-xl">RAU Bolivia</p>
              <p className="text-green-300 text-sm">Gestión Agropecuaria</p>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">Crear Cuenta</h1>
          <p className="text-green-300 text-sm mt-1">Regístrate en el sistema RAU</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-6 text-sm">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              Cuenta creada exitosamente. Redirigiendo...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Input label="Nombre Completo" name="name" type="text" required placeholder="Ej: Juan Pérez García" />
              </div>
              <div className="col-span-2">
                <Input label="Correo Electrónico" name="email" type="email" required placeholder="tu@correo.com" />
              </div>
              <Input label="Contraseña" name="password" type="password" required placeholder="Mínimo 6 caracteres" />
              <Input label="Carnet de Identidad" name="ci" type="text" placeholder="12345678" />
              <Input label="Teléfono" name="phone" type="tel" placeholder="+591 7XXXXXXX" />
              <Select
                label="Tipo de Usuario"
                name="role"
                required
                options={[
                  { value: "OWNER", label: "Propietario" },
                  { value: "ACCOUNTANT", label: "Contador" },
                ]}
                placeholder="Seleccionar rol"
              />
            </div>

            <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
              Crear Cuenta
            </Button>
          </form>

          <p className="text-center text-sm text-stone-500 mt-6">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-green-700 font-medium hover:underline">
              Iniciar Sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
