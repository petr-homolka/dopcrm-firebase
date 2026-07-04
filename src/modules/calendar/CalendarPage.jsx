/**
 * CalendarPage.jsx — Kalendář na Sekci B (audit nálezu #5, 2026-07-03),
 * Krok 4a–4c redesignu (DESIGN.md §6.4) přidal týdenní mřížku vedle agendy.
 *
 * Agenda pohled (příštích 30 dní) zůstává výchozí a nezměněný nad
 * `organizations/{orgId}/events` — viz `src/services/org/events.js`.
 * Tab „Týden" (`CalendarWeekGrid.jsx` + `useCalendarWeek.js`) přidává
 * koordinátorky jako řádky, barevné bloky návštěv dle typu, sticky footer
 * (Krok 4b) a publish workflow (Krok 4c, `PublishModal.jsx`) — nová událost
 * může vzniknout jako koncept (checkbox v `EventFormModal.jsx`), publikace
 * je skutečný batch zápis `published: true`. Krok 4d přidal šablony (jen
 * klientské předvyplnění, viz EventFormModal.jsx) a otevřené (nepřiřazené)
 * návštěvy pro management — „Přijmout" klíčovou osobou VĚDOMĚ
 * NEIMPLEMENTOVÁNO (vyžadovalo by změnu firestore.rules, viz
 * calendarShared.js/docs/INVENTAR.md).
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarPlus, Loader2, ChevronLeft, ChevronRight, Bell } from 'lucide-react';

import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Tabs from '../../components/ui/Tabs.jsx';
import { useAuthStore } from '../../store/authStore.js';
import { eventTypeLabel } from '../../shared/domainConstants.js';
import { listEventsInRange, createEvent, listFostersByOrg } from '../../services/orgService.js';
import EventFormModal from './EventFormModal.jsx';
import CalendarWeekGrid from './CalendarWeekGrid.jsx';
import PublishModal from './PublishModal.jsx';
import useCalendarWeek from './useCalendarWeek.js';
import { formatWeekRange, canCreateOpenVisit } from './calendarShared.js';

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
  const { organizationId, role } = useAuthStore();
  const [view, setView] = useState('agenda');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [events, setEvents] = useState([]);
  const [families, setFamilies] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const week = useCalendarWeek(view === 'week');

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
        assignedTo: form.openVisit ? null : useAuthStore.getState().currentUser?.uid,
        fosterFamilyId: form.fosterFamilyId || null,
        subjectRefs: form.fosterFamilyId ? [{ type: 'family', id: form.fosterFamilyId }] : [],
        published: !form.draft,
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
  const viewItems = [
    { value: 'agenda', label: t('calendar.view.agenda') },
    { value: 'week', label: t('calendar.view.week') },
  ];

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-bold leading-tight text-ink-900">{t('calendar.title')}</h1>
          <p className="text-sm text-ink-500">{t('calendar.subtitle', { days: AGENDA_DAYS })}</p>
        </div>
        <Button variant="primary" onClick={() => setDialogOpen(true)}>
          <CalendarPlus size={16} strokeWidth={1.75} />
          {t('calendar.newEvent')}
        </Button>
      </div>

      <div className="mb-5">
        <Tabs items={viewItems} value={view} onChange={setView} />
      </div>

      {view === 'agenda' && (
        <>
          {loading && (
            <div className="flex items-center justify-center gap-2 py-14 text-ink-500">
              <Loader2 size={22} strokeWidth={1.75} className="animate-spin" />
            </div>
          )}

          {!loading && error && <div className="rounded-xl bg-danger-50 px-4 py-3 text-sm text-danger-700">{error}</div>}

          {!loading && !error && days.length === 0 && (
            <Card className="py-10 text-center text-sm text-ink-500">
              {t('calendar.empty', { days: AGENDA_DAYS })}
            </Card>
          )}

          {!loading && !error && (
            <div className="flex flex-col gap-4">
              {days.map(({ date, items }) => (
                <Card key={date.toDateString()}>
                  <h2 className="mb-2 text-sm font-semibold capitalize text-ink-800">{formatDay(date)}</h2>
                  <ul className="flex flex-col divide-y divide-border-subtle">
                    {items.map((ev) => (
                      <li key={ev.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-ink-800">{ev.title}</p>
                          <p className="text-xs text-ink-500">
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
        </>
      )}

      {view === 'week' && (
        <>
          <div className="mb-4 flex items-center gap-2">
            <button
              type="button"
              onClick={week.goPrevWeek}
              aria-label={t('calendar.week.prev')}
              className="rounded-lg p-1.5 text-ink-500 hover:bg-surface-muted"
            >
              <ChevronLeft size={18} strokeWidth={1.75} />
            </button>
            <p className="w-40 text-center text-sm font-medium text-ink-800">{formatWeekRange(week.weekStart)}</p>
            <button
              type="button"
              onClick={week.goNextWeek}
              aria-label={t('calendar.week.next')}
              className="rounded-lg p-1.5 text-ink-500 hover:bg-surface-muted"
            >
              <ChevronRight size={18} strokeWidth={1.75} />
            </button>
            <Button variant="secondary" size="sm" onClick={week.goToday}>
              {t('calendar.week.today')}
            </Button>
            <div className="flex-1" />
            {week.publishableCount > 0 && (
              <Button variant="primary" size="sm" onClick={() => setPublishModalOpen(true)}>
                <Bell size={16} strokeWidth={1.75} />
                {t('calendar.publish.button', { count: week.publishableCount })}
              </Button>
            )}
          </div>

          {week.loading && (
            <div className="flex items-center justify-center gap-2 py-14 text-ink-500">
              <Loader2 size={22} strokeWidth={1.75} className="animate-spin" />
            </div>
          )}

          {!week.loading && week.error && (
            <div className="rounded-xl bg-danger-50 px-4 py-3 text-sm text-danger-700">{week.error}</div>
          )}

          {!week.loading && !week.error && (
            <CalendarWeekGrid
              employees={week.employees}
              days={week.days}
              rows={week.rows}
              unassignedCount={week.unassignedCount}
              dayTotals={week.dayTotals}
              weekTotals={week.weekTotals}
            />
          )}
        </>
      )}

      {dialogOpen && (
        <EventFormModal
          families={families}
          submitting={submitting}
          submitError={submitError}
          canCreateOpenVisit={canCreateOpenVisit(role)}
          onClose={() => setDialogOpen(false)}
          onSubmit={handleCreate}
        />
      )}

      {publishModalOpen && (
        <PublishModal
          count={week.publishableCount}
          publishing={week.publishing}
          onClose={() => setPublishModalOpen(false)}
          onConfirm={async () => { await week.publish(); setPublishModalOpen(false); }}
        />
      )}
    </div>
  );
}
