"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { UserRole } from "@prisma/client";
import { Bell, Menu } from "lucide-react";
import Link from "next/link";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: UserRole;
  userName: string;
  userEmail: string;
  notificationCount?: number;
  pageTitle?: string;
}

export function DashboardLayout({
  children,
  role,
  userName,
  userEmail,
  notificationCount = 0,
  pageTitle,
}: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  const notifHref =
    role === "OWNER" ? "/owner/notifications" :
    role === "ACCOUNTANT" ? "/accountant/notifications" : "/admin";

  return (
    <div className="min-h-screen bg-stone-50">
      <Sidebar
        role={role}
        userName={userName}
        userEmail={userEmail}
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />

      <div
        className="transition-all duration-300"
        style={{ marginLeft: collapsed ? "64px" : "256px" }}
      >
        {/* Top Bar */}
        <header className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-lg hover:bg-stone-100 lg:hidden"
            >
              <Menu className="w-5 h-5 text-stone-600" />
            </button>
            {pageTitle && (
              <h1 className="text-lg font-semibold text-stone-800">{pageTitle}</h1>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Link href={notifHref} className="relative p-2 rounded-lg hover:bg-stone-100 transition-colors">
              <Bell className="w-5 h-5 text-stone-600" />
              {notificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              )}
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-stone-800">{userName}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
