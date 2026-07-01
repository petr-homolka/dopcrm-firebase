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
    case 'superadmin':    return '/admin/superadmin';
    case 'org_admin':     return '/admin/organizace';
    case 'klicova_osoba': return '/admin/terenni';
    default:              return '/prehled';
  }
}
