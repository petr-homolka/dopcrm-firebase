/**
 * NewFamilyModal.jsx — formulář založení nové pěstounské rodiny.
 * Krok 3b redesignu (DESIGN.md §5.11) — teď na sdílené `Modal`/`Input`
 * komponenty (Krok 1), dřív vlastní fixed overlay + ad-hoc pole.
 */

import React from 'react';
import { Loader2 } from 'lucide-react';

import { CARE_TYPES } from '../../shared/domainConstants.js';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Modal from '../../components/ui/Modal.jsx';

const selectClass =
  'h-10 w-full rounded-lg border border-border-strong bg-white px-3.5 text-sm text-ink-800 ' +
  'focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:opacity-50';
const labelClass = 'mb-1 block text-[13px] font-medium text-ink-700';

export default function NewFamilyModal({ form, kos, submitting, submitError, onChange, onSubmit, onClose }) {
  return (
    <Modal
      title="Nová pěstounská rodina"
      onClose={() => !submitting && onClose()}
      footer={(
        <>
          <Button variant="secondary" type="button" onClick={onClose} disabled={submitting} form="new-family-form">
            Zrušit
          </Button>
          <Button type="submit" disabled={submitting} form="new-family-form">
            {submitting && <Loader2 size={16} strokeWidth={1.75} className="animate-spin" />}
            {submitting ? 'Zakládám…' : 'Přidat rodinu'}
          </Button>
        </>
      )}
    >
      <form id="new-family-form" onSubmit={onSubmit} className="flex flex-col gap-3.5">
        {submitError && (
          <div className="rounded-xl bg-danger-50 px-3.5 py-2.5 text-sm text-danger-700">{submitError}</div>
        )}

        <Input
          label="Název rodiny"
          placeholder="např. Rodina Nováková"
          value={form.name}
          onChange={onChange('name')}
          required
          disabled={submitting}
          autoFocus
        />
        <Input label="Adresa" value={form.address} onChange={onChange('address')} disabled={submitting} />
        <Input label="Telefon" value={form.contactPhone} onChange={onChange('contactPhone')} disabled={submitting} />

        <div>
          <label className={labelClass} htmlFor="new-family-care-type">Typ péče</label>
          <select
            id="new-family-care-type"
            className={selectClass}
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
            className={selectClass}
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
            <p className="mt-1.5 text-xs text-ink-400">Organizace zatím nemá žádnou klíčovou osobu.</p>
          )}
        </div>
      </form>
    </Modal>
  );
}
