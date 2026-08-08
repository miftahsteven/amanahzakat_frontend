import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { TransaksiPenerimaan, JenisZis } from '../types/zis';
import { INITIAL_PENERIMAAN, INITIAL_MUZAKKI } from '../mock/mockData';
import { DataTable } from '../components/shared/DataTable';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { BszPdfModal } from '../components/shared/BszPdfModal';
import { Plus, Printer, CheckCircle, FileText, ArrowDownLeft } from 'lucide-react';
import { formatRP } from '../lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

export interface PenerimaanPageProps {
  onNavigate: (screen: string) => void;
  onSelectTrx: (id: string) => void;
}

const formSchema = z.object({
  muzakkiId: z.string().min(1, 'Pilih Muzakki terlebih dahulu'),
  jenisZis: z.enum(['Zakat Maal', 'Zakat Profesi', 'Zakat Pertanian', 'Zakat Pertambangan', 'Zakat Fitrah', 'Infak', 'Shodaqoh', 'Wakaf Uang']),
  nominal: z.number().min(10000, 'Nominal minimal Rp 10.000'),
  kanal: z.enum(['Transfer Bank BSI', 'QRIS', 'Cash / Konter', 'Payroll UPZ', 'Marketplace']),
  catatan: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export const PenerimaanPage: React.FC<PenerimaanPageProps> = ({ onNavigate, onSelectTrx }) => {
  const [dataList, setDataList] = useState<TransaksiPenerimaan[]>(INITIAL_PENERIMAAN);
  const [filterJenis, setFilterJenis] = useState<string>('Semua');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedBszData, setSelectedBszData] = useState<TransaksiPenerimaan | null>(null);

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

  const filteredData = dataList.filter((item) => {
    if (filterJenis === 'Semua') return true;
    return item.jenisZis === filterJenis;
  });

  const onSubmit = (values: FormValues) => {
    const selectedMuzakki = INITIAL_MUZAKKI.find((m) => m.id === values.muzakkiId);
    const newTrx: TransaksiPenerimaan = {
      id: String(dataList.length + 1),
      noKwitansi: `KWT/2026/08/${String(dataList.length + 1).padStart(3, '0')}`,
      tanggal: new Date().toISOString().split('T')[0],
      muzakkiId: values.muzakkiId,
      muzakkiNama: selectedMuzakki ? selectedMuzakki.nama : 'Muzakki umum',
      muzakkiTipe: selectedMuzakki ? selectedMuzakki.tipe : 'Perorangan',
      jenisZis: values.jenisZis as JenisZis,
      nominal: values.nominal,
      kanal: values.kanal,
      rekeningTujuan: 'BSI 7001234567 (Zakat Maal)',
      status: 'Terverifikasi',
      catatan: values.catatan,
    };

    setDataList([newTrx, ...dataList]);
    toast.success(`Transaksi Penerimaan ZIS ${newTrx.noKwitansi} berhasil dicatat & diverifikasi!`);
    reset();
    setIsCreateModalOpen(false);
  };

  const handleVerifikasi = (id: string) => {
    setDataList(
      dataList.map((item) => (item.id === id ? { ...item, status: 'Terverifikasi' } : item))
    );
    toast.success('Penerimaan ZIS berhasil diverifikasi bank!');
  };

  const columns: ColumnDef<TransaksiPenerimaan, any>[] = [
    {
      accessorKey: 'noKwitansi',
      header: 'No. Kwitansi',
      cell: ({ row }: any) => (
        <span
          onClick={() => onSelectTrx(row.original.id)}
          className="font-mono font-bold text-[#0B9D6D] hover:underline cursor-pointer"
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
          <div className="font-bold text-[#14271F] dark:text-slate-200">{row.getValue('muzakkiNama')}</div>
          <div className="text-[10px] text-[#8A9691]">{row.original.muzakkiTipe}</div>
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
      cell: ({ row }: any) => <span className="font-extrabold text-[#0B9D6D]">{formatRP(row.getValue('nominal'))}</span>,
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
              <CheckCircle className="w-3.5 h-3.5 text-[#0B9D6D]" />
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setSelectedBszData(row.original)} title="Cetak BSZ">
            <Printer className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onSelectTrx(row.original.id)}>
            <FileText className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#14271F] dark:text-slate-100 flex items-center gap-2">
            <ArrowDownLeft className="w-6 h-6 text-[#0B9D6D]" /> Transaksi Penerimaan ZIS
          </h1>
          <p className="text-xs text-[#8A9691]">Pencatatan setoran masuk Zakat, Infak, Shodaqoh, dan Bukti Setor Zakat (BSZ)</p>
        </div>
        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setIsCreateModalOpen(true)}>
          Catat Penerimaan Baru
        </Button>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
        {['Semua', 'Zakat Maal', 'Zakat Profesi', 'Zakat Fitrah', 'Infak', 'Shodaqoh'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterJenis(tab)}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              filterJenis === tab
                ? 'bg-[#0B9D6D] text-white font-bold shadow-xs'
                : 'bg-white dark:bg-slate-900 text-[#14271F] dark:text-slate-400 hover:bg-[#F3F6F4] border border-[#D4DBD6] dark:border-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* DataTable */}
      <DataTable columns={columns} data={filteredData} searchPlaceholder="Cari kwitansi atau nama muzakki..." />

      {/* Create Transaction Modal Form (RHF + Zod) */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Catat Penerimaan ZIS Baru"
        subtitle="Input transaksi setoran masuk ke rekening penampung Amanah Zakat"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[#14271F] dark:text-slate-300 mb-1">Pilih Muzakki / Donatur *</label>
            <select
              {...register('muzakkiId')}
              className="w-full p-2.5 border border-[#D4DBD6] dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-[#14271F] dark:text-slate-200 focus:ring-2 focus:ring-[#0B9D6D]"
            >
              <option value="">-- Pilih Muzakki Terdaftar --</option>
              {INITIAL_MUZAKKI.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nama} ({m.tipe}) - {m.nomor}
                </option>
              ))}
            </select>
            {errors.muzakkiId && <p className="text-rose-500 text-[11px] mt-1">{errors.muzakkiId.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-[#14271F] dark:text-slate-300 mb-1">Jenis ZIS *</label>
              <select
                {...register('jenisZis')}
                className="w-full p-2.5 border border-[#D4DBD6] dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-[#14271F] dark:text-slate-200 focus:ring-2 focus:ring-[#0B9D6D]"
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
              <label className="block font-bold text-[#14271F] dark:text-slate-300 mb-1">Kanal Pembayaran *</label>
              <select
                {...register('kanal')}
                className="w-full p-2.5 border border-[#D4DBD6] dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-[#14271F] dark:text-slate-200 focus:ring-2 focus:ring-[#0B9D6D]"
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
            <label className="block font-bold text-[#14271F] dark:text-slate-300 mb-1">Nominal (Rp) *</label>
            <input
              type="number"
              {...register('nominal', { valueAsNumber: true })}
              placeholder="Contoh: 1500000"
              className="w-full p-2.5 border border-[#D4DBD6] dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-[#14271F] dark:text-slate-200 focus:ring-2 focus:ring-[#0B9D6D]"
            />
            {errors.nominal && <p className="text-rose-500 text-[11px] mt-1">{errors.nominal.message}</p>}
          </div>

          <div>
            <label className="block font-bold text-[#14271F] dark:text-slate-300 mb-1">Catatan / Keterangan Akad</label>
            <textarea
              {...register('catatan')}
              rows={2}
              placeholder="Contoh: Zakat penghasilan bulan Agustus 2026..."
              className="w-full p-2.5 border border-[#D4DBD6] dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-[#14271F] dark:text-slate-200 focus:ring-2 focus:ring-[#0B9D6D]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EBEFEB] dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary">
              Simpan Penerimaan
            </Button>
          </div>
        </form>
      </Modal>

      {/* BSZ Generator Modal */}
      <BszPdfModal isOpen={!!selectedBszData} onClose={() => setSelectedBszData(null)} data={selectedBszData} />
    </div>
  );
};
