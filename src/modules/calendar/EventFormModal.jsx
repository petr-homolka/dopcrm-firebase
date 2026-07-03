/**
 * EventFormModal.jsx — dialog "Nová událost" pro CalendarPage.jsx, vytažen
 * do vlastního souboru, aby hlavní stránka zůstala pod 300 řádky (CLAUDE.md).
 * Čistě prezentační, veškerou logiku/stav drží rodič.
 */

import React, { useState } from 'react';
import { X } from 'lucide-react';

import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import { EVENT_TYPES } from '../../shared/domainConstants.js';

const fieldClass =
  'w-full rounded-xl bg-stone-100 px-3.5 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 ' +
  'focus:outline-none focus:ring-2 focus:ring-primary-600 disabled:opacity-50';
const labelClass = 'mb-1.5 block text-sm font-medium text-stone-700';

const emptyForm = {
  title: '', type: 'visit', date: '', time: '09:00', allDay: false,
  location: '', note: '', fosterFamilyId: '',
};

export default function EventFormModal({ families, submitting, submitError, onClose, onSubmit }) {
  const [form, setForm] = useState(emptyForm);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={() => !submitting && onClose()}
    >
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-stone-800">Nová událost</h2>
          <button
            type="button"
            onClick={() => !submitting && onClose()}
            aria-label="Zavřít"
            className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="flex flex-col gap-4">
          {submitError && (
            <div className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{submitError}</div>
          )}

          <div>
            <label className={labelClass}>Název</label>
            <input
              className={fieldClass}
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              required
              disabled={submitting}
              autoFocus
            />
          </div>

          <div>
            <label className={labelClass}>Typ</label>
            <select
              className={fieldClass}
              value={form.type}
              onChange={(e) => update('type', e.target.value)}
              disabled={submitting}
            >
              {Object.entries(EVENT_TYPES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Datum</label>
              <input
                type="date"
                className={fieldClass}
                value={form.date}
                onChange={(e) => update('date', e.target.value)}
                required
                disabled={submitting}
              />
            </div>
            <div>
              <label className={labelClass}>Čas</label>
              <input
                type="time"
                className={fieldClass}
                value={form.time}
                onChange={(e) => update('time', e.target.value)}
                disabled={submitting || form.allDay}
              />
            </div>
          </div>

          <label className="flex items-center gap-2.5 text-sm text-stone-700">
            <input
              type="checkbox"
              checked={form.allDay}
              onChange={(e) => update('allDay', e.target.checked)}
              disabled={submitting}
              className="h-4 w-4 rounded border-stone-300 text-primary-600 focus:ring-2 focus:ring-primary-600"
            />
            Celodenní událost
          </label>

          <div>
            <label className={labelClass}>Rodina (volitelné)</label>
            <select
              className={fieldClass}
              value={form.fosterFamilyId}
              onChange={(e) => update('fosterFamilyId', e.target.value)}
              disabled={submitting}
            >
              <option value="">— bez vazby na rodinu —</option>
              {families.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Místo</label>
            <input
              className={fieldClass}
              value={form.location}
              onChange={(e) => update('location', e.target.value)}
              disabled={submitting}
            />
          </div>

          <div>
            <label className={labelClass}>Poznámka</label>
            <textarea
              className={fieldClass}
              rows={2}
              value={form.note}
              onChange={(e) => update('note', e.target.value)}
              disabled={submitting}
            />
          </div>

          <div className="mt-1 flex justify-end gap-2.5">
            <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
              Zrušit
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              Založit
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
