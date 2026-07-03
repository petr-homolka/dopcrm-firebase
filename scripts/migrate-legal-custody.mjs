#!/usr/bin/env node
/**
 * scripts/migrate-legal-custody.mjs — Krok 2 právního modelu (docs/domain/
 * druhy-pece-a-odmeny.md, docs/domain/vztahy-a-osoby.md, 2026-07-03)
 *
 * Idempotentní backfill pro existující rodiny/děti, které vznikly PŘED touto
 * změnou schématu (nemají `custody`/`agreement`/`remuneration`):
 *
 * 0. `foster_families.fosters[]` bez `id` (seedované přes dev-seed.mjs, které
 *    id negenerovalo) → doplní stabilní id, jinak by na ně `custody.caregivers`
 *    neměl jak odkázat.
 * 1. `foster_families` bez `agreement` → doplní { scope: 'spolecna',
 *    signatories: <id všech fosters[]>, separationDecision: null }.
 * 2. `foster_families` bez `remuneration` → doplní { mode: 'single',
 *    recipients: [<id prvního fostera>] }.
 * 3. `children` bez `custody` → doplní podle počtu pěstounů rodičovské
 *    rodiny: 2 pěstouni → { type: 'spolecne', caregivers: [oba] }, jinak
 *    { type: 'individualni', caregivers: [první, pokud existuje] }.
 * 4. Demo „partner bez svěření“: první dítě první rodiny s PRÁVĚ JEDNÍM
 *    pěstounem a bez existujícího záznamu `rel: 'partner_pestouna'` dostane
 *    do `relatives[]` ukázkový záznam partnera pěstouna bez svěření.
 *
 * Použití:
 *   node scripts/migrate-legal-custody.mjs --dry-run
 *   node scripts/migrate-legal-custody.mjs
 */

import { config as loadEnv } from 'dotenv';
loadEnv({ path: new URL('../.env.local', import.meta.url) });

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, doc, getDocs, updateDoc } from 'firebase/firestore';

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

function genRelId() {
  return `rel${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
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

  const familiesSnap = await getDocs(collection(db, 'foster_families'));
  let familiesUpdated = 0;
  let demoPartnerAdded = false;

  for (const familyDoc of familiesSnap.docs) {
    const data = familyDoc.data();
    const rawFosters = Array.isArray(data.fosters) ? data.fosters : [];
    const missingIds = rawFosters.some((p) => !p.id);
    const fosters = missingIds
      ? rawFosters.map((p) => (p.id ? p : { ...p, id: genRelId() }))
      : rawFosters;
    const ids = fosters.map((p) => p.id).filter(Boolean);
    const patch = {};

    if (missingIds) {
      console.log(`Rodina ${familyDoc.id} (${data.name ?? '?'}): doplňuji chybějící id u ${fosters.length} pěstounů`);
      patch.fosters = fosters;
    }

    if (!data.agreement) {
      patch.agreement = { scope: 'spolecna', signatories: ids, separationDecision: null };
    }
    if (!data.remuneration) {
      patch.remuneration = { mode: 'single', recipients: ids.slice(0, 1) };
    }

    if (Object.keys(patch).length > 0) {
      console.log(`Rodina ${familyDoc.id} (${data.name ?? '?'}): doplňuji ${Object.keys(patch).join(', ')}`);
      if (!dryRun) await updateDoc(doc(db, 'foster_families', familyDoc.id), patch);
      familiesUpdated += 1;
    }

    const childrenSnap = await getDocs(collection(db, 'children'));
    const familyChildren = childrenSnap.docs.filter((c) => c.data().fosterFamilyId === familyDoc.id);

    for (const childDoc of familyChildren) {
      const child = childDoc.data();
      if (child.custody) continue;
      const custody = ids.length >= 2
        ? { type: 'spolecne', caregivers: ids.slice(0, 2), court: '', caseNumber: '', decidedAt: null }
        : { type: 'individualni', caregivers: ids.slice(0, 1), court: '', caseNumber: '', decidedAt: null };
      console.log(`  Dítě ${childDoc.id} (${child.firstName ?? '?'} ${child.lastName ?? ''}): custody.type=${custody.type}`);
      if (!dryRun) await updateDoc(doc(db, 'children', childDoc.id), { custody });
    }

    // Demo: partner pěstouna bez svěření — první rodina s přesně 1 pěstounem
    // a alespoň 1 dítětem bez existujícího záznamu partner_pestouna.
    if (!demoPartnerAdded && ids.length === 1 && familyChildren.length > 0) {
      const targetChild = familyChildren[0];
      const relatives = Array.isArray(targetChild.data().relatives) ? targetChild.data().relatives : [];
      const alreadyHas = relatives.some((r) => r.rel === 'partner_pestouna');
      if (!alreadyHas) {
        console.log(
          `  Demo partner_pestouna → dítě ${targetChild.id} (${targetChild.data().firstName ?? '?'}), rodina ${data.name ?? familyDoc.id}`
        );
        const newRelative = {
          id: genRelId(),
          name: 'Petr Novák (demo)',
          rc: '',
          rel: 'partner_pestouna',
          legal: false,
          phone: '',
          email: '',
          note: 'Demo (Krok 2, 2026-07-03): partner pěstounky, žije v domácnosti, není součástí svěření tohoto dítěte.',
        };
        if (!dryRun) {
          await updateDoc(doc(db, 'children', targetChild.id), { relatives: [...relatives, newRelative] });
        }
        demoPartnerAdded = true;
      }
    }
  }

  console.log(
    `\n${dryRun ? 'Bylo by upraveno' : 'Upraveno'}: ${familiesUpdated} rodin (agreement/remuneration)` +
    `${demoPartnerAdded ? ', demo partner_pestouna přidán.' : ', demo partner_pestouna nebyl přidán (buď už existuje, nebo nenalezena vhodná rodina).'}`
  );

  await signOut(auth);
  process.exit(0);
}

main().catch((err) => {
  console.error('Chyba:', err.message ?? err);
  process.exit(1);
});
