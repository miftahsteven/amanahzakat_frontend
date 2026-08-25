import React, { useCallback, useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Muzakki } from '../types/zis';
import { DataTable } from '../components/shared/DataTable';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Users, Plus, FileSpreadsheet, Mail, Phone, RefreshCw, Pencil, Trash2, FileText } from 'lucide-react';
import { formatRP } from '../lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { muzakkiApi } from '../lib/api';

export interface MuzakkiPageProps {
  onNavigate: (screen: string) => void;
  onOpenDetail: (id: string) => void;
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
}

const formSchema = z.object({
  nama: z.string().min(3, 'Nama minimal 3 karakter'),
  tipe: z.enum(['Perorangan', 'Korporat', 'UPZ']),
  nikAtauNpwp: z.string().min(10, 'NIK / NPWP minimal 10 digit'),
  hp: z.string().min(8, 'Nomor HP / WhatsApp wajib diisi'),
  email: z.string().email('Format email tidak valid'),
  alamat: z.string().min(5, 'Alamat domisili wajib diisi'),
});

type FormValues = z.infer<typeof formSchema>;

export const MuzakkiPage: React.FC<MuzakkiPageProps> = ({
  onNavigate,
  onOpenDetail,
  canCreate = false,
  canUpdate = false,
  canDelete = false,
}) => {
  const [dataList, setDataList] = useState<Muzakki[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Muzakki | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Muzakki | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { tipe: 'Perorangan' },
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const rows = await muzakkiApi.list();
      setDataList(rows);
    } catch (err: any) {
      toast.error(err.message || 'Gagal memuat data muzakki');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openDetail = (row: Muzakki) => onOpenDetail(row.id);

  const openCreate = () => {
    setEditTarget(null);
    reset({ tipe: 'Perorangan', nama: '', nikAtauNpwp: '', hp: '', email: '', alamat: '' });
    setIsModalOpen(true);
  };

  const openEdit = (row: Muzakki) => {
    setEditTarget(row);
    reset({
      nama: row.nama,
      tipe: row.tipe,
      nikAtauNpwp: row.nikAtauNpwp,
      hp: row.hp,
      email: row.email,
      alamat: row.alamat,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      if (editTarget) {
        const updated = await muzakkiApi.update(editTarget.id, values);
        setDataList((prev) => prev.map((m) => (m.id === editTarget.id ? updated : m)));
        toast.success(`Data muzakki "${updated.nama}" berhasil diperbarui.`);
      } else {
        const created = await muzakkiApi.create(values);
        setDataList((prev) => [created, ...prev]);
        toast.success(`Muzakki ${created.nama} berhasil terdaftar dengan nomor ${created.nomor}!`);
      }
      setIsModalOpen(false);
      setEditTarget(null);
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan data muzakki');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      await muzakkiApi.remove(deleteTarget.id);
      setDataList((prev) => prev.filter((m) => m.id !== deleteTarget.id));
      toast.success(`Muzakki "${deleteTarget.nama}" berhasil diarsipkan.`);
      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err.message || 'Gagal menghapus muzakki');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnDef<Muzakki, any>[] = [
    {
      accessorKey: 'nomor',
      header: 'ID Muzakki',
      cell: ({ row }: any) => (
        <span
          onClick={() => openDetail(row.original)}
          className="font-mono font-bold text-[#0f9d6e] hover:underline cursor-pointer"
        >
          {row.getValue('nomor')}
        </span>
      ),
    },
    {
      accessorKey: 'nama',
      header: 'Nama Muzakki',
      cell: ({ row }: any) => (
        <div>
          <div className="font-bold text-slate-800 dark:text-slate-200">{row.getValue('nama')}</div>
          <div className="text-[10px] text-slate-400">NPWP/NIK: {row.original.nikAtauNpwp}</div>
        </div>
      ),
    },
    {
      accessorKey: 'tipe',
      header: 'Kategori',
      cell: ({ row }: any) => <Badge variant={row.getValue('tipe') === 'Korporat' ? 'blue' : 'emerald'}>{row.getValue('tipe')}</Badge>,
    },
    {
      accessorKey: 'hp',
      header: 'Kontak',
      cell: ({ row }: any) => (
        <div className="text-xs text-slate-600 dark:text-slate-400 space-y-0.5">
          <div className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {row.original.hp}</div>
          <div className="flex items-center gap-1 text-[10px] text-slate-400"><Mail className="w-3 h-3" /> {row.original.email}</div>
        </div>
      ),
    },
    {
      accessorKey: 'totalSetoran',
      header: 'Total Setoran ZIS',
      cell: ({ row }: any) => (
        <div>
          <div className="font-extrabold text-[#0f9d6e]">{formatRP(row.getValue('totalSetoran'))}</div>
          <div className="text-[10px] text-slate-400">{row.original.transaksiCount} kali transaksi</div>
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" onClick={() => openDetail(row.original)} title="Detail">
            <FileText className="w-3.5 h-3.5" />
          </Button>
          {canUpdate && (
            <Button variant="outline" size="sm" icon={<Pencil className="w-3.5 h-3.5" />} onClick={() => openEdit(row.original)}>
              Ubah
            </Button>
          )}
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="text-rose-600"
              title="Arsipkan"
              onClick={() => {
                setDeleteTarget(row.original);
                setIsDeleteModalOpen(true);
              }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-[#0f9d6e]" /> Master Data Muzakki (Donatur)
          </h1>
          <p className="text-xs text-slate-500">
            Database Wajib Zakat perorangan, korporat CSR, dan UPZ terdaftar
            {!isLoading && ` — Total: ${dataList.length} muzakki`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={<RefreshCw className="w-4 h-4" />} onClick={loadData} disabled={isLoading}>
            Refresh
          </Button>
          <Button variant="secondary" icon={<FileSpreadsheet className="w-4 h-4" />} onClick={() => onNavigate('rekap')}>
            Rekap Tahunan SPT
          </Button>
          {canCreate && (
            <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={openCreate}>
              Daftarkan Muzakki Baru
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-sm text-slate-500">Memuat data muzakki...</div>
      ) : (
        <DataTable columns={columns} data={dataList} searchPlaceholder="Cari ID, nama, NPWP, atau kontak..." />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditTarget(null);
        }}
        title={editTarget ? 'Ubah Data Muzakki' : 'Registrasi Muzakki / Donatur Baru'}
        subtitle={editTarget ? `Nomor: ${editTarget.nomor}` : 'Pendaftaran Muzakki perorangan atau korporat untuk penerbitan BSZ'}
        maxWidth="lg"
        maximizable
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kategori Donatur *</label>
              <select
                {...register('tipe')}
                className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-[#0f9d6e]"
              >
                <option value="Perorangan">Perorangan (Individu)</option>
                <option value="Korporat">Korporat (Perusahaan / CSR)</option>
                <option value="UPZ">UPZ (Unit Pengumpul Zakat)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">NIK / NPWP *</label>
              <input
                type="text"
                {...register('nikAtauNpwp')}
                placeholder="Contoh: 3273011204800001"
                className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-[#0f9d6e]"
              />
              {errors.nikAtauNpwp && <p className="text-rose-500 text-[11px] mt-1">{errors.nikAtauNpwp.message}</p>}
            </div>
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap / Nama Lembaga *</label>
            <input
              type="text"
              {...register('nama')}
              placeholder="Contoh: H. Ahmad Fauzi, S.E. / PT Telkom Indonesia"
              className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-[#0f9d6e]"
            />
            {errors.nama && <p className="text-rose-500 text-[11px] mt-1">{errors.nama.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nomor WhatsApp / HP *</label>
              <input
                type="text"
                {...register('hp')}
                placeholder="Contoh: 081122334455"
                className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-[#0f9d6e]"
              />
              {errors.hp && <p className="text-rose-500 text-[11px] mt-1">{errors.hp.message}</p>}
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email *</label>
              <input
                type="email"
                {...register('email')}
                placeholder="Contoh: ahmad.fauzi@gmail.com"
                className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-[#0f9d6e]"
              />
              {errors.email && <p className="text-rose-500 text-[11px] mt-1">{errors.email.message}</p>}
            </div>
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Alamat Lengkap Domisili *</label>
            <textarea
              {...register('alamat')}
              rows={2}
              placeholder="Contoh: Kebayoran Baru, Jakarta Selatan"
              className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-[#0f9d6e]"
            />
            {errors.alamat && <p className="text-rose-500 text-[11px] mt-1">{errors.alamat.message}</p>}
          </div>
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => { setIsModalOpen(false); setEditTarget(null); }}>
              Batal
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : editTarget ? 'Simpan Perubahan' : 'Daftarkan Muzakki'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setDeleteTarget(null); }}
        title="Konfirmasi Arsip Muzakki"
        maxWidth="sm"
      >
        <p className="text-sm text-slate-600 mb-4">
          Arsipkan muzakki <strong>{deleteTarget?.nama}</strong>? Data riwayat transaksi tetap tersimpan, namun muzakki tidak lagi muncul di daftar aktif.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => { setIsDeleteModalOpen(false); setDeleteTarget(null); }} disabled={isSubmitting}>
            Batal
          </Button>
          <Button variant="danger" onClick={confirmDelete} disabled={isSubmitting}>
            {isSubmitting ? 'Mengarsipkan...' : 'Arsipkan Muzakki'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};
