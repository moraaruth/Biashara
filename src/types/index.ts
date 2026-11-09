/**
 * BiasharaOS - Domain Types
 * Designed for Kenyan SME Operations (Retail, Wholesale, Hardware, Services)
 */

export type UserRole = 
  | 'owner' 
  | 'admin' 
  | 'manager' 
  | 'salesperson' 
  | 'accountant' 
  | 'inventory_manager';

export interface User {
  id: string;
  organisation_id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  branch_id?: string;
  active: boolean;
  created_at: string;
}

export interface Organisation {
  id: string;
  name: string;
  trading_name?: string;
  business_type: 'retail' | 'wholesale' | 'hardware' | 'services' | 'cosmetics' | 'electronics' | 'other';
  kra_pin?: string;
  phone: string;
  email: string;
  county: string;
  sub_county?: string;
  address: string;
  currency: 'KES';
  vat_registered: boolean;
  vat_rate: number; // 0.16 by default in Kenya
  vat_pricing: 'inclusive' | 'exclusive';
  etims_status: 'ready' | 'simulated' | 'not_configured';
  active_modules: AppModule[];
  branches: Branch[];
}

export type AppModule = 
  | 'sales' 
  | 'invoicing' 
  | 'inventory' 
  | 'purchases' 
  | 'customers' 
  | 'expenses' 
  | 'payments' 
  | 'accounting' 
  | 'employees' 
  | 'reports';

export interface Branch {
  id: string;
  organisation_id: string;
  name: string;
  code: string;
  location: string;
  phone: string;
  is_headquarters: boolean;
}

export interface Customer {
  id: string;
  organisation_id: string;
  name: string;
  company_name?: string;
  customer_type: 'individual' | 'retail' | 'wholesale' | 'corporate';
  phone: string;
  email?: string;
  kra_pin?: string;
  county: string;
  credit_limit: number;
  outstanding_balance: number;
  created_at: string;
  notes?: string;
}

export interface Supplier {
  id: string;
  organisation_id: string;
  name: string;
  contact_person: string;
  phone: string;
  email?: string;
  kra_pin?: string;
  category: string;
  payment_terms_days: number;
  outstanding_balance: number;
  created_at: string;
}

export interface ProductCategory {
  id: string;
  organisation_id: string;
  name: string;
  code: string;
}

export interface Product {
  id: string;
  organisation_id: string;
  sku: string;
  barcode?: string;
  name: string;
  category_id: string;
  category_name: string;
  unit: string; // e.g. 'Pcs', 'Bags', 'Kg', 'Ltr', 'Box'
  cost_price: number;
  selling_price: number;
  current_stock: number;
  reorder_level: number;
  branch_id: string;
  tax_category: 'standard_16' | 'zero_rated' | 'exempt';
  image_url?: string;
  created_at: string;
}

export type StockMovementType = 
  | 'sale' 
  | 'purchase_received' 
  | 'adjustment_in' 
  | 'adjustment_out' 
  | 'transfer_in' 
  | 'transfer_out' 
  | 'return';

export interface StockMovement {
  id: string;
  organisation_id: string;
  product_id: string;
  product_name: string;
  sku: string;
  type: StockMovementType;
  quantity: number; // positive or negative
  previous_stock: number;
  new_stock: number;
  unit_cost: number;
  reference_id: string; // sale_id, po_id, or adjustment ref
  branch_id: string;
  performed_by_name: string;
  notes?: string;
  created_at: string;
}

export type PaymentMethod = 'mpesa' | 'cash' | 'bank_transfer' | 'card' | 'credit';

export interface SaleItem {
  product_id: string;
  product_name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  cost_price: number;
  discount: number;
  tax_rate: number;
  total: number;
}

export interface Sale {
  id: string;
  organisation_id: string;
  receipt_number: string;
  customer_id?: string;
  customer_name: string;
  customer_phone?: string;
  branch_id: string;
  items: SaleItem[];
  subtotal: number;
  discount_total: number;
  tax_total: number;
  grand_total: number;
  payment_method: PaymentMethod;
  payment_reference?: string; // e.g. M-Pesa confirmation code 'QHF893821K'
  payment_status: 'completed' | 'partial' | 'pending';
  amount_paid: number;
  salesperson_id: string;
  salesperson_name: string;
  created_at: string;
}

export type InvoiceStatus = 'draft' | 'sent' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';

export interface InvoiceItem {
  id: string;
  product_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  organisation_id: string;
  invoice_number: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  customer_kra_pin?: string;
  branch_id: string;
  issue_date: string;
  due_date: string;
  items: InvoiceItem[];
  subtotal: number;
  tax_total: number;
  grand_total: number;
  amount_paid: number;
  balance_due: number;
  status: InvoiceStatus;
  payment_terms?: string;
  etims_signature?: string; // Simulation placeholder
  created_at: string;
}

export interface PurchaseOrderItem {
  product_id: string;
  product_name: string;
  sku: string;
  quantity_ordered: number;
  quantity_received: number;
  unit_cost: number;
  total_cost: number;
}

export interface PurchaseOrder {
  id: string;
  organisation_id: string;
  po_number: string;
  supplier_id: string;
  supplier_name: string;
  branch_id: string;
  order_date: string;
  expected_date?: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  tax_total: number;
  grand_total: number;
  status: 'draft' | 'ordered' | 'partially_received' | 'received' | 'cancelled';
  payment_status: 'unpaid' | 'partially_paid' | 'paid';
  amount_paid: number;
  created_at: string;
}

export interface Expense {
  id: string;
  organisation_id: string;
  expense_number: string;
  category: 
    | 'Rent' 
    | 'Electricity (KPLC)' 
    | 'Water' 
    | 'Salaries' 
    | 'Transport & Fuel' 
    | 'Internet & Telco' 
    | 'Supplies' 
    | 'Maintenance' 
    | 'Marketing' 
    | 'Licences & County Levies' 
    | 'Other';
  amount: number;
  payment_method: PaymentMethod;
  reference_number?: string;
  supplier_id?: string;
  payee_name: string;
  branch_id: string;
  date: string;
  notes?: string;
  created_at: string;
}

export interface PaymentRecord {
  id: string;
  organisation_id: string;
  payment_number: string;
  type: 'customer_receipt' | 'supplier_payment' | 'expense_payment';
  reference_type: 'sale' | 'invoice' | 'purchase_order' | 'expense' | 'direct';
  reference_id?: string;
  reference_number?: string;
  party_name: string;
  amount: number;
  payment_method: PaymentMethod;
  payment_reference: string; // M-Pesa transaction ID, Bank slip, etc.
  status: 'completed' | 'reconciled' | 'pending';
  branch_id: string;
  created_at: string;
  notes?: string;
}

export interface Account {
  id: string;
  organisation_id: string;
  code: string;
  name: string;
  type: 'Asset' | 'Liability' | 'Equity' | 'Income' | 'Expense';
  category: string;
  balance: number;
  currency: 'KES';
}

export interface JournalEntryLine {
  account_id: string;
  account_code: string;
  account_name: string;
  debit: number;
  credit: number;
}

export interface JournalEntry {
  id: string;
  organisation_id: string;
  entry_number: string;
  date: string;
  description: string;
  reference?: string;
  lines: JournalEntryLine[];
  total_debit: number;
  total_credit: number;
  posted_by: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  organisation_id: string;
  user_id: string;
  user_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: string;
  timestamp: string;
}
