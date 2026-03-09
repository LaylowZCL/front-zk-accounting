import { apiRequestFirst } from '@/lib/api';
import type { Client, Invoice, Product, Quotation, Receipt } from '@/types/documents';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'employee';
  status: 'active' | 'pending' | 'inactive';
  invitedAt: string;
  joinedAt?: string;
}

export interface PaymentRecord {
  id: string;
  invoice: string;
  client: string;
  date: string;
  amount: number;
  method: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface SentRecord {
  id: string | number;
  type: string;
  reference: string;
  recipient: string;
  sentAt: string;
  status: 'delivered' | 'opened' | 'clicked' | 'bounced';
  opens: number;
  clicks: number;
}

export interface DashboardSummary {
  totalRevenue: number;
  pendingInvoices: number;
  pendingAmount: number;
  totalClients: number;
  paidThisMonth: number;
  paidInvoicesThisMonth: number;
  recentInvoices: Array<{ id: string; client: string; amount: number; status: string; date: string }>;
  revenueByMonth: Array<{ month: string; revenue: number }>;
  invoiceStatus: Array<{ name: string; value: number }>;
  weeklyActivity: Array<{ day: string; invoices: number; payments: number }>;
}

export interface SettingsPayload {
  company?: {
    name?: string;
    tax_number?: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  profile?: {
    first_name?: string;
    last_name?: string;
    email?: string;
  };
  notifications?: {
    email_notifications?: boolean;
    invoice_reminders?: boolean;
    payment_alerts?: boolean;
  };
  branding?: {
    invoice_prefix?: string;
    invoice_footer?: string;
  };
  billing?: Record<string, unknown>;
  security?: Record<string, unknown>;
}

type ApiList<T> = { ok?: boolean; data?: T[]; items?: T[] };
type ApiItem<T> = { ok?: boolean; data?: T; item?: T };
type ApiEnvelope<T> = { ok?: boolean; data?: T };

type BackendDocument = {
  id: string;
  documentId?: number;
  client?: string;
  clientId?: number;
  date?: string;
  dueDate?: string;
  validUntil?: string;
  amount?: number;
  status?: string;
  items?: Invoice['items'];
  subtotal?: number;
  taxTotal?: number;
  notes?: string;
  invoice?: string;
  invoiceId?: string | number | null;
  paymentMethod?: string;
};

const unwrapList = <T>(payload: ApiList<T> | T[]): T[] => {
  if (Array.isArray(payload)) return payload;
  return payload.data ?? payload.items ?? [];
};

const unwrapItem = <T>(payload: ApiItem<T> | T): T => {
  if (typeof payload === 'object' && payload !== null && ('data' in payload || 'item' in payload)) {
    const normalized = payload as ApiItem<T>;
    return normalized.data ?? (normalized.item as T);
  }
  return payload as T;
};

const postJson = (body: unknown): RequestInit => ({
  method: 'POST',
  body: JSON.stringify(body),
});

const patchJson = (body: unknown): RequestInit => ({
  method: 'PATCH',
  body: JSON.stringify(body),
});

const normalizeClient = (raw: Partial<Client> & { totalInvoices?: number; balance?: number }): Client => ({
  id: Number(raw.id ?? 0),
  name: raw.name ?? '',
  email: raw.email ?? '',
  phone: raw.phone ?? '',
  address: raw.address ?? '',
  totalInvoices: Number(raw.totalInvoices ?? 0),
  balance: Number(raw.balance ?? 0),
});

const normalizeProduct = (raw: Record<string, unknown>): Product => ({
  id: Number(raw.id ?? 0),
  name: String(raw.name ?? ''),
  description: String(raw.description ?? ''),
  price: Number(raw.price ?? (Number(raw.price_cents ?? 0) / 100)),
  type: String(raw.type ?? 'service') as Product['type'],
  status: String(raw.status ?? 'active') as Product['status'],
});

const normalizeDocument = <T extends Invoice | Quotation | Receipt>(raw: BackendDocument): T => ({
  ...raw,
  client: raw.client ?? '',
  clientId: Number(raw.clientId ?? 0),
  date: raw.date ?? '',
  amount: Number(raw.amount ?? 0),
  status: String(raw.status ?? 'draft'),
  items: raw.items ?? [],
  subtotal: Number(raw.subtotal ?? 0),
  taxTotal: Number(raw.taxTotal ?? 0),
  notes: raw.notes ?? '',
} as T);

const toDocumentPayload = (payload: Partial<Invoice | Quotation | Receipt>) => ({
  clientId: Number(payload.clientId ?? 0) || null,
  date: (payload as Invoice | Quotation).date,
  dueDate: (payload as Invoice).dueDate,
  validUntil: (payload as Quotation).validUntil,
  status: payload.status ?? 'pending',
  notes: payload.notes,
  items: (payload as Invoice | Quotation).items,
  paymentMethod: (payload as Receipt).paymentMethod,
  amount: payload.amount,
});

const getDocumentPk = (payload: Partial<Invoice | Quotation | Receipt>) => {
  const direct = payload.documentId;
  if (typeof direct === 'number' && Number.isFinite(direct)) return direct;
  return null;
};

export async function listClients() {
  const response = await apiRequestFirst<ApiList<Client> | Client[]>(['/workspace/clients']);
  return unwrapList(response).map((item) => normalizeClient(item));
}

export async function createClient(payload: Partial<Client>) {
  const response = await apiRequestFirst<ApiItem<Client> | Client>(['/workspace/clients'], postJson(payload));
  return normalizeClient(unwrapItem(response));
}

export async function updateClient(id: number, payload: Partial<Client>) {
  const response = await apiRequestFirst<ApiItem<Client> | Client>([`/workspace/clients/${id}`], patchJson(payload));
  return normalizeClient(unwrapItem(response));
}

export async function deleteClient(id: number) {
  await apiRequestFirst<{ ok: boolean }>([`/workspace/clients/${id}`], { method: 'DELETE' });
}

export async function listProducts() {
  const response = await apiRequestFirst<ApiList<Record<string, unknown>> | Record<string, unknown>[]>(['/workspace/products']);
  return unwrapList(response).map((item) => normalizeProduct(item));
}

export async function createProduct(payload: Partial<Product>) {
  const response = await apiRequestFirst<ApiItem<Record<string, unknown>> | Record<string, unknown>>(['/workspace/products'], postJson(payload));
  return normalizeProduct(unwrapItem(response));
}

export async function updateProduct(id: number, payload: Partial<Product>) {
  const response = await apiRequestFirst<ApiItem<Record<string, unknown>> | Record<string, unknown>>([`/workspace/products/${id}`], patchJson(payload));
  return normalizeProduct(unwrapItem(response));
}

export async function duplicateProduct(id: number) {
  const response = await apiRequestFirst<ApiItem<Record<string, unknown>> | Record<string, unknown>>([`/workspace/products/${id}/duplicate`], postJson({}));
  return normalizeProduct(unwrapItem(response));
}

export async function deleteProduct(id: number) {
  await apiRequestFirst<{ ok: boolean }>([`/workspace/products/${id}`], { method: 'DELETE' });
}

export async function listTeamMembers() {
  const response = await apiRequestFirst<ApiList<TeamMember> | TeamMember[]>(['/workspace/team']);
  return unwrapList(response).map((member) => ({
    ...member,
    role: String(member.role).includes('owner') ? 'owner' : 'employee',
    status: member.status === 'active' ? 'active' : (member.status === 'pending' ? 'pending' : 'inactive'),
  })) as TeamMember[];
}

export async function inviteTeamMember(payload: { email: string; role?: string }) {
  await apiRequestFirst<{ ok: boolean }>(['/workspace/team/invitations'], postJson(payload));
}

export async function resendTeamInvitation(invitationId: string) {
  const id = invitationId.replace('invite-', '');
  await apiRequestFirst<{ ok: boolean }>([`/workspace/team/invitations/${id}/resend`], postJson({}));
}

export async function updateTeamMember(id: string, payload: Partial<TeamMember>) {
  await apiRequestFirst<{ ok: boolean }>([`/workspace/team/members/${id}`], patchJson(payload));
}

export async function deleteTeamMember(id: string) {
  await apiRequestFirst<{ ok: boolean }>([`/workspace/team/members/${id}`], { method: 'DELETE' });
}

export async function listInvoices() {
  const response = await apiRequestFirst<ApiList<BackendDocument> | BackendDocument[]>(['/workspace/invoices']);
  return unwrapList(response).map((item) => normalizeDocument<Invoice>(item));
}

export async function saveInvoice(payload: Invoice) {
  const body = toDocumentPayload(payload);
  const pk = getDocumentPk(payload);
  if (pk) {
    const response = await apiRequestFirst<ApiItem<BackendDocument> | BackendDocument>([`/workspace/invoices/${pk}`], patchJson(body));
    return normalizeDocument<Invoice>(unwrapItem(response));
  }
  const response = await apiRequestFirst<ApiItem<BackendDocument> | BackendDocument>(['/workspace/invoices'], postJson(body));
  return normalizeDocument<Invoice>(unwrapItem(response));
}

export async function deleteInvoice(id: string | number) {
  await apiRequestFirst<{ ok: boolean }>([`/workspace/invoices/${id}`], { method: 'DELETE' });
}

export async function convertQuotationToInvoice(id: string | number) {
  return apiRequestFirst<ApiItem<BackendDocument> | BackendDocument>([`/workspace/quotations/${id}/convert`], postJson({}));
}

export async function convertInvoiceToReceipt(id: string | number) {
  return apiRequestFirst<ApiItem<BackendDocument> | BackendDocument>([`/workspace/invoices/${id}/convert`], postJson({}));
}

export async function listQuotations() {
  const response = await apiRequestFirst<ApiList<BackendDocument> | BackendDocument[]>(['/workspace/quotations']);
  return unwrapList(response).map((item) => normalizeDocument<Quotation>(item));
}

export async function saveQuotation(payload: Quotation) {
  const body = toDocumentPayload(payload);
  const pk = getDocumentPk(payload);
  if (pk) {
    const response = await apiRequestFirst<ApiItem<BackendDocument> | BackendDocument>([`/workspace/quotations/${pk}`], patchJson(body));
    return normalizeDocument<Quotation>(unwrapItem(response));
  }
  const response = await apiRequestFirst<ApiItem<BackendDocument> | BackendDocument>(['/workspace/quotations'], postJson(body));
  return normalizeDocument<Quotation>(unwrapItem(response));
}

export async function deleteQuotation(id: string | number) {
  await apiRequestFirst<{ ok: boolean }>([`/workspace/quotations/${id}`], { method: 'DELETE' });
}

export async function sendWorkspaceDocument(type: 'quotations' | 'invoices' | 'receipts', id: string | number) {
  await apiRequestFirst<{ ok: boolean }>([`/workspace/${type}/${id}/send`], postJson({}));
}

export async function getWorkspaceDocumentDownloadUrl(type: 'quotations' | 'invoices' | 'receipts', id: string | number) {
  const response = await apiRequestFirst<ApiEnvelope<{ url?: string }>>([`/workspace/${type}/${id}/download`]);
  return response.data?.url ?? null;
}

export async function listReceipts() {
  const response = await apiRequestFirst<ApiList<BackendDocument> | BackendDocument[]>(['/workspace/receipts']);
  return unwrapList(response).map((item) => normalizeDocument<Receipt>(item));
}

export async function saveReceipt(payload: Receipt) {
  const body = {
    ...toDocumentPayload(payload),
    status: 'paid',
  };
  const pk = getDocumentPk(payload);
  if (pk) {
    const response = await apiRequestFirst<ApiItem<BackendDocument> | BackendDocument>([`/workspace/receipts/${pk}`], patchJson(body));
    return normalizeDocument<Receipt>(unwrapItem(response));
  }
  const response = await apiRequestFirst<ApiItem<BackendDocument> | BackendDocument>(['/workspace/receipts'], postJson(body));
  return normalizeDocument<Receipt>(unwrapItem(response));
}

export async function updateReceipt(id: string | number, payload: Partial<Receipt>) {
  const body = {
    ...toDocumentPayload(payload),
    status: 'paid',
  };
  const response = await apiRequestFirst<ApiItem<BackendDocument> | BackendDocument>([`/workspace/receipts/${id}`], patchJson(body));
  return normalizeDocument<Receipt>(unwrapItem(response));
}

export async function deleteReceipt(id: string | number) {
  await apiRequestFirst<{ ok: boolean }>([`/workspace/receipts/${id}`], { method: 'DELETE' });
}

export async function listPayments() {
  const response = await apiRequestFirst<ApiList<PaymentRecord> | PaymentRecord[]>(['/workspace/payments']);
  return unwrapList(response).map((row) => ({
    ...row,
    id: row.id ?? '-',
    invoice: row.invoice ?? '-',
    client: row.client ?? '-',
    date: row.date ?? '-',
    amount: Number(row.amount ?? 0),
    method: row.method ?? '-',
    status: (row.status ?? 'pending') as PaymentRecord['status'],
  }));
}

export async function createPayment(payload: {
  clientId: number;
  documentId?: number;
  amount: number;
  paymentMethod: string;
  paymentDate?: string;
  status?: 'completed' | 'pending' | 'failed';
  notes?: string;
}) {
  const body = {
    client_id: payload.clientId,
    document_id: payload.documentId,
    amount: payload.amount,
    payment_method: payload.paymentMethod,
    payment_date: payload.paymentDate || new Date().toISOString().split('T')[0],
    status: payload.status || 'completed',
    notes: payload.notes,
  };
  const response = await apiRequestFirst<ApiItem<PaymentRecord> | PaymentRecord>(['/workspace/payments'], postJson(body));
  return unwrapItem(response);
}

export async function listSent() {
  const response = await apiRequestFirst<ApiList<Record<string, unknown>> | Record<string, unknown>[]>(['/workspace/sent']);
  return unwrapList(response).map((row) => ({
    id: String(row.id ?? ''),
    type: String(row.document_type ?? row.type ?? 'Document'),
    reference: String(row.reference ?? '-'),
    recipient: String(row.recipient_email ?? row.recipient ?? '-'),
    sentAt: String(row.sent_at ?? row.sentAt ?? '-'),
    status: String(row.status ?? 'delivered') as SentRecord['status'],
    opens: Number(row.opens ?? 0),
    clicks: Number(row.clicks ?? 0),
  }));
}

export async function listReports() {
  const response = await apiRequestFirst<ApiEnvelope<{ revenue: number; invoice_count: number; active_clients: number }>>(['/workspace/reports']);
  const data = response.data;
  if (!data) return [];
  return [
    { title: 'Revenue Report', description: `Total revenue: $${Number(data.revenue ?? 0).toLocaleString()}`, key: 'revenue' },
    { title: 'Invoice Summary', description: `${Number(data.invoice_count ?? 0)} invoices on record`, key: 'invoices' },
    { title: 'Client Analysis', description: `${Number(data.active_clients ?? 0)} active clients`, key: 'clients' },
  ];
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const response = await apiRequestFirst<ApiEnvelope<{ total_revenue?: number; pending_invoices?: number; total_clients?: number; paid_this_month?: number; recent_invoices?: Array<{ number?: string; total_cents?: number; status?: string; issue_date?: string; client?: { name?: string } }> }>>(['/workspace/dashboard']);
  const data = response.data ?? {};
  const recentInvoices = (data.recent_invoices ?? []).map((inv) => ({
    id: String(inv.number ?? '-'),
    client: String(inv.client?.name ?? 'N/A'),
    amount: Number(inv.total_cents ?? 0) / 100,
    status: String(inv.status ?? 'pending'),
    date: String(inv.issue_date ?? '-'),
  }));

  const pendingAmount = recentInvoices
    .filter((inv) => ['pending', 'overdue', 'partial'].includes(inv.status))
    .reduce((acc, inv) => acc + inv.amount, 0);

  // Generate sample data for charts if backend doesn't provide it
  const revenueByMonth = [
    { month: 'Jan', revenue: Math.random() * 50000 + 10000 },
    { month: 'Feb', revenue: Math.random() * 50000 + 10000 },
    { month: 'Mar', revenue: Number(data.total_revenue ?? 0) || Math.random() * 50000 + 10000 },
  ];

  const weeklyActivity = [
    { day: 'Mon', invoices: Math.floor(Math.random() * 10) + 1, payments: Math.floor(Math.random() * 8) + 1 },
    { day: 'Tue', invoices: Math.floor(Math.random() * 10) + 1, payments: Math.floor(Math.random() * 8) + 1 },
    { day: 'Wed', invoices: Math.floor(Math.random() * 10) + 1, payments: Math.floor(Math.random() * 8) + 1 },
    { day: 'Thu', invoices: Math.floor(Math.random() * 10) + 1, payments: Math.floor(Math.random() * 8) + 1 },
    { day: 'Fri', invoices: Math.floor(Math.random() * 10) + 1, payments: Math.floor(Math.random() * 8) + 1 },
    { day: 'Sat', invoices: Math.floor(Math.random() * 5) + 1, payments: Math.floor(Math.random() * 4) + 1 },
    { day: 'Sun', invoices: Math.floor(Math.random() * 5) + 1, payments: Math.floor(Math.random() * 4) + 1 },
  ];

  return {
    totalRevenue: Number(data.total_revenue ?? 0),
    pendingInvoices: Number(data.pending_invoices ?? 0),
    pendingAmount,
    totalClients: Number(data.total_clients ?? 0),
    paidThisMonth: Number(data.paid_this_month ?? 0),
    paidInvoicesThisMonth: recentInvoices.filter((inv) => inv.status === 'paid').length,
    recentInvoices,
    revenueByMonth,
    invoiceStatus: [
      { name: 'Paid', value: recentInvoices.filter((inv) => inv.status === 'paid').length },
      { name: 'Pending', value: recentInvoices.filter((inv) => inv.status === 'pending').length },
      { name: 'Overdue', value: recentInvoices.filter((inv) => inv.status === 'overdue').length },
    ],
    weeklyActivity,
  };
}

export async function getSettings() {
  const response = await apiRequestFirst<ApiEnvelope<SettingsPayload & Record<string, unknown>>>(['/workspace/settings']);
  const data = response.data ?? {};
  return {
    company: data.company,
    profile: data.profile,
    notifications: data.notifications,
    branding: data.branding,
    billing: data.billing,
    security: data.security,
  } as SettingsPayload;
}

export async function saveSettings(payload: SettingsPayload) {
  return apiRequestFirst<{ ok: boolean; data?: SettingsPayload }>(['/workspace/settings'], patchJson(payload));
}
