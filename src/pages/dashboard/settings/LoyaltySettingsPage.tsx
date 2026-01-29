import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Sparkles, Info, Store } from 'lucide-react';
import { cn } from '../../../lib/utils';

export default function LoyaltySettingsPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [logoUrl, setLogoUrl] = useState('');

    const [pointReq, setPointReq] = useState(10000);
    const [pointsEarned, setPointsEarned] = useState(1);
    const [pointValueIdr, setPointValueIdr] = useState(0);
    const [isLoyaltyEnabled, setIsLoyaltyEnabled] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: business, error } = await supabase
                .from('businesses')
                .select('logo_url, is_loyalty_enabled, point_value_requirement, loyalty_points_earned, loyalty_point_value_idr')
                .eq('user_id', user.id)
                .single();

            if (error) throw error;

            if (business) {
                setLogoUrl(business.logo_url || '');
                setIsLoyaltyEnabled(business.is_loyalty_enabled || false);
                setPointReq(business.point_value_requirement || 10000);
                setPointsEarned(business.loyalty_points_earned || 1);
                setPointValueIdr(Number(business.loyalty_point_value_idr) || 0);
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from('businesses')
                .update({
                    is_loyalty_enabled: isLoyaltyEnabled,
                    point_value_requirement: pointReq,
                    loyalty_points_earned: pointsEarned,
                    loyalty_point_value_idr: pointValueIdr
                })
                .eq('user_id', user.id);

            if (error) throw error;
            alert("Pengaturan diskon & poin berhasil disimpan!");
        } catch (error: any) {
            alert("Gagal menyimpan: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center min-h-screen bg-slate-50"><Loader2 className="animate-spin text-emerald-500" /></div>;

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-24 text-slate-800">
            {/* Header with Logo */}
            <div className="bg-white sticky top-0 z-20 px-6 py-3 border-b border-slate-100 shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/dashboard/settings')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-slate-500" />
                    </button>
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl border border-emerald-100 overflow-hidden flex items-center justify-center">
                        {logoUrl ? (
                            <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                            <Store className="w-5 h-5 text-emerald-600" />
                        )}
                    </div>
                </div>
            </div>

            <div className="p-6 max-w-md mx-auto space-y-6 pt-2">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900">Loyalty & Poin</h1>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Diskon & Promo Member</p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-all text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Simpan
                    </button>
                </div>

                {/* Info Box */}
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex gap-3">
                    <Info className="w-5 h-5 text-emerald-600 shrink-0" />
                    <p className="text-xs text-emerald-700 leading-relaxed">
                        Atur kebijakan loyalitas toko Anda. Jika dinyalakan, poin dihitung otomatis setiap transaksi, dan diskon akan diterapkan langsung jika member dipilih di Kasir.
                    </p>
                </div>

                {/* Master Switch */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <h4 className="font-bold text-slate-700 text-sm">Aktifkan Sistem Poin</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Master Loyalty Toggle</p>
                    </div>
                    <button
                        onClick={() => setIsLoyaltyEnabled(!isLoyaltyEnabled)}
                        className={cn(
                            "w-12 h-6 rounded-full transition-all relative",
                            isLoyaltyEnabled ? "bg-emerald-500" : "bg-slate-200"
                        )}
                    >
                        <div className={cn(
                            "absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                            isLoyaltyEnabled ? "right-1" : "left-1"
                        )} />
                    </button>
                </div>

                {isLoyaltyEnabled && (
                    <>
                        {/* Points Config */}
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="flex items-center gap-2 text-slate-800">
                                <Sparkles className="w-5 h-5 text-amber-500" />
                                <h3 className="font-bold text-sm">Aturan Poin Loyalitas</h3>
                            </div>

                            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Spending Threshold</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-3.5 text-slate-400 font-bold text-sm">Rp</span>
                                        <input
                                            type="number"
                                            value={pointReq}
                                            onChange={(e) => setPointReq(parseInt(e.target.value))}
                                            className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 font-bold text-slate-700 text-sm"
                                            placeholder="10000"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Poin yang Didapat</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={pointsEarned}
                                            onChange={(e) => setPointsEarned(parseInt(e.target.value))}
                                            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 font-bold text-slate-700 text-sm"
                                            placeholder="1"
                                        />
                                        <span className="absolute right-4 top-3.5 text-slate-400 font-bold text-sm">Poin</span>
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2 border-t border-slate-50">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nilai Tukar Poin (Cashback)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-3.5 text-slate-400 font-bold text-sm">1 Poin = Rp</span>
                                        <input
                                            type="number"
                                            value={pointValueIdr}
                                            onChange={(e) => setPointValueIdr(parseFloat(e.target.value))}
                                            className="w-full pl-[5.5rem] pr-4 py-3.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 font-bold text-slate-700 text-sm"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                <p className="text-[10px] text-slate-400 font-medium italic leading-relaxed">
                                    * Aturan saat ini: Belanja kelipatan Rp {pointReq?.toLocaleString('id-ID')} akan mendapatkan {pointsEarned} poin.
                                    {pointValueIdr > 0 && ` 1 Poin dapat ditukar dengan nilai Rp ${pointValueIdr.toLocaleString('id-ID')}.`}
                                </p>
                            </div>
                        </div>
                    </>
                )}

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                    {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                    Simpan Pengaturan
                </button>

            </div>
        </div>
    );
}
