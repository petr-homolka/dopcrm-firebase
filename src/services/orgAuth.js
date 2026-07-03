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
} from 'firebase/auth';
import { auth } from './firebase.js';

export async function signIn(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
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
  return role === 'klicova_osoba' ? '/' : dashboardPathForRole(role);
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
