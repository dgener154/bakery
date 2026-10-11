import React, { useState } from 'react';
import { ShoppingBag, Search, CheckCircle, Clock, XCircle, MessageCircle, Receipt, Printer, AlertTriangle, Eye } from 'lucide-react';
import { DigitalReceipt, Order, OrderStatus, PaymentStatus, StoreSettings, UserAccount } from '../../types/bakery';
import { formatDateTimeIndo, formatRupiah, getOrderStatusLabel, getPaymentMethodLabel, getPaymentStatusLabel } from '../../utils/formatters';
import { BakeryStorageService } from '../../services/storage';

interface OrderManagementProps {
  orders: Order[];
  receipts: DigitalReceipt[];
  settings: StoreSettings;
  currentUser: UserAccount;
  onOpenReceipt: (receipt: DigitalReceipt) => void;
  onRefreshData: () => void;
}

export const OrderManagement: React.FC<OrderManagementProps> = ({
  orders,
  receipts,
  settings,
  currentUser,
  onOpenReceipt,
  onRefreshData,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [kitchenPrintOrder, setKitchenPrintOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter(o => {
    if (filterStatus !== 'all' && o.orderStatus !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return o.orderNumber.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q);
    }
    return true;
  });

  // Action: Update status
  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    try {
      BakeryStorageService.updateOrderStatus(orderId, newStatus, `Diperbarui oleh ${currentUser.name}`);
      onRefreshData();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Action: Verify Payment
  const handleVerifyPayment = (orderId: string) => {
    try {
      BakeryStorageService.verifyPayment(orderId, 'terverifikasi');
      onRefreshData();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, paymentStatus: 'terverifikasi' });
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Action: Cancel Order (safe stock restoration)
  const handleCancelOrder = (orderId: string) => {
    const reason = prompt('Masukkan alasan pembatalan pesanan:');
    if (!reason) return;
    try {
      BakeryStorageService.cancelOrder(orderId, reason);
      onRefreshData();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, orderStatus: 'dibatalkan', paymentStatus: 'dibatalkan' });
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Send WhatsApp notification
  const handleSendWhatsApp = (order: Order) => {
    const cleanPhone = order.customerPhone.replace(/\D/g, '');
    const phone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
    const msg = `Halo Kak *${order.customerName}*,\n\nUpdate dari *${settings.storeName}*:\nPesanan Anda *${order.orderNumber}* saat ini berstatus: *${getOrderStatusLabel(order.orderStatus).label}*.\n\nTotal: ${formatRupiah(order.totalAmount)}\nMetode: ${getPaymentMethodLabel(order.paymentMethod)}\n\nTerima kasih telah berbelanja di ${settings.storeName}!`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-[#E8DEC8] shadow-2xs">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#9A6237]">
            Operasional Pesanan
          </span>
          <h1 className="font-serif-bakery font-bold text-2xl text-[#3A241D] flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-[#8D5B36]" />
            <span>Manajemen Pesanan Online & POS</span>
          </h1>
          <p className="text-xs text-[#7A584A] mt-1">
            Konfirmasi pesanan, verifikasi pembayaran, cetak lembar persiapan dapur, dan pantau status pengiriman.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#E8DEC8]">
        <div className="flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
          <span className="text-[#8C6D62] font-semibold text-[11px] shrink-0">Filter Status:</span>
          {['all', 'menunggu_konfirmasi', 'menunggu_pembayaran', 'pembayaran_terverifikasi', 'sedang_disiapkan', 'siap_diambil', 'selesai', 'dibatalkan'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                filterStatus === st
                  ? 'bg-[#8D5B36] text-white shadow-2xs'
                  : 'bg-[#FAF6F0] text-[#6B4F43] hover:bg-[#F3E3D1]'
              }`}
            >
              {st === 'all' ? 'Semua' : getOrderStatusLabel(st as any).label}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Cari nomor pesanan / pemesan..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-[#DFCBB5] text-xs text-[#3A241D] bg-[#FAF7F2] w-full sm:w-60"
        />
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-[#E8DEC8] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E8DEC8] bg-[#FAF7F2] text-[#8C6D62] uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">No. Pesanan</th>
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4">Pelanggan</th>
                <th className="py-3 px-4">Kanal & Pengiriman</th>
                <th className="py-3 px-4">Status Pesanan</th>
                <th className="py-3 px-4">Pembayaran</th>
                <th className="py-3 px-4 text-right">Total</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2ECE1]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-[#8C6D62]">
                    Tidak ada pesanan yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => {
                  const statusInfo = getOrderStatusLabel(order.orderStatus);
                  const payInfo = getPaymentStatusLabel(order.paymentStatus);

                  return (
                    <tr key={order.id} className="hover:bg-[#FAF7F2] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-[#FAF0E4] text-[#8C4F1A] font-bold text-[10px] font-mono shrink-0" title="Nomor Urut Antrean">
                            #{order.queueNumber || 1}
                          </span>
                          <span className="font-mono font-bold text-[#3A241D]">{order.orderNumber}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[#8C6D62] whitespace-nowrap">
                        {formatDateTimeIndo(order.createdAt)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-[#3A241D] block">{order.customerName}</span>
                        <span className="text-[10px] text-[#8C6D62]">{order.customerPhone}</span>
                      </td>
                      <td className="py-3.5 px-4 text-[#5C453C]">
                        <span className="block font-medium">
                          {order.channel === 'kasir_pos' ? 'POS Toko' : 'Web Online'}
                        </span>
                        <span className="text-[10px] text-[#8C6D62]">
                          {order.deliveryType === 'delivery' ? 'Kurir Toko' : 'Ambil Sendiri'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-block ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border inline-block ${payInfo.color}`}>
                          {payInfo.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono-nums font-bold text-[#3A241D]">
                        {formatRupiah(order.totalAmount)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 rounded-lg text-[#5C453C] hover:bg-[#FAF0E4] border border-[#DFCBB5] cursor-pointer"
                            title="Detail & Kelola"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              const r = receipts.find(rcp => rcp.orderId === order.id || rcp.orderNumber === order.orderNumber);
                              if (r) onOpenReceipt(r);
                              else alert('Struk belum tersedia.');
                            }}
                            className="p-1.5 rounded-lg text-[#8D5B36] hover:bg-[#FAF0E4] border border-[#DFCBB5] cursor-pointer"
                            title="Buka Struk"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                          </button>
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

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#DFCBB5] p-6 space-y-5 my-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#F0EBE1] pb-3">
              <div>
                <span className="font-mono font-bold text-base text-[#3A241D] block">
                  {selectedOrder.orderNumber}
                </span>
                <span className="text-xs text-[#8C6D62]">
                  {formatDateTimeIndo(selectedOrder.createdAt)} · Kanal: {selectedOrder.channel}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-[#8C6D62] hover:text-[#3A241D] cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            {/* Quick Status Control Ribbon */}
            <div className="p-3 rounded-xl bg-[#FAF6F0] border border-[#E8DEC8] space-y-2 text-xs">
              <span className="font-bold text-[#3A241D] block">Ubah Status Alur Pesanan:</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedOrder.paymentStatus !== 'terverifikasi' && (
                  <button
                    onClick={() => handleVerifyPayment(selectedOrder.id)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
                  >
                    ✓ Verifikasi Lunas
                  </button>
                )}
                <button
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'sedang_disiapkan')}
                  className="px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-semibold cursor-pointer"
                >
                  Sedang Disiapkan
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'siap_diambil')}
                  className="px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold cursor-pointer"
                >
                  Siap Diambil/Kirim
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'selesai')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold cursor-pointer"
                >
                  Tandai Selesai
                </button>
                {selectedOrder.orderStatus !== 'dibatalkan' && (
                  <button
                    onClick={() => handleCancelOrder(selectedOrder.id)}
                    className="px-3 py-1.5 rounded-lg bg-rose-100 text-rose-800 hover:bg-rose-200 font-semibold cursor-pointer"
                  >
                    Batalkan (Kembalikan Stok)
                  </button>
                )}
              </div>
            </div>

            {/* Customer & Delivery Info */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-[#FAF7F2] p-3.5 rounded-xl border border-[#E8DEC8]">
              <div>
                <span className="text-[#8C6D62] text-[10px] block">Pemesan:</span>
                <span className="font-semibold text-[#3A241D] block">{selectedOrder.customerName}</span>
                <span className="text-[#7A584A]">{selectedOrder.customerPhone}</span>
              </div>
              <div>
                <span className="text-[#8C6D62] text-[10px] block">Metode Pengiriman:</span>
                <span className="font-semibold text-[#3A241D] block">
                  {selectedOrder.deliveryType === 'delivery' ? 'Kurir Toko' : 'Ambil di Toko'}
                </span>
                {selectedOrder.deliveryAddress && (
                  <span className="text-[11px] text-[#7A584A]">{selectedOrder.deliveryAddress}</span>
                )}
              </div>
            </div>

            {/* Allocated Batches and Item Breakdown */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-[#3A241D] block">Rincian Item & Alokasi FEFO:</span>
              <div className="space-y-2 divide-y divide-[#F2ECE1]">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="pt-2 space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span>{item.productName} ({item.qty} pcs)</span>
                      <span className="font-mono-nums">{formatRupiah(item.subtotal)}</span>
                    </div>
                    <div className="text-[10px] text-[#8C6D62] flex flex-wrap gap-2">
                      {item.allocatedBatches.map((b, bIdx) => (
                        <span key={bIdx} className="bg-white px-2 py-0.5 rounded border border-[#DFCBB5]">
                          Batch: {b.batchCode} ({b.qty}x) · Exp: {new Date(b.expiryDate).toLocaleDateString('id-ID')}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="pt-3 border-t border-[#F0EBE1] flex justify-between items-baseline font-bold text-sm">
              <span>Total Akhir</span>
              <span className="text-base text-[#B45309] font-mono-nums">
                {formatRupiah(selectedOrder.totalAmount)}
              </span>
            </div>

            {/* Actions: Kitchen Ticket & WhatsApp Notification */}
            <div className="pt-2 flex flex-wrap gap-2 justify-end">
              <button
                onClick={() => handleSendWhatsApp(selectedOrder)}
                className="px-3 py-2 rounded-xl bg-[#25D366] text-white text-xs font-semibold hover:bg-[#20ba59] flex items-center gap-1.5 cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Kirim WA ke Pelanggan</span>
              </button>

              <button
                onClick={() => {
                  const r = receipts.find(rcp => rcp.orderId === selectedOrder.id || rcp.orderNumber === selectedOrder.orderNumber);
                  if (r) onOpenReceipt(r);
                }}
                className="px-4 py-2 rounded-xl bg-[#8D5B36] text-white text-xs font-semibold hover:bg-[#724524] flex items-center gap-1.5 cursor-pointer"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Buka Struk Digital</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
