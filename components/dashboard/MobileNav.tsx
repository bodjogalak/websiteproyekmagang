"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, LayoutDashboard, Camera, User, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function MobileNav({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Scan Presensi", href: "/dashboard/attendance", icon: Camera },
  ];

  return (
    <div className="md:hidden bg-[#1193b5] text-white sticky top-0 z-50 shadow-md">
      {/* 1. Top Bar */}
      <div className="flex items-center justify-between p-4">
        <h1 className="font-bold text-lg tracking-tight">Portal Magang</h1>
        <button onClick={() => setIsOpen(!isOpen)} className="p-1 rounded-md hover:bg-white/20">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* 2. Slide-down Menu (Overlay) */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-[#0e7a96] border-t border-white/10 shadow-xl flex flex-col p-4 space-y-3 animate-in slide-in-from-top-2">
          
          {/* Menu Items */}
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsOpen(false)} // Close on click
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition"
            >
              <item.icon size={20} />
              {item.name}
            </Link>
          ))}

          <hr className="border-white/10 my-2" />

          {/* Profile Section */}
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                  {user?.name?.[0] || "U"}
               </div>
               <div className="text-sm">
                  <p className="font-bold">{user?.name?.split(" ")[0]}</p>
                  <p className="text-xs text-blue-200">Peserta Magang</p>
               </div>
            </div>
            <button 
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-red-200 hover:text-white"
            >
              <LogOut size={20} />
            </button>
          </div>

        </div>
      )}
    </div>
  );
}