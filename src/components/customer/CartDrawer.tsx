import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, Tag, AlertCircle, ShoppingBag, Clock, ShieldAlert } from 'lucide-react';
import { CartItem, ProductionBatch, StoreSettings, Voucher } from '../../types/bakery';
import { formatRupiah } from '../../utils/formatters';
import { BakeryVisual } from '../common/BakeryVisual';
import { BakeryStorageService } from '../../services/storage';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  batches: ProductionBatch[];
  settings: StoreSettings;
  vouchers: Voucher[];
  onUpdateQty: (productId: string, newQty: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedCheckout: (voucherCode?: string, discountAmount?: number) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  batches,
  settings,
  vouchers,
  onUpdateQty,
  onRemoveItem,
  onProceedCheckout,
}) => {
  if (!isOpen) return null;

  const [inputVoucher, setInputVoucher] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [voucherError, setVoucherError] = useState<string | null>(null);

  const storeStatus = BakeryStorageService.getStoreOperatingStatus();
  const now = new Date().getTime();

  // Calculate subtotal
  const subtotal = cart.reduce((sum, item) => {
    const price = item.product.promoPrice && item.product.promoPrice > 0 ? item.product.promoPrice : item.product.normalPrice;
    return sum + price * item.qty;
  }, 0);

  // Voucher discount calculation
  let discountAmount = 0;
  if (appliedVoucher) {
    if (appliedVoucher.discountType === 'percentage') {
      const raw = (subtotal * appliedVoucher.discountValue) / 100;
      discountAmount = appliedVoucher.maxDiscount ? Math.min(raw, appliedVoucher.maxDiscount) : raw;
    } else {
      discountAmount = appliedVoucher.discountValue;
    }
  }

  // Free delivery check
  const isFreeDelivery = subtotal >= (settings.freeDeliveryThreshold || 150000);

  const handleApplyVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    setVoucherError(null);
    const code = inputVoucher.trim().toUpperCase();
    if (!code) return;

    const v = vouchers.find(vch => vch.code.toUpperCase() === code && vch.isActive);
    if (!v) {
      setVoucherError('Kode voucher tidak ditemukan atau sudah tidak aktif.');
      setAppliedVoucher(null);
      return;
    }

    if (subtotal < v.minPurchase) {
      setVoucherError(`Minimal belanja untuk voucher ini adalah ${formatRupiah(v.minPurchase)}.`);
      setAppliedVoucher(null);
      return;
    }

    setAppliedVoucher(v);
    setVoucherError(null);
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setInputVoucher('');
    setVoucherError(null);
  };

  // Stock check per item
  const getItemStock = (productId: string) => {
    return batches
      .filter(b => b.productId === productId && b.remainingQty > 0 && b.status !== 'kedaluwarsa' && b.status !== 'ditarik' && new Date(b.expiryDate).getTime() > now)
      .reduce((acc, b) => acc + b.remainingQty, 0);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-[#FAF7F2] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 border-l border-[#DFCBB5]">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-[#E8DEC8] bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#8D5B36]" />
            <h2 className="font-serif-bakery font-bold text-lg text-[#3A241D]">
              Keranjang Belanja
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#FAF0E4] text-[#8C4F1A] border border-[#DFCBB5]">
              {cart.reduce((sum, it) => sum + it.qty, 0)} item
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#7A584A] hover:bg-[#FAF0E4] transition-colors cursor-pointer"
            aria-label="Tutup Keranjang"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-[#EFE3D3] flex items-center justify-center text-[#8D5B36] mb-4">
                <ShoppingBag className="w-8 h-8 opacity-60" />
              </div>
              <h3 className="font-serif-bakery font-bold text-base text-[#3A241D] mb-1">
                Keranjang Masih Kosong
              </h3>
              <p className="text-xs text-[#7A584A] max-w-xs mb-6">
                Belum ada roti atau pastry pilihan Anda di keranjang. Yuk jelajahi menu segar kami!
              </p>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-[#8D5B36] text-white text-xs font-semibold hover:bg-[#724524] transition-colors cursor-pointer"
              >
                Mulai Belanja
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map(item => {
                const price = item.product.promoPrice && item.product.promoPrice > 0 ? item.product.promoPrice : item.product.normalPrice;
                const maxStock = getItemStock(item.product.id);
                const hasExceededStock = item.qty > maxStock;

                return (
                  <div
                    key={item.productId}
                    className="p-3.5 rounded-2xl bg-white border border-[#E8DEC8] shadow-2xs flex gap-3.5 items-center"
                  >
                    {/* Visual */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-[#DFCBB5]">
                      <BakeryVisual
                        type={item.product.visualType}
                        imageUrl={item.product.imageUrl}
                        alt={item.product.name}
                        size="sm"
                        className="w-full h-full"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif-bakery font-bold text-sm text-[#3A241D] truncate">
                        {item.product.name}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-[#8C6D62] mb-1.5 font-mono-nums">
                        <span>{formatRupiah(price)}</span>
                        <span>×</span>
                        <span>{item.qty} {item.product.unit}</span>
                      </div>

                      {hasExceededStock && (
                        <div className="text-[10px] text-rose-600 flex items-center gap-1 mb-1">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>Melebihi stok layak (Sisa: {maxStock})</span>
                        </div>
                      )}

                      {/* Stepper & Trash */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-[#DFCBB5] rounded-lg bg-[#FAF6F0] p-0.5">
                          <button
                            onClick={() => onUpdateQty(item.productId, item.qty - 1)}
                            className="w-6 h-6 flex items-center justify-center text-[#5C453C] hover:bg-white rounded transition-colors cursor-pointer"
                            aria-label="Kurangi"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center text-xs font-bold font-mono-nums text-[#3A241D]">
                            {item.qty}
                          </span>
                          <button
                            onClick={() => onUpdateQty(item.productId, item.qty + 1)}
                            disabled={item.qty >= maxStock}
                            className="w-6 h-6 flex items-center justify-center text-[#5C453C] hover:bg-white rounded transition-colors disabled:opacity-30 cursor-pointer"
                            aria-label="Tambah"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[#3A241D] font-mono-nums">
                            {formatRupiah(price * item.qty)}
                          </span>
                          <button
                            onClick={() => onRemoveItem(item.productId)}
                            className="p-1.5 text-[#9A6237] hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Hapus Item"
                            aria-label="Hapus Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Voucher Section */}
          {cart.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-white border border-[#E8DEC8] space-y-2 mt-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#9A6237] flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                Voucher Diskon
              </span>

              {appliedVoucher ? (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-emerald-800">{appliedVoucher.code}</span>
                    <span className="text-emerald-700 block text-[11px]">
                      Hemat {formatRupiah(discountAmount)}
                    </span>
                  </div>
                  <button
                    onClick={handleRemoveVoucher}
                    className="text-xs text-rose-600 font-semibold hover:underline cursor-pointer"
                  >
                    Hapus
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyVoucher} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Contoh: BAKERY10"
                    value={inputVoucher}
                    onChange={e => setInputVoucher(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-[#DFCBB5] text-xs text-[#3A241D] uppercase placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#8D5B36]"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-xl bg-[#8D5B36] text-white text-xs font-semibold hover:bg-[#724524] transition-colors cursor-pointer"
                  >
                    Terapkan
                  </button>
                </form>
              )}

              {voucherError && (
                <p className="text-[11px] text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{voucherError}</span>
                </p>
              )}

              {/* Suggestions */}
              <div className="pt-1 flex flex-wrap gap-1.5 text-[10px]">
                <span className="text-[#8C6D62]">Kupon tersedia:</span>
                <button
                  type="button"
                  onClick={() => { setInputVoucher('BAKERY10'); }}
                  className="px-2 py-0.5 rounded bg-[#FAF0E4] text-[#8C4F1A] font-mono hover:bg-[#F3E3D1] cursor-pointer"
                >
                  BAKERY10
                </button>
                <button
                  type="button"
                  onClick={() => { setInputVoucher('HEMAT20'); }}
                  className="px-2 py-0.5 rounded bg-[#FAF0E4] text-[#8C4F1A] font-mono hover:bg-[#F3E3D1] cursor-pointer"
                >
                  HEMAT20
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer with Totals & Checkout Button */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 bg-white border-t border-[#E8DEC8] space-y-3">
            <div className="space-y-1.5 text-xs text-[#6B4F43]">
              <div className="flex justify-between">
                <span>Subtotal Produk</span>
                <span className="font-mono-nums font-semibold">{formatRupiah(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Diskon Voucher ({appliedVoucher?.code})</span>
                  <span className="font-mono-nums font-semibold">-{formatRupiah(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Estimasi Ongkir</span>
                <span className="font-mono-nums">
                  {isFreeDelivery ? (
                    <span className="text-emerald-700 font-semibold">GRATIS ONGKIR</span>
                  ) : (
                    formatRupiah(settings.deliveryFeeFixed || 15000)
                  )}
                </span>
              </div>

              <div className="pt-2 border-t border-[#F2ECE1] flex justify-between items-baseline text-sm font-bold text-[#3A241D]">
                <span>Total Estimasi</span>
                <span className="text-base text-[#B45309] font-mono-nums">
                  {formatRupiah(Math.max(0, subtotal - discountAmount))}
                </span>
              </div>
            </div>

            {/* Operating Hours & Queue Policy Notice in Cart */}
            <div className={`p-3 rounded-xl border text-[11px] leading-relaxed ${
              storeStatus.isOpen
                ? 'bg-[#FAF6F0] border-[#E8DEC8] text-[#6B4F43]'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <Clock className="w-3.5 h-3.5 text-[#B45309]" />
                <span>Jam Buka Toko: {settings.openTime} – {settings.closeTime} WIB</span>
              </div>
              <p>
                {storeStatus.isOpen ? (
                  <span>Pesanan online dilayani secara berurutan sesuai nomor antrean dan jam order (FIFO).</span>
                ) : (
                  <span className="font-semibold text-rose-700">
                    ⚠️ Toko saat ini tutup. Pesanan online hanya dilayani saat toko buka ({settings.openTime} – {settings.closeTime} WIB).
                  </span>
                )}
              </p>
            </div>

            <button
              onClick={() => onProceedCheckout(appliedVoucher?.code, discountAmount)}
              disabled={!storeStatus.isOpen}
              className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                storeStatus.isOpen
                  ? 'bg-[#8D5B36] hover:bg-[#724524] text-white shadow-[#8D5B36]/20'
                  : 'bg-slate-200 text-slate-500 border border-slate-300 cursor-not-allowed shadow-none'
              }`}
            >
              {storeStatus.isOpen ? (
                <>
                  <span>Lanjut ke Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <span>Toko Tutup (Buka Pukul {settings.openTime} WIB)</span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
