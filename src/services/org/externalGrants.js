/**
 * org/externalGrants.js — grantový engine oprávnění externího účastníka
 * (2026-07-06, docs/domain/externi-ucastnici.md §1/§4). Každé oprávnění je
 * samostatný, ČASOVĚ VERZOVANÝ grant (validFrom/validTo) s volitelnými
 * časovými okny. Citlivá oprávnění procházejí TŘEMI oddělenými kroky
 * (Requested → Approved → Activated), každý jiný aktér, vše auditováno.
 * Necitlivá lze udělit jedním krokem (grantDirect) — také auditováno.
 */

import { collection, doc, addDoc, getDocs, updateDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.js';
import { useAuthStore } from '../../store/authStore.js';
import { isSensitivePermission } from '../../shared/externalPermissions.js';
import { logEpEvent } from './externalAudit.js';

function grantsCol(epId) {
  return collection(db, 'external_participants', epId, 'grants');
}
function grantRef(epId, grantId) {
  return doc(db, 'external_participants', epId, 'grants', grantId);
}
function uid() {
  return useAuthStore.getState().currentUser?.uid ?? 'system';
}

export async function listGrants(epId) {
  const snap = await getDocs(query(grantsCol(epId), orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Krok 1 — žádost o oprávnění. U citlivých MUSÍ obsahovat doklad
 * (reason/reasonType/sourceType/sourceDocId). Vrací grantId.
 */
export async function requestGrant(epId, { childId, permissionKey, validFrom = null, validTo = null, timeWindows = [], reason = '', reasonType = '', sourceType = '', sourceDocId = null }) {
  if (isSensitivePermission(permissionKey) && (!reason.trim() || !reasonType)) {
    throw new Error('Citlivé oprávnění vyžaduje důvod a typ dokladu.');
  }
  const ref = await addDoc(grantsCol(epId), {
    childId, permissionKey, status: 'requested',
    validFrom, validTo, timeWindows,
    reason, reasonType, sourceType, sourceDocId,
    requestedBy: uid(), requestedAt: serverTimestamp(),
    approvedBy: null, approvedAt: null, activatedBy: null, activatedAt: null,
    revokedBy: null, revokedAt: null,
    createdAt: serverTimestamp(),
  });
  await logEpEvent(epId, { action: 'permission_requested', objectType: 'grant', objectId: ref.id, note: permissionKey });
  return ref.id;
}

/** Krok 2 — schválení (jiný aktér než žadatel; typicky vedení). */
export async function approveGrant(epId, grantId) {
  await updateDoc(grantRef(epId, grantId), { status: 'approved', approvedBy: uid(), approvedAt: serverTimestamp() });
  await logEpEvent(epId, { action: 'permission_approved', objectType: 'grant', objectId: grantId });
}

/** Krok 3 — aktivace (typicky klíčová osoba). Nastaví validFrom, pokud chybí. */
export async function activateGrant(epId, grantId, { validFrom = null } = {}) {
  const patch = { status: 'active', activatedBy: uid(), activatedAt: serverTimestamp() };
  if (validFrom) patch.validFrom = validFrom;
  await updateDoc(grantRef(epId, grantId), patch);
  await logEpEvent(epId, { action: 'permission_activated', objectType: 'grant', objectId: grantId });
}

/** Odvolání / ukončení oprávnění — nastaví validTo=teď, stav revoked (auditní stopa). */
export async function revokeGrant(epId, grantId) {
  await updateDoc(grantRef(epId, grantId), { status: 'revoked', revokedBy: uid(), revokedAt: serverTimestamp(), validTo: serverTimestamp() });
  await logEpEvent(epId, { action: 'permission_revoked', objectType: 'grant', objectId: grantId });
}

/**
 * Necitlivé oprávnění jedním krokem (request+approve+activate splynou, stále
 * auditováno). Pro citlivá vyhodí chybu — musí projít třemi kroky.
 */
export async function grantDirect(epId, { childId, permissionKey, validFrom = null, validTo = null, timeWindows = [] }) {
  if (isSensitivePermission(permissionKey)) {
    throw new Error('Citlivé oprávnění nelze udělit jedním krokem — projděte schválením.');
  }
  const me = uid();
  const now = serverTimestamp();
  const ref = await addDoc(grantsCol(epId), {
    childId, permissionKey, status: 'active',
    validFrom, validTo, timeWindows,
    reason: '', reasonType: '', sourceType: '', sourceDocId: null,
    requestedBy: me, requestedAt: now, approvedBy: me, approvedAt: now, activatedBy: me, activatedAt: now,
    revokedBy: null, revokedAt: null, createdAt: now,
  });
  await logEpEvent(epId, { action: 'permission_activated', objectType: 'grant', objectId: ref.id, note: permissionKey });
  return ref.id;
}
