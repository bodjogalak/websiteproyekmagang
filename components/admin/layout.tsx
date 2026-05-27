import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; 
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar"; 
import LogoutButton from "@/components/LogoutButton"; 
import { Shield } from "lucide-react"; // <--- TAMBAHKAN INI

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Proteksi Ganda (Cek Login & Role)
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Admin */}
      <AdminSidebar session={session} />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header (Admin) */}
        <div className="md:hidden bg-[#1e293b] text-white p-4 flex justify-between items-center shadow-md shrink-0">
          <h1 className="font-bold flex items-center gap-2">
            <Shield size={18}/> Admin Panel
          </h1>
          <LogoutButton />
        </div>

        {/* Konten Utama */}
        <div className="flex-1 overflow-y-auto bg-gray-100/50">
            {children}
        </div>
      </main>
    </div>
  );
}