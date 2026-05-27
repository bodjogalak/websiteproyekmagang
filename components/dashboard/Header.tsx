"use client";

import { Bell } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";

export default function DashboardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    // UBAH DARI z-10 MENJADI z-50
    <header className="hidden md:flex justify-between items-center bg-white h-24 px-8 shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-400 hover:text-[#1193b5] transition relative">
          <Bell size={20} />
        </button>
        <div className="h-6 w-px bg-gray-200 mx-2"></div>
        <LogoutButton />
      </div>
    </header>
  );
}