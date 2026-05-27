import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; 
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar"; 
import AdminMobileNav from "@/components/admin/AdminMobileNav"; // 👈 Import new component

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      
      {/* 1. Desktop Sidebar (Hidden on Mobile) */}
      <AdminSidebar session={session} />

      {/* 2. Mobile Navbar (Visible on Mobile) - Replaces your old static header */}
      <AdminMobileNav session={session} />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto bg-gray-100/50">
            {children}
        </div>
      </main>
    </div>
  );
}