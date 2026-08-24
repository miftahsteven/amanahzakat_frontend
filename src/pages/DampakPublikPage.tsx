import React, { useCallback, useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { HeartHandshake, RefreshCw, TrendingUp } from 'lucide-react';
import { formatRP, formatJT } from '../lib/utils';
import { laporanApi } from '../lib/api';
import { toast } from 'sonner';

export const DampakPublikPage: React.FC = () => {
  const [data, setData] = useState<Awaited<ReturnType<typeof laporanApi.dampak>> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await laporanApi.dampak();
      setData(res);
    } catch (err: any) {
      toast.error(err.message || 'Gagal memuat data dampak publik');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const maxAsnaf = data?.alokasiAsnaf[0]?.nominal ?? 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#16211D] flex items-center gap-2">
            <HeartHandshake className="w-6 h-6 text-[#0F9D6E]" /> Dampak Publik & Beneficiary Impact
          </h1>
          <p className="text-xs text-[#7D938A] font-medium mt-0.5">
            Evaluasi dampak sosial, capaian program ZIS, dan alokasi dana per asnaf
          </p>
        </div>
        <Button variant="outline" icon={<RefreshCw className="w-4 h-4" />} onClick={loadData} disabled={isLoading}>
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border border-[#E3E8E4]">
          <p className="text-[10px] font-bold uppercase text-[#7D938A] tracking-wider">Mustahik Terverifikasi</p>
          <p className="text-2xl font-extrabold text-[#0F9D6E] mt-1">
            {isLoading ? '...' : data?.summary.mustahikTerverifikasi ?? 0}
          </p>
        </Card>
        <Card className="p-4 border border-[#E3E8E4]">
          <p className="text-[10px] font-bold uppercase text-[#7D938A] tracking-wider">Total Bantuan Disalurkan</p>
          <p className="text-xl font-extrabold text-[#16211D] mt-1">
            {isLoading ? '...' : formatRP(data?.summary.totalBantuanDisalurkan ?? 0)}
          </p>
        </Card>
        <Card className="p-4 border border-[#E3E8E4]">
          <p className="text-[10px] font-bold uppercase text-[#7D938A] tracking-wider">Tanggungan Terbantu</p>
          <p className="text-2xl font-extrabold text-[#C8933A] mt-1">
            {isLoading ? '...' : data?.summary.totalTanggunganTerbantu ?? 0}
            <span className="text-xs font-medium text-[#7D938A] ml-1">jiwa</span>
          </p>
        </Card>
        <Card className="p-4 border border-[#E3E8E4]">
          <p className="text-[10px] font-bold uppercase text-[#7D938A] tracking-wider">Rata-rata Skor Kelayakan</p>
          <p className="text-2xl font-extrabold text-[#16211D] mt-1">
            {isLoading ? '...' : data?.summary.rataSkorKelayakan ?? 0}
            <span className="text-xs font-medium text-[#7D938A] ml-1">/ 100</span>
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5 border border-[#E3E8E4] lg:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-[#0F9D6E]" />
            <h3 className="text-sm font-bold text-[#16211D]">Serapan Anggaran Program</h3>
          </div>
          <p className="text-3xl font-extrabold text-[#0F9D6E]">
            {isLoading ? '...' : `${data?.summary.serapanAnggaranPct ?? 0}%`}
          </p>
          <p className="text-xs text-[#7D938A] mt-1">
            {formatJT(data?.summary.terpakaiTotal)} dari {formatJT(data?.summary.paguTotal)}
          </p>
          <div className="w-full h-2 rounded-full bg-[#EBEFEB] mt-3 overflow-hidden">
            <div
              className="h-full bg-[#0F9D6E] rounded-full"
              style={{ width: `${data?.summary.serapanAnggaranPct ?? 0}%` }}
            />
          </div>
        </Card>

        <Card className="p-5 border border-[#E3E8E4] lg:col-span-2">
          <h3 className="text-sm font-bold text-[#16211D] mb-3">Capaian Penerima Manfaat</h3>
          <div className="flex items-end gap-6">
            <div>
              <p className="text-3xl font-extrabold text-[#16211D]">
                {isLoading ? '...' : `${data?.summary.capaianPenerimaPct ?? 0}%`}
              </p>
              <p className="text-xs text-[#7D938A]">
                {data?.summary.realisasiPenerima ?? 0} / {data?.summary.targetPenerima ?? 0} target penerima
              </p>
            </div>
            <Badge variant="emerald">On Track</Badge>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 border border-[#E3E8E4] space-y-4">
          <h3 className="text-sm font-bold text-[#16211D]">Alokasi Dana per Asnaf</h3>
          {(data?.alokasiAsnaf ?? []).map((row) => (
            <div key={row.nama}>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold">{row.nama}</span>
                <span className="font-mono font-bold text-[#0F9D6E]">{formatRP(row.nominal)}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#EBEFEB] overflow-hidden">
                <div
                  className="h-full bg-[#C8933A] rounded-full"
                  style={{ width: `${Math.round((row.nominal / maxAsnaf) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </Card>

        <Card className="p-6 border border-[#E3E8E4] space-y-3">
          <h3 className="text-sm font-bold text-[#16211D]">Realisasi Program ZIS</h3>
          {(data?.programRealisasi ?? []).map((prog) => (
            <div key={prog.id} className="p-3 bg-[#F4F6F4] rounded-xl border border-[#E3E8E4] text-xs">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-[#16211D]">{prog.nama}</p>
                  <p className="text-[10px] text-[#7D938A]">Pilar: {prog.pilar}</p>
                </div>
                <span className="font-bold text-[#0F9D6E]">{prog.serapanPct}%</span>
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-[#7D938A]">
                <span>{formatRP(prog.terpakai)} / {formatRP(prog.paguAnggaran)}</span>
                <span>{prog.realisasiPenerima}/{prog.targetPenerima} penerima ({prog.capaianPenerimaPct}%)</span>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
};
