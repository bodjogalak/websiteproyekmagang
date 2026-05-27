"use client";

import { useState, useEffect } from "react";
import { Github, Globe, ExternalLink, Edit2, Check, X, AlertTriangle, ArrowRight } from "lucide-react";

type Project = {
  id: string;
  title: string;
  description: string;
  repoLink: string | null;
  deploymentUrl: string | null;
  editStatus: 'NONE' | 'PENDING' | 'REJECTED';
  pendingData: string | null;
  members: { user: { id: number, name: string }, role: string }[];
};

export default function AdminProjectPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [allUsers, setAllUsers] = useState<{id: number, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editUrl, setEditUrl] = useState("");

  const fetchData = async () => {
    const [projRes, usersRes] = await Promise.all([
        fetch("/api/admin/projects"),
        fetch("/api/admin/users") 
    ]);
    
    if (projRes.ok) setProjects(await projRes.json());
    if (usersRes.ok) {
        const usersData = await usersRes.json();
        setAllUsers(Array.isArray(usersData) ? usersData : usersData.data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const startEdit = (project: Project) => {
    setEditingId(project.id);
    setEditUrl(project.deploymentUrl || "");
  };

  const saveEdit = async (id: string) => {
    const res = await fetch("/api/admin/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, deploymentUrl: editUrl })
    });

    if (res.ok) {
        setProjects(prev => prev.map(p => p.id === id ? { ...p, deploymentUrl: editUrl } : p));
        setEditingId(null);
    } else {
        alert("Gagal update link");
    }
  };

  const handleApproval = async (id: string, action: 'APPROVE_EDIT' | 'REJECT_EDIT') => {
    if (!confirm(action === 'APPROVE_EDIT' ? "Setujui perubahan ini?" : "Tolak perubahan ini?")) return;

    const res = await fetch("/api/admin/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action })
    });

    if (res.ok) {
        fetchData(); 
    } else {
        alert("Gagal memproses permintaan.");
    }
  };

  // KOMPONEN DIFF VIEWER YANG LEBIH TANGGUH
  const DiffItem = ({ label, oldVal, newVal, isChanged }: { label: string, oldVal: string, newVal: string, isChanged: boolean }) => {
      if (!isChanged) return null; 
      return (
          <div className="mb-4">
              <p className="text-[10px] font-bold text-yellow-600 uppercase mb-1">{label}</p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
                  <div className="bg-red-50 text-red-700 px-3 py-2 rounded-lg flex-1 line-through opacity-70 border border-red-100 break-all">
                      {oldVal || <span className="italic text-red-400">Kosong</span>}
                  </div>
                  <ArrowRight size={16} className="text-yellow-500 hidden sm:block shrink-0"/>
                  <div className="bg-green-50 text-green-700 px-3 py-2 rounded-lg flex-1 font-medium border border-green-100 break-all">
                      {newVal || <span className="italic text-green-400">Dihapus</span>}
                  </div>
              </div>
          </div>
      );
  };

  // Helper Pembersih String (Menyamakan format sebelum dibanding)
  const safeStr = (val: any) => (val || "").toString().trim().replace(/\r\n/g, '\n');

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Monitoring Project</h1>
        <p className="text-gray-500 text-sm">Review project peserta, verifikasi permintaan perubahan, dan tambahkan link deployment.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? <p className="animate-pulse text-gray-500 font-medium">Memuat data project...</p> : projects.map((p) => {
            const pendingChanges = p.pendingData ? JSON.parse(p.pendingData) : null;
            
            // --- LOGIKA PENGECEKAN PERUBAHAN YANG SANGAT AKURAT ---
            let isMembersChanged = false;
            let oldMembersStr = "";
            let newMembersStr = "";

            let isTitleChanged = false, isDescChanged = false, isRepoChanged = false, isDeployChanged = false;
            let oldTitle = "", newTitle = "", oldDesc = "", newDesc = "", oldRepo = "", newRepo = "", oldDeploy = "", newDeploy = "";

            if (pendingChanges) {
                // 1. Cek Text Fields
                oldTitle = safeStr(p.title);
                newTitle = safeStr(pendingChanges.title);
                isTitleChanged = oldTitle !== newTitle;

                oldDesc = safeStr(p.description);
                newDesc = safeStr(pendingChanges.description);
                isDescChanged = oldDesc !== newDesc;

                oldRepo = safeStr(p.repoLink);
                newRepo = safeStr(pendingChanges.repoLink);
                isRepoChanged = oldRepo !== newRepo;

                oldDeploy = safeStr(p.deploymentUrl);
                newDeploy = safeStr(pendingChanges.deploymentUrl);
                isDeployChanged = oldDeploy !== newDeploy;

                // 2. Cek Anggota
                if (pendingChanges.memberIds) {
                    const currentIds = p.members.map(m => m.user.id).sort();
                    const pendingIds = [...pendingChanges.memberIds].sort();
                    isMembersChanged = JSON.stringify(currentIds) !== JSON.stringify(pendingIds);
                    
                    if (isMembersChanged) {
                        oldMembersStr = p.members.map(m => m.user.name).join(", ");
                        newMembersStr = pendingChanges.memberIds.map((id: number) => {
                            const found = allUsers.find(u => u.id === id);
                            return found ? found.name : `ID: ${id}`;
                        }).join(", ");
                    }
                }
            }

            const hasAnyChanges = isTitleChanged || isDescChanged || isRepoChanged || isDeployChanged || isMembersChanged;

            return (
              <div key={p.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-6 overflow-hidden">
                  
                  {/* --- BAGIAN ATAS: INFO PROJECT SAAT INI --- */}
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-bold text-lg text-gray-800">{p.title}</h3>
                              {p.editStatus === 'PENDING' && (
                                  <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded-md uppercase tracking-wider flex items-center gap-1">
                                      <AlertTriangle size={12}/> Review Tertunda
                                  </span>
                              )}
                          </div>
                          
                          <div className="flex flex-wrap gap-2 my-3">
                              {p.members.map((m, i) => (
                                  <span key={i} className="text-[10px] font-bold px-2 py-1 bg-gray-100 rounded text-gray-600 border border-gray-200">
                                      {m.user.name} <span className="font-normal opacity-70">({m.role})</span>
                                  </span>
                              ))}
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{p.description}</p>
                          
                          {p.repoLink && (
                              <a href={p.repoLink} target="_blank" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 mt-4 hover:text-gray-900 transition">
                                  <Github size={14} /> Repository GitHub
                              </a>
                          )}
                      </div>

                      {/* --- BAGIAN KANAN: DEPLOYMENT URL --- */}
                      <div className="md:w-1/3 flex flex-col items-end justify-start md:border-l md:border-gray-100 md:pl-6">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Deployment URL</p>
                          
                          {editingId === p.id ? (
                              <div className="flex items-center gap-2 w-full">
                                  <input 
                                      value={editUrl}
                                      onChange={(e) => setEditUrl(e.target.value)}
                                      className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                      placeholder="https://..."
                                  />
                                  <button onClick={() => saveEdit(p.id)} className="p-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition"><Check size={16}/></button>
                                  <button onClick={() => setEditingId(null)} className="p-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition"><X size={16}/></button>
                              </div>
                          ) : (
                              <div className="flex items-center gap-3">
                                  {p.deploymentUrl ? (
                                      <a href={p.deploymentUrl} target="_blank" className="flex items-center gap-2 text-sm font-bold text-[#1193b5] hover:underline bg-blue-50 px-4 py-2 rounded-xl">
                                          <Globe size={14} /> Kunjungi Web <ExternalLink size={12}/>
                                      </a>
                                  ) : (
                                      <span className="text-sm text-gray-400 italic bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">Belum deploy</span>
                                  )}
                                  
                                  {/* MENGUNCI TOMBOL EDIT JIKA STATUS PENDING */}
                                  {p.editStatus === 'PENDING' ? (
                                      <span title="Draf sedang direview. Setujui atau tolak terlebih dahulu." className="text-gray-200 cursor-not-allowed">
                                          <Edit2 size={16} />
                                      </span>
                                  ) : (
                                      <button onClick={() => startEdit(p)} className="text-gray-400 hover:text-gray-700 transition" title="Edit Link Manual">
                                          <Edit2 size={16} />
                                      </button>
                                  )}
                              </div>
                          )}
                      </div>
                  </div>

                  {/* --- SECTION BAWAH: DIFF VIEWER --- */}
                  {p.editStatus === 'PENDING' && pendingChanges && (
                      <div className="mt-2 bg-yellow-50/30 border-2 border-yellow-200 rounded-xl overflow-hidden">
                          <div className="bg-yellow-100/50 px-4 py-3 border-b border-yellow-200 flex items-center justify-between">
                              <h4 className="text-xs font-bold text-yellow-800 uppercase tracking-wider flex items-center gap-2">
                                  <AlertTriangle size={14} className="text-yellow-600"/>
                                  Detail Perubahan yang Diajukan
                              </h4>
                          </div>
                          
                          <div className="p-4">
                              {/* Cek dan render field HANYA JIKA ADA PERUBAHAN */}
                              <DiffItem label="Judul Project" oldVal={oldTitle} newVal={newTitle} isChanged={isTitleChanged} />
                              <DiffItem label="Deskripsi" oldVal={oldDesc} newVal={newDesc} isChanged={isDescChanged} />
                              <DiffItem label="Repository Link" oldVal={oldRepo} newVal={newRepo} isChanged={isRepoChanged} />
                              <DiffItem label="Deployment URL" oldVal={oldDeploy} newVal={newDeploy} isChanged={isDeployChanged} />
                              <DiffItem label="Susunan Anggota Tim" oldVal={oldMembersStr} newVal={newMembersStr} isChanged={isMembersChanged} />

                              {/* Pesan fallback jika yang berubah hanya file Thumbnail gambar */}
                              {!hasAnyChanges && (
                                  <div className="p-3 bg-blue-50 text-blue-700 text-sm rounded-lg border border-blue-100 mb-4">
                                      ℹ️ Perubahan teks/anggota tidak terdeteksi. Peserta kemungkinan hanya mengajukan pembaruan <strong>Gambar Thumbnail</strong>.
                                  </div>
                              )}
                              
                              <div className="flex gap-3 mt-6">
                                  <button 
                                    onClick={() => handleApproval(p.id, 'REJECT_EDIT')} 
                                    className="px-6 py-2.5 text-xs font-bold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 rounded-xl transition"
                                  >
                                      Tolak
                                  </button>
                                  <button 
                                    onClick={() => handleApproval(p.id, 'APPROVE_EDIT')} 
                                    className="px-6 py-2.5 text-xs font-bold text-white bg-green-500 hover:bg-green-600 shadow-sm shadow-green-200 rounded-xl transition"
                                  >
                                      Setujui Perubahan
                                  </button>
                              </div>
                          </div>
                      </div>
                  )}

              </div>
          )
        })}
      </div>
    </div>
  );
}