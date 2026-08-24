import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Download, Heart, Mail, Wallet } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
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
import { cn, formatRP } from '../../lib/utils';
import { muzakkiApi } from '../../lib/api';
import type { MuzakkiDetail } from '../../types/zis';

function jenisChipClass(jenis: string) {
  if (jenis.includes('Zakat')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (jenis.includes('Wakaf')) return 'bg-blue-50 text-blue-700 border-blue-200';
  return 'bg-amber-50 text-amber-800 border-amber-200';
}

export function MuzakkiDetailPage({ id, onBack }: { id: string; onBack: () => void }) {
  const [data, setData] = useState<MuzakkiDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    muzakkiApi
      .getById(id)
      .then(setData)
      .catch((err: Error) => toast.error(err.message || 'Gagal memuat profil muzakki'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <DetailLoading label="Kembali ke Data Muzakki" onBack={onBack} />;
  if (!data) return <DetailNotFound label="Kembali ke Data Muzakki" onBack={onBack} />;

  return (
    <div className="space-y-6 pb-8">
      <DetailBackLink label="Kembali ke Data Muzakki" onBack={onBack} />

      <DetailHeroProfile
        inisial={data.inisial}
        title={data.nama}
        subtitle={`${data.nomor} · ${data.tipe}`}
        meta={[
          { label: 'Kontak', value: data.kontak },
          { label: 'NPWP / NIK', value: data.nikAtauNpwp },
          { label: 'Bergabung', value: formatTanggalId(data.tanggalBergabung) },
        ]}
        actions={
          <>
            <Badge variant="emerald">{data.tipe}</Badge>
            <Button
              variant="outline"
              size="sm"
              className="border-emerald-600/50 text-emerald-100 hover:bg-emerald-900/40 bg-transparent"
              icon={<Mail className="w-3.5 h-3.5" />}
              onClick={() => toast.success(`Surat apresiasi dikirim ke ${data.nama}`)}
            >
              Kirim Apresiasi
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Download className="w-3.5 h-3.5" />}
              onClick={() => toast.success(`Rekap donasi tahunan ${data.nama} siap diunduh`)}
            >
              Unduh Rekap Tahunan
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard
          label="Total Donasi"
          value={formatRP(data.totalSetoran)}
          sub="Sejak bergabung"
          icon={<Wallet className="w-4 h-4" />}
        />
        <SummaryCard
          label="Transaksi Tercatat"
          value={`${data.trxRows.length || data.transaksiCount} transaksi`}
          sub="Seluruh kanal"
          icon={<Heart className="w-4 h-4" />}
        />
        <SummaryCard
          label="Rata-rata Donasi"
          value={formatRP(data.rataRataDonasi)}
          sub="Per transaksi"
        />
        <SummaryCard
          label="Donasi Terakhir"
          value={data.donasiTerakhir ? formatRP(data.donasiTerakhir.nominal) : '—'}
          sub={data.donasiTerakhir ? formatTanggalId(data.donasiTerakhir.tanggal) : 'Belum ada transaksi'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ProgressBreakdown
          title="Komposisi Jenis Dana"
          subtitle="Distribusi donasi menurut jenis dana"
          rows={data.jenisRows.map((j) => ({
            label: j.label,
            value: formatRP(j.nominal),
            pct: j.pct,
          }))}
        />

        <InfoPanel title="Kampanye / Program yang Didukung">
          {data.kampanyeRows.length === 0 ? (
            <p className="py-4 text-xs text-[#7D938A]">Belum ada program terikat tercatat.</p>
          ) : (
            data.kampanyeRows.map((k) => (
              <div
                key={k.nama}
                className="flex items-center justify-between gap-3 py-3 border-b border-[#E3E8E4] dark:border-slate-800 last:border-0"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#16211D] dark:text-white truncate">{k.nama}</p>
                  <p className="text-[11px] text-[#7D938A] mt-0.5">{k.program}</p>
                </div>
                <span className="font-mono text-sm font-bold text-[#0F9D6E] shrink-0">{formatRP(k.nominal)}</span>
              </div>
            ))
          )}
        </InfoPanel>
      </div>

      <InfoPanel title="Profil Lengkap">
        <InfoRow label="Alamat" value={data.alamat} />
        <InfoRow label="Email" value={data.email} />
        <InfoRow label="HP" value={data.hp} />
      </InfoPanel>

      <div className="bg-white dark:bg-slate-900 border border-[#E3E8E4] dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-[#E3E8E4] dark:border-slate-800">
          <h2 className="text-sm font-extrabold text-[#16211D] dark:text-white">Riwayat Transaksi Donasi</h2>
        </div>
        {data.trxRows.length === 0 ? (
          <p className="p-6 text-xs text-[#7D938A]">Belum ada transaksi penerimaan tercatat.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-xs">
              <thead className="bg-[#FAFBFA] dark:bg-slate-800/50">
                <tr>
                  {['No. Bukti', 'Tanggal', 'Jenis', 'Kanal', 'Nominal', 'Status'].map((h) => (
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
                {data.trxRows.map((t) => (
                  <tr key={t.id} className="border-t border-[#E3E8E4] dark:border-slate-800 hover:bg-[#FAFCFB]">
                    <td className="px-5 py-3 font-mono text-[#4d5c56]">{t.noKwitansi}</td>
                    <td className="px-3 py-3">{formatTanggalId(t.tanggal)}</td>
                    <td className="px-3 py-3">
                      <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold border', jenisChipClass(t.jenisZis))}>
                        {t.jenisZis}
                      </span>
                    </td>
                    <td className="px-3 py-3">{t.kanal}</td>
                    <td className="px-3 py-3 font-mono font-bold">{formatRP(t.nominal)}</td>
                    <td className="px-5 py-3">
                      <Badge statusText={t.status} />
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
