/**
 * org/codelists.js — číselníky organizace (2026-07-06, Lidl v4 bod 3:
 * „rozevírací menu nesmí mít konečný počet možností — v administraci musí
 * jít definovat vlastní"). První číselník: typy kalendářních událostí.
 *
 * `organizations/{orgId}/codelists/{listId}` — doc s polem `items`
 * (map key→label, max ~20 položek dle CLAUDE.md pravidla velikosti polí).
 * Vestavěné hodnoty (EVENT_TYPES z domainConstants) se NEukládají — merge
 * probíhá až při čtení, takže vestavěný číselník jde časem rozšířit v kódu
 * bez migrace. Klíč vlastní položky = slug s prefixem `x-` (nekoliduje
 * s vestavěnými klíči a na první pohled je vidět, že jde o vlastní typ).
 */

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import { EVENT_TYPES } from '../../shared/domainConstants.js';
import { meta } from './shared.js';

const MAX_CUSTOM_ITEMS = 20;

function eventTypesDoc(organizationId) {
  return doc(db, 'organizations', organizationId, 'codelists', 'eventTypes');
}

function slugify(label) {
  return `x-${label.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40)}`;
}

/** Vlastní typy událostí organizace — `{ key: label }` (bez vestavěných). */
export async function getCustomEventTypes(organizationId) {
  const snap = await getDoc(eventTypesDoc(organizationId));
  return snap.exists() ? (snap.data().items ?? {}) : {};
}

/** Vestavěné + vlastní typy — pro selecty. */
export async function getEventTypes(organizationId) {
  const custom = await getCustomEventTypes(organizationId);
  return { ...EVENT_TYPES, ...custom };
}

/** Přidá vlastní typ; vrací jeho klíč. Duplicitní label vrátí existující klíč. */
export async function addEventType(organizationId, label) {
  const clean = label.trim();
  if (!clean) throw new Error('Název typu nesmí být prázdný.');
  const custom = await getCustomEventTypes(organizationId);
  const existing = Object.entries(custom).find(([, l]) => l.toLowerCase() === clean.toLowerCase());
  if (existing) return existing[0];
  if (Object.keys(custom).length >= MAX_CUSTOM_ITEMS) {
    throw new Error(`Vlastních typů může být nejvýše ${MAX_CUSTOM_ITEMS}.`);
  }
  const key = slugify(clean) || `x-typ-${Object.keys(custom).length + 1}`;
  await setDoc(eventTypesDoc(organizationId), { items: { ...custom, [key]: clean }, ...meta() }, { merge: true });
  return key;
}

/** Odebere vlastní typ (vestavěné odebrat nejdou). */
export async function removeEventType(organizationId, key) {
  const custom = await getCustomEventTypes(organizationId);
  if (!(key in custom)) return;
  const next = { ...custom };
  delete next[key];
  await setDoc(eventTypesDoc(organizationId), { items: next, ...meta() }, { merge: false });
}
