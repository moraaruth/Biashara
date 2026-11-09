import React, { useState } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  ArrowRightLeft, 
  SlidersHorizontal, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  Building2,
  DollarSign
} from 'lucide-react';
import { 
  Product, 
  StockMovement, 
  Branch, 
  Organisation 
} from '../types';
import { formatKES, formatDateTime } from '../utils/formatters';
import { Modal } from '../components/common/Modal';
import { StatusBadge } from '../components/common/StatusBadge';

interface InventoryViewProps {
  products: Product[];
  stockMovements: StockMovement[];
  branches: Branch[];
  organisation: Organisation;
  onAddProduct: (prodData: any) => void;
  onAdjustStock: (productId: string, newQty: number, reason: string, type: 'adjustment_in' | 'adjustment_out') => void;
  onTransferStock: (productId: string, qty: number, fromBranchId: string, toBranchId: string, notes: string) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  stockMovements,
  branches,
  organisation,
  onAddProduct,
  onAdjustStock,
  onTransferStock,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'catalogue' | 'movements'>('catalogue');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState('all');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [adjustProduct, setAdjustProduct] = useState<Product | null>(null);
  const [transferProduct, setTransferProduct] = useState<Product | null>(null);

  // New Product Form State
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [name, setName] = useState('');
  const [categoryName, setCategoryName] = useState('General Hardware');
  const [unit, setUnit] = useState('Pcs');
  const [costPrice, setCostPrice] = useState<number>(0);
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [initialStock, setInitialStock] = useState<number>(10);
  const [reorderLevel, setReorderLevel] = useState<number>(5);
  const [branchId, setBranchId] = useState(branches[0]?.id || 'branch_cbd');

  // Adjust Form State
  const [newStockQty, setNewStockQty] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState('Physical Stocktake Recount');
  const [adjustType, setAdjustType] = useState<'adjustment_in' | 'adjustment_out'>('adjustment_in');

  // Transfer Form State
  const [transferQty, setTransferQty] = useState<number>(1);
  const [fromBranch, setFromBranch] = useState(branches[0]?.id || '');
  const [toBranch, setToBranch] = useState(branches[1]?.id || branches[0]?.id || '');
  const [transferNotes, setTransferNotes] = useState('Customer collection transfer');

  // Stock summary numbers
  const totalValuation = products.reduce((acc, p) => acc + (p.current_stock * p.cost_price), 0);
  const lowStockCount = products.filter(p => p.current_stock > 0 && p.current_stock <= p.reorder_level).length;
  const outOfStockCount = products.filter(p => p.current_stock === 0).length;

  const categories = Array.from(new Set(products.map(p => p.category_name)));

  // Filtered Products
  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.barcode && p.barcode.includes(searchQuery));
    const matchesCategory = categoryFilter === 'all' || p.category_name === categoryFilter;
    
    let matchesStatus = true;
    if (stockStatusFilter === 'low') {
      matchesStatus = p.current_stock > 0 && p.current_stock <= p.reorder_level;
    } else if (stockStatusFilter === 'out') {
      matchesStatus = p.current_stock === 0;
    } else if (stockStatusFilter === 'in') {
      matchesStatus = p.current_stock > p.reorder_level;
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku) {
      alert('Please fill in product name and SKU');
      return;
    }
    onAddProduct({
      sku: sku.toUpperCase(),
      barcode: barcode || undefined,
      name,
      category_id: `cat_${categoryName.toLowerCase().replace(/\s+/g, '_')}`,
      category_name: categoryName,
      unit,
      cost_price: costPrice,
      selling_price: sellingPrice,
      current_stock: initialStock,
      reorder_level: reorderLevel,
      branch_id: branchId,
      tax_category: 'standard_16',
    });

    setIsAddOpen(false);
    // Reset
    setName('');
    setSku('');
    setBarcode('');
    setCostPrice(0);
    setSellingPrice(0);
    setInitialStock(10);
  };

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustProduct) return;
    onAdjustStock(adjustProduct.id, newStockQty, adjustReason, adjustType);
    setAdjustProduct(null);
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferProduct) return;
    if (fromBranch === toBranch) {
      alert('Source and destination branches must be different');
      return;
    }
    try {
      onTransferStock(transferProduct.id, transferQty, fromBranch, toBranch, transferNotes);
      setTransferProduct(null);
    } catch (err: any) {
      alert(err.message || 'Transfer failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5EAE7]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#202B27] tracking-tight">
            Inventory & Traceable Stock
          </h1>
          <p className="text-xs text-[#66736B] mt-0.5">
            Real-time stock valuation, reorder alerts, branch transfers, and traceable movement history
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2.5 bg-[#00A651] hover:bg-[#00843D] text-white font-semibold text-xs rounded-lg shadow-xs flex items-center gap-1.5 transition-colors active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* 3 Metric Cards for Inventory Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-[#E5EAE7] shadow-xs">
          <div className="flex items-center justify-between text-[#66736B] mb-1">
            <span className="text-xs font-medium">Total Inventory Asset Value</span>
            <DollarSign className="w-4 h-4 text-[#00A651]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#202B27] font-mono tabular-nums">
            {formatKES(totalValuation)}
          </div>
          <div className="text-[11px] text-[#66736B] mt-1">
            At purchase cost value across all branches
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#E5EAE7] shadow-xs">
          <div className="flex items-center justify-between text-[#66736B] mb-1">
            <span className="text-xs font-medium">Low Stock Warning</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-700 font-mono tabular-nums">
            {lowStockCount} items
          </div>
          <div className="text-[11px] text-[#66736B] mt-1">
            Approaching reorder threshold
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#E5EAE7] shadow-xs">
          <div className="flex items-center justify-between text-[#66736B] mb-1">
            <span className="text-xs font-medium">Out of Stock</span>
            <Package className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-red-600 font-mono tabular-nums">
            {outOfStockCount} items
          </div>
          <div className="text-[11px] text-[#66736B] mt-1">
            Zero units on shelf
          </div>
        </div>
      </div>

      {/* Sub Tabs: Catalogue vs Movements */}
      <div className="flex items-center gap-1 border-b border-[#E5EAE7]">
        <button
          onClick={() => setActiveSubTab('catalogue')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeSubTab === 'catalogue' 
              ? 'border-[#00A651] text-[#00843D]' 
              : 'border-transparent text-[#66736B] hover:text-[#202B27]'
          }`}
        >
          Product Catalogue ({products.length})
        </button>
        <button
          onClick={() => setActiveSubTab('movements')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'movements' 
              ? 'border-[#00A651] text-[#00843D]' 
              : 'border-transparent text-[#66736B] hover:text-[#202B27]'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Stock Movement Audit History ({stockMovements.length})</span>
        </button>
      </div>

      {activeSubTab === 'catalogue' ? (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#66736B]" />
              <input
                type="text"
                placeholder="Search SKU, product name, barcode..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#E5EAE7] rounded-lg focus:outline-none focus:border-[#00A651] text-[#202B27]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-white border border-[#E5EAE7] rounded-lg text-[#202B27] focus:outline-none"
              >
                <option value="all">All Categories</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={stockStatusFilter}
                onChange={e => setStockStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-white border border-[#E5EAE7] rounded-lg text-[#202B27] focus:outline-none"
              >
                <option value="all">All Stock Statuses</option>
                <option value="in">In Stock</option>
                <option value="low">Low Stock Only</option>
                <option value="out">Out of Stock</option>
              </select>
            </div>
          </div>

          {/* Product Catalogue Table */}
          <div className="bg-white rounded-xl border border-[#E5EAE7] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F8FAF9] text-[#66736B] border-b border-[#E5EAE7] font-medium">
                  <tr>
                    <th className="px-4 py-3">Product / SKU</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3 text-right">Cost Price</th>
                    <th className="px-4 py-3 text-right">Selling Price</th>
                    <th className="px-4 py-3 text-center">Current Stock</th>
                    <th className="px-4 py-3 text-right">Total Valuation</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Stock Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5EAE7]">
                  {filteredProducts.map(p => {
                    const status = p.current_stock === 0 ? 'out_of_stock' : p.current_stock <= p.reorder_level ? 'low_stock' : 'in_stock';
                    return (
                      <tr key={p.id} className="hover:bg-[#F8FAF9] transition-colors">
                        <td className="px-4 py-3.5">
                          <span className="font-semibold text-[#202B27] block">
                            {p.name}
                          </span>
                          <span className="text-[11px] text-[#66736B] font-mono">
                            SKU: {p.sku} {p.barcode ? `· Barcode: ${p.barcode}` : ''}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-[#66736B]">
                          {p.category_name}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono text-[#66736B] tabular-nums">
                          {formatKES(p.cost_price)}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-[#202B27] tabular-nums">
                          {formatKES(p.selling_price)}
                        </td>
                        <td className="px-4 py-3.5 text-center font-mono font-bold text-[#202B27]">
                          {p.current_stock} <span className="text-[10px] font-normal text-[#66736B]">{p.unit}</span>
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono text-[#00843D] font-bold tabular-nums">
                          {formatKES(p.current_stock * p.cost_price)}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <StatusBadge status={status} />
                        </td>
                        <td className="px-4 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => {
                              setAdjustProduct(p);
                              setNewStockQty(p.current_stock);
                            }}
                            className="px-2 py-1 text-xs text-[#202B27] hover:bg-[#F8FAF9] font-medium border border-[#E5EAE7] rounded transition-colors"
                          >
                            Adjust
                          </button>
                          <button
                            onClick={() => {
                              setTransferProduct(p);
                              setTransferQty(1);
                            }}
                            className="px-2 py-1 text-xs text-[#00A651] hover:bg-[#F0F8F3] font-medium border border-[#00A651]/30 rounded transition-colors"
                          >
                            Transfer
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-xs text-[#66736B]">
                        No products match your current search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Stock Movement History (Audit Trail) */
        <div className="bg-white rounded-xl border border-[#E5EAE7] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#E5EAE7] flex justify-between items-center">
            <div>
              <h3 className="text-sm font-semibold text-[#202B27]">Traceable Stock Movement Records</h3>
              <p className="text-xs text-[#66736B]">Audited log of every single quantity deduction and addition</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F8FAF9] text-[#66736B] border-b border-[#E5EAE7] font-medium">
                <tr>
                  <th className="px-4 py-3">Timestamp / Ref</th>
                  <th className="px-4 py-3">Product Name</th>
                  <th className="px-4 py-3">Movement Type</th>
                  <th className="px-4 py-3 text-center">Change Qty</th>
                  <th className="px-4 py-3 text-center">Stock Balance</th>
                  <th className="px-4 py-3">Performed By</th>
                  <th className="px-4 py-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EAE7]">
                {stockMovements.map(m => {
                  const isPositive = m.quantity > 0;
                  return (
                    <tr key={m.id} className="hover:bg-[#F8FAF9] transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-semibold text-[#202B27] font-mono block">
                          {m.reference_id}
                        </span>
                        <span className="text-[11px] text-[#66736B]">
                          {formatDateTime(m.created_at)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-[#202B27] block">{m.product_name}</span>
                        <span className="text-[10px] text-[#66736B] font-mono">{m.sku}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="capitalize text-xs font-semibold text-[#202B27]">
                          {m.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-bold">
                        <span className={isPositive ? 'text-[#00843D]' : 'text-red-600'}>
                          {isPositive ? `+${m.quantity}` : m.quantity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-neutral-600">
                        {m.previous_stock} → <span className="font-bold text-[#202B27]">{m.new_stock}</span>
                      </td>
                      <td className="px-4 py-3 text-[#202B27]">
                        {m.performed_by_name}
                      </td>
                      <td className="px-4 py-3 text-[#66736B]">
                        {m.notes || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Product to Catalogue"
        subtitle="Specify SKU, barcode, unit cost and selling price in KES"
        maxWidth="lg"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-[#202B27] mb-1">
                Product Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Crown Silk Vinyl Paint 4L"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202B27] mb-1">
                Stock Keeping Unit (SKU) *
              </label>
              <input
                type="text"
                placeholder="e.g. CRW-SLK-4L"
                value={sku}
                onChange={e => setSku(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono uppercase bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202B27] mb-1">
                Barcode Number
              </label>
              <input
                type="text"
                placeholder="e.g. 616110012345"
                value={barcode}
                onChange={e => setBarcode(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202B27] mb-1">
                Category
              </label>
              <input
                type="text"
                placeholder="e.g. Paints, Cement, Tools"
                value={categoryName}
                onChange={e => setCategoryName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202B27] mb-1">
                Unit of Measure
              </label>
              <select
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
              >
                <option value="Pcs">Pieces (Pcs)</option>
                <option value="Bags">Bags (50kg)</option>
                <option value="Sheets">Corrugated Sheets</option>
                <option value="Bars">Steel Bars (12m)</option>
                <option value="Buckets">Buckets (20L)</option>
                <option value="Tins">Tins (4L)</option>
                <option value="Box">Boxes / Cartons</option>
                <option value="Kg">Kilograms (Kg)</option>
                <option value="Ltr">Litres (Ltr)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202B27] mb-1">
                Cost Price (KES) *
              </label>
              <input
                type="number"
                min="0"
                value={costPrice}
                onChange={e => setCostPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs font-mono bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202B27] mb-1">
                Selling Price (KES) *
              </label>
              <input
                type="number"
                min="0"
                value={sellingPrice}
                onChange={e => setSellingPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs font-mono bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202B27] mb-1">
                Initial Stock Intake
              </label>
              <input
                type="number"
                min="0"
                value={initialStock}
                onChange={e => setInitialStock(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs font-mono bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202B27] mb-1">
                Reorder Alert Level
              </label>
              <input
                type="number"
                min="0"
                value={reorderLevel}
                onChange={e => setReorderLevel(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs font-mono bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
                required
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
              Save Product & Intake Stock
            </button>
          </div>
        </form>
      </Modal>

      {/* Adjust Stock Modal */}
      {adjustProduct && (
        <Modal
          isOpen={true}
          onClose={() => setAdjustProduct(null)}
          title={`Adjust Stock for ${adjustProduct.name}`}
          subtitle={`Current stock in store: ${adjustProduct.current_stock} ${adjustProduct.unit}`}
          maxWidth="md"
        >
          <form onSubmit={handleAdjustSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#202B27] mb-1">
                New Physical Count
              </label>
              <input
                type="number"
                min="0"
                value={newStockQty}
                onChange={e => setNewStockQty(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs font-mono font-bold bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202B27] mb-1">
                Adjustment Reason / Note
              </label>
              <select
                value={adjustReason}
                onChange={e => setAdjustReason(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
              >
                <option value="Physical Stocktake Recount">Physical Stocktake Recount</option>
                <option value="Damaged Goods / Broken during handling">Damaged Goods / Broken during handling</option>
                <option value="Stock Shrinkage / Unaccounted loss">Stock Shrinkage / Unaccounted loss</option>
                <option value="Supplier Bonus / Free promotion units">Supplier Bonus / Free promotion units</option>
              </select>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAdjustProduct(null)}
                className="px-4 py-2 text-xs text-[#66736B]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#00A651] hover:bg-[#00843D] text-white font-semibold text-xs rounded-lg shadow-xs"
              >
                Log Traceable Adjustment
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Transfer Stock Modal */}
      {transferProduct && (
        <Modal
          isOpen={true}
          onClose={() => setTransferProduct(null)}
          title={`Transfer Stock: ${transferProduct.name}`}
          subtitle={`Current stock: ${transferProduct.current_stock} ${transferProduct.unit}`}
          maxWidth="md"
        >
          <form onSubmit={handleTransferSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#202B27] mb-1">
                Transfer Quantity ({transferProduct.unit})
              </label>
              <input
                type="number"
                min="1"
                max={transferProduct.current_stock}
                value={transferQty}
                onChange={e => setTransferQty(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 text-xs font-mono font-bold bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#202B27] mb-1">
                  From Branch
                </label>
                <select
                  value={fromBranch}
                  onChange={e => setFromBranch(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202B27] mb-1">
                  To Branch
                </label>
                <select
                  value={toBranch}
                  onChange={e => setToBranch(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202B27] mb-1">
                Transfer Notes / Driver
              </label>
              <input
                type="text"
                placeholder="e.g. Dispatched via Isuzu Pickup KBZ 412M"
                value={transferNotes}
                onChange={e => setTransferNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setTransferProduct(null)}
                className="px-4 py-2 text-xs text-[#66736B]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#00A651] hover:bg-[#00843D] text-white font-semibold text-xs rounded-lg shadow-xs"
              >
                Execute Inter-Branch Transfer
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
