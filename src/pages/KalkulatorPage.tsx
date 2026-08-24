import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Calculator, ArrowRight, Settings2, History, RefreshCw } from 'lucide-react';
import {
  hitungZakatProfesi,
  hitungZakatMaal,
  hitungZakatPertanian,
  hitungZakatFitrah,
  DEFAULT_ZAKAT_CONFIG,
  buildZakatConfigView,
  JENIS_ZIS_LABEL,
  type ZakatConfigView,
  type ZakatTab,
} from '../lib/zakatCalculator';
import { kalkulatorApi } from '../lib/api';
import { formatRP } from '../lib/utils';
import { toast } from 'sonner';

export interface QuickZisOptions {
  nominal?: number;
  jenis?: string;
}

export interface KalkulatorPageProps {
  onOpenQuickZis: (opts?: QuickZisOptions) => void;
}

const JENIS_API: Record<ZakatTab, string> = {
  profesi: 'PROFESI',
  maal: 'MAAL',
  pertanian: 'PERTANIAN',
  fitrah: 'FITRAH',
};

export const KalkulatorPage: React.FC<KalkulatorPageProps> = ({ onOpenQuickZis }) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<ZakatTab>('profesi');
  const [showConfig, setShowConfig] = useState(false);
  const [showRiwayat, setShowRiwayat] = useState(false);

  const { data: configData, isLoading: configLoading } = useQuery({
    queryKey: ['kalkulator-config'],
    queryFn: () => kalkulatorApi.getConfig(),
  });

  const { data: riwayat = [], refetch: refetchRiwayat } = useQuery({
    queryKey: ['kalkulator-riwayat'],
    queryFn: () => kalkulatorApi.listRiwayat({ limit: 20 }),
    enabled: showRiwayat,
  });

  const config: ZakatConfigView = useMemo(
    () => configData ?? buildZakatConfigView(DEFAULT_ZAKAT_CONFIG),
    [configData]
  );

  const [configForm, setConfigForm] = useState(DEFAULT_ZAKAT_CONFIG);

  useEffect(() => {
    if (configData) {
      setConfigForm({
        hargaEmasPerGram: configData.hargaEmasPerGram,
        hargaBerasPerKg: configData.hargaBerasPerKg,
        nisabEmasGram: configData.nisabEmasGram,
        nisabBerasKg: configData.nisabBerasKg,
        nisabPertanianKg: configData.nisabPertanianKg,
        zakatRate: configData.zakatRate,
        fitrahKgPerJiwa: configData.fitrahKgPerJiwa,
      });
    }
  }, [configData]);

  // Profesi State
  const [gaji, setGaji] = useState(10000000);
  const [bonus, setBonus] = useState(2000000);
  const resProfesi = hitungZakatProfesi(config, gaji, bonus);

  // Maal State
  const [tabungan, setTabungan] = useState(100000000);
  const [investasi, setInvestasi] = useState(50000000);
  const [emasGram, setEmasGram] = useState(10);
  const [piutang, setPiutang] = useState(10000000);
  const [hutang, setHutang] = useState(10000000);
  const resMaal = hitungZakatMaal(config, tabungan, investasi, emasGram, piutang, hutang);

  // Pertanian State
  const [panenKg, setPanenKg] = useState(1000);
  const [irigasi, setIrigasi] = useState(true);
  const resPertanian = hitungZakatPertanian(config, panenKg, config.hargaBerasPerKg, irigasi);

  // Fitrah State
  const [jiwa, setJiwa] = useState(4);
  const resFitrah = hitungZakatFitrah(config, jiwa);

  const getCurrentResult = useCallback(() => {
    switch (activeTab) {
      case 'profesi':
        return { nominal: resProfesi.zakatHarusDibayar, jenis: JENIS_ZIS_LABEL.profesi };
      case 'maal':
        return { nominal: resMaal.zakatHarusDibayar, jenis: JENIS_ZIS_LABEL.maal };
      case 'pertanian':
        return { nominal: resPertanian.zakatNominal, jenis: JENIS_ZIS_LABEL.pertanian };
      case 'fitrah':
        return { nominal: resFitrah.totalNominal, jenis: JENIS_ZIS_LABEL.fitrah };
    }
  }, [activeTab, resProfesi, resMaal, resPertanian, resFitrah]);

  const logHitung = useMutation({
    mutationFn: () => {
      const tab = activeTab;
      let input: Record<string, unknown> = {};
      if (tab === 'profesi') input = { pendapatanBulanan: gaji, bonus };
      if (tab === 'maal') input = { tabungan, investasi, emasGram, piutangLancar: piutang, hutangJatuhTempo: hutang };
      if (tab === 'pertanian') input = { hasilPanenKg: panenKg, irigasiBerbayar: irigasi };
      if (tab === 'fitrah') input = { jumlahJiwa: jiwa };
      return kalkulatorApi.hitung({ jenis: JENIS_API[tab], input });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kalkulator-riwayat'] });
    },
  });

  const saveConfig = useMutation({
    mutationFn: () => kalkulatorApi.updateConfig(configForm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kalkulator-config'] });
      toast.success('Parameter nisab zakat berhasil disimpan.');
      setShowConfig(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleBayar = async () => {
    const { nominal, jenis } = getCurrentResult();
    try {
      await logHitung.mutateAsync();
    } catch {
      // tetap buka modal meski log gagal
    }
    onOpenQuickZis({ nominal, jenis });
  };

  const tabs: { id: ZakatTab; label: string }[] = [
    { id: 'profesi', label: 'Zakat Profesi' },
    { id: 'maal', label: 'Zakat Maal (Harta)' },
    { id: 'pertanian', label: 'Zakat Pertanian' },
    { id: 'fitrah', label: 'Zakat Fitrah' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Calculator className="w-6 h-6 text-[#0f9d6e]" /> Kalkulator ZIS Interaktif
          </h1>
          <p className="text-xs text-slate-500">
            Parameter nisab dari database — Emas {formatRP(config.hargaEmasPerGram)}/gr · Beras {formatRP(config.hargaBerasPerKg)}/kg
            {configLoading && ' · memuat...'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" icon={<History className="w-4 h-4" />} onClick={() => setShowRiwayat((v) => !v)}>
            Riwayat
          </Button>
          <Button variant="outline" icon={<Settings2 className="w-4 h-4" />} onClick={() => setShowConfig((v) => !v)}>
            Parameter Nisab
          </Button>
          <Button variant="primary" icon={<ArrowRight className="w-4 h-4" />} onClick={() => handleBayar()}>
            Bayar Zakat Sekarang
          </Button>
        </div>
      </div>

      {showConfig && (
        <Card className="p-6 space-y-4 text-xs border-emerald-200 dark:border-emerald-900">
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-[#0f9d6e]" /> Kelola Parameter Nisab (Database)
          </CardTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(
              [
                ['hargaEmasPerGram', 'Harga Emas (Rp/gr)'],
                ['hargaBerasPerKg', 'Harga Beras (Rp/kg)'],
                ['nisabEmasGram', 'Nisab Emas (gram)'],
                ['nisabBerasKg', 'Nisab Beras (kg/tahun)'],
                ['nisabPertanianKg', 'Nisab Pertanian (kg)'],
                ['zakatRate', 'Kadar Zakat (desimal)'],
                ['fitrahKgPerJiwa', 'Fitrah (kg/jiwa)'],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <label className="block font-bold text-slate-600 mb-1">{label}</label>
                <input
                  type="number"
                  step={key === 'zakatRate' ? '0.001' : '1'}
                  value={configForm[key]}
                  onChange={(e) => setConfigForm((f) => ({ ...f, [key]: Number(e.target.value) }))}
                  className="w-full p-2 border rounded-xl bg-white dark:bg-slate-800"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="primary" onClick={() => saveConfig.mutate()} disabled={saveConfig.isPending}>
              Simpan ke Database
            </Button>
            <Button variant="outline" onClick={() => setShowConfig(false)}>
              Tutup
            </Button>
          </div>
          <p className="text-slate-500">
            Nisab emas: {formatRP(buildZakatConfigView(configForm).nisabEmasNominal)} · Nisab profesi/bulan:{' '}
            {formatRP(buildZakatConfigView(configForm).nisabProfesiBulanan)} · Fitrah/jiwa:{' '}
            {formatRP(buildZakatConfigView(configForm).fitrahNominalPerJiwa)}
          </p>
        </Card>
      )}

      {showRiwayat && (
        <Card className="p-4 text-xs overflow-x-auto">
          <div className="flex items-center justify-between mb-3">
            <CardTitle className="flex items-center gap-2">
              <History className="w-4 h-4" /> Riwayat Perhitungan (20 terakhir)
            </CardTitle>
            <Button variant="outline" size="sm" icon={<RefreshCw className="w-3 h-3" />} onClick={() => refetchRiwayat()}>
              Refresh
            </Button>
          </div>
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="text-left text-slate-500 border-b">
                <th className="py-2 pr-3">Waktu</th>
                <th className="py-2 pr-3">Jenis</th>
                <th className="py-2 pr-3">Nominal</th>
                <th className="py-2 pr-3">Wajib</th>
                <th className="py-2">Sumber</th>
              </tr>
            </thead>
            <tbody>
              {riwayat.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-slate-400">
                    Belum ada riwayat perhitungan
                  </td>
                </tr>
              ) : (
                riwayat.map((r: any) => (
                  <tr key={r.id} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-2 pr-3">{new Date(r.createdAt).toLocaleString('id-ID')}</td>
                    <td className="py-2 pr-3 font-semibold">{r.jenis}</td>
                    <td className="py-2 pr-3 font-mono">{formatRP(r.hasilNominal)}</td>
                    <td className="py-2 pr-3">
                      <Badge statusText={r.wajibZakat ? 'Terverifikasi' : 'Ditolak'} />
                    </td>
                    <td className="py-2">{r.sumber}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>
      )}

      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-semibold flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2.5 rounded-xl transition-all ${
              activeTab === t.id ? 'bg-[#0f9d6e] text-white font-bold' : 'bg-white dark:bg-slate-900 border text-slate-600 dark:text-slate-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'profesi' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          <Card className="p-6 space-y-4">
            <CardTitle>Input Pendapatan Bulanan</CardTitle>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Gaji Pokok / Penghasilan Rutin (Rp)</label>
              <input type="number" value={gaji} onChange={(e) => setGaji(Number(e.target.value))} className="w-full p-2.5 border rounded-xl bg-white dark:bg-slate-800" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Bonus / Tunjangan Lainnya (Rp)</label>
              <input type="number" value={bonus} onChange={(e) => setBonus(Number(e.target.value))} className="w-full p-2.5 border rounded-xl bg-white dark:bg-slate-800" />
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1 text-slate-500">
              <p>
                Nisab Profesi ({config.nisabBerasKg} kg Beras @ {formatRP(config.hargaBerasPerKg)}):{' '}
                <strong className="text-slate-800 dark:text-slate-200">{formatRP(config.nisabProfesiBulanan)} / bulan</strong>
              </p>
              <p>
                Kadar Zakat: <strong>{(config.zakatRate * 100).toFixed(1)}%</strong>
              </p>
            </div>
          </Card>
          <Card className="p-6 space-y-4 bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900">
            <CardTitle className="text-[#0f9d6e]">Hasil Perhitungan Zakat Profesi</CardTitle>
            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b">
                <span>Total Pendapatan</span>
                <span className="font-bold">{formatRP(resProfesi.totalPendapatan)}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span>Status Wajib Zakat</span>
                <Badge statusText={resProfesi.wajibZakat ? 'Terverifikasi' : 'Ditolak'} />
              </div>
              <div className="pt-4 text-center">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">ZAKAT HARUS DIBAYAR</span>
                <span className="text-3xl font-extrabold text-[#0f9d6e] block mt-1">{formatRP(resProfesi.zakatHarusDibayar)}</span>
              </div>
            </div>
            <Button variant="primary" className="w-full mt-4" onClick={handleBayar}>
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
                <label className="block font-bold mb-1">Tabungan / Deposito (Rp)</label>
                <input type="number" value={tabungan} onChange={(e) => setTabungan(Number(e.target.value))} className="w-full p-2.5 border rounded-xl" />
              </div>
              <div>
                <label className="block font-bold mb-1">Investasi / Saham (Rp)</label>
                <input type="number" value={investasi} onChange={(e) => setInvestasi(Number(e.target.value))} className="w-full p-2.5 border rounded-xl" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold mb-1">Emas / Perak (Gram)</label>
                <input type="number" value={emasGram} onChange={(e) => setEmasGram(Number(e.target.value))} className="w-full p-2.5 border rounded-xl" />
              </div>
              <div>
                <label className="block font-bold mb-1">Hutang Jatuh Tempo (Rp)</label>
                <input type="number" value={hutang} onChange={(e) => setHutang(Number(e.target.value))} className="w-full p-2.5 border rounded-xl" />
              </div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-slate-500">
              <p>
                Nisab Emas ({config.nisabEmasGram} Gram @ {formatRP(config.hargaEmasPerGram)}):{' '}
                <strong>{formatRP(config.nisabEmasNominal)}</strong>
              </p>
            </div>
          </Card>
          <Card className="p-6 space-y-4 bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200">
            <CardTitle className="text-[#0f9d6e]">Hasil Perhitungan Zakat Maal</CardTitle>
            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b">
                <span>Total Harta Bersih</span>
                <span className="font-bold">{formatRP(resMaal.totalHartaBersih)}</span>
              </div>
              <div className="pt-4 text-center">
                <span className="text-3xl font-extrabold text-[#0f9d6e] block">{formatRP(resMaal.zakatHarusDibayar)}</span>
              </div>
            </div>
            <Button variant="primary" className="w-full mt-4" onClick={handleBayar}>
              Bayar Zakat Maal Sekarang
            </Button>
          </Card>
        </div>
      )}

      {activeTab === 'fitrah' && (
        <Card className="p-6 max-w-xl mx-auto space-y-4 text-xs">
          <CardTitle>Zakat Fitrah Ramadan</CardTitle>
          <div>
            <label className="block font-bold mb-1">Jumlah Jiwa Tanggungan *</label>
            <input type="number" value={jiwa} onChange={(e) => setJiwa(Number(e.target.value))} className="w-full p-2.5 border rounded-xl" />
          </div>
          <div className="p-4 bg-emerald-50 rounded-xl space-y-2 text-center">
            <p className="text-slate-500">
              Standar: {config.fitrahKgPerJiwa} kg beras @ {formatRP(config.hargaBerasPerKg)} = {formatRP(config.fitrahNominalPerJiwa)} / jiwa
            </p>
            <p className="text-xs font-bold">Total Beras: {resFitrah.totalKg} kg</p>
            <span className="text-3xl font-extrabold text-[#0f9d6e] block">{formatRP(resFitrah.totalNominal)}</span>
          </div>
          <Button variant="primary" className="w-full" onClick={handleBayar}>
            Setor Zakat Fitrah ({jiwa} Jiwa)
          </Button>
        </Card>
      )}

      {activeTab === 'pertanian' && (
        <Card className="p-6 max-w-xl mx-auto space-y-4 text-xs">
          <CardTitle>Zakat Hasil Pertanian</CardTitle>
          <div>
            <label className="block font-bold mb-1">Hasil Panen Gabah / Beras (Kg)</label>
            <input type="number" value={panenKg} onChange={(e) => setPanenKg(Number(e.target.value))} className="w-full p-2.5 border rounded-xl" />
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={irigasi} onChange={(e) => setIrigasi(e.target.checked)} />
            Irigasi berbayar (kadar 5%, bukan 10%)
          </label>
          <div className="p-4 bg-emerald-50 rounded-xl space-y-2 text-center">
            <p className="text-slate-500">Nisab Pertanian: {config.nisabPertanianKg} kg gabah</p>
            <span className="text-3xl font-extrabold text-[#0f9d6e] block">{formatRP(resPertanian.zakatNominal)}</span>
          </div>
          <Button variant="primary" className="w-full" onClick={handleBayar}>
            Setor Zakat Pertanian
          </Button>
        </Card>
      )}
    </div>
  );
};
