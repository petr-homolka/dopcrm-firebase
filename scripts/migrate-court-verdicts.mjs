#!/usr/bin/env node
/**
 * scripts/migrate-court-verdicts.mjs — audit nález #3 (docs/INVENTAR.md §11)
 *
 * Přesune `children/{id}.courtCase.rozsudky[]` do podkolekce
 * `children/{id}/courtVerdicts/{verdictId}` a klíč `rozsudky` z objektu
 * `courtCase` na rodičovském dokumentu odstraní (courtCase samotný — spisová
 * značka, soud, kontaktní osoba — na dokumentu ZŮSTÁVÁ, je to identita spisu,
 * ne rostoucí historie). Idempotentní — viz migrate-permanent-notes.mjs pro
 * plné vysvětlení použití/env proměnných.
 *
 * Použití:
 *   node scripts/migrate-court-verdicts.mjs
 *   node scripts/migrate-court-verdicts.mjs --dry-run
 */

import { config as loadEnv } from 'dotenv';
loadEnv({ path: new URL('../.env.local', import.meta.url) });

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import {
  getFirestore, collection, doc, getDocs, addDoc, updateDoc, serverTimestamp,
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
  let migratedVerdicts = 0;

  for (const childDoc of snap.docs) {
    const data = childDoc.data();
    const rozsudky = data.courtCase?.rozsudky;
    if (!Array.isArray(rozsudky) || rozsudky.length === 0) continue;

    console.log(`Dítě ${childDoc.id} (${data.firstName ?? '?'} ${data.lastName ?? ''}): ${rozsudky.length} rozsudků`);

    if (!dryRun) {
      for (const verdict of rozsudky) {
        await addDoc(collection(db, 'children', childDoc.id, 'courtVerdicts'), {
          datum: verdict.datum ?? '',
          popis: verdict.popis ?? '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: 'migration',
          updatedBy: 'migration',
        });
        migratedVerdicts += 1;
      }
      // courtCase samotný zůstává (spisZnacka/soudNazev/soudAdresa/kontaktniOsoba),
      // jen se z něj odstraní klíč `rozsudky` — proto celý objekt přepíšeme bez něj.
      const { rozsudky: _drop, ...courtCaseWithoutVerdicts } = data.courtCase;
      await updateDoc(doc(db, 'children', childDoc.id), { courtCase: courtCaseWithoutVerdicts });
    }
    migratedChildren += 1;
  }

  console.log(
    `\n${dryRun ? 'Bylo by přesunuto' : 'Přesunuto'}: ${migratedVerdicts} rozsudků u ${migratedChildren} dětí.`
  );

  await signOut(auth);
  process.exit(0);
}

main().catch((err) => {
  console.error('Chyba:', err.message ?? err);
  process.exit(1);
});
