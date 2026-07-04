/**
 * EventFormModal.jsx — dialog "Nová událost" pro CalendarPage.jsx.
 * Krok 4a redesignu (DESIGN.md §5.11) — na sdílené `Modal`/`Input`/`Button`
 * komponenty (Krok 1), stejný vzor jako NewFamilyModal.jsx. Krok 4c přidal
 * checkbox „Uložit jako koncept" (publish workflow, viz calendarShared.js).
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';

import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { EVENT_TYPES } from '../../shared/domainConstants.js';

const fieldBaseClass =
  'w-full rounded-lg border border-border-strong bg-white text-sm text-ink-800 ' +
  'focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:opacity-50';
const selectClass = `h-10 px-3.5 ${fieldBaseClass}`;
const textareaClass = `px-3.5 py-2.5 ${fieldBaseClass}`;
const labelClass = 'mb-1 block text-[13px] font-medium text-ink-700';

const emptyForm = {
  title: '', type: 'visit', date: '', time: '09:00', allDay: false,
  location: '', note: '', fosterFamilyId: '', draft: false,
};

export default function EventFormModal({ families, submitting, submitError, onClose, onSubmit }) {
  const { t } = useTranslation();
  const [form, setForm] = useState(emptyForm);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  return (
    <Modal
      title={t('calendar.newEvent')}
      onClose={() => !submitting && onClose()}
      footer={(
        <>
          <Button variant="secondary" type="button" onClick={onClose} disabled={submitting} form="event-form">
            {t('calendar.form.cancel')}
          </Button>
          <Button type="submit" disabled={submitting} form="event-form">
            {submitting && <Loader2 size={16} strokeWidth={1.75} className="animate-spin" />}
            {t('calendar.form.submit')}
          </Button>
        </>
      )}
    >
      <form id="event-form" onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="flex flex-col gap-3.5">
        {submitError && (
          <div className="rounded-xl bg-danger-50 px-3.5 py-2.5 text-sm text-danger-700">{submitError}</div>
        )}

        <Input
          label={t('calendar.form.name')}
          value={form.title}
          onChange={(e) => update('title', e.target.value)}
          required
          disabled={submitting}
          autoFocus
        />

        <div>
          <label className={labelClass} htmlFor="event-type">{t('calendar.form.type')}</label>
          <select
            id="event-type"
            className={selectClass}
            value={form.type}
            onChange={(e) => update('type', e.target.value)}
            disabled={submitting}
          >
            {Object.entries(EVENT_TYPES).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            type="date"
            label={t('calendar.form.date')}
            value={form.date}
            onChange={(e) => update('date', e.target.value)}
            required
            disabled={submitting}
          />
          <Input
            type="time"
            label={t('calendar.form.time')}
            value={form.time}
            onChange={(e) => update('time', e.target.value)}
            disabled={submitting || form.allDay}
          />
        </div>

        <label className="flex items-center gap-2.5 text-sm text-ink-700">
          <input
            type="checkbox"
            checked={form.allDay}
            onChange={(e) => update('allDay', e.target.checked)}
            disabled={submitting}
            className="h-4 w-4 rounded border-border-strong text-brand-600 focus:ring-2 focus:ring-brand-100"
          />
          {t('calendar.form.allDay')}
        </label>

        <div>
          <label className={labelClass} htmlFor="event-family">{t('calendar.form.family')}</label>
          <select
            id="event-family"
            className={selectClass}
            value={form.fosterFamilyId}
            onChange={(e) => update('fosterFamilyId', e.target.value)}
            disabled={submitting}
          >
            <option value="">{t('calendar.form.noFamily')}</option>
            {families.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>

        <Input
          label={t('calendar.form.location')}
          value={form.location}
          onChange={(e) => update('location', e.target.value)}
          disabled={submitting}
        />

        <div>
          <label className={labelClass} htmlFor="event-note">{t('calendar.form.note')}</label>
          <textarea
            id="event-note"
            className={textareaClass}
            rows={2}
            value={form.note}
            onChange={(e) => update('note', e.target.value)}
            disabled={submitting}
          />
        </div>

        <label className="flex items-center gap-2.5 text-sm text-ink-700">
          <input
            type="checkbox"
            checked={form.draft}
            onChange={(e) => update('draft', e.target.checked)}
            disabled={submitting}
            className="h-4 w-4 rounded border-border-strong text-brand-600 focus:ring-2 focus:ring-brand-100"
          />
          {t('calendar.form.saveAsDraft')}
        </label>
      </form>
    </Modal>
  );
}
