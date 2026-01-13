import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, Calendar, Save, Loader2, Package, TrendingUp, Store } from 'lucide-react';

export default function AddStockPage() {
    const navigate = useNavigate();
    const { productId } = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [logoUrl, setLogoUrl] = useState('');

    const [product, setProduct] = useState<any>(null);
    const [qty, setQty] = useState(1);
    const [purchasePrice, setPurchasePrice] = useState('');
    const [notes] = useState('');
    const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchProduct();
    }, [productId]);

    const fetchProduct = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', productId)
                .single();

            if (error) throw error;
            setProduct(data);
            setPurchasePrice(data.purchase_price.toString());

            // Fetch Logo
            const { data: business } = await supabase
                .from('businesses')
                .select('logo_url')
                .eq('id', data.business_id)
                .single();
            if (business) setLogoUrl(business.logo_url || '');

        } catch (error) {
            console.error("Error:", error);
            navigate(-1);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!product || qty <= 0) return;
        setSaving(true);
        try {
            const price = parseFloat(purchasePrice) || 0;
            const total = price * qty;

            // 1. Record stock movement
            await supabase.from('stock_movements').insert({
                business_id: product.business_id,
                product_id: product.id,
                movement_type: 'purchase',
                quantity: qty,
                unit: product.unit,
                purchase_price: price,
                total_cost: total,
                notes: notes || `Pembelian stok ${product.name}`,
                reference_date: purchaseDate,
                created_by: (await supabase.auth.getUser()).data.user?.id
            });

            // 2. Update product stock
            await supabase.from('products').update({
                stock_quantity: (product.stock_quantity || 0) + qty,
                purchase_price: price, // Update to latest purchase price
                updated_at: new Date().toISOString()
            }).eq('id', product.id);

            alert("Stok berhasil ditambahkan!");
            navigate(-1);
        } catch (error: any) {
            alert("Gagal: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center h-screen bg-slate-50"><Loader2 className="animate-spin text-emerald-500 w-10 h-10" /></div>;

    const numPrice = parseFloat(purchasePrice) || 0;
    const total = numPrice * qty;
    const priceDiff = numPrice - (product?.purchase_price || 0);

    return (
        <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-800">
            {/* Header with Logo Only */}
            <div className="bg-white sticky top-0 z-20 px-6 py-3 border-b border-slate-100 shadow-sm flex items-center justify-between">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-slate-500" />
                </button>
                <div className="w-10 h-10 bg-emerald-50 rounded-xl border border-emerald-100 overflow-hidden flex items-center justify-center">
                    {logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                        <Store className="w-5 h-5 text-emerald-600" />
                    )}
                </div>
            </div>

            <div className="p-6 pt-2 max-w-md mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-extrabold text-slate-900">Tambah Stok</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Restock Barang Dagangan</p>
                </div>

                {/* Product Summary Card */}
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center">
                        <Package className="w-7 h-7 text-emerald-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-base">{product?.name}</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Stok Saat Ini: <span className="text-emerald-600">{product?.stock_quantity} {product?.unit}</span></p>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Purchase Date */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tanggal Pembelian</label>
                        <div className="relative">
                            <Calendar className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                            <input
                                type="date"
                                value={purchaseDate}
                                onChange={(e) => setPurchaseDate(e.target.value)}
                                className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:border-emerald-500 outline-none font-bold text-slate-700 bg-white shadow-sm text-sm"
                            />
                        </div>
                    </div>

                    {/* Quantity Selector */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jumlah Beli</label>
                        <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                            <button
                                onClick={() => setQty(Math.max(1, qty - 1))}
                                className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-600 active:scale-90"
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <div className="text-center">
                                <input
                                    type="number"
                                    value={qty}
                                    onChange={(e) => setQty(parseInt(e.target.value) || 1)}
                                    className="text-2xl font-black text-slate-800 w-20 text-center outline-none bg-transparent"
                                />
                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none">{product?.unit}</p>
                            </div>
                            <button
                                onClick={() => setQty(qty + 1)}
                                className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white active:scale-90 shadow-md shadow-emerald-500/20"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Purchase Price */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Harga Beli Baru (Per {product?.unit})</label>
                        <div className="relative">
                            <span className="absolute left-4 top-3.5 text-slate-400 font-bold text-sm">Rp</span>
                            <input
                                type="number"
                                value={purchasePrice}
                                onChange={(e) => setPurchasePrice(e.target.value)}
                                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:border-emerald-500 outline-none font-black text-slate-700 bg-white shadow-sm text-sm"
                            />
                        </div>
                        {priceDiff !== 0 && (
                            <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-wider ${priceDiff > 0 ? 'text-rose-500' : 'text-emerald-500'} ml-1`}>
                                <TrendingUp className={`w-3 h-3 ${priceDiff < 0 ? 'rotate-180' : ''}`} />
                                {priceDiff > 0 ? 'Naik' : 'Turun'} Rp {Math.abs(priceDiff).toLocaleString()}
                            </div>
                        )}
                    </div>

                    {/* Total Belanja */}
                    <div className="bg-slate-900 rounded-2xl p-4 flex justify-between items-center text-white shadow-xl shadow-slate-900/10">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Tagihan</span>
                        <span className="text-lg font-black">Rp {total.toLocaleString('id-ID')}</span>
                    </div>

                    {/* Submit */}
                    <button
                        onClick={handleSave}
                        disabled={saving || qty <= 0}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4"
                    >
                        {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                        <span className="uppercase text-xs tracking-widest">Simpan Pembelian</span>
                    </button>

                    <p className="text-[10px] text-slate-400 text-center font-bold uppercase tracking-widest mt-2 px-10">
                        * Data stok & harga beli barang akan langsung terupdate otomatis.
                    </p>
                </div>
            </div>
        </div>
    );
}
