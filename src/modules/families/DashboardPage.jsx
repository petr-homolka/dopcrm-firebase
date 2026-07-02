/**
 * DashboardPage.jsx — Přehled (MVP), Bento Grid layout
 *
 * Vizuální styl: Bento Grid (Apple-style) — modulární karty různých
 * velikostí na 4-sloupcové mřížce (2 na tabletu, 1 na mobilu), hover scale
 * a jemné stíny (Tailwind utility třídy, dle DESIGN.md §4).
 *
 * Načítá data přes dataService.js (tenants/{tenantId}/data_objects):
 *   - počet aktivních rodin (type='family', status='active')
 *   - počet dětí (type='child')
 *   - 5 nejnovějších rodin (seřazeno dle createdAt desc, řazeno na klientovi)
 *
 * Stavy:
 *   - loading  → skeleton dlaždice (žádný fullscreen spinner, dle DESIGN.md §7)
 *   - error    → pastelová chybová karta (např. chybějící tenantId nebo Firestore chyba)
 *   - prázdná data → informativní hláška v kartách i tabulce
 */

import React, { useEffect, useState } from 'react';
import { Users, Baby, PartyPopper, TriangleAlert } from 'lucide-react';

import Card from '../../components/ui/Card.jsx';
import { fetchFamilies, fetchChildren } from '../../services/dataService.js';
import { currentUser } from '../../services/auth.js';
import RecentFamiliesTable from './RecentFamiliesTable.jsx';

// ── Formátování data ─────────────────────────────────────────────

function formatTodayLong() {
  return new Date().toLocaleDateString('cs-CZ', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function firstName(user) {
  const name = user?.displayName ?? user?.email?.split('@')[0] ?? '';
  return name.split(/[\s.]+/)[0] || 'tam';
}

// ── Bento buňka pro statistiku (KPI) ──────────────────────────────

const STAT_TONES = {
  primary: 'bg-primary-50 text-primary-600',
  secondary: 'bg-entity-family-bg text-entity-family-text',
};

function StatCard({ icon: Icon, label, value, tone = 'primary' }) {
  return (
    <Card className="group relative overflow-hidden transition duration-150 hover:shadow-lg hover:scale-[1.01]">
      <div className="flex flex-col gap-1">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${STAT_TONES[tone]}`}
        >
          <Icon size={22} strokeWidth={1.75} />
        </div>
        <p className="mt-1 text-3xl font-semibold leading-tight tabular-nums text-stone-800">
          {value}
        </p>
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">{label}</p>
      </div>
    </Card>
  );
}

// ── Bento buňka — pozdrav / hero dlaždice ─────────────────────────

function GreetingCard() {
  const user = currentUser();
  return (
    <Card className="col-span-1 flex flex-col justify-center gap-1 bg-primary-50 sm:col-span-2">
      <div className="flex items-center gap-2">
        <PartyPopper size={22} className="text-primary-700" strokeWidth={1.75} />
        <h2 className="text-xl font-semibold text-stone-800">Dobrý den, {firstName(user)}</h2>
      </div>
      <p className="capitalize text-sm text-stone-500">{formatTodayLong()}</p>
    </Card>
  );
}

// ── Stavy načítání a chyby ─────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={`h-32 animate-pulse rounded-2xl bg-stone-100 ${
            i === 0 ? 'col-span-1 sm:col-span-2' : ''
          }`}
        />
      ))}
    </div>
  );
}

function ErrorCard({ message }) {
  return (
    <Card className="flex items-center gap-3 bg-red-50">
      <TriangleAlert size={20} className="shrink-0 text-red-700" strokeWidth={1.75} />
      <p className="text-sm text-red-700">{message}</p>
    </Card>
  );
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [families, setFamilies] = useState([]);
  const [childrenCount, setChildrenCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const [familiesData, childrenData] = await Promise.all([
          fetchFamilies({ orderByField: 'createdAt', orderDirection: 'desc' }),
          fetchChildren(),
        ]);
        if (cancelled) return;
        setFamilies(familiesData);
        setChildrenCount(childrenData.length);
      } catch (err) {
        if (cancelled) return;
        console.error('[DashboardPage] Načtení dat selhalo:', err);
        setError(err.message ?? 'Data se nepodařilo načíst.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeFamiliesCount = families.filter((f) => f.status === 'active').length;
  const recentFamilies = families.slice(0, 5);

  return (
    <div>
      <h1 className="mb-0.5 text-xl font-semibold text-stone-800">Přehled</h1>
      <p className="mb-6 text-sm text-stone-500">
        Souhrn aktuálního stavu doprovázených rodin a dětí.
      </p>

      {loading && <LoadingSkeleton />}

      {!loading && error && <ErrorCard message={error} />}

      {!loading && !error && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          <GreetingCard />

          <StatCard icon={Users} label="Aktivní rodiny" value={activeFamiliesCount} tone="primary" />

          <StatCard icon={Baby} label="Děti v péči" value={childrenCount} tone="secondary" />

          <RecentFamiliesTable families={recentFamilies} />
        </div>
      )}
    </div>
  );
}
