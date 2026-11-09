import React, { useState } from 'react';
import { 
  Receipt, 
  Plus, 
  Search, 
  DollarSign, 
  Calendar, 
  CreditCard,
  Building2,
  PieChart
} from 'lucide-react';
import { Expense, PaymentMethod, Organisation } from '../types';
import { formatKES, formatDate, generateMPesaRef } from '../utils/formatters';
import { Modal } from '../components/common/Modal';

interface ExpensesViewProps {
  expenses: Expense[];
  organisation: Organisation;
  onAddExpense: (expenseData: any) => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses,
  organisation,
  onAddExpense,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New Expense Form State
  const [category, setCategory] = useState<Expense['category']>('Electricity (KPLC)');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa');
  const [payeeName, setPayeeName] = useState('Kenya Power Prepaid Paybill 888880');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Group by category for quick breakdown
  const categoryTotals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      alert('Please enter a valid expense amount');
      return;
    }
    if (!payeeName.trim()) {
      alert('Please enter who was paid');
      return;
    }

    onAddExpense({
      category,
      amount,
      payment_method: paymentMethod,
      payee_name: payeeName,
      reference_number: referenceNumber || (paymentMethod === 'mpesa' ? generateMPesaRef() : undefined),
      branch_id: organisation.branches[0]?.id || 'branch_cbd',
      date,
      notes: notes || undefined,
    });

    setIsAddOpen(false);
    setAmount(0);
    setPayeeName('');
    setReferenceNumber('');
    setNotes('');
  };

  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = 
      e.expense_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.payee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.reference_number && e.reference_number.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5EAE7]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#202B27] tracking-tight">
            Operating Expenses & Overhead
          </h1>
          <p className="text-xs text-[#66736B] mt-0.5">
            Record rent, KPLC electricity tokens, salaries, transport, county levies and supplies
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2.5 bg-[#00A651] hover:bg-[#00843D] text-white font-semibold text-xs rounded-lg shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Record Expense</span>
        </button>
      </div>

      {/* Expense Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-[#E5EAE7] shadow-xs">
          <span className="text-xs font-medium text-[#66736B] block">Total Monthly Expenses</span>
          <span className="text-xl sm:text-2xl font-bold text-red-600 font-mono tabular-nums block mt-1">
            {formatKES(totalExpenses)}
          </span>
          <span className="text-[11px] text-[#66736B] mt-1 block">
            Across {expenses.length} operating payment vouchers
          </span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#E5EAE7] shadow-xs">
          <span className="text-xs font-medium text-[#66736B] block">Top Expense Category</span>
          <span className="text-base sm:text-lg font-bold text-[#202B27] block mt-1 truncate">
            {sortedCategories[0]?.[0] || 'Rent'}
          </span>
          <span className="text-xs text-red-600 font-mono font-semibold mt-0.5 block">
            {sortedCategories[0] ? formatKES(sortedCategories[0][1]) : 'KES 0.00'}
          </span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#E5EAE7] shadow-xs">
          <span className="text-xs font-medium text-[#66736B] block">M-Pesa Disbursed Expenses</span>
          <span className="text-xl sm:text-2xl font-bold text-[#00843D] font-mono tabular-nums block mt-1">
            {formatKES(expenses.filter(e => e.payment_method === 'mpesa').reduce((s, e) => s + e.amount, 0))}
          </span>
          <span className="text-[11px] text-[#66736B] mt-1 block">
            Paid via Till / Paybill / Send Money
          </span>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#66736B]" />
          <input
            type="text"
            placeholder="Search expense #, payee, M-Pesa ref..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#E5EAE7] rounded-lg focus:outline-none focus:border-[#00A651] text-[#202B27]"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-3 py-1.5 text-xs bg-white border border-[#E5EAE7] rounded-lg text-[#202B27] self-stretch sm:self-auto"
        >
          <option value="all">All Expense Categories</option>
          <option value="Rent">Rent</option>
          <option value="Electricity (KPLC)">Electricity (KPLC)</option>
          <option value="Water">Water</option>
          <option value="Salaries">Salaries & Wages</option>
          <option value="Transport & Fuel">Transport & Fuel</option>
          <option value="Internet & Telco">Internet & Telco</option>
          <option value="Supplies">Supplies</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Licences & County Levies">Licences & County Levies</option>
        </select>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-xl border border-[#E5EAE7] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F8FAF9] text-[#66736B] border-b border-[#E5EAE7] font-medium">
              <tr>
                <th className="px-4 py-3">Voucher # / Date</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Payee / Vendor</th>
                <th className="px-4 py-3">Payment Method</th>
                <th className="px-4 py-3 text-right">Amount (KES)</th>
                <th className="px-4 py-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EAE7]">
              {filteredExpenses.map(exp => (
                <tr key={exp.id} className="hover:bg-[#F8FAF9] transition-colors">
                  <td className="px-4 py-3.5">
                    <span className="font-semibold text-[#202B27] font-mono block">
                      {exp.expense_number}
                    </span>
                    <span className="text-[11px] text-[#66736B]">
                      {formatDate(exp.date)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-semibold text-[#202B27] block">{exp.category}</span>
                  </td>
                  <td className="px-4 py-3.5 text-[#202B27]">{exp.payee_name}</td>
                  <td className="px-4 py-3.5">
                    <span className="uppercase text-[11px] font-semibold text-[#202B27] block">
                      {exp.payment_method.replace('_', ' ')}
                    </span>
                    {exp.reference_number && (
                      <span className="text-[10px] text-[#00843D] font-mono block">
                        {exp.reference_number}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-red-600 tabular-nums">
                    {formatKES(exp.amount)}
                  </td>
                  <td className="px-4 py-3.5 text-[#66736B] max-w-xs truncate">
                    {exp.notes || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Expense Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Record Operating Expense"
        subtitle="Simple expense voucher with Kenyan categories and M-Pesa references"
        maxWidth="md"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#202B27] mb-1">
              What did you spend money on? (Category) *
            </label>
            <select
              value={category}
              onChange={e => {
                const val = e.target.value as any;
                setCategory(val);
                if (val === 'Electricity (KPLC)') setPayeeName('Kenya Power Prepaid Paybill 888880');
                else if (val === 'Internet & Telco') setPayeeName('Safaricom Business Fibre');
                else if (val === 'Transport & Fuel') setPayeeName('TotalEnergies Fuel Station');
                else if (val === 'Rent') setPayeeName('Landlord / Property Managers');
              }}
              className="w-full px-3 py-2 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
            >
              <option value="Rent">Rent (Premises / Shop)</option>
              <option value="Electricity (KPLC)">Electricity (KPLC Prepaid/Postpaid)</option>
              <option value="Water">Water (Nairobi Water / County)</option>
              <option value="Salaries">Salaries & Staff Casual Wages</option>
              <option value="Transport & Fuel">Transport, Fuel & Delivery Lorry</option>
              <option value="Internet & Telco">Internet & Telco (Safaricom)</option>
              <option value="Supplies">Store Supplies & Packaging</option>
              <option value="Maintenance">Store Maintenance & Repairs</option>
              <option value="Licences & County Levies">Licences & County Council Levies</option>
              <option value="Marketing">Marketing & Signs</option>
              <option value="Other">Other Operating Expense</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202B27] mb-1">
              Amount Spent (KES) *
            </label>
            <input
              type="number"
              min="1"
              value={amount || ''}
              onChange={e => setAmount(parseFloat(e.target.value) || 0)}
              placeholder="e.g. 15000"
              className="w-full px-3 py-2 text-xs font-mono font-bold bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#202B27] mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
              >
                <option value="mpesa">Safaricom M-Pesa</option>
                <option value="cash">Cash Till</option>
                <option value="bank_transfer">Bank Transfer (EFT)</option>
                <option value="card">Card / Cheque</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202B27] mb-1">
                Expense Date
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202B27] mb-1">
              Payee / Vendor Name *
            </label>
            <input
              type="text"
              placeholder="e.g. TotalEnergies or Landlord Name"
              value={payeeName}
              onChange={e => setPayeeName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202B27] mb-1">
              Reference Number (M-Pesa Code or Receipt #)
            </label>
            <input
              type="text"
              placeholder="e.g. QHH718291A"
              value={referenceNumber}
              onChange={e => setReferenceNumber(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202B27] mb-1">
              Description / Notes
            </label>
            <input
              type="text"
              placeholder="e.g. KPLC token for CBD store meter # 3719284"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
            />
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
              Save Expense Voucher
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
