/**
 * MobileRespitTab.jsx — záložka "Respit a SPVPP" v mobilním Detailu rodiny
 * (STRICT UI/UX DESIGN MANDATE, 2026-07-05/06). Native stat karty + seznam
 * čerpání + SPVPP peněženky dětí. Žádná sdílená JSX s desktop verzí.
 */

import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { respitTypeLabel, respitEventDays } from '../../../shared/domainConstants.js';
import { cn } from '../../../components/ui/cn.js';
import NativeSheet from '../../ui/NativeSheet.jsx';
import NativeButton from '../../ui/NativeButton.jsx';
import { NativeFormGroup, NativeFormRow, RowInput } from '../../ui/NativeFormRow.jsx';
import { StatTile } from '../../ui/NativeBits.jsx';

export default function MobileRespitTab({
  vykazano, limit, realny, eligible, odmenaStatus, childrenList, respitEvents,
  onAddRespit, canManage, respitForm, setRespitForm, submitting, submitError,
}) {
  const [sheetOpen, setSheetOpen] = useState(false);

  function handleAdd() {
    onAddRespit();
    setSheetOpen(false);
  }

  return (
    <div className="flex flex-col gap-3 px-4 pb-6 pt-3">
      <div className="flex gap-2.5">
        <StatTile label="Vykázáno" value={`${vykazano}/${limit}`} sub="dní" tone={vykazano > limit ? 'danger' : 'primary'} />
        <StatTile label="Reálně" value={realny} sub="dětodní" tone={realny < vykazano ? 'warning' : 'text'} />
      </div>
      <div className="rounded-native-card bg-native-surface p-3.5">
        <p className="text-[12px] font-semibold uppercase tracking-wide text-native-textMuted">Odměna</p>
        <p className={cn('mt-1 text-[16px] font-semibold', eligible ? 'text-native-primary' : 'text-native-textMuted')}>
          {eligible ? 'Nárok vzniká' : 'Bez nároku'}
        </p>
        <p className="text-[13px] text-native-textMuted">{odmenaStatus}</p>
      </div>

      {canManage && (
        <NativeButton variant="secondary" className="h-12" onClick={() => setSheetOpen(true)}>
          <Sparkles size={16} strokeWidth={1.75} /> Zapsat čerpání
        </NativeButton>
      )}

      <div className="flex flex-col gap-2">
        {respitEvents.length === 0 && <p className="py-4 text-center text-[15px] text-native-textMuted">Zatím žádné čerpání respitu.</p>}
        {respitEvents.map((ev) => (
          <div key={ev.id} className="rounded-native-card bg-native-surface px-4 py-3">
            <p className="text-[15px] font-medium text-native-text">
              {respitTypeLabel(ev.typ)} — {respitEventDays(ev)} dní
            </p>
            <p className="text-[13px] text-native-textMuted">
              {[ev.from === ev.to ? ev.from : `${ev.from} – ${ev.to}`, ev.kc ? `${ev.kc} Kč` : null].filter(Boolean).join(' · ')}
            </p>
          </div>
        ))}
      </div>

      {childrenList.length > 0 && (
        <>
          <p className="mt-2 text-[13px] font-semibold uppercase tracking-wide text-native-textMuted">SPVPP peněženky</p>
          {childrenList.map((child) => {
            const wallet = child.spvpp ?? { rozpocet: 48000, vycerpano: 0 };
            const zustatek = wallet.rozpocet - wallet.vycerpano;
            return (
              <div key={child.id} className="rounded-native-card bg-native-surface px-4 py-3">
                <p className="text-[15px] font-medium text-native-text">{child.firstName} {child.lastName}</p>
                <p className="text-[13px] text-native-textMuted">
                  Čerpáno {wallet.vycerpano.toLocaleString('cs-CZ')} / {wallet.rozpocet.toLocaleString('cs-CZ')} Kč
                </p>
                <p className={cn('text-[13px] font-semibold', zustatek < 0 ? 'text-native-danger' : 'text-native-primary')}>
                  Zůstatek {zustatek.toLocaleString('cs-CZ')} Kč
                </p>
              </div>
            );
          })}
        </>
      )}

      {sheetOpen && (
        <NativeSheet
          title="Zapsat čerpání respitu"
          onClose={() => setSheetOpen(false)}
          submitting={submitting}
          footer={<NativeButton onClick={handleAdd} disabled={submitting || !respitForm.from}>{submitting ? 'Ukládám…' : 'Uložit'}</NativeButton>}
        >
          {submitError && <p className="text-[14px] text-native-danger">{submitError}</p>}
          <NativeFormGroup>
            <NativeFormRow label="Od">
              <RowInput type="date" value={respitForm.from} onChange={(e) => setRespitForm((f) => ({ ...f, from: e.target.value }))} />
            </NativeFormRow>
            <NativeFormRow label="Do">
              <RowInput type="date" value={respitForm.to} onChange={(e) => setRespitForm((f) => ({ ...f, to: e.target.value }))} />
            </NativeFormRow>
            <NativeFormRow label="Částka (Kč)" isLast>
              <RowInput type="number" value={respitForm.kc} onChange={(e) => setRespitForm((f) => ({ ...f, kc: e.target.value }))} />
            </NativeFormRow>
          </NativeFormGroup>
        </NativeSheet>
      )}
    </div>
  );
}
