import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Users, Store, Activity, LogOut, Plus, Sparkles, Copy, RefreshCw } from 'lucide-react';

export default function Dashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [generatedCode, setGeneratedCode] = useState<string | null>(null);

    // Dummy stats for now
    const stats = [
        { label: 'Total Users', value: '12', icon: Users, color: 'bg-emerald-500' },
        { label: 'Active Businesses', value: '8', icon: Store, color: 'bg-blue-500' },
        { label: 'Today\'s Activations', value: '3', icon: Activity, color: 'bg-violet-500' },
    ];

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    const generateCode = async () => {
        // Generate random 6 char code (Uppercase + Numbers)
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();

        const { error } = await supabase
            .from('activation_codes')
            .insert([{
                code: code,
                created_by: 'system', // or get user email
                partner_name: 'Super Admin Generated'
            }]);

        if (error) {
            alert('Error generating code: ' + error.message);
        } else {
            setGeneratedCode(code);
        }
    };

    useEffect(() => {
        // Check session
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate('/login');
            }
            setLoading(false);
        };
        checkSession();
    }, [navigate]);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Sidebar / Navigation */}
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-emerald-600 p-2 rounded-lg">
                        <Store className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-slate-800">KasirKu Admin</h1>
                        <p className="text-xs text-slate-500">Super Admin Control</p>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-slate-500 hover:text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
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
                        <h2 className="text-2xl font-bold text-slate-800">Dashboard Overview</h2>
                        <p className="text-slate-500">Welcome back, Super Admin.</p>
                    </div>

                    <button
                        onClick={generateCode}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-2 font-semibold transition-all active:scale-95"
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
                                    <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                    <h3 className="text-3xl font-bold text-slate-800 mt-1">{stat.value}</h3>
                                </div>
                                <div className={`p-3 rounded-xl ${stat.color} bg-opacity-10`}>
                                    <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                                </div>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                                <Activity className="w-3 h-3" />
                                +12% from last week
                            </div>
                        </div>
                    ))}
                </div>

                {/* Generator Section */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-amber-500" />
                            Activation Code Generator
                        </h3>
                    </div>
                    <div className="p-8">
                        <div className="max-w-md mx-auto text-center space-y-6">
                            {generatedCode ? (
                                <div className="bg-emerald-50 p-8 rounded-2xl border-2 border-dashed border-emerald-300 animate-in fade-in zoom-in duration-300">
                                    <p className="text-sm text-emerald-600 font-medium mb-2">New Code Generated!</p>
                                    <p className="text-4xl font-mono font-bold text-emerald-700 tracking-wider mb-4">{generatedCode}</p>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(generatedCode)}
                                        className="flex items-center gap-2 mx-auto text-sm text-emerald-600 hover:text-emerald-700"
                                    >
                                        <Copy className="w-4 h-4" /> Copy to Clipboard
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-slate-50 p-8 rounded-2xl border-2 border-dashed border-slate-200">
                                    <p className="text-slate-400">No code generated yet.</p>
                                    <p className="text-xs text-slate-400 mt-1">Click the button above to create one.</p>
                                </div>
                            )}

                            <p className="text-slate-500">
                                Share this code with the shop owner to allow them to activate their account.
                            </p>

                            {generatedCode && (
                                <div className="flex gap-3 justify-center">
                                    <button
                                        onClick={generateCode}
                                        className="px-6 py-2 bg-white border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                    >
                                        <RefreshCw className="w-4 h-4" /> Generate Another
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}
