import { PrismaClient } from "@prisma/client";
import BreakTable from "./BreakTable";

const prisma = new PrismaClient();

export default async function AdminBreaksPage() {
  // Fetch from the AttendanceBreak model
  const breaks = await prisma.attendanceBreak.findMany({
    include: {
      attendance: {
        include: {
          user: {
            include: { application: true },
          },
        },
      },
    },
    orderBy: {
      startTime: "desc",
    },
  });

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Izin Keluar</h1>
        <p className="text-gray-500 text-sm mt-1">
          Validasi alasan keluar sementara (break) pada jam kerja peserta.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <BreakTable data={breaks} />
      </div>
    </div>
  );
}