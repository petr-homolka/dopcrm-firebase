/**
 * dataService.js — univerzální čtení dat z tenants/{tenantId}/data_objects
 *
 * TENANT MODEL (viz services/db.js):
 *   Všechna data klientů VÝHRADNĚ v: tenants/{tenantId}/data_objects/{docId}.
 *   tenantId se NIKDY nezadává natvrdo — vždy se čte z aktuálního auth
 *   profilu přes currentTenantId() (services/auth.js), což odpovídá
 *   poli tenantId v Firestore dokumentu user_roles/{uid}.
 *
 * Datový model data_objects (MVP konvence):
 *   { type: 'family' | 'child' | ..., name, status, createdAt, ... }
 *
 * Pozn. k řazení:
 *   Firestore vyžaduje SLOŽENÝ INDEX pro dotaz, který kombinuje
 *   `where('type', '==', …)` s `orderBy(jiné_pole)` — bez ručního vytvoření
 *   indexu v konzoli by dotaz padal na "The query requires an index".
 *   Proto se filtruje na serveru jen přes jediné pole (`type`, automaticky
 *   indexované) a řazení/limit se dělá až po načtení, na klientovi.
 *   Pro MVP rozsah dat (desítky až nízké stovky záznamů na tenant) je to
 *   v pořádku; při větším objemu lze doplnit composite index a přepnout
 *   zpět na orderBy() na serveru.
 */

import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase.js';
import { currentTenantId } from './auth.js';

/** Převede hodnotu pole (Firestore Timestamp / Date / string / number) na číslo pro porovnání. */
function toComparable(value) {
  if (value == null) return 0;
  if (typeof value.toMillis === 'function') return value.toMillis();
  if (value instanceof Date) return value.getTime();
  return value;
}

/**
 * Načte data_objects aktuálního tenantu.
 *
 * @param {object} options
 * @param {string} [options.type]          - filtr na pole `type` (např. 'family', 'child')
 * @param {string} [options.orderByField]  - pole pro řazení, řazeno na klientovi (např. 'createdAt')
 * @param {'asc'|'desc'} [options.orderDirection] - směr řazení (default 'desc')
 * @param {number} [options.limitCount]    - maximální počet vrácených dokumentů (po řazení)
 * @returns {Promise<Array<object>>} dokumenty vč. `id`
 */
export async function fetchDataObjects({
  type,
  orderByField,
  orderDirection = 'desc',
  limitCount,
} = {}) {
  const tenantId = currentTenantId();
  if (!tenantId) {
    throw new Error(
      '[dataService] currentTenantId() je null — uživatel nemá přiřazený tenantId v user_roles/{uid}.'
    );
  }

  const col = collection(db, 'tenants', tenantId, 'data_objects');
  const q = type ? query(col, where('type', '==', type)) : col;

  const snap = await getDocs(q);
  let docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  if (orderByField) {
    const dir = orderDirection === 'asc' ? 1 : -1;
    docs = docs.slice().sort((a, b) => {
      const av = toComparable(a[orderByField]);
      const bv = toComparable(b[orderByField]);
      if (av < bv) return -dir;
      if (av > bv) return dir;
      return 0;
    });
  }

  if (limitCount) docs = docs.slice(0, limitCount);

  return docs;
}

/** Pohodlná zkratka — všechny rodiny (type='family') aktuálního tenantu. */
export async function fetchFamilies(options = {}) {
  return fetchDataObjects({ type: 'family', ...options });
}

/** Pohodlná zkratka — všechny děti (type='child') aktuálního tenantu. */
export async function fetchChildren(options = {}) {
  return fetchDataObjects({ type: 'child', ...options });
}
