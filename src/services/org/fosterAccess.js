/**
 * org/fosterAccess.js — pozvání pěstouna do jeho appky (2026-07-06,
 * docs/domain/chat-a-pestounska-appka.md). Vytvoří pěstounovi Auth účet
 * (role `pestoun`) navázaný na jeho rodinu a doplní jeho uid do
 * `foster_families/{id}.fosterUserIds` — jediné pole, přes které pravidla
 * poznají „tenhle pěstoun smí vidět tuhle rodinu".
 *
 * Účet se zakládá stejným trikem jako `createEmployee` (sekundární Firebase
 * App instance) — nepřihlásí pěstouna místo aktuální KO. V8/produkce =
 * Cloud Function s Admin SDK a pozvánkovým e-mailem.
 */

import { initializeApp, deleteApp } from 'firebase/app';
import {
  getAuth, createUserWithEmailAndPassword, signOut as secondarySignOut, sendSignInLinkToEmail,
} from 'firebase/auth';
import { doc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { auth, db, firebaseConfig } from '../firebase.js';
import { createMeta, meta } from './shared.js';

// ── Magic-link pozvánka (2026-07-06 §A) — preferovaná cesta ──────
// Pěstoun se hlásí jednorázovým e-mailovým odkazem, žádné trvalé heslo;
// jeden mechanismus napříč web/PWA/nativní appky (Firebase email-link).

const EMAIL_FOR_SIGNIN_KEY = 'doprovazeni:emailForSignIn';

function invitationId(email) {
  return email.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');
}

/** Vydá/aktualizuje pozvánku pěstouna (idempotentně dle e-mailu). Vrací id. */
export async function createFosterInvitation({ email, displayName, phone = '', fosterFamilyId, organizationId }) {
  if (!fosterFamilyId || !organizationId) throw new Error('Chybí vazba na rodinu nebo organizaci.');
  const clean = email.trim().toLowerCase();
  const id = invitationId(clean);
  await setDoc(doc(db, 'foster_invitations', id), {
    email: clean, displayName, phone, role: 'pestoun',
    fosterFamilyId, organizationId, status: 'pending', ...createMeta(),
  }, { merge: true });
  return id;
}

/** Odešle jednorázový přihlašovací odkaz na e-mail (KO zůstává přihlášená). */
export async function sendFosterMagicLink(email, channel = 'email') {
  if (channel !== 'email') {
    // SMS (Firebase Phone Auth) / WhatsApp (poskytovatel + custom token) = placené
    // kanály, DOMYSLET později (docs/domain/dokumenty-workflow-a-prihlaseni.md §A).
    throw new Error('Zatím je k dispozici jen e-mailový odkaz. SMS/WhatsApp přibudou.');
  }
  const clean = email.trim().toLowerCase();
  await sendSignInLinkToEmail(auth, clean, {
    url: `${window.location.origin}/prihlaseni`,
    handleCodeInApp: true,
  });
  // Firebase vyžaduje e-mail při dokončení; uložíme pro případ stejného zařízení.
  try { window.localStorage.setItem(EMAIL_FOR_SIGNIN_KEY, clean); } catch { /* private mode */ }
}

/** Pozvat pěstouna odkazem = vytvořit pozvánku + poslat odkaz (jedno volání pro UI). */
export async function inviteFosterByLink(input) {
  await createFosterInvitation(input);
  await sendFosterMagicLink(input.email);
}

export const emailForSignInKey = EMAIL_FOR_SIGNIN_KEY;

/**
 * @param {{email,password,displayName,phone?,fosterFamilyId,organizationId}} input
 * @returns {Promise<string>} uid nově založeného pěstounského účtu
 */
export async function inviteFoster({ email, password, displayName, phone = '', fosterFamilyId, organizationId }) {
  if (!fosterFamilyId || !organizationId) throw new Error('Chybí vazba na rodinu nebo organizaci.');
  const secondaryApp = initializeApp(firebaseConfig, `secondary-${Date.now()}`);
  try {
    const secondaryAuth = getAuth(secondaryApp);
    const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    const uid = cred.user.uid;

    await setDoc(doc(db, 'users', uid), {
      email,
      displayName,
      phone,
      role: 'pestoun',
      organizationId,
      fosterFamilyId,       // rodina, kterou pěstoun spravuje (jeho jediný rozsah)
      active: true,
      ...createMeta(),
    });

    // Zpřístupní rodinu pěstounovi (pravidla čtou fosterUserIds).
    await updateDoc(doc(db, 'foster_families', fosterFamilyId), {
      fosterUserIds: arrayUnion(uid),
      ...meta(),
    });

    await secondarySignOut(secondaryAuth);
    return uid;
  } finally {
    await deleteApp(secondaryApp);
  }
}
