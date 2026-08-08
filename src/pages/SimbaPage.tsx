import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { FormSimba } from '../types/finance';
import { INITIAL_SIMBA } from '../mock/mockData';
import { DataTable } from '../components/shared/DataTable';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Share2, Download } from 'lucide-react';
import { formatRP } from '../lib/utils';
import { toast } from 'sonner';

export const SimbaPage: React.FC = () => {
  const [dataList, setDataList] = useState<FormSimba[]>(INITIAL_SIMBA);

  const handleExportSimba = (namaForm: string) => {
    toast.success(`File standar SIMBA BAZNAS (${namaForm}) berhasil di-export (.xlsx / .xml)!`);
  };

  const columns: ColumnDef<FormSimba, any>[] = [
    {
      accessorKey: 'kodeForm',
      header: 'Kode Form',
      cell: ({ row }: any) => <span className="font-mono font-bold text-[#0f9d6e]">{row.getValue('kodeForm')}</span>,
    },
    {
      accessorKey: 'namaForm',
      header: 'Formulir SIMBA BAZNAS',
      cell: ({ row }: any) => <div className="font-bold text-slate-800 dark:text-slate-200">{row.getValue('namaForm')}</div>,
    },
    {
      accessorKey: 'itemCount',
      header: 'Jumlah Baris Data',
      cell: ({ row }: any) => <span className="font-semibold text-slate-700">{row.getValue('itemCount')} Record</span>,
    },
    {
      accessorKey: 'totalNilai',
      header: 'Total Nilai (Rp)',
      cell: ({ row }: any) => <span className="font-extrabold text-[#0f9d6e]">{formatRP(row.getValue('totalNilai'))}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status Validasi',
      cell: ({ row }: any) => <Badge statusText={row.getValue('status')} />,
    },
    {
      id: 'actions',
      header: 'Aksi Export',
      cell: ({ row }: any) => (
        <Button variant="outline" size="sm" icon={<Download className="w-3.5 h-3.5" />} onClick={() => handleExportSimba(row.original.namaForm)}>
          Export SIMBA
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Share2 className="w-6 h-6 text-[#0f9d6e]" /> Integrasi Pelaporan SIMBA BAZNAS
          </h1>
          <p className="text-xs text-slate-500">Standarisasi data Laporan Keuangan & Penyaluran sesuai format BAZNAS RI</p>
        </div>
        <Button variant="primary" icon={<Download className="w-4 h-4" />} onClick={() => toast.success('Seluruh Form 1 s/d 5 SIMBA BAZNAS di-export!')}>
          Export Seluruh Paket SIMBA
        </Button>
      </div>

      <DataTable columns={columns} data={dataList} searchPlaceholder="Cari form SIMBA..." />
    </div>
  );
};
