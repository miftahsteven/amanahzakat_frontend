import React, { useCallback, useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../components/shared/DataTable';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Download, FileBarChart, RefreshCw } from 'lucide-react';
import { formatRP } from '../lib/utils';
import { laporanApi } from '../lib/api';
import { printLaporanDistribusi } from '../lib/printReport';
import { toast } from 'sonner';

export interface LaporanDistribusiPageProps {
  onNavigate: (screen: string) => void;
}

type DistribusiData = Awaited<ReturnType<typeof laporanApi.distribusi>>;
type TransaksiRow = DistribusiData['transaksi'][number];

export const LaporanDistribusiPage: React.FC<LaporanDistribusiPageProps> = () => {
  const year = new Date().getFullYear();
  const [dariDate, setDariDate] = useState(`${year}-01-01`);
  const [sampaiDate, setSampaiDate] = useState(new Date().toISOString().slice(0, 10));
  const [data, setData] = useState<DistribusiData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await laporanApi.distribusi({ dari: dariDate, sampai: sampaiDate });
      setData(res);
    } catch (err: any) {
      toast.error(err.message || 'Gagal memuat laporan distribusi');
    } finally {
      setIsLoading(false);
    }
  }, [dariDate, sampaiDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const columns: ColumnDef<TransaksiRow>[] = [
    { accessorKey: 'tanggal', header: 'Tanggal' },
    { accessorKey: 'noPenyaluran', header: 'No. Penyaluran' },
    { accessorKey: 'mustahikNama', header: 'Mustahik' },
    {
      accessorKey: 'asnaf',
      header: 'Asnaf',
      cell: ({ row }) => <Badge statusText={row.getValue('asnaf')} />,
    },
    { accessorKey: 'programNama', header: 'Program' },
    {
      accessorKey: 'nominal',
      header: 'Nominal',
      cell: ({ row }) => <span className="font-mono font-bold">{formatRP(row.getValue('nominal'))}</span>,
    },
    {
      accessorKey: 'metodePembayaran',
      header: 'Metode',
      cell: ({ row }) => <span className="text-xs">{row.getValue('metodePembayaran')}</span>,
    },
  ];

  const maxAsnaf = data?.perAsnaf[0]?.nominal ?? 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#16211D] flex items-center gap-2">
            <FileBarChart className="w-6 h-6 text-[#0F9D6E]" /> Laporan Distribusi ZIS
          </h1>
          <p className="text-xs text-[#7D938A] font-medium mt-0.5">
            Rekapitulasi penyaluran tersalurkan per asnaf, program, dan transaksi
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" icon={<RefreshCw className="w-4 h-4" />} onClick={loadData} disabled={isLoading}>
            Refresh
          </Button>
          <Button
            variant="primary"
            icon={<Download className="w-4 h-4" />}
            disabled={isLoading || !data}
            onClick={() => {
              if (!data) return;
              try {
                printLaporanDistribusi(data, dariDate, sampaiDate);
              } catch (err: any) {
                toast.error(err.message || 'Gagal membuka jendela cetak PDF');
              }
            }}
          >
            Export PDF
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-[#7D938A]">
        <span>Dari</span>
        <input
          type="date"
          value={dariDate}
          onChange={(e) => setDariDate(e.target.value)}
          className="px-2.5 py-1 border border-[#DDE3DF] bg-white rounded-lg text-[#16211D] font-mono"
        />
        <span>Sampai</span>
        <input
          type="date"
          value={sampaiDate}
          onChange={(e) => setSampaiDate(e.target.value)}
          className="px-2.5 py-1 border border-[#DDE3DF] bg-white rounded-lg text-[#16211D] font-mono"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border border-[#E3E8E4]">
          <p className="text-[10px] font-bold uppercase text-[#7D938A] tracking-wider">Total Penyaluran</p>
          <p className="text-xl font-extrabold text-[#16211D] mt-1">
            {isLoading ? '...' : formatRP(data?.summary.totalNominal ?? 0)}
          </p>
        </Card>
        <Card className="p-4 border border-[#E3E8E4]">
          <p className="text-[10px] font-bold uppercase text-[#7D938A] tracking-wider">Transaksi Tersalurkan</p>
          <p className="text-xl font-extrabold text-[#0F9D6E] mt-1">{isLoading ? '...' : data?.summary.totalTransaksi ?? 0}</p>
        </Card>
        <Card className="p-4 border border-[#E3E8E4]">
          <p className="text-[10px] font-bold uppercase text-[#7D938A] tracking-wider">Mustahik Terbantu</p>
          <p className="text-xl font-extrabold text-[#16211D] mt-1">{isLoading ? '...' : data?.summary.mustahikTerbantu ?? 0}</p>
        </Card>
        <Card className="p-4 border border-[#E3E8E4]">
          <p className="text-[10px] font-bold uppercase text-[#7D938A] tracking-wider">Dana ke Mustahik</p>
          <p className="text-xl font-extrabold text-[#C8933A] mt-1">
            {isLoading ? '...' : formatRP(data?.summary.totalDanaMustahik ?? 0)}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 border border-[#E3E8E4] space-y-4">
          <h3 className="text-sm font-bold text-[#16211D]">Penyaluran per Asnaf</h3>
          {isLoading ? (
            <p className="text-xs text-[#7D938A]">Memuat...</p>
          ) : (
            <div className="space-y-3">
              {(data?.perAsnaf ?? []).map((row) => (
                <div key={row.nama}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-[#16211D]">{row.nama}</span>
                    <span className="font-mono font-bold text-[#0F9D6E]">{formatRP(row.nominal)}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#EBEFEB] overflow-hidden">
                    <div
                      className="h-full bg-[#0F9D6E] rounded-full"
                      style={{ width: `${Math.round((row.nominal / maxAsnaf) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-[#7D938A] mt-0.5">{row.transaksi} transaksi</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6 border border-[#E3E8E4] space-y-4">
          <h3 className="text-sm font-bold text-[#16211D]">Penyaluran per Program</h3>
          {isLoading ? (
            <p className="text-xs text-[#7D938A]">Memuat...</p>
          ) : (
            <div className="space-y-2">
              {(data?.perProgram ?? []).map((row) => (
                <div
                  key={row.id}
                  className="flex items-center justify-between p-3 bg-[#F4F6F4] rounded-xl border border-[#E3E8E4] text-xs"
                >
                  <div>
                    <p className="font-bold text-[#16211D]">{row.nama}</p>
                    <p className="text-[10px] text-[#7D938A]">{row.transaksi} transaksi</p>
                  </div>
                  <span className="font-mono font-bold text-[#0F9D6E]">{formatRP(row.nominal)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="p-6 border border-[#E3E8E4]">
        <h3 className="text-sm font-bold text-[#16211D] mb-4">Detail Transaksi Penyaluran</h3>
        <DataTable columns={columns} data={data?.transaksi ?? []} isLoading={isLoading} searchPlaceholder="Cari mustahik / no penyaluran..." />
      </Card>
    </div>
  );
};
