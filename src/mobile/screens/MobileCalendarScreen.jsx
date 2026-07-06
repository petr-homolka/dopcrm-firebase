/**
 * MobileCalendarScreen.jsx — týdenní agenda (Connecteam vzor, 2026-07-05):
 * pás dnů nahoře (vybraný den plný kruh, tečky = dny s událostmi), pod ním
 * agenda CELÉHO týdne seskupená po dnech s datum-railem vlevo (velké číslo
 * dne + zkratka). Klepnutí na den v pásu sroluje na jeho skupinu; prázdný
 * den nabízí čárkovaný „+ Přidat" řádek. Události se nově dají ZAKLÁDAT
 * (MobileEventSheet) — dřív mobilní kalendář uměl jen číst. Data ze
 * sdíleného hooku useCalendarWeek (žádná sdílená JSX s desktopem).
 */

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { cn } from '../../components/ui/cn.js';
import { EVENT_BORDER_CLASS, eventTypeLabel } from '../../shared/domainConstants.js';
import { formatTime } from '../../modules/calendar/calendarShared.js';
import useCalendarWeek, { UNASSIGNED_ROW } from '../../modules/calendar/useCalendarWeek.js';
import MobileTopNav from '../ui/MobileTopNav.jsx';
import { NATIVE_EVENT_BORDER } from '../ui/NativeBits.jsx';
import MobileEventSheet from './calendar/MobileEventSheet.jsx';

function EventCard({ ev }) {
  return (
    <div
      className={cn(
        'rounded-native-card border-l-4 bg-native-surface px-4 py-3',
        NATIVE_EVENT_BORDER[ev.type] ?? EVENT_BORDER_CLASS[ev.type] ?? EVENT_BORDER_CLASS.other
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[15px] font-semibold text-native-text">
          {ev.allDay ? 'Celý den' : formatTime(ev.start)}
        </p>
        <span className="text-[13px] text-native-textMuted">{eventTypeLabel(ev.type)}</span>
      </div>
      <p className="mt-0.5 truncate text-[15px] text-native-text">{ev.title}</p>
      {ev.location && <p className="truncate text-[13px] text-native-textMuted">{ev.location}</p>}
    </div>
  );
}

export default function MobileCalendarScreen() {
  const week = useCalendarWeek();
  const [selected, setSelected] = useState(() => {
    const todayIdx = week.days.findIndex((d) => d.toDateString() === new Date().toDateString());
    return todayIdx >= 0 ? todayIdx : 0;
  });
  const [sheetDayIdx, setSheetDayIdx] = useState(null); // null = zavřeno

  if (week.loading) {
    return (
      <div>
        <MobileTopNav title="Kalendář" />
        <p className="py-16 text-center text-[15px] text-native-textMuted">Načítám…</p>
      </div>
    );
  }

  const allRowKeys = [...week.employees.map((e) => e.id), UNASSIGNED_ROW];
  const dayEventsFor = (idx) => allRowKeys.flatMap((key) => week.rows.get(key)?.[idx] ?? []);
  const dayHasEvents = (idx) => dayEventsFor(idx).length > 0;

  function selectDay(i) {
    setSelected(i);
    document.getElementById(`cal-day-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div>
      <MobileTopNav title="Kalendář" />

      <div className="flex items-center justify-between px-2 pt-2">
        <button type="button" onClick={week.goPrevWeek} aria-label="Předchozí týden" className="flex h-11 w-11 items-center justify-center text-native-primary">
          <ChevronLeft size={22} strokeWidth={2} />
        </button>
        <p className="text-[15px] font-semibold capitalize text-native-text">
          {week.days[3]?.toLocaleDateString('cs-CZ', { month: 'long', year: 'numeric' })}
        </p>
        <button type="button" onClick={week.goNextWeek} aria-label="Následující týden" className="flex h-11 w-11 items-center justify-center text-native-primary">
          <ChevronRight size={22} strokeWidth={2} />
        </button>
      </div>

      <div className="flex justify-between px-4 pb-1 pt-1">
        {week.days.map((day, i) => {
          const isToday = day.toDateString() === new Date().toDateString();
          const isSelected = i === selected;
          return (
            <button key={day.toDateString()} type="button" onClick={() => selectDay(i)} className="flex flex-col items-center gap-1">
              <span className="text-[11px] font-medium text-native-textMuted">
                {day.toLocaleDateString('cs-CZ', { weekday: 'short' }).replace('.', '').toUpperCase()}
              </span>
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-[15px] font-semibold',
                  isSelected ? 'bg-native-primary text-white' : isToday ? 'text-native-primary' : 'text-native-text'
                )}
              >
                {day.getDate()}
              </span>
              <span className={cn('h-1 w-1 rounded-full', dayHasEvents(i) && !isSelected ? 'bg-native-primary' : 'bg-transparent')} />
            </button>
          );
        })}
      </div>

      <p className="px-4 pb-2 text-[13px] text-native-textMuted">
        Tento týden · {week.weekTotals.visitCount} návštěv · {week.weekTotals.familyCount} rodin
      </p>

      {week.error && <p className="px-4 py-4 text-center text-[15px] text-native-danger">{week.error}</p>}

      <div className="flex flex-col gap-5 px-4 pb-28">
        {week.days.map((day, i) => {
          const events = dayEventsFor(i);
          const isToday = day.toDateString() === new Date().toDateString();
          return (
            <div key={day.toDateString()} id={`cal-day-${i}`} className="flex scroll-mt-2 gap-3">
              <div className="w-10 shrink-0 pt-2 text-center">
                <p className={cn('text-[22px] font-bold leading-none tabular-nums', isToday ? 'text-native-primary' : 'text-native-text')}>
                  {day.getDate()}
                </p>
                <p className="mt-0.5 text-[12px] font-medium uppercase text-native-textMuted">
                  {day.toLocaleDateString('cs-CZ', { weekday: 'short' }).replace('.', '')}
                </p>
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                {events.length > 0 ? (
                  events.map((ev) => <EventCard key={ev.id} ev={ev} />)
                ) : (
                  <button
                    type="button"
                    onClick={() => { setSelected(i); setSheetDayIdx(i); }}
                    className="flex items-center gap-1.5 rounded-native-card border border-dashed border-native-separator px-4 py-3 text-left text-[14px] font-medium text-native-textMuted transition-transform duration-100 active:scale-[0.98]"
                  >
                    <Plus size={15} strokeWidth={2} className="text-native-primary" /> Přidat
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => setSheetDayIdx(selected)}
        aria-label="Nová událost"
        className="fixed bottom-[calc(49px+env(safe-area-inset-bottom)+16px)] right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-native-primary text-white transition-transform duration-100 active:scale-[0.94]"
      >
        <Plus size={26} strokeWidth={2.25} />
      </button>

      {sheetDayIdx !== null && (
        <MobileEventSheet
          defaultDate={week.days[sheetDayIdx]}
          onClose={() => setSheetDayIdx(null)}
          onCreated={() => { setSheetDayIdx(null); week.reload(); }}
        />
      )}
    </div>
  );
}
