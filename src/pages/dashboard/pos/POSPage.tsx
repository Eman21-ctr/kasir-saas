import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../../lib/supabase';
import { Search, ShoppingCart, Minus, Plus, X, ChevronRight, Loader2, User, Star, Crown, Filter, ChevronDown, Store } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useNavigate } from 'react-router-dom';

// Types
type Product = {
    id: number;
    name: string;
    selling_price: number;
    purchase_price: number;
    stock_quantity: number;
    image_url: string | null;
    category_id: number;
    is_active: boolean;
    is_favorite: boolean;
};

type CartItem = Product & {
    qty: number;
};

type Category = {
    id: number;
    name: string;
};

type Member = {
    id: number;
    name: string;
    member_level: string;
    phone: string;
};

export default function POSPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);

    const [search, setSearch] = useState('');
    const [memberSearch, setMemberSearch] = useState('');
    const [logoUrl, setLogoUrl] = useState('');

    const [activeCategory, setActiveCategory] = useState<number | 'all' | 'fav'>('all');
    const [showCart, setShowCart] = useState(false);
    const [showMemberModal, setShowMemberModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);

    const getActiveCategoryLabel = () => {
        if (activeCategory === 'all') return 'Semua Kategori';
        if (activeCategory === 'fav') return 'Produk Favorit';
        const cat = categories.find(c => c.id === activeCategory);
        return cat ? cat.name : 'Semua Kategori';
    };

    // Load Data
    useEffect(() => {
        fetchPOSData();
    }, []);

    const fetchPOSData = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: business } = await supabase
                .from('businesses')
                .select('id, logo_url')
                .eq('user_id', user.id)
                .single();

            if (business) {
                setLogoUrl(business.logo_url || '');
                const { data: catData } = await supabase
                    .from('categories')
                    .select('id, name')
                    .eq('business_id', business.id)
                    .eq('is_active', true);
                setCategories(catData || []);

                // Fetch Members
                const { data: memData } = await supabase
                    .from('members')
                    .select('id, name, member_level, phone')
                    .eq('business_id', business.id)
                    .eq('is_active', true)
                    .order('name');
                setMembers(memData || []);

                // Fetch Products
                const { data: prodData } = await supabase
                    .from('products')
                    .select('*')
                    .eq('business_id', business.id)
                    .eq('is_active', true)
                    .order('name');
                setProducts(prodData || []);
            }
        } catch (error) {
            console.error("Error loading POS:", error);
        } finally {
            setLoading(false);
        }
    };

    // Cart Logic
    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
            }
            return [...prev, { ...product, qty: 1 }];
        });
    };

    const updateQty = (id: number, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(0, item.qty + delta);
                return { ...item, qty: newQty };
            }
            return item;
        }).filter(item => item.qty > 0));
    };

    const totalAmount = cart.reduce((sum, item) => sum + (item.selling_price * item.qty), 0);
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

    // Filter Logic
    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());

            if (activeCategory === 'fav') {
                return matchSearch && p.is_favorite;
            }

            const matchCat = activeCategory === 'all' || p.category_id === activeCategory;
            return matchSearch && matchCat;
        });
    }, [products, search, activeCategory]);

    const filteredMembers = useMemo(() => {
        return members.filter(m =>
            m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
            m.phone.includes(memberSearch)
        );
    }, [members, memberSearch]);

    return (
        <div className="flex flex-col h-screen bg-slate-50 relative overflow-hidden">

            {/* 1. Header with Logo */}
            <div className="bg-white px-4 py-3 shadow-sm z-20 flex gap-3 items-center border-b border-slate-100">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl border border-emerald-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                    {logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                        <Store className="w-5 h-5 text-emerald-600" />
                    )}
                </div>
                {/* Search bar removed from here */}
            </div>

            {/* Title in Body */}
            <div className="px-4 pt-4 space-y-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">Menu Kasir</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Transaksi Penjualan</p>
                </div>

                {/* Search Bar moved here */}
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cari produk..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm font-medium shadow-sm"
                    />
                </div>
            </div>

            {/* 2. Category Filter Button & Dropdown */}
            <div className="bg-white px-4 pb-3 border-b border-slate-100 relative">
                <button
                    onClick={() => setShowCategoryModal(!showCategoryModal)}
                    className="w-full bg-slate-50 border border-slate-200 py-2.5 px-4 rounded-xl flex items-center justify-between shadow-sm active:scale-[0.99] transition-all"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <Filter className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Filter Kategori</p>
                            <p className="text-sm font-extrabold text-slate-700 leading-none">{getActiveCategoryLabel()}</p>
                        </div>
                    </div>
                    <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", showCategoryModal && "rotate-180")} />
                </button>

                {/* Dropdown Menu */}
                {showCategoryModal && (
                    <>
                        <div className="fixed inset-0 z-[115]" onClick={() => setShowCategoryModal(false)} />
                        <div className="absolute left-4 right-4 top-[calc(100%+4px)] bg-white rounded-2xl border border-slate-200 shadow-xl z-[120] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="p-2 grid grid-cols-1 gap-1">
                                <button
                                    onClick={() => { setActiveCategory('all'); setShowCategoryModal(false); }}
                                    className={cn(
                                        "w-full p-3 rounded-xl flex items-center gap-3 transition-all",
                                        activeCategory === 'all' ? "bg-slate-800 text-white" : "hover:bg-slate-50 text-slate-600"
                                    )}
                                >
                                    <ShoppingCart className="w-4 h-4" />
                                    <span className="font-bold text-sm">Semua Produk</span>
                                </button>

                                <button
                                    onClick={() => { setActiveCategory('fav'); setShowCategoryModal(false); }}
                                    className={cn(
                                        "w-full p-3 rounded-xl flex items-center gap-3 transition-all",
                                        activeCategory === 'fav' ? "bg-amber-500 text-white" : "hover:bg-slate-50 text-slate-600"
                                    )}
                                >
                                    <Star className="w-4 h-4" />
                                    <span className="font-bold text-sm">Produk Favorit</span>
                                </button>

                                <div className="h-px bg-slate-100 my-1 mx-2" />

                                <div className="max-h-[300px] overflow-y-auto p-1 pt-0">
                                    {categories.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => { setActiveCategory(cat.id); setShowCategoryModal(false); }}
                                            className={cn(
                                                "w-full p-3 rounded-xl flex items-center gap-3 transition-all",
                                                activeCategory === cat.id ? "bg-emerald-500 text-white" : "hover:bg-slate-50 text-slate-600"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-2 h-2 rounded-full",
                                                activeCategory === cat.id ? "bg-white" : "bg-emerald-400"
                                            )} />
                                            <span className="font-bold text-sm">{cat.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* 3. Product Grid */}
            <div className="flex-1 overflow-y-auto p-4 pb-52">
                {loading ? (
                    <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
                ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-2">
                        {filteredProducts.map(product => {
                            const inCart = cart.find(c => c.id === product.id);
                            return (
                                <div
                                    key={product.id}
                                    onClick={() => addToCart(product)}
                                    className={cn(
                                        "bg-white p-2 rounded-xl border shadow-sm flex flex-col gap-1.5 cursor-pointer transition-all active:scale-95 relative overflow-hidden",
                                        inCart ? "border-emerald-500 ring-1 ring-emerald-500" : "border-slate-100 hover:border-emerald-200"
                                    )}
                                >
                                    <div className="aspect-square bg-slate-50 rounded-lg flex items-center justify-center overflow-hidden relative">
                                        {product.image_url ? (
                                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-xl">📦</span>
                                        )}
                                        {inCart && (
                                            <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center">
                                                <div className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                                                    {inCart.qty}x
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col flex-1 min-h-0">
                                        <h3 className="font-bold text-slate-800 text-[10px] line-clamp-2 leading-tight min-h-[2.4em]">{product.name}</h3>
                                        <p className="text-emerald-600 font-extrabold text-[10px] mt-auto">
                                            {product.selling_price >= 1000 ? `${(product.selling_price / 1000).toFixed(0)}k` : product.selling_price}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* 4. Bottom Cart Summary - Adjusted to strictly sit above bottom nav (approx 80-90px) */}
            <div className="fixed bottom-[90px] left-0 right-0 bg-white border-t border-slate-100 p-4 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <div className="max-w-md mx-auto flex items-center gap-4">
                    <div className="flex-1">
                        <p className="text-slate-500 text-xs font-medium">Total ({totalItems} item)</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-emerald-600 font-bold text-lg">Rp</span>
                            <span className="text-slate-800 font-extrabold text-2xl">{totalAmount.toLocaleString('id-ID')}</span>
                        </div>
                    </div>
                    <button
                        disabled={cart.length === 0}
                        onClick={() => setShowCart(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                    >
                        <ShoppingCart className="w-5 h-5" />
                        Bayar
                    </button>
                </div>
            </div>

            {/* 5. Cart Drawer / Modal */}
            {showCart && (
                <div className="fixed inset-0 z-[100] flex flex-col bg-slate-50 animate-in slide-in-from-bottom duration-300">
                    {/* Drawer Header with Logo */}
                    <div className="bg-white px-3 py-1.5 border-b border-slate-100 flex items-center justify-between shadow-sm">
                        <div className="w-8 h-8 bg-emerald-50 rounded-xl border border-emerald-100 overflow-hidden flex items-center justify-center">
                            {logoUrl ? (
                                <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                                <Store className="w-4 h-4 text-emerald-600" />
                            )}
                        </div>
                    </div>

                    <div className="px-4 py-2 bg-white flex items-center justify-between border-b border-slate-50">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                                <ShoppingCart className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div>
                                <h2 className="font-extrabold text-slate-900 text-base leading-tight uppercase tracking-tight">Keranjang</h2>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">Daftar Belanjaan</p>
                            </div>
                        </div>
                        <button onClick={() => setShowCart(false)} className="p-1.5 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>

                    {/* Member Selection in Cart */}
                    <div className="px-4 py-1.5 bg-slate-50 border-b border-slate-100">
                        <button
                            onClick={() => setShowMemberModal(true)}
                            className="w-full bg-white p-2 rounded-xl border border-dashed border-slate-300 flex items-center justify-between hover:bg-emerald-50 hover:border-emerald-300 transition-all"
                        >
                            <div className="flex items-center gap-2.5">
                                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", selectedMember ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400")}>
                                    <User className="w-4 h-4" />
                                </div>
                                <div className="text-left">
                                    <p className="text-[9px] font-bold text-slate-400 leading-tight">Member</p>
                                    <p className={cn("font-bold text-[13px] leading-tight", selectedMember ? "text-slate-800" : "text-slate-500")}>
                                        {selectedMember ? `${selectedMember.name}` : 'Pilih Pelanggan'}
                                    </p>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                        </button>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {cart.length === 0 ? (
                            <div className="text-center py-20 text-slate-400">Keranjang Kosong</div>
                        ) : (
                            cart.map(item => (
                                <div key={item.id} className="bg-white p-2.5 rounded-xl border border-slate-100 flex items-center gap-3 shadow-sm">
                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-800 text-sm leading-tight">{item.name}</h4>
                                        <p className="text-emerald-600 font-bold text-[13px]">
                                            Rp {(item.selling_price * item.qty).toLocaleString('id-ID')}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-100">
                                        <button
                                            onClick={() => updateQty(item.id, -1)}
                                            className="w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm border border-slate-200 text-slate-600 active:scale-90"
                                        >
                                            <Minus className="w-3.5 h-3.5" />
                                        </button>
                                        <span className="text-xs font-bold min-w-[16px] text-center">{item.qty}</span>
                                        <button
                                            onClick={() => updateQty(item.id, 1)}
                                            className="w-7 h-7 flex items-center justify-center bg-emerald-500 rounded-md shadow-sm border border-emerald-600 text-white active:scale-90"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Checkout Footer - Lifted for Nav Bar visibility */}
                    <div className="bg-white px-4 pt-3 pb-24 border-t border-slate-200">
                        <div className="flex justify-between items-center mb-2.5">
                            <span className="text-slate-500 font-bold text-xs uppercase tracking-tight">Total Tagihan</span>
                            <span className="text-xl font-extrabold text-slate-900">Rp {totalAmount.toLocaleString('id-ID')}</span>
                        </div>
                        <button
                            disabled={cart.length === 0}
                            onClick={() => navigate('/dashboard/pos/payment', { state: { cart, totalAmount, member: selectedMember } })}
                            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold text-base shadow-lg hover:bg-emerald-700 active:scale-95 transition-all flex justify-between px-5 items-center"
                        >
                            <span>Lanjut Pembayaran</span>
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Member Modal */}
            {showMemberModal && (
                <div className="fixed inset-0 z-[110] bg-black/50 flex items-center justify-center p-6">
                    <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl h-[70vh] flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">Pilih Pelanggan</h3>
                            <button onClick={() => setShowMemberModal(false)}>
                                <X className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>

                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                            <input
                                placeholder="Cari member..."
                                value={memberSearch}
                                onChange={(e) => setMemberSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 bg-slate-50"
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2">
                            <button
                                onClick={() => { setSelectedMember(null); setShowMemberModal(false); setMemberSearch(''); }}
                                className="w-full text-left p-3 rounded-xl hover:bg-slate-50 flex items-center gap-3 border border-transparent hover:border-slate-200"
                            >
                                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center"><User className="w-5 h-5 text-slate-500" /></div>
                                <span className="font-bold text-slate-600">Umum (Bukan Member)</span>
                            </button>
                            {filteredMembers.map(m => (
                                <button
                                    key={m.id}
                                    onClick={() => { setSelectedMember(m); setShowMemberModal(false); setMemberSearch(''); }}
                                    className="w-full text-left p-3 rounded-xl hover:bg-emerald-50 flex items-center gap-3 border border-transparent hover:border-emerald-200"
                                >
                                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                        {m.member_level === 'gold' ? <Crown className="w-5 h-5 text-amber-500" /> : <User className="w-5 h-5 text-emerald-600" />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800">{m.name}</p>
                                        <p className="text-xs text-emerald-600 font-bold uppercase">{m.member_level}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
