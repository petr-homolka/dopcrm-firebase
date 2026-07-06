/**
 * AddChildToFamilyModal.jsx — dialog "Přidat dítě" vytažený z
 * FosterFamilyDetailPage.jsx, aby hlavní soubor zůstal pod 300 řádky (viz
 * CLAUDE.md). Staví na sdíleném ChildFormModal.jsx (obal formulářových
 * modálů karty dítěte) — veškerou logiku (submit, validace, state) drží rodič.
 */

import React from 'react';

import ChildFormModal from './ChildFormModal.jsx';

const fieldClass =
  'w-full rounded-xl bg-surface-muted px-3.5 py-2.5 text-sm text-ink-800 placeholder:text-ink-400 ' +
  'focus:outline-none focus:ring-2 focus:ring-brand-600 disabled:opacity-50';
const labelClass = 'mb-1.5 block text-sm font-medium text-ink-700';

export default function AddChildToFamilyModal({ form, onChange, submitting, submitError, onClose, onSubmit }) {
  return (
    <ChildFormModal
      title="Přidat dítě"
      onClose={onClose}
      onSubmit={onSubmit}
      submitting={submitting}
      submitError={submitError}
      submitLabel="Přidat"
    >
      <div>
        <label className={labelClass}>Jméno</label>
        <input
          className={fieldClass}
          value={form.firstName}
          onChange={(e) => onChange('firstName', e.target.value)}
          required
          disabled={submitting}
          autoFocus
        />
      </div>

      <div>
        <label className={labelClass}>Příjmení</label>
        <input
          className={fieldClass}
          value={form.lastName}
          onChange={(e) => onChange('lastName', e.target.value)}
          required
          disabled={submitting}
        />
      </div>

      <div>
        <label className={labelClass}>Rodné číslo</label>
        <input
          className={fieldClass}
          placeholder="např. 145623/7890"
          value={form.rc}
          onChange={(e) => onChange('rc', e.target.value)}
          disabled={submitting}
        />
        <p className="mt-1 text-xs text-ink-400">Primární identifikátor osoby — nemění se.</p>
      </div>

      <div>
        <label className={labelClass}>Datum narození</label>
        <input
          type="date"
          className={fieldClass}
          value={form.birthDate}
          onChange={(e) => onChange('birthDate', e.target.value)}
          disabled={submitting}
        />
      </div>
    </ChildFormModal>
  );
}
