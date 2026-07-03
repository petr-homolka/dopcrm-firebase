/**
 * slugUtils.js — validace a normalizace slugu organizace (Krok 1, 2026-07-03).
 * Čistě klientská logika (bez Firebase) — uniqueness řeší `org_slugs`
 * kolekce v `src/services/org/organizations.js` + firestore.rules.
 */

export const RESERVED_SLUGS = new Set([
  'admin', 'api', 'www', 'app', 'registrace', 'login', 'superadmin',
  'static', 'assets', 'public', 'help', 'support', 'docs', 'blog',
  'mail', 'email', 'ftp', 'root', 'null', 'undefined', 'org', 'organizace',
  'nastaveni', 'dashboard', 'firebase', 'system', 'test', 'demo',
]);

export const SLUG_MIN_LENGTH = 3;
export const SLUG_MAX_LENGTH = 40;
const SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function stripDiacritics(input) {
  return input.normalize('NFD').replace(new RegExp('[\\u0300-\\u036f]', 'g'), '');
}

/** Živá sanitizace během psaní — zachovává rozepsanou koncovou pomlčku. */
export function sanitizeSlugInput(input) {
  return stripDiacritics(input || '')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .slice(0, SLUG_MAX_LENGTH);
}

/** Agresivní varianta (ořízne okrajové pomlčky) — pro auto-návrh z názvu organizace. */
export function slugify(input) {
  return sanitizeSlugInput(input).replace(/^-+|-+$/g, '');
}

/** @returns {string|null} chybová hláška, nebo null když je formát v pořádku. */
export function validateSlugFormat(slug) {
  if (!slug) return 'Zadejte adresu.';
  if (slug.length < SLUG_MIN_LENGTH) return `Adresa musí mít alespoň ${SLUG_MIN_LENGTH} znaky.`;
  if (slug.length > SLUG_MAX_LENGTH) return `Adresa smí mít nejvýš ${SLUG_MAX_LENGTH} znaků.`;
  if (!SLUG_REGEX.test(slug)) return 'Jen malá písmena, číslice a pomlčky (ne na začátku/konci, ne dvě za sebou).';
  if (RESERVED_SLUGS.has(slug)) return 'Tato adresa je rezervovaná systémem — zvolte jinou.';
  return null;
}
