import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { formatRP } from '../lib/utils';
import { approvalApi } from '../lib/api';
import { Button } from '../components/ui/Button';
import { RefreshCw } from 'lucide-react';

interface ApprovalItem {
  id: string;
  ref: string;
  perihal: string;
  nominal: number;
  pengaju: string;
  tahap: number;
  tipe: string;
}

const tahapNama = ['Maker', 'Checker', 'Approver'];

export const ApprovalPage: React.FC = () => {
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      setApprovals(await approvalApi.list());
    } catch (err: any) {
      toast.error(err.message || 'Gagal memuat approval');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApprove = async (item: ApprovalItem) => {
    try {
      await approvalApi.approve(item.id);
      toast.success(`Tahap approval ${item.ref} diproses`);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyetujui');
    }
  };

  const handleReject = async (item: ApprovalItem) => {
    try {
      await approvalApi.reject(item.id);
      toast.error(`Pengajuan ${item.ref} ditolak`);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menolak');
    }
  };

  const pendingCount = approvals.length;

  if (isLoading) {
    return <p className="text-sm text-[#7D938A] p-6">Memuat pengajuan approval...</p>;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#16211D]">Approval Berjenjang</h1>
          <p className="text-sm text-[#7D938A] mt-1">Alur maker–checker–approver · {pendingCount} pengajuan menunggu</p>
        </div>
        <Button variant="outline" icon={<RefreshCw className="w-4 h-4" />} onClick={loadData}>Refresh</Button>
      </div>

      {approvals.length === 0 ? (
        <div className="p-8 text-center text-[#7D938A] bg-white border border-[#E3E8E4] rounded-2xl">Tidak ada pengajuan menunggu approval.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {approvals.map((a) => {
            const perluDireksi = a.nominal >= 50000000;
            const total = perluDireksi ? 3 : 2;
            const selesai = a.tahap > total;
            const currentTahapIndex = Math.min(a.tahap - 1, total - 1);
            const currentTahapNama = tahapNama[currentTahapIndex];

            return (
              <div key={a.id} className="bg-white border border-[#E3E8E4] rounded-2xl p-5 flex flex-col gap-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-mono font-bold text-[#0F9D6E]">{a.ref}</div>
                    <div className="text-base font-bold text-[#16211D] mt-1">{a.perihal}</div>
                    <div className="text-xs text-[#7D938A] mt-1">Diajukan oleh {a.pengaju}</div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${selesai ? 'bg-[#E6F6EF] text-[#0B7C56]' : 'bg-[#FDF3E0] text-[#A06A12]'}`}>
                    {selesai ? 'Disetujui penuh' : `Menunggu ${currentTahapNama}`}
                  </span>
                </div>
                <div className="flex items-baseline justify-between px-3.5 py-3 bg-[#F6F8F7] rounded-xl">
                  <span className="font-mono text-lg font-bold">{formatRP(a.nominal)}</span>
                  <span className="text-[11px] text-[#7D938A]">{perluDireksi ? 'Wajib approval direksi (> Rp 50 Jt)' : 'Cukup approval manajer'}</span>
                </div>
                <div className="flex gap-2">
                  <button type="button" disabled={selesai} onClick={() => handleApprove(a)} className={`flex-1 rounded-lg py-2.5 text-xs font-bold ${selesai ? 'bg-[#F1F4F1] text-[#7C8B84]' : 'bg-[#0F9D6E] text-white hover:bg-[#0B7C56] cursor-pointer'}`}>
                    {selesai ? 'Selesai' : `Setujui Tahap ${currentTahapNama}`}
                  </button>
                  <button type="button" onClick={() => handleReject(a)} className="bg-white text-rose-600 border border-rose-200 rounded-lg py-2.5 px-4 text-xs font-bold hover:bg-rose-50 cursor-pointer">Tolak</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
