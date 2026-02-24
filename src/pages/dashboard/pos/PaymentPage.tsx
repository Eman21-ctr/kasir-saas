import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { ArrowLeft, Banknote, CreditCard, Check, Printer, Home, Loader2, Share2, ScanBarcode, User, Store, Sparkles } from 'lucide-react';
import { cn } from '../../../lib/utils';
import PrintReceipt from '../../../components/PrintReceipt';

type CartItem = {
    id: number;
    name: string;
    qty: number;
    selling_price: number;
    purchase_price: number;
    unit: string;
};

export default function PaymentPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { cart, totalAmount, member } = location.state || { cart: [], totalAmount: 0, member: null };
    const [logoUrl, setLogoUrl] = useState('');

    // Dynamic Loyalty Settings
    const [loyaltyConfig, setLoyaltyConfig] = useState({
        isLoyaltyEnabled: false,
        pointValue: 10000,
        pointsEarned: 1,
        pointCashValue: 0
    });
    const [usePoints, setUsePoints] = useState(false);

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
                .select('logo_url, is_loyalty_enabled, point_value_requirement, loyalty_points_earned, loyalty_point_value_idr')
                .eq('user_id', user.id)
                .single();

            if (business) {
                setLogoUrl(business.logo_url || '');
                setLoyaltyConfig({
                    isLoyaltyEnabled: business.is_loyalty_enabled || false,
                    pointValue: business.point_value_requirement || 10000,
                    pointsEarned: business.loyalty_points_earned || 1,
                    pointCashValue: Number(business.loyalty_point_value_idr) || 0
                });
            }
        } catch (e) {
            console.error("Error fetching loyalty config:", e);
        }
    };

    // Updated calculation: Use Points instead of Tier Discount
    const maxRedemptionValue = (member?.points || 0) * loyaltyConfig.pointCashValue;
    const redemptionValue = usePoints ? Math.min(maxRedemptionValue, totalAmount) : 0;
    const finalTotal = totalAmount - redemptionValue;

    // Calculate how many points were actually used to get this redemption value
    const actualPointsUsed = loyaltyConfig.pointCashValue > 0
        ? Math.ceil(redemptionValue / loyaltyConfig.pointCashValue)
        : 0;

    const pointsEarned = loyaltyConfig.isLoyaltyEnabled
        ? Math.floor(finalTotal / (loyaltyConfig.pointValue || 10000)) * (loyaltyConfig.pointsEarned || 1)
        : 0;

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
                    discount_amount: redemptionValue,
                    discount_percentage: totalAmount > 0 ? (redemptionValue / totalAmount) * 100 : 0,
                    total_amount: finalTotal,

                    cash_received: paymentMethod === 'cash' ? numericCash : finalTotal,
                    cash_change: paymentMethod === 'cash' ? change : 0,

                    points_earned: pointsEarned,
                    points_used: actualPointsUsed,
                    created_by: user.id
                })
                .select()
                .single();

            if (trxError) throw trxError;

            // 3. Insert Transaction Items
            // 3. Insert Transaction Items with Proportional Discount
            const itemsPayload = cart.map((item: CartItem) => {
                const itemSubtotal = item.qty * item.selling_price;
                const itemProportionalDiscount = totalAmount > 0
                    ? (itemSubtotal / totalAmount) * redemptionValue
                    : 0;

                const discountedSubtotal = itemSubtotal - itemProportionalDiscount;
                const discountedPrice = item.qty > 0 ? discountedSubtotal / item.qty : item.selling_price;
                const hppTotal = item.qty * (item.purchase_price || 0);

                return {
                    transaction_id: trx.id,
                    product_id: item.id,
                    product_name: item.name,
                    quantity: item.qty,
                    unit: item.unit || 'pcs',
                    purchase_price: item.purchase_price || 0,
                    selling_price: discountedPrice,
                    subtotal: discountedSubtotal,
                    hpp_total: hppTotal,
                    profit: discountedSubtotal - hppTotal
                };
            });

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

    const handlePrint = () => {
        window.print();
    };

    const handleWhatsApp = () => {
        if (!successData) return;
        const businessName = successData.business?.business_name || 'Toko';
        const trxNo = successData.trxNo;
        const total = successData.total.toLocaleString('id-ID');

        const message = `*Struk Pembayaran ${businessName}*\n\n` +
            `No. Ref: ${trxNo}\n` +
            `Total: Rp ${total}\n\n` +
            `Terima kasih telah berbelanja!`;

        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
    };

    // Success View
    if (successData) {
        return (
            <div className="min-h-screen bg-emerald-500 flex flex-col items-center justify-center p-6 text-center animate-in zoom-in duration-300 print:bg-white print:p-0">
                {/* Print Only Receipt */}
                <div className="hidden print:block">
                    <PrintReceipt
                        shopName={successData.business?.business_name}
                        shopAddress={successData.business?.address}
                        shopPhone={successData.business?.phone}
                        transactionNumber={successData.trxNo}
                        transactionDate={new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        items={cart.map((item: any) => ({
                            name: item.name,
                            qty: item.qty,
                            price: item.selling_price,
                            subtotal: item.qty * item.selling_price
                        }))}
                        subtotal={totalAmount}
                        discount={redemptionValue}
                        total={successData.total}
                        cashReceived={paymentMethod === 'cash' ? numericCash : successData.total}
                        change={successData.change}
                        paymentMethod={paymentMethod}
                    />
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm print:hidden">
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
                        <button
                            onClick={handlePrint}
                            className="w-full bg-emerald-500 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                        >
                            <Printer className="w-5 h-5" />
                            Cetak Struk
                        </button>
                        <button
                            onClick={handleWhatsApp}
                            className="w-full bg-white border border-slate-200 text-slate-700 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
                        >
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
                    {redemptionValue > 0 && (
                        <div className="mt-2 bg-white/20 rounded-lg p-1.5 text-[10px] font-medium flex justify-between items-center relative z-10">
                            <span>Subtotal: Rp {totalAmount.toLocaleString('id-ID')}</span>
                            <span className="bg-white text-emerald-600 px-1 py-0.5 rounded font-bold">Potong Poin -{redemptionValue.toLocaleString('id-ID')}</span>
                        </div>
                    )}
                    {member && (
                        <div className="mt-1.5 text-[9px] text-emerald-100 font-medium flex items-center justify-center gap-1 relative z-10">
                            <User className="w-2.5 h-2.5" /> Pelanggan: {member.name} ({member.points || 0} Poin)
                        </div>
                    )}
                </div>

                {/* Point Redemption Toggle */}
                {member && member.points > 0 && loyaltyConfig.pointCashValue > 0 && (
                    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-amber-500" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-700 text-xs">Gunakan {member.points} Poin?</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Senilai Rp {maxRedemptionValue.toLocaleString('id-ID')}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setUsePoints(!usePoints)}
                            className={cn(
                                "w-10 h-5 rounded-full transition-all relative",
                                usePoints ? "bg-emerald-500" : "bg-slate-200"
                            )}
                        >
                            <div className={cn(
                                "absolute top-1 w-3 h-3 bg-white rounded-full transition-all shadow-sm",
                                usePoints ? "right-1" : "left-1"
                            )} />
                        </button>
                    </div>
                )}

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

