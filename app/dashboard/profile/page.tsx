"use client";

import { useState, useEffect, useRef } from "react";
import { User as UserIcon, Mail, Building, Phone, Calendar, Edit, X, Loader2, Save, GraduationCap, School, BookOpen, Camera } from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form States
  const [formData, setFormData] = useState<any>({});
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchProfile = async () => {
    const res = await fetch("/api/user/profile");
    if (res.ok) {
      const data = await res.json();
      setUser(data);
      const app = data.application || {};
      setFormData({
        name: data.name || "",
        phone: data.phone || "",
        campus: app.campus || data.agency || "",
        faculty: app.faculty || "",
        major: app.major || "",
        semester: app.semester || "",
        startDate: app.startDate ? app.startDate.split('T')[0] : "",
        endDate: app.endDate ? app.endDate.split('T')[0] : ""
      });
    }
    setLoading(false);
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (selectedFile) data.append("avatar", selectedFile);

    const res = await fetch("/api/user/profile", { method: "PATCH", body: data });

    if (res.ok) {
      await update();
      await fetchProfile();
      setAvatarPreview(null);
      setSelectedFile(null);
      setIsModalOpen(false);
    } else {
      alert("Gagal memperbarui data.");
    }
    setIsSaving(false);
  };

  if (loading) return <div className="p-20 text-center text-gray-400"><Loader2 className="animate-spin mx-auto mb-2" /> Memuat profil...</div>;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* 1. HEADER & AVATAR DISPLAY */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-40 bg-gradient-to-r from-[#1193b5] to-blue-400"></div>
        <div className="px-8 pb-8">
            <div className="relative -mt-20 mb-6 flex justify-between items-end">
                <div className="w-40 h-40 rounded-full border-8 border-white bg-gray-100 overflow-hidden shadow-xl flex items-center justify-center relative group">
                     {user.avatarUrl ? <Image src={user.avatarUrl} alt="Avatar" width={160} height={160} className="object-cover w-full h-full" /> : <UserIcon size={64} className="text-gray-300" />}
                </div>
                <button onClick={() => setIsModalOpen(true)} className="mb-4 flex items-center gap-2 px-6 py-3 bg-[#1193b5] hover:bg-blue-600 rounded-2xl text-sm font-bold text-white transition shadow-lg"><Edit size={18} /> Edit Data Lengkap</button>
            </div>
            <h2 className="text-3xl font-black text-gray-900">{user.name}</h2>
            <p className="text-[#1193b5] font-bold tracking-widest uppercase text-xs mt-1">ID Peserta: #{user.id.toString().padStart(4, '0')}</p>
        </div>
      </div>

      {/* 2. INFORMATION GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2"><GraduationCap className="text-[#1193b5]" /> Data Akademik</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <InfoBox label="Asal Kampus" value={user.application?.campus || "-"} icon={<School size={18}/>} />
                    <InfoBox label="Fakultas" value={user.application?.faculty || "-"} icon={<Building size={18}/>} />
                    <InfoBox label="Program Studi" value={user.application?.major || "-"} icon={<BookOpen size={18}/>} />
                    <InfoBox label="Semester" value={user.application?.semester || "-"} icon={<Calendar size={18}/>} />
                </div>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2"><Calendar className="text-[#1193b5]" /> Jadwal Magang</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <InfoBox label="Tanggal Mulai" value={user.application?.startDate ? new Date(user.application.startDate).toLocaleDateString('id-ID', { dateStyle: 'long' }) : "-"} icon={<Calendar size={18}/>} />
                    <InfoBox label="Tanggal Selesai" value={user.application?.endDate ? new Date(user.application.endDate).toLocaleDateString('id-ID', { dateStyle: 'long' }) : "-"} icon={<Calendar size={18}/>} />
                </div>
            </div>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm h-fit">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2"><Phone className="text-[#1193b5]" /> Hubungi</h3>
            <div className="space-y-6">
                <InfoBox label="Email" value={user.email} icon={<Mail size={18}/>} />
                <InfoBox label="WhatsApp" value={user.phone || "-"} icon={<Phone size={18}/>} />
            </div>
        </div>
      </div>

      {/* 3. CENTERED EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
                <div className="px-10 py-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-2xl font-black text-gray-800">Perbarui Profil</h2>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition text-gray-400"><X size={24}/></button>
                </div>

                <form onSubmit={handleUpdate} className="p-10 space-y-8 overflow-y-auto">
                    {/* Avatar Upload UI */}
                    <div className="flex flex-col items-center gap-4 py-4 border-b border-gray-50">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <div className="w-28 h-28 rounded-full border-4 border-[#1193b5]/20 overflow-hidden bg-gray-50">
                                {avatarPreview || user.avatarUrl ? (
                                    <img src={avatarPreview || user.avatarUrl} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300"><UserIcon size={40}/></div>
                                )}
                            </div>
                            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                <Camera className="text-white" size={24} />
                            </div>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Klik Foto untuk Mengubah</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                        <InputGroup label="Nama Lengkap" value={formData.name} onChange={(v:any) => setFormData({...formData, name: v})} />
                        <InputGroup label="No. WhatsApp" value={formData.phone} onChange={(v:any) => setFormData({...formData, phone: v})} />
                        <InputGroup label="Kampus / Instansi" value={formData.campus} onChange={(v:any) => setFormData({...formData, campus: v})} />
                        <InputGroup label="Fakultas" value={formData.faculty} onChange={(v:any) => setFormData({...formData, faculty: v})} />
                        <InputGroup label="Program Studi" value={formData.major} onChange={(v:any) => setFormData({...formData, major: v})} />
                        <InputGroup label="Semester" value={formData.semester} onChange={(v:any) => setFormData({...formData, semester: v})} />
                        <InputGroup label="Mulai Magang" type="date" value={formData.startDate} onChange={(v:any) => setFormData({...formData, startDate: v})} />
                        <InputGroup label="Selesai Magang" type="date" value={formData.endDate} onChange={(v:any) => setFormData({...formData, endDate: v})} />
                    </div>

                    <div className="pt-6 flex gap-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 font-bold text-gray-400 hover:bg-gray-100 rounded-3xl transition">Batal</button>
                        <button type="submit" disabled={isSaving} className="flex-[2] py-5 bg-[#1193b5] text-white font-bold rounded-3xl hover:bg-blue-600 transition shadow-xl flex items-center justify-center gap-3">
                            {isSaving ? <Loader2 className="animate-spin" size={24}/> : <><Save size={24}/> Simpan Perubahan</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}

function InfoBox({ label, value, icon }: any) {
    return (
        <div className="flex items-start gap-4">
            <div className="p-3 bg-gray-50 text-gray-400 rounded-2xl border border-gray-100">{icon}</div>
            <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">{label}</p>
                <p className="text-gray-800 font-bold text-sm">{value}</p>
            </div>
        </div>
    );
}

function InputGroup({ label, value, onChange, type = "text" }: any) {
    return (
        <div className="w-full">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{label}</label>
            <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-blue-50 outline-none transition font-medium text-gray-700" />
        </div>
    );
}