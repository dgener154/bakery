import React, { useState } from 'react';
import {
  LayoutDashboard,
  Calculator,
  Layers,
  Boxes,
  ShoppingBag,
  Package,
  Users,
  Tag,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  Store,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Menu,
  X,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { StoreSettings, SystemNotification, UserAccount } from '../../types/bakery';
import { DEFAULT_USERS } from '../../services/storage';

export type AdminTab =
  | 'dashboard'
  | 'pos'
  | 'batches'
  | 'stock'
  | 'orders'
  | 'products'
  | 'customers'
  | 'vouchers'
  | 'reports'
  | 'settings';

interface AdminLayoutProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  currentUser: UserAccount;
  onSwitchUser: (user: UserAccount) => void;
  settings: StoreSettings;
  notifications: SystemNotification[];
  onMarkNotificationRead: (id: string) => void;
  onExitToStore: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onSwitchUser,
  settings,
  notifications,
  onMarkNotificationRead,
  onExitToStore,
  children,
}) => {
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const unreadNotifs = notifications.filter(n => !n.isRead);

  // Role permissions
  const hasAccess = (tab: AdminTab): boolean => {
    if (currentUser.role === 'super_admin') return true;
    if (currentUser.role === 'admin_toko') return tab !== 'settings';
    if (currentUser.role === 'kasir') return ['dashboard', 'pos', 'orders', 'customers'].includes(tab);
    if (currentUser.role === 'petugas_produksi') return ['dashboard', 'batches', 'stock', 'products'].includes(tab);
    return false;
  };

  const navItems: { id: AdminTab; label: string; icon: React.FC<{ className?: string }>; tag?: string }[] = [
    { id: 'dashboard', label: 'Dashboard Utama', icon: LayoutDashboard },
    { id: 'pos', label: 'Kasir Toko (POS)', icon: Calculator, tag: 'Kasir' },
    { id: 'batches', label: 'Batch Produksi (FEFO)', icon: Layers, tag: 'FEFO' },
    { id: 'stock', label: 'Stok & Mutasi', icon: Boxes },
    { id: 'orders', label: 'Daftar Pesanan', icon: ShoppingBag, tag: 'Online/POS' },
    { id: 'products', label: 'Master Produk', icon: Package },
    { id: 'customers', label: 'Data Pelanggan', icon: Users },
    { id: 'vouchers', label: 'Promo & Voucher', icon: Tag },
    { id: 'reports', label: 'Laporan Keuangan', icon: BarChart3, tag: 'Omzet' },
    { id: 'settings', label: 'Pengaturan Toko', icon: Settings, tag: 'PIN' },
  ];

  const handleSelectTab = (tab: AdminTab) => {
    if (hasAccess(tab)) {
      onSelectTab(tab);
      setIsMobileDrawerOpen(false);
    }
  };

  const currentTabLabel = navItems.find(i => i.id === currentTab)?.label || 'Portal Admin';

  return (
    <div className="min-h-screen bg-[#F6F2EB] flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-[#2D1B14] text-white border-b border-[#462D23] px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4 shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Mobile Hamburger Menu Toggle */}
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="lg:hidden p-2 rounded-xl text-[#C6B0A2] hover:text-white hover:bg-[#3D251C] transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-95"
            aria-label="Buka Menu Navigasi"
            title="Menu Navigasi"
          >
            <Menu className="w-5 h-5 text-[#FFE2B8]" />
          </button>

          {/* Store Logo & Title */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#5C3317] flex items-center justify-center text-white shrink-0 shadow-2xs">
              <Store className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFE2B8]" />
            </div>
            <div className="min-w-0">
              <span className="font-serif-bakery font-bold text-sm sm:text-base md:text-lg tracking-tight block leading-tight truncate">
                {settings.storeName}
              </span>
              <span className="text-[9px] sm:text-[10px] text-[#C6B0A2] tracking-wider uppercase font-semibold hidden xs:block truncate">
                Portal Manajemen Operasional
              </span>
            </div>
          </div>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="relative p-2 rounded-xl text-[#C6B0A2] hover:text-white hover:bg-[#3D251C] transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-95"
              title="Notifikasi Sistem"
              aria-label="Notifikasi Sistem"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifs.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#E11D48] text-white text-[10px] font-bold flex items-center justify-center font-mono ring-2 ring-[#2D1B14]">
                  {unreadNotifs.length}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-[#DFCBB5] py-2 z-50 text-[#3A241D] animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2 border-b border-[#E8DEC8] flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider text-[#9A6237]">
                    Pusat Notifikasi ({unreadNotifs.length} Baru)
                  </span>
                  <button
                    onClick={() => setShowNotifMenu(false)}
                    className="p-1 text-[#8C6D62] hover:text-[#3A241D] rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-[#F2ECE1]">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-[#8C6D62]">
                      Tidak ada notifikasi sistem saat ini.
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        className={`p-3 text-xs transition-colors hover:bg-[#FAF6F0] flex gap-2.5 items-start ${
                          n.isRead ? 'opacity-70' : 'bg-[#FAF0E4]'
                        }`}
                      >
                        <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <span className="font-bold block text-[#3A241D]">{n.title}</span>
                          <p className="text-[11px] text-[#6B4F43] leading-relaxed">{n.message}</p>
                          <span className="text-[10px] text-[#8C6D62] font-mono mt-1 block">
                            {new Date(n.timestamp).toLocaleTimeString('id-ID')} WIB
                          </span>
                        </div>
                        {!n.isRead && (
                          <button
                            onClick={() => onMarkNotificationRead(n.id)}
                            className="p-1.5 text-xs text-[#8D5B36] hover:text-[#5C3317] cursor-pointer"
                            title="Tandai Sudah Dibaca"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-[#3D251C] hover:bg-[#4E3025] transition-colors cursor-pointer border border-[#5C3317] min-h-[44px]"
              title="Ganti Akun & Pengaturan"
            >
              <div className={`w-7 h-7 rounded-lg ${currentUser.avatarBg} text-white flex items-center justify-center text-xs font-bold shrink-0`}>
                {currentUser.name[0]}
              </div>
              <div className="text-left hidden md:block">
                <span className="text-xs font-bold block leading-tight text-white">{currentUser.name}</span>
                <span className="text-[10px] text-[#C6B0A2]">{currentUser.roleLabel}</span>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-[#DFCBB5] py-2 z-50 text-[#3A241D] animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2 border-b border-[#E8DEC8] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A6237] block">
                      Ganti Akun Role (Testing)
                    </span>
                    <span className="text-xs text-[#7A584A]">
                      Pilih peran untuk simulasi:
                    </span>
                  </div>
                  <button
                    onClick={() => setShowUserMenu(false)}
                    className="p-1 text-[#8C6D62] hover:text-[#3A241D] rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-1 space-y-1">
                  {DEFAULT_USERS.map(u => (
                    <button
                      key={u.id}
                      onClick={() => {
                        onSwitchUser(u);
                        setShowUserMenu(false);
                      }}
                      className={`w-full p-2 rounded-xl text-left text-xs flex items-center gap-2.5 transition-colors cursor-pointer min-h-[44px] ${
                        currentUser.id === u.id ? 'bg-[#FAF0E4] font-bold text-[#8D5B36]' : 'hover:bg-[#FAF6F0]'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-md ${u.avatarBg} text-white text-[11px] font-bold flex items-center justify-center shrink-0`}>
                        {u.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="block leading-tight truncate">{u.name}</span>
                        <span className="text-[10px] text-[#8C6D62] font-normal">{u.roleLabel}</span>
                      </div>
                      {currentUser.id === u.id && <UserCheck className="w-4 h-4 text-[#8D5B36] shrink-0" />}
                    </button>
                  ))}
                </div>

                <div className="pt-2 mt-1 border-t border-[#E8DEC8] px-2 space-y-1">
                  <button
                    onClick={() => {
                      onSelectTab('settings');
                      setShowUserMenu(false);
                    }}
                    className="w-full p-2.5 rounded-xl text-left text-xs flex items-center gap-2 hover:bg-[#FAF6F0] text-[#8D5B36] font-semibold cursor-pointer min-h-[44px]"
                  >
                    <Lock className="w-4 h-4 text-[#B45309]" />
                    <span>Ubah PIN Login Admin di Pengaturan</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Exit to Storefront */}
          <button
            onClick={onExitToStore}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#FAF0E4] text-[#3A241D] text-xs font-bold hover:bg-[#F3E3D1] transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap min-h-[44px] active:scale-95"
            title="Kembali ke Tampilan Toko Online"
          >
            <LogOut className="w-3.5 h-3.5 text-[#B45309]" />
            <span className="hidden sm:inline">Ke Toko</span>
          </button>
        </div>
      </header>

      {/* Mobile Drawer (Slide-out navigation for HP & Tablet) */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileDrawerOpen(false)}
          />

          {/* Drawer Sheet */}
          <aside className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200 border-r border-[#DFCBB5]">
            {/* Drawer Header */}
            <div className="p-4 bg-[#2D1B14] text-white flex items-center justify-between border-b border-[#462D23]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#5C3317] flex items-center justify-center text-white">
                  <Store className="w-4 h-4 text-[#FFE2B8]" />
                </div>
                <div>
                  <span className="font-serif-bakery font-bold text-sm block leading-tight text-white">
                    {settings.storeName}
                  </span>
                  <span className="text-[10px] text-[#C6B0A2]">
                    Menu Operasional
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-2 rounded-xl text-[#C6B0A2] hover:text-white hover:bg-[#3D251C] transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
                aria-label="Tutup Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Active User Badge in Drawer */}
            <div className="p-3 bg-[#FAF7F2] border-b border-[#E8DEC8] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg ${currentUser.avatarBg} text-white flex items-center justify-center text-xs font-bold`}>
                  {currentUser.name[0]}
                </div>
                <div>
                  <span className="font-bold text-xs text-[#3A241D] block">{currentUser.name}</span>
                  <span className="text-[10px] text-[#8C6D62]">{currentUser.roleLabel}</span>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                Online
              </span>
            </div>

            {/* Navigation Links (ALL 10 MODULES) */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A6237] px-3 py-1.5 block">
                Seluruh Menu Sistem (10 Modul)
              </span>

              {navItems.map(item => {
                const allowed = hasAccess(item.id);
                const Icon = item.icon;
                const isActive = currentTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    disabled={!allowed}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[48px] active:scale-98 ${
                      isActive
                        ? 'bg-[#8D5B36] text-white shadow-xs'
                        : allowed
                        ? 'text-[#5C453C] hover:bg-[#FAF0E4]'
                        : 'text-slate-300 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.tag && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                          isActive ? 'bg-white/20 text-white' : 'bg-[#FAF0E4] text-[#8C4F1A]'
                        }`}>
                          {item.tag}
                        </span>
                      )}
                      <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#8C6D62]'}`} />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Drawer Footer with Quick PIN & Store Exit */}
            <div className="p-3 bg-[#FAF7F2] border-t border-[#E8DEC8] space-y-2">
              <button
                onClick={() => {
                  handleSelectTab('settings');
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-white border border-[#DFCBB5] text-xs font-semibold text-[#8D5B36] hover:bg-[#FAF0E4] flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
              >
                <Lock className="w-3.5 h-3.5 text-[#B45309]" />
                <span>Pengaturan & Ubah PIN Login</span>
              </button>

              <button
                onClick={onExitToStore}
                className="w-full py-2.5 px-3 rounded-xl bg-[#3A241D] text-white text-xs font-bold hover:bg-[#53352B] flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
              >
                <LogOut className="w-3.5 h-3.5 text-[#FFE2B8]" />
                <span>Kembali ke Halaman Toko</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Admin Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar Nav (lg and above) */}
        <aside className="w-64 bg-white border-r border-[#E8DEC8] hidden lg:flex flex-col justify-between p-4 shrink-0 overflow-y-auto">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A6237] px-3 py-2 block">
              Menu Navigasi
            </span>

            {navItems.map(item => {
              const allowed = hasAccess(item.id);
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => allowed && onSelectTab(item.id)}
                  disabled={!allowed}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[40px] ${
                    isActive
                      ? 'bg-[#8D5B36] text-white shadow-xs'
                      : allowed
                      ? 'text-[#5C453C] hover:bg-[#FAF0E4]'
                      : 'text-slate-300 cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.tag && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                      isActive ? 'bg-white/20 text-white' : 'bg-[#FAF0E4] text-[#8C4F1A]'
                    }`}>
                      {item.tag}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Role disclaimer & PIN Shortcut in desktop sidebar */}
          <div className="p-3 rounded-xl bg-[#FAF6F0] border border-[#E8DEC8] text-[11px] text-[#7A584A] space-y-2">
            <div>
              <div className="font-bold text-[#3A241D] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Hak Akses Aktif:</span>
              </div>
              <div className="font-semibold text-[#8D5B36] mt-0.5">{currentUser.roleLabel}</div>
            </div>
            <div className="text-[10px] text-[#8C6D62] pt-1 border-t border-[#E8DEC8]">
              PIN Keamanan Admin dapat diubah di menu Pengaturan Toko.
            </div>
          </div>
        </aside>

        {/* Mobile Bottom Quick Navigation Bar (for Android phones 320px-430px) */}
        <nav
          className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E8DEC8] px-1 py-1 flex items-center justify-around shadow-lg"
          aria-label="Navigasi Cepat Mobile"
        >
          {/* Shortcut 1: Dashboard */}
          <button
            onClick={() => handleSelectTab('dashboard')}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[10px] font-semibold transition-colors cursor-pointer min-w-[56px] min-h-[48px] active:scale-95 ${
              currentTab === 'dashboard' ? 'text-[#8D5B36] font-bold bg-[#FAF0E4]' : 'text-[#7A584A]'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 mb-0.5" />
            <span className="leading-tight">Dashboard</span>
          </button>

          {/* Shortcut 2: POS Kasir */}
          <button
            onClick={() => handleSelectTab('pos')}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[10px] font-semibold transition-colors cursor-pointer min-w-[56px] min-h-[48px] active:scale-95 ${
              currentTab === 'pos' ? 'text-[#8D5B36] font-bold bg-[#FAF0E4]' : 'text-[#7A584A]'
            }`}
          >
            <Calculator className="w-4 h-4 mb-0.5" />
            <span className="leading-tight">Kasir POS</span>
          </button>

          {/* Shortcut 3: Pesanan */}
          <button
            onClick={() => handleSelectTab('orders')}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[10px] font-semibold transition-colors cursor-pointer min-w-[56px] min-h-[48px] active:scale-95 ${
              currentTab === 'orders' ? 'text-[#8D5B36] font-bold bg-[#FAF0E4]' : 'text-[#7A584A]'
            }`}
          >
            <ShoppingBag className="w-4 h-4 mb-0.5" />
            <span className="leading-tight">Pesanan</span>
          </button>

          {/* Shortcut 4: Batch FEFO */}
          <button
            onClick={() => handleSelectTab('batches')}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[10px] font-semibold transition-colors cursor-pointer min-w-[56px] min-h-[48px] active:scale-95 ${
              currentTab === 'batches' ? 'text-[#8D5B36] font-bold bg-[#FAF0E4]' : 'text-[#7A584A]'
            }`}
          >
            <Layers className="w-4 h-4 mb-0.5" />
            <span className="leading-tight">FEFO</span>
          </button>

          {/* Shortcut 5: Semua Menu (Drawer Trigger) */}
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[10px] font-semibold transition-colors cursor-pointer min-w-[56px] min-h-[48px] active:scale-95 ${
              ['products', 'customers', 'vouchers', 'reports', 'settings', 'stock'].includes(currentTab)
                ? 'text-[#8D5B36] font-bold bg-[#FAF0E4]'
                : 'text-[#7A584A]'
            }`}
            title="Buka Semua Menu"
          >
            <Menu className="w-4 h-4 mb-0.5" />
            <span className="leading-tight">
              {['products', 'customers', 'vouchers', 'reports', 'settings', 'stock'].includes(currentTab)
                ? currentTabLabel.split(' ')[0]
                : 'Lainnya'}
            </span>
          </button>
        </nav>

        {/* Main Workspace content */}
        <main className="flex-1 p-3 sm:p-5 lg:p-8 overflow-y-auto pb-24 lg:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
};
