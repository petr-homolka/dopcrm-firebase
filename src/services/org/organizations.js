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
  setDoc,
  updateDoc,
  query,
  orderBy,
  limit,
  runTransaction,
  serverTimestamp,
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

// ── Slug organizace (Krok 1, 2026-07-03) ─────────────────────────
// Uniqueness hlídá `org_slugs/{slug}` (doc ID == slug) — viz firestore.rules.

/** @returns {Promise<boolean>} true = slug je volný. */
export async function isSlugAvailable(slug) {
  const snap = await getDoc(doc(db, 'org_slugs', slug));
  return !snap.exists();
}

/**
 * První rezervace slugu (registrace nové organizace). `uid` se předává
 * explicitně (ne přes useAuthStore) — volá se těsně po založení Auth účtu,
 * kdy store ještě nemusí mít aktuální session (viz registrationService.js).
 */
export async function reserveOrgSlug(orgId, slug, uid) {
  await setDoc(doc(db, 'org_slugs', slug), {
    organizationId: orgId,
    createdAt: serverTimestamp(),
    createdBy: uid,
  });
}

/**
 * Změna slugu existující organizace (Nastavení, org_admin). Atomická
 * transakce: ověří volnost nového slugu, zapíše novou rezervaci, aktualizuje
 * `organizations.slug` a uvolní starou rezervaci — stejný vzor jako
 * `reassignFoster` (CLAUDE.md: víceúrokové zápisy vždy v jedné transakci).
 */
export async function changeOrganizationSlug(orgId, newSlug) {
  await runTransaction(db, async (tx) => {
    const orgRef = doc(db, 'organizations', orgId);
    const orgSnap = await tx.get(orgRef);
    if (!orgSnap.exists()) throw new Error('Organizace nenalezena.');
    const oldSlug = orgSnap.data().slug ?? null;
    if (oldSlug === newSlug) return;

    const newSlugRef = doc(db, 'org_slugs', newSlug);
    const newSlugSnap = await tx.get(newSlugRef);
    if (newSlugSnap.exists()) throw new Error('Tato adresa je již obsazená.');

    tx.set(newSlugRef, { organizationId: orgId, ...createMeta() });
    tx.update(orgRef, { slug: newSlug, ...meta() });
    if (oldSlug) tx.delete(doc(db, 'org_slugs', oldSlug));
  });
}
