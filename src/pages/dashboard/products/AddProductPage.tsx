import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { ArrowLeft, ScanBarcode, Save, Loader2, Calculator } from 'lucide-react';
import { cn } from '../../../lib/utils';

export default function AddProductPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [businessId, setBusinessId] = useState<number | null>(null);

    // Form States
    const [name, setName] = useState('');
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [priceBuy, setPriceBuy] = useState<string>(''); // Buying Price (HPP)
    const [priceSell, setPriceSell] = useState<string>(''); // Selling Price
    const [stock, setStock] = useState<string>('');
    const [unit, setUnit] = useState('pcs');
    const [isFavorite, setIsFavorite] = useState(false);
    const [barcode, setBarcode] = useState('');

    // Categories (Fetch or Default)
    const [categories, setCategories] = useState<{ id: number, name: string }[]>([]);

    useEffect(() => {
        fetchBusinessAndCategories();
    }, []);

    const fetchBusinessAndCategories = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert("User tidak ditemukan (Not logged in)");
                return;
            }

            // 1. Get Business ID
            const { data: business, error: businessError } = await supabase
                .from('businesses')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (businessError) {
                console.error("Error fetching business:", businessError);
                alert(`Gagal mengambil data toko: ${businessError.message}. Pastikan Anda sudah login.`);
                return;
            }

            if (business) {
                setBusinessId(business.id);

                // 2. Get Categories
                const { data: catData, error: catError } = await supabase
                    .from('categories')
                    .select('id, name')
                    .eq('business_id', business.id)
                    .eq('is_active', true);

                if (catError) console.error("Error fetching categories:", catError);

                if (catData && catData.length > 0) {
                    setCategories(catData);
                    setCategoryId(catData[0].id);
                }
            } else {
                alert("Data Bisnis tidak ditemukan untuk user ini.");
            }
        } catch (error: any) {
            console.error("Error init:", error);
            alert("System Error: " + error.message);
        }
    };

    // Calculations
    const numBuy = parseFloat(priceBuy.replace(/[^0-9]/g, '')) || 0;
    const numSell = parseFloat(priceSell.replace(/[^0-9]/g, '')) || 0;
    const profit = numSell - numBuy;
    const profitMargin = numSell > 0 ? ((profit / numSell) * 100).toFixed(1) : '0';

    const handleSave = async () => {
        if (!businessId) {
            alert("Gagal: ID Toko tidak ditemukan. Coba refresh halaman.");
            return;
        }
        if (!name || !priceSell) {
            alert("Mohon isi Nama Barang dan Harga Jual.");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                business_id: businessId,
                category_id: categoryId, // Can be null
                name: name,
                purchase_price: numBuy,
                selling_price: numSell,
                stock_quantity: parseFloat(stock) || 0,
                unit: unit,
                barcode: barcode || null,
                is_favorite: isFavorite,
                is_active: true
            };
            console.log("Saving payload:", payload);

            const { error } = await supabase
                .from('products')
                .insert([payload]);

            if (error) {
                console.error("Error saving product:", error);
                throw error;
            }

            alert("Produk berhasil disimpan!");
            navigate(-1); // Go back
        } catch (error: any) {
            alert('Gagal menyimpan ke database: ' + error.message + ' (Hint: Cek permission RLS)');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header */}
            <div className="bg-white sticky top-0 z-10 px-4 py-4 border-b border-slate-100 shadow-sm flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-slate-500" />
                </button>
                <h1 className="text-xl font-bold text-slate-800">Tambah Barang</h1>
            </div>

            <div className="max-w-md mx-auto p-6 space-y-6">

                {/* Name */}
                <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Nama Barang *</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Contoh: Indomie Goreng"
                        className="w-full p-4 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all font-medium text-slate-700 bg-white"
                    />
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Kategori</label>
                    <select
                        value={categoryId || ''}
                        onChange={(e) => setCategoryId(Number(e.target.value))}
                        className="w-full p-4 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none transition-all font-medium text-slate-700 bg-white appearance-none"
                    >
                        <option value="" disabled>Pilih Kategori</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                        {categories.length === 0 && <option value="">Belum ada kategori</option>}
                    </select>
                </div>

                {/* Pricing Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700">Harga Beli (Modal)</label>
                        <input
                            type="number"
                            value={priceBuy}
                            onChange={(e) => setPriceBuy(e.target.value)}
                            placeholder="0"
                            className="w-full p-4 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none transition-all font-medium text-slate-700 bg-white"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700">Harga Jual *</label>
                        <input
                            type="number"
                            value={priceSell}
                            onChange={(e) => setPriceSell(e.target.value)}
                            placeholder="0"
                            className="w-full p-4 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none transition-all font-bold text-emerald-700 bg-white"
                        />
                    </div>
                </div>

                {/* Profit Insight */}
                {numSell > 0 && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start gap-3">
                        <Calculator className="w-5 h-5 text-blue-500 mt-0.5" />
                        <div>
                            <p className="text-blue-900 font-semibold text-sm">
                                Untung: Rp {profit.toLocaleString('id-ID')} ({profitMargin}%)
                            </p>
                            <p className="text-blue-600 text-xs">Per satuan barang</p>
                        </div>
                    </div>
                )}

                {/* Stock */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 space-y-1.5">
                        <label className="text-sm font-bold text-slate-700">Stok Awal</label>
                        <input
                            type="number"
                            value={stock}
                            onChange={(e) => setStock(e.target.value)}
                            placeholder="0"
                            className="w-full p-4 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none transition-all font-medium text-slate-700 bg-white"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700">Satuan</label>
                        <select
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                            className="w-full p-4 h-[58px] rounded-xl border border-slate-200 focus:border-emerald-500 outline-none transition-all font-medium text-slate-700 bg-white"
                        >
                            <option value="pcs">Pcs</option>
                            <option value="kg">Kg</option>
                            <option value="ltr">Liter</option>
                            <option value="box">Box</option>
                            <option value="btl">Botol</option>
                        </select>
                    </div>
                </div>

                {/* Barcode */}
                <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Barcode (Opsional)</label>
                    <div className="relative">
                        <input
                            type="text"
                            value={barcode}
                            onChange={(e) => setBarcode(e.target.value)}
                            placeholder="Scan atau ketik manual..."
                            className="w-full p-4 pr-12 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none transition-all font-medium text-slate-700 bg-white"
                        />
                        <button className="absolute right-3 top-3 p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all">
                            <ScanBarcode className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Options */}
                <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl bg-white cursor-pointer hover:border-emerald-400" onClick={() => setIsFavorite(!isFavorite)}>
                    <div className={cn("w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all", isFavorite ? "bg-emerald-500 border-emerald-500" : "border-slate-300")}>
                        {isFavorite && <ArrowLeft className="w-4 h-4 text-white rotate-[-90deg]" />}
                        {/* Visual checkmark hack with icon or just simple check */}
                    </div>
                    <span className="font-semibold text-slate-700">Tambahkan ke Favorit</span>
                </div>

                {/* Submit */}
                <div className="pt-4">
                    <button
                        onClick={handleSave}
                        disabled={loading || !name || !priceSell}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Simpan Barang
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
}
