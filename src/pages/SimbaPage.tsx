import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { FormSimba, SimbaLapkinDetail } from '../types/finance';
import { DataTable } from '../components/shared/DataTable';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Share2, Download, RefreshCw, Eye, Printer } from 'lucide-react';
import { formatRP } from '../lib/utils';
import { keuanganApi } from '../lib/api';
import { printSimbaLapkin } from '../lib/printReport';
import { toast } from 'sonner';

export interface SimbaPageProps {
  canExport?: boolean;
}

function currentPeriodKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function formatCell(
  value: number,
  unit?: 'rp' | 'count' | 'ekor' | 'text',
  text?: string,
) {
  if (unit === 'text' || text !== undefined) {
    return text && text.length > 0 ? text : '—';
  }
  if (unit === 'rp') return formatRP(value);
  return value.toLocaleString('id-ID');
}

export const SimbaPage: React.FC<SimbaPageProps> = ({ canExport = false }) => {
  const [periode, setPeriode] = useState(currentPeriodKey);
  const [periodeLabel, setPeriodeLabel] = useState('');
  const [previousLabel, setPreviousLabel] = useState('');
  const [dataList, setDataList] = useState<FormSimba[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [detail, setDetail] = useState<SimbaLapkinDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await keuanganApi.listSimba(periode);
      setDataList(res.pages || []);
      setPeriodeLabel(res.periode?.label || periode);
      setPreviousLabel(res.periode?.previousLabel || '');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal memuat form SIMBA';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [periode]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const openDetail = async (kodeForm: string) => {
    setDetailLoading(true);
    try {
      const data = (await keuanganApi.detailSimba(kodeForm, periode)) as SimbaLapkinDetail;
      setDetail(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal memuat detail laporan';
      toast.error(message);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCetak = async (row: FormSimba) => {
    try {
      const data = (await keuanganApi.detailSimba(row.kodeForm, periode)) as SimbaLapkinDetail;
      printSimbaLapkin(data);
      if (canExport) {
        await keuanganApi.exportSimba(row.kodeForm);
        void loadData();
      }
      toast.success(`Dialog cetak ${row.namaForm} dibuka`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal mencetak laporan SIMBA';
      toast.error(message);
    }
  };

  const columns = useMemo<ColumnDef<FormSimba, unknown>[]>(
    () => [
      {
        accessorKey: 'no',
        header: 'No',
        cell: ({ row }) => <span className="font-mono text-sm text-[#4D5C56]">{row.original.no ?? '-'}</span>,
      },
      {
        accessorKey: 'namaForm',
        header: 'Halaman',
        cell: ({ row }) => (
          <div>
            <div className="font-bold text-[#16211D]">{row.original.namaForm}</div>
            <div className="text-[11px] text-[#7D938A] mt-0.5">
              {row.original.sumber === 'auto' ? 'Dihitung otomatis dari transaksi ERP' : 'Isi manual / master lembaga'}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <Badge statusText={String(row.getValue('status'))} />,
      },
      {
        accessorKey: 'koreksi',
        header: 'Koreksi',
        cell: ({ row }) => <span className="font-mono text-sm">{row.original.koreksi ?? 0}</span>,
      },
      {
        id: 'ringkas',
        header: 'Ringkasan Periode',
        cell: ({ row }) => (
          <div className="text-xs text-[#4D5C56]">
            <div>{row.original.itemCount} item</div>
            {row.original.totalNilai > 0 ? (
              <div className="font-semibold text-[#0F9D6E]">{formatRP(row.original.totalNilai)}</div>
            ) : null}
          </div>
        ),
      },
      {
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1.5 justify-end">
            <Button
              variant="outline"
              size="sm"
              icon={<Eye className="w-3.5 h-3.5" />}
              onClick={() => void openDetail(row.original.kodeForm)}
              disabled={detailLoading}
            >
              Preview
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="bg-[#0D1714] hover:bg-[#16211D]"
              icon={<Printer className="w-3.5 h-3.5" />}
              onClick={() => void handleCetak(row.original)}
            >
              Cetak
            </Button>
          </div>
        ),
      },
    ],
    [detailLoading, canExport, periode],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#16211D] flex items-center gap-2">
            <Share2 className="w-6 h-6 text-[#0F9D6E]" /> Entri Bulanan SIMBA BAZNAS
          </h1>
          <p className="text-xs text-[#7D938A] mt-1">
            Siapkan data Lapkin Hal 2–8 dari transaksi ERP, lalu cetak untuk di-entry ke{' '}
            <span className="font-semibold">simba.baznas.go.id</span>
            {periodeLabel ? ` · Periode ${periodeLabel}` : ''}
            {previousLabel ? ` (vs ${previousLabel})` : ''}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs font-semibold text-[#4D5C56]">
            Periode
            <input
              type="month"
              value={periode}
              onChange={(e) => setPeriode(e.target.value)}
              className="ml-2 rounded-lg border border-[#E5EAE6] px-2.5 py-1.5 text-sm font-mono"
            />
          </label>
          <Button variant="outline" icon={<RefreshCw className="w-4 h-4" />} onClick={() => void loadData()} disabled={isLoading}>
            Muat Ulang
          </Button>
          {canExport && (
            <Button
              variant="primary"
              icon={<Download className="w-4 h-4" />}
              onClick={() => toast.message('Cetak per halaman via tombol Cetak, lalu entry ke portal SIMBA.')}
            >
              Panduan Export
            </Button>
          )}
        </div>
      </div>

      <DataTable columns={columns} data={dataList} isLoading={isLoading} searchPlaceholder="Cari halaman SIMBA..." />

      <Modal
        isOpen={!!detail}
        onClose={() => setDetail(null)}
        title={detail?.namaForm || 'Preview Lapkin SIMBA'}
        subtitle={
          detail
            ? `${detail.periode.label} vs ${detail.periode.previousLabel} · ${detail.sumber === 'auto' ? 'Agregat ERP' : 'Template manual'}`
            : undefined
        }
        maxWidth="2xl"
        maximizable
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDetail(null)}>
              Tutup
            </Button>
            {detail && (
              <Button
                variant="primary"
                icon={<Printer className="w-4 h-4" />}
                onClick={() => {
                  printSimbaLapkin(detail);
                  toast.success('Dialog cetak dibuka');
                }}
              >
                Cetak
              </Button>
            )}
          </div>
        }
      >
        {detail && (
          <div className="space-y-5">
            <div className="rounded-xl bg-[#0D1714] text-[#E7EFE9] px-4 py-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#7D938A]">Laporan Kinerja Bulanan</div>
              <div className="font-extrabold text-base mt-1">{detail.lembaga.nama}</div>
              <div className="text-xs text-[#8FA79C] mt-0.5">
                {detail.namaForm} · {detail.periode.dari} s.d. {detail.periode.sampai}
              </div>
            </div>

            {detail.sections.map((section) => (
              <div key={section.title} className="rounded-xl border border-[#E5EAE6] overflow-hidden">
                <div className="px-4 py-2.5 bg-[#F4F8F6] border-b border-[#E5EAE6] text-xs font-extrabold uppercase tracking-wide text-[#16211D]">
                  {section.title}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[12.5px]">
                    <thead>
                      <tr className="border-b border-[#E5EAE6] text-[#6B7A74]">
                        <th className="text-left font-semibold px-4 py-2">Uraian</th>
                        <th className="text-right font-semibold px-4 py-2 whitespace-nowrap">
                          {detail.periode.currentYear} {detail.periode.monthName}
                        </th>
                        <th className="text-right font-semibold px-4 py-2 whitespace-nowrap">
                          {detail.periode.previousYear} {detail.periode.monthName}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.rows.map((r) => (
                        <tr
                          key={`${section.title}-${r.kode}-${r.label}`}
                          className={`border-b border-dashed border-[#E5EAE6] last:border-0 ${r.isTotal ? 'bg-[#FAFBFA]' : ''}`}
                        >
                          <td
                            className={`px-4 py-2 ${r.isTotal ? 'font-bold' : 'font-medium'} text-[#16211D]`}
                            style={{ paddingLeft: `${16 + (r.indent || 0) * 14}px` }}
                          >
                            <span className="text-[#8B9992] font-mono text-[11px] mr-1.5">{r.kode}</span>
                            {r.label}
                          </td>
                          <td className={`px-4 py-2 text-right font-mono ${r.isTotal && r.unit !== 'text' ? 'font-bold text-[#0B7C56]' : ''} ${r.unit === 'text' ? 'text-left font-sans text-[12px]' : ''}`}>
                            {formatCell(r.current, r.unit, r.textCurrent)}
                          </td>
                          <td className={`px-4 py-2 text-right font-mono text-[#6B7A74] ${r.unit === 'text' ? 'text-left font-sans text-[12px]' : ''}`}>
                            {formatCell(r.previous, r.unit, r.textPrevious)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};
