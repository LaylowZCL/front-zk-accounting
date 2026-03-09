const API_BASE_URL_ENV = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, '');

export type ApiUser = {
  id: number;
  name: string;
  email: string;
  account_id: number | null;
  is_platform_admin?: boolean;
  roles?: string[];
  permissions?: string[];
};

export type Plan = {
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
};

export type ApiSession = {
  id: string;
  device: string;
  location: string;
  ip: string;
  last_active: string;
  current: boolean;
};

type SecurityEvent = {
  id: string;
  event: string;
  date: string;
  status: 'success' | 'warning';
};

type SecurityOverviewResponse = {
  ok?: boolean;
  data?: {
    sessions?: Array<{
      session_id?: string;
      device_name?: string | null;
      ip_address?: string | null;
      last_seen_at?: string | null;
      is_current?: boolean | null;
    }>;
    events?: Array<{
      id?: number | string;
      description?: string;
      created_at?: string;
    }>;
  };
};

type ValidationErrors = Record<string, string[]>;

export class ApiError extends Error {
  status: number;
  code?: string;
  errors?: ValidationErrors;
  endpoint?: string;

  constructor(message: string, status: number, code?: string, errors?: ValidationErrors, endpoint?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.errors = errors;
    this.endpoint = endpoint;
  }
}

const TOKEN_KEY = 'bb_auth_token';
const USER_KEY = 'bb_auth_user';
const SESSION_ID_KEY = 'bb_session_id';

let unauthorizedHandler: (() => void) | null = null;
let resolvedApiBase: string | null = API_BASE_URL_ENV ?? null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

function getSessionId() {
  let sid = localStorage.getItem(SESSION_ID_KEY);
  if (!sid) {
    sid = crypto.randomUUID();
    localStorage.setItem(SESSION_ID_KEY, sid);
  }
  return sid;
}

function getDeviceId() {
  return btoa(`${navigator.userAgent}|${navigator.platform}|${navigator.language}`);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function setUser(user: ApiUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser(): ApiUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ApiUser;
  } catch {
    return null;
  }
}

function extractMessage(data: unknown, fallback = 'Request failed') {
  if (typeof data !== 'object' || data === null) return fallback;
  const asRecord = data as Record<string, unknown>;
  return (
    (typeof asRecord.message === 'string' && asRecord.message) ||
    (typeof asRecord.error === 'string' && asRecord.error) ||
    fallback
  );
}

function toLocalAlias(url: string) {
  if (url.includes('://localhost')) return url.replace('://localhost', '://127.0.0.1');
  if (url.includes('://127.0.0.1')) return url.replace('://127.0.0.1', '://localhost');
  return null;
}

function normalizeAndDedupe(candidates: string[]) {
  const set = new Set<string>();
  for (const candidate of candidates) {
    const normalized = candidate.replace(/\/+$/, '');
    if (normalized) set.add(normalized);
  }
  return Array.from(set);
}

function getApiBaseCandidates() {
  if (API_BASE_URL_ENV) {
    // If it's a relative URL (starts with /), use it directly without alternatives
    if (API_BASE_URL_ENV.startsWith('/')) {
      return [API_BASE_URL_ENV.replace(/\/+$/, '')];
    }
    
    const parsed = new URL(API_BASE_URL_ENV);
    const pathname = parsed.pathname.replace(/\/+$/, '');
    const baseHost = `${parsed.protocol}//${parsed.host}`;
    const variants = [pathname];

    if (pathname.endsWith('/api/v1')) {
      variants.push(pathname.slice(0, -3)); // /api
      variants.push(pathname.slice(0, -7)); // (root or parent)
    } else if (pathname.endsWith('/api')) {
      variants.push(pathname.slice(0, -4)); // (root or parent)
    }

    const localAlias = toLocalAlias(API_BASE_URL_ENV);
    const envCandidates = variants.map((v) => `${baseHost}${v}`);

    if ((parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost') && (parsed.port === '8888' || parsed.port === '8000')) {
      const alternatePort = parsed.port === '8888' ? '8000' : '8888';
      const altHost = `${parsed.protocol}//${parsed.hostname}:${alternatePort}`;
      envCandidates.push(...variants.map((v) => `${altHost}${v}`));
    }

    if (localAlias) {
      const parsedAlias = new URL(localAlias);
      const aliasHost = `${parsedAlias.protocol}//${parsedAlias.host}`;
      variants.push(parsedAlias.pathname.replace(/\/+$/, ''));
      return normalizeAndDedupe([
        ...envCandidates,
        ...variants.map((v) => `${aliasHost}${v}`),
      ]);
    }

    return normalizeAndDedupe(envCandidates);
  }

  const isLocalHost =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '';
  const preferredHost = isLocalHost ? '127.0.0.1' : window.location.hostname;
  const hosts = normalizeAndDedupe([preferredHost, window.location.hostname, '127.0.0.1', 'localhost']);
  const ports = [8000, 8888];
  const apiPrefixes = ['/api/v1', '/api', ''];
  const candidates: string[] = [];

  for (const host of hosts) {
    for (const port of ports) {
      for (const prefix of apiPrefixes) {
        const normalizedPrefix = prefix.replace(/\/+$/, '');
        candidates.push(`http://${host}:${port}${normalizedPrefix}`);
      }
    }
  }

  return normalizeAndDedupe(candidates);
}

function trimText(text: string, max = 180) {
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

async function parseResponsePayload(response: Response) {
  const raw = await response.text().catch(() => '');
  if (!raw) return { data: {}, rawText: '' };
  try {
    return { data: JSON.parse(raw), rawText: raw };
  } catch {
    return { data: {}, rawText: raw };
  }
}

function buildErrorMessage(status: number, path: string, data: unknown, rawText: string) {
  const base = extractMessage(data, '').trim();
  if (base) return base;
  if (rawText.trim()) return `HTTP ${status} on ${path}: ${trimText(rawText.trim())}`;
  return `HTTP ${status} on ${path}`;
}

function extractValidationErrors(data: unknown): ValidationErrors | undefined {
  if (typeof data !== 'object' || data === null) return undefined;
  const maybeErrors = (data as Record<string, unknown>).errors;
  if (!maybeErrors || typeof maybeErrors !== 'object') return undefined;
  return maybeErrors as ValidationErrors;
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers ?? {});
  if (!headers.has('Content-Type') && init.body) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  headers.set('X-Session-Id', getSessionId());
  headers.set('X-Device-Id', getDeviceId());
  headers.set('X-Device-Name', `${navigator.platform} - ${navigator.language}`);

  const candidates = resolvedApiBase ? [resolvedApiBase] : getApiBaseCandidates();
  let lastError: unknown;

  for (const baseUrl of candidates) {
    try {
      const response = await fetch(`${baseUrl}${path}`, { ...init, headers });
      const { data, rawText } = await parseResponsePayload(response);

      if (!response.ok) {
        if (response.status === 401) {
          clearAuth();
          unauthorizedHandler?.();
        }

        const apiError = new ApiError(
          buildErrorMessage(response.status, path, data, rawText),
          response.status,
          typeof (data as Record<string, unknown>)?.code === 'string' ? (data as Record<string, string>).code : undefined,
          extractValidationErrors(data),
          `${baseUrl}${path}`
        );
        lastError = apiError;

        // On 404/405 keep trying other base candidates; for other errors fail fast.
        if (response.status !== 404 && response.status !== 405) {
          throw apiError;
        }
        continue;
      }

      resolvedApiBase = baseUrl;
      return data as T;
    } catch (error) {
      lastError = error;
      // Keep trying other base candidates for network/base mismatch issues.
    }
  }

  throw lastError instanceof Error ? lastError : new Error(`Request failed for ${path}`);
}

export async function apiRequestFirst<T>(paths: string[], init: RequestInit = {}): Promise<T> {
  let lastError: unknown;
  for (const path of paths) {
    try {
      return await apiRequest<T>(path, init);
    } catch (error) {
      lastError = error;
      const apiError = error as ApiError;
      if (!(apiError instanceof ApiError) || (apiError.status !== 404 && apiError.status !== 405)) {
        throw error;
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Request failed');
}

export async function authRegister(payload: {
  name: string;
  email: string;
  password: string;
  company_name: string;
}) {
  return apiRequest<{ ok: boolean; token: string; user: ApiUser }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function authLogin(payload: { email: string; password: string }) {
  return apiRequest<{ ok: boolean; token: string; user: ApiUser }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function authMe() {
  const response = await apiRequestFirst<{ ok?: boolean; data?: ApiUser; user?: ApiUser }>(['/auth/me', '/me', '/user']);
  return response.data ?? response.user ?? (response as unknown as ApiUser);
}

export async function authLogout() {
  await apiRequestFirst<{ ok: boolean }>(['/auth/logout', '/logout'], { method: 'POST' });
}

export async function changePassword(payload: { current_password: string; password: string; password_confirmation: string }) {
  await apiRequestFirst<{ ok: boolean }>(['/security/change-password'], {
    method: 'POST',
    body: JSON.stringify({
      currentPassword: payload.current_password,
      newPassword: payload.password,
    }),
  });
}

export async function listSessions() {
  const response = await apiRequestFirst<SecurityOverviewResponse>(['/security']);
  const sessions = response.data?.sessions ?? [];
  return sessions.map((session) => ({
    id: session.session_id ?? '',
    device: session.device_name || 'Unknown device',
    location: session.ip_address || 'Unknown location',
    ip: session.ip_address || '',
    last_active: session.last_seen_at || '',
    current: Boolean(session.is_current),
  }));
}

export async function listSecurityEvents(): Promise<SecurityEvent[]> {
  const response = await apiRequestFirst<SecurityOverviewResponse>(['/security']);
  const events = response.data?.events ?? [];
  return events.map((event) => ({
    id: String(event.id ?? crypto.randomUUID()),
    event: event.description || 'Security event',
    date: event.created_at?.slice(0, 10) || '',
    status: /failed|error|invalid|denied/i.test(event.description ?? '') ? 'warning' : 'success',
  }));
}

export async function revokeSession(sessionId: string) {
  await apiRequestFirst<{ ok: boolean }>([`/security/sessions/${sessionId}/revoke`], { method: 'POST' });
}

export async function revokeOtherSessions() {
  const sessions = await listSessions();
  await Promise.all(
    sessions
      .filter((session) => !session.current)
      .map((session) => revokeSession(session.id))
  );
}

export async function fetchPlans() {
  const response = await apiRequest<{ ok: boolean; data: Plan[] }>('/billing/plans');
  return response.data;
}

export async function startCheckout(payload: { plan_id: number; payment_type: 'REFERENCE' | 'MPESA' | 'EMOLA'; mobile?: string }) {
  return apiRequest<{ ok: boolean; data: { checkout_url: string; transaction_id: string } }>('/billing/checkout', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
