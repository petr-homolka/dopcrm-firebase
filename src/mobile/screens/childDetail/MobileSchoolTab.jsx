/**
 * MobileSchoolTab.jsx — "Škola" v mobilním Detailu dítěte.
 *
 * v4 (2026-07-06, Lidl vzor — závazná zpětná vazba): žádné údaje nahusto
 * v jednom řádku („telefon · email" zakázáno) — karta má název školy nahoře
 * a tabulku název vlevo / hodnota vpravo (NativeInfoRow). Telefon/e-mail
 * jsou proklikávací hodnoty.
 */

import React from 'react';
import NativeSheet from '../../ui/NativeSheet.jsx';
import NativeButton from '../../ui/NativeButton.jsx';
import { NativeFormGroup, NativeFormRow, NativeInfoRow, RowInput } from '../../ui/NativeFormRow.jsx';

export default function MobileSchoolTab({ child, schoolDialogOpen, schoolForm, setSchoolForm, onOpen, onClose, onSave, submitting, submitError, canManage }) {
  const school = child.school;

  return (
    <div className="flex flex-col gap-3 px-4 pb-6 pt-3">
      <div className="rounded-native-card bg-native-surface px-4">
        <div className="flex items-center justify-between border-b border-native-separator py-3">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-native-textMuted">Škola</p>
          {canManage && (
            <button type="button" onClick={onOpen} className="text-[15px] font-medium text-native-primary">
              {school ? 'Upravit' : 'Přidat'}
            </button>
          )}
        </div>

        {school ? (
          <>
            <div className="border-b border-native-separator py-3">
              <p className="text-[17px] font-semibold text-native-text">{school.nazev}</p>
            </div>
            <NativeInfoRow label="Adresa" value={school.adresa} />
            <NativeInfoRow
              label="Telefon"
              value={school.telefon ? (
                <a href={`tel:${school.telefon.replace(/\s/g, '')}`} className="text-native-primary">{school.telefon}</a>
              ) : ''}
            />
            <NativeInfoRow
              label="E-mail"
              value={school.email ? (
                <a href={`mailto:${school.email}`} className="break-all text-native-primary">{school.email}</a>
              ) : ''}
            />
            <NativeInfoRow label="Třídní učitel" value={school.tridniUcitel} />
            <NativeInfoRow label="Ročník" value={school.rocnik} isLast />
          </>
        ) : (
          <p className="py-3.5 text-[15px] text-native-textMuted">Zatím nevyplněno.</p>
        )}
      </div>

      {schoolDialogOpen && (
        <NativeSheet
          title="Škola"
          onClose={onClose}
          submitting={submitting}
          footer={<NativeButton onClick={() => onSave({ preventDefault: () => {} })} disabled={submitting || !schoolForm.nazev.trim()}>{submitting ? 'Ukládám…' : 'Uložit'}</NativeButton>}
        >
          {submitError && <p className="text-[13px] text-native-danger">{submitError}</p>}
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
