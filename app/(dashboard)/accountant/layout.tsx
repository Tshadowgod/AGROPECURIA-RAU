import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { prisma } from "@/lib/prisma";

export default async function AccountantLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || session.user.role !== "ACCOUNTANT") redirect("/login");

  const unread = await prisma.notification.count({
    where: { userId: session.user.id, isRead: false },
  });

  return (
    <DashboardLayout
      role="ACCOUNTANT"
      userName={session.user.name || "Contador"}
      userEmail={session.user.email || ""}
      notificationCount={unread}
    >
      {children}
    </DashboardLayout>
  );
}
