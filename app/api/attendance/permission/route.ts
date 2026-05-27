import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    // 1. Auth Check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse Form Data
    const formData = await req.formData();
    // 👇 Using your working casting method
    const file: File | null = formData.get("file") as unknown as File; 
    
    const type = formData.get("type") as string;
    const dateStr = formData.get("date") as string;
    const reason = formData.get("reason") as string;

    if (!type || !dateStr || !reason) {
        return NextResponse.json({ error: "Mohon lengkapi semua data" }, { status: 400 });
    }

    // 3. File Upload Logic (Adapted from your working route.ts)
    let proofUrl = null;

    if (file && file.size > 0) {
        // Optional: Allow PDF AND Images (JPG/PNG)
        const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
        if (!validTypes.includes(file.type)) {
             return NextResponse.json({ error: "Hanya file PDF atau Foto (JPG/PNG) yang diperbolehkan" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Safe Filename (Timestamp_Name)
        const safeName = file.name.replace(/\s+/g, "_");
        const fileName = `${Date.now()}_${safeName}`;

        // Path (Using your working logic)
        const uploadDir = path.join(process.cwd(), "public/uploads");
        const filePath = path.join(uploadDir, fileName);

        await writeFile(filePath, buffer);
        proofUrl = `/uploads/${fileName}`;
    }

    // 4. Save to Database
    await prisma.permission.create({
      data: {
        userId: parseInt(session.user.id),
        type: type as any,
        date: new Date(dateStr),
        reason: reason,
        proofUrl: proofUrl,
        status: "PENDING"
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Permission Error:", error);
    return NextResponse.json({ error: "Gagal memproses data" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch permissions ONLY for this user
  const permissions = await prisma.permission.findMany({
    where: { userId: parseInt(session.user.id) },
    orderBy: { createdAt: 'desc' }, // Newest first
    take: 5 // Limit to last 5 requests to keep UI clean
  });

  return NextResponse.json(permissions);
}