/**
 * childDetailShared.js — sdílené drobnosti pro rozštěpené taby ChildDetailPage.jsx
 * (Tailwind migrace 2026-07-02): formátovací helpery, výchozí tvary formulářů
 * a společné Tailwind třídy pro pole formulářů/labely v modálech.
 */

export function formatDate(value) {
  if (!value) return '—';
  const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('cs-CZ');
}

export function addressLabel(a) {
  if (!a) return null;
  return [a.street, a.city, a.zip].filter(Boolean).join(', ') || null;
}

export const fieldClass =
  'w-full rounded-xl bg-surface-muted px-3.5 py-2.5 text-sm text-ink-800 placeholder:text-ink-400 ' +
  'focus:outline-none focus:ring-2 focus:ring-brand-600 disabled:opacity-50';
export const labelClass = 'mb-1.5 block text-sm font-medium text-ink-700';

export const emptyRelForm = { name: '', rc: '', rel: '', phone: '', email: '', note: '' };
export const emptySocialForm = { name: '', vztah: '', phone: '', email: '', note: '' };
export const emptyAddressForm = { street: '', city: '', zip: '' };
export const emptySchoolForm = { nazev: '', adresa: '', telefon: '', email: '', tridniUcitel: '', rocnik: '' };
export const emptyOspodForm = { nazev: '', osoba: '' };
export const emptyCourtForm = { spisZnacka: '', soudNazev: '', soudAdresa: '', kontaktniOsoba: '' };
export const emptyVerdictForm = { datum: '', popis: '' };
export const emptyDocsForm = { idCardNumber: '', idCardValidUntil: '', passportNumber: '', passportValidUntil: '' };
export const emptyFosterHistForm = { name: '', from: '', to: '', note: '' };

/** Mapování relLegalColor() (success/info/default/warning) na tóny sdíleného Badge. */
export function legalBadgeTone(colorKey) {
  if (colorKey === 'success') return 'success';
  if (colorKey === 'info') return 'ospod';
  if (colorKey === 'warning') return 'warning';
  return 'neutral';
}
