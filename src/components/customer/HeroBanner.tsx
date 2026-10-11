import React from 'react';
import { ArrowRight, Sparkles, CheckCircle2, ShoppingBag, Clock } from 'lucide-react';
import { StoreSettings } from '../../types/bakery';
import { BakeryVisual } from '../common/BakeryVisual';
import { BakeryStorageService } from '../../services/storage';

interface HeroBannerProps {
  settings: StoreSettings;
  onExploreCatalog: () => void;
  onExploreFreshToday: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  settings,
  onExploreCatalog,
  onExploreFreshToday,
}) => {
  const storeStatus = BakeryStorageService.getStoreOperatingStatus();

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#F6EDE2] to-[#FAF7F2] border-b border-[#E8DEC8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-5">
            {/* Tagline kicker & Operational status badge */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFE3D3] border border-[#DFCBB5] text-xs font-semibold text-[#8C4F1A]">
                <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
                <span>Dipanggang Segar Setiap Pagi · Batch Hari Ini Tersedia</span>
              </div>

              {/* Live Store Hours Badge */}
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                storeStatus.isOpen
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-rose-50 text-rose-800 border-rose-300'
              }`}>
                <span className={`w-2 h-2 rounded-full ${storeStatus.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                <span>{storeStatus.isOpen ? `Toko Buka (${settings.openTime} - ${settings.closeTime} WIB)` : `Toko Tutup (Buka ${settings.openTime} WIB)`}</span>
              </div>
            </div>

            <h1 className="font-serif-bakery text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#3A241D] leading-[1.15] text-balance">
              Kehangatan Roti Artisan & Pastry Segar Langsung ke Meja Anda.
            </h1>

            <p className="text-base sm:text-lg text-[#6B4F43] max-w-2xl leading-relaxed">
              Nikmati kelezatan roti sourdough fermentasi alami, butter croissant berlapis renyah, donat brioche lembut, dan cake istimewa yang dibuat dengan cinta setiap hari.
            </p>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <button
                onClick={onExploreCatalog}
                className="px-6 py-3.5 rounded-xl bg-[#8D5B36] hover:bg-[#724524] text-white font-semibold text-sm transition-all shadow-md shadow-[#8D5B36]/25 flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <ShoppingBag className="w-4 h-4 text-[#FFE2B8]" />
                <span>Pesan Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onExploreFreshToday}
                className="px-5 py-3.5 rounded-xl bg-white hover:bg-[#F9F4EC] text-[#3A241D] border border-[#DFCBB5] font-semibold text-sm transition-colors flex items-center gap-2 cursor-pointer shadow-xs whitespace-nowrap"
              >
                <span>Lihat Batch Fresh Today</span>
              </button>
            </div>

            {/* Trust bullet points */}
            <div className="pt-4 border-t border-[#E8DEC8]/80 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-[#6B4F43]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                <span>100% Mentega Murni</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                <span>Bebas Bahan Pengawet</span>
              </div>
              <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                <Clock className="w-4 h-4 text-[#D97706] shrink-0" />
                <span>Pelacakan FEFO Akurat</span>
              </div>
            </div>
          </div>

          {/* Right Visual Showcase with Real Bread Photography */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl p-4 bg-white/80 border border-[#DFCBB5] shadow-xl shadow-[#8D5B36]/10 backdrop-blur-xs">
              <div className="rounded-2xl overflow-hidden shadow-inner">
                <BakeryVisual
                  type="sourdough"
                  imageUrl="https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=800&q=80"
                  alt="Artisan Country Sourdough Bakery House"
                  size="lg"
                  className="rounded-2xl"
                />
              </div>
              
              {/* Highlight Card Floating */}
              <div className="mt-4 p-4 rounded-xl bg-[#FAF6F0] border border-[#E8DEC8] flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#9A6237] block">
                    Unggulan Hari Ini
                  </span>
                  <span className="font-serif-bakery font-bold text-base text-[#3A241D]">
                    Artisan Country Sourdough
                  </span>
                  <span className="text-xs text-[#7A584A] block">
                    Fermentasi Alami 36 Jam · Batch Baru Hari Ini
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 line-through block font-mono-nums">Rp 48.000</span>
                  <span className="font-bold text-base text-[#B45309] font-mono-nums">Rp 42.000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
