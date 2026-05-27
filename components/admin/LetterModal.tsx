"use client";

import { useState } from "react";
import { Download, FileBadge, X, Loader2 } from "lucide-react"; // Ganti Printer dengan Download
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

interface Application {
  id: number;
  fullName: string;
  campus: string;
  major: string;
  startDate: Date | string | null;
  endDate: Date | string | null;
}

const formatDateSafe = (date: Date | string | number | null | undefined) => {
  if (!date) return "....................";
  try {
    return format(new Date(date), "d MMMM yyyy", { locale: idLocale });
  } catch (error) {
    return "Invalid Date";
  }
};

export default function LetterModal({ application }: { application: Application }) {
  const [open, setOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false); // State untuk loading download

  // --- PERBAIKAN: Fungsi Download DOCX ---
  const handleDownloadDocx = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch("/api/admin/letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: application.id }),
      });

      if (!response.ok) throw new Error("Gagal mengunduh file");

      // Mengambil blob dari response
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Membuat link temporary untuk download
      const a = document.createElement("a");
      a.href = url;
      a.download = `Surat_Balasan_${application.fullName.replace(/\s+/g, '_')}.docx`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download error:", error);
      alert("Gagal mengunduh surat balasan.");
    } finally {
      setIsDownloading(false);
    }
  };

  const today = format(new Date(), "d MMMM yyyy", { locale: idLocale });
  const startDateStr = formatDateSafe(application.startDate); 
  const endDateStr = formatDateSafe(application.endDate);

  return (
    <>
      <button 
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 px-3 py-1.5 bg-[#1193b5] text-white text-xs font-bold rounded-lg hover:bg-blue- transition shadow-sm"
      >
        <FileBadge size={14} /> Surat
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl w-full max-w-3xl h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
                
                {/* Modal Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800">Preview Surat Balasan</h3>
                    <div className="flex gap-2">
                        {/* TOMBOL DOWNLOAD DOCX */}
                        <button 
                          onClick={handleDownloadDocx} 
                          disabled={isDownloading}
                          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition disabled:bg-blue-400"
                        >
                            {isDownloading ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Download size={16} />
                            )}
                            Unduh DOCX
                        </button>
                        <button onClick={() => setOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Modal Body (Scrollable) */}
                <div className="flex-1 overflow-y-auto bg-gray-100 p-8 flex justify-center">
                    <div 
                        id="letter-content"
                        className="bg-white shadow-lg p-[2.5cm] w-[21cm] min-h-[29.7cm] text-black leading-relaxed text-[12pt] font-serif relative"
                    >
                        {/* KOP SURAT */}
                        <div className="flex items-center justify-center border-b-4 border-double border-black pb-4 mb-6 gap-4">
                            <img src="/sulut-icon.png" alt="Logo" className="h-20 w-auto object-contain" />
                            <div className="text-center">
                                <h2 className="text-lg font-bold uppercase">Pemerintah Provinsi Sulawesi Utara</h2>
                                <h1 className="text-xl font-black uppercase">Dinas Komunikasi, Informatika, Persandian dan Statistik</h1>
                                <p className="text-sm italic mt-1">Jl. 17 Agustus No. 69, Teling Atas, Kec. Wanea, Kota Manado</p>
                            </div>
                        </div>

                        {/* ISI SURAT (Hanya untuk preview visual) */}
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p>Nomor: 800 / Diskominfo / {application.id} / 2026</p>
                                <p>Lampiran: -</p>
                                <p>Perihal: <span className="font-bold underline">Penerimaan Permohonan Magang</span></p>
                            </div>
                            <div className="text-right">
                                <p>Manado, {today}</p>
                            </div>
                        </div>

                        <p className="mb-4">Yth. Ketua Program Studi {application.major}</p>
                        <p className="mb-6">{application.campus}</p>

                        <p className="mb-4 text-justify indent-8">
                            Sehubungan dengan surat permohonan magang/praktik kerja lapangan yang diajukan oleh mahasiswa:
                        </p>

                        <table className="w-full mb-6 ml-4">
                            <tbody>
                                <tr>
                                    <td className="w-40 font-bold py-1">Nama</td>
                                    <td>: {application.fullName}</td>
                                </tr>
                                <tr>
                                    <td className="font-bold py-1">Program Studi</td>
                                    <td>: {application.major}</td>
                                </tr>
                            </tbody>
                        </table>

                        <p className="mb-4 text-justify indent-8">
                            Dengan ini kami sampaikan bahwa Dinas Komunikasi, Informatika, Persandian dan Statistik Daerah Provinsi Sulawesi Utara 
                            <span className="font-bold"> DAPAT MENERIMA</span> mahasiswa tersebut untuk melaksanakan kegiatan Magang terhitung mulai tanggal 
                            <span className="font-bold"> {startDateStr} s.d {endDateStr}</span>.
                        </p>

                        <p className="mb-8 text-justify indent-8">
                            Demikian surat balasan ini kami sampaikan, atas perhatian dan kerjasamanya diucapkan terima kasih.
                        </p>

                        <div className="flex justify-end mt-16">
                            <div className="text-center w-64">
                                <p>Kepala Dinas,</p>
                                <div className="h-24"></div> 
                                <p className="font-bold underline decoration-1 underline-offset-4">Dr. NAMA KEPALA DINAS, M.Si</p>
                                <p>NIP. 19700101 200003 1 001</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}
    </>
  );
}