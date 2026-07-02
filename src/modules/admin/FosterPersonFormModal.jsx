/**
 * FosterPersonFormModal.jsx — dialog "Přidat pěstouna" vytažený z
 * FosterFamilyDetailPage.jsx, aby hlavní soubor zůstal pod 300 řádky (viz
 * CLAUDE.md). Čistě prezentační, veškerou logiku (submit, validace, state)
 * drží rodič a předává přes props — stejný vzor jako EmployeeFormModal.jsx.
 */

import React from 'react';
import { X } from 'lucide-react';

import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';

const fieldClass =
  'w-full rounded-xl bg-stone-100 px-3.5 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 ' +
  'focus:outline-none focus:ring-2 focus:ring-primary-600 disabled:opacity-50';
const labelClass = 'mb-1.5 block text-sm font-medium text-stone-700';

export default function FosterPersonFormModal({ form, onChange, submitting, submitError, onClose, onSubmit }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={() => !submitting && onClose()}
    >
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-stone-800">Přidat pěstouna</h2>
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
              value={form.name}
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
              placeholder="např. 765912/3210"
              value={form.rc}
              onChange={(e) => onChange('rc', e.target.value)}
              disabled={submitting}
            />
            <p className="mt-1 text-xs text-stone-400">Primární identifikátor osoby — nemění se.</p>
          </div>

          <div>
            <label className={labelClass}>Telefon</label>
            <input
              className={fieldClass}
              value={form.phone}
              onChange={(e) => onChange('phone', e.target.value)}
              disabled={submitting}
            />
          </div>

          <div>
            <label className={labelClass}>E-mail</label>
            <input
              className={fieldClass}
              value={form.email}
              onChange={(e) => onChange('email', e.target.value)}
              disabled={submitting}
            />
          </div>

          <div>
            <label className={labelClass}>Adresa trvalého bydliště</label>
            <input
              className={fieldClass}
              value={form.addressPermanentText}
              onChange={(e) => onChange('addressPermanentText', e.target.value)}
              disabled={submitting}
            />
          </div>

          <div>
            <label className={labelClass}>Adresa pobytu (pokud jiná)</label>
            <input
              className={fieldClass}
              value={form.addressResidenceText}
              onChange={(e) => onChange('addressResidenceText', e.target.value)}
              disabled={submitting}
            />
          </div>

          <div className="mt-1 flex justify-end gap-2.5">
            <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
              Zrušit
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              Přidat
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
