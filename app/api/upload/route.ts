import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const data = await req.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
    }

    // Validasi Tipe File (Harus PDF)
    if (file.type !== "application/pdf") {
      return NextResponse.json({ message: "Hanya file PDF yang diperbolehkan" }, { status: 400 });
    }

    // Convert file ke Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Buat nama file unik (timestamp_namafile)
    // Ganti spasi dengan underscore biar aman di URL
    const safeName = file.name.replace(/\s+/g, "_");
    const fileName = `${Date.now()}_${safeName}`;
    
    // Simpan di folder public/uploads
    // Pastikan folder 'public/uploads' sudah dibuat manual atau otomatis
    const uploadDir = path.join(process.cwd(), "public/uploads");
    const filePath = path.join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    // Return URL file-nya
    const fileUrl = `/uploads/${fileName}`;

    return NextResponse.json({ url: fileUrl, message: "Upload berhasil" });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ message: "Gagal mengupload file" }, { status: 500 });
  }
}