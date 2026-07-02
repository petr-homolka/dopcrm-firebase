/**
 * registrationService.js — veřejná sebeobslužná registrace organizace
 * (2026-07-02, zadání: "Provozovatel systému nebude zakládat do systému
 * Organizaci, ale na webu po základní registraci si to bude dělat VŽDY
 * kdokoli sám" — jako Gmail, bez zásahu Superadmina).
 *
 * Záměrně ODDĚLENO od orgService.js: zbytek orgService.js předpokládá už
 * PŘIHLÁŠENÉHO uživatele a čte jeho identitu z useAuthStore (Zustand) —
 * to je při registraci nespolehlivé (Zustand store se aktualizuje
 * asynchronně přes onAuthStateChanged, který v okamžiku těsně po
 * createUserWithEmailAndPassword ještě nemusí doběhnout). Tahle funkce
 * proto bere `uid` VŽDY přímo z Firebase Auth credential, ne ze store.
 *
 * Na rozdíl od createEmployee() (orgService.js) NEPOUŽÍVÁ sekundární
 * Firebase App instanci — tady chceme, aby nově zaregistrovaný člověk
 * zůstal přihlášený jako on sám (přesně jako běžný signup flow).
 */

import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, addDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase.js';

/**
 * @param {object} input
 * @param {string} input.orgName
 * @param {string} [input.ico]
 * @param {string} [input.dataBoxId] — ID datové schránky
 * @param {{street:string,city:string,zip:string}} input.sidlo — adresa sídla
 * @param {{street:string,city:string,zip:string}|null} input.provozovna — adresa provozovny (null = stejná jako sídlo)
 * @param {{firstName:string,lastName:string,funkce:string,rc:string,phone:string}} input.zastupce
 * @param {string} input.email — přihlašovací e-mail zástupce
 * @param {string} input.password
 * @returns {Promise<{uid:string, organizationId:string}>}
 */
export async function registerOrganization({ orgName, ico = '', dataBoxId = '', sidlo, provozovna = null, zastupce, email, password }) {
  // 1) Založí Auth účet zástupce NA PRIMÁRNÍ instanci — je to on sám, kdo se
  //    tímhle zapisuje do appky, žádná "cizí" session se nechrání.
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const uid = cred.user.uid;

  // 2) Organizace — createdBy MUSÍ být přesně tenhle uid (firestore.rules
  //    self-registraci povolují jen "založ si organizaci sám sobě").
  const orgRef = await addDoc(collection(db, 'organizations'), {
    name: orgName,
    ico,
    dataBoxId,
    sidloAddress: sidlo,
    provozovnaAddress: provozovna ?? sidlo, // stejná jako sídlo, pokud nezadáno
    provozovnaSameAsSidlo: provozovna === null,
    plan: 'trial',
    status: 'trial',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: uid,
    updatedBy: uid,
  });

  // 3) Vlastní profil zástupce (role org_admin — nejvyšší úroveň v organizaci).
  //    firestore.rules ověří, že organizations/{orgRef.id}.createdBy == uid.
  await setDoc(doc(db, 'users', uid), {
    email,
    displayName: `${zastupce.firstName} ${zastupce.lastName}`.trim(),
    firstName: zastupce.firstName,
    lastName: zastupce.lastName,
    funkce: zastupce.funkce || 'Zástupce organizace',
    rc: zastupce.rc ?? '',
    phone: zastupce.phone ?? '',
    role: 'org_admin',
    organizationId: orgRef.id,
    department: 'management',
    nadrizeny: null, // nejvyšší úroveň v organizaci nemá nadřízeného
    branchId: null,
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: uid,
    updatedBy: uid,
  });

  return { uid, organizationId: orgRef.id };
}
