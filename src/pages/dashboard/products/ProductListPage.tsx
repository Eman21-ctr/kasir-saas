import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { Search, Plus, Package, AlertCircle, Heart, FolderOpen, Store } from 'lucide-react';
import { cn } from '../../../lib/utils';

type Product = {
    id: number;
    name: string;
    stock_quantity: number;
    unit: string;
    selling_price: number;
    is_active: boolean;
    is_favorite: boolean;
    image_url: string | null;
};

export default function ProductListPage() {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'out_of_stock' | 'favorite'>('all');
    const [logoUrl, setLogoUrl] = useState('');

    useEffect(() => { fetchProducts(); }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: business } = await supabase
                .from('businesses')
                .select('id, business_name, logo_url')
                .eq('user_id', user.id)
                .single();

            if (!business) return;
            setLogoUrl(business.logo_url || '');

            const { data, error } = await supabase
                .from('products')
                .select('id, name, stock_quantity, unit, selling_price, is_active, is_favorite, image_url')
                .eq('business_id', business.id)
                .eq('is_active', true)
                .order('name');

            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'all' ? true : filter === 'out_of_stock' ? p.stock_quantity <= 0 : p.is_favorite;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-800">
            {/* Header with Logo */}
            <div className="bg-white sticky top-0 z-20 px-6 py-3 border-b border-slate-100 shadow-sm flex items-center justify-between">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl border border-emerald-100 overflow-hidden flex items-center justify-center">
                    {logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                        <Store className="w-5 h-5 text-emerald-600" />
                    )}
                </div>
            </div>

            <div className="p-4 space-y-3 pt-2">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900">Daftar Barang</h1>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Manajemen Stok & Harga</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigate('/dashboard/products/categories')}
                            className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
                        >
                            <FolderOpen className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => navigate('/dashboard/products/new')}
                            className="bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            Tambah
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cari nama barang..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-bold text-sm text-slate-700 placeholder:text-slate-400 bg-white shadow-sm"
                    />
                </div>

                {/* Filters */}
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {[
                        { id: 'all', label: 'Semua' },
                        { id: 'out_of_stock', label: 'Stok Habis' },
                        { id: 'favorite', label: 'Favorit' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id as any)}
                            className={cn(
                                "whitespace-nowrap px-4 py-2 rounded-lg text-sm font-semibold transition-all border",
                                filter === tab.id
                                    ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Product List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-10"><p className="text-slate-400 animate-pulse">Memuat barang...</p></div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Package className="w-8 h-8 text-slate-300" />
                            </div>
                            <p className="text-slate-500 font-medium">Barang tidak ditemukan</p>
                            <button onClick={() => navigate('/dashboard/products/new')} className="text-emerald-600 text-sm font-bold mt-2 hover:underline">+ Tambah Barang Baru</button>
                        </div>
                    ) : (
                        filteredProducts.map((product) => (
                            <div
                                key={product.id}
                                onClick={() => navigate(`/dashboard/products/${product.id}`)}
                                className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm hover:border-emerald-500 transition-all active:scale-[0.99] flex items-center justify-between gap-3 group"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <h3 className="font-bold text-slate-800 text-sm truncate">{product.name}</h3>
                                        {product.is_favorite && <Heart className="w-3 h-3 text-rose-500 fill-rose-500 flex-shrink-0" />}
                                    </div>
                                    <p className={cn("text-[11px] font-bold flex items-center gap-1", product.stock_quantity <= 0 ? "text-red-500" : "text-slate-400 uppercase tracking-tight")}>
                                        {product.stock_quantity <= 0 && <AlertCircle className="w-2.5 h-2.5" />}
                                        Stok: {product.stock_quantity} {product.unit}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-emerald-600 font-extrabold text-sm">Rp {product.selling_price.toLocaleString('id-ID')}</p>
                                </div>
                            </div>
                        ))
                    )}
                    <div className="text-center pt-4">
                        <p className="text-xs text-slate-400 font-medium">Total: {filteredProducts.length} barang</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
