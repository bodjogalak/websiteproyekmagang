"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Collect data manually to create a JSON object
    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload), // Send JSON
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Gagal mendaftar");

      alert("Akun berhasil dibuat! Silakan login untuk melengkapi biodata.");
      router.push("/login");
      
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Terjadi kesalahan sistem");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-left">
        
        {/* Error Alert */}
        {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 text-sm text-red-700 rounded-r">
                {error}
            </div>
        )}

        {/* Field: Nama Lengkap */}
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Nama Lengkap</label>
            <input 
                name="name" 
                type="text" 
                required 
                placeholder="Sesuai KTP / KTM" 
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#1193b5] focus:border-transparent outline-none transition" 
            />
        </div>

        {/* Row: Agency & Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Asal Kampus / Sekolah</label>
                <input 
                    name="agency" 
                    type="text" 
                    required 
                    placeholder="Nama Instansi Pendidikan" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#1193b5] focus:border-transparent outline-none transition" 
                />
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">No. WhatsApp</label>
                <input 
                    name="phone" 
                    type="tel" 
                    required 
                    placeholder="08xxxxxxxxxx" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#1193b5] focus:border-transparent outline-none transition" 
                />
            </div>
        </div>

        {/* Field: Email */}
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email Aktif</label>
            <input 
                name="email" 
                type="email" 
                required 
                placeholder="email@mahasiswa.ac.id" 
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#1193b5] focus:border-transparent outline-none transition" 
            />
        </div>

        {/* Field: Password */}
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
            <input 
                name="password" 
                type="password" 
                required 
                placeholder="Minimal 6 karakter" 
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#1193b5] focus:border-transparent outline-none transition" 
            />
        </div>

        <div className="pt-4">
            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1193b5] text-white text-lg font-bold py-4 rounded-xl hover:bg-blue-600 transition shadow-lg shadow-blue-500/30 disabled:opacity-70 flex justify-center items-center gap-2"
            >
                {isLoading && <Loader2 className="animate-spin" size={20} />}
                {isLoading ? "Memproses..." : "DAFTAR SEKARANG"}
            </button>
        </div>

        <p className="text-center text-sm text-gray-600 mt-4">
            Sudah punya akun?{" "}
            <Link href="/login" className="font-bold text-[#1193b5] hover:underline">
                Masuk di sini
            </Link>
        </p>
    </form>
  );
}