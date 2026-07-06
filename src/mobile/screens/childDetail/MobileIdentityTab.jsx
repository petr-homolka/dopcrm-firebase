/**
 * MobileIdentityTab.jsx — "Identita" v mobilním Detailu dítěte (STRICT UI/UX
 * DESIGN MANDATE, 2026-07-05 dodatek). Native karty, NativeSheet formuláře.
 * Žádná sdílená JSX s desktop ChildIdentityTab.jsx.
 */

import React from 'react';
import { BadgeCheck, Cake } from 'lucide-react';
import { formatDate, addressLabel } from '../../../modules/admin/childDetailShared.js';
import NativeSheet from '../../ui/NativeSheet.jsx';
import NativeButton from '../../ui/NativeButton.jsx';
import { NativeFormGroup, NativeFormRow, RowInput } from '../../ui/NativeFormRow.jsx';

export default function MobileIdentityTab({
  child, addressDialogFor, addressForm, setAddressForm, onOpenAddress, onCloseAddress, onSaveAddress,
  docsDialogOpen, docsForm, setDocsForm, onOpenDocs, onCloseDocs, onSaveDocs,
  submitting, submitError, canManage,
}) {
  return (
    <div className="flex flex-col gap-3 px-4 pb-6 pt-3">
      <div className="rounded-native-card bg-native-surface p-4">
        <p className="text-[12px] font-semibold uppercase tracking-wide text-native-textMuted">Základní identita</p>
        <div className="mt-1.5 flex items-center gap-2 text-native-textMuted">
          <BadgeCheck size={16} strokeWidth={1.75} />
          <p className="text-[15px]">{child.rc ? `RČ ${child.rc}` : 'RČ nevyplněno'}</p>
        </div>
        <div className="mt-1 flex items-center gap-2 text-native-textMuted">
          <Cake size={16} strokeWidth={1.75} />
          <p className="text-[15px]">Narození {formatDate(child.birthDate)}</p>
        </div>
        <div className="my-2.5 h-px bg-native-separator" />
        <p className="text-[15px] text-native-text">
          Občanský průkaz: {child.idCard ? `${child.idCard.number}${child.idCard.validUntil ? ` (do ${child.idCard.validUntil})` : ''}` : 'nevydán'}
        </p>
        <p className="text-[15px] text-native-text">
          Cestovní pas: {child.passport ? `${child.passport.number}${child.passport.validUntil ? ` (do ${child.passport.validUntil})` : ''}` : 'nevydán'}
        </p>
        {canManage && (
          <NativeButton variant="secondary" className="mt-3 h-11" onClick={onOpenDocs}>
            {child.idCard || child.passport ? 'Upravit doklady' : 'Doplnit doklady'}
          </NativeButton>
        )}
      </div>

      <div className="rounded-native-card bg-native-surface p-4">
        <p className="text-[12px] font-semibold uppercase tracking-wide text-native-textMuted">Adresy</p>
        <div className="mt-1.5">
          <p className="text-[15px] font-medium text-native-text">Trvalé bydliště</p>
          <p className="text-[14px] text-native-textMuted">{addressLabel(child.addressPermanent) ?? 'Nevyplněno'}</p>
          {canManage && (
            <button type="button" onClick={() => onOpenAddress('addressPermanent', child.addressPermanent)} className="mt-0.5 text-[14px] font-medium text-native-primary">
              Upravit
            </button>
          )}
        </div>
        <div className="my-2.5 h-px bg-native-separator" />
        <div>
          <p className="text-[15px] font-medium text-native-text">Adresa pobytu (pokud jiná)</p>
          <p className="text-[14px] text-native-textMuted">{addressLabel(child.addressResidence) ?? 'Stejná jako trvalé bydliště'}</p>
          {canManage && (
            <button type="button" onClick={() => onOpenAddress('addressResidence', child.addressResidence)} className="mt-0.5 text-[14px] font-medium text-native-primary">
              Upravit
            </button>
          )}
        </div>
      </div>

      {addressDialogFor && (
        <NativeSheet
          title={addressDialogFor === 'addressPermanent' ? 'Trvalé bydliště' : 'Adresa pobytu'}
          onClose={onCloseAddress}
          submitting={submitting}
          footer={<NativeButton onClick={() => onSaveAddress({ preventDefault: () => {} })} disabled={submitting}>{submitting ? 'Ukládám…' : 'Uložit'}</NativeButton>}
        >
          {submitError && <p className="text-[14px] text-native-danger">{submitError}</p>}
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
          {submitError && <p className="text-[14px] text-native-danger">{submitError}</p>}
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
