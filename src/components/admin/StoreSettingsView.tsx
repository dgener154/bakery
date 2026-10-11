import React, { useState } from 'react';
import { Settings, Save, RotateCcw, CheckCircle2, ShieldAlert, KeyRound, Lock, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { StoreSettings } from '../../types/bakery';
import { BakeryStorageService } from '../../services/storage';

interface StoreSettingsViewProps {
  settings: StoreSettings;
  onRefreshData: () => void;
}

export const StoreSettingsView: React.FC<StoreSettingsViewProps> = ({ settings, onRefreshData }) => {
  const [formData, setFormData] = useState<StoreSettings>({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Admin PIN management state
  const [oldPinInput, setOldPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [showPins, setShowPins] = useState(false);
  const [pinSuccess, setPinSuccess] = useState<string | null>(null);
  const [pinError, setPinError] = useState<string | null>(null);
  const [currentPin, setCurrentPin] = useState(() => BakeryStorageService.getAdminPin());

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);
    setPinSuccess(null);

    if (!oldPinInput.trim()) {
      setPinError('Masukkan PIN saat ini.');
      return;
    }

    if (!BakeryStorageService.verifyAdminPin(oldPinInput)) {
      setPinError('PIN saat ini yang Anda masukkan salah.');
      return;
    }

    if (newPinInput.trim().length < 4 || newPinInput.trim().length > 8) {
      setPinError('PIN baru harus terdiri dari 4 sampai 8 digit angka.');
      return;
    }

    if (!/^\d+$/.test(newPinInput.trim())) {
      setPinError('PIN baru hanya boleh berisi digit angka (0-9).');
      return;
    }

    if (newPinInput !== confirmPinInput) {
      setPinError('Konfirmasi PIN baru tidak sesuai.');
      return;
    }

    BakeryStorageService.setAdminPin(newPinInput);
    BakeryStorageService.logAudit('UPDATE_PIN', 'SETTINGS', 'ADMIN', 'PIN Login Admin diperbarui');
    setCurrentPin(newPinInput);
    setPinSuccess('PIN Login Admin berhasil diperbarui!');
    setOldPinInput('');
    setNewPinInput('');
    setConfirmPinInput('');
    setTimeout(() => setPinSuccess(null), 4000);
  };

  const handleResetPin = () => {
    if (confirm('Kembalikan PIN login admin ke default awal (123456)?')) {
      BakeryStorageService.resetAdminPin();
      setCurrentPin('123456');
      setPinSuccess('PIN login admin berhasil dikembalikan ke PIN awal: 123456');
      setTimeout(() => setPinSuccess(null), 4000);
    }
  };

  const handleChange = (field: keyof StoreSettings, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    BakeryStorageService.saveSettings(formData);
    BakeryStorageService.logAudit('UPDATE_SETTINGS', 'SETTINGS', 'STORE', 'Pengaturan toko diperbarui');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    onRefreshData();
  };

  const handleResetDemoData = () => {
    if (confirm('Apakah Anda yakin ingin mereset seluruh database kembali ke data demo pengujian awal? Data transaksi baru akan diganti dengan data seed teruji.')) {
      BakeryStorageService.resetToDemoData();
      onRefreshData();
      alert('Data sistem berhasil direset ke dataset demo teruji!');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-[#E8DEC8] shadow-2xs">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#9A6237]">
            Konfigurasi Bisnis & Operasional
          </span>
          <h1 className="font-serif-bakery font-bold text-2xl text-[#3A241D] flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#8D5B36]" />
            <span>Pengaturan Profil Toko & Struk</span>
          </h1>
          <p className="text-xs text-[#7A584A] mt-1">
            Ubah identitas toko, nomor WhatsApp, template struk thermal, dan ambang batas peringatan FEFO.
          </p>
        </div>

        <button
          onClick={handleResetDemoData}
          className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset ke Data Demo Awal</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Pengaturan toko berhasil disimpan dan langsung diterapkan ke seluruh sistem!</span>
        </div>
      )}

      {/* Form Settings */}
      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E8DEC8] shadow-2xs space-y-6 text-xs">
        {/* Section 1: Identitas Toko */}
        <div className="space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#9A6237] border-b border-[#F0EBE1] pb-2">
            1. Profil & Identitas Toko
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#5C453C] mb-1">Nama Toko Bakery</label>
              <input
                type="text"
                required
                value={formData.storeName}
                onChange={e => handleChange('storeName', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#DFCBB5] font-serif-bakery font-bold text-sm text-[#3A241D]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#5C453C] mb-1">Slogan Toko</label>
              <input
                type="text"
                value={formData.slogan}
                onChange={e => handleChange('slogan', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#DFCBB5]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-[#5C453C] mb-1">Alamat Lengkap Gerai</label>
              <input
                type="text"
                value={formData.address}
                onChange={e => handleChange('address', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#DFCBB5]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#5C453C] mb-1">Kota & Kode Pos</label>
              <input
                type="text"
                value={formData.city}
                onChange={e => handleChange('city', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#DFCBB5]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#5C453C] mb-1">Jam Operasional</label>
              <input
                type="text"
                value={formData.operatingHours}
                onChange={e => handleChange('operatingHours', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#DFCBB5]"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Jadwal Jam Buka - Tutup & Kebijakan Antrean Online */}
        <div className="space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#9A6237] border-b border-[#F0EBE1] pb-2">
            2. Jadwal Operasional & Kebijakan Antrean Pesanan Online
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-[#5C453C] mb-1">Jam Buka Toko (WIB)</label>
              <input
                type="time"
                required
                value={formData.openTime || '07:00'}
                onChange={e => handleChange('openTime', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#DFCBB5] font-mono-nums font-bold"
              />
              <span className="text-[10px] text-[#8C6D62]">Contoh: 07:00 WIB</span>
            </div>

            <div>
              <label className="block font-semibold text-[#5C453C] mb-1">Jam Tutup Toko (WIB)</label>
              <input
                type="time"
                required
                value={formData.closeTime || '21:00'}
                onChange={e => handleChange('closeTime', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#DFCBB5] font-mono-nums font-bold"
              />
              <span className="text-[10px] text-[#8C6D62]">Contoh: 21:00 WIB</span>
            </div>

            <div>
              <label className="block font-semibold text-[#5C453C] mb-1">Hari Operasional Toko</label>
              <input
                type="text"
                value={formData.operatingDays || 'Setiap Hari (Senin - Minggu)'}
                onChange={e => handleChange('operatingDays', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#DFCBB5]"
              />
              <span className="text-[10px] text-[#8C6D62]">Contoh: Setiap Hari (Senin - Minggu)</span>
            </div>

            <div className="sm:col-span-3">
              <label className="block font-semibold text-[#5C453C] mb-1">Mode Status Toko (Override / Otomatis)</label>
              <select
                value={formData.manualStoreStatus || 'auto'}
                onChange={e => handleChange('manualStoreStatus', e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-[#DFCBB5] bg-white font-semibold text-xs text-[#3A241D]"
              >
                <option value="auto">Otomatis Berdasarkan Jam Operasional WIB ({formData.openTime || '07:00'} - {formData.closeTime || '21:00'})</option>
                <option value="force_open">Paksa Buka (Buka Sekarang - Untuk Pengujian / Demo Checkout Kapan Saja)</option>
                <option value="force_closed">Paksa Tutup (Tutup Sekarang - Untuk Libur Toko / Renovasi / Cuti)</option>
              </select>
              <span className="text-[10px] text-[#8C6D62] mt-0.5 block">
                *Gunakan "Paksa Buka" bila ingin menguji checkout online di luar jam operasional.
              </span>
            </div>

            <div className="sm:col-span-3">
              <label className="block font-semibold text-[#5C453C] mb-1">Aturan & Jadwal Pelayanan Antrean Online (FIFO)</label>
              <textarea
                rows={2}
                value={formData.orderQueuePolicy || ''}
                onChange={e => handleChange('orderQueuePolicy', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#DFCBB5] text-xs"
                placeholder="Pesanan online dilayani sesuai urutan dan jam order..."
              />
              <span className="text-[10px] text-[#8C6D62]">
                Teks ini ditampilkan pada formulir pemesanan, keranjang, dan struk pembelian.
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Kontak & WhatsApp */}
        <div className="space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#9A6237] border-b border-[#F0EBE1] pb-2">
            3. Kontak & Layanan Pelanggan
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-[#5C453C] mb-1">Nomor WhatsApp Toko</label>
              <input
                type="text"
                required
                value={formData.whatsapp}
                onChange={e => handleChange('whatsapp', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#DFCBB5]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#5C453C] mb-1">Nomor Telepon Toko</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => handleChange('phone', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#DFCBB5]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#5C453C] mb-1">Alamat Email Toko</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#DFCBB5]"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Pengiriman & Format Penomoran */}
        <div className="space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#9A6237] border-b border-[#F0EBE1] pb-2">
            4. Pengiriman, Nomor Struk & Ambang FEFO
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-[#5C453C] mb-1">Tarif Ongkir Standar (Rp)</label>
              <input
                type="number"
                value={formData.deliveryFeeFixed}
                onChange={e => handleChange('deliveryFeeFixed', Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-[#DFCBB5] font-mono-nums"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#5C453C] mb-1">Syarat Gratis Ongkir (Rp)</label>
              <input
                type="number"
                value={formData.freeDeliveryThreshold}
                onChange={e => handleChange('freeDeliveryThreshold', Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-[#DFCBB5] font-mono-nums"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#5C453C] mb-1">Peringatan Kedaluwarsa (Hari)</label>
              <input
                type="number"
                min={1}
                value={formData.expiryWarningDays}
                onChange={e => handleChange('expiryWarningDays', Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-[#DFCBB5] font-mono-nums"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Format Struk Thermal & Kebijakan */}
        <div className="space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#9A6237] border-b border-[#F0EBE1] pb-2">
            5. Teks Catatan Kaki Struk Thermal
          </h3>

          <div>
            <label className="block font-semibold text-[#5C453C] mb-1">Pesan Terima Kasih di Bagian Bawah Struk</label>
            <input
              type="text"
              value={formData.receiptFooterMessage}
              onChange={e => handleChange('receiptFooterMessage', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#DFCBB5]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#5C453C] mb-1">Kebijakan Komplain / Retur</label>
            <input
              type="text"
              value={formData.complaintPolicy}
              onChange={e => handleChange('complaintPolicy', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#DFCBB5]"
            />
          </div>
        </div>

        {/* Section 6: Keamanan & PIN Akses Admin */}
        <div className="space-y-4 pt-4 border-t border-[#F0EBE1]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F0EBE1] pb-2">
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#9A6237] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#B45309]" />
                <span>6. Keamanan & PIN Login Portal Admin</span>
              </h3>
              <p className="text-[11px] text-[#7A584A] mt-0.5">
                PIN ini digunakan petugas dan administrator untuk masuk ke Portal Admin. (PIN Awal Default: <strong>123456</strong>).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] bg-[#FAF0E4] border border-[#DFCBB5] text-[#8D5B36] font-bold px-2 py-0.5 rounded-md">
                Status: PIN Terpasang
              </span>
            </div>
          </div>

          {pinSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{pinSuccess}</span>
            </div>
          )}

          {pinError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {pinError}
            </div>
          )}

          <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#DFCBB5] space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-[#5C453C] mb-1">PIN Saat Ini / Lama</label>
                <div className="relative">
                  <KeyRound className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C6D62]" />
                  <input
                    type={showPins ? 'text' : 'password'}
                    inputMode="numeric"
                    maxLength={8}
                    value={oldPinInput}
                    onChange={e => setOldPinInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="PIN saat ini (123456)"
                    className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border border-[#DFCBB5] bg-white font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#5C453C] mb-1">PIN Baru (6 Digit)</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C6D62]" />
                  <input
                    type={showPins ? 'text' : 'password'}
                    inputMode="numeric"
                    maxLength={8}
                    value={newPinInput}
                    onChange={e => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="PIN baru (cth: 654321)"
                    className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border border-[#DFCBB5] bg-white font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#5C453C] mb-1">Ulangi PIN Baru</label>
                <div className="relative">
                  <CheckCircle2 className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C6D62]" />
                  <input
                    type={showPins ? 'text' : 'password'}
                    inputMode="numeric"
                    maxLength={8}
                    value={confirmPinInput}
                    onChange={e => setConfirmPinInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="Konfirmasi PIN baru"
                    className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border border-[#DFCBB5] bg-white font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#E8DEC8]">
              <label className="inline-flex items-center gap-1.5 text-[11px] text-[#6B4F43] cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPins}
                  onChange={e => setShowPins(e.target.checked)}
                  className="rounded text-[#8D5B36]"
                />
                <span>Tampilkan Digit PIN</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetPin}
                  className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset PIN ke 123456</span>
                </button>

                <button
                  type="button"
                  onClick={handleUpdatePin}
                  className="px-4 py-1.5 rounded-lg bg-[#8D5B36] hover:bg-[#724524] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Perbarui PIN Login</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-[#F0EBE1] flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-[#8D5B36] hover:bg-[#724524] text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-[#8D5B36]/20"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Seluruh Pengaturan</span>
          </button>
        </div>
      </form>
    </div>
  );
};
