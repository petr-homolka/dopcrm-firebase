/**
 * orgAuth.js — přihlašování pro NOVÉ B2B SaaS schéma
 *
 * Odlišné od services/auth.js (legacy user_roles model) — tohle je jediná
 * autentizační cesta pro nové role superadmin/org_admin/klicova_osoba.
 * Identita = Firebase Auth, role = Firestore users/{uid} (nikdy Custom Claims).
 *
 * Store: viz store/authStore.js (Zustand) — po signIn() se onAuthStateChanged
 * v bootstrapAuthStore() postará o načtení profilu, tady jen voláme Firebase.
 */

import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from 'firebase/auth';
import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where, limit, serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from './firebase.js';
import { emailForSignInKey } from './org/fosterAccess.js';

export async function signIn(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

/** Je aktuální URL jednorázový přihlašovací odkaz? (completion route /prihlaseni) */
export function isMagicLink() {
  return isSignInWithEmailLink(auth, window.location.href);
}

/**
 * Dokončí přihlášení magic linkem. `emailFallback` se použije, když odkaz
 * uživatel otevřel na jiném zařízení (localStorage prázdný) — UI se doptá.
 * Po přihlášení případně založí profil pěstouna z jeho pozvánky.
 */
export async function completeMagicLink(emailFallback = '') {
  let email = '';
  try { email = window.localStorage.getItem(emailForSignInKey) ?? ''; } catch { /* private mode */ }
  email = email || emailFallback;
  if (!email) throw new Error('Zadejte prosím e-mail, na který odkaz přišel.');
  const cred = await signInWithEmailLink(auth, email.trim().toLowerCase(), window.location.href);
  try { window.localStorage.removeItem(emailForSignInKey); } catch { /* ignore */ }
  await acceptFosterInvitationIfNeeded(cred.user);
  return cred.user;
}

/**
 * Bootstrap profilu pěstouna z pozvánky (2026-07-06 §A). Když přihlášený
 * uživatel ještě nemá `users/{uid}`, dohledá pozvánku na svůj ověřený e-mail
 * a založí si z ní profil (role pestoun, rodina, organizace). Bez pozvánky =
 * neznámý účet → odhlášení a chyba.
 */
export async function acceptFosterInvitationIfNeeded(user) {
  const userRef = doc(db, 'users', user.uid);
  const existing = await getDoc(userRef);
  if (existing.exists()) return existing.data();

  const email = (user.email ?? '').toLowerCase();

  // 1) Pozvánka pěstouna
  const fSnap = await getDocs(query(collection(db, 'foster_invitations'), where('email', '==', email), limit(1)));
  if (!fSnap.empty) {
    const inv = fSnap.docs[0];
    const d = inv.data();
    await setDoc(userRef, {
      email: user.email, displayName: d.displayName ?? user.email, phone: d.phone ?? '',
      role: 'pestoun', organizationId: d.organizationId, fosterFamilyId: d.fosterFamilyId,
      invitationId: inv.id, active: true,
      createdAt: serverTimestamp(), updatedAt: serverTimestamp(), createdBy: user.uid, updatedBy: user.uid,
    });
    await updateDoc(inv.ref, { status: 'accepted', acceptedAt: serverTimestamp(), acceptedUid: user.uid });
    return null;
  }

  // 2) Pozvánka externího účastníka (docs/domain/externi-ucastnici.md §3)
  const eSnap = await getDocs(query(collection(db, 'ep_invitations'), where('email', '==', email), limit(1)));
  if (!eSnap.empty) {
    const inv = eSnap.docs[0];
    const d = inv.data();
    await setDoc(userRef, {
      email: user.email, displayName: d.displayName ?? user.email,
      role: 'external', organizationId: d.organizationId, externalParticipantId: d.epId,
      invitationId: inv.id, active: true,
      createdAt: serverTimestamp(), updatedAt: serverTimestamp(), createdBy: user.uid, updatedBy: user.uid,
    });
    await updateDoc(inv.ref, { status: 'accepted', acceptedAt: serverTimestamp(), acceptedUid: user.uid });
    return null;
  }

  await firebaseSignOut(auth);
  throw new Error('K tomuto e-mailu není žádná pozvánka. Požádejte klíčovou osobu o nový odkaz.');
}

export async function signOut() {
  await firebaseSignOut(auth);
}

/** Cílová cesta po přihlášení podle role — hlavní dashboard dané role. */
export function dashboardPathForRole(role) {
  switch (role) {
    case 'superadmin':      return '/admin/superadmin';
    case 'org_admin':       return '/admin/organizace';
    case 'klicova_osoba':   return '/admin/terenni';
    case 'vedouci_pobocky':
    case 'teamleader':      return '/admin/tym';
    case 'pestoun':         return '/moje';
    case 'external':        return '/ucastnik';
    default:                return '/prehled';
  }
}

/**
 * "Domovská" cesta po přihlášení/přesměrování (Krok 3, 2026-07-03) — pro
 * klicova_osoba je to obrazovka Dnes (`/`), ne její scoped dashboard
 * (`dashboardPathForRole` na `/admin/terenni` zůstává platná cesta, jen
 * přestala být VÝCHOZÍ landing page). Ostatní role beze změny.
 */
export function homePathForRole(role) {
  if (role === 'klicova_osoba') return '/';
  return dashboardPathForRole(role);
}

/**
 * Role, které smí jen ČÍST karty rodin/dětí (nikdy zápis/editace) — UI
 * skrývá zápisové akce, firestore.rules to navíc vynucují (rozhodnutí
 * 2026-07-03, docs/INVENTAR.md). `vedouci_pobocky`/`teamleader` vidí tým
 * (TeamDashboard) a mohou prokliknout do detailu, ale jen ke čtení.
 */
export function isReadOnlyManager(role) {
  return role === 'vedouci_pobocky' || role === 'teamleader';
}

const ROLE_LABELS = {
  superadmin: 'SaaS Superadmin',
  org_admin: 'Org. Admin',
  vedouci_pobocky: 'Vedoucí pobočky',
  teamleader: 'Teamleader',
  klicova_osoba: 'Klíčová osoba',
  pestoun: 'Pěstoun',
  external: 'Externí účastník',
};

/** Role pěstouna — omezená appka `/moje/*` (docs/domain/chat-a-pestounska-appka.md). */
export function isFoster(role) {
  return role === 'pestoun';
}

/** Role externího účastníka — appka `/ucastnik/*` (docs/domain/externi-ucastnici.md). */
export function isExternal(role) {
  return role === 'external';
}

/** Lidský popisek role pro zobrazení v UI (topbar dropdown, mobilní Profil). */
export function roleLabel(role) {
  return ROLE_LABELS[role] ?? role;
}
