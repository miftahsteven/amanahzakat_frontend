import React, { useCallback, useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MitraPenyalur } from '../types/system';
import { DataTable } from '../components/shared/DataTable';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Building2, Plus, RefreshCw, Pencil, CheckCircle2, FileText } from 'lucide-react';
import { formatRP } from '../lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { mitraApi } from '../lib/api';

export interface MitraPageProps {
  onNavigate: (screen: string) => void;
  onOpenDetail: (id: string) => void;
}

const formSchema = z.object({
  nama: z.string().min(5, 'Nama lembaga minimal 5 karakter'),
  bentukLembaga: z.enum(['Yayasan', 'Komunitas', 'LKM Syariah', 'Pesantren']),
  masaKerjasama: z.string().min(5, 'Masa kerjasama wajib diisi'),
  picKontak: z.string().min(3, 'Nama PIC wajib diisi'),
  hpPic: z.string().min(8, 'HP PIC wajib diisi'),
  totalPenyaluran: z.number().min(0).optional(),
  statusLaporanLpj: z.enum(['Terverifikasi', 'Menunggu LPJ', 'Tertunda']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export const MitraPage: React.FC<MitraPageProps> = ({ onOpenDetail }) => {
  const openDetail = (row: MitraPenyalur) => onOpenDetail(row.id);
  const [dataList, setDataList] = useState<MitraPenyalur[]>([]);
  const [filterLpj, setFilterLpj] = useState<string>('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<MitraPenyalur | null>(null);
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
      bentukLembaga: 'Yayasan',
      statusLaporanLpj: 'Menunggu LPJ',
      totalPenyaluran: 0,
    },
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const rows = await mitraApi.list(filterLpj);
      setDataList(rows);
    } catch (err: any) {
      toast.error(err.message || 'Gagal memuat data mitra penyalur');
    } finally {
      setIsLoading(false);
    }
  }, [filterLpj]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreate = () => {
    setEditTarget(null);
    reset({
      nama: '',
      bentukLembaga: 'Yayasan',
      masaKerjasama: '',
      picKontak: '',
      hpPic: '',
      totalPenyaluran: 0,
      statusLaporanLpj: 'Menunggu LPJ',
    });
    setIsModalOpen(true);
  };

  const openEdit = (mitra: MitraPenyalur) => {
    setEditTarget(mitra);
    reset({
      nama: mitra.nama,
      bentukLembaga: mitra.bentukLembaga,
      masaKerjasama: mitra.masaKerjasama,
      picKontak: mitra.picKontak,
      hpPic: mitra.hpPic,
      totalPenyaluran: mitra.totalPenyaluran,
      statusLaporanLpj: mitra.statusLaporanLpj,
    });
    setIsModalOpen(true);
  };

  const handleVerifyLpj = async (mitra: MitraPenyalur) => {
    try {
      const updated = await mitraApi.update(mitra.id, { statusLaporanLpj: 'Terverifikasi' });
      setDataList((prev) => prev.map((m) => (m.id === mitra.id ? updated : m)));
      toast.success(`LPJ ${mitra.nama} ditandai Terverifikasi.`);
    } catch (err: any) {
      toast.error(err.message || 'Gagal memverifikasi LPJ');
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      if (editTarget) {
        const updated = await mitraApi.update(editTarget.id, values);
        setDataList((prev) => prev.map((m) => (m.id === editTarget.id ? updated : m)));
        toast.success(`Mitra ${updated.nama} berhasil diperbarui.`);
      } else {
        const created = await mitraApi.create(values);
        setDataList((prev) => [created, ...prev]);
        toast.success(`Mitra terdaftar — MoU ${created.noMou}`);
      }
      setIsModalOpen(false);
      setEditTarget(null);
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan mitra penyalur');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnDef<MitraPenyalur, any>[] = [
    {
      accessorKey: 'nama',
      header: 'Nama Lembaga Mitra',
      cell: ({ row }: any) => (
        <div>
          <div
            onClick={() => openDetail(row.original)}
            className="font-bold text-[#0F9D6E] hover:underline cursor-pointer"
          >
            {row.getValue('nama')}
          </div>
          <div className="text-[10px] text-slate-400">
            PIC: {row.original.picKontak} · {row.original.hpPic}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'bentukLembaga',
      header: 'Bentuk Lembaga',
      cell: ({ row }: any) => <Badge variant="blue">{row.getValue('bentukLembaga')}</Badge>,
    },
    {
      accessorKey: 'noMou',
      header: 'No. MoU',
      cell: ({ row }: any) => (
        <div>
          <span className="font-mono text-xs font-bold">{row.getValue('noMou')}</span>
          <div className="text-[10px] text-slate-400">{row.original.masaKerjasama}</div>
        </div>
      ),
    },
    {
      accessorKey: 'totalPenyaluran',
      header: 'Dana Dikelola',
      cell: ({ row }: any) => (
        <span className="font-bold text-[#0F9D6E]">{formatRP(row.getValue('totalPenyaluran'))}</span>
      ),
    },
    {
      accessorKey: 'statusLaporanLpj',
      header: 'Status LPJ',
      cell: ({ row }: any) => <Badge statusText={row.getValue('statusLaporanLpj')} />,
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => openDetail(row.original)} title="Detail">
            <FileText className="w-3.5 h-3.5" />
          </Button>
          {row.original.statusLaporanLpj !== 'Terverifikasi' && (
            <Button
              variant="primary"
              size="sm"
              icon={<CheckCircle2 className="w-3.5 h-3.5" />}
              onClick={() => handleVerifyLpj(row.original)}
            >
              Verifikasi LPJ
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
            <Building2 className="w-6 h-6 text-[#0F9D6E]" /> Dashboard Mitra Penyalur (Partner)
          </h1>
          <p className="text-[13px] text-[#7D938A] mt-0.5">
            Lembaga executing partner & audit Laporan Pertanggungjawaban (LPJ)
            {!isLoading && ` — ${dataList.length} mitra`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={<RefreshCw className="w-4 h-4" />} onClick={loadData} disabled={isLoading}>
            Refresh
          </Button>
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={openCreate}>
            Tambah Mitra Baru
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
        {['Semua', 'Terverifikasi', 'Menunggu LPJ', 'Tertunda'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilterLpj(tab)}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
              filterLpj === tab
                ? 'bg-[#0F9D6E] text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <DataTable columns={columns} data={dataList} searchPlaceholder="Cari nama mitra atau MoU..." />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditTarget(null);
        }}
        title={editTarget ? 'Ubah Data Mitra Penyalur' : 'Registrasi Mitra Penyalur Baru'}
        subtitle={editTarget ? `MoU: ${editTarget.noMou}` : 'MoU akan digenerate otomatis oleh sistem'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Lembaga Mitra *</label>
            <input
              type="text"
              {...register('nama')}
              placeholder="Contoh: Yayasan Kita Sehat Indonesia"
              className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl"
            />
            {errors.nama && <p className="text-rose-500 text-[11px] mt-1">{errors.nama.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Bentuk Lembaga *</label>
              <select {...register('bentukLembaga')} className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl">
                <option value="Yayasan">Yayasan</option>
                <option value="Komunitas">Komunitas</option>
                <option value="LKM Syariah">LKM Syariah</option>
                <option value="Pesantren">Pesantren</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Status LPJ</label>
              <select {...register('statusLaporanLpj')} className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl">
                <option value="Menunggu LPJ">Menunggu LPJ</option>
                <option value="Terverifikasi">Terverifikasi</option>
                <option value="Tertunda">Tertunda</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Masa Kerjasama (MoU) *</label>
            <input
              type="text"
              {...register('masaKerjasama')}
              placeholder="Contoh: 01 Jan 2026 - 31 Des 2026"
              className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl"
            />
            {errors.masaKerjasama && <p className="text-rose-500 text-[11px] mt-1">{errors.masaKerjasama.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama PIC Kontak *</label>
              <input
                type="text"
                {...register('picKontak')}
                placeholder="Contoh: Drs. Hendri"
                className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl"
              />
              {errors.picKontak && <p className="text-rose-500 text-[11px] mt-1">{errors.picKontak.message}</p>}
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">HP / WhatsApp PIC *</label>
              <input
                type="text"
                {...register('hpPic')}
                placeholder="Contoh: 081233445566"
                className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl"
              />
              {errors.hpPic && <p className="text-rose-500 text-[11px] mt-1">{errors.hpPic.message}</p>}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Total Dana Dikelola (Rp)</label>
            <input
              type="number"
              {...register('totalPenyaluran', { valueAsNumber: true })}
              placeholder="0"
              className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl"
            />
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
              {isSubmitting ? 'Menyimpan...' : editTarget ? 'Simpan Perubahan' : 'Daftarkan Mitra'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
