import React, { useState } from 'react';
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
import { Badge } from '../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { ArrowRight, Plus } from 'lucide-react';

export interface DashboardPageProps {
  onNavigate: (screen: string) => void;
  onOpenQuickZis: () => void;
}

const DOUBLE_BAR_DATA = [
  { bulan: 'Jan', zakat: 42, infak: 18, total: 60, pct: 7.0 },
  { bulan: 'Feb', zakat: 40, infak: 15, total: 55, pct: 6.4 },
  { bulan: 'Mar', zakat: 65, infak: 25, total: 90, pct: 10.5 },
  { bulan: 'Apr', zakat: 95, infak: 35, total: 130, pct: 15.2 },
  { bulan: 'Mei', zakat: 52, infak: 22, total: 74, pct: 8.6 },
  { bulan: 'Jun', zakat: 48, infak: 20, total: 68, pct: 7.9 },
  { bulan: 'Jul', zakat: 81, infak: 35, total: 116, pct: 13.5, growth: 20.8 },
  { bulan: 'Agu', zakat: 45, infak: 15, total: 60, pct: 7.0 },
];

const ASNAF_PROGRESS_DATA = [
  { nama: 'Fakir & Miskin', nominal: 'Rp 580,0 Jt', percent: 100 },
  { nama: 'Fisabilillah', nominal: 'Rp 410,0 Jt', percent: 71 },
  { nama: 'Amil', nominal: 'Rp 120,0 Jt', percent: 21 },
  { nama: 'Gharimin', nominal: 'Rp 220,0 Jt', percent: 38 },
  { nama: 'Ibnu Sabil', nominal: 'Rp 70,0 Jt', percent: 12 },
];

const RECENT_TRANSACTIONS = [
  { tgl: '26/07/2026', muzakki: 'Hj. Sundari Wibowo', jenis: 'Zakat Maal', kanal: 'Transfer Bank', nominal: 'Rp 25.000.000', isZakat: true },
  { tgl: '26/07/2026', muzakki: 'PT Cahaya Nusantara', jenis: 'Infak', kanal: 'Transfer Bank', nominal: 'Rp 15.000.000', isZakat: false },
  { tgl: '25/07/2026', muzakki: 'Ahmad Fauzan', jenis: 'Zakat Profesi', kanal: 'Payroll Amil', nominal: 'Rp 1.750.000', isZakat: true },
  { tgl: '25/07/2026', muzakki: 'Nur Aisyah Rahma', jenis: 'Shodaqoh', kanal: 'QRIS', nominal: 'Rp 500.000', isZakat: false },
  { tgl: '24/07/2026', muzakki: 'Yayasan Bina Umat', jenis: 'Zakat Maal', kanal: 'Transfer Bank', nominal: 'Rp 48.500.000', isZakat: true },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const zakatVal = payload[0]?.value || 0;
    const infakVal = payload[1]?.value || 0;
    const totalVal = zakatVal + infakVal;
    const zakatPct = totalVal > 0 ? Math.round((zakatVal / totalVal) * 100) : 0;
    const infakPct = totalVal > 0 ? Math.round((infakVal / totalVal) * 100) : 0;

    return (
      <div className="bg-[#091D15] border-t-2 border-[#0B9D6D] rounded-xl p-3.5 shadow-2xl text-white text-xs w-56 space-y-2 font-sans animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between">
          <span className="font-extrabold text-sm text-white">{label}</span>
          <span className="text-[11px] font-bold text-[#A3DBC8]">▲ 20,8% vs sebelumnya</span>
        </div>
        <div>
          <div className="text-base font-black text-white">Rp {totalVal} Jt</div>
          <div className="text-[10px] text-[#8A9691] font-medium">13.5% dari periode</div>
        </div>
        <div className="border-t border-[#14271F] pt-2 space-y-1 text-[11px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#0B9D6D]"></span>
              <span className="text-[#8A9691]">Zakat</span>
            </div>
            <span className="font-bold text-white">Rp {zakatVal} Jt <span className="text-[#8A9691] font-normal">({zakatPct}%)</span></span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#C8933B]"></span>
              <span className="text-[#8A9691]">Infak/Shodaqoh</span>
            </div>
            <span className="font-bold text-white">Rp {infakVal} Jt <span className="text-[#8A9691] font-normal">({infakPct}%)</span></span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, onOpenQuickZis }) => {
  const [trenSkala, setTrenSkala] = useState<'harian' | 'bulanan' | 'tahunan'>('bulanan');
  const [dariDate, setDariDate] = useState('01/01/2026');
  const [sampaiDate, setSampaiDate] = useState('31/08/2026');

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#14271F] dark:text-white tracking-tight">
            Ringkasan Penghimpunan & Penyaluran
          </h1>
          <p className="text-xs text-[#8A9691] mt-0.5 font-medium">
            Data ZIS terkonsolidasi dari seluruh kanal — pembaruan terakhir 26 Jul 2026, 09:42 WIB
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={onOpenQuickZis}>
            Catat Penerimaan
          </Button>
          <Button variant="outline" onClick={() => onNavigate('penyaluran')}>
            Salurkan Dana
          </Button>
        </div>
      </div>

      {/* 4 Top Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <Card className="p-5 bg-white dark:bg-[#091D15]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase text-[#8A9691] tracking-wider">TOTAL PENGHIMPUNAN</span>
            <span className="px-2 py-0.5 rounded-full bg-[#E6F7EE] text-[#0B9D6D] text-[10px] font-black border border-[#A3DBC8]">
              +18,4%
            </span>
          </div>
          <h2 className="text-2xl font-black text-[#14271F] dark:text-white tracking-tight">Rp 717,4 Jt</h2>
          <p className="text-xs text-[#8A9691] font-medium mt-1">Bulan berjalan · 16 transaksi</p>
        </Card>

        {/* Card 2 */}
        <Card className="p-5 bg-white dark:bg-[#091D15]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase text-[#8A9691] tracking-wider">DANA ZAKAT</span>
            <span className="px-2 py-0.5 rounded-full bg-[#E6F7EE] text-[#0B9D6D] text-[10px] font-black border border-[#A3DBC8]">
              +11,2%
            </span>
          </div>
          <h2 className="text-2xl font-black text-[#14271F] dark:text-white tracking-tight">Rp 501,4 Jt</h2>
          <p className="text-xs text-[#8A9691] font-medium mt-1">Maal, profesi & fitrah</p>
        </Card>

        {/* Card 3 */}
        <Card className="p-5 bg-white dark:bg-[#091D15]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase text-[#8A9691] tracking-wider">TOTAL PENYALURAN</span>
            <span className="px-2 py-0.5 rounded-full bg-[#E6F7EE] text-[#0B9D6D] text-[10px] font-black border border-[#A3DBC8]">
              +6,9%
            </span>
          </div>
          <h2 className="text-2xl font-black text-[#14271F] dark:text-white tracking-tight">Rp 554,7 Jt</h2>
          <p className="text-xs text-[#8A9691] font-medium mt-1">16 penyaluran tercatat</p>
        </Card>

        {/* Card 4 */}
        <Card className="p-5 bg-white dark:bg-[#091D15]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase text-[#8A9691] tracking-wider">SERAPAN ANGGARAN</span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#F7F0E0] text-[#C8933B] text-[10px] font-black border border-[#F7F0E0]">
              on track
            </span>
          </div>
          <h2 className="text-2xl font-black text-[#14271F] dark:text-white tracking-tight">71%</h2>
          <p className="text-xs text-[#8A9691] font-medium mt-1">Rp 4055,5 Jt dari Rp 5750,0 Jt</p>
        </Card>
      </div>

      {/* Middle Grid (Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Tren Penghimpunan */}
        <Card className="lg:col-span-2 p-6 bg-white dark:bg-[#091D15]">
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-black text-[#14271F] dark:text-white">Tren Penghimpunan</h3>
              <p className="text-xs text-[#8A9691] font-medium">Zakat, Infak & Shodaqoh per bulan tahun 2026 (juta rupiah)</p>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
              <div className="flex items-center gap-1.5">
                {(['harian', 'bulanan', 'tahunan'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setTrenSkala(mode)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer capitalize ${
                      trenSkala === mode
                        ? 'bg-[#0B9D6D] text-white shadow-xs'
                        : 'bg-[#F3F6F4] text-[#14271F] border border-[#D4DBD6] hover:bg-[#EBEFEB]'
                    }`}
                  >
                    {mode === 'harian' ? 'Harian' : mode === 'bulanan' ? 'Bulanan' : 'Tahunan'}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 text-[#8A9691]">
                <span>Dari</span>
                <input
                  type="text"
                  value={dariDate}
                  onChange={(e) => setDariDate(e.target.value)}
                  className="px-2.5 py-1 text-xs border border-[#D4DBD6] bg-white rounded-lg text-[#14271F] font-mono w-24 text-center"
                />
                <span>Sampai</span>
                <input
                  type="text"
                  value={sampaiDate}
                  onChange={(e) => setSampaiDate(e.target.value)}
                  className="px-2.5 py-1 text-xs border border-[#D4DBD6] bg-white rounded-lg text-[#14271F] font-mono w-24 text-center"
                />
                <button
                  onClick={() => {
                    setDariDate('01/01/2026');
                    setSampaiDate('31/08/2026');
                  }}
                  className="text-xs font-bold text-[#0B9D6D] hover:underline cursor-pointer ml-1"
                >
                  Atur ulang
                </button>
              </div>
            </div>

            <p className="text-[11px] font-bold text-[#8A9691]">
              8 titik data - total Rp 857 Jt - zakat 70%
            </p>

            {/* Double Bar Chart */}
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={DOUBLE_BAR_DATA} margin={{ top: 10, right: 10, left: -25, bottom: 0 }} barGap={3}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBEFEB" />
                  <XAxis dataKey="bulan" tickLine={false} axisLine={false} style={{ fontSize: '11px', fontWeight: 'bold' }} />
                  <YAxis tickLine={false} axisLine={false} style={{ fontSize: '11px' }} />
                  <Tooltip content={<CustomTooltip />} defaultIndex={6} />
                  <Bar dataKey="zakat" fill="#0B9D6D" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="infak" fill="#C8933B" radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        {/* Right Column: Penyaluran per Asnaf */}
        <Card className="p-6 bg-white dark:bg-[#091D15]">
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-black text-[#14271F] dark:text-white">Penyaluran per Asnaf</h3>
              <p className="text-xs text-[#8A9691] font-medium">Realisasi terhadap pagu tahun berjalan</p>
            </div>

            <div className="space-y-4 pt-2">
              {ASNAF_PROGRESS_DATA.map((asnaf, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#14271F] dark:text-slate-200">{asnaf.nama}</span>
                    <span className="font-bold text-[#8A9691] font-mono">{asnaf.nominal}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#EBEFEB] overflow-hidden">
                    <div
                      className="h-full bg-[#0B9D6D] rounded-full transition-all duration-300"
                      style={{ width: `${asnaf.percent}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom Table Section: Transaksi Penerimaan Terakhir */}
      <Card className="p-6 bg-white dark:bg-[#091D15]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-[#14271F] dark:text-white">Transaksi Penerimaan Terakhir</h3>
            <button
              onClick={() => onNavigate('penerimaan')}
              className="text-xs font-bold text-[#0B9D6D] hover:underline flex items-center gap-1 cursor-pointer"
            >
              Lihat semua <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#14271F]">
              <thead>
                <tr className="border-b border-[#EBEFEB] text-[#8A9691] uppercase tracking-wider font-extrabold text-[10px]">
                  <th className="py-3 px-3">TANGGAL</th>
                  <th className="py-3 px-3">MUZAKKI</th>
                  <th className="py-3 px-3">JENIS DANA</th>
                  <th className="py-3 px-3">KANAL</th>
                  <th className="py-3 px-3 text-right">NOMINAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBEFEB]">
                {RECENT_TRANSACTIONS.map((trx, i) => (
                  <tr key={i} className="hover:bg-[#F3F6F4]/60 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-medium text-[#8A9691]">{trx.tgl}</td>
                    <td className="py-3.5 px-3 font-bold text-[#14271F]">{trx.muzakki}</td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                          trx.isZakat
                            ? 'bg-[#E6F7EE] text-[#0B9D6D] border border-[#A3DBC8]'
                            : 'bg-[#F7F0E0] text-[#C8933B] border border-[#F7F0E0]'
                        }`}
                      >
                        {trx.jenis}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-[#8A9691] font-medium">{trx.kanal}</td>
                    <td className="py-3.5 px-3 text-right font-black text-[#14271F] font-mono">{trx.nominal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
};
