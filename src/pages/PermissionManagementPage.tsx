import React, { useMemo, useState } from 'react';
import { KeyRound, Plus, Pencil, Trash2, Users, RefreshCw, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { aclApi } from '../lib/api';
import type { CatalogModul } from '../types/acl';

interface PermissionRow {
  id: string;
  kodePermission: string;
  namaPermission: string;
  aksi: string;
  menuId: string;
  menu?: {
    id: string;
    kodeMenu: string;
    namaMenu: string;
    modul?: { id: string; kodeModul: string; namaModul: string };
  };
  rolePermissions?: { roleId: string; role: { id: string; kodeRole: string; namaRole: string } }[];
}

interface RoleOption {
  id: string;
  kodeRole: string;
  namaRole: string;
}

const PERMISSION_ACTIONS = [
  { value: 'read', label: 'read — Lihat / akses menu', namaPrefix: 'Lihat' },
  { value: 'create', label: 'create — Tambah data', namaPrefix: 'Tambah' },
  { value: 'update', label: 'update — Ubah data', namaPrefix: 'Ubah' },
  { value: 'delete', label: 'delete — Hapus data', namaPrefix: 'Hapus' },
  { value: 'verify', label: 'verify — Verifikasi / approval', namaPrefix: 'Verifikasi' },
  { value: 'export', label: 'export — Ekspor data', namaPrefix: 'Ekspor' },
  { value: 'execute', label: 'execute — Eksekusi proses', namaPrefix: 'Eksekusi' },
  { value: 'manage', label: 'manage — Kelola penuh', namaPrefix: 'Kelola' },
] as const;

function suggestPermissionName(aksi: string, namaMenu: string): string {
  const action = PERMISSION_ACTIONS.find((item) => item.value === aksi);
  const prefix = action?.namaPrefix || aksi;
  const menuLabel = namaMenu.trim() || 'Menu';
  return `${prefix} ${menuLabel}`;
}

function suggestPermissionCode(kodeMenu: string, aksi: string): string {
  if (!kodeMenu || !aksi) return '';
  return `${kodeMenu}.${aksi}`.toLowerCase();
}

export interface PermissionManagementPageProps {
  canManage?: boolean;
}

export const PermissionManagementPage: React.FC<PermissionManagementPageProps> = ({ canManage = false }) => {
  const [permissions, setPermissions] = useState<PermissionRow[]>([]);
  const [modules, setModules] = useState<CatalogModul[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterModulId, setFilterModulId] = useState('all');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<PermissionRow | null>(null);
  const [namaManual, setNamaManual] = useState(false);
  const [form, setForm] = useState({
    menuId: '',
    aksi: 'read',
    namaPermission: '',
    kodePermission: '',
  });

  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState<PermissionRow | null>(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [permData, modulData, roleData] = await Promise.all([
        aclApi.getPermissions(),
        aclApi.getModules(true),
        aclApi.getRoles(),
      ]);
      setPermissions(permData || []);
      setModules(modulData || []);
      setRoles(
        (roleData || []).map((role: any) => ({
          id: role.id,
          kodeRole: role.kodeRole,
          namaRole: role.namaRole,
        }))
      );
    } catch (err: any) {
      toast.error(err.message || 'Gagal memuat data permission.');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);

  const allMenus = useMemo(
    () =>
      modules.flatMap((modul) =>
        modul.menus.map((menu) => ({
          ...menu,
          modulNama: modul.namaModul,
          modulId: modul.id,
        }))
      ),
    [modules]
  );

  const filtered = useMemo(() => {
    return permissions.filter((item) => {
      const matchSearch =
        !search ||
        item.kodePermission.toLowerCase().includes(search.toLowerCase()) ||
        item.namaPermission.toLowerCase().includes(search.toLowerCase()) ||
        item.aksi.toLowerCase().includes(search.toLowerCase()) ||
        item.menu?.namaMenu?.toLowerCase().includes(search.toLowerCase());

      const matchModul =
        filterModulId === 'all' || item.menu?.modul?.id === filterModulId;

      return matchSearch && matchModul;
    });
  }, [permissions, search, filterModulId]);

  const buildFormSuggestion = (menuId: string, aksi: string, keepManualNama = false, currentNama = '') => {
    const selectedMenu = allMenus.find((menu) => menu.id === menuId);
    const suggestedNama = suggestPermissionName(aksi, selectedMenu?.namaMenu || '');
    const suggestedKode = suggestPermissionCode(selectedMenu?.kodeMenu || '', aksi);

    return {
      menuId,
      aksi,
      namaPermission: keepManualNama && currentNama ? currentNama : suggestedNama,
      kodePermission: suggestedKode,
    };
  };

  const openCreate = () => {
    setEditing(null);
    setNamaManual(false);
    const firstMenu = allMenus[0];
    setForm(buildFormSuggestion(firstMenu?.id || '', 'read'));
    setIsFormOpen(true);
  };

  const openEdit = (row: PermissionRow) => {
    setEditing(row);
    setNamaManual(true);
    setForm({
      menuId: row.menuId,
      aksi: row.aksi,
      namaPermission: row.namaPermission,
      kodePermission: row.kodePermission,
    });
    setIsFormOpen(true);
  };

  const handleMenuOrAksiChange = (next: { menuId?: string; aksi?: string }) => {
    const menuId = next.menuId ?? form.menuId;
    const aksi = next.aksi ?? form.aksi;
    setForm(buildFormSuggestion(menuId, aksi, namaManual, form.namaPermission));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await aclApi.updatePermission(editing.id, {
          namaPermission: form.namaPermission,
          aksi: form.aksi,
          kodePermission: form.kodePermission,
        });
        toast.success('Permission berhasil diperbarui.');
      } else {
        const selectedMenu = allMenus.find((menu) => menu.id === form.menuId);
        await aclApi.createPermission({
          menuId: form.menuId,
          aksi: form.aksi,
          namaPermission:
            form.namaPermission ||
            `${form.aksi} ${selectedMenu?.namaMenu || ''}`.trim(),
          kodePermission: form.kodePermission || undefined,
        });
        toast.success('Permission berhasil ditambahkan dan diberikan ke SUPER_ADMIN.');
      }
      setIsFormOpen(false);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan permission.');
    }
  };

  const handleDelete = async (row: PermissionRow) => {
    if (!window.confirm(`Hapus permission ${row.kodePermission}? Relasi role ikut terhapus.`)) {
      return;
    }
    try {
      await aclApi.deletePermission(row.id);
      toast.success('Permission berhasil dihapus.');
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menghapus permission.');
    }
  };

  const openAssign = (row: PermissionRow) => {
    setAssignTarget(row);
    setSelectedRoleIds((row.rolePermissions || []).map((rp) => rp.roleId || rp.role.id));
    setIsAssignOpen(true);
  };

  const toggleRole = (roleId: string) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  const handleSaveAssign = async () => {
    if (!assignTarget) return;
    try {
      await aclApi.assignPermissionRoles(assignTarget.id, selectedRoleIds);
      toast.success(`Assign role untuk ${assignTarget.kodePermission} berhasil disimpan.`);
      setIsAssignOpen(false);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan assign role.');
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs font-bold text-[#7D938A]">
        Memuat katalog permission...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white  p-6 rounded-2xl border border-[#E3E8E4] dark:border-slate-800 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6F6EF] dark:bg-[#0F9D6E]/20 text-[#0F9D6E] text-xs font-bold border border-[#A5E4CB] mb-2">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Master Permission CRUD + Assign Role</span>
          </div>
          <h1 className="text-2xl font-black text-[#16211D] dark:text-white tracking-tight">
            Manajemen Permission
          </h1>
          <p className="text-xs text-[#7D938A] font-medium mt-1">
            Kelola aksi per menu (`read`, `create`, `manage`, dll.) dan tentukan role mana yang memilikinya.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button onClick={loadData} variant="outline" className="flex items-center gap-2 py-2.5 px-4 text-xs">
            <RefreshCw className="w-4 h-4" />
            Muat Ulang
          </Button>
          {canManage && (
            <Button onClick={openCreate} variant="primary" className="flex items-center gap-2 py-2.5 px-4">
              <Plus className="w-4 h-4" />
              Tambah Permission
            </Button>
          )}
        </div>
      </div>

      <div className="bg-white  p-4 rounded-2xl border border-[#E3E8E4] dark:border-slate-800 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7D938A]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kode, nama, aksi, atau menu..."
            className="w-full pl-9 pr-3 py-2.5 text-xs border border-[#DDE3DF] dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800"
          />
        </div>
        <select
          value={filterModulId}
          onChange={(e) => setFilterModulId(e.target.value)}
          className="md:w-64 p-2.5 text-xs border border-[#DDE3DF] dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800"
        >
          <option value="all">Semua Modul</option>
          {modules.map((modul) => (
            <option key={modul.id} value={modul.id}>
              {modul.namaModul}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white  rounded-2xl border border-[#E3E8E4] dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-[#F3F6F4] dark:bg-slate-900 text-[#7D938A] uppercase tracking-wider">
              <tr>
                <th className="text-left font-extrabold px-4 py-3">Permission</th>
                <th className="text-left font-extrabold px-4 py-3">Menu / Modul</th>
                <th className="text-left font-extrabold px-4 py-3">Aksi</th>
                <th className="text-left font-extrabold px-4 py-3">Role</th>
                <th className="text-right font-extrabold px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-[#7D938A]">
                    Tidak ada permission yang cocok.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id} className="border-t border-[#E3E8E4] dark:border-slate-800">
                    <td className="px-4 py-3">
                      <div className="font-mono font-bold text-[#0F9D6E]">{row.kodePermission}</div>
                      <div className="text-[#16211D] dark:text-white font-semibold mt-0.5">
                        {row.namaPermission}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-[#16211D] dark:text-white">
                        {row.menu?.namaMenu || '-'}
                      </div>
                      <div className="text-[#7D938A]">{row.menu?.modul?.namaModul || '-'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-lg bg-[#E6F6EF] text-[#0F9D6E] font-black uppercase">
                        {row.aksi}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(row.rolePermissions || []).length === 0 ? (
                          <span className="text-[#7D938A] italic">Belum di-assign</span>
                        ) : (
                          (row.rolePermissions || []).map((rp) => (
                            <span
                              key={rp.role.id}
                              className="px-2 py-0.5 rounded-md bg-[#0D1714] text-[#A5E4CB] text-[10px] font-bold"
                            >
                              {rp.role.kodeRole}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {canManage && (
                        <div className="flex items-center justify-end gap-2">
                          <Button onClick={() => openAssign(row)} variant="outline" className="text-xs py-1.5">
                            <Users className="w-3.5 h-3.5" />
                            Assign
                          </Button>
                          <Button onClick={() => openEdit(row)} variant="outline" className="text-xs py-1.5">
                            <Pencil className="w-3.5 h-3.5" />
                            Edit
                          </Button>
                          <Button onClick={() => handleDelete(row)} variant="outline" className="text-xs py-1.5">
                            <Trash2 className="w-3.5 h-3.5" />
                            Hapus
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-[#E3E8E4] dark:border-slate-800 text-[11px] text-[#7D938A]">
          Menampilkan {filtered.length} dari {permissions.length} permission
        </div>
      </div>

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editing ? 'Edit Permission' : 'Tambah Permission'}
        subtitle="Permission terikat ke satu menu dan satu aksi"
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-extrabold mb-1">Menu *</label>
            <select
              required
              disabled={Boolean(editing)}
              value={form.menuId}
              onChange={(e) => {
                setNamaManual(false);
                handleMenuOrAksiChange({ menuId: e.target.value });
              }}
              className="w-full p-2.5 border border-[#DDE3DF] dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 disabled:opacity-60"
            >
              {allMenus.map((menu) => (
                <option key={menu.id} value={menu.id}>
                  {menu.modulNama} / {menu.namaMenu}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-extrabold mb-1">Aksi *</label>
              <select
                required
                value={form.aksi}
                onChange={(e) => {
                  setNamaManual(false);
                  handleMenuOrAksiChange({ aksi: e.target.value });
                }}
                className="w-full p-2.5 border border-[#DDE3DF] dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 font-mono"
              >
                {PERMISSION_ACTIONS.map((action) => (
                  <option key={action.value} value={action.value}>
                    {action.label}
                  </option>
                ))}
                {editing &&
                  !PERMISSION_ACTIONS.some((action) => action.value === form.aksi) && (
                    <option value={form.aksi}>{form.aksi} (existing)</option>
                  )}
              </select>
            </div>
            <div>
              <label className="block font-extrabold mb-1">Kode Permission</label>
              <input
                value={form.kodePermission}
                readOnly
                placeholder="otomatis: menu.aksi"
                className="w-full p-2.5 border border-[#DDE3DF] dark:border-slate-700 rounded-xl bg-[#F3F6F4] dark:bg-slate-900 font-mono text-[#7D938A]"
              />
            </div>
          </div>
          <div>
            <label className="block font-extrabold mb-1">Nama Permission *</label>
            <input
              required
              value={form.namaPermission}
              onChange={(e) => {
                setNamaManual(true);
                setForm({ ...form, namaPermission: e.target.value });
              }}
              placeholder="Otomatis dari Menu + Aksi"
              className="w-full p-2.5 border border-[#DDE3DF] dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800"
            />
            <p className="text-[10px] text-[#7D938A] mt-1">
              Terisi otomatis dari Menu + Aksi. Boleh diubah manual jika perlu.
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t">
            <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary">
              Simpan Permission
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        title="Assign Permission ke Role"
        subtitle={assignTarget ? assignTarget.kodePermission : ''}
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <p className="text-[#7D938A]">
            Centang role yang boleh memiliki permission ini. Perubahan langsung menimpa daftar role untuk
            permission terpilih.
          </p>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {roles.map((role) => {
              const checked = selectedRoleIds.includes(role.id);
              return (
                <label
                  key={role.id}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer ${
                    checked
                      ? 'border-[#0F9D6E] bg-[#E6F6EF] dark:bg-[#0F9D6E]/20'
                      : 'border-[#DDE3DF] dark:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-black text-[#16211D] dark:text-white">{role.namaRole}</div>
                    <div className="font-mono text-[#0F9D6E]">{role.kodeRole}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleRole(role.id)}
                    className="accent-[#0F9D6E]"
                  />
                </label>
              );
            })}
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t">
            <Button type="button" variant="outline" onClick={() => setIsAssignOpen(false)}>
              Batal
            </Button>
            <Button type="button" variant="primary" onClick={handleSaveAssign}>
              Simpan Assign Role
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
