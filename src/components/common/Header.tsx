import React from 'react';
import { ShoppingBag, Store, User, Search, Clock, CheckCircle2, AlertCircle, Lock } from 'lucide-react';
import { StoreSettings, UserAccount } from '../../types/bakery';
import { BakeryStorageService } from '../../services/storage';

interface HeaderProps {
  settings: StoreSettings;
  cartCount: number;
  onOpenCart: () => void;
  onOpenOrderTracker: () => void;
  onToggleAdmin: () => void;
  isAdminMode: boolean;
  currentUser: UserAccount;
  onScrollToCatalog: () => void;
  onScrollToFreshToday: () => void;
  onScrollToAbout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  cartCount,
  onOpenCart,
  onOpenOrderTracker,
  onToggleAdmin,
  isAdminMode,
  currentUser,
  onScrollToCatalog,
  onScrollToFreshToday,
  onScrollToAbout,
}) => {
  const storeStatus = BakeryStorageService.getStoreOperatingStatus();

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8DEC8] transition-all">
      {/* Top Slim Schedule & Store Hours Bar */}
      {!isAdminMode && (
        <div className={`py-1.5 px-3 sm:px-4 text-[11px] font-medium border-b transition-colors overflow-hidden ${
          storeStatus.isOpen
            ? 'bg-[#3A241D] text-[#F5EBE1] border-[#4E3329]'
            : 'bg-[#991B1B] text-white border-[#7F1D1D]'
        }`}>
          {/* Mobile Running Text (Teks Berjalan di HP / Android < md) */}
          <div className="md:hidden relative w-full overflow-hidden whitespace-nowrap">
            <div className="animate-marquee-infinite flex items-center gap-6 text-[11px] font-medium">
              <span className="inline-flex items-center gap-2 shrink-0">
                <Clock className="w-3.5 h-3.5 text-[#EAB308]" />
                <span>
                  <strong>Jam Operasional:</strong> {settings.openTime} – {settings.closeTime} WIB ({settings.operatingDays || 'Setiap Hari'})
                </span>
                <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full text-[10px] ${
                  storeStatus.isOpen ? 'bg-emerald-500/30 text-emerald-300' : 'bg-white text-rose-800'
                }`}>
                  {storeStatus.isOpen ? '● TOKO BUKA' : '✕ TOKO TUTUP'}
                </span>
                <span className="opacity-75">· {storeStatus.isOpen ? '⚡ Pesanan diproses FIFO sesuai jam order masuk' : `⚠️ Hanya melayani pesanan saat jam buka (${settings.openTime} – ${settings.closeTime} WIB)`}</span>
              </span>
              <span aria-hidden="true" className="opacity-40">✦</span>
              {/* Duplicate element for seamless infinite running loop */}
              <span className="inline-flex items-center gap-2 shrink-0">
                <Clock className="w-3.5 h-3.5 text-[#EAB308]" />
                <span>
                  <strong>Jam Operasional:</strong> {settings.openTime} – {settings.closeTime} WIB ({settings.operatingDays || 'Setiap Hari'})
                </span>
                <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full text-[10px] ${
                  storeStatus.isOpen ? 'bg-emerald-500/30 text-emerald-300' : 'bg-white text-rose-800'
                }`}>
                  {storeStatus.isOpen ? '● TOKO BUKA' : '✕ TOKO TUTUP'}
                </span>
                <span className="opacity-75">· {storeStatus.isOpen ? '⚡ Pesanan diproses FIFO sesuai jam order masuk' : `⚠️ Hanya melayani pesanan saat jam buka (${settings.openTime} – ${settings.closeTime} WIB)`}</span>
              </span>
              <span aria-hidden="true" className="opacity-40">✦</span>
            </div>
          </div>

          {/* Desktop/Tablet Static Clean Bar (>= md) */}
          <div className="hidden md:flex max-w-7xl mx-auto w-full items-center justify-between gap-4">
            <div className="flex items-center gap-2 whitespace-nowrap shrink-0">
              <Clock className="w-3.5 h-3.5 text-[#EAB308]" />
              <span>
                <strong>Jam Operasional:</strong> {settings.openTime} – {settings.closeTime} WIB ({settings.operatingDays || 'Setiap Hari'})
              </span>
              <span aria-hidden="true" className="opacity-40">|</span>
              <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full text-[10px] ${
                storeStatus.isOpen ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white text-rose-800'
              }`}>
                {storeStatus.isOpen ? '● TOKO BUKA' : '✕ TOKO TUTUP'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[10px] opacity-90 whitespace-nowrap">
              <span>
                {storeStatus.isOpen
                  ? '⚡ Pesanan online dilayani sesuai urutan & jam order (FIFO) · Order hanya di jam buka toko'
                  : `⚠️ Pembelian online hanya dilayani saat jam buka toko (${settings.openTime} – ${settings.closeTime} WIB)`}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Top Bar strictly following 3-zone contract */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-2 sm:gap-4 lg:gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button 
            onClick={() => {
              if (isAdminMode) onToggleAdmin();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 sm:gap-2.5 text-left group cursor-pointer min-w-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#8D5B36] to-[#5C3317] flex items-center justify-center text-white shadow-sm shadow-[#8D5B36]/20 shrink-0">
              <Store className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFE2B8]" />
            </div>
            <div className="min-w-0">
              <span className="font-serif-bakery text-base sm:text-xl lg:text-2xl font-bold tracking-tight text-[#3A241D] group-hover:text-[#B45309] transition-colors whitespace-nowrap shrink-0 block leading-tight truncate">
                {settings.storeName}
              </span>
              <span className="text-[10px] sm:text-[11px] text-[#8C6D62] hidden sm:block font-medium tracking-wide">
                ARTISAN BAKERY & CAKE
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (single-line, concise) */}
        {!isAdminMode ? (
          <nav className="hidden md:flex items-center gap-5 lg:gap-7 text-sm font-medium text-[#5C453C]">
            <button
              onClick={onScrollToCatalog}
              className="hover:text-[#B45309] transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[44px] flex items-center"
            >
              Katalog Produk
            </button>
            <button
              onClick={onScrollToFreshToday}
              className="hover:text-[#B45309] transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 min-h-[44px]"
            >
              Fresh Today
              <span className="w-2 h-2 rounded-full bg-[#D97706]" />
            </button>
            <button
              onClick={onScrollToAbout}
              className="hover:text-[#B45309] transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[44px] flex items-center"
            >
              Tentang Toko
            </button>
            <button
              onClick={onOpenOrderTracker}
              className="hover:text-[#B45309] transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 min-h-[44px]"
            >
              <Search className="w-3.5 h-3.5" />
              Lacak Pesanan
            </button>
          </nav>
        ) : (
          <div className="hidden md:flex items-center gap-2 text-xs text-[#7A584A] bg-[#F1E8DC] px-3 py-1.5 rounded-lg border border-[#E3D4C1]">
            <span className="font-semibold text-[#3A241D]">Sistem Manajemen Operasional</span>
            <span aria-hidden="true">·</span>
            <span>Mode Admin & Kasir POS Aktif</span>
          </div>
        )}

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {!isAdminMode ? (
            <>
              {/* Lacak pesanan button on mobile */}
              <button
                onClick={onOpenOrderTracker}
                className="md:hidden p-2 text-[#5C453C] hover:bg-[#EFE5D7] rounded-xl transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95"
                title="Lacak Pesanan"
                aria-label="Lacak Pesanan"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Cart Button */}
              <button
                onClick={onOpenCart}
                className="relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2 rounded-xl bg-[#FAF0E4] hover:bg-[#F3E3D1] border border-[#DFCBB5] text-[#3A241D] text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-xs min-h-[44px] active:scale-95"
                aria-label="Buka Keranjang Belanja"
              >
                <ShoppingBag className="w-4 h-4 text-[#B45309]" />
                <span className="hidden sm:inline">Keranjang</span>
                {cartCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[11px] font-bold bg-[#D97706] text-white">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Login Admin dengan PIN */}
              <button
                onClick={onToggleAdmin}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs font-semibold rounded-xl bg-[#3A241D] text-white hover:bg-[#53352B] transition-colors cursor-pointer shadow-xs whitespace-nowrap min-h-[44px] active:scale-95"
                title="Login Petugas & Admin dengan PIN (PIN Awal: 123456)"
              >
                <Lock className="w-3.5 h-3.5 text-[#EAB308]" />
                <span className="hidden xs:inline">Login Admin</span>
                <span className="xs:hidden">Admin</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-[#3A241D]">{currentUser.name}</span>
                <span className="text-[10px] text-[#7A584A]">{currentUser.roleLabel}</span>
              </div>
              <button
                onClick={onToggleAdmin}
                className="px-3 py-2 text-xs font-semibold rounded-xl bg-[#FAF0E4] hover:bg-[#F3E3D1] text-[#3A241D] border border-[#DFCBB5] transition-colors cursor-pointer whitespace-nowrap min-h-[44px] active:scale-95"
              >
                Ke Toko
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
