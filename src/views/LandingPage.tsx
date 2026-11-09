import React from 'react';
import { 
  Check, 
  ArrowRight, 
  Store, 
  Package, 
  FileText, 
  CreditCard, 
  Calculator, 
  BarChart3, 
  ShieldCheck, 
  Sparkles,
  Smartphone,
  Layers,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

interface LandingPageProps {
  onOpenApp: () => void;
  onOpenAuth: (mode: 'signin' | 'signup') => void;
  onOpenOnboarding: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenApp,
  onOpenAuth,
  onOpenOnboarding,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF9] text-[#202B27]">
      {/* Navbar with 3-zone contract */}
      <Navbar
        onSignInClick={() => onOpenAuth('signin')}
        onGetStartedClick={onOpenOnboarding}
        onLaunchDemoClick={onOpenApp}
      />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden bg-white border-b border-[#E5EAE7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F0F8F3] text-[#00843D] rounded-md text-xs font-semibold mb-6 border border-[#00A651]/20">
              <span className="w-2 h-2 rounded-full bg-[#00A651]" />
              Built for Kenyan SMEs · Nairobi, Mombasa, Kisumu & all 47 Counties
            </div>
            
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#202B27] tracking-tight leading-[1.15] mb-6 text-balance">
              Run your business. <br className="hidden sm:inline" />
              Not a dozen different apps.
            </h1>
            
            <p className="text-base sm:text-lg text-[#66736B] leading-relaxed mb-8 max-w-2xl mx-auto">
              Sales, stock, customers, payments and business insights — all in one simple platform designed specifically for Kenyan businesses.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={onOpenOnboarding}
                className="w-full sm:w-auto px-6 py-3.5 bg-[#00A651] hover:bg-[#00843D] text-white font-semibold text-sm rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <span>Start managing your business</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={onOpenApp}
                className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-[#F8FAF9] text-[#202B27] font-semibold text-sm rounded-lg border border-[#E5EAE7] transition-all flex items-center justify-center gap-2"
              >
                <span>Explore the live platform</span>
              </button>
            </div>
          </div>

          {/* Realistic Product Dashboard Preview */}
          <div className="max-w-5xl mx-auto mt-8 rounded-xl border border-[#E5EAE7] bg-[#F8FAF9] p-2.5 sm:p-4 shadow-xl">
            <div className="rounded-lg bg-white border border-[#E5EAE7] overflow-hidden shadow-xs">
              {/* Fake Browser / App Top Header */}
              <div className="bg-[#202B27] px-4 py-3 flex items-center justify-between text-white text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 font-medium opacity-80">Simba Hardware Kenya · Accra Road CBD</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] bg-white/10 px-2 py-0.5 rounded text-emerald-400 font-mono">
                    KES Default Currency
                  </span>
                  <span className="text-[11px] bg-white/10 px-2 py-0.5 rounded text-emerald-300">
                    M-Pesa STK Active
                  </span>
                </div>
              </div>

              {/* Inside Dashboard Snippet */}
              <div className="p-4 sm:p-6 space-y-6">
                {/* 4 KPI metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                  <div className="p-3.5 bg-[#F8FAF9] rounded-lg border border-[#E5EAE7]">
                    <span className="text-xs text-[#66736B] block">Today's Sales</span>
                    <span className="text-lg sm:text-xl font-bold text-[#202B27] font-mono tabular-nums mt-1 block">
                      KES 111,680.00
                    </span>
                    <span className="text-[11px] text-[#00A651] font-medium mt-1 inline-flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> +18.4% vs yesterday
                    </span>
                  </div>

                  <div className="p-3.5 bg-[#F8FAF9] rounded-lg border border-[#E5EAE7]">
                    <span className="text-xs text-[#66736B] block">Unpaid Invoices</span>
                    <span className="text-lg sm:text-xl font-bold text-[#202B27] font-mono tabular-nums mt-1 block">
                      KES 445,400.00
                    </span>
                    <span className="text-[11px] text-amber-700 font-medium mt-1 block">
                      3 invoices due this week
                    </span>
                  </div>

                  <div className="p-3.5 bg-[#F8FAF9] rounded-lg border border-[#E5EAE7]">
                    <span className="text-xs text-[#66736B] block">Stock Valuation</span>
                    <span className="text-lg sm:text-xl font-bold text-[#202B27] font-mono tabular-nums mt-1 block">
                      KES 1,428,500.00
                    </span>
                    <span className="text-[11px] text-[#66736B] font-medium mt-1 block">
                      Across 3 branches
                    </span>
                  </div>

                  <div className="p-3.5 bg-[#F8FAF9] rounded-lg border border-[#E5EAE7]">
                    <span className="text-xs text-[#66736B] block">Gross Margin</span>
                    <span className="text-lg sm:text-xl font-bold text-[#00843D] font-mono tabular-nums mt-1 block">
                      24.8%
                    </span>
                    <span className="text-[11px] text-[#00843D] font-medium mt-1 block">
                      Healthy retail margin
                    </span>
                  </div>
                </div>

                {/* Sub-preview: Quick POS row & Recent Orders */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 p-3.5 bg-white rounded-lg border border-[#E5EAE7]">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E5EAE7]">
                      <span className="text-xs font-semibold text-[#202B27]">Recent Sales & M-Pesa Tills</span>
                      <span className="text-[11px] text-[#00A651] font-medium">Reconciled Today</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2 bg-[#F8FAF9] rounded">
                        <div>
                          <div className="font-semibold text-[#202B27]">Wangari Building & Contracting</div>
                          <div className="text-[10px] text-[#66736B]">Bamburi Cement 50kg (50 Bags) · M-Pesa QHL893214M</div>
                        </div>
                        <span className="font-mono font-bold text-[#202B27]">KES 68,400.00</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-[#F8FAF9] rounded">
                        <div>
                          <div className="font-semibold text-[#202B27]">Walk-in Cash Customer</div>
                          <div className="text-[10px] text-[#66736B]">Yale Brass Padlock 60mm · Cash Till</div>
                        </div>
                        <span className="font-mono font-bold text-[#202B27]">KES 5,860.00</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-[#F0F8F3] rounded-lg border border-[#00A651]/20 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-semibold text-[#00843D] block mb-1">
                        Kenyan Ready Engine
                      </span>
                      <p className="text-[11px] text-[#66736B] leading-relaxed">
                        Automatic 16% VAT calculation, eTIMS compliant structure, and direct M-Pesa phone STK push.
                      </p>
                    </div>
                    <button
                      onClick={onOpenApp}
                      className="mt-4 w-full py-2 bg-[#00A651] text-white text-xs font-semibold rounded-md shadow-xs hover:bg-[#00843D] transition-colors"
                    >
                      Open Live App & POS
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Challenges Section */}
      <section className="py-16 md:py-24 bg-[#F8FAF9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#202B27] tracking-tight mb-3">
              The everyday struggles of Kenyan business owners
            </h2>
            <p className="text-sm text-[#66736B]">
              Most shops juggle notebooks, SMS messages, Excel sheets, and disconnected POS machines. BiasharaOS fixes that.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-xl border border-[#E5EAE7] shadow-xs">
              <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold text-sm mb-4">
                1
              </div>
              <h3 className="text-base font-semibold text-[#202B27] mb-2">
                Disconnected business records
              </h3>
              <p className="text-xs text-[#66736B] leading-relaxed">
                Sales recorded in counter books, purchases on paper delivery notes, and expenses on loose receipts. Reconciling month-end is stressful and prone to cash leakage.
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl border border-[#E5EAE7] shadow-xs">
              <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-sm mb-4">
                2
              </div>
              <h3 className="text-base font-semibold text-[#202B27] mb-2">
                Unclear stock levels & shrinkage
              </h3>
              <p className="text-xs text-[#66736B] leading-relaxed">
                You never know if items are running low until a customer walks in and leaves empty-handed. Without traceable movements, untracked stock disappears silently.
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl border border-[#E5EAE7] shadow-xs">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm mb-4">
                3
              </div>
              <h3 className="text-base font-semibold text-[#202B27] mb-2">
                Difficult payment reconciliation
              </h3>
              <p className="text-xs text-[#66736B] leading-relaxed">
                Staff passing around phones to check M-Pesa confirmation SMS messages. BiasharaOS verifies M-Pesa transaction codes and matches them directly to receipts.
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl border border-[#E5EAE7] shadow-xs">
              <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold text-sm mb-4">
                4
              </div>
              <h3 className="text-base font-semibold text-[#202B27] mb-2">
                Unpaid customer invoices & debts
              </h3>
              <p className="text-xs text-[#66736B] leading-relaxed">
                Customers taking goods on credit without clear debt limits or payment reminders. Keep clear customer ledgers and send WhatsApp statements with one tap.
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl border border-[#E5EAE7] shadow-xs">
              <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-sm mb-4">
                5
              </div>
              <h3 className="text-base font-semibold text-[#202B27] mb-2">
                Limited business visibility
              </h3>
              <p className="text-xs text-[#66736B] leading-relaxed">
                You make millions in revenue but don't know whether you actually made a profit after rent, transport, salaries, and supplier invoices are deducted.
              </p>
            </div>

            <div className="p-6 bg-[#F0F8F3] rounded-xl border border-[#00A651]/20 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-lg bg-[#00A651] text-white flex items-center justify-center font-bold text-sm mb-4">
                  ✓
                </div>
                <h3 className="text-base font-semibold text-[#00843D] mb-2">
                  The BiasharaOS Solution
                </h3>
                <p className="text-xs text-[#66736B] leading-relaxed">
                  One clean operating system. Real-time gross profit, balanced double-entry accounts, M-Pesa tracking, and multi-branch control.
                </p>
              </div>
              <button
                onClick={onOpenOnboarding}
                className="mt-4 inline-flex items-center text-xs font-semibold text-[#00843D] hover:underline"
              >
                Create your business account →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section id="features" className="py-16 md:py-24 bg-white border-y border-[#E5EAE7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#202B27] tracking-tight mb-3">
              Comprehensive modules for growing Kenyan businesses
            </h2>
            <p className="text-sm text-[#66736B]">
              Activate only what you need. From a simple retail till to multi-warehouse enterprise management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-[#E5EAE7] bg-[#F8FAF9] hover:border-[#00A651]/40 transition-colors">
              <Store className="w-6 h-6 text-[#00A651] mb-3" />
              <h3 className="text-base font-semibold text-[#202B27] mb-2">Point of Sale & Invoicing</h3>
              <p className="text-xs text-[#66736B] leading-relaxed">
                Fast POS for counters with instant barcode scanning, discount controls, 16% VAT support, professional tax invoices, and thermal receipt printing.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-[#E5EAE7] bg-[#F8FAF9] hover:border-[#00A651]/40 transition-colors">
              <Package className="w-6 h-6 text-[#00A651] mb-3" />
              <h3 className="text-base font-semibold text-[#202B27] mb-2">Traceable Inventory</h3>
              <p className="text-xs text-[#66736B] leading-relaxed">
                Every quantity change is logged with a traceable stock movement. Track reorder levels, stock adjustments, branch transfers, and total inventory asset valuation.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-[#E5EAE7] bg-[#F8FAF9] hover:border-[#00A651]/40 transition-colors">
              <CreditCard className="w-6 h-6 text-[#00A651] mb-3" />
              <h3 className="text-base font-semibold text-[#202B27] mb-2">M-Pesa & Payment Hub</h3>
              <p className="text-xs text-[#66736B] leading-relaxed">
                Accept M-Pesa, Cash, Bank Transfer, and Credit. Simulated Safaricom Daraja STK Push prompt for instantaneous customer till verification.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-[#E5EAE7] bg-[#F8FAF9] hover:border-[#00A651]/40 transition-colors">
              <Calculator className="w-6 h-6 text-[#00A651] mb-3" />
              <h3 className="text-base font-semibold text-[#202B27] mb-2">Double-Entry Accounting</h3>
              <p className="text-xs text-[#66736B] leading-relaxed">
                Standard chart of accounts, balanced journal entries, real-time Profit & Loss statement, Balance Sheet, and cash flow without manual calculations.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-[#E5EAE7] bg-[#F8FAF9] hover:border-[#00A651]/40 transition-colors">
              <FileText className="w-6 h-6 text-[#00A651] mb-3" />
              <h3 className="text-base font-semibold text-[#202B27] mb-2">eTIMS Compliance Readiness</h3>
              <p className="text-xs text-[#66736B] leading-relaxed">
                Structured for KRA electronic Tax Invoice Management System (VSCU/OSCU protocol). Generates tax signatures and compliant invoice data payloads.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-[#E5EAE7] bg-[#F8FAF9] hover:border-[#00A651]/40 transition-colors">
              <BarChart3 className="w-6 h-6 text-[#00A651] mb-3" />
              <h3 className="text-base font-semibold text-[#202B27] mb-2">Reports & CSV Exports</h3>
              <p className="text-xs text-[#66736B] leading-relaxed">
                Daily, weekly, and monthly sales summaries, fast-moving items, customer credit ledgers, and one-click CSV export for your auditor or KRA returns.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Industry Solutions */}
      <section id="solutions" className="py-16 md:py-24 bg-[#F8FAF9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#202B27] tracking-tight mb-3">
              Tailored for Kenya's most vibrant industries
            </h2>
            <p className="text-sm text-[#66736B]">
              Whether you run a fast-paced retail counter or a heavy wholesale distribution depot.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-5 bg-white rounded-xl border border-[#E5EAE7]">
              <span className="text-xs font-bold text-[#00843D] uppercase tracking-wider block mb-1">Retail Supermarkets & Shops</span>
              <h4 className="text-base font-semibold text-[#202B27] mb-2">High-speed counter checkout</h4>
              <p className="text-xs text-[#66736B] leading-relaxed">
                Instant barcode lookup, cash drawer handling, M-Pesa receipt verification, and automatic item decrement.
              </p>
            </div>

            <div className="p-5 bg-white rounded-xl border border-[#E5EAE7]">
              <span className="text-xs font-bold text-[#00843D] uppercase tracking-wider block mb-1">Hardware & Construction</span>
              <h4 className="text-base font-semibold text-[#202B27] mb-2">Bulky items & site deliveries</h4>
              <p className="text-xs text-[#66736B] leading-relaxed">
                Manage cement bags, timber, iron sheets, contractor credit terms, dispatch notes, and multiple yard depots.
              </p>
            </div>

            <div className="p-5 bg-white rounded-xl border border-[#E5EAE7]">
              <span className="text-xs font-bold text-[#00843D] uppercase tracking-wider block mb-1">Wholesale & Distribution</span>
              <h4 className="text-base font-semibold text-[#202B27] mb-2">B2B tiered pricing & cartons</h4>
              <p className="text-xs text-[#66736B] leading-relaxed">
                Wholesale bulk discounts, supplier purchase orders, outstanding debtor balances, and truck dispatch logs.
              </p>
            </div>

            <div className="p-5 bg-white rounded-xl border border-[#E5EAE7]">
              <span className="text-xs font-bold text-[#00843D] uppercase tracking-wider block mb-1">Electronics & Phones</span>
              <h4 className="text-base font-semibold text-[#202B27] mb-2">Serial number & warranty tracking</h4>
              <p className="text-xs text-[#66736B] leading-relaxed">
                Record IMEI numbers, accessories catalogue, high-value supplier payments, and repair job cards.
              </p>
            </div>

            <div className="p-5 bg-white rounded-xl border border-[#E5EAE7]">
              <span className="text-xs font-bold text-[#00843D] uppercase tracking-wider block mb-1">Beauty & Cosmetics</span>
              <h4 className="text-base font-semibold text-[#202B27] mb-2">Variants, brands & fast reorders</h4>
              <p className="text-xs text-[#66736B] leading-relaxed">
                Manage shades, sizes, perfumes, expiry dates, supplier re-orders, and staff commission tracking.
              </p>
            </div>

            <div className="p-5 bg-white rounded-xl border border-[#E5EAE7]">
              <span className="text-xs font-bold text-[#00843D] uppercase tracking-wider block mb-1">Services & Consultancies</span>
              <h4 className="text-base font-semibold text-[#202B27] mb-2">Professional fees & milestones</h4>
              <p className="text-xs text-[#66736B] leading-relaxed">
                Bill corporate clients with KRA PIN compliant invoices, track partial payments, and manage expenses.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-16 md:py-24 bg-white border-y border-[#E5EAE7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#202B27] tracking-tight mb-3">
              Up and running in less than 5 minutes
            </h2>
            <p className="text-sm text-[#66736B]">
              No complicated installation or months of training required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4">
              <div className="w-10 h-10 rounded-full bg-[#00A651] text-white flex items-center justify-center font-bold text-sm mx-auto mb-3 shadow-xs">
                1
              </div>
              <h4 className="text-sm font-semibold text-[#202B27] mb-1">Create your business</h4>
              <p className="text-xs text-[#66736B]">
                Enter your business name, county, and contact details in our simple setup wizard.
              </p>
            </div>

            <div className="text-center p-4">
              <div className="w-10 h-10 rounded-full bg-[#00A651] text-white flex items-center justify-center font-bold text-sm mx-auto mb-3 shadow-xs">
                2
              </div>
              <h4 className="text-sm font-semibold text-[#202B27] mb-1">Choose your modules</h4>
              <p className="text-xs text-[#66736B]">
                Pick the exact tools you need today. You can always toggle more on as you expand.
              </p>
            </div>

            <div className="text-center p-4">
              <div className="w-10 h-10 rounded-full bg-[#00A651] text-white flex items-center justify-center font-bold text-sm mx-auto mb-3 shadow-xs">
                3
              </div>
              <h4 className="text-sm font-semibold text-[#202B27] mb-1">Set up stock & customers</h4>
              <p className="text-xs text-[#66736B]">
                Add your items, purchase costs, selling prices, and regular clients.
              </p>
            </div>

            <div className="text-center p-4">
              <div className="w-10 h-10 rounded-full bg-[#00A651] text-white flex items-center justify-center font-bold text-sm mx-auto mb-3 shadow-xs">
                4
              </div>
              <h4 className="text-sm font-semibold text-[#202B27] mb-1">Start managing operations</h4>
              <p className="text-xs text-[#66736B]">
                Record your first sale, collect M-Pesa payments, and track live profits instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 md:py-24 bg-[#F8FAF9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#202B27] tracking-tight mb-3">
              Simple, transparent pricing in Kenyan Shillings
            </h2>
            <p className="text-sm text-[#66736B]">
              Affordable plans built for Kenyan cash flows. All plans include KES currency, M-Pesa readiness, and mobile support.
            </p>
            <span className="text-[11px] text-[#66736B] italic mt-2 block">
              (Illustrative subscription tiers · Configurable based on enterprise requirements)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <div className="p-6 bg-white rounded-xl border border-[#E5EAE7] flex flex-col justify-between shadow-xs">
              <div>
                <span className="text-xs font-bold text-[#00843D] uppercase tracking-wider block mb-1">
                  Starter Plan
                </span>
                <h3 className="text-xl font-bold text-[#202B27] mb-1">Small Retail & Dukas</h3>
                <p className="text-xs text-[#66736B] mb-4">
                  For single-store shopkeepers managing daily counter sales and stock.
                </p>
                
                <div className="mb-6 font-mono">
                  <span className="text-3xl font-extrabold text-[#202B27]">KES 1,500</span>
                  <span className="text-xs text-[#66736B] font-sans"> / month</span>
                </div>

                <ul className="space-y-2.5 text-xs text-[#66736B] mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#00A651] shrink-0" />
                    <span>1 Store Location (Branch)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#00A651] shrink-0" />
                    <span>Point of Sale & Thermal Receipts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#00A651] shrink-0" />
                    <span>Up to 500 Product Catalogue Items</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#00A651] shrink-0" />
                    <span>Cash & M-Pesa Payment Recording</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#00A651] shrink-0" />
                    <span>Daily Sales & Profit Summary</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={onOpenOnboarding}
                className="w-full py-2.5 bg-white border border-[#E5EAE7] hover:bg-[#F8FAF9] text-[#202B27] text-xs font-semibold rounded-lg transition-colors"
              >
                Choose Starter
              </button>
            </div>

            {/* Growth Plan (Popular) */}
            <div className="p-6 bg-white rounded-xl border-2 border-[#00A651] flex flex-col justify-between shadow-md relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#00A651] text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-xs">
                Most Popular
              </div>

              <div>
                <span className="text-xs font-bold text-[#00843D] uppercase tracking-wider block mb-1">
                  Growth Plan
                </span>
                <h3 className="text-xl font-bold text-[#202B27] mb-1">Growing Wholesale & Trade</h3>
                <p className="text-xs text-[#66736B] mb-4">
                  For expanding businesses needing staff roles, invoices, and debt tracking.
                </p>
                
                <div className="mb-6 font-mono">
                  <span className="text-3xl font-extrabold text-[#202B27]">KES 3,800</span>
                  <span className="text-xs text-[#66736B] font-sans"> / month</span>
                </div>

                <ul className="space-y-2.5 text-xs text-[#66736B] mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#00A651] shrink-0" />
                    <span>Up to 3 Branches or Stores</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#00A651] shrink-0" />
                    <span>Everything in Starter + Invoicing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#00A651] shrink-0" />
                    <span>Daraja M-Pesa STK Push Sandbox</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#00A651] shrink-0" />
                    <span>Customer Statements & WhatsApp Share</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#00A651] shrink-0" />
                    <span>Staff Roles & Permission Controls</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#00A651] shrink-0" />
                    <span>Supplier Purchase Orders & Deliveries</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={onOpenOnboarding}
                className="w-full py-2.5 bg-[#00A651] hover:bg-[#00843D] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
              >
                Start Growth Plan
              </button>
            </div>

            {/* Business Plan */}
            <div className="p-6 bg-white rounded-xl border border-[#E5EAE7] flex flex-col justify-between shadow-xs">
              <div>
                <span className="text-xs font-bold text-[#00843D] uppercase tracking-wider block mb-1">
                  Business Plan
                </span>
                <h3 className="text-xl font-bold text-[#202B27] mb-1">Enterprise & Multi-Branch</h3>
                <p className="text-xs text-[#66736B] mb-4">
                  For large distributors, hardware chains, and eTIMS tax compliance.
                </p>
                
                <div className="mb-6 font-mono">
                  <span className="text-3xl font-extrabold text-[#202B27]">KES 7,500</span>
                  <span className="text-xs text-[#66736B] font-sans"> / month</span>
                </div>

                <ul className="space-y-2.5 text-xs text-[#66736B] mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#00A651] shrink-0" />
                    <span>Unlimited Branches & Warehouses</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#00A651] shrink-0" />
                    <span>Full Double-Entry Accounting & Ledger</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#00A651] shrink-0" />
                    <span>eTIMS Middleware Ready Architecture</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#00A651] shrink-0" />
                    <span>Inter-branch Stock Transfers & Audits</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#00A651] shrink-0" />
                    <span>Unlimited Staff Users & Audit Logs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#00A651] shrink-0" />
                    <span>Priority Kenyan Support (WhatsApp/Phone)</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={onOpenOnboarding}
                className="w-full py-2.5 bg-white border border-[#E5EAE7] hover:bg-[#F8FAF9] text-[#202B27] text-xs font-semibold rounded-lg transition-colors"
              >
                Choose Business
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Illustrative Testimonials / Case Studies */}
      <section className="py-16 md:py-20 bg-white border-b border-[#E5EAE7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-[#00843D] uppercase tracking-wider block mb-1">
              Illustrative Business Scenarios
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#202B27] tracking-tight">
              Designed for real Kenyan operating conditions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="p-6 bg-[#F8FAF9] rounded-xl border border-[#E5EAE7]">
              <p className="text-xs text-[#202B27] leading-relaxed italic mb-4">
                "In Accra Road downtown, we handle hundreds of walk-in builders daily while coordinating lorry deliveries to Westlands and Ruiru. Having live stock visibility across our shops and knowing exactly who paid via M-Pesa stopped our counter disputes immediately."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#00A651] text-white flex items-center justify-center text-xs font-bold">
                  JK
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#202B27]">Josphat Kamau</div>
                  <div className="text-[11px] text-[#66736B]">Managing Director · Simba General Hardware (Nairobi CBD)</div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-[#F8FAF9] rounded-xl border border-[#E5EAE7]">
              <p className="text-xs text-[#202B27] leading-relaxed italic mb-4">
                "Our retail store used to record credit in counter books that frequently went missing. With BiasharaOS customer ledgers, we send customer balance statements directly via WhatsApp and get paid twice as fast."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#202B27] text-white flex items-center justify-center text-xs font-bold">
                  WN
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#202B27]">Wangari Njeri</div>
                  <div className="text-[11px] text-[#66736B]">Proprietor · Njeri Agro-Hardware (Nakuru County)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 md:py-24 bg-[#F8FAF9]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#202B27] tracking-tight mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-[#66736B]">
              Everything you need to know about setting up and using BiasharaOS in Kenya.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-white rounded-lg border border-[#E5EAE7]">
              <h4 className="text-sm font-semibold text-[#202B27] mb-1">
                Does BiasharaOS support Safaricom M-Pesa payments?
              </h4>
              <p className="text-xs text-[#66736B] leading-relaxed">
                Yes! BiasharaOS is built with an M-Pesa-first architecture. It records Till, Paybill, and Send Money transactions, and provides a simulated Safaricom Daraja STK Push sandbox ready for live production credentials.
              </p>
            </div>

            <div className="p-4 bg-white rounded-lg border border-[#E5EAE7]">
              <h4 className="text-sm font-semibold text-[#202B27] mb-1">
                How does the KRA eTIMS integration work?
              </h4>
              <p className="text-xs text-[#66736B] leading-relaxed">
                We believe in total transparency: having a KRA PIN or 16% VAT calculation alone does not make an app legally certified. BiasharaOS includes a dedicated eTIMS middleware integration layer modeled after the KRA VSCU/OSCU specifications, generating the exact JSON payloads required when connecting to your official certified device or server middleware.
              </p>
            </div>

            <div className="p-4 bg-white rounded-lg border border-[#E5EAE7]">
              <h4 className="text-sm font-semibold text-[#202B27] mb-1">
                Can I use BiasharaOS on my smartphone?
              </h4>
              <p className="text-xs text-[#66736B] leading-relaxed">
                Absolutely. BiasharaOS is designed mobile-first. Business owners can monitor live counter sales, approve purchase orders, check stock levels, and send invoice links directly from their phones.
              </p>
            </div>

            <div className="p-4 bg-white rounded-lg border border-[#E5EAE7]">
              <h4 className="text-sm font-semibold text-[#202B27] mb-1">
                Can I manage multiple shops or warehouses?
              </h4>
              <p className="text-xs text-[#66736B] leading-relaxed">
                Yes. BiasharaOS supports multi-branch operations. You can track inventory at Nairobi CBD, Westlands, and Industrial Area, and record traceable inter-branch stock transfers with complete audit logs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-[#202B27] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight mb-4">
            Take control of your business operations today
          </h2>
          <p className="text-sm text-neutral-300 max-w-xl mx-auto mb-8">
            Join thousands of forward-thinking Kenyan business owners who run on BiasharaOS.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onOpenOnboarding}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#00A651] hover:bg-[#00843D] text-white font-semibold text-sm rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <span>Create your business in 2 minutes</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenApp}
              className="w-full sm:w-auto px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded-lg transition-all"
            >
              <span>Explore live demo</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};
