// app/admin/users/page.tsx
import { prisma } from "@/lib/prisma";
import UserTableClient from "@/components/admin/UserTableClient";

export const dynamic = 'force-dynamic'; // Memastikan data selalu segar saat direfresh

export default async function AdminUsersPage() {
  // Fetch data di sisi server
  const users = await prisma.user.findMany({
    include: { application: { select: { status: true } } },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Pengguna</h1>
        <p className="text-gray-500 text-sm mt-1">Kelola akun, penempatan divisi, dan hak akses seluruh peserta magang serta admin.</p>
      </div>

      {/* Kirim data ke komponen Client */}
      <UserTableClient initialUsers={users} />
    </div>
  );
}