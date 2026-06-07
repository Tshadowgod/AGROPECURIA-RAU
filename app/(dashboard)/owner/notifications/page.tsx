"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCheck, CreditCard, FileText, AlertTriangle, Info } from "lucide-react";
import { formatDate } from "@/lib/utils";

const notifIcons: Record<string, React.ElementType> = {
  VENCIMIENTO: AlertTriangle,
  PAGO: CreditCard,
  VALIDACION: FileText,
  OBSERVACION: Info,
  SISTEMA: Bell,
};

const notifColors: Record<string, string> = {
  VENCIMIENTO: "bg-red-100 text-red-600",
  PAGO: "bg-green-100 text-green-600",
  VALIDACION: "bg-blue-100 text-blue-600",
  OBSERVACION: "bg-amber-100 text-amber-600",
  SISTEMA: "bg-stone-100 text-stone-600",
};

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<{
    id: string; type: string; title: string; message: string;
    isRead: boolean; createdAt: string;
  }[]>([]);

  useEffect(() => {
    fetch("/api/notifications").then((r) => r.json()).then(setNotifs).catch(() => {});
  }, []);

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });
    setNotifs(notifs.map((n) => ({ ...n, isRead: true })));
  }

  const unread = notifs.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-stone-800">Notificaciones</h2>
          <p className="text-stone-500 text-sm">{unread} sin leer</p>
        </div>
        {unread > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <CheckCheck className="w-4 h-4" />
            Marcar todas como leídas
          </Button>
        )}
      </div>

      {notifs.length === 0 ? (
        <Card className="text-center py-16">
          <Bell className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-stone-700 mb-2">No hay notificaciones</h3>
          <p className="text-stone-500 text-sm">Estás al día con todas tus obligaciones</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifs.map((notif) => {
            const Icon = notifIcons[notif.type] || Bell;
            const color = notifColors[notif.type] || "bg-stone-100 text-stone-600";
            return (
              <div
                key={notif.id}
                className={`bg-white rounded-xl border p-4 flex gap-4 transition-colors ${
                  notif.isRead ? "border-stone-200 opacity-75" : "border-green-200 shadow-sm"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-stone-800">{notif.title}</p>
                    {!notif.isRead && <Badge variant="success">Nueva</Badge>}
                  </div>
                  <p className="text-sm text-stone-600">{notif.message}</p>
                  <p className="text-xs text-stone-400 mt-2">{formatDate(notif.createdAt)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
