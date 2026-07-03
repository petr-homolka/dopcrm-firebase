/**
 * ChildNotesHistoryTab.jsx — taby "Poznámky" a "Historie" karty dítěte.
 * Obě jsou malé, čistě čtecí/append-only sekce, proto sdílí jeden soubor
 * (port App.histAdd/histList z vanilla prototypu — "nic se nepřepisuje").
 * Vytaženo z ChildDetailPage.jsx při přechodu na Tailwind (2026-07-02).
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import LoadMoreButton from '../../components/ui/LoadMoreButton.jsx';
import { fieldClass } from './childDetailShared.js';

export function ChildNotesTab({ notes, hasMoreNotes, onLoadMoreNotes, noteText, setNoteText, onAddNote, submitting, submitError, canManage = true }) {
  const { t } = useTranslation();
  return (
    <Card>
      <h2 className="mb-1 text-base font-semibold text-stone-800">{t('child.detail.notesHistory.notesTitle')}</h2>
      <p className="mb-3 text-sm text-stone-500">
        {t('child.detail.notesHistory.notesDescription')}
      </p>

      {canManage && (
        <div className="mb-3 flex gap-2.5">
          <textarea
            className={fieldClass}
            rows={2}
            placeholder={t('child.detail.notesHistory.notePlaceholder')}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            disabled={submitting}
          />
          <Button variant="primary" onClick={onAddNote} disabled={submitting} className="self-end">
            {t('child.detail.notesHistory.submitNote')}
          </Button>
        </div>
      )}

      {submitError && <div className="mb-3 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{submitError}</div>}

      {notes.length === 0 && <p className="text-sm text-stone-500">{t('child.detail.notesHistory.noNotes')}</p>}
      <ul>
        {notes.map((n) => (
          <li key={n.id} className="border-t border-stone-100 py-2.5 first:border-t-0">
            <p className="text-sm text-stone-800">{n.text}</p>
            <p className="text-xs text-stone-400">{n.createdAt ? n.createdAt.toDate().toLocaleString('cs-CZ') : ''}</p>
          </li>
        ))}
      </ul>
      {hasMoreNotes && <LoadMoreButton onClick={onLoadMoreNotes} />}
    </Card>
  );
}

export function ChildHistoryTab({ history, hasMore, onLoadMore }) {
  const { t } = useTranslation();
  return (
    <Card>
      <h2 className="mb-1 text-base font-semibold text-stone-800">{t('child.detail.notesHistory.historyTitle')}</h2>
      <p className="mb-3 text-sm text-stone-500">
        {t('child.detail.notesHistory.historyDescription')}
      </p>

      {history.length === 0 && <p className="text-sm text-stone-500">{t('child.detail.notesHistory.noHistory')}</p>}
      <ul>
        {history.map((h) => (
          <li key={h.id} className="border-t border-stone-100 py-2.5 first:border-t-0">
            <p className="text-sm text-stone-800">{h.field}: {h.from} → {h.to}</p>
            <p className="text-xs text-stone-400">{h.by}</p>
          </li>
        ))}
      </ul>
      {hasMore && <LoadMoreButton onClick={onLoadMore} />}
    </Card>
  );
}
