import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ApplicationTable from "@/components/admin/ApplicationTable"; // Import your component

export default async function AdminApplicationsPage() {
  const session = await getServerSession(authOptions);

  // Security Check
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Fetch Data (Server Side)
  const applications = await prisma.application.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { email: true, name: true } // Fetch email AND name
      }
    }
  });

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Daftar Permohonan Magang</h1>
        <p className="text-gray-500 text-sm">Validasi berkas calon peserta magang.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
         {/* Pass data to your component */}
         <ApplicationTable initialData={applications} />
      </div>
    </div>
  );
}