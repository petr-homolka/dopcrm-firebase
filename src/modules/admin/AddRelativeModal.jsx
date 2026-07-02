/**
 * AddRelativeModal.jsx — formulář "Přidat příbuzného" vytažený z
 * ChildDetailPage.jsx při přechodu na Tailwind (2026-07-02). Typ vztahu se
 * vybírá z REL_TYPES seskupených přes relGroups() (optgroup), stejně jako
 * v původním MUI selectu s Dividery mezi skupinami.
 */

import React from 'react';
import ChildFormModal from './ChildFormModal.jsx';
import { fieldClass, labelClass } from './childDetailShared.js';

export default function AddRelativeModal({
  form,
  setForm,
  groups,
  onClose,
  onSubmit,
  submitting,
  submitError,
}) {
  return (
    <ChildFormModal
      title="Přidat příbuzného"
      onClose={onClose}
      onSubmit={onSubmit}
      submitting={submitting}
      submitError={submitError}
      submitLabel="Přidat"
    >
      <div>
        <label className={labelClass}>Jméno a příjmení</label>
        <input
          className={fieldClass}
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
          disabled={submitting}
          autoFocus
        />
      </div>
      <div>
        <label className={labelClass}>Rodné číslo</label>
        <input
          className={fieldClass}
          placeholder="např. 654321/0987"
          value={form.rc}
          onChange={(e) => setForm((f) => ({ ...f, rc: e.target.value }))}
          disabled={submitting}
        />
      </div>
      <div>
        <label className={labelClass}>Typ vztahu</label>
        <select
          className={fieldClass}
          value={form.rel}
          onChange={(e) => setForm((f) => ({ ...f, rel: e.target.value }))}
          disabled={submitting}
        >
          {Object.entries(groups).map(([groupName, items]) => (
            <optgroup key={groupName} label={groupName}>
              {items.map((r) => (
                <option key={r.key} value={r.key}>{r.label}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass}>Telefon</label>
        <input
          className={fieldClass}
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          disabled={submitting}
        />
      </div>
      <div>
        <label className={labelClass}>E-mail</label>
        <input
          className={fieldClass}
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          disabled={submitting}
        />
      </div>
      <div>
        <label className={labelClass}>Poznámka</label>
        <textarea
          className={fieldClass}
          rows={2}
          placeholder="např. styk 1× měsíčně"
          value={form.note}
          onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
          disabled={submitting}
        />
      </div>
    </ChildFormModal>
  );
}
