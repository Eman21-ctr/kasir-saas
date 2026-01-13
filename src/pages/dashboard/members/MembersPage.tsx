import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Plus, User, Phone, Star, Crown, Sparkles, ChevronRight, X, Save, Loader2, Store } from 'lucide-react';
import { cn } from '../../../lib/utils';

type Member = {
    id: number;
    name: string;
    phone: string;
    address: string | null;
    total_transactions: number;
    total_spent: number;
    total_points: number;
    member_level: 'baru' | 'silver' | 'gold' | 'platinum';
    created_at: string;
};

export default function MembersPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [members, setMembers] = useState<Member[]>([]);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);

    // Form
    const [formName, setFormName] = useState('');
    const [formPhone, setFormPhone] = useState('');
    const [formAddress, setFormAddress] = useState('');
    const [saving, setSaving] = useState(false);

    const [logoUrl, setLogoUrl] = useState('');

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: business } = await supabase
                .from('businesses')
                .select('id, logo_url')
                .eq('user_id', user.id)
                .single();
            if (!business) return;
            setLogoUrl(business.logo_url || '');

            const { data, error } = await supabase
                .from('members')
                .select('*')
                .eq('business_id', business.id)
                .order('name');

            if (error) throw error;
            setMembers(data || []);
        } catch (error) {
            console.error("Error fetching members:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveMember = async () => {
        if (!formName || !formPhone) return;
        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: business } = await supabase.from('businesses').select('id').eq('user_id', user.id).single();
            if (!business) return;

            await supabase.from('members').insert({
                business_id: business.id,
                name: formName,
                phone: formPhone,
                address: formAddress || null,
                total_points: 0,
                member_level: 'baru',
                join_date: new Date().toISOString().split('T')[0], // Required by schema
                total_transactions: 0,
                total_spending: 0,
                is_active: true
            });

            setShowModal(false);
            setFormName('');
            setFormPhone('');
            setFormAddress('');
            fetchMembers();
        } catch (error: any) {
            alert("Gagal simpan: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    const filtered = members.filter(m =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.phone.includes(search)
    );

    const getTierIcon = (tier: string) => {
        if (tier === 'gold') return <Crown className="w-4 h-4 text-amber-500" />;
        if (tier === 'silver') return <Star className="w-4 h-4 text-slate-400" />;
        return <Sparkles className="w-4 h-4 text-emerald-600" />; // Default/Baru
    };

    const getTierLabel = (tier: string) => {
        if (tier === 'gold') return 'Gold';
        if (tier === 'silver') return 'Silver';
        return 'Baru'; // Default
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-800">
            {/* Header with Logo */}
            <div className="bg-white sticky top-0 z-20 px-6 py-3 border-b border-slate-100 shadow-sm">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl border border-emerald-100 overflow-hidden flex items-center justify-center">
                    {logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                        <Store className="w-5 h-5 text-emerald-600" />
                    )}
                </div>
            </div>

            <div className="p-6 space-y-6 pt-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors">
                            <ArrowLeft className="w-6 h-6 text-slate-500" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-extrabold text-slate-900">Manajemen Member</h1>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Data Pelanggan Setia</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Tambah
                    </button>
                </div>
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cari nama atau no. HP..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none font-medium text-slate-700 bg-white shadow-sm"
                    />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white p-3 rounded-xl border border-slate-100 text-center">
                        <p className="text-2xl font-bold text-slate-800">{members.length}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Total</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-100 text-center">
                        <p className="text-2xl font-bold text-amber-500">{members.filter(m => m.member_level === 'gold').length}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Gold</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-100 text-center">
                        <p className="text-2xl font-bold text-slate-400">{members.filter(m => m.member_level === 'silver').length}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Silver</p>
                    </div>
                </div>

                {/* List */}
                <div className="space-y-3">
                    {loading ? (
                        <div className="text-center py-10 text-slate-400">Memuat...</div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
                            <User className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-400 font-medium">Belum ada member</p>
                            <button onClick={() => setShowModal(true)} className="text-emerald-600 font-bold text-sm mt-2">+ Tambah Member</button>
                        </div>
                    ) : (
                        filtered.map((m) => (
                            <div
                                key={m.id}
                                className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4"
                            >
                                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                                    <User className="w-6 h-6 text-emerald-600" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-800">{m.name}</h4>
                                    <p className="text-slate-400 text-sm flex items-center gap-1">
                                        <Phone className="w-3 h-3" /> {m.phone}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={cn(
                                            "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1",
                                            m.member_level === 'gold' ? "bg-amber-50 text-amber-600" :
                                                m.member_level === 'silver' ? "bg-slate-100 text-slate-500" :
                                                    "bg-emerald-50 text-emerald-600"
                                        )}>
                                            {getTierIcon(m.member_level)} {getTierLabel(m.member_level)}
                                        </span>
                                        <span className="text-[10px] text-slate-400">{m.total_transactions}x transaksi</span>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-300" />
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal Add Member */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
                    <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-bold text-lg">Tambah Member Baru</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-bold text-slate-700">Nama Lengkap *</label>
                                <input
                                    type="text"
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    placeholder="Contoh: Ibu Siti"
                                    className="w-full mt-1 p-3.5 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none font-medium"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-slate-700">No. HP / WhatsApp *</label>
                                <input
                                    type="tel"
                                    value={formPhone}
                                    onChange={(e) => setFormPhone(e.target.value)}
                                    placeholder="08123456789"
                                    className="w-full mt-1 p-3.5 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none font-medium"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-slate-700">Alamat (Opsional)</label>
                                <input
                                    type="text"
                                    value={formAddress}
                                    onChange={(e) => setFormAddress(e.target.value)}
                                    placeholder="Jl. Melati No. 15"
                                    className="w-full mt-1 p-3.5 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none font-medium"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSaveMember}
                            disabled={saving || !formName || !formPhone}
                            className="w-full mt-6 bg-emerald-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                            Simpan Member
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
