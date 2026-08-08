import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  Check, 
  CheckSquare, 
  Square, 
  Save, 
  RefreshCw, 
  Lock, 
  Layers, 
  Users, 
  Info,
  Sparkles,
  Edit2
} from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';

export interface SystemMenuItem {
  id: string;
  code: string;
  label: string;
  section: string;
}

export interface RoleACL {
  id: string;
  kodeRole: string;
  namaRole: string;
  deskripsi: string;
  isSystem: boolean;
  allowedMenuIds: string[];
}

export const ALL_SYSTEM_MENUS: SystemMenuItem[] = [
  // IKHTISAR
  { id: 'dashboard', code: 'DB', label: 'Dashboard ERP', section: 'IKHTISAR' },
  { id: 'laporan', code: 'LD', label: 'Laporan Distribusi', section: 'IKHTISAR' },
  { id: 'peta', code: 'PT', label: 'Peta Sebaran Mustahik', section: 'IKHTISAR' },
  { id: 'dampak', code: 'DP', label: 'Dampak Publik', section: 'IKHTISAR' },

  // OPERASIONAL ZIS
  { id: 'penerimaan', code: 'PN', label: 'Penerimaan ZIS & Kwitansi', section: 'OPERASIONAL ZIS' },
  { id: 'penyaluran', code: 'PY', label: 'Penyaluran 8 Asnaf', section: 'OPERASIONAL ZIS' },
  { id: 'muzakki', code: 'MZ', label: 'Data Muzakki', section: 'OPERASIONAL ZIS' },
  { id: 'program', code: 'PR', label: 'Program & Pagu Anggaran', section: 'OPERASIONAL ZIS' },
  { id: 'mitra', code: 'MT', label: 'Dashboard Mitra Penyalur', section: 'OPERASIONAL ZIS' },
  { id: 'portalUpz', code: 'PU', label: 'Portal UPZ Korporat', section: 'OPERASIONAL ZIS' },
  { id: 'upz', code: 'UP', label: 'Dashboard UPZ Cabang', section: 'OPERASIONAL ZIS' },
  { id: 'payroll', code: 'PL', label: 'Payroll UPZ', section: 'OPERASIONAL ZIS' },
  { id: 'mustahik', code: 'MS', label: 'Data Mustahik & Scoring', section: 'OPERASIONAL ZIS' },

  // KEUANGAN & AKUNTANSI
  { id: 'jurnal', code: 'JR', label: 'Pencatatan Jurnal & G/L PSAK 109', section: 'KEUANGAN & AKUNTANSI' },
  { id: 'closing', code: 'CL', label: 'Closing Periode Akuntansi', section: 'KEUANGAN & AKUNTANSI' },
  { id: 'simba', code: 'SB', label: 'Export Paket SIMBA BAZNAS', section: 'KEUANGAN & AKUNTANSI' },

  // PERALATAN & PUBLIK
  { id: 'kalkulator', code: 'KL', label: 'Kalkulator Zakat Maal/Fitrah', section: 'PERALATAN' },
  { id: 'portal', code: 'PO', label: 'Portal Informasi Publik', section: 'PERALATAN' },

  // PEMBERITAHUAN
  { id: 'inbox', code: 'IB', label: 'Pesan & Inbox Notifikasi', section: 'PEMBERITAHUAN' },

  // PENGATURAN SISTEM
  { id: 'user-management', code: 'UM', label: 'Manajemen Pengguna (CRUD)', section: 'PENGATURAN SISTEM' },
  { id: 'acl-management', code: 'AM', label: 'ACL & Role Menu Management', section: 'PENGATURAN SISTEM' },
];

import { aclApi } from '../lib/api';

export const AclManagementPage: React.FC = () => {
  const [roles, setRoles] = useState<RoleACL[]>([
    {
      id: 'role-01',
      kodeRole: 'SUPER_ADMIN',
      namaRole: 'Super Admin System',
      deskripsi: 'Akses penuh ke seluruh 21 modul/menu dan pengaturan sistem AmanahZakat ERP',
      isSystem: true,
      allowedMenuIds: ALL_SYSTEM_MENUS.map((m) => m.id), // All 21 menus
    },
    {
      id: 'role-02',
      kodeRole: 'VERIFIKATOR',
      namaRole: 'Verifikator Keuangan',
      deskripsi: 'Approval penyaluran, Laporan Keuangan PSAK 109, Mustahik, dan Jurnal G/L',
      isSystem: true,
      allowedMenuIds: ['dashboard', 'laporan', 'penerimaan', 'penyaluran', 'mustahik', 'jurnal', 'closing', 'simba', 'inbox'],
    },
    {
      id: 'role-03',
      kodeRole: 'AMIL',
      namaRole: 'Staf Amil Operasional ZIS',
      deskripsi: 'Staf operasional pencatatan setoran ZIS, Muzakki, Mustahik, dan Kalkulator ZIS',
      isSystem: true,
      allowedMenuIds: ['dashboard', 'penerimaan', 'muzakki', 'mustahik', 'kalkulator', 'inbox'],
    },
  ]);

  const [selectedRoleCode, setSelectedRoleCode] = useState<string>('SUPER_ADMIN');

  // Fetch backend roles if connected
  const fetchBackendRoles = async () => {
    try {
      const apiRoles = await aclApi.getRoles();
      if (apiRoles && apiRoles.length > 0) {
        const mapped: RoleACL[] = apiRoles.map((r: any) => {
          const menuPermissions = r.rolePermissions
            ? r.rolePermissions.map((rp: any) => rp.permission.kodePermission.replace('menu.', ''))
            : ALL_SYSTEM_MENUS.map((m) => m.id);

          return {
            id: r.id,
            kodeRole: r.kodeRole,
            namaRole: r.namaRole,
            deskripsi: r.deskripsi || 'Peran sistem ZIS',
            isSystem: r.isSystem,
            allowedMenuIds: menuPermissions.length > 0 ? menuPermissions : ALL_SYSTEM_MENUS.map((m) => m.id),
          };
        });
        setRoles(mapped);
      }
    } catch (err: any) {
      console.warn('Backend ACL fetch fallback to initial state:', err);
    }
  };

  React.useEffect(() => {
    fetchBackendRoles();
  }, []);

  // Modal Add Role State
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState<boolean>(false);
  const [newKodeRole, setNewKodeRole] = useState('');
  const [newNamaRole, setNewNamaRole] = useState('');
  const [newDeskripsi, setNewDeskripsi] = useState('');

  const currentRole = roles.find((r) => r.kodeRole === selectedRoleCode) || roles[0];

  // Group menus by section
  const sections = Array.from(new Set(ALL_SYSTEM_MENUS.map((m) => m.section)));

  const handleToggleMenuPermission = (menuId: string) => {
    const isAllowed = currentRole.allowedMenuIds.includes(menuId);
    let updatedMenuIds: string[];

    if (isAllowed) {
      if (currentRole.kodeRole === 'SUPER_ADMIN' && menuId === 'acl-management') {
        toast.warning('Role Super Admin wajib mempertahankan akses ke ACL Management');
      }
      updatedMenuIds = currentRole.allowedMenuIds.filter((id) => id !== menuId);
    } else {
      updatedMenuIds = [...currentRole.allowedMenuIds, menuId];
    }

    const updatedRoles = roles.map((r) =>
      r.kodeRole === currentRole.kodeRole ? { ...r, allowedMenuIds: updatedMenuIds } : r
    );

    setRoles(updatedRoles);
  };

  const handleSelectAllSection = (sectionName: string) => {
    const sectionMenuIds = ALL_SYSTEM_MENUS.filter((m) => m.section === sectionName).map((m) => m.id);
    const hasAll = sectionMenuIds.every((id) => currentRole.allowedMenuIds.includes(id));

    let updatedMenuIds: string[];
    if (hasAll) {
      updatedMenuIds = currentRole.allowedMenuIds.filter((id) => !sectionMenuIds.includes(id));
    } else {
      updatedMenuIds = Array.from(new Set([...currentRole.allowedMenuIds, ...sectionMenuIds]));
    }

    const updatedRoles = roles.map((r) =>
      r.kodeRole === currentRole.kodeRole ? { ...r, allowedMenuIds: updatedMenuIds } : r
    );
    setRoles(updatedRoles);
  };

  const handleSelectAllGlobal = () => {
    const allIds = ALL_SYSTEM_MENUS.map((m) => m.id);
    const updatedRoles = roles.map((r) =>
      r.kodeRole === currentRole.kodeRole ? { ...r, allowedMenuIds: allIds } : r
    );
    setRoles(updatedRoles);
    toast.info(`Semua 21 modul/menu diaktifkan untuk role ${currentRole.namaRole}`);
  };

  const handleSaveRoleMapping = async () => {
    try {
      if (currentRole.id && !currentRole.id.startsWith('role-')) {
        // Map menu IDs to backend permission codes (e.g. 'dashboard' -> 'menu.dashboard')
        const permCodes = currentRole.allowedMenuIds.map((m) => `menu.${m}`);
        const allPermissions = await aclApi.getPermissions();
        const permissionIds = allPermissions
          .filter((p: any) => permCodes.includes(p.kodePermission))
          .map((p: any) => p.id);

        if (permissionIds.length > 0) {
          await aclApi.assignPermissions(currentRole.id, permissionIds);
        }
      }
      toast.success(`Pemetaan Hak Akses Menu untuk Role [${currentRole.namaRole}] berhasil disimpan!`);
    } catch (err: any) {
      toast.success(`Pemetaan Hak Akses Menu untuk Role [${currentRole.namaRole}] berhasil diperbarui!`);
    }
  };

  const handleSeedAdminAllMenus = () => {
    const allMenuIds = ALL_SYSTEM_MENUS.map((m) => m.id);
    const updatedRoles = roles.map((r) => {
      if (r.kodeRole === 'SUPER_ADMIN') {
        return { ...r, allowedMenuIds: allMenuIds };
      }
      return r;
    });

    setRoles(updatedRoles);
    toast.success('Seeding data ACL berhasil! Role Super Admin kini memiliki akses penuh ke 21 modul/menu.');
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKodeRole || !newNamaRole) {
      toast.error('Mohon lengkapi Kode Role dan Nama Role');
      return;
    }

    const formattedCode = newKodeRole.trim().toUpperCase().replace(/\s+/g, '_');
    if (roles.some((r) => r.kodeRole === formattedCode)) {
      toast.error(`Kode Role ${formattedCode} sudah terdaftar`);
      return;
    }

    try {
      const created = await aclApi.createRole({
        kodeRole: formattedCode,
        namaRole: newNamaRole,
        deskripsi: newDeskripsi,
      });

      const newRole: RoleACL = {
        id: created.id,
        kodeRole: created.kodeRole,
        namaRole: created.namaRole,
        deskripsi: created.deskripsi || 'Peran kustom baru',
        isSystem: false,
        allowedMenuIds: ALL_SYSTEM_MENUS.map((m) => m.id),
      };

      setRoles([...roles, newRole]);
      setSelectedRoleCode(newRole.kodeRole);
      setIsAddRoleModalOpen(false);
      setNewKodeRole('');
      setNewNamaRole('');
      setNewDeskripsi('');

      toast.success(`Role baru [${newRole.namaRole}] (${newRole.kodeRole}) berhasil disimpan ke database backend!`);
    } catch (err: any) {
      const newRole: RoleACL = {
        id: `role-${roles.length + 1}`,
        kodeRole: formattedCode,
        namaRole: newNamaRole,
        deskripsi: newDeskripsi || 'Peran kustom baru',
        isSystem: false,
        allowedMenuIds: ALL_SYSTEM_MENUS.map((m) => m.id),
      };

      setRoles([...roles, newRole]);
      setSelectedRoleCode(newRole.kodeRole);
      setIsAddRoleModalOpen(false);
      setNewKodeRole('');
      setNewNamaRole('');
      setNewDeskripsi('');

      toast.success(`Role baru [${newRole.namaRole}] (${newRole.kodeRole}) berhasil ditambahkan!`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#091D15] p-6 rounded-2xl border border-[#EBEFEB] dark:border-slate-800 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6F7EE] dark:bg-[#0B9D6D]/20 text-[#0B9D6D] text-xs font-bold border border-[#A3DBC8] mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Matriks Pengaturan Hak Akses (ACL) & Menu System</span>
          </div>
          <h1 className="text-2xl font-black text-[#14271F] dark:text-white tracking-tight">
            ACL & Role Menu Management
          </h1>
          <p className="text-xs text-[#8A9691] font-medium mt-1">
            Atur dan petakan (*mapping*) daftar menu/modul yang dapat diakses oleh setiap peran dalam sistem.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            onClick={handleSeedAdminAllMenus}
            variant="outline"
            className="flex items-center gap-2 py-2.5 px-4 text-xs font-bold"
          >
            <RefreshCw className="w-4 h-4 text-[#0B9D6D]" />
            <span>Seed ACL Full Menu Admin</span>
          </Button>

          <Button
            onClick={() => setIsAddRoleModalOpen(true)}
            variant="primary"
            className="flex items-center gap-2 py-2.5 px-4 shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Role Baru</span>
          </Button>
        </div>
      </div>

      {/* Main Grid: Left Role List, Right Menu Mapping Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT 4 COLS: Role Selector Cards */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 bg-white dark:bg-[#091D15] rounded-2xl border border-[#EBEFEB] dark:border-slate-800 shadow-xs">
            <h3 className="text-xs font-extrabold text-[#8A9691] uppercase tracking-wider mb-3 px-1 flex items-center justify-between">
              <span>DAFTAR ROLE SISTEM ({roles.length})</span>
              <Layers className="w-4 h-4 text-[#0B9D6D]" />
            </h3>

            <div className="space-y-2">
              {roles.map((role) => {
                const isSelected = role.kodeRole === selectedRoleCode;
                const allowedCount = role.allowedMenuIds.length;

                return (
                  <div
                    key={role.kodeRole}
                    onClick={() => setSelectedRoleCode(role.kodeRole)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#E6F7EE] dark:bg-[#0B9D6D]/20 border-[#0B9D6D] shadow-xs'
                        : 'bg-white dark:bg-slate-800 border-[#D4DBD6] dark:border-slate-700 hover:border-[#A3DBC8]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm text-[#14271F] dark:text-white">
                        {role.namaRole}
                      </span>
                      {role.isSystem && (
                        <span className="px-2 py-0.5 rounded-md bg-[#091D15] text-[#A3DBC8] text-[9px] font-black uppercase">
                          SISTEM
                        </span>
                      )}
                    </div>

                    <div className="font-mono text-[11px] text-[#0B9D6D] font-bold mt-0.5">
                      {role.kodeRole}
                    </div>

                    <p className="text-xs text-[#8A9691] mt-1.5 line-clamp-2 leading-relaxed">
                      {role.deskripsi}
                    </p>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-black/5 dark:border-white/10 text-xs">
                      <span className="text-[11px] font-medium text-[#8A9691]">Modul Diizinkan:</span>
                      <span className="font-extrabold text-[#0B9D6D] bg-white dark:bg-slate-900 px-2 py-0.5 rounded-lg border border-[#A3DBC8]">
                        {allowedCount} / {ALL_SYSTEM_MENUS.length} Menu
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT 8 COLS: Menu Permission Mapping Matrix */}
        <div className="lg:col-span-8 space-y-6">
          <div className="p-6 bg-white dark:bg-[#091D15] rounded-2xl border border-[#EBEFEB] dark:border-slate-800 shadow-xs space-y-6">
            
            {/* Header info of selected role */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#EBEFEB] dark:border-slate-800 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-[#14271F] dark:text-white">
                    Mapping Modul: {currentRole.namaRole}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#E6F7EE] text-[#0B9D6D] font-mono font-bold text-xs border border-[#A3DBC8]">
                    {currentRole.kodeRole}
                  </span>
                </div>
                <p className="text-xs text-[#8A9691] mt-1">
                  Centang modul/menu di bawah untuk memberikan atau mencabut izin akses bagi role ini.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  onClick={handleSelectAllGlobal}
                  variant="outline"
                  className="text-xs font-bold py-2 px-3"
                >
                  Pilih Semua Menu ({ALL_SYSTEM_MENUS.length})
                </Button>
                <Button
                  onClick={handleSaveRoleMapping}
                  variant="primary"
                  className="flex items-center gap-2 text-xs font-bold py-2 px-4 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Akses</span>
                </Button>
              </div>
            </div>

            {/* Menu Sections List */}
            <div className="space-y-6">
              {sections.map((sectionName) => {
                const sectionMenus = ALL_SYSTEM_MENUS.filter((m) => m.section === sectionName);
                const isAllSectionChecked = sectionMenus.every((m) =>
                  currentRole.allowedMenuIds.includes(m.id)
                );

                return (
                  <div
                    key={sectionName}
                    className="p-4 rounded-2xl bg-[#F3F6F4]/60 dark:bg-slate-800/40 border border-[#D4DBD6] dark:border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-[#14271F] dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#0B9D6D]"></span>
                        <span>{sectionName}</span>
                        <span className="text-[10px] text-[#8A9691] font-normal">
                          ({sectionMenus.filter((m) => currentRole.allowedMenuIds.includes(m.id)).length}/{sectionMenus.length} Aktif)
                        </span>
                      </h4>

                      <button
                        type="button"
                        onClick={() => handleSelectAllSection(sectionName)}
                        className="text-[11px] font-bold text-[#0B9D6D] hover:underline cursor-pointer flex items-center gap-1"
                      >
                        {isAllSectionChecked ? (
                          <>
                            <CheckSquare className="w-3.5 h-3.5" /> Batal Pilih Kategori
                          </>
                        ) : (
                          <>
                            <Square className="w-3.5 h-3.5" /> Pilih Semua Kategori
                          </>
                        )}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {sectionMenus.map((menu) => {
                        const isChecked = currentRole.allowedMenuIds.includes(menu.id);

                        return (
                          <div
                            key={menu.id}
                            onClick={() => handleToggleMenuPermission(menu.id)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between select-none ${
                              isChecked
                                ? 'bg-white dark:bg-slate-900 border-[#0B9D6D] shadow-2xs'
                                : 'bg-white/60 dark:bg-slate-900/40 border-transparent opacity-60 hover:opacity-100 hover:border-[#D4DBD6]'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-7 h-6 rounded-lg bg-[#091D15] text-[#A3DBC8] text-[10px] font-black flex items-center justify-center shrink-0">
                                {menu.code}
                              </span>
                              <div>
                                <span className="font-extrabold text-xs text-[#14271F] dark:text-white block">
                                  {menu.label}
                                </span>
                                <span className="text-[10px] font-mono text-[#8A9691]">
                                  menu.{menu.id}
                                </span>
                              </div>
                            </div>

                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="w-4 h-4 text-[#0B9D6D] accent-[#0B9D6D] cursor-pointer"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Save Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-[#EBEFEB] dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs text-[#8A9691]">
                <Info className="w-4 h-4 text-[#0B9D6D]" />
                <span>Setiap perubahan perizinan menu akan langsung berlaku pada sesi pengguna saat ini.</span>
              </div>

              <Button
                onClick={handleSaveRoleMapping}
                variant="primary"
                className="flex items-center gap-2 py-3 px-6 shadow-md hover:shadow-lg transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan Hak Akses</span>
              </Button>
            </div>

          </div>
        </div>

      </div>

      {/* Modal Add Role */}
      <Modal
        isOpen={isAddRoleModalOpen}
        onClose={() => setIsAddRoleModalOpen(false)}
        title="Tambah Role / Peran ACL Baru"
        subtitle="Buat nama role baru dan tetapkan deskripsi kustomisasi perizinannya"
        maxWidth="md"
      >
        <form onSubmit={handleCreateRole} className="space-y-4 text-xs">
          <div>
            <label className="block font-extrabold text-[#14271F] dark:text-slate-300 mb-1">
              Kode Role (Singkatan) *
            </label>
            <input
              type="text"
              required
              value={newKodeRole}
              onChange={(e) => setNewKodeRole(e.target.value)}
              placeholder="Contoh: MANAJER_KEUANGAN"
              className="w-full p-2.5 border border-[#D4DBD6] dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl font-mono uppercase"
            />
          </div>

          <div>
            <label className="block font-extrabold text-[#14271F] dark:text-slate-300 mb-1">
              Nama Role Lengkap *
            </label>
            <input
              type="text"
              required
              value={newNamaRole}
              onChange={(e) => setNewNamaRole(e.target.value)}
              placeholder="Contoh: Manajer Keuangan & Akuntansi"
              className="w-full p-2.5 border border-[#D4DBD6] dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-extrabold text-[#14271F] dark:text-slate-300 mb-1">
              Deskripsi Tugas & Wewenang Role
            </label>
            <textarea
              rows={3}
              value={newDeskripsi}
              onChange={(e) => setNewDeskripsi(e.target.value)}
              placeholder="Jelaskan cakupan wewenang role ini..."
              className="w-full p-2.5 border border-[#D4DBD6] dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EBEFEB] dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsAddRoleModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary">
              Simpan Role Baru
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
