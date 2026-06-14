import { redirect } from "next/navigation";
import { getStaffSession } from "@/lib/auth";
import { AdminSidebar } from "@/components/layout/admin-sidebar";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getStaffSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background md:flex">
      <AdminSidebar
        role={session.user.role}
        username={session.user.name ?? "admin"}
      />
      <main className="min-w-0 flex-1 p-6 md:p-8">{children}</main>
    </div>
  );
}
