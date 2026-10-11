import React, { useState } from 'react';
import { Users, Search, Phone, Mail, MapPin, ShoppingBag, Plus } from 'lucide-react';
import { Customer } from '../../types/bakery';
import { formatRupiah, formatDateTimeIndo } from '../../utils/formatters';
import { BakeryStorageService } from '../../services/storage';

interface CustomerManagementProps {
  customers: Customer[];
  onRefreshData: () => void;
}

export const CustomerManagement: React.FC<CustomerManagementProps> = ({ customers, onRefreshData }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const filtered = customers.filter(c => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.phone.includes(q);
    }
    return true;
  });

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    const all = BakeryStorageService.getCustomers();
    all.unshift({
      id: `cst_${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      address: address.trim() || 'Jakarta',
      totalOrders: 0,
      totalSpent: 0,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    });
    BakeryStorageService.saveCustomers(all);
    BakeryStorageService.logAudit('CREATE_CUSTOMER', 'CUSTOMER', name, `Pelanggan ${name} ditambahkan`);
    setShowAddModal(false);
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setNotes('');
    onRefreshData();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-[#E8DEC8] shadow-2xs">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#9A6237]">
            Basis Data Konsumen
          </span>
          <h1 className="font-serif-bakery font-bold text-2xl text-[#3A241D] flex items-center gap-2">
            <Users className="w-6 h-6 text-[#8D5B36]" />
            <span>Manajemen Data Pelanggan</span>
          </h1>
          <p className="text-xs text-[#7A584A] mt-1">
            Riwayat pembelian pelanggan, preferensi pengiriman, dan loyalitas belanja.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-[#8D5B36] hover:bg-[#724524] text-white text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-xs whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pelanggan</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E8DEC8] flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C6D62]" />
          <input
            type="text"
            placeholder="Cari nama atau nomor WhatsApp..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#DFCBB5] text-xs text-[#3A241D] bg-[#FAF7F2] focus:bg-white focus:outline-none"
          />
        </div>
        <span className="text-xs text-[#8C6D62] hidden sm:block">
          Total Terdaftar: <strong>{customers.length} pelanggan</strong>
        </span>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-[#E8DEC8] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E8DEC8] bg-[#FAF7F2] text-[#8C6D62] uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Nama Pelanggan</th>
                <th className="py-3 px-4">Kontak</th>
                <th className="py-3 px-4">Alamat Terakhir</th>
                <th className="py-3 px-4 text-center">Jumlah Pesanan</th>
                <th className="py-3 px-4 text-right">Total Belanja</th>
                <th className="py-3 px-4">Catatan Khusus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2ECE1]">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-[#FAF7F2] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[#3A241D]">{c.name}</td>
                  <td className="py-3.5 px-4 text-[#5C453C]">
                    <span className="block font-mono text-[11px]">{c.phone}</span>
                    {c.email && <span className="text-[10px] text-[#8C6D62]">{c.email}</span>}
                  </td>
                  <td className="py-3.5 px-4 text-[#7A584A] max-w-xs truncate">{c.address}</td>
                  <td className="py-3.5 px-4 text-center font-mono-nums font-bold text-[#3A241D]">
                    {c.totalOrders} order
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono-nums font-bold text-[#B45309]">
                    {formatRupiah(c.totalSpent)}
                  </td>
                  <td className="py-3.5 px-4 text-[#8C6D62] text-[11px] italic">
                    {c.notes || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#DFCBB5] p-6 space-y-4">
            <h2 className="font-serif-bakery font-bold text-lg text-[#3A241D]">
              Tambah Pelanggan Baru
            </h2>

            <form onSubmit={handleAddCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#5C453C] mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#DFCBB5]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#5C453C] mb-1">Nomor WhatsApp / HP</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#DFCBB5]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#5C453C] mb-1">Email (Opsional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#DFCBB5]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#5C453C] mb-1">Alamat Pengiriman</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#DFCBB5]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#5C453C] mb-1">Catatan Khusus</label>
                <input
                  type="text"
                  placeholder="Contoh: Alergi kacang / pelanggan VIP"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#DFCBB5]"
                />
              </div>

              <div className="pt-3 border-t border-[#F0EBE1] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#DFCBB5] text-[#5C453C] font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#8D5B36] text-white font-bold"
                >
                  Simpan Pelanggan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
