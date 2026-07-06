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
import { getAuth, createUserWithEmailAndPassword, signOut as secondarySignOut } from 'firebase/auth';
import { doc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, firebaseConfig } from '../firebase.js';
import { createMeta, meta } from './shared.js';

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
