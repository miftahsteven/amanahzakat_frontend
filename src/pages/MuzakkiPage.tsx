import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Muzakki } from '../types/zis';
import { INITIAL_MUZAKKI } from '../mock/mockData';
import { DataTable } from '../components/shared/DataTable';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Users, Plus, FileSpreadsheet, Mail, Phone } from 'lucide-react';
import { formatRP } from '../lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

export interface MuzakkiPageProps {
  onNavigate: (screen: string) => void;
  onSelectMuzakki: (id: string) => void;
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

export const MuzakkiPage: React.FC<MuzakkiPageProps> = ({ onNavigate, onSelectMuzakki }) => {
  const [dataList, setDataList] = useState<Muzakki[]>(INITIAL_MUZAKKI);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tipe: 'Perorangan',
    },
  });

  const onSubmit = (values: FormValues) => {
    const newMuzakki: Muzakki = {
      id: String(dataList.length + 1),
      nomor: `MZK-2026-${String(dataList.length + 1).padStart(5, '0')}`,
      nama: values.nama,
      tipe: values.tipe,
      nikAtauNpwp: values.nikAtauNpwp,
      hp: values.hp,
      email: values.email,
      alamat: values.alamat,
      totalSetoran: 0,
      transaksiCount: 0,
      tanggalBergabung: new Date().toISOString().split('T')[0],
    };

    setDataList([newMuzakki, ...dataList]);
    toast.success(`Muzakki ${newMuzakki.nama} berhasil terdaftar dengan nomor ${newMuzakki.nomor}!`);
    reset();
    setIsCreateModalOpen(false);
  };

  const columns: ColumnDef<Muzakki, any>[] = [
    {
      accessorKey: 'nomor',
      header: 'ID Muzakki',
      cell: ({ row }: any) => (
        <span
          onClick={() => onSelectMuzakki(row.original.id)}
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
          <Button variant="outline" size="sm" onClick={() => onNavigate('rekap')} title="Surat SPT">
            <FileSpreadsheet className="w-3.5 h-3.5" /> Surat SPT
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
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-[#0f9d6e]" /> Master Data Muzakki (Donatur)
          </h1>
          <p className="text-xs text-slate-500">Database Wajib Zakat perorangan, korporat CSR, dan UPZ terdaftar</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={<FileSpreadsheet className="w-4 h-4" />} onClick={() => onNavigate('rekap')}>
            Rekap Tahunan SPT
          </Button>
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setIsCreateModalOpen(true)}>
            Daftarkan Muzakki Baru
          </Button>
        </div>
      </div>

      {/* DataTable */}
      <DataTable columns={columns} data={dataList} searchPlaceholder="Cari ID, nama, NPWP, atau kontak..." />

      {/* Create Muzakki Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Registrasi Muzakki / Donatur Baru"
        subtitle="Pendaftaran Muzakki perorangan atau korporat untuk penerbitan BSZ"
        maxWidth="lg"
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
            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary">
              Daftarkan Muzakki
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
