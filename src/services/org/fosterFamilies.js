/**
 * org/fosterFamilies.js — CRUD pro foster_families (klientské rodiny) +
 * osoby v domácnosti (fosters[]) a jejich vzdělávání.
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
  runTransaction,
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { meta, createMeta, genId } from './shared.js';

export async function listFostersByOrg(organizationId) {
  const snap = await getDocs(
    query(collection(db, 'foster_families'), where('organizationId', '==', organizationId))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Rodiny přidělené konkrétní klíčové osobě (mobil i web terénní dashboard). */
export async function listFostersAssignedTo(uid) {
  const snap = await getDocs(
    query(collection(db, 'foster_families'), where('assignedTo', '==', uid))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getFoster(familyId) {
  const snap = await getDoc(doc(db, 'foster_families', familyId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// Kapacitní limit z byznys zadání (2026-07-02): "max. počet pěstounů na jednu
// klíčovou osobu je 25". Ověřeno na klientovi před zápisem — pro V8/produkci
// je vhodné doplnit i server-side (Cloud Function), Firestore rules počítání
// dokumentů nativně nepodporují.
export const MAX_FAMILIES_PER_KO = 25;

/** Kolik rodin má klíčová osoba aktuálně přidělených (volitelně bez jedné konkrétní — při přeřazení). */
async function countFamiliesAssignedTo(uid, excludeFamilyId = null) {
  const snap = await getDocs(query(collection(db, 'foster_families'), where('assignedTo', '==', uid)));
  return snap.docs.filter((d) => d.id !== excludeFamilyId).length;
}

async function assertFamilyCapacity(uid, excludeFamilyId = null) {
  if (!uid) return;
  const count = await countFamiliesAssignedTo(uid, excludeFamilyId);
  if (count >= MAX_FAMILIES_PER_KO) {
    throw new Error(`Tato klíčová osoba už má přidělených ${count} rodin — maximum je ${MAX_FAMILIES_PER_KO}. Přiřaďte rodinu jiné klíčové osobě.`);
  }
}

export async function createFoster({ organizationId, name, address = '', contactPhone = '', contactEmail = '', assignedTo = null, status = 'active', careType = 'long', note = '', fosters = [] }) {
  await assertFamilyCapacity(assignedTo);
  const ref = await addDoc(collection(db, 'foster_families'), {
    organizationId,
    name,
    address,
    contactPhone,
    contactEmail,
    assignedTo,
    status,    // 'active' | 'paused' | 'exited'
    careType,  // 'long' | 'temp' | 'kin' — viz shared/domainConstants.js CARE_TYPES
    note,
    // Pěstouni (osoby) v domácnosti — pole, ne samostatná kolekce (typicky 1-2
    // osoby/rodina, stejně jako household.fosters[] ve vanilla prototypu).
    // Každá položka: { name, rc, phone, email, isFoster, periodStart, eduDone, eduRequired }
    fosters,
    ...createMeta(),
  });
  return ref.id;
}

export async function updateFoster(familyId, patch) {
  await updateDoc(doc(db, 'foster_families', familyId), { ...patch, ...meta() });
}

/** Přepíše celé pole `fosters[]` (přidání/úprava/odebrání osoby) — malé pole, čtení-úprava-zápis stačí. */
export async function setFosterPersons(familyId, fosters) {
  await updateDoc(doc(db, 'foster_families', familyId), { fosters, ...meta() });
}

/**
 * Přeřazení rodiny na jinou klíčovou osobu — musí zůstat konzistentní i u
 * dětí (denormalizované pole assignedTo), jinak by security rules pro KO
 * na dětech přestaly sedět. Transakce zajišťuje atomicitu.
 */
export async function reassignFoster(familyId, newAssignedTo) {
  await assertFamilyCapacity(newAssignedTo, familyId);
  await runTransaction(db, async (tx) => {
    const familyRef = doc(db, 'foster_families', familyId);
    const familySnap = await tx.get(familyRef);
    if (!familySnap.exists()) throw new Error('Rodina nenalezena.');

    // Dotaz MUSÍ obsahovat organizationId jako rovnostní filtr — firestore.rules
    // pro `children` ověřuje sameOrg(resource.data.organizationId), a Firestore
    // list dotazy povolí jen když je pravidlem kontrolované pole SOUČASNĚ i ve
    // filtru dotazu (jinak "Missing or insufficient permissions", viz
    // [[crm-firestore-list-query-rule-pole]] — objeveno 2026-07-02).
    const childrenSnap = await getDocs(
      query(
        collection(db, 'children'),
        where('fosterFamilyId', '==', familyId),
        where('organizationId', '==', familySnap.data().organizationId)
      )
    );

    tx.update(familyRef, { assignedTo: newAssignedTo, ...meta() });
    childrenSnap.docs.forEach((childDoc) => {
      tx.update(childDoc.ref, { assignedTo: newAssignedTo, ...meta() });
    });
  });
}

export async function deleteFoster(familyId) {
  await deleteDoc(doc(db, 'foster_families', familyId));
}

// ── Pěstouni (osoby v domácnosti): adresy + vzdělávání ──────────

/** Přidá novou osobu (pěstouna) do domácnosti — přiděluje stabilní `id` pro navazující akce (kurzy). */
export async function addFosterPerson(familyId, person) {
  const family = await getFoster(familyId);
  if (!family) throw new Error('Rodina nenalezena.');
  const fosters = [...(family.fosters ?? []), { id: genId('p'), ...person }];
  await setFosterPersons(familyId, fosters);
  return fosters;
}

/** Upraví údaje (jméno/RČ/kontakt/adresy) konkrétní osoby v domácnosti. */
export async function updateFosterPerson(familyId, personId, patch) {
  const family = await getFoster(familyId);
  if (!family) throw new Error('Rodina nenalezena.');
  const fosters = (family.fosters ?? []).map((p) => (p.id === personId ? { ...p, ...patch } : p));
  await setFosterPersons(familyId, fosters);
  return fosters;
}

// ── Vzdělávání pěstounů — append-only subkolekce ────────────────
// Kurzy rostou v čase (opakují se každý rok), proto vlastní podkolekce
// místo pole vnořeného v poli `fosters[]` (audit nálezu #4, 2026-07-03).
// `personId` odkazuje na konkrétní osobu v `fosters[]` rodičovské rodiny.

/** Všechny kurzy rodiny napříč jejími pěstouny — UI si je rozdělí podle `personId`. */
export async function listFosterCourses(familyId) {
  const snap = await getDocs(
    query(collection(db, 'foster_families', familyId, 'fosterCourses'), orderBy('createdAt', 'desc'))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Zapíše absolvovaný/plánovaný kurz vzdělávání pěstouna. Struktura dle zadání
 * 2026-07-02: kód kurzu / kde / kdy / forma / pořadatel / certifikát (+ hodiny
 * pro součet do CARE_TYPES.requiredHours).
 */
export async function addFosterCourse(familyId, personId, course) {
  const ref = await addDoc(collection(db, 'foster_families', familyId, 'fosterCourses'), {
    personId, ...course, ...createMeta(),
  });
  return ref.id;
}

/** Sociální prostor domácnosti (manžel/partner, biologické děti, rodiče). */
export async function setFamilySocialSpace(familyId, socialSpace) {
  await updateDoc(doc(db, 'foster_families', familyId), { socialSpace, ...meta() });
}
