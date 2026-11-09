import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Printer, 
  Share2, 
  Check, 
  Trash2, 
  CreditCard, 
  Smartphone, 
  DollarSign, 
  Building2,
  FileCheck
} from 'lucide-react';
import { 
  Sale, 
  Product, 
  Customer, 
  PaymentMethod, 
  Organisation, 
  User 
} from '../types';
import { 
  formatKES, 
  formatDate, 
  formatDateTime, 
  generateMPesaRef, 
  generateWhatsAppShareLink,
  formatKenyanPhone 
} from '../utils/formatters';
import { Modal } from '../components/common/Modal';
import { StatusBadge } from '../components/common/StatusBadge';

interface SalesViewProps {
  sales: Sale[];
  products: Product[];
  customers: Customer[];
  organisation: Organisation;
  currentUser: User;
  onRecordSale: (saleData: any) => void;
}

export const SalesView: React.FC<SalesViewProps> = ({
  sales,
  products,
  customers,
  organisation,
  currentUser,
  onRecordSale,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [isPOSOpen, setIsPOSOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<Sale | null>(null);

  // POS State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [walkinName, setWalkinName] = useState('Walk-in Cash Customer');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [cartItems, setCartItems] = useState<{
    product: Product;
    quantity: number;
    unit_price: number;
    discount: number;
  }[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa');
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [stkSimulating, setStkSimulating] = useState(false);
  const [stkConfirmed, setStkConfirmed] = useState(false);
  const [simulatedMpesaCode, setSimulatedMpesaCode] = useState('');

  // Cart Calculations
  const cartSubtotal = cartItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const cartDiscount = cartItems.reduce((sum, item) => sum + item.discount, 0);
  const grandTotal = Math.max(0, cartSubtotal - cartDiscount);
  // Kenya 16% standard VAT breakdown within inclusive price
  const vatPortion = organisation.vat_registered ? (grandTotal - (grandTotal / 1.16)) : 0;

  const handleAddToCart = (product: Product) => {
    const existing = cartItems.find(i => i.product.id === product.id);
    if (existing) {
      if (existing.quantity >= product.current_stock) {
        alert(`Cannot add more. Only ${product.current_stock} ${product.unit} available in store.`);
        return;
      }
      setCartItems(cartItems.map(i => 
        i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      if (product.current_stock <= 0) {
        alert('This item is currently out of stock.');
        return;
      }
      setCartItems([...cartItems, {
        product,
        quantity: 1,
        unit_price: product.selling_price,
        discount: 0
      }]);
    }
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems(cartItems.filter(i => i.product.id !== productId));
  };

  const handleSimulateSTKPush = () => {
    if (!mpesaPhone) {
      alert('Please enter customer M-Pesa phone number');
      return;
    }
    setStkSimulating(true);
    setTimeout(() => {
      setStkSimulating(false);
      setStkConfirmed(true);
      setSimulatedMpesaCode(generateMPesaRef());
    }, 1200);
  };

  const handleCompleteSale = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty. Please select products to sell.');
      return;
    }

    const customer = customers.find(c => c.id === selectedCustomerId);
    const customerName = customer ? customer.name : (walkinName || 'Walk-in Cash Customer');
    const customerPhone = customer ? customer.phone : walkinPhone;

    const saleRecord = {
      customer_id: selectedCustomerId || undefined,
      customer_name: customerName,
      customer_phone: customerPhone,
      branch_id: organisation.branches[0]?.id || 'branch_cbd',
      items: cartItems.map(i => ({
        product_id: i.product.id,
        product_name: i.product.name,
        sku: i.product.sku,
        quantity: i.quantity,
        unit_price: i.unit_price,
        cost_price: i.product.cost_price,
        discount: i.discount,
        tax_rate: organisation.vat_registered ? 0.16 : 0,
        total: (i.quantity * i.unit_price) - i.discount,
      })),
      subtotal: cartSubtotal,
      discount_total: cartDiscount,
      tax_total: vatPortion,
      grand_total: grandTotal,
      payment_method: paymentMethod,
      payment_reference: paymentMethod === 'mpesa' ? (simulatedMpesaCode || generateMPesaRef()) : undefined,
      payment_status: 'completed',
      amount_paid: grandTotal,
      salesperson_id: currentUser.id,
      salesperson_name: currentUser.name,
    };

    onRecordSale(saleRecord);

    // Reset POS
    setCartItems([]);
    setSelectedCustomerId('');
    setWalkinName('Walk-in Cash Customer');
    setWalkinPhone('');
    setStkConfirmed(false);
    setSimulatedMpesaCode('');
    setIsPOSOpen(false);
  };

  // Filtered sales
  const filteredSales = sales.filter(s => {
    const matchesSearch = 
      s.receipt_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.payment_reference && s.payment_reference.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesMethod = methodFilter === 'all' || s.payment_method === methodFilter;
    return matchesSearch && matchesMethod;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5EAE7]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#202B27] tracking-tight">
            Sales & Point of Sale (POS)
          </h1>
          <p className="text-xs text-[#66736B] mt-0.5">
            Record counter sales, collect M-Pesa payments, and generate KRA tax receipts
          </p>
        </div>

        <button
          onClick={() => setIsPOSOpen(true)}
          className="px-4 py-2.5 bg-[#00A651] hover:bg-[#00843D] text-white font-semibold text-xs rounded-lg shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>New Sale / Checkout</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#66736B]" />
          <input
            type="text"
            placeholder="Search receipt #, customer, M-Pesa ref..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#E5EAE7] rounded-lg focus:outline-none focus:border-[#00A651] text-[#202B27]"
          />
        </div>

        {/* Method Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-white border border-[#E5EAE7] rounded-lg self-stretch sm:self-auto overflow-x-auto">
          {['all', 'mpesa', 'cash', 'bank_transfer'].map(method => (
            <button
              key={method}
              onClick={() => setMethodFilter(method)}
              className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                methodFilter === method 
                  ? 'bg-[#00A651] text-white shadow-xs' 
                  : 'text-[#66736B] hover:text-[#202B27]'
              }`}
            >
              {method === 'all' ? 'All Payments' : method === 'mpesa' ? 'M-Pesa' : method === 'cash' ? 'Cash' : 'Bank Transfer'}
            </button>
          ))}
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-xl border border-[#E5EAE7] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F8FAF9] text-[#66736B] border-b border-[#E5EAE7] font-medium">
              <tr>
                <th className="px-4 py-3">Receipt / Date</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Items Sold</th>
                <th className="px-4 py-3">Payment Method</th>
                <th className="px-4 py-3 text-right">Grand Total</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EAE7]">
              {filteredSales.map(sale => (
                <tr key={sale.id} className="hover:bg-[#F8FAF9] transition-colors">
                  <td className="px-4 py-3.5">
                    <span className="font-semibold text-[#202B27] font-mono block">
                      {sale.receipt_number}
                    </span>
                    <span className="text-[11px] text-[#66736B]">
                      {formatDateTime(sale.created_at)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-medium text-[#202B27] block">
                      {sale.customer_name}
                    </span>
                    {sale.customer_phone && (
                      <span className="text-[11px] text-[#66736B]">
                        {formatKenyanPhone(sale.customer_phone)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-[#202B27]">
                      {sale.items.length} item{sale.items.length !== 1 ? 's' : ''}
                    </span>
                    <span className="text-[11px] text-[#66736B] block truncate max-w-xs">
                      {sale.items.map(i => `${i.quantity}x ${i.product_name}`).join(', ')}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="uppercase font-semibold text-[#202B27] text-[11px] block">
                      {sale.payment_method.replace('_', ' ')}
                    </span>
                    {sale.payment_reference && (
                      <span className="text-[10px] text-[#00843D] font-mono block">
                        Ref: {sale.payment_reference}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-[#202B27] tabular-nums">
                    {formatKES(sale.grand_total)}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <StatusBadge status={sale.payment_status} />
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => setActiveReceipt(sale)}
                      className="px-2.5 py-1 text-xs text-[#00A651] hover:bg-[#F0F8F3] rounded font-medium border border-[#00A651]/30 transition-colors inline-flex items-center gap-1"
                    >
                      <Printer className="w-3 h-3" />
                      <span>Receipt</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-xs text-[#66736B]">
                    No sales matched your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* POS Modal (Point of Sale Interface) */}
      <Modal
        isOpen={isPOSOpen}
        onClose={() => setIsPOSOpen(false)}
        title="Point of Sale (POS Checkout)"
        subtitle="Select items, apply discounts, choose payment method and complete order"
        maxWidth="4xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left: Product Selector (7 cols) */}
          <div className="md:col-span-7 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#202B27] mb-1">
                Select Customer (Optional)
              </label>
              <select
                value={selectedCustomerId}
                onChange={e => setSelectedCustomerId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg focus:outline-none focus:border-[#00A651] text-[#202B27]"
              >
                <option value="">Walk-in Retail Customer</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.county}) {c.outstanding_balance > 0 ? `· Debt: ${formatKES(c.outstanding_balance)}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {!selectedCustomerId && (
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Customer Name (optional)"
                  value={walkinName}
                  onChange={e => setWalkinName(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
                />
                <input
                  type="tel"
                  placeholder="Phone number (for SMS receipt)"
                  value={walkinPhone}
                  onChange={e => setWalkinPhone(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
                />
              </div>
            )}

            <div>
              <span className="text-xs font-semibold text-[#202B27] block mb-2">
                Product Catalogue (Click to add to cart)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto p-1">
                {products.map(prod => (
                  <div
                    key={prod.id}
                    onClick={() => handleAddToCart(prod)}
                    className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                      prod.current_stock <= 0 
                        ? 'opacity-50 bg-neutral-100 border-[#E5EAE7] cursor-not-allowed'
                        : 'bg-white hover:border-[#00A651] hover:bg-[#F0F8F3] border-[#E5EAE7]'
                    }`}
                  >
                    <div className="font-semibold text-xs text-[#202B27] truncate">
                      {prod.name}
                    </div>
                    <div className="text-[10px] text-[#66736B] mt-0.5">
                      SKU: {prod.sku} · {prod.current_stock} {prod.unit} in stock
                    </div>
                    <div className="mt-1 font-mono font-bold text-xs text-[#00843D]">
                      {formatKES(prod.selling_price)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Cart & Payment Checkout (5 cols) */}
          <div className="md:col-span-5 bg-[#F8FAF9] p-4 rounded-xl border border-[#E5EAE7] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#E5EAE7]">
                <span className="text-xs font-bold text-[#202B27] uppercase tracking-wider">
                  Current Sale Items ({cartItems.length})
                </span>
                {cartItems.length > 0 && (
                  <button
                    onClick={() => setCartItems([])}
                    className="text-[11px] text-red-600 hover:underline"
                  >
                    Clear Cart
                  </button>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-2 bg-white rounded border border-[#E5EAE7]">
                    <div className="min-w-0 pr-2">
                      <span className="font-medium text-[#202B27] truncate block">{item.product.name}</span>
                      <span className="text-[10px] text-[#66736B]">
                        {item.quantity} x {formatKES(item.unit_price)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono font-semibold text-[#202B27]">
                        {formatKES(item.quantity * item.unit_price)}
                      </span>
                      <button
                        onClick={() => handleRemoveFromCart(item.product.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {cartItems.length === 0 && (
                  <div className="text-center py-8 text-xs text-[#66736B]">
                    No items added yet. Click items on the left to add.
                  </div>
                )}
              </div>

              {/* Payment Method Selector */}
              <div className="mb-4 pt-2 border-t border-[#E5EAE7]">
                <label className="block text-xs font-semibold text-[#202B27] mb-1.5">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-xs mb-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('mpesa')}
                    className={`py-1.5 px-2 rounded-md font-medium border text-center transition-colors ${
                      paymentMethod === 'mpesa' ? 'bg-[#00A651] text-white border-[#00A651]' : 'bg-white border-[#E5EAE7] text-[#202B27]'
                    }`}
                  >
                    M-Pesa
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`py-1.5 px-2 rounded-md font-medium border text-center transition-colors ${
                      paymentMethod === 'cash' ? 'bg-[#00A651] text-white border-[#00A651]' : 'bg-white border-[#E5EAE7] text-[#202B27]'
                    }`}
                  >
                    Cash Till
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank_transfer')}
                    className={`py-1.5 px-2 rounded-md font-medium border text-center transition-colors ${
                      paymentMethod === 'bank_transfer' ? 'bg-[#00A651] text-white border-[#00A651]' : 'bg-white border-[#E5EAE7] text-[#202B27]'
                    }`}
                  >
                    Bank (EFT)
                  </button>
                </div>

                {/* If M-Pesa is selected: Daraja STK Push Simulator */}
                {paymentMethod === 'mpesa' && (
                  <div className="p-2.5 bg-white rounded border border-[#E5EAE7] space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-[#00843D]">Safaricom Daraja STK Push</span>
                      <span className="text-[10px] text-[#66736B]">Sandbox</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="tel"
                        placeholder="Customer 07xx xxx xxx"
                        value={mpesaPhone}
                        onChange={e => setMpesaPhone(e.target.value)}
                        className="flex-1 px-2.5 py-1 text-xs border border-[#E5EAE7] rounded text-[#202B27]"
                      />
                      <button
                        type="button"
                        onClick={handleSimulateSTKPush}
                        disabled={stkSimulating || stkConfirmed}
                        className="px-2.5 py-1 bg-[#00A651] text-white text-xs font-semibold rounded disabled:opacity-50"
                      >
                        {stkSimulating ? 'Prompting...' : stkConfirmed ? 'Prompt Confirmed' : 'Send Prompt'}
                      </button>
                    </div>
                    {stkConfirmed && (
                      <div className="text-[11px] text-[#00843D] flex items-center gap-1 font-mono">
                        <Check className="w-3.5 h-3.5" />
                        <span>M-Pesa Confirmed: {simulatedMpesaCode}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Totals Summary */}
              <div className="space-y-1 text-xs pt-2 border-t border-[#E5EAE7]">
                <div className="flex justify-between text-[#66736B]">
                  <span>Subtotal:</span>
                  <span className="font-mono">{formatKES(cartSubtotal)}</span>
                </div>
                {organisation.vat_registered && (
                  <div className="flex justify-between text-[#66736B]">
                    <span>Includes 16% VAT:</span>
                    <span className="font-mono">{formatKES(vatPortion)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-[#202B27] pt-1">
                  <span>Grand Total:</span>
                  <span className="font-mono text-[#00843D] text-base">{formatKES(grandTotal)}</span>
                </div>
              </div>
            </div>

            {/* Complete Sale Button */}
            <button
              onClick={handleCompleteSale}
              disabled={cartItems.length === 0}
              className="mt-4 w-full py-2.5 bg-[#00A651] hover:bg-[#00843D] disabled:opacity-50 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Complete Sale & Deduct Stock</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Printable Thermal Receipt Modal */}
      {activeReceipt && (
        <Modal
          isOpen={true}
          onClose={() => setActiveReceipt(null)}
          title="Kenyan Sales Receipt (eTIMS Ready)"
          maxWidth="sm"
        >
          <div className="space-y-4">
            {/* Thermal Slip Preview */}
            <div id="printable-receipt" className="p-4 bg-white border border-neutral-300 rounded font-mono text-[11px] text-neutral-800 space-y-2 shadow-xs">
              <div className="text-center border-b border-neutral-300 pb-2">
                <div className="font-bold text-xs uppercase">{organisation.name}</div>
                <div>{organisation.branches[0]?.location || 'Nairobi CBD'}</div>
                <div>Tel: {organisation.phone}</div>
                {organisation.kra_pin && <div>KRA PIN: {organisation.kra_pin}</div>}
              </div>

              <div className="space-y-0.5 text-[10px]">
                <div>Receipt: <span className="font-bold">{activeReceipt.receipt_number}</span></div>
                <div>Date: {formatDateTime(activeReceipt.created_at)}</div>
                <div>Customer: {activeReceipt.customer_name}</div>
                <div>Served by: {activeReceipt.salesperson_name}</div>
              </div>

              <div className="border-t border-b border-dashed border-neutral-300 py-1.5 my-1.5 space-y-1">
                {activeReceipt.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between">
                    <div>
                      <div>{it.product_name}</div>
                      <div className="text-[10px] text-neutral-500">{it.quantity} x {formatKES(it.unit_price)}</div>
                    </div>
                    <div className="font-bold">{formatKES(it.total)}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-1 pt-1">
                <div className="flex justify-between font-bold text-xs">
                  <span>TOTAL PAID:</span>
                  <span>{formatKES(activeReceipt.grand_total)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-neutral-600">
                  <span>Method:</span>
                  <span className="uppercase">{activeReceipt.payment_method}</span>
                </div>
                {activeReceipt.payment_reference && (
                  <div className="flex justify-between text-[10px] text-neutral-600">
                    <span>M-Pesa Ref:</span>
                    <span className="font-bold text-emerald-800">{activeReceipt.payment_reference}</span>
                  </div>
                )}
                {organisation.vat_registered && (
                  <div className="flex justify-between text-[10px] text-neutral-500 border-t border-neutral-200 pt-1">
                    <span>16% VAT Content:</span>
                    <span>{formatKES(activeReceipt.tax_total)}</span>
                  </div>
                )}
              </div>

              <div className="text-center border-t border-dashed border-neutral-300 pt-2 text-[10px] text-neutral-600">
                <div>Asante sana kwa biashara yako!</div>
                <div>Goods once sold can be exchanged within 7 days.</div>
                <div className="text-[9px] mt-1 text-neutral-400">Powered by BiasharaOS Kenya</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 bg-[#202B27] hover:bg-black text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Thermal Receipt</span>
              </button>
              {activeReceipt.customer_phone && (
                <a
                  href={generateWhatsAppShareLink(
                    activeReceipt.customer_phone,
                    `Habari ${activeReceipt.customer_name}, here is your receipt ${activeReceipt.receipt_number} for ${formatKES(activeReceipt.grand_total)} from ${organisation.trading_name || organisation.name}. Payment Ref: ${activeReceipt.payment_reference || 'CASH'}. Asante sana!`
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 bg-[#00A651] hover:bg-[#00843D] text-white text-xs font-semibold rounded-lg flex items-center gap-1"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
