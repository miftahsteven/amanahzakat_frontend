import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  FileText,
  ShieldCheck,
  Wallet,
  HandCoins,
  Landmark,
  CreditCard,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { BszPdfModal } from '../../components/shared/BszPdfModal';
import { cn, formatRP } from '../../lib/utils';
import { penerimaanApi } from '../../lib/api';
import type { PenerimaanDetail } from '../../types/zis';

function formatTanggalId(iso: string) {
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

function kanalLabel(kanal: string) {
  if (kanal.toLowerCase().includes('transfer') || kanal.toLowerCase().includes('bsi')) return 'Transfer Bank';
  if (kanal.toLowerCase().includes('qris')) return 'QRIS';
  if (kanal.toLowerCase().includes('cash') || kanal.toLowerCase().includes('konter')) return 'Cash / Konter';
  return kanal;
}

function SummaryCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-[#E3E8E4] dark:border-slate-800 rounded-2xl p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#7D938A]">{label}</span>
        <span className="text-[#0F9D6E]">{icon}</span>
      </div>
      <p className="text-lg font-extrabold text-[#16211D] dark:text-white font-mono">{value}</p>
      <p className="text-[11px] text-[#7D938A]">{sub}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-0.5 py-2.5 border-b border-[#E3E8E4] dark:border-slate-800 last:border-0 text-xs">
      <span className="text-[#7D938A] font-medium shrink-0">{label}</span>
      <span className="font-semibold text-[#16211D] dark:text-slate-100 text-right sm:max-w-[60%]">
        {value || '—'}
      </span>
    </div>
  );
}

export function PenerimaanDetailPage({ id, onBack }: { id: string; onBack: () => void }) {
  const [data, setData] = useState<PenerimaanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [bszOpen, setBszOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    penerimaanApi
      .getById(id)
      .then(setData)
      .catch((err: Error) => toast.error(err.message || 'Gagal memuat detail penerimaan'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-4">
        <button type="button" onClick={onBack} className="text-xs font-bold text-[#0F9D6E] flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Penerimaan ZIS
        </button>
        <p className="text-sm text-[#7D938A]">Memuat detail transaksi...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <button type="button" onClick={onBack} className="text-xs font-bold text-[#0F9D6E] flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Penerimaan ZIS
        </button>
        <p className="text-sm text-rose-600">Transaksi tidak ditemukan.</p>
      </div>
    );
  }

  const tanggalLabel = formatTanggalId(data.tanggal);
  const kanal = kanalLabel(data.kanal);
  const isVerified = data.status === 'Terverifikasi';

  return (
    <div className="space-y-6 pb-8">
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0D1714] via-[#04241a] to-[#0B7C56] text-white p-6 sm:p-8 border border-emerald-900/40">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_#A5E4CB_0%,_transparent_50%)]" />
        <div className="relative space-y-4">
          <button
            type="button"
            onClick={onBack}
            className="text-xs font-bold text-[#A5E4CB] hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Penerimaan ZIS
          </button>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/90">
                Transaksi Penerimaan {data.noTransaksi}
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{data.muzakkiNama}</h1>
              <p className="text-sm text-emerald-100/80 font-medium">
                {data.jenisZis} · {kanal} · {tanggalLabel}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Badge statusText={data.status} />
              <Button
                variant="outline"
                size="sm"
                className="border-emerald-600/50 text-emerald-100 hover:bg-emerald-900/40 bg-transparent"
                icon={<FileText className="w-3.5 h-3.5" />}
                onClick={() => setBszOpen(true)}
              >
                Lihat Bukti Setor
              </Button>
              {isVerified && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/20 text-[#A5E4CB] border border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" /> Sudah Terverifikasi
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard
          label="Nominal Diterima"
          value={formatRP(data.nominal)}
          sub={data.jenisZis}
          icon={<Wallet className="w-4 h-4" />}
        />
        <SummaryCard
          label={`Hak Amil ${data.hakAmilPct > 0 ? `${data.hakAmilPct}%` : '—'}`}
          value={formatRP(data.hakAmil)}
          sub="Porsi pengelolaan lembaga"
          icon={<Landmark className="w-4 h-4" />}
        />
        <SummaryCard
          label="Dana Mustahik"
          value={formatRP(data.danaMustahik)}
          sub={
            data.hakAmilPct > 0
              ? `${data.danaMustahikPct}% siap disalurkan`
              : '100% siap disalurkan'
          }
          icon={<HandCoins className="w-4 h-4" />}
        />
        <SummaryCard
          label="Kanal Pembayaran"
          value={kanal}
          sub={tanggalLabel}
          icon={<CreditCard className="w-4 h-4" />}
        />
      </div>

      {/* Two-column info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-[#E3E8E4] dark:border-slate-800 rounded-2xl p-5 sm:p-6">
          <h2 className="text-sm font-extrabold text-[#16211D] dark:text-white mb-3">Data Muzakki</h2>
          <InfoRow label="Nomor Muzakki" value={data.muzakkiNomor} />
          <InfoRow label="Tipe Donatur" value={data.muzakkiTipe} />
          <InfoRow label="NPWP / NIK" value={data.muzakkiNikNpwp} />
          <InfoRow label="Total Donasi Seumur Hidup" value={formatRP(data.muzakkiTotalSetoran)} />
          <InfoRow label="Nomor SBMZ" value={data.noSbmz ?? 'Belum diterbitkan'} />
          <InfoRow label="No. Kwitansi" value={data.noKwitansi} />
        </div>

        <div className="bg-white dark:bg-slate-900 border border-[#E3E8E4] dark:border-slate-800 rounded-2xl p-5 sm:p-6">
          <h2 className="text-sm font-extrabold text-[#16211D] dark:text-white mb-3">
            Informasi Penyetoran & G/L
          </h2>
          <InfoRow label="Rekening Penampung" value={data.rekeningTujuan} />
          <InfoRow label="Referensi Bank" value={data.referensiBank} />
          {data.programNama && <InfoRow label="Program" value={data.programNama} />}
          {data.catatan && <InfoRow label="Catatan" value={data.catatan} />}

          <div className="mt-4 pt-4 border-t border-[#E3E8E4] dark:border-slate-800">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#7D938A] mb-3">
              Posting Jurnal G/L
            </p>
            <div className="space-y-2 text-xs">
              {data.jurnalGl.map((line) => (
                <div
                  key={line.akun}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#F4F6F4] dark:bg-slate-800/60"
                >
                  <span className="font-medium text-[#16211D] dark:text-slate-200">{line.akun}</span>
                  <span
                    className={cn(
                      'font-mono font-bold shrink-0',
                      line.debit > 0 ? 'text-emerald-600' : 'text-rose-600'
                    )}
                  >
                    {line.debit > 0
                      ? `${formatRP(line.debit)} —`
                      : `— ${formatRP(line.kredit)}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white dark:bg-slate-900 border border-[#E3E8E4] dark:border-slate-800 rounded-2xl p-5 sm:p-6">
        <h2 className="text-sm font-extrabold text-[#16211D] dark:text-white mb-5">Riwayat Proses Transaksi</h2>
        <div className="space-y-0">
          {data.riwayat.map((step, idx) => (
            <div key={step.title} className="flex gap-4">
              <div className="flex flex-col items-center">
                {step.done ? (
                  <CheckCircle2 className="w-5 h-5 text-[#0F9D6E] shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-[#A4B8AF] shrink-0" />
                )}
                {idx < data.riwayat.length - 1 && (
                  <div className={cn('w-0.5 flex-1 min-h-[2rem] my-1', step.done ? 'bg-emerald-200' : 'bg-[#E3E8E4]')} />
                )}
              </div>
              <div className="pb-6 flex-1">
                <p className={cn('text-sm font-bold', step.done ? 'text-[#16211D] dark:text-white' : 'text-[#7D938A]')}>
                  {step.title}
                </p>
                <p className="text-xs text-[#7D938A] mt-0.5">{step.desc}</p>
                {step.waktu && (
                  <p className="text-[10px] text-[#A4B8AF] font-mono mt-1">{step.waktu}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <BszPdfModal isOpen={bszOpen} onClose={() => setBszOpen(false)} data={data} />
    </div>
  );
}
