"use client";

import { useState, useRef, useEffect } from "react";
import { Printer, X, Download, Loader2, FileText } from "lucide-react";
import { renderAsync } from "docx-preview";

interface LetterPreviewButtonProps {
  applicationId: number;
  applicantName: string;
}

export default function LetterPreviewButton({ applicationId, applicantName }: LetterPreviewButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [docBlob, setDocBlob] = useState<Blob | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // FUNGSI 1: Hanya Fetch Data (Tidak render di sini)
  const handleFetchData = async () => {
    setIsOpen(true);
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId }),
      });

      if (!response.ok) throw new Error("Gagal generate surat");

      const blob = await response.blob();
      setDocBlob(blob); // Simpan blob ke state

    } catch (error) {
      alert("Gagal memuat surat.");
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  // FUNGSI 2: useEffect untuk Render (Jalan otomatis saat Modal & Data SIAP)
  useEffect(() => {
    if (isOpen && docBlob && containerRef.current) {
        // Bersihkan kontainer lama
        containerRef.current.innerHTML = "";
        
        // Render surat
        renderAsync(docBlob, containerRef.current, undefined, {
            className: "docx_viewer", // Class tambahan biar aman
            inWrapper: false, 
            ignoreWidth: false,
            experimental: true // Fitur eksperimental kadang membantu rendering lebih akurat
        }).catch(err => console.error("Error rendering docx:", err));
    }
  }, [isOpen, docBlob]); // Dependency: Jalankan ulang jika isOpen / docBlob berubah

  const handleDownload = () => {
    if (!docBlob) return;
    const url = window.URL.createObjectURL(docBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Surat_Balasan_${applicantName.replace(/\s+/g, '_')}.docx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <>
      <button
        onClick={handleFetchData} // Panggil fungsi fetch saja
        className="text-blue-600 hover:text-blue-800 text-xs font-bold border border-blue-200 px-3 py-1.5 rounded hover:bg-blue-50 flex items-center gap-1 transition"
        title="Buat & Preview Surat"
      >
        <Printer size={14} /> Surat
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          ></div>

          <div className="relative bg-white w-full max-w-4xl h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50 shrink-0">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm md:text-base">
                <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-xs flex gap-1 items-center">
                    <FileText size={12}/> DOCX
                </span> 
                Preview Surat Balasan
              </h3>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleDownload}
                  disabled={isLoading || !docBlob}
                  className="flex items-center gap-2 bg-[#1193b5] hover:bg-[#0e7a96] text-white px-3 py-1.5 rounded-lg text-sm font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download size={16} /> Download .docx
                </button>
                
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-gray-100 overflow-y-auto p-4 md:p-8">
              {isLoading ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3">
                    <Loader2 size={40} className="animate-spin text-[#1193b5]"/>
                    <p className="text-sm font-medium">Sedang menyusun surat...</p>
                </div>
              ) : (
                <div className="flex justify-center">
                    {/* CONTAINER DOKUMEN */}
                    {/* Berikan min-height agar terlihat jika kosong */}
                    <div 
                        ref={containerRef} 
                        className="bg-white shadow-lg p-8 min-h-[800px] w-full max-w-[21cm] overflow-hidden"
                    ></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}