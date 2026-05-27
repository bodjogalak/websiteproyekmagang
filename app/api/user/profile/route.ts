import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveUploadedFile } from "@/lib/upload"; // Assuming you have this helper

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: parseInt(session.user.id) },
    include: { application: true }
  });
  return NextResponse.json(user);
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const userId = parseInt(session.user.id);

    // Extract Text Fields
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const campus = formData.get("campus") as string;
    const faculty = formData.get("faculty") as string;
    const major = formData.get("major") as string;
    const semester = formData.get("semester") as string;
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;
    
    // Handle Avatar File
    const avatarFile = formData.get("avatar") as File | null;
    let avatarUrl = undefined;
    
    if (avatarFile && avatarFile.size > 0) {
      avatarUrl = await saveUploadedFile(avatarFile, "profiles");
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        phone,
        agency: campus,
        avatarUrl, // Updates only if a new file was provided
        application: {
          update: {
            fullName: name,
            campus,
            faculty,
            major,
            semester,
            startDate: startDate ? new Date(startDate) : null,
            endDate: endDate ? new Date(endDate) : null,
          }
        }
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}