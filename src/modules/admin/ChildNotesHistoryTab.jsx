/**
 * ChildNotesHistoryTab.jsx — taby "Poznámky" a "Historie" karty dítěte.
 * Obě jsou malé, čistě čtecí/append-only sekce, proto sdílí jeden soubor
 * (port App.histAdd/histList z vanilla prototypu — "nic se nepřepisuje").
 * Vytaženo z ChildDetailPage.jsx při přechodu na Tailwind (2026-07-02).
 */

import React from 'react';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import { fieldClass } from './childDetailShared.js';

export function ChildNotesTab({ child, noteText, setNoteText, onAddNote, submitting, submitError }) {
  const notes = [...(child.permanentNotes ?? [])].reverse();

  return (
    <Card>
      <h2 className="mb-1 text-base font-semibold text-stone-800">Trvalé poznámky</h2>
      <p className="mb-3 text-sm text-stone-500">
        Zápisy zůstávají navždy v evidenci beze změny nebo smazání — důkazní hodnota pro OSPOD/soud.
      </p>

      <div className="mb-3 flex gap-2.5">
        <textarea
          className={fieldClass}
          rows={2}
          placeholder="Nová poznámka…"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          disabled={submitting}
        />
        <Button variant="primary" onClick={onAddNote} disabled={submitting} className="self-end">
          Zapsat
        </Button>
      </div>

      {submitError && <div className="mb-3 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{submitError}</div>}

      {notes.length === 0 && <p className="text-sm text-stone-500">Žádné poznámky.</p>}
      <ul>
        {notes.map((n, i) => (
          <li key={i} className="border-t border-stone-100 py-2.5 first:border-t-0">
            <p className="text-sm text-stone-800">{n.text}</p>
            <p className="text-xs text-stone-400">{n.at ? new Date(n.at).toLocaleString('cs-CZ') : ''}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function ChildHistoryTab({ history }) {
  return (
    <Card>
      <h2 className="mb-1 text-base font-semibold text-stone-800">Historie změn</h2>
      <p className="mb-3 text-sm text-stone-500">
        „Nic se nepřepisuje&quot; — každá změna adresy, školy, OSPOD nebo soudního spisu zůstává dohledatelná.
      </p>

      {history.length === 0 && <p className="text-sm text-stone-500">Zatím žádné zaznamenané změny.</p>}
      <ul>
        {history.map((h) => (
          <li key={h.id} className="border-t border-stone-100 py-2.5 first:border-t-0">
            <p className="text-sm text-stone-800">{h.field}: {h.from} → {h.to}</p>
            <p className="text-xs text-stone-400">{h.by}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
