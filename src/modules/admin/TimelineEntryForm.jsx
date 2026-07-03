/**
 * TimelineEntryForm.jsx — formulář „+ Záznam" i „Napsat opravu" (stejný
 * formulář, docs/domain/timeline.md §4). MVP: jen typ Poznámka.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import ChildFormModal from './ChildFormModal.jsx';
import { fieldClass, labelClass } from './childDetailShared.js';
import { cn } from '../../components/ui/cn.js';

export default function TimelineEntryForm({
  form, setForm, childrenList, correctingEntry, onClose, onSubmit,
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
      title={correctingEntry ? t('timeline.correctionTitle', { title: correctingEntry.title }) : t('timeline.form.newNoteTitle')}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitting={false}
      submitLabel={t('common.save')}
    >
      {!correctingEntry && (
        <div>
          <label className={labelClass}>{t('timeline.form.titleLabel')}</label>
          <input
            className={fieldClass}
            placeholder={t('timeline.defaultTitle')}
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
        </div>
      )}

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
                  ? 'bg-primary-600 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
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
