import React, { useCallback, useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Mustahik, Asnaf } from '../types/zis';
import { DataTable } from '../components/shared/DataTable';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { HeartHandshake, Plus, ShieldCheck, RefreshCw, Pencil, Trash2, FileText } from 'lucide-react';
import { formatRP } from '../lib/utils';
import { IdNumberInput } from '../components/ui/IdNumberInput';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { mustahikApi } from '../lib/api';

export interface MustahikPageProps {
  onNavigate: (screen: string) => void;
  onOpenDetail: (id: string) => void;
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
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

export const MustahikPage: React.FC<MustahikPageProps> = ({
  onOpenDetail,
  canCreate = false,
  canUpdate = false,
  canDelete = false,
}) => {
  const [dataList, setDataList] = useState<Mustahik[]>([]);
  const [filterAsnaf, setFilterAsnaf] = useState<string>('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Mustahik | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Mustahik | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const openDetail = (row: Mustahik) => onOpenDetail(row.id);

  const openCreate = () => {
    setEditTarget(null);
    reset({ kategoriAsnaf: 'Fakir', penghasilanBulanan: 1000000, jumlahTanggungan: 3, nik: '', nama: '', hp: '', alamat: '', pekerjaan: '', rekeningBank: '' });
    setIsModalOpen(true);
  };

  const openEdit = (row: Mustahik) => {
    setEditTarget(row);
    reset({
      nik: row.nik,
      nama: row.nama,
      kategoriAsnaf: row.kategoriAsnaf,
      hp: row.hp,
      alamat: row.alamat,
      pekerjaan: row.pekerjaan,
      penghasilanBulanan: row.penghasilanBulanan,
      jumlahTanggungan: row.jumlahTanggungan,
      rekeningBank: row.rekeningBank,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      if (editTarget) {
        const updated = await mustahikApi.update(editTarget.id, {
          nama: values.nama,
          kategoriAsnaf: values.kategoriAsnaf,
          hp: values.hp,
          alamat: values.alamat,
          pekerjaan: values.pekerjaan,
          jumlahTanggungan: values.jumlahTanggungan,
          penghasilanBulanan: values.penghasilanBulanan,
          rekeningBank: values.rekeningBank,
        });
        setDataList((prev) =>
          prev.map((m) =>
            m.id === editTarget.id
              ? { ...m, ...updated, skorKelayakan: updated.skorKelayakan ?? m.skorKelayakan }
              : m,
          ),
        );
        toast.success(`Data mustahik "${values.nama}" berhasil diperbarui.`);
      } else {
        const created = await mustahikApi.create(values);
        setDataList((prev) => [created, ...prev]);
        toast.success(`Mustahik ${created.nama} berhasil terdaftar — Skor kelayakan: ${created.skorKelayakan}/100`);
      }
      setIsModalOpen(false);
      setEditTarget(null);
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan data mustahik');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      await mustahikApi.remove(deleteTarget.id);
      setDataList((prev) => prev.filter((m) => m.id !== deleteTarget.id));
      toast.success(`Mustahik "${deleteTarget.nama}" berhasil diarsipkan.`);
      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err.message || 'Gagal menghapus mustahik');
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
          onClick={() => openDetail(row.original)}
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
          {canCreate && (
            <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={openCreate}>
              Tambah Mustahik Baru
            </Button>
          )}
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
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditTarget(null); }}
        title={editTarget ? 'Ubah Data Mustahik' : 'Registrasi Mustahik Terverifikasi'}
        subtitle={editTarget ? `NIK: ${editTarget.nik}` : 'Input data calon penerima bantuan zakat & verifikasi ganda NIK'}
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
                disabled={!!editTarget}
                placeholder="Contoh: 3273101508700002"
                className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-slate-800 dark:text-slate-200 font-mono focus:ring-2 focus:ring-[#0f9d6e] disabled:opacity-60"
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
              <IdNumberInput
                value={watch('penghasilanBulanan')}
                onValueChange={(v) => setValue('penghasilanBulanan', v, { shouldValidate: true, shouldDirty: true })}
                placeholder="Contoh: 1.200.000"
                className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-[#0f9d6e] font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Jumlah Tanggungan Keluarga *</label>
              <IdNumberInput
                value={watch('jumlahTanggungan')}
                onValueChange={(v) => setValue('jumlahTanggungan', v, { shouldValidate: true, shouldDirty: true })}
                placeholder="Contoh: 4"
                className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-[#0f9d6e] font-mono"
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
            <Button type="button" variant="outline" onClick={() => { setIsModalOpen(false); setEditTarget(null); }}>
              Batal
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : editTarget ? 'Simpan Perubahan' : 'Simpan Mustahik'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setDeleteTarget(null); }}
        title="Konfirmasi Arsip Mustahik"
        maxWidth="sm"
      >
        <p className="text-sm text-slate-600 mb-4">
          Arsipkan mustahik <strong>{deleteTarget?.nama}</strong>? Data riwayat penyaluran tetap tersimpan, namun mustahik tidak lagi muncul di daftar aktif.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => { setIsDeleteModalOpen(false); setDeleteTarget(null); }} disabled={isSubmitting}>
            Batal
          </Button>
          <Button variant="danger" onClick={confirmDelete} disabled={isSubmitting}>
            {isSubmitting ? 'Mengarsipkan...' : 'Arsipkan Mustahik'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};
