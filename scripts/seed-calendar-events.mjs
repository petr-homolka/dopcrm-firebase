#!/usr/bin/env node
/**
 * scripts/seed-calendar-events.mjs — testovací data pro Kalendář na Sekci B
 * (audit nálezu #5, docs/INVENTAR.md §11). Sekce A neměla žádný kalendář s
 * reálnými daty k migraci (staré `db.js` řešilo jen `timeline`/chatové
 * zápisy, ne kalendářní události) — jde tedy o ČERSTVÝ seed, ne migraci.
 *
 * Pro každou existující organizaci vytvoří:
 *   - 1 org-wide "poradu" (meeting) bez vazby na rodinu, přiřazenou org_adminovi
 *   - pro každou pěstounskou rodinu 1 "návštěvu" (visit) přiřazenou její KO,
 *     se subjectRefs na rodinu + její svěřené děti
 *
 * Vyžaduje stejné .env.local jako scripts/dev-seed.mjs — spustit AŽ PO
 * `npm run seed` (potřebuje existující organizace/rodiny/zaměstnance).
 *
 * Použití:
 *   node scripts/seed-calendar-events.mjs
 *   node scripts/seed-calendar-events.mjs --dry-run
 */

import { config as loadEnv } from 'dotenv';
loadEnv({ path: new URL('../.env.local', import.meta.url) });

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import {
  getFirestore, collection, doc, getDocs, addDoc, query, where, serverTimestamp, Timestamp,
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

function daysFromNow(n, hour = 10) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(hour, 0, 0, 0);
  return Timestamp.fromDate(d);
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

  const orgsSnap = await getDocs(collection(db, 'organizations'));
  if (orgsSnap.empty) {
    console.error('Žádné organizace v databázi — spusťte nejdřív `npm run seed`.');
    process.exit(1);
  }

  let createdCount = 0;

  for (const orgDoc of orgsSnap.docs) {
    const orgId = orgDoc.id;
    const orgName = orgDoc.data().name ?? orgId;

    const usersSnap = await getDocs(query(collection(db, 'users'), where('organizationId', '==', orgId)));
    const orgAdmin = usersSnap.docs.find((d) => d.data().role === 'org_admin');
    const familiesSnap = await getDocs(query(collection(db, 'foster_families'), where('organizationId', '==', orgId)));

    console.log(`\n${orgName}: ${familiesSnap.docs.length} rodin`);

    if (orgAdmin) {
      console.log(`  + porada (org-wide, ${orgAdmin.data().displayName})`);
      if (!dryRun) {
        await addDoc(collection(db, 'organizations', orgId, 'events'), {
          title: 'Týmová porada',
          type: 'meeting',
          start: daysFromNow(2, 9),
          end: daysFromNow(2, 10),
          allDay: false,
          location: 'Kancelář DO',
          note: '',
          assignedTo: orgAdmin.id,
          fosterFamilyId: null,
          subjectRefs: [{ type: 'user', id: orgAdmin.id }],
          status: 'scheduled',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: myUid,
          updatedBy: myUid,
        });
        createdCount += 1;
      }
    }

    let dayOffset = 3;
    for (const familyDoc of familiesSnap.docs) {
      const family = familyDoc.data();
      if (!family.assignedTo) continue;

      const childrenSnap = await getDocs(
        query(collection(db, 'children'), where('fosterFamilyId', '==', familyDoc.id))
      );
      const subjectRefs = [
        { type: 'family', id: familyDoc.id },
        ...childrenSnap.docs.map((c) => ({ type: 'child', id: c.id })),
      ];

      console.log(`  + návštěva rodiny ${family.name} (${dayOffset} dní dopředu)`);
      if (!dryRun) {
        await addDoc(collection(db, 'organizations', orgId, 'events'), {
          title: `Návštěva — ${family.name}`,
          type: 'visit',
          start: daysFromNow(dayOffset, 13),
          end: daysFromNow(dayOffset, 14),
          allDay: false,
          location: family.address ?? '',
          note: '',
          assignedTo: family.assignedTo,
          fosterFamilyId: familyDoc.id,
          subjectRefs,
          status: 'scheduled',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: myUid,
          updatedBy: myUid,
        });
        createdCount += 1;
      }
      dayOffset += 2;
    }
  }

  console.log(`\n${dryRun ? 'Bylo by vytvořeno' : 'Vytvořeno'}: ${createdCount} událostí.`);

  await signOut(auth);
  process.exit(0);
}

main().catch((err) => {
  console.error('Chyba:', err.message ?? err);
  process.exit(1);
});
