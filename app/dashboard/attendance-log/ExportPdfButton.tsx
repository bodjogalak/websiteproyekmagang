"use client";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Download } from "lucide-react";

export default function ExportPdfButton({ userData, attendance }: { userData: any, attendance: any[] }) {
  const exportPDF = () => {
    const doc = new jsPDF();
    const app = userData.application;

    // 1. Header (Formal Office Style)
    doc.setFontSize(12);
    doc.text("DAFTAR HADIR MAHASISWA MAGANG", 105, 15, { align: "center" });
    doc.setFontSize(10);
    doc.text(`${app?.campus?.toUpperCase() || "UNIVERSITAS"}`, 105, 20, { align: "center" });
    doc.text(`DI DINAS KOMUNIKASI, INFORMATIKA, PERSANDIAN DAN STATISTIK DAERAH`, 105, 25, { align: "center" });
    doc.text(`PROVINSI SULAWESI UTARA`, 105, 30, { align: "center" });
    
    doc.line(20, 35, 190, 35); // Horizontal Line

    // 2. Student Info
    doc.text(`Nama: ${userData.name}`, 20, 45);
    doc.text(`NIM/ID: ${app?.id || "-"}`, 20, 50);
    doc.text(`Prodi: ${app?.major || "-"}`, 20, 55);

    // 3. Attendance Table
    autoTable(doc, {
      startY: 65,
      head: [['NO', 'HARI / TANGGAL', 'MASUK', 'PULANG', 'KETERANGAN']],
      body: attendance.map((log, index) => [
        index + 1,
        new Date(log.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' }),
        log.checkIn ? new Date(log.checkIn).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-',
        log.checkOut ? new Date(log.checkOut).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-',
        log.status
      ]),
      theme: 'grid',
      headStyles: { fillColor: [17, 147, 181], halign: 'center' },
      styles: { fontSize: 8, halign: 'center' },
      columnStyles: { 1: { halign: 'left' } }
    });

    // 4. Footer Signature (Matching your scan)
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.text("Mengetahui,", 140, finalY);
    doc.text("Kepala Sub-Bagian Umum,", 140, finalY + 5);
    doc.text("__________________________", 140, finalY + 25);
    doc.text("NIP. _____________________", 140, finalY + 30);

    doc.save(`Presensi_${userData.name.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <button 
      onClick={exportPDF}
      className="flex items-center gap-2 bg-[#1193b5] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-600 transition shadow-md"
    >
      <Download size={18} /> Cetak Laporan PDF
    </button>
  );
}