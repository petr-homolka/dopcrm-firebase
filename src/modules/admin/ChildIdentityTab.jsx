/**
 * ChildIdentityTab.jsx — tab "Identita" karty dítěte (RČ, doklady, adresy),
 * vytaženo z ChildDetailPage.jsx při přechodu na Tailwind (2026-07-02).
 * Čistě prezentační: veškerý stav a Firebase volání drží rodič.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { BadgeCheck, Cake } from 'lucide-react';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import ChildFormModal from './ChildFormModal.jsx';
import { formatDate, addressLabel, fieldClass, labelClass } from './childDetailShared.js';

export default function ChildIdentityTab({
  child,
  addressDialogFor,
  addressForm,
  setAddressForm,
  onOpenAddress,
  onCloseAddress,
  onSaveAddress,
  docsDialogOpen,
  docsForm,
  setDocsForm,
  onOpenDocs,
  onCloseDocs,
  onSaveDocs,
  submitting,
  submitError,
  canManage = true,
}) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card>
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{t('child.detail.identity.basicIdentity')}</p>
          <div className="flex items-center gap-2 text-ink-500">
            <BadgeCheck size={16} strokeWidth={1.75} />
            <p className="text-sm">{child.rc ? t('child.detail.identity.rcValue', { rc: child.rc }) : t('child.detail.identity.rcMissing')}</p>
          </div>
          <div className="flex items-center gap-2 text-ink-500">
            <Cake size={16} strokeWidth={1.75} />
            <p className="text-sm">{t('child.detail.identity.birthDate', { date: formatDate(child.birthDate) })}</p>
          </div>
          <div className="my-1 h-px bg-surface-muted" />
          <p className="text-sm text-ink-800">
            {t('child.detail.identity.idCardLabel')} {child.idCard ? `${child.idCard.number}${child.idCard.validUntil ? ` ${t('child.detail.identity.validUntil', { date: child.idCard.validUntil })}` : ''}` : t('child.detail.identity.notIssued')}
          </p>
          <p className="text-sm text-ink-800">
            {t('child.detail.identity.passportLabel')} {child.passport ? `${child.passport.number}${child.passport.validUntil ? ` ${t('child.detail.identity.validUntil', { date: child.passport.validUntil })}` : ''}` : t('child.detail.identity.notIssued')}
          </p>
          {canManage && (
            <Button variant="secondary" size="sm" className="mt-1 self-start" onClick={onOpenDocs}>
              {child.idCard || child.passport ? t('child.detail.identity.editDocs') : t('child.detail.identity.addDocs')}
            </Button>
          )}
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{t('child.detail.identity.addresses')}</p>
          <div>
            <p className="text-sm font-semibold text-ink-800">{t('child.detail.identity.permanentAddress')}</p>
            <p className="text-sm text-ink-500">{addressLabel(child.addressPermanent) ?? t('child.detail.identity.notFilled')}</p>
            {canManage && (
              <Button variant="ghost" size="sm" className="-ml-3 mt-0.5" onClick={() => onOpenAddress('addressPermanent', child.addressPermanent)}>
                {t('child.detail.identity.edit')}
              </Button>
            )}
          </div>
          <div className="h-px bg-surface-muted" />
          <div>
            <p className="text-sm font-semibold text-ink-800">{t('child.detail.identity.residenceAddress')}</p>
            <p className="text-sm text-ink-500">{addressLabel(child.addressResidence) ?? t('child.detail.identity.sameAsPermanent')}</p>
            {canManage && (
              <Button variant="ghost" size="sm" className="-ml-3 mt-0.5" onClick={() => onOpenAddress('addressResidence', child.addressResidence)}>
                {t('child.detail.identity.edit')}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {addressDialogFor && (
        <ChildFormModal
          title={addressDialogFor === 'addressPermanent' ? t('child.detail.identity.permanentAddressTitle') : t('child.detail.identity.residenceAddressTitle')}
          onClose={onCloseAddress}
          onSubmit={onSaveAddress}
          submitting={submitting}
          submitError={submitError}
        >
          <div>
            <label className={labelClass}>{t('child.detail.identity.street')}</label>
            <input className={fieldClass} value={addressForm.street} onChange={(e) => setAddressForm((f) => ({ ...f, street: e.target.value }))} disabled={submitting} autoFocus />
          </div>
          <div>
            <label className={labelClass}>{t('child.detail.identity.city')}</label>
            <input className={fieldClass} value={addressForm.city} onChange={(e) => setAddressForm((f) => ({ ...f, city: e.target.value }))} disabled={submitting} />
          </div>
          <div>
            <label className={labelClass}>{t('child.detail.identity.zip')}</label>
            <input className={fieldClass} value={addressForm.zip} onChange={(e) => setAddressForm((f) => ({ ...f, zip: e.target.value }))} disabled={submitting} />
          </div>
        </ChildFormModal>
      )}

      {docsDialogOpen && (
        <ChildFormModal title={t('child.detail.identity.docsTitle')} onClose={onCloseDocs} onSubmit={onSaveDocs} submitting={submitting} submitError={submitError}>
          <div>
            <label className={labelClass}>{t('child.detail.identity.idCardNumber')}</label>
            <input className={fieldClass} value={docsForm.idCardNumber} onChange={(e) => setDocsForm((f) => ({ ...f, idCardNumber: e.target.value }))} disabled={submitting} autoFocus />
          </div>
          <div>
            <label className={labelClass}>{t('child.detail.identity.idCardValidUntil')}</label>
            <input type="date" className={fieldClass} value={docsForm.idCardValidUntil} onChange={(e) => setDocsForm((f) => ({ ...f, idCardValidUntil: e.target.value }))} disabled={submitting} />
          </div>
          <div>
            <label className={labelClass}>{t('child.detail.identity.passportNumber')}</label>
            <input className={fieldClass} value={docsForm.passportNumber} onChange={(e) => setDocsForm((f) => ({ ...f, passportNumber: e.target.value }))} disabled={submitting} />
          </div>
          <div>
            <label className={labelClass}>{t('child.detail.identity.passportValidUntil')}</label>
            <input type="date" className={fieldClass} value={docsForm.passportValidUntil} onChange={(e) => setDocsForm((f) => ({ ...f, passportValidUntil: e.target.value }))} disabled={submitting} />
          </div>
        </ChildFormModal>
      )}
    </div>
  );
}
