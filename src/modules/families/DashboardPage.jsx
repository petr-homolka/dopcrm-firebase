/**
 * DashboardPage.jsx — Přehled (`/prehled`), Bento Grid layout
 *
 * Přepsáno na Sekci B (audit nálezu #5, 2026-07-03) — dřív četlo přes
 * `dataService.js` (Sekce A, `tenants/{tenantId}/data_objects`), což bylo
 * ŽIVĚ ROZBITÉ pro každého uživatele nového B2B schématu (currentTenantId()
 * je vždy null, protože noví uživatelé nemají `user_roles/{uid}`).
 *
 * `/prehled` je dnes dosažitelné jen: (a) přímou navigací uživatele s rolí
 * (org_admin/klicova_osoba), nebo (b) jako fallback z `IndexRedirect` pro
 * účet BEZ role v novém schématu (legacy/osiřelý účet — pro ten Sekce B
 * nemá co zobrazit, viz `EmptyState` níže). Superadmin nemá organizaci
 * (`organizationId` vždy null) — přesměruje se na svůj vlastní dashboard.
 *
 * Vizuální styl: Bento Grid (Apple-style), Tailwind dle DESIGN.md §4.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Users, Baby, PartyPopper, TriangleAlert, Building2 } from 'lucide-react';

import Card from '../../components/ui/Card.jsx';
import { useAuthStore } from '../../store/authStore.js';
import { dashboardPathForRole } from '../../services/orgAuth.js';
import { listFostersByOrg, listFostersAssignedTo, listChildrenByOrg, listChildrenByFamily } from '../../services/orgService.js';
import RecentFamiliesTable from './RecentFamiliesTable.jsx';

function formatTodayLong() {
  return new Date().toLocaleDateString('cs-CZ', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function firstName(user) {
  const name = user?.displayName ?? user?.email?.split('@')[0] ?? '';
  return name.split(/[\s.]+/)[0] || 'tam';
}

const STAT_TONES = {
  primary: 'bg-primary-50 text-primary-600',
  secondary: 'bg-entity-family-bg text-entity-family-text',
};

function StatCard({ icon: Icon, label, value, tone = 'primary' }) {
  return (
    <Card className="group relative overflow-hidden transition duration-150 hover:shadow-lg hover:scale-[1.01]">
      <div className="flex flex-col gap-1">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${STAT_TONES[tone]}`}>
          <Icon size={22} strokeWidth={1.75} />
        </div>
        <p className="mt-1 text-3xl font-semibold leading-tight tabular-nums text-stone-800">{value}</p>
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">{label}</p>
      </div>
    </Card>
  );
}

function GreetingCard({ user }) {
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

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className={`h-32 animate-pulse rounded-2xl bg-stone-100 ${i === 0 ? 'col-span-1 sm:col-span-2' : ''}`} />
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

function NoOrganizationCard() {
  return (
    <Card className="flex flex-col items-center gap-2 py-10 text-center">
      <Building2 size={28} className="text-stone-400" strokeWidth={1.75} />
      <h2 className="text-base font-semibold text-stone-800">Účet nemá organizaci</h2>
      <p className="max-w-sm text-sm text-stone-500">
        Tento účet nemá v systému přiřazenou organizaci. Pokud jde o omyl, kontaktujte správce;
        pokud teprve začínáte, založte si organizaci na stránce registrace.
      </p>
    </Card>
  );
}

export default function DashboardPage() {
  const { loading: authLoading, currentUser, role, organizationId } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [families, setFamilies] = useState([]);
  const [childrenCount, setChildrenCount] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      let familiesData;
      let count;
      if (role === 'klicova_osoba') {
        familiesData = await listFostersAssignedTo(currentUser.uid);
        const perFamily = await Promise.all(familiesData.map((f) => listChildrenByFamily(f.id, organizationId)));
        count = perFamily.reduce((sum, list) => sum + list.length, 0);
      } else {
        familiesData = await listFostersByOrg(organizationId);
        count = (await listChildrenByOrg(organizationId)).length;
      }
      familiesData.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
      setFamilies(familiesData);
      setChildrenCount(count);
    } catch (err) {
      console.error('[DashboardPage] Načtení dat selhalo:', err);
      setError(err.message ?? 'Data se nepodařilo načíst.');
    } finally {
      setLoading(false);
    }
  }, [role, organizationId, currentUser]);

  useEffect(() => {
    if (organizationId) load();
  }, [organizationId, load]);

  if (authLoading) return <LoadingSkeleton />;
  if (role === 'superadmin') return <Navigate to={dashboardPathForRole(role)} replace />;
  if (!organizationId) return <NoOrganizationCard />;

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
          <GreetingCard user={currentUser} />
          <StatCard icon={Users} label="Aktivní rodiny" value={activeFamiliesCount} tone="primary" />
          <StatCard icon={Baby} label="Děti v péči" value={childrenCount} tone="secondary" />
          <RecentFamiliesTable families={recentFamilies} />
        </div>
      )}
    </div>
  );
}
