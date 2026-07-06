/**
 * org/notifications.js — notifikační centrum (2026-07-06,
 * docs/domain/chat-a-pestounska-appka.md).
 *
 * `users/{uid}/notifications/{id}` — per-uživatel podkolekce. Odznak = počet
 * nepřečtených. Zakládá je JINÝ přihlášený uživatel ze stejné organizace
 * (KO notifikuje pěstouna a naopak) — pravidla to hlídají přes get() na
 * organizaci příjemce. Bez Cloud Functions: notifikaci vytváří klient, který
 * událost vyvolal (odesílatel zprávy). Vědomé zjednodušení, viz INVENTAR.
 */

import {
  collection, doc, addDoc, getDocs, updateDoc, query, where, orderBy, limit, writeBatch, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { useAuthStore } from '../../store/authStore.js';

function notifCol(uid) {
  return collection(db, 'users', uid, 'notifications');
}

/** Založí notifikaci uživateli `toUid`. Bezpečně přeskočí self a prázdné uid. */
export async function pushNotification(toUid, { type, title, body = '', link = '' }) {
  const { currentUser, profile } = useAuthStore.getState();
  if (!toUid || toUid === currentUser?.uid) return;
  await addDoc(notifCol(toUid), {
    type,
    title,
    body,
    link,
    read: false,
    fromUid: currentUser?.uid ?? null,
    fromName: profile?.displayName ?? currentUser?.email ?? '',
    createdAt: serverTimestamp(),
  });
}

/** Rozešle stejnou notifikaci více příjemcům (např. pěstounům rodiny). */
export async function pushNotificationTo(uids, payload) {
  await Promise.all((uids ?? []).map((uid) => pushNotification(uid, payload)));
}

/** Posledních N notifikací aktuálního uživatele, nejnovější první. */
export async function listMyNotifications(max = 50) {
  const uid = useAuthStore.getState().currentUser?.uid;
  if (!uid) return [];
  const snap = await getDocs(query(notifCol(uid), orderBy('createdAt', 'desc'), limit(max)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Počet nepřečtených — pro odznak. */
export async function countUnread() {
  const uid = useAuthStore.getState().currentUser?.uid;
  if (!uid) return 0;
  const snap = await getDocs(query(notifCol(uid), where('read', '==', false), limit(50)));
  return snap.size;
}

export async function markNotificationRead(id) {
  const uid = useAuthStore.getState().currentUser?.uid;
  if (!uid) return;
  await updateDoc(doc(db, 'users', uid, 'notifications', id), { read: true });
}

/** Označí všechny nepřečtené za přečtené (jedním batchem). */
export async function markAllNotificationsRead() {
  const uid = useAuthStore.getState().currentUser?.uid;
  if (!uid) return;
  const snap = await getDocs(query(notifCol(uid), where('read', '==', false), limit(400)));
  if (snap.empty) return;
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.update(d.ref, { read: true }));
  await batch.commit();
}
