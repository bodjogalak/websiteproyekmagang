"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import ViewPdfButton from "@/components/ViewPdfButton"; 
import LetterModal from "@/components/admin/LetterModal"; 
import { 
    Check, X, Calendar, Building2, UserCircle
} from "lucide-react";

type Application = {
  id: number;
  fullName: string;
  campus: string;
  major: string;
  semester: string;
  startDate: Date | null;
  endDate: Date | null;
  cvUrl: string | null;
  letterUrl: string | null;
  status: string;
  user: { email: string; name: string | null };
};

export default function ApplicationTable({ initialData }: { initialData: Application[] }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<number | null>(null);

  // 1. Update the fetch URL to our admin API
  // 2. Update the body to match what the API expects ({ id, status })
  const updateStatus = async (id: number, status: string) => {
    setIsLoading(id);
    try {
      await fetch("/api/admin/applications", { // 👈 CHANGED from /api/application/status
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }), // 👈 CHANGED keys to simple 'id' and 'status'
      });
      router.refresh();
    } catch (error) {
      console.error("Update Status Error:", error); 
      alert("Gagal mengupdate status");
    } finally { 
      setIsLoading(null);
    }
  };

  const formatDateSafe = (date: Date | null) => {
    if (!date) return "-";
    return format(new Date(date), "d MMM yyyy", { locale: idLocale });
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-100">
        <thead className="bg-gray-50/50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Kandidat</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Durasi</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Kampus</th>
            <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">CV</th>
            <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Srt. Pengantar</th>
            <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
            <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Aksi</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {initialData.length === 0 ? (
            <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400 italic">Belum ada data aplikasi.</td></tr>
          ) : (
            initialData.map((app) => (
              <tr key={app.id} className="group hover:bg-gray-50/80 transition-colors duration-200">
                
                {/* 1. KANDIDAT */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 overflow-hidden shrink-0">
                        <UserCircle size={24}/>
                    </div>
                    <div>
                        <div className="font-bold text-gray-900 text-sm">{app.fullName}</div>
                        <div className="text-xs text-gray-500">{app.user.email}</div>
                    </div>
                  </div>
                </td>

                {/* 2. DURASI */}
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-xs text-gray-600 bg-blue-50 w-fit px-3 py-1.5 rounded-md border border-blue-100">
                        <Calendar size={14} className="text-blue-500"/>
                        <span className="font-mono font-medium">
                            {formatDateSafe(app.startDate)} <br/> 
                            <span className="text-gray-400 text-[10px]">s/d</span> {formatDateSafe(app.endDate)}
                        </span>
                    </div>
                </td>

                {/* 3. KAMPUS */}
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <Building2 size={14} className="text-gray-400"/>
                            <span className="truncate max-w-45" title={app.campus}>{app.campus}</span>
                        </div>
                        <div className="text-xs text-gray-500 ml-6 mt-0.5">{app.major}</div>
                        <div className="text-[10px] text-gray-400 ml-6">Sem. {app.semester}</div>
                    </div>
                </td>

                {/* 4. CV */}
                <td className="px-6 py-4 text-center align-middle">
                    {app.cvUrl ? (
                        <div className="flex justify-center">
                            <ViewPdfButton 
                                url={app.cvUrl} 
                                label="Buka CV" 
                                fileName={`CV - ${app.fullName}.pdf`} 
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-gray-300">
                             <span className="text-[10px] italic">Tidak diupload</span>
                        </div>
                    )}
                </td>

                {/* 5. SURAT PENGANTAR */}
                <td className="px-6 py-4 text-center align-middle">
                    {app.letterUrl ? (
                        <div className="flex justify-center">
                            <ViewPdfButton 
                                url={app.letterUrl} 
                                label="Buka Surat" 
                                fileName={`Surat Pengantar - ${app.fullName}.pdf`}
                            />
                        </div>
                    ) : (
                         <div className="flex flex-col items-center justify-center text-gray-300">
                             <span className="text-[10px] italic">Tidak diupload</span>
                        </div>
                    )}
                </td>

                {/* 6. STATUS */}
                <td className="px-6 py-4 text-center">
                   <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize shadow-sm
                    ${app.status === 'ACCEPTED' ? 'bg-green-50 text-green-700 border border-green-200' : 
                      app.status === 'REJECTED' ? 'bg-red-50 text-red-700 border border-red-200' : 
                      'bg-yellow-50 text-yellow-700 border border-yellow-200'
                    }`}>
                        {app.status === 'ACCEPTED' && <Check size={12} className="mr-1 stroke-3"/>}
                        {app.status === 'REJECTED' && <X size={12} className="mr-1 stroke-3"/>}
                        {app.status.toLowerCase()}
                   </span>
                </td>

                {/* 7. AKSI */}
                <td className="px-6 py-4 text-right">
                  {app.status !== 'REJECTED' && (
                      <div className="flex justify-end items-center gap-2">
                        {isLoading === app.id ? (
                          <span className="text-xs text-gray-400 animate-pulse">Processing...</span>
                        ) : (
                          <>
                            {app.status === 'PENDING' && (
                                <>
                                    <button onClick={() => updateStatus(app.id, "ACCEPTED")} className="p-2 text-green-600 hover:bg-green-50 rounded-lg border border-transparent hover:border-green-200 transition-all shadow-sm hover:shadow" title="Terima">
                                        <Check size={18} />
                                    </button>
                                    <button onClick={() => updateStatus(app.id, "REJECTED")} className="p-2 text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200 transition-all shadow-sm hover:shadow" title="Tolak">
                                        <X size={18} />
                                    </button>
                                </>
                            )}
                            {app.status === 'ACCEPTED' && <LetterModal application={app} />}
                          </>
                        )}
                      </div>
                  )}
                </td>

              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}