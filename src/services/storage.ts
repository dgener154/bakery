import {
  AuditLog,
  BatchAllocation,
  CartItem,
  Category,
  Customer,
  DigitalReceipt,
  Order,
  OrderItem,
  OrderStatus,
  PaymentStatus,
  Product,
  ProductionBatch,
  StockMovement,
  StoreSettings,
  SystemNotification,
  UserAccount,
  UserRole,
  Voucher
} from '../types/bakery';
import { generateBatchCode, generateOrderNumber, generateReceiptNumber } from '../utils/formatters';

const STORAGE_KEY_PREFIX = 'bakery_house_';

function getStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Failed to load from localStorage: ${key}`, e);
    return defaultValue;
  }
}

function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to save to localStorage: ${key}`, e);
  }
}

// Preset User Accounts
export const DEFAULT_USERS: UserAccount[] = [
  {
    id: 'usr_super',
    name: 'Rian Pratama',
    username: 'superadmin',
    role: 'super_admin',
    roleLabel: 'Super Admin',
    avatarBg: 'bg-purple-600',
  },
  {
    id: 'usr_admin',
    name: 'Siti Rahmawati',
    username: 'admintoko',
    role: 'admin_toko',
    roleLabel: 'Admin Toko',
    avatarBg: 'bg-blue-600',
  },
  {
    id: 'usr_kasir',
    name: 'Dewi Lestari',
    username: 'kasir',
    role: 'kasir',
    roleLabel: 'Kasir Toko (POS)',
    avatarBg: 'bg-emerald-600',
  },
  {
    id: 'usr_produksi',
    name: 'Budi Santoso',
    username: 'produksi',
    role: 'petugas_produksi',
    roleLabel: 'Kepala Produksi & Dapur',
    avatarBg: 'bg-amber-600',
  },
];

export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'Bakery House',
  slogan: 'Artisan Breads, Fresh Pastries & Handcrafted Cakes',
  address: 'Jl. Senopati Raya No. 42, Kebayoran Baru',
  city: 'Jakarta Selatan 12190',
  phone: '021-7248901',
  whatsapp: '081289001234',
  email: 'halo@bakeryhouse.co.id',
  operatingHours: 'Setiap Hari: 07:00 - 21:00 WIB',
  openTime: '07:00',
  closeTime: '21:00',
  operatingDays: 'Setiap Hari (Senin - Minggu)',
  manualStoreStatus: 'auto',
  orderQueuePolicy: 'Pesanan online dilayani secara ketat berdasarkan urutan antrean dan jam masuk order (FIFO - First In, First Out). Order hanya dapat dibuat dan dilayani ketika jam buka toko aktif (07:00 - 21:00 WIB).',
  currency: 'IDR',
  taxPercent: 0, // In Indonesia bakery often includes tax or 0%
  deliveryFeeFixed: 15000,
  freeDeliveryThreshold: 150000,
  orderNumberPrefix: 'ORD',
  receiptNumberPrefix: 'STR',
  batchCodePrefix: 'BTC',
  expiryWarningDays: 2,
  receiptFooterMessage: 'Terima kasih telah berbelanja di Bakery House! Selamat menikmati kesegaran roti kami.',
  complaintPolicy: 'Komplain produk maksimal 1x24 jam setelah diterima dengan menyertakan struk dan foto/video produk.',
};

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat_roti_manis', name: 'Roti Manis', slug: 'roti-manis', description: 'Roti lembut isi cokelat, keju, srikaya & abon gurih', iconName: 'Croissant', sortOrder: 1 },
  { id: 'cat_roti_tawar', name: 'Roti Tawar & Sourdough', slug: 'roti-tawar', description: 'Roti tawar gandum, milk bread & rustic sourdough', iconName: 'Wheat', sortOrder: 2 },
  { id: 'cat_pastry', name: 'Pastry & Croissant', slug: 'pastry', description: 'Pastry renyah berlapis dengan butter premium', iconName: 'Sparkles', sortOrder: 3 },
  { id: 'cat_cake', name: 'Cake & Tart', slug: 'cake-tart', description: 'Kue ulang tahun, chiffon cake & tart lembut', iconName: 'Cake', sortOrder: 4 },
  { id: 'cat_donat', name: 'Donat Artisan', slug: 'donat', description: 'Donat brioche empuk bertabur glaze aneka rasa', iconName: 'CircleDot', sortOrder: 5 },
  { id: 'cat_cookies', name: 'Cookies & Kue Kering', slug: 'cookies', description: 'Kue kering renyah cocok untuk camilan santai', iconName: 'Cookie', sortOrder: 6 },
  { id: 'cat_hampers', name: 'Paket Hampers & Box', slug: 'hampers', description: 'Bingkisan kue istimewa untuk momen spesial', iconName: 'Gift', sortOrder: 7 },
];

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prd_sourdough_artisan',
    name: 'Artisan Country Sourdough',
    categoryId: 'cat_roti_tawar',
    description: 'Roti sourdough rustic tradisional dengan fermentasi alami 36 jam. Kulit renyah kecokelatan dengan tekstur bagian dalam yang berongga kenyal.',
    normalPrice: 48000,
    promoPrice: 42000,
    weightGrams: 500,
    unit: 'loaf',
    ingredients: 'Tepung Terigu Protein Tinggi, Ragi Alami (Sourdough Starter), Air Bersih, Garam Laut Alami.',
    allergens: 'Mengandung Gluten (Gandum).',
    storageInstructions: 'Simpan di tempat kering suhu ruang bertutup kain atau wadah kedap udara (maks 3-4 hari). Dapat dipanggang ulang 3 menit pada 180°C.',
    estimatedShelfDays: 4,
    minStockAlert: 5,
    isPreOrder: false,
    isAvailable: true,
    isArchived: false,
    visualType: 'sourdough',
    imageUrl: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-10-10T04:00:00Z',
  },
  {
    id: 'prd_butter_croissant',
    name: 'French Butter Croissant',
    categoryId: 'cat_pastry',
    description: 'Croissant khas Prancis dengan 27 lapisan adonan berlapis butter AOP Prancis pilihan. Luar garing berlapis, dalam lembut aroma mentega kaya rasa.',
    normalPrice: 28000,
    weightGrams: 85,
    unit: 'pcs',
    ingredients: 'Tepung Terigu, Mentega Butter Prancis (AOP), Susu Segar, Gula Tebu, Ragi, Garam Laut, Kuning Telur.',
    allergens: 'Mengandung Gluten, Susu & Produk Turunan Susu, Telur.',
    storageInstructions: 'Sebaiknya dikonsumsi hari ini. Jika disimpan, hangatkan di oven/air fryer 160°C selama 2-3 menit.',
    estimatedShelfDays: 2,
    minStockAlert: 8,
    isPreOrder: false,
    isAvailable: true,
    isArchived: false,
    visualType: 'croissant',
    imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-10-10T04:00:00Z',
  },
  {
    id: 'prd_belgian_choco_cake',
    name: 'Belgian Dark Chocolate Cake (Whole 18cm)',
    categoryId: 'cat_cake',
    description: 'Kue cokelat istimewa dengan tiga lapis sponge cokelat lembut, dilapisi dark chocolate ganache 70% Belgia dan taburan cokelat serut halus.',
    normalPrice: 285000,
    promoPrice: 260000,
    weightGrams: 900,
    unit: 'box',
    ingredients: 'Dark Chocolate Couverture 70%, Butter, Telur Ayam Segar, Gula Kastor, Krim Kental (Dairy Cream), Bubuk Kakao Murni, Tepung Terigu, Ekstrak Vanila Madagaskar.',
    allergens: 'Mengandung Susu, Telur, Gluten.',
    storageInstructions: 'Simpan dalam chiller / kulkas suhu 4°C-8°C. Keluarkan 15 menit sebelum dinikmati untuk tekstur ganache yang lumer sempurna.',
    estimatedShelfDays: 5,
    minStockAlert: 2,
    isPreOrder: false,
    isAvailable: true,
    isArchived: false,
    visualType: 'chocolate_cake',
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-10-10T04:00:00Z',
  },
  {
    id: 'prd_berry_glazed_donut',
    name: 'Berry Glazed Brioche Donut',
    categoryId: 'cat_donat',
    description: 'Donat berbahan adonan brioche fermentasi perlahan yang sangat empuk dan tidak berminyak, disiram glasir stroberi asli dengan taburan crumble.',
    normalPrice: 18000,
    weightGrams: 75,
    unit: 'pcs',
    ingredients: 'Tepung Terigu, Mentega Butter, Telur, Susu Segar, Glaze Puree Buah Stroberi Asli, Gula Halus, Ragi.',
    allergens: 'Mengandung Gluten, Susu, Telur.',
    storageInstructions: 'Simpan di wadah tertutup pada suhu ruang. Paling nikmat dikonsumsi dalam 24 jam.',
    estimatedShelfDays: 1,
    minStockAlert: 10,
    isPreOrder: false,
    isAvailable: true,
    isArchived: false,
    visualType: 'donut',
    imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-10-10T04:00:00Z',
  },
  {
    id: 'prd_chocochip_soft_cookies',
    name: 'NYC Style Choco-Chunk Cookies (Pack of 3)',
    categoryId: 'cat_cookies',
    description: 'Kue kering gaya New York dengan pinggiran renyah dan bagian tengah yang lembut (gooey), dipenuhi lelehan cokelat chunk premium dan taburan sea salt flakes.',
    normalPrice: 45000,
    promoPrice: 39000,
    weightGrams: 240,
    unit: 'pack',
    ingredients: 'Tepung Terigu, Mentega Butter, Brown Sugar, Gula Putih, Cokelat Callebaut Chunks, Telur, Sea Salt Flakes, Ekstrak Vanila.',
    allergens: 'Mengandung Gluten, Susu, Telur.',
    storageInstructions: 'Simpan di toples kedap udara pada suhu ruang sejuk. Tahan hingga 14 hari.',
    estimatedShelfDays: 14,
    minStockAlert: 6,
    isPreOrder: false,
    isAvailable: true,
    isArchived: false,
    visualType: 'cookies',
    imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-10-10T04:00:00Z',
  },
  {
    id: 'prd_hokkaido_milk_toast',
    name: 'Hokkaido Milk Toast Bread (Roti Tawar Susu)',
    categoryId: 'cat_roti_tawar',
    description: 'Roti tawar lembut menggunakan teknik Yudane khas Jepang dengan 100% susu murni Hokkaido, tekstur kenyal selembut awan dan wangi susu harum.',
    normalPrice: 35000,
    weightGrams: 420,
    unit: 'loaf',
    ingredients: 'Tepung Terigu Protein Tinggi Jepang, Susu Murni Segar, Mentega Butter, Gula Tebu, Ragi, Garam.',
    allergens: 'Mengandung Gluten, Susu.',
    storageInstructions: 'Simpan dalam kantong tertutup rapat pada suhu ruang sejuk. Konsumsi dalam 4 hari atau simpan freezer jika lebih lama.',
    estimatedShelfDays: 4,
    minStockAlert: 8,
    isPreOrder: false,
    isAvailable: true,
    isArchived: false,
    visualType: 'toast_bread',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-10-10T04:00:00Z',
  },
  {
    id: 'prd_roti_manis_keju',
    name: 'Roti Manis Cheese Melt Special',
    categoryId: 'cat_roti_manis',
    description: 'Roti manis tradisional lembut dengan isian custard keju cheddar manis gurih dan parutan keju edam melimpah di atasnya.',
    normalPrice: 16000,
    weightGrams: 90,
    unit: 'pcs',
    ingredients: 'Tepung Terigu, Keju Cheddar Asli, Keju Edam, Susu Segar, Mentega, Gula, Ragi, Kuning Telur.',
    allergens: 'Mengandung Gluten, Susu, Telur.',
    storageInstructions: 'Simpan di tempat teduh suhu ruang bertutup rapat. Tahan 3 hari.',
    estimatedShelfDays: 3,
    minStockAlert: 10,
    isPreOrder: false,
    isAvailable: true,
    isArchived: false,
    visualType: 'sweet_bun',
    imageUrl: 'https://images.unsplash.com/photo-1568254183919-78a4f43a2877?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-10-10T04:00:00Z',
  },
  {
    id: 'prd_french_baguette',
    name: 'Classic Baguette Traditionnelle',
    categoryId: 'cat_roti_tawar',
    description: 'Baguette autentik Prancis dengan kulit cokelat keemasan yang sangat renyah dan bagian tengah berongga ringan. Bebas bahan pengawet.',
    normalPrice: 24000,
    weightGrams: 280,
    unit: 'pcs',
    ingredients: 'Tepung Terigu Prancis T65, Air Bersih, Ragi Alami, Garam Laut.',
    allergens: 'Mengandung Gluten.',
    storageInstructions: 'Paling renyah dimakan hari ini. Panggang sebentar pada 200°C untuk mengembalikan kerenyahannya.',
    estimatedShelfDays: 1,
    minStockAlert: 5,
    isPreOrder: false,
    isAvailable: true,
    isArchived: false,
    visualType: 'baguette',
    imageUrl: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-10-10T04:00:00Z',
  },
  {
    id: 'prd_strawberry_tart',
    name: 'Fresh Strawberry Custard Tart',
    categoryId: 'cat_pastry',
    description: 'Tart pastry renyah bermentega dipadukan dengan vanilla bean pastry cream lembut dan buah stroberi segar pilihan berlapir aprikot glaze.',
    normalPrice: 38000,
    weightGrams: 140,
    unit: 'pcs',
    ingredients: 'Tepung Terigu, Mentega Butter, Buah Stroberi Segar, Susu Segar, Kuning Telur, Vanilla Bean Madagaskar, Apricot Glaze.',
    allergens: 'Mengandung Susu, Telur, Gluten.',
    storageInstructions: 'Wajib disimpan dalam kulkas suhu 4°C. Sebaiknya dikonsumsi dalam 2 hari.',
    estimatedShelfDays: 2,
    minStockAlert: 4,
    isPreOrder: false,
    isAvailable: true,
    isArchived: false,
    visualType: 'tart',
    imageUrl: 'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-10-10T04:00:00Z',
  },
  {
    id: 'prd_deluxe_bakery_hampers',
    name: 'Deluxe Celebration Gift Hamper Box',
    categoryId: 'cat_hampers',
    description: 'Paket bingkisan mewah berisi 1 Jar NYC Cookies, 1 Jar Butter Shortbread, 2 Croissant Prancis, dan seleksi selai buah artisan dalam kotak kayu eksklusif berpita emas.',
    normalPrice: 320000,
    weightGrams: 1200,
    unit: 'box',
    ingredients: 'Komposisi kue cookies artisan, pastry butter, dan selai buah murni.',
    allergens: 'Mengandung Gluten, Susu, Telur, Kacang.',
    storageInstructions: 'Simpan di ruangan sejuk ber-AC.',
    estimatedShelfDays: 10,
    minStockAlert: 3,
    isPreOrder: true,
    preOrderLeadHours: 24,
    isAvailable: true,
    isArchived: false,
    visualType: 'hampers',
    imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-10-10T04:00:00Z',
  },
];


// Helper to generate ISO dates relative to now
function getRelDate(daysOffset: number, hour = 6): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

export const INITIAL_BATCHES: ProductionBatch[] = [
  // Sourdough: Batch 1 (Baked today morning - fresh today!)
  {
    id: 'btc_sourdough_01',
    batchCode: 'BTC-SRD-261010-01',
    productId: 'prd_sourdough_artisan',
    productionDate: getRelDate(0, 5), // Today 05:00
    expiryDate: getRelDate(4, 21), // 4 days later 21:00
    initialQty: 25,
    remainingQty: 18,
    soldQty: 7,
    wastedQty: 0,
    notes: 'Batch subuh oven 1, ragi aktif sempurna, kerak bagus',
    staffName: 'Budi Santoso',
    status: 'aktif',
    createdAt: getRelDate(0, 5),
    updatedAt: getRelDate(0, 5),
  },
  // Croissant: Batch 1 (Baked yesterday - expiring in 1 day - FEFO earliest)
  {
    id: 'btc_croissant_01',
    batchCode: 'BTC-CRS-261009-02',
    productId: 'prd_butter_croissant',
    productionDate: getRelDate(-1, 6),
    expiryDate: getRelDate(1, 18), // Expiring tomorrow! (mendekati_kedaluwarsa)
    initialQty: 30,
    remainingQty: 8,
    soldQty: 22,
    wastedQty: 0,
    notes: 'Batch kemarin sore, adonan butter sheet Prancis',
    staffName: 'Dewi Lestari',
    status: 'mendekati_kedaluwarsa',
    createdAt: getRelDate(-1, 6),
    updatedAt: getRelDate(-1, 6),
  },
  // Croissant: Batch 2 (Baked today morning - fresh today!)
  {
    id: 'btc_croissant_02',
    batchCode: 'BTC-CRS-261010-01',
    productId: 'prd_butter_croissant',
    productionDate: getRelDate(0, 5),
    expiryDate: getRelDate(2, 18), // Expiring in 2 days
    initialQty: 40,
    remainingQty: 35,
    soldQty: 5,
    wastedQty: 0,
    notes: 'Batch pagi hari ini, lamination sempurna 27 layer',
    staffName: 'Budi Santoso',
    status: 'aktif',
    createdAt: getRelDate(0, 5),
    updatedAt: getRelDate(0, 5),
  },
  // Chocolate Cake: Batch 1 (Baked 2 days ago)
  {
    id: 'btc_chococake_01',
    batchCode: 'BTC-CK-261008-01',
    productId: 'prd_belgian_choco_cake',
    productionDate: getRelDate(-2, 7),
    expiryDate: getRelDate(3, 21),
    initialQty: 8,
    remainingQty: 4,
    soldQty: 4,
    wastedQty: 0,
    notes: 'Chiller display suhu 5C',
    staffName: 'Budi Santoso',
    status: 'aktif',
    createdAt: getRelDate(-2, 7),
    updatedAt: getRelDate(-2, 7),
  },
  // Donut: Batch 1 (Baked today morning - fresh today)
  {
    id: 'btc_donut_01',
    batchCode: 'BTC-DNT-261010-01',
    productId: 'prd_berry_glazed_donut',
    productionDate: getRelDate(0, 5),
    expiryDate: getRelDate(1, 21), // Donut 1 day shelf life
    initialQty: 50,
    remainingQty: 38,
    soldQty: 12,
    wastedQty: 0,
    notes: 'Freshly glazed strawberry puree',
    staffName: 'Ahmad Faiz',
    status: 'aktif',
    createdAt: getRelDate(0, 5),
    updatedAt: getRelDate(0, 5),
  },
  // Cookies: Batch 1 (Baked 3 days ago - long shelf life)
  {
    id: 'btc_cookies_01',
    batchCode: 'BTC-CKS-261007-01',
    productId: 'prd_chocochip_soft_cookies',
    productionDate: getRelDate(-3, 8),
    expiryDate: getRelDate(11, 21),
    initialQty: 30,
    remainingQty: 21,
    soldQty: 9,
    wastedQty: 0,
    notes: 'Sealed jar packing',
    staffName: 'Siti Rahmawati',
    status: 'aktif',
    createdAt: getRelDate(-3, 8),
    updatedAt: getRelDate(-3, 8),
  },
  // Hokkaido Milk Toast: Batch 1 (Baked today)
  {
    id: 'btc_toast_01',
    batchCode: 'BTC-TST-261010-01',
    productId: 'prd_hokkaido_milk_toast',
    productionDate: getRelDate(0, 6),
    expiryDate: getRelDate(4, 20),
    initialQty: 25,
    remainingQty: 22,
    soldQty: 3,
    wastedQty: 0,
    notes: 'Yudane method milk bread super soft',
    staffName: 'Budi Santoso',
    status: 'aktif',
    createdAt: getRelDate(0, 6),
    updatedAt: getRelDate(0, 6),
  },
  // Roti Manis Keju: Batch 1 (Baked today)
  {
    id: 'btc_rotimanis_01',
    batchCode: 'BTC-RMN-261010-01',
    productId: 'prd_roti_manis_keju',
    productionDate: getRelDate(0, 6),
    expiryDate: getRelDate(3, 20),
    initialQty: 40,
    remainingQty: 32,
    soldQty: 8,
    wastedQty: 0,
    notes: 'Topping keju melimpah edam & cheddar',
    staffName: 'Ahmad Faiz',
    status: 'aktif',
    createdAt: getRelDate(0, 6),
    updatedAt: getRelDate(0, 6),
  },
  // French Baguette: Batch 1 (Baked today)
  {
    id: 'btc_baguette_01',
    batchCode: 'BTC-BGT-261010-01',
    productId: 'prd_french_baguette',
    productionDate: getRelDate(0, 6),
    expiryDate: getRelDate(1, 21),
    initialQty: 20,
    remainingQty: 15,
    soldQty: 5,
    wastedQty: 0,
    notes: 'Authentic stone oven baking',
    staffName: 'Budi Santoso',
    status: 'aktif',
    createdAt: getRelDate(0, 6),
    updatedAt: getRelDate(0, 6),
  },
  // Strawberry Tart: Batch 1 (Baked today)
  {
    id: 'btc_tart_01',
    batchCode: 'BTC-TRT-261010-01',
    productId: 'prd_strawberry_tart',
    productionDate: getRelDate(0, 7),
    expiryDate: getRelDate(2, 21),
    initialQty: 15,
    remainingQty: 11,
    soldQty: 4,
    wastedQty: 0,
    notes: 'Fresh chilled pastry cream',
    staffName: 'Dewi Lestari',
    status: 'aktif',
    createdAt: getRelDate(0, 7),
    updatedAt: getRelDate(0, 7),
  },
  // Hampers: Batch 1
  {
    id: 'btc_hampers_01',
    batchCode: 'BTC-HMP-261009-01',
    productId: 'prd_deluxe_bakery_hampers',
    productionDate: getRelDate(-1, 10),
    expiryDate: getRelDate(9, 21),
    initialQty: 10,
    remainingQty: 8,
    soldQty: 2,
    wastedQty: 0,
    notes: 'Exclusive wooden gift box packaging',
    staffName: 'Siti Rahmawati',
    status: 'aktif',
    createdAt: getRelDate(-1, 10),
    updatedAt: getRelDate(-1, 10),
  },
  // Expired sample batch (Demonstrating security & audit verification: MUST NOT BE SOLD)
  {
    id: 'btc_expired_sample',
    batchCode: 'BTC-CRS-261004-OLD',
    productId: 'prd_butter_croissant',
    productionDate: getRelDate(-6, 6),
    expiryDate: getRelDate(-1, 18), // Expired yesterday!
    initialQty: 15,
    remainingQty: 3,
    soldQty: 12,
    wastedQty: 0,
    notes: 'Batch lama - SUDAH KEDALUWARSA - Wajib ditarik ke ruang afkir!',
    staffName: 'Budi Santoso',
    status: 'kedaluwarsa',
    createdAt: getRelDate(-6, 6),
    updatedAt: getRelDate(-1, 18),
  },
];

export const DEFAULT_VOUCHERS: Voucher[] = [
  {
    id: 'vch_bakery10',
    code: 'BAKERY10',
    discountType: 'percentage',
    discountValue: 10,
    minPurchase: 50000,
    maxDiscount: 25000,
    usageLimit: 100,
    usageCount: 14,
    validFrom: '2026-10-01T00:00:00Z',
    validUntil: '2026-12-31T23:59:59Z',
    isActive: true,
  },
  {
    id: 'vch_hemat20',
    code: 'HEMAT20',
    discountType: 'nominal',
    discountValue: 20000,
    minPurchase: 100000,
    usageLimit: 50,
    usageCount: 8,
    validFrom: '2026-10-01T00:00:00Z',
    validUntil: '2026-12-31T23:59:59Z',
    isActive: true,
  },
  {
    id: 'vch_fresh5',
    code: 'FRESH5',
    discountType: 'nominal',
    discountValue: 5000,
    minPurchase: 30000,
    usageLimit: 200,
    usageCount: 32,
    validFrom: '2026-10-01T00:00:00Z',
    validUntil: '2026-12-31T23:59:59Z',
    isActive: true,
  },
];

export const DEFAULT_CUSTOMERS: Customer[] = [
  {
    id: 'cst_01',
    name: 'Amanda Kusuma',
    phone: '081234567890',
    email: 'amanda.k@gmail.com',
    address: 'Jl. Bumi Indah No. 15, Kebayoran Baru, Jakarta Selatan',
    totalOrders: 3,
    totalSpent: 420000,
    notes: 'Pelanggan setia sourdough & croissant, suka delivery pagi',
    createdAt: '2026-10-02T10:00:00Z',
  },
  {
    id: 'cst_02',
    name: 'Bambang Trihatmoko',
    phone: '081898765432',
    email: 'bambang.tri@office.co.id',
    address: 'SCBD Tower 2 Lantai 18, Jakarta Selatan',
    totalOrders: 2,
    totalSpent: 350000,
    notes: 'Sering pesan hampers untuk corporate meeting',
    createdAt: '2026-10-04T14:30:00Z',
  },
  {
    id: 'cst_03',
    name: 'Citra Permata',
    phone: '085711223344',
    address: 'Jl. Senopati Blok S No. 8',
    totalOrders: 1,
    totalSpent: 85000,
    notes: 'Pick up langsung di toko',
    createdAt: '2026-10-08T09:15:00Z',
  },
];

// Initial Order to populate dashboard with real verifiable transaction records
const INITIAL_ORDER_1: Order = {
  id: 'ord_sample_01',
  orderNumber: 'ORD-20261010-1011',
  queueNumber: 1,
  customerName: 'Amanda Kusuma',
  customerPhone: '081234567890',
  customerEmail: 'amanda.k@gmail.com',
  deliveryType: 'delivery',
  deliveryAddress: 'Jl. Bumi Indah No. 15, Kebayoran Baru, Jakarta Selatan',
  deliveryFee: 15000,
  pickupTimeSlot: '10:00 - 12:00 WIB',
  notes: 'Tolong jangan ditekan rotinya saat pengantaran ya',
  items: [
    {
      productId: 'prd_sourdough_artisan',
      productName: 'Artisan Country Sourdough',
      unitPrice: 42000,
      costPrice: 20000,
      qty: 1,
      subtotal: 42000,
      visualType: 'sourdough',
      storageInstructions: 'Simpan di tempat kering suhu ruang',
      allocatedBatches: [
        {
          batchId: 'btc_sourdough_01',
          batchCode: 'BTC-SRD-261010-01',
          qty: 1,
          productionDate: getRelDate(0, 5),
          expiryDate: getRelDate(4, 21),
        },
      ],
    },
    {
      productId: 'prd_butter_croissant',
      productName: 'French Butter Croissant',
      unitPrice: 28000,
      costPrice: 12000,
      qty: 2,
      subtotal: 56000,
      visualType: 'croissant',
      storageInstructions: 'Hangatkan di oven/air fryer 160C',
      allocatedBatches: [
        {
          batchId: 'btc_croissant_01',
          batchCode: 'BTC-CRS-261009-02',
          qty: 2,
          productionDate: getRelDate(-1, 6),
          expiryDate: getRelDate(1, 18),
        },
      ],
    },
  ],
  subtotal: 98000,
  voucherCode: 'BAKERY10',
  discountAmount: 9800,
  taxAmount: 0,
  totalAmount: 103200,
  paymentMethod: 'qris',
  paymentStatus: 'terverifikasi',
  orderStatus: 'siap_diambil',
  channel: 'online',
  receiptNumber: 'STR-20261010-1011',
  createdAt: '2026-10-10T08:15:00Z',
  updatedAt: '2026-10-10T08:45:00Z',
  statusHistory: [
    { status: 'menunggu_konfirmasi', timestamp: '2026-10-10T08:15:00Z', actor: 'Pelanggan (Amanda)' },
    { status: 'pembayaran_terverifikasi', timestamp: '2026-10-10T08:20:00Z', actor: 'Admin Toko (Siti)' },
    { status: 'sedang_disiapkan', timestamp: '2026-10-10T08:30:00Z', actor: 'Dapur (Budi)' },
    { status: 'siap_diambil', timestamp: '2026-10-10T08:45:00Z', actor: 'Admin Toko (Siti)' },
  ],
};

const INITIAL_RECEIPT_1: DigitalReceipt = {
  id: 'rcp_sample_01',
  receiptNumber: 'STR-20261010-1011',
  orderId: 'ord_sample_01',
  orderNumber: 'ORD-20261010-1011',
  queueNumber: 1,
  createdAt: '2026-10-10T08:20:00Z',
  customerName: 'Amanda Kusuma',
  customerPhone: '081234567890',
  channel: 'online',
  deliveryType: 'delivery',
  deliveryAddress: 'Jl. Bumi Indah No. 15, Kebayoran Baru, Jakarta Selatan',
  items: INITIAL_ORDER_1.items,
  subtotal: 98000,
  discountAmount: 9800,
  deliveryFee: 15000,
  taxAmount: 0,
  totalAmount: 103200,
  paymentMethod: 'qris',
  paymentStatus: 'terverifikasi',
  orderStatus: 'siap_diambil',
  printCount: 1,
};

// INITIAL STOCK MOVEMENTS
const INITIAL_MOVEMENTS: StockMovement[] = [
  {
    id: 'mov_01',
    batchId: 'btc_sourdough_01',
    batchCode: 'BTC-SRD-261010-01',
    productId: 'prd_sourdough_artisan',
    productName: 'Artisan Country Sourdough',
    type: 'PRODUKSI',
    qtyChange: 25,
    previousStock: 0,
    newStock: 25,
    reason: 'Hasil produksi harian batch subuh',
    staffName: 'Budi Santoso',
    timestamp: getRelDate(0, 5),
  },
  {
    id: 'mov_02',
    batchId: 'btc_sourdough_01',
    batchCode: 'BTC-SRD-261010-01',
    productId: 'prd_sourdough_artisan',
    productName: 'Artisan Country Sourdough',
    type: 'PENJUALAN',
    qtyChange: -1,
    previousStock: 19,
    newStock: 18,
    reason: 'Pesanan Online ORD-20261010-1011',
    staffName: 'Sistem Toko',
    referenceId: 'ord_sample_01',
    timestamp: '2026-10-10T08:15:00Z',
  },
];

// INITIAL NOTIFICATIONS
const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'notif_01',
    type: 'batch_segera_kedaluwarsa',
    title: 'Batch Mendekati Kedaluwarsa',
    message: 'Batch French Butter Croissant (BTC-CRS-261009-02) tersisa 8 pcs akan kedaluwarsa besok. Utamakan penjualan FEFO!',
    referenceId: 'btc_croissant_01',
    isRead: false,
    timestamp: '2026-10-10T07:00:00Z',
  },
  {
    id: 'notif_02',
    type: 'pesanan_baru',
    title: 'Pesanan Masuk Siap Diambil',
    message: 'Pesanan ORD-20261010-1011 oleh Amanda Kusuma telah disiapkan dapur dan siap dikirim.',
    referenceId: 'ord_sample_01',
    isRead: false,
    timestamp: '2026-10-10T08:45:00Z',
  },
];

export class BakeryStorageService {
  // Current logged in user
  static getCurrentUser(): UserAccount {
    return getStorage<UserAccount>('currentUser', DEFAULT_USERS[0]);
  }

  static setCurrentUser(user: UserAccount): void {
    setStorage('currentUser', user);
  }

  // Admin PIN Access Control (Default PIN: 123456)
  static getAdminPin(): string {
    const pin = getStorage<string>('adminPin', '123456');
    return pin || '123456';
  }

  static setAdminPin(newPin: string): void {
    setStorage('adminPin', newPin.trim());
  }

  static verifyAdminPin(enteredPin: string): boolean {
    const currentPin = this.getAdminPin();
    return enteredPin.trim() === currentPin.trim();
  }

  static resetAdminPin(): void {
    setStorage('adminPin', '123456');
  }

  // Settings
  static getSettings(): StoreSettings {
    const saved = getStorage<Partial<StoreSettings>>('settings', DEFAULT_SETTINGS);
    return { ...DEFAULT_SETTINGS, ...saved };
  }

  static saveSettings(settings: StoreSettings): void {
    setStorage('settings', settings);
  }

  // Categories
  static getCategories(): Category[] {
    return getStorage<Category[]>('categories', DEFAULT_CATEGORIES);
  }

  static saveCategories(categories: Category[]): void {
    setStorage('categories', categories);
  }

  // Products
  static getProducts(): Product[] {
    const saved = getStorage<Product[]>('products', DEFAULT_PRODUCTS);
    // Ensure each product has imageUrl mapped if missing in older cache
    return saved.map(p => {
      if (!p.imageUrl) {
        const defaultMatch = DEFAULT_PRODUCTS.find(dp => dp.id === p.id || dp.visualType === p.visualType);
        if (defaultMatch?.imageUrl) {
          return { ...p, imageUrl: defaultMatch.imageUrl };
        }
      }
      return p;
    });
  }

  static saveProducts(products: Product[]): void {
    setStorage('products', products);
  }

  // Batches
  static getBatches(): ProductionBatch[] {
    const batches = getStorage<ProductionBatch[]>('batches', INITIAL_BATCHES);
    const settings = this.getSettings();
    const now = new Date().getTime();
    const warningMs = (settings.expiryWarningDays || 2) * 24 * 60 * 60 * 1000;

    // Refresh dynamic status based on time
    let changed = false;
    const updated = batches.map(b => {
      if (b.status === 'ditarik') return b;
      const expiry = new Date(b.expiryDate).getTime();
      let newStatus = b.status;
      if (expiry <= now) {
        newStatus = 'kedaluwarsa';
      } else if (b.remainingQty <= 0) {
        newStatus = 'habis';
      } else if (expiry - now <= warningMs) {
        newStatus = 'mendekati_kedaluwarsa';
      } else {
        newStatus = 'aktif';
      }

      if (newStatus !== b.status) {
        changed = true;
        return { ...b, status: newStatus };
      }
      return b;
    });

    if (changed) {
      setStorage('batches', updated);
    }
    return updated;
  }

  static saveBatches(batches: ProductionBatch[]): void {
    setStorage('batches', batches);
  }

  // Stock Movements
  static getMovements(): StockMovement[] {
    return getStorage<StockMovement[]>('movements', INITIAL_MOVEMENTS);
  }

  static addMovement(movement: Omit<StockMovement, 'id' | 'timestamp'>): StockMovement {
    const movements = this.getMovements();
    const newEntry: StockMovement = {
      ...movement,
      id: `mov_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    };
    movements.unshift(newEntry);
    setStorage('movements', movements);
    return newEntry;
  }

  // Customers
  static getCustomers(): Customer[] {
    return getStorage<Customer[]>('customers', DEFAULT_CUSTOMERS);
  }

  static saveCustomers(customers: Customer[]): void {
    setStorage('customers', customers);
  }

  // Vouchers
  static getVouchers(): Voucher[] {
    return getStorage<Voucher[]>('vouchers', DEFAULT_VOUCHERS);
  }

  static saveVouchers(vouchers: Voucher[]): void {
    setStorage('vouchers', vouchers);
  }

  // Orders
  static getOrders(): Order[] {
    return getStorage<Order[]>('orders', [INITIAL_ORDER_1]);
  }

  static saveOrders(orders: Order[]): void {
    setStorage('orders', orders);
  }

  // Receipts
  static getReceipts(): DigitalReceipt[] {
    return getStorage<DigitalReceipt[]>('receipts', [INITIAL_RECEIPT_1]);
  }

  static saveReceipt(receipt: DigitalReceipt): void {
    const receipts = this.getReceipts();
    const idx = receipts.findIndex(r => r.id === receipt.id || r.receiptNumber === receipt.receiptNumber);
    if (idx >= 0) {
      receipts[idx] = receipt;
    } else {
      receipts.unshift(receipt);
    }
    setStorage('receipts', receipts);
  }

  // Notifications
  static getNotifications(): SystemNotification[] {
    return getStorage<SystemNotification[]>('notifications', INITIAL_NOTIFICATIONS);
  }

  static markNotificationRead(id: string): void {
    const notifs = this.getNotifications();
    const updated = notifs.map(n => (n.id === id ? { ...n, isRead: true } : n));
    setStorage('notifications', updated);
  }

  static addNotification(notif: Omit<SystemNotification, 'id' | 'timestamp' | 'isRead'>): void {
    const notifs = this.getNotifications();
    const entry: SystemNotification = {
      ...notif,
      id: `notif_${Date.now()}`,
      isRead: false,
      timestamp: new Date().toISOString(),
    };
    notifs.unshift(entry);
    setStorage('notifications', notifs);
  }

  // Audit Logs
  static getAuditLogs(): AuditLog[] {
    return getStorage<AuditLog[]>('audit_logs', []);
  }

  static logAudit(action: string, entity: string, entityId: string, details: string): void {
    const user = this.getCurrentUser();
    const logs = this.getAuditLogs();
    logs.unshift({
      id: `log_${Date.now()}`,
      action,
      entity,
      entityId,
      actorName: user.name,
      actorRole: user.role,
      details,
      timestamp: new Date().toISOString(),
    });
    setStorage('audit_logs', logs.slice(0, 300)); // retain last 300 logs
  }

  // Cart Management (stored locally per session)
  static getCart(): CartItem[] {
    return getStorage<CartItem[]>('cart', []);
  }

  static saveCart(cart: CartItem[]): void {
    setStorage('cart', cart);
  }

  /**
   * Check store opening and closing schedule in WIB (Asia/Jakarta)
   * Enforces that online orders are ONLY placed and serviced during open hours!
   */
  static getStoreOperatingStatus(): {
    isOpen: boolean;
    statusLabel: string;
    currentWibTimeStr: string;
    openTime: string;
    closeTime: string;
    operatingDays: string;
    policyNote: string;
    reason?: string;
  } {
    const settings = this.getSettings();
    const openTime = settings.openTime || '07:00';
    const closeTime = settings.closeTime || '21:00';
    const operatingDays = settings.operatingDays || 'Setiap Hari (Senin - Minggu)';
    const policyNote = settings.orderQueuePolicy || 'Pesanan online dilayani sesuai urutan dan jam order masuk.';

    // Check manual override by Admin
    if (settings.manualStoreStatus === 'force_open') {
      return {
        isOpen: true,
        statusLabel: `Buka (${openTime} - ${closeTime} WIB) · Melayani Pesanan`,
        currentWibTimeStr: 'Aktif (Override Buka)',
        openTime,
        closeTime,
        operatingDays,
        policyNote,
      };
    }
    if (settings.manualStoreStatus === 'force_closed') {
      return {
        isOpen: false,
        statusLabel: `Tutup Sementara (Di Luar Jam Buka)`,
        currentWibTimeStr: 'Nonaktif (Override Tutup)',
        openTime,
        closeTime,
        operatingDays,
        policyNote,
        reason: 'Toko sedang ditutup sementara oleh pengelola.',
      };
    }

    // Automatic calculation based on WIB (Asia/Jakarta, UTC+7)
    const now = new Date();
    const utcHours = now.getUTCHours();
    const utcMinutes = now.getUTCMinutes();
    const wibHours = (utcHours + 7) % 24;
    const currentTotalMinutes = wibHours * 60 + utcMinutes;

    const [openH, openM] = openTime.split(':').map(Number);
    const [closeH, closeM] = closeTime.split(':').map(Number);

    const openTotalMinutes = (openH ?? 7) * 60 + (openM ?? 0);
    const closeTotalMinutes = (closeH ?? 21) * 60 + (closeM ?? 0);

    const isWithinHours = currentTotalMinutes >= openTotalMinutes && currentTotalMinutes < closeTotalMinutes;
    const currentWibTimeFormatted = `${String(wibHours).padStart(2, '0')}:${String(utcMinutes).padStart(2, '0')} WIB`;

    return {
      isOpen: isWithinHours,
      statusLabel: isWithinHours
        ? `Buka (${openTime} - ${closeTime} WIB)`
        : `Tutup (Buka Pukul ${openTime} WIB)`,
      currentWibTimeStr: currentWibTimeFormatted,
      openTime,
      closeTime,
      operatingDays,
      policyNote,
      reason: !isWithinHours
        ? `Toko sedang tutup (Waktu saat ini: ${currentWibTimeFormatted}). Pembelian online hanya dilayani saat jam buka toko: ${openTime} - ${closeTime} WIB.`
        : undefined,
    };
  }

  // FEFO Stock Queries & Allocation Engine
  static getProductValidStock(productId: string): { totalStock: number; earliestBatch?: ProductionBatch; validBatches: ProductionBatch[] } {
    const batches = this.getBatches();
    const now = new Date().getTime();

    // Only non-expired, non-withdrawn batches with remainingQty > 0
    const validBatches = batches
      .filter(b => b.productId === productId && b.remainingQty > 0 && b.status !== 'kedaluwarsa' && b.status !== 'ditarik' && new Date(b.expiryDate).getTime() > now)
      .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()); // FEFO sort ASC

    const totalStock = validBatches.reduce((sum, b) => sum + b.remainingQty, 0);
    return {
      totalStock,
      earliestBatch: validBatches[0],
      validBatches,
    };
  }

  /**
   * Performs server-authoritative FEFO Batch Allocation for order items.
   * Throws Error if any product has insufficient valid stock.
   */
  static allocateFefo(itemsToBuy: { productId: string; qty: number }[]): { [productId: string]: BatchAllocation[] } {
    const batches = this.getBatches();
    const now = new Date().getTime();
    const allocations: { [productId: string]: BatchAllocation[] } = {};

    // Clone remaining quantities for virtual simulation
    const virtualRemaining: { [batchId: string]: number } = {};
    batches.forEach(b => {
      virtualRemaining[b.id] = b.remainingQty;
    });

    for (const item of itemsToBuy) {
      let needed = item.qty;
      const productAllocations: BatchAllocation[] = [];

      // Valid batches sorted by expiryDate ascending (FEFO)
      const validBatches = batches
        .filter(b => b.productId === item.productId && virtualRemaining[b.id] > 0 && b.status !== 'kedaluwarsa' && b.status !== 'ditarik' && new Date(b.expiryDate).getTime() > now)
        .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

      const totalAvail = validBatches.reduce((sum, b) => sum + virtualRemaining[b.id], 0);
      if (totalAvail < needed) {
        const prod = this.getProducts().find(p => p.id === item.productId);
        throw new Error(`Stok produk "${prod?.name || item.productId}" tidak mencukupi atau batch sudah kedaluwarsa. Tersedia: ${totalAvail}, diminta: ${needed}.`);
      }

      for (const batch of validBatches) {
        if (needed <= 0) break;
        const availableInBatch = virtualRemaining[batch.id];
        const take = Math.min(availableInBatch, needed);

        productAllocations.push({
          batchId: batch.id,
          batchCode: batch.batchCode,
          qty: take,
          productionDate: batch.productionDate,
          expiryDate: batch.expiryDate,
        });

        virtualRemaining[batch.id] -= take;
        needed -= take;
      }

      allocations[item.productId] = productAllocations;
    }

    return allocations;
  }

  /**
   * Finalizes an Order:
   * - Validates FEFO allocation
   * - Deducts batch stock
   * - Records Stock Movements
   * - Saves Order & Digital Receipt
   * - Records Customer transaction
   */
  static createOrder(orderInput: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    deliveryType: 'pickup' | 'delivery';
    deliveryAddress?: string;
    deliveryFee: number;
    pickupTimeSlot?: string;
    notes?: string;
    items: { productId: string; qty: number }[];
    voucherCode?: string;
    paymentMethod: 'tunai' | 'transfer_bank' | 'qris';
    channel: 'online' | 'kasir_pos';
    cashierName?: string;
    paidAmount?: number;
    changeAmount?: number;
    orderStatus?: OrderStatus;
    paymentStatus?: PaymentStatus;
  }): { order: Order; receipt: DigitalReceipt } {
    const settings = this.getSettings();
    const products = this.getProducts();
    const vouchers = this.getVouchers();
    const batches = this.getBatches();

    // 0. Validate Store Operating Hours for Online Channel
    if (orderInput.channel === 'online') {
      const storeStatus = this.getStoreOperatingStatus();
      if (!storeStatus.isOpen) {
        throw new Error(
          storeStatus.reason ||
          `Toko sedang tutup. Pemesanan online hanya dilayani saat jam buka toko: ${storeStatus.openTime} - ${storeStatus.closeTime} WIB. Pesanan baru akan diproses kembali saat jam buka toko.`
        );
      }
    }

    // 1. FEFO Allocation Validation
    const allocations = this.allocateFefo(orderInput.items);

    // 2. Build Order Items
    let subtotal = 0;
    const finalOrderItems: OrderItem[] = [];

    for (const inputItem of orderInput.items) {
      const product = products.find(p => p.id === inputItem.productId);
      if (!product) throw new Error(`Produk dengan ID ${inputItem.productId} tidak ditemukan.`);

      const unitPrice = product.promoPrice && product.promoPrice > 0 ? product.promoPrice : product.normalPrice;
      const itemSubtotal = unitPrice * inputItem.qty;
      subtotal += itemSubtotal;

      finalOrderItems.push({
        productId: product.id,
        productName: product.name,
        unitPrice,
        costPrice: Math.round(unitPrice * 0.5), // estimated HPP
        qty: inputItem.qty,
        subtotal: itemSubtotal,
        visualType: product.visualType,
        storageInstructions: product.storageInstructions,
        allocatedBatches: allocations[product.id],
      });
    }

    // 3. Voucher calculation
    let discountAmount = 0;
    if (orderInput.voucherCode) {
      const v = vouchers.find(vch => vch.code.toUpperCase() === orderInput.voucherCode?.toUpperCase() && vch.isActive);
      if (v) {
        if (subtotal >= v.minPurchase) {
          if (v.discountType === 'percentage') {
            const rawDiscount = (subtotal * v.discountValue) / 100;
            discountAmount = v.maxDiscount ? Math.min(rawDiscount, v.maxDiscount) : rawDiscount;
          } else {
            discountAmount = v.discountValue;
          }
          // Increment voucher usage
          v.usageCount += 1;
          this.saveVouchers(vouchers);
        }
      }
    }

    const taxAmount = 0; // standard 0 for retail bakery
    const totalAmount = Math.max(0, subtotal - discountAmount + orderInput.deliveryFee);

    // 4. Generate Order and Receipt identifiers & Sequential Queue Number
    const orderNumber = generateOrderNumber(settings.orderNumberPrefix || 'ORD');
    const receiptNumber = generateReceiptNumber(settings.receiptNumberPrefix || 'STR');
    const nowIso = new Date().toISOString();
    const todayPrefix = nowIso.slice(0, 10);
    const existingOrders = this.getOrders();
    const todayOrdersCount = existingOrders.filter(o => o.createdAt.startsWith(todayPrefix)).length;
    const queueNumber = todayOrdersCount + 1;

    const orderStatus: OrderStatus = orderInput.orderStatus || (orderInput.channel === 'kasir_pos' ? 'selesai' : 'menunggu_konfirmasi');
    const paymentStatus: PaymentStatus = orderInput.paymentStatus || (orderInput.channel === 'kasir_pos' ? 'terverifikasi' : 'menunggu_verifikasi');

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      orderNumber,
      queueNumber,
      customerName: orderInput.customerName.trim(),
      customerPhone: orderInput.customerPhone.trim(),
      customerEmail: orderInput.customerEmail?.trim(),
      deliveryType: orderInput.deliveryType,
      deliveryAddress: orderInput.deliveryAddress,
      deliveryFee: orderInput.deliveryFee,
      pickupTimeSlot: orderInput.pickupTimeSlot,
      notes: orderInput.notes,
      items: finalOrderItems,
      subtotal,
      voucherCode: orderInput.voucherCode,
      discountAmount,
      taxAmount,
      totalAmount,
      paymentMethod: orderInput.paymentMethod,
      paymentStatus,
      orderStatus,
      channel: orderInput.channel,
      cashierName: orderInput.cashierName,
      paidAmount: orderInput.paidAmount,
      changeAmount: orderInput.changeAmount,
      receiptNumber,
      createdAt: nowIso,
      updatedAt: nowIso,
      statusHistory: [
        {
          status: orderStatus,
          timestamp: nowIso,
          actor: orderInput.cashierName || orderInput.customerName,
          notes: orderInput.channel === 'kasir_pos' ? 'Transaksi Kasir POS Toko Langsung' : `Pemesanan Web Pelanggan (Antrean #${queueNumber})`,
        },
      ],
    };

    // 5. Deduct batches & write stock movements
    const updatedBatches = [...batches];
    for (const item of finalOrderItems) {
      for (const alloc of item.allocatedBatches) {
        const batchIdx = updatedBatches.findIndex(b => b.id === alloc.batchId);
        if (batchIdx >= 0) {
          const b = updatedBatches[batchIdx];
          const prev = b.remainingQty;
          const next = Math.max(0, b.remainingQty - alloc.qty);
          b.remainingQty = next;
          b.soldQty += alloc.qty;
          if (b.remainingQty === 0) {
            b.status = 'habis';
          }

          // Record movement
          this.addMovement({
            batchId: b.id,
            batchCode: b.batchCode,
            productId: item.productId,
            productName: item.productName,
            type: 'PENJUALAN',
            qtyChange: -alloc.qty,
            previousStock: prev,
            newStock: next,
            reason: `Penjualan ${newOrder.orderNumber} (${orderInput.channel === 'kasir_pos' ? 'POS Kasir' : 'Online Antrean #' + queueNumber})`,
            staffName: orderInput.cashierName || 'Sistem Penjualan',
            referenceId: newOrder.id,
          });
        }
      }
    }
    this.saveBatches(updatedBatches);

    // 6. Save Order
    const orders = this.getOrders();
    orders.unshift(newOrder);
    this.saveOrders(orders);

    // 7. Generate & Save Digital Receipt
    const receipt: DigitalReceipt = {
      id: `rcp_${Date.now()}`,
      receiptNumber,
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      queueNumber,
      createdAt: nowIso,
      customerName: newOrder.customerName,
      customerPhone: newOrder.customerPhone,
      cashierName: newOrder.cashierName,
      channel: newOrder.channel,
      deliveryType: newOrder.deliveryType,
      deliveryAddress: newOrder.deliveryAddress,
      items: newOrder.items,
      subtotal: newOrder.subtotal,
      discountAmount: newOrder.discountAmount,
      deliveryFee: newOrder.deliveryFee,
      taxAmount: newOrder.taxAmount,
      totalAmount: newOrder.totalAmount,
      paymentMethod: newOrder.paymentMethod,
      paymentStatus: newOrder.paymentStatus,
      orderStatus: newOrder.orderStatus,
      paidAmount: newOrder.paidAmount,
      changeAmount: newOrder.changeAmount,
      printCount: 0,
    };
    this.saveReceipt(receipt);

    // 8. Update Customer Records
    const customers = this.getCustomers();
    const custIdx = customers.findIndex(c => c.phone === newOrder.customerPhone);
    if (custIdx >= 0) {
      customers[custIdx].totalOrders += 1;
      customers[custIdx].totalSpent += newOrder.totalAmount;
      if (newOrder.deliveryAddress) customers[custIdx].address = newOrder.deliveryAddress;
    } else {
      customers.push({
        id: `cst_${Date.now()}`,
        name: newOrder.customerName,
        phone: newOrder.customerPhone,
        email: newOrder.customerEmail,
        address: newOrder.deliveryAddress || 'Ambil di Toko',
        totalOrders: 1,
        totalSpent: newOrder.totalAmount,
        createdAt: nowIso,
      });
    }
    this.saveCustomers(customers);

    // 9. Emit Notification
    this.addNotification({
      type: 'pesanan_baru',
      title: `Pesanan Baru ${orderNumber}`,
      message: `${newOrder.customerName} membuat pesanan senilai ${totalAmount.toLocaleString('id-ID')} (${newOrder.deliveryType === 'delivery' ? 'Pengiriman' : 'Ambil di Toko'})`,
      referenceId: newOrder.id,
    });

    // 10. Audit log
    this.logAudit('CREATE_ORDER', 'ORDER', newOrder.id, `Pesanan ${orderNumber} dibuat via ${orderInput.channel} senilai Rp ${totalAmount.toLocaleString('id-ID')}`);

    return { order: newOrder, receipt };
  }

  /**
   * Cancel an order safely:
   * Returns stock ONLY to batches that are NOT expired and NOT withdrawn.
   */
  static cancelOrder(orderId: string, reason: string): Order {
    const orders = this.getOrders();
    const orderIdx = orders.findIndex(o => o.id === orderId);
    if (orderIdx < 0) throw new Error('Pesanan tidak ditemukan.');

    const order = orders[orderIdx];
    if (order.orderStatus === 'dibatalkan') throw new Error('Pesanan sudah dalam status dibatalkan.');

    const now = new Date().getTime();
    const batches = this.getBatches();
    const updatedBatches = [...batches];

    // Return stock
    for (const item of order.items) {
      for (const alloc of item.allocatedBatches) {
        const bIdx = updatedBatches.findIndex(b => b.id === alloc.batchId);
        if (bIdx >= 0) {
          const b = updatedBatches[bIdx];
          const isExpired = new Date(b.expiryDate).getTime() <= now;
          if (!isExpired && b.status !== 'ditarik') {
            const prev = b.remainingQty;
            const next = b.remainingQty + alloc.qty;
            b.remainingQty = next;
            b.soldQty = Math.max(0, b.soldQty - alloc.qty);
            if (b.status === 'habis') {
              b.status = 'aktif';
            }

            this.addMovement({
              batchId: b.id,
              batchCode: b.batchCode,
              productId: item.productId,
              productName: item.productName,
              type: 'BATAL_PESANAN',
              qtyChange: alloc.qty,
              previousStock: prev,
              newStock: next,
              reason: `Pengembalian stok dari pembatalan pesanan ${order.orderNumber}: ${reason}`,
              staffName: this.getCurrentUser().name,
              referenceId: order.id,
            });
          }
        }
      }
    }
    this.saveBatches(updatedBatches);

    // Update order status
    order.orderStatus = 'dibatalkan';
    order.paymentStatus = 'dibatalkan';
    order.updatedAt = new Date().toISOString();
    order.statusHistory.push({
      status: 'dibatalkan',
      timestamp: new Date().toISOString(),
      actor: this.getCurrentUser().name,
      notes: reason,
    });
    orders[orderIdx] = order;
    this.saveOrders(orders);

    this.logAudit('CANCEL_ORDER', 'ORDER', order.id, `Pesanan ${order.orderNumber} dibatalkan: ${reason}`);
    return order;
  }

  /**
   * Updates order status & tracks in statusHistory
   */
  static updateOrderStatus(orderId: string, newStatus: OrderStatus, notes?: string): Order {
    const orders = this.getOrders();
    const orderIdx = orders.findIndex(o => o.id === orderId);
    if (orderIdx < 0) throw new Error('Pesanan tidak ditemukan.');

    const order = orders[orderIdx];
    order.orderStatus = newStatus;
    order.updatedAt = new Date().toISOString();
    order.statusHistory.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
      actor: this.getCurrentUser().name,
      notes,
    });
    orders[orderIdx] = order;
    this.saveOrders(orders);

    // Sync receipt status if exists
    const receipts = this.getReceipts();
    const rIdx = receipts.findIndex(r => r.orderId === orderId);
    if (rIdx >= 0) {
      receipts[rIdx].orderStatus = newStatus;
      this.saveReceipt(receipts[rIdx]);
    }

    this.logAudit('UPDATE_ORDER_STATUS', 'ORDER', order.id, `Status diubah menjadi "${newStatus}"`);
    return order;
  }

  /**
   * Verify or update payment status
   */
  static verifyPayment(orderId: string, status: PaymentStatus): Order {
    const orders = this.getOrders();
    const orderIdx = orders.findIndex(o => o.id === orderId);
    if (orderIdx < 0) throw new Error('Pesanan tidak ditemukan.');

    const order = orders[orderIdx];
    order.paymentStatus = status;
    if (status === 'terverifikasi' && order.orderStatus === 'menunggu_konfirmasi') {
      order.orderStatus = 'pembayaran_terverifikasi';
    }
    order.updatedAt = new Date().toISOString();
    orders[orderIdx] = order;
    this.saveOrders(orders);

    const receipts = this.getReceipts();
    const rIdx = receipts.findIndex(r => r.orderId === orderId);
    if (rIdx >= 0) {
      receipts[rIdx].paymentStatus = status;
      this.saveReceipt(receipts[rIdx]);
    }

    this.logAudit('VERIFY_PAYMENT', 'ORDER', order.id, `Pembayaran diverifikasi: ${status}`);
    return order;
  }

  /**
   * Batch Management: Add New Batch from Production
   */
  static createBatch(input: {
    productId: string;
    productionDate: string;
    expiryDate: string;
    initialQty: number;
    notes: string;
    staffName: string;
  }): ProductionBatch {
    const batches = this.getBatches();
    const product = this.getProducts().find(p => p.id === input.productId);
    if (!product) throw new Error('Produk tidak ditemukan');

    const shortCode = product.name.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, 'ROT');
    const batchCode = generateBatchCode(shortCode);
    const nowIso = new Date().toISOString();

    const newBatch: ProductionBatch = {
      id: `btc_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      batchCode,
      productId: input.productId,
      productionDate: input.productionDate,
      expiryDate: input.expiryDate,
      initialQty: input.initialQty,
      remainingQty: input.initialQty,
      soldQty: 0,
      wastedQty: 0,
      notes: input.notes,
      staffName: input.staffName,
      status: 'aktif',
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    batches.unshift(newBatch);
    this.saveBatches(batches);

    // Record stock movement
    this.addMovement({
      batchId: newBatch.id,
      batchCode: newBatch.batchCode,
      productId: product.id,
      productName: product.name,
      type: 'PRODUKSI',
      qtyChange: input.initialQty,
      previousStock: 0,
      newStock: input.initialQty,
      reason: `Hasil produksi baru: ${input.notes || '-'}`,
      staffName: input.staffName,
      referenceId: newBatch.id,
    });

    this.logAudit('CREATE_BATCH', 'BATCH', newBatch.id, `Batch baru ${batchCode} untuk ${product.name} (+${input.initialQty} pcs)`);
    return newBatch;
  }

  /**
   * Batch Management: Adjust or Record Waste / Withdrawal
   */
  static adjustBatchStock(batchId: string, adjustQty: number, reason: string, isWaste = false): ProductionBatch {
    const batches = this.getBatches();
    const bIdx = batches.findIndex(b => b.id === batchId);
    if (bIdx < 0) throw new Error('Batch tidak ditemukan');

    const b = batches[bIdx];
    const prev = b.remainingQty;
    const next = Math.max(0, b.remainingQty + adjustQty);
    b.remainingQty = next;

    if (isWaste && adjustQty < 0) {
      b.wastedQty += Math.abs(adjustQty);
    }
    if (next === 0) {
      b.status = 'habis';
    }

    b.updatedAt = new Date().toISOString();
    batches[bIdx] = b;
    this.saveBatches(batches);

    const product = this.getProducts().find(p => p.id === b.productId);
    this.addMovement({
      batchId: b.id,
      batchCode: b.batchCode,
      productId: b.productId,
      productName: product?.name || 'Produk',
      type: isWaste ? 'RUSAK_KEDALUWARSA' : adjustQty > 0 ? 'KOREKSI_TAMBAH' : 'KOREKSI_KURANG',
      qtyChange: adjustQty,
      previousStock: prev,
      newStock: next,
      reason,
      staffName: this.getCurrentUser().name,
      referenceId: b.id,
    });

    this.logAudit('ADJUST_STOCK', 'BATCH', b.id, `Koreksi stok ${b.batchCode} (${adjustQty > 0 ? '+' : ''}${adjustQty} pcs): ${reason}`);
    return b;
  }

  /**
   * Reset data to initial seed for testing / evaluation
   */
  static resetToDemoData(): void {
    setStorage('settings', DEFAULT_SETTINGS);
    setStorage('categories', DEFAULT_CATEGORIES);
    setStorage('products', DEFAULT_PRODUCTS);
    setStorage('batches', INITIAL_BATCHES);
    setStorage('movements', INITIAL_MOVEMENTS);
    setStorage('customers', DEFAULT_CUSTOMERS);
    setStorage('vouchers', DEFAULT_VOUCHERS);
    setStorage('orders', [INITIAL_ORDER_1]);
    setStorage('receipts', [INITIAL_RECEIPT_1]);
    setStorage('notifications', INITIAL_NOTIFICATIONS);
    setStorage('adminPin', '123456');
    setStorage('audit_logs', []);
    setStorage('cart', []);
  }
}
