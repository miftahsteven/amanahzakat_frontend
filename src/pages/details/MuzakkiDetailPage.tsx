import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { RecordDetailShell } from '../../components/layout/RecordDetailShell';
import { DetailFields } from '../../components/ui/DetailFields';
import { Badge } from '../../components/ui/Badge';
import { formatRP } from '../../lib/utils';
import { muzakkiApi } from '../../lib/api';
import type { Muzakki } from '../../types/zis';

export function MuzakkiDetailPage({ id, onBack }: { id: string; onBack: () => void }) {
  const [data, setData] = useState<Muzakki | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    muzakkiApi
      .getById(id)
      .then(setData)
      .catch((err: Error) => toast.error(err.message || 'Gagal memuat profil muzakki'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <RecordDetailShell title="Profil Muzakki" onBack={onBack}>
        <p className="text-sm text-[#7D938A]">Memuat data...</p>
      </RecordDetailShell>
    );
  }

  if (!data) {
    return (
      <RecordDetailShell title="Profil Muzakki" onBack={onBack}>
        <p className="text-sm text-rose-600">Muzakki tidak ditemukan.</p>
      </RecordDetailShell>
    );
  }

  return (
    <RecordDetailShell
      title={data.nama}
      subtitle={data.nomor}
      onBack={onBack}
      actions={<Badge variant="emerald">{data.tipe}</Badge>}
    >
      <DetailFields
        rows={[
          { label: 'Nomor', value: data.nomor },
          { label: 'NIK / NPWP', value: data.nikAtauNpwp },
          { label: 'HP', value: data.hp },
          { label: 'Email', value: data.email },
          { label: 'Alamat', value: data.alamat },
          { label: 'Bergabung', value: data.tanggalBergabung },
          { label: 'Total Setoran', value: formatRP(data.totalSetoran) },
          { label: 'Jumlah Transaksi', value: `${data.transaksiCount} kali` },
        ]}
      />
    </RecordDetailShell>
  );
}
