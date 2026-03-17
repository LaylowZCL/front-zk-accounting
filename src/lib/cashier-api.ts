import { apiRequest } from '@/lib/api';

export interface CashierSubscription {
  id: string;
  status: 'trial' | 'active' | 'cancelled' | 'expired' | 'past_due';
  plan_id: number;
  plan_name: string;
  trial_ends_at?: string;
  current_period_start: string;
  current_period_end: string;
  amount: number;
  currency: string;
  billing_interval: 'monthly' | 'yearly';
  created_at: string;
  updated_at: string;
}

export interface CashierPlan {
  id: number;
  name: string;
  description?: string;
  price_cents: number;
  currency: string;
  billing_interval: 'monthly' | 'yearly';
  trial_days: number;
  features: string[];
  is_active: boolean;
}

export interface CashierUsage {
  limits: {
    invoices: { used: number; limit: number };
    clients: { used: number; limit: number };
    team_members: { used: number; limit: number };
    documents: { used: number; limit: number };
  };
  current_period: {
    start: string;
    end: string;
  };
}

// Get current subscription status
export async function getCashierSubscription() {
  return apiRequest<{ ok: boolean; data: CashierSubscription }>('/cashier/subscription');
}

// Get available plans
export async function getCashierPlans() {
  return apiRequest<{ ok: boolean; data: CashierPlan[] }>('/cashier/plans');
}

// Get usage metrics
export async function getCashierUsage() {
  return apiRequest<{ ok: boolean; data: CashierUsage }>('/cashier/usage');
}

// Start checkout for a plan
export async function startCashierCheckout(planId: number, paymentType: 'REFERENCE' | 'MPESA' | 'EMOLA' = 'REFERENCE') {
  return apiRequest<{ ok: boolean; data: { checkout_url: string; transaction_id: string } }>('/cashier/checkout', {
    method: 'POST',
    body: JSON.stringify({
      plan_id: planId,
      payment_type: paymentType,
    }),
  });
}

// Cancel subscription
export async function cancelCashierSubscription(reason?: string) {
  return apiRequest<{ ok: boolean; data: CashierSubscription }>('/cashier/subscription/cancel', {
    method: 'POST',
    body: JSON.stringify({
      reason: reason || 'User requested cancellation',
    }),
  });
}

// Get trial status specifically
export async function getCashierTrialStatus() {
  return apiRequest<{ ok: boolean; data: { 
    is_active: boolean; 
    days_remaining: number; 
    trial_ends_at: string; 
    can_extend: boolean; 
    extensions_used: number; 
  } }>('/cashier/trial-status');
}
