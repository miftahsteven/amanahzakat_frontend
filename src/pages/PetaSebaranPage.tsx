import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import {
  MustahikSebaranMap,
  type MapFocusTarget,
  type MustahikPoint,
} from '../components/maps/MustahikSebaranMap';
import { Maximize2, MapPin, RefreshCw, Users, Map } from 'lucide-react';
import { formatRP, cn } from '../lib/utils';
import { laporanApi } from '../lib/api';
import { detectWilayahIdFromNama, resolveWilayahCoords } from '../lib/wilayahCoords';
import { toast } from 'sonner';

function wilayahKey(id: string | undefined, nama: string) {
  return id ?? detectWilayahIdFromNama(nama);
}

interface WilayahRecapCardProps {
  nama: string;
  nominal: number;
  jiwa: number;
  program: string;
  active?: boolean;
  variant?: 'light' | 'dark';
  onClick: () => void;
}

function WilayahRecapCard({ nama, nominal, jiwa, program, active, variant = 'light', onClick }: WilayahRecapCardProps) {
  const label = nama.split('(')[0].trim();

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer',
        variant === 'dark'
          ? cn(
              'bg-[#0D1714]/80 border-emerald-900/60 hover:border-emerald-500 hover:bg-[#0D1714]',
              active && 'border-emerald-400 ring-1 ring-emerald-400/50 bg-emerald-950/40'
            )
          : cn(
              'bg-[#F4F6F4] dark:bg-slate-900 border-[#E3E8E4] dark:border-slate-800 hover:border-[#0F9D6E]',
              active && 'border-[#0F9D6E] ring-1 ring-[#0F9D6E]/30 bg-emerald-50 dark:bg-emerald-950/30'
            )
      )}
    >
      <div className={cn('font-bold', variant === 'dark' ? 'text-white' : 'text-[#16211D] dark:text-white')}>{label}</div>
      {variant === 'light' && (
        <div className="text-[10px] text-[#7D938A] mt-0.5">Program Utama: {program}</div>
      )}
      <div className="text-[#0F9D6E] font-extrabold mt-1">{formatRP(nominal)}</div>
      <div className={cn('mt-0.5', variant === 'dark' ? 'text-slate-400' : 'text-[10px] text-[#7D938A]')}>
        {jiwa} penerima{variant === 'light' ? ' manfaat' : ''}
        {variant === 'dark' ? ` · ${program}` : ''}
      </div>
      <div className={cn('text-[10px] mt-1', variant === 'dark' ? 'text-emerald-600' : 'text-[#0F9D6E]/70')}>
        Klik untuk fokus ke wilayah di peta
      </div>
    </button>
  );
}

interface MustahikRecapCardProps {
  point: MustahikPoint;
  active?: boolean;
  variant?: 'light' | 'dark';
  onClick: () => void;
}

function MustahikRecapCard({ point, active, variant = 'light', onClick }: MustahikRecapCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer',
        variant === 'dark'
          ? cn(
              'bg-[#0D1714]/80 border-sky-900/60 hover:border-sky-500 hover:bg-[#0D1714]',
              active && 'border-sky-400 ring-1 ring-sky-400/50 bg-sky-950/40'
            )
          : cn(
              'bg-[#F4F6F4] dark:bg-slate-900 border-[#E3E8E4] dark:border-slate-800 hover:border-sky-500',
              active && 'border-sky-500 ring-1 ring-sky-500/30 bg-sky-50 dark:bg-sky-950/30'
            )
      )}
    >
      <div className={cn('font-bold', variant === 'dark' ? 'text-white' : 'text-[#16211D] dark:text-white')}>
        {point.nama}
      </div>
      <div className={cn('text-[10px] mt-0.5', variant === 'dark' ? 'text-slate-400' : 'text-[#7D938A]')}>
        {point.asnaf} · {point.program}
      </div>
      {point.nominal ? (
        <div className="text-sky-600 font-extrabold mt-1">{formatRP(point.nominal)}</div>
      ) : null}
      <div className={cn('text-[10px] mt-1 truncate', variant === 'dark' ? 'text-sky-600' : 'text-sky-600/70')}>
        {point.alamat ?? 'Alamat belum lengkap'}
      </div>
      <div className={cn('text-[10px] mt-1', variant === 'dark' ? 'text-sky-500' : 'text-sky-600/70')}>
        Klik untuk fokus ke marker GPS
      </div>
    </button>
  );
}

export const PetaSebaranPage: React.FC = () => {
  const [data, setData] = useState<Awaited<ReturnType<typeof laporanApi.sebaran>> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'wilayah' | 'mustahik'>('wilayah');
  const [focusedKey, setFocusedKey] = useState<string | null>(null);

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

  useEffect(() => {
    if (!isFullscreenOpen) setFocusedKey(null);
  }, [isFullscreenOpen]);

  useEffect(() => {
    setFocusedKey(null);
  }, [viewMode]);

  const wilayahMarkers = useMemo(
    () =>
      (data?.wilayah ?? []).map((w) => {
        const id = (w as { id?: string }).id ?? detectWilayahIdFromNama(w.nama);
        const coords = resolveWilayahCoords({
          id,
          nama: w.nama,
          lat: (w as { lat?: number }).lat,
          lng: (w as { lng?: number }).lng,
        });
        return {
          id,
          nama: w.nama,
          lat: coords.lat,
          lng: coords.lng,
          jiwa: w.jiwa,
          nominal: w.nominal,
          program: w.program,
        };
      }),
    [data]
  );

  const mustahikPoints: MustahikPoint[] = useMemo(
    () =>
      (data?.mustahikPoints ?? []).map((m) => ({
        id: m.id,
        nama: m.nama,
        lat: m.lat,
        lng: m.lng,
        asnaf: m.asnaf,
        alamat: m.alamat,
        nominal: m.nominal,
        program: m.program,
      })),
    [data]
  );

  const markerKeyWilayah = useCallback((m: { id?: string; nama: string }) => wilayahKey(m.id, m.nama), []);

  const focusTarget: MapFocusTarget | null = useMemo(() => {
    if (!focusedKey) return null;
    if (viewMode === 'mustahik') {
      const m = mustahikPoints.find((p) => p.id === focusedKey);
      if (!m) return null;
      return { key: focusedKey, lat: m.lat, lng: m.lng };
    }
    const w = wilayahMarkers.find((m) => markerKeyWilayah(m) === focusedKey);
    if (!w) return null;
    return { key: focusedKey, lat: w.lat, lng: w.lng };
  }, [focusedKey, viewMode, mustahikPoints, wilayahMarkers, markerKeyWilayah]);

  const mapCount =
    viewMode === 'mustahik' ? mustahikPoints.length : `${wilayahMarkers.length} wilayah · ${data?.totalMustahik ?? 0} mustahik`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#16211D] dark:text-white flex items-center gap-2">
            <MapPin className="w-6 h-6 text-[#0F9D6E]" /> Peta Sebaran Mustahik
          </h1>
          <p className="text-xs text-[#7D938A] font-medium mt-0.5">
            Visualisasi geospasial distribusi penerima manfaat — agregat wilayah atau marker GPS per mustahik
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl border border-[#E3E8E4] dark:border-slate-800 overflow-hidden text-xs font-bold">
            <button
              type="button"
              onClick={() => setViewMode('wilayah')}
              className={cn(
                'px-3 py-2 flex items-center gap-1.5 transition-colors',
                viewMode === 'wilayah'
                  ? 'bg-[#0F9D6E] text-white'
                  : 'bg-white dark:bg-slate-900 text-[#7D938A] hover:bg-slate-50'
              )}
            >
              <Map className="w-3.5 h-3.5" /> Per Wilayah
            </button>
            <button
              type="button"
              onClick={() => setViewMode('mustahik')}
              className={cn(
                'px-3 py-2 flex items-center gap-1.5 transition-colors border-l border-[#E3E8E4] dark:border-slate-800',
                viewMode === 'mustahik'
                  ? 'bg-sky-600 text-white'
                  : 'bg-white dark:bg-slate-900 text-[#7D938A] hover:bg-slate-50'
              )}
            >
              <Users className="w-3.5 h-3.5" /> Per Mustahik (GPS)
            </button>
          </div>
          <Button variant="outline" icon={<RefreshCw className="w-4 h-4" />} onClick={loadData} disabled={isLoading}>
            Refresh
          </Button>
          <Button
            variant="outline"
            icon={<Maximize2 className="w-4 h-4" />}
            onClick={() => setIsFullscreenOpen(true)}
            disabled={isLoading || (viewMode === 'wilayah' ? wilayahMarkers.length === 0 : mustahikPoints.length === 0)}
          >
            Buka Peta Penuh
          </Button>
        </div>
      </div>

      <Card className="p-4 sm:p-6 bg-[#0D1714] text-white relative overflow-hidden border-emerald-950 space-y-4">
        <div className="flex items-center justify-between z-10">
          <Badge variant="emerald">
            {viewMode === 'mustahik' ? 'PETA GPS PER MUSTAHIK' : 'PETA GIS PER WILAYAH'}
          </Badge>
          <div className="text-xs text-emerald-400 font-mono font-bold">
            {isLoading ? 'Memuat...' : `${mapCount} Terkoordinat`}
          </div>
        </div>

        <div className="relative rounded-2xl overflow-hidden border border-emerald-900/50 bg-[#04241a] min-h-[22rem] sm:min-h-[28rem]">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400 font-mono">
              Memuat tile peta OpenStreetMap...
            </div>
          ) : (
            <MustahikSebaranMap
              viewMode={viewMode}
              wilayah={wilayahMarkers}
              mustahikPoints={mustahikPoints}
              focusTarget={focusTarget}
              className="h-[22rem] sm:h-[28rem] w-full z-0"
            />
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <span>
            Sumber peta: OpenStreetMap ·{' '}
            {viewMode === 'mustahik'
              ? 'Koordinat dari GPS/alamat mustahik — klik daftar untuk fokus'
              : 'Klik wilayah di bawah untuk fokus peta'}
          </span>
          <span>Update Terakhir: {data?.lastUpdated ?? '-'}</span>
        </div>
      </Card>

      <Card className="p-6 space-y-4 border border-[#E3E8E4]">
        <h3 className="text-sm font-bold text-[#16211D] dark:text-white">
          {viewMode === 'mustahik' ? 'Daftar Mustahik (GPS)' : 'Rekapitulasi Penyaluran per Wilayah'}
        </h3>
        {isLoading ? (
          <p className="text-xs text-[#7D938A]">Memuat data...</p>
        ) : viewMode === 'mustahik' ? (
          <div className="space-y-2 text-xs max-h-[28rem] overflow-y-auto">
            {mustahikPoints.length === 0 ? (
              <p className="text-[#7D938A]">Belum ada mustahik terverifikasi dengan koordinat.</p>
            ) : (
              mustahikPoints.map((p) => (
                <MustahikRecapCard
                  key={p.id}
                  point={p}
                  active={focusedKey === p.id}
                  onClick={() => setFocusedKey(p.id)}
                />
              ))
            )}
          </div>
        ) : (
          <div className="space-y-2 text-xs">
            {wilayahMarkers.map((w) => (
              <WilayahRecapCard
                key={w.id ?? w.nama}
                nama={w.nama}
                nominal={w.nominal}
                jiwa={w.jiwa}
                program={w.program}
                active={focusedKey === markerKeyWilayah(w)}
                onClick={() => setFocusedKey(markerKeyWilayah(w))}
              />
            ))}
          </div>
        )}
      </Card>

      <Modal
        isOpen={isFullscreenOpen}
        onClose={() => setIsFullscreenOpen(false)}
        fullscreen
        title="Peta Sebaran Mustahik — Tampilan Penuh"
        subtitle={
          isLoading
            ? 'Memuat data...'
            : viewMode === 'mustahik'
              ? `${mustahikPoints.length} mustahik · mode GPS · Update ${data?.lastUpdated ?? '-'}`
              : `${data?.totalMustahik ?? 0} mustahik terverifikasi · ${wilayahMarkers.length} wilayah · Update ${data?.lastUpdated ?? '-'}`
        }
      >
        <div className="flex flex-col lg:flex-row h-full min-h-0">
          <div className="flex-1 min-h-[50vh] lg:min-h-0 relative border-b lg:border-b-0 lg:border-r border-emerald-950">
            <MustahikSebaranMap
              key={isFullscreenOpen ? `fullscreen-map-${viewMode}` : 'hidden'}
              viewMode={viewMode}
              wilayah={wilayahMarkers}
              mustahikPoints={mustahikPoints}
              resizeKey={isFullscreenOpen}
              focusTarget={focusTarget}
              className="h-full min-h-[50vh] lg:min-h-0 w-full"
            />
          </div>
          <aside className="w-full lg:w-80 shrink-0 overflow-y-auto bg-[#04241a] p-4 space-y-3 max-h-[40vh] lg:max-h-none">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              {viewMode === 'mustahik' ? 'Daftar Mustahik GPS' : 'Rekapitulasi Wilayah'}
            </p>
            {viewMode === 'mustahik'
              ? mustahikPoints.map((p) => (
                  <MustahikRecapCard
                    key={p.id}
                    point={p}
                    variant="dark"
                    active={focusedKey === p.id}
                    onClick={() => setFocusedKey(p.id)}
                  />
                ))
              : wilayahMarkers.map((w) => (
                  <WilayahRecapCard
                    key={w.id ?? w.nama}
                    nama={w.nama}
                    nominal={w.nominal}
                    jiwa={w.jiwa}
                    program={w.program}
                    variant="dark"
                    active={focusedKey === markerKeyWilayah(w)}
                    onClick={() => setFocusedKey(markerKeyWilayah(w))}
                  />
                ))}
            <p className="text-[10px] text-slate-500 pt-1">Tekan Esc untuk menutup</p>
          </aside>
        </div>
      </Modal>
    </div>
  );
};
