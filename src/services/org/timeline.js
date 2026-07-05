/**
 * org/timeline.js — chronologický deník rodiny (docs/domain/timeline.md).
 * Podkolekce `foster_families/{familyId}/timeline`. Immutabilita POZASTAVENA
 * 2026-07-05 (do odvolání, na žádost produktového vlastníka) — `body`/
 * `title`/`occurredAt`/`subjectRefs` se teď smí editovat přes
 * `updateTimelineEntry`, ne jen `pinned` (max 3, hlídáno tady i v rules).
 * Delete stále nikdy — mazání záznamů zůstává mimo rozsah této změny.
 */

import {
  collection, doc, getDocs, setDoc, updateDoc, writeBatch,
  query, where, orderBy, limit, startAfter,
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { meta, createMeta, SUBCOLLECTION_PAGE_SIZE } from './shared.js';

const MAX_PINNED = 3;

function timelineCol(familyId) {
  return collection(db, 'foster_families', familyId, 'timeline');
}

/**
 * Filtr typu a osoby se kombinuje jedním dotazem (docs/domain/timeline.md §1,
 * §2b) — vyžaduje composite indexy z firestore.indexes.json. `childId`
 * odpovídá `subjectRefs` položce `{kind: 'child', id: childId}`.
 */
export async function listTimelineEntries(familyId, { type = null, childId = null } = {}, cursor = null) {
  const constraints = [];
  if (type) constraints.push(where('type', '==', type));
  if (childId) constraints.push(where('subjectRefs', 'array-contains', { kind: 'child', id: childId }));
  constraints.push(orderBy('occurredAt', 'desc'), limit(SUBCOLLECTION_PAGE_SIZE));
  if (cursor) constraints.push(startAfter(cursor));

  const snap = await getDocs(query(timelineCol(familyId), ...constraints));
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const lastDoc = snap.docs.length === SUBCOLLECTION_PAGE_SIZE ? snap.docs[snap.docs.length - 1] : null;
  return { items, lastDoc };
}

export async function listPinnedTimelineEntries(familyId) {
  const snap = await getDocs(query(timelineCol(familyId), where('pinned', '==', true), orderBy('occurredAt', 'desc')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createTimelineEntry(familyId, {
  type, title, body, subjectRefs = [], occurredAt, attachments = [], source = 'web', correctsEntryId = null,
}) {
  const ref = doc(timelineCol(familyId));
  const payload = {
    type, title, body, subjectRefs, occurredAt, attachments, source,
    pinned: false,
    correctsEntryId,
    ...createMeta(),
  };

  if (type === 'visit') {
    // `lastVisitAt` je denormalizované pole na rodině (obrazovka Dnes, sekce
    // "Čeká na vás") — CLAUDE.md: aktualizovat VŽDY v jednom batch zápisu se
    // změnou, která ho vyvolala, ne dodatečně.
    const batch = writeBatch(db);
    batch.set(ref, payload);
    batch.update(doc(db, 'foster_families', familyId), { lastVisitAt: occurredAt });
    await batch.commit();
  } else {
    await setDoc(ref, payload);
  }
  return ref.id;
}

/** Systémový záznam (změna svěření, klíčové osoby…) — VÝHRADNĚ services vrstva, ne UI formulář. */
export async function createSystemTimelineEntry(familyId, { title, body, subjectRefs = [] }) {
  return createTimelineEntry(familyId, {
    type: 'system', title, body, subjectRefs, occurredAt: new Date(), source: 'system',
  });
}

/**
 * Editace obsahu záznamu na místě (immutability pozastavena 2026-07-05, viz
 * komentář nahoře). `patch` smí obsahovat jen `body`/`title`/`occurredAt`/
 * `subjectRefs` — cokoli jiného firestore.rules odmítne.
 */
export async function updateTimelineEntry(familyId, entryId, patch) {
  await updateDoc(doc(db, 'foster_families', familyId, 'timeline', entryId), { ...patch, ...meta() });
}

/** Pin/unpin — max 3 připnuté na rodinu, srozumitelná chyba při překročení (viz timeline.md §5 bod 5). */
export async function setTimelinePinned(familyId, entryId, pinned) {
  if (pinned) {
    const pinnedSnap = await getDocs(query(timelineCol(familyId), where('pinned', '==', true)));
    if (pinnedSnap.size >= MAX_PINNED) {
      throw new Error(`Lze připnout maximálně ${MAX_PINNED} záznamy — nejprve jeden odepněte.`);
    }
  }
  await updateDoc(doc(db, 'foster_families', familyId, 'timeline', entryId), { pinned, ...meta() });
}
