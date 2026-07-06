/**
 * NewOrganizationModal.jsx — formulář založení nové organizace + jejího
 * prvního org_admina, vytažen ze SuperAdminDashboard.jsx kvůli limitu
 * 300 řádků na soubor. Zatím není sdílená Modal komponenta (DESIGN.md
 * mimo scope), proto plný fixed-overlay panel přímo tady.
 */

import React from 'react';
import { X } from 'lucide-react';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';

const fieldClass =
  'w-full rounded-xl bg-surface-muted px-3.5 py-2.5 text-sm text-ink-800 placeholder:text-ink-400 ' +
  'focus:outline-none focus:ring-2 focus:ring-brand-600 disabled:opacity-50';

function Field({ label, hint, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-700">{label}</span>
      <input className={fieldClass} {...props} />
      {hint && <span className="mt-1 block text-xs text-ink-400">{hint}</span>}
    </label>
  );
}

export default function NewOrganizationModal({ form, submitting, submitError, onChange, onClose, onSubmit }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={() => !submitting && onClose()}
    >
      <Card
        className="w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-lg font-semibold text-ink-800">Nová doprovázející organizace</h2>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              aria-label="Zavřít"
              className="rounded-lg p-1.5 text-ink-400 hover:bg-surface-muted disabled:opacity-50"
            >
              <X size={18} strokeWidth={1.75} />
            </button>
          </div>

          <p className="text-sm text-ink-500">
            Založí novou organizaci a rovnou i jejího prvního administrátora (Org. Admin),
            který si dál sám přidá zaměstnance.
          </p>

          {submitError && (
            <div className="rounded-xl bg-danger-50 px-3.5 py-2.5 text-sm text-danger-700">{submitError}</div>
          )}

          <Field label="Název organizace" value={form.orgName} onChange={onChange('orgName')} required disabled={submitting} autoFocus />
          <Field label="IČO" placeholder="např. 12345678" value={form.orgIco} onChange={onChange('orgIco')} disabled={submitting} />
          <Field label="Jméno administrátora" value={form.adminName} onChange={onChange('adminName')} required disabled={submitting} />
          <Field label="E-mail administrátora" type="email" value={form.adminEmail} onChange={onChange('adminEmail')} required disabled={submitting} />
          <Field
            label="Počáteční heslo"
            type="password"
            value={form.adminPassword}
            onChange={onChange('adminPassword')}
            required
            disabled={submitting}
            hint="Alespoň 6 znaků — doporučeno vyzvat k okamžité změně."
          />

          <div className="mt-1 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
              Zrušit
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Zakládám…' : 'Založit organizaci'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
