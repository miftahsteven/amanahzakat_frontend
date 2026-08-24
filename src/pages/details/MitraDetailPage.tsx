import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Building2, CheckCircle2, HandCoins, Users } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  DetailBackLink,
  DetailHeroProfile,
  DetailLoading,
  DetailNotFound,
  DocChecklist,
  InfoPanel,
  InfoRow,
  SummaryCard,
  formatTanggalId,
} from '../../components/detail/DetailUi';
import { formatRP } from '../../lib/utils';
import { mitraApi } from '../../lib/api';
import type { MitraDetail } from '../../types/system';

export function MitraDetailPage({ id, onBack }: { id: string; onBack: () => void }) {
  const [data, setData] = useState<MitraDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  const load = () => {
    setLoading(true);
    mitraApi
      .getById(id)
      .then(setData)
      .catch((err: Error) => toast.error(err.message || 'Gagal memuat detail mitra'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleVerify = async () => {
    if (!data || data.statusLaporanLpj === 'Terverifikasi') return;
    setVerifying(true);
    try {
      await mitraApi.update(id, { statusLaporanLpj: 'Terverifikasi' });
      toast.success(`Laporan ${data.nama} diverifikasi`);
      load();
    } catch (err: any) {
      toast.error(err.message || 'Gagal verifikasi LPJ');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) return <DetailLoading label="Kembali ke Mitra Penyalur" onBack={onBack} />;
  if (!data) return <DetailNotFound label="Kembali ke Mitra Penyalur" onBack={onBack} />;

  const verified = data.statusLaporanLpj === 'Terverifikasi';

  return (
    <div className="space-y-6 pb-8">
      <DetailBackLink label="Kembali ke Mitra Penyalur" onBack={onBack} />

      <DetailHeroProfile
        inisial={data.inisial}
        title={data.nama}
        subtitle={`${data.bentukLembaga} · ${data.noMou}`}
        meta={[
          { label: 'PIC', value: data.picKontak },
          { label: 'HP', value: data.hpPic },
          { label: 'Masa Kerja Sama', value: data.masaKerjasama },
        ]}
        actions={
          <>
            <Badge statusText={data.statusLaporanLpj} />
            {verified ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/20 text-[#A5E4CB] border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" /> Laporan Terverifikasi
              </span>
            ) : (
              <Button variant="primary" size="sm" disabled={verifying} onClick={handleVerify}>
                {verifying ? 'Memverifikasi…' : 'Verifikasi Laporan Mitra'}
              </Button>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <SummaryCard
          label="Dana Dikelola Mitra"
          value={formatRP(data.totalPenyaluran)}
          sub="Akumulasi penyaluran melalui mitra"
          icon={<HandCoins className="w-4 h-4" />}
        />
        <SummaryCard
          label="Bentuk Lembaga"
          value={data.bentukLembaga}
          sub={data.noMou}
          icon={<Building2 className="w-4 h-4" />}
        />
        <SummaryCard
          label="Program Terkait"
          value={`${data.programTerkait.length} program`}
          sub="Program berjalan yang dapat didukung mitra"
          icon={<Users className="w-4 h-4" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <InfoPanel title="Profil Mitra">
          {data.profil.map((p) => (
            <InfoRow key={p.label} label={p.label} value={p.value} />
          ))}
        </InfoPanel>
        <DocChecklist title="Kelengkapan Dokumen" items={data.dokumen} />
      </div>

      <InfoPanel title="Program Terkait">
        {data.programTerkait.length === 0 ? (
          <p className="py-4 text-xs text-[#7D938A]">Belum ada program berjalan.</p>
        ) : (
          data.programTerkait.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-3 py-3 border-b border-[#E3E8E4] last:border-0 text-xs"
            >
              <div>
                <p className="font-semibold text-[#16211D] dark:text-white">{p.nama}</p>
                <p className="text-[11px] text-[#7D938A] mt-0.5">PJ: {p.pj}</p>
              </div>
              <div className="text-right font-mono">
                <p className="font-bold text-[#0F9D6E]">{formatRP(p.terpakai)}</p>
                <p className="text-[10px] text-[#7D938A]">dari {formatRP(p.pagu)}</p>
              </div>
            </div>
          ))
        )}
      </InfoPanel>

      <div className="bg-white dark:bg-slate-900 border border-[#E3E8E4] dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-[#E3E8E4] dark:border-slate-800">
          <h2 className="text-sm font-extrabold text-[#16211D] dark:text-white">
            Konteks Transaksi Penyaluran Terkini
          </h2>
        </div>
        {data.transaksi.length === 0 ? (
          <p className="p-6 text-xs text-[#7D938A]">Belum ada transaksi penyaluran.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-xs">
              <thead className="bg-[#FAFBFA] dark:bg-slate-800/50">
                <tr>
                  {['Tanggal', 'Penerima', 'Program', 'Asnaf', 'Nominal', 'Status'].map((h) => (
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
                {data.transaksi.map((t) => (
                  <tr key={t.id} className="border-t border-[#E3E8E4] dark:border-slate-800">
                    <td className="px-5 py-3">{formatTanggalId(t.tanggal)}</td>
                    <td className="px-3 py-3 font-semibold">{t.penerima}</td>
                    <td className="px-3 py-3">{t.program}</td>
                    <td className="px-3 py-3">{t.asnaf}</td>
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
