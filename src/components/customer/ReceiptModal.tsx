import React, { useState } from 'react';
import { X, Printer, Download, MessageCircle, Store, CheckCircle, Clock } from 'lucide-react';
import { DigitalReceipt, StoreSettings } from '../../types/bakery';
import { formatDateTimeIndo, formatRupiah, getOrderStatusLabel, getPaymentMethodLabel, getPaymentStatusLabel } from '../../utils/formatters';
import { generateReceiptPdf, generateWhatsAppMessage } from '../../utils/pdfReceipt';

interface ReceiptModalProps {
  receipt: DigitalReceipt | null;
  settings: StoreSettings;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ receipt, settings, onClose }) => {
  if (!receipt) return null;

  // View formats: 'thermal58' | 'thermal80' | 'a4'
  const [printFormat, setPrintFormat] = useState<'thermal58' | 'thermal80' | 'a4'>('thermal80');

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    generateReceiptPdf(receipt, settings);
  };

  const handleShareWhatsApp = () => {
    const url = generateWhatsAppMessage(receipt, settings);
    window.open(url, '_blank');
  };

  const orderStatus = getOrderStatusLabel(receipt.orderStatus);
  const paymentStatus = getPaymentStatusLabel(receipt.paymentStatus);

  // Format width container class
  const formatWidthClass = {
    thermal58: 'max-w-[320px]',
    thermal80: 'max-w-[420px]',
    a4: 'max-w-[680px]',
  }[printFormat];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-3xl bg-[#FAF7F2] rounded-3xl shadow-2xl border border-[#DFCBB5] overflow-hidden my-4 flex flex-col max-h-[92vh]">
        {/* Top Control Bar (Non-printable) */}
        <div className="p-4 bg-white border-b border-[#E8DEC8] flex flex-wrap items-center justify-between gap-3 shrink-0 no-print">
          <div>
            <h3 className="font-serif-bakery font-bold text-base text-[#3A241D] flex items-center gap-2">
              <span>Struk Digital Pelanggan</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-sans font-semibold">
                Otentik
              </span>
            </h3>
            <span className="text-xs text-[#8C6D62] font-mono">
              {receipt.receiptNumber}
            </span>
          </div>

          {/* Format selector buttons */}
          <div className="flex flex-wrap items-center gap-1 bg-[#FAF0E4] p-1 rounded-xl border border-[#DFCBB5]">
            <button
              onClick={() => setPrintFormat('thermal58')}
              className={`px-2 py-1 text-[11px] sm:text-xs font-semibold rounded-lg transition-colors cursor-pointer min-h-[32px] ${
                printFormat === 'thermal58' ? 'bg-[#8D5B36] text-white shadow-2xs' : 'text-[#6B4F43] hover:text-[#3A241D]'
              }`}
            >
              58mm
            </button>
            <button
              onClick={() => setPrintFormat('thermal80')}
              className={`px-2 py-1 text-[11px] sm:text-xs font-semibold rounded-lg transition-colors cursor-pointer min-h-[32px] ${
                printFormat === 'thermal80' ? 'bg-[#8D5B36] text-white shadow-2xs' : 'text-[#6B4F43] hover:text-[#3A241D]'
              }`}
            >
              80mm
            </button>
            <button
              onClick={() => setPrintFormat('a4')}
              className={`px-2 py-1 text-[11px] sm:text-xs font-semibold rounded-lg transition-colors cursor-pointer min-h-[32px] ${
                printFormat === 'a4' ? 'bg-[#8D5B36] text-white shadow-2xs' : 'text-[#6B4F43] hover:text-[#3A241D]'
              }`}
            >
              A4
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#7A584A] hover:bg-[#FAF0E4] transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Receipt Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex justify-center bg-[#F2EDE4]">
          {/* The Actual Printable Receipt Container */}
          <div
            className={`printable-receipt w-full ${formatWidthClass} bg-white shadow-md border border-[#E0D5C3] p-6 sm:p-7 transition-all font-sans text-xs text-[#2D2422] leading-relaxed`}
          >
            {/* Header / Store Branding */}
            <div className="text-center pb-4 border-b border-dashed border-[#D2C5B3]">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#8D5B36] text-white mb-2">
                <Store className="w-5 h-5" />
              </div>
              <h2 className="font-serif-bakery font-bold text-lg sm:text-xl text-[#3A241D] tracking-tight uppercase">
                {settings.storeName}
              </h2>
              <p className="text-[11px] text-[#7A584A]">{settings.slogan}</p>
              <p className="text-[10px] text-[#8C6D62] mt-0.5">{settings.address}, {settings.city}</p>
              <p className="text-[10px] text-[#8C6D62]">Telp: {settings.phone} · WA: {settings.whatsapp}</p>
            </div>

            {/* Receipt Identification */}
            <div className="py-3 border-b border-dashed border-[#D2C5B3] space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#8C6D62]">No. Struk</span>
                <span className="font-mono font-bold text-[#3A241D]">{receipt.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8C6D62]">No. Pesanan</span>
                <span className="font-mono font-semibold">{receipt.orderNumber}</span>
              </div>
              <div className="flex justify-between items-center bg-[#FAF6F0] px-2 py-0.5 rounded border border-[#EFE5D7]">
                <span className="text-[#8C6D62] font-semibold">Nomor Antrean Pelayanan</span>
                <span className="font-mono font-bold text-xs text-[#B45309]">#{receipt.queueNumber || 1} (Sesuai Jam Order)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8C6D62]">Waktu Transaksi</span>
                <span>{formatDateTimeIndo(receipt.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8C6D62]">Pelanggan</span>
                <span className="font-semibold">{receipt.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8C6D62]">Kanal & Kasir</span>
                <span>
                  {receipt.channel === 'kasir_pos' ? 'POS Toko' : 'Online'} · {receipt.cashierName || 'Online System'}
                </span>
              </div>
              {receipt.deliveryType === 'delivery' && receipt.deliveryAddress && (
                <div className="pt-1 text-[10px] text-[#6B4F43]">
                  <span className="text-[#8C6D62] block">Alamat Kirim:</span>
                  <span>{receipt.deliveryAddress}</span>
                </div>
              )}
            </div>

            {/* Status Indicators */}
            <div className="py-2.5 border-b border-dashed border-[#D2C5B3] flex items-center justify-between text-[11px]">
              <div>
                <span className="text-[#8C6D62] text-[10px] block">Status Pesanan</span>
                <span className="font-semibold text-[#3A241D]">{orderStatus.label}</span>
              </div>
              <div className="text-right">
                <span className="text-[#8C6D62] text-[10px] block">Pembayaran</span>
                <span className="font-semibold text-[#15803D]">{paymentStatus.label}</span>
              </div>
            </div>

            {/* Items List */}
            <div className="py-3 border-b border-dashed border-[#D2C5B3] space-y-3">
              <div className="font-bold text-[10px] uppercase tracking-wider text-[#9A6237] pb-1 border-b border-[#F0EBE1] flex justify-between">
                <span>Produk & Batch Alokasi</span>
                <span>Subtotal</span>
              </div>

              {receipt.items.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between font-semibold text-[#3A241D]">
                    <span>
                      {item.productName} <span className="font-normal text-[#8C6D62]">×{item.qty}</span>
                    </span>
                    <span className="font-mono-nums">{formatRupiah(item.subtotal)}</span>
                  </div>

                  {/* Batch Tracking & Expiry Info for this item */}
                  <div className="text-[10px] bg-[#FAF7F2] p-1.5 rounded-md border border-[#F2ECE1] space-y-0.5 text-[#6B4F43]">
                    {item.allocatedBatches.map((alloc, aIdx) => (
                      <div key={aIdx} className="flex justify-between text-[10px]">
                        <span className="font-mono text-[#8D5B36] font-medium">
                          {alloc.batchCode} ({alloc.qty}x)
                        </span>
                        <span>Exp: {new Date(alloc.expiryDate).toLocaleDateString('id-ID')}</span>
                      </div>
                    ))}
                    {item.storageInstructions && (
                      <div className="text-[9px] text-[#8C6D62] italic pt-0.5">
                        Simpan: {item.storageInstructions}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations and Breakdown */}
            <div className="py-3 border-b border-dashed border-[#D2C5B3] space-y-1.5 text-[11px]">
              <div className="flex justify-between text-[#6B4F43]">
                <span>Subtotal Belanja</span>
                <span className="font-mono-nums font-semibold">{formatRupiah(receipt.subtotal)}</span>
              </div>

              {receipt.discountAmount > 0 && (
                <div className="flex justify-between text-[#15803D]">
                  <span>Diskon Promo</span>
                  <span className="font-mono-nums font-semibold">-{formatRupiah(receipt.discountAmount)}</span>
                </div>
              )}

              {receipt.deliveryFee > 0 && (
                <div className="flex justify-between text-[#6B4F43]">
                  <span>Biaya Pengiriman</span>
                  <span className="font-mono-nums">{formatRupiah(receipt.deliveryFee)}</span>
                </div>
              )}

              {receipt.taxAmount > 0 && (
                <div className="flex justify-between text-[#6B4F43]">
                  <span>Pajak</span>
                  <span className="font-mono-nums">{formatRupiah(receipt.taxAmount)}</span>
                </div>
              )}

              {/* Total Bayar */}
              <div className="pt-2 border-t border-[#F0EBE1] flex justify-between items-baseline font-bold text-sm text-[#3A241D]">
                <span>TOTAL AKHIR</span>
                <span className="text-base text-[#B45309] font-mono-nums">
                  {formatRupiah(receipt.totalAmount)}
                </span>
              </div>

              <div className="flex justify-between text-[10px] text-[#7A584A] pt-1">
                <span>Metode Pembayaran</span>
                <span className="font-semibold">{getPaymentMethodLabel(receipt.paymentMethod)}</span>
              </div>

              {receipt.paidAmount && receipt.paidAmount > 0 && (
                <>
                  <div className="flex justify-between text-[10px] text-[#7A584A]">
                    <span>Nominal Diterima</span>
                    <span className="font-mono-nums">{formatRupiah(receipt.paidAmount)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-[#3A241D]">
                    <span>Kembalian</span>
                    <span className="font-mono-nums">{formatRupiah(receipt.changeAmount || 0)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Footer Notes */}
            <div className="pt-4 text-center space-y-2">
              <div className="p-2 rounded bg-[#FAF6F0] border border-[#EFE5D7] text-[10px] text-[#6B4F43]">
                Pesanan online dilayani sesuai nomor urutan antrean & jam order (FIFO) pada jam buka toko: {settings.openTime} – {settings.closeTime} WIB.
              </div>
              <p className="font-serif-bakery italic text-[11px] text-[#5C453C]">
                "{settings.receiptFooterMessage}"
              </p>
              <p className="text-[9px] text-[#A68F81] leading-relaxed">
                {settings.complaintPolicy}
              </p>
              <div className="pt-2 text-[9px] text-[#8C6D62] font-mono">
                *** TERIMA KASIH ATAS KUNJUNGAN ANDA ***
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions Bar (Non-printable) */}
        <div className="p-4 bg-white border-t border-[#E8DEC8] flex flex-wrap items-center justify-between gap-3 shrink-0 no-print">
          <div className="text-xs text-[#7A584A] hidden sm:block">
            <span>Struk tersimpan permanen di riwayat pesanan.</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#8D5B36] hover:bg-[#724524] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Struk</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-white hover:bg-[#FAF0E4] text-[#3A241D] border border-[#DFCBB5] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh PDF</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Kirim ke WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
