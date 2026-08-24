import React, { useCallback, useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { TransaksiPenyaluran, Asnaf, Mustahik } from '../types/zis';
import { ProgramZis } from '../types/system';
import { DataTable } from '../components/shared/DataTable';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Plus, ArrowUpRight, RefreshCw } from 'lucide-react';
import { formatRP } from '../lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { penyaluranApi } from '../lib/api';

export interface PenyaluranPageProps {
  onNavigate: (screen: string) => void;
  onOpenDetail: (id: string) => void;
}

const formSchema = z.object({
  mustahikId: z.string().min(1, 'Pilih Mustahik terlebih dahulu'),
  programId: z.string().min(1, 'Pilih Program terlebih dahulu'),
  asnaf: z.enum(['Fakir', 'Miskin', 'Amil', 'Mualaf', 'Riqab', 'Gharim', 'Fisabilillah', 'Ibnus Sabil']),
  nominal: z.number().min(50000, 'Nominal pencairan minimal Rp 50.000'),
  metodePembayaran: z.string().min(1, 'Metode pembayaran wajib diisi'),
  keterangan: z.string().min(5, 'Keterangan peruntukan wajib diisi'),
});

type FormValues = z.infer<typeof formSchema>;

export const PenyaluranPage: React.FC<PenyaluranPageProps> = ({ onOpenDetail }) => {
  const [dataList, setDataList] = useState<TransaksiPenyaluran[]>([]);
  const [mustahikList, setMustahikList] = useState<Mustahik[]>([]);
  const [programList, setProgramList] = useState<ProgramZis[]>([]);
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
      asnaf: 'Fakir',
      metodePembayaran: 'Transfer Bank BSI',
      nominal: 2500000,
    },
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [rows, mustahik, programs] = await Promise.all([
        penyaluranApi.list(filterAsnaf),
        penyaluranApi.listMustahik(),
        penyaluranApi.listProgram(),
      ]);
      setDataList(rows);
      setMustahikList(mustahik);
      setProgramList(programs);
    } catch (err: any) {
      toast.error(err.message || 'Gagal memuat data penyaluran');
    } finally {
      setIsLoading(false);
    }
  }, [filterAsnaf]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openDetail = (row: TransaksiPenyaluran) => onOpenDetail(row.id);

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const created = await penyaluranApi.create(values);
      setDataList((prev) => [created, ...prev]);
      toast.success(`Pengajuan Penyaluran ${created.noPenyaluran} berhasil dibuat & masuk antrean pembayaran!`);
      reset();
      setIsCreateModalOpen(false);
      penyaluranApi.listMustahik().then(setMustahikList);
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan pengajuan penyaluran');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSalurkan = async (id: string) => {
    try {
      const updated = await penyaluranApi.disburse(id);
      setDataList((prev) => prev.map((item) => (item.id === id ? updated : item)));
      toast.success('Penyaluran dana ZIS ke Mustahik telah berhasil dikirim!');
      penyaluranApi.listMustahik().then(setMustahikList);
      penyaluranApi.listProgram().then(setProgramList);
    } catch (err: any) {
      toast.error(err.message || 'Gagal mencairkan penyaluran');
    }
  };

  const columns: ColumnDef<TransaksiPenyaluran, any>[] = [
    {
      accessorKey: 'noPenyaluran',
      header: 'No. Penyaluran',
      cell: ({ row }: any) => (
        <span
          onClick={() => openDetail(row.original)}
          className="font-mono font-bold text-blue-600 hover:underline cursor-pointer"
        >
          {row.getValue('noPenyaluran')}
        </span>
      ),
    },
    {
      accessorKey: 'tanggal',
      header: 'Tanggal',
    },
    {
      accessorKey: 'mustahikNama',
      header: 'Penerima (Mustahik)',
      cell: ({ row }: any) => (
        <div>
          <div className="font-bold text-slate-800 dark:text-slate-200">{row.getValue('mustahikNama')}</div>
          <div className="text-[10px] text-slate-400">Asnaf: {row.original.asnaf}</div>
        </div>
      ),
    },
    {
      accessorKey: 'programNama',
      header: 'Program ZIS',
      cell: ({ row }: any) => (
        <div className="max-w-xs truncate font-medium text-slate-700 dark:text-slate-300">
          {row.getValue('programNama')}
        </div>
      ),
    },
    {
      accessorKey: 'nominal',
      header: 'Total Nominal',
      cell: ({ row }: any) => <span className="font-extrabold text-blue-600">{formatRP(row.getValue('nominal'))}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => <Badge statusText={row.getValue('status')} />,
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-1.5">
          {row.original.status === 'Siap Bayar' && (
            <Button variant="primary" size="sm" onClick={() => handleSalurkan(row.original.id)}>
              Cairkan Dana
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => openDetail(row.original)}>
            Detail
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ArrowUpRight className="w-6 h-6 text-blue-600" /> Penyaluran ZIS 8 Asnaf
          </h1>
          <p className="text-xs text-slate-500">
            Distribusi dana zakat, infak, dan sedekah tepat sasaran sesuai syariah
            {!isLoading && ` — Total: ${dataList.length} transaksi`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={<RefreshCw className="w-4 h-4" />} onClick={loadData} disabled={isLoading}>
            Refresh
          </Button>
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setIsCreateModalOpen(true)}>
            Buat Penyaluran Baru
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
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-sm text-slate-500">Memuat data penyaluran...</div>
      ) : (
        <DataTable columns={columns} data={dataList} searchPlaceholder="Cari no penyaluran, program, atau mustahik..." />
      )}

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Pengajuan Penyaluran Dana ZIS"
        subtitle="Pencairan dana zakat ke rekening mustahik terdaftar"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pilih Mustahik Penerima *</label>
            <select
              {...register('mustahikId')}
              className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-[#0f9d6e]"
            >
              <option value="">-- Pilih Mustahik Terverifikasi --</option>
              {mustahikList.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nama} ({m.kategoriAsnaf}) - NIK: {m.nik}
                </option>
              ))}
            </select>
            {errors.mustahikId && <p className="text-rose-500 text-[11px] mt-1">{errors.mustahikId.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Golongan Asnaf *</label>
              <select
                {...register('asnaf')}
                className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-[#0f9d6e]"
              >
                <option value="Fakir">Fakir</option>
                <option value="Miskin">Miskin</option>
                <option value="Amil">Amil</option>
                <option value="Mualaf">Mualaf</option>
                <option value="Riqab">Riqab</option>
                <option value="Gharim">Gharim</option>
                <option value="Fisabilillah">Fisabilillah</option>
                <option value="Ibnus Sabil">Ibnus Sabil</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Program ZIS *</label>
              <select
                {...register('programId')}
                className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-[#0f9d6e]"
              >
                <option value="">-- Pilih Program --</option>
                {programList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama} ({p.pilar})
                  </option>
                ))}
              </select>
              {errors.programId && <p className="text-rose-500 text-[11px] mt-1">{errors.programId.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nominal Bantuan (Rp) *</label>
              <input
                type="number"
                {...register('nominal', { valueAsNumber: true })}
                placeholder="Contoh: 2500000"
                className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-[#0f9d6e]"
              />
              {errors.nominal && <p className="text-rose-500 text-[11px] mt-1">{errors.nominal.message}</p>}
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Metode Pembayaran *</label>
              <input
                type="text"
                {...register('metodePembayaran')}
                placeholder="Contoh: Transfer Bank BSI"
                className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-[#0f9d6e]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Keterangan / Peruntukan Bantuan *</label>
            <textarea
              {...register('keterangan')}
              rows={2}
              placeholder="Contoh: Bantuan biaya pendidikan UKT & perlengkapan sekolah..."
              className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-[#0f9d6e]"
            />
            {errors.keterangan && <p className="text-rose-500 text-[11px] mt-1">{errors.keterangan.message}</p>}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : 'Ajukan Penyaluran'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
