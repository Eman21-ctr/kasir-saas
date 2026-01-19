import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Users, Store, Key, LogOut, Plus, Copy, Pause, Play, Ban, Search, Activity } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function Dashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [generatedCode, setGeneratedCode] = useState<string | null>(null);
    const [activationCodes, setActivationCodes] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Dummy stats for now
    const [stats, setStats] = useState([
        { label: 'Total Users', value: '0', icon: Users, color: 'bg-emerald-500' },
        { label: 'Active Businesses', value: '0', icon: Store, color: 'bg-blue-500' },
        { label: 'Total Codes', value: '0', icon: Key, color: 'bg-violet-500' },
    ]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    const fetchCodes = async () => {
        try {
            const { data, error } = await supabase
                .from('activation_codes')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setActivationCodes(data || []);

            // Stats Update
            const total = data?.length || 0;
            const active = data?.filter(c => c.is_used).length || 0;

            setStats(prev => [
                { ...prev[0], value: '12' }, // Mock
                { ...prev[1], value: active.toString() },
                { ...prev[2], value: total.toString() },
            ]);

        } catch (error) {
            console.error("Error fetching codes:", error);
        }
    };

    const generateCode = async () => {
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();

        const { error } = await supabase
            .from('activation_codes')
            .insert([{
                code: code,
                created_by: 'system',
                partner_name: 'Super Admin Generated',
                status: 'active'
            }]);

        if (error) {
            alert('Error generating code: ' + error.message);
        } else {
            setGeneratedCode(code);
            fetchCodes(); // Refresh list
        }
    };

    const updateStatus = async (id: number, newStatus: string) => {
        const { error } = await supabase
            .from('activation_codes')
            .update({ status: newStatus })
            .eq('id', id);

        if (error) {
            alert("Gagal update status: " + error.message);
        } else {
            fetchCodes(); // Refresh
        }
    };

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate('/login');
            } else {
                fetchCodes();
            }
            setLoading(false);
        };
        checkSession();
    }, [navigate]);

    const filteredCodes = activationCodes.filter(c =>
        c.code.includes(searchTerm.toUpperCase()) ||
        (c.partner_name && c.partner_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
            {/* Sidebar / Navigation */}
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-10 px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="bg-emerald-600 p-2 rounded-lg shadow-lg shadow-emerald-600/20">
                        <Store className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-slate-800">KasirKu Admin</h1>
                        <p className="text-xs text-slate-500 font-medium">Super Admin Control</p>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-slate-500 hover:text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors text-sm font-bold"
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </button>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto p-6 space-y-8">

                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-extrabold text-slate-800">Dashboard Overview</h2>
                        <p className="text-slate-500 font-medium">Welcome back, Super Admin.</p>
                    </div>

                    <button
                        onClick={generateCode}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-2 font-bold transition-all active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        Generate Code
                    </button>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                                    <h3 className="text-3xl font-black text-slate-800 mt-1">{stat.value}</h3>
                                </div>
                                <div className={`p-3 rounded-xl ${stat.color} bg-opacity-10`}>
                                    <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Generator Section */}
                {generatedCode && (
                    <div className="bg-emerald-50 rounded-2xl border-2 border-dashed border-emerald-300 p-8 text-center animate-in fade-in zoom-in duration-300">
                        <p className="text-sm text-emerald-600 font-bold mb-2 uppercase tracking-wide">New Code Generated!</p>
                        <p className="text-5xl font-mono font-black text-emerald-700 tracking-wider mb-6">{generatedCode}</p>
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={() => navigator.clipboard.writeText(generatedCode)}
                                className="bg-white text-emerald-600 px-4 py-2 rounded-lg font-bold shadow-sm flex items-center gap-2 hover:bg-emerald-50 transition-colors border border-emerald-100"
                            >
                                <Copy className="w-4 h-4" /> Copy
                            </button>
                            <button
                                onClick={() => setGeneratedCode(null)}
                                className="text-emerald-600 px-4 py-2 font-bold hover:underline"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}

                {/* Activation Codes List */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                            <Key className="w-5 h-5 text-slate-400" />
                            Activation Codes
                        </h3>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search code or partner..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:border-emerald-500 outline-none w-full md:w-64"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-4">Code</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Status Penggunaan</th>
                                    <th className="px-6 py-4">Partner</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredCodes.map((code) => (
                                    <tr key={code.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-mono font-bold text-slate-700 tracking-wider">
                                            {code.code}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide",
                                                code.status === 'active' ? "bg-emerald-100 text-emerald-700" :
                                                    code.status === 'paused' ? "bg-amber-100 text-amber-700" :
                                                        "bg-red-100 text-red-700"
                                            )}>
                                                {code.status || 'Active'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {code.is_used ? (
                                                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                                                    <div className="w-2 h-2 rounded-full bg-slate-400" /> Used
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500" /> Available
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 font-medium">
                                            {code.partner_name || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {code.status !== 'paused' && code.status !== 'suspended' && (
                                                    <button
                                                        title="Pause Code"
                                                        onClick={() => updateStatus(code.id, 'paused')}
                                                        className="p-1.5 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-500 transition-colors"
                                                    >
                                                        <Pause className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {code.status === 'paused' && (
                                                    <button
                                                        title="Resume Code"
                                                        onClick={() => updateStatus(code.id, 'active')}
                                                        className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-500 transition-colors"
                                                    >
                                                        <Play className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {code.status !== 'suspended' && (
                                                    <button
                                                        title="Deactivate / Suspend"
                                                        onClick={() => updateStatus(code.id, 'suspended')}
                                                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <Ban className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredCodes.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                            No codes found matching "{searchTerm}"
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </main>
        </div>
    );
}
