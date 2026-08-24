import React, { useCallback, useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ArrowRight, Plus, RefreshCw } from 'lucide-react';
import { formatJT, formatRP } from '../lib/utils';
import { dashboardApi } from '../lib/api';
import { toast } from 'sonner';

export interface DashboardPageProps {
  onNavigate: (screen: string) => void;
  onOpenQuickZis: () => void;
}

type DashboardData = Awaited<ReturnType<typeof dashboardApi.summary>>;

function GrowthBadge({ value }: { value: number | null | undefined }) {
  if (value == null) return null;
  const positive = value >= 0;
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
        positive ? 'bg-[#E6F6EF] text-[#0B7C56]' : 'bg-rose-50 text-rose-600'
      }`}
    >
      {positive ? '+' : ''}
      {value.toLocaleString('id-ID')}%
    </span>
  );
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  const point = payload[0]?.payload;
  const zakatVal = payload[0]?.value || 0;
  const infakVal = payload[1]?.value || 0;
  const totalVal = zakatVal + infakVal;
  const zakatPct = totalVal > 0 ? Math.round((zakatVal / totalVal) * 100) : 0;
  const infakPct = totalVal > 0 ? Math.round((infakVal / totalVal) * 100) : 0;

  return (
    <div className="bg-[#0D1714] border-t-2 border-[#0F9D6E] rounded-xl p-3.5 shadow-2xl text-white text-xs w-56 space-y-2 font-sans">
      <div className="flex items-center justify-between gap-2">
        <span className="font-bold text-sm text-white">{label}</span>
        {point?.growth != null && (
          <span className="text-[11px] font-bold text-[#A5E4CB]">
            {point.growth >= 0 ? '▲' : '▼'} {Math.abs(point.growth).toLocaleString('id-ID')}% vs sebelumnya
          </span>
        )}
      </div>
      <div>
        <div className="text-base font-bold text-white">Rp {totalVal} Jt</div>
        {point?.pct != null && (
          <div className="text-[10px] text-[#7D938A] font-medium">{point.pct}% dari periode</div>
        )}
      </div>
      <div className="border-t border-white/10 pt-2 space-y-1 text-[11px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#0F9D6E]"></span>
            <span className="text-[#7D938A]">Zakat</span>
          </div>
          <span className="font-bold text-white">
            Rp {zakatVal} Jt <span className="text-[#7D938A] font-normal">({zakatPct}%)</span>
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#C8933A]"></span>
            <span className="text-[#7D938A]">Infak/Shodaqoh</span>
          </div>
          <span className="font-bold text-white">
            Rp {infakVal} Jt <span className="text-[#7D938A] font-normal">({infakPct}%)</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, onOpenQuickZis }) => {
  const year = new Date().getFullYear();
  const [trenSkala, setTrenSkala] = useState<'harian' | 'bulanan' | 'tahunan'>('bulanan');
  const [dariDate, setDariDate] = useState(`${year}-01-01`);
  const [sampaiDate, setSampaiDate] = useState(new Date().toISOString().slice(0, 10));
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await dashboardApi.summary({
        dari: dariDate,
        sampai: sampaiDate,
        skala: trenSkala,
      });
      setData(res);
    } catch (err: any) {
      toast.error(err.message || 'Gagal memuat ringkasan dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [dariDate, sampaiDate, trenSkala]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const chartData =
    data?.trenPenghimpunan.map((p) => ({
      bulan: p.label,
      zakat: p.zakat,
      infak: p.infak,
      total: p.total,
      pct: p.pct,
      growth: p.growth,
    })) ?? [];

  const formatTgl = (iso: string) => {
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[25px] font-extrabold text-[#16211D] tracking-tight">
            Ringkasan Penghimpunan & Penyaluran
          </h1>
          <p className="text-[13px] text-[#6B7A74] mt-1">
            Data ZIS terkonsolidasi dari seluruh kanal
            {data?.lastUpdated && ` — pembaruan terakhir ${data.lastUpdated} WIB`}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button variant="secondary" icon={<RefreshCw className="w-4 h-4" />} onClick={loadData} disabled={isLoading}>
            Refresh
          </Button>
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={onOpenQuickZis}>
            Catat Penerimaan
          </Button>
          <Button variant="outline" onClick={() => onNavigate('penyaluran')}>
            Salurkan Dana
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-white border border-[#E3E8E4] rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase text-[#7D938A] tracking-wider">TOTAL PENGHIMPUNAN</span>
            <GrowthBadge value={data?.summary.totalPenghimpunanGrowth} />
          </div>
          <h2 className="text-2xl font-extrabold text-[#16211D] tracking-tight">
            {isLoading ? '...' : formatJT(data?.summary.totalPenghimpunan)}
          </h2>
          <p className="text-xs text-[#7D938A] font-medium mt-1">
            Bulan berjalan · {data?.summary.transaksiBulanIni ?? 0} transaksi
          </p>
        </Card>

        <Card className="p-5 bg-white border border-[#E3E8E4] rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase text-[#7D938A] tracking-wider">DANA ZAKAT</span>
            <GrowthBadge value={data?.summary.danaZakatGrowth} />
          </div>
          <h2 className="text-2xl font-extrabold text-[#16211D] tracking-tight">
            {isLoading ? '...' : formatJT(data?.summary.danaZakat)}
          </h2>
          <p className="text-xs text-[#7D938A] font-medium mt-1">Maal, profesi & fitrah</p>
        </Card>

        <Card className="p-5 bg-white border border-[#E3E8E4] rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase text-[#7D938A] tracking-wider">TOTAL PENYALURAN</span>
            <GrowthBadge value={data?.summary.totalPenyaluranGrowth} />
          </div>
          <h2 className="text-2xl font-extrabold text-[#16211D] tracking-tight">
            {isLoading ? '...' : formatJT(data?.summary.totalPenyaluran)}
          </h2>
          <p className="text-xs text-[#7D938A] font-medium mt-1">
            {data?.summary.penyaluranCount ?? 0} penyaluran tercatat
          </p>
        </Card>

        <Card className="p-5 bg-white border border-[#E3E8E4] rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase text-[#7D938A] tracking-wider">SERAPAN ANGGARAN</span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#FDF5EA] text-[#9C6C1A] text-[10px] font-bold">
              {(data?.summary.serapanPct ?? 0) <= 85 ? 'on track' : 'perlu review'}
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#16211D] tracking-tight">
            {isLoading ? '...' : `${data?.summary.serapanPct ?? 0}%`}
          </h2>
          <p className="text-xs text-[#7D938A] font-medium mt-1">
            {formatJT(data?.summary.terpakaiTotal)} dari {formatJT(data?.summary.paguTotal)}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 bg-white border border-[#E3E8E4] rounded-2xl">
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-[#16211D]">Tren Penghimpunan</h3>
              <p className="text-xs text-[#7D938A] font-medium">
                Zakat, Infak & Shodaqoh — skala {trenSkala} (juta rupiah)
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
              <div className="flex items-center gap-1.5">
                {(['harian', 'bulanan', 'tahunan'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setTrenSkala(mode)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer capitalize ${
                      trenSkala === mode
                        ? 'bg-[#0F9D6E] text-white shadow-xs'
                        : 'bg-[#F4F6F4] text-[#4D5C56] border border-[#DDE3DF] hover:bg-[#E3E8E4]'
                    }`}
                  >
                    {mode === 'harian' ? 'Harian' : mode === 'bulanan' ? 'Bulanan' : 'Tahunan'}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 text-[#7D938A]">
                <span>Dari</span>
                <input
                  type="date"
                  value={dariDate}
                  onChange={(e) => setDariDate(e.target.value)}
                  className="px-2.5 py-1 text-xs border border-[#DDE3DF] bg-white rounded-lg text-[#16211D] font-mono"
                />
                <span>Sampai</span>
                <input
                  type="date"
                  value={sampaiDate}
                  onChange={(e) => setSampaiDate(e.target.value)}
                  className="px-2.5 py-1 text-xs border border-[#DDE3DF] bg-white rounded-lg text-[#16211D] font-mono"
                />
                <button
                  type="button"
                  onClick={() => {
                    setDariDate(`${year}-01-01`);
                    setSampaiDate(new Date().toISOString().slice(0, 10));
                  }}
                  className="text-xs font-bold text-[#0F9D6E] hover:underline cursor-pointer ml-1"
                >
                  Atur ulang
                </button>
              </div>
            </div>

            <p className="text-[11px] font-bold text-[#7D938A]">
              {data?.trenMeta.titikData ?? 0} titik data · total {formatJT(data?.trenMeta.totalNominal)} · zakat{' '}
              {data?.trenMeta.zakatPct ?? 0}%
            </p>

            <div className="h-64 w-full pt-2">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }} barGap={3}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3E8E4" />
                    <XAxis dataKey="bulan" tickLine={false} axisLine={false} style={{ fontSize: '11px', fontWeight: 'bold' }} />
                    <YAxis tickLine={false} axisLine={false} style={{ fontSize: '11px' }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="zakat" fill="#0F9D6E" radius={[4, 4, 0, 0]} maxBarSize={28} />
                    <Bar dataKey="infak" fill="#C8933A" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-[#7D938A]">
                  {isLoading ? 'Memuat grafik...' : 'Belum ada data penghimpunan pada periode ini'}
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white border border-[#E3E8E4] rounded-2xl">
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-[#16211D]">Penyaluran per Asnaf</h3>
              <p className="text-xs text-[#7D938A] font-medium">Realisasi penyaluran tersalurkan</p>
            </div>

            <div className="space-y-4 pt-2">
              {(data?.penyaluranPerAsnaf ?? []).length > 0 ? (
                data!.penyaluranPerAsnaf.map((asnaf) => (
                  <div key={asnaf.nama} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#16211D]">{asnaf.nama}</span>
                      <span className="font-bold text-[#7D938A] font-mono">{formatJT(asnaf.nominal)}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#E3E8E4] overflow-hidden">
                      <div
                        className="h-full bg-[#0F9D6E] rounded-full transition-all duration-300"
                        style={{ width: `${asnaf.percent}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#7D938A]">
                  {isLoading ? 'Memuat...' : 'Belum ada penyaluran tersalurkan'}
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-white border border-[#E3E8E4] rounded-2xl">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#16211D]">Transaksi Penerimaan Terakhir</h3>
            <button
              type="button"
              onClick={() => onNavigate('penerimaan')}
              className="text-xs font-bold text-[#0F9D6E] hover:underline flex items-center gap-1 cursor-pointer"
            >
              Lihat semua <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#16211D]">
              <thead>
                <tr className="border-b border-[#E3E8E4] text-[#7D938A] uppercase tracking-wider font-extrabold text-[10px]">
                  <th className="py-3 px-3">TANGGAL</th>
                  <th className="py-3 px-3">MUZAKKI</th>
                  <th className="py-3 px-3">JENIS DANA</th>
                  <th className="py-3 px-3">KANAL</th>
                  <th className="py-3 px-3 text-right">NOMINAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E8E4]">
                {(data?.recentTransactions ?? []).map((trx, i) => (
                  <tr key={i} className="hover:bg-[#F4F6F4]/70 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-medium text-[#7D938A]">{formatTgl(trx.tanggal)}</td>
                    <td className="py-3.5 px-3 font-bold text-[#16211D]">{trx.muzakki}</td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          trx.isZakat ? 'bg-[#E6F6EF] text-[#0B7C56]' : 'bg-[#FDF5EA] text-[#9C6C1A]'
                        }`}
                      >
                        {trx.jenisZis}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-[#7D938A] font-medium">{trx.kanal}</td>
                    <td className="py-3.5 px-3 text-right font-bold text-[#16211D] font-mono">{formatRP(trx.nominal)}</td>
                  </tr>
                ))}
                {!isLoading && (data?.recentTransactions ?? []).length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#7D938A]">
                      Belum ada transaksi penerimaan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
};
