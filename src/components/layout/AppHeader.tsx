import React, { useState } from 'react';
import { 
  Menu, 
  Search, 
  Bell, 
  Plus, 
  MapPin, 
  User as UserIcon, 
  ShoppingCart, 
  FileText, 
  Package, 
  Receipt, 
  Truck, 
  Users,
  ChevronDown
} from 'lucide-react';
import { Branch, User, UserRole } from '../../types';

interface AppHeaderProps {
  onOpenMobileMenu: () => void;
  branches: Branch[];
  currentBranchId: string;
  onBranchChange: (branchId: string) => void;
  currentUser: User;
  allUsers: User[];
  onUserChange: (userId: string) => void;
  onQuickAction: (action: 'sale' | 'invoice' | 'product' | 'expense' | 'customer' | 'po') => void;
  notificationCount: number;
  notifications: string[];
  onSearch: (query: string) => void;
  searchQuery: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onOpenMobileMenu,
  branches,
  currentBranchId,
  onBranchChange,
  currentUser,
  allUsers,
  onUserChange,
  onQuickAction,
  notificationCount,
  notifications,
  onSearch,
  searchQuery,
}) => {
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const roleLabels: Record<UserRole, string> = {
    owner: 'Business Owner',
    admin: 'Administrator',
    manager: 'Store Manager',
    salesperson: 'Salesperson',
    accountant: 'Accountant (CPA)',
    inventory_manager: 'Inventory Manager',
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-[#E5EAE7] flex items-center justify-between px-4 sm:px-6">
      {/* Left zone: Hamburger + Branch Selector + Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 text-[#66736B] hover:text-[#202B27] rounded-lg"
          aria-label="Open mobile navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Branch Selector */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-[#F8FAF9] rounded-lg border border-[#E5EAE7]">
          <MapPin className="w-3.5 h-3.5 text-[#00A651] shrink-0" />
          <select
            value={currentBranchId}
            onChange={(e) => onBranchChange(e.target.value)}
            className="text-xs font-medium text-[#202B27] bg-transparent border-none focus:outline-none cursor-pointer pr-1"
          >
            {branches.map(b => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Global Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#66736B]" />
          <input
            type="text"
            placeholder="Search items, invoices, customers..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg focus:outline-none focus:border-[#00A651] focus:bg-white text-[#202B27] placeholder:text-[#66736B]"
          />
          {searchQuery && (
            <button
              onClick={() => onSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[#66736B] hover:text-[#202B27]"
            >
              clear
            </button>
          )}
        </div>
      </div>

      {/* Right zone: Quick Actions + Notifications + Role Switcher */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Quick Action Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowQuickMenu(!showQuickMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00A651] hover:bg-[#00843D] text-white text-xs font-medium rounded-lg shadow-xs transition-all active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Action</span>
            <ChevronDown className="w-3 h-3 opacity-80" />
          </button>

          {showQuickMenu && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setShowQuickMenu(false)} 
              />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-[#E5EAE7] py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => { setShowQuickMenu(false); onQuickAction('sale'); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#202B27] hover:bg-[#F0F8F3] hover:text-[#00843D] transition-colors"
                >
                  <ShoppingCart className="w-4 h-4 text-[#00A651]" />
                  <span>Record Sale / POS</span>
                </button>
                <button
                  onClick={() => { setShowQuickMenu(false); onQuickAction('invoice'); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#202B27] hover:bg-[#F0F8F3] hover:text-[#00843D] transition-colors"
                >
                  <FileText className="w-4 h-4 text-[#00A651]" />
                  <span>Create Invoice</span>
                </button>
                <button
                  onClick={() => { setShowQuickMenu(false); onQuickAction('product'); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#202B27] hover:bg-[#F0F8F3] hover:text-[#00843D] transition-colors"
                >
                  <Package className="w-4 h-4 text-[#00A651]" />
                  <span>Add Product</span>
                </button>
                <button
                  onClick={() => { setShowQuickMenu(false); onQuickAction('expense'); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#202B27] hover:bg-[#F0F8F3] hover:text-[#00843D] transition-colors"
                >
                  <Receipt className="w-4 h-4 text-[#00A651]" />
                  <span>Record Expense</span>
                </button>
                <button
                  onClick={() => { setShowQuickMenu(false); onQuickAction('customer'); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#202B27] hover:bg-[#F0F8F3] hover:text-[#00843D] transition-colors"
                >
                  <Users className="w-4 h-4 text-[#00A651]" />
                  <span>Add Customer</span>
                </button>
                <button
                  onClick={() => { setShowQuickMenu(false); onQuickAction('po'); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#202B27] hover:bg-[#F0F8F3] hover:text-[#00843D] transition-colors"
                >
                  <Truck className="w-4 h-4 text-[#00A651]" />
                  <span>Purchase Order</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-[#66736B] hover:text-[#202B27] hover:bg-[#F8FAF9] rounded-lg transition-colors relative"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {notificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full" />
            )}
          </button>

          {showNotifications && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setShowNotifications(false)} 
              />
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-[#E5EAE7] p-3 z-40">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E5EAE7]">
                  <span className="text-xs font-semibold text-[#202B27]">Business Alerts</span>
                  <span className="text-[10px] text-[#66736B]">{notifications.length} active</span>
                </div>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {notifications.map((note, idx) => (
                    <div key={idx} className="p-2 bg-[#F8FAF9] rounded text-xs text-[#202B27] border border-[#E5EAE7]">
                      {note}
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <div className="text-xs text-[#66736B] text-center py-3">
                      All stocks and invoices up to date.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Role Switcher & User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 hover:bg-[#F8FAF9] rounded-lg border border-transparent hover:border-[#E5EAE7] transition-colors text-left"
          >
            <div className="w-7 h-7 rounded-full bg-[#202B27] text-white flex items-center justify-center text-xs font-bold shrink-0">
              {currentUser.name.charAt(0)}
            </div>
            <div className="hidden lg:block text-left">
              <span className="text-xs font-semibold text-[#202B27] block leading-tight">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-[#00A651] font-medium block">
                {roleLabels[currentUser.role]}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-[#66736B]" />
          </button>

          {showUserMenu && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setShowUserMenu(false)} 
              />
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-[#E5EAE7] p-2 z-40">
                <div className="px-2 py-1.5 mb-1.5 border-b border-[#E5EAE7]">
                  <span className="text-[11px] font-semibold text-[#66736B] uppercase tracking-wider block">
                    Switch Active User Role (RBAC)
                  </span>
                  <span className="text-[10px] text-[#66736B]">
                    Test the app as different staff members
                  </span>
                </div>
                <div className="space-y-1">
                  {allUsers.map(u => (
                    <button
                      key={u.id}
                      onClick={() => {
                        onUserChange(u.id);
                        setShowUserMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-md transition-colors ${
                        u.id === currentUser.id 
                          ? 'bg-[#F0F8F3] text-[#00843D] font-semibold' 
                          : 'text-[#202B27] hover:bg-[#F8FAF9]'
                      }`}
                    >
                      <div className="text-left">
                        <div className="font-medium">{u.name}</div>
                        <div className="text-[10px] text-[#66736B]">{roleLabels[u.role]}</div>
                      </div>
                      {u.id === currentUser.id && (
                        <span className="text-[10px] text-[#00A651] font-bold">Active</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
