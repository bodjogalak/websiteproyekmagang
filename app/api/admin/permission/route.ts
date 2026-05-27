import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 1. GET: Fetch all permissions (Newest first)
export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const permissions = await prisma.permission.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { name: true, agency: true } 
      }
    }
  });

  return NextResponse.json(permissions);
}

// 2. PATCH: Approve or Reject
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, status } = body; 

  if (!id || !status) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const updated = await prisma.permission.update({
    where: { id: Number(id) },
    data: { status: status }
  });

  return NextResponse.json({ success: true, data: updated });
}