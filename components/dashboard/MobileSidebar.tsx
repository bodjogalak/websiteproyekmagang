"use client";

import Link from "next/link";
import { X, LayoutDashboard, Camera, LogOut, FileText, FolderCode } from "lucide-react";
import { signOut } from "next-auth/react";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export default function MobileSidebar({ isOpen, onClose, user }: MobileSidebarProps) {
  return (
    <>
      {/* 1. Backdrop (Dark overlay) */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* 2. The Sidebar Drawer (Right Side) */}
      <div 
        className={`fixed top-0 right-0 h-full w-64 bg-[#1193b5] text-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-bold text-lg">Menu</h2>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full">
              <X size={24} />
            </button>
          </div>

          {/* Links */}
          <nav className="flex-1 space-y-2">
            <Link 
              href="/dashboard" 
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/20 transition font-medium"
            >
              <LayoutDashboard size={20} /> Dashboard
            </Link>
            <Link 
              href="/dashboard/attendance" 
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/20 transition font-medium"
            >
              <Camera size={20} /> Scan Presensi
            </Link>
            <Link 
                href="/dashboard/permission" 
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/20 transition font-medium"
                >
                <FileText size={20} /> Izin / Sakit
            </Link>
            <Link 
                href="/dashboard/projects" 
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/20 transition font-medium"
                >
                <FolderCode size={20} /> Project
            </Link>
          </nav>

          {/* Footer (Logout) */}
          <div className="pt-4 border-t border-white/20">
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">
                 {user?.name?.[0]}
              </div>
              <div className="overflow-hidden">
                 <p className="font-bold truncate text-sm">{user?.name}</p>
                 <p className="text-xs text-blue-100">User</p>
              </div>
            </div>
            <button 
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold transition shadow-lg"
            >
              <LogOut size={18} /> Keluar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}