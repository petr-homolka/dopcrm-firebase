/**
 * Layout.jsx — shell pro starší generické moduly (MVP_NAV: Kalendář,
 * Kontakty…), které běží vedle nového B2B SaaS schématu (viz AdminLayout.jsx).
 * Sidebar max 240px dle DESIGN.md §5.2, mobil = off-canvas panel místo
 * permanentního drawer.
 *
 * Identita/role/odhlášení čte z `useAuthStore` (Sekce B) — dřív z legacy
 * `services/auth.js` (`user_roles/{uid}`), což po odstranění `AuthProvider`
 * (audit nálezu #5, oprava redirect smyčky 2026-07-03) přestalo fungovat.
 */

import React, { useCallback, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Users,
  Baby,
  Building2,
  CalendarDays,
  FileText,
  BookOpen,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

import { signOut } from '../services/orgAuth.js';
import { useAuthStore } from '../store/authStore.js';
import { MVP_NAV } from './navConfig.js';
import { cn } from '../components/ui/cn.js';

const ICON_MAP = {
  grid: LayoutDashboard,
  user: Users,
  child: Baby,
  building: Building2,
  calendar: CalendarDays,
  file: FileText,
  book: BookOpen,
};

const ROLE_LABELS = {
  superadmin: 'SA',
  org_admin: 'OA',
  vedouci_pobocky: 'VP',
  teamleader: 'TL',
  klicova_osoba: 'KO',
  asistent_ko: 'AS',
  zamestnanec: 'ZA',
};

function initials(user) {
  if (!user) return '?';
  const name = user.displayName ?? user.email ?? '';
  return (
    name
      .split(/[\s@.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join('') || '?'
  );
}

const navItemClass = ({ isActive }) =>
  cn(
    'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition',
    isActive ? 'bg-primary-50 text-primary-700' : 'text-stone-700 hover:bg-stone-100'
  );

function SidebarContent({ onNavigate }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser: user, role } = useAuthStore();
  const roleLabel = role ? (ROLE_LABELS[role] ?? role.slice(0, 2).toUpperCase()) : '—';

  const handleSignOut = useCallback(async () => {
    await signOut();
    navigate('/login', { replace: true });
  }, [navigate]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-4 py-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 font-bold text-white">
          D
        </span>
        <span className="truncate font-semibold text-stone-800">{t('nav.brand')}</span>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
        {MVP_NAV.map(({ path, labelKey, icon }) => {
          const ItemIcon = ICON_MAP[icon] ?? FileText;
          return (
            <NavLink key={path} to={path} onClick={onNavigate} className={navItemClass}>
              <ItemIcon size={18} strokeWidth={1.75} />
              {t(labelKey)}
            </NavLink>
          );
        })}
      </nav>

      <div className="space-y-0.5 border-t border-stone-100 px-3 py-2">
        <NavLink to="/nastaveni" onClick={onNavigate} className={navItemClass}>
          <Settings size={18} strokeWidth={1.75} />
          {t('nav.settings')}
        </NavLink>
      </div>

      <div className="flex items-center gap-2.5 border-t border-stone-100 p-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-sm font-semibold text-primary-700">
          {initials(user)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-stone-800">
            {user?.displayName ?? user?.email?.split('@')[0] ?? t('nav.defaultUser')}
          </p>
          <p className="text-xs text-stone-400">{roleLabel}</p>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          aria-label={t('nav.signOut')}
          className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100"
        >
          <LogOut size={18} strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}

export default function Layout() {
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <div className="flex min-h-dvh">
      {/* Topbar — jen na mobilu */}
      <header className="fixed inset-x-0 top-0 z-40 flex items-center gap-3 border-b border-stone-100 bg-white px-4 py-3 md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label={t('nav.openMenu')}
          className="rounded-lg p-1.5 text-stone-600 hover:bg-stone-100"
        >
          <Menu size={22} strokeWidth={1.75} />
        </button>
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white">
          D
        </span>
        <span className="font-semibold text-stone-800">{t('nav.brand')}</span>
      </header>

      {/* Postranní panel — permanentní na desktopu */}
      <aside className="hidden w-60 shrink-0 border-r border-stone-100 bg-white md:block">
        <SidebarContent onNavigate={closeMobile} />
      </aside>

      {/* Off-canvas panel na mobilu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={closeMobile} />
          <div className="absolute inset-y-0 left-0 w-60 bg-white shadow-lg">
            <button
              type="button"
              onClick={closeMobile}
              aria-label={t('nav.closeMenu')}
              className="absolute right-2 top-2 rounded-lg p-1.5 text-stone-500 hover:bg-stone-100"
            >
              <X size={18} strokeWidth={1.75} />
            </button>
            <SidebarContent onNavigate={closeMobile} />
          </div>
        </div>
      )}

      {/* Hlavní obsahová oblast */}
      <main className="min-h-dvh min-w-0 flex-1 bg-stone-50 pt-14 md:pt-0">
        <div className="p-4 sm:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
