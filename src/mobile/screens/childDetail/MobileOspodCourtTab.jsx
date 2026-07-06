/**
 * MobileOspodCourtTab.jsx — "OSPOD a soud" v mobilním Detailu dítěte.
 *
 * v4 (2026-07-06, Lidl vzor — závazná zpětná vazba): údaje NEJSOU nahusto
 * v jednom řádku („název — osoba" zakázáno) — karty jsou tabulky název
 * vlevo / hodnota vpravo (NativeInfoRow). Rozsudky zůstávají jako seznam
 * (rostoucí záznamy, ne atributy entity).
 */

import React from 'react';
import { Plus } from 'lucide-react';
import NativeSheet from '../../ui/NativeSheet.jsx';
import NativeButton from '../../ui/NativeButton.jsx';
import { NativeFormGroup, NativeFormRow, NativeInfoRow, RowInput, RowTextarea } from '../../ui/NativeFormRow.jsx';

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
      <div className="rounded-native-card bg-native-surface px-4">
        <div className="flex items-center justify-between border-b border-native-separator py-3">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-native-textMuted">OSPOD</p>
          {canManage && (
            <button type="button" onClick={onOpenOspod} className="text-[15px] font-medium text-native-primary">
              {child.ospod ? 'Upravit' : 'Přidat'}
            </button>
          )}
        </div>
        {child.ospod ? (
          <>
            <NativeInfoRow label="Název" value={child.ospod.nazev} />
            <NativeInfoRow label="Kontaktní osoba" value={child.ospod.osoba} isLast />
          </>
        ) : (
          <p className="py-3.5 text-[15px] text-native-textMuted">Zatím nevyplněno.</p>
        )}
      </div>

      <div className="rounded-native-card bg-native-surface px-4">
        <div className="flex items-center justify-between border-b border-native-separator py-3">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-native-textMuted">Soud</p>
          {canManage && (
            <button type="button" onClick={onOpenCourt} className="text-[15px] font-medium text-native-primary">
              {child.courtCase ? 'Upravit' : 'Přidat'}
            </button>
          )}
        </div>
        {child.courtCase ? (
          <>
            <NativeInfoRow label="Spisová značka" value={child.courtCase.spisZnacka} />
            <NativeInfoRow label="Soud" value={child.courtCase.soudNazev} />
            <NativeInfoRow label="Adresa" value={child.courtCase.soudAdresa} />
            <NativeInfoRow label="Kontaktní osoba" value={child.courtCase.kontaktniOsoba} />
          </>
        ) : (
          <p className="border-b border-native-separator py-3.5 text-[15px] text-native-textMuted">Zatím nevyplněno.</p>
        )}

        <div className="flex items-center justify-between py-3">
          <p className="text-[13px] font-semibold text-native-text">Rozsudky</p>
          {canManage && (
            <button type="button" onClick={onOpenVerdict} className="flex items-center gap-1 text-[15px] font-medium text-native-primary">
              <Plus size={14} strokeWidth={2} /> Přidat
            </button>
          )}
        </div>
        {rozsudky.length === 0 && <p className="pb-3.5 text-[13px] text-native-textMuted">Žádné záznamy.</p>}
        {rozsudky.map((v) => (
          <div key={v.id} className="border-t border-native-separator py-3">
            <p className="text-[15px] text-native-text">{v.popis}</p>
            <p className="mt-0.5 text-[12px] text-native-textMuted">{v.datum}</p>
          </div>
        ))}
        {hasMoreVerdicts && (
          <NativeButton variant="secondary" className="mb-3.5 mt-1 h-11" onClick={onLoadMoreVerdicts}>Načíst další</NativeButton>
        )}
      </div>

      {ospodDialogOpen && (
        <NativeSheet
          title="OSPOD"
          onClose={onCloseOspod}
          submitting={submitting}
          footer={<NativeButton onClick={() => onSaveOspod({ preventDefault: () => {} })} disabled={submitting || !ospodForm.nazev.trim()}>{submitting ? 'Ukládám…' : 'Uložit'}</NativeButton>}
        >
          {submitError && <p className="text-[13px] text-native-danger">{submitError}</p>}
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
          {submitError && <p className="text-[13px] text-native-danger">{submitError}</p>}
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
          {submitError && <p className="text-[13px] text-native-danger">{submitError}</p>}
          <NativeFormGroup>
            <NativeFormRow label="Datum">
              <RowInput type="date" value={verdictForm.datum} onChange={(e) => setVerdictForm((f) => ({ ...f, datum: e.target.value }))} />
            </NativeFormRow>
            <NativeFormRow label="Popis" isLast stacked>
              <RowTextarea rows={3} value={verdictForm.popis} onChange={(e) => setVerdictForm((f) => ({ ...f, popis: e.target.value }))} autoFocus />
            </NativeFormRow>
          </NativeFormGroup>
        </NativeSheet>
      )}
    </div>
  );
}
