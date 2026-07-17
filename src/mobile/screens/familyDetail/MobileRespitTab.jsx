/**
 * MobileRespitTab.jsx — záložka "Respit a SPVPP" v mobilním Detailu rodiny.
 *
 * v4 (2026-07-06, Lidl vzor — závazná zpětná vazba): StatTile dlaždice
 * zůstávají, zbytek už nejsou volné odstavce nahusto — odměna je řádek
 * NativeInfoRow, čerpání jedna karta se srovnanými řádky (název 15px
 * semibold, datum 13px muted, částka vpravo) a SPVPP peněženka dítěte je
 * karta se jménem 17px a tabulkou název vlevo / hodnota vpravo.
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { respitTypeLabel, respitEventDays } from '../../../shared/domainConstants.js';
import { cn } from '../../../components/ui/cn.js';
import NativeSheet from '../../ui/NativeSheet.jsx';
import NativeButton from '../../ui/NativeButton.jsx';
import { NativeFormGroup, NativeFormRow, NativeInfoRow, RowInput } from '../../ui/NativeFormRow.jsx';
import { StatTile, SectionLabel } from '../../ui/NativeBits.jsx';

export default function MobileRespitTab({
  vykazano, limit, realny, eligible, odmenaStatus, childrenList, respitEvents,
  onAddRespit, canManage, respitForm, setRespitForm, submitting, submitError,
}) {
  const { t } = useTranslation();
  const [sheetOpen, setSheetOpen] = useState(false);

  function handleAdd() {
    onAddRespit();
    setSheetOpen(false);
  }

  return (
    <div className="flex flex-col gap-3 px-4 pb-6 pt-3">
      <div className="flex gap-2.5">
        <StatTile label={t('m.respit.vykazano', 'Vykázáno')} value={`${vykazano}/${limit}`} sub={t('m.respit.dni', 'dní')} tone={vykazano > limit ? 'danger' : 'primary'} />
        <StatTile label={t('m.respit.realne', 'Reálně')} value={realny} sub={t('m.respit.detodni', 'dětodní')} tone={realny < vykazano ? 'warning' : 'text'} />
      </div>

      <div className="rounded-native-card bg-native-surface px-4">
        <NativeInfoRow
          label={t('m.respit.odmena', 'Odměna')}
          value={<span className={eligible ? 'text-native-primary' : 'text-native-textMuted'}>{odmenaStatus}</span>}
          isLast
        />
      </div>

      {canManage && (
        <NativeButton variant="secondary" className="h-12" onClick={() => setSheetOpen(true)}>
          <Sparkles size={16} strokeWidth={1.75} /> {t('m.respit.zapsatCerpani', 'Zapsat čerpání')}
        </NativeButton>
      )}

      <SectionLabel>{t('m.respit.cerpaniRespitu', 'Čerpání respitu')}</SectionLabel>
      {respitEvents.length === 0 && (
        <p className="py-2 text-center text-[15px] text-native-textMuted">{t('m.respit.zadneCerpani', 'Zatím žádné čerpání respitu.')}</p>
      )}
      {respitEvents.length > 0 && (
        <div className="rounded-native-card bg-native-surface px-4">
          {respitEvents.map((ev, i) => (
            <div
              key={ev.id}
              className={cn('flex items-center justify-between gap-4 py-3', i < respitEvents.length - 1 && 'border-b border-native-separator')}
            >
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold text-native-text">
                  {respitTypeLabel(ev.typ)} — {t('m.respit.pocetDni', '{{n}} dní', { n: respitEventDays(ev) })}
                </p>
                <p className="text-[13px] text-native-textMuted">{ev.from === ev.to ? ev.from : `${ev.from} – ${ev.to}`}</p>
              </div>
              {ev.kc ? <p className="shrink-0 text-[15px] font-medium tabular-nums text-native-text">{ev.kc} Kč</p> : null}
            </div>
          ))}
        </div>
      )}

      {childrenList.length > 0 && (
        <>
          <SectionLabel>{t('m.respit.spvppPenezenky', 'SPVPP peněženky')}</SectionLabel>
          {childrenList.map((child) => {
            const wallet = child.spvpp ?? { rozpocet: 48000, vycerpano: 0 };
            const zustatek = wallet.rozpocet - wallet.vycerpano;
            return (
              <div key={child.id} className="rounded-native-card bg-native-surface px-4">
                <div className="border-b border-native-separator py-3.5">
                  <p className="truncate text-[17px] font-semibold text-native-text">{child.firstName} {child.lastName}</p>
                </div>
                <NativeInfoRow
                  label={t('m.respit.cerpano', 'Čerpáno')}
                  value={`${wallet.vycerpano.toLocaleString('cs-CZ')} / ${wallet.rozpocet.toLocaleString('cs-CZ')} Kč`}
                />
                <NativeInfoRow
                  label={t('m.respit.zustatek', 'Zůstatek')}
                  value={
                    zustatek < 0
                      ? `${zustatek.toLocaleString('cs-CZ')} Kč`
                      : <span className="text-native-primary">{zustatek.toLocaleString('cs-CZ')} Kč</span>
                  }
                  tone={zustatek < 0 ? 'danger' : undefined}
                  isLast
                />
              </div>
            );
          })}
        </>
      )}

      {sheetOpen && (
        <NativeSheet
          title={t('m.respit.zapsatCerpaniRespitu', 'Zapsat čerpání respitu')}
          onClose={() => setSheetOpen(false)}
          submitting={submitting}
          footer={<NativeButton onClick={handleAdd} disabled={submitting || !respitForm.from}>{submitting ? t('m.respit.ukladam', 'Ukládám…') : t('m.respit.ulozit', 'Uložit')}</NativeButton>}
        >
          {submitError && <p className="text-[13px] text-native-danger">{submitError}</p>}
          <NativeFormGroup>
            <NativeFormRow label={t('m.respit.od', 'Od')}>
              <RowInput type="date" value={respitForm.from} onChange={(e) => setRespitForm((f) => ({ ...f, from: e.target.value }))} />
            </NativeFormRow>
            <NativeFormRow label={t('m.respit.do', 'Do')}>
              <RowInput type="date" value={respitForm.to} onChange={(e) => setRespitForm((f) => ({ ...f, to: e.target.value }))} />
            </NativeFormRow>
            <NativeFormRow label={t('m.respit.castkaKc', 'Částka (Kč)')} isLast>
              <RowInput type="number" value={respitForm.kc} onChange={(e) => setRespitForm((f) => ({ ...f, kc: e.target.value }))} />
            </NativeFormRow>
          </NativeFormGroup>
        </NativeSheet>
      )}
    </div>
  );
}
