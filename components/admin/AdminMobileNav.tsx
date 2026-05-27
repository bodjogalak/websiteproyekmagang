"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
    Menu,
    X,
    LayoutDashboard,
    FileText,
    Users,
    LogOut,
    Shield,
    ClipboardCheck,
    CalendarDays,
    FolderCode
} from "lucide-react"; // Added ClipboardCheck
import { signOut } from "next-auth/react";
import { Session } from "next-auth";

export default function AdminMobileNav({ session }: { session: Session | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/applications", label: "Permohonan", icon: FileText },
    { href: "/admin/permissions", label: "Izin & Absensi", icon: ClipboardCheck }, // New Link
    { href: "/admin/users", label: "Pengguna", icon: Users },
    { href: "/admin/attendance", label: "Rekap Absensi", icon: CalendarDays },
    { href: "/admin/projects", label: "Project Monitor", icon: FolderCode }, // Use FolderCode icon
  ];

  return (
    <>
      {/* 1. Mobile Top Bar (Visible only on Mobile) */}
      <div className="md:hidden bg-[#1e293b] text-white p-4 flex justify-between items-center shadow-md shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-3">
           <div className="bg-blue-500 p-1.5 rounded-lg">
              <Shield size={18} className="text-white"/>
           </div>
           <h1 className="font-bold text-base tracking-wide">Admin Panel</h1>
        </div>
        {/* Hamburger Button */}
        <button onClick={() => setIsOpen(true)} className="p-2 hover:bg-white/10 rounded-lg transition">
          <Menu size={24} />
        </button>
      </div>

      {/* 2. Backdrop (Dark Overlay) */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* 3. The Drawer (Slide from Right) */}
      <div 
        className={`fixed top-0 right-0 h-full w-72 bg-[#1e293b] text-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 h-full flex flex-col">
          {/* Drawer Header */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-700">
            <h2 className="font-bold text-lg">Menu Admin</h2>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-full">
              <X size={24} />
            </button>
          </div>

          {/* Links */}
          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => {
               // Logic to highlight current page
               const isActive = pathname === item.href; 
               return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)} // Close drawer on click
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <item.icon size={18} /> {item.label}
                </Link>
               );
            })}
          </nav>

          {/* Logout */}
          <button 
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="mt-auto flex items-center justify-center gap-2 bg-red-500/10 text-red-400 py-3 rounded-xl font-bold hover:bg-red-500/20 transition"
          >
            <LogOut size={18} /> Keluar
          </button>
        </div>
      </div>
    </>
  );
}