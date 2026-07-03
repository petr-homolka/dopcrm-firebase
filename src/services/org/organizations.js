/**
 * org/organizations.js — CRUD pro organizations (tenanti).
 * Viz firestore.rules "SEKCE B" pro přesná oprávnění.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { meta, createMeta, TOP_LEVEL_PAGE_SIZE } from './shared.js';

export async function listOrganizations() {
  const snap = await getDocs(
    query(collection(db, 'organizations'), orderBy('createdAt', 'desc'), limit(TOP_LEVEL_PAGE_SIZE))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getOrganization(orgId) {
  const snap = await getDoc(doc(db, 'organizations', orgId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// Pozn.: primární cesta pro založení organizace je teď sebeobslužná registrace
// (RegisterPage.jsx / registrationService.js, adresy jako {street,city,zip}
// objekty). Tahle funkce zůstává jako záložní nástroj pro Superadmina
// (podpora/migrace) — jednodušší plochá pole, ne 1:1 stejný tvar.
export async function createOrganization({ name, ico = '', address = '', contactEmail = '', contactPhone = '', plan = 'trial', status = 'trial' }) {
  const ref = await addDoc(collection(db, 'organizations'), {
    name,
    ico,            // IČO — 8místné identifikační číslo osoby (ČR)
    address,
    contactEmail,
    contactPhone,
    plan,
    status, // 'trial' | 'active' | 'suspended' | 'cancelled'
    ...createMeta(),
  });
  return ref.id;
}

export async function setOrganizationStatus(orgId, status) {
  await updateDoc(doc(db, 'organizations', orgId), { status, ...meta() });
}

export async function updateOrganization(orgId, patch) {
  await updateDoc(doc(db, 'organizations', orgId), { ...patch, ...meta() });
}
