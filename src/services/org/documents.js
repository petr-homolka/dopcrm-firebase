/**
 * org/documents.js — dokumenty rodiny (2026-07-06 §C,
 * docs/domain/dokumenty-workflow-a-prihlaseni.md).
 *
 * `foster_families/{familyId}/documents/{docId}` — metadata + (u interních
 * `md` dokumentů) rovnou obsah v poli `content` (žádný Storage — jádro
 * schvalovacího workflow funguje čistě ve Firestore). Nahrané soubory
 * (pdf/image/docx) mají `storagePath` do Firebase Storage.
 *
 * Verze (`documents/{docId}/versions`) a auditní stopa (`.../audit`) jsou
 * append-only podkolekce — workflow a audit řeší documentWorkflow.js.
 */

import {
  collection, doc, addDoc, getDoc, getDocs, updateDoc, query, where, orderBy, limit, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { useAuthStore } from '../../store/authStore.js';
import { createMeta, meta, SUBCOLLECTION_PAGE_SIZE } from './shared.js';

function docsCol(familyId) {
  return collection(db, 'foster_families', familyId, 'documents');
}
export function documentRef(familyId, docId) {
  return doc(db, 'foster_families', familyId, 'documents', docId);
}

/**
 * Zápis do auditní stopy dokumentu (append-only) — jediné místo, sdílené
 * s documentWorkflow.js (odsud, aby nevznikl cyklický import). Zaznamenává
 * kdo/kdy/jaká akce a případný přechod stavu.
 */
export async function addAudit(familyId, docId, { action, note = '', fromStatus = null, toStatus = null }) {
  const { currentUser, profile, role } = useAuthStore.getState();
  await addDoc(collection(db, 'foster_families', familyId, 'documents', docId, 'audit'), {
    action, note, fromStatus, toStatus,
    byUid: currentUser?.uid ?? null,
    byName: profile?.displayName ?? currentUser?.email ?? 'Neznámý',
    byRole: role ?? null,
    createdAt: serverTimestamp(),
  });
}

/**
 * Založí interní (markdown) dokument ve stavu `draft`. `subjectRefs` váže na
 * dítě/rodinu. `assignedTo`/`organizationId` denormalizované z rodiny pro rules.
 */
export async function createMarkdownDocument(familyId, { title, content = '', subjectRefs = [], organizationId, assignedTo }) {
  const ref = await addDoc(docsCol(familyId), {
    title: title.trim() || 'Bez názvu',
    kind: 'md',
    content,
    status: 'draft',
    visibleToFoster: false,       // zviditelní se až odesláním pěstounovi
    currentVersion: 1,
    subjectRefs,
    source: 'internal',
    fosterFamilyId: familyId,
    organizationId,
    assignedTo,
    fosterComment: '',
    ...createMeta(),
  });
  await addAudit(familyId, ref.id, { action: 'created', toStatus: 'draft' });
  return ref.id;
}

/** Metadata dokumentu ke Storage souboru (upload obsahu řeší volající zvlášť). */
export async function createFileDocument(familyId, { title, kind, storagePath = null, mimeType = null, fileName = '', source = 'internal', subjectRefs = [], extractedText = '', organizationId, assignedTo }) {
  const ref = await addDoc(docsCol(familyId), {
    title: title.trim() || fileName || 'Soubor',
    kind,                          // 'pdf' | 'image' | 'docx'
    storagePath,
    mimeType,
    fileName,
    status: 'draft',
    visibleToFoster: source === 'foster',
    currentVersion: 1,
    subjectRefs,
    source,                        // 'internal' | 'foster' | 'email'
    extractedText,
    fosterFamilyId: familyId,
    organizationId,
    assignedTo,
    fosterComment: '',
    ...createMeta(),
  });
  await addAudit(familyId, ref.id, { action: 'created', toStatus: 'draft' });
  return ref.id;
}

export async function listDocuments(familyId) {
  const snap = await getDocs(query(docsCol(familyId), orderBy('createdAt', 'desc'), limit(SUBCOLLECTION_PAGE_SIZE)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Dokumenty zpřístupněné pěstounovi (`visibleToFoster == true`) — dotaz MUSÍ
 * filtrovat na visibleToFoster, jinak by Firestore odmítl celý list (pěstoun
 * nesmí číst nezpřístupněné). Řazení na klientovi (žádný composite index).
 */
export async function listFosterVisibleDocuments(familyId) {
  const snap = await getDocs(query(docsCol(familyId), where('visibleToFoster', '==', true)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
}

export async function getDocument(familyId, docId) {
  const snap = await getDoc(documentRef(familyId, docId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function listDocumentVersions(familyId, docId) {
  const snap = await getDocs(query(
    collection(db, 'foster_families', familyId, 'documents', docId, 'versions'),
    orderBy('version', 'desc')
  ));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function listDocumentAudit(familyId, docId) {
  const snap = await getDocs(query(
    collection(db, 'foster_families', familyId, 'documents', docId, 'audit'),
    orderBy('createdAt', 'desc')
  ));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Uloží novou verzi obsahu markdown dokumentu (append-only versions + zvýší
 * currentVersion). Editace obsahu je možná, dokud dokument není uzavřený.
 */
export async function saveMarkdownVersion(familyId, docId, { content, note = '' }) {
  const current = await getDocument(familyId, docId);
  const nextVersion = (current?.currentVersion ?? 1) + 1;
  const uid = useAuthStore.getState().currentUser?.uid ?? 'system';
  await addDoc(collection(db, 'foster_families', familyId, 'documents', docId, 'versions'), {
    version: nextVersion, content, note, createdAt: serverTimestamp(), createdBy: uid,
  });
  await updateDoc(documentRef(familyId, docId), { content, currentVersion: nextVersion, ...meta() });
  await addAudit(familyId, docId, { action: 'version', note: `verze ${nextVersion}` });
  return nextVersion;
}
