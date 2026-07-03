/**
 * FosterFamilySocialTab.jsx — záložka "Sociální prostor" vytažená z
 * FosterFamilyDetailPage.jsx, aby hlavní soubor zůstal pod 300 řádky (viz
 * CLAUDE.md). Čistě prezentační, veškerý state a Firebase volání drží rodič.
 */

import React from 'react';
import { Plus } from 'lucide-react';

import Card from '../../components/ui/Card.jsx';

function SectionLabel({ children }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">{children}</p>
  );
}

function AddLink({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium text-primary-700 hover:bg-primary-50"
    >
      <Plus size={16} strokeWidth={1.75} />
      {children}
    </button>
  );
}

export default function FosterFamilySocialTab({ socialForm, onAddPartner, onAddChild, onAddParent, canManage = true }) {
  const biologicalChildren = socialForm.biologicalChildren ?? [];
  const parents = socialForm.parents ?? [];

  return (
    <Card>
      <h2 className="mb-4 text-base font-semibold text-stone-800">Sociální prostor domácnosti</h2>

      <SectionLabel>Manžel / partner</SectionLabel>
      {socialForm.partner?.name ? (
        <p className="mb-5 mt-1 text-sm text-stone-700">
          {socialForm.partner.name}
          {socialForm.partner.rc ? ` · RČ ${socialForm.partner.rc}` : ''}
          {socialForm.partner.phone ? ` · ${socialForm.partner.phone}` : ''}
        </p>
      ) : (
        <div className="mb-5 mt-1">
          <p className="mb-1.5 text-sm text-stone-500">Nevyplněno.</p>
          {canManage && <AddLink onClick={onAddPartner}>Doplnit partnera</AddLink>}
        </div>
      )}

      <div className="mb-5 border-t border-stone-100 pt-4">
        <div className="flex items-center justify-between">
          <SectionLabel>Biologické děti (mimo pěstounskou péči)</SectionLabel>
          {canManage && <AddLink onClick={onAddChild}>Přidat</AddLink>}
        </div>
        <div className="mt-2 flex flex-col divide-y divide-stone-100">
          {biologicalChildren.length === 0 && (
            <p className="py-1.5 text-sm text-stone-500">Žádné.</p>
          )}
          {biologicalChildren.map((c, i) => (
            <div key={i} className="py-1.5">
              <p className="text-sm text-stone-800">{c.name}</p>
              <p className="text-sm text-stone-500">
                {[c.rc && `RČ ${c.rc}`, c.birthDate].filter(Boolean).join(' · ')}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-stone-100 pt-4">
        <div className="flex items-center justify-between">
          <SectionLabel>Rodiče pěstouna</SectionLabel>
          {canManage && <AddLink onClick={onAddParent}>Přidat</AddLink>}
        </div>
        <div className="mt-2 flex flex-col divide-y divide-stone-100">
          {parents.length === 0 && <p className="py-1.5 text-sm text-stone-500">Žádní.</p>}
          {parents.map((p, i) => (
            <div key={i} className="py-1.5">
              <p className="text-sm text-stone-800">{p.name}</p>
              <p className="text-sm text-stone-500">
                {[p.rc && `RČ ${p.rc}`, p.phone].filter(Boolean).join(' · ')}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
