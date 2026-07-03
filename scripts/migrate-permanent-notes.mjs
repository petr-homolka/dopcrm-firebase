#!/usr/bin/env node
/**
 * scripts/migrate-permanent-notes.mjs — audit nález #1 (docs/INVENTAR.md §11)
 *
 * Přesune `children/{id}.permanentNotes[]` (pole na dokumentu) do podkolekce
 * `children/{id}/permanentNotes/{noteId}` a pole na rodičovském dokumentu
 * smaže. Idempotentní: dítě, které pole permanentNotes nemá (undefined nebo
 * prázdné), přeskočí beze změny; opakované spuštění po dokončené migraci
 * nic nedělá (pole už neexistuje).
 *
 * Vyžaduje stejné .env.local jako scripts/dev-seed.mjs (VITE_FIREBASE_*,
 * SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD) — přihlašuje se jako superadmin,
 * aby zápis prošel přes firestore.rules stejně jako v appce.
 *
 * Použití:
 *   node scripts/migrate-permanent-notes.mjs           (provede migraci)
 *   node scripts/migrate-permanent-notes.mjs --dry-run  (jen vypíše, co by udělal)
 */

import { config as loadEnv } from 'dotenv';
loadEnv({ path: new URL('../.env.local', import.meta.url) });

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import {
  getFirestore, collection, doc, getDocs, addDoc, updateDoc, deleteField, serverTimestamp,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`Chybí ${name} v .env.local. Doplňte a zkuste znovu.`);
    process.exit(1);
  }
  return value;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');

  for (const key of ['VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_PROJECT_ID']) requireEnv(key);
  const adminEmail = requireEnv('SEED_ADMIN_EMAIL');
  const adminPassword = requireEnv('SEED_ADMIN_PASSWORD');

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  console.log(`Přihlašuji se jako ${adminEmail}…`);
  await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
  console.log('Přihlášeno.' + (dryRun ? ' (--dry-run, nic se nezapíše)' : ''));

  const snap = await getDocs(collection(db, 'children'));
  let migratedChildren = 0;
  let migratedNotes = 0;

  for (const childDoc of snap.docs) {
    const data = childDoc.data();
    const notes = data.permanentNotes;
    if (!Array.isArray(notes) || notes.length === 0) continue;

    console.log(`Dítě ${childDoc.id} (${data.firstName ?? '?'} ${data.lastName ?? ''}): ${notes.length} poznámek`);

    if (!dryRun) {
      for (const note of notes) {
        await addDoc(collection(db, 'children', childDoc.id, 'permanentNotes'), {
          text: note.text ?? '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: note.by ?? 'migration',
          updatedBy: note.by ?? 'migration',
          // Původní čas zápisu zachován jako doplňkové pole — serverTimestamp výše
          // odráží čas MIGRACE, ne původního zápisu (ten přesně neznáme, `at` byl
          // jen ISO string z klienta, ne server-side timestamp).
          migratedFromAt: note.at ?? null,
        });
        migratedNotes += 1;
      }
      await updateDoc(doc(db, 'children', childDoc.id), { permanentNotes: deleteField() });
    }
    migratedChildren += 1;
  }

  console.log(
    `\n${dryRun ? 'Bylo by přesunuto' : 'Přesunuto'}: ${migratedNotes} poznámek u ${migratedChildren} dětí.`
  );

  await signOut(auth);
  process.exit(0);
}

main().catch((err) => {
  console.error('Chyba:', err.message ?? err);
  process.exit(1);
});
