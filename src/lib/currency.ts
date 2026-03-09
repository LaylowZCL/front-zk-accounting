export const DEFAULT_CURRENCY = 'MT';

export function normalizeCurrency(currency?: string | null): string {
  const normalized = String(currency ?? '').trim().toUpperCase();
  if (!normalized || normalized === 'MZN' || normalized === 'MT') return 'MT';
  return normalized;
}

export function formatMoney(amount: number, currency?: string | null, locale = 'pt-MZ'): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const code = normalizeCurrency(currency);
  const formatted = safeAmount.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${formatted}${code}`;
}
