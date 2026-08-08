import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Printer, Download, Receipt, BookOpen, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { formatRP } from '../lib/utils';
import { toast } from 'sonner';

export interface LaporanKeuanganPageProps {
  onNavigate: (screen: string) => void;
}

export const LaporanKeuanganPage: React.FC<LaporanKeuanganPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'PSAK109' | 'NERACA' | 'ARUS_KAS'>('PSAK109');

  const handleExportPdf = () => {
    toast.success('Laporan Keuangan PSAK 109 Agustus 2026 berhasil di-export ke PDF!');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Receipt className="w-6 h-6 text-[#0f9d6e]" /> Laporan Keuangan Syariah (PSAK 109)
          </h1>
          <p className="text-xs text-slate-500">Laporan Sumber & Penggunaan Dana Zakat, Infak/Sedekah, Dana Amil, dan Neraca Posisi Keuangan</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" icon={<Printer className="w-4 h-4" />} onClick={() => window.print()}>
            Cetak Laporan
          </Button>
          <Button variant="primary" icon={<Download className="w-4 h-4" />} onClick={handleExportPdf}>
            Export PDF PSAK 109
          </Button>
        </div>
      </div>

      {/* Financial Statement Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('PSAK109')}
          className={`px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'PSAK109'
              ? 'bg-[#0f9d6e] text-white font-bold shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 border border-slate-200 dark:border-slate-800'
          }`}
        >
          Laporan Perubahan Dana (PSAK 109)
        </button>
        <button
          onClick={() => setActiveTab('NERACA')}
          className={`px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'NERACA'
              ? 'bg-[#0f9d6e] text-white font-bold shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 border border-slate-200 dark:border-slate-800'
          }`}
        >
          Neraca Posisi Keuangan
        </button>
        <button
          onClick={() => setActiveTab('ARUS_KAS')}
          className={`px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'ARUS_KAS'
              ? 'bg-[#0f9d6e] text-white font-bold shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 border border-slate-200 dark:border-slate-800'
          }`}
        >
          Laporan Arus Kas
        </button>
      </div>

      {/* Main Statement Card */}
      {activeTab === 'PSAK109' && (
        <Card className="p-6 space-y-6">
          <div className="text-center pb-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 tracking-wide uppercase">
              AMANAH ZAKAT (LAZNAS)
            </h2>
            <h3 className="text-sm font-bold text-[#0f9d6e]">LAPORAN PERUBAHAN DANA ZAKAT, INFAK/SEDEKAH, DAN AMIL</h3>
            <p className="text-xs text-slate-500 mt-0.5">Untuk Periode yang Berakhir pada 31 Agustus 2026 (Disajikan dalam Rupiah)</p>
            <Badge variant="emerald" className="mt-2">Standar Akuntansi Syariah PSAK 109</Badge>
          </div>

          {/* Section 1: DANA ZAKAT */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800 text-[#0b7c56]">
              I. DANA ZAKAT
            </h4>

            <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 pl-2">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="font-semibold">1. Penerimaan Zakat Maal & Profesi</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{formatRP(1270000000)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="font-semibold">2. Penerimaan Zakat Fitrah</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{formatRP(225000000)}</span>
              </div>
              <div className="flex justify-between py-1 font-bold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-900 p-1.5 rounded">
                <span>TOTAL PENERIMAAN DANA ZAKAT</span>
                <span className="font-mono text-[#0f9d6e]">{formatRP(1495000000)}</span>
              </div>

              <div className="pt-2"></div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="font-semibold text-rose-600">3. Penyaluran ke 8 Asnaf (Fakir, Miskin, Fisabilillah, dll)</span>
                <span className="font-mono font-bold text-rose-600">({formatRP(1225000000)})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="font-semibold text-rose-600">4. Alokasi Hak Amil Zakat (12.5%)</span>
                <span className="font-mono font-bold text-rose-600">({formatRP(186875000)})</span>
              </div>

              <div className="flex justify-between py-2 font-extrabold text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-100/50 dark:bg-emerald-950 p-2 rounded-lg mt-2">
                <span>SALDO AKHIR DANA ZAKAT KELOLAAN</span>
                <span className="font-mono text-base">{formatRP(450000000)}</span>
              </div>
            </div>
          </div>

          {/* Section 2: DANA INFAK / SEDEKAH */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 p-2.5 rounded-lg border border-blue-200 dark:border-blue-800 text-blue-700">
              II. DANA INFAK / SEDEKAH
            </h4>

            <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 pl-2">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="font-semibold">1. Penerimaan Infak Terikat (Program Beasiswa)</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{formatRP(350000000)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="font-semibold">2. Penerimaan Infak Tidak Terikat & Shodaqoh</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{formatRP(210000000)}</span>
              </div>
              <div className="flex justify-between py-1 font-bold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-900 p-1.5 rounded">
                <span>TOTAL PENERIMAAN DANA INFAK</span>
                <span className="font-mono text-blue-600">{formatRP(560000000)}</span>
              </div>

              <div className="pt-2"></div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="font-semibold text-rose-600">3. Penyaluran Program Infak & Sedekah</span>
                <span className="font-mono font-bold text-rose-600">({formatRP(420000000)})</span>
              </div>

              <div className="flex justify-between py-2 font-extrabold text-xs text-blue-800 dark:text-blue-300 bg-blue-100/50 dark:bg-blue-950 p-2 rounded-lg mt-2">
                <span>SALDO AKHIR DANA INFAK KELOLAAN</span>
                <span className="font-mono text-base">{formatRP(185000000)}</span>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Audit Syariah BAZNAS: OPINI IMPARTIAL / UNQUALIFIED</span>
            </div>
            <div className="text-right">
              <p className="text-slate-400">Bandung, 31 Agustus 2026</p>
              <p className="font-bold text-slate-900 dark:text-slate-100 mt-4">Ahmad Syarif, S.E.I (Direktur Eksekutif)</p>
            </div>
          </div>
        </Card>
      )}

      {/* Neraca View */}
      {activeTab === 'NERACA' && (
        <Card className="p-6 space-y-4">
          <div className="text-center pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">NERACA POSISI KEUANGAN AMANAH ZAKAT</h2>
            <p className="text-xs text-slate-500">Per 31 Agustus 2026</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-2">
              <h4 className="font-bold text-emerald-800 bg-emerald-50 p-2 rounded">AKTIFA (ASET)</h4>
              <div className="flex justify-between py-1 border-b"><span>Kas Kecil Operasional Amil</span><span className="font-mono">{formatRP(15000000)}</span></div>
              <div className="flex justify-between py-1 border-b"><span>Bank BSI Penampung Zakat</span><span className="font-mono">{formatRP(450000000)}</span></div>
              <div className="flex justify-between py-1 border-b"><span>Bank BSI Penampung Infak</span><span className="font-mono">{formatRP(185000000)}</span></div>
              <div className="flex justify-between py-2 font-bold bg-slate-100 p-2 rounded"><span>TOTAL AKTIFA</span><span className="font-mono text-[#0f9d6e]">{formatRP(650000000)}</span></div>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-blue-800 bg-blue-50 p-2 rounded">PASIVA (SALDO DANA)</h4>
              <div className="flex justify-between py-1 border-b"><span>Saldo Dana Zakat (Kelolaan)</span><span className="font-mono">{formatRP(450000000)}</span></div>
              <div className="flex justify-between py-1 border-b"><span>Saldo Dana Infak / Sedekah</span><span className="font-mono">{formatRP(185000000)}</span></div>
              <div className="flex justify-between py-1 border-b"><span>Saldo Dana Amil (Hak Amil)</span><span className="font-mono">{formatRP(15000000)}</span></div>
              <div className="flex justify-between py-2 font-bold bg-slate-100 p-2 rounded"><span>TOTAL PASIVA</span><span className="font-mono text-blue-600">{formatRP(650000000)}</span></div>
            </div>
          </div>
        </Card>
      )}

      {/* Arus Kas View */}
      {activeTab === 'ARUS_KAS' && (
        <Card className="p-6 space-y-4">
          <div className="text-center pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">LAPORAN ARUS KAS</h2>
            <p className="text-xs text-slate-500">Metode Langsung — Periode Agustus 2026</p>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b"><span>Arus Kas dari Penerimaan ZIS</span><span className="font-mono font-bold text-emerald-600">+{formatRP(2055000000)}</span></div>
            <div className="flex justify-between py-1.5 border-b"><span>Arus Kas Keluar Penyaluran Mustahik</span><span className="font-mono font-bold text-rose-600">-{formatRP(1645000000)}</span></div>
            <div className="flex justify-between py-1.5 border-b"><span>Beban Gaji & Operasional Amil</span><span className="font-mono font-bold text-rose-600">-{formatRP(145000000)}</span></div>
            <div className="flex justify-between py-2 font-bold bg-emerald-50 p-2 rounded text-[#0f9d6e]"><span>KENAIKAN BERSIH KAS & BANK</span><span className="font-mono">{formatRP(265000000)}</span></div>
          </div>
        </Card>
      )}
    </div>
  );
};
