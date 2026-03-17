export type CanonicalRole = 'owner' | 'counter' | 'employee' | 'platform_admin';

const ROLE_MAP: Record<string, CanonicalRole> = {
  owner: 'owner',
  subscriber_owner: 'owner',
  counter: 'counter',
  accountant: 'counter',
  subscriber_admin: 'counter',
  admin: 'counter',
  manager: 'counter',
  employee: 'employee',
  subscriber_member: 'employee',
  reader: 'employee',
  junior: 'employee',
  platform_admin: 'platform_admin',
};

export function normalizeRole(role?: string | null): CanonicalRole {
  if (!role) return 'employee';
  return ROLE_MAP[String(role).toLowerCase()] ?? 'employee';
}

export function normalizeRoles(roles?: string[] | null): CanonicalRole[] {
  if (!roles || roles.length === 0) return [];
  const mapped = roles.map((role) => normalizeRole(role));
  return Array.from(new Set(mapped));
}

export function isOwner(roles?: string[] | null): boolean {
  return normalizeRoles(roles).includes('owner');
}

export function isCounter(roles?: string[] | null): boolean {
  return normalizeRoles(roles).includes('counter');
}
