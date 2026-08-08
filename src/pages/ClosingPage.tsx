import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Lock, Unlock, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export const ClosingPage: React.FC = () => {
  const [isLocked, setIsLocked] = useState(false);
  const [steps, setSteps] = useState([
    { id: 'rekon', title: 'Rekonsiliasi Bank Selesai', desc: 'Seluruh mutasi rekening penampung BSI tercocokkan dengan penerimaan tercatat.', done: true },
    { id: 'jurnal', title: 'Jurnal Penyesuaian Diposting', desc: 'Amortisasi hak amil (12.5%), akrual biaya program, dan koreksi selisih dibukukan.', done: true },
    { id: 'saldo', title: 'Saldo Dana per Asnaf Dikunci', desc: 'Sisa dana zakat, infak, dan wakaf dipindahkan ke saldo awal periode berikutnya.', done: true },
    { id: 'laporan', title: 'Laporan Keuangan Disetujui', desc: 'Laporan sumber dan penggunaan dana PSAK 109 ditandatangani manajemen.', done: true },
  ]);

  const toggleLock = () => {
    setIsLocked(!isLocked);
    toast.success(!isLocked ? 'Periode Juli 2026 BERHASIL DIKUNCI! Transaksi periode ini terkunci.' : 'Periode Juli 2026 DIHUBUNGKAN KEMBALI (Unlocked)!');
  };

  const toggleStep = (id: string) => {
    setSteps(steps.map((s) => (s.id === id ? { ...s, done: !s.done } : s)));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Lock className="w-6 h-6 text-[#0f9d6e]" /> Tutup Buku Periode (Period Lock)
          </h1>
          <p className="text-xs text-slate-500">Prosedur penguncian saldo & jurnal transaksi bulanan untuk pencegahan manipulasi data</p>
        </div>
        <Badge statusText={isLocked ? 'Terkunci' : 'Terbuka'} />
      </div>

      {/* Lock Banner */}
      <Card className="p-6 bg-gradient-to-r from-slate-900 to-[#04241a] text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-emerald-400">Periode Pelaporan: Juli 2026</span>
              <Badge variant="emerald">{isLocked ? 'STATUS: TERKUNCI' : 'STATUS: TERBUKA'}</Badge>
            </div>
            <p className="text-xs text-slate-300">
              {isLocked
                ? 'Ditutup oleh Super Admin pada 31 Juli 2026. Transaksi, penyaluran, dan jurnal periode ini telah dikunci permanen.'
                : 'Periode masih terbuka. Selesaikan empat langkah pra-tutup di bawah sebelum mengunci buku.'}
            </p>
          </div>
          <Button
            variant={isLocked ? 'outline' : 'primary'}
            icon={isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            onClick={toggleLock}
            className={isLocked ? 'text-white border-white hover:bg-white/10' : ''}
          >
            {isLocked ? 'Buka Kunci Periode' : 'Kunci Buku Juli 2026'}
          </Button>
        </div>
      </Card>

      {/* 4 Steps Checklist */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">4 Langkah Pra-Tutup Buku</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {steps.map((step, idx) => (
            <Card key={step.id} className="p-5 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-extrabold text-xs shrink-0 ${
                    step.done ? 'bg-[#0f9d6e] text-white' : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {step.done ? '✓' : idx + 1}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">{step.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{step.desc}</p>
                </div>
              </div>
              <Button
                variant={step.done ? 'outline' : 'primary'}
                size="sm"
                onClick={() => toggleStep(step.id)}
                disabled={isLocked}
              >
                {step.done ? 'Selesai' : 'Tandai Selesai'}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
