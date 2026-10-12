import React, { useState } from 'react';
import { Layers, Plus, AlertTriangle, ShieldCheck, Clock, Calendar, CheckCircle2, Ban, Trash2, Filter } from 'lucide-react';
import { Product, ProductionBatch, StoreSettings, UserAccount } from '../../types/bakery';
import { formatDateTimeIndo, getBatchStatusLabel } from '../../utils/formatters';
import { BakeryStorageService } from '../../services/storage';

interface BatchManagementProps {
  batches: ProductionBatch[];
  products: Product[];
  currentUser: UserAccount;
  settings: StoreSettings;
  onRefreshData: () => void;
}

export const BatchManagement: React.FC<BatchManagementProps> = ({
  batches,
  products,
  currentUser,
  settings,
  onRefreshData,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New batch form states
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [productionDate, setProductionDate] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });
  const [expiryDate, setExpiryDate] = useState(() => {
    const d = new Date();
    const shelfDays = products[0]?.estimatedShelfDays || 3;
    d.setDate(d.getDate() + shelfDays);
    d.setHours(21, 0, 0, 0);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });
  const [initialQty, setInitialQty] = useState(25);
  const [notes, setNotes] = useState('');
  const [staffName, setStaffName] = useState(currentUser.name);
  const [formError, setFormError] = useState<string | null>(null);

  // Auto-adjust suggested expiry when product changes
  const handleProductSelect = (prodId: string) => {
    setSelectedProductId(prodId);
    const prod = products.find(p => p.id === prodId);
    const shelf = prod?.estimatedShelfDays || 3;
    const d = new Date(productionDate);
    d.setDate(d.getDate() + shelf);
    d.setHours(21, 0, 0, 0);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    setExpiryDate(d.toISOString().slice(0, 16));
  };

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (initialQty <= 0) {
      setFormError('Jumlah produksi harus lebih dari 0.');
      return;
    }

    if (new Date(expiryDate) <= new Date(productionDate)) {
      setFormError('Tanggal kedaluwarsa harus setelah tanggal produksi.');
      return;
    }

    try {
      BakeryStorageService.createBatch({
        productId: selectedProductId,
        productionDate: new Date(productionDate).toISOString(),
        expiryDate: new Date(expiryDate).toISOString(),
        initialQty,
        notes: notes.trim(),
        staffName: staffName.trim() || currentUser.name,
      });

      setShowAddModal(false);
      setNotes('');
      onRefreshData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal membuat batch produksi.';
      setFormError(msg);
    }
  };

  // Withdraw / Tarik batch action
  const handleWithdrawBatch = (batchId: string) => {
    if (confirm('Yakin ingin menarik batch ini dari penjualan? Batch tidak akan dapat dialokasikan ke pesanan.')) {
      const allBatches = BakeryStorageService.getBatches();
      const updated = allBatches.map(b => (b.id === batchId ? { ...b, status: 'ditarik' as const } : b));
      BakeryStorageService.saveBatches(updated);
      BakeryStorageService.logAudit('WITHDRAW_BATCH', 'BATCH', batchId, 'Batch ditarik dari penjualan');
      onRefreshData();
    }
  };

  // Record waste action
  const handleRecordWaste = (batch: ProductionBatch) => {
    const qtyStr = prompt(`Catat jumlah produk rusak/kedaluwarsa untuk batch ${batch.batchCode} (Maks: ${batch.remainingQty}):`);
    if (!qtyStr) return;
    const qty = parseInt(qtyStr, 10);
    if (isNaN(qty) || qty <= 0 || qty > batch.remainingQty) {
      alert('Jumlah tidak valid atau melebihi sisa stok.');
      return;
    }
    const reason = prompt('Alasan pembuangan/kerusakan:', 'Melebihi tanggal kedaluwarsa / rusak fisik') || 'Kedaluwarsa';
    BakeryStorageService.adjustBatchStock(batch.id, -qty, reason, true);
    onRefreshData();
  };

  // Filter batches
  const filteredBatches = batches.filter(b => {
    if (filterStatus !== 'all' && b.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const prod = products.find(p => p.id === b.productId);
      return b.batchCode.toLowerCase().includes(q) || prod?.name.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-[#E8DEC8] shadow-2xs">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#9A6237]">
            Manajemen Kesegaran & Kontrol Mutu
          </span>
          <h1 className="font-serif-bakery font-bold text-2xl text-[#3A241D] flex items-center gap-2">
            <Layers className="w-6 h-6 text-[#8D5B36]" />
            <span>Batch Produksi & FEFO Engine</span>
          </h1>
          <p className="text-xs text-[#7A584A] mt-1">
            Setiap produksi dicatat unik dengan tanggal kedaluwarsa spesifik. Sistem secara otomatis memprioritaskan First Expired, First Out.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-[#8D5B36] hover:bg-[#724524] text-white text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-xs whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Catat Batch Baru</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#E8DEC8]">
        <div className="flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
          <span className="text-[#8C6D62] font-semibold text-[11px] shrink-0">Filter Status:</span>
          {['all', 'aktif', 'mendekati_kedaluwarsa', 'kedaluwarsa', 'habis', 'ditarik'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                filterStatus === st
                  ? 'bg-[#8D5B36] text-white shadow-2xs'
                  : 'bg-[#FAF6F0] text-[#6B4F43] hover:bg-[#F3E3D1]'
              }`}
            >
              {st === 'all' ? 'Semua' : getBatchStatusLabel(st as any).label}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Cari kode batch atau nama..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-[#DFCBB5] text-xs text-[#3A241D] bg-[#FAF7F2] focus:bg-white focus:outline-none w-full sm:w-60"
        />
      </div>

      {/* Batches Container: Mobile Cards (< md) & Table (>= md) */}
      <div className="bg-white rounded-2xl border border-[#E8DEC8] shadow-2xs overflow-hidden">
        {/* Mobile View (< md) */}
        <div className="md:hidden divide-y divide-[#F2ECE1]">
          {filteredBatches.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#8C6D62]">
              Tidak ada batch produksi yang sesuai filter.
            </div>
          ) : (
            filteredBatches.map(batch => {
              const prod = products.find(p => p.id === batch.productId);
              const statusInfo = getBatchStatusLabel(batch.status);
              const isBlocked = batch.status === 'kedaluwarsa' || batch.status === 'ditarik';

              return (
                <div key={batch.id} className="p-4 space-y-3 hover:bg-[#FAF7F2] transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-xs text-[#3A241D] block">
                        {batch.batchCode}
                      </span>
                      <span className="font-semibold text-xs text-[#5C453C]">
                        {prod?.name || batch.productId}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.bgClass} ${statusInfo.textClass} ${statusInfo.borderClass}`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DEC8]">
                    <div>
                      <span className="text-[#8C6D62] block">Tgl Kedaluwarsa:</span>
                      <span className={`font-semibold ${batch.status === 'kedaluwarsa' ? 'text-rose-700 font-bold' : 'text-[#3A241D]'}`}>
                        {formatDateTimeIndo(batch.expiryDate)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#8C6D62] block">Stok Sisa / Awal:</span>
                      <span className="font-mono-nums font-bold text-[#3A241D]">
                        {batch.remainingQty} <span className="text-[#8C6D62] font-normal">/ {batch.initialQty} pcs</span>
                      </span>
                      <span className="text-emerald-700 font-semibold block text-[10px]">
                        Terjual: {batch.soldQty} pcs
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className="text-[#8C6D62]">
                      Petugas: <strong>{batch.staffName}</strong>
                    </span>

                    <div className="flex items-center gap-1.5">
                      {batch.status !== 'ditarik' && batch.remainingQty > 0 && (
                        <button
                          onClick={() => handleWithdrawBatch(batch.id)}
                          className="px-2.5 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 font-semibold hover:bg-amber-100 transition-colors cursor-pointer min-h-[36px]"
                        >
                          Tarik
                        </button>
                      )}

                      {batch.remainingQty > 0 && (
                        <button
                          onClick={() => handleRecordWaste(batch)}
                          className="px-2.5 py-1.5 rounded-lg border border-rose-300 bg-rose-50 text-rose-800 font-semibold hover:bg-rose-100 transition-colors cursor-pointer min-h-[36px]"
                        >
                          Catat Afkir
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop View (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E8DEC8] bg-[#FAF7F2] text-[#8C6D62] uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Kode Batch</th>
                <th className="py-3 px-4">Produk</th>
                <th className="py-3 px-4">Tgl Produksi</th>
                <th className="py-3 px-4">Tgl Kedaluwarsa</th>
                <th className="py-3 px-4 text-center">Awal / Sisa / Terjual</th>
                <th className="py-3 px-4">Status FEFO</th>
                <th className="py-3 px-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2ECE1]">
              {filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-[#8C6D62]">
                    Tidak ada batch produksi yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredBatches.map(batch => {
                  const prod = products.find(p => p.id === batch.productId);
                  const statusInfo = getBatchStatusLabel(batch.status);
                  const isBlocked = batch.status === 'kedaluwarsa' || batch.status === 'ditarik';

                  return (
                    <tr key={batch.id} className="hover:bg-[#FAF7F2] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#3A241D]">
                        {batch.batchCode}
                        {batch.notes && (
                          <span className="block font-sans text-[10px] text-[#8C6D62] font-normal truncate max-w-xs">
                            {batch.notes}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-[#3A241D] block">{prod?.name || batch.productId}</span>
                        <span className="text-[10px] text-[#8C6D62]">Petugas: {batch.staffName}</span>
                      </td>
                      <td className="py-3.5 px-4 text-[#5C453C]">
                        {formatDateTimeIndo(batch.productionDate)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`font-semibold ${batch.status === 'kedaluwarsa' ? 'text-rose-700 font-bold' : 'text-[#3A241D]'}`}>
                          {formatDateTimeIndo(batch.expiryDate)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono-nums">
                        <span className="text-[#8C6D62]">{batch.initialQty}</span> /{' '}
                        <strong className="text-[#3A241D] text-sm">{batch.remainingQty}</strong> /{' '}
                        <span className="text-emerald-700 font-semibold">{batch.soldQty}</span>
                        {batch.wastedQty > 0 && (
                          <span className="block text-[10px] text-rose-600 font-bold">
                            (Buang: {batch.wastedQty})
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-block ${statusInfo.bgClass} ${statusInfo.textClass} ${statusInfo.borderClass}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {batch.status !== 'ditarik' && batch.remainingQty > 0 && (
                            <button
                              onClick={() => handleWithdrawBatch(batch.id)}
                              className="px-2 py-1 rounded-lg text-[10px] font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                              title="Tarik Batch dari Penjualan"
                            >
                              Tarik
                            </button>
                          )}
                          {batch.remainingQty > 0 && (
                            <button
                              onClick={() => handleRecordWaste(batch)}
                              className="px-2 py-1 rounded-lg text-[10px] font-semibold text-amber-800 hover:bg-amber-50 border border-amber-200 transition-colors cursor-pointer"
                              title="Catat Afkir / Buang Produk Rusak"
                            >
                              Afkir
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Batch Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#DFCBB5] overflow-hidden my-6 p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="border-b border-[#F0EBE1] pb-3">
              <h2 className="font-serif-bakery font-bold text-xl text-[#3A241D]">
                Catat Batch Produksi Dapur
              </h2>
              <span className="text-xs text-[#7A584A]">
                Penambahan stok baru terikat dengan tanggal kedaluwarsa unik
              </span>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateBatch} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#5C453C] mb-1">Pilih Produk</label>
                <select
                  value={selectedProductId}
                  onChange={e => handleProductSelect(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#DFCBB5] bg-white text-[#3A241D]"
                >
                  {products.filter(p => !p.isArchived).map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Saran simpan: {p.estimatedShelfDays} hari)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#5C453C] mb-1">Tanggal Produksi</label>
                  <input
                    type="datetime-local"
                    value={productionDate}
                    onChange={e => setProductionDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#DFCBB5]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#5C453C] mb-1">Tanggal Kedaluwarsa</label>
                  <input
                    type="datetime-local"
                    value={expiryDate}
                    onChange={e => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#DFCBB5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#5C453C] mb-1">Jumlah Hasil Produksi (pcs/box)</label>
                  <input
                    type="number"
                    min={1}
                    value={initialQty}
                    onChange={e => setInitialQty(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#DFCBB5] font-mono-nums font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#5C453C] mb-1">Nama Baker / Petugas</label>
                  <input
                    type="text"
                    value={staffName}
                    onChange={e => setStaffName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#DFCBB5]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#5C453C] mb-1">Catatan Batch (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: Oven subuh kloter 1, suhu 210C, ragi sangat aktif"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#DFCBB5]"
                />
              </div>

              <div className="pt-3 border-t border-[#F0EBE1] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#DFCBB5] text-[#5C453C] hover:bg-[#FAF6F0] font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#8D5B36] hover:bg-[#724524] text-white font-bold cursor-pointer"
                >
                  Simpan Batch Produksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
