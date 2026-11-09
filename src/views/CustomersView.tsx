import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Share2, 
  Printer, 
  Phone, 
  MapPin, 
  FileText,
  DollarSign
} from 'lucide-react';
import { Customer, Invoice, Sale, Organisation } from '../types';
import { 
  formatKES, 
  formatDate, 
  formatKenyanPhone, 
  isValidKenyanPhone,
  isValidKRAPIN, 
  KENYAN_COUNTIES, 
  generateWhatsAppShareLink 
} from '../utils/formatters';
import { Modal } from '../components/common/Modal';

interface CustomersViewProps {
  customers: Customer[];
  invoices: Invoice[];
  sales: Sale[];
  organisation: Organisation;
  onAddCustomer: (customerData: any) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  invoices,
  sales,
  organisation,
  onAddCustomer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [statementCustomer, setStatementCustomer] = useState<Customer | null>(null);

  // New Customer Form
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [customerType, setCustomerType] = useState<Customer['customer_type']>('retail');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [kraPin, setKraPin] = useState('');
  const [county, setCounty] = useState('Nairobi');
  const [creditLimit, setCreditLimit] = useState<number>(50000);
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const totalOutstandingReceivables = customers.reduce((sum, c) => sum + c.outstanding_balance, 0);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!name.trim()) {
      setFormError('Customer name is required');
      return;
    }
    if (!phone.trim() || !isValidKenyanPhone(phone)) {
      setFormError('Please enter a valid Kenyan phone number (e.g. 0722 000 000 or +254 722 000 000)');
      return;
    }
    if (kraPin && !isValidKRAPIN(kraPin)) {
      setFormError('KRA PIN must follow Kenyan format (e.g. P051234567Z)');
      return;
    }

    onAddCustomer({
      organisation_id: organisation.id,
      name,
      company_name: companyName || undefined,
      customer_type: customerType,
      phone,
      email: email || undefined,
      kra_pin: kraPin ? kraPin.toUpperCase() : undefined,
      county,
      credit_limit: creditLimit,
      notes: notes || undefined,
    });

    setIsAddOpen(false);
    setName('');
    setCompanyName('');
    setPhone('');
    setEmail('');
    setKraPin('');
    setNotes('');
  };

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.company_name && c.company_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.phone.includes(searchQuery);
    const matchesType = typeFilter === 'all' || c.customer_type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5EAE7]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#202B27] tracking-tight">
            Customer Directory & Accounts
          </h1>
          <p className="text-xs text-[#66736B] mt-0.5">
            Manage client profiles, credit limits, purchase histories, and WhatsApp debt statements
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2.5 bg-[#00A651] hover:bg-[#00843D] text-white font-semibold text-xs rounded-lg shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-[#E5EAE7] shadow-xs">
          <span className="text-xs font-medium text-[#66736B] block">Total Customer Debts (Receivables)</span>
          <span className="text-xl sm:text-2xl font-bold text-red-600 font-mono tabular-nums block mt-1">
            {formatKES(totalOutstandingReceivables)}
          </span>
          <span className="text-[11px] text-[#66736B] mt-1 block">
            Across {customers.filter(c => c.outstanding_balance > 0).length} debtor accounts
          </span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#E5EAE7] shadow-xs">
          <span className="text-xs font-medium text-[#66736B] block">Registered Clients</span>
          <span className="text-xl sm:text-2xl font-bold text-[#202B27] font-mono tabular-nums block mt-1">
            {customers.length}
          </span>
          <span className="text-[11px] text-[#66736B] mt-1 block">
            Corporate, wholesale & retail
          </span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#E5EAE7] shadow-xs">
          <span className="text-xs font-medium text-[#66736B] block">Clean Balance Customers</span>
          <span className="text-xl sm:text-2xl font-bold text-[#00843D] font-mono tabular-nums block mt-1">
            {customers.filter(c => c.outstanding_balance === 0).length}
          </span>
          <span className="text-[11px] text-[#00843D] mt-1 block">
            Zero overdue balances
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#66736B]" />
          <input
            type="text"
            placeholder="Search customer name, company, phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#E5EAE7] rounded-lg focus:outline-none focus:border-[#00A651] text-[#202B27]"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-white border border-[#E5EAE7] rounded-lg self-stretch sm:self-auto overflow-x-auto">
          {['all', 'corporate', 'wholesale', 'retail', 'individual'].map(type => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                typeFilter === type ? 'bg-[#00A651] text-white shadow-xs' : 'text-[#66736B] hover:text-[#202B27]'
              }`}
            >
              {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl border border-[#E5EAE7] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F8FAF9] text-[#66736B] border-b border-[#E5EAE7] font-medium">
              <tr>
                <th className="px-4 py-3">Customer / Company</th>
                <th className="px-4 py-3">Phone & Location</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 text-right">Credit Limit</th>
                <th className="px-4 py-3 text-right">Outstanding Balance</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EAE7]">
              {filteredCustomers.map(c => (
                <tr key={c.id} className="hover:bg-[#F8FAF9] transition-colors">
                  <td className="px-4 py-3.5">
                    <span className="font-semibold text-[#202B27] block">{c.name}</span>
                    {c.company_name && c.company_name !== c.name && (
                      <span className="text-[11px] text-[#66736B] block">{c.company_name}</span>
                    )}
                    {c.kra_pin && (
                      <span className="text-[10px] text-[#66736B] font-mono">PIN: {c.kra_pin}</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-[#202B27] block">{formatKenyanPhone(c.phone)}</span>
                    <span className="text-[11px] text-[#66736B]">{c.county} County</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="capitalize text-xs font-medium text-[#202B27]">{c.customer_type}</span>
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-[#66736B] tabular-nums">
                    {formatKES(c.credit_limit)}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold tabular-nums">
                    {c.outstanding_balance > 0 ? (
                      <span className="text-red-600">{formatKES(c.outstanding_balance)}</span>
                    ) : (
                      <span className="text-[#00843D]">KES 0.00</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => setStatementCustomer(c)}
                      className="px-2.5 py-1 text-xs text-[#00A651] hover:bg-[#F0F8F3] font-medium border border-[#00A651]/30 rounded transition-colors inline-flex items-center gap-1"
                    >
                      <FileText className="w-3 h-3" />
                      <span>Statement</span>
                    </button>
                    {c.outstanding_balance > 0 && (
                      <a
                        href={generateWhatsAppShareLink(
                          c.phone,
                          `Habari ${c.name}, this is a reminder from ${organisation.trading_name || organisation.name}. Your outstanding balance is ${formatKES(c.outstanding_balance)}. Please remit via M-Pesa Paybill 892019 or KCB Bank. Asante sana.`
                        )}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 text-xs bg-[#00A651] text-white font-medium rounded hover:bg-[#00843D] transition-colors inline-flex items-center gap-1"
                      >
                        <Share2 className="w-3 h-3" />
                        <span>Remind</span>
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Register New Customer"
        subtitle="Add individual or commercial client contact and credit details"
        maxWidth="lg"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          {formError && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-[#202B27] mb-1">
                Customer / Contact Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Wangari Njeri"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
                required
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-[#202B27] mb-1">
                Company / Business Name (if applicable)
              </label>
              <input
                type="text"
                placeholder="e.g. Wangari Building & Contracting Ltd"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202B27] mb-1">
                Customer Type
              </label>
              <select
                value={customerType}
                onChange={e => setCustomerType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
              >
                <option value="retail">Retail Buyer</option>
                <option value="wholesale">Wholesale Trader</option>
                <option value="corporate">Corporate / Developer</option>
                <option value="individual">Individual Contractor / Fundi</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202B27] mb-1">
                Kenyan Mobile (M-Pesa) *
              </label>
              <input
                type="tel"
                placeholder="e.g. 0722 000 000"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
                required
              />
            </div>

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
                KRA PIN Number (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. P051293847K"
                value={kraPin}
                onChange={e => setKraPin(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 text-xs font-mono uppercase bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-[#202B27] mb-1">
                Approved Credit Limit (KES)
              </label>
              <input
                type="number"
                min="0"
                step="5000"
                value={creditLimit}
                onChange={e => setCreditLimit(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs font-mono bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-[#202B27] mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="procurement@client.co.ke"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-[#202B27] mb-1">
                Internal Notes / Delivery Address
              </label>
              <input
                type="text"
                placeholder="e.g. Site supervisor delivery contact in Kilimani"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 text-xs text-[#66736B]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#00A651] hover:bg-[#00843D] text-white font-semibold text-xs rounded-lg shadow-xs"
            >
              Save Customer
            </button>
          </div>
        </form>
      </Modal>

      {/* Customer Statement Modal */}
      {statementCustomer && (
        <Modal
          isOpen={true}
          onClose={() => setStatementCustomer(null)}
          title={`Customer Statement: ${statementCustomer.name}`}
          subtitle={`County: ${statementCustomer.county} · Tel: ${formatKenyanPhone(statementCustomer.phone)}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="p-4 bg-white border border-[#E5EAE7] rounded-lg space-y-4 text-xs shadow-xs">
              <div className="flex justify-between items-start pb-3 border-b border-[#E5EAE7]">
                <div>
                  <div className="font-bold text-sm text-[#202B27] uppercase">{organisation.name}</div>
                  <div className="text-[#66736B]">Customer Ledger Statement</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-[#66736B]">Statement Date: {formatDate(new Date())}</div>
                  <div className="font-mono font-bold text-red-600 text-sm mt-0.5">
                    Balance Due: {formatKES(statementCustomer.outstanding_balance)}
                  </div>
                </div>
              </div>

              {/* Transactions in statement */}
              <div>
                <span className="text-[11px] font-bold text-[#66736B] uppercase tracking-wider block mb-2">
                  Invoice & Transaction Ledger
                </span>
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#F8FAF9] border-y border-[#E5EAE7] text-[#66736B]">
                    <tr>
                      <th className="py-2 px-3">Date / Document</th>
                      <th className="py-2 px-3 text-right">Invoiced (KES)</th>
                      <th className="py-2 px-3 text-right">Paid (KES)</th>
                      <th className="py-2 px-3 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5EAE7]">
                    {invoices.filter(i => i.customer_id === statementCustomer.id).map(inv => (
                      <tr key={inv.id}>
                        <td className="py-2 px-3">
                          <span className="font-semibold text-[#202B27] font-mono">{inv.invoice_number}</span>
                          <span className="text-[11px] text-[#66736B] block">{formatDate(inv.issue_date)}</span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-[#202B27]">
                          {formatKES(inv.grand_total)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-[#00843D]">
                          {formatKES(inv.amount_paid)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-red-600">
                          {formatKES(inv.balance_due)}
                        </td>
                      </tr>
                    ))}
                    {invoices.filter(i => i.customer_id === statementCustomer.id).length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-[#66736B]">
                          No formal credit invoices issued for this customer.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <a
                href={generateWhatsAppShareLink(
                  statementCustomer.phone,
                  `Habari ${statementCustomer.name}, here is your account statement from ${organisation.trading_name || organisation.name}. Outstanding balance: ${formatKES(statementCustomer.outstanding_balance)}. Thank you for your partnership.`
                )}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-[#00A651] hover:bg-[#00843D] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Send Statement on WhatsApp</span>
              </a>

              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#202B27] hover:bg-black text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Statement</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
