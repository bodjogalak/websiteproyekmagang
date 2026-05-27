import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ status: "PENDING" });

  const application = await prisma.application.findUnique({
    where: { userId: parseInt(session.user.id) },
    select: { status: true }
  });

  // If no application yet, treat as PENDING
  return NextResponse.json({ status: application?.status || "PENDING" });
}