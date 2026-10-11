import React, { useState } from 'react';
import { Package, Plus, Edit2, Archive, CheckCircle, AlertCircle, Eye } from 'lucide-react';
import { Category, Product, ProductVisualType, UserAccount } from '../../types/bakery';
import { formatRupiah } from '../../utils/formatters';
import { BakeryStorageService } from '../../services/storage';
import { BakeryVisual } from '../common/BakeryVisual';

interface ProductManagementProps {
  products: Product[];
  categories: Category[];
  currentUser: UserAccount;
  onRefreshData: () => void;
}

export const ProductManagement: React.FC<ProductManagementProps> = ({
  products,
  categories,
  currentUser,
  onRefreshData,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [description, setDescription] = useState('');
  const [normalPrice, setNormalPrice] = useState(25000);
  const [promoPrice, setPromoPrice] = useState<number | undefined>(undefined);
  const [weightGrams, setWeightGrams] = useState(100);
  const [unit, setUnit] = useState('pcs');
  const [ingredients, setIngredients] = useState('');
  const [allergens, setAllergens] = useState('');
  const [storageInstructions, setStorageInstructions] = useState('');
  const [estimatedShelfDays, setEstimatedShelfDays] = useState(3);
  const [minStockAlert, setMinStockAlert] = useState(5);
  const [visualType, setVisualType] = useState<ProductVisualType>('sourdough');

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setCategoryId(categories[0]?.id || '');
    setDescription('');
    setNormalPrice(25000);
    setPromoPrice(undefined);
    setWeightGrams(100);
    setUnit('pcs');
    setIngredients('Tepung terigu, ragi, air, garam, mentega.');
    setAllergens('Mengandung Gluten, Susu, Telur.');
    setStorageInstructions('Simpan di tempat kering dan sejuk.');
    setEstimatedShelfDays(3);
    setMinStockAlert(5);
    setVisualType('sourdough');
    setShowModal(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setCategoryId(p.categoryId);
    setDescription(p.description);
    setNormalPrice(p.normalPrice);
    setPromoPrice(p.promoPrice);
    setWeightGrams(p.weightGrams);
    setUnit(p.unit);
    setIngredients(p.ingredients);
    setAllergens(p.allergens);
    setStorageInstructions(p.storageInstructions);
    setEstimatedShelfDays(p.estimatedShelfDays);
    setMinStockAlert(p.minStockAlert);
    setVisualType(p.visualType);
    setShowModal(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const allProducts = BakeryStorageService.getProducts();

    if (editingProduct) {
      // Edit
      const updated = allProducts.map(p =>
        p.id === editingProduct.id
          ? {
              ...p,
              name: name.trim(),
              categoryId,
              description: description.trim(),
              normalPrice,
              promoPrice: promoPrice && promoPrice > 0 ? promoPrice : undefined,
              weightGrams,
              unit,
              ingredients,
              allergens,
              storageInstructions,
              estimatedShelfDays,
              minStockAlert,
              visualType,
              updatedAt: new Date().toISOString(),
            }
          : p
      );
      BakeryStorageService.saveProducts(updated);
      BakeryStorageService.logAudit('EDIT_PRODUCT', 'PRODUCT', editingProduct.id, `Produk ${name} diperbarui`);
    } else {
      // Create
      const newProd: Product = {
        id: `prd_${Date.now()}`,
        name: name.trim(),
        categoryId,
        description: description.trim(),
        normalPrice,
        promoPrice: promoPrice && promoPrice > 0 ? promoPrice : undefined,
        weightGrams,
        unit,
        ingredients,
        allergens,
        storageInstructions,
        estimatedShelfDays,
        minStockAlert,
        isPreOrder: false,
        isAvailable: true,
        isArchived: false,
        visualType,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      allProducts.unshift(newProd);
      BakeryStorageService.saveProducts(allProducts);
      BakeryStorageService.logAudit('CREATE_PRODUCT', 'PRODUCT', newProd.id, `Produk baru ${name} ditambahkan`);
    }

    setShowModal(false);
    onRefreshData();
  };

  const toggleArchive = (productId: string, currentArchived: boolean) => {
    const allProducts = BakeryStorageService.getProducts();
    const updated = allProducts.map(p =>
      p.id === productId ? { ...p, isArchived: !currentArchived, updatedAt: new Date().toISOString() } : p
    );
    BakeryStorageService.saveProducts(updated);
    BakeryStorageService.logAudit('ARCHIVE_PRODUCT', 'PRODUCT', productId, `Status arsip diubah menjadi ${!currentArchived}`);
    onRefreshData();
  };

  const filtered = products.filter(p => {
    if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) return false;
    if (searchQuery.trim()) {
      return p.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-[#E8DEC8] shadow-2xs">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#9A6237]">
            Master Data Toko
          </span>
          <h1 className="font-serif-bakery font-bold text-2xl text-[#3A241D] flex items-center gap-2">
            <Package className="w-6 h-6 text-[#8D5B36]" />
            <span>Manajemen Master Produk Bakery</span>
          </h1>
          <p className="text-xs text-[#7A584A] mt-1">
            Kelola resep, komposisi, harga jual, estimasi masa simpan, dan batas peringatan stok minimum.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-[#8D5B36] hover:bg-[#724524] text-white text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-xs whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Produk Baru</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#E8DEC8]">
        <div className="flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer ${
              selectedCategory === 'all' ? 'bg-[#8D5B36] text-white' : 'bg-[#FAF6F0] text-[#6B4F43]'
            }`}
          >
            Semua ({products.length})
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer ${
                selectedCategory === c.id ? 'bg-[#8D5B36] text-white' : 'bg-[#FAF6F0] text-[#6B4F43]'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Cari nama produk..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-[#DFCBB5] text-xs text-[#3A241D] bg-[#FAF7F2] w-full sm:w-60"
        />
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-[#E8DEC8] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E8DEC8] bg-[#FAF7F2] text-[#8C6D62] uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Produk</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4 text-right">Harga Jual</th>
                <th className="py-3 px-4 text-center">Masa Simpan</th>
                <th className="py-3 px-4 text-center">Batas Min</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2ECE1]">
              {filtered.map(p => {
                const cat = categories.find(c => c.id === p.categoryId);
                return (
                  <tr key={p.id} className="hover:bg-[#FAF7F2] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#E8DEC8] shrink-0">
                          <BakeryVisual
                            type={p.visualType}
                            imageUrl={p.imageUrl}
                            alt={p.name}
                            size="sm"
                            className="w-full h-full"
                          />
                        </div>
                        <div>
                          <span className="font-bold text-[#3A241D] block">{p.name}</span>
                          <span className="text-[10px] text-[#8C6D62]">
                            {p.weightGrams}g · {p.unit}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#5C453C]">{cat?.name || '-'}</td>
                    <td className="py-3.5 px-4 text-right font-mono-nums font-bold text-[#3A241D]">
                      {p.promoPrice ? (
                        <>
                          <span className="text-slate-400 line-through text-[10px] block">
                            {formatRupiah(p.normalPrice)}
                          </span>
                          <span className="text-[#B45309]">{formatRupiah(p.promoPrice)}</span>
                        </>
                      ) : (
                        formatRupiah(p.normalPrice)
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono-nums">{p.estimatedShelfDays} hari</td>
                    <td className="py-3.5 px-4 text-center font-mono-nums text-[#8C6D62]">{p.minStockAlert}</td>
                    <td className="py-3.5 px-4">
                      {p.isArchived ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                          Diarsipkan
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Tampil di Katalog
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded-lg text-[#5C453C] hover:bg-[#FAF0E4] border border-[#DFCBB5] cursor-pointer"
                          title="Edit Produk"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => toggleArchive(p.id, p.isArchived)}
                          className={`p-1.5 rounded-lg border cursor-pointer ${
                            p.isArchived ? 'text-emerald-700 hover:bg-emerald-50 border-emerald-200' : 'text-slate-500 hover:bg-slate-100 border-slate-200'
                          }`}
                          title={p.isArchived ? 'Aktifkan Kembali' : 'Arsipkan Produk'}
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#DFCBB5] p-6 sm:p-7 space-y-4 my-6">
            <h2 className="font-serif-bakery font-bold text-xl text-[#3A241D]">
              {editingProduct ? 'Edit Master Produk' : 'Tambah Produk Baru'}
            </h2>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold text-[#5C453C] mb-1">Nama Produk</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#DFCBB5]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#5C453C] mb-1">Kategori</label>
                  <select
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#DFCBB5] bg-white"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#5C453C] mb-1">Ilustrasi Visual</label>
                  <select
                    value={visualType}
                    onChange={e => setVisualType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-[#DFCBB5] bg-white"
                  >
                    <option value="sourdough">Sourdough Loaf</option>
                    <option value="croissant">Butter Croissant</option>
                    <option value="chocolate_cake">Chocolate Ganache Cake</option>
                    <option value="donut">Berry Glazed Donut</option>
                    <option value="baguette">Classic Baguette</option>
                    <option value="sweet_bun">Roti Manis Bun</option>
                    <option value="cookies">Choco Chunk Cookies</option>
                    <option value="tart">Strawberry Tart</option>
                    <option value="toast_bread">Hokkaido Milk Toast</option>
                    <option value="hampers">Hampers Gift Box</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#5C453C] mb-1">Harga Normal (Rp)</label>
                  <input
                    type="number"
                    required
                    value={normalPrice}
                    onChange={e => setNormalPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#DFCBB5] font-mono-nums"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#5C453C] mb-1">Harga Promo (Opsional)</label>
                  <input
                    type="number"
                    value={promoPrice || ''}
                    onChange={e => setPromoPrice(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Kosongkan jika normal"
                    className="w-full px-3 py-2 rounded-xl border border-[#DFCBB5] font-mono-nums"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#5C453C] mb-1">Berat (gram)</label>
                  <input
                    type="number"
                    value={weightGrams}
                    onChange={e => setWeightGrams(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#DFCBB5]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#5C453C] mb-1">Saran Masa Simpan (hari)</label>
                  <input
                    type="number"
                    value={estimatedShelfDays}
                    onChange={e => setEstimatedShelfDays(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#DFCBB5]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#5C453C] mb-1">Deskripsi Produk</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#DFCBB5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#5C453C] mb-1">Komposisi & Bahan</label>
                  <input
                    type="text"
                    value={ingredients}
                    onChange={e => setIngredients(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#DFCBB5]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#5C453C] mb-1">Informasi Alergen</label>
                  <input
                    type="text"
                    value={allergens}
                    onChange={e => setAllergens(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#DFCBB5]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#F0EBE1] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#DFCBB5] text-[#5C453C] font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#8D5B36] text-white font-bold"
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
