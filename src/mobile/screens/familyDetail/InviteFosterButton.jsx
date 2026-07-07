/**
 * InviteFosterButton.jsx — pozvání pěstouna do jeho appky MAGIC LINKEM
 * (2026-07-06 §A, docs/domain/dokumenty-workflow-a-prihlaseni.md). KO/vedení
 * zadá jméno + e-mail; systém vydá pozvánku a pošle jednorázový přihlašovací
 * odkaz (žádné heslo). Odkaz jde poslat opakovaně. SMS/WhatsApp přibudou.
 */

import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { inviteFosterByLink } from '../../../services/orgService.js';
import { toast } from '../../../store/toastStore.js';
import NativeSheet from '../../ui/NativeSheet.jsx';
import NativeButton from '../../ui/NativeButton.jsx';
import { NativeFormGroup, NativeFormRow, RowInput } from '../../ui/NativeFormRow.jsx';

export default function InviteFosterButton({ familyId, organizationId }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ displayName: '', email: '', phone: '' });

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleInvite() {
    setSubmitting(true);
    try {
      await inviteFosterByLink({ ...form, fosterFamilyId: familyId, organizationId });
      toast.info(`Přihlašovací odkaz odeslán na ${form.email}. Platí jednorázově.`);
      setOpen(false);
      setForm({ displayName: '', email: '', phone: '' });
    } catch (err) {
      console.error('[InviteFosterButton] Pozvání selhalo:', err);
      toast.error(err.message ?? 'Pozvání se nezdařilo.');
    } finally {
      setSubmitting(false);
    }
  }

  const valid = form.displayName.trim() && form.email.trim();

  return (
    <>
      <NativeButton variant="secondary" className="h-12" onClick={() => setOpen(true)}>
        <UserPlus size={16} strokeWidth={2} /> Pozvat pěstouna do appky
      </NativeButton>

      {open && (
        <NativeSheet
          title="Pozvat pěstouna"
          onClose={() => !submitting && setOpen(false)}
          submitting={submitting}
          footer={
            <NativeButton onClick={handleInvite} disabled={submitting || !valid}>
              {submitting ? 'Odesílám…' : 'Poslat přihlašovací odkaz'}
            </NativeButton>
          }
        >
          <p className="text-[13px] text-native-textMuted">
            Pěstoun dostane e-mailem jednorázový odkaz (žádné heslo). Po přihlášení uvidí svůj
            profil, děti a chat s vámi — nikdy spis ani interní poznámky. Odkaz můžete poslat
            kdykoli znovu.
          </p>
          <NativeFormGroup>
            <NativeFormRow label="Jméno">
              <RowInput value={form.displayName} onChange={set('displayName')} autoFocus />
            </NativeFormRow>
            <NativeFormRow label="E-mail">
              <RowInput type="email" value={form.email} onChange={set('email')} />
            </NativeFormRow>
            <NativeFormRow label="Telefon" isLast hint="Pro budoucí SMS/WhatsApp odkaz.">
              <RowInput type="tel" value={form.phone} onChange={set('phone')} />
            </NativeFormRow>
          </NativeFormGroup>
        </NativeSheet>
      )}
    </>
  );
}
