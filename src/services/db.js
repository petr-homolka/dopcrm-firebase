/**
 * Database service — Doprovázení CRM (MVP)
 *
 * TENANT MODEL:
 *   Všechna data klientů VÝHRADNĚ v: tenants/{tenantId}/data_objects/{docId}
 *   Root kolekce /data_objects se NEPOUŽÍVÁ — blokována i v firestore.rules.
 *
 * GDPR / SKARTACE:
 *   Dočasné dokumenty (sdílené odkazy, dočasná přiřazení, GDPR export requesty)
 *   dostávají pole expiresAt (Firestore Timestamp). Nativní Firestore TTL toto
 *   pole automaticky smaže — bez cron jobů.
 *
 * Offline:
 *   IndexedDB persistence je zapnuta v firebase.js → dotazy fungují i offline.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase.js';
import { currentTenantId, currentUser } from './auth.js';

// ── Tenant-scoped cesty ──────────────────────────────────────

/** Vrátí referenci na tenant kolekci. Vždy tenant-scoped, nikdy root. */
function tenantCol(tenantId, subcol) {
  if (!tenantId) throw new Error('[db] tenantId je povinný');
  return collection(db, 'tenants', tenantId, subcol);
}

/** Vrátí referenci na konkrétní dokument v tenant kolekci. */
function tenantDoc(tenantId, subcol, docId) {
  if (!tenantId) throw new Error('[db] tenantId je povinný');
  return doc(db, 'tenants', tenantId, subcol, docId);
}

// ── Helpery pro expiresAt (GDPR TTL) ────────────────────────

/**
 * Timestamp pro automatickou skartaci.
 * Firestore TTL toto pole sleduje a dokument smaže bez cron jobů.
 * @param {number} days - počet dní od teď
 */
function expiresAfterDays(days) {
  return Timestamp.fromMillis(Date.now() + days * 86_400_000);
}

// ── Metadata pro každý dokument ──────────────────────────────

function writeMetadata(extra = {}) {
  const u = currentUser();
  return {
    updatedAt: serverTimestamp(),
    updatedBy: u?.uid ?? 'system',
    ...extra,
  };
}

function createMetadata(tenantId, extra = {}) {
  const u = currentUser();
  return {
    tenantId,
    createdAt:  serverTimestamp(),
    updatedAt:  serverTimestamp(),
    createdBy:  u?.uid ?? 'system',
    updatedBy:  u?.uid ?? 'system',
    ...extra,
  };
}

// ── Obecné CRUD pro data_objects ─────────────────────────────

export async function getObject(docId, tenantId = currentTenantId()) {
  const snap = await getDoc(tenantDoc(tenantId, 'data_objects', docId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function listObjects(filters = [], tenantId = currentTenantId()) {
  let q = tenantCol(tenantId, 'data_objects');
  if (filters.length) q = query(q, ...filters);
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function createObject(data, tenantId = currentTenantId()) {
  const col = tenantCol(tenantId, 'data_objects');
  const ref = await addDoc(col, { ...data, ...createMetadata(tenantId) });
  return ref.id;
}

export async function updateObject(docId, patch, tenantId = currentTenantId()) {
  await updateDoc(tenantDoc(tenantId, 'data_objects', docId), {
    ...patch,
    ...writeMetadata(),
  });
}

export async function deleteObject(docId, tenantId = currentTenantId()) {
  await deleteDoc(tenantDoc(tenantId, 'data_objects', docId));
}

// ── Dočasné dokumenty (GDPR skartace přes expiresAt TTL) ─────

/**
 * Vytvoří dočasný dokument s automatickou expirací.
 * Pole `expiresAt` = Firestore TTL — žádné cron joby se nepoužívají.
 *
 * Příklady: sdílený odkaz na dokument, GDPR export request, dočasné přiřazení
 *
 * @param {string} subcol  - subkolekce (např. 'shared_links', 'gdpr_requests')
 * @param {object} data    - payload dokumentu
 * @param {number} ttlDays - za kolik dní dokument expiruje (default: 30)
 */
export async function createEphemeral(subcol, data, ttlDays = 30, tenantId = currentTenantId()) {
  const col = tenantCol(tenantId, subcol);
  const ref = await addDoc(col, {
    ...data,
    ...createMetadata(tenantId),
    expiresAt: expiresAfterDays(ttlDays),  // Firestore TTL field
  });
  return ref.id;
}

// ── Specializované kolekce ───────────────────────────────────

// Záznamy Osy / timeline
export async function addTimelineEntry(entry, tenantId = currentTenantId()) {
  return addDoc(tenantCol(tenantId, 'timeline'), {
    ...entry,
    ...createMetadata(tenantId),
  });
}

// Dokumenty (DMS)
export async function listDocuments(filters = [], tenantId = currentTenantId()) {
  let q = tenantCol(tenantId, 'documents');
  if (filters.length) q = query(q, ...filters);
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function createDocument(data, tenantId = currentTenantId()) {
  return addDoc(tenantCol(tenantId, 'documents'), {
    ...data,
    ...createMetadata(tenantId),
  });
}

// Instituce (číselník)
export async function listInstitutions(tenantId = currentTenantId()) {
  const snap = await getDocs(tenantCol(tenantId, 'institutions'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Šablony karet (Superadmin — globální)
export async function listCardTemplates() {
  const snap = await getDocs(collection(db, 'global_templates'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Audit log — jen kritické chyby (ne běžné operace)
export async function logCriticalError(payload, tenantId = currentTenantId()) {
  return addDoc(tenantCol(tenantId, 'audit_log'), {
    ...payload,
    severity: 'critical',  // Firestore Rules povolí zápis jen pro severity=critical
    timestamp: serverTimestamp(),
    uid: currentUser()?.uid ?? 'anonymous',
  });
}

// ── Export Firestore helperů pro složitější dotazy ───────────
export { where, orderBy, limit, query, serverTimestamp, Timestamp };
