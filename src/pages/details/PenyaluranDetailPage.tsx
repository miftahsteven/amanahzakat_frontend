import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  Banknote,
  Download,
  FolderKanban,
  HandCoins,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  DetailBackLink,
  DetailHero,
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
import { penyaluranApi } from '../../lib/api';
import type { PenyaluranDetail } from '../../types/zis';

export function PenyaluranDetailPage({ id, onBack }: { id: string; onBack: () => void }) {
  const [data, setData] = useState<PenyaluranDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [disbursing, setDisbursing] = useState(false);

  const load = () => {
    setLoading(true);
    penyaluranApi
      .getById(id)
      .then(setData)
      .catch((err: Error) => toast.error(err.message || 'Gagal memuat detail penyaluran'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleDisburse = async () => {
    if (!data || data.status === 'Sudah Tersalurkan') return;
    setDisbursing(true);
    try {
      const updated = await penyaluranApi.disburse(id);
      setData(updated);
      toast.success(`Penyaluran ${formatRP(data.nominal)} ke ${data.mustahikNama} berhasil dicairkan`);
    } catch (err: any) {
      toast.error(err.message || 'Gagal mencairkan dana');
    } finally {
      setDisbursing(false);
    }
  };

  if (loading) return <DetailLoading label="Kembali ke Penyaluran ZIS" onBack={onBack} />;
  if (!data) return <DetailNotFound label="Kembali ke Penyaluran ZIS" onBack={onBack} />;

  const tersalur = data.status === 'Sudah Tersalurkan';
  const tanggal = formatTanggalId(data.tanggal);

  return (
    <div className="space-y-6 pb-8">
      <DetailBackLink label="Kembali ke Penyaluran ZIS" onBack={onBack} />

      <DetailHero
        eyebrow={`Transaksi Penyaluran ${data.noTransaksi}`}
        title={data.mustahikNama}
        subtitle={`Asnaf ${data.asnaf} · ${data.programNama} · ${tanggal}`}
        actions={
          <>
            <Badge statusText={data.status} />
            <Button
              variant="outline"
              size="sm"
              className="border-emerald-600/50 text-emerald-100 hover:bg-emerald-900/40 bg-transparent"
              icon={<Download className="w-3.5 h-3.5" />}
              onClick={() => toast.success('Berita acara penyaluran siap diunduh (PDF)')}
            >
              Unduh Berita Acara
            </Button>
            {tersalur ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/20 text-[#A5E4CB] border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5" /> Sudah Tersalurkan
              </span>
            ) : (
              <Button variant="primary" size="sm" disabled={disbursing} onClick={handleDisburse}>
                {disbursing ? 'Mencairkan…' : 'Cairkan Dana'}
              </Button>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard
          label="Nominal Penyaluran"
          value={formatRP(data.nominal)}
          sub={`Golongan asnaf ${data.asnaf}`}
          icon={<HandCoins className="w-4 h-4" />}
        />
        <SummaryCard
          label="Dana ke Mustahik"
          value={formatRP(data.danaMustahik)}
          sub={`Potongan amil ${formatRP(data.potonganAmil)}`}
          icon={<Users className="w-4 h-4" />}
        />
        <SummaryCard
          label="Pagu Program"
          value={formatRP(data.programPagu)}
          sub={data.programPenanggungJawab}
          icon={<FolderKanban className="w-4 h-4" />}
        />
        <SummaryCard
          label="Porsi dari Pagu"
          value={`${data.porsiPaguPct}%`}
          sub={`Terserap ${formatRP(data.programTerpakai)}`}
          icon={<Banknote className="w-4 h-4" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <InfoPanel title="Data Penerima Manfaat">
          <InfoRow label="NIK" value={data.mustahikNik} />
          <InfoRow label="Wilayah" value={data.mustahikWilayah} />
          <InfoRow label="Total Bantuan Diterima" value={formatRP(data.mustahikTotalBantuan)} />
          <InfoRow label="Riwayat Program" value={data.mustahikRiwayatProgram} />
          <InfoRow label="Rekening Tujuan" value={data.rekeningTujuan} />
          <InfoRow label="Metode Pembayaran" value={data.metodePembayaran} />
        </InfoPanel>

        <InfoPanel title="Pelaksana & Akuntansi">
          <InfoRow label="Mitra Pelaksana" value={data.mitraNama} />
          <InfoRow label="PIC Lapangan" value={data.mitraPic} />
          <InfoRow label="Debit" value={data.akunDebit} />
          <InfoRow label="Kredit" value={data.akunKredit} />
          <InfoRow label="Referensi Transfer" value={data.refTransfer} />
          <InfoRow label="Keterangan" value={data.keterangan} />
          <div className="py-3 border-t border-[#E3E8E4] dark:border-slate-800 mt-1 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#7D938A]">Posting Jurnal G/L</p>
            <div className="flex justify-between text-xs p-2.5 rounded-xl bg-[#F4F6F4] dark:bg-slate-800/60">
              <span className="font-mono text-[#4d5c56]">{data.akunDebit}</span>
              <span className="font-mono font-bold text-emerald-600">{formatRP(data.nominal)} —</span>
            </div>
            <div className="flex justify-between text-xs p-2.5 rounded-xl bg-[#F4F6F4] dark:bg-slate-800/60">
              <span className="font-mono text-[#4d5c56]">{data.akunKredit}</span>
              <span className="font-mono font-bold text-rose-600">— {formatRP(data.nominal)}</span>
            </div>
          </div>
        </InfoPanel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DocChecklist title="Kelengkapan Dokumen" items={data.dokumen} />
        <TimelineSection title="Riwayat Proses Penyaluran" steps={data.riwayat} />
      </div>
    </div>
  );
}
