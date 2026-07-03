/**
 * org/respit.js — Respit (odlehčovací volno) per rodina/dohoda, ne per dítě,
 * a SPVPP (finanční peněženka dítěte na respit/pobyty).
 */

import { collection, doc, getDocs, updateDoc, query, orderBy, runTransaction } from 'firebase/firestore';
import { db } from '../firebase.js';
import { meta, createMeta, SPVPP_DEFAULT_ROZPOCET } from './shared.js';
import { getChild } from './children.js';

// ── Respit (odlehčovací volno) — per rodina/dohoda, ne per dítě ─

/** Historie čerpání respitu jedné rodiny (subkolekce — může časem narůst, na rozdíl od `fosters[]`). */
export async function listRespitEvents(familyId) {
  const snap = await getDocs(
    query(collection(db, 'foster_families', familyId, 'respitEvents'), orderBy('from', 'desc'))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Zapíše čerpání respitu. Pokud je uvedena částka (`kc`, náklad na tábor/pobyt),
 * rozpočítá se ROVNÝM DÍLEM mezi uvedené děti a odečte z jejich SPVPP peněženky
 * (položkové rozúčtování dle konkrétního dokladu řeší UI voláním `chargeSpvpp`
 * přímo s jiným podílem).
 *
 * Zápis respitové události a odečet SPVPP peněženek dotčených dětí běží v JEDNÉ
 * transakci (audit nálezu #6, 2026-07-03: dřív šlo o `addDoc` + samostatný
 * `Promise.all(chargeSpvpp)` mimo transakci — chyba uprostřed mohla nechat
 * peněženky a respitovou událost v nekonzistentním stavu). Vzor viz
 * `reassignFoster` ve `fosterFamilies.js`.
 */
export async function addRespitEvent(familyId, { childIds = [], from, to, typ = 'tabor_pobyt', kc = 0, doklad = '' }) {
  const eventRef = doc(collection(db, 'foster_families', familyId, 'respitEvents'));
  const each = kc > 0 && childIds.length ? kc / childIds.length : 0;

  await runTransaction(db, async (tx) => {
    // Firestore transakce vyžaduje všechna čtení PŘED jakýmkoli zápisem.
    const childRefs = childIds.map((childId) => doc(db, 'children', childId));
    const childSnaps = each > 0 ? await Promise.all(childRefs.map((ref) => tx.get(ref))) : [];

    tx.set(eventRef, { childIds, from, to: to || from, typ, kc, doklad, ...createMeta() });

    childSnaps.forEach((snap, i) => {
      if (!snap.exists()) return;
      const wallet = snap.data().spvpp ?? { rok: new Date().getFullYear(), rozpocet: SPVPP_DEFAULT_ROZPOCET, vycerpano: 0 };
      wallet.vycerpano = Math.round((wallet.vycerpano || 0) + each);
      tx.update(childRefs[i], { spvpp: wallet, ...meta() });
    });
  });

  return eventRef.id;
}

/** Nadstandard nad zákonných 14 dní (§47a) — řešeno individuálním plánem ochrany dítěte (IPOD). */
export async function setRespitNadstandard(familyId, nadstandard) {
  await updateDoc(doc(db, 'foster_families', familyId), {
    respitNadstandard: Math.max(0, parseInt(nadstandard, 10) || 0),
    ...meta(),
  });
}

// ── SPVPP — finanční peněženka dítěte (na respit/pobyty) ────────

export async function getSpvppWallet(childId) {
  const child = await getChild(childId);
  return child?.spvpp ?? { rok: new Date().getFullYear(), rozpocet: SPVPP_DEFAULT_ROZPOCET, vycerpano: 0 };
}

export async function chargeSpvpp(childId, kc) {
  const wallet = await getSpvppWallet(childId);
  wallet.vycerpano = Math.round((wallet.vycerpano || 0) + kc);
  await updateDoc(doc(db, 'children', childId), { spvpp: wallet, ...meta() });
  return wallet;
}
