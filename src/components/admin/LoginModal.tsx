import React, { useState } from 'react';
import { X, Lock, KeyRound, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { UserAccount } from '../../types/bakery';
import { DEFAULT_USERS, BakeryStorageService } from '../../services/storage';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  if (!isOpen) return null;

  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleNumpadClick = (digit: string) => {
    if (pin.length < 8) {
      setPin(prev => prev + digit);
      setLoginError(null);
    }
  };

  const handleNumpadBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setLoginError(null);
  };

  const handleNumpadClear = () => {
    setPin('');
    setLoginError(null);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!pin.trim()) {
      setLoginError('Silakan masukkan PIN login.');
      return;
    }

    const isValid = BakeryStorageService.verifyAdminPin(pin);
    if (!isValid) {
      setLoginError('PIN salah! Silakan coba lagi (PIN Awal default: 123456 jika belum diubah).');
      return;
    }

    // Default to Super Admin upon successful PIN entry
    const user = DEFAULT_USERS[0];
    BakeryStorageService.setCurrentUser(user);
    BakeryStorageService.logAudit('LOGIN_PIN', 'AUTH', user.id, `Petugas ${user.name} login dengan PIN Admin`);
    
    onLoginSuccess(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-[#DFCBB5] p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F0EBE1] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8D5B36] to-[#5C3317] flex items-center justify-center text-white shadow-xs">
              <Lock className="w-4 h-4 text-[#FFE2B8]" />
            </div>
            <div>
              <h2 className="font-serif-bakery font-bold text-lg text-[#3A241D] leading-tight">
                Login Akses Admin
              </h2>
              <span className="text-[11px] text-[#8C6D62]">
                Masukkan PIN Keamanan Operasional
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#8C6D62] hover:text-[#3A241D] p-1 rounded-lg hover:bg-[#FAF0E4] cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Login PIN */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          {loginError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 leading-relaxed">
              {loginError}
            </div>
          )}

          {/* PIN Display & Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-[#5C453C]">
                Masukkan PIN (6 Digit)
              </label>
              <span className="text-[11px] text-[#B45309] font-medium bg-[#FAF0E4] px-2 py-0.5 rounded-md border border-[#DFCBB5]">
                PIN Awal: <strong>123456</strong>
              </span>
            </div>

            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C6D62]" />
              <input
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                pattern="[0-9]*"
                required
                maxLength={8}
                value={pin}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '');
                  setPin(val);
                  setLoginError(null);
                }}
                placeholder="Ketik 6 digit PIN (123456)"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#DFCBB5] text-center tracking-widest text-lg font-mono font-bold text-[#3A241D] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8D5B36]"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C6D62] hover:text-[#3A241D] cursor-pointer"
                title={showPin ? 'Sembunyikan PIN' : 'Tampilkan PIN'}
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Quick default PIN shortcut */}
            <div className="flex items-center justify-between pt-0.5 text-[11px]">
              <button
                type="button"
                onClick={() => {
                  setPin('123456');
                  setLoginError(null);
                }}
                className="text-[#8D5B36] hover:text-[#5C3317] font-semibold underline cursor-pointer"
              >
                Gunakan PIN Awal (123456)
              </button>
            </div>
          </div>

          {/* Virtual Numpad */}
          <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#DFCBB5]/80 space-y-2">
            <div className="grid grid-cols-3 gap-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleNumpadClick(num)}
                  className="py-2.5 rounded-xl bg-white hover:bg-[#F3E3D1] border border-[#DFCBB5] text-sm font-mono font-bold text-[#3A241D] shadow-2xs active:scale-95 transition-all cursor-pointer"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={handleNumpadClear}
                className="py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-semibold text-rose-700 shadow-2xs active:scale-95 transition-all cursor-pointer"
              >
                Hapus
              </button>
              <button
                type="button"
                onClick={() => handleNumpadClick('0')}
                className="py-2.5 rounded-xl bg-white hover:bg-[#F3E3D1] border border-[#DFCBB5] text-sm font-mono font-bold text-[#3A241D] shadow-2xs active:scale-95 transition-all cursor-pointer"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleNumpadBackspace}
                className="py-2.5 rounded-xl bg-[#FAF0E4] hover:bg-[#F0DECA] border border-[#DFCBB5] text-xs font-semibold text-[#8C4F1A] shadow-2xs active:scale-95 transition-all cursor-pointer"
              >
                ⌫
              </button>
            </div>
          </div>

          {/* Info Ubah PIN di Pengaturan Toko */}
          <div className="p-2.5 rounded-xl bg-[#FAF0E4]/70 border border-[#E8DEC8] text-[11px] text-[#7A584A] leading-relaxed">
            💡 Untuk mengubah PIN login, Anda dapat mengaturnya di dalam <strong>Pengaturan Toko</strong> setelah masuk.
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-[#8D5B36] hover:bg-[#724524] text-white font-bold text-xs transition-all cursor-pointer shadow-md shadow-[#8D5B36]/20 flex items-center justify-center gap-2"
          >
            <span>Masuk ke Portal Admin</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
