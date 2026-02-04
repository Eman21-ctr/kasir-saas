import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export type UserRole = 'super_admin' | 'shop_owner' | 'staff';

export type Permissions = {
    pos: boolean;
    stock: boolean;
    reports: boolean;
    settings: boolean;
};

export type AuthContext = {
    user: any;
    business: any;
    role: UserRole;
    permissions: Permissions;
    loading: boolean;
};

export function useAuth() {
    const [state, setState] = useState<AuthContext>({
        user: null,
        business: null,
        role: 'shop_owner',
        permissions: {
            pos: true,
            stock: true,
            reports: true,
            settings: true,
        },
        loading: true,
    });

    useEffect(() => {
        fetchAuthData();
    }, []);

    const fetchAuthData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setState(prev => ({ ...prev, loading: false }));
                return;
            }

            // 1. Get Public User Info (Role)
            const { data: userData } = await supabase
                .from('users')
                .select('*')
                .eq('auth_id', user.id)
                .single();

            // If no public user profile, we can't determine role/business
            if (!userData) {
                console.warn("Public user profile not found for auth.user:", user.id);
                setState(prev => ({ ...prev, loading: false }));
                return;
            }

            let role = (userData.role as UserRole) || 'shop_owner';
            console.log("[Auth] User Profile Found:", { id: userData.id, role: role, email: userData.email });

            // 2. Resolve Business & Permissions
            let business = null;
            let permissions: Permissions = {
                pos: true,
                stock: true,
                reports: true,
                settings: true,
            };

            // FALLBACK: If role is shop_owner but they are actually staff
            // This happens if the database role sync hasn't run yet.
            if (role === 'shop_owner') {
                const { data: staffCheck } = await supabase
                    .from('business_staff')
                    .select('id')
                    .eq('user_id', userData.id)
                    .maybeSingle();

                if (staffCheck) {
                    console.log("[Auth] Fallback detected: User is actually staff.");
                    role = 'staff';
                }
            }

            if (role === 'shop_owner') {
                const { data: biz, error: bizError } = await supabase
                    .from('businesses')
                    .select('*')
                    .eq('user_id', userData.id)
                    .maybeSingle();

                if (bizError) console.error("[Auth] Business Fetch Error (Owner):", bizError);
                business = biz;
            } else if (role === 'staff') {
                const { data: staffRecord, error: staffError } = await supabase
                    .from('business_staff')
                    .select('*, businesses(*)')
                    .eq('user_id', userData.id)
                    .maybeSingle();

                if (staffError) console.error("[Auth] Staff Record Fetch Error:", staffError);

                if (staffRecord) {
                    business = staffRecord.businesses;
                    permissions = staffRecord.permissions as Permissions;
                    console.log("[Auth] Staff Business Resolved:", business?.business_name);
                }
            }

            setState({
                user,
                business,
                role,
                permissions,
                loading: false,
            });
        } catch (error) {
            console.error('Auth Error:', error);
            setState(prev => ({ ...prev, loading: false }));
        }
    };

    const hasPermission = (permission: keyof Permissions) => {
        return state.role === 'shop_owner' || state.permissions[permission];
    };

    return { ...state, hasPermission };
}
