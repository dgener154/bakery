import React from 'react';
import { Store, Phone, MessageCircle, MapPin, Clock, ShieldCheck } from 'lucide-react';
import { StoreSettings } from '../../types/bakery';

interface FooterProps {
  settings: StoreSettings;
  onOpenOrderTracker: () => void;
  onToggleAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onOpenOrderTracker, onToggleAdmin }) => {
  const cleanPhone = settings.whatsapp.replace(/\D/g, '');
  const waUrl = `https://wa.me/${cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone}?text=${encodeURIComponent('Halo ' + settings.storeName + ', saya ingin bertanya mengenai pesanan roti.')}`;

  return (
    <footer className="bg-[#2D1B14] text-[#E7D6CB] border-t border-[#462D23]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Col 1: Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#5C3317] flex items-center justify-center text-white">
                <Store className="w-5 h-5 text-[#FFE2B8]" />
              </div>
              <span className="font-serif-bakery text-xl font-bold tracking-tight text-white">
                {settings.storeName}
              </span>
            </div>
            <p className="text-xs text-[#C6B0A2] leading-relaxed">
              {settings.slogan}. Kami memproduksi roti artisan segar setiap hari menggunakan mentega murni dan bahan alami tanpa pengawet.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-[#EAB308]">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Sistem Kontrol Kualitas FEFO Terjamin</span>
            </div>
          </div>

          {/* Col 2: Jam Operasional & Layanan */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Jam Operasional & Toko
            </h3>
            <div className="space-y-2 text-xs text-[#C6B0A2]">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                <div>
                  <span className="block font-semibold text-white">{settings.openTime} – {settings.closeTime} WIB</span>
                  <span>{settings.operatingDays || 'Setiap Hari'} · Pesanan online dilayani sesuai urutan & jam order (FIFO) di jam buka toko.</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                <span>{settings.address}, {settings.city}</span>
              </div>
            </div>
          </div>

          {/* Col 3: Hubungi Toko & WhatsApp */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Layanan Pelanggan
            </h3>
            <div className="space-y-2.5 text-xs text-[#C6B0A2]">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#D97706] shrink-0" />
                <span>Telepon: {settings.phone}</span>
              </div>
              <div>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#25D366] text-white font-medium hover:bg-[#20ba59] transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Chat WhatsApp Toko</span>
                </a>
              </div>
            </div>
          </div>

          {/* Col 4: Navigasi Cepat */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Bantuan & Navigasi
            </h3>
            <ul className="space-y-2 text-xs text-[#C6B0A2]">
              <li>
                <button
                  onClick={onOpenOrderTracker}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Cek Status & Lacak Pesanan
                </button>
              </li>
              <li>
                <button
                  onClick={onToggleAdmin}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Login Admin & Kasir (PIN)
                </button>
              </li>
              <li className="text-[11px] text-[#A68F81] pt-1">
                {settings.complaintPolicy}
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-[#462D23] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#A68F81]">
          <p>© {new Date().getFullYear()} {settings.storeName}. Hak Cipta Dilindungi Undang-Undang.</p>
          <div className="flex items-center gap-4">
            <span>Sistem Kasir & FEFO Batch Toko Terpadu</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
