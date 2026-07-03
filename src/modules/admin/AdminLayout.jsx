/**
 * AdminLayout.jsx — jednoduchý shell pro nové B2B SaaS dashboardy
 * (SuperAdmin / OrgAdmin / Klíčová osoba)
 *
 * Záměrně NENÍ sdílený se starým core/Layout.jsx (ten patří legacy
 * user_roles modulům s vlastní sidebar navigací MVP_NAV). Tyhle tři
 * dashboardy mají odlišnou hierarchii (napříč organizacemi u superadmina)
 * a jednodušší topbar postačí — bez zbytečné vazby na starou navigaci.
 */

import React, { useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

import { useAuthStore } from '../../store/authStore.js';
import { signOut } from '../../services/orgAuth.js';
import Badge from '../../components/ui/Badge.jsx';

const ROLE_LABELS = {
  superadmin: 'SaaS Superadmin',
  org_admin: 'Org. Admin',
  vedouci_pobocky: 'Vedoucí pobočky',
  teamleader: 'Teamleader',
  klicova_osoba: 'Klíčová osoba',
};

export default function AdminLayout({ title }) {
  const navigate = useNavigate();
  const { currentUser, role } = useAuthStore();

  const handleSignOut = useCallback(async () => {
    await signOut();
    navigate('/login', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-dvh bg-stone-50">
      <header className="sticky top-0 z-30 border-b border-stone-100 bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3 sm:px-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 font-bold text-white">
            D
          </span>
          <span className="mr-1 font-semibold text-stone-800">Doprovázení.com</span>
          {title && <span className="hidden text-sm text-stone-400 sm:block">/ {title}</span>}
          <div className="flex-1" />
          <Badge tone="neutral" className="mr-1">
            {ROLE_LABELS[role] ?? role ?? '—'}
          </Badge>
          <span className="hidden text-sm text-stone-500 sm:block">
            {currentUser?.displayName ?? currentUser?.email}
          </span>
          <button
            type="button"
            onClick={handleSignOut}
            aria-label="Odhlásit se"
            className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100"
          >
            <LogOut size={18} strokeWidth={1.75} />
          </button>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 sm:py-8">
        <Outlet />
      </div>
    </div>
  );
}
