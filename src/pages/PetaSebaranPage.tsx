import React, { useCallback, useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ExternalLink, MapPin, RefreshCw } from 'lucide-react';
import { formatRP } from '../lib/utils';
import { laporanApi } from '../lib/api';
import { toast } from 'sonner';

export const PetaSebaranPage: React.FC = () => {
  const [data, setData] = useState<Awaited<ReturnType<typeof laporanApi.sebaran>> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await laporanApi.sebaran();
      setData(res);
    } catch (err: any) {
      toast.error(err.message || 'Gagal memuat peta sebaran');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#16211D] flex items-center gap-2">
            <MapPin className="w-6 h-6 text-[#0F9D6E]" /> Peta Sebaran Mustahik
          </h1>
          <p className="text-xs text-[#7D938A] font-medium mt-0.5">
            Visualisasi geospasial distribusi penerima manfaat berdasarkan data mustahik terverifikasi
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" icon={<RefreshCw className="w-4 h-4" />} onClick={loadData} disabled={isLoading}>
            Refresh
          </Button>
          <Button variant="outline" icon={<ExternalLink className="w-4 h-4" />} onClick={() => toast.info('Peta fullscreen segera hadir')}>
            Buka Peta Penuh
          </Button>
        </div>
      </div>

      <Card className="p-6 bg-[#0D1714] text-white relative overflow-hidden min-h-80 flex flex-col justify-between border-emerald-950">
        <div className="flex items-center justify-between z-10">
          <Badge variant="emerald">PETA GIS TERVERIFIKASI</Badge>
          <div className="text-xs text-emerald-400 font-mono font-bold">
            {isLoading ? 'Memuat...' : `${data?.totalMustahik ?? 0} Mustahik Terkoordinat`}
          </div>
        </div>

        <div className="my-8 relative h-48 border border-emerald-900/50 rounded-2xl bg-[#04241a] flex items-center justify-center p-4">
          {(data?.wilayah ?? []).map((prov) => (
            <div
              key={prov.nama}
              className="absolute p-2 bg-emerald-500/20 rounded-full border border-emerald-400 text-emerald-300 text-xs font-bold"
              style={{ top: prov.mapTop, left: prov.mapLeft }}
            >
              📍 {prov.nama.split('(')[0].trim()} ({prov.jiwa} Jiwa)
            </div>
          ))}
          <p className="text-xs text-slate-500 font-mono">Peta Spatial Sebaran Mustahik Indonesia</p>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Skala: 1 : 2.500.000</span>
          <span>Update Terakhir: {data?.lastUpdated ?? '-'}</span>
        </div>
      </Card>

      <Card className="p-6 space-y-4 border border-[#E3E8E4]">
        <h3 className="text-sm font-bold text-[#16211D]">Rekapitulasi Penyaluran per Wilayah</h3>
        {isLoading ? (
          <p className="text-xs text-[#7D938A]">Memuat data wilayah...</p>
        ) : (
          <div className="space-y-2 text-xs">
            {(data?.wilayah ?? []).map((prov) => (
              <div
                key={prov.nama}
                className="flex items-center justify-between p-3 bg-[#F4F6F4] rounded-xl border border-[#E3E8E4]"
              >
                <div>
                  <div className="font-bold text-[#16211D]">{prov.nama}</div>
                  <div className="text-[10px] text-[#7D938A]">Program Utama: {prov.program}</div>
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-[#0F9D6E]">{formatRP(prov.nominal)}</div>
                  <div className="text-[10px] text-[#7D938A]">{prov.jiwa} Penerima Manfaat</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
