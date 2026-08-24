import React, { useCallback, useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { DataTable } from '../components/shared/DataTable';
import {
  Sparkles,
  FileText,
  CheckCircle2,
  ShieldCheck,
  ExternalLink,
  RefreshCw,
  Search,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { formatRP } from '../lib/utils';
import { getWebPublicOrigin } from '../lib/media-url';
import { portalApi } from '../lib/api';
import { toast } from 'sonner';

export interface PortalPublicPageProps {
  onNavigate?: (screen: string) => void;
}

type PengajuanRow = {
  id: string;
  submissionNumber: string;
  nik: string;
  namaLengkap: string;
  programBantuanDimohon: string;
  estimasiBiayaDibutuhkan: number;
  status: string;
  kotaKabupaten?: string;
  provinsi?: string;
};

export const PortalPublicPage: React.FC<PortalPublicPageProps> = ({ onNavigate }) => {
  const [summary, setSummary] = useState<any>(null);
  const [pengajuanList, setPengajuanList] = useState<PengajuanRow[]>([]);
  const [trackQuery, setTrackQuery] = useState('');
  const [trackResult, setTrackResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTracking, setIsTracking] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [sum, list] = await Promise.all([portalApi.summary(), portalApi.listPengajuan(20)]);
      setSummary(sum);
      setPengajuanList(list);
    } catch (err: any) {
      toast.error(err.message || 'Gagal memuat data portal publik');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTrack = async () => {
    if (!trackQuery.trim()) {
      toast.error('Masukkan nomor tiket atau NIK');
      return;
    }
    setIsTracking(true);
    setTrackResult(null);
    try {
      const res = await portalApi.track(trackQuery.trim());
      setTrackResult(res);
    } catch (err: any) {
      toast.error(err.message || 'Pengajuan tidak ditemukan');
    } finally {
      setIsTracking(false);
    }
  };

  const columns: ColumnDef<PengajuanRow>[] = [
    {
      accessorKey: 'submissionNumber',
      header: 'No. Tiket',
      cell: ({ row }) => <span className="font-mono font-bold text-[#0F9D6E]">{row.getValue('submissionNumber')}</span>,
    },
    { accessorKey: 'namaLengkap', header: 'Nama Pemohon' },
    { accessorKey: 'programBantuanDimohon', header: 'Program' },
    {
      accessorKey: 'estimasiBiayaDibutuhkan',
      header: 'Estimasi',
      cell: ({ row }) => <span className="font-mono font-bold">{formatRP(row.getValue('estimasiBiayaDibutuhkan'))}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <Badge statusText={row.getValue('status')} />,
    },
    {
      id: 'lokasi',
      header: 'Lokasi',
      cell: ({ row }) => (
        <span className="text-xs text-[#7D938A]">
          {[row.original.kotaKabupaten, row.original.provinsi].filter(Boolean).join(', ')}
        </span>
      ),
    },
  ];

  const webUrl = getWebPublicOrigin();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#16211D] flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#0F9D6E]" /> Portal Informasi Publik
          </h1>
          <p className="text-xs text-[#7D938A] font-medium mt-0.5">
            Pantau pengajuan bantuan mustahik & informasi layanan publik {summary?.webSettings?.siteName ?? 'AmanahZakat'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon={<RefreshCw className="w-4 h-4" />} onClick={loadData} disabled={isLoading}>
            Refresh
          </Button>
          <Button
            variant="primary"
            icon={<ExternalLink className="w-4 h-4" />}
            onClick={() => window.open(webUrl, '_blank')}
          >
            Buka Web Publik
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border border-[#E3E8E4]">
          <p className="text-[10px] font-bold uppercase text-[#7D938A]">Total Pengajuan</p>
          <p className="text-2xl font-extrabold text-[#0F9D6E] mt-1">{isLoading ? '...' : summary?.totalPengajuan ?? 0}</p>
        </Card>
        <Card className="p-4 border border-[#E3E8E4]">
          <p className="text-[10px] font-bold uppercase text-[#7D938A]">Mustahik Terdaftar (Portal)</p>
          <p className="text-2xl font-extrabold text-[#16211D] mt-1">{isLoading ? '...' : summary?.mustahikTerdaftar ?? 0}</p>
        </Card>
        <Card className="p-4 border border-[#E3E8E4]">
          <p className="text-[10px] font-bold uppercase text-[#7D938A]">Status Aktif</p>
          <p className="text-sm font-bold text-[#16211D] mt-2 space-y-1">
            {(summary?.byStatus ?? []).slice(0, 3).map((s: any) => (
              <span key={s.status} className="block text-xs">
                {s.status}: <strong>{s.count}</strong>
              </span>
            ))}
          </p>
        </Card>
      </div>

      <Card className="p-6 bg-gradient-to-r from-[#04241a] to-[#0F9D6E] text-white space-y-3">
        <Badge variant="emerald" className="bg-white/20 text-white border-white/30">
          LACAK PENGAJUAN BANTUAN
        </Badge>
        <h2 className="text-xl font-bold">Cek Status Permohonan Mustahik</h2>
        <p className="text-xs text-emerald-100 max-w-xl">
          Masukkan nomor tiket (contoh: PB-2026-0715) atau NIK KTP pemohon.
        </p>
        <div className="flex gap-2 max-w-lg pt-2">
          <input
            type="text"
            value={trackQuery}
            onChange={(e) => setTrackQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
            placeholder="PB-2026-0715 atau NIK..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-white/30 bg-white/10 text-xs text-white placeholder-emerald-200 focus:outline-none focus:ring-2 focus:ring-white"
          />
          <Button
            variant="primary"
            className="bg-white text-[#04241a] hover:bg-emerald-50"
            onClick={handleTrack}
            disabled={isTracking}
          >
            {isTracking ? '...' : 'Cek Status'}
          </Button>
        </div>

        {trackResult && (
          <div className="mt-4 p-4 bg-white/10 rounded-xl border border-white/20 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="font-mono font-bold">{trackResult.submissionNumber}</span>
              <Badge statusText={trackResult.status} />
            </div>
            <p className="font-bold text-base">{trackResult.namaLengkap}</p>
            <p>{trackResult.programBantuanDimohon} · {formatRP(trackResult.estimasiBiayaDibutuhkan)}</p>
            {Array.isArray(trackResult.tahapanProses) && trackResult.tahapanProses.length > 0 && (
              <div className="pt-2 space-y-1 border-t border-white/20">
                {trackResult.tahapanProses.map((t: any, i: number) => (
                  <div key={i} className="flex justify-between">
                    <span>{t.tahap}</span>
                    <span className="text-emerald-200">{t.status}</span>
                  </div>
                ))}
              </div>
            )}
            {onNavigate && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2 text-white border-white/40"
                onClick={() => onNavigate('cms-assistance')}
              >
                Verifikasi di CMS
              </Button>
            )}
          </div>
        )}
      </Card>

      {summary?.webSettings && (
        <Card className="p-5 border border-[#E3E8E4] grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="flex items-center gap-2 text-[#7D938A]">
            <Phone className="w-4 h-4 text-[#0F9D6E]" />
            {summary.webSettings.contactPhone}
          </div>
          <div className="flex items-center gap-2 text-[#7D938A]">
            <Mail className="w-4 h-4 text-[#0F9D6E]" />
            {summary.webSettings.contactEmail}
          </div>
          <div className="flex items-center gap-2 text-[#7D938A]">
            <MapPin className="w-4 h-4 text-[#0F9D6E]" />
            {summary.webSettings.contactAddress}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <Card className="p-5 space-y-2 border border-[#E3E8E4]">
          <FileText className="w-6 h-6 text-[#0F9D6E]" />
          <h3 className="font-bold text-[#16211D]">1. Ajukan Proposal</h3>
          <p className="text-[#7D938A]">Mustahik mengajukan via web publik dengan KTP, KK, dan SKTM.</p>
        </Card>
        <Card className="p-5 space-y-2 border border-[#E3E8E4]">
          <ShieldCheck className="w-6 h-6 text-blue-600" />
          <h3 className="font-bold text-[#16211D]">2. Verifikasi & Survei</h3>
          <p className="text-[#7D938A]">Tim amil memvalidasi berkas dan survei lapangan.</p>
        </Card>
        <Card className="p-5 space-y-2 border border-[#E3E8E4]">
          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          <h3 className="font-bold text-[#16211D]">3. Pencairan Dana</h3>
          <p className="text-[#7D938A]">Penyaluran setelah approval dewan ZIS & direktur keuangan.</p>
        </Card>
      </div>

      <Card className="p-6 border border-[#E3E8E4]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[#16211D] flex items-center gap-2">
            <Search className="w-4 h-4" /> Daftar Pengajuan Bantuan Terbaru
          </h3>
          {onNavigate && (
            <Button variant="outline" size="sm" onClick={() => onNavigate('cms-assistance')}>
              Kelola Verifikasi
            </Button>
          )}
        </div>
        <DataTable columns={columns} data={pengajuanList} isLoading={isLoading} searchPlaceholder="Cari nama / no tiket..." />
      </Card>
    </div>
  );
};
