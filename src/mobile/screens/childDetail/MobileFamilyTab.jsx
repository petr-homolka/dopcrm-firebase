/**
 * MobileFamilyTab.jsx — "Biologická rodina" v mobilním Detailu dítěte.
 *
 * v4 (2026-07-06, Lidl vzor — závazná zpětná vazba): údaje osob NEJSOU
 * nahusto v jednom řádku — každý pěstoun/příbuzný/předchozí rodina je karta
 * se jménem (17px semibold) nahoře a tabulkou název vlevo / hodnota vpravo
 * (NativeInfoRow), viz MobileFostersTab.jsx. Formulář "Přidat příbuzného"
 * používá skutečný systémový <select> (RowSelect) — nad ním iOS/Android
 * vykreslí svůj nativní picker. Žádná sdílená JSX s desktop verzí.
 */

import React from 'react';
import { UserPlus, Plus, User, Users } from 'lucide-react';
import { cn } from '../../../components/ui/cn.js';
import { REL_TYPES, legalWeightLabel, legalWeightTone } from '../../../shared/domainConstants.js';
import { parseRc } from '../../../shared/rcUtils.js';
import NativeSheet from '../../ui/NativeSheet.jsx';
import NativeButton from '../../ui/NativeButton.jsx';
import { SectionLabel } from '../../ui/NativeBits.jsx';
import { NativeFormGroup, NativeFormRow, NativeInfoRow, RowInput, RowTextarea, RowSelect } from '../../ui/NativeFormRow.jsx';

const TONE_CLASS = {
  family: 'bg-native-primary/15 text-native-primary',
  warning: 'bg-native-warning/15 text-native-warning',
  neutral: 'bg-native-textMuted/15 text-native-textMuted',
};

function WeightChip({ weight }) {
  return (
    <span className={cn('shrink-0 rounded-full px-2.5 py-1 text-[12px] font-semibold', TONE_CLASS[legalWeightTone(weight)])}>
      {legalWeightLabel(weight)}
    </span>
  );
}

/** Hlavička karty osoby/rodiny — kruhová ikona, jméno 17px semibold, vpravo chip. */
function CardHeader({ icon: Icon, name, chip }) {
  return (
    <div className="flex items-center gap-3 border-b border-native-separator py-3.5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-native-primary/10 text-native-primary">
        <Icon size={22} strokeWidth={1.75} />
      </span>
      <p className="min-w-0 flex-1 truncate text-[17px] font-semibold text-native-text">{name}</p>
      {chip}
    </div>
  );
}

/** Telefon/e-mail jako proklikávací hodnota v NativeInfoRow; prázdné → pomlčka. */
function phoneValue(phone) {
  return phone ? <a href={`tel:${phone.replace(/\s/g, '')}`} className="text-native-primary">{phone}</a> : '';
}

function emailValue(email) {
  return email ? <a href={`mailto:${email}`} className="break-all text-native-primary">{email}</a> : '';
}

/** Odkaz "Přidat" vpravo vedle sekčního nadpisu. */
function AddLink({ icon: Icon, onClick, children }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-1 text-[13px] font-medium text-native-primary">
      <Icon size={15} strokeWidth={2} /> {children}
    </button>
  );
}

export default function MobileFamilyTab({
  child, family, previousFosters, hasMorePreviousFosters, onLoadMorePreviousFosters, relGroupsData,
  relDialogOpen, relForm, setRelForm, onOpenRel, onCloseRel, onAddRelative,
  fosterHistDialogOpen, fosterHistForm, setFosterHistForm, onOpenFosterHist, onCloseFosterHist, onAddFosterHist,
  submitting, submitError, canManage,
}) {
  const relatives = child.relatives ?? [];
  const fosters = family?.fosters ?? [];
  const caregiverIds = child.custody?.caregivers ?? [];
  const relRc = parseRc(relForm.rc);

  return (
    <div className="flex flex-col px-4 pb-6 pt-1">
      <SectionLabel>Pěstouni a svěření ({fosters.length})</SectionLabel>
      <div className="flex flex-col gap-3">
        <div className="rounded-native-card bg-native-surface px-4">
          <NativeInfoRow label="Svěření" value={child.custody ? (child.custody.type === 'spolecne' ? 'Společné' : 'Individuální') : ''} />
          <NativeInfoRow label="Spisová značka" value={child.custody?.caseNumber} isLast />
        </div>
        {fosters.length === 0 && <p className="text-[15px] text-native-textMuted">Žádní pěstouni.</p>}
        {fosters.map((p) => (
          <div key={p.id} className="rounded-native-card bg-native-surface px-4">
            <CardHeader icon={User} name={p.name} chip={<WeightChip weight={caregiverIds.includes(p.id) ? 'pecujici' : 'bez_prav'} />} />
            <NativeInfoRow label="Rodné číslo" value={p.rc} />
            <NativeInfoRow label="Telefon" value={phoneValue(p.phone)} />
            <NativeInfoRow label="E-mail" value={emailValue(p.email)} isLast />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <SectionLabel>Příbuzní ({relatives.length})</SectionLabel>
        {canManage && <AddLink icon={UserPlus} onClick={onOpenRel}>Přidat</AddLink>}
      </div>
      {relatives.length === 0 && <p className="text-[15px] text-native-textMuted">Žádní evidovaní příbuzní.</p>}
      <div className="flex flex-col gap-3">
        {relatives.map((rel, idx) => {
          const relType = REL_TYPES.find((r) => r.key === rel.rel);
          return (
            <div key={rel.id ?? idx} className="rounded-native-card bg-native-surface px-4">
              <CardHeader icon={User} name={rel.name} chip={<WeightChip weight={relType?.legalWeight} />} />
              <NativeInfoRow label="Vztah" value={relType?.label ?? rel.rel} />
              <NativeInfoRow label="Rodné číslo" value={rel.rc} />
              <NativeInfoRow label="Telefon" value={phoneValue(rel.phone)} />
              <NativeInfoRow label="E-mail" value={emailValue(rel.email)} isLast={!rel.note} />
              {rel.note && <NativeInfoRow label="Poznámka" value={rel.note} isLast />}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <SectionLabel>Předchozí pěstounské rodiny ({previousFosters.length})</SectionLabel>
        {canManage && <AddLink icon={Plus} onClick={onOpenFosterHist}>Přidat</AddLink>}
      </div>
      {previousFosters.length === 0 && <p className="text-[15px] text-native-textMuted">Žádné předchozí umístění v evidenci.</p>}
      <div className="flex flex-col gap-3">
        {previousFosters.map((pf) => (
          <div key={pf.id} className="rounded-native-card bg-native-surface px-4">
            <CardHeader icon={Users} name={pf.name} />
            <NativeInfoRow label="Od" value={pf.from} />
            <NativeInfoRow label="Do" value={pf.to} isLast={!pf.note} />
            {pf.note && <NativeInfoRow label="Poznámka" value={pf.note} isLast />}
          </div>
        ))}
      </div>
      {hasMorePreviousFosters && (
        <NativeButton variant="secondary" className="mt-3 h-11" onClick={onLoadMorePreviousFosters}>Načíst další</NativeButton>
      )}

      {relDialogOpen && (
        <NativeSheet
          title="Přidat příbuzného"
          onClose={onCloseRel}
          submitting={submitting}
          footer={<NativeButton onClick={() => onAddRelative({ preventDefault: () => {} })} disabled={submitting || !relForm.name.trim() || !!relRc.error}>{submitting ? 'Ukládám…' : 'Přidat'}</NativeButton>}
        >
          {submitError && <p className="text-[13px] text-native-danger">{submitError}</p>}
          <NativeFormGroup>
            <NativeFormRow label="Jméno a příjmení">
              <RowInput value={relForm.name} onChange={(e) => setRelForm((f) => ({ ...f, name: e.target.value }))} autoFocus />
            </NativeFormRow>
            <NativeFormRow
              label="Rodné číslo"
              hint={relRc.error ?? (relRc.checksumWarning ? 'Kontrolní součet RČ nesedí — zkontrolujte, prosím.' : undefined)}
              hintTone={relRc.error ? 'danger' : 'warning'}
            >
              <RowInput placeholder="např. 654321/0987" value={relForm.rc} onChange={(e) => setRelForm((f) => ({ ...f, rc: e.target.value }))} />
            </NativeFormRow>
            <NativeFormRow label="Typ vztahu">
              <RowSelect value={relForm.rel} onChange={(e) => setRelForm((f) => ({ ...f, rel: e.target.value }))}>
                {Object.entries(relGroupsData).map(([groupName, items]) => (
                  <optgroup key={groupName} label={groupName}>
                    {items.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
                  </optgroup>
                ))}
              </RowSelect>
            </NativeFormRow>
            <NativeFormRow label="Telefon">
              <RowInput type="tel" value={relForm.phone} onChange={(e) => setRelForm((f) => ({ ...f, phone: e.target.value }))} />
            </NativeFormRow>
            <NativeFormRow label="E-mail">
              <RowInput type="email" value={relForm.email} onChange={(e) => setRelForm((f) => ({ ...f, email: e.target.value }))} />
            </NativeFormRow>
            <NativeFormRow label="Poznámka" isLast stacked>
              <RowTextarea rows={2} placeholder="např. styk 1× měsíčně" value={relForm.note} onChange={(e) => setRelForm((f) => ({ ...f, note: e.target.value }))} />
            </NativeFormRow>
          </NativeFormGroup>
        </NativeSheet>
      )}

      {fosterHistDialogOpen && (
        <NativeSheet
          title="Předchozí pěstounská rodina"
          onClose={onCloseFosterHist}
          submitting={submitting}
          footer={<NativeButton onClick={() => onAddFosterHist({ preventDefault: () => {} })} disabled={submitting || !fosterHistForm.name.trim()}>{submitting ? 'Ukládám…' : 'Přidat'}</NativeButton>}
        >
          {submitError && <p className="text-[13px] text-native-danger">{submitError}</p>}
          <NativeFormGroup>
            <NativeFormRow label="Rodina / pěstoun">
              <RowInput value={fosterHistForm.name} onChange={(e) => setFosterHistForm((f) => ({ ...f, name: e.target.value }))} autoFocus />
            </NativeFormRow>
            <NativeFormRow label="Od">
              <RowInput type="date" value={fosterHistForm.from} onChange={(e) => setFosterHistForm((f) => ({ ...f, from: e.target.value }))} />
            </NativeFormRow>
            <NativeFormRow label="Do">
              <RowInput type="date" value={fosterHistForm.to} onChange={(e) => setFosterHistForm((f) => ({ ...f, to: e.target.value }))} />
            </NativeFormRow>
            <NativeFormRow label="Poznámka" isLast stacked>
              <RowTextarea rows={2} value={fosterHistForm.note} onChange={(e) => setFosterHistForm((f) => ({ ...f, note: e.target.value }))} />
            </NativeFormRow>
          </NativeFormGroup>
        </NativeSheet>
      )}
    </div>
  );
}
