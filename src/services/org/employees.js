/**
 * org/employees.js — CRUD pro users (zaměstnanci: superadmin / org_admin /
 * klicova_osoba / …).
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
 *   firebaseConfig na klientovi.
 */

import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut as secondarySignOut } from 'firebase/auth';
import { collection, doc, getDocs, setDoc, updateDoc, query, where, limit } from 'firebase/firestore';
import { db, firebaseConfig } from '../firebase.js';
import { meta, createMeta, TOP_LEVEL_PAGE_SIZE } from './shared.js';

export async function listUsersByOrg(organizationId) {
  const snap = await getDocs(
    query(collection(db, 'users'), where('organizationId', '==', organizationId), limit(TOP_LEVEL_PAGE_SIZE))
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
