/**
 * InviteFosterButton.jsx — pozvání pěstouna do jeho appky z karty rodiny
 * (2026-07-06, docs/domain/chat-a-pestounska-appka.md). Založí pěstounovi
 * účet (role 'pestoun') navázaný na tuto rodinu — heslo mu KO předá. Jen
 * pro zaměstnance (management/KO). V8: nahradit pozvánkovým e-mailem.
 */

import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { inviteFoster } from '../../../services/orgService.js';
import { toast } from '../../../store/toastStore.js';
import NativeSheet from '../../ui/NativeSheet.jsx';
import NativeButton from '../../ui/NativeButton.jsx';
import { NativeFormGroup, NativeFormRow, RowInput } from '../../ui/NativeFormRow.jsx';

export default function InviteFosterButton({ familyId, organizationId }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ displayName: '', email: '', phone: '', password: '' });

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleInvite() {
    setSubmitting(true);
    try {
      await inviteFoster({ ...form, fosterFamilyId: familyId, organizationId });
      toast.info(`Pěstoun ${form.displayName} má přístup. Předejte mu e-mail a heslo.`);
      setOpen(false);
      setForm({ displayName: '', email: '', phone: '', password: '' });
    } catch (err) {
      console.error('[InviteFosterButton] Pozvání selhalo:', err);
      toast.error(err.message ?? 'Pozvání se nezdařilo.');
    } finally {
      setSubmitting(false);
    }
  }

  const valid = form.displayName.trim() && form.email.trim() && form.password.length >= 6;

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
              {submitting ? 'Zakládám…' : 'Vytvořit přístup'}
            </NativeButton>
          }
        >
          <p className="text-[13px] text-native-textMuted">
            Pěstoun získá vlastní přihlášení do omezené appky (svůj profil, děti, chat s vámi).
            Nevidí spis ani interní poznámky.
          </p>
          <NativeFormGroup>
            <NativeFormRow label="Jméno">
              <RowInput value={form.displayName} onChange={set('displayName')} autoFocus />
            </NativeFormRow>
            <NativeFormRow label="E-mail">
              <RowInput type="email" value={form.email} onChange={set('email')} />
            </NativeFormRow>
            <NativeFormRow label="Telefon">
              <RowInput type="tel" value={form.phone} onChange={set('phone')} />
            </NativeFormRow>
            <NativeFormRow label="Heslo" isLast hint="Alespoň 6 znaků — předáte pěstounovi.">
              <RowInput value={form.password} onChange={set('password')} />
            </NativeFormRow>
          </NativeFormGroup>
        </NativeSheet>
      )}
    </>
  );
}
