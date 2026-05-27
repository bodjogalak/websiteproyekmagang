import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Cari data absensi hari ini
  const attendance = await prisma.attendance.findFirst({
    where: {
      userId: parseInt(session.user.id),
      date: { gte: today }
    },
    include: {
      breaks: {
        where: { endTime: null } // Cek jika ada istirahat aktif
      }
    }
  });

  // 1. Jika belum ada data sama sekali -> ABSENT
  if (!attendance) {
    return NextResponse.json({ status: "ABSENT" });
  }

  // 2. [FIX] Jika sudah ada jam pulang -> CHECKED_OUT
  if (attendance.checkOut) {
    return NextResponse.json({ status: "CHECKED_OUT" });
  }

  // 3. Jika sedang istirahat (break aktif) -> ON_BREAK
  if (attendance.breaks.length > 0) {
    return NextResponse.json({ status: "ON_BREAK" });
  }

  // 4. Sisanya gunakan status asli (PRESENT / LATE / dll)
  return NextResponse.json({ status: attendance.status });
}