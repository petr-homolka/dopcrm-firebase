/**
 * org/events.js — kalendářní události organizace (audit nálezu #5, 2026-07-03).
 *
 * `organizations/{orgId}/events/{eventId}` — PODKOLEKCE organizace, ne
 * top-level kolekce s denormalizovaným `organizationId` polem jako
 * `foster_families`/`children`. Cesta podkolekce sama definuje vlastnickou
 * organizaci, takže odpadá denormalizace i riziko „list dotaz vs. rules pole"
 * (viz [[crm-firestore-list-query-rule-pole]] — objeveno právě na top-level
 * kolekcích filtrovaných přes pole, které rules zároveň kontrolují).
 *
 * Vazby (CLAUDE.md „Pravidla datového modelu"):
 *   - `assignedTo`     — uid odpovědné klíčové osoby/zaměstnance
 *   - `fosterFamilyId` — volitelná vazba na konkrétní rodinu (org-wide
 *                        události jako porada rodinu nemají)
 *   - `subjectRefs`    — „záznam týkající se více osob se ukládá JEDNOU
 *                        s polem subjectRefs": pole { type: 'family'|'child'|
 *                        'user', id } pro události vázané na víc entit najednou
 *                        (např. návštěva rodiny + konkrétní dítě přítomné při ní)
 */

import {
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, startAfter,
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { meta, createMeta, SUBCOLLECTION_PAGE_SIZE } from './shared.js';

function eventsCol(organizationId) {
  return collection(db, 'organizations', organizationId, 'events');
}

/**
 * Události v časovém rozmezí `[from, to]` (Date/Timestamp), vzestupně dle
 * `start`. Vrací `{ items, lastDoc }` — `lastDoc` je cursor pro další
 * stránku (`null` = konec), viz audit nálezu #7.
 */
export async function listEventsInRange(organizationId, { from, to }, cursor = null) {
  const constraints = [
    where('start', '>=', from),
    where('start', '<=', to),
    orderBy('start', 'asc'),
    limit(SUBCOLLECTION_PAGE_SIZE),
  ];
  if (cursor) constraints.push(startAfter(cursor));
  const snap = await getDocs(query(eventsCol(organizationId), ...constraints));
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const lastDoc = snap.docs.length === SUBCOLLECTION_PAGE_SIZE ? snap.docs[snap.docs.length - 1] : null;
  return { items, lastDoc };
}

export async function createEvent(organizationId, {
  title, type = 'other', start, end = null, allDay = false,
  location = '', note = '', assignedTo, fosterFamilyId = null, subjectRefs = [],
}) {
  const ref = await addDoc(eventsCol(organizationId), {
    title,
    type,         // viz EVENT_TYPES v shared/domainConstants.js
    start,
    end: end ?? start,
    allDay,
    location,
    note,
    assignedTo,
    fosterFamilyId,
    subjectRefs,
    status: 'scheduled', // 'scheduled' | 'done' | 'cancelled'
    ...createMeta(),
  });
  return ref.id;
}

export async function updateEvent(organizationId, eventId, patch) {
  await updateDoc(doc(db, 'organizations', organizationId, 'events', eventId), { ...patch, ...meta() });
}

export async function deleteEvent(organizationId, eventId) {
  await deleteDoc(doc(db, 'organizations', organizationId, 'events', eventId));
}
