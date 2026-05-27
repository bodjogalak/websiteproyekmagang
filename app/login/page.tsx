import { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm"; // Import komponen yang baru dibuat

// SEKARANG INI BOLEH (Karena tidak ada "use client" di file ini)
export const metadata: Metadata = {
  title: "Login Akun",
  description: "Masuk ke Portal Magang Diskominfo",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      {/* Panggil Logic Client di sini */}
      <LoginForm />
    </main>
  );
}