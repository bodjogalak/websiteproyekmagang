import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json(); // Back to JSON
    const { name, email, password, phone, agency } = body;

    if (!email || !password || !name || !phone || !agency) {
      return NextResponse.json({ error: "Semua data wajib diisi" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 400 });
    }

    const hashedPassword = await hash(password, 10);

    // Create User ONLY (No avatar yet)
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        agency,
        role: "USER"
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: "Gagal mendaftar" }, { status: 500 });
  }
}