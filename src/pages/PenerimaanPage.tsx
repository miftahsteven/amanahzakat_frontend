import React, { useCallback, useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { TransaksiPenerimaan, JenisZis, Muzakki } from '../types/zis';
import { DataTable } from '../components/shared/DataTable';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { BszPdfModal } from '../components/shared/BszPdfModal';
import { Plus, Printer, CheckCircle, FileText, ArrowDownLeft, RefreshCw } from 'lucide-react';
import { formatRP } from '../lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { penerimaanApi } from '../lib/api';

export interface PenerimaanPageProps {
  onNavigate: (screen: string) => void;
  onOpenDetail: (id: string) => void;
}

const formSchema = z.object({
  muzakkiId: z.string().min(1, 'Pilih Muzakki terlebih dahulu'),
  jenisZis: z.enum(['Zakat Maal', 'Zakat Profesi', 'Zakat Pertanian', 'Zakat Pertambangan', 'Zakat Fitrah', 'Infak', 'Shodaqoh', 'Wakaf Uang']),
  nominal: z.number().min(10000, 'Nominal minimal Rp 10.000'),
  kanal: z.enum(['Transfer Bank BSI', 'QRIS', 'Cash / Konter', 'Payroll UPZ', 'Marketplace']),
  catatan: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export const PenerimaanPage: React.FC<PenerimaanPageProps> = ({ onOpenDetail }) => {
  const [dataList, setDataList] = useState<TransaksiPenerimaan[]>([]);
  const [muzakkiList, setMuzakkiList] = useState<Muzakki[]>([]);
  const [filterJenis, setFilterJenis] = useState<string>('Semua');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedBszData, setSelectedBszData] = useState<TransaksiPenerimaan | null>(null);
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
      jenisZis: 'Zakat Maal',
      kanal: 'Transfer Bank BSI',
      nominal: 1000000,
    },
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [rows, muzakki] = await Promise.all([
        penerimaanApi.list(filterJenis),
        penerimaanApi.listMuzakki(),
      ]);
      setDataList(rows);
      setMuzakkiList(muzakki);
    } catch (err: any) {
      toast.error(err.message || 'Gagal memuat data penerimaan ZIS');
    } finally {
      setIsLoading(false);
    }
  }, [filterJenis]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openDetail = (row: TransaksiPenerimaan) => onOpenDetail(row.id);

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const created = await penerimaanApi.create({
        muzakkiId: values.muzakkiId,
        jenisZis: values.jenisZis,
        nominal: values.nominal,
        kanal: values.kanal,
        catatan: values.catatan,
      });
      setDataList((prev) => [created, ...prev]);
      toast.success(`Transaksi Penerimaan ZIS ${created.noKwitansi} berhasil dicatat!`);
      reset();
      setIsCreateModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan penerimaan ZIS');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifikasi = async (id: string) => {
    try {
      const updated = await penerimaanApi.verify(id);
      setDataList((prev) => prev.map((item) => (item.id === id ? updated : item)));
      toast.success('Penerimaan ZIS berhasil diverifikasi bank!');
    } catch (err: any) {
      toast.error(err.message || 'Gagal verifikasi penerimaan');
    }
  };

  const columns: ColumnDef<TransaksiPenerimaan, any>[] = [
    {
      accessorKey: 'noKwitansi',
      header: 'No. Kwitansi',
      cell: ({ row }: any) => (
        <span
          onClick={() => openDetail(row.original)}
          className="font-mono font-bold text-[#0F9D6E] hover:underline cursor-pointer"
        >
          {row.getValue('noKwitansi')}
        </span>
      ),
    },
    {
      accessorKey: 'tanggal',
      header: 'Tanggal',
    },
    {
      accessorKey: 'muzakkiNama',
      header: 'Muzakki / Donatur',
      cell: ({ row }: any) => (
        <div>
          <div className="font-bold text-[#16211D] dark:text-slate-200">{row.getValue('muzakkiNama')}</div>
          <div className="text-[10px] text-[#7D938A]">{row.original.muzakkiTipe}</div>
        </div>
      ),
    },
    {
      accessorKey: 'jenisZis',
      header: 'Jenis ZIS',
      cell: ({ row }: any) => <Badge variant="emerald">{row.getValue('jenisZis')}</Badge>,
    },
    {
      accessorKey: 'nominal',
      header: 'Nominal',
      cell: ({ row }: any) => <span className="font-extrabold text-[#0F9D6E]">{formatRP(row.getValue('nominal'))}</span>,
    },
    {
      accessorKey: 'kanal',
      header: 'Kanal Pembayaran',
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
          {row.original.status === 'Menunggu Verifikasi' && (
            <Button variant="secondary" size="sm" onClick={() => handleVerifikasi(row.original.id)}>
              <CheckCircle className="w-3.5 h-3.5 text-[#0F9D6E]" />
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setSelectedBszData(row.original)} title="Cetak BSZ">
            <Printer className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => openDetail(row.original)}>
            <FileText className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#16211D] dark:text-slate-100 flex items-center gap-2">
            <ArrowDownLeft className="w-6 h-6 text-[#0F9D6E]" /> Transaksi Penerimaan ZIS
          </h1>
          <p className="text-xs text-[#7D938A]">Pencatatan setoran masuk Zakat, Infak, Shodaqoh, dan Bukti Setor Zakat (BSZ)</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" icon={<RefreshCw className="w-4 h-4" />} onClick={loadData} disabled={isLoading}>
            Muat Ulang
          </Button>
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setIsCreateModalOpen(true)}>
            Catat Penerimaan Baru
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
        {['Semua', 'Zakat Maal', 'Zakat Profesi', 'Zakat Fitrah', 'Infak', 'Shodaqoh'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterJenis(tab)}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              filterJenis === tab
                ? 'bg-[#0F9D6E] text-white font-bold shadow-xs'
                : 'bg-white dark:bg-slate-900 text-[#16211D] dark:text-slate-400 hover:bg-[#F3F6F4] border border-[#DDE3DF] dark:border-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-sm text-[#7D938A]">Memuat data penerimaan dari server...</div>
      ) : (
        <DataTable columns={columns} data={dataList} searchPlaceholder="Cari kwitansi atau nama muzakki..." />
      )}

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Catat Penerimaan ZIS Baru"
        subtitle="Input transaksi setoran masuk ke rekening penampung Amanah Zakat"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[#16211D] dark:text-slate-300 mb-1">Pilih Muzakki / Donatur *</label>
            <select
              {...register('muzakkiId')}
              className="w-full p-2.5 border border-[#DDE3DF] dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-[#16211D] dark:text-slate-200 focus:ring-2 focus:ring-[#0F9D6E]"
            >
              <option value="">-- Pilih Muzakki Terdaftar --</option>
              {muzakkiList.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nama} ({m.tipe}) - {m.nomor}
                </option>
              ))}
            </select>
            {errors.muzakkiId && <p className="text-rose-500 text-[11px] mt-1">{errors.muzakkiId.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-[#16211D] dark:text-slate-300 mb-1">Jenis ZIS *</label>
              <select
                {...register('jenisZis')}
                className="w-full p-2.5 border border-[#DDE3DF] dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-[#16211D] dark:text-slate-200 focus:ring-2 focus:ring-[#0F9D6E]"
              >
                <option value="Zakat Maal">Zakat Maal</option>
                <option value="Zakat Profesi">Zakat Profesi</option>
                <option value="Zakat Pertanian">Zakat Pertanian</option>
                <option value="Zakat Pertambangan">Zakat Pertambangan</option>
                <option value="Zakat Fitrah">Zakat Fitrah</option>
                <option value="Infak">Infak</option>
                <option value="Shodaqoh">Shodaqoh</option>
                <option value="Wakaf Uang">Wakaf Uang</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#16211D] dark:text-slate-300 mb-1">Kanal Pembayaran *</label>
              <select
                {...register('kanal')}
                className="w-full p-2.5 border border-[#DDE3DF] dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-[#16211D] dark:text-slate-200 focus:ring-2 focus:ring-[#0F9D6E]"
              >
                <option value="Transfer Bank BSI">Transfer Bank BSI</option>
                <option value="QRIS">QRIS</option>
                <option value="Cash / Konter">Cash / Konter</option>
                <option value="Payroll UPZ">Payroll UPZ</option>
                <option value="Marketplace">Marketplace</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#16211D] dark:text-slate-300 mb-1">Nominal (Rp) *</label>
            <input
              type="number"
              {...register('nominal', { valueAsNumber: true })}
              placeholder="Contoh: 1500000"
              className="w-full p-2.5 border border-[#DDE3DF] dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-[#16211D] dark:text-slate-200 focus:ring-2 focus:ring-[#0F9D6E]"
            />
            {errors.nominal && <p className="text-rose-500 text-[11px] mt-1">{errors.nominal.message}</p>}
          </div>

          <div>
            <label className="block font-bold text-[#16211D] dark:text-slate-300 mb-1">Catatan / Keterangan Akad</label>
            <textarea
              {...register('catatan')}
              rows={2}
              placeholder="Contoh: Zakat penghasilan bulan Agustus 2026..."
              className="w-full p-2.5 border border-[#DDE3DF] dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-[#16211D] dark:text-slate-200 focus:ring-2 focus:ring-[#0F9D6E]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E3E8E4] dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan Penerimaan'}
            </Button>
          </div>
        </form>
      </Modal>

      <BszPdfModal isOpen={!!selectedBszData} onClose={() => setSelectedBszData(null)} data={selectedBszData} />
    </div>
  );
};
