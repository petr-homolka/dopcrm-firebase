/**
 * MobileFamilyTab.jsx — "Biologická rodina" v mobilním Detailu dítěte
 * (STRICT UI/UX DESIGN MANDATE, 2026-07-05 dodatek): pěstouni/svěření,
 * evidovaní příbuzní (REL_TYPES) a historie předchozích pěstounských rodin.
 * Formulář "Přidat příbuzného" používá skutečný systémový <select> (RowSelect)
 * — nad ním iOS/Android vykreslí svůj nativní picker. Žádná sdílená JSX s
 * desktop ChildFamilyTab.jsx/AddRelativeModal.jsx.
 */

import React from 'react';
import { UserPlus, Plus } from 'lucide-react';
import { cn } from '../../../components/ui/cn.js';
import { REL_TYPES, legalWeightLabel, legalWeightTone } from '../../../shared/domainConstants.js';
import { parseRc } from '../../../shared/rcUtils.js';
import NativeSheet from '../../ui/NativeSheet.jsx';
import NativeButton from '../../ui/NativeButton.jsx';
import { NativeFormGroup, NativeFormRow, RowInput, RowTextarea, RowSelect } from '../../ui/NativeFormRow.jsx';

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
    <div className="flex flex-col gap-3 px-4 pb-6 pt-3">
      <div className="rounded-native-card bg-native-surface p-4">
        <p className="text-[12px] font-semibold uppercase tracking-wide text-native-textMuted">Pěstouni a svěření ({fosters.length})</p>
        <p className="mt-0.5 text-[13px] text-native-textMuted">
          {child.custody
            ? `${child.custody.type === 'spolecne' ? 'Společné svěření' : 'Individuální svěření'}${child.custody.caseNumber ? ` · sp. zn. ${child.custody.caseNumber}` : ''}`
            : 'Svěření nevyplněno.'}
        </p>
        {fosters.length === 0 && <p className="py-2 text-[15px] text-native-textMuted">Žádní pěstouni.</p>}
        <div className="flex flex-col">
          {fosters.map((p) => (
            <div key={p.id} className="flex items-start justify-between gap-3 border-t border-native-separator py-2.5 first:border-t-0">
              <div className="min-w-0">
                <p className="text-[15px] font-medium text-native-text">{p.name}</p>
                <p className="text-[13px] text-native-textMuted">{[p.rc && `RČ ${p.rc}`, p.phone, p.email].filter(Boolean).join(' · ')}</p>
              </div>
              <WeightChip weight={caregiverIds.includes(p.id) ? 'pecujici' : 'bez_prav'} />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-native-card bg-native-surface p-4">
        <div className="mb-1 flex items-center justify-between">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-native-textMuted">Příbuzní ({relatives.length})</p>
          {canManage && (
            <button type="button" onClick={onOpenRel} className="flex items-center gap-1 text-[14px] font-medium text-native-primary">
              <UserPlus size={15} strokeWidth={2} /> Přidat
            </button>
          )}
        </div>
        {relatives.length === 0 && <p className="py-2 text-[15px] text-native-textMuted">Žádní evidovaní příbuzní.</p>}
        <div className="flex flex-col">
          {relatives.map((rel, idx) => {
            const relType = REL_TYPES.find((r) => r.key === rel.rel);
            return (
              <div key={rel.id ?? idx} className="flex items-start justify-between gap-3 border-t border-native-separator py-2.5 first:border-t-0">
                <div className="min-w-0">
                  <p className="text-[15px] font-medium text-native-text">{rel.name}</p>
                  <p className="text-[13px] text-native-textMuted">
                    {[relType?.label ?? rel.rel, rel.rc && `RČ ${rel.rc}`, rel.phone, rel.email, rel.note].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <WeightChip weight={relType?.legalWeight} />
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-native-card bg-native-surface p-4">
        <div className="mb-1 flex items-center justify-between">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-native-textMuted">Předchozí pěstounské rodiny ({previousFosters.length})</p>
          {canManage && (
            <button type="button" onClick={onOpenFosterHist} className="flex items-center gap-1 text-[14px] font-medium text-native-primary">
              <Plus size={14} strokeWidth={2} /> Přidat
            </button>
          )}
        </div>
        {previousFosters.length === 0 && <p className="py-2 text-[15px] text-native-textMuted">Žádné předchozí umístění v evidenci.</p>}
        <div className="flex flex-col">
          {previousFosters.map((pf) => (
            <div key={pf.id} className="border-t border-native-separator py-2.5 first:border-t-0">
              <p className="text-[15px] font-medium text-native-text">{pf.name}</p>
              <p className="text-[13px] text-native-textMuted">{[pf.from && `od ${pf.from}`, pf.to && `do ${pf.to}`, pf.note].filter(Boolean).join(' · ')}</p>
            </div>
          ))}
        </div>
        {hasMorePreviousFosters && (
          <NativeButton variant="secondary" className="mt-2 h-11" onClick={onLoadMorePreviousFosters}>Načíst další</NativeButton>
        )}
      </div>

      {relDialogOpen && (
        <NativeSheet
          title="Přidat příbuzného"
          onClose={onCloseRel}
          submitting={submitting}
          footer={<NativeButton onClick={() => onAddRelative({ preventDefault: () => {} })} disabled={submitting || !relForm.name.trim() || !!relRc.error}>{submitting ? 'Ukládám…' : 'Přidat'}</NativeButton>}
        >
          {submitError && <p className="text-[14px] text-native-danger">{submitError}</p>}
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
            <NativeFormRow label="Poznámka" isLast>
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
          {submitError && <p className="text-[14px] text-native-danger">{submitError}</p>}
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
            <NativeFormRow label="Poznámka" isLast>
              <RowTextarea rows={2} value={fosterHistForm.note} onChange={(e) => setFosterHistForm((f) => ({ ...f, note: e.target.value }))} />
            </NativeFormRow>
          </NativeFormGroup>
        </NativeSheet>
      )}
    </div>
  );
}
