/**
 * FosterCourseFormModal.jsx — dialog "Zapsat vzdělávání" vytažený z
 * FosterFamilyDetailPage.jsx, aby hlavní soubor zůstal pod 300 řádky (viz
 * CLAUDE.md). Čistě prezentační, veškerou logiku drží rodič.
 */

import React from 'react';
import { X } from 'lucide-react';

import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';

const fieldClass =
  'w-full rounded-xl bg-surface-muted px-3.5 py-2.5 text-sm text-ink-800 placeholder:text-ink-400 ' +
  'focus:outline-none focus:ring-2 focus:ring-brand-600 disabled:opacity-50';
const labelClass = 'mb-1.5 block text-sm font-medium text-ink-700';

export default function FosterCourseFormModal({ form, onChange, submitting, submitError, onClose, onSubmit }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={() => !submitting && onClose()}
    >
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink-800">Zapsat vzdělávání</h2>
          <button
            type="button"
            onClick={() => !submitting && onClose()}
            aria-label="Zavřít"
            className="rounded-lg p-1.5 text-ink-500 hover:bg-surface-muted"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {submitError && (
            <div className="rounded-xl bg-danger-50 px-3.5 py-2.5 text-sm text-danger-700">{submitError}</div>
          )}

          <div>
            <label className={labelClass}>Kód / název kurzu</label>
            <input
              className={fieldClass}
              value={form.kod}
              onChange={(e) => onChange('kod', e.target.value)}
              required
              disabled={submitting}
              autoFocus
            />
          </div>

          <div>
            <label className={labelClass}>Kde</label>
            <input
              className={fieldClass}
              value={form.kde}
              onChange={(e) => onChange('kde', e.target.value)}
              disabled={submitting}
            />
          </div>

          <div>
            <label className={labelClass}>Kdy</label>
            <input
              type="date"
              className={fieldClass}
              value={form.kdy}
              onChange={(e) => onChange('kdy', e.target.value)}
              disabled={submitting}
            />
          </div>

          <div>
            <label className={labelClass}>Forma</label>
            <input
              className={fieldClass}
              placeholder="prezenčně / online / kombinovaně"
              value={form.forma}
              onChange={(e) => onChange('forma', e.target.value)}
              disabled={submitting}
            />
          </div>

          <div>
            <label className={labelClass}>Pořadatel</label>
            <input
              className={fieldClass}
              value={form.poradatel}
              onChange={(e) => onChange('poradatel', e.target.value)}
              disabled={submitting}
            />
          </div>

          <div>
            <label className={labelClass}>Hodiny</label>
            <input
              type="number"
              className={fieldClass}
              value={form.hodiny}
              onChange={(e) => onChange('hodiny', e.target.value)}
              disabled={submitting}
            />
          </div>

          <label className="flex items-center gap-2.5 text-sm text-ink-700">
            <input
              type="checkbox"
              checked={form.certifikat}
              onChange={(e) => onChange('certifikat', e.target.checked)}
              disabled={submitting}
              className="h-4 w-4 rounded border-border-strong text-brand-600 focus:ring-2 focus:ring-brand-600"
            />
            Certifikát vydán
          </label>

          <div className="mt-1 flex justify-end gap-2.5">
            <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
              Zrušit
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              Zapsat
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
