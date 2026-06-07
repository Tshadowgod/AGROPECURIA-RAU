"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, MapPin, Calculator, CreditCard, FileText,
  Bell, BarChart3, Users, Settings, LogOut, ChevronLeft,
  Building2, Shield, ClipboardCheck, Calendar
} from "lucide-react";
import { UserRole } from "@prisma/client";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const ownerNav: NavItem[] = [
  { label: "Panel Principal", href: "/owner", icon: LayoutDashboard },
  { label: "Mis Propiedades", href: "/owner/properties", icon: MapPin },
  { label: "Simulador RAU", href: "/owner/calculator", icon: Calculator },
  { label: "Pagos", href: "/owner/payments", icon: CreditCard },
  { label: "Documentos", href: "/owner/documents", icon: FileText },
  { label: "Reportes", href: "/owner/reports", icon: BarChart3 },
  { label: "Notificaciones", href: "/owner/notifications", icon: Bell },
];

const accountantNav: NavItem[] = [
  { label: "Panel Principal", href: "/accountant", icon: LayoutDashboard },
  { label: "Mis Clientes", href: "/accountant/clients", icon: Users },
  { label: "Validaciones", href: "/accountant/validations", icon: ClipboardCheck },
  { label: "Calendario", href: "/accountant/calendar", icon: Calendar },
  { label: "Reportes", href: "/accountant/reports", icon: BarChart3 },
  { label: "Configuración", href: "/accountant/settings", icon: Settings },
];

const adminNav: NavItem[] = [
  { label: "Panel Principal", href: "/admin", icon: LayoutDashboard },
  { label: "Usuarios", href: "/admin/users", icon: Users },
  { label: "Tasas RAU", href: "/admin/rates", icon: Calculator },
  { label: "Asignaciones", href: "/admin/assignments", icon: Building2 },
  { label: "Seguridad", href: "/admin/security", icon: Shield },
  { label: "Configuración", href: "/admin/settings", icon: Settings },
];

const navByRole: Record<UserRole, NavItem[]> = {
  OWNER: ownerNav,
  ACCOUNTANT: accountantNav,
  ADMIN: adminNav,
};

const roleLabel: Record<UserRole, string> = {
  OWNER: "Propietario",
  ACCOUNTANT: "Contador",
  ADMIN: "Administrador",
};

interface SidebarProps {
  role: UserRole;
  userName: string;
  userEmail: string;
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ role, userName, userEmail, collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const nav = navByRole[role];

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full bg-green-900 text-white flex flex-col z-40 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-green-800">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <div>
              <p className="font-bold text-sm leading-tight">RAU Bolivia</p>
              <p className="text-xs text-green-300">{roleLabel[role]}</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-sm">R</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-1 rounded-lg hover:bg-green-800 transition-colors ml-auto"
        >
          <ChevronLeft className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {nav.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" + role.toLowerCase() && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all duration-150",
                isActive
                  ? "bg-amber-500 text-white"
                  : "text-green-200 hover:bg-green-800 hover:text-white",
                collapsed && "justify-center"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User info & logout */}
      <div className="border-t border-green-800 p-4">
        {!collapsed && (
          <div className="mb-3">
            <p className="text-sm font-medium truncate">{userName}</p>
            <p className="text-xs text-green-300 truncate">{userEmail}</p>
          </div>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className={cn(
            "flex items-center gap-2 text-green-300 hover:text-white transition-colors text-sm w-full",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  );
}
