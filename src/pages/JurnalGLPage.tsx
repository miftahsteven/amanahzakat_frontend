import React, { useCallback, useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { JurnalEntry } from '../types/finance';
import { DataTable } from '../components/shared/DataTable';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { FileCheck2, Plus, RefreshCw } from 'lucide-react';
import { formatRP } from '../lib/utils';
import { IdNumberInput } from '../components/ui/IdNumberInput';
import { keuanganApi } from '../lib/api';
import { toast } from 'sonner';

export interface JurnalGLPageProps {
  onNavigate: (screen: string) => void;
  canCreate?: boolean;
}

export const JurnalGLPage: React.FC<JurnalGLPageProps> = ({ canCreate = false }) => {
  const [dataList, setDataList] = useState<JurnalEntry[]>([]);
  const [coaList, setCoaList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    tanggal: new Date().toISOString().slice(0, 10),
    keterangan: '',
    debitKode: '101201',
    kreditKode: '401100',
    nominal: 1000000,
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [jurnal, coa] = await Promise.all([keuanganApi.listJurnal(), keuanganApi.listCoa()]);
      setDataList(jurnal);
      setCoaList(coa);
    } catch (err: any) {
      toast.error(err.message || 'Gagal memuat jurnal');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = async () => {
    try {
      const created = await keuanganApi.createJurnal(form);
      setDataList((prev) => [created, ...prev]);
      toast.success(`Jurnal ${created.noJurnal} berhasil diposting`);
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan jurnal');
    }
  };

  const columns: ColumnDef<JurnalEntry, any>[] = [
    { accessorKey: 'noJurnal', header: 'No. Jurnal', cell: ({ row }) => <span className="font-mono font-bold">{row.getValue('noJurnal')}</span> },
    { accessorKey: 'tanggal', header: 'Tanggal' },
    { accessorKey: 'keterangan', header: 'Keterangan', cell: ({ row }) => <div className="font-medium max-w-xs">{row.getValue('keterangan')}</div> },
    {
      accessorKey: 'debitNama',
      header: 'Akun Debit',
      cell: ({ row }) => (
        <div>
          <div className="font-bold text-[#0F9D6E]">{row.getValue('debitNama')}</div>
          <div className="text-[10px] font-mono text-[#7D938A]">Kode: {row.original.debitKode}</div>
        </div>
      ),
    },
    {
      accessorKey: 'kreditNama',
      header: 'Akun Kredit',
      cell: ({ row }) => (
        <div>
          <div className="font-bold text-blue-600">{row.getValue('kreditNama')}</div>
          <div className="text-[10px] font-mono text-[#7D938A]">Kode: {row.original.kreditKode}</div>
        </div>
      ),
    },
    { accessorKey: 'nominal', header: 'Nominal', cell: ({ row }) => <span className="font-extrabold">{formatRP(row.getValue('nominal'))}</span> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <Badge statusText={row.getValue('status')} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#16211D] flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-[#0F9D6E]" /> Jurnal Umum & Buku Besar (G/L)
          </h1>
          <p className="text-xs text-[#7D938A]">Pencatatan ganda transaksi ZIS — {coaList.length} akun CoA aktif</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon={<RefreshCw className="w-4 h-4" />} onClick={loadData} disabled={isLoading}>Refresh</Button>
          {canCreate && (
            <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>Tambah Jurnal Manual</Button>
          )}
        </div>
      </div>

      <DataTable columns={columns} data={dataList} isLoading={isLoading} searchPlaceholder="Cari no jurnal, akun, atau keterangan..." />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Jurnal Manual" subtitle="Double-entry PSAK 109">
        <div className="space-y-3 text-sm">
          <input type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} className="w-full p-2.5 border rounded-xl" />
          <input type="text" placeholder="Keterangan" value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} className="w-full p-2.5 border rounded-xl" />
          <select value={form.debitKode} onChange={(e) => setForm({ ...form, debitKode: e.target.value })} className="w-full p-2.5 border rounded-xl">
            {coaList.map((c) => <option key={c.kode} value={c.kode}>{c.kode} — {c.nama}</option>)}
          </select>
          <select value={form.kreditKode} onChange={(e) => setForm({ ...form, kreditKode: e.target.value })} className="w-full p-2.5 border rounded-xl">
            {coaList.map((c) => <option key={c.kode} value={c.kode}>{c.kode} — {c.nama}</option>)}
          </select>
          <IdNumberInput placeholder="Nominal" value={form.nominal} onValueChange={(nominal) => setForm({ ...form, nominal })} className="w-full p-2.5 border rounded-xl" />
          <Button variant="primary" className="w-full" onClick={handleCreate}>Posting Jurnal</Button>
        </div>
      </Modal>
    </div>
  );
};
