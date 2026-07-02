/**
 * NewFamilyModal.jsx — formulář založení nové pěstounské rodiny.
 *
 * Vyčleněno z FosterFamiliesPanel.jsx, aby hlavní soubor zůstal pod 300
 * řádků (viz CLAUDE.md). Zatím nemáme sdílenou Modal komponentu (mimo
 * rozsah této fáze migrace z MUI) — implementováno jako prostý fixed
 * overlay panel dle zadání.
 */

import React from 'react';
import { X, Loader2 } from 'lucide-react';

import { CARE_TYPES } from '../../shared/domainConstants.js';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';

const fieldClass =
  'w-full rounded-xl bg-stone-100 px-3.5 py-2.5 text-sm text-stone-800 outline-none ' +
  'placeholder:text-stone-400 focus:ring-2 focus:ring-primary-600 disabled:opacity-50';

const labelClass = 'mb-1.5 block text-xs font-medium text-stone-500';

export default function NewFamilyModal({ form, kos, submitting, submitError, onChange, onSubmit, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={onSubmit}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-stone-800">Nová pěstounská rodina</h3>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              aria-label="Zavřít"
              className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 disabled:opacity-50"
            >
              <X size={18} strokeWidth={1.75} />
            </button>
          </div>

          <div className="flex flex-col gap-3.5">
            {submitError && (
              <div className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{submitError}</div>
            )}

            <div>
              <label className={labelClass} htmlFor="new-family-name">Název rodiny</label>
              <input
                id="new-family-name"
                className={fieldClass}
                placeholder="např. Rodina Nováková"
                value={form.name}
                onChange={onChange('name')}
                required
                disabled={submitting}
                autoFocus
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="new-family-address">Adresa</label>
              <input
                id="new-family-address"
                className={fieldClass}
                value={form.address}
                onChange={onChange('address')}
                disabled={submitting}
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="new-family-phone">Telefon</label>
              <input
                id="new-family-phone"
                className={fieldClass}
                value={form.contactPhone}
                onChange={onChange('contactPhone')}
                disabled={submitting}
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="new-family-care-type">Typ péče</label>
              <select
                id="new-family-care-type"
                className={fieldClass}
                value={form.careType}
                onChange={onChange('careType')}
                disabled={submitting}
              >
                {Object.entries(CARE_TYPES).map(([key, c]) => (
                  <option key={key} value={key}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass} htmlFor="new-family-assigned">Klíčová osoba</label>
              <select
                id="new-family-assigned"
                className={fieldClass}
                value={form.assignedTo}
                onChange={onChange('assignedTo')}
                disabled={submitting}
              >
                <option value="">— zatím nepřiřazovat —</option>
                {kos.map((ko) => (
                  <option key={ko.id} value={ko.id}>{ko.displayName}</option>
                ))}
              </select>
              {kos.length === 0 && (
                <p className="mt-1.5 text-xs text-stone-400">Organizace zatím nemá žádnou klíčovou osobu.</p>
              )}
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-2.5">
            <Button variant="ghost" type="button" onClick={onClose} disabled={submitting}>
              Zrušit
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 size={16} strokeWidth={1.75} className="animate-spin" />}
              {submitting ? 'Zakládám…' : 'Přidat rodinu'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
