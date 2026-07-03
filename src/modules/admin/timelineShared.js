/**
 * timelineShared.js — sdílené drobnosti pro timeline tab detailu rodiny
 * (docs/domain/timeline.md §2): typy záznamů (ikona/barva), seskupení podle
 * dne a formátování data/času. Odděleno od komponent, aby žádný soubor
 * nepřekročil 300 řádků (CLAUDE.md).
 */

import { Footprints, StickyNote, Mic, Camera, FileText, GitCommitHorizontal } from 'lucide-react';

export const TIMELINE_TYPE_META = {
  visit: { label: 'Návštěva', icon: Footprints, tone: 'family' },
  note: { label: 'Poznámka', icon: StickyNote, tone: 'neutral' },
  audio_note: { label: 'Audio poznámka', icon: Mic, tone: 'family' },
  photo: { label: 'Foto', icon: Camera, tone: 'success' },
  document: { label: 'Dokument', icon: FileText, tone: 'ospod' },
  system: { label: 'Systém', icon: GitCommitHorizontal, tone: 'neutral' },
};

export const TIMELINE_FILTERS = [
  { key: null, label: 'Vše' },
  { key: 'visit', label: 'Návštěvy' },
  { key: 'note', label: 'Poznámky' },
  { key: 'document', label: 'Dokumenty' },
  { key: 'system', label: 'Systém' },
];

export function toDate(value) {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatDayHeading(date) {
  if (!date) return '—';
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  if (isToday) return 'Dnes';
  return date.toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function formatTime(date) {
  if (!date) return '';
  return date.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
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
