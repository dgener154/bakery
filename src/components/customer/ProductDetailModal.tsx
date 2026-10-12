import React, { useState } from 'react';
import { X, Plus, Minus, ShoppingBag, ShieldAlert, Sparkles, Calendar, Info, Clock } from 'lucide-react';
import { Category, Product, ProductionBatch } from '../../types/bakery';
import { formatRupiah, formatDateTimeIndo } from '../../utils/formatters';
import { BakeryVisual } from '../common/BakeryVisual';

interface ProductDetailModalProps {
  product: Product | null;
  categories: Category[];
  batches: ProductionBatch[];
  onClose: () => void;
  onAddToCartWithQty: (product: Product, qty: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  categories,
  batches,
  onClose,
  onAddToCartWithQty,
}) => {
  if (!product) return null;

  const [qty, setQty] = useState(1);
  const now = new Date().getTime();

  // Valid non-expired batches for this product sorted by FEFO
  const validBatches = batches
    .filter(b => b.productId === product.id && b.remainingQty > 0 && b.status !== 'kedaluwarsa' && b.status !== 'ditarik' && new Date(b.expiryDate).getTime() > now)
    .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

  const totalStock = validBatches.reduce((acc, b) => acc + b.remainingQty, 0);
  const allocatedBatch = validBatches[0];
  const isOutOfStock = totalStock <= 0 && !product.isPreOrder;
  const unitPrice = product.promoPrice && product.promoPrice > 0 ? product.promoPrice : product.normalPrice;
  const category = categories.find(c => c.id === product.categoryId);

  const handleIncrement = () => {
    if (qty < totalStock) {
      setQty(prev => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (qty > 1) {
      setQty(prev => prev - 1);
    }
  };

  const handleAdd = () => {
    onAddToCartWithQty(product, qty);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#DFCBB5] overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#5C453C] shadow-md flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Visual */}
        <div className="relative">
          <BakeryVisual
            type={product.visualType}
            imageUrl={product.imageUrl}
            alt={product.name}
            size="lg"
          />
          <div className="absolute bottom-4 left-4 flex gap-2">
            {allocatedBatch && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#3A241D]/90 text-white backdrop-blur-xs shadow-xs">
                Batch Aktif: {allocatedBatch.batchCode}
              </span>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Header Info */}
          <div>
            <div className="flex items-center gap-2 text-xs text-[#8C6D62] mb-1">
              <span>{category?.name || 'Bakery'}</span>
              <span aria-hidden="true">·</span>
              <span>Berat: {product.weightGrams} gram</span>
              <span aria-hidden="true">·</span>
              <span>Satuan: {product.unit}</span>
            </div>
            <h2 className="font-serif-bakery text-2xl sm:text-3xl font-bold text-[#3A241D]">
              {product.name}
            </h2>

            {/* Price */}
            <div className="flex items-baseline gap-3 mt-2">
              <span className="font-bold text-2xl text-[#B45309] font-mono-nums">
                {formatRupiah(unitPrice)}
              </span>
              {product.promoPrice && product.promoPrice > 0 && (
                <span className="text-sm text-slate-400 line-through font-mono-nums">
                  {formatRupiah(product.normalPrice)}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#9A6237]">
              Deskripsi Produk
            </h4>
            <p className="text-sm text-[#5C453C] leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* FEFO Batch Allocation Transparency */}
          <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#E8DEC8] space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#3A241D]">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#D97706]" />
                Informasi Batch & Kesegaran Produk (FEFO)
              </span>
              <span className="font-mono-nums text-[#8D5B36]">
                Sisa Stok: {totalStock} {product.unit}
              </span>
            </div>

            {allocatedBatch ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs text-[#6B4F43]">
                <div className="flex items-center gap-2 bg-white/70 p-2.5 rounded-xl border border-[#E8DEC8]">
                  <Calendar className="w-4 h-4 text-[#B45309] shrink-0" />
                  <div>
                    <span className="block text-[10px] text-[#8C6D62]">Tanggal Produksi</span>
                    <span className="font-semibold">{formatDateTimeIndo(allocatedBatch.productionDate)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-white/70 p-2.5 rounded-xl border border-[#E8DEC8]">
                  <Clock className="w-4 h-4 text-[#B45309] shrink-0" />
                  <div>
                    <span className="block text-[10px] text-[#8C6D62]">Tanggal Kedaluwarsa</span>
                    <span className="font-semibold">{formatDateTimeIndo(allocatedBatch.expiryDate)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-rose-600">
                Saat ini belum ada batch aktif yang layak jual untuk produk ini.
              </p>
            )}

            <p className="text-[11px] text-[#8C6D62] italic pt-1">
              *Pesanan Anda akan dialokasikan secara otomatis menggunakan sistem FEFO (First Expired, First Out) dari batch terdekat yang masih dalam kondisi kesegaran prima.
            </p>
          </div>

          {/* Ingredients & Allergens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#9A6237] block">
                Komposisi & Bahan
              </span>
              <p className="text-xs text-[#5C453C] leading-relaxed">
                {product.ingredients || 'Tepung terigu, ragi, air, garam, mentega.'}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#B91C1C] flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                Informasi Alergen
              </span>
              <p className="text-xs text-[#5C453C] leading-relaxed">
                {product.allergens || 'Tidak ada informasi alergen khusus.'}
              </p>
            </div>
          </div>

          {/* Storage instructions */}
          {product.storageInstructions && (
            <div className="p-3 rounded-xl bg-[#F0EBE1] border border-[#E0D5C3] flex items-start gap-2 text-xs text-[#5C453C]">
              <Info className="w-4 h-4 text-[#8D5B36] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-[#3A241D]">Petunjuk Penyimpanan:</span>
                <span>{product.storageInstructions}</span>
              </div>
            </div>
          )}

          {/* Action Footer: Quantity and Add to Cart */}
          <div className="pt-4 border-t border-[#E8DEC8] flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Quantity Stepper */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-[#5C453C]">Jumlah:</span>
              <div className="flex items-center border border-[#DFCBB5] rounded-xl bg-[#FAF6F0] p-1">
                <button
                  onClick={handleDecrement}
                  disabled={qty <= 1 || isOutOfStock}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5C453C] hover:bg-white disabled:opacity-40 transition-colors cursor-pointer"
                  aria-label="Kurangi Jumlah"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center font-bold text-sm text-[#3A241D] font-mono-nums">
                  {qty}
                </span>
                <button
                  onClick={handleIncrement}
                  disabled={qty >= totalStock || isOutOfStock}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5C453C] hover:bg-white disabled:opacity-40 transition-colors cursor-pointer"
                  aria-label="Tambah Jumlah"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Total calculation & Add Button */}
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="text-right hidden sm:block">
                <span className="text-[11px] text-[#8C6D62] block">Subtotal</span>
                <span className="font-bold text-lg text-[#3A241D] font-mono-nums">
                  {formatRupiah(unitPrice * qty)}
                </span>
              </div>

              <button
                onClick={handleAdd}
                disabled={isOutOfStock}
                className={`flex-1 sm:flex-initial px-6 py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer min-h-[48px] active:scale-98 ${
                  isOutOfStock
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-[#8D5B36] hover:bg-[#724524] text-white shadow-[#8D5B36]/20'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="sm:inline hidden">{isOutOfStock ? 'Stok Habis' : 'Tambah ke Keranjang'}</span>
                <span className="sm:hidden inline">
                  {isOutOfStock ? 'Stok Habis' : `+ Keranjang (${formatRupiah(unitPrice * qty)})`}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
