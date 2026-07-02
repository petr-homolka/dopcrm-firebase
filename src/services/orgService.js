/**
 * orgService.js — CRUD pro nové B2B SaaS schéma
 * (organizations / users / foster_families / children)
 *
 * Viz firestore.rules "SEKCE B" pro přesná oprávnění. Shrnutí:
 *   superadmin    — vše, napříč organizacemi
 *   org_admin     — vše ve VLASTNÍ organizaci (users, foster_families, children)
 *   klicova_osoba — čte celou organizaci, ale zapisuje/maže jen "své" rodiny/děti
 *                   (assignedTo == její uid)
 *
 * ⚠️ ZALOŽENÍ NOVÉHO ZAMĚSTNANCE (createEmployee):
 *   Firebase Auth nemá na klientovi žádné "vytvoř uživatele, ale nepřihlašuj mě
 *   jako něj" API — createUserWithEmailAndPassword() by odhlásil aktuálního
 *   superadmina/org_admina a přihlásil nově založeného zaměstnance.
 *   ŘEŠENÍ (prototyp, bez backendu): dočasná SEKUNDÁRNÍ Firebase App instance
 *   se stejnou konfigurací → nový účet se vytvoří a přihlásí JEN v ní, primární
 *   session (aktuální uživatel) zůstane netknutá. Sekundární app se po použití
 *   zahodí (deleteApp).
 *   V8/produkce: nahradit Cloud Function (Admin SDK, onCall) — bezpečnější
 *   (klient nikdy neuvidí ani na okamžik cizí session) a nevyžaduje duplicitní
 *   firebaseConfig na klientovi. Připraveno jako TODO níže.
 */

import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut as secondarySignOut } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  runTransaction,
} from 'firebase/firestore';
import { db, firebaseConfig } from './firebase.js';
import { useAuthStore } from '../store/authStore.js';

function meta(extra = {}) {
  const uid = useAuthStore.getState().currentUser?.uid ?? 'system';
  return { updatedAt: serverTimestamp(), updatedBy: uid, ...extra };
}

function createMeta(extra = {}) {
  const uid = useAuthStore.getState().currentUser?.uid ?? 'system';
  return {
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: uid,
    updatedBy: uid,
    ...extra,
  };
}

// ══════════════════════════════════════════════════════════════
// organizations (tenanti)
// ══════════════════════════════════════════════════════════════

export async function listOrganizations() {
  const snap = await getDocs(query(collection(db, 'organizations'), orderBy('createdAt', 'desc')));
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

// ══════════════════════════════════════════════════════════════
// users (zaměstnanci: superadmin / org_admin / klicova_osoba)
// ══════════════════════════════════════════════════════════════

export async function listUsersByOrg(organizationId) {
  const snap = await getDocs(
    query(collection(db, 'users'), where('organizationId', '==', organizationId))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function listKlicoveOsobyByOrg(organizationId) {
  const users = await listUsersByOrg(organizationId);
  return users.filter((u) => u.role === 'klicova_osoba');
}

/**
 * Založí nového zaměstnance (Auth účet + users/{uid} dokument) BEZ odhlášení
 * aktuálního uživatele. Viz vysvětlení sekundární App instance nahoře v souboru.
 *
 * @param {{email:string,password:string,displayName:string,role:string,organizationId:string|null,department?:string,rc?:string,funkce?:string,phone?:string,nadrizeny?:string|null,branchId?:string|null}} input
 *   role: 'superadmin'|'org_admin'|'vedouci_pobocky'|'teamleader'|'klicova_osoba'|'asistent_ko'|'zamestnanec'
 */
export async function createEmployee({ email, password, displayName, role, organizationId, department = null, rc = '', funkce = '', phone = '', nadrizeny = null, branchId = null }) {
  const secondaryApp = initializeApp(firebaseConfig, `secondary-${Date.now()}`);
  try {
    const secondaryAuth = getAuth(secondaryApp);
    const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    const uid = cred.user.uid;

    // Firestore je sdílený napříč App instancemi stejného projektu —
    // zápis přes primární `db` je v pořádku i když je uid ze sekundární session.
    await setDoc(doc(db, 'users', uid), {
      email,
      displayName,
      rc,                 // rodné číslo (volitelné — např. pro mzdovou agendu)
      funkce,              // volný text — konkrétní pracovní pozice
      phone,
      role,
      organizationId,     // null jen pro superadmina
      department,         // 'management' | 'service' | 'terenni' | null
      nadrizeny,           // uid nadřízeného zaměstnance (hierarchie), null = nejvyšší úroveň
      branchId,            // volitelná vazba na pobočku (organizations/{orgId}/branches/{branchId})
      active: true,
      ...createMeta(),
    });

    await secondarySignOut(secondaryAuth);
    return uid;
  } finally {
    await deleteApp(secondaryApp);
  }
}

export async function setUserActive(uid, active) {
  await updateDoc(doc(db, 'users', uid), { active, ...meta() });
}

export async function updateUserProfile(uid, patch) {
  await updateDoc(doc(db, 'users', uid), { ...patch, ...meta() });
}

// TODO (V8/produkce): nahradit createEmployee() Cloud Function (Admin SDK,
// onCall) — viz functions/index.js. Odstraní nutnost duplicitního
// firebaseConfig na klientovi a sekundární App instance.

// ══════════════════════════════════════════════════════════════
// foster_families (klientské rodiny)
// ══════════════════════════════════════════════════════════════

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

    const childrenSnap = await getDocs(
      query(collection(db, 'children'), where('fosterFamilyId', '==', familyId))
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

// ══════════════════════════════════════════════════════════════
// children (děti svěřené do péče)
// ══════════════════════════════════════════════════════════════

export async function listChildrenByFamily(fosterFamilyId) {
  const snap = await getDocs(
    query(collection(db, 'children'), where('fosterFamilyId', '==', fosterFamilyId))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function listChildrenByOrg(organizationId) {
  const snap = await getDocs(
    query(collection(db, 'children'), where('organizationId', '==', organizationId))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Založí dítě — organizationId + assignedTo se DENORMALIZUJÍ z rodičovské
 * foster_family (nutné pro firestore.rules, které se na children nedívají
 * přes get() do foster_families kvůli výkonu/ceně čtení).
 */
export async function createChild({ fosterFamilyId, firstName, lastName, rc = '', birthDate = null, careType = null, status = 'active', note = '', relatives = [] }) {
  const family = await getFoster(fosterFamilyId);
  if (!family) throw new Error('Rodina nenalezena — nelze přidat dítě.');

  const ref = await addDoc(collection(db, 'children'), {
    fosterFamilyId,
    organizationId: family.organizationId,
    assignedTo: family.assignedTo ?? null,
    firstName,
    lastName,
    rc,                             // rodné číslo — primární identifikátor osoby
    birthDate,
    careType: careType ?? family.careType ?? 'long',
    status, // 'active' | 'transferred' | 'aged_out'
    note,
    // Biologičtí/širší rodinní příbuzní — jmenovití, viz shared/domainConstants.js
    // REL_TYPES. Každá položka: { name, rc, rel (REL_TYPES key), legal, note }
    relatives,
    ...createMeta(),
  });
  return ref.id;
}

export async function updateChild(childId, patch) {
  await updateDoc(doc(db, 'children', childId), { ...patch, ...meta() });
}

/** Přepíše celé pole `relatives[]` u dítěte (malé pole, čtení-úprava-zápis stačí). */
export async function setChildRelatives(childId, relatives) {
  await updateDoc(doc(db, 'children', childId), { relatives, ...meta() });
}

export async function getChild(childId) {
  const snap = await getDoc(doc(db, 'children', childId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function deleteChild(childId) {
  await deleteDoc(doc(db, 'children', childId));
}
