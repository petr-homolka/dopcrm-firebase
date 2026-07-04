/**
 * useTodayPage.js — data pro obrazovku Dnes (Krok 3a redesignu, DESIGN.md §6.1).
 * Domovská stránka klíčové osoby na "/": dnešní program, rodiny čekající na
 * návštěvu (lastVisitAt > 45 dní), nejbližší 3 dny, statistika týdne. Max 25
 * rodin na KO (CLAUDE.md) → filtrování/řazení "čeká na vás" klidně na
 * klientovi, žádná potřeba dalšího indexu/stránkování.
 */

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore.js';
import { listEventsForAssignee, listFostersAssignedTo } from '../../services/orgService.js';

export const WAITING_THRESHOLD_DAYS = 45;
export const CRISIS_THRESHOLD_DAYS = 60;
const MAX_WAITING_SHOWN = 3;
const UPCOMING_DAYS = 3;

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

/** Pondělní týden (ISO) — pro statistiku "návštěvy tento týden" v right railu. */
function startOfWeek(d) {
  const x = startOfDay(d);
  const day = x.getDay();
  return addDays(x, day === 0 ? -6 : 1 - day);
}

export function toDate(value) {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function daysSince(date) {
  return Math.floor((Date.now() - date.getTime()) / 86400000);
}

export default function useTodayPage() {
  const { t } = useTranslation();
  const { organizationId, currentUser } = useAuthStore();
  const uid = currentUser?.uid;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [todayEvents, setTodayEvents] = useState([]);
  const [upcomingByDay, setUpcomingByDay] = useState([]);
  const [waitingFamilies, setWaitingFamilies] = useState([]);
  const [familiesById, setFamiliesById] = useState({});
  const [visitsThisWeek, setVisitsThisWeek] = useState(0);

  const load = useCallback(async () => {
    if (!organizationId || !uid) { setLoading(false); return; }
    setLoading(true);
    setError('');
    try {
      const today = startOfDay(new Date());
      const dayBoundaries = Array.from({ length: UPCOMING_DAYS + 1 }, (_, i) => addDays(today, i));
      const rangeEnd = new Date(addDays(today, UPCOMING_DAYS + 1).getTime() - 1);
      const weekStart = startOfWeek(today);
      const weekEnd = new Date(addDays(weekStart, 7).getTime() - 1);

      const [events, families, weekEvents] = await Promise.all([
        listEventsForAssignee(organizationId, uid, { from: today, to: rangeEnd }),
        listFostersAssignedTo(uid, organizationId),
        listEventsForAssignee(organizationId, uid, { from: weekStart, to: weekEnd }),
      ]);

      const byDay = Array.from({ length: UPCOMING_DAYS + 1 }, () => []);
      events.forEach((ev) => {
        const start = toDate(ev.start);
        if (!start) return;
        const dayIndex = dayBoundaries.findIndex((d, i) => start >= d && (i === UPCOMING_DAYS || start < dayBoundaries[i + 1]));
        if (dayIndex >= 0) byDay[dayIndex].push(ev);
      });

      const byId = Object.fromEntries(families.map((f) => [f.id, f]));

      const waiting = families
        .map((f) => {
          const last = toDate(f.lastVisitAt);
          return { family: f, days: last ? daysSince(last) : null };
        })
        .filter((x) => x.days === null || x.days > WAITING_THRESHOLD_DAYS)
        .sort((a, b) => (b.days ?? Infinity) - (a.days ?? Infinity));

      setTodayEvents(byDay[0]);
      setUpcomingByDay(dayBoundaries.slice(1).map((date, i) => ({ date, items: byDay[i + 1] })));
      setWaitingFamilies(waiting);
      setFamiliesById(byId);
      setVisitsThisWeek(weekEvents.filter((e) => e.type === 'visit').length);
    } catch (err) {
      console.error('[useTodayPage] Načtení selhalo:', err);
      setError(err.message ?? t('today.loadError'));
    } finally {
      setLoading(false);
    }
  }, [organizationId, uid, t]);

  useEffect(() => { load(); }, [load]);

  return {
    loading, error, todayEvents, upcomingByDay, familiesById, visitsThisWeek,
    waitingTotal: waitingFamilies.length,
    waitingShown: waitingFamilies.slice(0, MAX_WAITING_SHOWN),
  };
}
