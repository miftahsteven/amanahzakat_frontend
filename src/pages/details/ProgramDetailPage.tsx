import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Download, FolderKanban, Users, Wallet } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  DetailBackLink,
  DetailHero,
  DetailLoading,
  DetailNotFound,
  InfoPanel,
  ProgressBreakdown,
  SummaryCard,
  formatTanggalId,
} from '../../components/detail/DetailUi';
import { formatRP } from '../../lib/utils';
import { programApi } from '../../lib/api';
import type { ProgramDetail } from '../../types/system';

export function ProgramDetailPage({ id, onBack }: { id: string; onBack: () => void }) {
  const [data, setData] = useState<ProgramDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    programApi
      .getById(id)
      .then(setData)
      .catch((err: Error) => toast.error(err.message || 'Gagal memuat detail program'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <DetailLoading label="Kembali ke Program ZIS" onBack={onBack} />;
  if (!data) return <DetailNotFound label="Kembali ke Program ZIS" onBack={onBack} />;

  return (
    <div className="space-y-6 pb-8">
      <DetailBackLink label="Kembali ke Program ZIS" onBack={onBack} />

      <DetailHero
        eyebrow={`Program ${data.pilar} · Tahun ${data.tahun}`}
        title={data.nama}
        subtitle={`Tahun anggaran ${data.tahun} · ${data.penanggungJawab}`}
        progress={{ pct: data.pct, label: `${data.pct}% anggaran terserap` }}
        actions={
          <>
            <Badge statusText={data.statusLabel} />
            <Button
              variant="outline"
              size="sm"
              className="border-emerald-600/50 text-emerald-100 hover:bg-emerald-900/40 bg-transparent"
              onClick={() => toast.success(`Usulan revisi pagu ${data.nama} dikirim ke approval`)}
            >
              Usulkan Revisi Pagu
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Download className="w-3.5 h-3.5" />}
              onClick={() => toast.success(`Laporan program ${data.nama} siap diunduh`)}
            >
              Unduh Laporan
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard
          label="Pagu Anggaran"
          value={formatRP(data.paguAnggaran)}
          sub={`Tahun anggaran ${data.tahun}`}
          icon={<Wallet className="w-4 h-4" />}
        />
        <SummaryCard
          label="Terserap"
          value={formatRP(data.terpakai)}
          sub={`${data.pct}% dari pagu`}
          icon={<FolderKanban className="w-4 h-4" />}
        />
        <SummaryCard
          label="Sisa Pagu"
          value={formatRP(data.sisaPagu)}
          sub={data.pct > 85 ? 'Perlu revisi anggaran' : 'Tersedia untuk penyaluran'}
        />
        <SummaryCard
          label="Penerima Manfaat"
          value={`${data.realisasiPenerima} penerima`}
          sub={`${data.salurRows.length} transaksi · target ${data.targetPenerima}`}
          icon={<Users className="w-4 h-4" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {data.asnafRows.length > 0 ? (
          <ProgressBreakdown
            title="Distribusi per Asnaf"
            subtitle="Realisasi penyaluran program menurut golongan asnaf"
            rows={data.asnafRows.map((a) => ({ label: a.label, value: formatRP(a.nominal), pct: a.pct }))}
          />
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-[#E3E8E4] rounded-2xl p-6 text-xs text-[#7D938A]">
            Belum ada penyaluran tercatat untuk program ini.
          </div>
        )}

        <InfoPanel title="Mitra Pelaksana (terkait)">
          {data.mitraRows.length === 0 ? (
            <p className="py-4 text-xs text-[#7D938A]">Belum ada mitra terdaftar.</p>
          ) : (
            data.mitraRows.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between gap-3 py-3 border-b border-[#E3E8E4] dark:border-slate-800 last:border-0 text-xs"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-[#16211D] dark:text-white truncate">{m.nama}</p>
                  <p className="text-[11px] text-[#7D938A] mt-0.5">
                    {m.bentukLembaga} · PIC {m.pic}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-mono font-bold text-[#0F9D6E]">{formatRP(m.dana)}</p>
                  <Badge statusText={m.laporan} />
                </div>
              </div>
            ))
          )}
        </InfoPanel>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-[#E3E8E4] dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-[#E3E8E4] dark:border-slate-800">
          <h2 className="text-sm font-extrabold text-[#16211D] dark:text-white">Riwayat Penyaluran Program</h2>
        </div>
        {data.salurRows.length === 0 ? (
          <p className="p-6 text-xs text-[#7D938A]">Belum ada transaksi penyaluran.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-xs">
              <thead className="bg-[#FAFBFA] dark:bg-slate-800/50">
                <tr>
                  {['Tanggal', 'No. Penyaluran', 'Penerima', 'Asnaf', 'Nominal', 'Status'].map((h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-[#7D938A]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.salurRows.map((r) => (
                  <tr key={r.id} className="border-t border-[#E3E8E4] dark:border-slate-800">
                    <td className="px-5 py-3">{formatTanggalId(r.tanggal)}</td>
                    <td className="px-3 py-3 font-mono">{r.noPenyaluran}</td>
                    <td className="px-3 py-3 font-semibold">{r.mustahikNama}</td>
                    <td className="px-3 py-3">{r.asnaf}</td>
                    <td className="px-3 py-3 font-mono font-bold">{formatRP(r.nominal)}</td>
                    <td className="px-5 py-3">
                      <Badge statusText={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
