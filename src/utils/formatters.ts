import { BatchStatus, OrderStatus, PaymentMethod, PaymentStatus, UserRole } from '../types/bakery';

export function formatRupiah(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return 'Rp 0';
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
}

export function formatDateTimeIndo(isoString: string): string {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d) + ' WIB';
  } catch {
    return isoString;
  }
}

export function formatDateOnlyIndo(isoString: string): string {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return isoString;
  }
}

export function getBatchStatusLabel(status: BatchStatus): { label: string; textClass: string; bgClass: string; borderClass: string } {
  switch (status) {
    case 'aktif':
      return { label: 'Layak Jual (Aktif)', textClass: 'text-emerald-700', bgClass: 'bg-emerald-50', borderClass: 'border-emerald-200' };
    case 'mendekati_kedaluwarsa':
      return { label: 'Segera Kedaluwarsa', textClass: 'text-amber-700', bgClass: 'bg-amber-50', borderClass: 'border-amber-200' };
    case 'kedaluwarsa':
      return { label: 'Kedaluwarsa (Tarik)', textClass: 'text-rose-700', bgClass: 'bg-rose-50', borderClass: 'border-rose-200' };
    case 'habis':
      return { label: 'Stok Habis', textClass: 'text-slate-500', bgClass: 'bg-slate-100', borderClass: 'border-slate-200' };
    case 'ditarik':
      return { label: 'Ditarik dari Penjualan', textClass: 'text-purple-700', bgClass: 'bg-purple-50', borderClass: 'border-purple-200' };
    default:
      return { label: status, textClass: 'text-slate-700', bgClass: 'bg-slate-100', borderClass: 'border-slate-200' };
  }
}

export function getOrderStatusLabel(status: OrderStatus): { label: string; color: string } {
  switch (status) {
    case 'menunggu_konfirmasi':
      return { label: 'Menunggu Konfirmasi', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    case 'menunggu_pembayaran':
      return { label: 'Menunggu Pembayaran', color: 'text-orange-700 bg-orange-50 border-orange-200' };
    case 'pembayaran_terverifikasi':
      return { label: 'Pembayaran Terverifikasi', color: 'text-blue-700 bg-blue-50 border-blue-200' };
    case 'diproses':
      return { label: 'Diproses Toko', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' };
    case 'sedang_disiapkan':
      return { label: 'Sedang Disiapkan Dapur', color: 'text-amber-800 bg-amber-100/70 border-amber-300' };
    case 'siap_diambil':
      return { label: 'Siap Diambil di Toko', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    case 'dalam_pengiriman':
      return { label: 'Dalam Pengiriman Kurir', color: 'text-sky-700 bg-sky-50 border-sky-200' };
    case 'selesai':
      return { label: 'Pesanan Selesai', color: 'text-emerald-800 bg-emerald-100 border-emerald-300' };
    case 'dibatalkan':
      return { label: 'Pesanan Dibatalkan', color: 'text-rose-700 bg-rose-50 border-rose-200' };
    default:
      return { label: status, color: 'text-slate-700 bg-slate-100 border-slate-200' };
  }
}

export function getPaymentMethodLabel(method: PaymentMethod): string {
  switch (method) {
    case 'tunai':
      return 'Tunai (Cash / Bayar di Toko)';
    case 'transfer_bank':
      return 'Transfer Bank (BCA / Mandiri / BRI)';
    case 'qris':
      return 'QRIS Digital (GoPay, OVO, Dana, ShopeePay)';
    default:
      return method;
  }
}

export function getPaymentStatusLabel(status: PaymentStatus): { label: string; color: string } {
  switch (status) {
    case 'menunggu_pembayaran':
      return { label: 'Belum Bayar', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    case 'menunggu_verifikasi':
      return { label: 'Menunggu Verifikasi Admin', color: 'text-sky-700 bg-sky-50 border-sky-200' };
    case 'terverifikasi':
      return { label: 'Lunas & Terverifikasi', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    case 'dibatalkan':
      return { label: 'Dibatalkan', color: 'text-rose-700 bg-rose-50 border-rose-200' };
    default:
      return { label: status, color: 'text-slate-600 bg-slate-100 border-slate-200' };
  }
}

export function getRoleBadge(role: UserRole): { label: string; badgeClass: string } {
  switch (role) {
    case 'super_admin':
      return { label: 'Super Admin', badgeClass: 'bg-purple-100 text-purple-800 border-purple-200' };
    case 'admin_toko':
      return { label: 'Admin Toko', badgeClass: 'bg-blue-100 text-blue-800 border-blue-200' };
    case 'kasir':
      return { label: 'Kasir POS', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    case 'petugas_produksi':
      return { label: 'Petugas Produksi', badgeClass: 'bg-amber-100 text-amber-800 border-amber-200' };
    default:
      return { label: role, badgeClass: 'bg-slate-100 text-slate-800 border-slate-200' };
  }
}

export function generateOrderNumber(prefix = 'ORD'): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${dateStr}-${randomSuffix}`;
}

export function generateReceiptNumber(prefix = 'STR'): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${dateStr}-${randomSuffix}`;
}

export function generateBatchCode(productShortCode = 'ROT'): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(2, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(10 + Math.random() * 90);
  return `BTC-${productShortCode.toUpperCase()}-${dateStr}-${randomSuffix}`;
}
