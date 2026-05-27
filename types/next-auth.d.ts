// types/next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  // Memperluas tipe Session
  interface Session {
    user: {
      id: string;
      role: string; // Tambahkan ini agar TypeScript tidak error
    } & DefaultSession["user"];
  }

  // Memperluas tipe User (jika diperlukan)
  interface User {
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    id: string;
  }
}