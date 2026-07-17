/**
 * MobileOspodCourtTab.jsx — "OSPOD a soud" v mobilním Detailu dítěte.
 *
 * v4 (2026-07-06, Lidl vzor — závazná zpětná vazba): údaje NEJSOU nahusto
 * v jednom řádku („název — osoba" zakázáno) — karty jsou tabulky název
 * vlevo / hodnota vpravo (NativeInfoRow). Rozsudky zůstávají jako seznam
 * (rostoucí záznamy, ne atributy entity).
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const rozsudky = courtVerdicts ?? [];

  return (
    <div className="flex flex-col gap-3 px-4 pb-6 pt-3">
      <div className="rounded-native-card bg-native-surface px-4">
        <div className="flex items-center justify-between border-b border-native-separator py-3">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-native-textMuted">{t('m.ospod.ospodTitle', 'OSPOD')}</p>
          {canManage && (
            <button type="button" onClick={onOpenOspod} className="text-[15px] font-medium text-native-primary">
              {child.ospod ? t('m.ospod.edit', 'Upravit') : t('m.ospod.add', 'Přidat')}
            </button>
          )}
        </div>
        {child.ospod ? (
          <>
            <NativeInfoRow label={t('m.ospod.name', 'Název')} value={child.ospod.nazev} />
            <NativeInfoRow label={t('m.ospod.contactPerson', 'Kontaktní osoba')} value={child.ospod.osoba} isLast />
          </>
        ) : (
          <p className="py-3.5 text-[15px] text-native-textMuted">{t('m.ospod.empty', 'Zatím nevyplněno.')}</p>
        )}
      </div>

      <div className="rounded-native-card bg-native-surface px-4">
        <div className="flex items-center justify-between border-b border-native-separator py-3">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-native-textMuted">{t('m.ospod.courtTitle', 'Soud')}</p>
          {canManage && (
            <button type="button" onClick={onOpenCourt} className="text-[15px] font-medium text-native-primary">
              {child.courtCase ? t('m.ospod.edit', 'Upravit') : t('m.ospod.add', 'Přidat')}
            </button>
          )}
        </div>
        {child.courtCase ? (
          <>
            <NativeInfoRow label={t('m.ospod.fileNumber', 'Spisová značka')} value={child.courtCase.spisZnacka} />
            <NativeInfoRow label={t('m.ospod.courtTitle', 'Soud')} value={child.courtCase.soudNazev} />
            <NativeInfoRow label={t('m.ospod.address', 'Adresa')} value={child.courtCase.soudAdresa} />
            <NativeInfoRow label={t('m.ospod.contactPerson', 'Kontaktní osoba')} value={child.courtCase.kontaktniOsoba} />
          </>
        ) : (
          <p className="border-b border-native-separator py-3.5 text-[15px] text-native-textMuted">{t('m.ospod.empty', 'Zatím nevyplněno.')}</p>
        )}

        <div className="flex items-center justify-between py-3">
          <p className="text-[13px] font-semibold text-native-text">{t('m.ospod.verdicts', 'Rozsudky')}</p>
          {canManage && (
            <button type="button" onClick={onOpenVerdict} className="flex items-center gap-1 text-[15px] font-medium text-native-primary">
              <Plus size={14} strokeWidth={2} /> {t('m.ospod.add', 'Přidat')}
            </button>
          )}
        </div>
        {rozsudky.length === 0 && <p className="pb-3.5 text-[13px] text-native-textMuted">{t('m.ospod.noRecords', 'Žádné záznamy.')}</p>}
        {rozsudky.map((v) => (
          <div key={v.id} className="border-t border-native-separator py-3">
            <p className="text-[15px] text-native-text">{v.popis}</p>
            <p className="mt-0.5 text-[12px] text-native-textMuted">{v.datum}</p>
          </div>
        ))}
        {hasMoreVerdicts && (
          <NativeButton variant="secondary" className="mb-3.5 mt-1 h-11" onClick={onLoadMoreVerdicts}>{t('m.ospod.loadMore', 'Načíst další')}</NativeButton>
        )}
      </div>

      {ospodDialogOpen && (
        <NativeSheet
          title={t('m.ospod.ospodTitle', 'OSPOD')}
          onClose={onCloseOspod}
          submitting={submitting}
          footer={<NativeButton onClick={() => onSaveOspod({ preventDefault: () => {} })} disabled={submitting || !ospodForm.nazev.trim()}>{submitting ? t('m.ospod.saving', 'Ukládám…') : t('m.ospod.save', 'Uložit')}</NativeButton>}
        >
          {submitError && <p className="text-[13px] text-native-danger">{submitError}</p>}
          <NativeFormGroup>
            <NativeFormRow label={t('m.ospod.ospodName', 'Název OSPOD')}>
              <RowInput value={ospodForm.nazev} onChange={(e) => setOspodForm((f) => ({ ...f, nazev: e.target.value }))} autoFocus />
            </NativeFormRow>
            <NativeFormRow label={t('m.ospod.contactPerson', 'Kontaktní osoba')} isLast>
              <RowInput value={ospodForm.osoba} onChange={(e) => setOspodForm((f) => ({ ...f, osoba: e.target.value }))} />
            </NativeFormRow>
          </NativeFormGroup>
        </NativeSheet>
      )}

      {courtDialogOpen && (
        <NativeSheet
          title={t('m.ospod.courtTitle', 'Soud')}
          onClose={onCloseCourt}
          submitting={submitting}
          footer={<NativeButton onClick={() => onSaveCourt({ preventDefault: () => {} })} disabled={submitting}>{submitting ? t('m.ospod.saving', 'Ukládám…') : t('m.ospod.save', 'Uložit')}</NativeButton>}
        >
          {submitError && <p className="text-[13px] text-native-danger">{submitError}</p>}
          <NativeFormGroup>
            <NativeFormRow label={t('m.ospod.fileNumber', 'Spisová značka')}>
              <RowInput value={courtForm.spisZnacka} onChange={(e) => setCourtForm((f) => ({ ...f, spisZnacka: e.target.value }))} autoFocus />
            </NativeFormRow>
            <NativeFormRow label={t('m.ospod.courtName', 'Název soudu')}>
              <RowInput value={courtForm.soudNazev} onChange={(e) => setCourtForm((f) => ({ ...f, soudNazev: e.target.value }))} />
            </NativeFormRow>
            <NativeFormRow label={t('m.ospod.courtAddress', 'Adresa soudu')}>
              <RowInput value={courtForm.soudAdresa} onChange={(e) => setCourtForm((f) => ({ ...f, soudAdresa: e.target.value }))} />
            </NativeFormRow>
            <NativeFormRow label={t('m.ospod.contactPerson', 'Kontaktní osoba')} isLast>
              <RowInput value={courtForm.kontaktniOsoba} onChange={(e) => setCourtForm((f) => ({ ...f, kontaktniOsoba: e.target.value }))} />
            </NativeFormRow>
          </NativeFormGroup>
        </NativeSheet>
      )}

      {verdictDialogOpen && (
        <NativeSheet
          title={t('m.ospod.addVerdict', 'Přidat rozsudek')}
          onClose={onCloseVerdict}
          submitting={submitting}
          footer={<NativeButton onClick={() => onAddVerdict({ preventDefault: () => {} })} disabled={submitting || !verdictForm.popis.trim()}>{submitting ? t('m.ospod.saving', 'Ukládám…') : t('m.ospod.add', 'Přidat')}</NativeButton>}
        >
          {submitError && <p className="text-[13px] text-native-danger">{submitError}</p>}
          <NativeFormGroup>
            <NativeFormRow label={t('m.ospod.date', 'Datum')}>
              <RowInput type="date" value={verdictForm.datum} onChange={(e) => setVerdictForm((f) => ({ ...f, datum: e.target.value }))} />
            </NativeFormRow>
            <NativeFormRow label={t('m.ospod.description', 'Popis')} isLast stacked>
              <RowTextarea rows={3} value={verdictForm.popis} onChange={(e) => setVerdictForm((f) => ({ ...f, popis: e.target.value }))} autoFocus />
            </NativeFormRow>
          </NativeFormGroup>
        </NativeSheet>
      )}
    </div>
  );
}
