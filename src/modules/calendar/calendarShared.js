/**
 * calendarShared.js — sdílené drobnosti pro týdenní mřížku (Krok 4a–4c,
 * DESIGN.md §2.4/§6.4). Barvy bloků podle skutečných `EVENT_TYPES`
 * (domainConstants.js: visit/meeting/deadline/education/other) — DESIGN.md
 * §2.4 popisuje bohatší taxonomii (OSPOD/Soud/bio-rodina/krize/metodika),
 * která v datovém modelu neexistuje; namapováno na nejbližší sémantiku
 * z palety `shift.*` (tailwind.config.js), ne 1:1 podle názvu.
 */

export const EVENT_SHIFT_CLASS = {
  visit: 'bg-shift-visit',
  meeting: 'bg-shift-methodics',
  deadline: 'bg-shift-court',
  education: 'bg-shift-education',
  other: 'bg-ink-400',
};

export function formatTime(value) {
  const date = typeof value?.toDate === 'function' ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
}

export function formatDayHeader(date) {
  const weekday = date.toLocaleDateString('cs-CZ', { weekday: 'short' }).replace('.', '');
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)} ${date.getDate()}`;
}

export function formatWeekRange(weekStart) {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const sameMonth = weekStart.getMonth() === weekEnd.getMonth();
  const from = weekStart.toLocaleDateString('cs-CZ', { day: 'numeric', month: sameMonth ? undefined : 'numeric' });
  const to = weekEnd.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric', year: 'numeric' });
  return `${from}. – ${to}.`;
}

export function isToday(date) {
  return date.toDateString() === new Date().toDateString();
}

// DESIGN.md §2.4 — šrafovaný overlay pro nepublikovaný (draft) blok. Inline
// style, ne Tailwind třída: repeating-linear-gradient s přesnými hodnotami
// ze specifikace se nedá vyjádřit staticky přes utility třídu (stejná
// výjimka jako ProgressBar.jsx pro dynamickou šířku).
export const DRAFT_HATCH_STYLE = {
  backgroundImage:
    'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.15) 8px, rgba(255,255,255,0.15) 16px)',
};

const EVENT_MANAGEMENT_ROLES = ['superadmin', 'org_admin', 'vedouci_pobocky', 'teamleader'];

/**
 * Kdo smí publikovat koncept dané události — zrcadlí firestore.rules
 * `isManagement()`/`isKlicovaOsoba()` pro `events` (klíčová osoba jen svoje,
 * management celou organizaci). Batch zápis v `publishEvents()` by bez
 * tohoto filtru na klientu selhal na permission-denied pro cizí koncepty.
 */
export function canPublishEvent(role, uid, event) {
  if (role === 'klicova_osoba') return event.assignedTo === uid;
  return EVENT_MANAGEMENT_ROLES.includes(role);
}
