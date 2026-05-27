"use client";

import { useState, useEffect } from "react";
// 1. Tambahkan import useSession
import { useSession } from "next-auth/react"; 
import { Plus, Github, Globe, User as UserIcon, Loader2, FolderGit2, X, Search, Check, Edit2, Maximize2, Image as ImageIcon, CheckCircle2 } from "lucide-react";
import Image from "next/image";

// Types
type Project = {
  id: string;
  title: string;
  description: string;
  repoLink?: string;
  deploymentUrl?: string;
  thumbnailUrl?: string; 
  editStatus?: 'NONE' | 'PENDING' | 'REJECTED';
  members: { user: { id: number; name: string }, role: string }[];
};

type UserOption = { id: number; name: string };

export default function ProjectsPage() {
  // 2. Ambil data sesi user saat ini
  const { data: session } = useSession();
  const currentUserId = session?.user?.id ? parseInt(session.user.id as string) : null;

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Data
  const [allUsers, setAllUsers] = useState<UserOption[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    repoLink: "",
    deploymentUrl: ""
    });

  // 1. Fetch Data
  const fetchData = async () => {
    const [projRes, userRes] = await Promise.all([
        fetch("/api/projects"),
        fetch("/api/user/list")
    ]);
    if (projRes.ok) setProjects(await projRes.json());
    if (userRes.ok) setAllUsers(await userRes.json());
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // 3. LOGIKA UTAMA: Cek apakah user sudah punya project
  const hasProject = currentUserId 
    ? projects.some(p => p.members.some(m => m.user.id === currentUserId)) 
    : false;

  // 2. Handlers
  const handleOpenCreate = () => {
    setEditingProject(null);
    setSelectedIds([]); // Clear members on create
    setThumbnailFile(null);
    setFormData({ title: "", description: "", repoLink: "", deploymentUrl: "" });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation(); 
    setEditingProject(project);
    setSelectedIds(project.members.map(m => m.user.id)); 
    setThumbnailFile(null);
    setFormData({
        title: project.title || "",
        description: project.description || "",
        repoLink: project.repoLink || "",
        deploymentUrl: project.deploymentUrl || ""
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    // Append extra data manually
    formData.append("memberIds", JSON.stringify(selectedIds));
    if (thumbnailFile) formData.append("thumbnail", thumbnailFile);
    
    // Determine Method (POST or PATCH)
    const method = editingProject ? "PATCH" : "POST";
    if (editingProject) formData.append("id", editingProject.id);

    const res = await fetch("/api/projects", { method, body: formData });

    if (res.ok) {
        setIsFormOpen(false);
        setEditingProject(null);
        setThumbnailFile(null);
        fetchData(); 
    } else {
        alert("Gagal menyimpan project");
    }
    setIsSubmitting(false);
  };

  const filteredUsers = allUsers.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) && !selectedIds.includes(u.id)
  );

  const checkHasChanges = () => {
      if (!editingProject) return true; // Jika buat project baru, tombol selalu aktif
      
      // 1. Cek perubahan teks
      if (formData.title !== editingProject.title) return true;
      if (formData.description !== editingProject.description) return true;
      if (formData.repoLink !== (editingProject.repoLink || "")) return true;
      if (formData.deploymentUrl !== (editingProject.deploymentUrl || "")) return true;
      
      // 2. Cek jika ada file gambar baru yang diunggah
      if (thumbnailFile !== null) return true;

      // 3. Cek perubahan anggota tim (susunan ID)
      const currentMemberIds = [...editingProject.members.map(m => m.user.id)].sort();
      const newMemberIds = [...selectedIds].sort();
      if (JSON.stringify(currentMemberIds) !== JSON.stringify(newMemberIds)) return true;

      return false; // Jika lolos semua di atas, berarti TIDAK ADA PERUBAHAN
  };

  const hasChanges = checkHasChanges();

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <FolderGit2 className="text-[#1193b5]" /> Repository Project
            </h1>
            <p className="text-gray-500 text-sm">Showcase hasil karya selama magang.</p>
        </div>
        
        {/* 4. KUNCI TOMBOL UPLOAD JIKA SUDAH PUNYA PROJECT */}
        <div className="flex flex-col items-start md:items-end">
                <button 
                    onClick={handleOpenCreate}
                    disabled={hasProject}
                    title={hasProject ? "Anda sudah tergabung dalam sebuah project (Maks 1)." : "Upload Project Baru"}
                    className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all
                        ${hasProject 
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none border border-gray-200' 
                            : 'bg-[#1193b5] hover:bg-blue-600 text-white shadow-md hover:shadow-lg'
                        }
                    `}
                >
                    <Plus size={18} /> Upload Project
                </button>
                
                {/* Small note below the button if they are already in a project */}
                {hasProject && (
                    <span className="text-[10px] text-gray-400 mt-2 font-medium flex items-center gap-1">
                        <CheckCircle2 size={12} className="text-green-500" />
                        Anda sudah tergabung dalam 1 project aktif.
                    </span>
                )}
            </div>
      </div>

      {/* Grid Gallery */}
      {loading ? (
        <div className="text-center py-20 text-gray-400"><Loader2 className="animate-spin mx-auto mb-2"/>Loading gallery...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-medium">Belum ada project.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p) => (
                <div 
                    key={p.id} 
                    onClick={() => setSelectedProject(p)} 
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col h-full overflow-hidden group relative"
                >
                    {/* Thumbnail Section */}
                    <div className="h-48 bg-gray-100 w-full relative overflow-hidden">
                        {p.thumbnailUrl ? (
                            <Image src={p.thumbnailUrl} alt={p.title} width={400} height={200} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <FolderGit2 size={48} />
                            </div>
                        )}
                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
                        
                        {/* Tombol Edit / Status Badge (Floating) */}
                        {p.editStatus === 'PENDING' ? (
                            <div className="absolute top-3 right-3 px-3 py-1 bg-yellow-500 text-white text-[10px] font-bold rounded-full shadow-sm z-10">
                                Menunggu Approval
                            </div>
                        ) : (
                            <button 
                                onClick={(e) => handleOpenEdit(p, e)}
                                className="absolute top-3 right-3 p-2 bg-white/90 rounded-full text-gray-700 hover:text-blue-600 hover:bg-white shadow-sm z-10"
                                title="Edit Project"
                            >
                                <Edit2 size={16} />
                            </button>
                        )}
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                        <h3 className="font-bold text-lg text-gray-800 mb-2 group-hover:text-[#1193b5] transition-colors">{p.title}</h3>
                        <p className="text-gray-500 text-sm line-clamp-3 mb-4 flex-1">{p.description}</p>
                        
                        {/* Members Tag */}
                        <div className="flex flex-wrap gap-2 mt-auto">
                            {p.members.slice(0, 3).map((m, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold bg-gray-50 text-gray-600 border border-gray-200">
                                    <UserIcon size={10} /> {m.user.name}
                                </span>
                            ))}
                            {p.members.length > 3 && <span className="text-[10px] text-gray-400 self-center">+{p.members.length - 3}</span>}
                        </div>
                    </div>
                </div>
            ))}
        </div>
      )}

      {/* --- 1. DETAILS MODAL (POPUP) --- */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedProject(null)}>
            <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl animate-in zoom-in-95 overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                
                {/* Scrollable Content */}
                <div className="overflow-y-auto">
                    {/* Big Thumbnail */}
                    <div className="w-full h-64 md:h-80 bg-gray-100 relative">
                        {selectedProject.thumbnailUrl ? (
                             <Image src={selectedProject.thumbnailUrl} alt="Thumbnail" fill className="object-cover" />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-300"><ImageIcon size={64}/></div>
                        )}
                        <button onClick={() => setSelectedProject(null)} className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"><X size={20}/></button>
                    </div>

                    <div className="p-8">
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-3xl font-bold text-gray-900">{selectedProject.title}</h2>
                            <div className="flex gap-3">
                                {selectedProject.repoLink && (
                                    <a href={selectedProject.repoLink} target="_blank" className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm font-bold hover:bg-gray-200">
                                        <Github size={18}/> Repo
                                    </a>
                                )}
                                {selectedProject.deploymentUrl && (
                                    <a href={selectedProject.deploymentUrl} target="_blank" className="flex items-center gap-2 px-4 py-2 bg-[#1193b5] text-white rounded-lg text-sm font-bold hover:bg-blue-600">
                                        <Globe size={18}/> Visit
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Full Description */}
                        <div className="prose prose-sm max-w-none text-gray-600 mb-8 whitespace-pre-wrap">
                            {selectedProject.description}
                        </div>

                        <hr className="border-gray-100 mb-6"/>

                        {/* Team Members */}
                        <h4 className="font-bold text-gray-900 mb-4">Tim Project</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {selectedProject.members.map((m, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                        {m.user.name.substring(0,2).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-700">{m.user.name}</p>
                                        <p className="text-xs text-gray-400">{m.role}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* --- 2. UPLOAD / EDIT FORM MODAL --- */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-2x1 shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-gray-100 shrink-0 flex justify-between items-center">
                    <h2 className="font-bold text-xl">{editingProject ? "Edit Project" : "Upload Project Baru"}</h2>
                    <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-black"><X size={24}/></button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
                    
                    {/* Thumbnail Input */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Thumbnail Project</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition cursor-pointer relative">
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => setThumbnailFile(e.target.files ? e.target.files[0] : null)}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <div className="flex flex-col items-center gap-2 text-gray-500">
                                <ImageIcon size={32} className="text-gray-300"/>
                                <span className="text-sm font-medium">
                                    {thumbnailFile ? thumbnailFile.name : "Klik untuk upload cover image"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Nama Project</label>
                        <input name="title" 
                            value={formData.title} 
                            onChange={e => setFormData({...formData, title: e.target.value})} 
                            required className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 outline-none" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Deskripsi Lengkap</label>
                        <textarea name="description" 
                            value={formData.description} 
                            onChange={e => setFormData({...formData, description: e.target.value})} 
                            required rows={5} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 outline-none resize-none" 
                        />
                    </div>
                    
                    <div className="relative">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Anggota Tim</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {selectedIds.map(id => {
                                const user = allUsers.find(u => u.id === id) || editingProject?.members.find(m => m.user.id === id)?.user;
                                
                                return (
                                    <span key={id} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                                        {user?.name || "Loading..."}
                                        <button type="button" onClick={() => setSelectedIds(prev => prev.filter(i => i !== id))} className="hover:text-red-500"><X size={14} /></button>
                                    </span>
                                )
                            })}
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                            <input 
                                type="text"
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setIsDropdownOpen(true); }}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm"
                                placeholder="Cari nama teman..."
                            />
                        </div>
                        {isDropdownOpen && searchQuery && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-40 overflow-y-auto">
                                {filteredUsers.map((u) => (
                                    <div key={u.id} onClick={() => { setSelectedIds([...selectedIds, u.id]); setSearchQuery(""); setIsDropdownOpen(false); }} className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm">
                                        {u.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">GitHub URL</label>
                            <input name="repoLink" 
                                value={formData.repoLink} 
                                onChange={e => setFormData({...formData, repoLink: e.target.value})} 
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none" placeholder="https://..." 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Deployment URL</label>
                            <input name="deploymentUrl" 
                                value={formData.deploymentUrl} 
                                onChange={e => setFormData({...formData, deploymentUrl: e.target.value})} 
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none" placeholder="https://..." 
                            />
                        </div>
                    </div>
                    
                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={() => setIsFormOpen(false)} className="flex-1 py-3 font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition">Batal</button>
                        
                        {/* KUNCI TOMBOL JIKA TIDAK ADA PERUBAHAN */}
                        <button 
                            type="submit" 
                            disabled={isSubmitting || !hasChanges} 
                            className={`flex-1 py-3 font-bold text-white rounded-xl transition 
                                ${isSubmitting || !hasChanges 
                                    ? 'bg-gray-300 cursor-not-allowed opacity-100' 
                                    : 'bg-[#1193b5] hover:bg-blue-600 shadow-md'
                                }`}
                        >
                            {isSubmitting ? "Memproses..." : (editingProject ? "Ajukan Perubahan" : "Simpan Project")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}