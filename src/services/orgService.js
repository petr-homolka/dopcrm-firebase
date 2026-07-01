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
import { db } from './firebase.js';
import { useAuthStore } from '../store/authStore.js';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

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

export async function createOrganization({ name, plan = 'trial', status = 'trial' }) {
  const ref = await addDoc(collection(db, 'organizations'), {
    name,
    plan,
    status, // 'trial' | 'active' | 'suspended' | 'cancelled'
    ...createMeta(),
  });
  return ref.id;
}

export async function setOrganizationStatus(orgId, status) {
  await updateDoc(doc(db, 'organizations', orgId), { status, ...meta() });
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
 * @param {{email:string,password:string,displayName:string,role:'org_admin'|'klicova_osoba'|'superadmin',organizationId:string|null,department?:string}} input
 */
export async function createEmployee({ email, password, displayName, role, organizationId, department = null }) {
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
      role,               // 'superadmin' | 'org_admin' | 'klicova_osoba'
      organizationId,     // null jen pro superadmina
      department,         // 'management' | 'service' | 'terenni' | null
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

export async function createFoster({ organizationId, name, address = '', contactPhone = '', contactEmail = '', assignedTo = null, status = 'active', note = '' }) {
  const ref = await addDoc(collection(db, 'foster_families'), {
    organizationId,
    name,
    address,
    contactPhone,
    contactEmail,
    assignedTo,
    status, // 'active' | 'paused' | 'exited'
    note,
    ...createMeta(),
  });
  return ref.id;
}

export async function updateFoster(familyId, patch) {
  await updateDoc(doc(db, 'foster_families', familyId), { ...patch, ...meta() });
}

/**
 * Přeřazení rodiny na jinou klíčovou osobu — musí zůstat konzistentní i u
 * dětí (denormalizované pole assignedTo), jinak by security rules pro KO
 * na dětech přestaly sedět. Transakce zajišťuje atomicitu.
 */
export async function reassignFoster(familyId, newAssignedTo) {
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
export async function createChild({ fosterFamilyId, firstName, lastName, birthDate = null, status = 'active', note = '' }) {
  const family = await getFoster(fosterFamilyId);
  if (!family) throw new Error('Rodina nenalezena — nelze přidat dítě.');

  const ref = await addDoc(collection(db, 'children'), {
    fosterFamilyId,
    organizationId: family.organizationId,
    assignedTo: family.assignedTo ?? null,
    firstName,
    lastName,
    birthDate,
    status, // 'active' | 'transferred' | 'aged_out'
    note,
    ...createMeta(),
  });
  return ref.id;
}

export async function updateChild(childId, patch) {
  await updateDoc(doc(db, 'children', childId), { ...patch, ...meta() });
}

export async function deleteChild(childId) {
  await deleteDoc(doc(db, 'children', childId));
}
