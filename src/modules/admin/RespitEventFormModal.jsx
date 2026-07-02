/**
 * RespitEventFormModal.jsx — dialog "Zaznamenat čerpání respitu" vytažený z
 * FosterFamilyDetailPage.jsx, aby hlavní soubor zůstal pod 300 řádky (viz
 * CLAUDE.md). Čistě prezentační, veškerou logiku drží rodič.
 */

import React from 'react';
import { X } from 'lucide-react';

import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import { RESPIT_TYPES } from '../../shared/domainConstants.js';

const fieldClass =
  'w-full rounded-xl bg-stone-100 px-3.5 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 ' +
  'focus:outline-none focus:ring-2 focus:ring-primary-600 disabled:opacity-50';
const labelClass = 'mb-1.5 block text-sm font-medium text-stone-700';

export default function RespitEventFormModal({
  form,
  onChange,
  childrenList,
  onToggleChild,
  submitting,
  submitError,
  onClose,
  onSubmit,
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={() => !submitting && onClose()}
    >
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-stone-800">Zaznamenat čerpání respitu</h2>
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
            <label className={labelClass}>Od</label>
            <input
              type="date"
              className={fieldClass}
              value={form.from}
              onChange={(e) => onChange('from', e.target.value)}
              required
              disabled={submitting}
            />
          </div>

          <div>
            <label className={labelClass}>Do</label>
            <input
              type="date"
              className={fieldClass}
              value={form.to}
              onChange={(e) => onChange('to', e.target.value)}
              disabled={submitting}
            />
            <p className="mt-1 text-xs text-stone-400">Prázdné = jednodenní čerpání.</p>
          </div>

          <div>
            <label className={labelClass}>Typ</label>
            <select
              className={fieldClass}
              value={form.typ}
              onChange={(e) => onChange('typ', e.target.value)}
              disabled={submitting}
            >
              {RESPIT_TYPES.map((t) => (
                <option key={t.key} value={t.key}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <p className="mb-1.5 text-sm text-stone-500">Které děti byly mimo domov</p>
            <div className="flex flex-col gap-1.5">
              {childrenList.map((c) => (
                <label key={c.id} className="flex items-center gap-2.5 text-sm text-stone-700">
                  <input
                    type="checkbox"
                    checked={form.childIds.includes(c.id)}
                    onChange={(e) => onToggleChild(c.id, e.target.checked)}
                    disabled={submitting}
                    className="h-4 w-4 rounded border-stone-300 text-primary-600 focus:ring-2 focus:ring-primary-600"
                  />
                  {c.firstName} {c.lastName}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>Náklad na respit (Kč, volitelné)</label>
            <input
              type="number"
              className={fieldClass}
              value={form.kc}
              onChange={(e) => onChange('kc', e.target.value)}
              disabled={submitting}
            />
            <p className="mt-1 text-xs text-stone-400">
              Rozpočítá se rovným dílem mezi vybrané děti a odečte z jejich SPVPP.
            </p>
          </div>

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
