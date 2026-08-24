import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { RecordDetailShell } from '../../components/layout/RecordDetailShell';
import { DetailFields } from '../../components/ui/DetailFields';
import { Badge } from '../../components/ui/Badge';
import { formatRP } from '../../lib/utils';
import { penyaluranApi } from '../../lib/api';
import type { TransaksiPenyaluran } from '../../types/zis';

export function PenyaluranDetailPage({ id, onBack }: { id: string; onBack: () => void }) {
  const [data, setData] = useState<TransaksiPenyaluran | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    penyaluranApi
      .getById(id)
      .then(setData)
      .catch((err: Error) => toast.error(err.message || 'Gagal memuat detail penyaluran'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <RecordDetailShell title="Detail Penyaluran" onBack={onBack}>
        <p className="text-sm text-[#7D938A]">Memuat data...</p>
      </RecordDetailShell>
    );
  }

  if (!data) {
    return (
      <RecordDetailShell title="Detail Penyaluran" onBack={onBack}>
        <p className="text-sm text-rose-600">Transaksi tidak ditemukan.</p>
      </RecordDetailShell>
    );
  }

  return (
    <RecordDetailShell
      title="Detail Penyaluran ZIS"
      subtitle={data.noPenyaluran}
      onBack={onBack}
      actions={<Badge statusText={data.status} />}
    >
      <DetailFields
        rows={[
          { label: 'No. Penyaluran', value: data.noPenyaluran },
          { label: 'Tanggal', value: data.tanggal },
          { label: 'Mustahik', value: data.mustahikNama },
          { label: 'Asnaf', value: data.asnaf },
          { label: 'Program', value: data.programNama },
          { label: 'Nominal', value: formatRP(data.nominal) },
          { label: 'Dana Mustahik', value: formatRP(data.danaMustahik) },
          { label: 'Potongan Amil', value: formatRP(data.potonganAmil) },
          { label: 'Metode', value: data.metodePembayaran },
          { label: 'Rekening', value: data.rekeningTujuan },
          { label: 'Keterangan', value: data.keterangan },
        ]}
      />
    </RecordDetailShell>
  );
}
