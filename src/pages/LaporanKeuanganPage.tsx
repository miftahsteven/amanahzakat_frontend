import React, { useCallback, useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Printer, Download, Receipt, ShieldCheck, RefreshCw } from 'lucide-react';
import { formatRP } from '../lib/utils';
import { keuanganApi } from '../lib/api';
import { toast } from 'sonner';
import { printReport } from '../lib/printReport';

export interface LaporanKeuanganPageProps {
  onNavigate: (screen: string) => void;
}

interface LaporanKeuanganData {
  periode: { dari: string; sampai: string; label: string };
  psak109: {
    zakatMaalProfesi: number;
    zakatFitrah: number;
    totalPenerimaanZakat: number;
    penyaluranZakat: number;
    hakAmil: number;
    saldoAkhirZakat: number;
    infakTerikat: number;
    infakBebas: number;
    totalPenerimaanInfak: number;
    penyaluranInfak: number;
    saldoAkhirInfak: number;
  };
  neraca: {
    kasKecil: number;
    bankZakat: number;
    bankInfak: number;
    totalAktiva: number;
    saldoDanaZakat: number;
    saldoDanaInfak: number;
    saldoDanaAmil: number;
    totalPasiva: number;
  };
  arusKas: {
    arusMasuk: number;
    arusKeluarPenyaluran: number;
    arusKeluarOperasional: number;
    kenaikanKas: number;
  };
}

export const LaporanKeuanganPage: React.FC<LaporanKeuanganPageProps> = () => {
  const [activeTab, setActiveTab] = useState<'PSAK109' | 'NERACA' | 'ARUS_KAS'>('PSAK109');
  const [data, setData] = useState<LaporanKeuanganData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await keuanganApi.laporanKeuangan();
      setData(res);
    } catch (err: any) {
      toast.error(err.message || 'Gagal memuat laporan keuangan');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExportPdf = () => {
    if (!data) return;
    const p = data.psak109;
    printReport({
      title: 'Laporan Keuangan PSAK 109',
      subtitle: `Periode ${data.periode.dari} s/d ${data.periode.sampai}`,
      rows: [
        { label: 'Penerimaan Zakat Maal & Profesi', value: formatRP(p.zakatMaalProfesi) },
        { label: 'Penerimaan Zakat Fitrah', value: formatRP(p.zakatFitrah) },
        { label: 'Total Penerimaan Dana Zakat', value: formatRP(p.totalPenerimaanZakat) },
        { label: 'Penyaluran ke 8 Asnaf', value: `(${formatRP(p.penyaluranZakat)})` },
        { label: 'Alokasi Hak Amil Zakat (12.5%)', value: `(${formatRP(p.hakAmil)})` },
        { label: 'Saldo Akhir Dana Zakat', value: formatRP(p.saldoAkhirZakat) },
        { label: 'Penerimaan Infak Terikat', value: formatRP(p.infakTerikat) },
        { label: 'Penerimaan Infak Bebas & Shodaqoh', value: formatRP(p.infakBebas) },
        { label: 'Total Penerimaan Dana Infak', value: formatRP(p.totalPenerimaanInfak) },
        { label: 'Penyaluran Program Infak', value: `(${formatRP(p.penyaluranInfak)})` },
        { label: 'Saldo Akhir Dana Infak', value: formatRP(p.saldoAkhirInfak) },
      ],
    });
    toast.success('Laporan Keuangan PSAK 109 siap dicetak');
  };

  const psak = data?.psak109;
  const neraca = data?.neraca;
  const arus = data?.arusKas;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Receipt className="w-6 h-6 text-[#0f9d6e]" /> Laporan Keuangan Syariah (PSAK 109)
          </h1>
          <p className="text-xs text-slate-500">
            Laporan Sumber & Penggunaan Dana Zakat, Infak/Sedekah, Dana Amil, dan Neraca Posisi Keuangan
            {data && ` · Periode ${data.periode.label}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" icon={<RefreshCw className="w-4 h-4" />} onClick={loadData} disabled={loading}>
            Refresh
          </Button>
          <Button variant="outline" icon={<Printer className="w-4 h-4" />} onClick={() => window.print()} disabled={!data}>
            Cetak Laporan
          </Button>
          <Button variant="primary" icon={<Download className="w-4 h-4" />} onClick={handleExportPdf} disabled={!data}>
            Export PDF PSAK 109
          </Button>
        </div>
      </div>

      {loading && (
        <Card className="p-8 text-center text-xs text-slate-500">Memuat data laporan keuangan dari transaksi terverifikasi…</Card>
      )}

      {!loading && !data && (
        <Card className="p-8 text-center text-xs text-rose-600">Data laporan tidak tersedia.</Card>
      )}

      {data && (
        <>
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-semibold">
            {(['PSAK109', 'NERACA', 'ARUS_KAS'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 rounded-xl transition-all ${
                  activeTab === tab
                    ? 'bg-[#0f9d6e] text-white font-bold shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 border border-slate-200 dark:border-slate-800'
                }`}
              >
                {tab === 'PSAK109' && 'Laporan Perubahan Dana (PSAK 109)'}
                {tab === 'NERACA' && 'Neraca Posisi Keuangan'}
                {tab === 'ARUS_KAS' && 'Laporan Arus Kas'}
              </button>
            ))}
          </div>

          {activeTab === 'PSAK109' && psak && (
            <Card className="p-6 space-y-6">
              <div className="text-center pb-4 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 tracking-wide uppercase">
                  AMANAH ZAKAT (LAZNAS)
                </h2>
                <h3 className="text-sm font-bold text-[#0f9d6e]">
                  LAPORAN PERUBAHAN DANA ZAKAT, INFAK/SEDEKAH, DAN AMIL
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Untuk Periode {data.periode.dari} s/d {data.periode.sampai} (Disajikan dalam Rupiah)
                </p>
                <Badge variant="emerald" className="mt-2">
                  Standar Akuntansi Syariah PSAK 109
                </Badge>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800 text-[#0b7c56]">
                  I. DANA ZAKAT
                </h4>
                <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 pl-2">
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                    <span className="font-semibold">1. Penerimaan Zakat Maal & Profesi</span>
                    <span className="font-mono font-bold">{formatRP(psak.zakatMaalProfesi)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                    <span className="font-semibold">2. Penerimaan Zakat Fitrah</span>
                    <span className="font-mono font-bold">{formatRP(psak.zakatFitrah)}</span>
                  </div>
                  <div className="flex justify-between py-1 font-bold bg-slate-50 dark:bg-slate-900 p-1.5 rounded">
                    <span>TOTAL PENERIMAAN DANA ZAKAT</span>
                    <span className="font-mono text-[#0f9d6e]">{formatRP(psak.totalPenerimaanZakat)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                    <span className="font-semibold text-rose-600">3. Penyaluran ke 8 Asnaf</span>
                    <span className="font-mono font-bold text-rose-600">({formatRP(psak.penyaluranZakat)})</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                    <span className="font-semibold text-rose-600">4. Alokasi Hak Amil Zakat (12.5%)</span>
                    <span className="font-mono font-bold text-rose-600">({formatRP(psak.hakAmil)})</span>
                  </div>
                  <div className="flex justify-between py-2 font-extrabold text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-100/50 dark:bg-emerald-950 p-2 rounded-lg mt-2">
                    <span>SALDO AKHIR DANA ZAKAT KELOLAAN</span>
                    <span className="font-mono text-base">{formatRP(psak.saldoAkhirZakat)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 p-2.5 rounded-lg border border-blue-200 dark:border-blue-800 text-blue-700">
                  II. DANA INFAK / SEDEKAH
                </h4>
                <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 pl-2">
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                    <span className="font-semibold">1. Penerimaan Infak Terikat (Program)</span>
                    <span className="font-mono font-bold">{formatRP(psak.infakTerikat)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                    <span className="font-semibold">2. Penerimaan Infak Tidak Terikat & Shodaqoh</span>
                    <span className="font-mono font-bold">{formatRP(psak.infakBebas)}</span>
                  </div>
                  <div className="flex justify-between py-1 font-bold bg-slate-50 dark:bg-slate-900 p-1.5 rounded">
                    <span>TOTAL PENERIMAAN DANA INFAK</span>
                    <span className="font-mono text-blue-600">{formatRP(psak.totalPenerimaanInfak)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                    <span className="font-semibold text-rose-600">3. Penyaluran Program Infak & Sedekah</span>
                    <span className="font-mono font-bold text-rose-600">({formatRP(psak.penyaluranInfak)})</span>
                  </div>
                  <div className="flex justify-between py-2 font-extrabold text-xs text-blue-800 dark:text-blue-300 bg-blue-100/50 dark:bg-blue-950 p-2 rounded-lg mt-2">
                    <span>SALDO AKHIR DANA INFAK KELOLAAN</span>
                    <span className="font-mono text-base">{formatRP(psak.saldoAkhirInfak)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Data dihitung dari transaksi terverifikasi · {data.periode.label}</span>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'NERACA' && neraca && (
            <Card className="p-6 space-y-4">
              <div className="text-center pb-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">NERACA POSISI KEUANGAN AMANAH ZAKAT</h2>
                <p className="text-xs text-slate-500">Per {data.periode.sampai}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="space-y-2">
                  <h4 className="font-bold text-emerald-800 bg-emerald-50 p-2 rounded">AKTIVA (ASET)</h4>
                  <div className="flex justify-between py-1 border-b">
                    <span>Kas Kecil Operasional Amil</span>
                    <span className="font-mono">{formatRP(neraca.kasKecil)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span>Bank BSI Penampung Zakat</span>
                    <span className="font-mono">{formatRP(neraca.bankZakat)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span>Bank BSI Penampung Infak</span>
                    <span className="font-mono">{formatRP(neraca.bankInfak)}</span>
                  </div>
                  <div className="flex justify-between py-2 font-bold bg-slate-100 p-2 rounded">
                    <span>TOTAL AKTIVA</span>
                    <span className="font-mono text-[#0f9d6e]">{formatRP(neraca.totalAktiva)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-blue-800 bg-blue-50 p-2 rounded">PASIVA (SALDO DANA)</h4>
                  <div className="flex justify-between py-1 border-b">
                    <span>Saldo Dana Zakat (Kelolaan)</span>
                    <span className="font-mono">{formatRP(neraca.saldoDanaZakat)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span>Saldo Dana Infak / Sedekah</span>
                    <span className="font-mono">{formatRP(neraca.saldoDanaInfak)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span>Saldo Dana Amil (Hak Amil)</span>
                    <span className="font-mono">{formatRP(neraca.saldoDanaAmil)}</span>
                  </div>
                  <div className="flex justify-between py-2 font-bold bg-slate-100 p-2 rounded">
                    <span>TOTAL PASIVA</span>
                    <span className="font-mono text-blue-600">{formatRP(neraca.totalPasiva)}</span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'ARUS_KAS' && arus && (
            <Card className="p-6 space-y-4">
              <div className="text-center pb-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">LAPORAN ARUS KAS</h2>
                <p className="text-xs text-slate-500">
                  Metode Langsung — Periode {data.periode.dari} s/d {data.periode.sampai}
                </p>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b">
                  <span>Arus Kas dari Penerimaan ZIS</span>
                  <span className="font-mono font-bold text-emerald-600">+{formatRP(arus.arusMasuk)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b">
                  <span>Arus Kas Keluar Penyaluran Mustahik</span>
                  <span className="font-mono font-bold text-rose-600">-{formatRP(arus.arusKeluarPenyaluran)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b">
                  <span>Beban Gaji & Operasional Amil</span>
                  <span className="font-mono font-bold text-rose-600">-{formatRP(arus.arusKeluarOperasional)}</span>
                </div>
                <div className="flex justify-between py-2 font-bold bg-emerald-50 p-2 rounded text-[#0f9d6e]">
                  <span>KENAIKAN BERSIH KAS & BANK</span>
                  <span className="font-mono">{formatRP(arus.kenaikanKas)}</span>
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
