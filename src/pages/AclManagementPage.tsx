import React, { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  CheckSquare,
  Square,
  Save,
  Layers,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { aclApi } from '../lib/api';
import type { CatalogMenu, CatalogModul } from '../types/acl';

interface RoleACL {
  id: string;
  kodeRole: string;
  namaRole: string;
  deskripsi: string;
  isSystem: boolean;
  permissionIds: string[];
}

function menuReadPermission(menu: CatalogMenu) {
  return menu.permissions.find((permission) => permission.aksi === 'read') || menu.permissions[0];
}

function isMenuAllowed(menu: CatalogMenu, permissionIds: string[]) {
  return menu.permissions.some((permission) => permissionIds.includes(permission.id));
}

export const AclManagementPage: React.FC = () => {
  const [modules, setModules] = useState<CatalogModul[]>([]);
  const [roles, setRoles] = useState<RoleACL[]>([]);
  const [selectedRoleCode, setSelectedRoleCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [newKodeRole, setNewKodeRole] = useState('');
  const [newNamaRole, setNewNamaRole] = useState('');
  const [newDeskripsi, setNewDeskripsi] = useState('');

  const allMenus = modules.flatMap((modul) => modul.menus);

  const loadCatalog = async () => {
    setIsLoading(true);
    try {
      const [apiModules, apiRoles] = await Promise.all([aclApi.getModules(), aclApi.getRoles()]);
      setModules(apiModules || []);

      const mapped: RoleACL[] = (apiRoles || []).map((role: any) => ({
        id: role.id,
        kodeRole: role.kodeRole,
        namaRole: role.namaRole,
        deskripsi: role.deskripsi || 'Peran sistem ZIS',
        isSystem: role.isSystem,
        permissionIds: role.rolePermissions
          ? role.rolePermissions.map((rp: any) => rp.permission.id)
          : [],
      }));

      setRoles(mapped);
      setSelectedRoleCode((current) => current || mapped[0]?.kodeRole || '');
    } catch (err: any) {
      toast.error(err.message || 'Gagal memuat katalog modul/menu dari server.');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadCatalog();
  }, []);

  const currentRole = roles.find((role) => role.kodeRole === selectedRoleCode) || roles[0];

  const updateCurrentRolePermissions = (permissionIds: string[]) => {
    if (!currentRole) return;
    setRoles((prev) =>
      prev.map((role) => (role.kodeRole === currentRole.kodeRole ? { ...role, permissionIds } : role))
    );
  };

  const handleToggleMenuPermission = (menu: CatalogMenu) => {
    if (!currentRole) return;

    const allowed = isMenuAllowed(menu, currentRole.permissionIds);
    const menuPermissionIds = menu.permissions.map((permission) => permission.id);

    if (allowed) {
      if (currentRole.kodeRole === 'SUPER_ADMIN' && menu.kodeMenu === 'acl-management') {
        toast.warning('Role Super Admin wajib mempertahankan akses ke ACL Management');
        return;
      }
      updateCurrentRolePermissions(
        currentRole.permissionIds.filter((id) => !menuPermissionIds.includes(id))
      );
      return;
    }

    const readPermission = menuReadPermission(menu);
    const nextIds = new Set(currentRole.permissionIds);
    if (readPermission) nextIds.add(readPermission.id);
    updateCurrentRolePermissions(Array.from(nextIds));
  };

  const handleSelectAllSection = (modul: CatalogModul) => {
    if (!currentRole) return;
    const hasAll = modul.menus.every((menu) => isMenuAllowed(menu, currentRole.permissionIds));
    const sectionPermissionIds = modul.menus.flatMap((menu) =>
      hasAll
        ? menu.permissions.map((permission) => permission.id)
        : menuReadPermission(menu)
          ? [menuReadPermission(menu)!.id]
          : []
    );

    if (hasAll) {
      updateCurrentRolePermissions(
        currentRole.permissionIds.filter((id) => !sectionPermissionIds.includes(id))
      );
      return;
    }

    updateCurrentRolePermissions(Array.from(new Set([...currentRole.permissionIds, ...sectionPermissionIds])));
  };

  const handleSelectAllGlobal = () => {
    if (!currentRole) return;
    const readIds = allMenus
      .map((menu) => menuReadPermission(menu)?.id)
      .filter((id): id is string => Boolean(id));
    updateCurrentRolePermissions(Array.from(new Set([...currentRole.permissionIds, ...readIds])));
    toast.info(`Semua menu diaktifkan untuk role ${currentRole.namaRole}`);
  };

  const handleSaveRoleMapping = async () => {
    if (!currentRole) return;

    try {
      await aclApi.assignPermissions(currentRole.id, currentRole.permissionIds);
      toast.success(`Pemetaan hak akses untuk role [${currentRole.namaRole}] berhasil disimpan.`);
      await loadCatalog();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan pemetaan hak akses.');
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKodeRole || !newNamaRole) {
      toast.error('Mohon lengkapi Kode Role dan Nama Role');
      return;
    }

    const formattedCode = newKodeRole.trim().toUpperCase().replace(/\s+/g, '_');
    if (roles.some((role) => role.kodeRole === formattedCode)) {
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
        permissionIds: [],
      };

      setRoles([...roles, newRole]);
      setSelectedRoleCode(newRole.kodeRole);
      setIsAddRoleModalOpen(false);
      setNewKodeRole('');
      setNewNamaRole('');
      setNewDeskripsi('');
      toast.success(`Role baru [${newRole.namaRole}] berhasil disimpan.`);
    } catch (err: any) {
      toast.error(err.message || 'Gagal menambahkan role baru.');
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs font-bold text-[#7D938A]">
        Memuat katalog modul & menu dari database...
      </div>
    );
  }

  if (!currentRole) {
    return (
      <div className="p-12 text-center text-xs font-bold text-[#7D938A]">
        Belum ada role di database. Tambahkan role terlebih dahulu.
      </div>
    );
  }

  const allowedMenuCount = allMenus.filter((menu) => isMenuAllowed(menu, currentRole.permissionIds)).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white  p-6 rounded-2xl border border-[#E3E8E4] dark:border-slate-800 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6F6EF] dark:bg-[#0F9D6E]/20 text-[#0F9D6E] text-xs font-bold border border-[#A5E4CB] mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Matriks Pengaturan Hak Akses (ACL) dari Database</span>
          </div>
          <h1 className="text-2xl font-black text-[#16211D] dark:text-white tracking-tight">
            ACL & Role Menu Management
          </h1>
          <p className="text-xs text-[#7D938A] font-medium mt-1">
            Modul dan menu diambil dari database. Centang menu untuk memberi akses role.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 bg-white  rounded-2xl border border-[#E3E8E4] dark:border-slate-800 shadow-xs">
            <h3 className="text-xs font-extrabold text-[#7D938A] uppercase tracking-wider mb-3 px-1 flex items-center justify-between">
              <span>DAFTAR ROLE SISTEM ({roles.length})</span>
              <Layers className="w-4 h-4 text-[#0F9D6E]" />
            </h3>

            <div className="space-y-2">
              {roles.map((role) => {
                const isSelected = role.kodeRole === selectedRoleCode;
                const allowedCount = allMenus.filter((menu) => isMenuAllowed(menu, role.permissionIds)).length;

                return (
                  <div
                    key={role.kodeRole}
                    onClick={() => setSelectedRoleCode(role.kodeRole)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#E6F6EF] dark:bg-[#0F9D6E]/20 border-[#0F9D6E] shadow-xs'
                        : 'bg-white dark:bg-slate-800 border-[#DDE3DF] dark:border-slate-700 hover:border-[#A5E4CB]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm text-[#16211D] dark:text-white">
                        {role.namaRole}
                      </span>
                      {role.isSystem && (
                        <span className="px-2 py-0.5 rounded-md bg-[#0D1714] text-[#A5E4CB] text-[9px] font-black uppercase">
                          SISTEM
                        </span>
                      )}
                    </div>

                    <div className="font-mono text-[11px] text-[#0F9D6E] font-bold mt-0.5">
                      {role.kodeRole}
                    </div>

                    <p className="text-xs text-[#7D938A] mt-1.5 line-clamp-2 leading-relaxed">
                      {role.deskripsi}
                    </p>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-black/5 dark:border-white/10 text-xs">
                      <span className="text-[11px] font-medium text-[#7D938A]">Modul Diizinkan:</span>
                      <span className="font-extrabold text-[#0F9D6E] bg-white dark:bg-slate-900 px-2 py-0.5 rounded-lg border border-[#A5E4CB]">
                        {allowedCount} / {allMenus.length} Menu
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="p-6 bg-white  rounded-2xl border border-[#E3E8E4] dark:border-slate-800 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E3E8E4] dark:border-slate-800 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-[#16211D] dark:text-white">
                    Mapping Modul: {currentRole.namaRole}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#E6F6EF] text-[#0F9D6E] font-mono font-bold text-xs border border-[#A5E4CB]">
                    {currentRole.kodeRole}
                  </span>
                </div>
                <p className="text-xs text-[#7D938A] mt-1">
                  {allowedMenuCount} dari {allMenus.length} menu aktif. Katalog berasal dari tabel Modul & Menu.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button onClick={handleSelectAllGlobal} variant="outline" className="text-xs font-bold py-2 px-3">
                  Pilih Semua Menu ({allMenus.length})
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

            <div className="space-y-6">
              {modules.map((modul) => {
                const isAllSectionChecked = modul.menus.every((menu) =>
                  isMenuAllowed(menu, currentRole.permissionIds)
                );

                return (
                  <div
                    key={modul.id}
                    className="p-4 rounded-2xl bg-[#F3F6F4]/60 dark:bg-slate-800/40 border border-[#DDE3DF] dark:border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-[#16211D] dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#0F9D6E]"></span>
                        <span>{modul.namaModul}</span>
                        <span className="text-[10px] text-[#7D938A] font-normal">
                          ({modul.menus.filter((menu) => isMenuAllowed(menu, currentRole.permissionIds)).length}/
                          {modul.menus.length} Aktif)
                        </span>
                      </h4>

                      <button
                        type="button"
                        onClick={() => handleSelectAllSection(modul)}
                        className="text-[11px] font-bold text-[#0F9D6E] hover:underline cursor-pointer flex items-center gap-1"
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
                      {modul.menus.map((menu) => {
                        const isChecked = isMenuAllowed(menu, currentRole.permissionIds);
                        const readPermission = menuReadPermission(menu);

                        return (
                          <div
                            key={menu.id}
                            onClick={() => handleToggleMenuPermission(menu)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between select-none ${
                              isChecked
                                ? 'bg-white dark:bg-slate-900 border-[#0F9D6E] shadow-2xs'
                                : 'bg-white/60 dark:bg-slate-900/40 border-transparent opacity-60 hover:opacity-100 hover:border-[#DDE3DF]'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-7 h-6 rounded-lg bg-[#0D1714] text-[#A5E4CB] text-[10px] font-black flex items-center justify-center shrink-0">
                                {menu.kodeTampil}
                              </span>
                              <div>
                                <span className="font-extrabold text-xs text-[#16211D] dark:text-white block">
                                  {menu.namaMenu}
                                </span>
                                <span className="text-[10px] font-mono text-[#7D938A]">
                                  {readPermission?.kodePermission || menu.kodeMenu}
                                </span>
                              </div>
                            </div>

                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="w-4 h-4 text-[#0F9D6E] accent-[#0F9D6E] cursor-pointer"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#E3E8E4] dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs text-[#7D938A]">
                <Info className="w-4 h-4 text-[#0F9D6E]" />
                <span>Perubahan berlaku setelah disimpan, pada sesi login berikutnya.</span>
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

      <Modal
        isOpen={isAddRoleModalOpen}
        onClose={() => setIsAddRoleModalOpen(false)}
        title="Tambah Role / Peran ACL Baru"
        subtitle="Buat nama role baru. Hak akses menu diatur setelah role tersimpan."
        maxWidth="md"
      >
        <form onSubmit={handleCreateRole} className="space-y-4 text-xs">
          <div>
            <label className="block font-extrabold text-[#16211D] dark:text-slate-300 mb-1">
              Kode Role (Singkatan) *
            </label>
            <input
              type="text"
              required
              value={newKodeRole}
              onChange={(e) => setNewKodeRole(e.target.value)}
              placeholder="Contoh: MANAJER_KEUANGAN"
              className="w-full p-2.5 border border-[#DDE3DF] dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl font-mono uppercase"
            />
          </div>

          <div>
            <label className="block font-extrabold text-[#16211D] dark:text-slate-300 mb-1">
              Nama Role Lengkap *
            </label>
            <input
              type="text"
              required
              value={newNamaRole}
              onChange={(e) => setNewNamaRole(e.target.value)}
              placeholder="Contoh: Manajer Keuangan & Akuntansi"
              className="w-full p-2.5 border border-[#DDE3DF] dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-extrabold text-[#16211D] dark:text-slate-300 mb-1">
              Deskripsi Tugas & Wewenang Role
            </label>
            <textarea
              rows={3}
              value={newDeskripsi}
              onChange={(e) => setNewDeskripsi(e.target.value)}
              placeholder="Jelaskan cakupan wewenang role ini..."
              className="w-full p-2.5 border border-[#DDE3DF] dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E3E8E4] dark:border-slate-800">
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
