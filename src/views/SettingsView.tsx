import React, { useState } from 'react';
import { 
  Settings, 
  Store, 
  MapPin, 
  Building2, 
  Check, 
  FileCheck, 
  Layers, 
  RotateCcw,
  Plus
} from 'lucide-react';
import { Organisation, AppModule, Branch } from '../types';
import { KENYAN_COUNTIES, isValidKRAPIN, isValidKenyanPhone } from '../utils/formatters';
import { Modal } from '../components/common/Modal';

interface SettingsViewProps {
  organisation: Organisation;
  onUpdateOrg: (orgData: Partial<Organisation>) => void;
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  organisation,
  onUpdateOrg,
  onResetData,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'tax' | 'branches' | 'modules'>('profile');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Profile Form
  const [name, setName] = useState(organisation.name);
  const [tradingName, setTradingName] = useState(organisation.trading_name || '');
  const [phone, setPhone] = useState(organisation.phone);
  const [email, setEmail] = useState(organisation.email);
  const [county, setCounty] = useState(organisation.county);
  const [address, setAddress] = useState(organisation.address);

  // Tax Form
  const [kraPin, setKraPin] = useState(organisation.kra_pin || '');
  const [vatRegistered, setVatRegistered] = useState(organisation.vat_registered);
  const [vatPricing, setVatPricing] = useState(organisation.vat_pricing);

  // Modules State
  const [modules, setModules] = useState<AppModule[]>(organisation.active_modules);

  // Branch Modal
  const [isAddBranchOpen, setIsAddBranchOpen] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchCode, setNewBranchCode] = useState('');
  const [newBranchLocation, setNewBranchLocation] = useState('');

  const allModulesList: { id: AppModule; label: string; desc: string }[] = [
    { id: 'sales', label: 'Sales & POS', desc: 'Point of sale counter checkouts and thermal receipts' },
    { id: 'invoicing', label: 'Invoices & Receivables', desc: 'KRA tax invoices, partial payments and WhatsApp share' },
    { id: 'inventory', label: 'Traceable Inventory', desc: 'Stock movements, reorder alerts and branch transfers' },
    { id: 'purchases', label: 'Purchases & Suppliers', desc: 'Vendor directory, purchase orders and delivery intake' },
    { id: 'customers', label: 'Customer Management', desc: 'Debtor limits, customer ledger statements and contact directories' },
    { id: 'expenses', label: 'Expense Tracking', desc: 'KPLC tokens, rent, fuel, salaries and county levies' },
    { id: 'payments', label: 'Payments & M-Pesa Hub', desc: 'Daraja STK push sandbox, Paybill & Till reconciliation' },
    { id: 'accounting', label: 'Double-Entry Accounting', desc: 'Chart of accounts, balanced journal entries, P&L, Balance Sheet' },
    { id: 'employees', label: 'Employees & Roles (RBAC)', desc: 'Role permissions and access restrictions' },
    { id: 'reports', label: 'Reports & CSV Exports', desc: 'Daily/monthly summaries and tax data exports' },
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateOrg({
      name,
      trading_name: tradingName,
      phone,
      email,
      county,
      address,
    });
    triggerSuccess();
  };

  const handleSaveTax = (e: React.FormEvent) => {
    e.preventDefault();
    if (kraPin && !isValidKRAPIN(kraPin)) {
      alert('KRA PIN must follow Kenyan format: 1 letter + 9 digits + 1 letter (e.g. P051234567Z)');
      return;
    }
    onUpdateOrg({
      kra_pin: kraPin.toUpperCase(),
      vat_registered: vatRegistered,
      vat_pricing: vatPricing,
      etims_status: kraPin ? 'simulated' : 'not_configured',
    });
    triggerSuccess();
  };

  const handleSaveModules = () => {
    onUpdateOrg({
      active_modules: modules,
    });
    triggerSuccess();
  };

  const handleAddBranchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName) return;

    const newBranch: Branch = {
      id: `branch_${Date.now()}`,
      organisation_id: organisation.id,
      name: newBranchName,
      code: newBranchCode || 'BR-01',
      location: newBranchLocation,
      phone: organisation.phone,
      is_headquarters: false,
    };

    onUpdateOrg({
      branches: [...organisation.branches, newBranch],
    });

    setIsAddBranchOpen(false);
    setNewBranchName('');
    setNewBranchCode('');
    setNewBranchLocation('');
    triggerSuccess();
  };

  const triggerSuccess = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5EAE7]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#202B27] tracking-tight">
            Enterprise Settings & Configuration
          </h1>
          <p className="text-xs text-[#66736B] mt-0.5">
            Configure business identity, KRA tax parameters, branch network, and active operating modules
          </p>
        </div>

        {savedSuccess && (
          <div className="px-3 py-1.5 bg-[#F0F8F3] text-[#00843D] text-xs font-semibold rounded-lg border border-[#00A651]/20 flex items-center gap-1.5 animate-in fade-in">
            <Check className="w-4 h-4" />
            <span>Settings saved successfully!</span>
          </div>
        )}
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-[#E5EAE7]">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'profile' ? 'border-[#00A651] text-[#00843D]' : 'border-transparent text-[#66736B] hover:text-[#202B27]'
          }`}
        >
          Business Profile
        </button>
        <button
          onClick={() => setActiveTab('tax')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'tax' ? 'border-[#00A651] text-[#00843D]' : 'border-transparent text-[#66736B] hover:text-[#202B27]'
          }`}
        >
          KRA Tax & eTIMS Readiness
        </button>
        <button
          onClick={() => setActiveTab('branches')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'branches' ? 'border-[#00A651] text-[#00843D]' : 'border-transparent text-[#66736B] hover:text-[#202B27]'
          }`}
        >
          Store Branches ({organisation.branches.length})
        </button>
        <button
          onClick={() => setActiveTab('modules')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'modules' ? 'border-[#00A651] text-[#00843D]' : 'border-transparent text-[#66736B] hover:text-[#202B27]'
          }`}
        >
          Active Modules ({organisation.active_modules.length})
        </button>
      </div>

      {/* Tab 1: Business Profile */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl border border-[#E5EAE7] p-6 max-w-2xl shadow-xs">
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#202B27] mb-1">
                Registered Business Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202B27] mb-1">
                Trading / Storefront Name
              </label>
              <input
                type="text"
                value={tradingName}
                onChange={e => setTradingName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#202B27] mb-1">
                  Kenyan Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202B27] mb-1">
                  Primary Business Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#202B27] mb-1">
                  County
                </label>
                <select
                  value={county}
                  onChange={e => setCounty(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
                >
                  {KENYAN_COUNTIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202B27] mb-1">
                  Currency
                </label>
                <input
                  type="text"
                  value="KES (Kenyan Shillings)"
                  disabled
                  className="w-full px-3 py-2 text-xs font-mono bg-neutral-100 border border-[#E5EAE7] rounded-lg text-[#66736B] cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202B27] mb-1">
                Physical Commercial Address
              </label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#00A651] hover:bg-[#00843D] text-white font-semibold text-xs rounded-lg shadow-xs"
              >
                Save Profile Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: KRA Tax & eTIMS */}
      {activeTab === 'tax' && (
        <div className="bg-white rounded-xl border border-[#E5EAE7] p-6 max-w-2xl shadow-xs space-y-6">
          <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-lg text-xs text-blue-900 leading-relaxed">
            <span className="font-semibold block mb-0.5">KRA eTIMS Integration Layer Status:</span>
            BiasharaOS formats electronic tax invoices with the required KRA VSCU/OSCU payload structure. Connect with your official OSCU control unit or certified API key when ready for live tax reporting.
          </div>

          <form onSubmit={handleSaveTax} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#202B27] mb-1">
                Kenya Revenue Authority (KRA) PIN Number
              </label>
              <input
                type="text"
                placeholder="e.g. P051938291X"
                value={kraPin}
                onChange={e => setKraPin(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 text-xs font-mono uppercase bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
              />
              <span className="text-[10px] text-[#66736B] mt-0.5 block">Printed on all customer tax invoices and receipts</span>
            </div>

            <div className="pt-2 border-t border-[#E5EAE7] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-[#202B27] block">
                    VAT Registration (16% Standard Rate)
                  </span>
                  <span className="text-[11px] text-[#66736B]">
                    Enable VAT calculation across all sales and invoices
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={vatRegistered}
                  onChange={e => setVatRegistered(e.target.checked)}
                  className="w-4 h-4 text-[#00A651] rounded"
                />
              </div>

              {vatRegistered && (
                <div className="p-3 bg-[#F8FAF9] rounded-lg border border-[#E5EAE7]">
                  <span className="text-xs font-semibold text-[#202B27] block mb-2">
                    Pricing Display Method
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <label className={`p-2.5 rounded-lg border cursor-pointer ${
                      vatPricing === 'inclusive' ? 'bg-[#F0F8F3] border-[#00A651] text-[#00843D] font-medium' : 'bg-white border-[#E5EAE7] text-[#202B27]'
                    }`}>
                      <input
                        type="radio"
                        name="vatPricing"
                        value="inclusive"
                        checked={vatPricing === 'inclusive'}
                        onChange={() => setVatPricing('inclusive')}
                        className="sr-only"
                      />
                      <div>Tax-Inclusive</div>
                      <div className="text-[10px] text-[#66736B] font-normal">Prices shown include 16% VAT</div>
                    </label>

                    <label className={`p-2.5 rounded-lg border cursor-pointer ${
                      vatPricing === 'exclusive' ? 'bg-[#F0F8F3] border-[#00A651] text-[#00843D] font-medium' : 'bg-white border-[#E5EAE7] text-[#202B27]'
                    }`}>
                      <input
                        type="radio"
                        name="vatPricing"
                        value="exclusive"
                        checked={vatPricing === 'exclusive'}
                        onChange={() => setVatPricing('exclusive')}
                        className="sr-only"
                      />
                      <div>Tax-Exclusive</div>
                      <div className="text-[10px] text-[#66736B] font-normal">16% VAT added at checkout</div>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#00A651] hover:bg-[#00843D] text-white font-semibold text-xs rounded-lg shadow-xs"
              >
                Save Tax Configuration
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Branches */}
      {activeTab === 'branches' && (
        <div className="space-y-4 max-w-3xl">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-semibold text-[#202B27]">Store Branches & Warehouses</h3>
              <p className="text-xs text-[#66736B]">Manage inventory locations and dispatch depots</p>
            </div>
            <button
              onClick={() => setIsAddBranchOpen(true)}
              className="px-3.5 py-1.5 bg-[#00A651] hover:bg-[#00843D] text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Branch</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {organisation.branches.map(b => (
              <div key={b.id} className="p-4 bg-white rounded-xl border border-[#E5EAE7] shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#202B27]">{b.name}</span>
                  {b.is_headquarters ? (
                    <span className="text-[10px] font-bold text-[#00A651] bg-[#F0F8F3] px-2 py-0.5 rounded">
                      Headquarters
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-[#66736B] bg-[#F8FAF9] px-2 py-0.5 rounded">
                      Branch
                    </span>
                  )}
                </div>
                <div className="text-xs text-[#66736B]">{b.location}</div>
                <div className="text-[11px] text-[#66736B] font-mono">Code: {b.code} · Tel: {b.phone}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Active Modules */}
      {activeTab === 'modules' && (
        <div className="bg-white rounded-xl border border-[#E5EAE7] p-6 max-w-2xl shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-[#202B27]">Modular Feature Customizer</h3>
            <p className="text-xs text-[#66736B]">
              Enable or hide modules from your sidebar navigation according to your business workflow
            </p>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {allModulesList.map(mod => {
              const isChecked = modules.includes(mod.id);
              return (
                <div
                  key={mod.id}
                  onClick={() => {
                    if (isChecked) {
                      if (modules.length === 1) return;
                      setModules(modules.filter(m => m !== mod.id));
                    } else {
                      setModules([...modules, mod.id]);
                    }
                  }}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isChecked ? 'bg-[#F0F8F3] border-[#00A651]/40' : 'bg-[#F8FAF9] border-[#E5EAE7] opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-[#202B27] block">{mod.label}</span>
                      <span className="text-[11px] text-[#66736B]">{mod.desc}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="w-4 h-4 text-[#00A651] rounded"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleSaveModules}
              className="px-5 py-2.5 bg-[#00A651] hover:bg-[#00843D] text-white font-semibold text-xs rounded-lg shadow-xs"
            >
              Apply Active Modules
            </button>
          </div>
        </div>
      )}

      {/* Add Branch Modal */}
      <Modal
        isOpen={isAddBranchOpen}
        onClose={() => setIsAddBranchOpen(false)}
        title="Add Store Branch / Location"
        maxWidth="md"
      >
        <form onSubmit={handleAddBranchSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#202B27] mb-1">
              Branch Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Mombasa Old Town Branch"
              value={newBranchName}
              onChange={e => setNewBranchName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#202B27] mb-1">
                Branch Code
              </label>
              <input
                type="text"
                placeholder="e.g. MSA-01"
                value={newBranchCode}
                onChange={e => setNewBranchCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 text-xs font-mono bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#202B27] mb-1">
                Location
              </label>
              <input
                type="text"
                placeholder="e.g. Digo Road, Mombasa"
                value={newBranchLocation}
                onChange={e => setNewBranchLocation(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddBranchOpen(false)}
              className="px-4 py-2 text-xs text-[#66736B]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#00A651] hover:bg-[#00843D] text-white font-semibold text-xs rounded-lg shadow-xs"
            >
              Add Branch
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
