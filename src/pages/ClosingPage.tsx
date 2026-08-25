import React, { useCallback, useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Lock, Unlock, RefreshCw } from 'lucide-react';
import { keuanganApi } from '../lib/api';
import { toast } from 'sonner';

const STEPS = [
  { id: 'rekon', title: 'Rekonsiliasi Bank Selesai', desc: 'Seluruh mutasi rekening penampung BSI tercocokkan dengan penerimaan tercatat.' },
  { id: 'jurnal', title: 'Jurnal Penyesuaian Diposting', desc: 'Amortisasi hak amil (12.5%), akrual biaya program, dan koreksi selisih dibukukan.' },
  { id: 'saldo', title: 'Saldo Dana per Asnaf Dikunci', desc: 'Sisa dana zakat, infak, dan wakaf dipindahkan ke saldo awal periode berikutnya.' },
  { id: 'laporan', title: 'Laporan Keuangan Disetujui', desc: 'Laporan sumber dan penggunaan dana PSAK 109 ditandatangani manajemen.' },
] as const;

export interface ClosingPageProps {
  canExecute?: boolean;
}

export const ClosingPage: React.FC<ClosingPageProps> = ({ canExecute = false }) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      setData(await keuanganApi.getClosing());
    } catch (err: any) {
      toast.error(err.message || 'Gagal memuat status closing');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleStep = async (stepId: string) => {
    if (!data) return;
    const field = `step${stepId.charAt(0).toUpperCase()}${stepId.slice(1)}` as keyof typeof data;
    const current = !!data[field];
    try {
      const updated = await keuanganApi.updateClosingStep(data.periode, stepId, !current);
      setData(updated);
    } catch (err: any) {
      toast.error(err.message || 'Gagal memperbarui langkah');
    }
  };

  const toggleLock = async () => {
    if (!data) return;
    try {
      const updated = await keuanganApi.toggleClosingLock(data.periode, !data.isLocked);
      setData(updated);
      toast.success(updated.isLocked ? `Periode ${data.label} berhasil dikunci.` : `Periode ${data.label} dibuka kembali.`);
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengubah status kunci');
    }
  };

  const isLocked = data?.isLocked ?? false;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#16211D] flex items-center gap-2">
            <Lock className="w-6 h-6 text-[#0F9D6E]" /> Tutup Buku Periode (Period Lock)
          </h1>
          <p className="text-xs text-[#7D938A]">Prosedur penguncian saldo & jurnal transaksi bulanan</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon={<RefreshCw className="w-4 h-4" />} onClick={loadData} disabled={isLoading}>Refresh</Button>
          <Badge statusText={isLocked ? 'Terkunci' : 'Terbuka'} />
        </div>
      </div>

      <Card className="p-6 bg-gradient-to-r from-slate-900 to-[#04241a] text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-emerald-400">
                Periode Pelaporan: {isLoading ? '...' : data?.label}
              </span>
              <Badge variant="emerald">{isLocked ? 'STATUS: TERKUNCI' : 'STATUS: TERBUKA'}</Badge>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {isLocked
                ? `Ditutup pada ${data?.lockedAt ?? '-'}. Transaksi periode ini terkunci.`
                : 'Selesaikan empat langkah pra-tutup sebelum mengunci buku.'}
            </p>
          </div>
          {canExecute && (
            <Button
              variant={isLocked ? 'outline' : 'primary'}
              icon={isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              onClick={toggleLock}
              disabled={isLoading}
              className={isLocked ? 'text-white border-white hover:bg-white/10' : ''}
            >
              {isLocked ? 'Buka Kunci Periode' : `Kunci Buku ${data?.label ?? ''}`}
            </Button>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {STEPS.map((step, idx) => {
          const field = `step${step.id.charAt(0).toUpperCase()}${step.id.slice(1)}` as keyof typeof data;
          const done = !!data?.[field];
          return (
            <Card key={step.id} className="p-5 flex items-start justify-between gap-4 border border-[#E3E8E4]">
              <div className="flex items-start gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-extrabold text-xs ${done ? 'bg-[#0F9D6E] text-white' : 'bg-[#EBEFEB] text-[#7D938A]'}`}>
                  {done ? '✓' : idx + 1}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#16211D]">{step.title}</h3>
                  <p className="text-xs text-[#7D938A] mt-1">{step.desc}</p>
                </div>
              </div>
              {canExecute && (
                <Button variant={done ? 'outline' : 'primary'} size="sm" onClick={() => toggleStep(step.id)} disabled={isLocked || isLoading}>
                  {done ? 'Selesai' : 'Tandai Selesai'}
                </Button>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};
