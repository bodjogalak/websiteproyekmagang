"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, UploadCloud, Camera, User, FileText, CheckCircle } from "lucide-react";

export default function ApplicationForm({ user, existingApp }: { user: any, existingApp: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatarUrl || null);
  
  // NEW: State to track selected filenames
  const [cvName, setCvName] = useState<string | null>(null);
  const [letterName, setLetterName] = useState<string | null>(null);

  // Helper for Avatar Preview
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/application", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (res.ok) {
        alert("Data berhasil disimpan! Menunggu verifikasi admin.");
        router.refresh();
      } else {
        alert(json.error || "Gagal menyimpan data");
      }
    } catch (err) {
      alert("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      
      {/* --- 1. PROFILE PICTURE UPLOAD --- */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
        <h3 className="text-sm font-bold text-gray-700 uppercase mb-4">Foto Profil</h3>
        <div className="relative group cursor-pointer">
            <div className="w-28 h-28 rounded-full bg-gray-50 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                    <User className="text-gray-300" size={48} />
                )}
            </div>
            <label className="absolute bottom-1 right-1 bg-[#1193b5] text-white p-2 rounded-full shadow-md cursor-pointer hover:bg-blue-600 transition">
                <Camera size={16} />
                <input 
                    name="avatar" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleAvatarChange}
                />
            </label>
        </div>
        <p className="text-xs text-gray-400 mt-2">Format: JPG, PNG. Max 2MB.</p>
      </div>

      {/* --- 2. DATA DIRI (Existing) --- */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
          <User className="text-[#1193b5]" />
          <h2 className="text-lg font-bold text-gray-800">Data Diri & Akademik</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. Nama Lengkap (Auto-filled dari User table) */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nama Lengkap</label>
            <input 
                name="fullName" 
                defaultValue={existingApp?.fullName || user.name} // <--- Ambil dari User
                required 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-[#1193b5] outline-none" 
            />
          </div>

          {/* 2. No. WhatsApp (Auto-filled dari User table) */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">No. WhatsApp</label>
            <input 
                name="phone" 
                type="tel" 
                defaultValue={user.phone || ""} // <--- INI KUNCINYA (Ambil dari database)
                required 
                placeholder="08xxxxxxxx" 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-[#1193b5] outline-none" 
            />
          </div>

          {/* 3. Instansi / Kampus (Auto-filled dari User table) */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Asal Instansi / Kampus</label>
            <input 
                name="campus" 
                defaultValue={existingApp?.campus || user.agency} // <--- Ambil dari User.agency
                required 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-[#1193b5] outline-none" 
            />
          </div>

          {/* 4. Fakultas */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fakultas</label>
            <input 
                name="faculty" 
                defaultValue={existingApp?.faculty} 
                required 
                placeholder="Cth: Teknik"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-[#1193b5] outline-none" 
            />
          </div>

          {/* 5. Jurusan & Semester */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Jurusan</label>
              <input name="major" defaultValue={existingApp?.major} required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-[#1193b5] outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Semester</label>
              <input name="semester" defaultValue={existingApp?.semester} required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-[#1193b5] outline-none" />
            </div>
          </div>
        </div>
      </div>

      {/* --- 3. PERIODE (Existing) --- */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
         <div className="grid grid-cols-2 gap-6">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tanggal Mulai</label>
                <input name="startDate" type="date" defaultValue={existingApp?.startDate ? new Date(existingApp.startDate).toISOString().split('T')[0] : ""} required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tanggal Selesai</label>
                <input name="endDate" type="date" defaultValue={existingApp?.endDate ? new Date(existingApp.endDate).toISOString().split('T')[0] : ""} required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
            </div>
         </div>
      </div>

      {/* --- 4. UPLOAD DOKUMEN (UPDATED) --- */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-sm font-bold text-gray-700 uppercase mb-4">Upload Dokumen (PDF)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* CV Upload Box */}
            <div className={`border-2 border-dashed rounded-xl p-6 text-center transition relative group cursor-pointer ${cvName ? 'border-[#1193b5] bg-blue-50/30' : 'border-gray-200 hover:bg-gray-50'}`}>
                <input 
                    name="cv" 
                    type="file" 
                    accept=".pdf" 
                    className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                    onChange={(e) => setCvName(e.target.files?.[0]?.name || null)}
                />
                
                <div className="flex flex-col items-center pointer-events-none">
                    {/* Icon Changes based on state */}
                    {cvName ? (
                        <FileText className="mx-auto text-[#1193b5] mb-2 animate-bounce" size={32} />
                    ) : (
                        <UploadCloud className="mx-auto text-gray-400 group-hover:text-[#1193b5] mb-2 transition" size={32} />
                    )}

                    <p className="text-sm font-bold text-gray-600">Curriculum Vitae (CV)</p>
                    
                    {/* Dynamic Status Text */}
                    {cvName ? (
                        <p className="text-sm font-medium text-[#1193b5] mt-2 px-3 py-1 bg-white border border-blue-100 rounded-lg shadow-sm truncate max-w-full">
                            📄 {cvName}
                        </p>
                    ) : (
                        <>
                            <p className="text-xs text-gray-400 mt-1">Klik untuk upload file baru</p>
                            {existingApp?.cvUrl && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md mt-3 border border-green-100">
                                    <CheckCircle size={12} /> Sudah ada file
                                </span>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Letter Upload Box */}
            <div className={`border-2 border-dashed rounded-xl p-6 text-center transition relative group cursor-pointer ${letterName ? 'border-[#1193b5] bg-blue-50/30' : 'border-gray-200 hover:bg-gray-50'}`}>
                <input 
                    name="letter" 
                    type="file" 
                    accept=".pdf" 
                    className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                    onChange={(e) => setLetterName(e.target.files?.[0]?.name || null)}
                />
                
                <div className="flex flex-col items-center pointer-events-none">
                    {letterName ? (
                        <FileText className="mx-auto text-[#1193b5] mb-2 animate-bounce" size={32} />
                    ) : (
                        <UploadCloud className="mx-auto text-gray-400 group-hover:text-[#1193b5] mb-2 transition" size={32} />
                    )}

                    <p className="text-sm font-bold text-gray-600">Surat Pengantar Kampus</p>
                    
                    {letterName ? (
                        <p className="text-sm font-medium text-[#1193b5] mt-2 px-3 py-1 bg-white border border-blue-100 rounded-lg shadow-sm truncate max-w-full">
                            📄 {letterName}
                        </p>
                    ) : (
                        <>
                            <p className="text-xs text-gray-400 mt-1">Klik untuk upload file baru</p>
                            {existingApp?.letterUrl && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md mt-3 border border-green-100">
                                    <CheckCircle size={12} /> Sudah ada file
                                </span>
                            )}
                        </>
                    )}
                </div>
            </div>

        </div>
      </div>

      {/* Submit Button */}
      <button 
        type="submit" 
        disabled={loading} 
        className="w-full bg-[#1193b5] text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-600 transition flex justify-center items-center gap-2 disabled:opacity-70"
      >
        {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
        {loading ? "Menyimpan Data..." : "Kirim Lamaran Magang"}
      </button>

    </form>
  );
}