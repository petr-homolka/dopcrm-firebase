/**
 * CalendarAgendaList.jsx — agenda pohled kalendáře, vytaženo z
 * CalendarPage.jsx (CLAUDE.md limit 300 řádků). Desktop (lg+) beze změny
 * z Kroku 4a — karta s jemným seznamem. Mobil (<lg) dostal shift-card vzor
 * (DESIGN.md §11.4, reálné Connecteam screenshoty 2026-07-04): bílá karta,
 * barevný levý pruh podle typu události (`EVENT_BORDER_CLASS`, sdíleno
 * s TodayPage.jsx), tučný čas, místo/typ na druhém řádku.
 */

import React from 'react';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { cn } from '../../components/ui/cn.js';
import { eventTypeLabel, EVENT_BORDER_CLASS } from '../../shared/domainConstants.js';
import { formatTime } from './calendarShared.js';

function formatDay(date) {
  return date.toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function CalendarAgendaList({ days }) {
  return (
    <div className="flex flex-col gap-4">
      {days.map(({ date, items }) => (
        <div key={date.toDateString()}>
          <h2 className="mb-2 text-sm font-semibold capitalize text-ink-800">{formatDay(date)}</h2>

          <Card className="hidden lg:block">
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

          <div className="flex flex-col gap-2 lg:hidden">
            {items.map((ev) => (
              <div
                key={ev.id}
                className={cn(
                  'rounded-xl border-l-4 bg-white px-4 py-3 shadow-sm',
                  EVENT_BORDER_CLASS[ev.type] ?? EVENT_BORDER_CLASS.other
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-medium text-ink-800">{ev.title}</p>
                  <span className="shrink-0 text-xs font-semibold text-ink-500">
                    {!ev.allDay && formatTime(ev.start)}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-xs text-ink-500">
                  {[ev.location, eventTypeLabel(ev.type)].filter(Boolean).join(' · ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
