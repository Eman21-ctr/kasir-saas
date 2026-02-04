import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutGrid, ShoppingCart, Package, Settings, BarChart3 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';

export default function DashboardLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { permissions, role, loading } = useAuth();

    const navItems = [
        { label: 'Beranda', icon: LayoutGrid, path: '/dashboard', show: true },
        { label: 'Kasir', icon: ShoppingCart, path: '/dashboard/pos', show: role === 'shop_owner' || permissions.pos },
        { label: 'Stock', icon: Package, path: '/dashboard/products/stock', show: role === 'shop_owner' || permissions.stock },
        { label: 'Laporan', icon: BarChart3, path: '/dashboard/reports', show: role === 'shop_owner' || permissions.reports },
        { label: 'Setelan', icon: Settings, path: '/dashboard/settings', show: role === 'shop_owner' || permissions.settings },
    ];

    const filteredNavItems = navItems.filter(item => item.show);

    if (loading) return null;

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
            {/* Main Content Area - Scrollable */}
            <div className="flex-1 overflow-y-auto pb-24">
                <Outlet />
            </div>

            {/* Bottom Navigation Bar - Fixed */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] px-6 py-3 pb-5 z-50">
                <div className="flex justify-between items-center max-w-md mx-auto">
                    {filteredNavItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={cn(
                                    "flex flex-col items-center gap-1.5 transition-all duration-300",
                                    isActive ? "text-emerald-600 -translate-y-1" : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                <div className={cn(
                                    "p-2 rounded-xl transition-all",
                                    isActive ? "bg-emerald-50 text-emerald-600" : "bg-transparent"
                                )}>
                                    <item.icon className={cn("w-6 h-6", isActive && "fill-emerald-600/20")} strokeWidth={isActive ? 2.5 : 2} />
                                </div>
                                <span className="text-[10px] font-bold tracking-wide">{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
