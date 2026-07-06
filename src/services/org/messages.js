/**
 * org/messages.js — chat na kartě rodiny se třemi úrovněmi soukromí
 * (2026-07-06, docs/domain/chat-a-pestounska-appka.md).
 *
 * `foster_families/{famId}/messages/{msgId}` — podkolekce (roste v čase).
 * audience: 'private' (jen autor) | 'internal' (tým) | 'foster' (KO ↔ pěstoun).
 *
 * POZOR na past „list dotaz vs. rules pole" ([[crm-firestore-list-query-rule-pole]]):
 * Firestore zamítne CELÝ dotaz, pokud by vrátil jediný dokument, na který
 * pravidlo nedá READ. Proto NEčteme „všechny zprávy" jedním dotazem:
 *   - pěstoun čte JEN `audience == 'foster'` (jeden dotaz),
 *   - zaměstnanec čte `audience in ['internal','foster']` (sdílené vlákno)
 *     PLUS zvlášť své soukromé `private && authorUid == já`, a spojí je.
 * Bez `orderBy` (řadíme na klientovi) → žádný composite index. Chat rodiny
 * je malý; stránkování je budoucí úkol (docs/INVENTAR.md).
 */

import { collection, doc, addDoc, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase.js';
import { useAuthStore } from '../../store/authStore.js';
import { createMeta } from './shared.js';

function messagesCol(familyId) {
  return collection(db, 'foster_families', familyId, 'messages');
}

function toMillis(v) {
  if (!v) return 0;
  if (typeof v.toMillis === 'function') return v.toMillis();
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? 0 : d.getTime();
}

async function fetchWhere(familyId, field, op, value) {
  const snap = await getDocs(query(messagesCol(familyId), where(field, op, value)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Zprávy vlákna rodiny viditelné AKTUÁLNÍMU uživateli, seřazené vzestupně.
 * `role`/`uid` z authStore; pěstoun dostane jen `foster` úroveň.
 */
export async function listMessages(familyId) {
  const { role, currentUser } = useAuthStore.getState();
  const uid = currentUser?.uid;

  let items;
  if (role === 'pestoun') {
    items = await fetchWhere(familyId, 'audience', '==', 'foster');
  } else {
    const [shared, mine] = await Promise.all([
      fetchWhere(familyId, 'audience', 'in', ['internal', 'foster']),
      uid ? fetchWhere(familyId, 'authorUid', '==', uid) : Promise.resolve([]),
    ]);
    // `mine` obsahuje i internal/foster autora — sjednotit dle id (jen private přibude navíc).
    const byId = new Map();
    [...shared, ...mine.filter((m) => m.audience === 'private')].forEach((m) => byId.set(m.id, m));
    items = [...byId.values()];
  }
  return items.sort((a, b) => toMillis(a.createdAt) - toMillis(b.createdAt));
}

/**
 * Odeslání zprávy. `audience` musí projít pravidly: pěstoun smí jen 'foster'.
 * `recipients` (volitelné) = uid příjemců interního směrování → cíl notifikací.
 */
export async function sendMessage(familyId, { body, audience, recipients = [], attachments = [] }) {
  const { role, currentUser, profile } = useAuthStore.getState();
  const ref = await addDoc(messagesCol(familyId), {
    body: body.trim(),
    audience,
    recipients,
    attachments,
    authorUid: currentUser?.uid ?? null,
    authorRole: role ?? null,
    authorName: profile?.displayName ?? currentUser?.email ?? 'Neznámý',
    ...createMeta(),
  });
  return ref.id;
}

export async function deleteMessage(familyId, msgId) {
  await deleteDoc(doc(db, 'foster_families', familyId, 'messages', msgId));
}
