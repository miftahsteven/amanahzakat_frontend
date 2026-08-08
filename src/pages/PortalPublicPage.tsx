import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Sparkles, FileText, CheckCircle2, ShieldCheck, HeartHandshake } from 'lucide-react';
import { toast } from 'sonner';

export const PortalPublicPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#0f9d6e]" /> Portal Mandiri Mustahik & Publik
          </h1>
          <p className="text-xs text-slate-500">Self-service portal untuk pengajuan bantuan online & lacak status verifikasi proposal</p>
        </div>
        <Button variant="primary" icon={<FileText className="w-4 h-4" />} onClick={() => toast.success('Formulir Pengajuan Baru Diberdayakan')}>
          Ajukan Proposal Bantuan Online
        </Button>
      </div>

      <Card className="p-6 bg-gradient-to-r from-[#04241a] to-[#0f9d6e] text-white space-y-3">
        <Badge variant="emerald" className="bg-white/20 text-white border-white/30">PORTAL SELF-SERVICE MUSTAHIK</Badge>
        <h2 className="text-xl font-bold">Lacak Status Pengajuan Bantuan ZIS Anda</h2>
        <p className="text-xs text-emerald-100 max-w-xl">
          Masukkan Nomor Tiket Registrasi / NIK KTP Anda untuk melihat perkembangan proses verifikasi berkas dan survei kelayakan lapangan.
        </p>

        <div className="flex gap-2 max-w-lg pt-2">
          <input
            type="text"
            placeholder="Masukkan Nomor Tiket (cth: PROP/2026/08/001) / NIK..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-white/30 bg-white/10 text-xs text-white placeholder-emerald-200 focus:outline-none focus:ring-2 focus:ring-white"
          />
          <Button variant="primary" className="bg-white text-[#04241a] hover:bg-emerald-50">
            Cek Status
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <Card className="p-5 space-y-2">
          <FileText className="w-6 h-6 text-[#0f9d6e]" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200">1. Ajukan Proposal</h3>
          <p className="text-slate-500">Unggah berkas KTP, KK, dan Surat Keterangan Tidak Mampu (SKTM) online.</p>
        </Card>
        <Card className="p-5 space-y-2">
          <ShieldCheck className="w-6 h-6 text-blue-600" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200">2. Verifikasi & Survei</h3>
          <p className="text-slate-500">Tim lapangan Amanah Zakat memvalidasi kondisi riil pemohon bantuan.</p>
        </Card>
        <Card className="p-5 space-y-2">
          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200">3. Pencairan Dana</h3>
          <p className="text-slate-500">Pencairan dana langsung ke rekening bank atau diserahkan secara tunai.</p>
        </Card>
      </div>
    </div>
  );
};
