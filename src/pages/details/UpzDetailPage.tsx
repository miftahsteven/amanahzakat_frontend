import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Banknote, Building, HandCoins, Users } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import {
  DetailBackLink,
  DetailHeroProfile,
  DetailLoading,
  DetailNotFound,
  InfoPanel,
  InfoRow,
  ProgressBreakdown,
  SummaryCard,
  formatTanggalId,
} from '../../components/detail/DetailUi';
import { formatRP } from '../../lib/utils';
import { upzApi } from '../../lib/api';
import type { UpzDetail } from '../../types/system';

export function UpzDetailPage({ id, onBack }: { id: string; onBack: () => void }) {
  const [data, setData] = useState<UpzDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    upzApi
      .getById(id)
      .then(setData)
      .catch((err: Error) => toast.error(err.message || 'Gagal memuat detail UPZ'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <DetailLoading label="Kembali ke UPZ Cabang" onBack={onBack} />;
  if (!data) return <DetailNotFound label="Kembali ke UPZ Cabang" onBack={onBack} />;

  return (
    <div className="space-y-6 pb-8">
      <DetailBackLink label="Kembali ke UPZ Cabang" onBack={onBack} />

      <DetailHeroProfile
        inisial={data.inisial}
        title={data.nama}
        subtitle={`${data.kodeUpz} · ${data.kategori}`}
        meta={[
          { label: 'Hak Pengelolaan', value: `${data.hakPengelolaanPct}%` },
          { label: 'Status Audit', value: data.statusKepatuhan },
          { label: 'Salur vs Himpun', value: `${data.pctSalur}%` },
        ]}
        actions={<Badge statusText={data.statusKepatuhan} />}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard
          label="Total Pendapatan"
          value={formatRP(data.totalPenghimpunan)}
          sub="Akumulasi penghimpunan"
          icon={<Banknote className="w-4 h-4" />}
        />
        <SummaryCard
          label="Total Penyaluran"
          value={formatRP(data.totalPenyaluran)}
          sub={`${data.pctSalur}% dari penghimpunan`}
          icon={<HandCoins className="w-4 h-4" />}
        />
        <SummaryCard
          label="Dana Belum Tersalur"
          value={formatRP(data.danaBelumTersalur)}
          sub="Menunggu eksekusi program"
          icon={<Building className="w-4 h-4" />}
        />
        <SummaryCard
          label="Muzakki UPZ"
          value={`${data.muzakkiUpz.length} entitas`}
          sub="Muzakki bertipe UPZ di sistem"
          icon={<Users className="w-4 h-4" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ProgressBreakdown
          title="Sharing Dana Penghimpunan"
          subtitle="Alokasi hak amil, UPZ, infrastruktur, dan dana mustahik"
          rows={data.sharing.map((s) => ({
            label: `${s.label} (${s.pct}%)`,
            value: formatRP(s.value),
            pct: Math.round(s.pct),
          }))}
        />

        <InfoPanel title="Program Berjalan (konteks)">
          {data.programRows.length === 0 ? (
            <p className="py-4 text-xs text-[#7D938A]">Belum ada program berjalan.</p>
          ) : (
            data.programRows.map((p) => (
              <div key={p.id} className="py-3 border-b border-[#E3E8E4] last:border-0 space-y-1.5 text-xs">
                <div className="flex justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-[#16211D] dark:text-white truncate">{p.nama}</p>
                    <p className="text-[11px] text-[#7D938A]">PJ: {p.pj}</p>
                  </div>
                  <span className="font-mono font-bold text-[#0F9D6E] shrink-0">{formatRP(p.terpakai)}</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#EEF1EE] overflow-hidden">
                  <div className="h-full bg-[#0F9D6E] rounded-full" style={{ width: `${p.pct}%` }} />
                </div>
                <p className="text-[10px] text-[#7D938A]">
                  {p.pct}% terserap dari pagu {formatRP(p.pagu)}
                </p>
              </div>
            ))
          )}
        </InfoPanel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <InfoPanel title="Muzakki Bertipe UPZ">
          {data.muzakkiUpz.length === 0 ? (
            <p className="py-4 text-xs text-[#7D938A]">Belum ada muzakki UPZ.</p>
          ) : (
            data.muzakkiUpz.map((m) => (
              <InfoRow
                key={m.id}
                label={`${m.nomor} · ${m.nama}`}
                value={`${formatRP(m.totalSetoran)} · ${m.transaksiCount} trx`}
              />
            ))
          )}
        </InfoPanel>

        <div className="bg-white dark:bg-slate-900 border border-[#E3E8E4] dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-[#E3E8E4] dark:border-slate-800">
            <h2 className="text-sm font-extrabold text-[#16211D] dark:text-white">Payroll UPZ Terkini</h2>
          </div>
          {data.recentPayroll.length === 0 ? (
            <p className="p-6 text-xs text-[#7D938A]">Belum ada penerimaan kanal Payroll UPZ.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-xs">
                <thead className="bg-[#FAFBFA] dark:bg-slate-800/50">
                  <tr>
                    {['Tanggal', 'Muzakki', 'Jenis', 'Nominal'].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#7D938A]"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.recentPayroll.map((p) => (
                    <tr key={p.id} className="border-t border-[#E3E8E4] dark:border-slate-800">
                      <td className="px-4 py-3">{formatTanggalId(p.tanggal)}</td>
                      <td className="px-3 py-3 font-semibold">{p.muzakki}</td>
                      <td className="px-3 py-3">{p.jenisZis}</td>
                      <td className="px-4 py-3 font-mono font-bold">{formatRP(p.nominal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
