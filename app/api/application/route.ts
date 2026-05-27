import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveUploadedFile } from "@/lib/upload";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const formData = await req.formData();

    // 1. Files
    const cvFile = formData.get("cv") as File | null;
    const letterFile = formData.get("letter") as File | null;
    const avatarFile = formData.get("avatar") as File | null;

    // 2. Text Fields
    const fullName = formData.get("fullName") as string;
    const campus = formData.get("campus") as string;
    const phone = formData.get("phone") as string; // <--- NEW: Ambil Phone
    const faculty = formData.get("faculty") as string;
    const major = formData.get("major") as string;
    const semester = formData.get("semester") as string;
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;

    // --- A. Siapkan Data Update User ---
    const userUpdateData: any = {
        agency: campus, // Sinkronkan Instansi dengan Kampus
    };
    
    if (phone) userUpdateData.phone = phone; // Update Phone jika ada

    // Handle Avatar
    if (avatarFile && avatarFile.size > 0) {
        userUpdateData.avatarUrl = await saveUploadedFile(avatarFile, "profiles");
    }

    // EKSEKUSI UPDATE USER
    await prisma.user.update({
        where: { id: userId },
        data: userUpdateData
    });

    // --- B. Handle Documents (Application) ---
    let cvUrl = undefined;
    let letterUrl = undefined;

    if (cvFile && cvFile.size > 0) cvUrl = await saveUploadedFile(cvFile, "documents");
    if (letterFile && letterFile.size > 0) letterUrl = await saveUploadedFile(letterFile, "documents");

    // --- C. Update Application Table ---
    const application = await prisma.application.upsert({
      where: { userId: userId },
      update: {
        fullName,
        campus,
        faculty,
        major,
        semester,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        ...(cvUrl && { cvUrl }),
        ...(letterUrl && { letterUrl }),
        status: "PENDING"
      },
      create: {
        userId,
        fullName,
        campus,
        faculty,
        major,
        semester,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        cvUrl: cvUrl || "",
        letterUrl: letterUrl || "",
        status: "PENDING"
      }
    });

    return NextResponse.json({ success: true, application });

  } catch (error) {
    console.error("Application Error:", error);
    return NextResponse.json({ error: "Gagal menyimpan data" }, { status: 500 });
  }
}