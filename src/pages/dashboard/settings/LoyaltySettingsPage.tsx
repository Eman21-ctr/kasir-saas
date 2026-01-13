import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Sparkles, Trophy, Info, Percent, Store } from 'lucide-react';
import { cn } from '../../../lib/utils';

export default function LoyaltySettingsPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [logoUrl, setLogoUrl] = useState('');

    const [pointReq, setPointReq] = useState(10000);
    const [discSilver, setDiscSilver] = useState(5);
    const [discGold, setDiscGold] = useState(10);
    const [discPlatinum, setDiscPlatinum] = useState(15);

    // Auto-Tier Settings
    const [isAutoTier, setIsAutoTier] = useState(false);
    const [thresholdSilver, setThresholdSilver] = useState(50);
    const [thresholdGold, setThresholdGold] = useState(200);
    const [thresholdPlatinum, setThresholdPlatinum] = useState(500);

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
                .select('logo_url, point_value_requirement, discount_silver_percent, discount_gold_percent, discount_platinum_percent, is_auto_tier_enabled, tier_silver_threshold, tier_gold_threshold, tier_platinum_threshold')
                .eq('user_id', user.id)
                .single();

            if (error) throw error;

            if (business) {
                setLogoUrl(business.logo_url || '');
                setPointReq(business.point_value_requirement || 10000);
                setDiscSilver(business.discount_silver_percent || 5);
                setDiscGold(business.discount_gold_percent || 10);
                setDiscPlatinum(business.discount_platinum_percent || 15);

                setIsAutoTier(business.is_auto_tier_enabled || false);
                setThresholdSilver(business.tier_silver_threshold || 50);
                setThresholdGold(business.tier_gold_threshold || 200);
                setThresholdPlatinum(business.tier_platinum_threshold || 500);
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
                    point_value_requirement: pointReq,
                    discount_silver_percent: discSilver,
                    discount_gold_percent: discGold,
                    discount_platinum_percent: discPlatinum,
                    is_auto_tier_enabled: isAutoTier,
                    tier_silver_threshold: thresholdSilver,
                    tier_gold_threshold: thresholdGold,
                    tier_platinum_threshold: thresholdPlatinum
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
                        Atur kebijakan loyalitas toko Anda. Poin dihitung otomatis setiap transaksi, dan diskon akan diterapkan langsung jika member dipilih di Kasir.
                    </p>
                </div>

                {/* Points Config */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-800">
                        <Sparkles className="w-5 h-5 text-amber-500" />
                        <h3 className="font-bold text-sm">Aturan Poin Loyalitas</h3>
                    </div>

                    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tiap Belanja (Nominal)</label>
                        <div className="mt-2 relative">
                            <span className="absolute left-4 top-3.5 text-slate-400 font-bold">Rp</span>
                            <input
                                type="number"
                                value={pointReq}
                                onChange={(e) => setPointReq(parseInt(e.target.value))}
                                className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 font-bold text-slate-700"
                            />
                        </div>
                        <p className="mt-3 text-[10px] text-slate-400 font-medium italic">
                            * Contoh: Jika set Rp 10.000, maka belanja Rp 50.000 dapat 5 poin.
                        </p>
                    </div>
                </div>

                {/* Auto Tier Toggle */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <h4 className="font-bold text-slate-700 text-sm">Naik Tier Otomatis</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Auto-Upgrade Member</p>
                    </div>
                    <button
                        onClick={() => setIsAutoTier(!isAutoTier)}
                        className={cn(
                            "w-12 h-6 rounded-full transition-all relative",
                            isAutoTier ? "bg-emerald-500" : "bg-slate-200"
                        )}
                    >
                        <div className={cn(
                            "absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                            isAutoTier ? "right-1" : "left-1"
                        )} />
                    </button>
                </div>

                {isAutoTier && (
                    <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
                        <div className="flex items-center gap-2 text-slate-800">
                            <Trophy className="w-5 h-5 text-amber-500" />
                            <h3 className="font-bold text-sm">Threshold Poin Tier</h3>
                        </div>
                        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                            {[
                                { label: 'Silver Threshold', val: thresholdSilver, set: setThresholdSilver, icon: '🥈' },
                                { label: 'Gold Threshold', val: thresholdGold, set: setThresholdGold, icon: '🥇' },
                                { label: 'Platinum Threshold', val: thresholdPlatinum, set: setThresholdPlatinum, icon: '💎' },
                            ].map((t, i) => (
                                <div key={i} className="flex items-center justify-between gap-4">
                                    <span className="text-xs font-bold text-slate-600 flex items-center gap-2">
                                        <span className="text-lg">{t.icon}</span> {t.label}
                                    </span>
                                    <div className="flex items-center gap-2 w-24">
                                        <input
                                            type="number"
                                            value={t.val}
                                            onChange={(e) => t.set(parseInt(e.target.value))}
                                            className="w-full p-2 text-right rounded-lg border border-slate-200 outline-none focus:border-emerald-500 font-bold text-slate-700 text-xs"
                                        />
                                        <span className="text-[10px] font-bold text-slate-400">Poin</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="px-2">
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">
                                * Penjelasan: Jika diaktifkan, level member akan naik otomatis saat total poin mereka mencapai angka di atas.
                                Contoh: Member "Baru" yang poinnya jadi {thresholdSilver} akan otomatis jadi "Silver".
                            </p>
                        </div>
                    </div>
                )}

                {/* Discount Tier Config */}
                <div className="space-y-4 pt-2">
                    <div className="flex items-center gap-2 text-slate-800">
                        <Trophy className="w-5 h-5 text-emerald-600" />
                        <h3 className="font-bold text-sm">Persentase Diskon Member</h3>
                    </div>

                    <div className="grid gap-3">
                        {[
                            { label: 'Silver Member', val: discSilver, set: setDiscSilver, color: 'text-slate-400' },
                            { label: 'Gold Member', val: discGold, set: setDiscGold, color: 'text-amber-500' },
                            { label: 'Platinum Member', val: discPlatinum, set: setDiscPlatinum, color: 'text-emerald-600' },
                        ].map((tier, idx) => (
                            <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-slate-50", tier.color)}>
                                        <Percent className="w-5 h-5" />
                                    </div>
                                    <span className="font-bold text-slate-700 text-sm">{tier.label}</span>
                                </div>
                                <div className="flex items-center gap-2 w-24">
                                    <input
                                        type="number"
                                        value={tier.val}
                                        onChange={(e) => tier.set(parseFloat(e.target.value))}
                                        className="w-full p-2 text-right rounded-lg border border-slate-200 outline-none focus:border-emerald-500 font-bold text-slate-700"
                                    />
                                    <span className="font-bold text-slate-400">%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

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
