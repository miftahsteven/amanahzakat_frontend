import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Pencil,
  Trash2,
  Menu as MenuIcon,
  RefreshCw,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { aclApi } from '../lib/api';
import { MENU_ICON_OPTIONS, getMenuIcon } from '../lib/menuIcons';
import type { CatalogMenu, CatalogModul } from '../types/acl';

export interface ModuleManagementPageProps {
  canManage?: boolean;
}

export const ModuleManagementPage: React.FC<ModuleManagementPageProps> = ({ canManage = false }) => {
  const [modules, setModules] = useState<CatalogModul[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedModulId, setSelectedModulId] = useState<string>('');

  const [isModulModalOpen, setIsModulModalOpen] = useState(false);
  const [editingModul, setEditingModul] = useState<CatalogModul | null>(null);
  const [modulForm, setModulForm] = useState({ kodeModul: '', namaModul: '', urutan: 0 });

  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<CatalogMenu | null>(null);
  const [menuForm, setMenuForm] = useState({
    modulId: '',
    kodeMenu: '',
    namaMenu: '',
    kodeTampil: '',
    icon: '',
    urutan: 0,
    tampilDiSidebar: true,
    tampilDiHeader: false,
    actions: 'read',
  });

  const loadModules = async () => {
    setIsLoading(true);
    try {
      const data = await aclApi.getModules(true);
      setModules(data || []);
      setSelectedModulId((current) => current || data?.[0]?.id || '');
    } catch (err: any) {
      toast.error(err.message || 'Gagal memuat modul & menu.');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadModules();
  }, []);

  const selectedModul = modules.find((modul) => modul.id === selectedModulId) || modules[0];

  const openCreateModul = () => {
    setEditingModul(null);
    setModulForm({
      kodeModul: '',
      namaModul: '',
      urutan: modules.length + 1,
    });
    setIsModulModalOpen(true);
  };

  const openEditModul = (modul: CatalogModul) => {
    setEditingModul(modul);
    setModulForm({
      kodeModul: modul.kodeModul,
      namaModul: modul.namaModul,
      urutan: modul.urutan,
    });
    setIsModulModalOpen(true);
  };

  const handleSaveModul = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingModul) {
        await aclApi.updateModul(editingModul.id, {
          namaModul: modulForm.namaModul,
          urutan: Number(modulForm.urutan),
        });
        toast.success('Modul berhasil diperbarui.');
      } else {
        await aclApi.createModul({
          kodeModul: modulForm.kodeModul,
          namaModul: modulForm.namaModul,
          urutan: Number(modulForm.urutan),
        });
        toast.success('Modul berhasil ditambahkan.');
      }
      setIsModulModalOpen(false);
      await loadModules();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan modul.');
    }
  };

  const handleToggleModul = async (modul: CatalogModul) => {
    try {
      if (modul.isActive === false) {
        await aclApi.updateModul(modul.id, { isActive: true });
        toast.success(`Modul ${modul.namaModul} diaktifkan kembali.`);
      } else {
        await aclApi.deleteModul(modul.id);
        toast.success(`Modul ${modul.namaModul} dinonaktifkan.`);
      }
      await loadModules();
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengubah status modul.');
    }
  };

  const openCreateMenu = () => {
    if (!selectedModul) {
      toast.error('Pilih modul terlebih dahulu.');
      return;
    }
    setEditingMenu(null);
    setMenuForm({
      modulId: selectedModul.id,
      kodeMenu: '',
      namaMenu: '',
      kodeTampil: '',
      icon: '',
      urutan: (selectedModul.menus?.length || 0) + 1,
      tampilDiSidebar: true,
      tampilDiHeader: false,
      actions: 'read',
    });
    setIsMenuModalOpen(true);
  };

  const openEditMenu = (menu: CatalogMenu) => {
    setEditingMenu(menu);
    setMenuForm({
      modulId: menu.modulId || selectedModul?.id || '',
      kodeMenu: menu.kodeMenu,
      namaMenu: menu.namaMenu,
      kodeTampil: menu.kodeTampil,
      icon: menu.icon || '',
      urutan: menu.urutan,
      tampilDiSidebar: menu.tampilDiSidebar,
      tampilDiHeader: menu.tampilDiHeader,
      actions: menu.permissions.map((p) => p.aksi).join(', '),
    });
    setIsMenuModalOpen(true);
  };

  const handleSaveMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMenu) {
        await aclApi.updateMenu(editingMenu.id, {
          namaMenu: menuForm.namaMenu,
          kodeTampil: menuForm.kodeTampil,
          icon: menuForm.icon || null,
          urutan: Number(menuForm.urutan),
          tampilDiSidebar: menuForm.tampilDiSidebar,
          tampilDiHeader: menuForm.tampilDiHeader,
          modulId: menuForm.modulId,
        });
        toast.success('Menu berhasil diperbarui.');
      } else {
        const actions = menuForm.actions
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);
        await aclApi.createMenu({
          modulId: menuForm.modulId,
          kodeMenu: menuForm.kodeMenu,
          namaMenu: menuForm.namaMenu,
          kodeTampil: menuForm.kodeTampil,
          icon: menuForm.icon || null,
          urutan: Number(menuForm.urutan),
          tampilDiSidebar: menuForm.tampilDiSidebar,
          tampilDiHeader: menuForm.tampilDiHeader,
          actions,
        });
        toast.success('Menu berhasil ditambahkan. Permission default dibuat & diberikan ke SUPER_ADMIN.');
      }
      setIsMenuModalOpen(false);
      await loadModules();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan menu.');
    }
  };

  const handleToggleMenu = async (menu: CatalogMenu) => {
    try {
      if (menu.isActive === false) {
        await aclApi.updateMenu(menu.id, { isActive: true });
        toast.success(`Menu ${menu.namaMenu} diaktifkan kembali.`);
      } else {
        await aclApi.deleteMenu(menu.id);
        toast.success(`Menu ${menu.namaMenu} dinonaktifkan.`);
      }
      await loadModules();
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengubah status menu.');
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs font-bold text-[#7D938A]">
        Memuat katalog modul & menu...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white  p-6 rounded-2xl border border-[#E3E8E4] dark:border-slate-800 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6F6EF] dark:bg-[#0F9D6E]/20 text-[#0F9D6E] text-xs font-bold border border-[#A5E4CB] mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Master Modul & Menu Sidebar</span>
          </div>
          <h1 className="text-2xl font-black text-[#16211D] dark:text-white tracking-tight">
            Manajemen Modul & Menu
          </h1>
          <p className="text-xs text-[#7D938A] font-medium mt-1">
            Tambah, ubah, atau nonaktifkan modul/menu yang tampil di sidebar. Data tersimpan di database.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button onClick={loadModules} variant="outline" className="flex items-center gap-2 py-2.5 px-4 text-xs">
            <RefreshCw className="w-4 h-4" />
            Muat Ulang
          </Button>
          {canManage && (
            <Button onClick={openCreateModul} variant="primary" className="flex items-center gap-2 py-2.5 px-4">
              <Plus className="w-4 h-4" />
              Tambah Modul
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 bg-white  rounded-2xl border border-[#E3E8E4] dark:border-slate-800 shadow-xs">
            <h3 className="text-xs font-extrabold text-[#7D938A] uppercase tracking-wider mb-3 px-1">
              Daftar Modul ({modules.length})
            </h3>
            <div className="space-y-2">
              {modules.map((modul) => {
                const isSelected = modul.id === selectedModul?.id;
                return (
                  <div
                    key={modul.id}
                    onClick={() => setSelectedModulId(modul.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#E6F6EF] dark:bg-[#0F9D6E]/20 border-[#0F9D6E]'
                        : 'bg-white dark:bg-slate-800 border-[#DDE3DF] dark:border-slate-700'
                    } ${modul.isActive === false ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-black text-sm text-[#16211D] dark:text-white">{modul.namaModul}</div>
                        <div className="font-mono text-[11px] text-[#0F9D6E] font-bold mt-0.5">{modul.kodeModul}</div>
                        <div className="text-[11px] text-[#7D938A] mt-1">
                          {modul.menus.length} menu · urutan {modul.urutan}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                          modul.isActive === false
                            ? 'bg-rose-100 text-rose-600'
                            : 'bg-[#0D1714] text-[#A5E4CB]'
                        }`}
                      >
                        {modul.isActive === false ? 'Nonaktif' : 'Aktif'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          {selectedModul ? (
            <div className="p-6 bg-white  rounded-2xl border border-[#E3E8E4] dark:border-slate-800 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3E8E4] dark:border-slate-800">
                <div>
                  <h2 className="text-xl font-black text-[#16211D] dark:text-white">{selectedModul.namaModul}</h2>
                  <p className="text-xs text-[#7D938A] mt-1">
                    Kelola menu di dalam modul ini. Menu baru otomatis mendapat permission <code>read</code>.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {canManage && (
                    <>
                      <Button onClick={() => openEditModul(selectedModul)} variant="outline" className="text-xs">
                        <Pencil className="w-3.5 h-3.5" />
                        Edit Modul
                      </Button>
                      <Button onClick={() => handleToggleModul(selectedModul)} variant="outline" className="text-xs">
                        {selectedModul.isActive === false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        {selectedModul.isActive === false ? 'Aktifkan' : 'Nonaktifkan'}
                      </Button>
                      <Button onClick={openCreateMenu} variant="primary" className="text-xs">
                        <Plus className="w-3.5 h-3.5" />
                        Tambah Menu
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {selectedModul.menus.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#7D938A] border border-dashed border-[#DDE3DF] rounded-xl">
                    Belum ada menu di modul ini.
                  </div>
                ) : (
                  selectedModul.menus.map((menu) => {
                    const ItemIcon = getMenuIcon(menu.icon);
                    return (
                      <div
                        key={menu.id}
                        className={`p-4 rounded-xl border border-[#DDE3DF] dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          menu.isActive === false ? 'opacity-60' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-9 h-8 rounded-lg bg-[#0D1714] text-[#A5E4CB] text-[11px] font-black flex items-center justify-center">
                            {ItemIcon ? <ItemIcon className="w-4 h-4" /> : menu.kodeTampil}
                          </span>
                          <div>
                            <div className="font-extrabold text-sm text-[#16211D] dark:text-white flex items-center gap-2">
                              <MenuIcon className="w-3.5 h-3.5 text-[#0F9D6E]" />
                              {menu.namaMenu}
                            </div>
                            <div className="text-[11px] font-mono text-[#7D938A] mt-0.5">
                              {menu.kodeMenu} · tampil {menu.kodeTampil}
                              {menu.icon ? ` · icon ${menu.icon}` : ''}
                              {' · '}urutan {menu.urutan}
                              {menu.tampilDiSidebar ? ' · sidebar' : ''}
                              {menu.tampilDiHeader ? ' · header' : ''}
                            </div>
                            <div className="text-[10px] text-[#7D938A] mt-1">
                              Permission: {menu.permissions.map((p) => p.aksi).join(', ') || '-'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {canManage && (
                            <>
                              <Button onClick={() => openEditMenu(menu)} variant="outline" className="text-xs py-1.5">
                                <Pencil className="w-3.5 h-3.5" />
                                Edit
                              </Button>
                              <Button onClick={() => handleToggleMenu(menu)} variant="outline" className="text-xs py-1.5">
                                {menu.isActive === false ? <Eye className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
                                {menu.isActive === false ? 'Aktifkan' : 'Nonaktifkan'}
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-[#7D938A] bg-white rounded-2xl border">
              Belum ada modul. Tambahkan modul terlebih dahulu.
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModulModalOpen}
        onClose={() => setIsModulModalOpen(false)}
        title={editingModul ? 'Edit Modul' : 'Tambah Modul Baru'}
        subtitle="Modul menjadi grup section di sidebar"
        maxWidth="md"
      >
        <form onSubmit={handleSaveModul} className="space-y-4 text-xs">
          <div>
            <label className="block font-extrabold mb-1">Kode Modul *</label>
            <input
              required
              disabled={Boolean(editingModul)}
              value={modulForm.kodeModul}
              onChange={(e) => setModulForm({ ...modulForm, kodeModul: e.target.value })}
              placeholder="Contoh: OPERASIONAL_ZIS"
              className="w-full p-2.5 border border-[#DDE3DF] dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl font-mono uppercase disabled:opacity-60"
            />
          </div>
          <div>
            <label className="block font-extrabold mb-1">Nama Modul *</label>
            <input
              required
              value={modulForm.namaModul}
              onChange={(e) => setModulForm({ ...modulForm, namaModul: e.target.value })}
              placeholder="Contoh: OPERASIONAL ZIS"
              className="w-full p-2.5 border border-[#DDE3DF] dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl"
            />
          </div>
          <div>
            <label className="block font-extrabold mb-1">Urutan</label>
            <input
              type="number"
              value={modulForm.urutan}
              onChange={(e) => setModulForm({ ...modulForm, urutan: Number(e.target.value) })}
              className="w-full p-2.5 border border-[#DDE3DF] dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl"
            />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t">
            <Button type="button" variant="outline" onClick={() => setIsModulModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary">
              Simpan Modul
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isMenuModalOpen}
        onClose={() => setIsMenuModalOpen(false)}
        title={editingMenu ? 'Edit Menu' : 'Tambah Menu Baru'}
        subtitle="Menu akan muncul di sidebar sesuai pengaturan tampilan"
        maxWidth="md"
      >
        <form onSubmit={handleSaveMenu} className="space-y-4 text-xs">
          <div>
            <label className="block font-extrabold mb-1">Modul Induk *</label>
            <select
              required
              value={menuForm.modulId}
              onChange={(e) => setMenuForm({ ...menuForm, modulId: e.target.value })}
              className="w-full p-2.5 border border-[#DDE3DF] dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl"
            >
              {modules.map((modul) => (
                <option key={modul.id} value={modul.id}>
                  {modul.namaModul}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-extrabold mb-1">Kode Menu *</label>
            <input
              required
              disabled={Boolean(editingMenu)}
              value={menuForm.kodeMenu}
              onChange={(e) => setMenuForm({ ...menuForm, kodeMenu: e.target.value })}
              placeholder="Contoh: penerimaan"
              className="w-full p-2.5 border border-[#DDE3DF] dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl font-mono disabled:opacity-60"
            />
          </div>
          <div>
            <label className="block font-extrabold mb-1">Nama Menu *</label>
            <input
              required
              value={menuForm.namaMenu}
              onChange={(e) => setMenuForm({ ...menuForm, namaMenu: e.target.value })}
              placeholder="Contoh: Penerimaan ZIS"
              className="w-full p-2.5 border border-[#DDE3DF] dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-extrabold mb-1">Kode Tampil *</label>
              <input
                required
                maxLength={4}
                value={menuForm.kodeTampil}
                onChange={(e) => setMenuForm({ ...menuForm, kodeTampil: e.target.value })}
                placeholder="PN"
                className="w-full p-2.5 border border-[#DDE3DF] dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl font-mono uppercase"
              />
            </div>
            <div>
              <label className="block font-extrabold mb-1">Urutan</label>
              <input
                type="number"
                value={menuForm.urutan}
                onChange={(e) => setMenuForm({ ...menuForm, urutan: Number(e.target.value) })}
                className="w-full p-2.5 border border-[#DDE3DF] dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl"
              />
            </div>
          </div>
          <div>
            <label className="block font-extrabold mb-1">Icon Sidebar (opsional)</label>
            <div className="p-3 rounded-xl border border-[#DDE3DF] dark:border-slate-700 bg-[#F8FAF9] dark:bg-slate-900/60 space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-10 h-9 rounded-lg bg-[#0D1714] text-[#A5E4CB] flex items-center justify-center shrink-0">
                  {(() => {
                    const SelectedIcon = getMenuIcon(menuForm.icon);
                    return SelectedIcon ? (
                      <SelectedIcon className="w-4 h-4" />
                    ) : (
                      <span className="text-[10px] font-black">
                        {menuForm.kodeTampil || '—'}
                      </span>
                    );
                  })()}
                </span>
                <div className="text-[11px] text-[#7D938A]">
                  {menuForm.icon
                    ? `Terpilih: ${MENU_ICON_OPTIONS.find((o) => o.value === menuForm.icon)?.label || menuForm.icon}`
                    : 'Belum ada icon — sidebar pakai Kode Tampil'}
                </div>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto pr-1">
                <button
                  type="button"
                  onClick={() => setMenuForm({ ...menuForm, icon: '' })}
                  className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl border text-[10px] font-bold transition-all cursor-pointer ${
                    !menuForm.icon
                      ? 'border-[#0F9D6E] bg-[#E6F6EF] text-[#0F9D6E]'
                      : 'border-[#DDE3DF] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#7D938A] hover:border-[#A5E4CB]'
                  }`}
                  title="Tanpa icon"
                >
                  <span className="w-7 h-6 rounded-md bg-[#0D1714] text-[#A5E4CB] text-[9px] font-black flex items-center justify-center">
                    {menuForm.kodeTampil || 'TXT'}
                  </span>
                  <span>Kosong</span>
                </button>

                {MENU_ICON_OPTIONS.map((option) => {
                  const selected = menuForm.icon === option.value;
                  const OptionIcon = option.Icon;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setMenuForm({ ...menuForm, icon: option.value })}
                      className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl border text-[10px] font-bold transition-all cursor-pointer ${
                        selected
                          ? 'border-[#0F9D6E] bg-[#E6F6EF] text-[#0F9D6E]'
                          : 'border-[#DDE3DF] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#7D938A] hover:border-[#A5E4CB]'
                      }`}
                      title={`${option.label} (${option.value})`}
                    >
                      <span className="w-7 h-6 rounded-md bg-[#0D1714] text-[#A5E4CB] flex items-center justify-center">
                        <OptionIcon className="w-3.5 h-3.5" />
                      </span>
                      <span className="truncate w-full text-center">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <p className="text-[10px] text-[#7D938A] mt-1">
              Jika kosong, sidebar menampilkan Kode Tampil (contoh: DB).
            </p>
          </div>
          {!editingMenu && (
            <div>
              <label className="block font-extrabold mb-1">Aksi Permission (pisahkan koma)</label>
              <input
                value={menuForm.actions}
                onChange={(e) => setMenuForm({ ...menuForm, actions: e.target.value })}
                placeholder="read, create, update, manage"
                className="w-full p-2.5 border border-[#DDE3DF] dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl font-mono"
              />
            </div>
          )}
          <div className="flex items-center gap-4">
            <label className="inline-flex items-center gap-2 font-bold">
              <input
                type="checkbox"
                checked={menuForm.tampilDiSidebar}
                onChange={(e) => setMenuForm({ ...menuForm, tampilDiSidebar: e.target.checked })}
              />
              Tampil di Sidebar
            </label>
            <label className="inline-flex items-center gap-2 font-bold">
              <input
                type="checkbox"
                checked={menuForm.tampilDiHeader}
                onChange={(e) => setMenuForm({ ...menuForm, tampilDiHeader: e.target.checked })}
              />
              Tampil di Header
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t">
            <Button type="button" variant="outline" onClick={() => setIsMenuModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary">
              Simpan Menu
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
