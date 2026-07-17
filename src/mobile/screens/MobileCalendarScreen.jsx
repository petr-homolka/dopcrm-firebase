/**
 * MobileCalendarScreen.jsx — kalendář (Connecteam + Lidl v4, 2026-07-06,
 * závazná zpětná vazba): pás dnů nahoře je SWIPOVATELNÝ prstem (tažení
 * doleva/doprava = další/předchozí týden), klepnutí na den zobrazí dole
 * HODINOVÝ rozvrh toho dne (pracovní doba 7–19) — události sedí v řádku své
 * hodiny, prázdná hodina se dá ťuknout a založit událost s předvyplněným
 * časem (MobileEventSheet). Klepnutí na událost otevírá MobileEventDetailSheet
 * (akce, úprava, smazání). Data ze sdíleného hooku useCalendarWeek (žádná
 * sdílená JSX s desktopem).
 */

import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { cn } from '../../components/ui/cn.js';
import { EVENT_BORDER_CLASS, eventTypeLabel } from '../../shared/domainConstants.js';
import { formatTime, toJsDate } from '../../modules/calendar/calendarShared.js';
import useCalendarWeek, { UNASSIGNED_ROW } from '../../modules/calendar/useCalendarWeek.js';
import MobileTopNav from '../ui/MobileTopNav.jsx';
import { NATIVE_EVENT_BORDER } from '../ui/NativeBits.jsx';
import MobileEventSheet from './calendar/MobileEventSheet.jsx';
import MobileEventDetailSheet from './calendar/MobileEventDetailSheet.jsx';

const DAY_START = 7; // pracovní doba 7:00–19:00
const DAY_END = 19;
const HOURS = Array.from({ length: DAY_END - DAY_START }, (_, i) => DAY_START + i);

function EventCard({ ev, onOpen }) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'w-full rounded-native-card border-l-4 bg-native-surface px-4 py-3 text-left',
        'transition-transform duration-100 active:scale-[0.98]',
        NATIVE_EVENT_BORDER[ev.type] ?? EVENT_BORDER_CLASS[ev.type] ?? EVENT_BORDER_CLASS.other
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[15px] font-semibold text-native-text">
          {ev.allDay ? t('m.calendar.allDay', 'Celý den') : `${formatTime(ev.start)} – ${formatTime(ev.end ?? ev.start)}`}
        </p>
        <span className="text-[13px] text-native-textMuted">{ev.typeLabel ?? eventTypeLabel(ev.type)}</span>
      </div>
      <p className="mt-0.5 truncate text-[15px] text-native-text">{ev.title}</p>
      {ev.location && <p className="truncate text-[13px] text-native-textMuted">{ev.location}</p>}
    </button>
  );
}

export default function MobileCalendarScreen() {
  const { t } = useTranslation();
  const week = useCalendarWeek();
  const [selected, setSelected] = useState(() => {
    const todayIdx = week.days.findIndex((d) => d.toDateString() === new Date().toDateString());
    return todayIdx >= 0 ? todayIdx : 0;
  });
  const [sheet, setSheet] = useState(null); // null | { dayIdx, from? }
  const [detailEvent, setDetailEvent] = useState(null);
  const [editEvent, setEditEvent] = useState(null);
  const touchX = useRef(null);

  if (week.loading) {
    return (
      <div>
        <MobileTopNav title={t('m.calendar.title', 'Kalendář')} />
        <p className="py-16 text-center text-[15px] text-native-textMuted">{t('m.common.loading', 'Načítám…')}</p>
      </div>
    );
  }

  const allRowKeys = [...week.employees.map((e) => e.id), UNASSIGNED_ROW];
  const dayEventsFor = (idx) => allRowKeys.flatMap((key) => week.rows.get(key)?.[idx] ?? []);
  const dayHasEvents = (idx) => dayEventsFor(idx).length > 0;

  const selectedEvents = dayEventsFor(selected);
  const outsideHours = selectedEvents.filter((ev) => {
    if (ev.allDay) return true;
    const h = toJsDate(ev.start).getHours();
    return h < DAY_START || h >= DAY_END;
  });
  const eventsInHour = (hour) =>
    selectedEvents.filter((ev) => !ev.allDay && toJsDate(ev.start).getHours() === hour);

  // Swipe pásu dnů prstem = předchozí/následující týden (Lidl v4 bod 1).
  function onTouchStart(e) {
    touchX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e) {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) < 48) return;
    if (dx < 0) week.goNextWeek(); else week.goPrevWeek();
  }

  return (
    <div>
      <MobileTopNav title={t('m.calendar.title', 'Kalendář')} />

      <div className="flex items-center justify-between px-2 pt-2">
        <button type="button" onClick={week.goPrevWeek} aria-label={t('m.calendar.prevWeek', 'Předchozí týden')} className="flex h-11 w-11 items-center justify-center text-native-primary">
          <ChevronLeft size={22} strokeWidth={2} />
        </button>
        <p className="text-[15px] font-semibold capitalize text-native-text">
          {week.days[3]?.toLocaleDateString('cs-CZ', { month: 'long', year: 'numeric' })}
        </p>
        <button type="button" onClick={week.goNextWeek} aria-label={t('m.calendar.nextWeek', 'Následující týden')} className="flex h-11 w-11 items-center justify-center text-native-primary">
          <ChevronRight size={22} strokeWidth={2} />
        </button>
      </div>

      <div className="flex justify-between px-4 pb-1 pt-1" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {week.days.map((day, i) => {
          const isToday = day.toDateString() === new Date().toDateString();
          const isSelected = i === selected;
          return (
            <button key={day.toDateString()} type="button" onClick={() => setSelected(i)} className="flex flex-col items-center gap-1">
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
        {t('m.calendar.weekTotals', 'Tento týden · {{visits}} návštěv · {{families}} rodin', { visits: week.weekTotals.visitCount, families: week.weekTotals.familyCount })}
      </p>

      {week.error && <p className="px-4 py-4 text-center text-[15px] text-native-danger">{week.error}</p>}

      <div className="flex flex-col px-4 pb-28">
        {outsideHours.length > 0 && (
          <div className="mb-3 flex flex-col gap-2">
            {outsideHours.map((ev) => <EventCard key={ev.id} ev={ev} onOpen={() => setDetailEvent(ev)} />)}
          </div>
        )}
        {HOURS.map((hour) => {
          const events = eventsInHour(hour);
          return (
            <div key={hour} className="flex gap-3 border-t border-native-separator py-1.5 first:border-t-0">
              <span className="w-12 shrink-0 pt-2 text-[13px] font-medium tabular-nums text-native-textMuted">
                {String(hour).padStart(2, '0')}:00
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                {events.length > 0 ? (
                  events.map((ev) => <EventCard key={ev.id} ev={ev} onOpen={() => setDetailEvent(ev)} />)
                ) : (
                  <button
                    type="button"
                    aria-label={t('m.calendar.addAtHour', 'Přidat událost v {{hour}}:00', { hour })}
                    onClick={() => setSheet({ dayIdx: selected, from: `${String(hour).padStart(2, '0')}:00` })}
                    className="flex h-11 items-center gap-1 rounded-native-input px-2 text-[13px] font-medium text-native-textMuted/60 transition-colors active:bg-native-primary/10 active:text-native-primary"
                  >
                    <Plus size={14} strokeWidth={2} /> {t('m.common.add', 'Přidat')}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => setSheet({ dayIdx: selected })}
        aria-label={t('m.calendar.newEvent', 'Nová událost')}
        className="fixed bottom-[calc(49px+env(safe-area-inset-bottom)+16px)] right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-native-primary text-white transition-transform duration-100 active:scale-[0.94]"
      >
        <Plus size={26} strokeWidth={2.25} />
      </button>

      {sheet !== null && (
        <MobileEventSheet
          defaultDate={week.days[sheet.dayIdx]}
          defaultFrom={sheet.from}
          onClose={() => setSheet(null)}
          onCreated={() => { setSheet(null); week.reload(); }}
        />
      )}

      {detailEvent && (
        <MobileEventDetailSheet
          event={detailEvent}
          onClose={() => setDetailEvent(null)}
          onEdit={() => { setEditEvent(detailEvent); setDetailEvent(null); }}
          onChanged={() => { setDetailEvent(null); week.reload(); }}
        />
      )}

      {editEvent && (
        <MobileEventSheet
          event={editEvent}
          onClose={() => setEditEvent(null)}
          onCreated={() => { setEditEvent(null); week.reload(); }}
        />
      )}
    </div>
  );
}
