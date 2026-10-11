import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { HeroBanner } from './components/customer/HeroBanner';
import { CatalogView } from './components/customer/CatalogView';
import { ProductDetailModal } from './components/customer/ProductDetailModal';
import { CartDrawer } from './components/customer/CartDrawer';
import { CheckoutModal } from './components/customer/CheckoutModal';
import { ReceiptModal } from './components/customer/ReceiptModal';
import { OrderTrackerModal } from './components/customer/OrderTrackerModal';
import { AdminLayout, AdminTab } from './components/admin/AdminLayout';
import { DashboardView } from './components/admin/DashboardView';
import { PosCashier } from './components/admin/PosCashier';
import { BatchManagement } from './components/admin/BatchManagement';
import { StockManagement } from './components/admin/StockManagement';
import { OrderManagement } from './components/admin/OrderManagement';
import { ProductManagement } from './components/admin/ProductManagement';
import { CustomerManagement } from './components/admin/CustomerManagement';
import { VoucherManagement } from './components/admin/VoucherManagement';
import { ReportsView } from './components/admin/ReportsView';
import { StoreSettingsView } from './components/admin/StoreSettingsView';
import { LoginModal } from './components/admin/LoginModal';
import { BakeryStorageService } from './services/storage';
import {
  CartItem,
  Category,
  Customer,
  DigitalReceipt,
  Order,
  Product,
  ProductionBatch,
  StockMovement,
  StoreSettings,
  SystemNotification,
  UserAccount,
  Voucher
} from './types/bakery';
import { Clock, MapPin, Sparkles, ShieldCheck, Heart, Award, Coffee } from 'lucide-react';

export default function App() {
  // Application Data States
  const [settings, setSettings] = useState<StoreSettings>(() => BakeryStorageService.getSettings());
  const [categories, setCategories] = useState<Category[]>(() => BakeryStorageService.getCategories());
  const [products, setProducts] = useState<Product[]>(() => BakeryStorageService.getProducts());
  const [batches, setBatches] = useState<ProductionBatch[]>(() => BakeryStorageService.getBatches());
  const [movements, setMovements] = useState<StockMovement[]>(() => BakeryStorageService.getMovements());
  const [orders, setOrders] = useState<Order[]>(() => BakeryStorageService.getOrders());
  const [receipts, setReceipts] = useState<DigitalReceipt[]>(() => BakeryStorageService.getReceipts());
  const [vouchers, setVouchers] = useState<Voucher[]>(() => BakeryStorageService.getVouchers());
  const [customers, setCustomers] = useState<Customer[]>(() => BakeryStorageService.getCustomers());
  const [notifications, setNotifications] = useState<SystemNotification[]>(() => BakeryStorageService.getNotifications());
  const [currentUser, setCurrentUser] = useState<UserAccount>(() => BakeryStorageService.getCurrentUser());
  const [cart, setCart] = useState<CartItem[]>(() => BakeryStorageService.getCart());

  // UI Navigation States
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [selectedCatalogCategory, setSelectedCatalogCategory] = useState<string>('all');

  // Customer Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [appliedVoucherCode, setAppliedVoucherCode] = useState<string | undefined>(undefined);
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [activeReceipt, setActiveReceipt] = useState<DigitalReceipt | null>(null);
  const [isOrderTrackerOpen, setIsOrderTrackerOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Sync / Refresh helper
  const refreshAllData = useCallback(() => {
    setSettings(BakeryStorageService.getSettings());
    setCategories(BakeryStorageService.getCategories());
    setProducts(BakeryStorageService.getProducts());
    setBatches(BakeryStorageService.getBatches());
    setMovements(BakeryStorageService.getMovements());
    setOrders(BakeryStorageService.getOrders());
    setReceipts(BakeryStorageService.getReceipts());
    setVouchers(BakeryStorageService.getVouchers());
    setCustomers(BakeryStorageService.getCustomers());
    setNotifications(BakeryStorageService.getNotifications());
    setCurrentUser(BakeryStorageService.getCurrentUser());
    setCart(BakeryStorageService.getCart());
  }, []);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Cart operations
  const handleAddToCart = (product: Product, addQty = 1) => {
    const now = new Date().getTime();
    const validStock = batches
      .filter(b => b.productId === product.id && b.remainingQty > 0 && b.status !== 'kedaluwarsa' && b.status !== 'ditarik' && new Date(b.expiryDate).getTime() > now)
      .reduce((sum, b) => sum + b.remainingQty, 0);

    const existingIdx = cart.findIndex(c => c.productId === product.id);
    let newCart: CartItem[] = [];

    if (existingIdx >= 0) {
      const currentQty = cart[existingIdx].qty;
      const targetQty = currentQty + addQty;
      if (targetQty > validStock) {
        alert(`Maaf, stok layak jual untuk "${product.name}" hanya tersisa ${validStock} pcs.`);
        return;
      }
      newCart = cart.map((item, idx) => (idx === existingIdx ? { ...item, qty: targetQty } : item));
    } else {
      if (addQty > validStock) {
        alert(`Maaf, stok layak jual untuk "${product.name}" hanya tersisa ${validStock} pcs.`);
        return;
      }
      newCart = [...cart, { productId: product.id, product, qty: addQty }];
    }

    setCart(newCart);
    BakeryStorageService.saveCart(newCart);
    setIsCartOpen(true);
  };

  const handleUpdateCartQty = (productId: string, newQty: number) => {
    let newCart: CartItem[] = [];
    if (newQty <= 0) {
      newCart = cart.filter(c => c.productId !== productId);
    } else {
      newCart = cart.map(c => (c.productId === productId ? { ...c, qty: newQty } : c));
    }
    setCart(newCart);
    BakeryStorageService.saveCart(newCart);
  };

  const handleRemoveCartItem = (productId: string) => {
    const newCart = cart.filter(c => c.productId !== productId);
    setCart(newCart);
    BakeryStorageService.saveCart(newCart);
  };

  const handleProceedCheckout = (voucherCode?: string, discountAmount = 0) => {
    setAppliedVoucherCode(voucherCode);
    setAppliedDiscount(discountAmount);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (order: Order, receipt: DigitalReceipt) => {
    setIsCheckoutOpen(false);
    refreshAllData();
    setActiveReceipt(receipt);
  };

  const handleMarkNotifRead = (id: string) => {
    BakeryStorageService.markNotificationRead(id);
    setNotifications(BakeryStorageService.getNotifications());
  };

  const handleSwitchUser = (user: UserAccount) => {
    BakeryStorageService.setCurrentUser(user);
    setCurrentUser(user);
  };

  // Smooth scroll anchors
  const scrollToCatalog = () => {
    const el = document.getElementById('catalog-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToFreshToday = () => {
    setSelectedCatalogCategory('all');
    scrollToCatalog();
  };

  const scrollToAbout = () => {
    const el = document.getElementById('about-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const cartTotalItems = cart.reduce((sum, it) => sum + it.qty, 0);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2D2422] flex flex-col font-sans">
      {/* If Admin Mode is active, render Admin Layout & Subviews */}
      {isAdminMode ? (
        <AdminLayout
          currentTab={adminTab}
          onSelectTab={setAdminTab}
          currentUser={currentUser}
          onSwitchUser={handleSwitchUser}
          settings={settings}
          notifications={notifications}
          onMarkNotificationRead={handleMarkNotifRead}
          onExitToStore={() => setIsAdminMode(false)}
        >
          {adminTab === 'dashboard' && (
            <DashboardView
              orders={orders}
              products={products}
              batches={batches}
              onNavigateTab={setAdminTab}
            />
          )}

          {adminTab === 'pos' && (
            <PosCashier
              products={products}
              categories={categories}
              batches={batches}
              customers={customers}
              currentUser={currentUser}
              settings={settings}
              onOpenReceipt={setActiveReceipt}
              onRefreshData={refreshAllData}
            />
          )}

          {adminTab === 'batches' && (
            <BatchManagement
              batches={batches}
              products={products}
              currentUser={currentUser}
              settings={settings}
              onRefreshData={refreshAllData}
            />
          )}

          {adminTab === 'stock' && (
            <StockManagement
              products={products}
              batches={batches}
              movements={movements}
              currentUser={currentUser}
              onRefreshData={refreshAllData}
            />
          )}

          {adminTab === 'orders' && (
            <OrderManagement
              orders={orders}
              receipts={receipts}
              settings={settings}
              currentUser={currentUser}
              onOpenReceipt={setActiveReceipt}
              onRefreshData={refreshAllData}
            />
          )}

          {adminTab === 'products' && (
            <ProductManagement
              products={products}
              categories={categories}
              currentUser={currentUser}
              onRefreshData={refreshAllData}
            />
          )}

          {adminTab === 'customers' && (
            <CustomerManagement
              customers={customers}
              onRefreshData={refreshAllData}
            />
          )}

          {adminTab === 'vouchers' && (
            <VoucherManagement
              vouchers={vouchers}
              onRefreshData={refreshAllData}
            />
          )}

          {adminTab === 'reports' && (
            <ReportsView
              orders={orders}
              products={products}
              categories={categories}
              batches={batches}
              settings={settings}
            />
          )}

          {adminTab === 'settings' && (
            <StoreSettingsView
              settings={settings}
              onRefreshData={refreshAllData}
            />
          )}
        </AdminLayout>
      ) : (
        /* Customer Storefront View */
        <>
          <Header
            settings={settings}
            cartCount={cartTotalItems}
            onOpenCart={() => setIsCartOpen(true)}
            onOpenOrderTracker={() => setIsOrderTrackerOpen(true)}
            onToggleAdmin={() => setIsLoginModalOpen(true)}
            isAdminMode={false}
            currentUser={currentUser}
            onScrollToCatalog={scrollToCatalog}
            onScrollToFreshToday={scrollToFreshToday}
            onScrollToAbout={scrollToAbout}
          />

          <main className="flex-1">
            {/* Hero Section */}
            <HeroBanner
              settings={settings}
              onExploreCatalog={scrollToCatalog}
              onExploreFreshToday={scrollToFreshToday}
            />

            {/* Product Catalog Section */}
            <CatalogView
              products={products}
              categories={categories}
              batches={batches}
              settings={settings}
              selectedCategory={selectedCatalogCategory}
              onSelectCategory={setSelectedCatalogCategory}
              onSelectProduct={setSelectedProduct}
              onAddToCart={p => handleAddToCart(p, 1)}
            />

            {/* Craftsmanship & Quality Commitment Section */}
            <section id="about-section" className="bg-[#FAF0E4] border-y border-[#E8DEC8] py-14 lg:py-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-12">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#9A6237] block mb-1">
                    Filosofi Dapur Kami
                  </span>
                  <h2 className="font-serif-bakery text-2xl sm:text-4xl font-bold text-[#3A241D]">
                    Komitmen Kesegaran & Mutu Terbaik
                  </h2>
                  <p className="text-xs sm:text-sm text-[#7A584A] mt-2 leading-relaxed">
                    Kami percaya roti terbaik lahir dari kesabaran waktu fermentasi, keaslian bahan baku, dan pengawasan kualitas batch yang ketat.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                  {/* Card 1 */}
                  <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#DFCBB5] shadow-2xs space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-[#FAF0E4] text-[#8D5B36] flex items-center justify-center">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h3 className="font-serif-bakery font-bold text-lg text-[#3A241D]">
                      Dipanggang Segar Setiap Pagi
                    </h3>
                    <p className="text-xs text-[#6B4F43] leading-relaxed">
                      Dapur kami mulai bekerja sejak pukul 03:00 subuh. Setiap roti yang Anda terima berasal dari adonan segar hari ini tanpa bahan pengawet kimia.
                    </p>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#DFCBB5] shadow-2xs space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-[#FAF0E4] text-[#8D5B36] flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h3 className="font-serif-bakery font-bold text-lg text-[#3A241D]">
                      Kontrol Mutu & FEFO Transparan
                    </h3>
                    <p className="text-xs text-[#6B4F43] leading-relaxed">
                      Sistem kami melacak tanggal produksi dan kedaluwarsa setiap batch secara otomatis. Anda dapat melihat tanggal kedaluwarsa pada kartu produk dan struk resmi.
                    </p>
                  </div>

                  {/* Card 3 */}
                  <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#DFCBB5] shadow-2xs space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-[#FAF0E4] text-[#8D5B36] flex items-center justify-center">
                      <Award className="w-6 h-6" />
                    </div>
                    <h3 className="font-serif-bakery font-bold text-lg text-[#3A241D]">
                      Bahan Baku Pilihan Dunia
                    </h3>
                    <p className="text-xs text-[#6B4F43] leading-relaxed">
                      Menggunakan mentega murni Prancis (AOP), dark chocolate Belgia, tepung gandum alami, dan susu murni untuk rasa yang kaya dan aroma harum memikat.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </main>

          <Footer
            settings={settings}
            onOpenOrderTracker={() => setIsOrderTrackerOpen(true)}
            onToggleAdmin={() => setIsLoginModalOpen(true)}
          />
        </>
      )}

      {/* Customer Modals */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          categories={categories}
          batches={batches}
          onClose={() => setSelectedProduct(null)}
          onAddToCartWithQty={(prod, q) => handleAddToCart(prod, q)}
        />
      )}

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        batches={batches}
        settings={settings}
        vouchers={vouchers}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onProceedCheckout={handleProceedCheckout}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        settings={settings}
        voucherCode={appliedVoucherCode}
        discountAmount={appliedDiscount}
        onOrderSuccess={handleOrderSuccess}
      />

      <ReceiptModal
        receipt={activeReceipt}
        settings={settings}
        onClose={() => setActiveReceipt(null)}
      />

      <OrderTrackerModal
        isOpen={isOrderTrackerOpen}
        onClose={() => setIsOrderTrackerOpen(false)}
        orders={orders}
        receipts={receipts}
        settings={settings}
        onViewReceipt={rcp => {
          setIsOrderTrackerOpen(false);
          setActiveReceipt(rcp);
        }}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={user => {
          handleSwitchUser(user);
          setIsAdminMode(true);
        }}
      />
    </div>
  );
}
