/**
 * ChildSocialSpaceTab.jsx — tab "Sociální prostor" karty dítěte (osoby bez
 * biologické vazby — kmotři, rodinní přátelé…). Vytaženo z ChildDetailPage.jsx
 * při přechodu na Tailwind (2026-07-02).
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { UserPlus } from 'lucide-react';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import ChildFormModal from './ChildFormModal.jsx';
import { fieldClass, labelClass } from './childDetailShared.js';

export default function ChildSocialSpaceTab({
  child,
  socialDialogOpen,
  socialForm,
  setSocialForm,
  onOpen,
  onClose,
  onAdd,
  submitting,
  submitError,
  canManage = true,
}) {
  const { t } = useTranslation();
  const socialSpace = child.socialSpace ?? [];

  return (
    <Card>
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-base font-semibold text-stone-800">{t('child.detail.socialSpace.title', { count: socialSpace.length })}</h2>
        {canManage && (
          <Button variant="secondary" size="sm" onClick={onOpen}>
            <UserPlus size={16} strokeWidth={1.75} />
            {t('child.detail.socialSpace.addPerson')}
          </Button>
        )}
      </div>
      <p className="mb-1 text-sm text-stone-500">
        {t('child.detail.socialSpace.description')}
      </p>

      {socialSpace.length === 0 && <p className="py-2 text-sm text-stone-500">{t('child.detail.socialSpace.empty')}</p>}

      <ul>
        {socialSpace.map((p) => (
          <li key={p.id} className="border-t border-stone-100 py-2.5 first:border-t-0">
            <p className="text-sm font-semibold text-stone-800">{p.name}</p>
            <p className="text-xs text-stone-500">{[p.vztah, p.phone, p.email, p.note].filter(Boolean).join(' · ')}</p>
          </li>
        ))}
      </ul>

      {socialDialogOpen && (
        <ChildFormModal title={t('child.detail.socialSpace.modalTitle')} onClose={onClose} onSubmit={onAdd} submitting={submitting} submitError={submitError} submitLabel={t('child.detail.socialSpace.add')}>
          <div>
            <label className={labelClass}>{t('child.detail.socialSpace.nameLabel')}</label>
            <input className={fieldClass} value={socialForm.name} onChange={(e) => setSocialForm((f) => ({ ...f, name: e.target.value }))} required disabled={submitting} autoFocus />
          </div>
          <div>
            <label className={labelClass}>{t('child.detail.socialSpace.relationLabel')}</label>
            <input className={fieldClass} placeholder={t('child.detail.socialSpace.relationPlaceholder')} value={socialForm.vztah} onChange={(e) => setSocialForm((f) => ({ ...f, vztah: e.target.value }))} disabled={submitting} />
          </div>
          <div>
            <label className={labelClass}>{t('child.detail.socialSpace.phoneLabel')}</label>
            <input className={fieldClass} value={socialForm.phone} onChange={(e) => setSocialForm((f) => ({ ...f, phone: e.target.value }))} disabled={submitting} />
          </div>
          <div>
            <label className={labelClass}>{t('child.detail.socialSpace.emailLabel')}</label>
            <input className={fieldClass} value={socialForm.email} onChange={(e) => setSocialForm((f) => ({ ...f, email: e.target.value }))} disabled={submitting} />
          </div>
        </ChildFormModal>
      )}
    </Card>
  );
}
