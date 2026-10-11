import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, MapPin, Store, CreditCard, Banknote, QrCode, AlertCircle, ShoppingBag, Clock, ShieldAlert } from 'lucide-react';
import { CartItem, DigitalReceipt, Order, PaymentMethod, StoreSettings } from '../../types/bakery';
import { formatRupiah } from '../../utils/formatters';
import { BakeryStorageService } from '../../services/storage';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  settings: StoreSettings;
  voucherCode?: string;
  discountAmount?: number;
  onOrderSuccess: (order: Order, receipt: DigitalReceipt) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  settings,
  voucherCode,
  discountAmount = 0,
  onOrderSuccess,
}) => {
  if (!isOpen) return null;

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [pickupTimeSlot, setPickupTimeSlot] = useState('10:00 - 12:00 WIB');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('qris');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const storeStatus = BakeryStorageService.getStoreOperatingStatus();

  // Calculations
  const subtotal = cart.reduce((sum, it) => {
    const price = it.product.promoPrice && it.product.promoPrice > 0 ? it.product.promoPrice : it.product.normalPrice;
    return sum + price * it.qty;
  }, 0);

  const isFreeDelivery = subtotal >= (settings.freeDeliveryThreshold || 150000);
  const deliveryFee = deliveryType === 'delivery' ? (isFreeDelivery ? 0 : (settings.deliveryFeeFixed || 15000)) : 0;
  const grandTotal = Math.max(0, subtotal - discountAmount + deliveryFee);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Verify Store Operating Hours
    if (!storeStatus.isOpen) {
      setErrorMessage(`Toko saat ini tutup. Pemesanan online hanya dilayani saat jam buka toko: ${storeStatus.openTime} – ${storeStatus.closeTime} WIB. Pesanan diproses berurutan sesuai urutan dan jam order.`);
      return;
    }

    // Form Validations
    if (!customerName.trim()) {
      setErrorMessage('Mohon masukkan nama lengkap pelanggan.');
      return;
    }
    if (!customerPhone.trim() || customerPhone.replace(/\D/g, '').length < 9) {
      setErrorMessage('Mohon masukkan nomor HP/WhatsApp yang aktif (minimal 9 digit).');
      return;
    }
    if (deliveryType === 'delivery' && !deliveryAddress.trim()) {
      setErrorMessage('Mohon masukkan alamat lengkap untuk pengiriman.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Execute strict FEFO order creation in storage service
      const itemsToBuy = cart.map(it => ({
        productId: it.productId,
        qty: it.qty,
      }));

      const { order, receipt } = BakeryStorageService.createOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        deliveryType,
        deliveryAddress: deliveryType === 'delivery' ? deliveryAddress.trim() : undefined,
        deliveryFee,
        pickupTimeSlot,
        notes: notes.trim() || undefined,
        items: itemsToBuy,
        voucherCode,
        paymentMethod,
        channel: 'online',
        orderStatus: 'menunggu_konfirmasi',
        paymentStatus: paymentMethod === 'tunai' ? 'menunggu_pembayaran' : 'menunggu_verifikasi',
      });

      // Clear cart locally
      BakeryStorageService.saveCart([]);

      onOrderSuccess(order, receipt);
    } catch (err: unknown) {
      console.error('Checkout error:', err);
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan dalam proses checkout.';
      setErrorMessage(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#DFCBB5] overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#FAF7F2] border-b border-[#E8DEC8] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#8D5B36] flex items-center justify-center text-white">
              <ShoppingBag className="w-5 h-5 text-[#FFE2B8]" />
            </div>
            <div>
              <h2 className="font-serif-bakery font-bold text-xl text-[#3A241D]">
                Formulir Pemesanan & Checkout
              </h2>
              <span className="text-xs text-[#7A584A]">
                Sistem Validasi Stok FEFO & Struk Digital Otentik
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#7A584A] hover:bg-white transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Jadwal Toko & Ketentuan Antrean Pesanan Online */}
          <div className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-2 ${
            storeStatus.isOpen
              ? 'bg-[#FAF6F0] border-[#E8DEC8] text-[#5C453C]'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}>
            <div className="flex items-center justify-between gap-2 border-b border-[#F0EBE1] pb-2">
              <div className="flex items-center gap-2 font-bold text-[#3A241D]">
                <Clock className="w-4 h-4 text-[#B45309]" />
                <span>Jadwal Operasional Toko: {settings.openTime} – {settings.closeTime} WIB</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                storeStatus.isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {storeStatus.isOpen ? '● BUKA' : '✕ TUTUP'}
              </span>
            </div>
            <p className="text-[11px] text-[#6B4F43]">
              <strong>Ketentuan Antrean Pesanan Online:</strong> Seluruh pesanan online akan dilayani dan diproses berurutan sesuai <strong>nomor urut antrean dan jam masuk order (FIFO)</strong>. Order hanya dilayani ketika order dibuat pada jam buka toko.
            </p>
            {!storeStatus.isOpen && (
              <div className="pt-2 border-t border-rose-200 text-rose-700 font-semibold flex items-center gap-1.5 text-[11px]">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                <span>Saat ini toko tutup. Formulir pemesanan hanya dapat dikonfirmasi saat toko buka kembali pukul {settings.openTime} WIB.</span>
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Gagal Memproses Pesanan:</span>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Section 1: Data Pelanggan */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#9A6237] border-b border-[#F0EBE1] pb-1.5">
              1. Informasi Pemesan
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#5C453C] mb-1">
                  Nama Lengkap <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Amanda Kusuma"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFCBB5] text-xs text-[#3A241D] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8D5B36]/20 focus:border-[#8D5B36]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5C453C] mb-1">
                  Nomor WhatsApp / HP <span className="text-rose-600">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Contoh: 081234567890"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFCBB5] text-xs text-[#3A241D] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8D5B36]/20 focus:border-[#8D5B36]"
                />
                <span className="text-[10px] text-[#8C6D62] mt-0.5 block">
                  Digunakan untuk konfirmasi pesanan dan pengiriman struk digital.
                </span>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#5C453C] mb-1">
                  Alamat Email (Opsional)
                </label>
                <input
                  type="email"
                  placeholder="amanda@contoh.com"
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFCBB5] text-xs text-[#3A241D] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8D5B36]/20 focus:border-[#8D5B36]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Metode Pengiriman */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#9A6237] border-b border-[#F0EBE1] pb-1.5">
              2. Metode Pengambilan / Pengiriman
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                  deliveryType === 'pickup'
                    ? 'bg-[#FAF0E4] border-[#8D5B36] shadow-2xs'
                    : 'bg-white border-[#E8DEC8] hover:bg-[#FAF6F0]'
                }`}
              >
                <input
                  type="radio"
                  name="deliveryType"
                  checked={deliveryType === 'pickup'}
                  onChange={() => setDeliveryType('pickup')}
                  className="mt-1 text-[#8D5B36] focus:ring-[#8D5B36]"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-[#3A241D]">
                    <Store className="w-3.5 h-3.5 text-[#8D5B36]" />
                    <span>Ambil Sendiri di Toko</span>
                  </div>
                  <span className="text-[11px] text-[#7A584A] block mt-0.5">
                    Gratis. Ambil di gerai {settings.address}.
                  </span>
                </div>
              </label>

              <label
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                  deliveryType === 'delivery'
                    ? 'bg-[#FAF0E4] border-[#8D5B36] shadow-2xs'
                    : 'bg-white border-[#E8DEC8] hover:bg-[#FAF6F0]'
                }`}
              >
                <input
                  type="radio"
                  name="deliveryType"
                  checked={deliveryType === 'delivery'}
                  onChange={() => setDeliveryType('delivery')}
                  className="mt-1 text-[#8D5B36] focus:ring-[#8D5B36]"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-[#3A241D]">
                    <MapPin className="w-3.5 h-3.5 text-[#8D5B36]" />
                    <span>Pengiriman Kurir Bakery</span>
                  </div>
                  <span className="text-[11px] text-[#7A584A] block mt-0.5">
                    {isFreeDelivery ? 'GRATIS ONGKIR' : `Biaya ${formatRupiah(settings.deliveryFeeFixed || 15000)}`}
                  </span>
                </div>
              </label>
            </div>

            {deliveryType === 'delivery' ? (
              <div>
                <label className="block text-xs font-semibold text-[#5C453C] mb-1">
                  Alamat Lengkap Pengiriman <span className="text-rose-600">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Jl. Nama Jalan, No. Rumah, RT/RW, Patokan..."
                  value={deliveryAddress}
                  onChange={e => setDeliveryAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFCBB5] text-xs text-[#3A241D] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8D5B36]/20 focus:border-[#8D5B36]"
                />
              </div>
            ) : null}

            {/* Waktu slot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#5C453C] mb-1">
                  Pilihan Slot Waktu Siap
                </label>
                <select
                  value={pickupTimeSlot}
                  onChange={e => setPickupTimeSlot(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFCBB5] text-xs text-[#3A241D] bg-white focus:outline-none focus:ring-2 focus:ring-[#8D5B36]/20"
                >
                  <option value="Pagi: 08:00 - 10:00 WIB">Pagi: 08:00 - 10:00 WIB</option>
                  <option value="Siang: 11:00 - 13:00 WIB">Siang: 11:00 - 13:00 WIB</option>
                  <option value="Sore: 14:00 - 17:00 WIB">Sore: 14:00 - 17:00 WIB</option>
                  <option value="Malam: 18:00 - 20:30 WIB">Malam: 18:00 - 20:30 WIB</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5C453C] mb-1">
                  Catatan Tambahan untuk Dapur (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Pisahkan sambal / bungkus kado"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFCBB5] text-xs text-[#3A241D] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8D5B36]/20"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Metode Pembayaran */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#9A6237] border-b border-[#F0EBE1] pb-1.5">
              3. Metode Pembayaran
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-2 ${
                  paymentMethod === 'qris'
                    ? 'bg-[#FAF0E4] border-[#8D5B36] shadow-2xs'
                    : 'bg-white border-[#E8DEC8] hover:bg-[#FAF6F0]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'qris'}
                    onChange={() => setPaymentMethod('qris')}
                    className="text-[#8D5B36] focus:ring-[#8D5B36]"
                  />
                  <span className="font-bold text-xs text-[#3A241D]">QRIS Digital</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-[#7A584A]">
                  <QrCode className="w-4 h-4 text-[#8D5B36]" />
                  <span>GoPay, OVO, ShopeePay</span>
                </div>
              </label>

              <label
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-2 ${
                  paymentMethod === 'transfer_bank'
                    ? 'bg-[#FAF0E4] border-[#8D5B36] shadow-2xs'
                    : 'bg-white border-[#E8DEC8] hover:bg-[#FAF6F0]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'transfer_bank'}
                    onChange={() => setPaymentMethod('transfer_bank')}
                    className="text-[#8D5B36] focus:ring-[#8D5B36]"
                  />
                  <span className="font-bold text-xs text-[#3A241D]">Transfer Bank</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-[#7A584A]">
                  <CreditCard className="w-4 h-4 text-[#8D5B36]" />
                  <span>BCA, Mandiri, BRI</span>
                </div>
              </label>

              <label
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-2 ${
                  paymentMethod === 'tunai'
                    ? 'bg-[#FAF0E4] border-[#8D5B36] shadow-2xs'
                    : 'bg-white border-[#E8DEC8] hover:bg-[#FAF6F0]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'tunai'}
                    onChange={() => setPaymentMethod('tunai')}
                    className="text-[#8D5B36] focus:ring-[#8D5B36]"
                  />
                  <span className="font-bold text-xs text-[#3A241D]">Tunai (Cash)</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-[#7A584A]">
                  <Banknote className="w-4 h-4 text-[#8D5B36]" />
                  <span>Bayar saat di toko / COD</span>
                </div>
              </label>
            </div>

            <p className="text-[11px] text-[#8C6D62] italic">
              *Catatan Keamanan: Transaksi Anda akan berstatus "Menunggu Verifikasi" dan dikonfirmasi resmi oleh admin bakery kami.
            </p>
          </div>

          {/* Section 4: Ringkasan Rincian Biaya */}
          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DEC8] space-y-2 text-xs">
            <span className="font-bold text-[#3A241D] block">Ringkasan Total Pesanan:</span>
            <div className="flex justify-between text-[#6B4F43]">
              <span>Subtotal ({cart.reduce((s, it) => s + it.qty, 0)} item)</span>
              <span className="font-mono-nums font-semibold">{formatRupiah(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Diskon Voucher ({voucherCode})</span>
                <span className="font-mono-nums font-semibold">-{formatRupiah(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-[#6B4F43]">
              <span>Ongkos Pengiriman ({deliveryType === 'delivery' ? 'Kurir Toko' : 'Ambil Sendiri'})</span>
              <span className="font-mono-nums font-semibold">{deliveryFee === 0 ? 'Rp 0' : formatRupiah(deliveryFee)}</span>
            </div>
            <div className="pt-2 border-t border-[#E8DEC8] flex justify-between items-baseline font-bold text-sm text-[#3A241D]">
              <span>Total Akhir</span>
              <span className="text-lg text-[#B45309] font-mono-nums">{formatRupiah(grandTotal)}</span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !storeStatus.isOpen}
              className={`w-full py-4 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                storeStatus.isOpen
                  ? 'bg-[#8D5B36] hover:bg-[#724524] text-white shadow-[#8D5B36]/25 disabled:opacity-60'
                  : 'bg-slate-200 text-slate-500 border border-slate-300 cursor-not-allowed shadow-none'
              }`}
            >
              {isSubmitting ? (
                <span>Memvalidasi Stok FEFO & Menyimpan...</span>
              ) : !storeStatus.isOpen ? (
                <span>Toko Tutup — Buka Pukul {storeStatus.openTime} WIB</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#FFE2B8]" />
                  <span>Konfirmasi & Buat Pesanan Sekarang</span>
                </>
              )}
            </button>
            <div className="mt-2 text-center flex items-center justify-center gap-1.5 text-[11px] text-[#8C6D62]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>Data pesanan tersimpan secara aman di database toko.</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
