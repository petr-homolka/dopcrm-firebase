/**
 * MobileIdentityTab.jsx — "Identita" v mobilním Detailu dítěte.
 *
 * v4 (2026-07-06, Lidl vzor — závazná zpětná vazba): údaje se NEZOBRAZUJÍ
 * nahusto v jednom řádku — každá karta je tabulka název vlevo / hodnota
 * vpravo (NativeInfoRow). Adresy jsou při oprávnění tapnutelné hodnoty
 * (otevřou stejný NativeSheet jako dřív).
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-3 px-4 pb-6 pt-3">
      <div className="rounded-native-card bg-native-surface px-4">
        <div className="flex items-center border-b border-native-separator py-3">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-native-textMuted">{t('m.identity.basicIdentity', 'Základní identita')}</p>
        </div>
        <NativeInfoRow label={t('m.identity.rc', 'Rodné číslo')} value={child.rc} />
        <NativeInfoRow label={t('m.identity.birthDate', 'Datum narození')} value={formatDate(child.birthDate)} />
        <NativeInfoRow label={t('m.identity.idCard', 'Občanský průkaz')} value={docLabel(child.idCard)} />
        <NativeInfoRow label={t('m.identity.passport', 'Cestovní pas')} value={docLabel(child.passport)} isLast={!canManage} />
        {canManage && (
          <button type="button" onClick={onOpenDocs} className="flex w-full items-center py-3.5 text-[15px] font-medium text-native-primary">
            {child.idCard || child.passport ? t('m.identity.editDocs', 'Upravit doklady') : t('m.identity.fillDocs', 'Doplnit doklady')}
          </button>
        )}
      </div>

      <div className="rounded-native-card bg-native-surface px-4">
        <div className="flex items-center border-b border-native-separator py-3">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-native-textMuted">{t('m.identity.addresses', 'Adresy')}</p>
        </div>
        <NativeInfoRow
          label={t('m.identity.permanentAddress', 'Trvalé bydliště')}
          value={addressValue(addressLabel(child.addressPermanent), canManage, () => onOpenAddress('addressPermanent', child.addressPermanent))}
        />
        <NativeInfoRow
          label={t('m.identity.residenceAddress', 'Adresa pobytu')}
          value={addressValue(addressLabel(child.addressResidence) ?? t('m.identity.sameAsPermanent', 'Stejná jako trvalé bydliště'), canManage, () => onOpenAddress('addressResidence', child.addressResidence))}
          isLast
        />
      </div>

      {addressDialogFor && (
        <NativeSheet
          title={addressDialogFor === 'addressPermanent' ? t('m.identity.permanentAddress', 'Trvalé bydliště') : t('m.identity.residenceAddress', 'Adresa pobytu')}
          onClose={onCloseAddress}
          submitting={submitting}
          footer={<NativeButton onClick={() => onSaveAddress({ preventDefault: () => {} })} disabled={submitting}>{submitting ? t('m.identity.saving', 'Ukládám…') : t('m.identity.save', 'Uložit')}</NativeButton>}
        >
          {submitError && <p className="text-[13px] text-native-danger">{submitError}</p>}
          <NativeFormGroup>
            <NativeFormRow label={t('m.identity.street', 'Ulice')}>
              <RowInput value={addressForm.street} onChange={(e) => setAddressForm((f) => ({ ...f, street: e.target.value }))} autoFocus />
            </NativeFormRow>
            <NativeFormRow label={t('m.identity.city', 'Město')}>
              <RowInput value={addressForm.city} onChange={(e) => setAddressForm((f) => ({ ...f, city: e.target.value }))} />
            </NativeFormRow>
            <NativeFormRow label={t('m.identity.zip', 'PSČ')} isLast>
              <RowInput value={addressForm.zip} onChange={(e) => setAddressForm((f) => ({ ...f, zip: e.target.value }))} />
            </NativeFormRow>
          </NativeFormGroup>
        </NativeSheet>
      )}

      {docsDialogOpen && (
        <NativeSheet
          title={t('m.identity.docsTitle', 'Doklady')}
          onClose={onCloseDocs}
          submitting={submitting}
          footer={<NativeButton onClick={() => onSaveDocs({ preventDefault: () => {} })} disabled={submitting}>{submitting ? t('m.identity.saving', 'Ukládám…') : t('m.identity.save', 'Uložit')}</NativeButton>}
        >
          {submitError && <p className="text-[13px] text-native-danger">{submitError}</p>}
          <NativeFormGroup>
            <NativeFormRow label={t('m.identity.idCardNumber', 'Číslo OP')}>
              <RowInput value={docsForm.idCardNumber} onChange={(e) => setDocsForm((f) => ({ ...f, idCardNumber: e.target.value }))} autoFocus />
            </NativeFormRow>
            <NativeFormRow label={t('m.identity.idCardValidUntil', 'OP platný do')}>
              <RowInput type="date" value={docsForm.idCardValidUntil} onChange={(e) => setDocsForm((f) => ({ ...f, idCardValidUntil: e.target.value }))} />
            </NativeFormRow>
            <NativeFormRow label={t('m.identity.passportNumber', 'Číslo pasu')}>
              <RowInput value={docsForm.passportNumber} onChange={(e) => setDocsForm((f) => ({ ...f, passportNumber: e.target.value }))} />
            </NativeFormRow>
            <NativeFormRow label={t('m.identity.passportValidUntil', 'Pas platný do')} isLast>
              <RowInput type="date" value={docsForm.passportValidUntil} onChange={(e) => setDocsForm((f) => ({ ...f, passportValidUntil: e.target.value }))} />
            </NativeFormRow>
          </NativeFormGroup>
        </NativeSheet>
      )}
    </div>
  );
}
