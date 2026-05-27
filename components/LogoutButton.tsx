"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    // This function handles the actual logout
    // callbackUrl: "/login" -> Sends them straight to login after
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <>
      {/* 1. The Trigger Button (Visible in Sidebar/Nav) */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        title="Keluar"
      >
        <LogOut size={20} />
      </button>

      {/* 2. The Pop-up Modal (Hidden until clicked) */}
      {isOpen && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
            
          {/* Backdrop (Darkens the screen) */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)} // Click outside to close
          ></div>

          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Header */}
            <div className="bg-red-50 p-6 text-center border-b border-red-100">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                    👋
                </div>
                <h3 className="text-xl font-bold text-gray-900">Konfirmasi Keluar</h3>
                <p className="text-sm text-gray-500 mt-2">
                    Apakah anda yakin ingin mengakhiri sesi ini?
                </p>
            </div>

            {/* Actions */}
            <div className="p-4 flex gap-3 bg-gray-50">
                <button
                    onClick={() => setIsOpen(false)}
                    className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition"
                >
                    Batal
                </button>
                <button
                    onClick={handleLogout}
                    className="flex-1 px-4 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition"
                >
                    Ya, Keluar
                </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}