import React, { useState } from 'react';
import { 
  Truck, 
  Plus, 
  Search, 
  Check, 
  PackageCheck, 
  Building2, 
  Calendar,
  DollarSign,
  Trash2
} from 'lucide-react';
import { 
  PurchaseOrder, 
  Supplier, 
  Product, 
  Organisation 
} from '../types';
import { formatKES, formatDate, formatKenyanPhone } from '../utils/formatters';
import { Modal } from '../components/common/Modal';
import { StatusBadge } from '../components/common/StatusBadge';

interface PurchasesViewProps {
  purchaseOrders: PurchaseOrder[];
  suppliers: Supplier[];
  products: Product[];
  organisation: Organisation;
  onCreatePO: (poData: any) => void;
  onReceivePO: (poId: string) => void;
  onAddSupplier: (supData: any) => void;
}

export const PurchasesView: React.FC<PurchasesViewProps> = ({
  purchaseOrders,
  suppliers,
  products,
  organisation,
  onCreatePO,
  onReceivePO,
  onAddSupplier,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'suppliers'>('orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatePOOpen, setIsCreatePOOpen] = useState(false);
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);

  // PO Form State
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [poItems, setPoItems] = useState<{
    product_id: string;
    product_name: string;
    sku: string;
    quantity: number;
    unit_cost: number;
  }[]>([]);

  // Supplier Form State
  const [supName, setSupName] = useState('');
  const [supContact, setSupContact] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supEmail, setSupEmail] = useState('');
  const [supCategory, setSupCategory] = useState('Hardware & Materials');
  const [supTerms, setSupTerms] = useState(30);

  const totalOutstandingToSuppliers = suppliers.reduce((sum, s) => sum + s.outstanding_balance, 0);

  const handleAddProductToPO = (productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;
    if (poItems.some(i => i.product_id === prod.id)) return;
    setPoItems([...poItems, {
      product_id: prod.id,
      product_name: prod.name,
      sku: prod.sku,
      quantity: 50,
      unit_cost: prod.cost_price,
    }]);
  };

  const handleCreatePOSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId) {
      alert('Please select a supplier');
      return;
    }
    if (poItems.length === 0) {
      alert('Please select at least one product for the purchase order');
      return;
    }

    const supplier = suppliers.find(s => s.id === selectedSupplierId);
    if (!supplier) return;

    const subtotal = poItems.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0);
    const taxTotal = organisation.vat_registered ? subtotal - (subtotal / 1.16) : 0;

    onCreatePO({
      supplier_id: supplier.id,
      supplier_name: supplier.name,
      branch_id: organisation.branches[0]?.id || 'branch_cbd',
      order_date: new Date().toISOString().split('T')[0],
      expected_date: expectedDate || undefined,
      items: poItems.map(i => ({
        product_id: i.product_id,
        product_name: i.product_name,
        sku: i.sku,
        quantity_ordered: i.quantity,
        quantity_received: 0,
        unit_cost: i.unit_cost,
        total_cost: i.quantity * i.unit_cost,
      })),
      subtotal,
      tax_total: taxTotal,
      grand_total: subtotal,
      status: 'ordered',
      payment_status: 'unpaid',
    });

    setIsCreatePOOpen(false);
    setPoItems([]);
    setSelectedSupplierId('');
  };

  const handleAddSupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName || !supPhone) {
      alert('Supplier name and phone are required');
      return;
    }
    onAddSupplier({
      name: supName,
      contact_person: supContact,
      phone: supPhone,
      email: supEmail || undefined,
      category: supCategory,
      payment_terms_days: supTerms,
    });
    setIsAddSupplierOpen(false);
    setSupName('');
    setSupPhone('');
    setSupContact('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5EAE7]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#202B27] tracking-tight">
            Purchases & Supplier Operations
          </h1>
          <p className="text-xs text-[#66736B] mt-0.5">
            Procure inventory from manufacturers, receive stock directly into branches, and track supplier payables
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsAddSupplierOpen(true)}
            className="px-3.5 py-2 bg-white hover:bg-[#F8FAF9] text-[#202B27] border border-[#E5EAE7] font-semibold text-xs rounded-lg shadow-xs transition-colors"
          >
            + Add Supplier
          </button>
          <button
            onClick={() => setIsCreatePOOpen(true)}
            className="px-4 py-2 bg-[#00A651] hover:bg-[#00843D] text-white font-semibold text-xs rounded-lg shadow-xs flex items-center gap-1.5 transition-colors active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Create Purchase Order</span>
          </button>
        </div>
      </div>

      {/* Overview Stat */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-[#E5EAE7] shadow-xs">
          <span className="text-xs font-medium text-[#66736B] block">Total Supplier Payables</span>
          <span className="text-xl sm:text-2xl font-bold text-red-600 font-mono tabular-nums block mt-1">
            {formatKES(totalOutstandingToSuppliers)}
          </span>
          <span className="text-[11px] text-[#66736B] mt-1 block">
            Across {suppliers.length} active registered suppliers
          </span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#E5EAE7] shadow-xs">
          <span className="text-xs font-medium text-[#66736B] block">Pending Deliveries</span>
          <span className="text-xl sm:text-2xl font-bold text-blue-700 font-mono tabular-nums block mt-1">
            {purchaseOrders.filter(p => p.status === 'ordered').length} Orders
          </span>
          <span className="text-[11px] text-[#66736B] mt-1 block">
            Awaiting warehouse intake
          </span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#E5EAE7] shadow-xs">
          <span className="text-xs font-medium text-[#66736B] block">Received This Month</span>
          <span className="text-xl sm:text-2xl font-bold text-[#00843D] font-mono tabular-nums block mt-1">
            {purchaseOrders.filter(p => p.status === 'received').length} Completed
          </span>
          <span className="text-[11px] text-[#66736B] mt-1 block">
            Stock verified into inventory
          </span>
        </div>
      </div>

      {/* Tabs: POs vs Suppliers */}
      <div className="flex items-center gap-1 border-b border-[#E5EAE7]">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'orders' ? 'border-[#00A651] text-[#00843D]' : 'border-transparent text-[#66736B] hover:text-[#202B27]'
          }`}
        >
          Purchase Orders ({purchaseOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'suppliers' ? 'border-[#00A651] text-[#00843D]' : 'border-transparent text-[#66736B] hover:text-[#202B27]'
          }`}
        >
          Suppliers Directory ({suppliers.length})
        </button>
      </div>

      {activeTab === 'orders' ? (
        /* Purchase Orders Table */
        <div className="bg-white rounded-xl border border-[#E5EAE7] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F8FAF9] text-[#66736B] border-b border-[#E5EAE7] font-medium">
                <tr>
                  <th className="px-4 py-3">PO # / Date</th>
                  <th className="px-4 py-3">Supplier Name</th>
                  <th className="px-4 py-3">Ordered Items</th>
                  <th className="px-4 py-3 text-right">Order Cost (KES)</th>
                  <th className="px-4 py-3 text-center">Delivery Status</th>
                  <th className="px-4 py-3 text-right">Stock Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EAE7]">
                {purchaseOrders.map(po => (
                  <tr key={po.id} className="hover:bg-[#F8FAF9] transition-colors">
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-[#202B27] font-mono block">
                        {po.po_number}
                      </span>
                      <span className="text-[11px] text-[#66736B]">
                        Ordered: {formatDate(po.order_date)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-medium text-[#202B27] block">{po.supplier_name}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-[#202B27]">{po.items.length} item lines</span>
                      <span className="text-[11px] text-[#66736B] block truncate max-w-xs">
                        {po.items.map(i => `${i.quantity_ordered}x ${i.product_name}`).join(', ')}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-[#202B27] tabular-nums">
                      {formatKES(po.grand_total)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <StatusBadge status={po.status} />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {po.status === 'ordered' ? (
                        <button
                          onClick={() => {
                            if (window.confirm(`Receive goods for ${po.po_number}? This will automatically increment product stock balances and create traceable stock movements.`)) {
                              onReceivePO(po.id);
                            }
                          }}
                          className="px-2.5 py-1 text-xs bg-[#00A651] hover:bg-[#00843D] text-white font-medium rounded transition-colors inline-flex items-center gap-1"
                        >
                          <PackageCheck className="w-3.5 h-3.5" />
                          <span>Receive Stock</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-[#00843D] font-medium flex items-center justify-end gap-1">
                          <Check className="w-3.5 h-3.5" /> Stock Intaken
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Suppliers Directory Table */
        <div className="bg-white rounded-xl border border-[#E5EAE7] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F8FAF9] text-[#66736B] border-b border-[#E5EAE7] font-medium">
                <tr>
                  <th className="px-4 py-3">Supplier / Company</th>
                  <th className="px-4 py-3">Contact Person</th>
                  <th className="px-4 py-3">Phone & Details</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-center">Credit Terms</th>
                  <th className="px-4 py-3 text-right">Outstanding Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EAE7]">
                {suppliers.map(sup => (
                  <tr key={sup.id} className="hover:bg-[#F8FAF9] transition-colors">
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-[#202B27] block">{sup.name}</span>
                      {sup.kra_pin && (
                        <span className="text-[10px] text-[#66736B] font-mono">
                          PIN: {sup.kra_pin}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-[#202B27]">{sup.contact_person}</td>
                    <td className="px-4 py-3.5">
                      <span className="text-[#202B27] block">{formatKenyanPhone(sup.phone)}</span>
                      {sup.email && <span className="text-[11px] text-[#66736B]">{sup.email}</span>}
                    </td>
                    <td className="px-4 py-3.5 text-[#66736B]">{sup.category}</td>
                    <td className="px-4 py-3.5 text-center font-mono text-[#202B27]">
                      {sup.payment_terms_days} days
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold tabular-nums">
                      {sup.outstanding_balance > 0 ? (
                        <span className="text-red-600">{formatKES(sup.outstanding_balance)}</span>
                      ) : (
                        <span className="text-[#00843D]">KES 0.00</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Purchase Order Modal */}
      <Modal
        isOpen={isCreatePOOpen}
        onClose={() => setIsCreatePOOpen(false)}
        title="Create Purchase Order (Supplier Procurement)"
        subtitle="Specify products and quantities to order from verified suppliers"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreatePOSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#202B27] mb-1">
                Select Supplier *
              </label>
              <select
                value={selectedSupplierId}
                onChange={e => setSelectedSupplierId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
                required
              >
                <option value="">Select registered supplier...</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202B27] mb-1">
                Expected Delivery Date
              </label>
              <input
                type="date"
                value={expectedDate}
                onChange={e => setExpectedDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202B27] mb-1">
              Add Products from Catalogue to PO
            </label>
            <select
              onChange={e => {
                if (e.target.value) {
                  handleAddProductToPO(e.target.value);
                  e.target.value = '';
                }
              }}
              className="w-full px-3 py-2 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
            >
              <option value="">+ Click to choose product...</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} (SKU: {p.sku}) · Cost: {formatKES(p.cost_price)}
                </option>
              ))}
            </select>
          </div>

          {/* Selected Items */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {poItems.map((item, idx) => (
              <div key={idx} className="p-2.5 bg-[#F8FAF9] rounded border border-[#E5EAE7] flex items-center justify-between text-xs">
                <div className="min-w-0 pr-2">
                  <span className="font-semibold text-[#202B27] block truncate">{item.product_name}</span>
                  <span className="text-[10px] text-[#66736B] font-mono">Cost: {formatKES(item.unit_cost)} each</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-[#66736B]">Qty:</span>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={e => {
                        const copy = [...poItems];
                        copy[idx].quantity = parseInt(e.target.value) || 1;
                        setPoItems(copy);
                      }}
                      className="w-16 px-2 py-1 text-xs border border-[#E5EAE7] rounded text-center font-mono font-bold"
                    />
                  </div>
                  <span className="font-mono font-bold text-[#202B27] w-24 text-right">
                    {formatKES(item.quantity * item.unit_cost)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPoItems(poItems.filter((_, i) => i !== idx))}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {poItems.length === 0 && (
              <div className="text-center py-6 text-xs text-[#66736B]">
                No items added to this PO yet.
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreatePOOpen(false)}
              className="px-4 py-2 text-xs text-[#66736B]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={poItems.length === 0}
              className="px-5 py-2.5 bg-[#00A651] hover:bg-[#00843D] disabled:opacity-50 text-white font-semibold text-xs rounded-lg shadow-xs"
            >
              Submit Purchase Order
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Supplier Modal */}
      <Modal
        isOpen={isAddSupplierOpen}
        onClose={() => setIsAddSupplierOpen(false)}
        title="Onboard New Supplier"
        subtitle="Register vendor contact and payment terms"
        maxWidth="md"
      >
        <form onSubmit={handleAddSupplierSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#202B27] mb-1">
              Supplier / Company Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Mabati Rolling Mills Ltd"
              value={supName}
              onChange={e => setSupName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202B27] mb-1">
              Contact Person
            </label>
            <input
              type="text"
              placeholder="e.g. David Maina (Key Accounts)"
              value={supContact}
              onChange={e => setSupContact(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#202B27] mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                placeholder="+254 722 000 000"
                value={supPhone}
                onChange={e => setSupPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#202B27] mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="sales@supplier.co.ke"
                value={supEmail}
                onChange={e => setSupEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#202B27] mb-1">
                Category
              </label>
              <input
                type="text"
                placeholder="e.g. Roofing, Cement, Timber"
                value={supCategory}
                onChange={e => setSupCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#202B27] mb-1">
                Credit Terms (Days)
              </label>
              <input
                type="number"
                min="0"
                value={supTerms}
                onChange={e => setSupTerms(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs font-mono bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddSupplierOpen(false)}
              className="px-4 py-2 text-xs text-[#66736B]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#00A651] hover:bg-[#00843D] text-white font-semibold text-xs rounded-lg shadow-xs"
            >
              Register Supplier
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
