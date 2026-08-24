import React, { useCallback, useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Building2, RefreshCw, Wallet } from 'lucide-react';
import { formatRP } from '../lib/utils';
import { upzApi } from '../lib/api';
import { toast } from 'sonner';

export const PortalUpzPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      setData(await upzApi.portalSummary());
    } catch (err: any) {
      toast.error(err.message || 'Gagal memuat portal UPZ');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#16211D] flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#0F9D6E]" /> Portal UPZ Self-Service Korporat
          </h1>
          <p className="text-xs text-[#7D938A]">Dashboard mitra UPZ perusahaan — payroll zakat karyawan & penghimpunan</p>
        </div>
        <Button variant="outline" icon={<RefreshCw className="w-4 h-4" />} onClick={loadData} disabled={isLoading}>Refresh</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border border-[#E3E8E4]">
          <p className="text-[10px] font-bold uppercase text-[#7D938A]">UPZ Korporat</p>
          <p className="text-2xl font-extrabold text-[#0F9D6E] mt-1">{isLoading ? '...' : data?.summary.jumlahUpzKorporat ?? 0}</p>
        </Card>
        <Card className="p-4 border border-[#E3E8E4]">
          <p className="text-[10px] font-bold uppercase text-[#7D938A]">Muzakki UPZ</p>
          <p className="text-2xl font-extrabold text-[#16211D] mt-1">{isLoading ? '...' : data?.summary.jumlahMuzakkiUpz ?? 0}</p>
        </Card>
        <Card className="p-4 border border-[#E3E8E4]">
          <p className="text-[10px] font-bold uppercase text-[#7D938A]">Payroll Terverifikasi</p>
          <p className="text-lg font-extrabold text-[#C8933A] mt-1">{isLoading ? '...' : formatRP(data?.summary.totalPayrollTerverifikasi ?? 0)}</p>
        </Card>
        <Card className="p-4 border border-[#E3E8E4]">
          <p className="text-[10px] font-bold uppercase text-[#7D938A]">Transaksi Payroll</p>
          <p className="text-2xl font-extrabold text-[#16211D] mt-1">{isLoading ? '...' : data?.summary.transaksiPayroll ?? 0}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 border border-[#E3E8E4] space-y-3">
          <h3 className="text-sm font-bold text-[#16211D]">UPZ Korporat Terdaftar</h3>
          {(data?.upzKorporat ?? []).map((u: any) => (
            <div key={u.id} className="flex justify-between p-3 bg-[#F4F6F4] rounded-xl text-xs border border-[#E3E8E4]">
              <div>
                <p className="font-bold">{u.nama}</p>
                <p className="text-[#7D938A]">{u.kodeUpz} · {u.kategori}</p>
              </div>
              <Badge statusText={u.statusKepatuhan} />
            </div>
          ))}
        </Card>

        <Card className="p-6 border border-[#E3E8E4] space-y-3">
          <h3 className="text-sm font-bold text-[#16211D] flex items-center gap-2"><Wallet className="w-4 h-4" /> Setoran Payroll UPZ Terbaru</h3>
          {(data?.recentPayroll ?? []).slice(0, 8).map((p: any, i: number) => (
            <div key={i} className="flex justify-between text-xs py-2 border-b border-[#E3E8E4] last:border-0">
              <div>
                <p className="font-bold text-[#16211D]">{p.muzakki}</p>
                <p className="text-[#7D938A]">{p.tanggal} · {p.jenisZis}</p>
              </div>
              <span className="font-mono font-bold text-[#0F9D6E]">{formatRP(p.nominal)}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
};
