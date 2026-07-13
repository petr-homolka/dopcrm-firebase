/**
 * externalPermissions.js — katalog oprávnění externích účastníků + čisté
 * vyhodnocení grantů (2026-07-06, docs/domain/externi-ucastnici.md).
 *
 * Přidání dalšího oprávnění = jeden řádek v EXTERNAL_PERMISSIONS. Výchozí stav
 * je VŽDY zakázáno — povolení existuje jen jako aktivní grant. Citlivá
 * (`sensitive`) vyžadují doklad + tříkrokové schválení (viz externalGrants.js).
 *
 * Vyhodnocení je ČISTÉ (bez Firebase) — používá ho UI (gate) i service.
 */

export const EXTERNAL_PERMISSIONS = [
  { key: 'ViewDocuments', label: 'Prohlížet dokumenty', category: 'view', sensitive: false },
  { key: 'ViewTimeline', label: 'Časová osa', category: 'view', sensitive: false },
  { key: 'ViewPhotos', label: 'Fotografie', category: 'view', sensitive: false },
  { key: 'ViewSchool', label: 'Školní údaje', category: 'view', sensitive: false },
  { key: 'ViewMedical', label: 'Zdravotní údaje', category: 'view', sensitive: true },
  { key: 'ViewReports', label: 'Zprávy a reporty', category: 'view', sensitive: false },
  { key: 'ViewCalendar', label: 'Kalendář', category: 'view', sensitive: false },
  { key: 'UploadFiles', label: 'Nahrávat soubory', category: 'action', sensitive: false },
  { key: 'DownloadFiles', label: 'Stahovat soubory', category: 'action', sensitive: false },
  { key: 'SignDocuments', label: 'Podepisovat dokumenty', category: 'action', sensitive: true },
  { key: 'ChatWithCaseWorker', label: 'Chat s klíčovou osobou', category: 'chat', sensitive: false },
  { key: 'ChatWithFosterParent', label: 'Chat s pěstounem', category: 'chat', sensitive: true },
  { key: 'ChatWithChild', label: 'Chat s dítětem', category: 'chat', sensitive: true },
  { key: 'ReceiveNotifications', label: 'Dostávat oznámení', category: 'action', sensitive: false },
  { key: 'ConfirmVisits', label: 'Potvrzovat návštěvy', category: 'action', sensitive: false },
  { key: 'VideoCalls', label: 'Videohovory', category: 'chat', sensitive: true },
];

export const PERMISSION_CATEGORIES = { view: 'Zobrazení', chat: 'Komunikace', action: 'Akce' };

export function permissionMeta(key) {
  return EXTERNAL_PERMISSIONS.find((p) => p.key === key) ?? null;
}
export function permissionLabel(key) {
  return permissionMeta(key)?.label ?? key;
}
export function isSensitivePermission(key) {
  return !!permissionMeta(key)?.sensitive;
}

/** Typy dokladu pro citlivá oprávnění. */
export const REASON_TYPES = {
  court: 'Soudní rozhodnutí',
  ospod: 'Pokyn OSPOD',
  management: 'Rozhodnutí vedení organizace',
  therapy: 'Terapeutický plán',
  other: 'Jiný doložený podklad',
};

export const GRANT_STATUS = {
  requested: 'Požádáno',
  approved: 'Schváleno',
  active: 'Aktivní',
  revoked: 'Odvoláno',
  expired: 'Vypršelo',
};

// ── Čisté vyhodnocení (Timestamp | Date | ms → ms) ───────────────
function ms(v) {
  if (v == null) return null;
  if (typeof v === 'number') return v;
  if (typeof v.toMillis === 'function') return v.toMillis();
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.getTime();
}

/** ISO číslo týdne (pro lichá/sudá okna). */
function isoWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

/**
 * Je `now` uvnitř některého časového okna? Prázdná/žádná okna = bez omezení.
 * Okno: { type:'daily'|'weekly', days:[0..6 (0=Ne)], from:'HH:MM', to:'HH:MM',
 *         weekParity:'all'|'odd'|'even' }
 */
export function isWithinTimeWindows(windows, now = new Date()) {
  if (!windows || windows.length === 0) return true;
  const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const dow = now.getDay();
  return windows.some((w) => {
    if (w.type === 'weekly') {
      if (Array.isArray(w.days) && w.days.length && !w.days.includes(dow)) return false;
      if (w.weekParity && w.weekParity !== 'all') {
        const odd = isoWeek(now) % 2 === 1;
        if (w.weekParity === 'odd' && !odd) return false;
        if (w.weekParity === 'even' && odd) return false;
      }
    }
    return (!w.from || hhmm >= w.from) && (!w.to || hhmm <= w.to);
  });
}

/** Je grant PRÁVĚ TEĎ účinný? (stav active + platnost + časové okno) */
export function isGrantActive(grant, now = new Date()) {
  if (!grant || grant.status !== 'active') return false;
  const t = now.getTime();
  const from = ms(grant.validFrom);
  const to = ms(grant.validTo);
  if (from != null && t < from) return false;
  if (to != null && t > to) return false;
  return isWithinTimeWindows(grant.timeWindows, now);
}

/** Má EP dané oprávnění pro dané dítě právě teď? (nad seznamem jeho grantů) */
export function hasPermission(grants, permissionKey, childId, now = new Date()) {
  return (grants ?? []).some(
    (g) => g.permissionKey === permissionKey && g.childId === childId && isGrantActive(g, now)
  );
}
