import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { prisma } from "@/lib/prisma";

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || session.user.role !== "OWNER") redirect("/login");

  const unread = await prisma.notification.count({
    where: { userId: session.user.id, isRead: false },
  });

  return (
    <DashboardLayout
      role="OWNER"
      userName={session.user.name || "Propietario"}
      userEmail={session.user.email || ""}
      notificationCount={unread}
    >
      {children}
    </DashboardLayout>
  );
}
