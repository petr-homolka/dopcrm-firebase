/**
 * MobileIdentityTab.jsx — "Identita" v mobilním Detailu dítěte.
 *
 * v4 (2026-07-06, Lidl vzor — závazná zpětná vazba): údaje se NEZOBRAZUJÍ
 * nahusto v jednom řádku — každá karta je tabulka název vlevo / hodnota
 * vpravo (NativeInfoRow). Adresy jsou při oprávnění tapnutelné hodnoty
 * (otevřou stejný NativeSheet jako dřív).
 */

import React from 'react';
import { formatDate, addressLabel } from '../../../modules/admin/childDetailShared.js';
import NativeSheet from '../../ui/NativeSheet.jsx';
import NativeButton from '../../ui/NativeButton.jsx';
import { NativeFormGroup, NativeFormRow, NativeInfoRow, RowInput } from '../../ui/NativeFormRow.jsx';

/** Popisek dokladu: číslo + platnost; bez dokladu "nevydán" (doménový stav, ne chybějící údaj). */
function docLabel(doc) {
  if (!doc) return 'nevydán';
  return `${doc.number}${doc.validUntil ? ` (do ${doc.validUntil})` : ''}`;
}

/** Hodnota adresního řádku — při oprávnění tapnutelná (modrá) hodnota otevírající sheet. */
function addressValue(text, canManage, onEdit) {
  if (!canManage) return text;
  return (
    <button type="button" onClick={onEdit} className="text-right text-native-primary">
      {text ?? 'Doplnit'}
    </button>
  );
}

export default function MobileIdentityTab({
  child, addressDialogFor, addressForm, setAddressForm, onOpenAddress, onCloseAddress, onSaveAddress,
  docsDialogOpen, docsForm, setDocsForm, onOpenDocs, onCloseDocs, onSaveDocs,
  submitting, submitError, canManage,
}) {
  return (
    <div className="flex flex-col gap-3 px-4 pb-6 pt-3">
      <div className="rounded-native-card bg-native-surface px-4">
        <div className="flex items-center border-b border-native-separator py-3">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-native-textMuted">Základní identita</p>
        </div>
        <NativeInfoRow label="Rodné číslo" value={child.rc} />
        <NativeInfoRow label="Datum narození" value={formatDate(child.birthDate)} />
        <NativeInfoRow label="Občanský průkaz" value={docLabel(child.idCard)} />
        <NativeInfoRow label="Cestovní pas" value={docLabel(child.passport)} isLast={!canManage} />
        {canManage && (
          <button type="button" onClick={onOpenDocs} className="flex w-full items-center py-3.5 text-[15px] font-medium text-native-primary">
            {child.idCard || child.passport ? 'Upravit doklady' : 'Doplnit doklady'}
          </button>
        )}
      </div>

      <div className="rounded-native-card bg-native-surface px-4">
        <div className="flex items-center border-b border-native-separator py-3">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-native-textMuted">Adresy</p>
        </div>
        <NativeInfoRow
          label="Trvalé bydliště"
          value={addressValue(addressLabel(child.addressPermanent), canManage, () => onOpenAddress('addressPermanent', child.addressPermanent))}
        />
        <NativeInfoRow
          label="Adresa pobytu"
          value={addressValue(addressLabel(child.addressResidence) ?? 'Stejná jako trvalé bydliště', canManage, () => onOpenAddress('addressResidence', child.addressResidence))}
          isLast
        />
      </div>

      {addressDialogFor && (
        <NativeSheet
          title={addressDialogFor === 'addressPermanent' ? 'Trvalé bydliště' : 'Adresa pobytu'}
          onClose={onCloseAddress}
          submitting={submitting}
          footer={<NativeButton onClick={() => onSaveAddress({ preventDefault: () => {} })} disabled={submitting}>{submitting ? 'Ukládám…' : 'Uložit'}</NativeButton>}
        >
          {submitError && <p className="text-[13px] text-native-danger">{submitError}</p>}
          <NativeFormGroup>
            <NativeFormRow label="Ulice">
              <RowInput value={addressForm.street} onChange={(e) => setAddressForm((f) => ({ ...f, street: e.target.value }))} autoFocus />
            </NativeFormRow>
            <NativeFormRow label="Město">
              <RowInput value={addressForm.city} onChange={(e) => setAddressForm((f) => ({ ...f, city: e.target.value }))} />
            </NativeFormRow>
            <NativeFormRow label="PSČ" isLast>
              <RowInput value={addressForm.zip} onChange={(e) => setAddressForm((f) => ({ ...f, zip: e.target.value }))} />
            </NativeFormRow>
          </NativeFormGroup>
        </NativeSheet>
      )}

      {docsDialogOpen && (
        <NativeSheet
          title="Doklady"
          onClose={onCloseDocs}
          submitting={submitting}
          footer={<NativeButton onClick={() => onSaveDocs({ preventDefault: () => {} })} disabled={submitting}>{submitting ? 'Ukládám…' : 'Uložit'}</NativeButton>}
        >
          {submitError && <p className="text-[13px] text-native-danger">{submitError}</p>}
          <NativeFormGroup>
            <NativeFormRow label="Číslo OP">
              <RowInput value={docsForm.idCardNumber} onChange={(e) => setDocsForm((f) => ({ ...f, idCardNumber: e.target.value }))} autoFocus />
            </NativeFormRow>
            <NativeFormRow label="OP platný do">
              <RowInput type="date" value={docsForm.idCardValidUntil} onChange={(e) => setDocsForm((f) => ({ ...f, idCardValidUntil: e.target.value }))} />
            </NativeFormRow>
            <NativeFormRow label="Číslo pasu">
              <RowInput value={docsForm.passportNumber} onChange={(e) => setDocsForm((f) => ({ ...f, passportNumber: e.target.value }))} />
            </NativeFormRow>
            <NativeFormRow label="Pas platný do" isLast>
              <RowInput type="date" value={docsForm.passportValidUntil} onChange={(e) => setDocsForm((f) => ({ ...f, passportValidUntil: e.target.value }))} />
            </NativeFormRow>
          </NativeFormGroup>
        </NativeSheet>
      )}
    </div>
  );
}
