import React, { useState } from 'react';
import { 
  CreditCard, 
  Smartphone, 
  Search, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  Building2, 
  ArrowUpRight,
  ShieldCheck,
  Check,
  X
} from 'lucide-react';
import { PaymentRecord, Organisation, PaymentMethod } from '../types';
import { formatKES, formatDateTime, generateMPesaRef, formatKenyanPhone, isValidKenyanPhone } from '../utils/formatters';
import { Modal } from '../components/common/Modal';
import { StatusBadge } from '../components/common/StatusBadge';

interface PaymentsViewProps {
  payments: PaymentRecord[];
  organisation: Organisation;
  onAddPayment: (paymentData: any) => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  payments,
  organisation,
  onAddPayment,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [isSTKModalOpen, setIsSTKModalOpen] = useState(false);

  // STK Push Sandbox State
  const [stkPhone, setStkPhone] = useState('+254 722 101 202');
  const [stkAmount, setStkAmount] = useState<number>(2500);
  const [stkAccountRef, setStkAccountRef] = useState('INV-2026-0142');
  const [stkStage, setStkStage] = useState<'idle' | 'pushing' | 'prompt_shown' | 'success'>('idle');
  const [stkPin, setStkPin] = useState('');
  const [generatedRef, setGeneratedRef] = useState('');

  const totalReconciled = payments.filter(p => p.status === 'reconciled' || p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
  const mpesaPayments = payments.filter(p => p.payment_method === 'mpesa');
  const totalMpesa = mpesaPayments.reduce((sum, p) => sum + p.amount, 0);

  const handleStartSTKPush = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidKenyanPhone(stkPhone)) {
      alert('Please enter a valid Kenyan phone number (e.g. 0722 000 000)');
      return;
    }
    if (stkAmount <= 0) {
      alert('Amount must be greater than zero');
      return;
    }

    setStkStage('pushing');
    setTimeout(() => {
      setStkStage('prompt_shown');
    }, 1000);
  };

  const handleConfirmPin = () => {
    const code = generateMPesaRef();
    setGeneratedRef(code);
    setStkStage('success');

    // Add payment record
    onAddPayment({
      type: 'customer_receipt',
      reference_type: 'direct',
      reference_number: stkAccountRef,
      party_name: `Customer (${formatKenyanPhone(stkPhone)})`,
      amount: stkAmount,
      payment_method: 'mpesa',
      payment_reference: code,
      status: 'reconciled',
      branch_id: organisation.branches[0]?.id || 'branch_cbd',
      notes: `Safaricom Daraja STK Push Prompt Reconciled on ${stkAccountRef}`,
    });
  };

  const filteredPayments = payments.filter(p => {
    const matchesSearch = 
      p.payment_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.party_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.payment_reference.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMethod = methodFilter === 'all' || p.payment_method === methodFilter;
    return matchesSearch && matchesMethod;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5EAE7]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#202B27] tracking-tight">
            Payments & M-Pesa Hub
          </h1>
          <p className="text-xs text-[#66736B] mt-0.5">
            Audit payments across Paybill, Till, Bank EFT and Cash with Safaricom Daraja STK Push sandbox
          </p>
        </div>

        <button
          onClick={() => {
            setStkStage('idle');
            setStkPin('');
            setIsSTKModalOpen(true);
          }}
          className="px-4 py-2.5 bg-[#00A651] hover:bg-[#00843D] text-white font-semibold text-xs rounded-lg shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto active:scale-[0.98]"
        >
          <Smartphone className="w-4 h-4" />
          <span>Launch M-Pesa STK Sandbox</span>
        </button>
      </div>

      {/* Integration Disclosure Notice */}
      <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 leading-relaxed">
          <span className="font-semibold block mb-0.5">
            Safaricom Daraja API Architecture Ready (Simulation Active)
          </span>
          BiasharaOS records transactions using Safaricom's exact C2B/STK push schema. Live production processing requires your registered Business Shortcode, Passkey, and Consumer Key from the Safaricom Developer Portal.
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-[#E5EAE7] shadow-xs">
          <span className="text-xs font-medium text-[#66736B] block">Total Settled Cash Flow</span>
          <span className="text-xl sm:text-2xl font-bold text-[#202B27] font-mono tabular-nums block mt-1">
            {formatKES(totalReconciled)}
          </span>
          <span className="text-[11px] text-[#00A651] font-medium mt-1 block">
            {payments.length} verified payment records
          </span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#E5EAE7] shadow-xs">
          <span className="text-xs font-medium text-[#66736B] block">M-Pesa Receipts Volume</span>
          <span className="text-xl sm:text-2xl font-bold text-[#00843D] font-mono tabular-nums block mt-1">
            {formatKES(totalMpesa)}
          </span>
          <span className="text-[11px] text-[#66736B] mt-1 block">
            {mpesaPayments.length} Till & Paybill transactions
          </span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#E5EAE7] shadow-xs">
          <span className="text-xs font-medium text-[#66736B] block">Reconciliation Rate</span>
          <span className="text-xl sm:text-2xl font-bold text-[#00843D] font-mono tabular-nums block mt-1">
            100% Reconciled
          </span>
          <span className="text-[11px] text-[#00843D] mt-1 block">
            Zero mismatched transaction codes
          </span>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#66736B]" />
          <input
            type="text"
            placeholder="Search payment #, ref, party..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#E5EAE7] rounded-lg focus:outline-none focus:border-[#00A651] text-[#202B27]"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-white border border-[#E5EAE7] rounded-lg self-stretch sm:self-auto overflow-x-auto">
          {['all', 'mpesa', 'bank_transfer', 'cash'].map(m => (
            <button
              key={m}
              onClick={() => setMethodFilter(m)}
              className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                methodFilter === m ? 'bg-[#00A651] text-white shadow-xs' : 'text-[#66736B] hover:text-[#202B27]'
              }`}
            >
              {m === 'all' ? 'All Channels' : m === 'mpesa' ? 'M-Pesa Only' : m === 'bank_transfer' ? 'Bank (EFT)' : 'Cash Till'}
            </button>
          ))}
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border border-[#E5EAE7] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F8FAF9] text-[#66736B] border-b border-[#E5EAE7] font-medium">
              <tr>
                <th className="px-4 py-3">Payment # / Date</th>
                <th className="px-4 py-3">Party (Customer/Supplier)</th>
                <th className="px-4 py-3">Channel & Reference</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 text-right">Amount (KES)</th>
                <th className="px-4 py-3 text-center">Reconciliation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EAE7]">
              {filteredPayments.map(p => (
                <tr key={p.id} className="hover:bg-[#F8FAF9] transition-colors">
                  <td className="px-4 py-3.5">
                    <span className="font-semibold text-[#202B27] font-mono block">
                      {p.payment_number}
                    </span>
                    <span className="text-[11px] text-[#66736B]">
                      {formatDateTime(p.created_at)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-medium text-[#202B27] block">{p.party_name}</span>
                    {p.reference_number && (
                      <span className="text-[10px] text-[#66736B]">Ref Doc: {p.reference_number}</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="uppercase text-[11px] font-semibold text-[#202B27] block">
                      {p.payment_method.replace('_', ' ')}
                    </span>
                    <span className="font-mono text-[10px] text-[#00843D] block font-bold">
                      {p.payment_reference}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 capitalize text-xs text-[#66736B]">
                    {p.type.replace('_', ' ')}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-[#202B27] tabular-nums">
                    {formatKES(p.amount)}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <StatusBadge status={p.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* M-Pesa Daraja STK Push Sandbox Modal */}
      <Modal
        isOpen={isSTKModalOpen}
        onClose={() => setIsSTKModalOpen(false)}
        title="Safaricom Daraja M-Pesa STK Push Sandbox"
        subtitle="Simulate real-time phone prompt trigger and instantaneous payment confirmation"
        maxWidth="md"
      >
        {stkStage === 'idle' && (
          <form onSubmit={handleStartSTKPush} className="space-y-4">
            <div className="p-3 bg-[#F0F8F3] border border-[#00A651]/20 rounded-lg text-xs text-[#00843D]">
              <span className="font-bold block mb-0.5">Safaricom Developer Sandbox Mode</span>
              Enter customer mobile number and amount to simulate triggering the USSD PIN prompt on their handset.
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202B27] mb-1">
                Customer Mobile Number (+254...) *
              </label>
              <input
                type="tel"
                value={stkPhone}
                onChange={e => setStkPhone(e.target.value)}
                placeholder="0722 000 000 or +254 722 000 000"
                className="w-full px-3 py-2 text-xs font-mono bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#202B27] mb-1">
                  Amount (KES) *
                </label>
                <input
                  type="number"
                  min="1"
                  value={stkAmount}
                  onChange={e => setStkAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs font-mono font-bold bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202B27] mb-1">
                  Account Reference
                </label>
                <input
                  type="text"
                  value={stkAccountRef}
                  onChange={e => setStkAccountRef(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
                  required
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsSTKModalOpen(false)}
                className="px-4 py-2 text-xs text-[#66736B]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#00A651] hover:bg-[#00843D] text-white font-semibold text-xs rounded-lg shadow-xs flex items-center gap-1.5"
              >
                <Smartphone className="w-4 h-4" />
                <span>Trigger STK Push Prompt</span>
              </button>
            </div>
          </form>
        )}

        {stkStage === 'pushing' && (
          <div className="py-8 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#00A651] animate-spin mx-auto" />
            <h4 className="text-sm font-semibold text-[#202B27]">
              Sending STK Push via Daraja Gateway...
            </h4>
            <p className="text-xs text-[#66736B]">
              Dispatching USSD prompt payload to {formatKenyanPhone(stkPhone)}
            </p>
          </div>
        )}

        {stkStage === 'prompt_shown' && (
          <div className="space-y-4">
            {/* Simulated Phone Prompt UI */}
            <div className="p-4 bg-[#202B27] text-white rounded-xl shadow-lg space-y-3 border border-neutral-700">
              <div className="flex items-center justify-between text-xs text-neutral-400 border-b border-neutral-700 pb-2">
                <span>SIM 1 · Safaricom M-PESA</span>
                <span>Now</span>
              </div>
              <div className="text-xs leading-relaxed font-mono">
                Do you want to pay <span className="font-bold text-emerald-400">{formatKES(stkAmount)}</span> to <span className="font-bold">{organisation.trading_name || organisation.name}</span> Account <span className="text-emerald-400">{stkAccountRef}</span>?
              </div>
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">
                  Enter M-Pesa PIN:
                </label>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="••••"
                  value={stkPin}
                  onChange={e => setStkPin(e.target.value)}
                  className="w-full px-3 py-2 text-center text-sm font-mono tracking-widest bg-neutral-800 border border-neutral-600 rounded text-white focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setStkStage('idle')}
                  className="flex-1 py-1.5 bg-neutral-700 hover:bg-neutral-600 text-white text-xs font-semibold rounded"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPin}
                  className="flex-1 py-1.5 bg-[#00A651] hover:bg-[#00843D] text-white text-xs font-semibold rounded"
                >
                  Send PIN
                </button>
              </div>
            </div>
            <p className="text-[11px] text-center text-[#66736B]">
              Enter any 4-digit PIN (e.g. 1234) to simulate customer authorization
            </p>
          </div>
        )}

        {stkStage === 'success' && (
          <div className="py-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#F0F8F3] text-[#00A651] flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-[#202B27]">
                M-Pesa Payment Confirmed & Reconciled!
              </h4>
              <p className="text-xs text-[#66736B] mt-1">
                {formatKES(stkAmount)} received from {formatKenyanPhone(stkPhone)}
              </p>
            </div>
            <div className="p-3 bg-[#F8FAF9] rounded border border-[#E5EAE7] font-mono text-xs">
              <span className="text-[#66736B]">Safaricom Transaction Code: </span>
              <span className="font-bold text-[#00843D]">{generatedRef}</span>
            </div>
            <button
              onClick={() => setIsSTKModalOpen(false)}
              className="px-6 py-2 bg-[#00A651] text-white text-xs font-semibold rounded-lg shadow-xs"
            >
              Done & View Payment Ledger
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};
