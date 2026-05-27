"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Camera, FileText, FolderGit2, Calendar, User as UserIcon, LogOut, Menu, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

// API Call to lock/unlock menus based on accepted status
async function checkApplicationStatus() {
    try {
        const res = await fetch("/api/application/status");
        const data = await res.json();
        return data.status;
    } catch {
        return "PENDING";
    }
}

export default function DashboardWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [status, setStatus] = useState("PENDING"); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkApplicationStatus().then(setStatus);
  }, []);

  // Unlock menus if accepted OR if user is admin
  const isAccepted = status === "ACCEPTED" || session?.user?.role === "ADMIN";

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, visible: true },
    { name: "Profil Saya", href: "/dashboard/profile", icon: UserIcon, visible: true },
    { name: "Scan Presensi", href: "/dashboard/attendance", icon: Camera, visible: isAccepted },
    { name: "Laporan Presensi", href: "/dashboard/attendance-log", icon: Calendar, visible: isAccepted },
    { name: "Izin / Sakit", href: "/dashboard/permission", icon: FileText, visible: isAccepted },
    { name: "Project", href: "/dashboard/projects", icon: FolderGit2, visible: isAccepted },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      
      {/* --- 1. MOBILE OVERLAY --- */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* --- 2. THE SIDEBAR --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 flex flex-col 
        transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 
        ${isMobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
      `}>
        {/* Sidebar Branding */}
        <div className="h-16 flex items-center px-6 border-b border-gray-100 justify-between md:justify-start shrink-0">
          <div>
            <h1 className="text-xl font-bold text-[#1193b5]">Portal Magang</h1>
            <p className="text-[10px] text-gray-400">Dinas Kominfo Sulut</p>
          </div>
          {/* Mobile Close 'X' Button */}
          <button className="md:hidden text-gray-400 hover:text-gray-600 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Sidebar Menus */}
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {menuItems.filter(item => item.visible).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)} 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-[#1193b5] text-white shadow-md shadow-blue-200" 
                    : "text-gray-500 hover:bg-gray-50 hover:text-[#1193b5]"
                }`}
              >
                <item.icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-100 shrink-0">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors text-sm font-medium"
          >
            <LogOut size={20} />
            Keluar
          </button>
        </div>
      </aside>

      {/* --- 3. MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* TOP HEADER */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-8 shrink-0 z-30">
          
          <div className="flex items-center gap-4">
            {/* Hamburger Button (Mobile Only) */}
            <button 
              className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-bold text-gray-800 hidden md:block">Overview</h2>
            <h2 className="text-lg font-bold text-[#1193b5] md:hidden">Portal Magang</h2>
          </div>

          <div className="flex items-center gap-4 md:gap-6">            
            {/* User Profile Snippet (Desktop Only) */}
            <div className="hidden md:flex items-center gap-3 border-l border-gray-100 pl-6">
              <span className="text-sm font-bold text-gray-700">
                {session?.user?.name || "User"}
              </span>
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs uppercase">
                {session?.user?.name?.charAt(0) || "U"}
              </div>
            </div>

          </div>
        </header>

        {/* ACTUAL PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
        
      </div>
    </div>
  );
}