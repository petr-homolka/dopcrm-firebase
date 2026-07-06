/**
 * ChildSchoolTab.jsx — tab "Škola" karty dítěte, vytaženo z ChildDetailPage.jsx
 * při přechodu na Tailwind (2026-07-02). Čistě prezentační komponenta.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import ChildFormModal from './ChildFormModal.jsx';
import { fieldClass, labelClass } from './childDetailShared.js';

export default function ChildSchoolTab({
  child,
  schoolDialogOpen,
  schoolForm,
  setSchoolForm,
  onOpen,
  onClose,
  onSave,
  submitting,
  submitError,
  canManage = true,
}) {
  const { t } = useTranslation();
  return (
    <Card>
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-base font-semibold text-ink-800">{t('child.detail.school.title')}</h2>
        {canManage && (
          <Button variant="secondary" size="sm" onClick={onOpen}>
            {child.school ? t('child.detail.school.edit') : t('child.detail.school.add')}
          </Button>
        )}
      </div>

      {child.school ? (
        <div className="flex flex-col gap-0.5">
          <p className="font-semibold text-ink-800">{child.school.nazev}</p>
          <p className="text-sm text-ink-500">{child.school.adresa}</p>
          <p className="text-sm text-ink-500">
            {[child.school.telefon, child.school.email].filter(Boolean).join(' · ')}
          </p>
          <p className="text-sm text-ink-800">{t('child.detail.school.classTeacher')} {child.school.tridniUcitel || '—'}</p>
          <p className="text-sm text-ink-800">{t('child.detail.school.grade')} {child.school.rocnik || '—'}</p>
        </div>
      ) : (
        <p className="text-sm text-ink-500">{t('child.detail.school.empty')}</p>
      )}

      {schoolDialogOpen && (
        <ChildFormModal title={t('child.detail.school.title')} onClose={onClose} onSubmit={onSave} submitting={submitting} submitError={submitError}>
          <div>
            <label className={labelClass}>{t('child.detail.school.nameLabel')}</label>
            <input className={fieldClass} value={schoolForm.nazev} onChange={(e) => setSchoolForm((f) => ({ ...f, nazev: e.target.value }))} required disabled={submitting} autoFocus />
          </div>
          <div>
            <label className={labelClass}>{t('child.detail.school.addressLabel')}</label>
            <input className={fieldClass} value={schoolForm.adresa} onChange={(e) => setSchoolForm((f) => ({ ...f, adresa: e.target.value }))} disabled={submitting} />
          </div>
          <div>
            <label className={labelClass}>{t('child.detail.school.phoneLabel')}</label>
            <input className={fieldClass} value={schoolForm.telefon} onChange={(e) => setSchoolForm((f) => ({ ...f, telefon: e.target.value }))} disabled={submitting} />
          </div>
          <div>
            <label className={labelClass}>{t('child.detail.school.emailLabel')}</label>
            <input className={fieldClass} value={schoolForm.email} onChange={(e) => setSchoolForm((f) => ({ ...f, email: e.target.value }))} disabled={submitting} />
          </div>
          <div>
            <label className={labelClass}>{t('child.detail.school.classTeacherLabel')}</label>
            <input className={fieldClass} value={schoolForm.tridniUcitel} onChange={(e) => setSchoolForm((f) => ({ ...f, tridniUcitel: e.target.value }))} disabled={submitting} />
          </div>
          <div>
            <label className={labelClass}>{t('child.detail.school.gradeLabel')}</label>
            <input className={fieldClass} value={schoolForm.rocnik} onChange={(e) => setSchoolForm((f) => ({ ...f, rocnik: e.target.value }))} disabled={submitting} />
          </div>
        </ChildFormModal>
      )}
    </Card>
  );
}
