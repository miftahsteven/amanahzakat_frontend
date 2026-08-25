import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { FileSpreadsheet, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { DataTable } from '../components/shared/DataTable';
import { BszPdfModal } from '../components/shared/BszPdfModal';
import { Button } from '../components/ui/Button';
import { penerimaanApi } from '../lib/api';
import {
  BszRecord,
  formatBszDate,
  formatBszNominal,
  jenisDanaBadgeClass,
} from '../lib/bsz';
import { cn } from '../lib/utils';

type PenerimaanRow = {
  id: string;
  noKwitansi: string;
  noSbmz?: string | null;
  tanggal: string;
  muzakkiNama: string;
  muzakkiTipe?: string;
  jenisZis: string;
  nominal: number;
  kanal: string;
  status: string;
  catatan?: string | null;
};

export const BuktiSetorPage: React.FC = () => {
  const [rows, setRows] = useState<BszRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<BszRecord | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = (await penerimaanApi.list()) as PenerimaanRow[];
      const verified = (data || [])
        .filter((r) => r.status === 'Terverifikasi')
        .map(
          (r): BszRecord => ({
            id: r.id,
            noKwitansi: r.noKwitansi,
            noSbmz: r.noSbmz,
            tanggal: r.tanggal,
            muzakkiNama: r.muzakkiNama,
            muzakkiTipe: r.muzakkiTipe,
            jenisZis: r.jenisZis,
            nominal: r.nominal,
            kanal: r.kanal,
            status: r.status,
            catatan: r.catatan,
          }),
        )
        .sort((a, b) => {
          const ta = Date.parse(a.tanggal) || 0;
          const tb = Date.parse(b.tanggal) || 0;
          if (tb !== ta) return tb - ta;
          return b.noKwitansi.localeCompare(a.noKwitansi);
        });
      setRows(verified);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal memuat bukti setor';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const columns = useMemo<ColumnDef<BszRecord, unknown>[]>(
    () => [
      {
        accessorKey: 'noKwitansi',
        header: 'No. Bukti',
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => setSelected(row.original)}
            className="font-mono text-[12.5px] font-semibold text-[#0F9D6E] hover:underline"
          >
            {row.original.noKwitansi}
          </button>
        ),
      },
      {
        accessorKey: 'tanggal',
        header: 'Tanggal',
        cell: ({ row }) => (
          <span className="font-mono text-[13px] text-[#4D5C56]">{formatBszDate(row.original.tanggal)}</span>
        ),
      },
      {
        accessorKey: 'muzakkiNama',
        header: 'Muzakki',
        cell: ({ row }) => (
          <span className="text-[13.5px] font-semibold text-[#16211D]">{row.original.muzakkiNama}</span>
        ),
      },
      {
        accessorKey: 'jenisZis',
        header: 'Jenis Dana',
        cell: ({ row }) => (
          <span
            className={cn(
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-bold border',
              jenisDanaBadgeClass(row.original.jenisZis),
            )}
          >
            {row.original.jenisZis}
          </span>
        ),
      },
      {
        accessorKey: 'nominal',
        header: 'Nominal',
        cell: ({ row }) => (
          <span className="block text-right font-mono text-[13.5px] font-semibold text-[#16211D]">
            {formatBszNominal(row.original.nominal)}
          </span>
        ),
      },
      {
        id: 'aksi',
        header: 'Aksi',
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              className="bg-[#0D1714] hover:bg-[#16211D] text-white border-0"
              onClick={() => setSelected(row.original)}
            >
              Lihat Bukti
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[25px] font-extrabold text-[#16211D] tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-[#0F9D6E]" />
            Bukti Setor Zakat (BSZ)
          </h1>
          <p className="text-[13.5px] text-[#6B7A74] mt-1.5">
            Cetak dan unduh bukti setor untuk keperluan pengurang pajak muzakki
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          icon={<RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />}
          onClick={() => void load()}
          disabled={isLoading}
        >
          Muat Ulang
        </Button>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-[#E5EAE6] bg-white p-10 text-center text-sm text-[#7D938A]">
          Memuat bukti setor terverifikasi...
        </div>
      ) : (
        <div className="rounded-2xl border border-[#E5EAE6] bg-white overflow-hidden">
          <DataTable
            columns={columns}
            data={rows}
            searchPlaceholder="Cari no. bukti, muzakki, atau jenis dana..."
          />
          {rows.length === 0 && (
            <p className="px-6 pb-6 text-xs text-[#7D938A]">
              Belum ada transaksi penerimaan berstatus Terverifikasi. Verifikasi setoran di modul Penerimaan ZIS
              terlebih dahulu.
            </p>
          )}
        </div>
      )}

      <BszPdfModal isOpen={!!selected} onClose={() => setSelected(null)} data={selected} />
    </div>
  );
};
