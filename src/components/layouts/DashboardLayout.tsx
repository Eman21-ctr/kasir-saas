import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutGrid, ShoppingCart, Package, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function DashboardLayout() {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { label: 'Beranda', icon: LayoutGrid, path: '/dashboard' },
        { label: 'Kasir', icon: ShoppingCart, path: '/dashboard/pos' }, // Point of Sale
        { label: 'Produk', icon: Package, path: '/dashboard/products' },
        { label: 'Pengaturan', icon: Settings, path: '/dashboard/settings' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
            {/* Main Content Area - Scrollable */}
            <div className="flex-1 overflow-y-auto pb-24">
                <Outlet />
            </div>

            {/* Bottom Navigation Bar - Fixed */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] px-6 py-3 pb-5 z-50">
                <div className="flex justify-between items-center max-w-md mx-auto">
                    {navItems.map((item) => {
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
