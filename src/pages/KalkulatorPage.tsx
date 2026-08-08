import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Calculator, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import {
  hitungZakatProfesi,
  hitungZakatMaal,
  hitungZakatPertanian,
  hitungZakatFitrah,
  HARGA_EMAS,
  HARGA_BERAS,
  NISAB_EMAS_NOMINAL,
  NISAB_PROFESI_BULANAN,
} from '../lib/zakatCalculator';
import { formatRP } from '../lib/utils';
import { toast } from 'sonner';

export interface KalkulatorPageProps {
  onOpenQuickZis: () => void;
}

export const KalkulatorPage: React.FC<KalkulatorPageProps> = ({ onOpenQuickZis }) => {
  const [activeTab, setActiveTab] = useState<'profesi' | 'maal' | 'pertanian' | 'fitrah'>('profesi');

  // Profesi State
  const [gaji, setGaji] = useState(10000000);
  const [bonus, setBonus] = useState(2000000);
  const resProfesi = hitungZakatProfesi(gaji, bonus);

  // Maal State
  const [tabungan, setTabungan] = useState(100000000);
  const [investasi, setInvestasi] = useState(50000000);
  const [emasGram, setEmasGram] = useState(10);
  const [piutang, setPiutang] = useState(10000000);
  const [hutang, setHutang] = useState(10000000);
  const resMaal = hitungZakatMaal(tabungan, investasi, emasGram, piutang, hutang);

  // Pertanian State
  const [panenKg, setPanenKg] = useState(1000);
  const [irigasi, setIrigasi] = useState(true);
  const resPertanian = hitungZakatPertanian(panenKg, HARGA_BERAS, irigasi);

  // Fitrah State
  const [jiwa, setJiwa] = useState(4);
  const resFitrah = hitungZakatFitrah(jiwa, HARGA_BERAS);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Calculator className="w-6 h-6 text-[#0f9d6e]" /> Kalkulator ZIS Interaktif
          </h1>
          <p className="text-xs text-slate-500">Hitung nisab & kewajiban Zakat Profesi, Maal, Pertanian, dan Fitrah sesuai kaidah Syariah</p>
        </div>
        <Button variant="primary" icon={<ArrowRight className="w-4 h-4" />} onClick={onOpenQuickZis}>
          Bayar Zakat Sekarang
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('profesi')}
          className={`px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'profesi' ? 'bg-[#0f9d6e] text-white font-bold' : 'bg-white dark:bg-slate-900 border text-slate-600 dark:text-slate-400'
          }`}
        >
          Zakat Profesi
        </button>
        <button
          onClick={() => setActiveTab('maal')}
          className={`px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'maal' ? 'bg-[#0f9d6e] text-white font-bold' : 'bg-white dark:bg-slate-900 border text-slate-600 dark:text-slate-400'
          }`}
        >
          Zakat Maal (Harta)
        </button>
        <button
          onClick={() => setActiveTab('pertanian')}
          className={`px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'pertanian' ? 'bg-[#0f9d6e] text-white font-bold' : 'bg-white dark:bg-slate-900 border text-slate-600 dark:text-slate-400'
          }`}
        >
          Zakat Pertanian
        </button>
        <button
          onClick={() => setActiveTab('fitrah')}
          className={`px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'fitrah' ? 'bg-[#0f9d6e] text-white font-bold' : 'bg-white dark:bg-slate-900 border text-slate-600 dark:text-slate-400'
          }`}
        >
          Zakat Fitrah
        </button>
      </div>

      {/* Calculator Body */}
      {activeTab === 'profesi' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          <Card className="p-6 space-y-4">
            <CardTitle>Input Pendapatan Bulanan</CardTitle>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Gaji Pokok / Penghasilan Rutin (Rp)</label>
              <input
                type="number"
                value={gaji}
                onChange={(e) => setGaji(Number(e.target.value))}
                className="w-full p-2.5 border rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Bonus / Tunjangan Lainnya (Rp)</label>
              <input
                type="number"
                value={bonus}
                onChange={(e) => setBonus(Number(e.target.value))}
                className="w-full p-2.5 border rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              />
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1 text-slate-500">
              <p>Nisab Profesi (522 kg Beras @ Rp 15.000): <strong className="text-slate-800 dark:text-slate-200">{formatRP(NISAB_PROFESI_BULANAN)} / bulan</strong></p>
              <p>Kadar Zakat: <strong>2.5%</strong></p>
            </div>
          </Card>

          <Card className="p-6 space-y-4 bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900">
            <CardTitle className="text-[#0f9d6e]">Hasil Perhitungan Zakat Profesi</CardTitle>
            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b"><span>Total Pendapatan</span><span className="font-bold">{formatRP(resProfesi.totalPendapatan)}</span></div>
              <div className="flex justify-between py-1 border-b"><span>Status Wajib Zakat</span><Badge statusText={resProfesi.wajibZakat ? 'Terverifikasi' : 'Ditolak'} /></div>
              <div className="pt-4 text-center">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">ZAKAT HARUS DIBAYAR</span>
                <span className="text-3xl font-extrabold text-[#0f9d6e] block mt-1">{formatRP(resProfesi.zakatHarusDibayar)}</span>
              </div>
            </div>
            <Button variant="primary" className="w-full mt-4" onClick={onOpenQuickZis}>
              Bayar Zakat Profesi Sekarang
            </Button>
          </Card>
        </div>
      )}

      {activeTab === 'maal' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          <Card className="p-6 space-y-4">
            <CardTitle>Input Harta Kekayaan (1 Tahun / Haul)</CardTitle>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tabungan / Deposito (Rp)</label>
                <input type="number" value={tabungan} onChange={(e) => setTabungan(Number(e.target.value))} className="w-full p-2.5 border rounded-xl" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Investasi / Saham (Rp)</label>
                <input type="number" value={investasi} onChange={(e) => setInvestasi(Number(e.target.value))} className="w-full p-2.5 border rounded-xl" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Emas / Perak (Gram)</label>
                <input type="number" value={emasGram} onChange={(e) => setEmasGram(Number(e.target.value))} className="w-full p-2.5 border rounded-xl" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Hutang Jatuh Tempo (Rp)</label>
                <input type="number" value={hutang} onChange={(e) => setHutang(Number(e.target.value))} className="w-full p-2.5 border rounded-xl" />
              </div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1 text-slate-500">
              <p>Nisab Emas (85 Gram @ Rp 1.450.000): <strong className="text-slate-800 dark:text-slate-200">{formatRP(NISAB_EMAS_NOMINAL)}</strong></p>
            </div>
          </Card>

          <Card className="p-6 space-y-4 bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900">
            <CardTitle className="text-[#0f9d6e]">Hasil Perhitungan Zakat Maal</CardTitle>
            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b"><span>Total Harta Bersih</span><span className="font-bold">{formatRP(resMaal.totalHartaBersih)}</span></div>
              <div className="flex justify-between py-1 border-b"><span>Nisab Emas (85 Gram)</span><span className="font-bold">{formatRP(resMaal.nisabNominal)}</span></div>
              <div className="pt-4 text-center">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">ZAKAT MAAL HARUS DIBAYAR</span>
                <span className="text-3xl font-extrabold text-[#0f9d6e] block mt-1">{formatRP(resMaal.zakatHarusDibayar)}</span>
              </div>
            </div>
            <Button variant="primary" className="w-full mt-4" onClick={onOpenQuickZis}>
              Bayar Zakat Maal Sekarang
            </Button>
          </Card>
        </div>
      )}

      {activeTab === 'fitrah' && (
        <Card className="p-6 max-w-xl mx-auto space-y-4 text-xs">
          <CardTitle>Zakat Fitrah Ramadan</CardTitle>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Jumlah Jiwa Tanggungan *</label>
            <input type="number" value={jiwa} onChange={(e) => setJiwa(Number(e.target.value))} className="w-full p-2.5 border rounded-xl" />
          </div>
          <div className="p-4 bg-emerald-50 rounded-xl space-y-2 text-center">
            <p className="text-slate-500">Standar Zakat Fitrah: 2.5 kg beras @ Rp 15.000 = Rp 37.500 / jiwa</p>
            <p className="text-xs font-bold text-slate-700">Total Beras: {resFitrah.totalKg} kg</p>
            <span className="text-3xl font-extrabold text-[#0f9d6e] block">{formatRP(resFitrah.totalNominal)}</span>
          </div>
          <Button variant="primary" className="w-full" onClick={onOpenQuickZis}>
            Setor Zakat Fitrah ({jiwa} Jiwa)
          </Button>
        </Card>
      )}

      {activeTab === 'pertanian' && (
        <Card className="p-6 max-w-xl mx-auto space-y-4 text-xs">
          <CardTitle>Zakat Hasil Pertanian</CardTitle>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Hasil Panen Gabah / Beras (Kg)</label>
            <input type="number" value={panenKg} onChange={(e) => setPanenKg(Number(e.target.value))} className="w-full p-2.5 border rounded-xl" />
          </div>
          <div className="p-4 bg-emerald-50 rounded-xl space-y-2 text-center">
            <p className="text-slate-500">Nisab Pertanian: 653 kg gabah. Kadar zakat: 5% (irigasi berbayar)</p>
            <span className="text-3xl font-extrabold text-[#0f9d6e] block">{formatRP(resPertanian.zakatNominal)}</span>
          </div>
          <Button variant="primary" className="w-full" onClick={onOpenQuickZis}>
            Setor Zakat Pertanian
          </Button>
        </Card>
      )}
    </div>
  );
};
