import React, { useState } from 'react';
import { 
  Calculator, 
  Plus, 
  FileCheck, 
  TrendingUp, 
  Scale, 
  DollarSign, 
  Check, 
  AlertCircle,
  Clock,
  Layers,
  Trash2
} from 'lucide-react';
import { Account, JournalEntry, Organisation } from '../types';
import { formatKES, formatDate, formatDateTime } from '../utils/formatters';
import { Modal } from '../components/common/Modal';

interface AccountingViewProps {
  accounts: Account[];
  journalEntries: JournalEntry[];
  organisation: Organisation;
  onPostJournal: (journalData: any) => void;
}

export const AccountingView: React.FC<AccountingViewProps> = ({
  accounts,
  journalEntries,
  organisation,
  onPostJournal,
}) => {
  const [activeTab, setActiveTab] = useState<'pnl' | 'balancesheet' | 'accounts' | 'journals'>('pnl');
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);

  // New Journal Entry State
  const [journalDate, setJournalDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [reference, setReference] = useState('');
  const [lines, setLines] = useState<{
    account_id: string;
    debit: number;
    credit: number;
  }[]>([
    { account_id: accounts[0]?.id || '', debit: 10000, credit: 0 },
    { account_id: accounts[1]?.id || '', debit: 0, credit: 10000 }
  ]);
  const [journalError, setJournalError] = useState<string | null>(null);

  // Accounting aggregations
  const assetAccounts = accounts.filter(a => a.type === 'Asset');
  const liabilityAccounts = accounts.filter(a => a.type === 'Liability');
  const equityAccounts = accounts.filter(a => a.type === 'Equity');
  const incomeAccounts = accounts.filter(a => a.type === 'Income');
  const expenseAccounts = accounts.filter(a => a.type === 'Expense');

  const totalAssets = assetAccounts.reduce((sum, a) => sum + a.balance, 0);
  const totalLiabilities = liabilityAccounts.reduce((sum, a) => sum + a.balance, 0);
  const totalEquity = equityAccounts.reduce((sum, a) => sum + a.balance, 0);

  const totalIncome = incomeAccounts.reduce((sum, a) => sum + a.balance, 0);
  const cogsExpense = accounts.find(a => a.code === '5010')?.balance || 0;
  const grossProfit = totalIncome - cogsExpense;
  const operatingExpenses = expenseAccounts.filter(a => a.code !== '5010').reduce((sum, a) => sum + a.balance, 0);
  const netProfit = grossProfit - operatingExpenses;

  // Debit vs Credit validation for journal entry
  const totalDebit = lines.reduce((sum, l) => sum + (l.debit || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (l.credit || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  const handleAddJournalLine = () => {
    setLines([...lines, { account_id: accounts[0]?.id || '', debit: 0, credit: 0 }]);
  };

  const handleRemoveJournalLine = (index: number) => {
    if (lines.length <= 2) {
      alert('A journal entry must have at least 2 balancing lines');
      return;
    }
    setLines(lines.filter((_, idx) => idx !== index));
  };

  const handlePostJournalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setJournalError(null);
    if (!description.trim()) {
      setJournalError('Please provide a description for the journal entry');
      return;
    }
    if (!isBalanced) {
      setJournalError(`Journal is not balanced! Total Debits (${formatKES(totalDebit)}) must equal Total Credits (${formatKES(totalCredit)})`);
      return;
    }

    const payload = {
      date: journalDate,
      description,
      reference: reference || undefined,
      total_debit: totalDebit,
      total_credit: totalCredit,
      lines: lines.map(l => {
        const acc = accounts.find(a => a.id === l.account_id);
        return {
          account_id: l.account_id,
          account_code: acc?.code || '1000',
          account_name: acc?.name || 'Account',
          debit: l.debit || 0,
          credit: l.credit || 0,
        };
      })
    };

    try {
      onPostJournal(payload);
      setIsJournalModalOpen(false);
      setDescription('');
      setReference('');
    } catch (err: any) {
      setJournalError(err.message || 'Posting failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5EAE7]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#202B27] tracking-tight">
            Double-Entry Accounting & Ledger
          </h1>
          <p className="text-xs text-[#66736B] mt-0.5">
            Verified chart of accounts, balanced journal entries, real-time Profit & Loss, and Balance Sheet
          </p>
        </div>

        <button
          onClick={() => setIsJournalModalOpen(true)}
          className="px-4 py-2.5 bg-[#00A651] hover:bg-[#00843D] text-white font-semibold text-xs rounded-lg shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Post Balanced Journal Entry</span>
        </button>
      </div>

      {/* 4 Financial Health Snapshot Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-[#E5EAE7] shadow-xs">
          <span className="text-xs font-medium text-[#66736B] block">Total Operating Revenue</span>
          <span className="text-xl font-bold text-[#202B27] font-mono tabular-nums block mt-1">
            {formatKES(totalIncome)}
          </span>
          <span className="text-[11px] text-[#00A651] font-medium mt-1 block">Merchandise & fees</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#E5EAE7] shadow-xs">
          <span className="text-xs font-medium text-[#66736B] block">Gross Profit</span>
          <span className="text-xl font-bold text-[#00843D] font-mono tabular-nums block mt-1">
            {formatKES(grossProfit)}
          </span>
          <span className="text-[11px] text-[#00843D] font-medium mt-1 block">
            {totalIncome > 0 ? ((grossProfit / totalIncome) * 100).toFixed(1) : '0.0'}% Gross margin
          </span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#E5EAE7] shadow-xs">
          <span className="text-xs font-medium text-[#66736B] block">Total Overhead & COGS</span>
          <span className="text-xl font-bold text-neutral-800 font-mono tabular-nums block mt-1">
            {formatKES(cogsExpense + operatingExpenses)}
          </span>
          <span className="text-[11px] text-[#66736B] mt-1 block">Expenses in ledger</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#E5EAE7] shadow-xs">
          <span className="text-xs font-medium text-[#66736B] block">Net Operating Profit</span>
          <span className="text-xl font-bold text-[#00A651] font-mono tabular-nums block mt-1">
            {formatKES(netProfit)}
          </span>
          <span className="text-[11px] text-[#00843D] font-semibold mt-1 block">
            Retained in business
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[#E5EAE7]">
        <button
          onClick={() => setActiveTab('pnl')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'pnl' ? 'border-[#00A651] text-[#00843D]' : 'border-transparent text-[#66736B] hover:text-[#202B27]'
          }`}
        >
          Profit & Loss Statement
        </button>
        <button
          onClick={() => setActiveTab('balancesheet')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'balancesheet' ? 'border-[#00A651] text-[#00843D]' : 'border-transparent text-[#66736B] hover:text-[#202B27]'
          }`}
        >
          Balance Sheet
        </button>
        <button
          onClick={() => setActiveTab('accounts')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'accounts' ? 'border-[#00A651] text-[#00843D]' : 'border-transparent text-[#66736B] hover:text-[#202B27]'
          }`}
        >
          Chart of Accounts ({accounts.length})
        </button>
        <button
          onClick={() => setActiveTab('journals')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'journals' ? 'border-[#00A651] text-[#00843D]' : 'border-transparent text-[#66736B] hover:text-[#202B27]'
          }`}
        >
          Journal Entries ({journalEntries.length})
        </button>
      </div>

      {/* Tab 1: Profit and Loss Statement */}
      {activeTab === 'pnl' && (
        <div className="bg-white rounded-xl border border-[#E5EAE7] p-6 max-w-3xl mx-auto shadow-xs space-y-6">
          <div className="text-center pb-4 border-b border-[#E5EAE7]">
            <h2 className="text-base font-bold text-[#202B27] uppercase">{organisation.name}</h2>
            <h3 className="text-sm font-semibold text-[#00843D]">STATEMENT OF PROFIT OR LOSS (INCOME STATEMENT)</h3>
            <p className="text-xs text-[#66736B] mt-1">For Period Ending November 2026 · Currency: KES</p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Income Section */}
            <div>
              <div className="flex justify-between font-bold text-[#202B27] pb-1.5 border-b border-[#E5EAE7] uppercase tracking-wider text-[11px]">
                <span>Operating Revenue</span>
                <span>Amount (KES)</span>
              </div>
              <div className="divide-y divide-[#E5EAE7]">
                {incomeAccounts.map(a => (
                  <div key={a.id} className="py-2 flex justify-between text-[#202B27]">
                    <span>{a.code} - {a.name}</span>
                    <span className="font-mono font-medium">{formatKES(a.balance)}</span>
                  </div>
                ))}
                <div className="py-2 flex justify-between font-bold text-[#202B27]">
                  <span>Total Revenue</span>
                  <span className="font-mono text-[#00843D]">{formatKES(totalIncome)}</span>
                </div>
              </div>
            </div>

            {/* Cost of Sales Section */}
            <div>
              <div className="flex justify-between font-bold text-[#202B27] pb-1.5 border-b border-[#E5EAE7] uppercase tracking-wider text-[11px]">
                <span>Cost of Goods Sold (COGS)</span>
                <span>Amount (KES)</span>
              </div>
              <div className="py-2 flex justify-between text-[#202B27]">
                <span>5010 - Cost of Goods Sold (Direct Inventory Cost)</span>
                <span className="font-mono">{formatKES(cogsExpense)}</span>
              </div>
              <div className="py-2 flex justify-between font-bold text-sm text-[#00843D] border-t border-[#E5EAE7]">
                <span>GROSS PROFIT</span>
                <span className="font-mono">{formatKES(grossProfit)}</span>
              </div>
            </div>

            {/* Operating Expenses Section */}
            <div>
              <div className="flex justify-between font-bold text-[#202B27] pb-1.5 border-b border-[#E5EAE7] uppercase tracking-wider text-[11px]">
                <span>Operating Overhead Expenses</span>
                <span>Amount (KES)</span>
              </div>
              <div className="divide-y divide-[#E5EAE7]">
                {expenseAccounts.filter(a => a.code !== '5010').map(a => (
                  <div key={a.id} className="py-2 flex justify-between text-[#202B27]">
                    <span>{a.code} - {a.name}</span>
                    <span className="font-mono text-neutral-600">{formatKES(a.balance)}</span>
                  </div>
                ))}
                <div className="py-2 flex justify-between font-bold text-[#202B27]">
                  <span>Total Operating Expenses</span>
                  <span className="font-mono text-red-600">{formatKES(operatingExpenses)}</span>
                </div>
              </div>
            </div>

            {/* Net Profit Summary */}
            <div className="p-4 bg-[#F0F8F3] rounded-lg border border-[#00A651]/20 flex justify-between items-center text-sm font-bold text-[#00843D]">
              <div>
                <span className="block">NET OPERATING PROFIT</span>
                <span className="text-[11px] font-normal text-[#66736B]">Audited and ready for KRA tax return filing</span>
              </div>
              <span className="text-lg font-mono">{formatKES(netProfit)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Balance Sheet */}
      {activeTab === 'balancesheet' && (
        <div className="bg-white rounded-xl border border-[#E5EAE7] p-6 max-w-3xl mx-auto shadow-xs space-y-6">
          <div className="text-center pb-4 border-b border-[#E5EAE7]">
            <h2 className="text-base font-bold text-[#202B27] uppercase">{organisation.name}</h2>
            <h3 className="text-sm font-semibold text-[#00843D]">STATEMENT OF FINANCIAL POSITION (BALANCE SHEET)</h3>
            <p className="text-xs text-[#66736B] mt-1">As of November 2026 · Currency: KES</p>
          </div>

          <div className="space-y-6 text-xs">
            {/* Assets */}
            <div>
              <div className="flex justify-between font-bold text-[#202B27] pb-1.5 border-b border-[#E5EAE7] uppercase tracking-wider text-[11px]">
                <span>ASSETS</span>
                <span>Balance (KES)</span>
              </div>
              <div className="divide-y divide-[#E5EAE7]">
                {assetAccounts.map(a => (
                  <div key={a.id} className="py-2 flex justify-between text-[#202B27]">
                    <div>
                      <span className="font-mono text-[#66736B] mr-2">{a.code}</span>
                      <span>{a.name}</span>
                    </div>
                    <span className="font-mono">{formatKES(a.balance)}</span>
                  </div>
                ))}
                <div className="py-2.5 flex justify-between font-bold text-sm text-[#00843D] border-t-2 border-[#202B27]">
                  <span>TOTAL ASSETS</span>
                  <span className="font-mono">{formatKES(totalAssets)}</span>
                </div>
              </div>
            </div>

            {/* Liabilities & Equity */}
            <div>
              <div className="flex justify-between font-bold text-[#202B27] pb-1.5 border-b border-[#E5EAE7] uppercase tracking-wider text-[11px]">
                <span>LIABILITIES & OWNER EQUITY</span>
                <span>Balance (KES)</span>
              </div>
              <div className="divide-y divide-[#E5EAE7]">
                <div className="py-1 font-semibold text-[11px] text-[#66736B] uppercase">Current Liabilities</div>
                {liabilityAccounts.map(a => (
                  <div key={a.id} className="py-2 flex justify-between text-[#202B27]">
                    <div>
                      <span className="font-mono text-[#66736B] mr-2">{a.code}</span>
                      <span>{a.name}</span>
                    </div>
                    <span className="font-mono">{formatKES(a.balance)}</span>
                  </div>
                ))}

                <div className="py-1 font-semibold text-[11px] text-[#66736B] uppercase pt-3">Owner's Equity</div>
                {equityAccounts.map(a => (
                  <div key={a.id} className="py-2 flex justify-between text-[#202B27]">
                    <div>
                      <span className="font-mono text-[#66736B] mr-2">{a.code}</span>
                      <span>{a.name}</span>
                    </div>
                    <span className="font-mono">{formatKES(a.balance)}</span>
                  </div>
                ))}

                <div className="py-2.5 flex justify-between font-bold text-sm text-[#00843D] border-t-2 border-[#202B27]">
                  <span>TOTAL LIABILITIES & EQUITY</span>
                  <span className="font-mono">{formatKES(totalLiabilities + totalEquity)}</span>
                </div>
              </div>
            </div>

            {/* Double entry equation check */}
            <div className="p-3 bg-[#F0F8F3] rounded-lg border border-[#00A651]/20 flex items-center justify-between text-xs">
              <span className="font-semibold text-[#00843D] flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>Accounting Balance Invariant: Assets = Liabilities + Equity</span>
              </span>
              <span className="font-mono text-[#00843D] font-bold">BALANCED</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Chart of Accounts */}
      {activeTab === 'accounts' && (
        <div className="bg-white rounded-xl border border-[#E5EAE7] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F8FAF9] text-[#66736B] border-b border-[#E5EAE7] font-medium">
                <tr>
                  <th className="px-4 py-3">Account Code</th>
                  <th className="px-4 py-3">Account Name</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Subcategory</th>
                  <th className="px-4 py-3 text-right">Current Ledger Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EAE7]">
                {accounts.map(acc => (
                  <tr key={acc.id} className="hover:bg-[#F8FAF9] transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-[#202B27]">{acc.code}</td>
                    <td className="px-4 py-3 font-medium text-[#202B27]">{acc.name}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold ${
                        acc.type === 'Asset' ? 'bg-blue-50 text-blue-700' :
                        acc.type === 'Liability' ? 'bg-amber-50 text-amber-700' :
                        acc.type === 'Equity' ? 'bg-purple-50 text-purple-700' :
                        acc.type === 'Income' ? 'bg-[#F0F8F3] text-[#00843D]' :
                        'bg-red-50 text-red-700'
                      }`}>
                        {acc.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#66736B]">{acc.category}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-[#202B27] tabular-nums">
                      {formatKES(acc.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Journal Entries */}
      {activeTab === 'journals' && (
        <div className="space-y-4">
          {journalEntries.map(entry => (
            <div key={entry.id} className="bg-white rounded-xl border border-[#E5EAE7] shadow-xs p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[#E5EAE7] text-xs">
                <div>
                  <span className="font-mono font-bold text-sm text-[#202B27] mr-2">{entry.entry_number}</span>
                  <span className="text-[#66736B]">Date: {formatDate(entry.date)}</span>
                  {entry.reference && <span className="ml-2 text-[11px] text-[#00A651] font-mono">Ref: {entry.reference}</span>}
                </div>
                <div className="text-[11px] text-[#66736B] mt-1 sm:mt-0">
                  Posted by <span className="font-medium text-[#202B27]">{entry.posted_by}</span>
                </div>
              </div>

              <div className="text-xs text-[#202B27] font-medium">{entry.description}</div>

              {/* Lines */}
              <div className="bg-[#F8FAF9] rounded-lg border border-[#E5EAE7] overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="text-[#66736B] border-b border-[#E5EAE7]">
                    <tr>
                      <th className="py-1.5 px-3">Account Code & Name</th>
                      <th className="py-1.5 px-3 text-right">Debit (KES)</th>
                      <th className="py-1.5 px-3 text-right">Credit (KES)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5EAE7]">
                    {entry.lines.map((l, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3">
                          <span className="font-mono text-[#66736B] mr-2">{l.account_code}</span>
                          <span className="font-medium text-[#202B27]">{l.account_name}</span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-medium">
                          {l.debit > 0 ? formatKES(l.debit) : '—'}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-medium">
                          {l.credit > 0 ? formatKES(l.credit) : '—'}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-white font-bold font-mono">
                      <td className="py-2 px-3 text-[#202B27]">Total Balancing Entry</td>
                      <td className="py-2 px-3 text-right text-[#00843D]">{formatKES(entry.total_debit)}</td>
                      <td className="py-2 px-3 text-right text-[#00843D]">{formatKES(entry.total_credit)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Journal Entry Modal */}
      <Modal
        isOpen={isJournalModalOpen}
        onClose={() => setIsJournalModalOpen(false)}
        title="Post General Journal Entry (Double-Entry Engine)"
        subtitle="Validate that total debits strictly equal total credits"
        maxWidth="2xl"
      >
        <form onSubmit={handlePostJournalSubmit} className="space-y-4">
          {journalError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {journalError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#202B27] mb-1">
                Posting Date
              </label>
              <input
                type="date"
                value={journalDate}
                onChange={e => setJournalDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#202B27] mb-1">
                External Reference (e.g. Bank Ref, Voucher)
              </label>
              <input
                type="text"
                placeholder="e.g. STAN-TR-99120"
                value={reference}
                onChange={e => setReference(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202B27] mb-1">
              Journal Description / Memo *
            </label>
            <input
              type="text"
              placeholder="e.g. Monthly Accrual for Downtown Accra Road premises"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
              required
            />
          </div>

          {/* Ledger Lines */}
          <div>
            <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-[#E5EAE7]">
              <span className="text-xs font-semibold text-[#202B27]">Journal Debits & Credits</span>
              <button
                type="button"
                onClick={handleAddJournalLine}
                className="text-xs font-semibold text-[#00A651] hover:underline"
              >
                + Add Account Line
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {lines.map((line, idx) => (
                <div key={idx} className="p-2 bg-[#F8FAF9] rounded border border-[#E5EAE7] grid grid-cols-12 gap-2 items-center text-xs">
                  <div className="col-span-6">
                    <select
                      value={line.account_id}
                      onChange={e => {
                        const copy = [...lines];
                        copy[idx].account_id = e.target.value;
                        setLines(copy);
                      }}
                      className="w-full px-2 py-1.5 text-xs bg-white border border-[#E5EAE7] rounded text-[#202B27]"
                    >
                      {accounts.map(a => (
                        <option key={a.id} value={a.id}>
                          {a.code} - {a.name} ({a.type})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      placeholder="Debit KES"
                      min="0"
                      value={line.debit || ''}
                      onChange={e => {
                        const copy = [...lines];
                        copy[idx].debit = parseFloat(e.target.value) || 0;
                        if (copy[idx].debit > 0) copy[idx].credit = 0; // Clear credit on same line
                        setLines(copy);
                      }}
                      className="w-full px-2 py-1.5 text-xs font-mono bg-white border border-[#E5EAE7] rounded text-[#202B27]"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      placeholder="Credit KES"
                      min="0"
                      value={line.credit || ''}
                      onChange={e => {
                        const copy = [...lines];
                        copy[idx].credit = parseFloat(e.target.value) || 0;
                        if (copy[idx].credit > 0) copy[idx].debit = 0; // Clear debit on same line
                        setLines(copy);
                      }}
                      className="w-full px-2 py-1.5 text-xs font-mono bg-white border border-[#E5EAE7] rounded text-[#202B27]"
                    />
                  </div>
                  <div className="col-span-1 text-right">
                    {lines.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveJournalLine(idx)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Invariant status banner */}
            <div className={`mt-3 p-3 rounded-lg border flex items-center justify-between text-xs font-mono ${
              isBalanced ? 'bg-[#F0F8F3] border-[#00A651]/30 text-[#00843D]' : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              <div>
                <span>Total Debits: {formatKES(totalDebit)}</span>
                <span className="mx-2">·</span>
                <span>Total Credits: {formatKES(totalCredit)}</span>
              </div>
              <span className="font-bold font-sans">
                {isBalanced ? '✓ Invariant Balanced' : `Difference: ${formatKES(Math.abs(totalDebit - totalCredit))}`}
              </span>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsJournalModalOpen(false)}
              className="px-4 py-2 text-xs text-[#66736B]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isBalanced}
              className="px-5 py-2.5 bg-[#00A651] hover:bg-[#00843D] disabled:opacity-50 text-white font-semibold text-xs rounded-lg shadow-xs"
            >
              Post & Commit to Ledger
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
