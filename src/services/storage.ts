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
} from '../types';
import { 
  initialOrganisation, 
  initialUsers, 
  initialCustomers, 
  initialSuppliers, 
  initialProducts, 
  initialStockMovements, 
  initialSales, 
  initialInvoices, 
  initialPurchaseOrders, 
  initialExpenses, 
  initialPayments, 
  initialAccounts, 
  initialJournalEntries, 
  initialAuditLogs 
} from '../data/seedData';
import { generateMPesaRef } from '../utils/formatters';

const STORAGE_KEYS = {
  ORG: 'biashara_org',
  USERS: 'biashara_users',
  CURRENT_USER_ID: 'biashara_current_user_id',
  CURRENT_BRANCH_ID: 'biashara_current_branch_id',
  CUSTOMERS: 'biashara_customers',
  SUPPLIERS: 'biashara_suppliers',
  PRODUCTS: 'biashara_products',
  MOVEMENTS: 'biashara_movements',
  SALES: 'biashara_sales',
  INVOICES: 'biashara_invoices',
  PURCHASES: 'biashara_purchases',
  EXPENSES: 'biashara_expenses',
  PAYMENTS: 'biashara_payments',
  ACCOUNTS: 'biashara_accounts',
  JOURNALS: 'biashara_journals',
  AUDIT: 'biashara_audit',
  INITIALIZED: 'biashara_initialized_v2',
};

class StorageService {
  private listeners: (() => void)[] = [];

  constructor() {
    this.ensureInitialized();
  }

  private ensureInitialized() {
    if (typeof window === 'undefined') return;
    try {
      const initialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
      if (!initialized) {
        this.resetToDefaults();
      }
    } catch {
      // In-case local storage is blocked
    }
  }

  public resetToDefaults() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.ORG, JSON.stringify(initialOrganisation));
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(initialUsers));
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, initialUsers[0].id);
      localStorage.setItem(STORAGE_KEYS.CURRENT_BRANCH_ID, initialOrganisation.branches[0].id);
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(initialCustomers));
      localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(initialSuppliers));
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(initialProducts));
      localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(initialStockMovements));
      localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(initialSales));
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(initialInvoices));
      localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(initialPurchaseOrders));
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(initialExpenses));
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(initialPayments));
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(initialAccounts));
      localStorage.setItem(STORAGE_KEYS.JOURNALS, JSON.stringify(initialJournalEntries));
      localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(initialAuditLogs));
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
      this.notify();
    } catch (e) {
      console.warn('Storage init failed', e);
    }
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  private getItem<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private setItem<T>(key: string, value: T) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
      this.notify();
    } catch (e) {
      console.warn('Storage set failed', e);
    }
  }

  // --- Organisation ---
  public getOrganisation(): Organisation {
    return this.getItem<Organisation>(STORAGE_KEYS.ORG, initialOrganisation);
  }

  public updateOrganisation(org: Partial<Organisation>): Organisation {
    const current = this.getOrganisation();
    const updated = { ...current, ...org };
    this.setItem(STORAGE_KEYS.ORG, updated);
    this.logAudit('UPDATE_ORG', 'Organisation', updated.id, `Updated business settings for ${updated.name}`);
    return updated;
  }

  // --- Branches & Current Context ---
  public getCurrentBranchId(): string {
    return this.getItem<string>(STORAGE_KEYS.CURRENT_BRANCH_ID, 'branch_cbd');
  }

  public setCurrentBranchId(branchId: string) {
    this.setItem(STORAGE_KEYS.CURRENT_BRANCH_ID, branchId);
  }

  // --- Users & Roles ---
  public getUsers(): User[] {
    return this.getItem<User[]>(STORAGE_KEYS.USERS, initialUsers);
  }

  public getCurrentUser(): User {
    const currentId = this.getItem<string>(STORAGE_KEYS.CURRENT_USER_ID, 'user_owner');
    const users = this.getUsers();
    return users.find(u => u.id === currentId) || users[0] || initialUsers[0];
  }

  public setCurrentUserId(userId: string) {
    this.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
  }

  public addUser(user: Omit<User, 'id' | 'created_at'>): User {
    const users = this.getUsers();
    const newUser: User = {
      ...user,
      id: `user_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.setItem(STORAGE_KEYS.USERS, [newUser, ...users]);
    this.logAudit('CREATE_USER', 'User', newUser.id, `Invited team member ${newUser.name} with role ${newUser.role}`);
    return newUser;
  }

  // --- Customers ---
  public getCustomers(): Customer[] {
    return this.getItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, initialCustomers);
  }

  public addCustomer(data: Omit<Customer, 'id' | 'created_at' | 'outstanding_balance'>): Customer {
    const customers = this.getCustomers();
    const newCustomer: Customer = {
      ...data,
      id: `cust_${Date.now()}`,
      outstanding_balance: 0,
      created_at: new Date().toISOString(),
    };
    this.setItem(STORAGE_KEYS.CUSTOMERS, [newCustomer, ...customers]);
    this.logAudit('CREATE_CUSTOMER', 'Customer', newCustomer.id, `Registered customer ${newCustomer.name} (${newCustomer.county})`);
    return newCustomer;
  }

  public updateCustomer(id: string, updates: Partial<Customer>): Customer | null {
    const customers = this.getCustomers();
    const idx = customers.findIndex(c => c.id === id);
    if (idx === -1) return null;
    const updated = { ...customers[idx], ...updates };
    customers[idx] = updated;
    this.setItem(STORAGE_KEYS.CUSTOMERS, customers);
    return updated;
  }

  // --- Suppliers ---
  public getSuppliers(): Supplier[] {
    return this.getItem<Supplier[]>(STORAGE_KEYS.SUPPLIERS, initialSuppliers);
  }

  public addSupplier(data: Omit<Supplier, 'id' | 'created_at' | 'outstanding_balance'>): Supplier {
    const suppliers = this.getSuppliers();
    const newSupplier: Supplier = {
      ...data,
      id: `sup_${Date.now()}`,
      outstanding_balance: 0,
      created_at: new Date().toISOString(),
    };
    this.setItem(STORAGE_KEYS.SUPPLIERS, [newSupplier, ...suppliers]);
    this.logAudit('CREATE_SUPPLIER', 'Supplier', newSupplier.id, `Onboarded supplier ${newSupplier.name}`);
    return newSupplier;
  }

  // --- Products & Inventory ---
  public getProducts(): Product[] {
    return this.getItem<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
  }

  public addProduct(data: Omit<Product, 'id' | 'created_at'>): Product {
    const products = this.getProducts();
    const newProduct: Product = {
      ...data,
      id: `prod_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.setItem(STORAGE_KEYS.PRODUCTS, [newProduct, ...products]);

    // Trace initial stock movement if > 0
    if (newProduct.current_stock > 0) {
      this.recordStockMovement({
        product_id: newProduct.id,
        product_name: newProduct.name,
        sku: newProduct.sku,
        type: 'adjustment_in',
        quantity: newProduct.current_stock,
        previous_stock: 0,
        new_stock: newProduct.current_stock,
        unit_cost: newProduct.cost_price,
        reference_id: 'INIT-STOCK',
        branch_id: newProduct.branch_id,
        performed_by_name: this.getCurrentUser().name,
        notes: 'Initial opening stock intake',
      });
    }

    this.logAudit('CREATE_PRODUCT', 'Product', newProduct.id, `Added catalogue item ${newProduct.name} (${newProduct.sku})`);
    return newProduct;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | null {
    const products = this.getProducts();
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    const updated = { ...products[idx], ...updates };
    products[idx] = updated;
    this.setItem(STORAGE_KEYS.PRODUCTS, products);
    return updated;
  }

  // --- Stock Movements ---
  public getStockMovements(): StockMovement[] {
    return this.getItem<StockMovement[]>(STORAGE_KEYS.MOVEMENTS, initialStockMovements);
  }

  public recordStockMovement(data: Omit<StockMovement, 'id' | 'organisation_id' | 'created_at'>): StockMovement {
    const movements = this.getStockMovements();
    const movement: StockMovement = {
      ...data,
      id: `mov_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      organisation_id: this.getOrganisation().id,
      created_at: new Date().toISOString(),
    };
    this.setItem(STORAGE_KEYS.MOVEMENTS, [movement, ...movements]);
    return movement;
  }

  public adjustStock(
    productId: string, 
    newQuantity: number, 
    reason: string, 
    type: 'adjustment_in' | 'adjustment_out'
  ) {
    const products = this.getProducts();
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const previousStock = product.current_stock;
    const qtyDelta = newQuantity - previousStock;
    product.current_stock = newQuantity;
    this.setItem(STORAGE_KEYS.PRODUCTS, products);

    this.recordStockMovement({
      product_id: product.id,
      product_name: product.name,
      sku: product.sku,
      type: type,
      quantity: qtyDelta,
      previous_stock: previousStock,
      new_stock: newQuantity,
      unit_cost: product.cost_price,
      reference_id: `ADJ-${Date.now().toString().slice(-4)}`,
      branch_id: product.branch_id,
      performed_by_name: this.getCurrentUser().name,
      notes: reason,
    });

    this.logAudit('ADJUST_STOCK', 'Product', product.id, `Stock adjustment for ${product.name}: ${previousStock} -> ${newQuantity} (${reason})`);
  }

  public transferStock(
    productId: string,
    quantity: number,
    fromBranchId: string,
    toBranchId: string,
    notes: string
  ) {
    const products = this.getProducts();
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (product.current_stock < quantity) {
      throw new Error(`Insufficient stock for transfer. Current stock: ${product.current_stock}`);
    }

    const previousStock = product.current_stock;
    product.current_stock -= quantity;
    this.setItem(STORAGE_KEYS.PRODUCTS, products);

    const ref = `TRF-${Date.now().toString().slice(-4)}`;
    this.recordStockMovement({
      product_id: product.id,
      product_name: product.name,
      sku: product.sku,
      type: 'transfer_out',
      quantity: -quantity,
      previous_stock: previousStock,
      new_stock: product.current_stock,
      unit_cost: product.cost_price,
      reference_id: ref,
      branch_id: fromBranchId,
      performed_by_name: this.getCurrentUser().name,
      notes: `Transfer out to branch: ${notes}`,
    });

    this.recordStockMovement({
      product_id: product.id,
      product_name: product.name,
      sku: product.sku,
      type: 'transfer_in',
      quantity: quantity,
      previous_stock: 0,
      new_stock: quantity,
      unit_cost: product.cost_price,
      reference_id: ref,
      branch_id: toBranchId,
      performed_by_name: this.getCurrentUser().name,
      notes: `Transfer in from branch: ${notes}`,
    });

    this.logAudit('TRANSFER_STOCK', 'Product', product.id, `Transferred ${quantity} ${product.unit} of ${product.name} (${ref})`);
  }

  // --- Sales & POS ---
  public getSales(): Sale[] {
    return this.getItem<Sale[]>(STORAGE_KEYS.SALES, initialSales);
  }

  public recordSale(saleData: Omit<Sale, 'id' | 'receipt_number' | 'created_at' | 'organisation_id'>): Sale {
    const sales = this.getSales();
    const count = sales.length + 895;
    const receiptNumber = `REC-2026-${count.toString().padStart(4, '0')}`;
    const currentUser = this.getCurrentUser();
    const org = this.getOrganisation();

    const sale: Sale = {
      ...saleData,
      id: `sale_${Date.now()}`,
      organisation_id: org.id,
      receipt_number: receiptNumber,
      payment_reference: saleData.payment_reference || (saleData.payment_method === 'mpesa' ? generateMPesaRef() : undefined),
      salesperson_id: currentUser.id,
      salesperson_name: currentUser.name,
      created_at: new Date().toISOString(),
    };

    // 1. Update stock levels for each item sold and log traceable movements
    const products = this.getProducts();
    sale.items.forEach(item => {
      const prod = products.find(p => p.id === item.product_id);
      if (prod) {
        const prev = prod.current_stock;
        prod.current_stock = Math.max(0, prod.current_stock - item.quantity);
        this.recordStockMovement({
          product_id: prod.id,
          product_name: prod.name,
          sku: prod.sku,
          type: 'sale',
          quantity: -item.quantity,
          previous_stock: prev,
          new_stock: prod.current_stock,
          unit_cost: item.cost_price,
          reference_id: receiptNumber,
          branch_id: sale.branch_id,
          performed_by_name: currentUser.name,
          notes: `POS Sale ${receiptNumber} to ${sale.customer_name}`,
        });
      }
    });
    this.setItem(STORAGE_KEYS.PRODUCTS, products);

    // 2. Add to sales list
    this.setItem(STORAGE_KEYS.SALES, [sale, ...sales]);

    // 3. Create payment record
    this.addPayment({
      type: 'customer_receipt',
      reference_type: 'sale',
      reference_id: sale.id,
      reference_number: receiptNumber,
      party_name: sale.customer_name,
      amount: sale.grand_total,
      payment_method: sale.payment_method,
      payment_reference: sale.payment_reference || 'CASH-PAY',
      status: 'completed',
      branch_id: sale.branch_id,
      notes: `POS Sale Receipt ${receiptNumber}`,
    });

    this.logAudit('CREATE_SALE', 'Sale', sale.id, `Processed ${sale.payment_method.toUpperCase()} sale ${receiptNumber} for KES ${sale.grand_total.toLocaleString()}`);
    return sale;
  }

  // --- Invoicing ---
  public getInvoices(): Invoice[] {
    return this.getItem<Invoice[]>(STORAGE_KEYS.INVOICES, initialInvoices);
  }

  public createInvoice(data: Omit<Invoice, 'id' | 'invoice_number' | 'created_at' | 'organisation_id' | 'amount_paid' | 'balance_due'>): Invoice {
    const invoices = this.getInvoices();
    const count = invoices.length + 145;
    const invNumber = `INV-2026-${count.toString().padStart(4, '0')}`;
    const org = this.getOrganisation();

    const invoice: Invoice = {
      ...data,
      id: `inv_${Date.now()}`,
      organisation_id: org.id,
      invoice_number: invNumber,
      amount_paid: 0,
      balance_due: data.grand_total,
      etims_signature: `ETIMS-SIGN-SIM-2026-VSCU-${Math.floor(1000000 + Math.random() * 9000000)}`,
      created_at: new Date().toISOString(),
    };

    // Update customer outstanding balance if customer selected
    if (invoice.customer_id) {
      const customers = this.getCustomers();
      const customer = customers.find(c => c.id === invoice.customer_id);
      if (customer) {
        customer.outstanding_balance += invoice.grand_total;
        this.setItem(STORAGE_KEYS.CUSTOMERS, customers);
      }
    }

    this.setItem(STORAGE_KEYS.INVOICES, [invoice, ...invoices]);
    this.logAudit('CREATE_INVOICE', 'Invoice', invoice.id, `Generated invoice ${invNumber} for ${invoice.customer_name} (KES ${invoice.grand_total.toLocaleString()})`);
    return invoice;
  }

  public recordInvoicePayment(
    invoiceId: string, 
    amount: number, 
    paymentMethod: PaymentMethod, 
    reference: string
  ): Invoice | null {
    const invoices = this.getInvoices();
    const invoice = invoices.find(i => i.id === invoiceId);
    if (!invoice) return null;

    invoice.amount_paid += amount;
    invoice.balance_due = Math.max(0, invoice.grand_total - invoice.amount_paid);

    if (invoice.balance_due <= 0) {
      invoice.status = 'paid';
    } else {
      invoice.status = 'partially_paid';
    }

    this.setItem(STORAGE_KEYS.INVOICES, invoices);

    // Update customer outstanding balance
    if (invoice.customer_id) {
      const customers = this.getCustomers();
      const customer = customers.find(c => c.id === invoice.customer_id);
      if (customer) {
        customer.outstanding_balance = Math.max(0, customer.outstanding_balance - amount);
        this.setItem(STORAGE_KEYS.CUSTOMERS, customers);
      }
    }

    // Record payment entry
    this.addPayment({
      type: 'customer_receipt',
      reference_type: 'invoice',
      reference_id: invoice.id,
      reference_number: invoice.invoice_number,
      party_name: invoice.customer_name,
      amount: amount,
      payment_method: paymentMethod,
      payment_reference: reference || generateMPesaRef(),
      status: 'reconciled',
      branch_id: invoice.branch_id,
      notes: `Payment towards ${invoice.invoice_number}`,
    });

    this.logAudit('RECORD_PAYMENT', 'Invoice', invoice.id, `Received payment of KES ${amount.toLocaleString()} for ${invoice.invoice_number}`);
    return invoice;
  }

  // --- Purchase Orders ---
  public getPurchaseOrders(): PurchaseOrder[] {
    return this.getItem<PurchaseOrder[]>(STORAGE_KEYS.PURCHASES, initialPurchaseOrders);
  }

  public createPurchaseOrder(data: Omit<PurchaseOrder, 'id' | 'po_number' | 'created_at' | 'organisation_id' | 'amount_paid'>): PurchaseOrder {
    const pos = this.getPurchaseOrders();
    const count = pos.length + 33;
    const poNumber = `PO-2026-${count.toString().padStart(4, '0')}`;
    const org = this.getOrganisation();

    const po: PurchaseOrder = {
      ...data,
      id: `po_${Date.now()}`,
      organisation_id: org.id,
      po_number: poNumber,
      amount_paid: 0,
      created_at: new Date().toISOString(),
    };

    // Update supplier outstanding balance
    const suppliers = this.getSuppliers();
    const supplier = suppliers.find(s => s.id === po.supplier_id);
    if (supplier) {
      supplier.outstanding_balance += po.grand_total;
      this.setItem(STORAGE_KEYS.SUPPLIERS, suppliers);
    }

    this.setItem(STORAGE_KEYS.PURCHASES, [po, ...pos]);
    this.logAudit('CREATE_PO', 'PurchaseOrder', po.id, `Created Purchase Order ${poNumber} to ${po.supplier_name} (KES ${po.grand_total.toLocaleString()})`);
    return po;
  }

  public receivePurchaseOrder(poId: string): PurchaseOrder | null {
    const pos = this.getPurchaseOrders();
    const po = pos.find(p => p.id === poId);
    if (!po) return null;

    po.status = 'received';
    const products = this.getProducts();

    po.items.forEach(item => {
      item.quantity_received = item.quantity_ordered;
      const product = products.find(p => p.id === item.product_id);
      if (product) {
        const prev = product.current_stock;
        product.current_stock += item.quantity_ordered;
        this.recordStockMovement({
          product_id: product.id,
          product_name: product.name,
          sku: product.sku,
          type: 'purchase_received',
          quantity: item.quantity_ordered,
          previous_stock: prev,
          new_stock: product.current_stock,
          unit_cost: item.unit_cost,
          reference_id: po.po_number,
          branch_id: po.branch_id,
          performed_by_name: this.getCurrentUser().name,
          notes: `Goods received from ${po.supplier_name}`,
        });
      }
    });

    this.setItem(STORAGE_KEYS.PRODUCTS, products);
    this.setItem(STORAGE_KEYS.PURCHASES, pos);
    this.logAudit('RECEIVE_PO', 'PurchaseOrder', po.id, `Received inventory goods for ${po.po_number}`);
    return po;
  }

  // --- Expenses ---
  public getExpenses(): Expense[] {
    return this.getItem<Expense[]>(STORAGE_KEYS.EXPENSES, initialExpenses);
  }

  public addExpense(data: Omit<Expense, 'id' | 'expense_number' | 'created_at' | 'organisation_id'>): Expense {
    const expenses = this.getExpenses();
    const count = expenses.length + 95;
    const expNumber = `EXP-2026-${count.toString().padStart(4, '0')}`;
    const org = this.getOrganisation();

    const expense: Expense = {
      ...data,
      id: `exp_${Date.now()}`,
      organisation_id: org.id,
      expense_number: expNumber,
      created_at: new Date().toISOString(),
    };

    this.setItem(STORAGE_KEYS.EXPENSES, [expense, ...expenses]);

    // Create payment entry
    this.addPayment({
      type: 'expense_payment',
      reference_type: 'expense',
      reference_id: expense.id,
      reference_number: expNumber,
      party_name: expense.payee_name,
      amount: expense.amount,
      payment_method: expense.payment_method,
      payment_reference: expense.reference_number || 'EXP-CASH',
      status: 'completed',
      branch_id: expense.branch_id,
      notes: `${expense.category} expense: ${expense.notes || ''}`,
    });

    this.logAudit('ADD_EXPENSE', 'Expense', expense.id, `Recorded ${expense.category} expense of KES ${expense.amount.toLocaleString()} to ${expense.payee_name}`);
    return expense;
  }

  // --- Payments & Reconciliation ---
  public getPayments(): PaymentRecord[] {
    return this.getItem<PaymentRecord[]>(STORAGE_KEYS.PAYMENTS, initialPayments);
  }

  public addPayment(data: Omit<PaymentRecord, 'id' | 'payment_number' | 'created_at' | 'organisation_id'>): PaymentRecord {
    const payments = this.getPayments();
    const count = payments.length + 504;
    const payNumber = `PAY-2026-${count.toString().padStart(4, '0')}`;
    const org = this.getOrganisation();

    const payment: PaymentRecord = {
      ...data,
      id: `pay_${Date.now()}`,
      organisation_id: org.id,
      payment_number: payNumber,
      created_at: new Date().toISOString(),
    };

    this.setItem(STORAGE_KEYS.PAYMENTS, [payment, ...payments]);
    return payment;
  }

  // --- Accounting & Double-Entry Ledger ---
  public getAccounts(): Account[] {
    return this.getItem<Account[]>(STORAGE_KEYS.ACCOUNTS, initialAccounts);
  }

  public getJournalEntries(): JournalEntry[] {
    return this.getItem<JournalEntry[]>(STORAGE_KEYS.JOURNALS, initialJournalEntries);
  }

  public addJournalEntry(data: Omit<JournalEntry, 'id' | 'entry_number' | 'created_at' | 'organisation_id' | 'posted_by'>): JournalEntry {
    // Validate double-entry equality
    const diff = Math.abs(data.total_debit - data.total_credit);
    if (diff > 0.01) {
      throw new Error(`Double-entry balance check failed! Total Debits (${data.total_debit}) must equal Total Credits (${data.total_credit}). Difference: ${diff.toFixed(2)}`);
    }

    const journals = this.getJournalEntries();
    const count = journals.length + 3;
    const entryNumber = `JRN-2026-${count.toString().padStart(3, '0')}`;
    const currentUser = this.getCurrentUser();
    const org = this.getOrganisation();

    const entry: JournalEntry = {
      ...data,
      id: `je_${Date.now()}`,
      organisation_id: org.id,
      entry_number: entryNumber,
      posted_by: currentUser.name,
      created_at: new Date().toISOString(),
    };

    this.setItem(STORAGE_KEYS.JOURNALS, [entry, ...journals]);
    this.logAudit('POST_JOURNAL', 'JournalEntry', entry.id, `Posted balanced journal entry ${entryNumber} (${entry.description})`);
    return entry;
  }

  // --- Audit Logs ---
  public getAuditLogs(): AuditLog[] {
    return this.getItem<AuditLog[]>(STORAGE_KEYS.AUDIT, initialAuditLogs);
  }

  private logAudit(action: string, entityType: string, entityId: string, details: string) {
    const logs = this.getAuditLogs();
    const currentUser = this.getCurrentUser();
    const org = this.getOrganisation();

    const log: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      organisation_id: org.id,
      user_id: currentUser.id,
      user_name: currentUser.name,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
      timestamp: new Date().toISOString(),
    };

    this.setItem(STORAGE_KEYS.AUDIT, [log, ...logs.slice(0, 99)]);
  }
}

export const storage = new StorageService();
