import React, { useCallback, useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { AmilKaryawan } from '../types/system';
import { DataTable } from '../components/shared/DataTable';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { IdNumberInput } from '../components/ui/IdNumberInput';
import { CreditCard, Plus, RefreshCw, Pencil, Banknote } from 'lucide-react';
import { formatRP } from '../lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { payrollApi } from '../lib/api';

export interface PayrollPageProps {
  onNavigate: (screen: string) => void;
  canUpdate?: boolean;
}

const formSchema = z.object({
  nama: z.string().min(3, 'Nama minimal 3 karakter'),
  jabatan: z.string().min(3, 'Jabatan wajib diisi'),
  divisi: z.enum(['Penghimpunan', 'Penyaluran & Program', 'Keuangan & Akuntansi', 'SDM & Umum']),
  gajiPokok: z.number().min(0, 'Gaji tidak boleh negatif'),
  tunjanganAmil: z.number().min(0, 'Tunjangan tidak boleh negatif'),
  keikutsertaanPayroll: z.boolean().optional(),
  statusKerja: z.enum(['Tetap', 'Kontrak', 'Relawan']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export const PayrollPage: React.FC<PayrollPageProps> = ({ canUpdate = false }) => {
  const [dataList, setDataList] = useState<AmilKaryawan[]>([]);
  const [filterDivisi, setFilterDivisi] = useState<string>('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AmilKaryawan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      divisi: 'Penghimpunan',
      statusKerja: 'Tetap',
      keikutsertaanPayroll: true,
      gajiPokok: 5000000,
      tunjanganAmil: 1000000,
    },
  });

  const keikutsertaan = watch('keikutsertaanPayroll');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const rows = await payrollApi.list(filterDivisi);
      setDataList(rows);
    } catch (err: any) {
      toast.error(err.message || 'Gagal memuat data payroll amil');
    } finally {
      setIsLoading(false);
    }
  }, [filterDivisi]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreate = () => {
    setEditTarget(null);
    reset({
      nama: '',
      jabatan: '',
      divisi: 'Penghimpunan',
      statusKerja: 'Tetap',
      keikutsertaanPayroll: true,
      gajiPokok: 5000000,
      tunjanganAmil: 1000000,
    });
    setIsModalOpen(true);
  };

  const openEdit = (amil: AmilKaryawan) => {
    setEditTarget(amil);
    reset({
      nama: amil.nama,
      jabatan: amil.jabatan,
      divisi: amil.divisi,
      gajiPokok: amil.gajiPokok,
      tunjanganAmil: amil.tunjanganAmil,
      keikutsertaanPayroll: amil.keikutsertaanPayroll,
      statusKerja: amil.statusKerja,
    });
    setIsModalOpen(true);
  };

  const handleProcessPayroll = async () => {
    setIsProcessing(true);
    try {
      const result = await payrollApi.process();
      toast.success(
        `Payroll ${result.periode}: ${result.jumlahAmil} amil · Netto ${formatRP(result.totalNetto)} · Potongan zakat ${formatRP(result.totalPotonganZakat)}`,
        { duration: 6000 },
      );
    } catch (err: any) {
      toast.error(err.message || 'Gagal memproses payroll');
    } finally {
      setIsProcessing(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      if (editTarget) {
        const updated = await payrollApi.update(editTarget.id, values);
        setDataList((prev) => prev.map((a) => (a.id === editTarget.id ? updated : a)));
        toast.success(`Data ${updated.nama} berhasil diperbarui.`);
      } else {
        const created = await payrollApi.create(values);
        setDataList((prev) => [...prev, created]);
        toast.success(`Amil terdaftar — NIP ${created.nip}`);
      }
      setIsModalOpen(false);
      setEditTarget(null);
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan data amil');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnDef<AmilKaryawan, any>[] = [
    {
      accessorKey: 'nip',
      header: 'NIP Amil',
      cell: ({ row }: any) => (
        <span className="font-mono font-bold text-[#16211D] dark:text-slate-100">{row.getValue('nip')}</span>
      ),
    },
    {
      accessorKey: 'nama',
      header: 'Nama Amil / Staf',
      cell: ({ row }: any) => (
        <div>
          <div className="font-bold text-[#16211D] dark:text-slate-100">{row.getValue('nama')}</div>
          <div className="text-[10px] text-slate-400">{row.original.jabatan}</div>
        </div>
      ),
    },
    {
      accessorKey: 'divisi',
      header: 'Divisi',
      cell: ({ row }: any) => <Badge variant="blue">{row.getValue('divisi')}</Badge>,
    },
    {
      accessorKey: 'gajiPokok',
      header: 'Gaji Pokok',
      cell: ({ row }: any) => <span className="font-semibold">{formatRP(row.getValue('gajiPokok'))}</span>,
    },
    {
      accessorKey: 'tunjanganAmil',
      header: 'Hak Amil / Tunjangan',
      cell: ({ row }: any) => (
        <span className="font-bold text-[#0F9D6E]">{formatRP(row.getValue('tunjanganAmil'))}</span>
      ),
    },
    {
      accessorKey: 'potonganZakat',
      header: 'Potongan Zakat',
      cell: ({ row }: any) => (
        <span className="font-semibold text-amber-600">{formatRP(row.getValue('potonganZakat'))}</span>
      ),
    },
    {
      accessorKey: 'statusKerja',
      header: 'Status',
      cell: ({ row }: any) => (
        <div className="space-y-0.5">
          <Badge statusText={row.getValue('statusKerja')} />
          {!row.original.keikutsertaanPayroll && (
            <div className="text-[10px] text-slate-400">Di luar payroll</div>
          )}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }: any) =>
        canUpdate ? (
          <Button variant="outline" size="sm" icon={<Pencil className="w-3.5 h-3.5" />} onClick={() => openEdit(row.original)}>
            Ubah
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[25px] font-extrabold text-[#16211D] dark:text-slate-100 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-[#0F9D6E]" /> SDM Amil & Payroll Hak Amil (12.5%)
          </h1>
          <p className="text-[13px] text-[#7D938A] mt-0.5">
            Pengelolaan alokasi 1/8 Asnaf Hak Amil & Penggajian Karyawan LAZNAS
            {!isLoading && ` — ${dataList.length} amil`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="secondary" icon={<RefreshCw className="w-4 h-4" />} onClick={loadData} disabled={isLoading}>
            Refresh
          </Button>
          {canUpdate && (
            <>
              <Button
                variant="primary"
                icon={<Banknote className="w-4 h-4" />}
                onClick={handleProcessPayroll}
                disabled={isProcessing}
              >
                {isProcessing ? 'Memproses...' : 'Proses Payroll Gaji'}
              </Button>
              <Button variant="outline" icon={<Plus className="w-4 h-4" />} onClick={openCreate}>
                Tambah Amil
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
        {['Semua', 'Penghimpunan', 'Penyaluran & Program', 'Keuangan & Akuntansi', 'SDM & Umum'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilterDivisi(tab)}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
              filterDivisi === tab
                ? 'bg-[#0F9D6E] text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <DataTable columns={columns} data={dataList} searchPlaceholder="Cari NIP atau nama amil..." />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditTarget(null);
        }}
        title={editTarget ? 'Ubah Data Amil' : 'Tambah Amil / Staf Baru'}
        subtitle={editTarget ? `NIP: ${editTarget.nip}` : 'NIP akan digenerate otomatis · Potongan zakat 2,5% otomatis'}
        maxWidth="lg"
        maximizable
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap *</label>
            <input
              type="text"
              {...register('nama')}
              placeholder="Contoh: Ahmad Syarif, S.E.I"
              className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl"
            />
            {errors.nama && <p className="text-rose-500 text-[11px] mt-1">{errors.nama.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Jabatan *</label>
              <input
                type="text"
                {...register('jabatan')}
                placeholder="Contoh: Staf Penghimpunan"
                className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl"
              />
              {errors.jabatan && <p className="text-rose-500 text-[11px] mt-1">{errors.jabatan.message}</p>}
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Divisi *</label>
              <select {...register('divisi')} className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl">
                <option value="Penghimpunan">Penghimpunan</option>
                <option value="Penyaluran & Program">Penyaluran & Program</option>
                <option value="Keuangan & Akuntansi">Keuangan & Akuntansi</option>
                <option value="SDM & Umum">SDM & Umum</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Gaji Pokok (Rp) *</label>
              <IdNumberInput
                value={watch('gajiPokok')}
                onValueChange={(v) => setValue('gajiPokok', v, { shouldValidate: true, shouldDirty: true })}
                className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl font-mono"
              />
              {errors.gajiPokok && <p className="text-rose-500 text-[11px] mt-1">{errors.gajiPokok.message}</p>}
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tunjangan Amil (Rp) *</label>
              <IdNumberInput
                value={watch('tunjanganAmil')}
                onValueChange={(v) => setValue('tunjanganAmil', v, { shouldValidate: true, shouldDirty: true })}
                className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl font-mono"
              />
              {errors.tunjanganAmil && <p className="text-rose-500 text-[11px] mt-1">{errors.tunjanganAmil.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Status Kerja</label>
              <select {...register('statusKerja')} className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl">
                <option value="Tetap">Tetap</option>
                <option value="Kontrak">Kontrak</option>
                <option value="Relawan">Relawan</option>
              </select>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!keikutsertaan}
                  onChange={(e) => setValue('keikutsertaanPayroll', e.target.checked)}
                  className="rounded border-slate-300"
                />
                <span className="font-bold text-slate-700 dark:text-slate-300">Ikut Payroll Bulanan</span>
              </label>
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
              {isSubmitting ? 'Menyimpan...' : editTarget ? 'Simpan Perubahan' : 'Daftarkan Amil'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
