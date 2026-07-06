/**
 * MobileSocialTab.jsx — záložka "Sociální prostor" v mobilním Detailu rodiny
 * (STRICT UI/UX DESIGN MANDATE, 2026-07-05). Native karty pro partnera,
 * biologické děti a rodiče. Žádná sdílená JSX s desktop verzí.
 */

import React from 'react';
import { Plus } from 'lucide-react';
import { SectionLabel } from '../../ui/NativeBits.jsx';

function AddLink({ onClick, children }) {
  return (
    <button type="button" onClick={onClick} className="mt-1 flex items-center gap-1 text-[14px] font-medium text-native-primary">
      <Plus size={15} strokeWidth={2} /> {children}
    </button>
  );
}

export default function MobileSocialTab({ socialForm, onAddPartner, onAddChild, onAddParent, canManage }) {
  const biologicalChildren = socialForm.biologicalChildren ?? [];
  const parents = socialForm.parents ?? [];

  return (
    <div className="flex flex-col px-4 pb-6 pt-1">
      <SectionLabel>Partner/partnerka</SectionLabel>
      {socialForm.partner?.name ? (
        <div className="rounded-native-card bg-native-surface px-4 py-3">
          <p className="text-[15px] font-medium text-native-text">{socialForm.partner.name}</p>
          <p className="text-[13px] text-native-textMuted">
            {[socialForm.partner.rc && `RČ ${socialForm.partner.rc}`, socialForm.partner.phone].filter(Boolean).join(' · ')}
          </p>
        </div>
      ) : (
        <>
          <p className="text-[15px] text-native-textMuted">Nevyplněno.</p>
          {canManage && <AddLink onClick={onAddPartner}>Přidat partnera</AddLink>}
        </>
      )}

      <div className="flex items-center justify-between">
        <SectionLabel>Biologické děti</SectionLabel>
        {canManage && <AddLink onClick={onAddChild}>Přidat</AddLink>}
      </div>
      {biologicalChildren.length === 0 && <p className="text-[15px] text-native-textMuted">Žádné.</p>}
      <div className="flex flex-col gap-2">
        {biologicalChildren.map((c, i) => (
          <div key={c.id ?? i} className="rounded-native-card bg-native-surface px-4 py-3">
            <p className="text-[15px] font-medium text-native-text">{c.name}</p>
            <p className="text-[13px] text-native-textMuted">
              {[c.rc && `RČ ${c.rc}`, c.birthDate].filter(Boolean).join(' · ')}
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <SectionLabel>Rodiče</SectionLabel>
        {canManage && <AddLink onClick={onAddParent}>Přidat</AddLink>}
      </div>
      {parents.length === 0 && <p className="text-[15px] text-native-textMuted">Žádní.</p>}
      <div className="flex flex-col gap-2">
        {parents.map((p, i) => (
          <div key={p.id ?? i} className="rounded-native-card bg-native-surface px-4 py-3">
            <p className="text-[15px] font-medium text-native-text">{p.name}</p>
            <p className="text-[13px] text-native-textMuted">
              {[p.rc && `RČ ${p.rc}`, p.phone].filter(Boolean).join(' · ')}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
