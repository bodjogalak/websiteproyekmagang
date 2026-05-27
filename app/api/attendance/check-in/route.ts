import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OFFICE_LOCATION, MAX_DISTANCE_METERS, calculateDistance } from "@/utils/location";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const { lat, lng } = await request.json();

    if (!lat || !lng) return NextResponse.json({ success: false, error: "Location missing" }, { status: 400 });
    
    // Use the shared utility
    const distance = calculateDistance(lat, lng, OFFICE_LOCATION.lat, OFFICE_LOCATION.lng);
    if (distance > MAX_DISTANCE_METERS) {
      return NextResponse.json({ 
        success: false, 
        error: `Too far from office! (${Math.round(distance)}m)` 
      }, { status: 403 });
    }

    // ... (rest of your existing logic for check-in)
    const now = new Date();
    const isLate = now.getHours() > 8 || (now.getHours() === 8 && now.getMinutes() > 15);
    const today = new Date();
    today.setHours(0,0,0,0);

    const permit = await prisma.permission.findFirst({
      where: { userId, date: { gte: today }, type: "LATE_ARRIVAL", status: "APPROVED" }
    });

    let status = "PRESENT";
    if (isLate) status = permit ? "LATE_EXCUSED" : "LATE";

    const existing = await prisma.attendance.findFirst({
        where: { userId, date: { gte: today } }
    });

    if (existing) return NextResponse.json({ success: false, error: "Already checked in today!" }, { status: 400 });

    const attendance = await prisma.attendance.create({
      data: { userId, checkIn: now, status: status as any, permissionId: permit?.id }
    });

    return NextResponse.json({ success: true, data: attendance });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
  }
}