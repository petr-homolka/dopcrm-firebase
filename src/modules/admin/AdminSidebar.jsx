/**
 * AdminSidebar.jsx — sidebar dle DESIGN.md §4.2 (Connecteam redesign, Krok 2).
 * Barevné module dlaždice + sekce "PRACOVNÍ PROSTOR". Odkazuje POUZE na
 * routy, které appka dnes skutečně má pro danou roli — Krok 2 mění chrome/
 * layout, ne funkční rozsah (dlaždice pro Osu/Dokumenty/Čerpání jako
 * samostatné moduly čekají na `docs/INVENTAR.md` §12 roadmapu).
 *
 * DESKTOP POUZE (lg+) — mobil má od redesignu dle skutečných Connecteam
 * screenshotů (DESIGN.md §11.1) `MobileTabBar.jsx` dole, ne hamburger +
 * tento sidebar jako výsuvný drawer.
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, LineChart, Building2, Settings } from 'lucide-react';
import { cn } from '../../components/ui/cn.js';
import { useAuthStore } from '../../store/authStore.js';

const MODULE_META = {
  today: { label: 'Dnes', icon: LayoutDashboard, colorClass: 'bg-module-today' },
  families: { label: 'Moje rodiny', icon: Users, colorClass: 'bg-module-families' },
  calendar: { label: 'Kalendář', icon: Calendar, colorClass: 'bg-module-calendar' },
  team: { label: 'Tým', icon: LineChart, colorClass: 'bg-module-team' },
  organization: { label: 'Organizace', icon: Building2, colorClass: 'bg-module-today' },
  admin: { label: 'Organizace', icon: Settings, colorClass: 'bg-module-admin' },
};

function navItemsForRole(role) {
  switch (role) {
    case 'klicova_osoba':
      return ['today', 'families', 'calendar'];
    case 'org_admin':
      return ['organization', 'calendar'];
    case 'vedouci_pobocky':
    case 'teamleader':
      return ['team', 'calendar'];
    case 'superadmin':
      return ['admin'];
    default:
      return [];
  }
}

const PATH_FOR_KEY = {
  today: '/',
  families: '/admin/terenni',
  calendar: '/kalendar',
  team: '/admin/tym',
  organization: '/admin/organizace',
  admin: '/admin/superadmin',
};

function NavItem({ itemKey }) {
  const meta = MODULE_META[itemKey];
  const Icon = meta.icon;
  return (
    <NavLink
      to={PATH_FOR_KEY[itemKey]}
      end={PATH_FOR_KEY[itemKey] === '/'}
      className={({ isActive }) => cn(
        'relative flex h-10 items-center gap-3 rounded-lg pl-[11px] pr-3 text-sm font-medium transition',
        isActive
          ? cn(
              'bg-surface-tint font-semibold text-brand-700',
              'before:absolute before:left-0 before:top-1/2 before:h-6 before:w-[3px]',
              'before:-translate-y-1/2 before:rounded-r before:bg-brand-500'
            )
          : 'text-ink-800 hover:bg-surface-muted'
      )}
    >
      <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-md', meta.colorClass)}>
        <Icon className="h-3.5 w-3.5 text-white" strokeWidth={2} />
      </span>
      <span className="truncate">{meta.label}</span>
    </NavLink>
  );
}

function SidebarContent() {
  const { role } = useAuthStore();
  const items = navItemsForRole(role);
  const isAdminRole = role === 'org_admin' || role === 'superadmin';

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2.5 border-b border-border-subtle px-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-base font-bold text-white">
          D
        </span>
        <span className="truncate font-semibold text-ink-900">Doprovázení</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3">
        <p className="mb-1 px-3 pt-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
          Pracovní prostor
        </p>
        <div className="space-y-0.5">
          {items.map((key) => <NavItem key={key} itemKey={key} />)}
        </div>

        {isAdminRole && (
          <>
            <p className="mb-1 mt-5 px-3 pt-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
              Administrace
            </p>
            <NavLink
              to="/nastaveni"
              className={({ isActive }) => cn(
                'flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition',
                isActive ? 'bg-surface-tint font-semibold text-brand-700' : 'text-ink-800 hover:bg-surface-muted'
              )}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-module-admin">
                <Settings className="h-3.5 w-3.5 text-white" strokeWidth={2} />
              </span>
              <span>Nastavení</span>
            </NavLink>
          </>
        )}
      </nav>
    </div>
  );
}

export default function AdminSidebar() {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-border-default bg-surface-sidebar lg:block">
      <SidebarContent />
    </aside>
  );
}
