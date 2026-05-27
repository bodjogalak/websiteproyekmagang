"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image"; 
import LogoutButton from "./LogoutButton"; 

// 1. Add Interface for Props
interface NavbarProps {
  hideRegisterBtn?: boolean; // Optional prop to hide "Daftar" button
}

export default function Navbar({ hideRegisterBtn = false }: NavbarProps) {
  const { data: session, status } = useSession();

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* --- BAGIAN KIRI: LOGO & BRANDING (Sesuai Desain Lama) --- */}
          <Link href="/" className="flex items-center gap-3 group">
             <div className="relative h-10 w-10 md:h-12 md:w-12 shrink-0">
                <Image 
                    src="/sulut-icon.png" 
                    alt="Logo Pemprov Sulut" 
                    fill
                    className="object-contain"
                />
             </div>
             
             {/* Teks Dinas (3 Baris) - Tampil di Tablet/PC */}
             <div className="hidden md:flex flex-col justify-center">
                <span className="text-[10px] font-bold text-gray-700 leading-tight uppercase tracking-wide group-hover:text-black">
                    Dinas Komunikasi, Informatika,
                </span>
                <span className="text-[10px] font-bold text-gray-700 leading-tight uppercase tracking-wide group-hover:text-black">
                    Persandian dan Statistik Daerah
                </span>
                <span className="text-[10px] font-bold text-[#1193b5] leading-tight uppercase tracking-wide">
                    Provinsi Sulawesi Utara
                </span>
             </div>
             
             {/* Teks Mobile (Versi Singkat untuk HP) */}
             <div className="md:hidden flex flex-col">
                <span className="text-sm font-bold text-[#1193b5]">Portal Magang</span>
                <span className="text-[10px] text-gray-500">Dinas Kominfo Sulut</span>
             </div>
          </Link>

          {/* --- BAGIAN KANAN: MENU --- */}
          <div className="flex items-center gap-5 sm:gap-5">
            
            {/* 1. STATE LOADING */}
            {status === "loading" && (
                <div className="w-24 h-8 bg-gray-100 animate-pulse rounded-full"></div>
            )}

            {/* 2. STATE GUEST (Belum Login) */}
            {status === "unauthenticated" && (
              <div className="flex items-center gap-3">
                <Link 
                    href="/login" 
                    className="text-sm font-semibold text-gray-600 hover:text-[#1193b5] transition"
                >
                  Masuk
                </Link>
                
                {/* LOGIC: Hanya tampilkan tombol Daftar jika hideRegisterBtn === false */}
                {!hideRegisterBtn && (
                    <Link 
                        href="/register" 
                        className="bg-[#1193b5] hover:bg-[#0e7a96] text-white text-sm font-bold px-6 py-2.5 rounded-full shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5"
                    >
                      Daftar
                    </Link>
                )}
              </div>
            )}

            {/* 3. STATE SUDAH LOGIN (User & Admin) */}
            {status === "authenticated" && (
              <div className="flex items-center gap-4">
                {/* Info User Kecil */}
                <div className="text-right mr-1"> 
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider hidden sm:block">
                        {session.user?.role === "ADMIN" ? "Administrator" : "Peserta"}
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-gray-800 leading-none">
                        <span className="sm:hidden font-normal text-gray-500 mr-1">Hi,</span> 
                        {session.user?.name?.split(" ")[0]}
                    </p>
                </div>
                
                {/* Tombol Dashboard/Panel */}
                <Link 
                  href={session.user?.role === "ADMIN" ? "/admin" : "/dashboard"}
                  className="bg-gray-50 text-[#1193b5] px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#1193b5] hover:text-white border border-[#1193b5]/30 transition"
                >
                  {session.user?.role === "ADMIN" ? "Panel Admin" : "Dashboard"}
                </Link>

                <LogoutButton />
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}