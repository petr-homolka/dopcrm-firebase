/**
 * MobileSocialTab.jsx — záložka "Sociální prostor" v mobilním Detailu rodiny.
 *
 * v4 (2026-07-06, Lidl vzor): osoby (partner, biologické děti, rodiče) jako
 * karty se jménem 17px semibold nahoře a NativeInfoRow tabulkou (název vlevo
 * / hodnota vpravo) — už žádné „RČ · telefon" nahusto v jednom řádku.
 */

import React from 'react';
import { Plus } from 'lucide-react';
import { SectionLabel } from '../../ui/NativeBits.jsx';
import { NativeInfoRow } from '../../ui/NativeFormRow.jsx';

function AddLink({ onClick, children }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-1 text-[15px] font-medium text-native-primary">
      <Plus size={16} strokeWidth={2} /> {children}
    </button>
  );
}

function PersonCard({ name, rows }) {
  return (
    <div className="rounded-native-card bg-native-surface px-4">
      <p className="border-b border-native-separator py-3.5 text-[17px] font-bold text-native-text">{name}</p>
      {rows.map((r, i) => (
        <NativeInfoRow key={r.label} label={r.label} value={r.value} isLast={i === rows.length - 1} />
      ))}
    </div>
  );
}

export default function MobileSocialTab({ socialForm, onAddPartner, onAddChild, onAddParent, canManage }) {
  const biologicalChildren = socialForm.biologicalChildren ?? [];
  const parents = socialForm.parents ?? [];
  const partner = socialForm.partner;

  const phoneValue = (phone) => (phone ? <a href={`tel:${phone.replace(/\s/g, '')}`} className="text-native-primary">{phone}</a> : '');

  return (
    <div className="flex flex-col px-4 pb-6 pt-1">
      <SectionLabel>Partner/partnerka</SectionLabel>
      {partner?.name ? (
        <PersonCard name={partner.name} rows={[{ label: 'Rodné číslo', value: partner.rc }, { label: 'Telefon', value: phoneValue(partner.phone) }]} />
      ) : (
        <div className="flex items-center justify-between rounded-native-card bg-native-surface px-4 py-3.5">
          <span className="text-[15px] text-native-textMuted">Nevyplněno</span>
          {canManage && <AddLink onClick={onAddPartner}>Přidat</AddLink>}
        </div>
      )}

      <div className="flex items-center justify-between">
        <SectionLabel>Biologické děti</SectionLabel>
        {canManage && biologicalChildren.length > 0 && <AddLink onClick={onAddChild}>Přidat</AddLink>}
      </div>
      {biologicalChildren.length === 0 ? (
        <div className="flex items-center justify-between rounded-native-card bg-native-surface px-4 py-3.5">
          <span className="text-[15px] text-native-textMuted">Žádné</span>
          {canManage && <AddLink onClick={onAddChild}>Přidat</AddLink>}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {biologicalChildren.map((c, i) => (
            <PersonCard key={c.id ?? i} name={c.name} rows={[{ label: 'Rodné číslo', value: c.rc }, { label: 'Datum narození', value: c.birthDate }]} />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <SectionLabel>Rodiče</SectionLabel>
        {canManage && parents.length > 0 && <AddLink onClick={onAddParent}>Přidat</AddLink>}
      </div>
      {parents.length === 0 ? (
        <div className="flex items-center justify-between rounded-native-card bg-native-surface px-4 py-3.5">
          <span className="text-[15px] text-native-textMuted">Žádní</span>
          {canManage && <AddLink onClick={onAddParent}>Přidat</AddLink>}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {parents.map((p, i) => (
            <PersonCard key={p.id ?? i} name={p.name} rows={[{ label: 'Rodné číslo', value: p.rc }, { label: 'Telefon', value: phoneValue(p.phone) }]} />
          ))}
        </div>
      )}
    </div>
  );
}
