/**
 * MobileOspodCourtTab.jsx — "OSPOD a soud" v mobilním Detailu dítěte (STRICT
 * UI/UX DESIGN MANDATE, 2026-07-05 dodatek). Native karty + NativeSheet.
 */

import React from 'react';
import { Plus } from 'lucide-react';
import NativeSheet from '../../ui/NativeSheet.jsx';
import NativeButton from '../../ui/NativeButton.jsx';
import { NativeFormGroup, NativeFormRow, RowInput, RowTextarea } from '../../ui/NativeFormRow.jsx';

export default function MobileOspodCourtTab({
  child, courtVerdicts, hasMoreVerdicts, onLoadMoreVerdicts,
  ospodDialogOpen, ospodForm, setOspodForm, onOpenOspod, onCloseOspod, onSaveOspod,
  courtDialogOpen, courtForm, setCourtForm, onOpenCourt, onCloseCourt, onSaveCourt,
  verdictDialogOpen, verdictForm, setVerdictForm, onOpenVerdict, onCloseVerdict, onAddVerdict,
  submitting, submitError, canManage,
}) {
  const rozsudky = courtVerdicts ?? [];

  return (
    <div className="flex flex-col gap-3 px-4 pb-6 pt-3">
      <div className="rounded-native-card bg-native-surface p-4">
        <div className="mb-1 flex items-center justify-between">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-native-textMuted">OSPOD</p>
          {canManage && (
            <button type="button" onClick={onOpenOspod} className="text-[14px] font-medium text-native-primary">
              {child.ospod ? 'Upravit' : 'Přidat'}
            </button>
          )}
        </div>
        {child.ospod ? (
          <p className="text-[15px] text-native-text">{child.ospod.nazev} — {child.ospod.osoba || '—'}</p>
        ) : (
          <p className="text-[15px] text-native-textMuted">Zatím nevyplněno.</p>
        )}
      </div>

      <div className="rounded-native-card bg-native-surface p-4">
        <div className="mb-1 flex items-center justify-between">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-native-textMuted">Soud</p>
          {canManage && (
            <button type="button" onClick={onOpenCourt} className="text-[14px] font-medium text-native-primary">
              {child.courtCase ? 'Upravit' : 'Přidat'}
            </button>
          )}
        </div>
        {child.courtCase ? (
          <div className="mb-3 flex flex-col gap-0.5">
            <p className="text-[15px] text-native-text">Sp. značka: <span className="font-semibold">{child.courtCase.spisZnacka || '—'}</span></p>
            <p className="text-[15px] text-native-text">{child.courtCase.soudNazev}</p>
            <p className="text-[14px] text-native-textMuted">{child.courtCase.soudAdresa}</p>
            <p className="text-[15px] text-native-text">Kontaktní osoba: {child.courtCase.kontaktniOsoba || '—'}</p>
          </div>
        ) : (
          <p className="mb-3 text-[15px] text-native-textMuted">Zatím nevyplněno.</p>
        )}

        <div className="mb-1 flex items-center justify-between border-t border-native-separator pt-3">
          <p className="text-[13px] font-semibold text-native-text">Rozsudky</p>
          {canManage && (
            <button type="button" onClick={onOpenVerdict} className="flex items-center gap-1 text-[14px] font-medium text-native-primary">
              <Plus size={14} strokeWidth={2} /> Přidat
            </button>
          )}
        </div>
        {rozsudky.length === 0 && <p className="py-1 text-[14px] text-native-textMuted">Žádné záznamy.</p>}
        <div className="flex flex-col gap-2">
          {rozsudky.map((v) => (
            <div key={v.id} className="border-t border-native-separator pt-2 first:border-t-0 first:pt-0">
              <p className="text-[14px] text-native-text">{v.popis}</p>
              <p className="text-[12px] text-native-textMuted">{v.datum}</p>
            </div>
          ))}
        </div>
        {hasMoreVerdicts && (
          <NativeButton variant="secondary" className="mt-2 h-11" onClick={onLoadMoreVerdicts}>Načíst další</NativeButton>
        )}
      </div>

      {ospodDialogOpen && (
        <NativeSheet
          title="OSPOD"
          onClose={onCloseOspod}
          submitting={submitting}
          footer={<NativeButton onClick={() => onSaveOspod({ preventDefault: () => {} })} disabled={submitting || !ospodForm.nazev.trim()}>{submitting ? 'Ukládám…' : 'Uložit'}</NativeButton>}
        >
          {submitError && <p className="text-[14px] text-native-danger">{submitError}</p>}
          <NativeFormGroup>
            <NativeFormRow label="Název OSPOD">
              <RowInput value={ospodForm.nazev} onChange={(e) => setOspodForm((f) => ({ ...f, nazev: e.target.value }))} autoFocus />
            </NativeFormRow>
            <NativeFormRow label="Kontaktní osoba" isLast>
              <RowInput value={ospodForm.osoba} onChange={(e) => setOspodForm((f) => ({ ...f, osoba: e.target.value }))} />
            </NativeFormRow>
          </NativeFormGroup>
        </NativeSheet>
      )}

      {courtDialogOpen && (
        <NativeSheet
          title="Soud"
          onClose={onCloseCourt}
          submitting={submitting}
          footer={<NativeButton onClick={() => onSaveCourt({ preventDefault: () => {} })} disabled={submitting}>{submitting ? 'Ukládám…' : 'Uložit'}</NativeButton>}
        >
          {submitError && <p className="text-[14px] text-native-danger">{submitError}</p>}
          <NativeFormGroup>
            <NativeFormRow label="Spisová značka">
              <RowInput value={courtForm.spisZnacka} onChange={(e) => setCourtForm((f) => ({ ...f, spisZnacka: e.target.value }))} autoFocus />
            </NativeFormRow>
            <NativeFormRow label="Název soudu">
              <RowInput value={courtForm.soudNazev} onChange={(e) => setCourtForm((f) => ({ ...f, soudNazev: e.target.value }))} />
            </NativeFormRow>
            <NativeFormRow label="Adresa soudu">
              <RowInput value={courtForm.soudAdresa} onChange={(e) => setCourtForm((f) => ({ ...f, soudAdresa: e.target.value }))} />
            </NativeFormRow>
            <NativeFormRow label="Kontaktní osoba" isLast>
              <RowInput value={courtForm.kontaktniOsoba} onChange={(e) => setCourtForm((f) => ({ ...f, kontaktniOsoba: e.target.value }))} />
            </NativeFormRow>
          </NativeFormGroup>
        </NativeSheet>
      )}

      {verdictDialogOpen && (
        <NativeSheet
          title="Přidat rozsudek"
          onClose={onCloseVerdict}
          submitting={submitting}
          footer={<NativeButton onClick={() => onAddVerdict({ preventDefault: () => {} })} disabled={submitting || !verdictForm.popis.trim()}>{submitting ? 'Ukládám…' : 'Přidat'}</NativeButton>}
        >
          {submitError && <p className="text-[14px] text-native-danger">{submitError}</p>}
          <NativeFormGroup>
            <NativeFormRow label="Datum">
              <RowInput type="date" value={verdictForm.datum} onChange={(e) => setVerdictForm((f) => ({ ...f, datum: e.target.value }))} />
            </NativeFormRow>
            <NativeFormRow label="Popis" isLast>
              <RowTextarea rows={3} value={verdictForm.popis} onChange={(e) => setVerdictForm((f) => ({ ...f, popis: e.target.value }))} autoFocus />
            </NativeFormRow>
          </NativeFormGroup>
        </NativeSheet>
      )}
    </div>
  );
}
