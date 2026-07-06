/**
 * MobileSchoolTab.jsx — "Škola" v mobilním Detailu dítěte (STRICT UI/UX
 * DESIGN MANDATE, 2026-07-05 dodatek). Native karta + NativeSheet formulář.
 */

import React from 'react';
import NativeSheet from '../../ui/NativeSheet.jsx';
import NativeButton from '../../ui/NativeButton.jsx';
import { NativeFormGroup, NativeFormRow, RowInput } from '../../ui/NativeFormRow.jsx';

export default function MobileSchoolTab({ child, schoolDialogOpen, schoolForm, setSchoolForm, onOpen, onClose, onSave, submitting, submitError, canManage }) {
  return (
    <div className="flex flex-col gap-3 px-4 pb-6 pt-3">
      <div className="rounded-native-card bg-native-surface p-4">
        <div className="mb-1 flex items-center justify-between">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-native-textMuted">Škola</p>
          {canManage && (
            <button type="button" onClick={onOpen} className="text-[14px] font-medium text-native-primary">
              {child.school ? 'Upravit' : 'Přidat'}
            </button>
          )}
        </div>

        {child.school ? (
          <div className="flex flex-col gap-0.5">
            <p className="text-[16px] font-semibold text-native-text">{child.school.nazev}</p>
            <p className="text-[14px] text-native-textMuted">{child.school.adresa}</p>
            <p className="text-[14px] text-native-textMuted">{[child.school.telefon, child.school.email].filter(Boolean).join(' · ')}</p>
            <p className="mt-1 text-[15px] text-native-text">Třídní učitel: {child.school.tridniUcitel || '—'}</p>
            <p className="text-[15px] text-native-text">Ročník: {child.school.rocnik || '—'}</p>
          </div>
        ) : (
          <p className="text-[15px] text-native-textMuted">Zatím nevyplněno.</p>
        )}
      </div>

      {schoolDialogOpen && (
        <NativeSheet
          title="Škola"
          onClose={onClose}
          submitting={submitting}
          footer={<NativeButton onClick={() => onSave({ preventDefault: () => {} })} disabled={submitting || !schoolForm.nazev.trim()}>{submitting ? 'Ukládám…' : 'Uložit'}</NativeButton>}
        >
          {submitError && <p className="text-[14px] text-native-danger">{submitError}</p>}
          <NativeFormGroup>
            <NativeFormRow label="Název školy">
              <RowInput value={schoolForm.nazev} onChange={(e) => setSchoolForm((f) => ({ ...f, nazev: e.target.value }))} autoFocus />
            </NativeFormRow>
            <NativeFormRow label="Adresa">
              <RowInput value={schoolForm.adresa} onChange={(e) => setSchoolForm((f) => ({ ...f, adresa: e.target.value }))} />
            </NativeFormRow>
            <NativeFormRow label="Telefon">
              <RowInput type="tel" value={schoolForm.telefon} onChange={(e) => setSchoolForm((f) => ({ ...f, telefon: e.target.value }))} />
            </NativeFormRow>
            <NativeFormRow label="E-mail">
              <RowInput type="email" value={schoolForm.email} onChange={(e) => setSchoolForm((f) => ({ ...f, email: e.target.value }))} />
            </NativeFormRow>
            <NativeFormRow label="Třídní učitel">
              <RowInput value={schoolForm.tridniUcitel} onChange={(e) => setSchoolForm((f) => ({ ...f, tridniUcitel: e.target.value }))} />
            </NativeFormRow>
            <NativeFormRow label="Ročník" isLast>
              <RowInput value={schoolForm.rocnik} onChange={(e) => setSchoolForm((f) => ({ ...f, rocnik: e.target.value }))} />
            </NativeFormRow>
          </NativeFormGroup>
        </NativeSheet>
      )}
    </div>
  );
}
