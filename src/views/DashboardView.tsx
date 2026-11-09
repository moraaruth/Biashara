import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  CreditCard, 
  FileText, 
  Package, 
  Receipt, 
  AlertTriangle, 
  ArrowUpRight, 
  ShoppingCart, 
  Plus, 
  Users, 
  Truck,
  Calendar,
  Layers,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { 
  Organisation, 
  Sale, 
  Invoice, 
  Product, 
  Expense, 
  AuditLog, 
  User 
} from '../types';
import { formatKES, formatDateTime, formatDate } from '../utils/formatters';
import { StatusBadge } from '../components/common/StatusBadge';

interface DashboardViewProps {
  organisation: Organisation;
  currentUser: User;
  sales: Sale[];
  invoices: Invoice[];
  products: Product[];
  expenses: Expense[];
  auditLogs: AuditLog[];
  onQuickAction: (action: 'sale' | 'invoice' | 'product' | 'expense' | 'customer' | 'po') => void;
  onNavigate: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  organisation,
  currentUser,
  sales,
  invoices,
  products,
  expenses,
  auditLogs,
  onQuickAction,
  onNavigate,
}) => {
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'quarter' | 'all'>('month');

  // Dynamic calculations based on real data
  const metrics = useMemo(() => {
    // Total Sales in scope
    const totalSales = sales.reduce((sum, s) => sum + s.grand_total, 0);
    
    // Total Outstanding Invoices
    const unpaidInvoices = invoices.filter(i => i.status !== 'paid' && i.status !== 'cancelled');
    const totalOutstandingInvoices = unpaidInvoices.reduce((sum, i) => sum + i.balance_due, 0);

    // Total Expenses
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Cost of Goods Sold from sales items
    const totalCogs = sales.reduce((sum, s) => {
      const saleCogs = s.items.reduce((c, item) => c + (item.cost_price * item.quantity), 0);
      return sum + saleCogs;
    }, 0);

    // Estimated Gross Profit = Sales - COGS
    const estimatedGrossProfit = Math.max(0, totalSales - totalCogs);
    const grossMargin = totalSales > 0 ? ((estimatedGrossProfit / totalSales) * 100).toFixed(1) : '0.0';

    // Low stock and out of stock
    const lowStockItems = products.filter(p => p.current_stock > 0 && p.current_stock <= p.reorder_level);
    const outOfStockItems = products.filter(p => p.current_stock === 0);

    // Stock total valuation
    const stockValuation = products.reduce((sum, p) => sum + (p.current_stock * p.cost_price), 0);

    // Top selling products
    const productSalesCount: Record<string, { product: Product; qty: number; revenue: number }> = {};
    sales.forEach(s => {
      s.items.forEach(item => {
        if (!productSalesCount[item.product_id]) {
          const found = products.find(p => p.id === item.product_id) || {
            id: item.product_id,
            name: item.product_name,
            sku: item.sku,
            current_stock: 0,
            selling_price: item.unit_price,
            unit: 'Pcs'
          } as Product;
          productSalesCount[item.product_id] = { product: found, qty: 0, revenue: 0 };
        }
        productSalesCount[item.product_id].qty += item.quantity;
        productSalesCount[item.product_id].revenue += item.total;
      });
    });

    const topProducts = Object.values(productSalesCount)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 4);

    return {
      totalSales,
      totalOutstandingInvoices,
      unpaidInvoicesCount: unpaidInvoices.length,
      totalExpenses,
      estimatedGrossProfit,
      grossMargin,
      lowStockItems,
      outOfStockItems,
      stockValuation,
      topProducts,
    };
  }, [sales, invoices, products, expenses]);

  // Greeting helper
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Habari ya asubuhi (Good morning)';
    if (hour < 17) return 'Habari ya mchana (Good afternoon)';
    return 'Habari ya jioni (Good evening)';
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome Bar & Date Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5EAE7]">
        <div>
          <span className="text-xs text-[#00A651] font-semibold tracking-wide uppercase">
            {getGreeting()}
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-[#202B27] tracking-tight">
            {organisation.trading_name || organisation.name}
          </h1>
          <p className="text-xs text-[#66736B] mt-0.5">
            Operational dashboard for {organisation.county} County · Currency: {organisation.currency}
          </p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-[#E5EAE7] rounded-lg shrink-0">
          <Calendar className="w-3.5 h-3.5 text-[#66736B] ml-2" />
          <button
            onClick={() => setDateRange('today')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              dateRange === 'today' ? 'bg-[#00A651] text-white shadow-xs' : 'text-[#66736B] hover:text-[#202B27]'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setDateRange('week')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              dateRange === 'week' ? 'bg-[#00A651] text-white shadow-xs' : 'text-[#66736B] hover:text-[#202B27]'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setDateRange('month')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              dateRange === 'month' ? 'bg-[#00A651] text-white shadow-xs' : 'text-[#66736B] hover:text-[#202B27]'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setDateRange('all')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              dateRange === 'all' ? 'bg-[#00A651] text-white shadow-xs' : 'text-[#66736B] hover:text-[#202B27]'
            }`}
          >
            All
          </button>
        </div>
      </div>

      {/* Prominent Quick-Action Strip */}
      <div className="p-3 bg-white rounded-xl border border-[#E5EAE7] flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-[#202B27] mr-1 hidden sm:inline">
          Quick Actions:
        </span>
        <button
          onClick={() => onQuickAction('sale')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00A651] hover:bg-[#00843D] text-white text-xs font-medium rounded-lg shadow-xs transition-colors"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>Record Sale (POS)</span>
        </button>
        <button
          onClick={() => onQuickAction('invoice')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F8FAF9] hover:bg-[#F0F8F3] hover:text-[#00843D] text-[#202B27] text-xs font-medium rounded-lg border border-[#E5EAE7] transition-colors"
        >
          <FileText className="w-3.5 h-3.5 text-[#00A651]" />
          <span>Create Invoice</span>
        </button>
        <button
          onClick={() => onQuickAction('product')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F8FAF9] hover:bg-[#F0F8F3] hover:text-[#00843D] text-[#202B27] text-xs font-medium rounded-lg border border-[#E5EAE7] transition-colors"
        >
          <Package className="w-3.5 h-3.5 text-[#00A651]" />
          <span>Add Product</span>
        </button>
        <button
          onClick={() => onQuickAction('expense')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F8FAF9] hover:bg-[#F0F8F3] hover:text-[#00843D] text-[#202B27] text-xs font-medium rounded-lg border border-[#E5EAE7] transition-colors"
        >
          <Receipt className="w-3.5 h-3.5 text-[#00A651]" />
          <span>Record Expense</span>
        </button>
        <button
          onClick={() => onQuickAction('customer')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F8FAF9] hover:bg-[#F0F8F3] hover:text-[#00843D] text-[#202B27] text-xs font-medium rounded-lg border border-[#E5EAE7] transition-colors"
        >
          <Users className="w-3.5 h-3.5 text-[#00A651]" />
          <span>Add Customer</span>
        </button>
        <button
          onClick={() => onQuickAction('po')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F8FAF9] hover:bg-[#F0F8F3] hover:text-[#00843D] text-[#202B27] text-xs font-medium rounded-lg border border-[#E5EAE7] transition-colors"
        >
          <Truck className="w-3.5 h-3.5 text-[#00A651]" />
          <span>Purchase Order</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Sales */}
        <div className="p-4 bg-white rounded-xl border border-[#E5EAE7] shadow-xs">
          <div className="flex items-center justify-between text-[#66736B] mb-2">
            <span className="text-xs font-medium">Sales Revenue</span>
            <div className="w-7 h-7 rounded-lg bg-[#F0F8F3] text-[#00A651] flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#202B27] font-mono tabular-nums">
            {formatKES(metrics.totalSales)}
          </div>
          <div className="text-xs text-[#00843D] font-medium mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{sales.length} completed transactions</span>
          </div>
        </div>

        {/* Metric 2: Outstanding Invoices */}
        <div className="p-4 bg-white rounded-xl border border-[#E5EAE7] shadow-xs">
          <div className="flex items-center justify-between text-[#66736B] mb-2">
            <span className="text-xs font-medium">Customer Debts / Invoices</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#202B27] font-mono tabular-nums">
            {formatKES(metrics.totalOutstandingInvoices)}
          </div>
          <div className="text-xs text-amber-700 font-medium mt-1">
            <span>{metrics.unpaidInvoicesCount} unpaid/partial invoices</span>
          </div>
        </div>

        {/* Metric 3: Total Expenses */}
        <div className="p-4 bg-white rounded-xl border border-[#E5EAE7] shadow-xs">
          <div className="flex items-center justify-between text-[#66736B] mb-2">
            <span className="text-xs font-medium">Operating Expenses</span>
            <div className="w-7 h-7 rounded-lg bg-neutral-100 text-neutral-700 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#202B27] font-mono tabular-nums">
            {formatKES(metrics.totalExpenses)}
          </div>
          <div className="text-xs text-[#66736B] font-medium mt-1">
            <span>Rent, KPLC power, fuel, salaries</span>
          </div>
        </div>

        {/* Metric 4: Estimated Gross Profit */}
        <div className="p-4 bg-white rounded-xl border border-[#E5EAE7] shadow-xs">
          <div className="flex items-center justify-between text-[#66736B] mb-2">
            <span className="text-xs font-medium">Estimated Gross Profit</span>
            <div className="w-7 h-7 rounded-lg bg-[#F0F8F3] text-[#00843D] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#00843D] font-mono tabular-nums">
            {formatKES(metrics.estimatedGrossProfit)}
          </div>
          <div className="text-xs text-[#00843D] font-medium mt-1">
            <span>{metrics.grossMargin}% gross product margin</span>
          </div>
        </div>
      </div>

      {/* Stock Alerts & Fast Overview */}
      {(metrics.lowStockItems.length > 0 || metrics.outOfStockItems.length > 0) && (
        <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold text-amber-900">
                Inventory Reorder Alert ({metrics.lowStockItems.length + metrics.outOfStockItems.length} items need attention)
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                {metrics.outOfStockItems.length > 0 && `${metrics.outOfStockItems.length} items completely out of stock. `}
                {metrics.lowStockItems.length > 0 && `${metrics.lowStockItems.length} items below reorder threshold.`}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('inventory')}
            className="px-3 py-1.5 bg-white border border-amber-300 hover:bg-amber-100/50 text-amber-900 text-xs font-medium rounded-lg transition-colors shrink-0"
          >
            Review Stock in Store →
          </button>
        </div>
      )}

      {/* Main 2-Column Split: Recent Sales vs Top Products & Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Recent Sales & Orders */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Sales Table */}
          <div className="bg-white rounded-xl border border-[#E5EAE7] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#E5EAE7] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#202B27]">Recent Sales Transactions</h3>
                <p className="text-xs text-[#66736B]">Instant POS checkout and M-Pesa receipts</p>
              </div>
              <button
                onClick={() => onNavigate('sales')}
                className="text-xs font-semibold text-[#00A651] hover:underline flex items-center gap-1"
              >
                <span>View all sales</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F8FAF9] text-[#66736B] border-b border-[#E5EAE7] font-medium">
                  <tr>
                    <th className="px-4 py-2.5">Receipt / Date</th>
                    <th className="px-4 py-2.5">Customer</th>
                    <th className="px-4 py-2.5">Payment</th>
                    <th className="px-4 py-2.5 text-right">Amount (KES)</th>
                    <th className="px-4 py-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5EAE7]">
                  {sales.slice(0, 5).map(sale => (
                    <tr key={sale.id} className="hover:bg-[#F8FAF9] transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-[#202B27] font-mono">{sale.receipt_number}</div>
                        <div className="text-[11px] text-[#66736B]">{formatDate(sale.created_at)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-[#202B27]">{sale.customer_name}</div>
                        <div className="text-[10px] text-[#66736B]">{sale.items.length} items sold</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="uppercase text-[11px] font-semibold text-[#202B27] block">
                          {sale.payment_method.replace('_', ' ')}
                        </span>
                        {sale.payment_reference && (
                          <span className="text-[10px] text-[#00843D] font-mono block">
                            {sale.payment_reference}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-[#202B27] tabular-nums">
                        {formatKES(sale.grand_total)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={sale.payment_status} />
                      </td>
                    </tr>
                  ))}
                  {sales.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-xs text-[#66736B]">
                        No sales recorded yet. Click "Record Sale" to complete your first checkout.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Unpaid Customer Invoices Highlight */}
          <div className="bg-white rounded-xl border border-[#E5EAE7] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#E5EAE7] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#202B27]">Outstanding Invoices & Receivables</h3>
                <p className="text-xs text-[#66736B]">Track credit given to contractors and wholesale buyers</p>
              </div>
              <button
                onClick={() => onNavigate('invoicing')}
                className="text-xs font-semibold text-[#00A651] hover:underline flex items-center gap-1"
              >
                <span>Manage invoices</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-[#E5EAE7]">
              {invoices.filter(i => i.status !== 'paid').slice(0, 3).map(inv => (
                <div key={inv.id} className="p-4 flex items-center justify-between hover:bg-[#F8FAF9] transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#202B27]">{inv.invoice_number}</span>
                      <StatusBadge status={inv.status} />
                    </div>
                    <div className="text-xs font-medium text-[#202B27] mt-0.5">{inv.customer_name}</div>
                    <div className="text-[11px] text-[#66736B]">
                      Due on {formatDate(inv.due_date)} · Total: {formatKES(inv.grand_total)}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-[#66736B] block">Balance Due:</span>
                    <span className="font-mono text-xs font-bold text-red-600 tabular-nums">
                      {formatKES(inv.balance_due)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1/3): Top Products & Audit Activity */}
        <div className="space-y-6">
          {/* Top Selling Products */}
          <div className="p-4 bg-white rounded-xl border border-[#E5EAE7] shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E5EAE7]">
              <div>
                <h3 className="text-sm font-semibold text-[#202B27]">Top Fast-Moving Items</h3>
                <span className="text-xs text-[#66736B]">By revenue generated</span>
              </div>
              <button
                onClick={() => onNavigate('inventory')}
                className="text-xs text-[#00A651] font-semibold hover:underline"
              >
                Stock
              </button>
            </div>

            <div className="space-y-3">
              {metrics.topProducts.map(({ product, qty, revenue }) => (
                <div key={product.id} className="flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-2">
                    <span className="font-medium text-[#202B27] truncate block" title={product.name}>
                      {product.name}
                    </span>
                    <span className="text-[11px] text-[#66736B] block">
                      {qty} {product.unit} sold · {product.current_stock} remaining in store
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-[#202B27] tabular-nums block">
                      {formatKES(revenue)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Activity Feed */}
          <div className="p-4 bg-white rounded-xl border border-[#E5EAE7] shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E5EAE7]">
              <div>
                <h3 className="text-sm font-semibold text-[#202B27]">Live Business Activity</h3>
                <span className="text-xs text-[#66736B]">Traceable audit logs</span>
              </div>
              <Clock className="w-3.5 h-3.5 text-[#66736B]" />
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {auditLogs.slice(0, 6).map(log => (
                <div key={log.id} className="p-2 bg-[#F8FAF9] rounded-lg border border-[#E5EAE7] text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-[#00843D] text-[11px]">
                      {log.user_name}
                    </span>
                    <span className="text-[10px] text-[#66736B]">
                      {formatDateTime(log.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-[#202B27] leading-relaxed">
                    {log.details}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
