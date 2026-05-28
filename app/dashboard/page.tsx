import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ApplicationForm from "@/components/dashboard/ApplicationForm";
import ViewPdfButton from "@/components/ViewPdfButton"; 
import { Clock, FileText, HelpCircle, CalendarCheck, AlertCircle, LogIn, LogOut, Building2, Briefcase } from "lucide-react";

export const metadata = {
  title: "Dashboard Peserta",
};

// Helpers Format Tanggal
const formatDateTime = (date: Date) => {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit", timeZoneName: "short"
  }).format(date);
};

const formatDateOnly = (date: Date) => {
  return new Intl.DateTimeFormat('id-ID', { 
    day: 'numeric', month: 'short', year: 'numeric' 
  }).format(new Date(date));
};

const formatTimeOnly = (date: Date | null) => {
  if (!date) return "—";
  return new Intl.DateTimeFormat('id-ID', { 
    hour: '2-digit', minute: '2-digit' 
  }).format(new Date(date));
};

// Helper style status badge
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'PRESENT': return <span className="px-2.5 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold">HADIR</span>;
    case 'LATE': 
    case 'LATE_EXCUSED': return <span className="px-2.5 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-bold">TERLAMBAT</span>;
    case 'ON_BREAK': return <span className="px-2.5 py-1 bg-yellow-50 text-yellow-600 rounded-full text-[10px] font-bold">ISTIRAHAT</span>;
    case 'SICK': return <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold">SAKIT</span>;
    case 'PERMIT': return <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold">IZIN</span>;
    case 'ABSENT': return <span className="px-2.5 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-bold">ALPA</span>;
    default: return <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] font-bold">{status}</span>;
  }
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // 1. Validasi Session & Role
  if (!session || !session.user?.email) redirect("/login");
  if (session.user.role === "ADMIN") redirect("/admin");

  // 2. Fetch User & Application Data
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { application: true },
  });

  if (!user) return <div>User data not found.</div>;
  const app = user.application;

  // --- KONDISI 1: User BELUM Mendaftar (Tampilkan Form) ---
  if (!app) {
    const userDataForForm = {
      name: user.name || "",
      email: user.email || "",
      phone: user.phone,
      agency: user.agency,
    };

    return (
  <div className="max-w-4xl mx-auto py-10 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
     <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Formulir Pendaftaran Magang</h1>
        <p className="text-gray-500 mt-2">Lengkapi biodata dan berkas di bawah ini untuk memulai proses seleksi.</p>
     </div>
    {/* TAMBAHKAN PROPS existingApp DI SINI */}
    <ApplicationForm user={userDataForForm} existingApp={null} />
  </div>
);
  }

  // --- KONDISI 2: User DITERIMA (Tampilkan Operational Dashboard) ---
  if (app.status === 'ACCEPTED') {
    // Hanya fetch data presensi jika user sudah diterima untuk menghemat database queries
    const userId = user.id;
    const [hadirCount, telatCount, izinCount, alpaCount, recentHistory] = await Promise.all([
      prisma.attendance.count({ where: { userId, status: { in: ['PRESENT', 'LATE', 'LATE_EXCUSED', 'EARLY_LEAVE', 'EARLY_EXCUSED', 'ON_BREAK'] } } }),
      prisma.attendance.count({ where: { userId, status: { in: ['LATE', 'LATE_EXCUSED'] } } }),
      prisma.attendance.count({ where: { userId, status: { in: ['SICK', 'PERMIT'] } } }),
      prisma.attendance.count({ where: { userId, status: 'ABSENT' } }),
      prisma.attendance.findMany({ where: { userId }, orderBy: { date: 'desc' }, take: 10 })
    ]);

    const isAssigned = user.bidang && user.peran && user.bidang !== 'UNASSIGNED' && user.peran !== 'UNASSIGNED';
    const bidangDisplay = isAssigned ? user.bidang.replace('_', ' ') : '-';
    const peranDisplay = isAssigned ? user.peran.replace('_', ' ') : '-';

    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Halo, {user.name}! 👋</h1>
            <p className="text-gray-500 text-sm mt-1">Berikut adalah ringkasan absensi dan penugasanmu selama magang.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-3 bg-blue-50/50 px-4 py-3 rounded-xl border border-blue-100">
              <Building2 size={20} className="text-blue-500 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Unit Kerja / Bidang</p>
                <p className="text-sm font-bold text-blue-700">{bidangDisplay}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-purple-50/50 px-4 py-3 rounded-xl border border-purple-100">
              <Briefcase size={20} className="text-purple-500 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Peran Operasional</p>
                <p className="text-sm font-bold text-purple-700">{peranDisplay}</p>
              </div>
            </div>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-green-50 text-green-500 flex items-center justify-center shrink-0">
              <CalendarCheck size={20} className="md:w-6 md:h-6" />
            </div>
            <div>
              <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase">Total Hadir</p>
              <p className="text-xl md:text-2xl font-black text-gray-800">{hadirCount}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
              <Clock size={20} className="md:w-6 md:h-6" />
            </div>
            <div>
              <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase">Terlambat</p>
              <p className="text-xl md:text-2xl font-black text-gray-800">{telatCount}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
              <FileText size={20} className="md:w-6 md:h-6" />
            </div>
            <div>
              <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase">Izin / Sakit</p>
              <p className="text-xl md:text-2xl font-black text-gray-800">{izinCount}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0">
              <AlertCircle size={20} className="md:w-6 md:h-6" />
            </div>
            <div>
              <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase">Alpa</p>
              <p className="text-xl md:text-2xl font-black text-gray-800">{alpaCount}</p>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: LOG & DOCUMENTS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* ATTENDANCE LOG (Spans 2 columns) */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
                <h2 className="font-bold text-lg text-gray-800">Riwayat Presensi Terbaru</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Tanggal</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Jam Masuk</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Jam Pulang</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentHistory.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-400 text-sm">Belum ada riwayat presensi.</td>
                    </tr>
                  ) : (
                    recentHistory.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-semibold text-gray-800">{formatDateOnly(record.date)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                             <LogIn size={14} className="text-green-500" /> {formatTimeOnly(record.checkIn)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                             <LogOut size={14} className="text-red-500" /> {formatTimeOnly(record.checkOut)}
                          </div>
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(record.status)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* DOCUMENTS (Spans 1 column, retained from original code) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
              <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <FileText size={18} className="text-[#1193b5]" /> Dokumen Anda
              </h3>
              <div className="space-y-4">
                  {app.cvUrl && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="flex items-center gap-3 overflow-hidden">
                              <div className="w-8 h-8 bg-red-100 text-red-600 rounded flex items-center justify-center shrink-0">
                                  <span className="text-[9px] font-bold">PDF</span>
                              </div>
                              <p className="text-xs font-bold text-gray-700 truncate">CV_Saya.pdf</p>
                          </div>
                          <ViewPdfButton url={app.cvUrl} label="Buka" fileName={`CV - ${app.fullName}.pdf`} />
                      </div>
                  )}
                  {app.letterUrl && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="flex items-center gap-3 overflow-hidden">
                              <div className="w-8 h-8 bg-red-100 text-red-600 rounded flex items-center justify-center shrink-0">
                                  <span className="text-[9px] font-bold">PDF</span>
                              </div>
                              <p className="text-xs font-bold text-gray-700 truncate">Srt_Pengantar.pdf</p>
                          </div>
                          <ViewPdfButton url={app.letterUrl} label="Buka" fileName={`Surat Pengantar - ${app.fullName}.pdf`} />
                      </div>
                  )}
              </div>
          </div>

        </div>
      </div>
    );
  }

  // --- KONDISI 3: User Mendaftar & PENDING/REJECTED (Tampilkan Status & Timeline) ---
  return (
    <div className="space-y-6 p-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-full">
              <div className="flex justify-between items-start mb-4">
                  <span className="text-gray-500 font-medium text-xs uppercase tracking-wider">Status Saat Ini</span>
                  <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
                      <Clock size={20} />
                  </div>
              </div>
              <div>
                  <h2 className={`text-3xl font-bold mb-3 ${app.status === 'REJECTED' ? 'text-red-600' : 'text-yellow-500'}`}>
                      {app.status === 'PENDING' ? 'MENUNGGU' : app.status}
                  </h2>
                  <div className={`text-xs px-3 py-2 rounded-lg border flex items-center gap-2 leading-relaxed ${app.status === 'REJECTED' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-yellow-50 border-yellow-100 text-yellow-700'}`}>
                      {app.status === 'PENDING' ? 'Berkas Anda sedang diverifikasi oleh admin.' : 'Mohon maaf, lamaran Anda belum diterima.'}
                  </div>
              </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-full">
              <div>
                  <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-500 font-medium text-xs uppercase tracking-wider">Progress</span>
                      <span className="text-[#1193b5] font-bold text-sm">100%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 mb-6">
                      <div className="bg-[#1193b5] h-2.5 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                  <p className="text-sm text-gray-600">Data administrasi Anda sudah lengkap.</p>
              </div>
          </div>

          <div className="bg-[#1193b5] p-6 rounded-2xl shadow-sm text-white flex flex-col justify-between h-full relative overflow-hidden group">
              <div className="relative z-10">
                  <h3 className="font-bold text-lg mb-1">Butuh Bantuan?</h3>
                  <p className="text-blue-100 text-sm mb-4">Hubungi admin jika ada kesalahan data.</p>
                  <button className="bg-white/20 hover:bg-white/30 text-white text-sm font-bold px-4 py-2 rounded-lg transition backdrop-blur-sm">
                      Kontak Admin
                  </button>
              </div>
              <div className="absolute -bottom-4 -right-4 text-white/10 transition-transform group-hover:scale-110 duration-500">
                  <HelpCircle size={100} />
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-bold text-gray-800">Riwayat Lamaran</h3>
              <span className="text-xs font-mono bg-gray-100 text-gray-500 px-2 py-1 rounded border border-gray-200">
                #{app.id.toString().padStart(4, '0')}
              </span>
            </div>

            <div className="relative space-y-8 before:absolute before:left-4 before:top-2 before:h-[90%] before:w-0.5 before:bg-gray-100">
              <div className="relative pl-12">
                <span className="absolute left-4 -translate-x-1/2 top-1 w-5 h-5 bg-green-500 rounded-full ring-4 ring-white z-10"></span>
                <h4 className="font-bold text-gray-900 text-sm">Pendaftaran Berhasil</h4>
                <p className="text-xs text-gray-400 mt-1">{formatDateTime(app.createdAt)}</p>
              </div>

              <div className="relative pl-12">
                <span className={`absolute left-4 -translate-x-1/2 top-1 w-5 h-5 rounded-full ring-4 ring-white z-10 ${
                  app.status !== 'PENDING' ? 'bg-green-500' : 'bg-yellow-400'
                }`}></span>
                <h4 className="font-bold text-gray-900 text-sm">
                  {app.status === 'PENDING' ? 'Menunggu Review' : 'Review Selesai'}
                </h4>
                <p className="text-xs text-gray-400 mt-1">
                   {app.status === 'PENDING' ? 'Berkas anda sedang di-review oleh Kepala Sub Bagian Kepegawaian' : 'Berkas telah diperiksa.'}
                </p>
              </div>

              <div className="relative pl-12">
                <span className={`absolute left-4 -translate-x-1/2 top-1 w-5 h-5 rounded-full ring-4 ring-white z-10 ${
                  app.status === 'REJECTED' ? 'bg-red-500' : 'bg-gray-200'
                }`}></span>
                <h4 className="font-bold text-gray-900 text-sm">Keputusan Akhir</h4>
                <p className="text-xs text-gray-400 mt-1">
                  {app.status === 'REJECTED' ? 'Ditolak' : 'Menunggu...'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
              <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <FileText size={18} className="text-[#1193b5]" /> Dokumen Terkirim
              </h3>
              <div className="space-y-4">
                  {app.cvUrl && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="flex items-center gap-3 overflow-hidden">
                              <div className="w-8 h-8 bg-red-100 text-red-600 rounded flex items-center justify-center shrink-0">
                                  <span className="text-[9px] font-bold">PDF</span>
                              </div>
                              <div className="truncate">
                                  <p className="text-xs font-bold text-gray-700 truncate">CV_Saya.pdf</p>
                              </div>
                          </div>
                          <ViewPdfButton url={app.cvUrl} label="Buka" fileName={`CV - ${app.fullName}.pdf`} />
                      </div>
                  )}
                  {app.letterUrl && (
                       <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="flex items-center gap-3 overflow-hidden">
                              <div className="w-8 h-8 bg-red-100 text-red-600 rounded flex items-center justify-center shrink-0">
                                  <span className="text-[9px] font-bold">PDF</span>
                              </div>
                              <div className="truncate">
                                  <p className="text-xs font-bold text-gray-700 truncate">Srt_Pengantar.pdf</p>
                              </div>
                          </div>
                          <ViewPdfButton url={app.letterUrl} label="Buka" fileName={`Surat Pengantar - ${app.fullName}.pdf`} />
                      </div>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
}