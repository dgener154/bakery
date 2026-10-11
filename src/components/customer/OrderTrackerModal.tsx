import React, { useState } from 'react';
import { X, Search, CheckCircle2, Clock, AlertCircle, Receipt, ArrowRight, ShieldCheck } from 'lucide-react';
import { DigitalReceipt, Order, StoreSettings } from '../../types/bakery';
import { formatDateTimeIndo, formatRupiah, getOrderStatusLabel, getPaymentStatusLabel } from '../../utils/formatters';

interface OrderTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  receipts: DigitalReceipt[];
  settings: StoreSettings;
  onViewReceipt: (receipt: DigitalReceipt) => void;
}

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({
  isOpen,
  onClose,
  orders,
  receipts,
  settings,
  onViewReceipt,
}) => {
  if (!isOpen) return null;

  const [orderQuery, setOrderQuery] = useState('');
  const [phoneQuery, setPhoneQuery] = useState('');
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);
    setHasSearched(true);

    const cleanOrderNo = orderQuery.trim().toUpperCase();
    const cleanPhone = phoneQuery.trim().replace(/\D/g, '');

    if (!cleanOrderNo) {
      setSearchError('Masukkan nomor pesanan Anda.');
      setFoundOrder(null);
      return;
    }

    const matched = orders.find(o => {
      const isOrderMatch = o.orderNumber.toUpperCase() === cleanOrderNo || o.id === cleanOrderNo;
      if (!isOrderMatch) return false;
      // If phone is provided, verify phone matching
      if (cleanPhone) {
        return o.customerPhone.replace(/\D/g, '').endsWith(cleanPhone);
      }
      return true;
    });

    if (matched) {
      setFoundOrder(matched);
      setSearchError(null);
    } else {
      setFoundOrder(null);
      setSearchError('Pesanan tidak ditemukan. Pastikan Nomor Pesanan dan Nomor HP sudah sesuai.');
    }
  };

  // Status timeline steps
  const allSteps: { status: string; label: string }[] = [
    { status: 'menunggu_konfirmasi', label: 'Menunggu Konfirmasi' },
    { status: 'pembayaran_terverifikasi', label: 'Pembayaran Diverifikasi' },
    { status: 'sedang_disiapkan', label: 'Sedang Disiapkan Dapur' },
    { status: 'siap_diambil', label: 'Siap Diambil / Dikirim' },
    { status: 'selesai', label: 'Selesai' },
  ];

  const getStepState = (stepStatus: string, currentStatus: string) => {
    if (currentStatus === 'dibatalkan') return 'cancelled';
    const statusOrder = ['menunggu_konfirmasi', 'menunggu_pembayaran', 'pembayaran_terverifikasi', 'diproses', 'sedang_disiapkan', 'siap_diambil', 'dalam_pengiriman', 'selesai'];
    const currentIdx = statusOrder.indexOf(currentStatus);
    const stepIdx = statusOrder.indexOf(stepStatus);

    if (currentIdx >= stepIdx) return 'completed';
    return 'pending';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#DFCBB5] overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#FAF7F2] border-b border-[#E8DEC8] flex items-center justify-between">
          <div>
            <h2 className="font-serif-bakery font-bold text-xl text-[#3A241D]">
              Lacak Status Pesanan
            </h2>
            <span className="text-xs text-[#7A584A]">
              Verifikasi status produksi, pembayaran, dan struk digital Anda
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#7A584A] hover:bg-white transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-7 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="space-y-3 bg-[#FAF6F0] p-4 rounded-2xl border border-[#E8DEC8]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#5C453C] mb-1">
                  Nomor Pesanan <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: ORD-20261010-1011"
                  value={orderQuery}
                  onChange={e => setOrderQuery(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DFCBB5] text-xs text-[#3A241D] bg-white font-mono focus:outline-none focus:ring-1 focus:ring-[#8D5B36]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5C453C] mb-1">
                  Nomor HP Pemesan (Verifikasi)
                </label>
                <input
                  type="tel"
                  placeholder="Contoh: 081234567890"
                  value={phoneQuery}
                  onChange={e => setPhoneQuery(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DFCBB5] text-xs text-[#3A241D] bg-white focus:outline-none focus:ring-1 focus:ring-[#8D5B36]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#8D5B36] hover:bg-[#724524] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Cari Status Pesanan</span>
            </button>
          </form>

          {searchError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{searchError}</span>
            </div>
          )}

          {/* Result Card */}
          {foundOrder ? (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Order Banner */}
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DEC8] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-[#3A241D]">
                    {foundOrder.orderNumber}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getOrderStatusLabel(foundOrder.orderStatus).color}`}>
                    {getOrderStatusLabel(foundOrder.orderStatus).label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-[#6B4F43] pt-1 border-t border-[#E8DEC8]/80">
                  <div>
                    <span className="text-[10px] text-[#8C6D62] block">Nomor Antrean Online</span>
                    <span className="font-mono font-bold text-sm text-[#B45309]">#{foundOrder.queueNumber || 1}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8C6D62] block">Waktu Pesan Masuk</span>
                    <span>{formatDateTimeIndo(foundOrder.createdAt)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8C6D62] block">Pemesan</span>
                    <span className="font-semibold">{foundOrder.customerName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8C6D62] block">Metode Pembayaran</span>
                    <span>{foundOrder.paymentMethod.toUpperCase()} ({getPaymentStatusLabel(foundOrder.paymentStatus).label})</span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-[#E8DEC8]/60 flex items-center justify-between">
                    <span className="text-[11px] text-[#8C6D62]">Total Pembayaran</span>
                    <span className="font-bold text-base text-[#B45309] font-mono-nums">{formatRupiah(foundOrder.totalAmount)}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                  ⚡ <strong>Jadwal Pelayanan Antrean:</strong> Pesanan online dilayani dan disiapkan berurutan sesuai nomor antrean transaksi dan jam order masuk (FIFO) pada jam buka toko ({settings.openTime} – {settings.closeTime} WIB).
                </div>
              </div>

              {/* Progress Stepper Timeline */}
              <div className="p-4 rounded-2xl bg-white border border-[#E8DEC8] space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#9A6237]">
                  Alur Proses Pesanan
                </h4>

                <div className="space-y-3 pt-1">
                  {allSteps.map((step, idx) => {
                    const state = getStepState(step.status, foundOrder.orderStatus);
                    return (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="relative flex flex-col items-center">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              state === 'completed'
                                ? 'bg-emerald-600 text-white'
                                : state === 'cancelled'
                                ? 'bg-rose-500 text-white'
                                : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            {state === 'completed' ? '✓' : idx + 1}
                          </div>
                          {idx < allSteps.length - 1 && (
                            <div className={`w-0.5 h-6 mt-1 ${state === 'completed' ? 'bg-emerald-600' : 'bg-slate-200'}`} />
                          )}
                        </div>

                        <div className="pt-0.5">
                          <span className={`text-xs font-semibold block ${state === 'completed' ? 'text-[#3A241D]' : 'text-slate-400'}`}>
                            {step.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Items in this order */}
              <div className="p-4 rounded-2xl bg-white border border-[#E8DEC8] space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#9A6237]">
                  Produk yang Dipesan
                </h4>
                <div className="space-y-2 divide-y divide-[#F2ECE1]">
                  {foundOrder.items.map((item, itIdx) => (
                    <div key={itIdx} className="pt-2 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-semibold text-[#3A241D] block">{item.productName}</span>
                        <span className="text-[10px] text-[#8C6D62]">
                          {item.qty} pcs × {formatRupiah(item.unitPrice)}
                        </span>
                      </div>
                      <span className="font-mono-nums font-semibold text-[#3A241D]">
                        {formatRupiah(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* View Digital Receipt button */}
              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => {
                    const r = receipts.find(rcp => rcp.orderId === foundOrder.id || rcp.orderNumber === foundOrder.orderNumber);
                    if (r) {
                      onViewReceipt(r);
                    } else {
                      alert('Struk sedang diproses oleh kasir.');
                    }
                  }}
                  className="flex-1 py-3 rounded-xl bg-[#8D5B36] hover:bg-[#724524] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  <Receipt className="w-4 h-4" />
                  <span>Buka Struk Digital Resmi</span>
                </button>
              </div>
            </div>
          ) : hasSearched && !searchError ? null : (
            <div className="text-center py-6 text-xs text-[#8C6D62] space-y-2">
              <p>Tips: Nomor pesanan dapat dilihat pada pesan konfirmasi atau struk pembelian Anda.</p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF0E4] text-[#8C4F1A] text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Pelacakan real-time langsung tersinkronisasi dengan dapur</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
