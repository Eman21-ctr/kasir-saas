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
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium">Memeriksa sesi...</p>
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
