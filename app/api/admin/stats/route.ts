import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Define "Today" (Start of day)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 2. Run all queries in parallel (Fast!)
  const [
    totalInterns,
    presentToday,
    pendingPermissions,
    pendingApplications,
    totalProjects
  ] = await prisma.$transaction([
    // A. Count Active Interns (Role = USER)
    prisma.user.count({ where: { role: "USER" } }),
    
    // B. Count Check-ins Today
    prisma.attendance.count({ 
        where: { 
            date: { gte: today },
            status: { in: ['PRESENT', 'LATE', 'LATE_EXCUSED'] }
        } 
    }),

    // C. Count Pending Permissions (Sick/Leave)
    prisma.permission.count({ where: { status: "PENDING" } }),

    // D. Count Pending Applications (New Registrants)
    prisma.application.count({ where: { status: "PENDING" } }),

    // E. Count Projects
    prisma.project.count()
  ]);

  return NextResponse.json({
    totalInterns,
    presentToday,
    pendingPermissions,
    pendingApplications,
    totalProjects
  });
}