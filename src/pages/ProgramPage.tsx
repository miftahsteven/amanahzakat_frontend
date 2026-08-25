import React, { useCallback, useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { ProgramZis } from '../types/system';
import { DataTable } from '../components/shared/DataTable';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { IdNumberInput } from '../components/ui/IdNumberInput';
import { FolderKanban, Plus, RefreshCw, Pencil, FileText, Trash2 } from 'lucide-react';
import { formatRP } from '../lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { programApi } from '../lib/api';

export interface ProgramPageProps {
  onNavigate: (screen: string) => void;
  onOpenDetail: (id: string) => void;
  /** Buat & ubah — backend memakai program.update untuk keduanya */
  canUpdate?: boolean;
  canDelete?: boolean;
}

const formSchema = z.object({
  nama: z.string().min(5, 'Nama program minimal 5 karakter'),
  pilar: z.enum(['Pendidikan', 'Kesehatan', 'Ekonomi', 'Dakwah', 'Kemanusiaan']),
  paguAnggaran: z.number().min(1000000, 'Pagu minimal Rp 1.000.000'),
  targetPenerima: z.number().min(1, 'Target penerima minimal 1'),
  penanggungJawab: z.string().min(3, 'Penanggung jawab wajib diisi'),
  status: z.enum(['Berjalan', 'Selesai', 'Perencanaan']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export const ProgramPage: React.FC<ProgramPageProps> = ({
  onOpenDetail,
  canUpdate = false,
  canDelete = false,
}) => {
  const openDetail = (row: ProgramZis) => onOpenDetail(row.id);
  const [dataList, setDataList] = useState<ProgramZis[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ProgramZis | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProgramZis | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
      pilar: 'Pendidikan',
      status: 'Berjalan',
      paguAnggaran: 100000000,
      targetPenerima: 50,
    },
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const rows = await programApi.list();
      setDataList(rows);
    } catch (err: any) {
      toast.error(err.message || 'Gagal memuat data program ZIS');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreate = () => {
    setEditTarget(null);
    reset({
      nama: '',
      pilar: 'Pendidikan',
      paguAnggaran: 100000000,
      targetPenerima: 50,
      penanggungJawab: '',
      status: 'Berjalan',
    });
    setIsCreateModalOpen(true);
  };

  const openEdit = (program: ProgramZis) => {
    setEditTarget(program);
    reset({
      nama: program.nama,
      pilar: program.pilar,
      paguAnggaran: program.paguAnggaran,
      targetPenerima: program.targetPenerima,
      penanggungJawab: program.penanggungJawab,
      status: program.status,
    });
    setIsCreateModalOpen(true);
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      if (editTarget) {
        const updated = await programApi.update(editTarget.id, values);
        setDataList((prev) => prev.map((p) => (p.id === editTarget.id ? updated : p)));
        toast.success(`Program "${updated.nama}" berhasil diperbarui.`);
      } else {
        const created = await programApi.create(values);
        setDataList((prev) => [...prev, created]);
        toast.success(`Program "${created.nama}" berhasil dibuat.`);
      }
      setIsCreateModalOpen(false);
      setEditTarget(null);
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan program ZIS');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDelete = (program: ProgramZis) => {
    setDeleteTarget(program);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await programApi.remove(deleteTarget.id);
      setDataList((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      toast.success(`Program "${deleteTarget.nama}" berhasil dihapus.`);
      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err.message || 'Gagal menghapus program ZIS');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: ColumnDef<ProgramZis, any>[] = [
    {
      accessorKey: 'nama',
      header: 'Nama Program',
      cell: ({ row }: any) => (
        <span
          onClick={() => openDetail(row.original)}
          className="font-bold text-[#0F9D6E] hover:underline cursor-pointer"
        >
          {row.getValue('nama')}
        </span>
      ),
    },
    {
      accessorKey: 'pilar',
      header: 'Pilar ZIS',
      cell: ({ row }: any) => <Badge variant="emerald">{row.getValue('pilar')}</Badge>,
    },
    {
      accessorKey: 'paguAnggaran',
      header: 'Pagu Anggaran',
      cell: ({ row }: any) => <span className="font-semibold">{formatRP(row.getValue('paguAnggaran'))}</span>,
    },
    {
      accessorKey: 'terpakai',
      header: 'Realisasi Terpakai',
      cell: ({ row }: any) => {
        const pagu = row.original.paguAnggaran as number;
        const terpakai = row.getValue('terpakai') as number;
        const pct = pagu > 0 ? Math.round((terpakai / pagu) * 100) : 0;
        return (
          <div>
            <span className="font-bold text-[#0F9D6E]">{formatRP(terpakai)}</span>
            <div className="text-[10px] text-slate-400">{pct}% dari pagu</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'realisasiPenerima',
      header: 'Target vs Realisasi',
      cell: ({ row }: any) => (
        <span>
          {row.original.realisasiPenerima} / {row.original.targetPenerima} Mustahik
        </span>
      ),
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
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
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
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              title="Hapus"
              onClick={() => openDelete(row.original)}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[25px] font-extrabold text-[#16211D] dark:text-slate-100 flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-[#0F9D6E]" /> Program 5 Pilar ZIS
          </h1>
          <p className="text-[13px] text-[#7D938A] mt-0.5">
            Pendidikan, Kesehatan, Ekonomi, Dakwah, dan Kemanusiaan
            {!isLoading && ` — ${dataList.length} program aktif`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={<RefreshCw className="w-4 h-4" />} onClick={loadData} disabled={isLoading}>
            Refresh
          </Button>
          {canUpdate && (
            <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={openCreate}>
              Buat Program Baru
            </Button>
          )}
        </div>
      </div>

      <DataTable columns={columns} data={dataList} searchPlaceholder="Cari program pilar..." />

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditTarget(null);
        }}
        title={editTarget ? 'Ubah Program & Pagu' : 'Buat Program ZIS Baru'}
        maximizable
        subtitle="Kelola pagu anggaran dan target penerima manfaat per pilar"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Program *</label>
            <input
              type="text"
              {...register('nama')}
              placeholder="Contoh: Amanah Pendidikan (Beasiswa & Sekolah)"
              className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl"
            />
            {errors.nama && <p className="text-rose-500 text-[11px] mt-1">{errors.nama.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pilar ZIS *</label>
              <select {...register('pilar')} className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl">
                <option value="Pendidikan">Pendidikan</option>
                <option value="Kesehatan">Kesehatan</option>
                <option value="Ekonomi">Ekonomi</option>
                <option value="Dakwah">Dakwah</option>
                <option value="Kemanusiaan">Kemanusiaan</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Status</label>
              <select {...register('status')} className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl">
                <option value="Berjalan">Berjalan</option>
                <option value="Perencanaan">Perencanaan</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pagu Anggaran (Rp) *</label>
              <IdNumberInput
                value={watch('paguAnggaran')}
                onValueChange={(v) => setValue('paguAnggaran', v, { shouldValidate: true, shouldDirty: true })}
                className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl font-mono"
              />
              {errors.paguAnggaran && <p className="text-rose-500 text-[11px] mt-1">{errors.paguAnggaran.message}</p>}
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Target Penerima *</label>
              <IdNumberInput
                value={watch('targetPenerima')}
                onValueChange={(v) => setValue('targetPenerima', v, { shouldValidate: true, shouldDirty: true })}
                className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl font-mono"
              />
              {errors.targetPenerima && <p className="text-rose-500 text-[11px] mt-1">{errors.targetPenerima.message}</p>}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Penanggung Jawab *</label>
            <input
              type="text"
              {...register('penanggungJawab')}
              placeholder="Contoh: Drs. H. M. Ridwan"
              className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl"
            />
            {errors.penanggungJawab && <p className="text-rose-500 text-[11px] mt-1">{errors.penanggungJawab.message}</p>}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCreateModalOpen(false);
                setEditTarget(null);
              }}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : editTarget ? 'Simpan Perubahan' : 'Buat Program'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          if (isDeleting) return;
          setIsDeleteModalOpen(false);
          setDeleteTarget(null);
        }}
        title="Hapus Program ZIS"
        maxWidth="sm"
      >
        <div className="space-y-4 font-sans text-xs">
          <p className="text-[#16211D] dark:text-slate-100">
            Apakah Anda yakin ingin menghapus program "<strong>{deleteTarget?.nama}</strong>"?
          </p>
          <p className="text-[#7D938A]">
            Program yang sudah punya transaksi penyaluran tidak dapat dihapus.
          </p>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeleteTarget(null);
              }}
              disabled={isDeleting}
            >
              Batal
            </Button>
            <Button type="button" variant="danger" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
