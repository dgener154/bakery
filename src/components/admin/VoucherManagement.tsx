import React, { useState } from 'react';
import { Tag, Plus, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { Voucher } from '../../types/bakery';
import { formatRupiah, formatDateTimeIndo } from '../../utils/formatters';
import { BakeryStorageService } from '../../services/storage';

interface VoucherManagementProps {
  vouchers: Voucher[];
  onRefreshData: () => void;
}

export const VoucherManagement: React.FC<VoucherManagementProps> = ({ vouchers, onRefreshData }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'nominal'>('percentage');
  const [discountValue, setDiscountValue] = useState(10);
  const [minPurchase, setMinPurchase] = useState(50000);
  const [maxDiscount, setMaxDiscount] = useState<number | undefined>(20000);
  const [usageLimit, setUsageLimit] = useState(100);

  const handleCreateVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    const all = BakeryStorageService.getVouchers();
    all.unshift({
      id: `vch_${Date.now()}`,
      code: code.trim().toUpperCase(),
      discountType,
      discountValue,
      minPurchase,
      maxDiscount: discountType === 'percentage' ? maxDiscount : undefined,
      usageLimit,
      usageCount: 0,
      validFrom: new Date().toISOString(),
      validUntil: '2026-12-31T23:59:59Z',
      isActive: true,
    });
    BakeryStorageService.saveVouchers(all);
    BakeryStorageService.logAudit('CREATE_VOUCHER', 'VOUCHER', code, `Voucher ${code} dibuat`);
    setShowAddModal(false);
    setCode('');
    onRefreshData();
  };

  const toggleVoucher = (vId: string, currentStatus: boolean) => {
    const all = BakeryStorageService.getVouchers();
    const updated = all.map(v => (v.id === vId ? { ...v, isActive: !currentStatus } : v));
    BakeryStorageService.saveVouchers(updated);
    onRefreshData();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-[#E8DEC8] shadow-2xs">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#9A6237]">
            Program Diskon & Loyalitas
          </span>
          <h1 className="font-serif-bakery font-bold text-2xl text-[#3A241D] flex items-center gap-2">
            <Tag className="w-6 h-6 text-[#8D5B36]" />
            <span>Manajemen Promo & Kode Voucher</span>
          </h1>
          <p className="text-xs text-[#7A584A] mt-1">
            Atur kupon potongan harga belanja otomatis dengan pembatasan minimal belanja dan kuota pemakaian.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-[#8D5B36] hover:bg-[#724524] text-white text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-xs whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Voucher Baru</span>
        </button>
      </div>

      {/* Vouchers Table */}
      <div className="bg-white rounded-2xl border border-[#E8DEC8] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E8DEC8] bg-[#FAF7F2] text-[#8C6D62] uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Kode Voucher</th>
                <th className="py-3 px-4">Tipe Diskon</th>
                <th className="py-3 px-4 text-center">Besaran Diskon</th>
                <th className="py-3 px-4 text-center">Minimal Belanja</th>
                <th className="py-3 px-4 text-center">Pemakaian / Kuota</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2ECE1]">
              {vouchers.map(v => (
                <tr key={v.id} className="hover:bg-[#FAF7F2] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#8D5B36] text-sm">
                    {v.code}
                  </td>
                  <td className="py-3.5 px-4 text-[#5C453C]">
                    {v.discountType === 'percentage' ? 'Persentase (%)' : 'Potongan Nominal Tetap'}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono-nums font-bold text-[#3A241D]">
                    {v.discountType === 'percentage' ? `${v.discountValue}%` : formatRupiah(v.discountValue)}
                    {v.maxDiscount && (
                      <span className="block text-[10px] text-[#8C6D62] font-normal">
                        Maks {formatRupiah(v.maxDiscount)}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono-nums text-[#6B4F43]">
                    {formatRupiah(v.minPurchase)}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono-nums text-[#6B4F43]">
                    <strong>{v.usageCount}</strong> / {v.usageLimit}x
                  </td>
                  <td className="py-3.5 px-4">
                    {v.isActive ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Aktif
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                        Nonaktif
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => toggleVoucher(v.id, v.isActive)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer border ${
                        v.isActive
                          ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
                          : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                      }`}
                    >
                      {v.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Voucher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#DFCBB5] p-6 space-y-4">
            <h2 className="font-serif-bakery font-bold text-lg text-[#3A241D]">
              Buat Kode Promo Baru
            </h2>

            <form onSubmit={handleCreateVoucher} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#5C453C] mb-1">Kode Voucher</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: ROTI10"
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 rounded-xl border border-[#DFCBB5] font-mono font-bold uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#5C453C] mb-1">Jenis Diskon</label>
                  <select
                    value={discountType}
                    onChange={e => setDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-[#DFCBB5] bg-white"
                  >
                    <option value="percentage">Persentase (%)</option>
                    <option value="nominal">Nominal (Rp)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#5C453C] mb-1">
                    Nilai Diskon {discountType === 'percentage' ? '(%)' : '(Rp)'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={discountValue}
                    onChange={e => setDiscountValue(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#DFCBB5] font-mono-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#5C453C] mb-1">Minimal Belanja (Rp)</label>
                  <input
                    type="number"
                    min={0}
                    value={minPurchase}
                    onChange={e => setMinPurchase(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#DFCBB5] font-mono-nums"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#5C453C] mb-1">Batas Maksimal Kuota</label>
                  <input
                    type="number"
                    min={1}
                    value={usageLimit}
                    onChange={e => setUsageLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#DFCBB5]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#F0EBE1] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#DFCBB5] text-[#5C453C] font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#8D5B36] text-white font-bold"
                >
                  Simpan Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
