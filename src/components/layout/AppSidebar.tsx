import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  FileText, 
  Users, 
  Package, 
  Truck, 
  Receipt, 
  CreditCard, 
  Calculator, 
  UserCheck, 
  BarChart3, 
  Settings, 
  Home, 
  RotateCcw,
  Store,
  X
} from 'lucide-react';
import { AppModule } from '../../types';

export type ActiveTab = 
  | 'overview' 
  | 'sales' 
  | 'invoicing' 
  | 'customers' 
  | 'inventory' 
  | 'purchases' 
  | 'expenses' 
  | 'payments' 
  | 'accounting' 
  | 'employees' 
  | 'reports' 
  | 'settings';

interface AppSidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onReturnToLanding: () => void;
  onResetData: () => void;
  businessName: string;
  activeModules: AppModule[];
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  activeTab,
  onTabChange,
  onReturnToLanding,
  onResetData,
  businessName,
  activeModules,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }>; moduleRequired?: AppModule }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'sales', label: 'Sales & POS', icon: ShoppingCart, moduleRequired: 'sales' },
    { id: 'invoicing', label: 'Invoices', icon: FileText, moduleRequired: 'invoicing' },
    { id: 'customers', label: 'Customers', icon: Users, moduleRequired: 'customers' },
    { id: 'inventory', label: 'Inventory & Stock', icon: Package, moduleRequired: 'inventory' },
    { id: 'purchases', label: 'Purchases & Suppliers', icon: Truck, moduleRequired: 'purchases' },
    { id: 'expenses', label: 'Expenses', icon: Receipt, moduleRequired: 'expenses' },
    { id: 'payments', label: 'Payments & M-Pesa', icon: CreditCard, moduleRequired: 'payments' },
    { id: 'accounting', label: 'Accounting', icon: Calculator, moduleRequired: 'accounting' },
    { id: 'employees', label: 'Employees & Roles', icon: UserCheck, moduleRequired: 'employees' },
    { id: 'reports', label: 'Reports & Exports', icon: BarChart3, moduleRequired: 'reports' },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Filter items based on active modules in organisation
  const visibleItems = navItems.filter(item => {
    if (!item.moduleRequired) return true;
    return activeModules.includes(item.moduleRequired);
  });

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-white border-r border-[#E5EAE7] flex flex-col justify-between
        transition-transform duration-200 ease-in-out
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Top Header */}
        <div className="p-4 border-b border-[#E5EAE7]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#00A651] flex items-center justify-center text-white font-bold text-base shadow-xs">
                B
              </div>
              <div>
                <span className="text-base font-bold text-[#202B27] tracking-tight block leading-tight">
                  Biashara<span className="text-[#00A651]">OS</span>
                </span>
                <span className="text-[10px] text-[#66736B] tracking-wide block">
                  Kenyan Business Platform
                </span>
              </div>
            </div>
            <button 
              onClick={onCloseMobile}
              className="md:hidden p-1 text-[#66736B] hover:text-[#202B27] rounded-md"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Organisation badge */}
          <div className="mt-3.5 px-2.5 py-1.5 bg-[#F8FAF9] rounded-lg border border-[#E5EAE7] flex items-center gap-2">
            <Store className="w-3.5 h-3.5 text-[#00A651] shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="text-xs font-semibold text-[#202B27] truncate block" title={businessName}>
                {businessName}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {visibleItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left ${
                  isActive
                    ? 'bg-[#F0F8F3] text-[#00843D] font-semibold'
                    : 'text-[#66736B] hover:text-[#202B27] hover:bg-[#F8FAF9]'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#00A651]' : 'text-[#66736B]'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="p-3 border-t border-[#E5EAE7] space-y-1.5 bg-[#F8FAF9]">
          <button
            onClick={onReturnToLanding}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#66736B] hover:text-[#202B27] hover:bg-white rounded-md transition-colors"
          >
            <Home className="w-3.5 h-3.5 text-[#66736B]" />
            <span>Public Landing Page</span>
          </button>
          <button
            onClick={() => {
              if (window.confirm('Reset all demo data back to clean Nairobi hardware store seed state?')) {
                onResetData();
              }
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#66736B] hover:text-red-700 hover:bg-white rounded-md transition-colors"
            title="Reset to fresh demo data"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#66736B]" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </aside>
    </>
  );
};
