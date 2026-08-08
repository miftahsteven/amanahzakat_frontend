import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { JurnalEntry } from '../types/finance';
import { INITIAL_JURNAL } from '../mock/mockData';
import { DataTable } from '../components/shared/DataTable';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { FileCheck2, Plus } from 'lucide-react';
import { formatRP } from '../lib/utils';
import { toast } from 'sonner';

export interface JurnalGLPageProps {
  onNavigate: (screen: string) => void;
}

export const JurnalGLPage: React.FC<JurnalGLPageProps> = () => {
  const [dataList, setDataList] = useState<JurnalEntry[]>(INITIAL_JURNAL);

  const columns: ColumnDef<JurnalEntry, any>[] = [
    {
      accessorKey: 'noJurnal',
      header: 'No. Jurnal',
      cell: ({ row }: any) => <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{row.getValue('noJurnal')}</span>,
    },
    {
      accessorKey: 'tanggal',
      header: 'Tanggal',
    },
    {
      accessorKey: 'keterangan',
      header: 'Keterangan Transaksi',
      cell: ({ row }: any) => <div className="font-medium max-w-xs">{row.getValue('keterangan')}</div>,
    },
    {
      accessorKey: 'debitNama',
      header: 'Akun Debit',
      cell: ({ row }: any) => (
        <div>
          <div className="font-bold text-[#0f9d6e]">{row.getValue('debitNama')}</div>
          <div className="text-[10px] font-mono text-slate-400">Kode: {row.original.debitKode}</div>
        </div>
      ),
    },
    {
      accessorKey: 'kreditNama',
      header: 'Akun Kredit',
      cell: ({ row }: any) => (
        <div>
          <div className="font-bold text-blue-600">{row.getValue('kreditNama')}</div>
          <div className="text-[10px] font-mono text-slate-400">Kode: {row.original.kreditKode}</div>
        </div>
      ),
    },
    {
      accessorKey: 'nominal',
      header: 'Nominal (Rp)',
      cell: ({ row }: any) => <span className="font-extrabold text-slate-900 dark:text-slate-100">{formatRP(row.getValue('nominal'))}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status G/L',
      cell: ({ row }: any) => <Badge statusText={row.getValue('status')} />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-[#0f9d6e]" /> Jurnal Umum & Buku Besar (G/L)
          </h1>
          <p className="text-xs text-slate-500">Pencatatan ganda (double-entry) transaksi ZIS otomatis terintegrasi G/L</p>
        </div>
        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => toast.info('Modal penyesuaian jurnal manual')}>
          Tambah Jurnal Manual
        </Button>
      </div>

      <DataTable columns={columns} data={dataList} searchPlaceholder="Cari no jurnal, akun, atau keterangan..." />
    </div>
  );
};
