/**
 * DocumentActions.jsx — akční lišta schvalovacího workflow dokumentu na straně
 * týmu (2026-07-06 §D). Tlačítka se řídí stavem dokumentu; přechody volají
 * documentWorkflow.js (audit + notifikace uvnitř). Uzavření s výhradou, výběr
 * schvalovatele (vedení) a odeslání na úřad mají doprovodné sheety.
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
import NativeButton from '../../ui/NativeButton.jsx';
import NativeSheet from '../../ui/NativeSheet.jsx';
import { NativeFormGroup, NativeFormRow, RowSelect, RowTextarea } from '../../ui/NativeFormRow.jsx';

const CLOSE_VARIANTS = {
  closed: 'Uzavřít řádně',
  closed_foster_unapproved: 'Uzavřít — pěstoun neschválil',
  closed_ko_unapproved: 'Uzavřít — KO neschválila',
  closed_both_unapproved: 'Uzavřít — KO i pěstoun neschválili',
};

export default function DocumentActions({ doc, familyId, isManagement, onChanged }) {
  const { t } = useTranslation();
  const { profile } = useAuthStore();
  const [busy, setBusy] = useState(false);
  const [sheet, setSheet] = useState(null); // 'mgmt' | 'close' | 'authority' | 'reject'
  const [approvers, setApprovers] = useState([]);
  const [pick, setPick] = useState({ approver: '', variant: 'closed', authority: 'OSPOD', note: '' });

  async function run(fn) {
    setBusy(true);
    try { await fn(); await onChanged(); }
    catch (err) { console.error('[DocumentActions]', err); toast.error(err.message ?? 'Akce selhala.'); }
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
    <div className="flex flex-col gap-2.5">
      {/* Fáze A */}
      {editable && (s === 'draft' || s === 'commented' || s === 'foster_review') && (
        <NativeButton onClick={() => run(() => sendToFosterReview(familyId, doc.id))} disabled={busy}>
          {t('m.docs.sendToFoster', 'Poslat pěstounovi ke schválení')}
        </NativeButton>
      )}
      {editable && s !== 'final' && (
        <NativeButton variant="secondary" onClick={() => run(() => markFinal(familyId, doc.id))} disabled={busy}>
          {t('m.docs.markFinal', 'Označit jako Konečný')}
        </NativeButton>
      )}

      {/* Fáze B */}
      {s === 'final' && (
        <NativeButton onClick={openMgmt} disabled={busy}>{t('m.docs.sendToMgmt', 'Poslat vedení ke schválení')}</NativeButton>
      )}
      {s === 'mgmt_review' && isManagement && (
        <>
          <NativeButton onClick={() => run(() => mgmtApprove(familyId, doc.id))} disabled={busy}>{t('m.docs.approveAndClose', 'Schválit a uzavřít')}</NativeButton>
          <NativeButton variant="secondary" onClick={() => setSheet('reject')} disabled={busy}>{t('m.docs.reject', 'Neschválit')}</NativeButton>
        </>
      )}
      {/* Uzavření s výhradou (vedení přímo) */}
      {isManagement && (s === 'final' || s === 'mgmt_review' || s === 'approved_foster') && (
        <NativeButton variant="secondary" onClick={() => setSheet('close')} disabled={busy}>{t('m.docs.closeWithReservation', 'Uzavřít s výhradou…')}</NativeButton>
      )}

      {/* Po uzavření */}
      {isClosedStatus(s) && (
        <>
          <NativeButton onClick={() => setSheet('authority')} disabled={busy}>{t('m.docs.sendToAuthority', 'Odeslat na úřad')}</NativeButton>
          <NativeButton variant="secondary" onClick={() => run(() => fileDocument(familyId, doc.id))} disabled={busy}>{t('m.docs.fileDocument', 'Uložit do spisu')}</NativeButton>
        </>
      )}

      {sheet === 'mgmt' && (
        <NativeSheet title={t('m.docs.sheetSendMgmtTitle', 'Poslat vedení')} onClose={() => !busy && setSheet(null)} submitting={busy}
          footer={<NativeButton onClick={() => run(() => sendToMgmtReview(familyId, doc.id, pick.approver))} disabled={busy || !pick.approver}>{t('m.docs.send', 'Odeslat')}</NativeButton>}>
          <NativeFormGroup>
            <NativeFormRow label={t('m.docs.approverLabel', 'Schvalovatel')} isLast>
              <RowSelect value={pick.approver} onChange={(e) => setPick((p) => ({ ...p, approver: e.target.value }))}>
                <option value="">{t('m.docs.selectOption', 'Vyberte…')}</option>
                {approvers.map((u) => <option key={u.id} value={u.id}>{u.displayName ?? u.email}</option>)}
              </RowSelect>
            </NativeFormRow>
          </NativeFormGroup>
        </NativeSheet>
      )}

      {sheet === 'reject' && (
        <NativeSheet title={t('m.docs.rejectTitle', 'Neschválit')} onClose={() => !busy && setSheet(null)} submitting={busy}
          footer={<NativeButton onClick={() => run(() => mgmtReject(familyId, doc.id, pick.note))} disabled={busy}>{t('m.docs.returnForRework', 'Vrátit k přepracování')}</NativeButton>}>
          <NativeFormGroup>
            <NativeFormRow label={t('m.docs.reasonLabel', 'Důvod')} isLast stacked>
              <RowTextarea rows={3} value={pick.note} onChange={(e) => setPick((p) => ({ ...p, note: e.target.value }))} placeholder={t('m.docs.reasonPlaceholder', 'Co je potřeba upravit…')} />
            </NativeFormRow>
          </NativeFormGroup>
        </NativeSheet>
      )}

      {sheet === 'close' && (
        <NativeSheet title={t('m.docs.closeSheetTitle', 'Uzavřít s výhradou')} onClose={() => !busy && setSheet(null)} submitting={busy}
          footer={<NativeButton onClick={() => run(() => closeWithReservation(familyId, doc.id, pick.variant))} disabled={busy}>{t('m.docs.close', 'Uzavřít')}</NativeButton>}>
          <NativeFormGroup>
            <NativeFormRow label={t('m.docs.variantLabel', 'Způsob')} isLast>
              <RowSelect value={pick.variant} onChange={(e) => setPick((p) => ({ ...p, variant: e.target.value }))}>
                {Object.entries(CLOSE_VARIANTS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </RowSelect>
            </NativeFormRow>
          </NativeFormGroup>
        </NativeSheet>
      )}

      {sheet === 'authority' && (
        <NativeSheet title={t('m.docs.sendToAuthorityTitle', 'Odeslat na úřad')} onClose={() => !busy && setSheet(null)} submitting={busy}
          footer={<NativeButton onClick={() => run(() => sendToAuthority(familyId, doc.id, pick.authority))} disabled={busy}>{t('m.docs.send', 'Odeslat')}</NativeButton>}>
          <NativeFormGroup>
            <NativeFormRow label={t('m.docs.toWhomLabel', 'Komu')} isLast>
              <RowSelect value={pick.authority} onChange={(e) => setPick((p) => ({ ...p, authority: e.target.value }))}>
                <option value="OSPOD">OSPOD</option>
                <option value="Soud">{t('m.docs.court', 'Soud')}</option>
              </RowSelect>
            </NativeFormRow>
          </NativeFormGroup>
        </NativeSheet>
      )}
    </div>
  );
}
