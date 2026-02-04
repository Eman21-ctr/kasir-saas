import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Plus, Users, Shield, Save, X, Loader2,
    Trash2, UserPlus, Phone, Lock, CheckCircle2, AlertCircle, Pencil
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { createClient } from '@supabase/supabase-js';

type StaffMember = {
    id: number;
    staff_name: string;
    user_id: string;
    is_active: boolean;
    permissions: {
        pos: boolean;
        stock: boolean;
        reports: boolean;
        settings: boolean;
    };
    users: {
        phone_number: string;
    };
};

export default function StaffManagementPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [businessId, setBusinessId] = useState<number | null>(null);

    // Modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [saving, setSaving] = useState(false);

    // Edit State
    const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
    const [editPermissions, setEditPermissions] = useState({
        pos: true,
        stock: false,
        reports: false,
        settings: false,
    });

    // Form States
    const [formName, setFormName] = useState('');
    const [formPhone, setFormPhone] = useState('');
    const [formPin, setFormPin] = useState('');
    const [formPermissions, setFormPermissions] = useState({
        pos: true,
        stock: false,
        reports: false,
        settings: false,
    });

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // First get the public user id
            const { data: publicUser } = await supabase
                .from('users')
                .select('id')
                .eq('auth_id', user.id)
                .single();

            if (!publicUser) return;

            const { data: business } = await supabase
                .from('businesses')
                .select('id')
                .eq('user_id', publicUser.id)
                .single();

            if (!business) return;
            setBusinessId(business.id);

            const { data } = await supabase
                .from('business_staff')
                .select('*, users(phone_number)')
                .eq('business_id', business.id);

            setStaff(data || []);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddStaff = async () => {
        if (!formName || !formPhone || !formPin || saving) return;
        if (!businessId) {
            alert("Sistem belum siap: Data Toko belum dimuat. Silakan tunggu sebentar atau refresh halaman.");
            return;
        }

        setSaving(true);
        try {
            // 1. Create Dummy Email
            const cleanPhone = formPhone.replace(/[^0-9]/g, '');
            const email = `${cleanPhone}@kasirku.local`;

            // 2. Create Auth User
            const tempClient = createClient(
                import.meta.env.VITE_SUPABASE_URL,
                import.meta.env.VITE_SUPABASE_ANON_KEY,
                { auth: { persistSession: false } }
            );

            const { data: authData, error: authError } = await tempClient.auth.signUp({
                email,
                password: formPin,
                options: {
                    data: {
                        full_name: formName,
                        role: 'staff',
                    }
                }
            });

            // Handle if user already exists in Auth but not linked
            let userId = authData.user?.id;
            if (authError) {
                const errMsg = authError.message.toLowerCase();
                if (errMsg.includes("already registered") || errMsg.includes("exists")) {
                    // Try to find the user in public.users to get their auth_id
                    const { data: existingUser } = await supabase
                        .from('users')
                        .select('auth_id')
                        .eq('email', email)
                        .maybeSingle();

                    if (existingUser) {
                        userId = existingUser.auth_id;
                    } else {
                        throw new Error("Nomor HP ini sudah ada di sistem Auth, tapi belum masuk ke database profil. Silakan jalankan script SQL Master Fix V4.");
                    }
                } else {
                    throw authError;
                }
            }

            if (!userId) throw new Error("Gagal mengidentifikasi User ID (Auth).");

            // 3. Wait/Sync Public User
            let publicUser = null;
            for (let i = 0; i < 5; i++) {
                const { data } = await supabase
                    .from('users')
                    .select('id')
                    .eq('auth_id', userId)
                    .maybeSingle();

                if (data) {
                    publicUser = data;
                    break;
                }
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            if (!publicUser) {
                const { data, error } = await supabase
                    .from('users')
                    .upsert({
                        auth_id: userId,
                        email: email,
                        role: 'staff',
                        phone_number: cleanPhone,
                        is_active: true
                    }, { onConflict: 'email' })
                    .select()
                    .single();

                if (error) throw new Error("Sinkronisasi gagal. Pastikan SQL Master Fix V4 sudah dijalankan.");
                publicUser = data;
            }

            // 4. Link to Business Staff
            const { error: staffError } = await supabase
                .from('business_staff')
                .insert({
                    business_id: businessId,
                    user_id: publicUser.id,
                    staff_name: formName,
                    permissions: formPermissions,
                    is_active: true
                });

            if (staffError) {
                if (staffError.message.toLowerCase().includes("unique")) {
                    throw new Error("Staf ini sudah terhubung ke toko kamu.");
                }
                throw staffError;
            }

            setShowAddModal(false);
            resetForm();
            fetchStaff();
            alert("Staf berhasil ditambahkan!");
        } catch (error: any) {
            console.error("Staff Creation Error:", error);
            alert("Gagal: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteStaff = async (id: number) => {
        if (!confirm("Hapus staf ini? Mereka tidak akan bisa login lagi.")) return;
        try {
            await supabase.from('business_staff').delete().eq('id', id);
            fetchStaff();
        } catch (error: any) {
            alert(error.message);
        }
    };

    const resetForm = () => {
        setFormName('');
        setFormPhone('');
        setFormPin('');
        setFormPermissions({
            pos: true,
            stock: false,
            reports: false,
            settings: false,
        });
    };

    const togglePermission = (key: keyof typeof formPermissions) => {
        setFormPermissions(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const toggleEditPermission = (key: keyof typeof editPermissions) => {
        setEditPermissions(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleEditStaff = (member: StaffMember) => {
        setEditingStaff(member);
        setEditPermissions(member.permissions);
        setShowEditModal(true);
    };

    const handleUpdateStaff = async () => {
        if (!editingStaff || saving) return;
        setSaving(true);
        try {
            const { error } = await supabase
                .from('business_staff')
                .update({ permissions: editPermissions })
                .eq('id', editingStaff.id);

            if (error) throw error;

            setShowEditModal(false);
            setEditingStaff(null);
            fetchStaff();
            alert('Hak akses staf berhasil diperbarui!');
        } catch (error: any) {
            console.error('Update Error:', error);
            alert('Gagal: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-800">
            {/* Header */}
            <div className="bg-white sticky top-0 z-20 px-6 py-3 border-b border-slate-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </button>
                    <h1 className="text-sm font-black text-slate-900 uppercase">Manajemen Staf</h1>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-emerald-600 text-white p-2 rounded-xl shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </div>

            <div className="p-6 space-y-4">
                {/* Stats Info */}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
                    <Users className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10" />
                    <h2 className="text-xl font-black mb-1">Tim Toko Kamu</h2>
                    <p className="text-indigo-100 text-xs font-medium opacity-80">Kelola siapa saja yang bisa akses kasir dan stok.</p>
                </div>

                {/* Staff List */}
                <div className="space-y-3">
                    {loading ? (
                        <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
                    ) : staff.length === 0 ? (
                        <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                            <UserPlus className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                            <p className="text-slate-400 font-bold text-sm">Belum ada staf</p>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="mt-4 text-emerald-600 font-bold text-xs uppercase tracking-widest"
                            >
                                Tambah Sekarang
                            </button>
                        </div>
                    ) : (
                        staff.map(member => (
                            <div key={member.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 shrink-0">
                                    <Users className="w-6 h-6 text-slate-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-black text-slate-800 text-sm truncate">{member.staff_name}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                        <Phone className="w-3 h-3" /> {member.users?.phone_number || '-'}
                                    </p>
                                    <div className="flex gap-1 mt-2 flex-wrap">
                                        {Object.entries(member.permissions).map(([key, val]) => val && (
                                            <span key={key} className="text-[8px] font-black uppercase tracking-tighter bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-md border border-emerald-100">
                                                {key}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => handleEditStaff(member)}
                                        className="p-2.5 text-indigo-500 hover:bg-indigo-50 rounded-xl transition-colors"
                                    >
                                        <Pencil className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteStaff(member.id)}
                                        className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Add Staff Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                            <div>
                                <h3 className="text-lg font-black text-slate-900">Tambah Staf</h3>
                                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-0.5">Daftarkan Anggota Tim</p>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="p-2 bg-slate-50 rounded-full text-slate-400"><X className="w-5 h-5" /></button>
                        </div>

                        <div className="p-6 space-y-5">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                                    <div className="relative">
                                        <Users className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            value={formName}
                                            onChange={(e) => setFormName(e.target.value)}
                                            placeholder="Nama staf..."
                                            className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:border-emerald-500 outline-none font-bold text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nomor WhatsApp</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                                        <input
                                            type="tel"
                                            value={formPhone}
                                            onChange={(e) => setFormPhone(e.target.value)}
                                            placeholder="0812..."
                                            className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:border-emerald-500 outline-none font-bold text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">PIN / Password Login</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                                        <input
                                            type="password"
                                            value={formPin}
                                            onChange={(e) => setFormPin(e.target.value)}
                                            placeholder="Minimal 6 karakter..."
                                            className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:border-emerald-500 outline-none font-bold text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                                    <Shield className="w-3 h-3" /> Hak Akses (Permissions)
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(formPermissions).map(([key, val]) => (
                                        <button
                                            key={key}
                                            onClick={() => togglePermission(key as any)}
                                            className={cn(
                                                "p-3 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all",
                                                val
                                                    ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                                                    : "bg-white border-slate-100 text-slate-400"
                                            )}
                                        >
                                            <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center", val ? "bg-emerald-500 text-white" : "bg-slate-100")}>
                                                {val ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-slate-300" />}
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest">{key}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                                <p className="text-[10px] font-bold text-amber-700 leading-relaxed uppercase">
                                    Pastikan Nomor HP benar. Staf akan login menggunakan Nomor HP ini dan PIN yang kamu buat.
                                </p>
                            </div>

                            <button
                                onClick={handleAddStaff}
                                disabled={saving || !formName || !formPhone || !formPin}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                            >
                                {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                                SIMPAN STAF BARU
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Staff Modal */}
            {showEditModal && editingStaff && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                            <div>
                                <h3 className="text-lg font-black text-slate-900">Edit Hak Akses</h3>
                                <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-0.5">{editingStaff.staff_name}</p>
                            </div>
                            <button onClick={() => { setShowEditModal(false); setEditingStaff(null); }} className="p-2 bg-slate-50 rounded-full text-slate-400"><X className="w-5 h-5" /></button>
                        </div>

                        <div className="p-6 space-y-5">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                                    <Shield className="w-3 h-3" /> Hak Akses (Permissions)
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(editPermissions).map(([key, val]) => (
                                        <button
                                            key={key}
                                            onClick={() => toggleEditPermission(key as any)}
                                            className={cn(
                                                "p-3 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all",
                                                val
                                                    ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                                                    : "bg-white border-slate-100 text-slate-400"
                                            )}
                                        >
                                            <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center", val ? "bg-emerald-500 text-white" : "bg-slate-100")}>
                                                {val ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-slate-300" />}
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest">{key}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleUpdateStaff}
                                disabled={saving}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                            >
                                {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                                SIMPAN PERUBAHAN
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
