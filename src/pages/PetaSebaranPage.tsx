import React, { useCallback, useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { MustahikSebaranMap } from '../components/maps/MustahikSebaranMap';
import { ExternalLink, MapPin, RefreshCw } from 'lucide-react';
import { formatRP } from '../lib/utils';
import { laporanApi } from '../lib/api';
import { resolveWilayahCoords } from '../lib/wilayahCoords';
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

  const wilayahMarkers = (data?.wilayah ?? []).map((w) => {
    const coords = resolveWilayahCoords({
      id: (w as { id?: string }).id,
      nama: w.nama,
      lat: (w as { lat?: number }).lat,
      lng: (w as { lng?: number }).lng,
    });
    return {
      nama: w.nama,
      lat: coords.lat,
      lng: coords.lng,
      jiwa: w.jiwa,
      nominal: w.nominal,
      program: w.program,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#16211D] dark:text-white flex items-center gap-2">
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
          <Button
            variant="outline"
            icon={<ExternalLink className="w-4 h-4" />}
            onClick={() => window.open('https://www.openstreetmap.org/#map=5/-2.5/118.0', '_blank')}
          >
            Buka Peta Penuh
          </Button>
        </div>
      </div>

      <Card className="p-4 sm:p-6 bg-[#0D1714] text-white relative overflow-hidden border-emerald-950 space-y-4">
        <div className="flex items-center justify-between z-10">
          <Badge variant="emerald">PETA GIS TERVERIFIKASI</Badge>
          <div className="text-xs text-emerald-400 font-mono font-bold">
            {isLoading ? 'Memuat...' : `${data?.totalMustahik ?? 0} Mustahik Terkoordinat`}
          </div>
        </div>

        <div className="relative rounded-2xl overflow-hidden border border-emerald-900/50 bg-[#04241a] min-h-[22rem] sm:min-h-[28rem]">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400 font-mono">
              Memuat tile peta OpenStreetMap...
            </div>
          ) : (
            <MustahikSebaranMap wilayah={wilayahMarkers} className="h-[22rem] sm:h-[28rem] w-full z-0" />
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <span>Sumber peta: OpenStreetMap</span>
          <span>Update Terakhir: {data?.lastUpdated ?? '-'}</span>
        </div>
      </Card>

      <Card className="p-6 space-y-4 border border-[#E3E8E4]">
        <h3 className="text-sm font-bold text-[#16211D] dark:text-white">Rekapitulasi Penyaluran per Wilayah</h3>
        {isLoading ? (
          <p className="text-xs text-[#7D938A]">Memuat data wilayah...</p>
        ) : (
          <div className="space-y-2 text-xs">
            {(data?.wilayah ?? []).map((prov) => (
              <div
                key={prov.nama}
                className="flex items-center justify-between p-3 bg-[#F4F6F4] dark:bg-slate-900 rounded-xl border border-[#E3E8E4] dark:border-slate-800"
              >
                <div>
                  <div className="font-bold text-[#16211D] dark:text-white">{prov.nama}</div>
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
