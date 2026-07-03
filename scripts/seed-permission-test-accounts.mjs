#!/usr/bin/env node
/**
 * scripts/seed-permission-test-accounts.mjs — doplňuje dva demo účty, které
 * chyběly pro plné živé ověření oprávnění timeline modulu (docs/domain/
 * timeline.md §5 bod 7, `docs/INVENTAR.md` sekce Osa):
 *
 * 1. `demo.superadmin@doprovazeni.dev` (role superadmin) — negativní případ:
 *    superadmin nesmí zapisovat/pinovat do timeline (nepracuje s klientskými
 *    daty rodin).
 * 2. `demo.vedouci.jih@doprovazeni.dev` (role vedouci_pobocky, Demo
 *    organizace Jih, BEZ přiřazené rodiny) — čte (sameOrg), ale NESMÍ
 *    zapisovat do timeline (`canWriteTimeline()` povoluje jen org_admin
 *    a přiřazenou klíčovou osobu, ne širší `isManagement()`).
 *
 * Idempotentní stejně jako dev-seed.mjs (createUserWithEmailAndPassword →
 * fallback na signIn, pokud účet už existuje) — bezpečné spustit opakovaně.
 * NEZAKLÁDÁ žádné rodiny/děti, jen dva uživatelské profily.
 *
 * Použití:
 *   node scripts/seed-permission-test-accounts.mjs --dry-run
 *   node scripts/seed-permission-test-accounts.mjs
 */

import { config as loadEnv } from 'dotenv';
loadEnv({ path: new URL('../.env.local', import.meta.url) });

import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, doc, getDocs, query, where, setDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const DEMO_PASSWORD = 'Demo1234!';

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`Chybí ${name} v .env.local. Doplňte a zkuste znovu.`);
    process.exit(1);
  }
  return value;
}

/** Založí (nebo najde) demo Auth účet a přepíše jeho users/{uid} profil — 1:1 vzor z dev-seed.mjs. */
async function createOrGetDemoUser(db, myUid, { email, displayName, role, organizationId, department, rc = '' }) {
  const secondaryApp = initializeApp(firebaseConfig, `perm-seed-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  try {
    const secondaryAuth = getAuth(secondaryApp);
    let uid;
    try {
      const cred = await createUserWithEmailAndPassword(secondaryAuth, email, DEMO_PASSWORD);
      uid = cred.user.uid;
    } catch (err) {
      if (err.code !== 'auth/email-already-in-use') throw err;
      const cred = await signInWithEmailAndPassword(secondaryAuth, email, DEMO_PASSWORD);
      uid = cred.user.uid;
    }

    await setDoc(doc(db, 'users', uid), {
      email, displayName, rc, role, organizationId, department, active: true,
      createdAt: serverTimestamp(), updatedAt: serverTimestamp(), createdBy: myUid, updatedBy: myUid,
    });

    await signOut(secondaryAuth);
    return uid;
  } finally {
    await deleteApp(secondaryApp);
  }
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
  const cred = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
  const myUid = cred.user.uid;
  console.log('Přihlášeno.' + (dryRun ? ' (--dry-run, nic se nezapíše)' : ''));

  const orgsSnap = await getDocs(query(collection(db, 'organizations'), where('name', '==', 'Demo organizace Jih')));
  if (orgsSnap.empty) {
    console.error('Organizace "Demo organizace Jih" nenalezena — spusťte nejdřív npm run seed.');
    process.exit(1);
  }
  const jihOrgId = orgsSnap.docs[0].id;

  console.log(`1) demo.superadmin@doprovazeni.dev — role superadmin, organizationId: null`);
  console.log(`2) demo.vedouci.jih@doprovazeni.dev — role vedouci_pobocky, org Jih (${jihOrgId}), bez přiřazené rodiny`);

  if (!dryRun) {
    await createOrGetDemoUser(db, myUid, {
      email: 'demo.superadmin@doprovazeni.dev', displayName: 'Superadmin Testovací',
      role: 'superadmin', organizationId: null, department: null,
    });
    await createOrGetDemoUser(db, myUid, {
      email: 'demo.vedouci.jih@doprovazeni.dev', displayName: 'Vendula Vedoucí',
      role: 'vedouci_pobocky', organizationId: jihOrgId, department: 'management',
    });
    console.log(`\nHotovo. Heslo obou účtů: ${DEMO_PASSWORD}`);
  } else {
    console.log('\n(dry-run — nic založeno)');
  }

  await signOut(auth);
  process.exit(0);
}

main().catch((err) => {
  console.error('Chyba:', err.message ?? err);
  process.exit(1);
});
