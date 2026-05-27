'use client';

import { useState } from 'react';
import { User as UserIcon, Shield, UserCog, Mail, Phone, Building2, Briefcase, Edit } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AssignRoleModal from '@/components/admin/AssignRoleModal';
import EditUserModal from '@/app/admin/users/EditUserModal';

export default function UserTableClient({ initialUsers }: { initialUsers: any[] }) {
  const router = useRouter();
  
  // State untuk mengontrol modal mana yang terbuka
  const [selectedUserForRole, setSelectedUserForRole] = useState<any | null>(null);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<any | null>(null);

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Nama & Email</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">Role</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Instansi</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Penempatan</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">Face ID</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {initialUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                  {/* Info User */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                        {u.name?.charAt(0).toUpperCase() || <UserIcon size={16} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{u.name || "N/A"}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1"><Mail size={12}/> {u.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      u.role === 'ADMIN' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {u.role === 'ADMIN' ? <Shield size={10}/> : <UserCog size={10}/>}
                      {u.role}
                    </span>
                  </td>

                  {/* Instansi */}
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                       <Building2 size={14} className="text-gray-300"/> {u.agency || "Belum diisi"}
                    </div>
                  </td>

                  {/* Penempatan */}
                  <td className="px-6 py-4">
                    {u.role === 'ADMIN' ? (
                      <span className="text-sm font-medium text-gray-400">-</span>
                    ) : (
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-700">
                          {u.bidang && u.bidang !== 'UNASSIGNED' ? u.bidang.replace('_', ' ') : 'Belum Ditempatkan'}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          {u.peran && u.peran !== 'UNASSIGNED' ? u.peran.replace('_', ' ') : '-'}
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Face ID */}
                  <td className="px-6 py-4">
                    {u.role === 'ADMIN' ? (
                      <span className="text-sm font-medium text-gray-400">-</span>
                    ) : (
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-700">
                          {u.bidang && u.bidang !== 'UNASSIGNED' ? u.bidang.replace('_', ' ') : 'Belum Ditempatkan'}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          {u.peran && u.peran !== 'UNASSIGNED' ? u.peran.replace('_', ' ') : '-'}
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Aksi (Tombol-tombol) */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Tombol Edit Profil */}
                      <button 
                        onClick={() => setSelectedUserForEdit(u)}
                        className="text-xs font-bold text-gray-500 hover:text-[#1193b5] bg-gray-100 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition"
                      >
                        Edit
                      </button>
                      
                      {/* Tombol Penempatan Divisi */}
                      {u.role !== 'ADMIN' && (
                        <button
                          onClick={() => setSelectedUserForRole(u)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-[#1193b5] hover:bg-blue-600 rounded-lg transition-colors"
                        >
                          <Briefcase size={12} /> Penempatan
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Render Modals di luar tabel */}
      {selectedUserForRole && (
        <AssignRoleModal 
          user={selectedUserForRole} 
          onClose={() => setSelectedUserForRole(null)} 
          onSuccess={() => {
             router.refresh(); // Memuat ulang data dari server secara otomatis!
          }}
        />
      )}

      {selectedUserForEdit && (
        <EditUserModal 
          user={selectedUserForEdit} 
          onClose={() => {
              setSelectedUserForEdit(null);
              router.refresh(); // Memuat ulang tabel jika ada perubahan data
          }} 
        />
      )}
    </>
  );
}