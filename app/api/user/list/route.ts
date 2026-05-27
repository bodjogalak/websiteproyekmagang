import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth"; // Import this
import { authOptions } from "@/lib/auth";     // Import this

export async function GET() {
  const session = await getServerSession(authOptions);
  
  // Fetch users BUT exclude the person requesting the list
  const users = await prisma.user.findMany({
    where: { 
      role: "USER",
      id: { not: parseInt(session?.user?.id || "0") },
      application: { status: "ACCEPTED" }
    },
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  });
  
  return NextResponse.json(users);
}