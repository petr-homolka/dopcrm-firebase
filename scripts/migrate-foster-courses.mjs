#!/usr/bin/env node
/**
 * scripts/migrate-foster-courses.mjs — audit nález #4 (docs/INVENTAR.md §11)
 *
 * Přesune `foster_families/{id}.fosters[].courses[]` (pole vnořené v poli
 * na dokumentu) do podkolekce `foster_families/{id}/fosterCourses/{courseId}`
 * s polem `personId` odkazujícím na konkrétní osobu ve `fosters[]`, a klíč
 * `courses` z každé položky `fosters[]` odstraní. Idempotentní — viz
 * migrate-permanent-notes.mjs pro plné vysvětlení použití/env proměnných.
 *
 * Použití:
 *   node scripts/migrate-foster-courses.mjs
 *   node scripts/migrate-foster-courses.mjs --dry-run
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

  const snap = await getDocs(collection(db, 'foster_families'));
  let migratedFamilies = 0;
  let migratedCourses = 0;

  for (const familyDoc of snap.docs) {
    const data = familyDoc.data();
    const fosters = Array.isArray(data.fosters) ? data.fosters : [];
    const totalCourses = fosters.reduce((sum, p) => sum + (Array.isArray(p.courses) ? p.courses.length : 0), 0);
    if (totalCourses === 0) continue;

    console.log(`Rodina ${familyDoc.id} (${data.name ?? '?'}): ${totalCourses} kurzů u ${fosters.length} pěstounů`);

    if (!dryRun) {
      for (const person of fosters) {
        for (const course of person.courses ?? []) {
          await addDoc(collection(db, 'foster_families', familyDoc.id, 'fosterCourses'), {
            personId: person.id,
            kod: course.kod ?? '',
            kde: course.kde ?? '',
            kdy: course.kdy ?? null,
            forma: course.forma ?? '',
            poradatel: course.poradatel ?? '',
            hodiny: Number(course.hodiny) || 0,
            certifikat: !!course.certifikat,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdBy: 'migration',
            updatedBy: 'migration',
          });
          migratedCourses += 1;
        }
      }
      // `courses` klíč z každé osoby ve fosters[] odstraníme, zbytek osoby zůstává.
      const fostersWithoutCourses = fosters.map(({ courses: _drop, ...person }) => person);
      await updateDoc(doc(db, 'foster_families', familyDoc.id), { fosters: fostersWithoutCourses });
    }
    migratedFamilies += 1;
  }

  console.log(
    `\n${dryRun ? 'Bylo by přesunuto' : 'Přesunuto'}: ${migratedCourses} kurzů u ${migratedFamilies} rodin.`
  );

  await signOut(auth);
  process.exit(0);
}

main().catch((err) => {
  console.error('Chyba:', err.message ?? err);
  process.exit(1);
});
