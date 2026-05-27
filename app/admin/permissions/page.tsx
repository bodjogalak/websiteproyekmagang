"use client";

import { useEffect, useState } from "react";
import { Check, X, Clock, Eye } from "lucide-react";
import ViewPdfButton from "@/components/ViewPdfButton"; 

type Permission = {
  id: number;
  type: string;
  date: string;
  reason: string;
  proofUrl: string | null;
  status: string;
  user: {
    name: string;
    agency: string;
  };
};

export default function AdminPermissionsPage() {
  const [data, setData] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Data
  const fetchPermissions = async () => {
    const res = await fetch("/api/admin/permission");
    if (res.ok) {
        const json = await res.json();
        setData(json);
    }
    setLoading(false);
  };

  useEffect(() => { fetchPermissions(); }, []);

  // 2. Handle Action (Approve/Reject)
  const handleAction = async (id: number, newStatus: "APPROVED" | "REJECTED") => {
    if (!confirm(`Yakin ingin mengubah status menjadi ${newStatus}?`)) return;

    // Optimistic Update (Update UI immediately)
    setData(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));

    const res = await fetch("/api/admin/permission", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus })
    });

    if (!res.ok) fetchPermissions(); // Revert if failed
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Izin & Sakit</h1>
        <p className="text-gray-500 text-sm">Validasi alasan ketidakhadiran peserta.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase tracking-wider text-xs">
              <tr>
                <th className="p-4">Peserta</th>
                <th className="p-4">Tanggal / Tipe</th>
                <th className="p-4">Alasan</th>
                <th className="p-4">Bukti</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                 <tr><td colSpan={6} className="p-8 text-center text-gray-400">Loading data...</td></tr>
              ) : data.length === 0 ? (
                 <tr><td colSpan={6} className="p-8 text-center text-gray-400">Belum ada pengajuan izin.</td></tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition">
                    
                    {/* User Info */}
                    <td className="p-4">
                      <p className="font-bold text-gray-800">{item.user.name}</p>
                      <p className="text-xs text-gray-400">{item.user.agency}</p>
                    </td>

                    {/* Date & Type */}
                    <td className="p-4">
                      <p className="font-medium text-gray-700">
                        {new Date(item.date).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded mt-1 inline-block ${
                        item.type === 'SICK' ? 'bg-red-100 text-red-600' : 
                        item.type === 'LATE_ARRIVAL' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {item.type === 'SICK' ? 'SAKIT' : item.type === 'LATE_ARRIVAL' ? 'TERLAMBAT' : 'IZIN'}
                      </span>
                    </td>

                    {/* Reason */}
                    <td className="p-4 max-w-xs">
                      <p className="text-gray-600 truncate" title={item.reason}>{item.reason}</p>
                    </td>

                    {/* Proof File */}
                    <td className="p-4">
                      {item.proofUrl ? (
                        <ViewPdfButton 
                            url={item.proofUrl} 
                            label="Lihat Bukti" 
                            fileName={`Bukti-${item.user.name}`} 
                        />
                      ) : (
                        <span className="text-gray-300 italic text-xs">Tidak ada file</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="p-4">
                      {item.status === 'PENDING' && (
                        <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full text-xs font-bold w-fit">
                          <Clock size={12} /> Menunggu
                        </span>
                      )}
                      {item.status === 'APPROVED' && (
                        <span className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-bold w-fit">
                          <Check size={12} /> Disetujui
                        </span>
                      )}
                      {item.status === 'REJECTED' && (
                        <span className="flex items-center gap-1 text-red-600 bg-red-50 px-3 py-1 rounded-full text-xs font-bold w-fit">
                          <X size={12} /> Ditolak
                        </span>
                      )}
                    </td>

                    {/* Action Buttons */}
                    <td className="p-4 text-right">
                      {item.status === 'PENDING' && (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleAction(item.id, "REJECTED")}
                            className="p-2 bg-white border border-gray-200 text-red-500 hover:bg-red-50 rounded-lg transition shadow-sm"
                            title="Tolak"
                          >
                            <X size={16} />
                          </button>
                          <button 
                            onClick={() => handleAction(item.id, "APPROVED")}
                            className="p-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition shadow-md shadow-blue-200"
                            title="Setujui"
                          >
                            <Check size={16} />
                          </button>
                        </div>
                      )}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}