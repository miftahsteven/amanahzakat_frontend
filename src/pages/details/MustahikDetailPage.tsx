import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { HandCoins, MapPin, ShieldCheck, Users } from 'lucide-react';
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
  TimelineSection,
  formatTanggalId,
} from '../../components/detail/DetailUi';
import { formatRP } from '../../lib/utils';
import { mustahikApi } from '../../lib/api';
import type { MustahikDetail } from '../../types/zis';

export function MustahikDetailPage({ id, onBack }: { id: string; onBack: () => void }) {
  const [data, setData] = useState<MustahikDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [latInput, setLatInput] = useState('');
  const [lngInput, setLngInput] = useState('');
  const [savingGps, setSavingGps] = useState(false);

  const load = () => {
    setLoading(true);
    mustahikApi
      .getById(id)
      .then((row) => {
        setData(row);
        setLatInput(String(row.lat ?? ''));
        setLngInput(String(row.lng ?? ''));
      })
      .catch((err: Error) => toast.error(err.message || 'Gagal memuat profil mustahik'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [id]);

  const saveGps = async () => {
    const lat = Number(latInput);
    const lng = Number(lngInput);
    if (!lat || !lng) {
      toast.error('Isi koordinat lat dan lng yang valid');
      return;
    }
    setSavingGps(true);
    try {
      const updated = await mustahikApi.updateGps(id, lat, lng);
      setData(updated);
      toast.success('Koordinat GPS mustahik diperbarui');
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan GPS');
    } finally {
      setSavingGps(false);
    }
  };

  if (loading) return <DetailLoading label="Kembali ke Data Mustahik" onBack={onBack} />;
  if (!data) return <DetailNotFound label="Kembali ke Data Mustahik" onBack={onBack} />;

  return (
    <div className="space-y-6 pb-8">
      <DetailBackLink label="Kembali ke Data Mustahik" onBack={onBack} />

      <DetailHeroProfile
        inisial={data.inisial}
        title={data.nama}
        subtitle={`NIK ${data.nik} · Asnaf ${data.kategoriAsnaf}`}
        meta={[
          { label: 'Wilayah', value: data.wilayah },
          { label: 'HP', value: data.hp },
          { label: 'Status Survei', value: data.statusSurvei },
        ]}
        actions={
          <>
            <Badge variant="blue">{data.kategoriAsnaf}</Badge>
            {data.statusSurvei === 'Terverifikasi' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/20 text-[#A5E4CB] border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5" /> Terverifikasi
              </span>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard
          label="Total Bantuan"
          value={formatRP(data.totalBantuanDiterima)}
          sub="Akumulasi penyaluran"
          icon={<HandCoins className="w-4 h-4" />}
        />
        <SummaryCard
          label="Skor Kelayakan"
          value={`${data.skorKelayakan}/100`}
          sub="Hasil survei lapangan"
          icon={<ShieldCheck className="w-4 h-4" />}
        />
        <SummaryCard
          label="Tanggungan"
          value={String(data.jumlahTanggungan)}
          sub={`Penghasilan ${formatRP(data.penghasilanBulanan)}/bln`}
          icon={<Users className="w-4 h-4" />}
        />
        <SummaryCard
          label="Program Diikuti"
          value={String(data.programCount)}
          sub={data.programList.slice(0, 2).join(' · ') || 'Belum ada penyaluran'}
          icon={<MapPin className="w-4 h-4" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <InfoPanel title="Profil Ekonomi & Kontak">
          <InfoRow label="Pekerjaan" value={data.pekerjaan} />
          <InfoRow label="Alamat" value={data.alamat} />
          <InfoRow label="Rekening Bank" value={data.rekeningBank} />
          <InfoRow label="Program pernah diikuti" value={data.programList.join(' · ') || '—'} />
        </InfoPanel>

        <div className="space-y-4">
          <DocChecklist title="Kelengkapan Dokumen Survei" items={data.dokumen} />
          <InfoPanel title="Koordinat GPS (Peta Sebaran)">
            <p className="text-[11px] text-[#7D938A] py-2">
              Koordinat dipakai untuk marker individual di peta sebaran mustahik.
            </p>
            <div className="grid grid-cols-2 gap-3 pb-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#7D938A] mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={latInput}
                  onChange={(e) => setLatInput(e.target.value)}
                  className="w-full p-2.5 border border-[#DDE3DF] rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#7D938A] mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={lngInput}
                  onChange={(e) => setLngInput(e.target.value)}
                  className="w-full p-2.5 border border-[#DDE3DF] rounded-xl text-xs"
                />
              </div>
            </div>
            <Button variant="primary" size="sm" disabled={savingGps} onClick={saveGps}>
              {savingGps ? 'Menyimpan…' : 'Simpan Koordinat GPS'}
            </Button>
          </InfoPanel>
        </div>
      </div>

      <TimelineSection title="Riwayat Proses Survei" steps={data.riwayatSurvei} />

      <div className="bg-white dark:bg-slate-900 border border-[#E3E8E4] dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-[#E3E8E4] dark:border-slate-800">
          <h2 className="text-sm font-extrabold text-[#16211D] dark:text-white">Riwayat Penyaluran</h2>
        </div>
        {data.penyaluranRows.length === 0 ? (
          <p className="p-6 text-xs text-[#7D938A]">Belum ada penyaluran tercatat untuk mustahik ini.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-xs">
              <thead className="bg-[#FAFBFA] dark:bg-slate-800/50">
                <tr>
                  {['No. Penyaluran', 'Tanggal', 'Program', 'Nominal', 'Dana Mustahik', 'Status'].map((h) => (
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
                {data.penyaluranRows.map((p) => (
                  <tr key={p.id} className="border-t border-[#E3E8E4] dark:border-slate-800 hover:bg-[#FAFCFB]">
                    <td className="px-5 py-3 font-mono text-[#4d5c56]">{p.noPenyaluran}</td>
                    <td className="px-3 py-3">{formatTanggalId(p.tanggal)}</td>
                    <td className="px-3 py-3 font-medium">{p.programNama}</td>
                    <td className="px-3 py-3 font-mono font-bold">{formatRP(p.nominal)}</td>
                    <td className="px-3 py-3 font-mono text-emerald-700">{formatRP(p.danaMustahik)}</td>
                    <td className="px-5 py-3">
                      <Badge statusText={p.status} />
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
