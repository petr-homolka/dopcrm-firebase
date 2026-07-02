#!/usr/bin/env node
/**
 * scripts/dev-seed.mjs — VÝVOJÁŘSKÝ nástroj pro testovací data
 *
 * ⚠️ ZÁMĚRNĚ MIMO src/ — nikdy není součástí `vite build` grafu (nic v src/
 * tenhle soubor neimportuje), takže NEMŮŽE skončit v produkčním bundlu na
 * moje.doprovazeni.com. Historie: první verze žila v src/services/
 * devSeedService.js a byla volaná dynamickým import() jen z UI zabaleného
 * v `{import.meta.env.DEV && ...}` — po ověření se ukázalo, že Vite/Rollup
 * dynamický import i tak zabalí do samostatného chunku v `dist/`, i když se
 * tlačítko nikdy nevykreslí. Zadání 2026-07-02 bylo jednoznačné ("v ostrém
 * provozu tam být nesmí a nebudou") — přesunuto sem, kde je to strukturálně
 * nemožné, ne jen "schované".
 *
 * Použití (z kořene pestouni-crm-prototyp):
 *   npm run seed        (nebo: node scripts/dev-seed.mjs seed)
 *   npm run seed:wipe    (nebo: node scripts/dev-seed.mjs wipe)
 *
 * Vyžaduje v .env.local (gitignored, stejný soubor jako VITE_FIREBASE_*):
 *   SEED_ADMIN_EMAIL=<váš superadmin e-mail>
 *   SEED_ADMIN_PASSWORD=<vaše superadmin heslo>
 * Skript se pod tímto účtem přihlásí — firestore.rules pak zápis/mazání
 * povolí přesně stejně, jako by je dělal přihlášený superadmin v appce.
 *
 * Omezení: Firebase Auth účty demo zaměstnanců nejde z klientského SDK
 * smazat (mazání cizích účtů = Admin SDK/Cloud Function, mimo rozsah
 * prototypu) — `wipe` maže jen Firestore dokumenty. `seed` je proto
 * idempotentní: pozná existující demo účty (přihlásí se do nich místo
 * založení) a jen jim přepíše Firestore profil, takže lze spouštět
 * opakovaně bez chyby "e-mail už existuje" a bez hromadění duplicit.
 */

// `dotenv/config` bez parametrů čte jen `.env` — tenhle projekt drží configy
// v `.env.local` (konvence sdílená s Vite, které .env.local načítá samo).
import { config as loadEnv } from 'dotenv';
loadEnv({ path: new URL('../.env.local', import.meta.url) });

import { initializeApp, deleteApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  addDoc,
  setDoc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const DEMO_PASSWORD = 'Demo1234!';

// Poznámka: RČ/IČO jsou VYMYŠLENÉ (neplatné kontrolní součty) — jen demo data.
const DEMO_ORGS = [
  {
    name: 'Demo organizace Sever',
    ico: '27604977',
    address: 'Kopeckého 15, Brno',
    contactEmail: 'info@sever.doprovazeni.dev',
    contactPhone: '+420 511 222 333',
    status: 'active',
    plan: 'pro',
    orgAdmin: { email: 'demo.admin.sever@doprovazeni.dev', displayName: 'Adéla Adminová', rc: '855612/1234' },
    kos: [
      { email: 'demo.ko.sever.1@doprovazeni.dev', displayName: 'Karolína Klíčová', rc: '905423/5678' },
      { email: 'demo.ko.sever.2@doprovazeni.dev', displayName: 'Kryštof Klíčový', rc: '881015/9012' },
    ],
    families: [
      {
        name: 'Rodina Nováková', koIndex: 0, careType: 'long',
        address: 'Teplice, Čelakovského 772/3', contactPhone: '+420 702 111 222',
        fosters: [{ name: 'Jana Nováková', rc: '775123/4567', phone: '+420 702 111 222', email: 'jana.novakova@example.cz' }],
        children: [
          {
            firstName: 'Tereza', lastName: 'Nováková', rc: '150312/6789', birthDate: '2015-03-12',
            relatives: [
              { name: 'Markéta Marková', rc: '900101/1111', rel: 'biomatka_mimo', legal: 'birth', note: 'styk 1× měsíčně' },
              { name: 'Petr Novák', rc: '880202/2222', rel: 'otec_nevlastni', legal: false, note: 'partner matky' },
              { name: 'Nela Svobodová', rc: '161120/3333', rel: 'sour_polo', legal: 'na', note: 'sdílí bio matku, jiná rodina' },
            ],
          },
          { firstName: 'Matěj', lastName: 'Novák', rc: '180701/4444', birthDate: '2018-07-01', relatives: [] },
        ],
      },
      {
        name: 'Rodina Svobodová', koIndex: 0, careType: 'temp',
        address: 'Brno, Lidická 12', contactPhone: '+420 604 555 666',
        fosters: [{ name: 'Petra Svobodová', rc: '820304/5555', phone: '+420 604 555 666', email: '' }],
        children: [
          {
            firstName: 'Nela', lastName: 'Svobodová', rc: '161120/3333', birthDate: '2016-11-20',
            relatives: [{ name: 'Markéta Marková', rc: '900101/1111', rel: 'biomatka_mimo', legal: 'birth', note: 'sdílí matku s Terezou Novákovou' }],
          },
        ],
      },
      {
        name: 'Rodina Dvořáková', koIndex: 1, careType: 'kin',
        address: 'Znojmo, Horní náměstí 8', contactPhone: '+420 725 777 888',
        fosters: [{ name: 'Hana Dvořáková', rc: '700615/6666', phone: '+420 725 777 888', email: '' }],
        children: [
          {
            firstName: 'Jakub', lastName: 'Dvořák', rc: '140509/7777', birthDate: '2014-05-09',
            relatives: [{ name: 'Hana Dvořáková', rc: '700615/6666', rel: 'prarodic', legal: false, note: 'babička, příbuzenská péče' }],
          },
        ],
      },
    ],
  },
  {
    name: 'Demo organizace Jih',
    ico: '02345678',
    address: 'Riegrova 4, České Budějovice',
    contactEmail: 'info@jih.doprovazeni.dev',
    contactPhone: '+420 387 111 222',
    status: 'trial',
    plan: 'starter',
    orgAdmin: { email: 'demo.admin.jih@doprovazeni.dev', displayName: 'Jana Jižní', rc: '840812/8888' },
    kos: [
      { email: 'demo.ko.jih.1@doprovazeni.dev', displayName: 'Kateřina Jižní', rc: '920518/9999' },
    ],
    families: [
      {
        name: 'Rodina Kučerová', koIndex: 0, careType: 'long',
        address: 'Písek, Budějovická 55', contactPhone: '+420 606 333 444',
        fosters: [
          { name: 'Alena Kučerová', rc: '790423/1010', phone: '+420 606 333 444', email: '' },
          { name: 'Roman Kučera', rc: '770311/2020', phone: '+420 606 333 445', email: '' },
        ],
        children: [
          {
            firstName: 'Eliška', lastName: 'Kučerová', rc: '170214/3030', birthDate: '2017-02-14',
            relatives: [{ name: 'Vojtěch Kučera', rc: '190930/4040', rel: 'sour_vlastni', legal: 'na', note: 'vlastní sourozenec, stejná rodina' }],
          },
          { firstName: 'Vojtěch', lastName: 'Kučera', rc: '190930/4040', birthDate: '2019-09-30', relatives: [] },
        ],
      },
    ],
  },
];

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`Chybí ${name} v .env.local. Doplňte a zkuste znovu.`);
    process.exit(1);
  }
  return value;
}

async function main() {
  const command = process.argv[2];
  if (!['seed', 'wipe'].includes(command)) {
    console.error('Použití: node scripts/dev-seed.mjs <seed|wipe>');
    process.exit(1);
  }

  for (const key of ['VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_PROJECT_ID']) requireEnv(key);
  const adminEmail = requireEnv('SEED_ADMIN_EMAIL');
  const adminPassword = requireEnv('SEED_ADMIN_PASSWORD');

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  console.log(`Přihlašuji se jako ${adminEmail}…`);
  const cred = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
  const myUid = cred.user.uid;
  console.log('Přihlášeno.');

  if (command === 'wipe') {
    await wipeAllData(db, myUid);
  } else {
    await wipeAllData(db, myUid);
    await seedDemoData(db, app, myUid);
  }

  await signOut(auth);
  process.exit(0);
}

async function deleteAllInCollection(db, collectionName, { exceptIds = [] } = {}) {
  const snap = await getDocs(collection(db, collectionName));
  const docsToDelete = snap.docs.filter((d) => !exceptIds.includes(d.id));
  for (let i = 0; i < docsToDelete.length; i += 450) {
    const batch = writeBatch(db);
    docsToDelete.slice(i, i + 450).forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
  return docsToDelete.length;
}

async function wipeAllData(db, myUid) {
  console.log('Mažu stará data…');
  const [organizations, users, fosterFamilies, children] = await Promise.all([
    deleteAllInCollection(db, 'organizations'),
    deleteAllInCollection(db, 'users', { exceptIds: [myUid] }),
    deleteAllInCollection(db, 'foster_families'),
    deleteAllInCollection(db, 'children'),
  ]);
  console.log(`  Smazáno: ${organizations} organizací, ${users} uživatelů, ${fosterFamilies} rodin, ${children} dětí.`);
}

/** Založí zaměstnance, nebo (pokud email už existuje z minulého seedu) se do něj jen přihlásí a přepíše profil. */
async function createOrGetDemoEmployee(db, primaryApp, myUid, { email, displayName, role, organizationId, department, rc = '' }) {
  const secondaryApp = initializeApp(firebaseConfig, `seed-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  try {
    const secondaryAuth = getAuth(secondaryApp);
    let uid;
    try {
      const secCred = await createUserWithEmailAndPassword(secondaryAuth, email, DEMO_PASSWORD);
      uid = secCred.user.uid;
    } catch (err) {
      if (err.code !== 'auth/email-already-in-use') throw err;
      const secCred = await signInWithEmailAndPassword(secondaryAuth, email, DEMO_PASSWORD);
      uid = secCred.user.uid;
    }

    await setDoc(doc(db, 'users', uid), {
      email,
      displayName,
      rc,
      role,
      organizationId,
      department,
      active: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: myUid,
      updatedBy: myUid,
    });

    await signOut(secondaryAuth);
    return uid;
  } finally {
    await deleteApp(secondaryApp);
  }
}

async function seedDemoData(db, app, myUid) {
  console.log('Generuji testovací data…');
  const accounts = [];

  for (const orgDef of DEMO_ORGS) {
    const orgRef = await addDoc(collection(db, 'organizations'), {
      name: orgDef.name,
      ico: orgDef.ico,
      address: orgDef.address,
      contactEmail: orgDef.contactEmail,
      contactPhone: orgDef.contactPhone,
      plan: orgDef.plan,
      status: orgDef.status,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: myUid,
      updatedBy: myUid,
    });

    await createOrGetDemoEmployee(db, app, myUid, {
      ...orgDef.orgAdmin,
      role: 'org_admin',
      organizationId: orgRef.id,
      department: 'management',
    });
    accounts.push({ ...orgDef.orgAdmin, role: 'org_admin', organization: orgDef.name });

    const koUids = [];
    for (const koDef of orgDef.kos) {
      const uid = await createOrGetDemoEmployee(db, app, myUid, {
        ...koDef,
        role: 'klicova_osoba',
        organizationId: orgRef.id,
        department: 'terenni',
      });
      koUids.push(uid);
      accounts.push({ ...koDef, role: 'klicova_osoba', organization: orgDef.name });
    }

    for (const familyDef of orgDef.families) {
      const familyRef = await addDoc(collection(db, 'foster_families'), {
        organizationId: orgRef.id,
        name: familyDef.name,
        address: familyDef.address ?? '',
        contactPhone: familyDef.contactPhone ?? '',
        contactEmail: '',
        assignedTo: koUids[familyDef.koIndex],
        status: 'active',
        careType: familyDef.careType ?? 'long',
        note: '',
        fosters: familyDef.fosters ?? [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: myUid,
        updatedBy: myUid,
      });

      for (const child of familyDef.children) {
        await addDoc(collection(db, 'children'), {
          fosterFamilyId: familyRef.id,
          organizationId: orgRef.id,
          assignedTo: koUids[familyDef.koIndex],
          firstName: child.firstName,
          lastName: child.lastName,
          rc: child.rc ?? '',
          birthDate: child.birthDate,
          careType: familyDef.careType ?? 'long',
          status: 'active',
          note: '',
          relatives: child.relatives ?? [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: myUid,
          updatedBy: myUid,
        });
      }
    }
  }

  console.log(`\nHotovo — ${DEMO_ORGS.length} organizací, heslo všech demo účtů: ${DEMO_PASSWORD}\n`);
  accounts.forEach((acc) => {
    console.log(`  ${acc.role === 'org_admin' ? 'Org. Admin' : 'Klíčová osoba'.padEnd(14)} ${acc.email.padEnd(32)} (${acc.organization})`);
  });
}

main().catch((err) => {
  console.error('Chyba:', err.message ?? err);
  process.exit(1);
});
