/**
 * org/respit.js — Respit (odlehčovací volno) per rodina/dohoda, ne per dítě,
 * a SPVPP (finanční peněženka dítěte na respit/pobyty).
 */

import { collection, doc, getDocs, addDoc, updateDoc, query, orderBy } from 'firebase/firestore';
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
 */
export async function addRespitEvent(familyId, { childIds = [], from, to, typ = 'tabor_pobyt', kc = 0, doklad = '' }) {
  const ref = await addDoc(collection(db, 'foster_families', familyId, 'respitEvents'), {
    childIds, from, to: to || from, typ, kc, doklad, ...createMeta(),
  });
  if (kc > 0 && childIds.length) {
    const each = kc / childIds.length;
    await Promise.all(childIds.map((childId) => chargeSpvpp(childId, each)));
  }
  return ref.id;
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
