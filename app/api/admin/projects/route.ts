import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      members: {
        include: { user: { select: { id: true, name: true } } }
      }
    }
  });
  return NextResponse.json(projects);
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, deploymentUrl, action } = await req.json();

  // AKSI 1: Setujui Perubahan
  if (action === "APPROVE_EDIT") {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project || !project.pendingData) {
      return NextResponse.json({ error: "Data draf tidak ditemukan" }, { status: 400 });
    }

    const pendingData = JSON.parse(project.pendingData);

    // Siapkan relasi anggota baru jika ada perubahan member
    let membersUpdate = {};
    if (pendingData.memberIds && Array.isArray(pendingData.memberIds)) {
      const membersToCreate = pendingData.memberIds.map((userId: number, index: number) => ({
        userId: userId,
        role: index === 0 ? "Leader" : "Member" 
      }));
      membersUpdate = {
        deleteMany: {}, // Hapus susunan member lama
        create: membersToCreate // Buat susunan member baru
      };
    }

    const updated = await prisma.project.update({
      where: { id },
      data: {
        title: pendingData.title || project.title,
        description: pendingData.description || project.description,
        repoLink: pendingData.repoLink !== undefined ? pendingData.repoLink : project.repoLink,
        deploymentUrl: pendingData.deploymentUrl !== undefined ? pendingData.deploymentUrl : project.deploymentUrl,
        ...(pendingData.newThumbnailUrl && { thumbnailUrl: pendingData.newThumbnailUrl }),
        ...(Object.keys(membersUpdate).length > 0 && { members: membersUpdate }),
        
        // Bersihkan status draf
        editStatus: "NONE",
        pendingData: null
      }
    });

    return NextResponse.json({ success: true, message: "Perubahan disetujui", data: updated });
  }

  // AKSI 2: Tolak Perubahan
  if (action === "REJECT_EDIT") {
    const rejected = await prisma.project.update({
      where: { id },
      data: {
        editStatus: "REJECTED",
        pendingData: null // Hapus draf
      }
    });
    return NextResponse.json({ success: true, message: "Perubahan ditolak", data: rejected });
  }

  // AKSI 3: Update Manual Deployment URL (Bawaan)
  if (deploymentUrl !== undefined) {
    const updated = await prisma.project.update({
      where: { id },
      data: { deploymentUrl }
    });
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "Aksi tidak valid" }, { status: 400 });
}