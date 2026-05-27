import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse Query Params (e.g. ?date=2024-02-10)
  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get("date");

  let whereClause: any = {};

  if (dateStr) {
    // Filter by specific date (ignoring time)
    const start = new Date(dateStr);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(dateStr);
    end.setHours(23, 59, 59, 999);

    whereClause.date = {
      gte: start,
      lte: end
    };
  }

  const attendance = await prisma.attendance.findMany({
    where: whereClause,
    orderBy: { checkIn: 'desc' }, // Newest first
    include: {
      user: {
        select: { name: true, agency: true }
      }
    }
  });

  return NextResponse.json(attendance);
}