import React, { useState } from 'react';
import { 
  UserCheck, 
  Plus, 
  Search, 
  ShieldCheck, 
  Check, 
  X, 
  Building2, 
  Mail, 
  Phone,
  Sparkles
} from 'lucide-react';
import { User, UserRole, Organisation, Branch } from '../types';
import { formatKenyanPhone, formatDate } from '../utils/formatters';
import { Modal } from '../components/common/Modal';

interface EmployeesViewProps {
  users: User[];
  branches: Branch[];
  currentUser: User;
  onAddUser: (userData: any) => void;
  onSwitchUser: (userId: string) => void;
}

export const EmployeesView: React.FC<EmployeesViewProps> = ({
  users,
  branches,
  currentUser,
  onAddUser,
  onSwitchUser,
}) => {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('salesperson');
  const [branchId, setBranchId] = useState(branches[0]?.id || '');

  const roleLabels: Record<UserRole, { label: string; desc: string }> = {
    owner: { label: 'Business Owner', desc: 'Complete access to all finances, eTIMS settings, branches, and deletion' },
    admin: { label: 'Administrator', desc: 'Can configure settings, staff, products, and see reports' },
    manager: { label: 'Store Manager', desc: 'Operational control of branch, purchase orders, sales and stock' },
    salesperson: { label: 'Salesperson / Cashier', desc: 'Counter POS sales, customer receipts and thermal printing only' },
    accountant: { label: 'Accountant (CPA)', desc: 'General ledger, journal entries, P&L, balance sheet, and tax returns' },
    inventory_manager: { label: 'Inventory Manager', desc: 'Store intake, stock counts, adjustments and inter-branch transfers' },
  };

  const permissionsMatrix: { module: string; owner: boolean; admin: boolean; manager: boolean; salesperson: boolean; accountant: boolean; inventory_manager: boolean }[] = [
    { module: 'Point of Sale & Sales', owner: true, admin: true, manager: true, salesperson: true, accountant: true, inventory_manager: false },
    { module: 'Create & Edit Invoices', owner: true, admin: true, manager: true, salesperson: false, accountant: true, inventory_manager: false },
    { module: 'Inventory Catalogue & Stock', owner: true, admin: true, manager: true, salesperson: false, accountant: false, inventory_manager: true },
    { module: 'Stock Adjustments & Transfers', owner: true, admin: true, manager: true, salesperson: false, accountant: false, inventory_manager: true },
    { module: 'Purchase Orders & Suppliers', owner: true, admin: true, manager: true, salesperson: false, accountant: true, inventory_manager: true },
    { module: 'Record Overhead Expenses', owner: true, admin: true, manager: true, salesperson: false, accountant: true, inventory_manager: false },
    { module: 'M-Pesa STK Push & Reconcile', owner: true, admin: true, manager: true, salesperson: true, accountant: true, inventory_manager: false },
    { module: 'Double-Entry General Ledger', owner: true, admin: false, manager: false, salesperson: false, accountant: true, inventory_manager: false },
    { module: 'Profit & Loss / Balance Sheet', owner: true, admin: true, manager: false, salesperson: false, accountant: true, inventory_manager: false },
    { module: 'Manage Users & Business Info', owner: true, admin: true, manager: false, salesperson: false, accountant: false, inventory_manager: false },
  ];

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      alert('Name and email are required');
      return;
    }
    onAddUser({
      organisation_id: currentUser.organisation_id,
      name,
      email,
      phone,
      role,
      branch_id: branchId,
      active: true,
    });
    setIsInviteOpen(false);
    setName('');
    setEmail('');
    setPhone('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5EAE7]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#202B27] tracking-tight">
            Employees & Role-Based Access Control (RBAC)
          </h1>
          <p className="text-xs text-[#66736B] mt-0.5">
            Manage store employees, assign permission roles, and simulate role restrictions
          </p>
        </div>

        <button
          onClick={() => setIsInviteOpen(true)}
          className="px-4 py-2.5 bg-[#00A651] hover:bg-[#00843D] text-white font-semibold text-xs rounded-lg shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Invite Team Member</span>
        </button>
      </div>

      {/* Quick Test Switcher Banner */}
      <div className="p-4 bg-white rounded-xl border border-[#E5EAE7] shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-[#202B27] uppercase tracking-wider">
            Active Staff Testing Simulator
          </span>
          <span className="text-[11px] text-[#00A651] font-medium">Click any user to test the app as them:</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {users.map(u => (
            <button
              key={u.id}
              onClick={() => onSwitchUser(u.id)}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                u.id === currentUser.id
                  ? 'bg-[#F0F8F3] border-[#00A651] shadow-xs'
                  : 'bg-[#F8FAF9] hover:bg-white border-[#E5EAE7]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-[#202B27] truncate block">{u.name}</span>
                {u.id === currentUser.id && (
                  <span className="w-2 h-2 rounded-full bg-[#00A651]" />
                )}
              </div>
              <span className="text-[10px] text-[#00A651] font-medium block mt-0.5">
                {roleLabels[u.role]?.label || u.role}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Staff Directory Table */}
      <div className="bg-white rounded-xl border border-[#E5EAE7] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E5EAE7] flex justify-between items-center">
          <div>
            <h3 className="text-sm font-semibold text-[#202B27]">Team Members Directory</h3>
            <span className="text-xs text-[#66736B]">{users.length} active staff accounts</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F8FAF9] text-[#66736B] border-b border-[#E5EAE7] font-medium">
              <tr>
                <th className="px-4 py-3">Employee Name</th>
                <th className="px-4 py-3">Role & Access Tier</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Assigned Branch</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Switch Perspective</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EAE7]">
              {users.map(u => {
                const assignedBranch = branches.find(b => b.id === u.branch_id);
                return (
                  <tr key={u.id} className="hover:bg-[#F8FAF9] transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#202B27] text-white flex items-center justify-center font-bold text-xs">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-semibold text-[#202B27] block">{u.name}</span>
                          <span className="text-[11px] text-[#66736B]">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-[#00843D] block">{roleLabels[u.role]?.label}</span>
                      <span className="text-[10px] text-[#66736B] max-w-xs block">{roleLabels[u.role]?.desc}</span>
                    </td>
                    <td className="px-4 py-3.5 text-[#202B27]">
                      {formatKenyanPhone(u.phone)}
                    </td>
                    <td className="px-4 py-3.5 text-[#66736B]">
                      {assignedBranch?.name || 'All Branches'}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#00843D] bg-[#F0F8F3] px-2 py-0.5 rounded">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00A651]" />
                        <span>Active</span>
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {u.id === currentUser.id ? (
                        <span className="text-[11px] font-bold text-[#00A651]">Current User</span>
                      ) : (
                        <button
                          onClick={() => onSwitchUser(u.id)}
                          className="px-2.5 py-1 text-xs text-[#202B27] hover:bg-[#F0F8F3] hover:text-[#00843D] border border-[#E5EAE7] rounded font-medium transition-colors"
                        >
                          Switch
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Permission Matrix */}
      <div className="bg-white rounded-xl border border-[#E5EAE7] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E5EAE7]">
          <h3 className="text-sm font-semibold text-[#202B27]">Role-Based Access Control (RBAC) Permission Matrix</h3>
          <p className="text-xs text-[#66736B]">Enforced access rights across BiasharaOS system modules</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F8FAF9] text-[#66736B] border-b border-[#E5EAE7] font-medium">
              <tr>
                <th className="px-4 py-2.5">Operating Module</th>
                <th className="px-3 py-2.5 text-center">Owner</th>
                <th className="px-3 py-2.5 text-center">Admin</th>
                <th className="px-3 py-2.5 text-center">Manager</th>
                <th className="px-3 py-2.5 text-center">Salesperson</th>
                <th className="px-3 py-2.5 text-center">Accountant</th>
                <th className="px-3 py-2.5 text-center">Inventory Mgr</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EAE7]">
              {permissionsMatrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#F8FAF9]">
                  <td className="px-4 py-2.5 font-medium text-[#202B27]">{row.module}</td>
                  <td className="px-3 py-2.5 text-center">{row.owner ? <Check className="w-4 h-4 text-[#00A651] mx-auto" /> : <X className="w-4 h-4 text-neutral-300 mx-auto" />}</td>
                  <td className="px-3 py-2.5 text-center">{row.admin ? <Check className="w-4 h-4 text-[#00A651] mx-auto" /> : <X className="w-4 h-4 text-neutral-300 mx-auto" />}</td>
                  <td className="px-3 py-2.5 text-center">{row.manager ? <Check className="w-4 h-4 text-[#00A651] mx-auto" /> : <X className="w-4 h-4 text-neutral-300 mx-auto" />}</td>
                  <td className="px-3 py-2.5 text-center">{row.salesperson ? <Check className="w-4 h-4 text-[#00A651] mx-auto" /> : <X className="w-4 h-4 text-neutral-300 mx-auto" />}</td>
                  <td className="px-3 py-2.5 text-center">{row.accountant ? <Check className="w-4 h-4 text-[#00A651] mx-auto" /> : <X className="w-4 h-4 text-neutral-300 mx-auto" />}</td>
                  <td className="px-3 py-2.5 text-center">{row.inventory_manager ? <Check className="w-4 h-4 text-[#00A651] mx-auto" /> : <X className="w-4 h-4 text-neutral-300 mx-auto" />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Member Modal */}
      <Modal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        title="Invite Team Member"
        subtitle="Assign role permissions and branch location"
        maxWidth="md"
      >
        <form onSubmit={handleInviteSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#202B27] mb-1">
              Full Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Dennis Kipchumba"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202B27] mb-1">
              Email Address *
            </label>
            <input
              type="email"
              placeholder="dennis@simbahardware.co.ke"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202B27] mb-1">
              Kenyan Mobile Phone
            </label>
            <input
              type="tel"
              placeholder="0722 000 000"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#202B27] mb-1">
                Role Permission Tier
              </label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as UserRole)}
                className="w-full px-2.5 py-2 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
              >
                <option value="salesperson">Salesperson / Cashier</option>
                <option value="manager">Store Manager</option>
                <option value="inventory_manager">Inventory Manager</option>
                <option value="accountant">Accountant (CPA)</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202B27] mb-1">
                Primary Branch
              </label>
              <select
                value={branchId}
                onChange={e => setBranchId(e.target.value)}
                className="w-full px-2.5 py-2 text-xs bg-[#F8FAF9] border border-[#E5EAE7] rounded-lg text-[#202B27]"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsInviteOpen(false)}
              className="px-4 py-2 text-xs text-[#66736B]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#00A651] hover:bg-[#00843D] text-white font-semibold text-xs rounded-lg shadow-xs"
            >
              Send Invite
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
