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
  Lock
} from 'lucide-react';
import { StoreSettings, SystemNotification, UserAccount, UserRole } from '../../types/bakery';
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

  const unreadNotifs = notifications.filter(n => !n.isRead);

  // Role permissions:
  // Super Admin: all
  // Admin Toko: all except store advanced settings
  // Kasir: pos, orders, customers
  // Petugas Produksi: batches, stock, products
  const hasAccess = (tab: AdminTab): boolean => {
    if (currentUser.role === 'super_admin') return true;
    if (currentUser.role === 'admin_toko') return tab !== 'settings';
    if (currentUser.role === 'kasir') return ['dashboard', 'pos', 'orders', 'customers'].includes(tab);
    if (currentUser.role === 'petugas_produksi') return ['dashboard', 'batches', 'stock', 'products'].includes(tab);
    return false;
  };

  const navItems: { id: AdminTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard Utama', icon: LayoutDashboard },
    { id: 'pos', label: 'Kasir Toko (POS)', icon: Calculator },
    { id: 'batches', label: 'Batch Produksi (FEFO)', icon: Layers },
    { id: 'stock', label: 'Stok & Mutasi', icon: Boxes },
    { id: 'orders', label: 'Daftar Pesanan', icon: ShoppingBag },
    { id: 'products', label: 'Master Produk', icon: Package },
    { id: 'customers', label: 'Data Pelanggan', icon: Users },
    { id: 'vouchers', label: 'Promo & Voucher', icon: Tag },
    { id: 'reports', label: 'Laporan Keuangan', icon: BarChart3 },
    { id: 'settings', label: 'Pengaturan Toko', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F6F2EB] flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-[#2D1B14] text-white border-b border-[#462D23] px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#5C3317] flex items-center justify-center text-white">
            <Store className="w-5 h-5 text-[#FFE2B8]" />
          </div>
          <div>
            <span className="font-serif-bakery font-bold text-lg tracking-tight block leading-tight">
              {settings.storeName}
            </span>
            <span className="text-[10px] text-[#C6B0A2] tracking-wider uppercase font-semibold">
              Portal Manajemen Operasional
            </span>
          </div>
        </div>

        {/* Right tools */}
        <div className="flex items-center gap-3">
          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="relative p-2 rounded-xl text-[#C6B0A2] hover:text-white hover:bg-[#3D251C] transition-colors cursor-pointer"
              title="Notifikasi Sistem"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifs.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#E11D48] text-white text-[10px] font-bold flex items-center justify-center font-mono">
                  {unreadNotifs.length}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-[#DFCBB5] py-2 z-50 text-[#3A241D] animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2 border-b border-[#E8DEC8] flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider text-[#9A6237]">
                    Pusat Notifikasi ({unreadNotifs.length} Baru)
                  </span>
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
                            className="p-1 text-xs text-[#8D5B36] hover:text-[#5C3317] cursor-pointer"
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
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-[#3D251C] hover:bg-[#4E3025] transition-colors cursor-pointer border border-[#5C3317]"
            >
              <div className={`w-7 h-7 rounded-lg ${currentUser.avatarBg} text-white flex items-center justify-center text-xs font-bold`}>
                {currentUser.name[0]}
              </div>
              <div className="text-left hidden sm:block">
                <span className="text-xs font-bold block leading-tight text-white">{currentUser.name}</span>
                <span className="text-[10px] text-[#C6B0A2]">{currentUser.roleLabel}</span>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#DFCBB5] py-2 z-50 text-[#3A241D] animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2 border-b border-[#E8DEC8]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A6237] block">
                    Ganti Akun Role (Testing)
                  </span>
                  <span className="text-xs text-[#7A584A]">
                    Pilih akun dengan peran yang berbeda:
                  </span>
                </div>

                <div className="p-1 space-y-1">
                  {DEFAULT_USERS.map(u => (
                    <button
                      key={u.id}
                      onClick={() => {
                        onSwitchUser(u);
                        setShowUserMenu(false);
                      }}
                      className={`w-full p-2 rounded-xl text-left text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                        currentUser.id === u.id ? 'bg-[#FAF0E4] font-bold text-[#8D5B36]' : 'hover:bg-[#FAF6F0]'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-md ${u.avatarBg} text-white text-[11px] font-bold flex items-center justify-center`}>
                        {u.name[0]}
                      </div>
                      <div className="flex-1">
                        <span className="block leading-tight">{u.name}</span>
                        <span className="text-[10px] text-[#8C6D62] font-normal">{u.roleLabel}</span>
                      </div>
                      {currentUser.id === u.id && <UserCheck className="w-4 h-4 text-[#8D5B36]" />}
                    </button>
                  ))}
                </div>

                <div className="pt-2 mt-1 border-t border-[#E8DEC8] px-1">
                  <button
                    onClick={() => {
                      onSelectTab('settings');
                      setShowUserMenu(false);
                    }}
                    className="w-full p-2 rounded-xl text-left text-xs flex items-center gap-2 hover:bg-[#FAF6F0] text-[#8D5B36] font-semibold cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5 text-[#B45309]" />
                    <span>Ubah PIN Login Admin</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Exit to storefront */}
          <button
            onClick={onExitToStore}
            className="px-3 py-1.5 rounded-xl bg-[#FAF0E4] text-[#3A241D] text-xs font-bold hover:bg-[#F3E3D1] transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            title="Kembali ke Tampilan Toko Online"
          >
            <LogOut className="w-3.5 h-3.5 text-[#B45309]" />
            <span className="hidden sm:inline">Ke Toko</span>
          </button>
        </div>
      </header>

      {/* Main Admin Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Nav for desktop */}
        <aside className="w-64 bg-white border-r border-[#E8DEC8] hidden lg:flex flex-col justify-between p-4 shrink-0 overflow-y-auto">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A6237] px-3 py-2 block">
              Menu Navigasi
            </span>

            {navItems.map(item => {
              const allowed = hasAccess(item.id);
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => allowed && onSelectTab(item.id)}
                  disabled={!allowed}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    currentTab === item.id
                      ? 'bg-[#8D5B36] text-white shadow-xs'
                      : allowed
                      ? 'text-[#5C453C] hover:bg-[#FAF0E4]'
                      : 'text-slate-300 cursor-not-allowed opacity-50'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Role disclaimer */}
          <div className="p-3 rounded-xl bg-[#FAF6F0] border border-[#E8DEC8] text-[11px] text-[#7A584A] space-y-1">
            <div className="font-bold text-[#3A241D]">Hak Akses Aktif:</div>
            <div>{currentUser.roleLabel}</div>
            <div className="text-[10px] text-[#8C6D62] pt-1">
              Setiap perubahan stok dan pesanan tercatat di audit log.
            </div>
          </div>
        </aside>

        {/* Mobile Horizontal Tabs */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E8DEC8] px-2 py-1 flex justify-around overflow-x-auto no-scrollbar shadow-lg">
          {navItems.slice(0, 5).map(item => {
            const Icon = item.icon;
            const allowed = hasAccess(item.id);
            return (
              <button
                key={item.id}
                onClick={() => allowed && onSelectTab(item.id)}
                disabled={!allowed}
                className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
                  currentTab === item.id ? 'text-[#8D5B36]' : 'text-[#7A584A]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="truncate">{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Main Workspace content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto pb-20 lg:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
};
