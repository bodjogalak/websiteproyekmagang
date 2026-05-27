"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Session } from "next-auth";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  LogOut,
  Shield,
  ClipboardCheck, // 👈 Import this
  CalendarDays,
  FolderCode,
  Timer
} from "lucide-react";
import { signOut } from "next-auth/react";

interface AdminSidebarProps {
  session: Session | null;
}

export default function AdminSidebar({ session }: AdminSidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/applications", label: "Permohonan", icon: FileText },
    { href: "/admin/permissions", label: "Izin & Absensi", icon: ClipboardCheck },
    { href: "/admin/breaks", label: "Izin keluar", icon: Timer },
    { href: "/admin/users", label: "Pengguna", icon: Users },
    { href: "/admin/attendance", label: "Rekap Absensi", icon: CalendarDays },
    { href: "/admin/projects", label: "Project Monitor", icon: FolderCode }, // Use FolderCode icon
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-[#1e293b] text-white h-screen shrink-0 sticky top-0">
      
      {/* Header */}
      <div className="p-6 border-b border-gray-700 flex items-center gap-3">
        <div className="bg-blue-500 p-2 rounded-lg">
            <Shield size={24} className="text-white"/>
        </div>
        <div>
            <h1 className="font-bold text-lg tracking-wide">Admin Panel</h1>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Diskominfo</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 flex-1 px-4 space-y-2">
        {menuItems.map((item) => {
          // Highlight Logic:
          // 1. Exact match (e.g. /admin/users)
          // 2. Sub-path match (e.g. /admin/users/123) BUT exclude root /admin from matching everything
          const isActive = 
            pathname === item.href || 
            (item.href !== '/admin' && pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition text-sm font-medium"
        >
          <LogOut size={18} />
          Keluar
        </button>
      </div>
    </aside>
  );
}