import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { formatRP } from '../lib/utils';
import { approvalApi } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { RefreshCw } from 'lucide-react';

interface ApprovalItem {
  id: string;
  ref: string;
  perihal: string;
  nominal: number;
  pengaju: string;
  tahap: number;
  tipe: string;
  status: string;
  penyaluranId: string | null;
  totalTahap: number;
  perluDireksi: boolean;
  tahapNama: string;
}

const TAHAP_NAMA = ['Maker', 'Checker', 'Approver'];

export interface ApprovalPageProps {
  canApprove?: boolean;
  canReject?: boolean;
  onOpenPenyaluran?: (id: string) => void;
}

export const ApprovalPage: React.FC<ApprovalPageProps> = ({
  canApprove = true,
  canReject = true,
  onOpenPenyaluran,
}) => {
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'Menunggu' | 'Semua'>('Menunggu');
  const [rejectTarget, setRejectTarget] = useState<ApprovalItem | null>(null);
  const [catatan, setCatatan] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      setApprovals(await approvalApi.list(filter));
    } catch (err: any) {
      toast.error(err.message || 'Gagal memuat approval');
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApprove = async (item: ApprovalItem) => {
    setBusyId(item.id);
    try {
      await approvalApi.approve(item.id);
      toast.success(`Tahap ${item.tahapNama} untuk ${item.ref} disetujui`);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyetujui');
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    setBusyId(rejectTarget.id);
    try {
      await approvalApi.reject(rejectTarget.id, catatan);
      toast.error(`Pengajuan ${rejectTarget.ref} ditolak`);
      setRejectTarget(null);
      setCatatan('');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menolak');
    } finally {
      setBusyId(null);
    }
  };

  const pendingCount = approvals.filter((a) => a.status === 'Menunggu').length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#16211D]">Approval Berjenjang</h1>
          <p className="text-sm text-[#7D938A] mt-1">
            Alur maker–checker–approver · {pendingCount} pengajuan menunggu
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(['Menunggu', 'Semua'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold ${
                filter === tab ? 'bg-[#0F9D6E] text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {tab}
            </button>
          ))}
          <Button variant="outline" icon={<RefreshCw className="w-4 h-4" />} onClick={loadData}>
            Refresh
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-[#7D938A] p-6">Memuat pengajuan approval...</p>
      ) : approvals.length === 0 ? (
        <div className="p-8 text-center text-[#7D938A] bg-white border border-[#E3E8E4] rounded-2xl">
          Tidak ada pengajuan {filter === 'Menunggu' ? 'menunggu approval' : 'pada filter ini'}.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {approvals.map((a) => {
            const selesai = a.status === 'Disetujui';
            const ditolak = a.status === 'Ditolak';
            const menunggu = a.status === 'Menunggu';

            return (
              <div key={a.id} className="bg-white border border-[#E3E8E4] rounded-2xl p-5 flex flex-col gap-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <button
                      type="button"
                      className="text-xs font-mono font-bold text-[#0F9D6E] hover:underline"
                      onClick={() => a.penyaluranId && onOpenPenyaluran?.(a.penyaluranId)}
                    >
                      {a.ref}
                    </button>
                    <div className="text-base font-bold text-[#16211D] mt-1">{a.perihal}</div>
                    <div className="text-xs text-[#7D938A] mt-1">Diajukan oleh {a.pengaju}</div>
                  </div>
                  <Badge statusText={selesai ? 'Disetujui' : ditolak ? 'Ditolak' : `Menunggu ${a.tahapNama}`} />
                </div>

                <div className="flex gap-1.5">
                  {TAHAP_NAMA.slice(0, a.totalTahap).map((nama, idx) => {
                    const step = idx + 1;
                    const done = selesai || a.tahap > step;
                    const current = menunggu && a.tahap === step;
                    return (
                      <div key={nama} className="flex-1">
                        <div
                          className={`h-1.5 rounded-full ${
                            done ? 'bg-[#0F9D6E]' : current ? 'bg-amber-400' : 'bg-[#E3E8E4]'
                          }`}
                        />
                        <p
                          className={`text-[10px] font-bold mt-1 ${
                            done || current ? 'text-[#16211D]' : 'text-[#7D938A]'
                          }`}
                        >
                          {nama}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-baseline justify-between px-3.5 py-3 bg-[#F6F8F7] rounded-xl">
                  <span className="font-mono text-lg font-bold">{formatRP(a.nominal)}</span>
                  <span className="text-[11px] text-[#7D938A]">
                    {a.perluDireksi ? 'Wajib approval direksi (> Rp 50 Jt)' : 'Cukup approval manajer'}
                  </span>
                </div>

                {menunggu && (
                  <div className="flex gap-2">
                    {canApprove && (
                      <button
                        type="button"
                        disabled={busyId === a.id}
                        onClick={() => handleApprove(a)}
                        className="flex-1 rounded-lg py-2.5 text-xs font-bold bg-[#0F9D6E] text-white hover:bg-[#0B7C56] disabled:opacity-60"
                      >
                        Setujui Tahap {a.tahapNama}
                      </button>
                    )}
                    {canReject && (
                      <button
                        type="button"
                        disabled={busyId === a.id}
                        onClick={() => {
                          setRejectTarget(a);
                          setCatatan('');
                        }}
                        className="bg-white text-rose-600 border border-rose-200 rounded-lg py-2.5 px-4 text-xs font-bold hover:bg-rose-50"
                      >
                        Tolak
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        title="Tolak pengajuan"
        subtitle={rejectTarget ? rejectTarget.ref : ''}
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <p className="text-[#7D938A]">Penyaluran terkait tidak dihapus — statusnya akan diubah menjadi Ditolak.</p>
          <textarea
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder="Alasan penolakan (opsional)"
            rows={3}
            className="w-full p-2.5 border border-slate-200 rounded-xl"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setRejectTarget(null)}>
              Batal
            </Button>
            <Button variant="primary" type="button" disabled={busyId === rejectTarget?.id} onClick={handleReject}>
              Konfirmasi Tolak
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
