import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

// 1. Define valid folder names strictly based on your requirements
type UploadFolder = "attendance" | "documents" | "projects" | "profiles";

/**
 * Saves a file to the specified subfolder in public/uploads
 * @param file The File object from FormData
 * @param folder The target subfolder 
 * @returns The public URL path (e.g., '/uploads/projects/my-file.jpg')
 */

export async function saveUploadedFile(file: File, folder: UploadFolder): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filename = `${Date.now()}-${file.name.replace(/\s/g, "_")}`;
  
  const uploadDir = join(process.cwd(), "public", "uploads", folder);
  await mkdir(uploadDir, { recursive: true });
  await writeFile(join(uploadDir, filename), buffer);

  return `/uploads/${folder}/${filename}`;
}