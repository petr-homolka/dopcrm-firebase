/**
 * org/externalAudit.js — NEMĚNNÝ auditní log externího účastníka (2026-07-06,
 * docs/domain/externi-ucastnici.md §5). Každá významná akce se zapíše jednou
 * a nikdy se nemění ani nemaže (firestore.rules: update/delete = false).
 *
 * IP adresa NENÍ na klientovi dostupná (a smí se ukládat jen pokud to právní
 * režim dovolí) — doplní ji produkční backend (Cloud Function / reverse proxy).
 * Zařízení = user-agent. Čas = serverTimestamp (nezávislý na hodinách klienta).
 */

import { collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.js';
import { useAuthStore } from '../../store/authStore.js';

function auditCol(epId) {
  return collection(db, 'external_participants', epId, 'audit');
}

/**
 * Zaznamená událost do auditu EP. `action` (např. 'login','open_document',
 * 'download','view_timeline','send_message','permission_activated'),
 * `objectType`/`objectId` (čeho se týká), `result` ('ok'|'denied'|'error').
 */
export async function logEpEvent(epId, { action, objectType = null, objectId = null, result = 'ok', note = '' }) {
  if (!epId || !action) return;
  const { currentUser, profile, role } = useAuthStore.getState();
  try {
    await addDoc(auditCol(epId), {
      ts: serverTimestamp(),
      actorUid: currentUser?.uid ?? null,
      actorName: profile?.displayName ?? currentUser?.email ?? 'Neznámý',
      actorRole: role ?? null,
      ip: null,                 // doplní backend (viz doc §5)
      device: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 300) : null,
      action, objectType, objectId, result, note,
    });
  } catch (err) {
    // Audit nikdy nesmí shodit vlastní akci — jen zaloguje selhání do konzole.
    console.error('[externalAudit] Zápis auditu selhal:', err);
  }
}

/** Kompletní audit EP (administrace / KO téže organizace). Nejnovější první. */
export async function listEpAudit(epId, max = 200) {
  const snap = await getDocs(query(auditCol(epId), orderBy('ts', 'desc'), limit(max)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
