// app/api/admin/users/[id]/assign/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  // 1. Ubah tipe data params menjadi Promise
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    // 2. Await params sebelum mengambil ID-nya (PENTING!)
    const resolvedParams = await params; 
    const userId = parseInt(resolvedParams.id);

    const { bidang, peran } = await request.json();

    if (!bidang || !peran) {
      return NextResponse.json({ error: "Bidang dan Peran harus diisi." }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        bidang: bidang as any, 
        peran: peran as any 
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Penempatan berhasil diperbarui!",
      data: updatedUser 
    });

  } catch (error) {
    console.error("Assign Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}