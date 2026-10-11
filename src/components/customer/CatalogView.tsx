import React, { useState, useMemo } from 'react';
import { Search, Sparkles, Plus, Eye, AlertCircle, Calendar, Clock, ShieldAlert } from 'lucide-react';
import { Category, Product, ProductionBatch, StoreSettings } from '../../types/bakery';
import { formatRupiah, formatDateOnlyIndo } from '../../utils/formatters';
import { BakeryVisual } from '../common/BakeryVisual';
import { BakeryStorageService } from '../../services/storage';

interface CatalogViewProps {
  products: Product[];
  categories: Category[];
  batches: ProductionBatch[];
  settings: StoreSettings;
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  products,
  categories,
  batches,
  settings,
  selectedCategory,
  onSelectCategory,
  onSelectProduct,
  onAddToCart,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'fresh_today' | 'promo' | 'preorder'>('all');
  const [showClosedModal, setShowClosedModal] = useState(false);

  const storeStatus = BakeryStorageService.getStoreOperatingStatus();

  // Compute live stock & batch metadata per product
  const productMetaMap = useMemo(() => {
    const map = new Map<string, { totalStock: number; earliestBatch?: ProductionBatch; isBakedToday: boolean }>();
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    for (const p of products) {
      const pBatches = batches.filter(
        b => b.productId === p.id && b.remainingQty > 0 && b.status !== 'ditarik' && b.status !== 'kedaluwarsa' && new Date(b.expiryDate).getTime() > now.getTime()
      );
      // Sort FEFO (Earliest Expiry First)
      pBatches.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

      const totalStock = pBatches.reduce((acc, b) => acc + b.remainingQty, 0);
      const earliestBatch = pBatches[0];
      const isBakedToday = pBatches.some(b => b.productionDate.slice(0, 10) === todayStr);

      map.set(p.id, { totalStock, earliestBatch, isBakedToday });
    }
    return map;
  }, [products, batches]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (p.isArchived) return false;

      // Category filter
      if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesDesc = p.description.toLowerCase().includes(query);
        const matchesIngr = p.ingredients.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesIngr) return false;
      }

      const meta = productMetaMap.get(p.id);

      // Sub-filter tabs
      if (filterMode === 'fresh_today' && !meta?.isBakedToday) {
        return false;
      }
      if (filterMode === 'promo' && (!p.promoPrice || p.promoPrice <= 0)) {
        return false;
      }
      if (filterMode === 'preorder' && !p.isPreOrder) {
        return false;
      }

      return true;
    });
  }, [products, selectedCategory, searchQuery, filterMode, productMetaMap]);

  const handleBuyClick = (product: Product, isOutOfStock: boolean) => {
    if (isOutOfStock) return;
    if (!storeStatus.isOpen) {
      setShowClosedModal(true);
      return;
    }
    onAddToCart(product);
  };

  return (
    <section id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-14">
      {/* Notice Jadwal Jam Buka & Antrean Order Online */}
      <div className={`mb-8 p-4 sm:p-5 rounded-2xl border text-xs transition-colors ${
        storeStatus.isOpen
          ? 'bg-gradient-to-r from-[#FAF0E4] to-[#F5E6D3] border-[#DFCBB5] text-[#4A3228]'
          : 'bg-rose-50 border-rose-200 text-rose-900'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              storeStatus.isOpen ? 'bg-[#8D5B36] text-white' : 'bg-rose-600 text-white'
            }`}>
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#3A241D]">
                  Jadwal Operasional Toko: {settings.openTime} – {settings.closeTime} WIB
                </span>
                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                  storeStatus.isOpen ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'
                }`}>
                  {storeStatus.isOpen ? '● BUKA SEKARANG' : '✕ TUTUP'}
                </span>
              </div>
              <p className="text-[11px] text-[#6B4F43] mt-0.5">
                <strong>Ketentuan Layanan Online:</strong> Pembelian online dilayani sesuai nomor urutan dan jam transaksi order (FIFO). Order hanya dilayani ketika order dibuat pada jam buka toko ({settings.openTime} – {settings.closeTime} WIB).
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2 text-[11px] font-semibold text-[#8C4F1A] bg-white/70 px-3 py-1.5 rounded-xl border border-[#E8DEC8]">
            <span>Hari Layanan:</span>
            <span className="text-[#3A241D]">{settings.operatingDays || 'Setiap Hari'}</span>
          </div>
        </div>

        {!storeStatus.isOpen && (
          <div className="mt-3 pt-3 border-t border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              Perhatian: Saat ini toko sedang tutup. Anda tetap dapat menjelajahi seluruh menu katalog dan memeriksa ketersediaan stok & tanggal kedaluwarsa batch. Pesanan baru dapat dibuat dan akan diproses saat toko buka pukul {settings.openTime} WIB.
            </span>
          </div>
        )}
      </div>

      {/* Title & Filter Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#9A6237] block mb-1">
            Koleksi Dapur Bakery House
          </span>
          <h2 className="font-serif-bakery text-2xl sm:text-4xl font-bold text-[#3A241D]">
            Katalog Produk & Kesegaran Batch
          </h2>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C6D62]" />
          <input
            type="text"
            placeholder="Cari roti, croissant, cake, donat..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#DFCBB5] text-sm text-[#3A241D] placeholder-[#A68F81] focus:outline-none focus:ring-2 focus:ring-[#8D5B36]/30 focus:border-[#8D5B36] transition-all shadow-xs"
          />
        </div>
      </div>

      {/* Category Pills (Functional filter tabs) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-5 no-scrollbar">
        <button
          onClick={() => onSelectCategory('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-[#3A241D] text-white shadow-xs'
              : 'bg-white hover:bg-[#F3E3D1] text-[#5C453C] border border-[#DFCBB5]'
          }`}
        >
          Semua Kategori ({products.filter(p => !p.isArchived).length})
        </button>
        {categories.map(cat => {
          const count = products.filter(p => p.categoryId === cat.id && !p.isArchived).length;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#8D5B36] text-white shadow-xs'
                  : 'bg-white hover:bg-[#F3E3D1] text-[#5C453C] border border-[#DFCBB5]'
              }`}
            >
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Sub Filter Segmented Controls */}
      <div className="flex items-center gap-2 mb-8 bg-[#EFE5D7] p-1.5 rounded-xl w-fit border border-[#DFCBB5]">
        <button
          onClick={() => setFilterMode('all')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            filterMode === 'all' ? 'bg-white text-[#3A241D] shadow-xs' : 'text-[#6B4F43] hover:text-[#3A241D]'
          }`}
        >
          Semua Produk
        </button>
        <button
          onClick={() => setFilterMode('fresh_today')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
            filterMode === 'fresh_today' ? 'bg-[#D97706] text-white shadow-xs' : 'text-[#6B4F43] hover:text-[#3A241D]'
          }`}
        >
          <Sparkles className="w-3 h-3" />
          <span>Fresh Today</span>
        </button>
        <button
          onClick={() => setFilterMode('promo')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            filterMode === 'promo' ? 'bg-[#991B1B] text-white shadow-xs' : 'text-[#6B4F43] hover:text-[#3A241D]'
          }`}
        >
          Sedang Promo
        </button>
        <button
          onClick={() => setFilterMode('preorder')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            filterMode === 'preorder' ? 'bg-[#4338CA] text-white shadow-xs' : 'text-[#6B4F43] hover:text-[#3A241D]'
          }`}
        >
          Pre-Order
        </button>
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-[#DFCBB5] p-8 max-w-md mx-auto">
          <AlertCircle className="w-10 h-10 text-[#9A6237] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#3A241D] mb-1">Tidak Ada Produk Ditemukan</h3>
          <p className="text-xs text-[#7A584A] mb-4">
            Tidak ada produk yang cocok dengan pencarian atau filter yang dipilih. Coba reset filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterMode('all');
              onSelectCategory('all');
            }}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#8D5B36] text-white hover:bg-[#724524] transition-colors cursor-pointer"
          >
            Reset Semua Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => {
            const meta = productMetaMap.get(product.id);
            const stock = meta?.totalStock || 0;
            const isOutOfStock = stock <= 0 && !product.isPreOrder;
            const earliest = meta?.earliestBatch;
            const category = categories.find(c => c.id === product.categoryId);

            return (
              <div
                key={product.id}
                className="group bg-white rounded-2xl border border-[#E8DEC8] hover:border-[#D5BFA4] shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden"
              >
                {/* Visual Area with Real Photographic Image */}
                <div className="relative overflow-hidden cursor-pointer" onClick={() => onSelectProduct(product)}>
                  <BakeryVisual
                    type={product.visualType}
                    imageUrl={product.imageUrl}
                    alt={product.name}
                    size="md"
                    className="group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Subtle badges (top left and right) */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
                    {meta?.isBakedToday && (
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide uppercase bg-[#D97706] text-white shadow-xs">
                        Fresh Today
                      </span>
                    )}
                    {product.promoPrice && product.promoPrice > 0 && (
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide uppercase bg-[#B91C1C] text-white shadow-xs">
                        Promo
                      </span>
                    )}
                    {product.isPreOrder && (
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide uppercase bg-[#4338CA] text-white shadow-xs">
                        Pre-Order
                      </span>
                    )}
                  </div>

                  {/* Stock pill */}
                  <div className="absolute top-3 right-3">
                    {isOutOfStock ? (
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                        Habis
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-white/95 backdrop-blur-xs text-[#5C453C] border border-[#DFCBB5] font-mono-nums">
                        Sisa {stock} {product.unit}
                      </span>
                    )}
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Category & Weight */}
                    <div className="flex items-center gap-1.5 text-[11px] text-[#8C6D62] mb-1">
                      <span>{category?.name || 'Bakery'}</span>
                      <span aria-hidden="true">·</span>
                      <span>{product.weightGrams}g / {product.unit}</span>
                    </div>

                    {/* Product Title */}
                    <h3
                      onClick={() => onSelectProduct(product)}
                      className="font-serif-bakery font-bold text-base text-[#3A241D] group-hover:text-[#B45309] transition-colors cursor-pointer line-clamp-1 mb-1.5"
                    >
                      {product.name}
                    </h3>

                    {/* Short Description */}
                    <p className="text-xs text-[#7A584A] line-clamp-2 leading-relaxed mb-3">
                      {product.description}
                    </p>

                    {/* FEFO Batch Date Info */}
                    {earliest && (
                      <div className="p-2 rounded-lg bg-[#FAF6F0] border border-[#EFE5D7] mb-3 text-[11px] text-[#6B4F43] flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#B45309] shrink-0" />
                          <span>Exp: {formatDateOnlyIndo(earliest.expiryDate)}</span>
                        </div>
                        <span className="font-mono text-[10px] text-[#8C6D62]">
                          Batch {earliest.batchCode.split('-').slice(-1)[0]}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Price & Action Button */}
                  <div className="pt-3 border-t border-[#F2ECE1] flex items-center justify-between gap-2">
                    <div>
                      {product.promoPrice && product.promoPrice > 0 ? (
                        <div>
                          <span className="text-[11px] text-slate-400 line-through block font-mono-nums">
                            {formatRupiah(product.normalPrice)}
                          </span>
                          <span className="font-bold text-base text-[#B45309] font-mono-nums">
                            {formatRupiah(product.promoPrice)}
                          </span>
                        </div>
                      ) : (
                        <span className="font-bold text-base text-[#3A241D] font-mono-nums">
                          {formatRupiah(product.normalPrice)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onSelectProduct(product)}
                        className="p-2 rounded-xl text-[#5C453C] hover:bg-[#FAF0E4] border border-[#DFCBB5] transition-colors cursor-pointer"
                        title="Lihat Detail Produk"
                        aria-label="Lihat Detail Produk"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleBuyClick(product, isOutOfStock)}
                        disabled={isOutOfStock}
                        className={`flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isOutOfStock
                            ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                            : !storeStatus.isOpen
                            ? 'bg-[#8D5B36]/80 hover:bg-[#8D5B36] text-white shadow-xs'
                            : 'bg-[#8D5B36] hover:bg-[#724524] text-white shadow-xs'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Beli</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Closed Modal Warning when customer tries to order during closed hours */}
      {showClosedModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#DFCBB5] p-6 text-center animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-4 border border-rose-200">
              <Clock className="w-7 h-7" />
            </div>

            <h3 className="font-serif-bakery text-xl font-bold text-[#3A241D] mb-2">
              Toko Sedang Tutup
            </h3>

            <p className="text-xs text-[#6B4F43] leading-relaxed mb-4">
              Pemesanan online kami <strong>hanya dilayani pada jam buka toko</strong>:
              <br />
              <span className="font-bold text-[#B45309] text-sm block my-1">
                {settings.openTime} – {settings.closeTime} WIB ({settings.operatingDays || 'Setiap Hari'})
              </span>
              Seluruh pesanan online akan dilayani dan disiapkan secara ketat berdasarkan <strong>urutan nomor antrean dan jam transaksi masuk (FIFO)</strong> ketika toko telah buka.
            </p>

            <div className="p-3 rounded-xl bg-[#FAF6F0] border border-[#E8DEC8] text-[11px] text-[#7A584A] mb-5 text-left space-y-1">
              <div>⏰ <strong>Waktu Toko Saat Ini:</strong> {storeStatus.currentWibTimeStr}</div>
              <div>⚡ <strong>Status:</strong> {storeStatus.statusLabel}</div>
            </div>

            <button
              onClick={() => setShowClosedModal(false)}
              className="w-full py-3 rounded-xl bg-[#8D5B36] hover:bg-[#724524] text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              Saya Mengerti & Tetap Jelajahi Menu
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
