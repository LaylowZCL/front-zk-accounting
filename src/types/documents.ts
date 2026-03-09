// Shared types for documents

export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  address?: string;
  totalInvoices: number;
  balance: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  type: 'service' | 'product' | 'subscription';
  status: 'active' | 'inactive';
}

export interface LineItem {
  id: string;
  productId?: number;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  total: number;
}

export interface Invoice {
  id: string;
  documentId?: number;
  client: string;
  clientId: number;
  date: string;
  dueDate: string;
  amount: number;
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'partial';
  items: LineItem[];
  subtotal: number;
  taxTotal: number;
  notes?: string;
}

export interface Quotation {
  id: string;
  documentId?: number;
  client: string;
  clientId: number;
  date: string;
  validUntil: string;
  amount: number;
  status: 'draft' | 'pending' | 'accepted' | 'declined' | 'expired';
  items: LineItem[];
  subtotal: number;
  taxTotal: number;
  notes?: string;
}

export interface Receipt {
  id: string;
  documentId?: number;
  invoice: string;
  invoiceId: string | number;
  client: string;
  clientId: number;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  paymentMethod: string;
  notes?: string;
}

// Mock data
export const mockClients: Client[] = [
  { id: 1, name: 'Acme Corporation', email: 'contact@acme.com', phone: '+1 234 567 890', address: '123 Business Ave, NY 10001', totalInvoices: 12, balance: 4500.00 },
  { id: 2, name: 'TechStart Inc.', email: 'billing@techstart.io', phone: '+1 345 678 901', address: '456 Tech Blvd, SF 94102', totalInvoices: 8, balance: 2300.00 },
  { id: 3, name: 'Global Services Ltd.', email: 'accounts@globalservices.com', phone: '+1 456 789 012', address: '789 Global St, LA 90001', totalInvoices: 15, balance: 7800.00 },
  { id: 4, name: 'Creative Agency', email: 'hello@creativeagency.co', phone: '+1 567 890 123', address: '321 Creative Way, Chicago 60601', totalInvoices: 5, balance: 1200.00 },
  { id: 5, name: 'Retail Solutions', email: 'info@retailsolutions.com', phone: '+1 678 901 234', address: '654 Retail Rd, Miami 33101', totalInvoices: 20, balance: 12500.00 },
];

export const mockProducts: Product[] = [
  { id: 1, name: 'Website Development', description: 'Full-stack web development services', price: 5000.00, type: 'service', status: 'active' },
  { id: 2, name: 'Logo Design Package', description: 'Professional logo design with revisions', price: 500.00, type: 'service', status: 'active' },
  { id: 3, name: 'Monthly SEO Package', description: 'Search engine optimization services', price: 1200.00, type: 'service', status: 'active' },
  { id: 4, name: 'Consulting Hour', description: 'One hour of expert consulting', price: 150.00, type: 'service', status: 'active' },
  { id: 5, name: 'Premium Support Plan', description: '24/7 priority support subscription', price: 299.00, type: 'subscription', status: 'active' },
  { id: 6, name: 'Legacy Package', description: 'Discontinued service package', price: 800.00, type: 'service', status: 'inactive' },
];

export const paymentMethods = [
  'Bank Transfer',
  'Credit Card',
  'Debit Card',
  'PayPal',
  'Check',
  'Cash',
];
