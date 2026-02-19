export function formatCompactNumber(n: number): string {
  return Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
}

export function formatShortDate(date: Date): string {
  return Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
}

export function parseDate(input: Date | string | undefined): Date | null {
  if (!input) return null;
  const d = input instanceof Date ? input : new Date(input);
  return Number.isNaN(d.getTime()) ? null : d;
}
