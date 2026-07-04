/**
 * FosterFamilySocialTab.jsx — záložka "Sociální prostor" vytažená z
 * FosterFamilyDetailPage.jsx, aby hlavní soubor zůstal pod 300 řádky (viz
 * CLAUDE.md). Čistě prezentační, veškerý state a Firebase volání drží rodič.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';

import Card from '../../components/ui/Card.jsx';

function SectionLabel({ children }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{children}</p>
  );
}

function AddLink({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium text-brand-700 hover:bg-brand-50"
    >
      <Plus size={16} strokeWidth={1.75} />
      {children}
    </button>
  );
}

export default function FosterFamilySocialTab({ socialForm, onAddPartner, onAddChild, onAddParent, canManage = true }) {
  const { t } = useTranslation();
  const biologicalChildren = socialForm.biologicalChildren ?? [];
  const parents = socialForm.parents ?? [];

  return (
    <Card>
      <h2 className="mb-4 text-base font-semibold text-ink-800">{t('family.detail.social.title')}</h2>

      <SectionLabel>{t('family.detail.social.partnerLabel')}</SectionLabel>
      {socialForm.partner?.name ? (
        <p className="mb-5 mt-1 text-sm text-ink-700">
          {socialForm.partner.name}
          {socialForm.partner.rc ? ` · ${t('family.detail.social.rcPrefix', { rc: socialForm.partner.rc })}` : ''}
          {socialForm.partner.phone ? ` · ${socialForm.partner.phone}` : ''}
        </p>
      ) : (
        <div className="mb-5 mt-1">
          <p className="mb-1.5 text-sm text-ink-500">{t('family.detail.social.notFilled')}</p>
          {canManage && <AddLink onClick={onAddPartner}>{t('family.detail.social.addPartner')}</AddLink>}
        </div>
      )}

      <div className="mb-5 border-t border-border-subtle pt-4">
        <div className="flex items-center justify-between">
          <SectionLabel>{t('family.detail.social.biologicalChildrenLabel')}</SectionLabel>
          {canManage && <AddLink onClick={onAddChild}>{t('family.detail.social.add')}</AddLink>}
        </div>
        <div className="mt-2 flex flex-col divide-y divide-border-subtle">
          {biologicalChildren.length === 0 && (
            <p className="py-1.5 text-sm text-ink-500">{t('family.detail.social.noneFemale')}</p>
          )}
          {biologicalChildren.map((c, i) => (
            <div key={i} className="py-1.5">
              <p className="text-sm text-ink-800">{c.name}</p>
              <p className="text-sm text-ink-500">
                {[c.rc && t('family.detail.social.rcPrefix', { rc: c.rc }), c.birthDate].filter(Boolean).join(' · ')}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border-subtle pt-4">
        <div className="flex items-center justify-between">
          <SectionLabel>{t('family.detail.social.parentsLabel')}</SectionLabel>
          {canManage && <AddLink onClick={onAddParent}>{t('family.detail.social.add')}</AddLink>}
        </div>
        <div className="mt-2 flex flex-col divide-y divide-border-subtle">
          {parents.length === 0 && <p className="py-1.5 text-sm text-ink-500">{t('family.detail.social.noneMale')}</p>}
          {parents.map((p, i) => (
            <div key={i} className="py-1.5">
              <p className="text-sm text-ink-800">{p.name}</p>
              <p className="text-sm text-ink-500">
                {[p.rc && t('family.detail.social.rcPrefix', { rc: p.rc }), p.phone].filter(Boolean).join(' · ')}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
