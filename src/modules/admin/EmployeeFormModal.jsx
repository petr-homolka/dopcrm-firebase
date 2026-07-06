/**
 * EmployeeFormModal.jsx — formulář „Nový zaměstnanec" vytažený z OrgEmployeesPanel.jsx,
 * aby hlavní soubor zůstal pod 300 řádky (viz CLAUDE.md). Čistě prezentační dialog,
 * veškerou logiku (submit, validace, state) drží rodič a předává přes props.
 */

import React from 'react';
import { X, Loader2 } from 'lucide-react';

import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import { employeeRoleLabel } from '../../shared/domainConstants.js';

const fieldClass =
  'w-full rounded-xl bg-surface-muted px-3.5 py-2.5 text-sm text-ink-800 placeholder:text-ink-400 ' +
  'focus:outline-none focus:ring-2 focus:ring-brand-600 disabled:opacity-50';
const labelClass = 'mb-1.5 block text-sm font-medium text-ink-700';

export default function EmployeeFormModal({
  form,
  updateForm,
  users,
  creatableRoles,
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
      <Card
        className="w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink-800">Nový zaměstnanec</h2>
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
            <div className="rounded-xl bg-danger-50 px-3.5 py-2.5 text-sm text-danger-700">
              {submitError}
            </div>
          )}

          <div>
            <label className={labelClass}>Jméno</label>
            <input
              className={fieldClass}
              value={form.name}
              onChange={updateForm('name')}
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
              onChange={updateForm('rc')}
              disabled={submitting}
            />
          </div>

          <div>
            <label className={labelClass}>Telefon</label>
            <input
              className={fieldClass}
              value={form.phone}
              onChange={updateForm('phone')}
              disabled={submitting}
            />
          </div>

          <div>
            <label className={labelClass}>E-mail</label>
            <input
              type="email"
              className={fieldClass}
              value={form.email}
              onChange={updateForm('email')}
              required
              disabled={submitting}
            />
          </div>

          <div>
            <label className={labelClass}>Počáteční heslo</label>
            <input
              type="password"
              className={fieldClass}
              value={form.password}
              onChange={updateForm('password')}
              required
              disabled={submitting}
            />
            <p className="mt-1 text-xs text-ink-400">Alespoň 6 znaků.</p>
          </div>

          <div>
            <label className={labelClass}>Role</label>
            <select
              className={fieldClass}
              value={form.role}
              onChange={updateForm('role')}
              disabled={submitting}
            >
              {creatableRoles.map((r) => (
                <option key={r.key} value={r.key}>{r.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Konkrétní funkce (volitelné)</label>
            <input
              className={fieldClass}
              placeholder="např. Vedoucí pobočky Brno"
              value={form.funkce}
              onChange={updateForm('funkce')}
              disabled={submitting}
            />
          </div>

          <div>
            <label className={labelClass}>Nadřízený</label>
            <select
              className={fieldClass}
              value={form.nadrizeny}
              onChange={updateForm('nadrizeny')}
              disabled={submitting}
            >
              <option value="">— bez nadřízeného (nejvyšší úroveň) —</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.displayName} ({employeeRoleLabel(u.role)})
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-ink-400">
              Komu se tento zaměstnanec zodpovídá — volitelné.
            </p>
          </div>

          <div className="mt-1 flex justify-end gap-2.5">
            <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
              Zrušit
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting && <Loader2 size={16} strokeWidth={1.75} className="animate-spin" />}
              {submitting ? 'Přidávám…' : 'Přidat zaměstnance'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
