/**
 * AdminSidebar.jsx — levá navigace (Connecteam redesign + rail 2026-07-13).
 * SBALITELNÁ: výchozí stav = úzký 64px ikonový RAIL (jen ikony + tooltip),
 * rozbalení na 240px s popisky. Uvolňuje místo detailu profilu (vzor: rail
 * z desktopového prototypu — logo, ikony modulů, dole toggle + Nastavení,
 * aktivní stav levým proužkem). Stav se pamatuje v localStorage.
 *
 * DESKTOP POUZE — mobil má samostatný `src/mobile/MobileShell.jsx` (spodní
 * tab bar). `AdminLayout.jsx` rozhoduje, který layout se vykreslí.
 */

import React, { useState, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, Users, Calendar, LineChart, Building2, Settings,
  ListChecks, GraduationCap, Landmark, PanelLeftClose, PanelLeftOpen,
} from 'lucide-react';
import { cn } from '../../components/ui/cn.js';
import { useAuthStore } from '../../store/authStore.js';

const STORE_KEY = 'dop.sidebar.collapsed';

const MODULE_META = {
  today: { label: 'Dnes', icon: LayoutDashboard, colorClass: 'bg-module-today' },
  families: { label: 'Moje rodiny', icon: Users, colorClass: 'bg-module-families' },
  calendar: { label: 'Kalendář', icon: Calendar, colorClass: 'bg-module-calendar' },
  tasks: { label: 'Úkoly', icon: ListChecks, colorClass: 'bg-module-timeline' },
  education: { label: 'Vzdělávání', icon: GraduationCap, colorClass: 'bg-module-documents' },
  institutions: { label: 'Ostatní', icon: Landmark, colorClass: 'bg-module-allowances' },
  team: { label: 'Tým', icon: LineChart, colorClass: 'bg-module-team' },
  organization: { label: 'Organizace', icon: Building2, colorClass: 'bg-module-today' },
  admin: { label: 'Organizace', icon: Settings, colorClass: 'bg-module-admin' },
};

function navItemsForRole(role) {
  switch (role) {
    case 'klicova_osoba': return ['today', 'families', 'calendar', 'tasks', 'education', 'institutions'];
    case 'org_admin': return ['organization', 'calendar', 'tasks', 'education', 'institutions'];
    case 'vedouci_pobocky':
    case 'teamleader': return ['team', 'calendar', 'tasks', 'education', 'institutions'];
    case 'superadmin': return ['admin'];
    default: return [];
  }
}

const PATH_FOR_KEY = {
  today: '/', families: '/admin/terenni', calendar: '/kalendar',
  tasks: '/admin/ukoly', education: '/admin/vzdelavani', institutions: '/admin/instituce',
  team: '/admin/tym', organization: '/admin/organizace', admin: '/admin/superadmin',
};
const EXACT = new Set(['/']);

function readCollapsed() {
  try {
    const v = localStorage.getItem(STORE_KEY);
    return v === null ? true : v === '1';
  } catch { return true; }
}

function NavItem({ itemKey, collapsed }) {
  const { t } = useTranslation();
  const meta = MODULE_META[itemKey];
  const Icon = meta.icon;
  const to = PATH_FOR_KEY[itemKey];
  const label = t(`dsk.nav.${itemKey}`, meta.label);
  return (
    <NavLink
      to={to}
      end={EXACT.has(to)}
      title={collapsed ? label : undefined}
      className={({ isActive }) => cn(
        'relative flex h-10 items-center rounded-lg text-sm font-medium transition-colors',
        collapsed ? 'w-10 justify-center' : 'gap-3 pl-[11px] pr-3',
        isActive
          ? cn(
              'bg-surface-tint font-semibold text-brand-700',
              'before:absolute before:left-0 before:top-1/2 before:h-6 before:w-[3px]',
              'before:-translate-y-1/2 before:rounded-r before:bg-brand-500',
              collapsed && 'before:-left-3'
            )
          : 'text-ink-800 hover:bg-surface-muted'
      )}
    >
      <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-md', meta.colorClass)}>
        <Icon className="h-3.5 w-3.5 text-white" strokeWidth={2} />
      </span>
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );
}

function SidebarContent({ collapsed, onToggle }) {
  const { t } = useTranslation();
  const { role } = useAuthStore();
  const items = navItemsForRole(role);
  const settingsLabel = t('dsk.nav.settings', 'Nastavení');

  return (
    <div className="flex h-full flex-col">
      <div className={cn('flex h-16 items-center border-b border-border-subtle', collapsed ? 'justify-center px-2' : 'gap-2.5 px-4')}>
        <NavLink to="/" title="Doprovázení" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-base font-bold text-white shadow-sm">
          D
        </NavLink>
        {!collapsed && (
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold leading-tight text-ink-900">Doprovázení</span>
            <span className="block truncate text-[11px] leading-tight text-ink-400">{t('dsk.nav.tagline', 'CRM pěstounské péče')}</span>
          </span>
        )}
      </div>

      <nav className={cn('flex-1 overflow-y-auto py-3', collapsed ? 'flex flex-col items-center px-2' : 'px-3')}>
        {!collapsed && (
          <p className="mb-1 px-3 pt-2 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
            {t('dsk.nav.workspace', 'Pracovní prostor')}
          </p>
        )}
        <div className={cn('space-y-0.5', collapsed && 'flex flex-col items-center')}>
          {items.map((key) => <NavItem key={key} itemKey={key} collapsed={collapsed} />)}
        </div>
      </nav>

      <div className={cn('flex flex-col gap-0.5 border-t border-border-subtle py-3', collapsed ? 'items-center px-2' : 'px-3')}>
        <NavLink
          to="/nastaveni"
          title={collapsed ? settingsLabel : undefined}
          className={({ isActive }) => cn(
            'flex h-10 items-center rounded-lg text-sm font-medium transition-colors',
            collapsed ? 'w-10 justify-center' : 'gap-3 pl-[11px] pr-3',
            isActive ? 'bg-surface-tint font-semibold text-brand-700' : 'text-ink-700 hover:bg-surface-muted'
          )}
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-module-admin">
            <Settings className="h-3.5 w-3.5 text-white" strokeWidth={2} />
          </span>
          {!collapsed && <span>{settingsLabel}</span>}
        </NavLink>

        <button
          type="button"
          onClick={onToggle}
          title={collapsed ? t('dsk.nav.expand', 'Rozbalit menu') : t('dsk.nav.collapse', 'Sbalit menu')}
          className={cn(
            'flex h-10 items-center rounded-lg text-sm font-medium text-ink-500 transition-colors hover:bg-surface-muted',
            collapsed ? 'w-10 justify-center' : 'gap-3 px-3'
          )}
        >
          {collapsed
            ? <PanelLeftOpen size={20} strokeWidth={1.75} />
            : <><PanelLeftClose size={20} strokeWidth={1.75} /><span>{t('dsk.nav.collapse', 'Sbalit menu')}</span></>}
        </button>
      </div>
    </div>
  );
}

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(readCollapsed);

  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try { localStorage.setItem(STORE_KEY, next ? '1' : '0'); } catch { /* ignore */ }
      return next;
    });
  }, []);

  return (
    <aside className={cn('hidden shrink-0 border-r border-border-default bg-surface-sidebar transition-[width] duration-200 lg:block', collapsed ? 'w-16' : 'w-60')}>
      <SidebarContent collapsed={collapsed} onToggle={toggle} />
    </aside>
  );
}
