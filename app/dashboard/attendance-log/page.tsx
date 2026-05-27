import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ExportPdfButton from "./ExportPdfButton";
import { FileText, Calendar } from "lucide-react";

export default async function AttendanceLogPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const userId = parseInt(session.user.id);

  // Fetch user details and all attendance records
  const [userData, attendance] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: { application: true }
    }),
    prisma.attendance.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    })
  ]);

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="text-[#1193b5]" /> Laporan Presensi
          </h1>
          <p className="text-gray-500 text-sm">Unduh rekap kehadiran untuk laporan magang Anda.</p>
        </div>
        
        {/* Pass data to the Client Component for PDF generation */}
        <ExportPdfButton userData={userData} attendance={attendance} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase">Tanggal</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase text-center">Masuk</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase text-center">Pulang</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {attendance.map((log) => (
                <tr key={log.id} className="text-sm">
                  <td className="px-6 py-4 font-medium text-gray-700">
                    {new Date(log.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 text-center text-gray-500">
                    {log.checkIn ? new Date(log.checkIn).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '—'}
                  </td>
                  <td className="px-6 py-4 text-center text-gray-500">
                    {log.checkOut ? new Date(log.checkOut).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '—'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-gray-100 text-gray-600 uppercase">
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}