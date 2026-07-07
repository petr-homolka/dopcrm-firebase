/**
 * org/documentWorkflow.js — schvalovací workflow dokumentů (2026-07-06 §D,
 * docs/domain/dokumenty-workflow-a-prihlaseni.md). Přechody stavů + auditní
 * stopa + notifikace protistraně. Každý přechod = updateDoc(status) + addAudit.
 *
 * Fáze A (KO↔Pěstoun, opakovatelně): sendToFosterReview → fosterApprove /
 * fosterComment; KO buď upraví (saveMarkdownVersion → znovu sendToFosterReview)
 * nebo markFinal. Fáze B (Vedení): sendToMgmtReview → mgmtApprove (closed) /
 * mgmtReject (zpět do fáze A). Výjimka: closeWithReservation. Po uzavření:
 * sendToAuthority / fileDocument.
 */

import { updateDoc } from 'firebase/firestore';
import { documentRef, getDocument, addAudit } from './documents.js';
import { meta } from './shared.js';
import { pushNotification, pushNotificationTo } from './notifications.js';
import { createSystemTimelineEntry } from './timeline.js';
import { listFosterUsersOfFamily } from './employees.js';

async function transition(familyId, docId, patch, audit, notify) {
  await updateDoc(documentRef(familyId, docId), { ...patch, ...meta() });
  await addAudit(familyId, docId, audit);
  if (notify) await notify();
}

// ── Fáze A: KO ↔ Pěstoun ─────────────────────────────────────────
export async function sendToFosterReview(familyId, docId) {
  const d = await getDocument(familyId, docId);
  await transition(familyId, docId,
    { status: 'foster_review', visibleToFoster: true },
    { action: 'sent_foster', fromStatus: d?.status, toStatus: 'foster_review' },
    async () => {
      const fosters = await listFosterUsersOfFamily(familyId, d?.organizationId);
      await pushNotificationTo(fosters.map((f) => f.id), {
        type: 'document', title: 'Dokument ke schválení', body: d?.title ?? '', link: '/moje',
      });
    });
}

/** Pěstoun schválí (ze své appky). */
export async function fosterApprove(familyId, docId) {
  const d = await getDocument(familyId, docId);
  await transition(familyId, docId,
    { status: 'approved_foster' },
    { action: 'foster_approved', fromStatus: d?.status, toStatus: 'approved_foster' },
    () => pushNotification(d?.assignedTo, { type: 'document', title: 'Pěstoun schválil dokument', body: d?.title ?? '', link: `/admin/terenni/${familyId}` }));
}

/** Pěstoun okomentuje (připomínka putuje KO). */
export async function fosterComment(familyId, docId, comment) {
  const d = await getDocument(familyId, docId);
  await transition(familyId, docId,
    { status: 'commented', fosterComment: comment.trim() },
    { action: 'foster_commented', note: comment.trim(), fromStatus: d?.status, toStatus: 'commented' },
    () => pushNotification(d?.assignedTo, { type: 'document', title: 'Pěstoun okomentoval dokument', body: comment.slice(0, 80), link: `/admin/terenni/${familyId}` }));
}

/** KO označí Konečný (i bez schválení pěstounem). Ukončuje fázi A. */
export async function markFinal(familyId, docId) {
  const d = await getDocument(familyId, docId);
  await transition(familyId, docId,
    { status: 'final' },
    { action: 'marked_final', fromStatus: d?.status, toStatus: 'final' });
}

// ── Fáze B: Vedení ───────────────────────────────────────────────
export async function sendToMgmtReview(familyId, docId, approverUid) {
  const d = await getDocument(familyId, docId);
  await transition(familyId, docId,
    { status: 'mgmt_review', approverUid: approverUid ?? null },
    { action: 'sent_mgmt', fromStatus: d?.status, toStatus: 'mgmt_review' },
    () => pushNotification(approverUid, { type: 'document', title: 'Dokument ke schválení (vedení)', body: d?.title ?? '', link: `/admin/terenni/${familyId}` }));
}

export async function mgmtApprove(familyId, docId) {
  const d = await getDocument(familyId, docId);
  await transition(familyId, docId,
    { status: 'closed' },
    { action: 'mgmt_approved', fromStatus: d?.status, toStatus: 'closed' },
    () => pushNotification(d?.assignedTo, { type: 'document', title: 'Vedení schválilo — dokument uzavřen', body: d?.title ?? '', link: `/admin/terenni/${familyId}` }));
}

export async function mgmtReject(familyId, docId, note = '') {
  const d = await getDocument(familyId, docId);
  await transition(familyId, docId,
    { status: 'commented' }, // zpět do fáze A (KO opět projedná s pěstounem)
    { action: 'mgmt_rejected', note, fromStatus: d?.status, toStatus: 'commented' },
    () => pushNotification(d?.assignedTo, { type: 'document', title: 'Vedení neschválilo dokument', body: note.slice(0, 80), link: `/admin/terenni/${familyId}` }));
}

/**
 * Uzavření s výhradou (výjimka — vedení jedná přímo). `variant` je jeden
 * z uzavřených stavů (closed / closed_foster_unapproved / closed_ko_unapproved
 * / closed_both_unapproved).
 */
export async function closeWithReservation(familyId, docId, variant) {
  const d = await getDocument(familyId, docId);
  await transition(familyId, docId,
    { status: variant },
    { action: 'closed', note: variant, fromStatus: d?.status, toStatus: variant });
}

// ── Po uzavření: odeslání / uložení ──────────────────────────────
export async function sendToAuthority(familyId, docId, authority) {
  const d = await getDocument(familyId, docId);
  await transition(familyId, docId,
    { status: 'sent', sentTo: authority },
    { action: 'sent_authority', note: authority, fromStatus: d?.status, toStatus: 'sent' });
  // Do spisu (časová osa) — důkazní stopa odeslání (§E: data v čase).
  await createSystemTimelineEntry(familyId, {
    title: `Dokument odeslán: ${authority}`, body: d?.title ?? '', subjectRefs: d?.subjectRefs ?? [],
  });
}

export async function fileDocument(familyId, docId) {
  const d = await getDocument(familyId, docId);
  await transition(familyId, docId,
    { status: 'filed' },
    { action: 'filed', fromStatus: d?.status, toStatus: 'filed' });
  await createSystemTimelineEntry(familyId, {
    title: 'Dokument uložen do spisu', body: d?.title ?? '', subjectRefs: d?.subjectRefs ?? [],
  });
}

/** Kdo je schvalovatel dokumentů KO (a náhradník) — z nastavení KO uživatele. */
export function docApproverOf(userProfile) {
  return { approver: userProfile?.docApprover ?? null, backup: userProfile?.docApproverBackup ?? null };
}
