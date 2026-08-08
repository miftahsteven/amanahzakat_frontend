import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { MapPin, Users, HeartHandshake, ExternalLink, ShieldCheck } from 'lucide-react';
import { formatRP } from '../lib/utils';
import { toast } from 'sonner';

export const PetaSebaranPage: React.FC = () => {
  const PROVINSI_DATA = [
    { nama: 'Jawa Barat (Bandung, Bekasi, Bogor)', jiwa: 620, nominal: 1850000000, program: 'Beasiswa & Sembako' },
    { nama: 'DKI Jakarta (Jaksel, Jaktim, Jakpus)', jiwa: 480, nominal: 1420000000, program: 'Modal UMKM & Medis' },
    { nama: 'Banten (Tangerang, Serang, Lebak)', jiwa: 220, nominal: 680000000, program: 'Sumur Bersih & Da\'i' },
    { nama: 'Nusa Tenggara Barat (Lombok, Sumbawa)', jiwa: 162, nominal: 520000000, program: 'Tanggap Bencana' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-[#0f9d6e]" /> Peta Sebaran Penerima Manfaat (Spatial GIS)
          </h1>
          <p className="text-xs text-slate-500">Visualisasi geospasial distribusi penyaluran zakat per wilayah di Indonesia</p>
        </div>
        <Button variant="outline" icon={<ExternalLink className="w-4 h-4" />} onClick={() => toast.info('Membuka Peta Fullscreen')}>
          Buka Peta Penuh
        </Button>
      </div>

      {/* Simulated Interactive Map Box */}
      <Card className="p-6 bg-[#0d1714] text-white relative overflow-hidden min-h-80 flex flex-col justify-between border-emerald-950">
        <div className="flex items-center justify-between z-10">
          <Badge variant="emerald">PETA GIS TERVERIFIKASI</Badge>
          <div className="text-xs text-emerald-400 font-mono font-bold">1,482 Mustahik Terkoordinat</div>
        </div>

        {/* Map Dots Overlay Representation */}
        <div className="my-8 relative h-48 border border-emerald-900/50 rounded-2xl bg-[#04241a] flex items-center justify-center p-4">
          <div className="absolute top-1/4 left-1/3 p-2 bg-emerald-500/20 rounded-full border border-emerald-400 text-emerald-300 text-xs font-bold animate-pulse">
            📍 Jawa Barat (620 Jiwa)
          </div>
          <div className="absolute top-1/3 left-1/4 p-2 bg-blue-500/20 rounded-full border border-blue-400 text-blue-300 text-xs font-bold">
            📍 DKI Jakarta (480 Jiwa)
          </div>
          <div className="absolute bottom-1/4 left-1/5 p-2 bg-amber-500/20 rounded-full border border-amber-400 text-amber-300 text-xs font-bold">
            📍 Banten (220 Jiwa)
          </div>
          <div className="absolute bottom-1/3 right-1/4 p-2 bg-purple-500/20 rounded-full border border-purple-400 text-purple-300 text-xs font-bold">
            📍 NTB (162 Jiwa)
          </div>
          <p className="text-xs text-slate-500 font-mono">Peta Spatial Sebaran Mustahik Indonesia</p>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Skala: 1 : 2.500.000</span>
          <span>Update Terakhir: 08 Agustus 2026</span>
        </div>
      </Card>

      {/* Table Data Per Region */}
      <Card className="p-6 space-y-4">
        <CardTitle>Rekapitulasi Penyaluran per Wilayah</CardTitle>
        <div className="space-y-2 text-xs">
          {PROVINSI_DATA.map((prov, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
              <div>
                <div className="font-bold text-slate-800 dark:text-slate-200">{prov.nama}</div>
                <div className="text-[10px] text-slate-400">Program Utama: {prov.program}</div>
              </div>
              <div className="text-right">
                <div className="font-extrabold text-[#0f9d6e]">{formatRP(prov.nominal)}</div>
                <div className="text-[10px] text-slate-500">{prov.jiwa} Penerima Manfaat</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
