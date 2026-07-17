/**
 * DocumentActionsBar.jsx (desktop) — akční lišta schvalovacího workflow
 * dokumentu na straně týmu (2026-07-13 §D, desktop varianta mobilního
 * DocumentActions). Tlačítka se řídí stavem dokumentu; přechody volají
 * documentWorkflow.js (audit + notifikace uvnitř). Výběr schvalovatele,
 * uzavření s výhradou a odeslání na úřad mají doprovodné modaly.
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../../store/authStore.js';
import {
  sendToFosterReview, markFinal, sendToMgmtReview, mgmtApprove, mgmtReject,
  closeWithReservation, sendToAuthority, fileDocument, listUsersByOrg,
} from '../../../services/orgService.js';
import { isClosedStatus } from '../../../shared/documentConstants.js';
import { toast } from '../../../store/toastStore.js';
import Button from '../../../components/ui/Button.jsx';
import Modal from '../../../components/ui/Modal.jsx';

const CLOSE_VARIANTS = {
  closed: 'Uzavřít řádně',
  closed_foster_unapproved: 'Uzavřít — pěstoun neschválil',
  closed_ko_unapproved: 'Uzavřít — KO neschválila',
  closed_both_unapproved: 'Uzavřít — KO i pěstoun neschválili',
};
const selectClass = 'h-10 w-full rounded-lg border border-border-strong bg-white px-3.5 text-sm text-ink-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100';
const textareaClass = 'w-full rounded-lg border border-border-strong bg-white px-3.5 py-2.5 text-sm text-ink-800 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100';

export default function DocumentActionsBar({ doc, familyId, isManagement, onChanged }) {
  const { t } = useTranslation();
  const { profile } = useAuthStore();
  const [busy, setBusy] = useState(false);
  const [sheet, setSheet] = useState(null); // 'mgmt' | 'close' | 'authority' | 'reject'
  const [approvers, setApprovers] = useState([]);
  const [pick, setPick] = useState({ approver: '', variant: 'closed', authority: 'OSPOD', note: '' });

  async function run(fn) {
    setBusy(true);
    try { await fn(); await onChanged(); }
    catch (err) { console.error('[DocumentActionsBar]', err); toast.error(err.message ?? t('dsk.common.actionFailed', 'Akce selhala.')); }
    finally { setBusy(false); setSheet(null); }
  }

  async function openMgmt() {
    try {
      const users = await listUsersByOrg(doc.organizationId);
      setApprovers(users.filter((u) => ['org_admin', 'vedouci_pobocky', 'teamleader'].includes(u.role)));
    } catch { /* ignore */ }
    setPick((p) => ({ ...p, approver: profile?.docApprover ?? '' }));
    setSheet('mgmt');
  }

  const s = doc.status;
  const editable = !isClosedStatus(s) && s !== 'sent' && s !== 'filed';

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border-subtle bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{t('dsk.docAct.title', 'Schvalovací akce')}</p>
      <div className="flex flex-wrap gap-2">
        {editable && (s === 'draft' || s === 'commented' || s === 'foster_review') && (
          <Button size="sm" onClick={() => run(() => sendToFosterReview(familyId, doc.id))} disabled={busy}>
            {t('dsk.docAct.sendFoster', 'Poslat pěstounovi ke schválení')}
          </Button>
        )}
        {editable && s !== 'final' && (
          <Button variant="secondary" size="sm" onClick={() => run(() => markFinal(familyId, doc.id))} disabled={busy}>
            {t('dsk.docAct.markFinal', 'Označit jako Konečný')}
          </Button>
        )}
        {s === 'final' && (
          <Button size="sm" onClick={openMgmt} disabled={busy}>{t('dsk.docAct.sendMgmt', 'Poslat vedení ke schválení')}</Button>
        )}
        {s === 'mgmt_review' && isManagement && (
          <>
            <Button size="sm" onClick={() => run(() => mgmtApprove(familyId, doc.id))} disabled={busy}>{t('dsk.docAct.approveClose', 'Schválit a uzavřít')}</Button>
            <Button variant="secondary" size="sm" onClick={() => setSheet('reject')} disabled={busy}>{t('dsk.docAct.reject', 'Neschválit')}</Button>
          </>
        )}
        {isManagement && (s === 'final' || s === 'mgmt_review' || s === 'approved_foster') && (
          <Button variant="secondary" size="sm" onClick={() => setSheet('close')} disabled={busy}>{t('dsk.docAct.closeReservation', 'Uzavřít s výhradou…')}</Button>
        )}
        {isClosedStatus(s) && (
          <>
            <Button size="sm" onClick={() => setSheet('authority')} disabled={busy}>{t('dsk.docAct.sendAuthority', 'Odeslat na úřad')}</Button>
            <Button variant="secondary" size="sm" onClick={() => run(() => fileDocument(familyId, doc.id))} disabled={busy}>{t('dsk.docAct.file', 'Uložit do spisu')}</Button>
          </>
        )}
      </div>

      {sheet === 'mgmt' && (
        <Modal title={t('dsk.docAct.sendMgmt', 'Poslat vedení ke schválení')} onClose={() => !busy && setSheet(null)}
          footer={<Button onClick={() => run(() => sendToMgmtReview(familyId, doc.id, pick.approver))} disabled={busy || !pick.approver}>{t('dsk.common.send', 'Odeslat')}</Button>}>
          <label className="mb-1 block text-[13px] font-medium text-ink-700">{t('dsk.docAct.approver', 'Schvalovatel')}</label>
          <select className={selectClass} value={pick.approver} onChange={(e) => setPick((p) => ({ ...p, approver: e.target.value }))}>
            <option value="">{t('dsk.common.choose', 'Vyberte…')}</option>
            {approvers.map((u) => <option key={u.id} value={u.id}>{u.displayName ?? u.email}</option>)}
          </select>
        </Modal>
      )}

      {sheet === 'reject' && (
        <Modal title={t('dsk.docAct.rejectTitle', 'Neschválit dokument')} onClose={() => !busy && setSheet(null)}
          footer={<Button onClick={() => run(() => mgmtReject(familyId, doc.id, pick.note))} disabled={busy}>{t('dsk.docAct.returnRework', 'Vrátit k přepracování')}</Button>}>
          <label className="mb-1 block text-[13px] font-medium text-ink-700">{t('dsk.common.reason', 'Důvod')}</label>
          <textarea rows={3} className={textareaClass} value={pick.note} onChange={(e) => setPick((p) => ({ ...p, note: e.target.value }))} placeholder={t('dsk.docAct.reworkPlaceholder', 'Co je potřeba upravit…')} />
        </Modal>
      )}

      {sheet === 'close' && (
        <Modal title={t('dsk.docAct.closeReservationTitle', 'Uzavřít s výhradou')} onClose={() => !busy && setSheet(null)}
          footer={<Button onClick={() => run(() => closeWithReservation(familyId, doc.id, pick.variant))} disabled={busy}>{t('dsk.docAct.close', 'Uzavřít')}</Button>}>
          <label className="mb-1 block text-[13px] font-medium text-ink-700">{t('dsk.docAct.closeMode', 'Způsob uzavření')}</label>
          <select className={selectClass} value={pick.variant} onChange={(e) => setPick((p) => ({ ...p, variant: e.target.value }))}>
            {Object.entries(CLOSE_VARIANTS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </Modal>
      )}

      {sheet === 'authority' && (
        <Modal title={t('dsk.docAct.sendAuthority', 'Odeslat na úřad')} onClose={() => !busy && setSheet(null)}
          footer={<Button onClick={() => run(() => sendToAuthority(familyId, doc.id, pick.authority))} disabled={busy}>{t('dsk.common.send', 'Odeslat')}</Button>}>
          <label className="mb-1 block text-[13px] font-medium text-ink-700">{t('dsk.docAct.to', 'Komu')}</label>
          <select className={selectClass} value={pick.authority} onChange={(e) => setPick((p) => ({ ...p, authority: e.target.value }))}>
            <option value="OSPOD">OSPOD</option>
            <option value="Soud">{t('dsk.docAct.court', 'Soud')}</option>
          </select>
        </Modal>
      )}
    </div>
  );
}
