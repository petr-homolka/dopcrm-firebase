/**
 * CalendarAgendaList.jsx — agenda pohled kalendáře, vytaženo z
 * CalendarPage.jsx (CLAUDE.md limit 300 řádků). DESKTOP POUZE od STRICT
 * UI/UX DESIGN MANDATE (2026-07-05) — mobil má vlastní `src/mobile/screens/
 * MobileCalendarScreen.jsx` (day-picker + karty, žádná tabulka), žádné
 * `lg:` mixování tady.
 */

import React from 'react';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { eventTypeLabel } from '../../shared/domainConstants.js';
import { formatTime } from './calendarShared.js';

function formatDay(date) {
  return date.toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function CalendarAgendaList({ days }) {
  return (
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
  );
}
