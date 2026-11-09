import React, { useState } from 'react';
import { 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Store, 
  Building2, 
  FileCheck, 
  Layers, 
  Sparkles 
} from 'lucide-react';
import { AppModule, Organisation } from '../types';
import { KENYAN_COUNTIES, isValidKenyanPhone, isValidKRAPIN } from '../utils/formatters';

interface OnboardingWizardProps {
  onComplete: (newOrg: Partial<Organisation>) => void;
  onCancel: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  onComplete,
  onCancel,
}) => {
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('Simba Hardware & General Supplies Ltd');
  const [tradingName, setTradingName] = useState('Simba Hardware');
  const [businessType, setBusinessType] = useState<Organisation['business_type']>('hardware');
  const [ownerName, setOwnerName] = useState('Josphat Kamau');
  const [email, setEmail] = useState('josphat@simbahardware.co.ke');
  const [phone, setPhone] = useState('+254 722 555 888');
  const [county, setCounty] = useState('Nairobi');
  const [subCounty, setSubCounty] = useState('Starehe (CBD)');
  const [address, setAddress] = useState('Accra Road, Nairobi Commercial Centre');

  // Step 2: Tax & eTIMS
  const [kraPin, setKraPin] = useState('P051938291X');
  const [vatRegistered, setVatRegistered] = useState(true);
  const [vatPricing, setVatPricing] = useState<'inclusive' | 'exclusive'>('inclusive');

  // Step 3: Modules
  const [selectedModules, setSelectedModules] = useState<AppModule[]>([
    'sales',
    'invoicing',
    'inventory',
    'purchases',
    'customers',
    'expenses',
    'payments',
    'accounting',
    'employees',
    'reports'
  ]);

  // Step 4: First Store
  const [branchName, setBranchName] = useState('Nairobi CBD - Accra Road (HQ)');
  const [branchCode, setBranchCode] = useState('CBD-01');
  const [branchLocation, setBranchLocation] = useState('Downtown Commercial District');

  const toggleModule = (mod: AppModule) => {
    if (selectedModules.includes(mod)) {
      if (selectedModules.length === 1) return; // Keep at least one
      setSelectedModules(selectedModules.filter(m => m !== mod));
    } else {
      setSelectedModules([...selectedModules, mod]);
    }
  };

  const handleNext = () => {
    setError(null);
    if (step === 1) {
      if (!name.trim()) {
        setError('Please enter your business name');
        return;
      }
      if (!phone.trim() || !isValidKenyanPhone(phone)) {
        setError('Please enter a valid Kenyan phone number (e.g. 0722 000 000)');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (kraPin && !isValidKRAPIN(kraPin)) {
        setError('KRA PIN must follow Kenyan format: 1 letter + 9 digits + 1 letter (e.g. P051234567Z)');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (selectedModules.length === 0) {
        setError('Please select at least one module for your business');
        return;
      }
      setStep(4);
    } else if (step === 4) {
      // Complete Onboarding
      const newOrg: Partial<Organisation> = {
        name,
        trading_name: tradingName || name,
        business_type: businessType,
        kra_pin: kraPin.toUpperCase(),
        phone,
        email,
        county,
        sub_county: subCounty,
        address,
        currency: 'KES',
        vat_registered: vatRegistered,
        vat_rate: 0.16,
        vat_pricing: vatPricing,
        etims_status: kraPin ? 'simulated' : 'not_configured',
        active_modules: selectedModules,
        branches: [
          {
            id: `branch_${Date.now()}`,
            organisation_id: 'org_simba_kenya',
            name: branchName,
            code: branchCode || 'MAIN-01',
            location: branchLocation,
            phone: phone,
            is_headquarters: true,
          }
        ]
      };
      onComplete(newOrg);
    }
  };

  const modulesList: { id: AppModule; label: string; desc: string }[] = [
    { id: 'sales', label: 'Sales & POS', desc: 'Fast counter checkouts, thermal receipts, barcode scanning' },
    { id: 'invoicing', label: 'Invoices & Debtors', desc: 'Professional KES invoices, partial payments, WhatsApp share' },
    { id: 'inventory', label: 'Traceable Inventory', desc: 'Stock movements, reorder alerts, branch transfers, valuation' },
    { id: 'purchases', label: 'Purchases & Suppliers', desc: 'Purchase orders, delivery intake, supplier balances' },
    { id: 'customers', label: 'Customer Management', desc: 'Debtor limits, customer ledger statements, contact directories' },
    { id: 'expenses', label: 'Expense Tracking', desc: 'KPLC, rent, fuel, salaries, county council levies' },
    { id: 'payments', label: 'Payments & M-Pesa', desc: 'Daraja STK push sandbox, Paybill & Till reconciliation' },
    { id: 'accounting', label: 'Double-Entry Accounting', desc: 'Chart of accounts, balanced journal entries, P&L, Balance Sheet' },
    { id: 'employees', label: 'Employees & Roles (RBAC)', desc: 'Store managers, cashiers, accountants with role restrictions' },
    { id: 'reports', label: 'Reports & CSV Exports', desc: 'Daily sales, best-sellers, inventory valuation, audit reports' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[#00A651] flex items-center justify-center text-white font-bold text-base shadow-xs">
              B
            </div>
            <span className="text-xl font-bold text-[#202B27]">
              Biashara<span className="text-[#00A651]">OS</span>
            </span>
          </div>
          <h2 className="text-2xl font-bold text-[#202B27]">Set up your Kenyan business</h2>
          <p className="text-xs text-[#66736B] mt-1">
            Step {step} of 4: {
              step === 1 ? 'Business Identity' :
              step === 2 ? 'Kenyan Tax & eTIMS' :
              step === 3 ? 'Choose Modules' :
              'First Store / Branch'
            }
          </p>

          {/* Stepper progress dots */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {[1, 2, 3, 4].map(s => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all ${
                  s === step ? 'w-8 bg-[#00A651]' : s < step ? 'w-4 bg-[#00A651]' : 'w-4 bg-[#E5EAE7]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Card Box */}
        <div className="bg-white rounded-xl border border-[#E5EAE7] shadow-sm p-6 sm:p-8">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          {/* Step 1: Business Identity */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#202B27] mb-1">
                    Registered Business Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Simba Hardware & General Supplies Ltd"
                    className="w-full px-3 py-2 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg focus:outline-none focus:border-[#00A651] focus:bg-white text-[#202B27]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202B27] mb-1">
                    Trading Name / Shop Name
                  </label>
                  <input
                    type="text"
                    value={tradingName}
                    onChange={e => setTradingName(e.target.value)}
                    placeholder="e.g. Simba Hardware"
                    className="w-full px-3 py-2 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg focus:outline-none focus:border-[#00A651] focus:bg-white text-[#202B27]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202B27] mb-1">
                    Industry / Business Type
                  </label>
                  <select
                    value={businessType}
                    onChange={e => setBusinessType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg focus:outline-none focus:border-[#00A651] focus:bg-white text-[#202B27]"
                  >
                    <option value="hardware">Hardware & Construction Supplies</option>
                    <option value="retail">Supermarket & Retail Store</option>
                    <option value="wholesale">Wholesale & Fast Moving Goods</option>
                    <option value="cosmetics">Beauty, Salon & Cosmetics</option>
                    <option value="electronics">Electronics, Computers & Phones</option>
                    <option value="services">Professional Services & Consulting</option>
                    <option value="other">Other Commercial Business</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202B27] mb-1">
                    Owner / Director Name
                  </label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={e => setOwnerName(e.target.value)}
                    placeholder="e.g. Josphat Kamau"
                    className="w-full px-3 py-2 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg focus:outline-none focus:border-[#00A651] focus:bg-white text-[#202B27]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202B27] mb-1">
                    Kenyan Mobile Number (M-Pesa) *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="e.g. +254 722 555 888"
                    className="w-full px-3 py-2 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg focus:outline-none focus:border-[#00A651] focus:bg-white text-[#202B27]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202B27] mb-1">
                    County (Kenya 47 Counties)
                  </label>
                  <select
                    value={county}
                    onChange={e => setCounty(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg focus:outline-none focus:border-[#00A651] focus:bg-white text-[#202B27]"
                  >
                    {KENYAN_COUNTIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202B27] mb-1">
                    Sub-County / Area
                  </label>
                  <input
                    type="text"
                    value={subCounty}
                    onChange={e => setSubCounty(e.target.value)}
                    placeholder="e.g. Starehe (CBD) or Westlands"
                    className="w-full px-3 py-2 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg focus:outline-none focus:border-[#00A651] focus:bg-white text-[#202B27]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#202B27] mb-1">
                    Physical Street Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="e.g. Accra Road, Commercial Centre, Nairobi"
                    className="w-full px-3 py-2 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg focus:outline-none focus:border-[#00A651] focus:bg-white text-[#202B27]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Tax & eTIMS Configuration */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="p-3.5 bg-[#F0F8F3] border border-[#00A651]/20 rounded-lg">
                <span className="text-xs font-bold text-[#00843D] block mb-1">
                  Kenyan Revenue Authority (KRA) Tax Settings
                </span>
                <p className="text-xs text-[#66736B] leading-relaxed">
                  Default currency is Kenyan Shillings (KES). Configure your KRA PIN and VAT calculation method for invoices and receipts.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202B27] mb-1">
                  KRA PIN Number (Optional, for eTIMS Tax Invoices)
                </label>
                <input
                  type="text"
                  value={kraPin}
                  onChange={e => setKraPin(e.target.value.toUpperCase())}
                  placeholder="e.g. P051938291X"
                  className="w-full px-3 py-2 text-xs font-mono bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg focus:outline-none focus:border-[#00A651] focus:bg-white text-[#202B27]"
                />
                <span className="text-[11px] text-[#66736B] mt-1 block">
                  Format: 1 Letter + 9 Digits + 1 Letter
                </span>
              </div>

              <div className="pt-2 border-t border-[#E5EAE7] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-[#202B27] block">
                      16% VAT Registered Business
                    </span>
                    <span className="text-[11px] text-[#66736B]">
                      Automatically calculate Kenya standard 16% VAT on applicable sales
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={vatRegistered}
                    onChange={e => setVatRegistered(e.target.checked)}
                    className="w-4 h-4 text-[#00A651] rounded border-[#E5EAE7] focus:ring-[#00A651]"
                  />
                </div>

                {vatRegistered && (
                  <div className="p-3 bg-[#F8FAF9] rounded-lg border border-[#E5EAE7]">
                    <span className="text-xs font-semibold text-[#202B27] block mb-2">
                      Selling Price Tax Display
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <label className={`p-2.5 rounded-lg border cursor-pointer transition-colors ${
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
                        <div className="text-[10px] text-[#66736B] font-normal">Prices shown include 16% VAT (Common in Kenya)</div>
                      </label>

                      <label className={`p-2.5 rounded-lg border cursor-pointer transition-colors ${
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
                        <div className="text-[10px] text-[#66736B] font-normal">16% VAT added on top at invoice checkout</div>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Module Preferences */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#E5EAE7]">
                <div>
                  <span className="text-xs font-semibold text-[#202B27] block">
                    Choose Your Active Modules
                  </span>
                  <span className="text-[11px] text-[#66736B]">
                    Keep your interface clean by activating only what your business needs.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedModules(modulesList.map(m => m.id))}
                  className="text-xs font-semibold text-[#00A651] hover:underline"
                >
                  Select All
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto p-1">
                {modulesList.map(m => {
                  const isChecked = selectedModules.includes(m.id);
                  return (
                    <div
                      key={m.id}
                      onClick={() => toggleModule(m.id)}
                      className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                        isChecked 
                          ? 'bg-[#F0F8F3] border-[#00A651]/40 text-[#202B27]' 
                          : 'bg-white border-[#E5EAE7] text-[#66736B] opacity-70'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-semibold">{m.label}</span>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-3.5 h-3.5 text-[#00A651] rounded"
                        />
                      </div>
                      <span className="text-[10px] text-[#66736B] block leading-tight">{m.desc}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4: First Branch */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="p-3.5 bg-[#F8FAF9] rounded-lg border border-[#E5EAE7]">
                <span className="text-xs font-semibold text-[#202B27] block mb-1">
                  Primary Branch / Headquarters
                </span>
                <p className="text-xs text-[#66736B]">
                  Every business starts with at least one store or dispatch depot. You can add more later in Settings.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202B27] mb-1">
                  Branch Name
                </label>
                <input
                  type="text"
                  value={branchName}
                  onChange={e => setBranchName(e.target.value)}
                  placeholder="e.g. Nairobi CBD - Accra Road (HQ)"
                  className="w-full px-3 py-2 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg focus:outline-none focus:border-[#00A651] focus:bg-white text-[#202B27]"
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
                    value={branchCode}
                    onChange={e => setBranchCode(e.target.value.toUpperCase())}
                    placeholder="e.g. CBD-01"
                    className="w-full px-3 py-2 text-xs font-mono bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg focus:outline-none focus:border-[#00A651] focus:bg-white text-[#202B27]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202B27] mb-1">
                    Specific Location
                  </label>
                  <input
                    type="text"
                    value={branchLocation}
                    onChange={e => setBranchLocation(e.target.value)}
                    placeholder="e.g. Accra Road Ground Floor"
                    className="w-full px-3 py-2 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg focus:outline-none focus:border-[#00A651] focus:bg-white text-[#202B27]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 pt-4 border-t border-[#E5EAE7] flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => { setError(null); setStep(step - 1); }}
                className="px-4 py-2 text-xs font-semibold text-[#66736B] hover:text-[#202B27] flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-xs font-semibold text-[#66736B] hover:text-[#202B27]"
              >
                Cancel
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 bg-[#00A651] hover:bg-[#00843D] text-white font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5 active:scale-[0.98]"
            >
              <span>{step === 4 ? 'Launch BiasharaOS Dashboard' : 'Next Step'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
