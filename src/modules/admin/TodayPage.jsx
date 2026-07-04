/**
 * TodayPage.jsx — obrazovka Dnes (Krok 3a redesignu, DESIGN.md §6.1;
 * mobilní hlavička a quick actions dle §11.2, reálné Connecteam screenshoty
 * 2026-07-04). Domovská stránka klíčové osoby: agenda dne, ne dashboard
 * s grafy/KPI dlaždicemi (DESIGN.md §8 bod — žádné KPI/grafy tady).
 * Vykreslování; data v useTodayPage.js.
 *
 * Dvě záměrné odchylky od DESIGN.md popisu, obě zdůvodněné projektovým
 * pravidlem "žádná emoji v UI" (CLAUDE.md, `crm-zadne-emoji-nikde`), které
 * má přednost před Connecteam mockupy: emoji v uvítání/quick actions
 * nahrazeny lucide-react ikonami. Vokativ jména ("Jano" z "Jana") záměrně
 * NEřešíme — automatická česká deklinace bez slovníku je nespolehlivá.
 *
 * Na mobilu (<lg) jsou quick actions 2×2 mřížka velkých pill dlaždic
 * (§11.2) místo řádku malých obrysových tlačítek na desktopu — barevně
 * odlišena JEDINÁ skutečně funkční akce (Naplánovat návštěvu, brand modrá)
 * od tří `toast.info` stubů (neutrální `surface-muted`), aby dlaždice
 * nepředstíraly funkčnost, která neexistuje.
 *
 * Pravý sloupec BEZ QR promo (zadání Kroku 3a — mobilní appka není v
 * obchodech) a bez "Novinky" (Interní chat je zatím jen roadmapa, žádná
 * data k zobrazení). Zvonek s notifikacemi (§11.2) VĚDOMĚ vynechán — appka
 * nemá žádná reálná oznámení k zobrazení (viz AdminTopbar's bell na
 * desktopu, taky jen stub "Zatím žádná oznámení").
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2, ClipboardCheck } from 'lucide-react';

import Avatar from '../../components/ui/Avatar.jsx';
import Card from '../../components/ui/Card.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { cn } from '../../components/ui/cn.js';
import { useAuthStore } from '../../store/authStore.js';
import { eventTypeLabel } from '../../shared/domainConstants.js';
import useTodayPage, { CRISIS_THRESHOLD_DAYS, toDate } from './useTodayPage.js';
import TodayRightRail from './TodayRightRail.jsx';
import TodayQuickActions from './TodayQuickActions.jsx';

const EVENT_BORDER = {
  visit: 'border-module-families',
  meeting: 'border-brand-500',
  deadline: 'border-entity-crisis-text',
  education: 'border-entity-bio-text',
  other: 'border-border-default',
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
        quiet ? 'border-border-subtle py-2.5 shadow-none' : EVENT_BORDER[event.type] ?? EVENT_BORDER.other,
        event.fosterFamilyId && 'hover:bg-surface-muted'
      )}
    >
      <span className="w-14 shrink-0 text-sm font-medium text-ink-500">
        {event.allDay ? '' : formatTime(start)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink-800">{event.title}</p>
        {(familyName || !quiet) && (
          <p className="truncate text-xs text-ink-500">
            {[familyName, !quiet && eventTypeLabel(event.type)].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>
    </button>
  );
}

const UPCOMING_LABEL_KEYS = ['today.upcoming.tomorrow', 'today.upcoming.dayAfterTomorrow'];

export default function TodayPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const {
    loading, error, todayEvents, upcomingByDay, familiesById, waitingTotal, waitingShown, visitsThisWeek,
  } = useTodayPage();

  const firstName = (profile?.displayName ?? profile?.email?.split('@')[0] ?? '').split(' ')[0];
  const now = new Date();
  const greeting = t(greetingKey(now.getHours()));
  const dateLabel = now.toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long' });

  function openFamily(familyId) {
    navigate(`/admin/terenni/${familyId}`);
  }

  function upcomingLabel(index, date) {
    if (index < UPCOMING_LABEL_KEYS.length) return t(UPCOMING_LABEL_KEYS[index]);
    return date.toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-14 text-ink-500">
        <Loader2 size={22} strokeWidth={1.75} className="animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="rounded-xl bg-danger-50 px-4 py-3 text-sm text-danger-700">{error}</div>;
  }

  return (
    <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:gap-8">
      <div className="min-w-0 flex-1 space-y-6">
        <div className="flex items-center gap-3">
          <Avatar name={profile?.displayName ?? profile?.email} size="lg" />
          <div className="min-w-0">
            <h1 className="text-[28px] font-bold leading-tight text-ink-900">
              {t('today.greetingLine', { greeting, name: firstName })}
            </h1>
            <p className="mt-1 text-sm text-ink-500">{dateLabel}</p>
          </div>
        </div>

        <TodayQuickActions />

        <section>
          <h2 className="mb-2.5 text-sm font-semibold text-ink-800">{t('today.toResolve.title')}</h2>
          <EmptyState
            icon={<ClipboardCheck size={26} strokeWidth={1.75} />}
            title={t('today.toResolve.emptyTitle')}
            description={t('today.toResolve.emptyDescription')}
          />
        </section>

        <section>
          <h2 className="mb-2.5 text-sm font-semibold text-ink-800">{t('today.program.title')}</h2>
          {todayEvents.length === 0 ? (
            <Card className="py-8 text-center text-sm text-ink-500">{t('today.program.empty')}</Card>
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
              <h2 className="text-sm font-semibold text-ink-800">{t('today.waiting.title')}</h2>
              {waitingTotal > waitingShown.length && (
                <button type="button" onClick={() => navigate('/admin/terenni')} className="text-xs font-medium text-brand-700 hover:underline">
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
                    'flex items-center justify-between gap-3 rounded-xl border-l-4 bg-white px-4 py-3 text-left shadow-sm hover:bg-surface-muted',
                    days !== null && days > CRISIS_THRESHOLD_DAYS ? 'border-entity-crisis-text' : 'border-warning-500'
                  )}
                >
                  <span className="truncate text-sm font-medium text-ink-800">{family.name}</span>
                  <span className="shrink-0 text-xs text-ink-500">
                    {days === null ? t('today.waiting.neverVisited') : t('today.waiting.daysAgo', { count: days })}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {upcomingByDay.some((d) => d.items.length > 0) && (
          <section>
            <h2 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-ink-400">{t('today.upcoming.title')}</h2>
            <div className="flex flex-col gap-3">
              {upcomingByDay.map(({ date, items }, i) => (
                items.length > 0 && (
                  <div key={date.toDateString()} className="flex flex-col gap-1.5">
                    <p className="text-xs font-medium capitalize text-ink-400">{upcomingLabel(i, date)}</p>
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

      <div className="hidden w-80 shrink-0 xl:block">
        <TodayRightRail visitsThisWeek={visitsThisWeek} />
      </div>
    </div>
  );
}
