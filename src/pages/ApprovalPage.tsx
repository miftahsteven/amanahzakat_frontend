import React, { useState } from 'react';
import { toast } from 'sonner';
import { formatRP } from '../lib/utils';

export interface ApprovalItem {
  id: number;
  ref: string;
  perihal: string;
  nominal: number;
  pengaju: string;
  tahap: number;
}

const INITIAL_APPROVALS: ApprovalItem[] = [
  { id: 1, ref: 'PYL-260726-021', perihal: 'Penyaluran Qurban Tahap 4', nominal: 185000000, pengaju: 'Dewi Anggraini', tahap: 1 },
  { id: 2, ref: 'PYL-260726-020', perihal: 'Bantuan Pangan Keluarga — Cakung', nominal: 42000000, pengaju: 'Rizal Fahmi', tahap: 2 },
  { id: 3, ref: 'AML-2026-0042', perihal: 'Operasional Amil Agustus', nominal: 18500000, pengaju: 'Siti Cholifah', tahap: 1 },
  { id: 4, ref: 'PYL-250726-019', perihal: 'Wakaf Sumur Sumba Timur', nominal: 96000000, pengaju: 'Yohana Tamu', tahap: 3 },
];

export const ApprovalPage: React.FC = () => {
  const [approvals, setApprovals] = useState<ApprovalItem[]>(INITIAL_APPROVALS);

  const tahapNama = ['Maker', 'Checker', 'Approver'];

  const handleApprove = (item: ApprovalItem) => {
    const perluDireksi = item.nominal >= 50000000;
    const total = perluDireksi ? 3 : 2;
    const currentTahapNama = tahapNama[Math.min(item.tahap - 1, total - 1)];

    setApprovals((prev) =>
      prev.map((x) => (x.id === item.id ? { ...x, tahap: x.tahap + 1 } : x))
    );
    toast.success(`${currentTahapNama} menyetujui pengajuan ${item.ref}`);
  };

  const handleReject = (item: ApprovalItem) => {
    setApprovals((prev) => prev.filter((x) => x.id !== item.id));
    toast.error(`Pengajuan ${item.ref} (${item.perihal}) ditolak`);
  };

  const pendingCount = approvals.filter((a) => {
    const perluDireksi = a.nominal >= 50000000;
    const total = perluDireksi ? 3 : 2;
    return a.tahap <= total;
  }).length;

  return (
    <div className="space-y-5 font-sans">
      <div>
        <h1 className="text-[25px] font-extrabold text-[#16211D] tracking-tight">
          Approval Berjenjang
        </h1>
        <p className="text-[13.5px] text-[#6B7A74] mt-1">
          Alur maker–checker–approver · {pendingCount} pengajuan menunggu tindakan
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {approvals.map((a) => {
          const perluDireksi = a.nominal >= 50000000;
          const total = perluDireksi ? 3 : 2;
          const selesai = a.tahap > total;
          const currentTahapIndex = Math.min(a.tahap - 1, total - 1);
          const currentTahapNama = tahapNama[currentTahapIndex];

          return (
            <div
              key={a.id}
              className="bg-white border border-[#E5EAE6] rounded-[14px] p-5 flex flex-col gap-3.5 shadow-xs"
            >
              {/* Header card */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-mono font-bold text-[#0F9D6E]">{a.ref}</div>
                  <div className="text-[15.5px] font-bold text-[#16211D] mt-1">{a.perihal}</div>
                  <div className="text-xs text-[#7C8B84] mt-1">Diajukan oleh {a.pengaju}</div>
                </div>
                <span
                  className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${
                    selesai ? 'bg-[#E6F6EF] text-[#0B7C56]' : 'bg-[#FDF3E0] text-[#A06A12]'
                  }`}
                >
                  {selesai ? 'Disetujui penuh' : `Menunggu ${currentTahapNama}`}
                </span>
              </div>

              {/* Nominal bar */}
              <div className="flex items-baseline justify-between gap-3 px-3.5 py-3 bg-[#F6F8F7] rounded-[10px]">
                <span className="font-mono text-[19px] font-bold text-[#16211D]">
                  {formatRP(a.nominal)}
                </span>
                <span className="text-[11.5px] text-[#7C8B84] text-right">
                  {perluDireksi
                    ? 'Wajib approval direksi (> Rp 50 Jt)'
                    : 'Cukup approval manajer (≤ Rp 50 Jt)'}
                </span>
              </div>

              {/* Steps row */}
              <div className="flex gap-2.5">
                {tahapNama.slice(0, total).map((nm, i) => {
                  const isDone = a.tahap > i + 1;
                  const isCurrent = a.tahap === i + 1;

                  let bgBorder = 'bg-[#F6F8F7] border-[#EEF1EE] text-[#8B9992]';
                  let statusColor = 'text-[#8B9992]';
                  let statusText = 'Menunggu';

                  if (isDone) {
                    bgBorder = 'bg-[#EEF7F3] border-[#BFE4D4] text-[#0B7C56]';
                    statusColor = 'text-[#0B7C56]';
                    statusText = 'Selesai';
                  } else if (isCurrent) {
                    bgBorder = 'bg-[#FDF8EC] border-[#EFDCB4] text-[#A06A12]';
                    statusColor = 'text-[#A06A12]';
                    statusText = 'Sedang diproses';
                  }

                  return (
                    <div
                      key={nm}
                      className={`flex-1 flex flex-col gap-1 p-2.5 rounded-[10px] border ${bgBorder}`}
                    >
                      <span className="text-[12.5px] font-bold text-[#16211D]">{nm}</span>
                      <span className={`text-[11px] font-bold ${statusColor}`}>{statusText}</span>
                    </div>
                  );
                })}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  disabled={selesai}
                  onClick={() => handleApprove(a)}
                  className={`flex-1 rounded-[9px] py-2.5 px-3.5 text-[12.5px] font-bold transition-colors cursor-pointer ${
                    selesai
                      ? 'bg-[#F1F4F1] text-[#7C8B84] border border-[#E6EBE7] cursor-default'
                      : 'bg-[#0F9D6E] hover:bg-[#0B7C56] text-white border-0'
                  }`}
                >
                  {selesai ? 'Selesai' : `Setujui Tahap ${currentTahapNama}`}
                </button>
                <button
                  type="button"
                  onClick={() => handleReject(a)}
                  className="bg-white hover:bg-rose-50 text-[#B5342B] border border-[#F0D5D2] rounded-[9px] py-2.5 px-4 text-[12.5px] font-bold whitespace-nowrap transition-colors cursor-pointer"
                >
                  Tolak
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
