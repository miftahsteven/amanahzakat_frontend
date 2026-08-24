import React, { useCallback, useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { FormSimba } from '../types/finance';
import { DataTable } from '../components/shared/DataTable';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Share2, Download, RefreshCw } from 'lucide-react';
import { formatRP } from '../lib/utils';
import { keuanganApi } from '../lib/api';
import { toast } from 'sonner';

export const SimbaPage: React.FC = () => {
  const [dataList, setDataList] = useState<FormSimba[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      setDataList(await keuanganApi.listSimba());
    } catch (err: any) {
      toast.error(err.message || 'Gagal memuat form SIMBA');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExport = async (kodeForm: string, namaForm: string) => {
    try {
      await keuanganApi.exportSimba(kodeForm);
      toast.success(`Form SIMBA (${namaForm}) siap di-export (.xlsx / .xml)!`);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Gagal export SIMBA');
    }
  };

  const columns: ColumnDef<FormSimba, any>[] = [
    { accessorKey: 'kodeForm', header: 'Kode Form', cell: ({ row }) => <span className="font-mono font-bold text-[#0F9D6E]">{row.getValue('kodeForm')}</span> },
    { accessorKey: 'namaForm', header: 'Formulir SIMBA BAZNAS', cell: ({ row }) => <div className="font-bold">{row.getValue('namaForm')}</div> },
    { accessorKey: 'itemCount', header: 'Jumlah Baris', cell: ({ row }) => <span>{row.getValue('itemCount')} Record</span> },
    { accessorKey: 'totalNilai', header: 'Total Nilai', cell: ({ row }) => <span className="font-extrabold text-[#0F9D6E]">{formatRP(row.getValue('totalNilai'))}</span> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <Badge statusText={row.getValue('status')} /> },
    {
      id: 'actions',
      header: 'Export',
      cell: ({ row }) => (
        <Button variant="outline" size="sm" icon={<Download className="w-3.5 h-3.5" />} onClick={() => handleExport(row.original.kodeForm, row.original.namaForm)}>
          Export
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#16211D] flex items-center gap-2">
            <Share2 className="w-6 h-6 text-[#0F9D6E]" /> Integrasi Pelaporan SIMBA BAZNAS
          </h1>
          <p className="text-xs text-[#7D938A]">Data live dari penerimaan, penyaluran, muzakki & mustahik</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon={<RefreshCw className="w-4 h-4" />} onClick={loadData} disabled={isLoading}>Refresh</Button>
          <Button variant="primary" icon={<Download className="w-4 h-4" />} onClick={() => toast.success('Paket SIMBA lengkap siap di-export!')}>Export Seluruh Paket</Button>
        </div>
      </div>
      <DataTable columns={columns} data={dataList} isLoading={isLoading} searchPlaceholder="Cari form SIMBA..." />
    </div>
  );
};
