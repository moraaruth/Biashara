import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-[#E5EAE7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-[#00A651] flex items-center justify-center text-white font-bold text-sm">
                B
              </div>
              <span className="text-lg font-bold text-[#202B27]">
                Biashara<span className="text-[#00A651]">OS</span>
              </span>
            </div>
            <p className="text-xs text-[#66736B] leading-relaxed mb-4">
              The unified Kenyan business operating system. Streamlining sales, inventory, M-Pesa reconciliation, and eTIMS tax readiness for growing enterprises across 47 counties.
            </p>
            <div className="text-xs text-[#66736B]">
              Nairobi, Kenya · East Africa
            </div>
          </div>

          {/* Core Modules */}
          <div>
            <h4 className="text-xs font-semibold text-[#202B27] uppercase tracking-wider mb-3">
              Modules
            </h4>
            <ul className="space-y-2 text-xs text-[#66736B]">
              <li><a href="#features" className="hover:text-[#00A651] transition-colors">Point of Sale & Invoicing</a></li>
              <li><a href="#features" className="hover:text-[#00A651] transition-colors">Traceable Inventory & Stock</a></li>
              <li><a href="#features" className="hover:text-[#00A651] transition-colors">Purchases & Suppliers</a></li>
              <li><a href="#features" className="hover:text-[#00A651] transition-colors">M-Pesa Reconciliation</a></li>
              <li><a href="#features" className="hover:text-[#00A651] transition-colors">Double-Entry Accounting</a></li>
            </ul>
          </div>

          {/* Kenyan First */}
          <div>
            <h4 className="text-xs font-semibold text-[#202B27] uppercase tracking-wider mb-3">
              Kenyan Ready
            </h4>
            <ul className="space-y-2 text-xs text-[#66736B]">
              <li><a href="#solutions" className="hover:text-[#00A651] transition-colors">KRA eTIMS VSCU/OSCU Architecture</a></li>
              <li><a href="#solutions" className="hover:text-[#00A651] transition-colors">Safaricom Daraja STK Push Simulation</a></li>
              <li><a href="#solutions" className="hover:text-[#00A651] transition-colors">16% VAT Inclusive/Exclusive Logic</a></li>
              <li><a href="#solutions" className="hover:text-[#00A651] transition-colors">Multi-Branch Nairobi & County Warehouses</a></li>
              <li><a href="#solutions" className="hover:text-[#00A651] transition-colors">Thermal Receipt & WhatsApp Sharing</a></li>
            </ul>
          </div>

          {/* Legal & Notice */}
          <div>
            <h4 className="text-xs font-semibold text-[#202B27] uppercase tracking-wider mb-3">
              Transparency
            </h4>
            <p className="text-xs text-[#66736B] leading-relaxed">
              BiasharaOS is an independent software platform. KRA eTIMS and Safaricom Daraja integrations operate in compliant sandbox simulation modes until connected with your registered enterprise production credentials.
            </p>
            <div className="mt-4 text-xs text-[#66736B]">
              © {new Date().getFullYear()} BiasharaOS Kenya. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
