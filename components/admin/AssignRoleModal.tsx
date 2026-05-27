'use client';

import { useState } from 'react';
import { Loader2, X, Briefcase } from 'lucide-react';

// Tipe data untuk prop
interface AssignRoleModalProps {
  user: { id: number; name: string; bidang: string; peran: string };
  onClose: () => void;
  onSuccess: () => void;
}

export default function AssignRoleModal({ user, onClose, onSuccess }: AssignRoleModalProps) {
  const [bidang, setBidang] = useState(user.bidang || 'UNASSIGNED');
  const [peran, setPeran] = useState(user.peran || 'UNASSIGNED');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`/api/admin/users/${user.id}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bidang, peran })
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        onSuccess(); // Refresh tabel admin
        onClose();   // Tutup modal
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Gagal menghubungi server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 overflow-hidden">
        
        {/* Header Modal */}
        <div className="bg-[#1193b5] p-4 flex justify-between items-center text-white">
          <h3 className="font-bold flex items-center gap-2">
            <Briefcase size={20} /> Penempatan Magang
          </h3>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <p className="text-sm text-gray-600 mb-6">
            Tentukan penempatan administratif dan peran operasional untuk <strong className="text-gray-900">{user.name}</strong>.
          </p>

          <div className="space-y-4">
            {/* Dropdown 1: Bidang Administratif */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bidang Dinas (Administratif)</label>
              <select 
                value={bidang}
                onChange={(e) => setBidang(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#1193b5] outline-none text-sm"
              >
                <option value="UNASSIGNED" disabled>-- Pilih Bidang --</option>
                <option value="E_GOVERNMENT">Penyelenggaraan E-Government</option>
                <option value="IKP">Informasi & Komunikasi Publik (IKP)</option>
                <option value="PERSANDIAN">Persandian & Keamanan Informasi</option>
                <option value="SEKRETARIAT">Sekretariat</option>
              </select>
            </div>

            {/* Dropdown 2: Peran Magang */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Peran Operasional (Teknis)</label>
              <select 
                value={peran}
                onChange={(e) => setPeran(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#1193b5] outline-none text-sm"
              >
                <option value="UNASSIGNED" disabled>-- Pilih Peran Teknis --</option>
                <option value="PROGRAMMER">Programmer (Web)</option>
                <option value="MULTIMEDIA">Multimedia (Desain / Konten)</option>
                <option value="CYBER_SECURITY">Keamanan Siber (IT Security)</option>
                <option value="ADMINISTRASI">Administrasi & Operasional</option>
              </select>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="mt-8 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition"
            >
              Batal
            </button>
            <button 
              type="submit" 
              disabled={isLoading || bidang === 'UNASSIGNED' || peran === 'UNASSIGNED'}
              className="flex-1 py-2.5 bg-[#1193b5] text-white font-bold rounded-lg hover:bg-blue-600 disabled:opacity-50 flex justify-center items-center gap-2 transition"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : "Simpan Penempatan"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}