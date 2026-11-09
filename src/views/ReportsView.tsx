import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  FileSpreadsheet, 
  Filter, 
  TrendingUp, 
  AlertTriangle,
  Users,
  Truck,
  Check
} from 'lucide-react';
import { 
  Sale, 
  Invoice, 
  Product, 
  Expense, 
  Customer, 
  Supplier, 
  Organisation 
} from '../types';
import { formatKES, formatDate } from '../utils/formatters';

interface ReportsViewProps {
  sales: Sale[];
  invoices: Invoice[];
  products: Product[];
  expenses: Expense[];
  customers: Customer[];
  suppliers: Supplier[];
  organisation: Organisation;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  sales,
  invoices,
  products,
  expenses,
  customers,
  suppliers,
  organisation,
}) => {
  const [reportType, setReportType] = useState<
    'sales' | 'inventory_valuation' | 'low_stock' | 'customer_balances' | 'supplier_balances' | 'expenses'
  >('sales');

  // CSV export helper
  const exportToCSV = (filename: string, rows: string[][]) => {
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadCSV = () => {
    if (reportType === 'sales') {
      const rows = [
        ['Receipt #', 'Date', 'Customer', 'Items Count', 'Payment Method', 'Payment Reference', 'Subtotal (KES)', 'VAT (KES)', 'Grand Total (KES)'],
        ...sales.map(s => [
          s.receipt_number,
          s.created_at,
          s.customer_name,
          s.items.length.toString(),
          s.payment_method,
          s.payment_reference || '',
          s.subtotal.toString(),
          s.tax_total.toString(),
          s.grand_total.toString(),
        ])
      ];
      exportToCSV('BiasharaOS_Sales_Report', rows);
    } else if (reportType === 'inventory_valuation') {
      const rows = [
        ['SKU', 'Barcode', 'Product Name', 'Category', 'Unit', 'Cost Price (KES)', 'Selling Price (KES)', 'Current Stock', 'Asset Valuation (KES)'],
        ...products.map(p => [
          p.sku,
          p.barcode || '',
          p.name,
          p.category_name,
          p.unit,
          p.cost_price.toString(),
          p.selling_price.toString(),
          p.current_stock.toString(),
          (p.current_stock * p.cost_price).toString(),
        ])
      ];
      exportToCSV('BiasharaOS_Inventory_Valuation', rows);
    } else if (reportType === 'low_stock') {
      const rows = [
        ['SKU', 'Product Name', 'Category', 'Unit', 'Current Stock', 'Reorder Level', 'Deficit'],
        ...products.filter(p => p.current_stock <= p.reorder_level).map(p => [
          p.sku,
          p.name,
          p.category_name,
          p.unit,
          p.current_stock.toString(),
          p.reorder_level.toString(),
          (p.reorder_level - p.current_stock).toString(),
        ])
      ];
      exportToCSV('BiasharaOS_Low_Stock_Report', rows);
    } else if (reportType === 'customer_balances') {
      const rows = [
        ['Customer Name', 'Phone', 'County', 'Type', 'KRA PIN', 'Credit Limit (KES)', 'Outstanding Debt (KES)'],
        ...customers.map(c => [
          c.name,
          c.phone,
          c.county,
          c.customer_type,
          c.kra_pin || '',
          c.credit_limit.toString(),
          c.outstanding_balance.toString(),
        ])
      ];
      exportToCSV('BiasharaOS_Customer_Debtors_Report', rows);
    } else if (reportType === 'supplier_balances') {
      const rows = [
        ['Supplier Name', 'Contact Person', 'Phone', 'Category', 'Terms Days', 'Outstanding Payable (KES)'],
        ...suppliers.map(s => [
          s.name,
          s.contact_person,
          s.phone,
          s.category,
          s.payment_terms_days.toString(),
          s.outstanding_balance.toString(),
        ])
      ];
      exportToCSV('BiasharaOS_Supplier_Payables_Report', rows);
    } else if (reportType === 'expenses') {
      const rows = [
        ['Voucher #', 'Date', 'Category', 'Payee / Vendor', 'Payment Method', 'Reference', 'Amount (KES)', 'Notes'],
        ...expenses.map(e => [
          e.expense_number,
          e.date,
          e.category,
          e.payee_name,
          e.payment_method,
          e.reference_number || '',
          e.amount.toString(),
          e.notes || '',
        ])
      ];
      exportToCSV('BiasharaOS_Operating_Expenses_Report', rows);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5EAE7]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#202B27] tracking-tight">
            Reports & Business Intelligence
          </h1>
          <p className="text-xs text-[#66736B] mt-0.5">
            Operational and tax summaries with instantaneous CSV data export for KRA compliance
          </p>
        </div>

        <button
          onClick={handleDownloadCSV}
          className="px-4 py-2 bg-[#00A651] hover:bg-[#00843D] text-white font-semibold text-xs rounded-lg shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto active:scale-[0.98]"
        >
          <Download className="w-4 h-4" />
          <span>Export Current Report to CSV</span>
        </button>
      </div>

      {/* Report Selector Pills / Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <button
          onClick={() => setReportType('sales')}
          className={`p-3 rounded-lg border text-left transition-colors ${
            reportType === 'sales' ? 'bg-[#F0F8F3] border-[#00A651] text-[#00843D] font-semibold' : 'bg-white border-[#E5EAE7] text-[#202B27] hover:bg-[#F8FAF9]'
          }`}
        >
          <div className="text-xs font-semibold">Sales Summary</div>
          <div className="text-[10px] text-[#66736B] mt-0.5">{sales.length} transactions</div>
        </button>

        <button
          onClick={() => setReportType('inventory_valuation')}
          className={`p-3 rounded-lg border text-left transition-colors ${
            reportType === 'inventory_valuation' ? 'bg-[#F0F8F3] border-[#00A651] text-[#00843D] font-semibold' : 'bg-white border-[#E5EAE7] text-[#202B27] hover:bg-[#F8FAF9]'
          }`}
        >
          <div className="text-xs font-semibold">Stock Valuation</div>
          <div className="text-[10px] text-[#66736B] mt-0.5">{products.length} products</div>
        </button>

        <button
          onClick={() => setReportType('low_stock')}
          className={`p-3 rounded-lg border text-left transition-colors ${
            reportType === 'low_stock' ? 'bg-[#F0F8F3] border-[#00A651] text-[#00843D] font-semibold' : 'bg-white border-[#E5EAE7] text-[#202B27] hover:bg-[#F8FAF9]'
          }`}
        >
          <div className="text-xs font-semibold">Low-Stock Alert</div>
          <div className="text-[10px] text-amber-700 mt-0.5">{products.filter(p => p.current_stock <= p.reorder_level).length} below threshold</div>
        </button>

        <button
          onClick={() => setReportType('customer_balances')}
          className={`p-3 rounded-lg border text-left transition-colors ${
            reportType === 'customer_balances' ? 'bg-[#F0F8F3] border-[#00A651] text-[#00843D] font-semibold' : 'bg-white border-[#E5EAE7] text-[#202B27] hover:bg-[#F8FAF9]'
          }`}
        >
          <div className="text-xs font-semibold">Customer Debtors</div>
          <div className="text-[10px] text-[#66736B] mt-0.5">{customers.length} debtors</div>
        </button>

        <button
          onClick={() => setReportType('supplier_balances')}
          className={`p-3 rounded-lg border text-left transition-colors ${
            reportType === 'supplier_balances' ? 'bg-[#F0F8F3] border-[#00A651] text-[#00843D] font-semibold' : 'bg-white border-[#E5EAE7] text-[#202B27] hover:bg-[#F8FAF9]'
          }`}
        >
          <div className="text-xs font-semibold">Supplier Payables</div>
          <div className="text-[10px] text-[#66736B] mt-0.5">{suppliers.length} vendors</div>
        </button>

        <button
          onClick={() => setReportType('expenses')}
          className={`p-3 rounded-lg border text-left transition-colors ${
            reportType === 'expenses' ? 'bg-[#F0F8F3] border-[#00A651] text-[#00843D] font-semibold' : 'bg-white border-[#E5EAE7] text-[#202B27] hover:bg-[#F8FAF9]'
          }`}
        >
          <div className="text-xs font-semibold">Expense Analysis</div>
          <div className="text-[10px] text-[#66736B] mt-0.5">{expenses.length} vouchers</div>
        </button>
      </div>

      {/* Render Selected Report Table */}
      <div className="bg-white rounded-xl border border-[#E5EAE7] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E5EAE7] flex justify-between items-center">
          <div>
            <h3 className="text-sm font-semibold text-[#202B27] capitalize">
              {reportType.replace('_', ' ')} Report
            </h3>
            <span className="text-xs text-[#66736B]">Audited data view</span>
          </div>
          <button
            onClick={handleDownloadCSV}
            className="text-xs font-semibold text-[#00A651] hover:underline flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          {reportType === 'sales' && (
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F8FAF9] text-[#66736B] border-b border-[#E5EAE7]">
                <tr>
                  <th className="px-4 py-3">Receipt #</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3 text-right">Subtotal</th>
                  <th className="px-4 py-3 text-right">16% VAT</th>
                  <th className="px-4 py-3 text-right">Grand Total (KES)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EAE7]">
                {sales.map(s => (
                  <tr key={s.id}>
                    <td className="px-4 py-3 font-mono font-bold text-[#202B27]">{s.receipt_number}</td>
                    <td className="px-4 py-3 text-[#66736B]">{formatDate(s.created_at)}</td>
                    <td className="px-4 py-3 font-medium text-[#202B27]">{s.customer_name}</td>
                    <td className="px-4 py-3 uppercase font-semibold text-[11px] text-[#00843D]">{s.payment_method}</td>
                    <td className="px-4 py-3 text-right font-mono">{formatKES(s.subtotal)}</td>
                    <td className="px-4 py-3 text-right font-mono text-[#66736B]">{formatKES(s.tax_total)}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-[#202B27]">{formatKES(s.grand_total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'inventory_valuation' && (
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F8FAF9] text-[#66736B] border-b border-[#E5EAE7]">
                <tr>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Product Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-right">Cost Price</th>
                  <th className="px-4 py-3 text-right">Selling Price</th>
                  <th className="px-4 py-3 text-center">Stock Balance</th>
                  <th className="px-4 py-3 text-right">Total Asset Valuation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EAE7]">
                {products.map(p => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 font-mono font-bold text-[#202B27]">{p.sku}</td>
                    <td className="px-4 py-3 font-medium text-[#202B27]">{p.name}</td>
                    <td className="px-4 py-3 text-[#66736B]">{p.category_name}</td>
                    <td className="px-4 py-3 text-right font-mono text-[#66736B]">{formatKES(p.cost_price)}</td>
                    <td className="px-4 py-3 text-right font-mono">{formatKES(p.selling_price)}</td>
                    <td className="px-4 py-3 text-center font-mono font-bold">{p.current_stock} {p.unit}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-[#00843D]">{formatKES(p.current_stock * p.cost_price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'low_stock' && (
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F8FAF9] text-[#66736B] border-b border-[#E5EAE7]">
                <tr>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Product Name</th>
                  <th className="px-4 py-3 text-center">Current Stock</th>
                  <th className="px-4 py-3 text-center">Reorder Threshold</th>
                  <th className="px-4 py-3 text-right">Reorder Deficit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EAE7]">
                {products.filter(p => p.current_stock <= p.reorder_level).map(p => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 font-mono font-bold text-[#202B27]">{p.sku}</td>
                    <td className="px-4 py-3 font-medium text-[#202B27]">{p.name}</td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-red-600">{p.current_stock} {p.unit}</td>
                    <td className="px-4 py-3 text-center font-mono">{p.reorder_level} {p.unit}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-amber-700">
                      Order +{Math.max(0, p.reorder_level - p.current_stock + 20)} {p.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'customer_balances' && (
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F8FAF9] text-[#66736B] border-b border-[#E5EAE7]">
                <tr>
                  <th className="px-4 py-3">Customer Name</th>
                  <th className="px-4 py-3">County</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3 text-right">Credit Limit</th>
                  <th className="px-4 py-3 text-right">Outstanding Debt (KES)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EAE7]">
                {customers.map(c => (
                  <tr key={c.id}>
                    <td className="px-4 py-3 font-semibold text-[#202B27]">{c.name}</td>
                    <td className="px-4 py-3 text-[#66736B]">{c.county}</td>
                    <td className="px-4 py-3 capitalize">{c.customer_type}</td>
                    <td className="px-4 py-3 text-right font-mono text-[#66736B]">{formatKES(c.credit_limit)}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-red-600">{formatKES(c.outstanding_balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'supplier_balances' && (
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F8FAF9] text-[#66736B] border-b border-[#E5EAE7]">
                <tr>
                  <th className="px-4 py-3">Supplier Name</th>
                  <th className="px-4 py-3">Contact Person</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-center">Credit Terms</th>
                  <th className="px-4 py-3 text-right">Outstanding Payable (KES)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EAE7]">
                {suppliers.map(s => (
                  <tr key={s.id}>
                    <td className="px-4 py-3 font-semibold text-[#202B27]">{s.name}</td>
                    <td className="px-4 py-3 text-[#66736B]">{s.contact_person}</td>
                    <td className="px-4 py-3 text-[#66736B]">{s.category}</td>
                    <td className="px-4 py-3 text-center font-mono">{s.payment_terms_days} days</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-red-600">{formatKES(s.outstanding_balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'expenses' && (
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F8FAF9] text-[#66736B] border-b border-[#E5EAE7]">
                <tr>
                  <th className="px-4 py-3">Voucher #</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Payee</th>
                  <th className="px-4 py-3">Channel</th>
                  <th className="px-4 py-3 text-right">Amount (KES)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EAE7]">
                {expenses.map(e => (
                  <tr key={e.id}>
                    <td className="px-4 py-3 font-mono font-bold text-[#202B27]">{e.expense_number}</td>
                    <td className="px-4 py-3 text-[#66736B]">{formatDate(e.date)}</td>
                    <td className="px-4 py-3 font-medium text-[#202B27]">{e.category}</td>
                    <td className="px-4 py-3 text-[#66736B]">{e.payee_name}</td>
                    <td className="px-4 py-3 uppercase text-[11px] font-semibold text-[#00843D]">{e.payment_method}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-red-600">{formatKES(e.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
