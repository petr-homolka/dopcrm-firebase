/**
 * useCalendarWeek.js — data pro CalendarWeekGrid.jsx (Krok 4a redesignu,
 * DESIGN.md §6.4): koordinátorky (role klicova_osoba) jako řádky, události
 * týdne seskupené po dnech. `listEventsInRange` je celoorganizační dotaz
 * (žádný N+1 per koordinátorka), `listKlicoveOsobyByOrg` jeden dotaz na
 * zaměstnance — stejný vzor jako FosterFamilyTimelineTab.jsx.
 */

import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore.js';
import { listEventsInRange, listKlicoveOsobyByOrg } from '../../services/orgService.js';

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

export function startOfWeek(d) {
  const x = startOfDay(d);
  const day = x.getDay();
  return addDays(x, day === 0 ? -6 : 1 - day);
}

export const UNASSIGNED_ROW = '__unassigned__';

export default function useCalendarWeek(enabled = true) {
  const { organizationId } = useAuthStore();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [employees, setEmployees] = useState([]);
  const [events, setEvents] = useState([]);

  const load = useCallback(async () => {
    if (!organizationId || !enabled) return;
    setLoading(true);
    setError('');
    try {
      const from = weekStart;
      const to = new Date(addDays(weekStart, 7).getTime() - 1);
      const [koList, eventsPage] = await Promise.all([
        listKlicoveOsobyByOrg(organizationId),
        listEventsInRange(organizationId, { from, to }),
      ]);
      setEmployees(koList);
      setEvents(eventsPage.items);
    } catch (err) {
      console.error('[useCalendarWeek] Načtení selhalo:', err);
      setError(err.message ?? 'Týden se nepodařilo načíst.');
    } finally {
      setLoading(false);
    }
  }, [organizationId, weekStart, enabled]);

  useEffect(() => { load(); }, [load]);

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // rowKey -> [7][] events (index = day offset 0..6)
  const rows = new Map();
  const rowKeys = [...employees.map((e) => e.id), UNASSIGNED_ROW];
  rowKeys.forEach((key) => rows.set(key, Array.from({ length: 7 }, () => [])));

  events.forEach((ev) => {
    const start = typeof ev.start?.toDate === 'function' ? ev.start.toDate() : new Date(ev.start);
    const dayIndex = Math.floor((startOfDay(start) - weekStart) / 86400000);
    if (dayIndex < 0 || dayIndex > 6) return;
    const rowKey = employees.some((e) => e.id === ev.assignedTo) ? ev.assignedTo : UNASSIGNED_ROW;
    rows.get(rowKey)[dayIndex].push(ev);
  });

  const unassignedCount = rows.get(UNASSIGNED_ROW).flat().length;

  return {
    loading, error, employees, days, weekStart, rows, unassignedCount,
    goPrevWeek: () => setWeekStart((w) => addDays(w, -7)),
    goNextWeek: () => setWeekStart((w) => addDays(w, 7)),
    goToday: () => setWeekStart(startOfWeek(new Date())),
  };
}
