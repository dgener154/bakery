import React from 'react';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Clock,
  Layers,
  ArrowRight,
  Package,
  Calendar,
  CreditCard,
  Banknote,
  CheckCircle2
} from 'lucide-react';
import { Order, Product, ProductionBatch, StoreSettings } from '../../types/bakery';
import { formatRupiah, getBatchStatusLabel, getOrderStatusLabel } from '../../utils/formatters';
import { BakeryStorageService } from '../../services/storage';

interface DashboardViewProps {
  orders: Order[];
  products: Product[];
  batches: ProductionBatch[];
  settings?: StoreSettings;
  onNavigateTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  orders,
  products,
  batches,
  settings: propSettings,
  onNavigateTab,
}) => {
  const settings = propSettings || BakeryStorageService.getSettings();
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const currentMonthStr = now.toISOString().slice(0, 7);

  // Sales computations
  const validOrders = orders.filter(o => o.orderStatus !== 'dibatalkan');

  const todayOrders = validOrders.filter(o => o.createdAt.startsWith(todayStr));
  const todaySales = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  const monthOrders = validOrders.filter(o => o.createdAt.startsWith(currentMonthStr));
  const monthSales = monthOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Order counts
  const newOrdersCount = orders.filter(o => o.orderStatus === 'menunggu_konfirmasi' || o.orderStatus === 'menunggu_pembayaran').length;
  const processingCount = orders.filter(o => o.orderStatus === 'diproses' || o.orderStatus === 'sedang_disiapkan' || o.orderStatus === 'siap_diambil' || o.orderStatus === 'dalam_pengiriman').length;
  const completedCount = orders.filter(o => o.orderStatus === 'selesai').length;

  // Stock & Batch alerts
  const activeProducts = products.filter(p => !p.isArchived && p.isAvailable);

  // Expiring batches
  const expiringBatches = batches.filter(b => b.status === 'mendekati_kedaluwarsa' && b.remainingQty > 0);
  const expiredBatches = batches.filter(b => b.status === 'kedaluwarsa');

  // Low stock products
  const lowStockProducts = products.filter(p => {
    if (p.isArchived) return false;
    const prodBatches = batches.filter(b => b.productId === p.id && b.status !== 'kedaluwarsa' && b.status !== 'ditarik');
    const currentStock = prodBatches.reduce((sum, b) => sum + b.remainingQty, 0);
    return currentStock <= p.minStockAlert;
  });

  // Payment breakdown
  const cashSales = validOrders.filter(o => o.paymentMethod === 'tunai').reduce((s, o) => s + o.totalAmount, 0);
  const digitalSales = validOrders.filter(o => o.paymentMethod !== 'tunai').reduce((s, o) => s + o.totalAmount, 0);

  // Top selling products calculated from real transactions
  const productSalesMap = new Map<string, { product: Product; qtySold: number; totalRevenue: number }>();
  for (const ord of validOrders) {
    for (const it of ord.items) {
      const existing = productSalesMap.get(it.productId);
      const prod = products.find(p => p.id === it.productId);
      if (prod) {
        if (existing) {
          existing.qtySold += it.qty;
          existing.totalRevenue += it.subtotal;
        } else {
          productSalesMap.set(it.productId, {
            product: prod,
            qtySold: it.qty,
            totalRevenue: it.subtotal,
          });
        }
      }
    }
  }

  const topSelling = Array.from(productSalesMap.values()).sort((a, b) => b.qtySold - a.qtySold).slice(0, 5);

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-[#E8DEC8] shadow-2xs">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#9A6237]">
            Laporan Kinerja Operasional
          </span>
          <h1 className="font-serif-bakery font-bold text-2xl sm:text-3xl text-[#3A241D]">
            Dashboard Utama Toko
          </h1>
          <p className="text-xs text-[#7A584A] mt-1">
            Data penjualan, batch kedaluwarsa, dan status dapur diperbarui secara langsung.
          </p>

          {/* Operational Hours Pill Widget */}
          <div className="mt-2.5 inline-flex flex-wrap items-center gap-2 p-2 rounded-xl bg-[#FAF6F0] border border-[#E8DEC8] text-xs">
            <span className="font-semibold text-[#3A241D]">
              🕒 Jam Operasional: {settings.openTime} – {settings.closeTime} WIB ({settings.operatingDays || 'Setiap Hari'})
            </span>
            <span aria-hidden="true" className="text-[#DFCBB5]">|</span>
            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
              settings.manualStoreStatus === 'force_closed'
                ? 'bg-rose-100 text-rose-800'
                : 'bg-emerald-100 text-emerald-800'
            }`}>
              {settings.manualStoreStatus === 'force_closed' ? '✕ TOKO TUTUP (MANUAL)' : settings.manualStoreStatus === 'force_open' ? '● TOKO BUKA (OVERRIDE)' : '● OPERASIONAL NORMAL'}
            </span>
            <span aria-hidden="true" className="text-[#DFCBB5]">|</span>
            <span className="text-[11px] text-[#8C4F1A]">
              ⚡ Order online diproses sesuai urutan FIFO
            </span>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('pos')}
            className="px-4 py-2.5 rounded-xl bg-[#8D5B36] text-white text-xs font-semibold hover:bg-[#724524] transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <span>Buka Kasir POS</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onNavigateTab('batches')}
            className="px-4 py-2.5 rounded-xl bg-[#FAF0E4] hover:bg-[#F3E3D1] text-[#3A241D] border border-[#DFCBB5] text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer"
          >
            <span>Batch Produksi</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Penjualan Hari Ini */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8DEC8] shadow-2xs">
          <div className="flex items-center justify-between text-[#8C6D62] text-xs font-semibold mb-2">
            <span>Penjualan Hari Ini</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono-nums text-[#3A241D]">
            {formatRupiah(todaySales)}
          </div>
          <div className="text-[11px] text-[#7A584A] mt-1 flex items-center gap-1">
            <span className="font-semibold text-emerald-700">{todayOrders.length} transaksi</span>
            <span>tercatat hari ini</span>
          </div>
        </div>

        {/* Metric 2: Penjualan Bulan Ini */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8DEC8] shadow-2xs">
          <div className="flex items-center justify-between text-[#8C6D62] text-xs font-semibold mb-2">
            <span>Penjualan Bulan Ini</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono-nums text-[#3A241D]">
            {formatRupiah(monthSales)}
          </div>
          <div className="text-[11px] text-[#7A584A] mt-1">
            <span>{monthOrders.length} total pesanan bulan berjalan</span>
          </div>
        </div>

        {/* Metric 3: Pesanan Aktif */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8DEC8] shadow-2xs">
          <div className="flex items-center justify-between text-[#8C6D62] text-xs font-semibold mb-2">
            <span>Pesanan Perlu Diproses</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono-nums text-[#D97706]">
            {newOrdersCount + processingCount}
          </div>
          <div className="text-[11px] text-[#7A584A] mt-1 flex gap-2">
            <span>{newOrdersCount} baru</span>
            <span>·</span>
            <span>{processingCount} di dapur</span>
          </div>
        </div>

        {/* Metric 4: Peringatan Batch FEFO */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8DEC8] shadow-2xs">
          <div className="flex items-center justify-between text-[#8C6D62] text-xs font-semibold mb-2">
            <span>Pengawasan Kedaluwarsa</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono-nums text-rose-600">
            {expiringBatches.length + expiredBatches.length}
          </div>
          <div className="text-[11px] text-[#7A584A] mt-1 flex gap-2">
            <span className="text-amber-700 font-semibold">{expiringBatches.length} mendekati</span>
            <span>·</span>
            <span className="text-rose-700 font-semibold">{expiredBatches.length} kedaluwarsa</span>
          </div>
        </div>
      </div>

      {/* Critical Expiry & Stock Warnings Section */}
      {(expiringBatches.length > 0 || expiredBatches.length > 0 || lowStockProducts.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Expiring / Expired Batches */}
          <div className="p-5 rounded-2xl bg-white border border-[#E8DEC8] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Peringatan Batch FEFO & Kedaluwarsa
              </h3>
              <button
                onClick={() => onNavigateTab('batches')}
                className="text-xs text-[#8D5B36] font-semibold hover:underline cursor-pointer"
              >
                Kelola Batch →
              </button>
            </div>

            <div className="space-y-2">
              {expiredBatches.slice(0, 2).map(b => {
                const prod = products.find(p => p.id === b.productId);
                return (
                  <div key={b.id} className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs flex justify-between items-center">
                    <div>
                      <span className="font-bold text-rose-900 block">{prod?.name || b.productId}</span>
                      <span className="text-[11px] text-rose-700">
                        Batch: {b.batchCode} · Sisa: {b.remainingQty} pcs · Expired!
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-200 text-rose-900">
                      Wajib Ditarik
                    </span>
                  </div>
                );
              })}

              {expiringBatches.slice(0, 2).map(b => {
                const prod = products.find(p => p.id === b.productId);
                return (
                  <div key={b.id} className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs flex justify-between items-center">
                    <div>
                      <span className="font-bold text-amber-900 block">{prod?.name || b.productId}</span>
                      <span className="text-[11px] text-amber-700">
                        Batch: {b.batchCode} · Sisa: {b.remainingQty} pcs · Exp: {new Date(b.expiryDate).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900">
                      Segera Habiskan
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className="p-5 rounded-2xl bg-white border border-[#E8DEC8] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#9A6237] flex items-center gap-1.5">
                <Package className="w-4 h-4 text-[#D97706]" />
                Peringatan Stok Menipis (Di Bawah Minimum)
              </h3>
              <button
                onClick={() => onNavigateTab('stock')}
                className="text-xs text-[#8D5B36] font-semibold hover:underline cursor-pointer"
              >
                Lihat Stok →
              </button>
            </div>

            <div className="space-y-2">
              {lowStockProducts.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#8C6D62] bg-[#FAF6F0] rounded-xl">
                  Seluruh produk memiliki stok di atas batas minimum.
                </div>
              ) : (
                lowStockProducts.slice(0, 3).map(p => {
                  const prodBatches = batches.filter(b => b.productId === p.id && b.status !== 'kedaluwarsa' && b.status !== 'ditarik');
                  const currentStock = prodBatches.reduce((sum, b) => sum + b.remainingQty, 0);
                  return (
                    <div key={p.id} className="p-3 rounded-xl bg-[#FAF0E4] border border-[#DFCBB5] text-xs flex justify-between items-center">
                      <div>
                        <span className="font-bold text-[#3A241D] block">{p.name}</span>
                        <span className="text-[11px] text-[#7A584A]">
                          Stok Saat Ini: {currentStock} {p.unit} (Min: {p.minStockAlert})
                        </span>
                      </div>
                      <button
                        onClick={() => onNavigateTab('batches')}
                        className="px-2.5 py-1 rounded-lg bg-[#8D5B36] text-white text-[11px] font-semibold hover:bg-[#724524] cursor-pointer"
                      >
                        + Buat Batch
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Middle Section: Top Products & Payment Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Selling Products */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-[#E8DEC8] shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#F2ECE1] pb-3">
            <h3 className="font-serif-bakery font-bold text-base text-[#3A241D]">
              Produk Terlaris Berdasarkan Transaksi
            </h3>
            <span className="text-xs text-[#8C6D62]">Total Unit Terjual</span>
          </div>

          <div className="space-y-3">
            {topSelling.length === 0 ? (
              <p className="text-xs text-[#8C6D62] py-4 text-center">Belum ada riwayat penjualan.</p>
            ) : (
              topSelling.map((item, idx) => (
                <div key={item.product.id} className="flex items-center justify-between text-xs p-2.5 rounded-xl hover:bg-[#FAF7F2] transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-5 font-bold font-mono text-[#8D5B36]">#{idx + 1}</span>
                    <div>
                      <span className="font-bold text-[#3A241D] block">{item.product.name}</span>
                      <span className="text-[11px] text-[#8C6D62]">
                        {formatRupiah(item.product.normalPrice)} / {item.product.unit}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold font-mono-nums text-[#3A241D] block">
                      {item.qtySold} {item.product.unit}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-mono-nums font-semibold">
                      {formatRupiah(item.totalRevenue)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Payment Summary */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-[#E8DEC8] shadow-2xs space-y-4">
          <div className="border-b border-[#F2ECE1] pb-3">
            <h3 className="font-serif-bakery font-bold text-base text-[#3A241D]">
              Ringkasan Pembayaran
            </h3>
            <span className="text-xs text-[#8C6D62]">Perbandingan Tunai vs Non-Tunai</span>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-[#FAF0E4] border border-[#DFCBB5] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#8D5B36] text-white flex items-center justify-center">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-xs text-[#3A241D] block">Pembayaran Tunai (Cash)</span>
                  <span className="text-[11px] text-[#7A584A]">Kasir Langsung di Toko</span>
                </div>
              </div>
              <span className="font-bold font-mono-nums text-sm text-[#3A241D]">
                {formatRupiah(cashSales)}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-xs text-blue-900 block">Non-Tunai (QRIS / Transfer)</span>
                  <span className="text-[11px] text-blue-700">Digital Gateway</span>
                </div>
              </div>
              <span className="font-bold font-mono-nums text-sm text-blue-900">
                {formatRupiah(digitalSales)}
              </span>
            </div>

            <div className="pt-2 border-t border-[#F2ECE1] flex justify-between text-xs text-[#5C453C]">
              <span>Total Omzet Bersih:</span>
              <span className="font-bold font-mono-nums text-[#B45309]">
                {formatRupiah(cashSales + digitalSales)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E8DEC8] shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#F2ECE1] pb-3">
          <div>
            <h3 className="font-serif-bakery font-bold text-base text-[#3A241D]">
              Pesanan Terbaru
            </h3>
            <span className="text-xs text-[#8C6D62]">5 transaksi terakhir yang tercatat</span>
          </div>
          <button
            onClick={() => onNavigateTab('orders')}
            className="text-xs font-semibold text-[#8D5B36] hover:underline cursor-pointer"
          >
            Lihat Semua Pesanan →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E8DEC8] text-[#8C6D62] uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">No. Pesanan</th>
                <th className="py-2.5 px-3">Pelanggan</th>
                <th className="py-2.5 px-3">Kanal</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2ECE1]">
              {orders.slice(0, 5).map(o => (
                <tr key={o.id} className="hover:bg-[#FAF7F2] transition-colors">
                  <td className="py-3 px-3 font-mono font-semibold text-[#3A241D]">{o.orderNumber}</td>
                  <td className="py-3 px-3 text-[#5C453C]">{o.customerName}</td>
                  <td className="py-3 px-3 text-[#7A584A]">{o.channel === 'kasir_pos' ? 'POS Toko' : 'Online'}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${getOrderStatusLabel(o.orderStatus).color}`}>
                      {getOrderStatusLabel(o.orderStatus).label}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono-nums font-bold text-[#3A241D]">
                    {formatRupiah(o.totalAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
