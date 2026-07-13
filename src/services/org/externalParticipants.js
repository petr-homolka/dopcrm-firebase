/**
 * org/externalParticipants.js — účty externích účastníků případu (2026-07-06,
 * docs/domain/externi-ucastnici.md §1/§3). Obecný účet bez implicitní role;
 * význam dává vztah k dítěti + granty (externalGrants.js) + audit.
 *
 * Vytvořit smí jen klíčová osoba: předregistrace → pozvánka Magic Linkem →
 * dokončení registrace (bootstrap v orgAuth). Po vytvoření NULA oprávnění.
 * Jeden EP je zatím vázán na JEDNO dítě (childId); víc dětí = víc EP nebo
 * budoucí `access` podkolekce (multi-child, docs §1).
 */

import { collection, doc, addDoc, setDoc, getDoc, getDocs, updateDoc, query, where, limit } from 'firebase/firestore';
import { db } from '../firebase.js';
import { createMeta, meta, TOP_LEVEL_PAGE_SIZE } from './shared.js';
import { sendFosterMagicLink } from './fosterAccess.js';

function epCol() {
  return collection(db, 'external_participants');
}
export function epRef(epId) {
  return doc(db, 'external_participants', epId);
}

function invitationId(email) {
  return `ep_${email.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
}

/**
 * Předregistrace externího účastníka + pozvánka. `relationLabel` je POPISNÝ
 * (např. „matka", „psycholog") — NENÍ to role a nedává žádná práva.
 * Vrací { epId }.
 */
export async function createExternalParticipant({ organizationId, childId, childName, relationLabel = '', displayName, email, phone = '', note = '', subjectKind = 'external' }) {
  if (!organizationId || !childId) throw new Error('Chybí organizace nebo dítě.');
  const clean = (email ?? '').trim().toLowerCase();
  const ref = await addDoc(epCol(), {
    organizationId, childId, childName: childName ?? '', relationLabel,
    displayName, email: clean, phone, note,
    subjectKind,              // 'external' | 'child' (dítě jako uživatel, §7)
    authUid: null,
    status: 'invited',        // 'invited' | 'active' | 'suspended'
    ...createMeta(),
  });
  if (clean) {
    await setDoc(doc(db, 'ep_invitations', invitationId(clean)), {
      email: clean, epId: ref.id, organizationId, displayName, status: 'pending', ...createMeta(),
    });
    await sendFosterMagicLink(clean).catch((err) => console.error('[externalParticipants] Odeslání odkazu selhalo:', err));
  }
  return { epId: ref.id };
}

export async function getExternalParticipant(epId) {
  const snap = await getDoc(epRef(epId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/** Externí účastníci navázaní na konkrétní dítě (dvě rovnostní pole = bez composite indexu). */
export async function listExternalParticipantsForChild(childId, organizationId) {
  const snap = await getDocs(query(
    epCol(),
    where('organizationId', '==', organizationId),
    where('childId', '==', childId),
    limit(TOP_LEVEL_PAGE_SIZE)
  ));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function setExternalParticipantStatus(epId, status) {
  await updateDoc(epRef(epId), { status, ...meta() });
}

/** Znovu odeslat přihlašovací odkaz (magic link). */
export async function resendExternalParticipantInvite(email) {
  return sendFosterMagicLink(email);
}
