import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 1. GET: Admin fetches ALL applications
export async function GET() {
  const session = await getServerSession(authOptions);
  
  // Security: Only Admin
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const applications = await prisma.application.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { email: true, name: true }
      }
    }
  });

  return NextResponse.json(applications);
}

// 2. PATCH: Admin updates status (Accept/Reject)
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, status } = body; 

  if (!id || !status) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const updated = await prisma.application.update({
    where: { id: Number(id) },
    data: { status }
  });

  return NextResponse.json(updated);
}