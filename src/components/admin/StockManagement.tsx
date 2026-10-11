import React, { useState } from 'react';
import { Boxes, Download, History, PlusCircle, MinusCircle, AlertCircle, Search, FileSpreadsheet } from 'lucide-react';
import { Product, ProductionBatch, StockMovement, UserAccount } from '../../types/bakery';
import { formatDateTimeIndo } from '../../utils/formatters';
import { BakeryStorageService } from '../../services/storage';
import { exportToCsv } from '../../utils/pdfReceipt';

interface StockManagementProps {
  products: Product[];
  batches: ProductionBatch[];
  movements: StockMovement[];
  currentUser: UserAccount;
  onRefreshData: () => void;
}

export const StockManagement: React.FC<StockManagementProps> = ({
  products,
  batches,
  movements,
  currentUser,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'movements'>('summary');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState(batches[0]?.id || '');
  const [adjustQty, setAdjustQty] = useState(0);
  const [adjustReason, setAdjustReason] = useState('');
  const [isWaste, setIsWaste] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const now = new Date().getTime();

  // Export stock report to CSV
  const handleExportStockCsv = () => {
    const reportData = batches.map(b => {
      const prod = products.find(p => p.id === b.productId);
      return {
        'Kode Batch': b.batchCode,
        'Nama Produk': prod?.name || b.productId,
        'Satuan': prod?.unit || 'pcs',
        'Stok Awal': b.initialQty,
        'Stok Sisa': b.remainingQty,
        'Terjual': b.soldQty,
        'Rusak/Afkir': b.wastedQty,
        'Tgl Produksi': b.productionDate,
        'Tgl Kedaluwarsa': b.expiryDate,
        'Status': b.status,
        'Petugas': b.staffName,
      };
    });
    exportToCsv(reportData, `Laporan_Stok_Bakery_${new Date().toISOString().slice(0, 10)}`);
  };

  const handleExportMovementsCsv = () => {
    const reportData = movements.map(m => ({
      'ID Mutasi': m.id,
      'Waktu': m.timestamp,
      'Kode Batch': m.batchCode,
      'Produk': m.productName,
      'Tipe Mutasi': m.type,
      'Perubahan Qty': m.qtyChange,
      'Stok Sebelumnya': m.previousStock,
      'Stok Setelah': m.newStock,
      'Keterangan / Alasan': m.reason,
      'Petugas': m.staffName,
    }));
    exportToCsv(reportData, `Riwayat_Mutasi_Stok_${new Date().toISOString().slice(0, 10)}`);
  };

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (adjustQty === 0) {
      setErrorMsg('Perubahan stok tidak boleh 0.');
      return;
    }
    if (!adjustReason.trim()) {
      setErrorMsg('Alasan penyesuaian stok wajib diisi.');
      return;
    }

    try {
      BakeryStorageService.adjustBatchStock(selectedBatchId, adjustQty, adjustReason.trim(), isWaste);
      setShowAdjustModal(false);
      setAdjustQty(0);
      setAdjustReason('');
      onRefreshData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyesuaikan stok.';
      setErrorMsg(msg);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-[#E8DEC8] shadow-2xs">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#9A6237]">
            Inventaris & Buku Besar Stok
          </span>
          <h1 className="font-serif-bakery font-bold text-2xl text-[#3A241D] flex items-center gap-2">
            <Boxes className="w-6 h-6 text-[#8D5B36]" />
            <span>Manajemen Persediaan & Mutasi Stok</span>
          </h1>
          <p className="text-xs text-[#7A584A] mt-1">
            Pantau pergerakan stok masuk, penjualan otomatis kasir, serta penyesuaian opname secara transparan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAdjustModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[#8D5B36] hover:bg-[#724524] text-white text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-xs whitespace-nowrap"
          >
            <span>Koreksi Stok (Opname)</span>
          </button>

          <button
            onClick={activeTab === 'summary' ? handleExportStockCsv : handleExportMovementsCsv}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#FAF0E4] text-[#3A241D] border border-[#DFCBB5] text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <Download className="w-4 h-4 text-[#8D5B36]" />
            <span>Ekspor Excel (.CSV)</span>
          </button>
        </div>
      </div>

      {/* Segmented Sub Tabs */}
      <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-[#E8DEC8] w-fit">
        <button
          onClick={() => setActiveTab('summary')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'summary' ? 'bg-[#8D5B36] text-white shadow-2xs' : 'text-[#6B4F43] hover:text-[#3A241D]'
          }`}
        >
          Rekap Stok per Produk
        </button>
        <button
          onClick={() => setActiveTab('movements')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'movements' ? 'bg-[#8D5B36] text-white shadow-2xs' : 'text-[#6B4F43] hover:text-[#3A241D]'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Buku Mutasi Stok ({movements.length})</span>
        </button>
      </div>

      {/* Tab 1: Rekap Stok per Produk */}
      {activeTab === 'summary' ? (
        <div className="bg-white rounded-2xl border border-[#E8DEC8] shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-[#F0EBE1] flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#9A6237]">
              Status Persediaan Layak Jual vs Kedaluwarsa
            </h3>
            <input
              type="text"
              placeholder="Cari produk..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-[#DFCBB5] text-xs text-[#3A241D] bg-[#FAF7F2] w-60"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E8DEC8] bg-[#FAF7F2] text-[#8C6D62] uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Nama Produk</th>
                  <th className="py-3 px-4">Satuan</th>
                  <th className="py-3 px-4 text-center">Stok Layak Jual</th>
                  <th className="py-3 px-4 text-center">Stok Kedaluwarsa</th>
                  <th className="py-3 px-4 text-center">Batas Minimum</th>
                  <th className="py-3 px-4">Rincian Batch Aktif</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2ECE1]">
                {products
                  .filter(p => !p.isArchived && p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(p => {
                    const prodBatches = batches.filter(b => b.productId === p.id);
                    const validBatches = prodBatches.filter(
                      b => b.remainingQty > 0 && b.status !== 'kedaluwarsa' && b.status !== 'ditarik' && new Date(b.expiryDate).getTime() > now
                    );
                    const expiredBatches = prodBatches.filter(
                      b => b.status === 'kedaluwarsa' || new Date(b.expiryDate).getTime() <= now
                    );

                    const validStock = validBatches.reduce((s, b) => s + b.remainingQty, 0);
                    const expiredStock = expiredBatches.reduce((s, b) => s + b.remainingQty, 0);
                    const isBelowMin = validStock <= p.minStockAlert;

                    return (
                      <tr key={p.id} className="hover:bg-[#FAF7F2] transition-colors">
                        <td className="py-3.5 px-4 font-bold text-[#3A241D]">
                          {p.name}
                        </td>
                        <td className="py-3.5 px-4 text-[#7A584A]">{p.unit}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`font-mono-nums font-bold text-sm ${
                              validStock === 0
                                ? 'text-rose-600'
                                : isBelowMin
                                ? 'text-amber-700'
                                : 'text-emerald-700'
                            }`}
                          >
                            {validStock}
                          </span>
                          {isBelowMin && (
                            <span className="block text-[10px] text-amber-700 font-semibold">
                              (Menipis!)
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono-nums">
                          {expiredStock > 0 ? (
                            <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                              {expiredStock} (Afkir)
                            </span>
                          ) : (
                            <span className="text-slate-400">0</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono-nums text-[#8C6D62]">
                          {p.minStockAlert}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1">
                            {validBatches.length === 0 ? (
                              <span className="text-[11px] text-slate-400 italic">Tidak ada batch aktif</span>
                            ) : (
                              validBatches.map(b => (
                                <span
                                  key={b.id}
                                  className="px-2 py-0.5 rounded-md bg-[#FAF0E4] border border-[#DFCBB5] text-[10px] font-mono text-[#8C4F1A]"
                                >
                                  {b.batchCode}: {b.remainingQty} pcs (Exp: {new Date(b.expiryDate).toLocaleDateString('id-ID')})
                                </span>
                              ))
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Tab 2: Buku Mutasi Stok */
        <div className="bg-white rounded-2xl border border-[#E8DEC8] shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-[#F0EBE1] flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#9A6237]">
              Riwayat Transaksi Stok Masuk & Keluar
            </h3>
            <span className="text-xs text-[#8C6D62]">Audit Log Pergerakan Stok</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E8DEC8] bg-[#FAF7F2] text-[#8C6D62] uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Kode Batch & Produk</th>
                  <th className="py-3 px-4">Tipe Mutasi</th>
                  <th className="py-3 px-4 text-center">Perubahan</th>
                  <th className="py-3 px-4 text-center">Sebelum → Sesudah</th>
                  <th className="py-3 px-4">Alasan & Petugas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2ECE1]">
                {movements.map(m => (
                  <tr key={m.id} className="hover:bg-[#FAF7F2] transition-colors">
                    <td className="py-3 px-4 text-[#8C6D62] font-mono whitespace-nowrap">
                      {formatDateTimeIndo(m.timestamp)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-[#8D5B36] block">{m.batchCode}</span>
                      <span className="text-[#3A241D]">{m.productName}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FAF0E4] text-[#8C4F1A] border border-[#DFCBB5]">
                        {m.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono-nums font-bold">
                      <span className={m.qtyChange > 0 ? 'text-emerald-700' : 'text-rose-700'}>
                        {m.qtyChange > 0 ? `+${m.qtyChange}` : m.qtyChange}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono-nums text-[#6B4F43]">
                      {m.previousStock} → <strong>{m.newStock}</strong>
                    </td>
                    <td className="py-3 px-4 text-[#5C453C]">
                      <span className="block">{m.reason}</span>
                      <span className="text-[10px] text-[#8C6D62]">Oleh: {m.staffName}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Adjust Stock Opname Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#DFCBB5] p-6 space-y-4">
            <h2 className="font-serif-bakery font-bold text-lg text-[#3A241D]">
              Koreksi Stok / Stock Opname
            </h2>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAdjustSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#5C453C] mb-1">Pilih Batch yang Dikoreksi</label>
                <select
                  value={selectedBatchId}
                  onChange={e => setSelectedBatchId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#DFCBB5] bg-white text-[#3A241D]"
                >
                  {batches.map(b => {
                    const prod = products.find(p => p.id === b.productId);
                    return (
                      <option key={b.id} value={b.id}>
                        {b.batchCode} - {prod?.name} (Sisa: {b.remainingQty})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#5C453C] mb-1">
                  Jumlah Perubahan Qty (Gunakan minus untuk pengurangan)
                </label>
                <input
                  type="number"
                  value={adjustQty || ''}
                  onChange={e => setAdjustQty(Number(e.target.value))}
                  placeholder="Contoh: -2 atau 5"
                  className="w-full px-3 py-2 rounded-xl border border-[#DFCBB5] font-mono-nums font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#5C453C] mb-1">
                  Alasan Koreksi (Wajib Audit Log)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Selisih opname fisik / sampel / rusak display"
                  value={adjustReason}
                  onChange={e => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#DFCBB5]"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isWaste}
                  onChange={e => setIsWaste(e.target.checked)}
                  className="text-[#8D5B36]"
                />
                <span className="text-[#5C453C]">Tandai sebagai produk rusak / terbuang (Waste)</span>
              </label>

              <div className="pt-3 border-t border-[#F0EBE1] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#DFCBB5] text-[#5C453C] font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#8D5B36] hover:bg-[#724524] text-white font-bold"
                >
                  Simpan Koreksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
