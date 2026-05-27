"use client";

import { useEffect, useState } from "react";
import { Users, Clock, CheckCircle2, AlertCircle, FolderCode, CalendarCheck } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalInterns: 0,
    presentToday: 0,
    pendingPermissions: 0,
    pendingApplications: 0,
    totalProjects: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
            const data = await res.json();
            setStats(data);
        }
      } catch (e) {
        console.error("Failed to fetch stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Admin Control Panel</h1>
        <p className="text-gray-500 text-sm">Overview aktivitas peserta magang hari ini.</p>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Card 1: Hadir Hari Ini */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Hadir Hari Ini</p>
                <h2 className="text-3xl font-bold text-gray-800">
                    {loading ? "-" : stats.presentToday}
                    <span className="text-sm text-gray-400 font-normal ml-1">/ {stats.totalInterns}</span>
                </h2>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                <CalendarCheck size={24} />
            </div>
        </div>

        {/* Card 2: Izin Menunggu */}
        <Link href="/admin/permissions" className="group">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group-hover:border-blue-200 transition">
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 group-hover:text-blue-500">Izin Pending</p>
                    <h2 className="text-3xl font-bold text-gray-800 group-hover:text-blue-600">
                        {loading ? "-" : stats.pendingPermissions}
                    </h2>
                </div>
                <div className={`p-3 rounded-xl ${stats.pendingPermissions > 0 ? 'bg-yellow-50 text-yellow-600 animate-pulse' : 'bg-gray-50 text-gray-400'}`}>
                    <Clock size={24} />
                </div>
            </div>
        </Link>

        {/* Card 3: Pendaftar Baru */}
        <Link href="/admin/applications" className="group">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group-hover:border-blue-200 transition">
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 group-hover:text-blue-500">Pendaftar Baru</p>
                    <h2 className="text-3xl font-bold text-gray-800 group-hover:text-blue-600">
                        {loading ? "-" : stats.pendingApplications}
                    </h2>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <Users size={24} />
                </div>
            </div>
        </Link>

        {/* Card 4: Total Project */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Project</p>
                <h2 className="text-3xl font-bold text-gray-800">
                    {loading ? "-" : stats.totalProjects}
                </h2>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <FolderCode size={24} />
            </div>
        </div>

      </div>

      {/* QUICK ACTIONS / INFO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-[#1193b5] to-[#0e7a96] rounded-2xl p-6 text-white shadow-lg">
            <h3 className="font-bold text-lg mb-2">Halo, Admin! 👋</h3>
            <p className="text-blue-100 text-sm mb-6 max-w-md">
                Jangan lupa untuk memeriksa permohonan izin dan absensi harian peserta magang.
            </p>
            <div className="flex gap-3">
                <Link href="/admin/permissions" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-bold backdrop-blur-sm transition">
                    Cek Izin ({stats.pendingPermissions})
                </Link>
                <Link href="/admin/applications" className="bg-white text-[#1193b5] hover:bg-gray-100 px-4 py-2 rounded-lg text-sm font-bold shadow-md transition">
                    Review Pendaftar ({stats.pendingApplications})
                </Link>
            </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center items-center text-center">
             <div className="mb-2 p-3 bg-gray-50 rounded-full text-gray-400">
                <FolderCode size={24}/>
             </div>
             <h3 className="font-bold text-gray-800">Project Repository</h3>
             <p className="text-gray-500 text-xs mt-1 mb-4">Pantau hasil karya peserta magang.</p>
             <Link href="/admin/projects" className="text-[#1193b5] text-sm font-bold hover:underline">
                Lihat Semua Project ({stats.totalProjects})
             </Link>
        </div>
      </div>
    </div>
  );
}