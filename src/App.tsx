import React, { useState, useEffect, useMemo } from 'react';
import { storage } from './services/storage';
import { 
  Organisation, 
  User, 
  Customer, 
  Supplier, 
  Product, 
  StockMovement, 
  Sale, 
  Invoice, 
  PurchaseOrder, 
  Expense, 
  PaymentRecord, 
  Account, 
  JournalEntry, 
  AuditLog,
  PaymentMethod 
} from './types';
import { AppSidebar, ActiveTab } from './components/layout/AppSidebar';
import { AppHeader } from './components/layout/AppHeader';

// Views
import { LandingPage } from './views/LandingPage';
import { AuthModal } from './views/AuthModal';
import { OnboardingWizard } from './views/OnboardingWizard';
import { DashboardView } from './views/DashboardView';
import { SalesView } from './views/SalesView';
import { InvoicesView } from './views/InvoicesView';
import { InventoryView } from './views/InventoryView';
import { PurchasesView } from './views/PurchasesView';
import { CustomersView } from './views/CustomersView';
import { ExpensesView } from './views/ExpensesView';
import { PaymentsView } from './views/PaymentsView';
import { AccountingView } from './views/AccountingView';
import { EmployeesView } from './views/EmployeesView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';

export default function App() {
  // App Mode: 'landing' | 'app' | 'onboarding'
  const [appMode, setAppMode] = useState<'landing' | 'app' | 'onboarding'>('app');
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [searchQuery, setSearchQuery] = useState('');

  // Storage State
  const [org, setOrg] = useState<Organisation>(storage.getOrganisation());
  const [users, setUsers] = useState<User[]>(storage.getUsers());
  const [currentUser, setCurrentUser] = useState<User>(storage.getCurrentUser());
  const [currentBranchId, setCurrentBranchId] = useState<string>(storage.getCurrentBranchId());
  const [customers, setCustomers] = useState<Customer[]>(storage.getCustomers());
  const [suppliers, setSuppliers] = useState<Supplier[]>(storage.getSuppliers());
  const [products, setProducts] = useState<Product[]>(storage.getProducts());
  const [movements, setMovements] = useState<StockMovement[]>(storage.getStockMovements());
  const [sales, setSales] = useState<Sale[]>(storage.getSales());
  const [invoices, setInvoices] = useState<Invoice[]>(storage.getInvoices());
  const [purchases, setPurchases] = useState<PurchaseOrder[]>(storage.getPurchaseOrders());
  const [expenses, setExpenses] = useState<Expense[]>(storage.getExpenses());
  const [payments, setPayments] = useState<PaymentRecord[]>(storage.getPayments());
  const [accounts, setAccounts] = useState<Account[]>(storage.getAccounts());
  const [journals, setJournals] = useState<JournalEntry[]>(storage.getJournalEntries());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(storage.getAuditLogs());

  // Subscribe to storage changes
  useEffect(() => {
    const unsubscribe = storage.subscribe(() => {
      setOrg(storage.getOrganisation());
      setUsers(storage.getUsers());
      setCurrentUser(storage.getCurrentUser());
      setCurrentBranchId(storage.getCurrentBranchId());
      setCustomers(storage.getCustomers());
      setSuppliers(storage.getSuppliers());
      setProducts(storage.getProducts());
      setMovements(storage.getStockMovements());
      setSales(storage.getSales());
      setInvoices(storage.getInvoices());
      setPurchases(storage.getPurchaseOrders());
      setExpenses(storage.getExpenses());
      setPayments(storage.getPayments());
      setAccounts(storage.getAccounts());
      setJournals(storage.getJournalEntries());
      setAuditLogs(storage.getAuditLogs());
    });
    return unsubscribe;
  }, []);

  // Notifications
  const notifications = useMemo(() => {
    const list: string[] = [];
    const lowStock = products.filter(p => p.current_stock > 0 && p.current_stock <= p.reorder_level);
    if (lowStock.length > 0) {
      list.push(`${lowStock.length} products are running low in stock`);
    }
    const outStock = products.filter(p => p.current_stock === 0);
    if (outStock.length > 0) {
      list.push(`${outStock.length} items are completely out of stock`);
    }
    const overdue = invoices.filter(i => i.status === 'overdue');
    if (overdue.length > 0) {
      list.push(`${overdue.length} invoices are past due date`);
    }
    const pendingPo = purchases.filter(p => p.status === 'ordered');
    if (pendingPo.length > 0) {
      list.push(`${pendingPo.length} purchase orders are awaiting delivery`);
    }
    return list;
  }, [products, invoices, purchases]);

  // Quick Action Handler
  const handleQuickAction = (action: 'sale' | 'invoice' | 'product' | 'expense' | 'customer' | 'po') => {
    if (action === 'sale') setActiveTab('sales');
    else if (action === 'invoice') setActiveTab('invoicing');
    else if (action === 'product') setActiveTab('inventory');
    else if (action === 'expense') setActiveTab('expenses');
    else if (action === 'customer') setActiveTab('customers');
    else if (action === 'po') setActiveTab('purchases');
  };

  // Branch Switcher
  const handleBranchChange = (branchId: string) => {
    storage.setCurrentBranchId(branchId);
    setCurrentBranchId(branchId);
  };

  // User/Role Switcher
  const handleUserChange = (userId: string) => {
    storage.setCurrentUserId(userId);
    const u = storage.getCurrentUser();
    setCurrentUser(u);
  };

  // Onboarding Completion
  const handleOnboardingComplete = (newOrg: Partial<Organisation>) => {
    storage.updateOrganisation(newOrg);
    setAppMode('app');
    setActiveTab('overview');
  };

  // If in Public Landing Mode
  if (appMode === 'landing') {
    return (
      <>
        <LandingPage
          onOpenApp={() => setAppMode('app')}
          onOpenAuth={(mode) => {
            setAuthMode(mode);
            setIsAuthOpen(true);
          }}
          onOpenOnboarding={() => setAppMode('onboarding')}
        />

        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          initialMode={authMode}
          users={users}
          onSelectUser={(u) => {
            handleUserChange(u.id);
            setAppMode('app');
          }}
          onCompleteSignUp={() => {
            setAppMode('onboarding');
          }}
        />
      </>
    );
  }

  // If in Onboarding Wizard Mode
  if (appMode === 'onboarding') {
    return (
      <OnboardingWizard
        onComplete={handleOnboardingComplete}
        onCancel={() => setAppMode('landing')}
      />
    );
  }

  // Main SaaS Application
  return (
    <div className="min-h-screen flex bg-[#F8FAF9] text-[#202B27]">
      {/* Persistent Responsive Sidebar */}
      <AppSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onReturnToLanding={() => setAppMode('landing')}
        onResetData={() => storage.resetToDefaults()}
        businessName={org.trading_name || org.name}
        activeModules={org.active_modules}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Header with Branch, Role, Search and Quick Actions */}
        <AppHeader
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          branches={org.branches}
          currentBranchId={currentBranchId}
          onBranchChange={handleBranchChange}
          currentUser={currentUser}
          allUsers={users}
          onUserChange={handleUserChange}
          onQuickAction={handleQuickAction}
          notificationCount={notifications.length}
          notifications={notifications}
          onSearch={setSearchQuery}
          searchQuery={searchQuery}
        />

        {/* Dynamic Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'overview' && (
            <DashboardView
              organisation={org}
              currentUser={currentUser}
              sales={sales}
              invoices={invoices}
              products={products}
              expenses={expenses}
              auditLogs={auditLogs}
              onQuickAction={handleQuickAction}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'sales' && (
            <SalesView
              sales={sales}
              products={products}
              customers={customers}
              organisation={org}
              currentUser={currentUser}
              onRecordSale={(sale) => storage.recordSale(sale)}
            />
          )}

          {activeTab === 'invoicing' && (
            <InvoicesView
              invoices={invoices}
              customers={customers}
              products={products}
              organisation={org}
              onCreateInvoice={(inv) => storage.createInvoice(inv)}
              onRecordPayment={(invId, amount, method, ref) => storage.recordInvoicePayment(invId, amount, method, ref)}
            />
          )}

          {activeTab === 'customers' && (
            <CustomersView
              customers={customers}
              invoices={invoices}
              sales={sales}
              organisation={org}
              onAddCustomer={(c) => storage.addCustomer(c)}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryView
              products={products}
              stockMovements={movements}
              branches={org.branches}
              organisation={org}
              onAddProduct={(p) => storage.addProduct(p)}
              onAdjustStock={(pId, qty, reason, type) => storage.adjustStock(pId, qty, reason, type)}
              onTransferStock={(pId, qty, from, to, notes) => storage.transferStock(pId, qty, from, to, notes)}
            />
          )}

          {activeTab === 'purchases' && (
            <PurchasesView
              purchaseOrders={purchases}
              suppliers={suppliers}
              products={products}
              organisation={org}
              onCreatePO={(po) => storage.createPurchaseOrder(po)}
              onReceivePO={(poId) => storage.receivePurchaseOrder(poId)}
              onAddSupplier={(sup) => storage.addSupplier(sup)}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpensesView
              expenses={expenses}
              organisation={org}
              onAddExpense={(exp) => storage.addExpense(exp)}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentsView
              payments={payments}
              organisation={org}
              onAddPayment={(pay) => storage.addPayment(pay)}
            />
          )}

          {activeTab === 'accounting' && (
            <AccountingView
              accounts={accounts}
              journalEntries={journals}
              organisation={org}
              onPostJournal={(je) => storage.addJournalEntry(je)}
            />
          )}

          {activeTab === 'employees' && (
            <EmployeesView
              users={users}
              branches={org.branches}
              currentUser={currentUser}
              onAddUser={(u) => storage.addUser(u)}
              onSwitchUser={handleUserChange}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              sales={sales}
              invoices={invoices}
              products={products}
              expenses={expenses}
              customers={customers}
              suppliers={suppliers}
              organisation={org}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              organisation={org}
              onUpdateOrg={(data) => storage.updateOrganisation(data)}
              onResetData={() => storage.resetToDefaults()}
            />
          )}
        </main>
      </div>

      {/* Global Auth Modal if triggered */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
        users={users}
        onSelectUser={(u) => handleUserChange(u.id)}
        onCompleteSignUp={() => setAppMode('onboarding')}
      />
    </div>
  );
}
