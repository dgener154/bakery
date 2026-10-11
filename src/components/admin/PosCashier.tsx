import React, { useState, useMemo } from 'react';
import { Search, Plus, Minus, Trash2, Printer, Calculator, Banknote, QrCode, CreditCard, CheckCircle2, AlertCircle, ShoppingBag, User } from 'lucide-react';
import { Category, Customer, DigitalReceipt, Order, Product, ProductionBatch, StoreSettings, UserAccount } from '../../types/bakery';
import { formatRupiah } from '../../utils/formatters';
import { BakeryStorageService } from '../../services/storage';
import { BakeryVisual } from '../common/BakeryVisual';

interface PosCashierProps {
  products: Product[];
  categories: Category[];
  batches: ProductionBatch[];
  customers: Customer[];
  currentUser: UserAccount;
  settings: StoreSettings;
  onOpenReceipt: (receipt: DigitalReceipt) => void;
  onRefreshData: () => void;
}

interface PosCartItem {
  product: Product;
  qty: number;
}

export const PosCashier: React.FC<PosCashierProps> = ({
  products,
  categories,
  batches,
  customers,
  currentUser,
  settings,
  onOpenReceipt,
  onRefreshData,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [posCart, setPosCart] = useState<PosCartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('walk_in');
  const [customCustomerName, setCustomCustomerName] = useState('Pelanggan Umum');
  const [paymentMethod, setPaymentMethod] = useState<'tunai' | 'qris' | 'transfer_bank'>('tunai');
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [posError, setPosError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const now = new Date().getTime();

  // Stock per product map
  const stockMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const prod of products) {
      const valid = batches
        .filter(b => b.productId === prod.id && b.remainingQty > 0 && b.status !== 'kedaluwarsa' && b.status !== 'ditarik' && new Date(b.expiryDate).getTime() > now)
        .reduce((sum, b) => sum + b.remainingQty, 0);
      map.set(prod.id, valid);
    }
    return map;
  }, [products, batches, now]);

  // Filter products
  const displayProducts = useMemo(() => {
    return products.filter(p => {
      if (p.isArchived) return false;
      if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(q);
      }
      return true;
    });
  }, [products, selectedCategory, searchQuery]);

  // Cart Subtotal
  const subtotal = useMemo(() => {
    return posCart.reduce((sum, item) => {
      const price = item.product.promoPrice && item.product.promoPrice > 0 ? item.product.promoPrice : item.product.normalPrice;
      return sum + price * item.qty;
    }, 0);
  }, [posCart]);

  const changeAmount = Math.max(0, cashTendered - subtotal);

  // Cart operations
  const addToCart = (product: Product) => {
    setPosError(null);
    const avail = stockMap.get(product.id) || 0;
    const existing = posCart.find(i => i.product.id === product.id);

    if (existing) {
      if (existing.qty + 1 > avail) {
        setPosError(`Stok produk "${product.name}" hanya tersisa ${avail} pcs.`);
        return;
      }
      setPosCart(posCart.map(i => (i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i)));
    } else {
      if (avail < 1) {
        setPosError(`Stok produk "${product.name}" habis atau batch sudah kedaluwarsa.`);
        return;
      }
      setPosCart([...posCart, { product, qty: 1 }]);
    }
  };

  const updateCartQty = (productId: string, newQty: number) => {
    setPosError(null);
    if (newQty <= 0) {
      setPosCart(posCart.filter(i => i.product.id !== productId));
      return;
    }
    const avail = stockMap.get(productId) || 0;
    if (newQty > avail) {
      setPosError(`Stok hanya tersisa ${avail} pcs.`);
      return;
    }
    setPosCart(posCart.map(i => (i.product.id === productId ? { ...i, qty: newQty } : i)));
  };

  const removeCartItem = (productId: string) => {
    setPosCart(posCart.filter(i => i.product.id !== productId));
  };

  const clearCart = () => {
    setPosCart([]);
    setCashTendered(0);
    setPosError(null);
  };

  // Quick cash buttons
  const setCashQuick = (amt: number) => {
    setCashTendered(amt);
  };

  // Finalize transaction
  const handleCheckout = () => {
    setPosError(null);
    if (posCart.length === 0) {
      setPosError('Keranjang kasir masih kosong.');
      return;
    }

    if (paymentMethod === 'tunai' && cashTendered < subtotal) {
      setPosError(`Uang tunai yang diterima kurang (${formatRupiah(subtotal - cashTendered)}).`);
      return;
    }

    setIsProcessing(true);

    try {
      let custName = customCustomerName.trim() || 'Pelanggan Umum';
      let custPhone = '080000000000';

      if (selectedCustomerId !== 'walk_in') {
        const c = customers.find(cust => cust.id === selectedCustomerId);
        if (c) {
          custName = c.name;
          custPhone = c.phone;
        }
      }

      const itemsToBuy = posCart.map(i => ({
        productId: i.product.id,
        qty: i.qty,
      }));

      const { order, receipt } = BakeryStorageService.createOrder({
        customerName: custName,
        customerPhone: custPhone,
        deliveryType: 'pickup',
        deliveryFee: 0,
        items: itemsToBuy,
        paymentMethod,
        channel: 'kasir_pos',
        cashierName: currentUser.name,
        paidAmount: paymentMethod === 'tunai' ? cashTendered : subtotal,
        changeAmount: paymentMethod === 'tunai' ? changeAmount : 0,
        orderStatus: 'selesai',
        paymentStatus: 'terverifikasi',
      });

      // Reset POS cart
      clearCart();
      onRefreshData();
      setIsProcessing(false);

      // Open print receipt modal
      onOpenReceipt(receipt);
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Gagal menyelesaikan transaksi kasir.';
      setPosError(msg);
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-8.5rem)]">
      {/* Left Column: Product Selection Grid (7 cols) */}
      <div className="lg:col-span-7 flex flex-col bg-white rounded-2xl border border-[#E8DEC8] shadow-2xs overflow-hidden">
        {/* Search & Filter Header */}
        <div className="p-4 border-b border-[#F0EBE1] space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="font-serif-bakery font-bold text-lg text-[#3A241D] flex items-center gap-2">
              <Calculator className="w-5 h-5 text-[#8D5B36]" />
              <span>Kasir Penjualan Toko (POS)</span>
            </h2>
            <span className="text-xs text-[#8C6D62]">
              Kasir: <strong className="text-[#3A241D]">{currentUser.name}</strong>
            </span>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C6D62]" />
              <input
                type="text"
                placeholder="Ketik nama roti atau scan barcode..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#DFCBB5] text-xs text-[#3A241D] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8D5B36]"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-[#8D5B36] text-white shadow-2xs'
                  : 'bg-[#FAF6F0] text-[#6B4F43] hover:bg-[#F3E3D1]'
              }`}
            >
              Semua ({products.filter(p => !p.isArchived).length})
            </button>
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                  selectedCategory === c.id
                    ? 'bg-[#8D5B36] text-white shadow-2xs'
                    : 'bg-[#FAF6F0] text-[#6B4F43] hover:bg-[#F3E3D1]'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          {displayProducts.map(p => {
            const stock = stockMap.get(p.id) || 0;
            const price = p.promoPrice && p.promoPrice > 0 ? p.promoPrice : p.normalPrice;
            const isOutOfStock = stock <= 0;

            return (
              <button
                key={p.id}
                onClick={() => !isOutOfStock && addToCart(p)}
                disabled={isOutOfStock}
                className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  isOutOfStock
                    ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                    : 'bg-white border-[#E8DEC8] hover:border-[#8D5B36] hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="w-full h-24 rounded-lg overflow-hidden mb-2 border border-[#E8DEC8]">
                    <BakeryVisual
                      type={p.visualType}
                      imageUrl={p.imageUrl}
                      alt={p.name}
                      size="sm"
                      className="w-full h-full"
                    />
                  </div>
                  <h4 className="font-bold text-xs text-[#3A241D] line-clamp-1">{p.name}</h4>
                  <div className="flex items-center justify-between text-[11px] text-[#8C6D62] mt-0.5">
                    <span>{p.unit}</span>
                    <span className="font-mono-nums font-semibold text-[#8D5B36]">
                      Sisa: {stock}
                    </span>
                  </div>
                </div>

                <div className="mt-2 pt-1 border-t border-[#F2ECE1] flex items-center justify-between">
                  <span className="font-bold text-xs text-[#B45309] font-mono-nums">
                    {formatRupiah(price)}
                  </span>
                  <div className="w-6 h-6 rounded-md bg-[#FAF0E4] text-[#8D5B36] flex items-center justify-center text-xs font-bold">
                    +
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Column: POS Cart & Payment Panel (5 cols) */}
      <div className="lg:col-span-5 flex flex-col bg-white rounded-2xl border border-[#E8DEC8] shadow-2xs overflow-hidden">
        {/* Customer Select */}
        <div className="p-3.5 border-b border-[#F0EBE1] bg-[#FAF7F2] space-y-2 shrink-0">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#3A241D] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#8D5B36]" />
              Data Pembeli
            </span>
            {posCart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[11px] text-rose-600 hover:underline cursor-pointer"
              >
                Kosongkan Keranjang
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <select
              value={selectedCustomerId}
              onChange={e => setSelectedCustomerId(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-[#DFCBB5] bg-white text-xs text-[#3A241D] focus:outline-none"
            >
              <option value="walk_in">Pelanggan Umum (Walk-in)</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone.slice(-4)})
                </option>
              ))}
            </select>

            {selectedCustomerId === 'walk_in' ? (
              <input
                type="text"
                placeholder="Nama Pembeli (Opsional)"
                value={customCustomerName}
                onChange={e => setCustomCustomerName(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-[#DFCBB5] bg-white text-xs text-[#3A241D]"
              />
            ) : (
              <div className="px-2.5 py-1.5 rounded-lg bg-[#EFE5D7] text-xs text-[#5C453C] font-semibold truncate flex items-center">
                {customers.find(c => c.id === selectedCustomerId)?.phone}
              </div>
            )}
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-2">
          {posError && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{posError}</span>
            </div>
          )}

          {posCart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#8C6D62]">
              <ShoppingBag className="w-8 h-8 opacity-40 mb-2" />
              <span className="font-semibold text-xs">Belum ada item ditambahkan</span>
              <p className="text-[11px] mt-1">Pilih roti pada katalog sebelah kiri untuk memulai.</p>
            </div>
          ) : (
            posCart.map(item => {
              const price = item.product.promoPrice && item.product.promoPrice > 0 ? item.product.promoPrice : item.product.normalPrice;
              return (
                <div
                  key={item.product.id}
                  className="p-2.5 rounded-xl border border-[#E8DEC8] bg-[#FAF7F2] flex items-center justify-between gap-2 text-xs"
                >
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-[#3A241D] block truncate">{item.product.name}</span>
                    <span className="text-[11px] text-[#8C6D62] font-mono-nums">
                      {formatRupiah(price)} × {item.qty}
                    </span>
                  </div>

                  {/* Stepper */}
                  <div className="flex items-center gap-1 bg-white border border-[#DFCBB5] rounded-lg p-0.5">
                    <button
                      onClick={() => updateCartQty(item.product.id, item.qty - 1)}
                      className="w-5 h-5 flex items-center justify-center text-[#5C453C] hover:bg-slate-100 rounded cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-bold font-mono-nums">{item.qty}</span>
                    <button
                      onClick={() => updateCartQty(item.product.id, item.qty + 1)}
                      className="w-5 h-5 flex items-center justify-center text-[#5C453C] hover:bg-slate-100 rounded cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <span className="font-bold font-mono-nums text-[#3A241D] w-18 text-right">
                    {formatRupiah(price * item.qty)}
                  </span>

                  <button
                    onClick={() => removeCartItem(item.product.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Payment & Total Panel */}
        <div className="p-4 bg-white border-t border-[#E8DEC8] space-y-3 shrink-0">
          {/* Subtotal */}
          <div className="flex justify-between items-baseline">
            <span className="text-xs font-semibold text-[#6B4F43]">Total Transaksi</span>
            <span className="text-xl font-bold font-mono-nums text-[#B45309]">
              {formatRupiah(subtotal)}
            </span>
          </div>

          {/* Payment Method Selector */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setPaymentMethod('tunai')}
              className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border ${
                paymentMethod === 'tunai'
                  ? 'bg-[#8D5B36] text-white border-[#8D5B36]'
                  : 'bg-[#FAF6F0] text-[#5C453C] border-[#E8DEC8]'
              }`}
            >
              <Banknote className="w-3.5 h-3.5" />
              <span>Tunai</span>
            </button>
            <button
              onClick={() => {
                setPaymentMethod('qris');
                setCashTendered(subtotal);
              }}
              className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border ${
                paymentMethod === 'qris'
                  ? 'bg-[#8D5B36] text-white border-[#8D5B36]'
                  : 'bg-[#FAF6F0] text-[#5C453C] border-[#E8DEC8]'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>QRIS</span>
            </button>
            <button
              onClick={() => {
                setPaymentMethod('transfer_bank');
                setCashTendered(subtotal);
              }}
              className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border ${
                paymentMethod === 'transfer_bank'
                  ? 'bg-[#8D5B36] text-white border-[#8D5B36]'
                  : 'bg-[#FAF6F0] text-[#5C453C] border-[#E8DEC8]'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Debit/TF</span>
            </button>
          </div>

          {/* Cash Denominations and Change calculation if cash */}
          {paymentMethod === 'tunai' && (
            <div className="space-y-2 pt-1 border-t border-[#F2ECE1]">
              <div className="flex gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setCashQuick(subtotal)}
                  className="px-2 py-1 rounded bg-[#FAF0E4] hover:bg-[#F3E3D1] text-[11px] font-semibold text-[#8C4F1A] border border-[#DFCBB5] cursor-pointer"
                >
                  Uang Pas
                </button>
                <button
                  type="button"
                  onClick={() => setCashQuick(50000)}
                  className="px-2 py-1 rounded bg-[#FAF0E4] hover:bg-[#F3E3D1] text-[11px] font-semibold text-[#8C4F1A] border border-[#DFCBB5] cursor-pointer"
                >
                  50.000
                </button>
                <button
                  type="button"
                  onClick={() => setCashQuick(100000)}
                  className="px-2 py-1 rounded bg-[#FAF0E4] hover:bg-[#F3E3D1] text-[11px] font-semibold text-[#8C4F1A] border border-[#DFCBB5] cursor-pointer"
                >
                  100.000
                </button>
                <button
                  type="button"
                  onClick={() => setCashQuick(200000)}
                  className="px-2 py-1 rounded bg-[#FAF0E4] hover:bg-[#F3E3D1] text-[11px] font-semibold text-[#8C4F1A] border border-[#DFCBB5] cursor-pointer"
                >
                  200.000
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-[#8C6D62] font-semibold block mb-0.5">Uang Diterima</label>
                  <input
                    type="number"
                    value={cashTendered || ''}
                    onChange={e => setCashTendered(Number(e.target.value))}
                    placeholder="0"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#DFCBB5] font-mono-nums font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#8C6D62] font-semibold block mb-0.5">Kembalian</label>
                  <div className="px-2.5 py-1.5 rounded-lg bg-[#FAF0E4] border border-[#DFCBB5] font-mono-nums font-bold text-emerald-700 text-xs truncate">
                    {formatRupiah(changeAmount)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Checkout Button */}
          <button
            onClick={handleCheckout}
            disabled={posCart.length === 0 || isProcessing}
            className="w-full py-3.5 rounded-xl bg-[#8D5B36] hover:bg-[#724524] disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md shadow-[#8D5B36]/20"
          >
            <Printer className="w-4 h-4" />
            <span>Selesaikan & Cetak Struk (F4)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
