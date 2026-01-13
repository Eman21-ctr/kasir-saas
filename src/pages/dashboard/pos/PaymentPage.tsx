import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { ArrowLeft, Banknote, CreditCard, Check, Printer, Home, Loader2, Share2, ScanBarcode, User, Store } from 'lucide-react';
import { cn } from '../../../lib/utils';

type CartItem = {
    id: number;
    name: string;
    qty: number;
    selling_price: number;
    purchase_price: number;
};

export default function PaymentPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { cart, totalAmount, member } = location.state || { cart: [], totalAmount: 0, member: null };
    const [logoUrl, setLogoUrl] = useState('');

    // Dynamic Loyalty Settings
    const [loyaltyConfig, setLoyaltyConfig] = useState({
        pointValue: 10000,
        discSilver: 5,
        discGold: 10,
        discPlatinum: 15
    });

    useEffect(() => {
        if (!cart || cart.length === 0) {
            navigate('/dashboard/pos');
            return;
        }
        fetchLoyaltyConfig();
    }, [cart, navigate]);

    const fetchLoyaltyConfig = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data: business } = await supabase
                .from('businesses')
                .select('logo_url, point_value_requirement, discount_silver_percent, discount_gold_percent, discount_platinum_percent')
                .eq('user_id', user.id)
                .single();

            if (business) {
                setLogoUrl(business.logo_url || '');
                setLoyaltyConfig({
                    pointValue: business.point_value_requirement || 10000,
                    discSilver: Number(business.discount_silver_percent) || 0,
                    discGold: Number(business.discount_gold_percent) || 0,
                    discPlatinum: Number(business.discount_platinum_percent) || 0,
                });
            }
        } catch (e) {
            console.error("Error fetching loyalty config:", e);
        }
    };

    // Calculate Discount & Points using dynamic config
    const getDiscountPercent = () => {
        if (!member) return 0;
        if (member.member_level === 'platinum') return loyaltyConfig.discPlatinum / 100;
        if (member.member_level === 'gold') return loyaltyConfig.discGold / 100;
        if (member.member_level === 'silver') return loyaltyConfig.discSilver / 100;
        return 0;
    };

    const discountPercent = getDiscountPercent();
    const discountAmount = totalAmount * discountPercent;
    const finalTotal = totalAmount - discountAmount;
    const pointsEarned = Math.floor(finalTotal / (loyaltyConfig.pointValue || 10000));

    const [cashReceived, setCashReceived] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qris' | 'transfer'>('cash');
    const [processing, setProcessing] = useState(false);
    const [successData, setSuccessData] = useState<any>(null);

    useEffect(() => {
        if (!cart || cart.length === 0) {
            navigate('/dashboard/pos');
        }
    }, [cart, navigate]);

    const numericCash = parseFloat(cashReceived.replace(/[^0-9]/g, '')) || 0;
    const change = paymentMethod === 'cash' ? (numericCash - finalTotal) : 0;
    const canPay = paymentMethod === 'cash' ? numericCash >= finalTotal : true;

    const handleProcessPayment = async () => {
        if (!canPay) return;
        setProcessing(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No User");

            // 1. Get Business ID
            const { data: business } = await supabase
                .from('businesses')
                .select('id, business_name, address, phone, logo_url')
                .eq('user_id', user.id)
                .single();
            if (!business) throw new Error("No Business");

            // 2. Insert Transaction Header
            const { data: trx, error: trxError } = await supabase
                .from('transactions')
                .insert({
                    business_id: business.id,
                    member_id: member?.id || null, // Link to member
                    payment_method: paymentMethod,
                    payment_status: 'paid',

                    subtotal: totalAmount,
                    discount_amount: discountAmount,
                    discount_percentage: discountPercent * 100,
                    total_amount: finalTotal,

                    cash_received: paymentMethod === 'cash' ? numericCash : finalTotal,
                    cash_change: paymentMethod === 'cash' ? change : 0,

                    points_earned: pointsEarned,
                    created_by: user.id
                })
                .select()
                .single();

            if (trxError) throw trxError;

            // 3. Insert Transaction Items
            const itemsPayload = cart.map((item: CartItem) => ({
                transaction_id: trx.id,
                product_id: item.id,
                product_name: item.name,
                quantity: item.qty,
                unit: 'pcs',
                purchase_price: item.purchase_price || 0,
                selling_price: item.selling_price,
                subtotal: item.qty * item.selling_price,
                // Basic HPP/Profit Calc
                hpp_total: item.qty * (item.purchase_price || 0),
                profit: (item.selling_price - (item.purchase_price || 0)) * item.qty
            }));

            const { error: itemsError } = await supabase.from('transaction_items').insert(itemsPayload);
            if (itemsError) throw itemsError;

            // Success!
            setSuccessData({
                trxId: trx.id,
                trxNo: trx.transaction_number,
                change: change,
                total: finalTotal,
                points: pointsEarned,
                business: business
            });

        } catch (error: any) {
            alert("Gagal memproses transaksi: " + error.message);
        } finally {
            setProcessing(false);
        }
    };

    // Success View
    if (successData) {
        return (
            <div className="h-screen bg-emerald-500 flex flex-col items-center justify-center p-6 text-center animate-in zoom-in duration-300">
                <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm">
                    <div className="mb-6 flex flex-col items-center">
                        {successData.business?.logo_url ? (
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden mb-3">
                                <img src={successData.business.logo_url} alt="Logo" className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                                <Check className="w-10 h-10 text-emerald-600" strokeWidth={3} />
                            </div>
                        )}
                        <h3 className="font-bold text-slate-700">{successData.business?.business_name}</h3>
                    </div>

                    <h2 className="text-2xl font-bold text-slate-800 mb-1">Pembayaran Sukses!</h2>
                    <p className="text-slate-400 text-sm mb-2">No. Ref: {successData.trxNo}</p>
                    {successData.points > 0 && (
                        <div className="mb-6 bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-xs font-bold inline-block">
                            + {successData.points} Poin Loyalitas
                        </div>
                    )}

                    <div className="bg-slate-50 rounded-xl p-4 mb-6 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Total Bayar</span>
                            <span className="font-bold text-slate-800">Rp {successData.total.toLocaleString()}</span>
                        </div>
                        {paymentMethod === 'cash' && (
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Tunai</span>
                                <span className="font-bold text-slate-800">Rp {numericCash.toLocaleString()}</span>
                            </div>
                        )}
                        <div className="border-t border-slate-200 pt-2 flex justify-between text-lg">
                            <span className="font-bold text-emerald-600">Kembalian</span>
                            <span className="font-extrabold text-emerald-600">Rp {successData.change.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button className="w-full bg-emerald-500 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
                            <Printer className="w-5 h-5" />
                            Cetak Struk
                        </button>
                        <button className="w-full bg-white border border-slate-200 text-slate-700 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
                            <Share2 className="w-5 h-5" />
                            Kirim WhatsApp
                        </button>
                        <button
                            onClick={() => navigate('/dashboard/pos')}
                            className="w-full bg-emerald-50 text-emerald-600 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-100 transition-all mt-4"
                        >
                            <Home className="w-5 h-5" />
                            Transaksi Baru
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Payment Form View
    return (
        <div className="bg-slate-50">
            {/* Header with Logo */}
            <div className="bg-white sticky top-0 z-20 px-6 py-2 border-b border-slate-100 shadow-sm">
                <div className="w-9 h-9 bg-emerald-50 rounded-xl border border-emerald-100 overflow-hidden flex items-center justify-center">
                    {logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                        <Store className="w-5 h-5 text-emerald-600" />
                    )}
                </div>
            </div>

            <div className="p-3 max-w-md mx-auto w-full space-y-2 pt-1.5">
                <div className="flex items-center gap-2 mb-1">
                    <button onClick={() => navigate(-1)} className="p-1 -ml-1 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </button>
                    <h1 className="text-xl font-extrabold text-slate-900 leading-tight">Pembayaran</h1>
                </div>

                {/* Total Card */}
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-3 text-white text-center shadow-lg shadow-emerald-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                        <Banknote className="w-12 h-12" />
                    </div>
                    <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest mb-0.5 relative z-10">Total Tagihan</p>
                    <h2 className="text-2xl font-extrabold relative z-10">Rp {finalTotal.toLocaleString('id-ID')}</h2>
                    {discountAmount > 0 && (
                        <div className="mt-2 bg-white/20 rounded-lg p-1.5 text-[10px] font-medium flex justify-between items-center relative z-10">
                            <span>Subtotal: Rp {totalAmount.toLocaleString('id-ID')}</span>
                            <span className="bg-white text-emerald-600 px-1 py-0.5 rounded font-bold">Hemat {discountAmount.toLocaleString('id-ID')}</span>
                        </div>
                    )}
                    {member && (
                        <div className="mt-1.5 text-[9px] text-emerald-100 font-medium flex items-center justify-center gap-1 relative z-10">
                            <User className="w-2.5 h-2.5" /> Member: {member.name} ({member.member_level})
                        </div>
                    )}
                </div>

                {/* Methods */}
                <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 block ml-1">Metode</label>
                    <div className="grid grid-cols-3 gap-1.5">
                        {[
                            { id: 'cash', label: 'Tunai', icon: Banknote },
                            { id: 'qris', label: 'QRIS', icon: ScanBarcode },
                            { id: 'transfer', label: 'Transfer', icon: CreditCard },
                        ].map((m) => (
                            <button
                                key={m.id}
                                //@ts-ignore
                                onClick={() => setPaymentMethod(m.id)}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-1 p-1.5 rounded-xl border transition-all",
                                    paymentMethod === m.id
                                        ? "bg-emerald-50 border-emerald-500 text-emerald-700 ring-1 ring-emerald-500"
                                        : "bg-white border-slate-200 text-slate-500 hover:border-emerald-300"
                                )}
                            >
                                <m.icon className="w-4 h-4" />
                                <span className="text-[10px] font-bold">{m.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Cash Input */}
                {paymentMethod === 'cash' && (
                    <div className="space-y-2 animate-in slide-in-from-top-2">
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Uang Diterima</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-slate-400 font-bold text-xs">Rp</span>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    autoFocus
                                    value={cashReceived}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/[^0-9]/g, '');
                                        setCashReceived(Number(val).toLocaleString('id-ID'));
                                    }}
                                    placeholder="0"
                                    className="w-full pl-8 pr-4 py-1.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-bold text-base text-slate-800"
                                />
                            </div>
                        </div>

                        {/* Quick Amounts */}
                        <div className="grid grid-cols-3 gap-1.5">
                            {[finalTotal, 50000, 100000].map((amt) => {
                                if (amt < finalTotal && amt !== finalTotal) return null;
                                return (
                                    <button
                                        key={amt}
                                        onClick={() => setCashReceived(amt.toLocaleString('id-ID'))}
                                        className="py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-[9px] font-extrabold text-slate-600 transition-colors uppercase tracking-wider"
                                    >
                                        {amt === finalTotal ? 'Pas' : `Rp ${(amt / 1000)}k`}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Change Display */}
                        <div className="bg-slate-100/50 border border-slate-200 rounded-xl p-2.5 flex justify-between items-center">
                            <span className="font-bold text-slate-500 text-xs">Kembalian</span>
                            <span className={cn("font-extrabold text-base", change < 0 ? "text-red-500" : "text-emerald-600")}>
                                {change < 0 ? '-' : `Rp ${change.toLocaleString('id-ID')}`}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Action */}
            <div className="px-3 pb-8 bg-white border-t border-slate-100">
                <button
                    onClick={handleProcessPayment}
                    disabled={!canPay || processing}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                    {processing ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Memproses...
                        </>
                    ) : (
                        <>
                            <Check className="w-4 h-4" />
                            Selesaikan Pembayaran
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

