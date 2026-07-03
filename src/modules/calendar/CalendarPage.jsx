/**
 * CalendarPage.jsx — Kalendář na Sekci B (audit nálezu #5, 2026-07-03).
 *
 * Dřív 8řádkový stub bez logiky. Teď agenda pohled (příštích 30 dní,
 * seskupeno po dnech) nad `organizations/{orgId}/events` — viz
 * `src/services/org/events.js` pro schéma a `EventFormModal.jsx` pro
 * formulář nové události. Plný měsíční/týdenní grid je mimo rozsah tohoto
 * kroku (agenda odpovídá měřítku ostatních prototypových obrazovek).
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarPlus, Loader2 } from 'lucide-react';

import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { useAuthStore } from '../../store/authStore.js';
import { eventTypeLabel } from '../../shared/domainConstants.js';
import { listEventsInRange, createEvent, listFostersByOrg } from '../../services/orgService.js';
import EventFormModal from './EventFormModal.jsx';

const AGENDA_DAYS = 30;

function formatDay(date) {
  return date.toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long' });
}

function formatTime(value) {
  const date = typeof value?.toDate === 'function' ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
}

function groupByDay(events) {
  const groups = new Map();
  events.forEach((ev) => {
    const date = typeof ev.start?.toDate === 'function' ? ev.start.toDate() : new Date(ev.start);
    const key = date.toDateString();
    if (!groups.has(key)) groups.set(key, { date, items: [] });
    groups.get(key).items.push(ev);
  });
  return [...groups.values()].sort((a, b) => a.date - b.date);
}

export default function CalendarPage() {
  const { t } = useTranslation();
  const { organizationId } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [events, setEvents] = useState([]);
  const [families, setFamilies] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const load = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    setError('');
    try {
      const from = new Date();
      const to = new Date();
      to.setDate(to.getDate() + AGENDA_DAYS);
      const [eventsPage, familiesData] = await Promise.all([
        listEventsInRange(organizationId, { from, to }),
        listFostersByOrg(organizationId),
      ]);
      setEvents(eventsPage.items);
      setFamilies(familiesData);
    } catch (err) {
      console.error('[CalendarPage] Načtení selhalo:', err);
      setError(err.message ?? t('calendar.loadError'));
    } finally {
      setLoading(false);
    }
  }, [organizationId, t]);

  useEffect(() => { load(); }, [load]);

  async function handleCreate(form) {
    setSubmitError('');
    if (!form.title.trim() || !form.date) {
      setSubmitError(t('calendar.form.missingFields'));
      return;
    }
    setSubmitting(true);
    try {
      const [h, m] = (form.time || '09:00').split(':').map(Number);
      const start = new Date(`${form.date}T00:00:00`);
      if (!form.allDay) start.setHours(h, m, 0, 0);

      await createEvent(organizationId, {
        title: form.title.trim(),
        type: form.type,
        start,
        allDay: form.allDay,
        location: form.location.trim(),
        note: form.note.trim(),
        assignedTo: useAuthStore.getState().currentUser?.uid,
        fosterFamilyId: form.fosterFamilyId || null,
        subjectRefs: form.fosterFamilyId ? [{ type: 'family', id: form.fosterFamilyId }] : [],
      });
      setDialogOpen(false);
      await load();
    } catch (err) {
      console.error('[CalendarPage] Založení události selhalo:', err);
      setSubmitError(err.message ?? t('calendar.form.submitError'));
    } finally {
      setSubmitting(false);
    }
  }

  const days = groupByDay(events);

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-stone-800">{t('calendar.title')}</h1>
          <p className="text-sm text-stone-500">{t('calendar.subtitle', { days: AGENDA_DAYS })}</p>
        </div>
        <Button variant="primary" onClick={() => setDialogOpen(true)}>
          <CalendarPlus size={16} strokeWidth={1.75} />
          {t('calendar.newEvent')}
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-14 text-stone-500">
          <Loader2 size={22} strokeWidth={1.75} className="animate-spin" />
        </div>
      )}

      {!loading && error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {!loading && !error && days.length === 0 && (
        <Card className="py-10 text-center text-sm text-stone-500">
          {t('calendar.empty', { days: AGENDA_DAYS })}
        </Card>
      )}

      {!loading && !error && (
        <div className="flex flex-col gap-4">
          {days.map(({ date, items }) => (
            <Card key={date.toDateString()}>
              <h2 className="mb-2 text-sm font-semibold capitalize text-stone-800">{formatDay(date)}</h2>
              <ul className="flex flex-col divide-y divide-stone-100">
                {items.map((ev) => (
                  <li key={ev.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-stone-800">{ev.title}</p>
                      <p className="text-xs text-stone-500">
                        {[!ev.allDay && formatTime(ev.start), ev.location].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <Badge tone="neutral" className="shrink-0">{eventTypeLabel(ev.type)}</Badge>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}

      {dialogOpen && (
        <EventFormModal
          families={families}
          submitting={submitting}
          submitError={submitError}
          onClose={() => setDialogOpen(false)}
          onSubmit={handleCreate}
        />
      )}
    </div>
  );
}
