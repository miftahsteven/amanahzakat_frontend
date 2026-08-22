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
import { Card } from '../components/ui/Card';
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
      <div className="bg-[#0D1714] border-t-2 border-[#0F9D6E] rounded-xl p-3.5 shadow-2xl text-white text-xs w-56 space-y-2 font-sans">
        <div className="flex items-center justify-between">
          <span className="font-bold text-sm text-white">{label}</span>
          <span className="text-[11px] font-bold text-[#A5E4CB]">▲ 20,8% vs sebelumnya</span>
        </div>
        <div>
          <div className="text-base font-bold text-white">Rp {totalVal} Jt</div>
          <div className="text-[10px] text-[#7D938A] font-medium">13.5% dari periode</div>
        </div>
        <div className="border-t border-white/10 pt-2 space-y-1 text-[11px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#0F9D6E]"></span>
              <span className="text-[#7D938A]">Zakat</span>
            </div>
            <span className="font-bold text-white">Rp {zakatVal} Jt <span className="text-[#7D938A] font-normal">({zakatPct}%)</span></span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#C8933A]"></span>
              <span className="text-[#7D938A]">Infak/Shodaqoh</span>
            </div>
            <span className="font-bold text-white">Rp {infakVal} Jt <span className="text-[#7D938A] font-normal">({infakPct}%)</span></span>
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
          <h1 className="text-[25px] font-extrabold text-[#16211D] tracking-tight">
            Ringkasan Penghimpunan & Penyaluran
          </h1>
          <p className="text-[13px] text-[#6B7A74] mt-1">
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
        <Card className="p-5 bg-white border border-[#E3E8E4] rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase text-[#7D938A] tracking-wider">TOTAL PENGHIMPUNAN</span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#E6F6EF] text-[#0B7C56] text-[10px] font-bold">
              +18,4%
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#16211D] tracking-tight">Rp 717,4 Jt</h2>
          <p className="text-xs text-[#7D938A] font-medium mt-1">Bulan berjalan · 16 transaksi</p>
        </Card>

        {/* Card 2 */}
        <Card className="p-5 bg-white border border-[#E3E8E4] rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase text-[#7D938A] tracking-wider">DANA ZAKAT</span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#E6F6EF] text-[#0B7C56] text-[10px] font-bold">
              +11,2%
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#16211D] tracking-tight">Rp 501,4 Jt</h2>
          <p className="text-xs text-[#7D938A] font-medium mt-1">Maal, profesi & fitrah</p>
        </Card>

        {/* Card 3 */}
        <Card className="p-5 bg-white border border-[#E3E8E4] rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase text-[#7D938A] tracking-wider">TOTAL PENYALURAN</span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#E6F6EF] text-[#0B7C56] text-[10px] font-bold">
              +6,9%
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#16211D] tracking-tight">Rp 554,7 Jt</h2>
          <p className="text-xs text-[#7D938A] font-medium mt-1">16 penyaluran tercatat</p>
        </Card>

        {/* Card 4 */}
        <Card className="p-5 bg-white border border-[#E3E8E4] rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase text-[#7D938A] tracking-wider">SERAPAN ANGGARAN</span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#FDF5EA] text-[#9C6C1A] text-[10px] font-bold">
              on track
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#16211D] tracking-tight">71%</h2>
          <p className="text-xs text-[#7D938A] font-medium mt-1">Rp 4055,5 Jt dari Rp 5750,0 Jt</p>
        </Card>
      </div>

      {/* Middle Grid (Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Tren Penghimpunan */}
        <Card className="lg:col-span-2 p-6 bg-white border border-[#E3E8E4] rounded-2xl">
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-[#16211D]">Tren Penghimpunan</h3>
              <p className="text-xs text-[#7D938A] font-medium">Zakat, Infak & Shodaqoh per bulan tahun 2026 (juta rupiah)</p>
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
                  type="text"
                  value={dariDate}
                  onChange={(e) => setDariDate(e.target.value)}
                  className="px-2.5 py-1 text-xs border border-[#DDE3DF] bg-white rounded-lg text-[#16211D] font-mono w-24 text-center"
                />
                <span>Sampai</span>
                <input
                  type="text"
                  value={sampaiDate}
                  onChange={(e) => setSampaiDate(e.target.value)}
                  className="px-2.5 py-1 text-xs border border-[#DDE3DF] bg-white rounded-lg text-[#16211D] font-mono w-24 text-center"
                />
                <button
                  onClick={() => {
                    setDariDate('01/01/2026');
                    setSampaiDate('31/08/2026');
                  }}
                  className="text-xs font-bold text-[#0F9D6E] hover:underline cursor-pointer ml-1"
                >
                  Atur ulang
                </button>
              </div>
            </div>

            <p className="text-[11px] font-bold text-[#7D938A]">
              8 titik data · total Rp 857 Jt · zakat 70%
            </p>

            {/* Double Bar Chart */}
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={DOUBLE_BAR_DATA} margin={{ top: 10, right: 10, left: -25, bottom: 0 }} barGap={3}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3E8E4" />
                  <XAxis dataKey="bulan" tickLine={false} axisLine={false} style={{ fontSize: '11px', fontWeight: 'bold' }} />
                  <YAxis tickLine={false} axisLine={false} style={{ fontSize: '11px' }} />
                  <Tooltip content={<CustomTooltip />} defaultIndex={6} />
                  <Bar dataKey="zakat" fill="#0F9D6E" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="infak" fill="#C8933A" radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        {/* Right Column: Penyaluran per Asnaf */}
        <Card className="p-6 bg-white border border-[#E3E8E4] rounded-2xl">
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-[#16211D]">Penyaluran per Asnaf</h3>
              <p className="text-xs text-[#7D938A] font-medium">Realisasi terhadap pagu tahun berjalan</p>
            </div>

            <div className="space-y-4 pt-2">
              {ASNAF_PROGRESS_DATA.map((asnaf, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#16211D]">{asnaf.nama}</span>
                    <span className="font-bold text-[#7D938A] font-mono">{asnaf.nominal}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#E3E8E4] overflow-hidden">
                    <div
                      className="h-full bg-[#0F9D6E] rounded-full transition-all duration-300"
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
      <Card className="p-6 bg-white border border-[#E3E8E4] rounded-2xl">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#16211D]">Transaksi Penerimaan Terakhir</h3>
            <button
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
                {RECENT_TRANSACTIONS.map((trx, i) => (
                  <tr key={i} className="hover:bg-[#F4F6F4]/70 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-medium text-[#7D938A]">{trx.tgl}</td>
                    <td className="py-3.5 px-3 font-bold text-[#16211D]">{trx.muzakki}</td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          trx.isZakat
                            ? 'bg-[#E6F6EF] text-[#0B7C56]'
                            : 'bg-[#FDF5EA] text-[#9C6C1A]'
                        }`}
                      >
                        {trx.jenis}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-[#7D938A] font-medium">{trx.kanal}</td>
                    <td className="py-3.5 px-3 text-right font-bold text-[#16211D] font-mono">{trx.nominal}</td>
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
