
"use client";

import { useState } from "react";
import { X, Shield, User as UserIcon, RefreshCw, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function EditUserModal({ user, onClose }: { user: any; onClose: () => void }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || "",
    agency: user.agency || "",
    role: user.role || "USER",
    resetFace: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, ...formData }),
      });

      if (res.ok) {
        router.refresh(); // Refresh data in the table
        onClose();
      } else {
        alert("Gagal memperbarui data pengguna.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal Content (Slide-over) */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 p-8 flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-gray-800">Edit Profil Pengguna</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 flex-1">
          {/* User Basic Info */}
          <div className="p-4 bg-blue-50 rounded-2xl flex items-center gap-4 mb-4">
             <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#1193b5] font-bold text-lg border border-blue-100">
                {user.name?.charAt(0).toUpperCase()}
             </div>
             <div>
                <p className="font-bold text-gray-800 text-sm">{user.email}</p>
                <p className="text-xs text-gray-500">ID Pengguna: #{user.id}</p>
             </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Nama Lengkap</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Instansi / Kampus</label>
            <input 
              type="text" 
              value={formData.agency}
              onChange={(e) => setFormData({...formData, agency: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Role Akses</label>
            <div className="grid grid-cols-2 gap-2">
              <button 
                type="button"
                onClick={() => setFormData({...formData, role: 'USER'})}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition ${
                  formData.role === 'USER' ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-white text-gray-400 hover:bg-gray-50'
                }`}
              >
                <UserIcon size={14}/> USER
              </button>
              <button 
                type="button"
                onClick={() => setFormData({...formData, role: 'ADMIN'})}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition ${
                  formData.role === 'ADMIN' ? 'bg-purple-50 border-purple-400 text-purple-700' : 'bg-white text-gray-400 hover:bg-gray-50'
                }`}
              >
                <Shield size={14}/> ADMIN
              </button>
            </div>
          </div>

          {/* Biometric Reset Section */}
          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-xs font-bold text-red-500 uppercase mb-3">Keamanan & Biometrik</h4>
            <div className="p-4 rounded-2xl border border-red-100 bg-red-50/30">
              <div className="flex items-start gap-3 mb-4">
                <RefreshCw size={18} className="text-red-500 shrink-0 mt-0.5" />
                <div>
                   <p className="text-xs font-bold text-gray-800">Reset Data Wajah (Face ID)</p>
                   <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
                     Gunakan fitur ini jika wajah peserta tidak dapat dideteksi oleh kamera. Peserta wajib mendaftar ulang wajah saat login berikutnya.
                   </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setFormData({...formData, resetFace: !formData.resetFace})}
                className={`w-full py-2.5 rounded-lg text-[11px] font-bold transition border ${
                  formData.resetFace 
                  ? 'bg-red-500 text-white border-red-500 shadow-md' 
                  : 'bg-white text-red-500 border-red-200 hover:bg-red-50'
                }`}
              >
                {formData.resetFace ? "✓ Face ID Akan Direset" : "Klik untuk Reset Face ID"}
              </button>
            </div>
          </div>

          <div className="pt-6 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-3 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition"
            >
              Batal
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 py-3 bg-[#1193b5] text-white text-sm font-bold rounded-xl hover:bg-blue-600 transition shadow-lg disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={18}/> : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}