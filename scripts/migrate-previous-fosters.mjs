#!/usr/bin/env node
/**
 * scripts/migrate-previous-fosters.mjs — audit nález #2 (docs/INVENTAR.md §11)
 *
 * Přesune `children/{id}.previousFosters[]` (pole na dokumentu) do podkolekce
 * `children/{id}/previousFosters/{entryId}` a pole na rodičovském dokumentu
 * smaže. Idempotentní stejně jako migrate-permanent-notes.mjs — viz tam pro
 * plné vysvětlení použití/env proměnných.
 *
 * Použití:
 *   node scripts/migrate-previous-fosters.mjs
 *   node scripts/migrate-previous-fosters.mjs --dry-run
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
  let migratedEntries = 0;

  for (const childDoc of snap.docs) {
    const data = childDoc.data();
    const entries = data.previousFosters;
    if (!Array.isArray(entries) || entries.length === 0) continue;

    console.log(`Dítě ${childDoc.id} (${data.firstName ?? '?'} ${data.lastName ?? ''}): ${entries.length} předchozích umístění`);

    if (!dryRun) {
      for (const entry of entries) {
        await addDoc(collection(db, 'children', childDoc.id, 'previousFosters'), {
          name: entry.name ?? '',
          from: entry.from ?? '',
          to: entry.to ?? '',
          note: entry.note ?? '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: 'migration',
          updatedBy: 'migration',
        });
        migratedEntries += 1;
      }
      await updateDoc(doc(db, 'children', childDoc.id), { previousFosters: deleteField() });
    }
    migratedChildren += 1;
  }

  console.log(
    `\n${dryRun ? 'Bylo by přesunuto' : 'Přesunuto'}: ${migratedEntries} záznamů u ${migratedChildren} dětí.`
  );

  await signOut(auth);
  process.exit(0);
}

main().catch((err) => {
  console.error('Chyba:', err.message ?? err);
  process.exit(1);
});
