import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

type AuthGuardProps = {
    children: React.ReactNode;
};

export default function AuthGuard({ children }: AuthGuardProps) {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const location = useLocation();

    useEffect(() => {
        checkAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_OUT') {
                setAuthenticated(false);
            } else if (event === 'SIGNED_IN') {
                setAuthenticated(true);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const checkAuth = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            setAuthenticated(!!session);
        } catch (error) {
            console.error('Auth check error:', error);
            setAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center animate-in fade-in duration-300">
                <div className="relative mb-6">
                    <div className="w-24 h-24 bg-emerald-50 rounded-2xl flex items-center justify-center border-2 border-emerald-100 shadow-xl shadow-emerald-500/10">
                        <img src="/logo.png" alt="KasirKu Logo" className="w-16 h-16 object-contain animate-pulse" />
                    </div>
                </div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight mb-2">KasirKu</h1>
                <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                    Memuat sistem...
                </div>
            </div>
        );
    }

    if (!authenticated) {
        // Redirect to login with return URL
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
}
