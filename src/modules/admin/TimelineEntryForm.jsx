/**
 * TimelineEntryForm.jsx — formulář „+ Záznam" i editace existujícího
 * záznamu (immutability pozastavena 2026-07-05, do odvolání). Stejný
 * formulář pro obojí, jen předvyplněný obsahem při editaci — na rozdíl od
 * dřívější "Napsat opravu" (nový záznam s prázdným textem) teď `title`/
 * `body`/`datum` nesou AKTUÁLNÍ hodnoty a uživatel je přepisuje na místě.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import ChildFormModal from './ChildFormModal.jsx';
import { fieldClass, labelClass } from './childDetailShared.js';
import { cn } from '../../components/ui/cn.js';

export default function TimelineEntryForm({
  form, setForm, childrenList, editingEntry, submitting = false, onClose, onSubmit,
}) {
  const { t } = useTranslation();

  function toggleChild(childId) {
    setForm((f) => ({
      ...f,
      childIds: f.childIds.includes(childId)
        ? f.childIds.filter((id) => id !== childId)
        : [...f.childIds, childId],
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <ChildFormModal
      title={editingEntry ? t('timeline.form.editNoteTitle') : t('timeline.form.newNoteTitle')}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitting={submitting}
      submitLabel={t('timeline.form.save')}
    >
      <div>
        <label className={labelClass}>{t('timeline.form.titleLabel')}</label>
        <input
          className={fieldClass}
          placeholder={t('timeline.defaultTitle')}
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        />
      </div>

      <div>
        <label className={labelClass}>{t('timeline.form.textLabel')}</label>
        <textarea
          className={fieldClass}
          rows={4}
          value={form.body}
          onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
          required
          autoFocus
        />
      </div>

      <div>
        <label className={labelClass}>{t('timeline.form.dateLabel')}</label>
        <input
          type="date"
          className={fieldClass}
          value={form.occurredAt}
          onChange={(e) => setForm((f) => ({ ...f, occurredAt: e.target.value }))}
        />
      </div>

      <div>
        <label className={labelClass}>{t('timeline.form.subjectsLabel')}</label>
        <div className="flex flex-wrap gap-1.5">
          {childrenList.map((child) => (
            <button
              key={child.id}
              type="button"
              onClick={() => toggleChild(child.id)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition',
                form.childIds.includes(child.id)
                  ? 'bg-brand-600 text-white'
                  : 'bg-surface-muted text-ink-600 hover:bg-border-subtle'
              )}
            >
              {child.firstName} {child.lastName}
            </button>
          ))}
        </div>
      </div>
    </ChildFormModal>
  );
}
