/**
 * =============================================================================
 * FORMATTING UTILITIES
 * Currency: IDR (Rp) with dots as thousand separators
 * =============================================================================
 */

/** Format a number as Indonesian Rupiah: Rp 3.000.000 */
export function formatCurrency(amount: number): string {
  const formatted = Math.abs(amount)
    .toFixed(0)
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return amount < 0 ? `-Rp ${formatted}` : `Rp ${formatted}`;
}

/** Parse currency string back to number */
export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[Rp\s.]/g, '');
  return parseInt(cleaned, 10) || 0;
}

/** Format date for display: "15 Nov 2025" */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

/** Format date for input fields: YYYY-MM-DD */
export function formatDateForInput(dateString: string): string {
  return dateString.split('T')[0];
}

/** Get current date as YYYY-MM-DD */
export function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0];
}

/** Format percentage: "75.5%" */
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

/** Generate unique ID */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/** Get short month year: "Nov 2025" */
export function getShortMonthYear(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}
