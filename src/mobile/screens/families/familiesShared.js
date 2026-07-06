/**
 * familiesShared.js — sdílené drobnosti obrazovky Rodiny (Lidl v4, 2026-07-06,
 * bod 5 zpětné vazby: seskupování + bohatší řádky + rychlejší načtení).
 *
 * Session cache: poslední načtený seznam per org+role drží modul v paměti —
 * návrat na tab Rodiny vykreslí okamžitě starý stav a na pozadí se dotáhne
 * čerstvý (stale-while-revalidate). Není to perzistence (F5 = čistý stav),
 * jen lék na „stránka se dlouho načítá" při každém přepnutí tabu.
 */

export const GROUP_OPTIONS = [
  { value: 'abc', label: 'Abecedně' },
  { value: 'city', label: 'Podle města' },
  { value: 'care', label: 'Podle druhu PP' },
  { value: 'visit', label: 'Podle poslední návštěvy' },
];

export const GROUP_STORAGE_KEY = 'doprovazeni:familiesGroupBy';

/** „Písek, Budějovická 55" → „Písek"; bez čárky vrací celou adresu. */
export function cityFromAddress(address) {
  if (!address) return '';
  return address.split(',')[0].trim();
}

export function toDateSafe(value) {
  if (!value) return null;
  const d = typeof value.toDate === 'function' ? value.toDate() : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function daysSince(date) {
  return Math.floor((Date.now() - date.getTime()) / 86400000);
}

/** Popisek poslední návštěvy pro pravý sloupec řádku. */
export function lastVisitInfo(family) {
  const last = toDateSafe(family.lastVisitAt);
  if (!last) return { label: 'bez návštěvy', days: null, overdue: true };
  const days = daysSince(last);
  return { label: days === 0 ? 'dnes' : `před ${days} dny`, days, overdue: days > 45 };
}

/** Rozdělí seznam do pojmenovaných skupin dle zvoleného seskupení. */
export function groupFamilies(families, groupBy, careLabel) {
  const sorted = [...families].sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '', 'cs'));
  if (groupBy === 'abc') return [{ title: null, items: sorted }];

  if (groupBy === 'visit') {
    const withInfo = sorted.map((f) => ({ f, info: lastVisitInfo(f) }));
    const overdue = withInfo.filter((x) => x.info.overdue).sort((a, b) => (b.info.days ?? Infinity) - (a.info.days ?? Infinity));
    const fresh = withInfo.filter((x) => !x.info.overdue).sort((a, b) => (b.info.days ?? 0) - (a.info.days ?? 0));
    return [
      { title: 'Čeká na návštěvu (přes 45 dní)', items: overdue.map((x) => x.f) },
      { title: 'Navštíveno nedávno', items: fresh.map((x) => x.f) },
    ].filter((g) => g.items.length > 0);
  }

  const keyFn = groupBy === 'city'
    ? (f) => cityFromAddress(f.address) || 'Bez adresy'
    : (f) => careLabel(f.careType) || 'Bez druhu péče';
  const map = new Map();
  sorted.forEach((f) => {
    const key = keyFn(f);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(f);
  });
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0], 'cs'))
    .map(([title, items]) => ({ title, items }));
}

// ── session cache (stale-while-revalidate) ──────────────────────
const cache = new Map();

export function cacheGet(key) {
  return cache.get(key) ?? null;
}

export function cacheSet(key, value) {
  cache.set(key, value);
}
