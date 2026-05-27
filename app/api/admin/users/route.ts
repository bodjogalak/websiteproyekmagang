import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Fetch all users for the admin table
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// PATCH: Update user details or reset Face ID
export async function PATCH(req: Request) {
  try {
    const { id, name, role, agency, resetFace } = await req.json();

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        name,
        role,
        agency,
        // If resetFace is true, we set the descriptor to null
        faceDescriptor: resetFace ? null : undefined, 
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal memperbarui pengguna" }, { status: 500 });
  }
}