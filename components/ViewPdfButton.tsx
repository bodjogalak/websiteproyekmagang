"use client";

import { useState } from "react";
import { Eye, X, Download, ExternalLink } from "lucide-react";

interface ViewPdfButtonProps {
  url: string;
  label?: string;      // Teks tombol (default: "Lihat Dokumen")
  fileName?: string;   // Nama file saat didownload
}

export default function ViewPdfButton({ url, label = "Lihat Dokumen", fileName = "Dokumen.pdf" }: ViewPdfButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-xs font-bold text-[#1193b5] hover:underline bg-white px-3 py-1.5 rounded-lg border border-blue-100 shadow-sm transition hover:bg-blue-50 whitespace-nowrap"
      >
        <Eye size={14} /> {label}
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          ></div>

          <div className="relative bg-white w-full max-w-5xl h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm md:text-base">
                <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs">PDF</span> 
                {fileName}
              </h3>
              
              <div className="flex items-center gap-1 md:gap-2">
                <a href={url} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Buka di Tab Baru">
                  <ExternalLink size={20} />
                </a>
                {/* Logic Download menggunakan nama file yang dikirim */}
                <a href={url} download={fileName} className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition" title="Download File">
                  <Download size={20} />
                </a>
                <button onClick={() => setIsOpen(false)} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-gray-200 relative">
              <iframe src={`${url}#toolbar=0`} className="w-full h-full" title="PDF Preview" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}