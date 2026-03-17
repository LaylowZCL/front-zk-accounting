import { apiRequest } from '@/lib/api';

type ApiEnvelope<T> = { ok?: boolean; data?: T };
type ApiList<T> = { ok?: boolean; data?: T[] };

export interface AdminDashboardData {
  totals?: {
    users?: number;
    active_companies?: number;
    active_subscriptions?: number;
    monthly_revenue?: number;
  };
  recent_activity?: Array<{
    description?: string;
    log_name?: string;
    event?: string;
    created_at?: string;
  }>;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  company: string;
  company_id?: number | null;
  is_platform_admin?: boolean;
  status: 'active' | 'blocked' | 'pending' | 'inactive';
  lastLogin: string;
  createdAt: string;
}

export interface AdminCompany {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: 'trial' | 'active' | 'suspended' | 'cancelled';
  users: number;
  invoicesThisMonth: number;
  mrr: number;
  createdAt: string;
}

export interface AdminPlan {
  id: number;
  code: string;
  name: string;
  description: string | null;
  price_cents: number;
  currency: string;
  billing_interval: 'monthly' | 'yearly';
  trial_days: number;
  is_active: boolean;
  features: string[] | null;
  metadata?: Record<string, unknown> | null;
}

export interface AdminAnalyticsData {
  revenueData?: Array<{ month: string; revenue: number; newCompanies: number }>;
  planDistribution?: Array<{ name: string; value: number }>;
  invoiceVolume?: Array<{ day: string; invoices: number }>;
}

export interface AdminTeamInvite {
  id: number;
  account_id?: number | null;
  email: string;
  role: string;
  status: string;
  invited_at?: string;
  created_at?: string;
}

export async function getAdminDashboard() {
  const response = await apiRequest<ApiEnvelope<AdminDashboardData>>('/admin/dashboard');
  return response.data ?? {};
}

export async function listAdminUsers() {
  const response = await apiRequest<ApiList<AdminUser>>('/admin/users');
  return response.data ?? [];
}

export async function createAdminUser(payload: { name: string; email: string; role: string; account_id?: number }) {
  return apiRequest<ApiEnvelope<AdminUser>>('/admin/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateAdminUser(id: string, payload: { status?: string; role?: string }) {
  return apiRequest<{ ok: boolean }>(`/admin/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function listAdminCompanies() {
  const response = await apiRequest<ApiList<AdminCompany>>('/admin/companies');
  return response.data ?? [];
}

export async function updateAdminCompany(id: string, payload: { status?: string; plan?: string }) {
  return apiRequest<{ ok: boolean }>(`/admin/companies/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function listAdminPlans() {
  const response = await apiRequest<ApiList<AdminPlan>>('/admin/packages');
  return response.data ?? [];
}

export async function createAdminPlan(payload: {
  code: string;
  name: string;
  description?: string | null;
  price_cents: number;
  currency: string;
  billing_interval: 'monthly' | 'yearly';
  trial_days?: number;
  is_active?: boolean;
  features?: string[] | null;
  metadata?: Record<string, unknown> | null;
}) {
  return apiRequest<{ ok: boolean }>('/admin/plans', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateAdminPlan(
  id: number,
  payload: Partial<{
    name: string;
    description: string | null;
    price_cents: number;
    billing_interval: 'monthly' | 'yearly';
    trial_days: number;
    is_active: boolean;
    features: string[] | null;
    metadata: Record<string, unknown> | null;
  }>
) {
  return apiRequest<{ ok: boolean }>(`/admin/plans/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function getAdminAnalytics() {
  const response = await apiRequest<ApiEnvelope<AdminAnalyticsData>>('/admin/analytics');
  return response.data ?? {};
}

export async function listAdminTeamInvites() {
  const response = await apiRequest<ApiList<AdminTeamInvite>>('/admin/team');
  return response.data ?? [];
}

export interface AdminSettingsPayload {
  general?: {
    platform_name?: string;
    support_email?: string;
    platform_description?: string;
    default_currency?: string;
    default_timezone?: string;
  };
  email?: {
    smtp_host?: string;
    smtp_port?: string;
    smtp_user?: string;
    from_name?: string;
    from_email?: string;
  };
  notifications?: {
    new_signups?: boolean;
    failed_payments?: boolean;
    support_tickets?: boolean;
    system_alerts?: boolean;
    weekly_report?: boolean;
    monthly_report?: boolean;
  };
  security?: {
    two_factor_required?: boolean;
    session_timeout?: string;
    max_login_attempts?: string;
    password_min_length?: string;
  };
  appearance?: {
    primary_color?: string;
    logo_url?: string;
    favicon_url?: string;
  };
  database?: {
    status?: string;
    host?: string;
    name?: string;
    size?: string;
  };
}

export async function getAdminSettings() {
  const response = await apiRequest<ApiEnvelope<AdminSettingsPayload>>('/admin/settings');
  return response.data ?? {};
}

export async function updateAdminSettings(payload: Partial<AdminSettingsPayload>) {
  return apiRequest<ApiEnvelope<AdminSettingsPayload>>('/admin/settings', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}
