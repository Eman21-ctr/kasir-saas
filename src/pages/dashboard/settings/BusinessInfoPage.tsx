import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { ArrowLeft, Save, Loader2, Store, MapPin, Phone, Mail, Plus } from 'lucide-react';

export default function BusinessInfoPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [businessName, setBusinessName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [businessId, setBusinessId] = useState<number | null>(null);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchBusiness();
    }, []);

    const fetchBusiness = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: business } = await supabase
                .from('businesses')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (business) {
                setBusinessId(business.id);
                setBusinessName(business.business_name);
                setAddress(business.address || '');
                setPhone(business.phone || '');
                setEmail(business.email || '');
                setLogoUrl(business.logo_url || '');
            }
        } catch (error) {
            console.error("Error fetching business:", error);
        } finally {
            setFetching(false);
        }
    };

    const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            const file = e.target.files?.[0];
            if (!file) return;

            // Validate file type
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                alert("Format file tidak didukung. Gunakan JPG, PNG, atau WebP.");
                return;
            }

            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert("Ukuran file terlalu besar. Maksimal 2MB.");
                return;
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id} -${Math.random()}.${fileExt} `;
            const filePath = `logos / ${fileName} `;

            // Upload to 'logos' bucket
            const { error: uploadError } = await supabase.storage
                .from('assets') // Using 'assets' as a general bucket, or change to 'logos'
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('assets')
                .getPublicUrl(filePath);

            setLogoUrl(publicUrl);
        } catch (error: any) {
            console.error("Error uploading logo:", error);
            alert("Gagal upload logo: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        if (!businessId) return;
        setLoading(true);
        try {
            const { error } = await supabase
                .from('businesses')
                .update({
                    business_name: businessName,
                    address,
                    phone,
                    email,
                    logo_url: logoUrl,
                    updated_at: new Date().toISOString()
                })
                .eq('id', businessId);

            if (error) throw error;
            alert("Profil berhasil diperbarui!");
            navigate(-1);
        } catch (error: any) {
            alert("Gagal update: " + error.message);
        } finally {
            setLoading(false);
            setSaving(false);
        }
    };

    if (fetching) return <div className="flex justify-center items-center h-screen bg-slate-50"><Loader2 className="animate-spin text-emerald-500 w-10 h-10" /></div>;

    return (
        <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-800">
            {/* Header with Logo */}
            <div className="bg-white sticky top-0 z-20 px-6 py-3 border-b border-slate-100 shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
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

            <div className="p-6 space-y-6 pt-2">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900">Informasi Usaha</h1>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Identitas & Kontak Toko</p>
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
                {/* Profile Card Mockup */}
                <div className="bg-emerald-600 rounded-3xl p-6 text-white shadow-lg overflow-hidden relative">
                    <div className="absolute -bottom-10 -right-10 opacity-20"><Store className="w-40 h-40" /></div>
                    <p className="text-emerald-200 text-xs font-bold uppercase tracking-widest mb-1">Preview Struk</p>
                    <h2 className="text-2xl font-bold mb-1">{businessName}</h2>
                    <p className="text-sm opacity-80 line-clamp-2">{address || 'Alamat belum diatur'}</p>
                </div>

                <div className="space-y-4">
                    {/* Logo Upload Section */}
                    <div className="flex flex-col items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3">
                            <div className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg text-[10px] font-bold uppercase border border-emerald-100 italic">
                                Branding Toko
                            </div>
                        </div>
                        <div className="text-center">
                            <h3 className="text-sm font-bold text-slate-700 mb-1">Logo Toko</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Akan muncul di Header & Struk</p>
                        </div>
                        <div className="relative group">
                            <div className="w-24 h-24 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-emerald-500">
                                {logoUrl ? (
                                    <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <Store className="w-10 h-10 text-slate-300" />
                                )}
                                {uploading && (
                                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                        <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                                    </div>
                                )}
                            </div>
                            <label className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-xl shadow-lg cursor-pointer hover:bg-emerald-600 transition-all active:scale-90">
                                <Plus className="w-4 h-4" />
                                <input type="file" className="hidden" accept="image/*" onChange={handleUploadLogo} disabled={uploading} />
                            </label>
                        </div>
                        <div className="grid grid-cols-3 gap-2 w-full mt-2">
                            <div className="bg-slate-50 p-2 rounded-xl text-center">
                                <p className="text-[9px] font-bold text-slate-400 uppercase">Input</p>
                                <p className="text-[10px] font-extrabold text-slate-600">Ratio 1:1</p>
                            </div>
                            <div className="bg-slate-50 p-2 rounded-xl text-center">
                                <p className="text-[9px] font-bold text-slate-400 uppercase">Format</p>
                                <p className="text-[10px] font-extrabold text-slate-600">JPG/PNG</p>
                            </div>
                            <div className="bg-slate-50 p-2 rounded-xl text-center">
                                <p className="text-[9px] font-bold text-slate-400 uppercase">Ukuran</p>
                                <p className="text-[10px] font-extrabold text-slate-600">Max 2MB</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700">Nama Bisnis</label>
                        <div className="relative">
                            <Store className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                value={businessName}
                                onChange={(e) => setBusinessName(e.target.value)}
                                className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:border-emerald-500 outline-none transition-all font-medium text-slate-800"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700">No. WhatsApp Toko</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:border-emerald-500 outline-none transition-all font-medium text-slate-800"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700">Alamat Toko</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                            <textarea
                                rows={3}
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:border-emerald-500 outline-none transition-all font-medium text-slate-800"
                                placeholder="Alamat lengkap usaha"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700">Email (Opsional)</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:border-emerald-500 outline-none transition-all font-medium text-slate-800"
                            />
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full bg-slate-800 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-slate-900 active:scale-95 transition-all text-center flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5 text-emerald-400" />}
                    Simpan Profil
                </button>
            </div>
        </div>
    );
}
