import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  return (
    <DashboardLayout
      role="ADMIN"
      userName={session.user.name || "Administrador"}
      userEmail={session.user.email || ""}
    >
      {children}
    </DashboardLayout>
  );
}
