import { Metadata } from "next";
import RegisterForm from "@/components/auth/RegisterForm";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Daftar Akun Magang",
  description: "Registrasi akun peserta magang baru",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* 1. Navbar (Pass prop to hide 'Daftar') */}
      <Navbar hideRegisterBtn={true} />

      {/* 2. Main Content Area (MoF Style) */}
      <main className="flex-1 flex flex-col items-center justify-start pt-12 pb-12 px-4">
        
        {/* Header Section */}
        <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                Daftar Akun Magang
            </h1>
            <p className="text-gray-500">
                Lengkapi data diri untuk memulai perjalanan karirmu.
            </p>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden p-8 md:p-10">
            <RegisterForm />
        </div>

      </main>

      {/* Simple Footer */}
      <footer className="py-6 text-center text-xs text-gray-400">
        &copy; 2026 DKIPSD Provinsi Sulawesi Utara. All rights reserved.
      </footer>
    </div>
  );
}