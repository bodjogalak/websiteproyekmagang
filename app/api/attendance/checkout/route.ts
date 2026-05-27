import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OFFICE_LOCATION, MAX_DISTANCE_METERS, calculateDistance } from "@/utils/location";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { lat, lng } = await req.json();
    if (!lat || !lng) return NextResponse.json({ error: "Lokasi tidak terdeteksi." }, { status: 400 });

    // Use the shared utility
    const distance = calculateDistance(lat, lng, OFFICE_LOCATION.lat, OFFICE_LOCATION.lng);
    if (distance > MAX_DISTANCE_METERS) {
      return NextResponse.json({ error: `Anda di luar jangkauan kantor (${Math.round(distance)}m).` }, { status: 400 });
    }

    const userId = parseInt(session.user.id);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.findFirst({
      where: { userId, date: { gte: today } }
    });

    if (!attendance) return NextResponse.json({ error: "Anda belum absen masuk hari ini." }, { status: 400 });
    if (attendance.checkOut) return NextResponse.json({ error: "Anda sudah absen pulang sebelumnya." }, { status: 400 });

    const now = new Date();
    let newStatus = attendance.status;
    if (now.getHours() < 16) newStatus = "EARLY_LEAVE";

    await prisma.attendance.update({
      where: { id: attendance.id },
      data: { checkOut: now, status: newStatus }
    });

    return NextResponse.json({ success: true, status: "CHECKED_OUT" });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}