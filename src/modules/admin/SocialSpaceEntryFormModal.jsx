/**
 * SocialSpaceEntryFormModal.jsx — dialog pro partnera / biologické dítě /
 * rodiče pěstouna, vytažený z FosterFamilyDetailPage.jsx, aby hlavní soubor
 * zůstal pod 300 řádky (viz CLAUDE.md). Čistě prezentační, veškerou logiku
 * drží rodič.
 */

import React from 'react';
import { X } from 'lucide-react';

import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';

const fieldClass =
  'w-full rounded-xl bg-stone-100 px-3.5 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 ' +
  'focus:outline-none focus:ring-2 focus:ring-primary-600 disabled:opacity-50';
const labelClass = 'mb-1.5 block text-sm font-medium text-stone-700';

const TITLES = {
  partner: 'Manžel / partner',
  child: 'Biologické dítě',
  parent: 'Rodič pěstouna',
};

export default function SocialSpaceEntryFormModal({ kind, entry, onChange, submitting, submitError, onClose, onSubmit }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={() => !submitting && onClose()}
    >
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-stone-800">{TITLES[kind] ?? 'Přidat'}</h2>
          <button
            type="button"
            onClick={() => !submitting && onClose()}
            aria-label="Zavřít"
            className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {submitError && (
            <div className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{submitError}</div>
          )}

          <div>
            <label className={labelClass}>Jméno a příjmení</label>
            <input
              className={fieldClass}
              value={entry.name}
              onChange={(e) => onChange('name', e.target.value)}
              required
              disabled={submitting}
              autoFocus
            />
          </div>

          <div>
            <label className={labelClass}>Rodné číslo</label>
            <input
              className={fieldClass}
              value={entry.rc}
              onChange={(e) => onChange('rc', e.target.value)}
              disabled={submitting}
            />
          </div>

          {kind === 'child' ? (
            <div>
              <label className={labelClass}>Datum narození</label>
              <input
                type="date"
                className={fieldClass}
                value={entry.birthDate}
                onChange={(e) => onChange('birthDate', e.target.value)}
                disabled={submitting}
              />
            </div>
          ) : (
            <div>
              <label className={labelClass}>Telefon</label>
              <input
                className={fieldClass}
                value={entry.phone}
                onChange={(e) => onChange('phone', e.target.value)}
                disabled={submitting}
              />
            </div>
          )}

          <div className="mt-1 flex justify-end gap-2.5">
            <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
              Zrušit
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              Uložit
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
