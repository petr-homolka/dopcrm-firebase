/**
 * org/institutions.js — adresář institucí / „Ostatní" kontaktů organizace
 * (2026-07-13, vzor: stránka „Ostatní" z prototypu). Top-level `institutions`
 * (org-scoped): OSPOD, soud, škola, lékař, jiné. List dotazy VŽDY filtrují
 * organizationId (firestore.rules „list vs pole").
 */

import { collection, doc, addDoc, getDocs, updateDoc, deleteDoc, query, where, limit } from 'firebase/firestore';
import { db } from '../firebase.js';
import { createMeta, meta, TOP_LEVEL_PAGE_SIZE } from './shared.js';

export const INSTITUTION_TYPES = {
  ospod: 'OSPOD',
  soud: 'Soud',
  skola: 'Škola / školka',
  lekar: 'Lékař / zdravotnické',
  jine: 'Jiné',
};

const col = () => collection(db, 'institutions');

export async function createInstitution({ organizationId, name, type = 'jine', contactPerson = '', phone = '', email = '', address = '', note = '' }) {
  const ref = await addDoc(col(), {
    organizationId,
    name: name.trim(),
    type,
    contactPerson: contactPerson.trim(),
    phone: phone.trim(),
    email: email.trim(),
    address: address.trim(),
    note: note.trim(),
    ...createMeta(),
  });
  return ref.id;
}

export async function listInstitutionsByOrg(organizationId) {
  const snap = await getDocs(query(col(), where('organizationId', '==', organizationId), limit(TOP_LEVEL_PAGE_SIZE)));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '', 'cs'));
}

export async function updateInstitution(id, patch) {
  await updateDoc(doc(db, 'institutions', id), { ...patch, ...meta() });
}

export async function deleteInstitution(id) {
  await deleteDoc(doc(db, 'institutions', id));
}
