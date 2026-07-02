/**
 * ChildIdentityTab.jsx — tab "Identita" karty dítěte (RČ, doklady, adresy),
 * vytaženo z ChildDetailPage.jsx při přechodu na Tailwind (2026-07-02).
 * Čistě prezentační: veškerý stav a Firebase volání drží rodič.
 */

import React from 'react';
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
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card>
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">Základní identita</p>
          <div className="flex items-center gap-2 text-stone-500">
            <BadgeCheck size={16} strokeWidth={1.75} />
            <p className="text-sm">{child.rc ? `RČ ${child.rc}` : 'Rodné číslo nezadáno'}</p>
          </div>
          <div className="flex items-center gap-2 text-stone-500">
            <Cake size={16} strokeWidth={1.75} />
            <p className="text-sm">Narození {formatDate(child.birthDate)}</p>
          </div>
          <div className="my-1 h-px bg-stone-100" />
          <p className="text-sm text-stone-800">
            Občanský průkaz: {child.idCard ? `${child.idCard.number}${child.idCard.validUntil ? ` (platný do ${child.idCard.validUntil})` : ''}` : 'nevydán'}
          </p>
          <p className="text-sm text-stone-800">
            Cestovní pas: {child.passport ? `${child.passport.number}${child.passport.validUntil ? ` (platný do ${child.passport.validUntil})` : ''}` : 'nevydán'}
          </p>
          <Button variant="secondary" size="sm" className="mt-1 self-start" onClick={onOpenDocs}>
            {child.idCard || child.passport ? 'Upravit doklady' : 'Doplnit doklady'}
          </Button>
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">Adresy</p>
          <div>
            <p className="text-sm font-semibold text-stone-800">Trvalé bydliště</p>
            <p className="text-sm text-stone-500">{addressLabel(child.addressPermanent) ?? 'Nevyplněno'}</p>
            <Button variant="ghost" size="sm" className="-ml-3 mt-0.5" onClick={() => onOpenAddress('addressPermanent', child.addressPermanent)}>
              Upravit
            </Button>
          </div>
          <div className="h-px bg-stone-100" />
          <div>
            <p className="text-sm font-semibold text-stone-800">Adresa pobytu (pokud jiná)</p>
            <p className="text-sm text-stone-500">{addressLabel(child.addressResidence) ?? 'Stejná jako trvalé bydliště'}</p>
            <Button variant="ghost" size="sm" className="-ml-3 mt-0.5" onClick={() => onOpenAddress('addressResidence', child.addressResidence)}>
              Upravit
            </Button>
          </div>
        </div>
      </Card>

      {addressDialogFor && (
        <ChildFormModal
          title={addressDialogFor === 'addressPermanent' ? 'Adresa trvalého bydliště' : 'Adresa pobytu'}
          onClose={onCloseAddress}
          onSubmit={onSaveAddress}
          submitting={submitting}
          submitError={submitError}
        >
          <div>
            <label className={labelClass}>Ulice a číslo</label>
            <input className={fieldClass} value={addressForm.street} onChange={(e) => setAddressForm((f) => ({ ...f, street: e.target.value }))} disabled={submitting} autoFocus />
          </div>
          <div>
            <label className={labelClass}>Město</label>
            <input className={fieldClass} value={addressForm.city} onChange={(e) => setAddressForm((f) => ({ ...f, city: e.target.value }))} disabled={submitting} />
          </div>
          <div>
            <label className={labelClass}>PSČ</label>
            <input className={fieldClass} value={addressForm.zip} onChange={(e) => setAddressForm((f) => ({ ...f, zip: e.target.value }))} disabled={submitting} />
          </div>
        </ChildFormModal>
      )}

      {docsDialogOpen && (
        <ChildFormModal title="Doklady" onClose={onCloseDocs} onSubmit={onSaveDocs} submitting={submitting} submitError={submitError}>
          <div>
            <label className={labelClass}>Číslo OP</label>
            <input className={fieldClass} value={docsForm.idCardNumber} onChange={(e) => setDocsForm((f) => ({ ...f, idCardNumber: e.target.value }))} disabled={submitting} autoFocus />
          </div>
          <div>
            <label className={labelClass}>OP platný do</label>
            <input type="date" className={fieldClass} value={docsForm.idCardValidUntil} onChange={(e) => setDocsForm((f) => ({ ...f, idCardValidUntil: e.target.value }))} disabled={submitting} />
          </div>
          <div>
            <label className={labelClass}>Číslo cestovního pasu</label>
            <input className={fieldClass} value={docsForm.passportNumber} onChange={(e) => setDocsForm((f) => ({ ...f, passportNumber: e.target.value }))} disabled={submitting} />
          </div>
          <div>
            <label className={labelClass}>Pas platný do</label>
            <input type="date" className={fieldClass} value={docsForm.passportValidUntil} onChange={(e) => setDocsForm((f) => ({ ...f, passportValidUntil: e.target.value }))} disabled={submitting} />
          </div>
        </ChildFormModal>
      )}
    </div>
  );
}
