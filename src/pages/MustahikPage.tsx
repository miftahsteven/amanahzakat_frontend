import React, { useCallback, useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Mustahik, Asnaf } from '../types/zis';
import { DataTable } from '../components/shared/DataTable';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { HeartHandshake, Plus, ShieldCheck, RefreshCw } from 'lucide-react';
import { formatRP } from '../lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { mustahikApi } from '../lib/api';

export interface MustahikPageProps {
  onNavigate: (screen: string) => void;
  onSelectMustahik: (id: string) => void;
}

const formSchema = z.object({
  nik: z.string().length(16, 'NIK harus tepat 16 digit'),
  nama: z.string().min(3, 'Nama minimal 3 karakter'),
  kategoriAsnaf: z.enum(['Fakir', 'Miskin', 'Amil', 'Mualaf', 'Riqab', 'Gharim', 'Fisabilillah', 'Ibnus Sabil']),
  hp: z.string().min(8, 'Nomor HP wajib diisi'),
  alamat: z.string().min(5, 'Alamat domisili wajib diisi'),
  pekerjaan: z.string().min(2, 'Pekerjaan wajib diisi'),
  penghasilanBulanan: z.number().min(0, 'Penghasilan tidak boleh negatif'),
  jumlahTanggungan: z.number().min(0, 'Jumlah tanggungan minimal 0'),
  rekeningBank: z.string().min(5, 'Rekening bank wajib diisi'),
});

type FormValues = z.infer<typeof formSchema>;

export const MustahikPage: React.FC<MustahikPageProps> = ({ onSelectMustahik }) => {
  const [dataList, setDataList] = useState<Mustahik[]>([]);
  const [filterAsnaf, setFilterAsnaf] = useState<string>('Semua');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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
      kategoriAsnaf: 'Fakir',
      penghasilanBulanan: 1000000,
      jumlahTanggungan: 3,
    },
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const rows = await mustahikApi.list(filterAsnaf);
      setDataList(rows);
    } catch (err: any) {
      toast.error(err.message || 'Gagal memuat data mustahik');
    } finally {
      setIsLoading(false);
    }
  }, [filterAsnaf]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const created = await mustahikApi.create(values);
      setDataList((prev) => [created, ...prev]);
      toast.success(
        `Mustahik ${created.nama} berhasil terdaftar — Skor kelayakan: ${created.skorKelayakan}/100`,
      );
      reset();
      setIsCreateModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Gagal mendaftarkan mustahik');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnDef<Mustahik, any>[] = [
    {
      accessorKey: 'nik',
      header: 'NIK Mustahik',
      cell: ({ row }: any) => (
        <span
          onClick={() => onSelectMustahik(row.original.id)}
          className="font-mono font-bold text-slate-800 dark:text-slate-200 hover:underline cursor-pointer"
        >
          {row.getValue('nik')}
        </span>
      ),
    },
    {
      accessorKey: 'nama',
      header: 'Nama Mustahik',
      cell: ({ row }: any) => (
        <div>
          <div className="font-bold text-slate-800 dark:text-slate-200">{row.getValue('nama')}</div>
          <div className="text-[10px] text-slate-400">
            {row.original.pekerjaan} ({row.original.jumlahTanggungan} tanggungan)
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'kategoriAsnaf',
      header: 'Golongan Asnaf',
      cell: ({ row }: any) => <Badge variant="blue">{row.getValue('kategoriAsnaf')}</Badge>,
    },
    {
      accessorKey: 'penghasilanBulanan',
      header: 'Penghasilan / Bln',
      cell: ({ row }: any) => (
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          {formatRP(row.getValue('penghasilanBulanan'))}
        </span>
      ),
    },
    {
      accessorKey: 'skorKelayakan',
      header: 'Skor Kelayakan',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-1.5 font-bold text-emerald-600">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>{row.original.skorKelayakan} / 100</span>
        </div>
      ),
    },
    {
      accessorKey: 'totalBantuanDiterima',
      header: 'Total Bantuan',
      cell: ({ row }: any) => (
        <span className="font-extrabold text-blue-600">{formatRP(row.getValue('totalBantuanDiterima'))}</span>
      ),
    },
    {
      accessorKey: 'statusSurvei',
      header: 'Status Survei',
      cell: ({ row }: any) => <Badge statusText={row.getValue('statusSurvei')} />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <HeartHandshake className="w-6 h-6 text-blue-600" /> Database Mustahik (Penerima Manfaat)
          </h1>
          <p className="text-xs text-slate-500">
            Database penerima zakat terverifikasi NIK KTP & survei kelayakan lapangan
            {!isLoading && ` — Total: ${dataList.length} mustahik`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={<RefreshCw className="w-4 h-4" />} onClick={loadData} disabled={isLoading}>
            Refresh
          </Button>
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setIsCreateModalOpen(true)}>
            Tambah Mustahik Baru
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
        {['Semua', 'Fakir', 'Miskin', 'Amil', 'Mualaf', 'Riqab', 'Gharim', 'Fisabilillah', 'Ibnus Sabil'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilterAsnaf(tab)}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
              filterAsnaf === tab
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={dataList}
        searchPlaceholder="Cari NIK, nama mustahik, pekerjaan, atau asnaf..."
      />

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Registrasi Mustahik Terverifikasi"
        subtitle="Input data calon penerima bantuan zakat & verifikasi ganda NIK"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">NIK KTP (16 Digit) *</label>
              <input
                type="text"
                {...register('nik')}
                maxLength={16}
                placeholder="Contoh: 3273101508700002"
                className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-slate-800 dark:text-slate-200 font-mono focus:ring-2 focus:ring-[#0f9d6e]"
              />
              {errors.nik && <p className="text-rose-500 text-[11px] mt-1">{errors.nik.message}</p>}
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Golongan Asnaf *</label>
              <select
                {...register('kategoriAsnaf')}
                className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-[#0f9d6e]"
              >
                {(['Fakir', 'Miskin', 'Amil', 'Mualaf', 'Riqab', 'Gharim', 'Fisabilillah', 'Ibnus Sabil'] as Asnaf[]).map(
                  (a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap Mustahik *</label>
            <input
              type="text"
              {...register('nama')}
              placeholder="Contoh: Ustadz Ahmad Suhendar / Ibu Maryam"
              className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-[#0f9d6e]"
            />
            {errors.nama && <p className="text-rose-500 text-[11px] mt-1">{errors.nama.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pekerjaan Utama *</label>
              <input
                type="text"
                {...register('pekerjaan')}
                placeholder="Contoh: Guru Ngaji / Buruh Cuci"
                className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-[#0f9d6e]"
              />
              {errors.pekerjaan && <p className="text-rose-500 text-[11px] mt-1">{errors.pekerjaan.message}</p>}
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Penghasilan Bulanan (Rp) *</label>
              <input
                type="number"
                {...register('penghasilanBulanan', { valueAsNumber: true })}
                placeholder="Contoh: 1200000"
                className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-[#0f9d6e]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Jumlah Tanggungan Keluarga *</label>
              <input
                type="number"
                {...register('jumlahTanggungan', { valueAsNumber: true })}
                placeholder="Contoh: 4"
                className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-[#0f9d6e]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nomor WhatsApp / HP *</label>
              <input
                type="text"
                {...register('hp')}
                placeholder="Contoh: 081311223344"
                className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-[#0f9d6e]"
              />
              {errors.hp && <p className="text-rose-500 text-[11px] mt-1">{errors.hp.message}</p>}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Rekening Bank Pencairan *</label>
            <input
              type="text"
              {...register('rekeningBank')}
              placeholder="Contoh: BSI 7123456789 a.n. Ahmad Suhendar"
              className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-[#0f9d6e]"
            />
            {errors.rekeningBank && <p className="text-rose-500 text-[11px] mt-1">{errors.rekeningBank.message}</p>}
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Alamat Domisili Lengkap *</label>
            <textarea
              {...register('alamat')}
              rows={2}
              placeholder="Contoh: Desa Bojongsoang, RT 02/05 Kab. Bandung"
              className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-[#0f9d6e]"
            />
            {errors.alamat && <p className="text-rose-500 text-[11px] mt-1">{errors.alamat.message}</p>}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan Mustahik'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
