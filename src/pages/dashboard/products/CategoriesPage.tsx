import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Pencil, Trash2, Loader2, FolderOpen, Save, X, Store } from 'lucide-react';

type Category = {
    id: number;
    name: string;
    is_active: boolean;
};

export default function CategoriesPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<Category[]>([]);
    const [businessId, setBusinessId] = useState<number | null>(null);
    const [logoUrl, setLogoUrl] = useState('');

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [categoryName, setCategoryName] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
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

            setBusinessId(business.id);
            setLogoUrl(business.logo_url || '');

            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .eq('business_id', business.id)
                .order('name');

            if (error) throw error;
            setCategories(data || []);
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = () => {
        setEditId(null);
        setCategoryName('');
        setShowModal(true);
    };

    const openEditModal = (cat: Category) => {
        setEditId(cat.id);
        setCategoryName(cat.name);
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!businessId || !categoryName.trim()) return;
        setSaving(true);
        try {
            if (editId) {
                await supabase.from('categories').update({ name: categoryName }).eq('id', editId);
            } else {
                await supabase.from('categories').insert({ business_id: businessId, name: categoryName, is_active: true });
            }
            setShowModal(false);
            fetchCategories();
        } catch (error: any) {
            alert("Gagal menyimpan: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Hapus kategori ini?")) return;
        try {
            await supabase.from('categories').delete().eq('id', id);
            fetchCategories();
        } catch (error: any) {
            alert("Gagal hapus: " + error.message);
        }
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
                            <h1 className="text-2xl font-extrabold text-slate-900">Kelola Kategori</h1>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Grup Produk & Barang</p>
                        </div>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Tambah
                    </button>
                </div>

                <div className="space-y-4">
                    {loading ? (
                        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-emerald-500 w-8 h-8" /></div>
                    ) : categories.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                            <FolderOpen className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-400 font-medium">Belum ada kategori</p>
                            <button onClick={openAddModal} className="text-emerald-600 font-bold text-sm mt-2">+ Tambah Kategori</button>
                        </div>
                    ) : (
                        categories.map((cat) => (
                            <div
                                key={cat.id}
                                className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4"
                            >
                                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                                    <FolderOpen className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-800">{cat.name}</h4>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => openEditModal(cat)} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(cat.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
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
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-bold text-lg">{editId ? 'Edit Kategori' : 'Tambah Kategori'}</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-400" /></button>
                        </div>

                        <input
                            type="text"
                            autoFocus
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                            placeholder="Nama Kategori"
                            className="w-full p-4 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none transition-all font-medium text-slate-800 mb-6"
                        />

                        <button
                            onClick={handleSave}
                            disabled={saving || !categoryName.trim()}
                            className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-all"
                        >
                            {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                            Simpan
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
