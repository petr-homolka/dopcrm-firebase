/**
 * org/children.js — CRUD pro children (děti svěřené do péče), append-only
 * historie a citlivé přílohy karty dítěte (trvalé poznámky, předchozí
 * pěstounské rodiny, rozsudky, sociální prostor).
 */

import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, startAfter,
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { meta, createMeta, SPVPP_DEFAULT_ROZPOCET, TOP_LEVEL_PAGE_SIZE, SUBCOLLECTION_PAGE_SIZE } from './shared.js';
import { getFoster } from './fosterFamilies.js';
import { createSystemTimelineEntry } from './timeline.js';
import { custodyTypeLabel } from '../../shared/domainConstants.js';

/** Jedna stránka podkolekce seřazená podle `createdAt desc` — sdílený tvar pro history/notes/previousFosters/courtVerdicts. */
async function fetchSubcollectionPage(path, cursor) {
  const constraints = [orderBy('createdAt', 'desc'), limit(SUBCOLLECTION_PAGE_SIZE)];
  if (cursor) constraints.push(startAfter(cursor));
  const snap = await getDocs(query(collection(db, ...path), ...constraints));
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const lastDoc = snap.docs.length === SUBCOLLECTION_PAGE_SIZE ? snap.docs[snap.docs.length - 1] : null;
  return { items, lastDoc };
}

/**
 * `organizationId` je POVINNÝ argument, ne jen pohodlí — firestore.rules pro
 * `children` ověřuje `sameOrg(resource.data.organizationId)`, a Firestore
 * zakáže celý "list" dotaz, pokud toto pole není SOUČASNĚ i rovnostním
 * filtrem dotazu (jinak "Missing or insufficient permissions" pro každého
 * kromě superadmina — objeveno a opraveno 2026-07-02 při ověřování Fáze 2).
 */
export async function listChildrenByFamily(fosterFamilyId, organizationId) {
  const snap = await getDocs(
    query(
      collection(db, 'children'),
      where('fosterFamilyId', '==', fosterFamilyId),
      where('organizationId', '==', organizationId),
      limit(TOP_LEVEL_PAGE_SIZE)
    )
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function listChildrenByOrg(organizationId) {
  const snap = await getDocs(
    query(collection(db, 'children'), where('organizationId', '==', organizationId), limit(TOP_LEVEL_PAGE_SIZE))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Založí dítě — organizationId + assignedTo se DENORMALIZUJÍ z rodičovské
 * foster_family (nutné pro firestore.rules, které se na children nedívají
 * přes get() do foster_families kvůli výkonu/ceně čtení).
 */
/**
 * Výchozí `custody` při založení dítěte: 2 pěstouni v domácnosti (manželé) →
 * `spolecne` s oběma jako caregivers, jinak `individualni` s tím jediným.
 * Konkrétní spisovou značku/soud doplní KO později (`updateChild`).
 */
function defaultCustody(fosters) {
  const ids = (fosters ?? []).map((p) => p.id);
  return {
    type: ids.length >= 2 ? 'spolecne' : 'individualni',
    caregivers: ids.length >= 2 ? ids.slice(0, 2) : ids.slice(0, 1),
    court: '',
    caseNumber: '',
    decidedAt: null,
  };
}

export async function createChild({ fosterFamilyId, firstName, lastName, rc = '', birthDate = null, careType = null, status = 'active', note = '', relatives = [], custody = null }) {
  const family = await getFoster(fosterFamilyId);
  if (!family) throw new Error('Rodina nenalezena — nelze přidat dítě.');

  const ref = await addDoc(collection(db, 'children'), {
    fosterFamilyId,
    organizationId: family.organizationId,
    assignedTo: family.assignedTo ?? null,
    firstName,
    lastName,
    rc,                             // rodné číslo — primární identifikátor osoby
    birthDate,
    careType: careType ?? family.careType ?? 'long',
    status, // 'active' | 'transferred' | 'aged_out'
    note,
    // Vazba dítě↔pěstoun (docs/domain/druhy-pece-a-odmeny.md): 1 nebo 2 osoby
    // (společná PP jen u manželů, §958 NOZ). `caregivers` odkazuje na id v
    // rodičovské foster_families.fosters[].
    custody: custody ?? defaultCustody(family.fosters),
    // Biologičtí/širší rodinní příbuzní — jmenovití, viz shared/domainConstants.js
    // REL_TYPES. Každá položka: { id, name, rc, rel (REL_TYPES key), legal,
    // addressPermanent, addressResidence, phone, email, note }
    relatives,
    // Doklady — volitelně doplňované později (OP se dětem vydává i po založení karty)
    idCard: null,        // { number, issuedAt, validUntil }
    passport: null,      // { number, issuedAt, validUntil }
    addressPermanent: null,   // { street, city, zip } — trvalé bydliště
    addressResidence: null,   // { street, city, zip } — adresa pobytu (může se lišit)
    school: null,         // { nazev, adresa, telefon, email, tridniUcitel, rocnik }
    ospod: null,          // { nazev, osoba }
    courtCase: null,      // { spisZnacka, soudNazev, soudAdresa, kontaktniOsoba } — rozsudky viz children/{id}/courtVerdicts
    socialSpace: [],      // osoby v okolí dítěte bez biologické vazby — stejný tvar jako relatives
    spvpp: { rok: new Date().getFullYear(), rozpocet: SPVPP_DEFAULT_ROZPOCET, vycerpano: 0 },
    ...createMeta(),
  });
  return ref.id;
}

export async function updateChild(childId, patch) {
  await updateDoc(doc(db, 'children', childId), { ...patch, ...meta() });
}

/** Přepíše celé pole `relatives[]` u dítěte (malé pole, čtení-úprava-zápis stačí). */
export async function setChildRelatives(childId, relatives) {
  await updateDoc(doc(db, 'children', childId), { relatives, ...meta() });
}

/**
 * Přepíše `custody` (svěření) u dítěte a zapíše systémový záznam do timeline
 * rodiny (docs/domain/druhy-pece-a-odmeny.md, docs/domain/timeline.md §1) —
 * změna svěření je přesně ten typ události, co timeline musí zachytit.
 */
export async function setChildCustody(childId, custody) {
  const child = await getChild(childId);
  if (!child) throw new Error('Dítě nenalezeno.');

  await updateDoc(doc(db, 'children', childId), { custody, ...meta() });

  const jmeno = `${child.firstName} ${child.lastName}`.trim();
  const body = custody.caseNumber
    ? `Dítě ${jmeno} svěřeno do péče (${custodyTypeLabel(custody.type)}), sp. zn. ${custody.caseNumber}${custody.court ? `, ${custody.court}` : ''}.`
    : `Dítě ${jmeno} — svěření aktualizováno na: ${custodyTypeLabel(custody.type)}.`;

  await createSystemTimelineEntry(child.fosterFamilyId, {
    title: 'Změna svěření',
    body,
    subjectRefs: [{ kind: 'child', id: childId }],
  });
}

export async function getChild(childId) {
  const snap = await getDoc(doc(db, 'children', childId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function deleteChild(childId) {
  await deleteDoc(doc(db, 'children', childId));
}

// ── Historie změn dítěte — "nic se nepřepisuje" ─────────────────
// Port vanilla App.histAdd/histList: append-only subkolekce, {field,from,to,by,at}.
// Volající (UI) sám rozhodne, CO se má logovat jako historická změna — orgService
// jen ukládá; nikdy needituje/nemaže existující záznam (viz firestore.rules).

/** Vrací `{ items, lastDoc }` — `lastDoc` slouží jako `cursor` pro další stránku (`null` = konec). */
export async function listChildHistory(childId, cursor = null) {
  return fetchSubcollectionPage(['children', childId, 'history'], cursor);
}

export async function addChildHistory(childId, { field, from = '—', to }) {
  const ref = await addDoc(collection(db, 'children', childId, 'history'), {
    field, from, to, ...createMeta(),
  });
  return ref.id;
}

/** Upraví pole na dítěti a ZÁROVEŇ zaloguje historii (volitelně víc položek najednou — např. celá adresa). */
export async function updateChildTracked(childId, patch, historyEntries = []) {
  await updateDoc(doc(db, 'children', childId), { ...patch, ...meta() });
  await Promise.all(historyEntries.map((entry) => addChildHistory(childId, entry)));
}

// ── Trvalé poznámky KO — append-only subkolekce ─────────────────
// Citlivý obsah, důkazní hodnota — nikdy se needituje ani nemaže (viz firestore.rules).

/** Vrací `{ items, lastDoc }` — `lastDoc` slouží jako `cursor` pro další stránku (`null` = konec). */
export async function listPermanentNotes(childId, cursor = null) {
  return fetchSubcollectionPage(['children', childId, 'permanentNotes'], cursor);
}

export async function addPermanentNote(childId, text) {
  const ref = await addDoc(collection(db, 'children', childId, 'permanentNotes'), {
    text, ...createMeta(),
  });
  return ref.id;
}

// ── Předchozí pěstounské rodiny dítěte — append-only subkolekce ─
// Historie umístění, nikdy se needituje ani nemaže (viz firestore.rules).

/** Vrací `{ items, lastDoc }` — `lastDoc` slouží jako `cursor` pro další stránku (`null` = konec). */
export async function listPreviousFosters(childId, cursor = null) {
  return fetchSubcollectionPage(['children', childId, 'previousFosters'], cursor);
}

export async function addPreviousFoster(childId, entry) {
  const ref = await addDoc(collection(db, 'children', childId, 'previousFosters'), {
    ...entry, ...createMeta(),
  });
  return ref.id;
}

// ── Rozsudky/usnesení soudního spisu dítěte — append-only subkolekce ─
// `courtCase` na dokumentu drží jen identitu spisu (spisZnačka/soud/kontakt);
// samotné rozsudky rostou v čase, proto vlastní podkolekce (viz firestore.rules).

/** Vrací `{ items, lastDoc }` — `lastDoc` slouží jako `cursor` pro další stránku (`null` = konec). */
export async function listCourtVerdicts(childId, cursor = null) {
  return fetchSubcollectionPage(['children', childId, 'courtVerdicts'], cursor);
}

export async function addCourtVerdict(childId, entry) {
  const ref = await addDoc(collection(db, 'children', childId, 'courtVerdicts'), {
    ...entry, ...createMeta(),
  });
  return ref.id;
}

/** Sociální prostor dítěte (osoby v okolí bez biologické vazby) — stejný tvar jako relatives[]. */
export async function setChildSocialSpace(childId, socialSpace) {
  await updateDoc(doc(db, 'children', childId), { socialSpace, ...meta() });
}
