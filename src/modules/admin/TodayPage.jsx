/**
 * TodayPage.jsx — obrazovka Dnes (Krok 3, 2026-07-03, DESIGN.md §6.1).
 * Domovská stránka klíčové osoby: agenda dne, ne dashboard s grafy/KPI
 * dlaždicemi (viz DESIGN.md §9 "Zakázané vzory"). Vykreslování; veškerá
 * data/logika v useTodayPage.js.
 *
 * Vokativ jména ("Jano" z "Jana") záměrně NEřešíme — automatická česká
 * deklinace bez slovníku je nespolehlivá; používá se 1. pád.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';

import Card from '../../components/ui/Card.jsx';
import { cn } from '../../components/ui/cn.js';
import { useAuthStore } from '../../store/authStore.js';
import { eventTypeLabel } from '../../shared/domainConstants.js';
import useTodayPage, { CRISIS_THRESHOLD_DAYS, toDate } from './useTodayPage.js';

const EVENT_BORDER = {
  visit: 'border-entity-family-text',
  meeting: 'border-primary-600',
  deadline: 'border-entity-crisis-text',
  education: 'border-entity-bio-text',
  other: 'border-stone-300',
};

function greetingKey(hour) {
  if (hour < 12) return 'today.greeting.morning';
  if (hour < 18) return 'today.greeting.afternoon';
  return 'today.greeting.evening';
}

function formatTime(date) {
  if (!date) return '';
  return date.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
}

function EventCard({ event, familyName, onOpenFamily, quiet = false }) {
  const start = toDate(event.start);
  return (
    <button
      type="button"
      onClick={() => event.fosterFamilyId && onOpenFamily(event.fosterFamilyId)}
      disabled={!event.fosterFamilyId}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl border-l-4 bg-white px-4 py-3 text-left shadow-sm transition',
        'disabled:cursor-default',
        quiet ? 'border-stone-200 py-2.5 shadow-none' : EVENT_BORDER[event.type] ?? EVENT_BORDER.other,
        event.fosterFamilyId && 'hover:bg-stone-50'
      )}
    >
      <span className="w-14 shrink-0 text-sm font-medium text-stone-500">
        {event.allDay ? '' : formatTime(start)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-stone-800">{event.title}</p>
        {(familyName || !quiet) && (
          <p className="truncate text-xs text-stone-500">
            {[familyName, !quiet && eventTypeLabel(event.type)].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>
    </button>
  );
}

export default function TodayPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { loading, error, todayEvents, upcomingByDay, familiesById, waitingTotal, waitingShown } = useTodayPage();

  const firstName = (profile?.displayName ?? profile?.email?.split('@')[0] ?? '').split(' ')[0];
  const now = new Date();
  const greeting = t(greetingKey(now.getHours()));
  const dateLabel = now.toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long' });

  function openFamily(familyId) {
    navigate(`/admin/terenni/${familyId}`);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-14 text-stone-500">
        <Loader2 size={22} strokeWidth={1.75} className="animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-stone-800">
          {t('today.header', { greeting, name: firstName, date: dateLabel })}
        </h1>
      </div>

      <section>
        <h2 className="mb-2.5 text-sm font-semibold text-stone-800">{t('today.program.title')}</h2>
        {todayEvents.length === 0 ? (
          <Card className="py-8 text-center text-sm text-stone-500">{t('today.program.empty')}</Card>
        ) : (
          <div className="flex flex-col gap-2">
            {todayEvents.map((ev) => (
              <EventCard key={ev.id} event={ev} familyName={familiesById[ev.fosterFamilyId]?.name} onOpenFamily={openFamily} />
            ))}
          </div>
        )}
      </section>

      {waitingTotal > 0 && (
        <section>
          <div className="mb-2.5 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-stone-800">{t('today.waiting.title')}</h2>
            {waitingTotal > waitingShown.length && (
              <button
                type="button"
                onClick={() => navigate('/admin/terenni')}
                className="text-xs font-medium text-primary-700 hover:underline"
              >
                {t('today.waiting.showAll')}
              </button>
            )}
          </div>
          <div className="flex flex-col gap-2">
            {waitingShown.map(({ family, days }) => (
              <button
                key={family.id}
                type="button"
                onClick={() => openFamily(family.id)}
                className={cn(
                  'flex items-center justify-between gap-3 rounded-xl border-l-4 bg-white px-4 py-3 text-left shadow-sm hover:bg-stone-50',
                  days !== null && days > CRISIS_THRESHOLD_DAYS ? 'border-entity-crisis-text' : 'border-amber-400'
                )}
              >
                <span className="truncate text-sm font-medium text-stone-800">{family.name}</span>
                <span className="shrink-0 text-xs text-stone-500">
                  {days === null ? t('today.waiting.neverVisited') : t('today.waiting.daysAgo', { count: days })}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {upcomingByDay.some((d) => d.items.length > 0) && (
        <section>
          <h2 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-stone-400">{t('today.upcoming.title')}</h2>
          <div className="flex flex-col gap-3">
            {upcomingByDay.map(({ date, items }, i) => (
              items.length > 0 && (
                <div key={date.toDateString()} className="flex flex-col gap-1.5">
                  <p className="text-xs font-medium text-stone-400">
                    {t(i === 0 ? 'today.upcoming.tomorrow' : 'today.upcoming.dayAfterTomorrow')}
                  </p>
                  {items.map((ev) => (
                    <EventCard key={ev.id} event={ev} familyName={familiesById[ev.fosterFamilyId]?.name} onOpenFamily={openFamily} quiet />
                  ))}
                </div>
              )
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
