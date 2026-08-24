import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { RecordDetailShell } from '../../components/layout/RecordDetailShell';
import { DetailFields } from '../../components/ui/DetailFields';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { formatRP } from '../../lib/utils';
import { mustahikApi } from '../../lib/api';
import type { Mustahik } from '../../types/zis';

export function MustahikDetailPage({ id, onBack }: { id: string; onBack: () => void }) {
  const [data, setData] = useState<Mustahik | null>(null);
  const [loading, setLoading] = useState(true);
  const [latInput, setLatInput] = useState('');
  const [lngInput, setLngInput] = useState('');
  const [savingGps, setSavingGps] = useState(false);

  const load = () => {
    setLoading(true);
    mustahikApi
      .getById(id)
      .then((row) => {
        setData(row);
        setLatInput(String(row.lat ?? ''));
        setLngInput(String(row.lng ?? ''));
      })
      .catch((err: Error) => toast.error(err.message || 'Gagal memuat profil mustahik'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [id]);

  const saveGps = async () => {
    const lat = Number(latInput);
    const lng = Number(lngInput);
    if (!lat || !lng) {
      toast.error('Isi koordinat lat dan lng yang valid');
      return;
    }
    setSavingGps(true);
    try {
      const updated = await mustahikApi.updateGps(id, lat, lng);
      setData(updated);
      toast.success('Koordinat GPS mustahik diperbarui');
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan GPS');
    } finally {
      setSavingGps(false);
    }
  };

  if (loading) {
    return (
      <RecordDetailShell title="Profil Mustahik" onBack={onBack}>
        <p className="text-sm text-[#7D938A]">Memuat data...</p>
      </RecordDetailShell>
    );
  }

  if (!data) {
    return (
      <RecordDetailShell title="Profil Mustahik" onBack={onBack}>
        <p className="text-sm text-rose-600">Mustahik tidak ditemukan.</p>
      </RecordDetailShell>
    );
  }

  return (
    <RecordDetailShell
      title={data.nama}
      subtitle={data.nik}
      onBack={onBack}
      actions={<Badge variant="blue">{data.kategoriAsnaf}</Badge>}
    >
      <div className="space-y-6">
        <DetailFields
          rows={[
            { label: 'NIK', value: data.nik },
            { label: 'Pekerjaan', value: data.pekerjaan },
            { label: 'HP', value: data.hp },
            { label: 'Alamat', value: data.alamat },
            { label: 'Tanggungan', value: String(data.jumlahTanggungan) },
            { label: 'Penghasilan / Bln', value: formatRP(data.penghasilanBulanan) },
            { label: 'Rekening', value: data.rekeningBank },
            { label: 'Skor Kelayakan', value: `${data.skorKelayakan} / 100` },
            { label: 'Total Bantuan', value: formatRP(data.totalBantuanDiterima) },
            { label: 'Status Survei', value: data.statusSurvei },
          ]}
        />

        <div className="pt-4 border-t border-[#E3E8E4] space-y-3">
          <h3 className="text-sm font-bold text-[#16211D]">Koordinat GPS (Peta Sebaran)</h3>
          <p className="text-[11px] text-[#7D938A]">
            Koordinat dipakai untuk marker individual di peta sebaran. Bisa disesuaikan manual setelah survei lapangan.
          </p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                value={latInput}
                onChange={(e) => setLatInput(e.target.value)}
                className="w-full p-2.5 border border-[#DDE3DF] rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                value={lngInput}
                onChange={(e) => setLngInput(e.target.value)}
                className="w-full p-2.5 border border-[#DDE3DF] rounded-xl"
              />
            </div>
          </div>
          <Button variant="primary" size="sm" disabled={savingGps} onClick={saveGps}>
            {savingGps ? 'Menyimpan…' : 'Simpan Koordinat GPS'}
          </Button>
        </div>
      </div>
    </RecordDetailShell>
  );
}
