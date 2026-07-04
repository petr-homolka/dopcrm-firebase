/**
 * CalendarWeekGrid.jsx — týdenní mřížka kalendáře (Krok 4a–4c, DESIGN.md
 * §6.4): koordinátorky jako řádky, dny jako sloupce, bloky návštěv barevné
 * podle typu (§2.4), poslední sloupec = týdenní součet. Patičkové řádky
 * Návštěvy/Rodiny (Krok 4b) — bez řádku Hodiny a bez capacity barů pod day
 * headery, viz komentář v useCalendarWeek.js. Koncepty (Krok 4c,
 * `published === false`) mají šrafovaný overlay. Čistě prezentační — data,
 * navigace týdnem a publish akce v useCalendarWeek.js. Šablony/otevřené
 * návštěvy (Krok 4d) — viz docs/INVENTAR.md.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Users } from 'lucide-react';

import Card from '../../components/ui/Card.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { cn } from '../../components/ui/cn.js';
import { eventTypeLabel } from '../../shared/domainConstants.js';
import { EVENT_SHIFT_CLASS, DRAFT_HATCH_STYLE, formatDayHeader, formatTime, isToday } from './calendarShared.js';
import { UNASSIGNED_ROW } from './useCalendarWeek.js';

function EventBlock({ event, onOpen, allDayLabel, draftLabel }) {
  const isDraft = event.published === false;
  return (
    <button
      type="button"
      onClick={() => onOpen(event)}
      title={isDraft ? `${event.title} — ${draftLabel}` : `${event.title} — ${eventTypeLabel(event.type)}`}
      style={isDraft ? DRAFT_HATCH_STYLE : undefined}
      className={cn(
        'w-full rounded-md px-1.5 py-1 text-left text-[11px] leading-tight text-white transition hover:opacity-90',
        EVENT_SHIFT_CLASS[event.type] ?? EVENT_SHIFT_CLASS.other
      )}
    >
      <p className="font-semibold">{event.allDay ? allDayLabel : formatTime(event.start)}</p>
      <p className="truncate">{event.title}</p>
    </button>
  );
}

function DayCell({ events, onOpen, allDayLabel, draftLabel }) {
  return (
    <div className="flex min-h-[52px] flex-col gap-1 border-l border-border-subtle p-1">
      {events.map((ev) => (
        <EventBlock key={ev.id} event={ev} onOpen={onOpen} allDayLabel={allDayLabel} draftLabel={draftLabel} />
      ))}
    </div>
  );
}

function TotalCell({ value, strong }) {
  return (
    <div className={cn('flex items-center justify-center border-l border-border-subtle p-2 text-sm', strong ? 'font-semibold text-ink-800' : 'text-ink-500')}>
      {value}
    </div>
  );
}

function weekVisitCount(dayEvents) {
  return dayEvents.flat().filter((ev) => ev.type === 'visit').length;
}

export default function CalendarWeekGrid({ employees, days, rows, unassignedCount, dayTotals, weekTotals }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const allDayLabel = t('calendar.week.allDay');
  const draftLabel = t('calendar.week.draft');

  function openEvent(event) {
    if (event.fosterFamilyId) navigate(`/admin/terenni/${event.fosterFamilyId}`);
  }

  if (employees.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<Users size={28} strokeWidth={1.75} />}
          title={t('calendar.week.emptyKoTitle')}
          description={t('calendar.week.emptyKoDescription')}
        />
      </Card>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border-subtle bg-white">
      <div className="min-w-[860px]">
        <div className="grid grid-cols-[160px_repeat(7,1fr)_88px]">
          <div className="border-b border-border-subtle p-2" />
          {days.map((day) => (
            <div
              key={day.toDateString()}
              className={cn(
                'border-b border-l border-border-subtle p-2 text-center text-xs font-semibold uppercase tracking-wide',
                isToday(day) ? 'bg-brand-50 text-brand-700' : 'text-ink-500'
              )}
            >
              {formatDayHeader(day)}
            </div>
          ))}
          <div className="border-b border-l border-border-subtle p-2 text-center text-xs font-semibold uppercase tracking-wide text-ink-500">
            {t('calendar.week.total')}
          </div>

          {employees.map((ko) => (
            <React.Fragment key={ko.id}>
              <div className="flex items-center gap-2 border-b border-border-subtle p-2">
                <Avatar name={ko.displayName} size="sm" />
                <span className="truncate text-sm font-medium text-ink-800">{ko.displayName}</span>
              </div>
              {rows.get(ko.id).map((dayEvents, i) => (
                <div key={i} className="border-b border-border-subtle">
                  <DayCell events={dayEvents} onOpen={openEvent} allDayLabel={allDayLabel} draftLabel={draftLabel} />
                </div>
              ))}
              <div className="flex items-center justify-center border-b border-l border-border-subtle p-2 text-sm text-ink-500">
                {weekVisitCount(rows.get(ko.id))}
              </div>
            </React.Fragment>
          ))}

          {unassignedCount > 0 && (
            <React.Fragment>
              <div className="flex items-center border-b border-border-subtle p-2 text-sm font-medium text-ink-500">
                {t('calendar.week.unassigned')}
              </div>
              {rows.get(UNASSIGNED_ROW).map((dayEvents, i) => (
                <div key={i} className="border-b border-border-subtle">
                  <DayCell events={dayEvents} onOpen={openEvent} allDayLabel={allDayLabel} draftLabel={draftLabel} />
                </div>
              ))}
              <div className="flex items-center justify-center border-b border-l border-border-subtle p-2 text-sm text-ink-500">
                {weekVisitCount(rows.get(UNASSIGNED_ROW))}
              </div>
            </React.Fragment>
          )}

          <div className="flex items-center border-b border-border-subtle bg-surface-muted p-2 text-sm font-semibold text-ink-700">
            {t('calendar.week.visitsRow')}
          </div>
          {dayTotals.map((d, i) => (
            <div key={i} className="flex items-center justify-center border-b border-l border-border-subtle bg-surface-muted p-2 text-sm font-semibold text-ink-800">
              {d.visitCount}
            </div>
          ))}
          <TotalCell value={weekTotals.visitCount} strong />

          <div className="flex items-center border-border-subtle bg-surface-muted p-2 text-sm font-semibold text-ink-700">
            {t('calendar.week.familiesRow')}
          </div>
          {dayTotals.map((d, i) => (
            <div key={i} className="flex items-center justify-center border-l border-border-subtle bg-surface-muted p-2 text-sm font-semibold text-ink-800">
              {d.familyCount}
            </div>
          ))}
          <TotalCell value={weekTotals.familyCount} strong />
        </div>
      </div>
    </div>
  );
}
