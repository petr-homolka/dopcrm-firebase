/**
 * Auth service — Doprovázení CRM (MVP)
 *
 * BEZPEČNOSTNÍ PRAVIDLO:
 *   Role a oprávnění se NIKDY nečtou z Firebase Custom Claims (id token).
 *   Custom Claims jsou snadno zastaralé (token má 1h TTL) a obcházejí
 *   Firestore Rules. Jediný zdroj pravdy: Firestore user_roles/{uid}.
 *
 * Flow:
 *   1. Firebase Auth ověří identitu (kdo jsi).
 *   2. Firestore user_roles/{uid} určí co smíš dělat.
 *   3. Firestore Rules to znovu ověří na serveru (defense-in-depth).
 */

import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebase.js';

// Granulární oprávnění per role (musí odpovídat ROLE_CAPS v App.js)
const ROLE_CAPS = {
  superadmin: [
    'sensitive.view','contacts.edit','contacts.delete','notes.add',
    'docs.upload','docs.delete','tasks.manage','reports.generate',
    'settings.access','settings.branding','users.manage','roles.manage','templates.manage',
  ],
  vedeni:    ['sensitive.view','contacts.edit','notes.add','docs.upload','tasks.manage','reports.generate','settings.access','settings.branding','users.manage','roles.manage'],
  ko:        ['sensitive.view','contacts.edit','notes.add','docs.upload','tasks.manage','reports.generate'],
  asistent:  ['notes.add','docs.upload','tasks.manage'],
  pestoun:   ['docs.upload'],
  dite:      [],
  externista:[],
};

// In-memory cache aktuálního uživatele + jeho role
let _currentUser  = null;
let _currentRole  = null;
let _roleUnsub    = null;

/**
 * Načte roli z Firestore user_roles/{uid}.
 * NIKDY nepoužívá Custom Claims.
 */
async function fetchUserRole(uid) {
  const snap = await getDoc(doc(db, 'user_roles', uid));
  if (!snap.exists()) {
    console.warn(`[Auth] user_roles/${uid} neexistuje — přiřazena výchozí role 'ko'.`);
    return { role: 'ko', tenantId: null, scope: 'own', caps: ROLE_CAPS.ko, assignedFamilies: [] };
  }
  const data = snap.data();
  // caps se ukládají do Firestore, ale pro jistotu padneme zpět na ROLE_CAPS konstantu
  return {
    ...data,
    caps: data.caps ?? ROLE_CAPS[data.role] ?? [],
  };
}

/**
 * Real-time subscription na změny role (superadmin může měnit role za běhu).
 */
function subscribeUserRole(uid, onChange) {
  return onSnapshot(doc(db, 'user_roles', uid), (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      _currentRole = { ...data, caps: data.caps ?? ROLE_CAPS[data.role] ?? [] };
      onChange?.(_currentRole);
    }
  });
}

/**
 * Přihlášení e-mailem + heslem.
 * Po přihlášení se role načte z Firestore (ne z tokenu).
 */
export async function signIn(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  _currentUser = cred.user;
  _currentRole = await fetchUserRole(cred.user.uid);
  _roleUnsub?.();
  _roleUnsub = subscribeUserRole(cred.user.uid, (role) => { _currentRole = role; });
  return { user: _currentUser, role: _currentRole };
}

export async function signOut() {
  _roleUnsub?.();
  _currentUser = null;
  _currentRole = null;
  await firebaseSignOut(auth);
}

/**
 * Bootstrap — zavolej při startu aplikace.
 * Obnoví session při refresh stránky (Firebase Auth je persistentní).
 */
export function initAuth(onUserChange) {
  return onAuthStateChanged(auth, async (user) => {
    _roleUnsub?.();
    if (user) {
      _currentUser = user;
      _currentRole = await fetchUserRole(user.uid);
      _roleUnsub = subscribeUserRole(user.uid, (role) => {
        _currentRole = role;
        onUserChange?.({ user: _currentUser, role: _currentRole });
      });
      onUserChange?.({ user: _currentUser, role: _currentRole });
    } else {
      _currentUser = null;
      _currentRole = null;
      onUserChange?.(null);
    }
  });
}

// ── Synchronní helpery (pro komponenty, po initAuth) ─────────

export function currentUser()    { return _currentUser; }
export function currentRole()    { return _currentRole; }
export function currentTenantId(){ return _currentRole?.tenantId ?? null; }

/** Zkontroluje granulární oprávnění z Firestore role (ne z Custom Claims). */
export function can(cap) {
  return Array.isArray(_currentRole?.caps) && _currentRole.caps.includes(cap);
}

export function hasRole(roleKey) {
  return _currentRole?.role === roleKey;
}

export function scopeOf() {
  return _currentRole?.scope ?? 'own';
}
