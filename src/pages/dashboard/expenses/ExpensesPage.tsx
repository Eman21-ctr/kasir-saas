import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Receipt, Save, Loader2, Trash2, X, Store } from 'lucide-react';
import { cn } from '../../../lib/utils';

type Expense = {
    id: number;
    name: string;
    amount: number;
    notes: string;
    expense_date: string;
};

const EXPENSE_CATEGORIES = [
    { id: 'rent', name: 'Sewa Tempat', icon: '🏠' },
    { id: 'electricity', name: 'Listrik', icon: '⚡' },
    { id: 'water', name: 'Air PDAM', icon: '💧' },
    { id: 'salary', name: 'Gaji Karyawan', icon: '👤' },
    { id: 'transport', name: 'Transportasi', icon: '🚗' },
    { id: 'supplies', name: 'Perlengkapan', icon: '📦' },
    { id: 'other', name: 'Lainnya', icon: '📋' },
];

export default function ExpensesPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [logoUrl, setLogoUrl] = useState('');

    // Form
    const [formCategory, setFormCategory] = useState('');
    const [formAmount, setFormAmount] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
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

            const { data } = await supabase
                .from('expenses')
                .select('*')
                .eq('business_id', business.id)
                .order('expense_date', { ascending: false })
                .limit(50);

            setExpenses(data || []);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formCategory || !formAmount) return;
        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: business } = await supabase.from('businesses').select('id').eq('user_id', user.id).single();
            if (!business) return;

            const categoryData = EXPENSE_CATEGORIES.find(c => c.id === formCategory);

            await supabase.from('expenses').insert({
                business_id: business.id,
                name: categoryData?.name || formCategory || 'Lainnya',
                amount: parseFloat(formAmount),
                notes: formDescription,
                expense_date: formDate
            });

            setShowModal(false);
            setFormCategory('');
            setFormAmount('');
            setFormDescription('');
            setFormDate(new Date().toISOString().split('T')[0]);
            fetchData();
        } catch (error: any) {
            alert("Gagal: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Hapus pengeluaran ini?')) return;
        try {
            await supabase.from('expenses').delete().eq('id', id);
            fetchData();
        } catch (error: any) {
            alert("Gagal: " + error.message);
        }
    };

    const totalThisMonth = expenses.reduce((sum, e) => sum + e.amount, 0);

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
                            <h1 className="text-2xl font-extrabold text-slate-900">Catatan Pengeluaran</h1>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Manajemen Biaya Operasional</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-red-500 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-red-500/20 active:scale-95 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Catat
                    </button>
                </div>

                {/* Total Card */}
                <div className="bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl p-5 text-white shadow-lg">
                    <p className="text-red-100 text-sm font-medium">Total Bulan Ini</p>
                    <h2 className="text-3xl font-extrabold">Rp {totalThisMonth.toLocaleString()}</h2>
                </div>

                {/* List */}
                <div className="space-y-3">
                    {loading ? (
                        <div className="text-center py-10 text-slate-400">Memuat...</div>
                    ) : expenses.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
                            <Receipt className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-400 font-medium">Belum ada catatan pengeluaran</p>
                            <button onClick={() => setShowModal(true)} className="text-red-500 font-bold text-sm mt-2">+ Tambah Pengeluaran</button>
                        </div>
                    ) : (
                        expenses.map((e) => (
                            <div
                                key={e.id}
                                className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4"
                            >
                                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-xl">
                                    {EXPENSE_CATEGORIES.find(c => c.name === e.name)?.icon || '📋'}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-800">{e.name}</h4>
                                    {e.notes && <p className="text-slate-400 text-xs">{e.notes}</p>}
                                    <p className="text-[10px] text-slate-400 mt-1">{new Date(e.expense_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-red-500">-Rp {e.amount.toLocaleString()}</p>
                                    <button onClick={() => handleDelete(e.id)} className="text-slate-300 hover:text-red-500 mt-1">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
                    <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-bold text-lg">Catat Pengeluaran</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Category Selection */}
                            <div>
                                <label className="text-sm font-bold text-slate-700">Kategori *</label>
                                <div className="grid grid-cols-4 gap-2 mt-2">
                                    {EXPENSE_CATEGORIES.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setFormCategory(cat.id)}
                                            className={cn(
                                                "p-3 rounded-xl border-2 text-center transition-all",
                                                formCategory === cat.id
                                                    ? "border-red-500 bg-red-50"
                                                    : "border-slate-100 hover:border-slate-300"
                                            )}
                                        >
                                            <span className="text-2xl">{cat.icon}</span>
                                            <p className="text-[10px] font-bold text-slate-600 mt-1 truncate">{cat.name}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Amount */}
                            <div>
                                <label className="text-sm font-bold text-slate-700">Nominal *</label>
                                <div className="relative mt-1">
                                    <span className="absolute left-4 top-3.5 text-slate-400 font-bold">Rp</span>
                                    <input
                                        type="number"
                                        value={formAmount}
                                        onChange={(e) => setFormAmount(e.target.value)}
                                        placeholder="0"
                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 focus:border-red-500 outline-none font-bold text-slate-700"
                                    />
                                </div>
                            </div>

                            {/* Date */}
                            <div>
                                <label className="text-sm font-bold text-slate-700">Tanggal</label>
                                <input
                                    type="date"
                                    value={formDate}
                                    onChange={(e) => setFormDate(e.target.value)}
                                    className="w-full mt-1 p-3.5 rounded-xl border border-slate-200 focus:border-red-500 outline-none font-medium text-slate-700"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="text-sm font-bold text-slate-700">Keterangan (Opsional)</label>
                                <input
                                    type="text"
                                    value={formDescription}
                                    onChange={(e) => setFormDescription(e.target.value)}
                                    placeholder="Contoh: Bayar listrik bulan Januari"
                                    className="w-full mt-1 p-3.5 rounded-xl border border-slate-200 focus:border-red-500 outline-none font-medium text-slate-700"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={saving || !formCategory || !formAmount}
                            className="w-full mt-6 bg-red-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                            Simpan Pengeluaran
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
