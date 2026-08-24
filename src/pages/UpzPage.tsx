import React, { useCallback, useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { UpzCabang } from '../types/system';
import { DataTable } from '../components/shared/DataTable';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Building, Plus, RefreshCw, Pencil, ShieldCheck, FileText } from 'lucide-react';
import { formatRP } from '../lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { upzApi } from '../lib/api';

export interface UpzPageProps {
  onNavigate: (screen: string) => void;
  onOpenDetail: (id: string) => void;
}

const formSchema = z.object({
  nama: z.string().min(5, 'Nama UPZ minimal 5 karakter'),
  kategori: z.enum(['Masjid', 'Instansi Pemerintah', 'BUMN / Korporat', 'Sekolah / Kampus']),
  hakPengelolaanPct: z.number().min(0).max(25),
  totalPenghimpunan: z.number().min(0).optional(),
  totalPenyaluran: z.number().min(0).optional(),
  statusKepatuhan: z.enum(['Patuh', 'Perlu Audit', 'Baru']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export const UpzPage: React.FC<UpzPageProps> = ({ onOpenDetail }) => {
  const openDetail = (row: UpzCabang) => onOpenDetail(row.id);
  const [dataList, setDataList] = useState<UpzCabang[]>([]);
  const [filterKategori, setFilterKategori] = useState<string>('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<UpzCabang | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      kategori: 'Masjid',
      hakPengelolaanPct: 10,
      statusKepatuhan: 'Baru',
      totalPenghimpunan: 0,
      totalPenyaluran: 0,
    },
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const rows = await upzApi.list(filterKategori);
      setDataList(rows);
    } catch (err: any) {
      toast.error(err.message || 'Gagal memuat data UPZ cabang');
    } finally {
      setIsLoading(false);
    }
  }, [filterKategori]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreate = () => {
    setEditTarget(null);
    reset({
      nama: '',
      kategori: 'Masjid',
      hakPengelolaanPct: 10,
      statusKepatuhan: 'Baru',
      totalPenghimpunan: 0,
      totalPenyaluran: 0,
    });
    setIsModalOpen(true);
  };

  const openEdit = (upz: UpzCabang) => {
    setEditTarget(upz);
    reset({
      nama: upz.nama,
      kategori: upz.kategori,
      hakPengelolaanPct: upz.hakPengelolaanPct,
      totalPenghimpunan: upz.totalPenghimpunan,
      totalPenyaluran: upz.totalPenyaluran,
      statusKepatuhan: upz.statusKepatuhan,
    });
    setIsModalOpen(true);
  };

  const handleMarkPatuh = async (upz: UpzCabang) => {
    try {
      const updated = await upzApi.update(upz.id, { statusKepatuhan: 'Patuh' });
      setDataList((prev) => prev.map((u) => (u.id === upz.id ? updated : u)));
      toast.success(`${upz.kodeUpz} ditandai Patuh.`);
    } catch (err: any) {
      toast.error(err.message || 'Gagal memperbarui status kepatuhan');
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      if (editTarget) {
        const updated = await upzApi.update(editTarget.id, values);
        setDataList((prev) => prev.map((u) => (u.id === editTarget.id ? updated : u)));
        toast.success(`UPZ ${updated.nama} berhasil diperbarui.`);
      } else {
        const created = await upzApi.create(values);
        setDataList((prev) => [created, ...prev]);
        toast.success(`UPZ terdaftar — kode ${created.kodeUpz}`);
      }
      setIsModalOpen(false);
      setEditTarget(null);
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan UPZ cabang');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnDef<UpzCabang, any>[] = [
    {
      accessorKey: 'kodeUpz',
      header: 'Kode UPZ',
      cell: ({ row }: any) => (
        <span
          onClick={() => openDetail(row.original)}
          className="font-mono font-bold text-[#0F9D6E] hover:underline cursor-pointer"
        >
          {row.getValue('kodeUpz')}
        </span>
      ),
    },
    {
      accessorKey: 'nama',
      header: 'Nama Unit UPZ',
      cell: ({ row }: any) => (
        <div>
          <div
            onClick={() => openDetail(row.original)}
            className="font-bold text-[#0F9D6E] hover:underline cursor-pointer"
          >
            {row.getValue('nama')}
          </div>
          <div className="text-[10px] text-slate-400">
            Penyaluran: {formatRP(row.original.totalPenyaluran)}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'kategori',
      header: 'Kategori UPZ',
      cell: ({ row }: any) => <Badge variant="emerald">{row.getValue('kategori')}</Badge>,
    },
    {
      accessorKey: 'totalPenghimpunan',
      header: 'Total Penghimpunan',
      cell: ({ row }: any) => (
        <span className="font-bold text-[#0F9D6E]">{formatRP(row.getValue('totalPenghimpunan'))}</span>
      ),
    },
    {
      accessorKey: 'hakPengelolaanPct',
      header: 'Hak Operasional',
      cell: ({ row }: any) => (
        <span className="font-bold text-amber-600">{row.getValue('hakPengelolaanPct')}%</span>
      ),
    },
    {
      accessorKey: 'statusKepatuhan',
      header: 'Status Audit',
      cell: ({ row }: any) => <Badge statusText={row.getValue('statusKepatuhan')} />,
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => openDetail(row.original)} title="Detail">
            <FileText className="w-3.5 h-3.5" />
          </Button>
          {row.original.statusKepatuhan !== 'Patuh' && (
            <Button
              variant="primary"
              size="sm"
              icon={<ShieldCheck className="w-3.5 h-3.5" />}
              onClick={() => handleMarkPatuh(row.original)}
            >
              Tandai Patuh
            </Button>
          )}
          <Button variant="outline" size="sm" icon={<Pencil className="w-3.5 h-3.5" />} onClick={() => openEdit(row.original)}>
            Ubah
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[25px] font-extrabold text-[#16211D] dark:text-slate-100 flex items-center gap-2">
            <Building className="w-6 h-6 text-[#0F9D6E]" /> UPZ (Unit Pengumpul Zakat) Cabang
          </h1>
          <p className="text-[13px] text-[#7D938A] mt-0.5">
            Manajemen UPZ Masjid, Instansi Pemerintah, BUMN, dan Kampus
            {!isLoading && ` — ${dataList.length} unit`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={<RefreshCw className="w-4 h-4" />} onClick={loadData} disabled={isLoading}>
            Refresh
          </Button>
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={openCreate}>
            Registrasi UPZ
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
        {['Semua', 'Masjid', 'Instansi Pemerintah', 'BUMN / Korporat', 'Sekolah / Kampus'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilterKategori(tab)}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
              filterKategori === tab
                ? 'bg-[#0F9D6E] text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <DataTable columns={columns} data={dataList} searchPlaceholder="Cari UPZ..." />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditTarget(null);
        }}
        title={editTarget ? 'Ubah Data UPZ Cabang' : 'Registrasi UPZ Cabang Baru'}
        subtitle={editTarget ? `Kode: ${editTarget.kodeUpz}` : 'Kode UPZ akan digenerate otomatis'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Unit UPZ *</label>
            <input
              type="text"
              {...register('nama')}
              placeholder="Contoh: UPZ Masjid Agung Al-Azhar"
              className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl"
            />
            {errors.nama && <p className="text-rose-500 text-[11px] mt-1">{errors.nama.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kategori *</label>
              <select {...register('kategori')} className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl">
                <option value="Masjid">Masjid</option>
                <option value="Instansi Pemerintah">Instansi Pemerintah</option>
                <option value="BUMN / Korporat">BUMN / Korporat</option>
                <option value="Sekolah / Kampus">Sekolah / Kampus</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Status Kepatuhan</label>
              <select {...register('statusKepatuhan')} className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl">
                <option value="Baru">Baru</option>
                <option value="Patuh">Patuh</option>
                <option value="Perlu Audit">Perlu Audit</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Hak Operasional (%)</label>
              <input
                type="number"
                step="0.5"
                {...register('hakPengelolaanPct', { valueAsNumber: true })}
                className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Penghimpunan (Rp)</label>
              <input
                type="number"
                {...register('totalPenghimpunan', { valueAsNumber: true })}
                className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Penyaluran (Rp)</label>
              <input
                type="number"
                {...register('totalPenyaluran', { valueAsNumber: true })}
                className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setEditTarget(null);
              }}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : editTarget ? 'Simpan Perubahan' : 'Daftarkan UPZ'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
