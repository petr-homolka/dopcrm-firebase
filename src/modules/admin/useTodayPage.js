/**
 * useTodayPage.js — data pro obrazovku Dnes (Krok 3, 2026-07-03, DESIGN.md §6.1).
 * Domovská stránka klíčové osoby na "/": dnešní program, rodiny čekající na
 * návštěvu (lastVisitAt > 45 dní), nejbližší dva dny. Max 25 rodin na KO
 * (CLAUDE.md) → filtrování/řazení "čeká na vás" klidně na klientovi, žádná
 * potřeba dalšího indexu/stránkování.
 */

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore.js';
import { listEventsForAssignee, listFostersAssignedTo } from '../../services/orgService.js';

export const WAITING_THRESHOLD_DAYS = 45;
export const CRISIS_THRESHOLD_DAYS = 60;
const MAX_WAITING_SHOWN = 3;

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

  const load = useCallback(async () => {
    if (!organizationId || !uid) { setLoading(false); return; }
    setLoading(true);
    setError('');
    try {
      const today = startOfDay(new Date());
      const tomorrow = addDays(today, 1);
      const dayAfter = addDays(today, 2);
      const rangeEnd = new Date(addDays(today, 3).getTime() - 1);

      const [events, families] = await Promise.all([
        listEventsForAssignee(organizationId, uid, { from: today, to: rangeEnd }),
        listFostersAssignedTo(uid, organizationId),
      ]);

      const todays = [];
      const tomorrows = [];
      const dayAfters = [];
      events.forEach((ev) => {
        const start = toDate(ev.start);
        if (!start) return;
        if (start < tomorrow) todays.push(ev);
        else if (start < dayAfter) tomorrows.push(ev);
        else dayAfters.push(ev);
      });

      const byId = Object.fromEntries(families.map((f) => [f.id, f]));

      const waiting = families
        .map((f) => {
          const last = toDate(f.lastVisitAt);
          return { family: f, days: last ? daysSince(last) : null };
        })
        .filter((x) => x.days === null || x.days > WAITING_THRESHOLD_DAYS)
        .sort((a, b) => (b.days ?? Infinity) - (a.days ?? Infinity));

      setTodayEvents(todays);
      setUpcomingByDay([
        { date: tomorrow, items: tomorrows },
        { date: dayAfter, items: dayAfters },
      ]);
      setWaitingFamilies(waiting);
      setFamiliesById(byId);
    } catch (err) {
      console.error('[useTodayPage] Načtení selhalo:', err);
      setError(err.message ?? t('today.loadError'));
    } finally {
      setLoading(false);
    }
  }, [organizationId, uid, t]);

  useEffect(() => { load(); }, [load]);

  return {
    loading, error, todayEvents, upcomingByDay, familiesById,
    waitingTotal: waitingFamilies.length,
    waitingShown: waitingFamilies.slice(0, MAX_WAITING_SHOWN),
  };
}
