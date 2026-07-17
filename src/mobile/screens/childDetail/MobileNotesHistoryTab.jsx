/**
 * MobileNotesHistoryTab.jsx — "Poznámky" a "Historie" v mobilním Detailu
 * dítěte (STRICT UI/UX DESIGN MANDATE, 2026-07-05 dodatek). Trvalé poznámky
 * (append-only, nic se nepřepisuje) a historie změn — obě čtecí/append-only,
 * proto v jednom souboru jako desktop ChildNotesHistoryTab.jsx (bez sdílení JSX).
 * v4 (2026-07-06, Lidl vzor): časová struktura zůstává, typografie srovnána —
 * primární text zápisu 15px, meta řádek (čas/autor) 13px muted.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import NativeButton from '../../ui/NativeButton.jsx';
import { ComposerTextarea } from '../../ui/NativeFormRow.jsx';

export function MobileNotesTab({ notes, hasMoreNotes, onLoadMoreNotes, noteText, setNoteText, onAddNote, submitting, submitError, canManage }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-3 px-4 pb-6 pt-3">
      <div className="rounded-native-card bg-native-surface p-4">
        <p className="text-[12px] font-semibold uppercase tracking-wide text-native-textMuted">{t('m.notes.title', 'Trvalé poznámky')}</p>
        <p className="mt-0.5 text-[13px] text-native-textMuted">{t('m.notes.description', 'Zápisy zůstávají navždy v evidenci beze změny nebo smazání — důkazní hodnota pro OSPOD/soud.')}</p>

        {canManage && (
          <div className="mt-3 flex flex-col gap-2">
            <ComposerTextarea rows={2} placeholder={t('m.notes.newPlaceholder', 'Nová poznámka…')} value={noteText} onChange={(e) => setNoteText(e.target.value)} />
            <NativeButton className="h-11" onClick={onAddNote} disabled={submitting || !noteText.trim()}>
              {submitting ? t('m.notes.saving', 'Zapisuji…') : t('m.notes.save', 'Zapsat')}
            </NativeButton>
          </div>
        )}
        {submitError && <p className="mt-2 text-[13px] text-native-danger">{submitError}</p>}

        {notes.length === 0 && <p className="mt-3 text-[15px] text-native-textMuted">{t('m.notes.empty', 'Žádné poznámky.')}</p>}
        <div className="mt-1 flex flex-col">
          {notes.map((n) => (
            <div key={n.id} className="border-t border-native-separator py-2.5 first:border-t-0">
              <p className="text-[15px] text-native-text">{n.text}</p>
              <p className="text-[13px] text-native-textMuted">{n.createdAt ? n.createdAt.toDate().toLocaleString('cs-CZ') : ''}</p>
            </div>
          ))}
        </div>
        {hasMoreNotes && <NativeButton variant="secondary" className="mt-2 h-11" onClick={onLoadMoreNotes}>{t('m.notes.loadMore', 'Načíst další')}</NativeButton>}
      </div>
    </div>
  );
}

export function MobileHistoryTab({ history, hasMore, onLoadMore }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-3 px-4 pb-6 pt-3">
      <div className="rounded-native-card bg-native-surface p-4">
        <p className="text-[12px] font-semibold uppercase tracking-wide text-native-textMuted">{t('m.notes.historyTitle', 'Historie změn')}</p>
        <p className="mt-0.5 text-[13px] text-native-textMuted">{t('m.notes.historyDescription', 'Automatický záznam změn sledovaných polí — nic se nepřepisuje.')}</p>

        {history.length === 0 && <p className="mt-3 text-[15px] text-native-textMuted">{t('m.notes.historyEmpty', 'Žádné změny.')}</p>}
        <div className="mt-1 flex flex-col">
          {history.map((h) => (
            <div key={h.id} className="border-t border-native-separator py-2.5 first:border-t-0">
              <p className="text-[15px] text-native-text">{h.field}: {h.from} → {h.to}</p>
              <p className="text-[13px] text-native-textMuted">{h.by}</p>
            </div>
          ))}
        </div>
        {hasMore && <NativeButton variant="secondary" className="mt-2 h-11" onClick={onLoadMore}>{t('m.notes.loadMore', 'Načíst další')}</NativeButton>}
      </div>
    </div>
  );
}
