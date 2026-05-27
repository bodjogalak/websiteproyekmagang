import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { saveUploadedFile } from "@/lib/upload";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 1. Parse FormData (instead of JSON)
    const formData = await req.formData();
    const action = formData.get("action") as string;
    const reason = formData.get("reason") as string;
    const file = formData.get("file") as File | null;

    const userId = parseInt(session.user.id);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 2. Find Today's Attendance
    const attendance = await prisma.attendance.findFirst({
      where: {
        userId: userId,
        date: { gte: today }
      }
    });

    if (!attendance) {
      return NextResponse.json({ error: "Anda belum Check-in hari ini." }, { status: 400 });
    }

    // --- HANDLE START BREAK ---
    if (action === "START") {
      if (!reason) return NextResponse.json({ error: "Alasan wajib diisi." }, { status: 400 });

      let fileUrl = null;

      // 3. Handle File Upload (If exists)
      if (file) {
            // Saves to: public/uploads/attendance/
            fileUrl = await saveUploadedFile(file, "attendance");
        }

      // 4. Update DB
      await prisma.attendance.update({
        where: { id: attendance.id },
        data: { status: "ON_BREAK" }
      });

      await prisma.attendanceBreak.create({
        data: {
          attendanceId: attendance.id,
          startTime: new Date(),
          reason: reason,
          proofUrl: fileUrl // <--- Save the URL
        }
      });

      return NextResponse.json({ success: true, status: "ON_BREAK" });
    }

    // --- HANDLE END BREAK ---
    if (action === "END") {
      const activeBreak = await prisma.attendanceBreak.findFirst({
        where: { attendanceId: attendance.id, endTime: null }
      });

      if (activeBreak) {
        await prisma.attendanceBreak.update({
          where: { id: activeBreak.id },
          data: { endTime: new Date() }
        });
      }

      await prisma.attendance.update({
        where: { id: attendance.id },
        data: { status: "PRESENT" } // Back to Present
      });

      return NextResponse.json({ success: true, status: "PRESENT" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error) {
    console.error("Break API Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}