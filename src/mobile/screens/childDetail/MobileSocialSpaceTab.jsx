/**
 * MobileSocialSpaceTab.jsx — "Sociální prostor" v mobilním Detailu dítěte
 * (STRICT UI/UX DESIGN MANDATE, 2026-07-05 dodatek). Osoby bez biologické
 * vazby (kmotři, rodinní přátelé…). Native karta + NativeSheet.
 */

import React from 'react';
import { UserPlus } from 'lucide-react';
import NativeSheet from '../../ui/NativeSheet.jsx';
import NativeButton from '../../ui/NativeButton.jsx';
import { NativeFormGroup, NativeFormRow, RowInput } from '../../ui/NativeFormRow.jsx';

export default function MobileSocialSpaceTab({ child, socialDialogOpen, socialForm, setSocialForm, onOpen, onClose, onAdd, submitting, submitError, canManage }) {
  const socialSpace = child.socialSpace ?? [];

  return (
    <div className="flex flex-col gap-3 px-4 pb-6 pt-3">
      <div className="rounded-native-card bg-native-surface p-4">
        <div className="mb-1 flex items-center justify-between">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-native-textMuted">Sociální prostor ({socialSpace.length})</p>
          {canManage && (
            <button type="button" onClick={onOpen} className="flex items-center gap-1 text-[14px] font-medium text-native-primary">
              <UserPlus size={15} strokeWidth={2} /> Přidat
            </button>
          )}
        </div>
        <p className="mb-1 text-[13px] text-native-textMuted">Osoby bez biologické vazby — kmotři, rodinní přátelé a další blízké osoby.</p>

        {socialSpace.length === 0 && <p className="py-2 text-[15px] text-native-textMuted">Zatím nikdo.</p>}
        <div className="flex flex-col">
          {socialSpace.map((p) => (
            <div key={p.id} className="border-t border-native-separator py-2.5 first:border-t-0">
              <p className="text-[15px] font-medium text-native-text">{p.name}</p>
              <p className="text-[13px] text-native-textMuted">{[p.vztah, p.phone, p.email, p.note].filter(Boolean).join(' · ')}</p>
            </div>
          ))}
        </div>
      </div>

      {socialDialogOpen && (
        <NativeSheet
          title="Přidat osobu"
          onClose={onClose}
          submitting={submitting}
          footer={<NativeButton onClick={() => onAdd({ preventDefault: () => {} })} disabled={submitting || !socialForm.name.trim()}>{submitting ? 'Ukládám…' : 'Přidat'}</NativeButton>}
        >
          {submitError && <p className="text-[14px] text-native-danger">{submitError}</p>}
          <NativeFormGroup>
            <NativeFormRow label="Jméno">
              <RowInput value={socialForm.name} onChange={(e) => setSocialForm((f) => ({ ...f, name: e.target.value }))} autoFocus />
            </NativeFormRow>
            <NativeFormRow label="Vztah k dítěti">
              <RowInput placeholder="např. kmotra, rodinná přítelkyně" value={socialForm.vztah} onChange={(e) => setSocialForm((f) => ({ ...f, vztah: e.target.value }))} />
            </NativeFormRow>
            <NativeFormRow label="Telefon">
              <RowInput type="tel" value={socialForm.phone} onChange={(e) => setSocialForm((f) => ({ ...f, phone: e.target.value }))} />
            </NativeFormRow>
            <NativeFormRow label="E-mail" isLast>
              <RowInput type="email" value={socialForm.email} onChange={(e) => setSocialForm((f) => ({ ...f, email: e.target.value }))} />
            </NativeFormRow>
          </NativeFormGroup>
        </NativeSheet>
      )}
    </div>
  );
}
