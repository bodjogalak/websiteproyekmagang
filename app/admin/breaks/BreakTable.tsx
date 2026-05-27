"use client";

import { Eye, Clock, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

type BreakRequest = any; 

export default function BreakTable({ data }: { data: BreakRequest[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/50">
            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Peserta</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Waktu Keluar</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Waktu Kembali</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Alasan</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Bukti</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-8 text-center text-gray-500 text-sm">
                Belum ada catatan izin keluar.
              </td>
            </tr>
          ) : (
            data.map((req) => {
              const user = req.attendance.user;
              // If endTime exists, they have returned. If null, they are still out.
              const isFinished = !!req.endTime; 

              return (
                <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                  
                  {/* PESERTA */}
                  <td className="px-6 py-4">
                    <div className="font-semibold text-sm text-gray-800">{user.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {user.application?.campus || user.agency || "Instansi tidak diketahui"}
                    </div>
                  </td>

                  {/* WAKTU KELUAR */}
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-800 font-medium">
                      {format(new Date(req.startTime), "dd MMM yyyy")}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                      <Clock size={12} /> {format(new Date(req.startTime), "HH:mm")}
                    </div>
                  </td>

                  {/* WAKTU KEMBALI */}
                  <td className="px-6 py-4">
                    {isFinished ? (
                      <>
                        <div className="text-sm text-gray-800 font-medium">
                          {format(new Date(req.endTime), "dd MMM yyyy")}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                          <Clock size={12} /> {format(new Date(req.endTime), "HH:mm")}
                        </div>
                      </>
                    ) : (
                      <span className="text-xs text-gray-400 italic">—</span>
                    )}
                  </td>

                  {/* ALASAN */}
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                    {req.reason}
                  </td>

                  {/* BUKTI */}
                  <td className="px-6 py-4 text-center">
                    {req.proofUrl ? (
                      <a 
                        href={req.proofUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#1193b5]/20 text-[#1193b5] text-xs font-medium hover:bg-[#1193b5]/5 transition-colors"
                      >
                        <Eye size={14} /> Lihat
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400 italic">—</span>
                    )}
                  </td>

                  {/* STATUS */}
                  <td className="px-6 py-4">
                    {isFinished ? (
                      <span className="inline-flex items-center gap-1.5 text-green-600 bg-green-50 px-2.5 py-1 rounded-full text-xs font-semibold">
                        <CheckCircle2 size={14} /> Telah Kembali
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-yellow-600 bg-yellow-50 px-2.5 py-1 rounded-full text-xs font-semibold animate-pulse">
                        <Clock size={14} /> Sedang Keluar
                      </span>
                    )}
                  </td>

                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}