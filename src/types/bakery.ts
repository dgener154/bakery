export type UserRole = 'super_admin' | 'admin_toko' | 'kasir' | 'petugas_produksi';

export interface UserAccount {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  roleLabel: string;
  avatarBg: string;
}

export interface StoreSettings {
  storeName: string;
  slogan: string;
  address: string;
  city: string;
  phone: string;
  whatsapp: string;
  email: string;
  operatingHours: string;
  openTime: string; // e.g. "07:00"
  closeTime: string; // e.g. "21:00"
  operatingDays: string; // e.g. "Setiap Hari (Senin - Minggu)"
  manualStoreStatus: 'auto' | 'force_open' | 'force_closed';
  orderQueuePolicy: string;
  currency: string;
  taxPercent: number;
  deliveryFeeFixed: number;
  freeDeliveryThreshold: number;
  orderNumberPrefix: string;
  receiptNumberPrefix: string;
  batchCodePrefix: string;
  expiryWarningDays: number;
  receiptFooterMessage: string;
  complaintPolicy: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  sortOrder: number;
}

export type ProductVisualType = 
  | 'sourdough' 
  | 'croissant' 
  | 'chocolate_cake' 
  | 'donut' 
  | 'baguette' 
  | 'sweet_bun' 
  | 'cookies' 
  | 'tart' 
  | 'hampers'
  | 'toast_bread';

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  description: string;
  normalPrice: number;
  promoPrice?: number;
  weightGrams: number;
  unit: string;
  ingredients: string;
  allergens: string;
  storageInstructions: string;
  estimatedShelfDays: number;
  minStockAlert: number;
  isPreOrder: boolean;
  preOrderLeadHours?: number;
  isAvailable: boolean;
  isArchived: boolean;
  visualType: ProductVisualType;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type BatchStatus = 'aktif' | 'mendekati_kedaluwarsa' | 'kedaluwarsa' | 'habis' | 'ditarik';

export interface ProductionBatch {
  id: string;
  batchCode: string;
  productId: string;
  productionDate: string; // ISO String or YYYY-MM-DD HH:mm
  expiryDate: string; // ISO String or YYYY-MM-DD HH:mm
  initialQty: number;
  remainingQty: number;
  soldQty: number;
  wastedQty: number;
  notes: string;
  staffName: string;
  status: BatchStatus;
  createdAt: string;
  updatedAt: string;
}

export type StockMovementType = 'PRODUKSI' | 'PENJUALAN' | 'KOREKSI_TAMBAH' | 'KOREKSI_KURANG' | 'RUSAK_KEDALUWARSA' | 'BATAL_PESANAN';

export interface StockMovement {
  id: string;
  batchId: string;
  batchCode: string;
  productId: string;
  productName: string;
  type: StockMovementType;
  qtyChange: number; // positive or negative
  previousStock: number;
  newStock: number;
  reason: string;
  staffName: string;
  referenceId?: string; // orderId or batchId
  timestamp: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  notes?: string;
  createdAt: string;
}

export interface BatchAllocation {
  batchId: string;
  batchCode: string;
  qty: number;
  expiryDate: string;
  productionDate: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  unitPrice: number;
  costPrice?: number;
  qty: number;
  subtotal: number;
  visualType: ProductVisualType;
  storageInstructions?: string;
  allocatedBatches: BatchAllocation[];
}

export type DeliveryType = 'pickup' | 'delivery';

export type PaymentMethod = 'tunai' | 'transfer_bank' | 'qris';

export type PaymentStatus = 
  | 'menunggu_pembayaran' 
  | 'menunggu_verifikasi' 
  | 'terverifikasi' 
  | 'dibatalkan';

export type OrderStatus = 
  | 'menunggu_konfirmasi'
  | 'menunggu_pembayaran'
  | 'pembayaran_terverifikasi'
  | 'diproses'
  | 'sedang_disiapkan'
  | 'siap_diambil'
  | 'dalam_pengiriman'
  | 'selesai'
  | 'dibatalkan';

export type OrderChannel = 'online' | 'kasir_pos';

export interface OrderStatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  actor: string;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  queueNumber: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryType: DeliveryType;
  deliveryAddress?: string;
  deliveryFee: number;
  pickupTimeSlot?: string;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  voucherCode?: string;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  channel: OrderChannel;
  cashierName?: string;
  paidAmount?: number;
  changeAmount?: number;
  receiptNumber?: string;
  createdAt: string;
  updatedAt: string;
  statusHistory: OrderStatusHistoryItem[];
}

export interface DigitalReceipt {
  id: string;
  receiptNumber: string;
  orderId: string;
  orderNumber: string;
  queueNumber: number;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  cashierName?: string;
  channel: OrderChannel;
  deliveryType: DeliveryType;
  deliveryAddress?: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  deliveryFee: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paidAmount?: number;
  changeAmount?: number;
  printCount: number;
}

export interface Voucher {
  id: string;
  code: string;
  discountType: 'percentage' | 'nominal';
  discountValue: number;
  minPurchase: number;
  maxDiscount?: number;
  usageLimit: number;
  usageCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

export type NotificationType = 
  | 'pesanan_baru' 
  | 'verifikasi_pembayaran' 
  | 'stok_menipis' 
  | 'batch_kedaluwarsa' 
  | 'batch_segera_kedaluwarsa';

export interface SystemNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  referenceId?: string;
  isRead: boolean;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  actorName: string;
  actorRole: UserRole;
  details: string;
  timestamp: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  qty: number;
}
