/**
 * timelineShared.js — sdílené drobnosti pro timeline tab detailu rodiny
 * (docs/domain/timeline.md §2): typy záznamů (ikona/barva), seskupení podle
 * dne a formátování data/času. Odděleno od komponent, aby žádný soubor
 * nepřekročil 300 řádků (CLAUDE.md).
 */

import { Footprints, StickyNote, Mic, Camera, FileText, GitCommitHorizontal } from 'lucide-react';

// `moduleClassName` = Tailwind bg třída modulu pro double-avatar overlay
// (DESIGN.md §5.5/§5.7, Krok 3c) — barva podle nejbližšího odpovídajícího
// modulu (visit→Rodiny, note/audio_note→Osa, photo/document→Dokumenty).
export const TIMELINE_TYPE_META = {
  visit: { label: 'Návštěva', icon: Footprints, tone: 'family', moduleClassName: 'bg-module-families' },
  note: { label: 'Poznámka', icon: StickyNote, tone: 'neutral', moduleClassName: 'bg-module-timeline' },
  audio_note: { label: 'Audio poznámka', icon: Mic, tone: 'family', moduleClassName: 'bg-module-timeline' },
  photo: { label: 'Foto', icon: Camera, tone: 'success', moduleClassName: 'bg-module-documents' },
  document: { label: 'Dokument', icon: FileText, tone: 'ospod', moduleClassName: 'bg-module-documents' },
  system: { label: 'Systém', icon: GitCommitHorizontal, tone: 'neutral', moduleClassName: 'bg-module-admin' },
};

// `labelKey` místo natvrdo textu (Krok 2, i18n) — tohle je datová konstanta,
// ne komponenta; t() překlad dělá až konzument (FosterFamilyTimelineTab.jsx).
export const TIMELINE_FILTERS = [
  { key: null, labelKey: 'timeline.filters.all' },
  { key: 'visit', labelKey: 'timeline.filters.visits' },
  { key: 'note', labelKey: 'timeline.filters.notes' },
  { key: 'document', labelKey: 'timeline.filters.documents' },
  { key: 'system', labelKey: 'timeline.filters.system' },
];

export function toDate(value) {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

// `t` se předává z volající komponenty (Krok 2, i18n) — tohle je plain funkce,
// ne komponenta/hook, nemůže si `useTranslation()` zavolat samo.
export function formatDayHeading(date, t) {
  if (!date) return '—';
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  if (isToday) return t('timeline.today');
  return date.toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function formatTime(date) {
  if (!date) return '';
  return date.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
}

/** Krátký popisek pro day-chip strip (DESIGN.md §5.7) — např. "St 25". */
export function formatDayChip(date) {
  if (!date) return '—';
  const weekday = date.toLocaleDateString('cs-CZ', { weekday: 'short' }).replace('.', '');
  const capitalized = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  return `${capitalized} ${date.getDate()}`;
}

/** Seskupí záznamy podle dne (occurredAt), zachovává pořadí (nejnovější první). */
export function groupByDay(entries) {
  const groups = [];
  let currentKey = null;
  for (const entry of entries) {
    const date = toDate(entry.occurredAt);
    const key = date ? date.toDateString() : '—';
    if (key !== currentKey) {
      groups.push({ key, date, items: [] });
      currentKey = key;
    }
    groups[groups.length - 1].items.push(entry);
  }
  return groups;
}

export const emptyEntryForm = { title: '', body: '', occurredAt: new Date().toISOString().slice(0, 10), childIds: [] };
