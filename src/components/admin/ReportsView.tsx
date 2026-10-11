import React, { useState } from 'react';
import { BarChart3, Download, Printer, TrendingUp, DollarSign, PieChart, AlertOctagon } from 'lucide-react';
import { Category, Order, Product, ProductionBatch, StoreSettings } from '../../types/bakery';
import { formatRupiah } from '../../utils/formatters';
import { exportToCsv } from '../../utils/pdfReceipt';

interface ReportsViewProps {
  orders: Order[];
  products: Product[];
  categories: Category[];
  batches: ProductionBatch[];
  settings: StoreSettings;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  orders,
  products,
  categories,
  batches,
  settings,
}) => {
  const [reportRange, setReportRange] = useState<'today' | 'this_month' | 'all'>('all');

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const monthStr = now.toISOString().slice(0, 7);

  // Filter orders by range
  const validOrders = orders.filter(o => {
    if (o.orderStatus === 'dibatalkan') return false;
    if (reportRange === 'today') return o.createdAt.startsWith(todayStr);
    if (reportRange === 'this_month') return o.createdAt.startsWith(monthStr);
    return true;
  });

  // Gross Omzet
  const totalOmzet = validOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalDiscount = validOrders.reduce((sum, o) => sum + o.discountAmount, 0);

  // Estimated Cost of Goods Sold (HPP)
  let totalHpp = 0;
  for (const ord of validOrders) {
    for (const it of ord.items) {
      totalHpp += (it.costPrice || Math.round(it.unitPrice * 0.5)) * it.qty;
    }
  }

  // Waste Cost (total wasted quantities from batches * estimated cost)
  let totalWasteCost = 0;
  for (const b of batches) {
    if (b.wastedQty > 0) {
      const prod = products.find(p => p.id === b.productId);
      const estCost = Math.round((prod?.normalPrice || 20000) * 0.5);
      totalWasteCost += b.wastedQty * estCost;
    }
  }

  // Estimated Gross Profit
  const grossProfit = totalOmzet - totalHpp - totalWasteCost;

  // Sales by Channel
  const posSales = validOrders.filter(o => o.channel === 'kasir_pos').reduce((s, o) => s + o.totalAmount, 0);
  const onlineSales = validOrders.filter(o => o.channel === 'online').reduce((s, o) => s + o.totalAmount, 0);

  // Sales by Payment
  const cashSales = validOrders.filter(o => o.paymentMethod === 'tunai').reduce((s, o) => s + o.totalAmount, 0);
  const qrisSales = validOrders.filter(o => o.paymentMethod === 'qris').reduce((s, o) => s + o.totalAmount, 0);
  const transferSales = validOrders.filter(o => o.paymentMethod === 'transfer_bank').reduce((s, o) => s + o.totalAmount, 0);

  // Sales by Category
  const categorySalesMap = new Map<string, { catName: string; revenue: number; qty: number }>();
  for (const ord of validOrders) {
    for (const it of ord.items) {
      const prod = products.find(p => p.id === it.productId);
      const cat = categories.find(c => c.id === prod?.categoryId);
      const catId = cat?.id || 'other';
      const catName = cat?.name || 'Lainnya';

      const existing = categorySalesMap.get(catId);
      if (existing) {
        existing.revenue += it.subtotal;
        existing.qty += it.qty;
      } else {
        categorySalesMap.set(catId, { catName, revenue: it.subtotal, qty: it.qty });
      }
    }
  }

  const categoryBreakdown = Array.from(categorySalesMap.values()).sort((a, b) => b.revenue - a.revenue);

  // Export full report to CSV
  const handleExportCsv = () => {
    const rows = validOrders.map(o => ({
      'No. Pesanan': o.orderNumber,
      'Tanggal': o.createdAt,
      'Pelanggan': o.customerName,
      'Kanal': o.channel,
      'Metode Bayar': o.paymentMethod,
      'Subtotal': o.subtotal,
      'Diskon': o.discountAmount,
      'Ongkir': o.deliveryFee,
      'Total Akhir': o.totalAmount,
      'Status': o.orderStatus,
    }));
    exportToCsv(rows, `Laporan_Keuangan_Bakery_${reportRange}_${todayStr}`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-[#E8DEC8] shadow-2xs">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#9A6237]">
            Laporan Keuangan & Laba Rugi
          </span>
          <h1 className="font-serif-bakery font-bold text-2xl text-[#3A241D] flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#8D5B36]" />
            <span>Rekapitulasi Penjualan & Biaya Produksi</span>
          </h1>
          <p className="text-xs text-[#7A584A] mt-1">
            Transparansi omzet, pemotongan diskon, estimasi HPP resep, serta kerugian barang afkir/rusak.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Range segmented buttons */}
          <div className="flex bg-[#FAF0E4] p-1 rounded-xl border border-[#DFCBB5] text-xs">
            <button
              onClick={() => setReportRange('today')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                reportRange === 'today' ? 'bg-[#8D5B36] text-white shadow-2xs' : 'text-[#6B4F43]'
              }`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => setReportRange('this_month')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                reportRange === 'this_month' ? 'bg-[#8D5B36] text-white shadow-2xs' : 'text-[#6B4F43]'
              }`}
            >
              Bulan Ini
            </button>
            <button
              onClick={() => setReportRange('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                reportRange === 'all' ? 'bg-[#8D5B36] text-white shadow-2xs' : 'text-[#6B4F43]'
              }`}
            >
              Semua Waktu
            </button>
          </div>

          <button
            onClick={handleExportCsv}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#FAF0E4] text-[#3A241D] border border-[#DFCBB5] text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-xs whitespace-nowrap"
          >
            <Download className="w-4 h-4 text-[#8D5B36]" />
            <span>Unduh Excel (.CSV)</span>
          </button>
        </div>
      </div>

      {/* Financial Health Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Omzet */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8DEC8] shadow-2xs">
          <span className="text-xs text-[#8C6D62] font-semibold block mb-1">Total Omzet Bersih</span>
          <span className="text-2xl font-bold font-mono-nums text-[#3A241D] block">
            {formatRupiah(totalOmzet)}
          </span>
          <span className="text-[11px] text-[#7A584A] mt-1 block">
            Dari {validOrders.length} transaksi sukses
          </span>
        </div>

        {/* Total HPP */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8DEC8] shadow-2xs">
          <span className="text-xs text-[#8C6D62] font-semibold block mb-1">Estimasi HPP (Modal Bahan)</span>
          <span className="text-2xl font-bold font-mono-nums text-slate-700 block">
            {formatRupiah(totalHpp)}
          </span>
          <span className="text-[11px] text-[#7A584A] mt-1 block">
            Biaya bahan baku tepung, butter, telur
          </span>
        </div>

        {/* Kerugian Afkir/Waste */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8DEC8] shadow-2xs">
          <span className="text-xs text-rose-800 font-semibold block mb-1 flex items-center gap-1">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
            Biaya Produk Rusak (Waste)
          </span>
          <span className="text-2xl font-bold font-mono-nums text-rose-700 block">
            {formatRupiah(totalWasteCost)}
          </span>
          <span className="text-[11px] text-[#7A584A] mt-1 block">
            Total barang dibuang / kedaluwarsa
          </span>
        </div>

        {/* Estimasi Laba Kotor */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8DEC8] shadow-2xs bg-gradient-to-br from-white to-[#FAF0E4]">
          <span className="text-xs text-emerald-800 font-semibold block mb-1">Estimasi Laba Kotor</span>
          <span className="text-2xl font-bold font-mono-nums text-emerald-700 block">
            {formatRupiah(grossProfit)}
          </span>
          <span className="text-[11px] text-emerald-800 font-semibold mt-1 block">
            Margin: {totalOmzet > 0 ? Math.round((grossProfit / totalOmzet) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* Breakdown Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sales by Category */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E8DEC8] shadow-2xs space-y-4">
          <h3 className="font-serif-bakery font-bold text-base text-[#3A241D] border-b border-[#F2ECE1] pb-3">
            Penjualan per Kategori Bakery
          </h3>

          <div className="space-y-3">
            {categoryBreakdown.length === 0 ? (
              <p className="text-xs text-[#8C6D62] py-4 text-center">Belum ada penjualan di periode ini.</p>
            ) : (
              categoryBreakdown.map(cat => (
                <div key={cat.catName} className="flex items-center justify-between text-xs p-2 rounded-xl hover:bg-[#FAF7F2]">
                  <div>
                    <span className="font-bold text-[#3A241D] block">{cat.catName}</span>
                    <span className="text-[11px] text-[#8C6D62]">{cat.qty} item terjual</span>
                  </div>
                  <span className="font-bold font-mono-nums text-[#3A241D]">
                    {formatRupiah(cat.revenue)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sales by Channel and Method */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E8DEC8] shadow-2xs space-y-4">
          <h3 className="font-serif-bakery font-bold text-base text-[#3A241D] border-b border-[#F2ECE1] pb-3">
            Kanal Penjualan & Metode Pembayaran
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-[#FAF6F0] border border-[#E8DEC8] flex justify-between items-center">
              <div>
                <span className="font-bold text-[#3A241D] block">Kasir POS Toko (Walk-in)</span>
                <span className="text-[10px] text-[#8C6D62]">Pembelian langsung di outlet</span>
              </div>
              <span className="font-bold font-mono-nums text-sm text-[#3A241D]">{formatRupiah(posSales)}</span>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF6F0] border border-[#E8DEC8] flex justify-between items-center">
              <div>
                <span className="font-bold text-[#3A241D] block">Pemesanan Online Web</span>
                <span className="text-[10px] text-[#8C6D62]">Pemesanan pelanggan via web</span>
              </div>
              <span className="font-bold font-mono-nums text-sm text-[#3A241D]">{formatRupiah(onlineSales)}</span>
            </div>

            <div className="pt-2 border-t border-[#F2ECE1] space-y-1.5 text-[11px] text-[#6B4F43]">
              <div className="flex justify-between">
                <span>Tunai (Cash):</span>
                <span className="font-mono-nums font-semibold">{formatRupiah(cashSales)}</span>
              </div>
              <div className="flex justify-between">
                <span>QRIS Digital:</span>
                <span className="font-mono-nums font-semibold">{formatRupiah(qrisSales)}</span>
              </div>
              <div className="flex justify-between">
                <span>Transfer Bank:</span>
                <span className="font-mono-nums font-semibold">{formatRupiah(transferSales)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
