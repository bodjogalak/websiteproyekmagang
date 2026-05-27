import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
// Removed unused fs/promises and path imports to keep it clean
import { saveUploadedFile } from "@/lib/upload";

// GET: Fetch All Projects
export async function GET() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      members: { include: { user: { select: { id: true, name: true } } } } // Added 'id' here just to be safe for the frontend
    }
  });
  return NextResponse.json(projects);
}

// POST: Create New Project
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const existingProject = await prisma.projectMember.findFirst({
      where: { userId: parseInt(session.user.id) }
    });
    if (existingProject) {
      return NextResponse.json({ error: "Gagal: Setiap peserta hanya diizinkan memiliki 1 project." }, { status: 403 });
    }

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const repoLink = formData.get("repoLink") as string;
    const deploymentUrl = formData.get("deploymentUrl") as string;
    const memberIds = JSON.parse(formData.get("memberIds") as string || "[]");
    const file = formData.get("thumbnail") as File | null;

    let thumbnailUrl = null;
    if (file) {
        // Saves to: public/uploads/projects/
        thumbnailUrl = await saveUploadedFile(file, "projects"); 
    }

    // Prepare Members
    const membersToCreate = [{ userId: parseInt(session.user.id), role: "Leader" }];
    if (Array.isArray(memberIds)) {
      memberIds.forEach((id: number) => {
        if (id !== parseInt(session.user.id)) membersToCreate.push({ userId: id, role: "Member" });
      });
    }

    const project = await prisma.project.create({
      data: {
        title, description, repoLink, deploymentUrl, thumbnailUrl,
        visibility: "PUBLIC",
        members: { create: membersToCreate }
      }
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}

// PATCH: Ajukan Perubahan Project (Butuh Approval Admin)
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const id = formData.get("id") as string;
    
    // 1. Ambil data yang mau diedit
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const repoLink = formData.get("repoLink") as string;
    const deploymentUrl = formData.get("deploymentUrl") as string;
    const memberIds = JSON.parse(formData.get("memberIds") as string || "[]");
    const file = formData.get("thumbnail") as File | null;

    // 2. Siapkan Draf (Pending Data)
    const pendingChanges: any = { title, description, repoLink, deploymentUrl, memberIds };
    
    if (file) {
      // Simpan file sementara, tapi jangan timpa thumbnailUrl utama dulu!
      pendingChanges.newThumbnailUrl = await saveUploadedFile(file, "projects");
    }

    // 3. Simpan draf ke database, ubah status jadi PENDING
    // Kita TIDAK menimpa data asli!
    const updated = await prisma.project.update({
      where: { id },
      data: {
        editStatus: "PENDING",
        pendingData: JSON.stringify(pendingChanges) // Simpan sebagai string JSON
      }
    });

    return NextResponse.json({ success: true, message: "Perubahan diajukan dan menunggu persetujuan Admin." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to submit edit request" }, { status: 500 });
  }
}