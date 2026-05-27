"use client";

import { useState, useEffect } from "react";
import { Calendar, FileText, Upload, AlertCircle, CheckCircle2, Loader2, Clock, X } from "lucide-react";
import { useRouter } from "next/navigation";

// Define the shape of our data
type PermissionHistory = {
  id: number;
  type: string;
  date: string;
  reason: string;
  status: string;
};

export default function PermissionPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  
  // 1. New State for History
  const [history, setHistory] = useState<PermissionHistory[]>([]);

  // 2. Fetch History Function
  const fetchHistory = async () => {
    const res = await fetch("/api/attendance/permission");
    if (res.ok) {
      const data = await res.json();
      setHistory(data);
    }
  };

  // Load history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0].name);
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setStatus(null);

    const formData = new FormData(e.currentTarget);
    
    try {
      const res = await fetch("/api/attendance/permission", { method: "POST", body: formData });
      const json = await res.json();

      if (res.ok) {
        setStatus({ type: 'success', msg: "Permohonan berhasil dikirim!" });
        (e.target as HTMLFormElement).reset(); 
        setSelectedFile(null);
        fetchHistory(); // 3. Refresh list immediately after submit
        router.refresh(); 
      } else {
        setStatus({ type: 'error', msg: json.error || "Gagal mengirim permohonan." });
      }
    } catch (err) {
      setStatus({ type: 'error', msg: "Terjadi kesalahan jaringan." });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      {/* LEFT COLUMN: The Form */}
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="text-[#1193b5]" />
            Formulir Izin
          </h1>
          <p className="text-gray-500 text-sm">Ajukan permohonan jika berhalangan hadir.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {status && (
            <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${
              status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <p className="text-sm font-medium">{status.msg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tipe Izin */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Jenis Izin</label>
                <div className="grid grid-cols-3 gap-2">
                <label className="cursor-pointer">
                    <input type="radio" name="type" value="SICK" className="peer sr-only" required />
                    <div className="p-3 rounded-lg border text-center text-sm hover:bg-gray-50 peer-checked:border-red-400 peer-checked:bg-red-50 peer-checked:text-red-700 transition-all">🤒 Sakit</div>
                </label>
                <label className="cursor-pointer">
                    <input type="radio" name="type" value="FULL_DAY_PERMIT" className="peer sr-only" required />
                    <div className="p-3 rounded-lg border text-center text-sm hover:bg-gray-50 peer-checked:border-blue-400 peer-checked:bg-blue-50 peer-checked:text-blue-700 transition-all">📨 Izin</div>
                </label>
                <label className="cursor-pointer">
                    <input type="radio" name="type" value="LATE_ARRIVAL" className="peer sr-only" required />
                    <div className="p-3 rounded-lg border text-center text-sm hover:bg-gray-50 peer-checked:border-yellow-400 peer-checked:bg-yellow-50 peer-checked:text-yellow-700 transition-all">⏰ Telat</div>
                </label>
                </div>
            </div>

            {/* Tanggal */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Tanggal</label>
                <div className="relative">
                <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
                <input type="date" name="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-100" required />
                </div>
            </div>

            {/* Alasan */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Alasan</label>
                <textarea name="reason" rows={3} placeholder="Jelaskan alasan..." className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-100 resize-none" required></textarea>
            </div>

            {/* File Upload */}
            <div className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer relative hover:bg-gray-50 transition ${selectedFile ? 'border-blue-400 bg-blue-50' : 'border-gray-200'}`}>
                <input type="file" name="file" accept="image/*,.pdf" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                {selectedFile ? (
                    <p className="text-sm text-blue-600 font-bold truncate">{selectedFile}</p>
                ) : (
                    <div className="flex flex-col items-center gap-1 text-gray-400">
                        <Upload size={24} />
                        <span className="text-xs">Upload Bukti (Opsional)</span>
                    </div>
                )}
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-[#1193b5] text-white font-bold py-3 rounded-xl shadow-lg hover:bg-blue-600 transition disabled:opacity-70 flex items-center justify-center gap-2">
                {isLoading ? <Loader2 className="animate-spin" /> : "Kirim"}
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT COLUMN: History List */}
      <div className="mt-8 lg:mt-0">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800">Riwayat Pengajuan</h2>
          <p className="text-gray-500 text-sm">Status permohonan Anda sebelumnya.</p>
        </div>

        <div className="space-y-4">
          {history.length === 0 ? (
             <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-400">
                <FileText className="mx-auto mb-2 opacity-20" size={48} />
                <p>Belum ada riwayat.</p>
             </div>
          ) : (
             history.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                item.type === 'SICK' ? 'bg-red-100 text-red-600' : 
                                item.type === 'LATE_ARRIVAL' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-600'
                            }`}>
                                {item.type === 'SICK' ? 'SAKIT' : item.type === 'LATE_ARRIVAL' ? 'TERLAMBAT' : 'IZIN'}
                            </span>
                            <span className="text-xs text-gray-400">
                                {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                            </span>
                        </div>
                        <p className="text-sm font-medium text-gray-700 truncate max-w-[150px]">{item.reason}</p>
                    </div>

                    {/* STATUS BADGE */}
                    <div>
                        {item.status === 'PENDING' && (
                            <div className="flex flex-col items-end text-yellow-500">
                                <Clock size={18} />
                                <span className="text-[10px] font-bold mt-1">Menunggu</span>
                            </div>
                        )}
                        {item.status === 'APPROVED' && (
                            <div className="flex flex-col items-end text-green-500">
                                <CheckCircle2 size={18} />
                                <span className="text-[10px] font-bold mt-1">Disetujui</span>
                            </div>
                        )}
                        {item.status === 'REJECTED' && (
                            <div className="flex flex-col items-end text-red-500">
                                <X size={18} />
                                <span className="text-[10px] font-bold mt-1">Ditolak</span>
                            </div>
                        )}
                    </div>
                </div>
             ))
          )}
        </div>
      </div>

    </div>
  );
}