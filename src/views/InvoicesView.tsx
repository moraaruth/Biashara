import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Printer, 
  Share2, 
  CreditCard, 
  Calendar, 
  AlertCircle,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { 
  Invoice, 
  Customer, 
  Product, 
  Organisation, 
  InvoiceStatus,
  PaymentMethod 
} from '../types';
import { 
  formatKES, 
  formatDate, 
  formatKenyanPhone, 
  generateWhatsAppShareLink,
  generateMPesaRef 
} from '../utils/formatters';
import { Modal } from '../components/common/Modal';
import { StatusBadge } from '../components/common/StatusBadge';

interface InvoicesViewProps {
  invoices: Invoice[];
  customers: Customer[];
  products: Product[];
  organisation: Organisation;
  onCreateInvoice: (invoiceData: any) => void;
  onRecordPayment: (invoiceId: string, amount: number, method: PaymentMethod, ref: string) => void;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({
  invoices,
  customers,
  products,
  organisation,
  onCreateInvoice,
  onRecordPayment,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<Invoice | null>(null);

  // Partial Payment State
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('mpesa');
  const [payRef, setPayRef] = useState('');

  // Create Invoice State
  const [customerId, setCustomerId] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [paymentTerms, setPaymentTerms] = useState('Payment due within 30 days. Payments via KCB Corporate or M-Pesa Paybill.');
  const [items, setItems] = useState<{
    product_id?: string;
    description: string;
    quantity: number;
    unit_price: number;
    tax_rate: number;
  }[]>([
    { description: 'Construction supply batch', quantity: 1, unit_price: 10000, tax_rate: 0.16 }
  ]);

  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, unit_price: 0, tax_rate: 0.16 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleProductSelect = (index: number, productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;
    const newItems = [...items];
    newItems[index] = {
      product_id: prod.id,
      description: prod.name,
      quantity: 1,
      unit_price: prod.selling_price,
      tax_rate: organisation.vat_registered ? 0.16 : 0,
    };
    setItems(newItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };

  const calculateTax = () => {
    if (!organisation.vat_registered) return 0;
    const sub = calculateSubtotal();
    return sub - (sub / 1.16); // 16% standard VAT
  };

  const handleSubmitInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      alert('Please select a customer for this invoice');
      return;
    }
    if (items.length === 0 || items.some(i => !i.description || i.quantity <= 0)) {
      alert('Please provide valid description and quantity for all invoice items');
      return;
    }

    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    const subtotal = calculateSubtotal();
    const taxTotal = calculateTax();

    const invoiceData = {
      customer_id: customer.id,
      customer_name: customer.name,
      customer_phone: customer.phone,
      customer_email: customer.email,
      customer_kra_pin: customer.kra_pin,
      branch_id: organisation.branches[0]?.id || 'branch_cbd',
      issue_date: issueDate,
      due_date: dueDate,
      payment_terms: paymentTerms,
      status: 'sent' as InvoiceStatus,
      items: items.map((it, idx) => ({
        id: `item_${idx}_${Date.now()}`,
        product_id: it.product_id,
        description: it.description,
        quantity: it.quantity,
        unit_price: it.unit_price,
        tax_rate: it.tax_rate,
        amount: it.quantity * it.unit_price,
      })),
      subtotal,
      tax_total: taxTotal,
      grand_total: subtotal,
    };

    onCreateInvoice(invoiceData);
    setIsCreateOpen(false);
  };

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalInvoice) return;
    if (payAmount <= 0 || payAmount > paymentModalInvoice.balance_due) {
      alert(`Payment amount must be between KES 1 and outstanding balance ${formatKES(paymentModalInvoice.balance_due)}`);
      return;
    }

    onRecordPayment(
      paymentModalInvoice.id,
      payAmount,
      payMethod,
      payRef || (payMethod === 'mpesa' ? generateMPesaRef() : 'BANK-REF')
    );

    setPaymentModalInvoice(null);
    setPayAmount(0);
    setPayRef('');
  };

  // Filtered invoices
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = 
      inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customer_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5EAE7]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#202B27] tracking-tight">
            Customer Invoices & Receivables
          </h1>
          <p className="text-xs text-[#66736B] mt-0.5">
            Issue official KRA eTIMS-ready tax invoices, record partial payments, and track outstanding debts
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2.5 bg-[#00A651] hover:bg-[#00843D] text-white font-semibold text-xs rounded-lg shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Invoice</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#66736B]" />
          <input
            type="text"
            placeholder="Search invoice #, customer name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#E5EAE7] rounded-lg focus:outline-none focus:border-[#00A651] text-[#202B27]"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 p-1 bg-white border border-[#E5EAE7] rounded-lg self-stretch sm:self-auto overflow-x-auto">
          {['all', 'sent', 'partially_paid', 'paid', 'overdue'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                statusFilter === st 
                  ? 'bg-[#00A651] text-white shadow-xs' 
                  : 'text-[#66736B] hover:text-[#202B27]'
              }`}
            >
              {st === 'all' ? 'All Invoices' : st.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white rounded-xl border border-[#E5EAE7] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F8FAF9] text-[#66736B] border-b border-[#E5EAE7] font-medium">
              <tr>
                <th className="px-4 py-3">Invoice # / Date</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3 text-right">Total (KES)</th>
                <th className="px-4 py-3 text-right">Balance Due</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EAE7]">
              {filteredInvoices.map(inv => (
                <tr key={inv.id} className="hover:bg-[#F8FAF9] transition-colors">
                  <td className="px-4 py-3.5">
                    <span className="font-semibold text-[#202B27] font-mono block">
                      {inv.invoice_number}
                    </span>
                    <span className="text-[11px] text-[#66736B]">
                      Issued: {formatDate(inv.issue_date)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-medium text-[#202B27] block">
                      {inv.customer_name}
                    </span>
                    {inv.customer_kra_pin && (
                      <span className="text-[10px] text-[#66736B] font-mono">
                        PIN: {inv.customer_kra_pin}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={inv.status === 'overdue' ? 'text-red-600 font-bold' : 'text-[#66736B]'}>
                      {formatDate(inv.due_date)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-[#202B27] tabular-nums">
                    {formatKES(inv.grand_total)}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold tabular-nums">
                    {inv.balance_due > 0 ? (
                      <span className="text-red-600">{formatKES(inv.balance_due)}</span>
                    ) : (
                      <span className="text-[#00843D]">KES 0.00</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <StatusBadge status={inv.status} />
                  </td>
                  <td className="px-4 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                    {inv.balance_due > 0 && (
                      <button
                        onClick={() => {
                          setPaymentModalInvoice(inv);
                          setPayAmount(inv.balance_due);
                        }}
                        className="px-2 py-1 text-xs bg-[#00A651] hover:bg-[#00843D] text-white font-medium rounded transition-colors"
                      >
                        Record Pay
                      </button>
                    )}
                    <button
                      onClick={() => setActiveInvoice(inv)}
                      className="px-2 py-1 text-xs text-[#202B27] hover:bg-[#F8FAF9] font-medium border border-[#E5EAE7] rounded transition-colors inline-flex items-center gap-1"
                    >
                      <Printer className="w-3 h-3 text-[#66736B]" />
                      <span>View Tax Invoice</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-xs text-[#66736B]">
                    No invoices match your selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Invoice Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Professional Kenyan Tax Invoice"
        subtitle="Generates compliant invoice with KRA PIN, 16% VAT and payment terms"
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmitInvoice} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#202B27] mb-1">
                Select Customer *
              </label>
              <select
                value={customerId}
                onChange={e => setCustomerId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg focus:outline-none focus:border-[#00A651] text-[#202B27]"
                required
              >
                <option value="">Choose customer...</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.county}) {c.kra_pin ? `[PIN: ${c.kra_pin}]` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-[#202B27] mb-1">
                  Issue Date
                </label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={e => setIssueDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#202B27] mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
                  required
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-[#E5EAE7]">
              <span className="text-xs font-semibold text-[#202B27]">Invoice Line Items</span>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs font-semibold text-[#00A651] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {items.map((it, idx) => (
                <div key={idx} className="p-2.5 bg-[#F8FAF9] rounded-lg border border-[#E5EAE7] grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-12 sm:col-span-5">
                    <input
                      type="text"
                      placeholder="Item description or service..."
                      value={it.description}
                      onChange={e => {
                        const copy = [...items];
                        copy[idx].description = e.target.value;
                        setItems(copy);
                      }}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E5EAE7] rounded text-[#202B27]"
                      required
                    />
                  </div>
                  <div className="col-span-4 sm:col-span-2">
                    <input
                      type="number"
                      placeholder="Qty"
                      min="1"
                      value={it.quantity}
                      onChange={e => {
                        const copy = [...items];
                        copy[idx].quantity = parseFloat(e.target.value) || 0;
                        setItems(copy);
                      }}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E5EAE7] rounded text-[#202B27]"
                      required
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <input
                      type="number"
                      placeholder="Unit Price (KES)"
                      value={it.unit_price}
                      onChange={e => {
                        const copy = [...items];
                        copy[idx].unit_price = parseFloat(e.target.value) || 0;
                        setItems(copy);
                      }}
                      className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-[#E5EAE7] rounded text-[#202B27]"
                      required
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-2 flex items-center justify-end gap-1">
                    <span className="font-mono text-xs font-bold text-[#202B27]">
                      {formatKES(it.quantity * it.unit_price)}
                    </span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202B27] mb-1">
              Payment Terms & Bank Details
            </label>
            <input
              type="text"
              value={paymentTerms}
              onChange={e => setPaymentTerms(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
            />
          </div>

          {/* Subtotal preview */}
          <div className="p-3 bg-[#F8FAF9] rounded-lg border border-[#E5EAE7] flex justify-between items-center text-xs">
            <span className="text-[#66736B]">Total Invoice Value (Inclusive 16% VAT):</span>
            <span className="font-mono font-bold text-sm text-[#00843D]">
              {formatKES(calculateSubtotal())}
            </span>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#66736B] hover:text-[#202B27]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#00A651] hover:bg-[#00843D] text-white font-semibold text-xs rounded-lg shadow-xs transition-colors"
            >
              Issue & Save Invoice
            </button>
          </div>
        </form>
      </Modal>

      {/* Record Partial Payment Modal */}
      {paymentModalInvoice && (
        <Modal
          isOpen={true}
          onClose={() => setPaymentModalInvoice(null)}
          title={`Record Payment for ${paymentModalInvoice.invoice_number}`}
          subtitle={`Customer: ${paymentModalInvoice.customer_name} · Outstanding: ${formatKES(paymentModalInvoice.balance_due)}`}
          maxWidth="md"
        >
          <form onSubmit={handleRecordPaymentSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#202B27] mb-1">
                Amount Paid (KES)
              </label>
              <input
                type="number"
                min="1"
                max={paymentModalInvoice.balance_due}
                value={payAmount}
                onChange={e => setPayAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs font-mono font-bold bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
                required
              />
              <span className="text-[11px] text-[#66736B] mt-1 block">
                Total due: {formatKES(paymentModalInvoice.balance_due)}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202B27] mb-1">
                Payment Method
              </label>
              <select
                value={payMethod}
                onChange={e => setPayMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
              >
                <option value="mpesa">Safaricom M-Pesa (Till/Paybill)</option>
                <option value="bank_transfer">Bank Transfer / KCB EFT</option>
                <option value="cash">Cash Payment</option>
                <option value="card">Card / Cheque</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202B27] mb-1">
                Transaction Reference
              </label>
              <input
                type="text"
                placeholder="e.g. M-Pesa Code QHL89321K or Bank Slip #"
                value={payRef}
                onChange={e => setPayRef(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPaymentModalInvoice(null)}
                className="px-4 py-2 text-xs text-[#66736B]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#00A651] hover:bg-[#00843D] text-white font-semibold text-xs rounded-lg shadow-xs"
              >
                Confirm Payment & Reconcile
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Printable Formal Tax Invoice Modal */}
      {activeInvoice && (
        <Modal
          isOpen={true}
          onClose={() => setActiveInvoice(null)}
          title="Tax Invoice Preview"
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div id="tax-invoice-sheet" className="p-6 bg-white border border-[#E5EAE7] rounded-lg space-y-6 text-xs text-[#202B27] shadow-sm">
              {/* Invoice Header */}
              <div className="flex justify-between items-start pb-4 border-b border-[#E5EAE7]">
                <div>
                  <div className="text-base font-bold text-[#202B27] uppercase tracking-tight">
                    {organisation.name}
                  </div>
                  <div className="text-[#66736B]">{organisation.address}</div>
                  <div className="text-[#66736B]">Tel: {organisation.phone} · Email: {organisation.email}</div>
                  {organisation.kra_pin && (
                    <div className="font-mono font-semibold text-[#00843D] mt-1">
                      KRA PIN: {organisation.kra_pin}
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <div className="text-lg font-extrabold text-[#00843D] font-mono">
                    TAX INVOICE
                  </div>
                  <div className="font-mono font-bold text-sm text-[#202B27]">
                    {activeInvoice.invoice_number}
                  </div>
                  <div className="text-[#66736B] mt-1">
                    Date: {formatDate(activeInvoice.issue_date)}
                  </div>
                  <div className="text-[#66736B]">
                    Due: {formatDate(activeInvoice.due_date)}
                  </div>
                </div>
              </div>

              {/* Bill To */}
              <div className="p-3 bg-[#F8FAF9] rounded-lg border border-[#E5EAE7]">
                <span className="text-[10px] font-bold uppercase text-[#66736B] tracking-wider block mb-1">
                  Billed To (Customer Details)
                </span>
                <div className="font-bold text-sm text-[#202B27]">{activeInvoice.customer_name}</div>
                <div className="text-[#66736B]">Tel: {formatKenyanPhone(activeInvoice.customer_phone)}</div>
                {activeInvoice.customer_email && <div className="text-[#66736B]">{activeInvoice.customer_email}</div>}
                {activeInvoice.customer_kra_pin && (
                  <div className="font-mono text-[11px] text-[#202B27] mt-0.5">
                    Customer KRA PIN: {activeInvoice.customer_kra_pin}
                  </div>
                )}
              </div>

              {/* Items Table */}
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F8FAF9] border-y border-[#E5EAE7] text-[#66736B] font-semibold">
                  <tr>
                    <th className="py-2 px-3">Description</th>
                    <th className="py-2 px-3 text-center">Qty</th>
                    <th className="py-2 px-3 text-right">Unit Price</th>
                    <th className="py-2 px-3 text-right">Amount (KES)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5EAE7]">
                  {activeInvoice.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-3 font-medium text-[#202B27]">{it.description}</td>
                      <td className="py-2.5 px-3 text-center font-mono">{it.quantity}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{formatKES(it.unit_price)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold">{formatKES(it.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Summary & VAT calculation */}
              <div className="flex justify-between items-start pt-3 border-t border-[#E5EAE7]">
                <div className="max-w-xs space-y-1">
                  <div className="text-[11px] font-semibold text-[#202B27]">Payment Terms:</div>
                  <div className="text-[11px] text-[#66736B] leading-relaxed">
                    {activeInvoice.payment_terms || 'Payment due within 30 days.'}
                  </div>
                  {/* eTIMS readiness compliance notice */}
                  <div className="mt-3 p-2 bg-[#F0F8F3] rounded border border-[#00A651]/20 text-[10px] text-[#00843D] font-mono">
                    <div>eTIMS VSCU Middleware Signature:</div>
                    <div className="truncate font-semibold">{activeInvoice.etims_signature || 'ETIMS-SIMULATED-DEV-KEY'}</div>
                  </div>
                </div>

                <div className="w-56 space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between text-[#66736B]">
                    <span>Subtotal:</span>
                    <span>{formatKES(activeInvoice.subtotal)}</span>
                  </div>
                  {organisation.vat_registered && (
                    <div className="flex justify-between text-[#66736B]">
                      <span>16% VAT Content:</span>
                      <span>{formatKES(activeInvoice.tax_total)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-sm text-[#202B27] border-t border-[#E5EAE7] pt-1">
                    <span>Grand Total:</span>
                    <span>{formatKES(activeInvoice.grand_total)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Amount Paid:</span>
                    <span>{formatKES(activeInvoice.amount_paid)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-red-600 border-t border-[#E5EAE7] pt-1">
                    <span>Balance Due:</span>
                    <span>{formatKES(activeInvoice.balance_due)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Print & Share actions */}
            <div className="flex items-center justify-between pt-2">
              <a
                href={generateWhatsAppShareLink(
                  activeInvoice.customer_phone,
                  `Habari ${activeInvoice.customer_name}, please find your Tax Invoice ${activeInvoice.invoice_number} for ${formatKES(activeInvoice.grand_total)}. Outstanding balance: ${formatKES(activeInvoice.balance_due)}. Thank you for your business with ${organisation.trading_name || organisation.name}.`
                )}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-[#00A651] hover:bg-[#00843D] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share via WhatsApp</span>
              </a>

              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#202B27] hover:bg-black text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Tax Invoice</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
