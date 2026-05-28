"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Email atau password salah");
      setIsLoading(false);
    } else {
      const session = await getSession();

      if (session?.user?.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
      
      router.refresh();
    }
  };

  return (
    // Gunakan h-screen dan overflow-hidden untuk memaksa tidak ada scroll di level root
    // (Scroll akan muncul otomatis di sisi kanan jika kontennya benar-benar panjang di HP)
    <div className="flex h-screen w-full overflow-hidden">
      
      {/* LEFT SIDE - Branding (Tetap sama, tapi padding dikurangi dikit biar aman) */}
      <div className="hidden lg:flex w-1/2 bg-linear-to-br from-blue-600 to-blue-800 flex-col justify-between p-10 text-white relative">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full translate-x-1/3 translate-y-1/3"></div>

        <div className="z-10 mt-10">
          <h1 className="text-3xl xl:text-4xl font-bold mb-4 leading-tight">
              Portal Magang <br /> Inspektorat, <br /> Daerah <br /> Provinsi Sulawesi Utara
            </h1>
          <p className="text-blue-100 text-base xl:text-lg max-w-md">
            Sistem informasi berbasis web untuk mengelola proses pendaftaran, seleksi, dan administrasi magang secara digital.
          </p>
        </div>

        <div className="z-10 text-xs xl:text-sm text-blue-200">
          &copy; 2026 Inspektorat Daerah Sulut. All rights reserved.
        </div>
      </div>

      {/* RIGHT SIDE - The Form */}
      {/* Tambahkan 'overflow-y-auto' agar kalau layar user kependekan, cuma bagian ini yang scroll */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-4 overflow-y-auto">
        
        {/* Kurangi padding card dari p-10 jadi p-8 */}
        <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-2xl shadow-xl">
          
          {/* HEADER SECTION */}
          {/* Kurangi margin bottom dari mb-8 jadi mb-2 */}
          <div className="text-center mb-2">
            <Link href="/" className="inline-block transition-opacity hover:opacity-80">
                <Image
                    src="/sulut-icon.png"
                    alt="Portal Magang Logo"
                    width={120} // Perkecil sedikit logo biar hemat tempat
                    height={28}
                    className="mx-auto"
                    priority
                />
            </Link>

            <h2 className="text-2xl font-bold text-gray-900 mt-4 tracking-tight">
              Log In Akun
            </h2>
            <p className="mt-1 text-sm text-gray-600">
               Silakan masuk untuk melanjutkan
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Form spacing dikurangi dari space-y-6 jadi space-y-5 */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email atau No. Handphone
              </label>
              <input
                type="email"
                name="email"
                placeholder="example@email.com"
                required
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-blue-500 focus:ring-blue-500 focus:outline-none transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                required
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-blue-500 focus:ring-blue-500 focus:outline-none transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">
                  Ingat Saya
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Lupa password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              name="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-white font-bold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Memproses..." : "MASUK SEKARANG"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 pt-2">
            Belum punya akun?{" "}
            <Link href="/register" className="font-bold text-blue-600 hover:text-blue-500 hover:underline">
              Daftar Magang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}