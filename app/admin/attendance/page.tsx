"use client";

import { useState, useEffect } from "react";
import { Calendar, Download, Search, MapPin, Clock } from "lucide-react";

type AttendanceLog = {
  id: number;
  date: string;
  checkIn: string;
  checkOut: string | null;
  status: string;
  user: {
    name: string;
    agency: string | null;
  };
};

export default function AdminAttendancePage() {
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Default to today
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchLogs = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/attendance?date=${filterDate}`);
    const data = await res.json();
    setLogs(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [filterDate]); // Re-fetch when date changes

  // Simple CSV Export Function
  const handleExport = () => {
    const headers = ["Nama", "Instansi", "Tanggal", "Jam Masuk", "Jam Pulang", "Status"];
    const rows = logs.map(log => [
      log.user.name,
      log.user.agency || "-",
      new Date(log.date).toLocaleDateString(),
      new Date(log.checkIn).toLocaleTimeString(),
      log.checkOut ? new Date(log.checkOut).toLocaleTimeString() : "-",
      log.status
    ]);

    const csvContent = [
      headers.join(","), 
      ...rows.map(r => r.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Presensi_${filterDate}.csv`;
    a.click();
  };

  return (
    <div className="p-6 md:p-8">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Rekap Presensi Harian</h1>
          <p className="text-gray-500 text-sm">Monitor jam masuk dan pulang peserta magang.</p>
        </div>
        
        <div className="flex gap-3 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
            <input 
              type="date" 
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="outline-none text-sm text-gray-600 px-2"
            />
            <div className="w-px bg-gray-200"></div>
            <button 
                onClick={handleExport}
                className="flex items-center gap-2 text-sm font-bold text-green-600 hover:text-green-700 px-2 transition"
                title="Download Excel/CSV"
            >
                <Download size={16} /> Export
            </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase tracking-wider text-xs">
            <tr>
              <th className="p-4">Peserta</th>
              <th className="p-4">Jam Masuk</th>
              <th className="p-4">Jam Pulang</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-400">Loading data...</td></tr>
            ) : logs.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-400">Tidak ada data presensi pada tanggal ini.</td></tr>
            ) : (
                logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition">
                        <td className="p-4">
                            <p className="font-bold text-gray-800">{log.user.name}</p>
                            <p className="text-xs text-gray-400">{log.user.agency || "Tanpa Instansi"}</p>
                        </td>
                        <td className="p-4">
                            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-lg w-fit">
                                <Clock size={14} />
                                <span className="font-mono font-bold">
                                    {new Date(log.checkIn).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </div>
                        </td>
                        <td className="p-4">
                            {log.checkOut ? (
                                <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1 rounded-lg w-fit">
                                    <Clock size={14} />
                                    <span className="font-mono font-bold">
                                        {new Date(log.checkOut).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                            ) : (
                                <span className="text-gray-400 text-xs italic">Belum pulang</span>
                            )}
                        </td>
                        <td className="p-4">
                            <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                                log.status === 'LATE' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                            }`}>
                                {log.status === 'LATE' ? 'TERLAMBAT' : 'TEPAT WAKTU'}
                            </span>
                        </td>
                    </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}