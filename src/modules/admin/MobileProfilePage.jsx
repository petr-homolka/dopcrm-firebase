/**
 * MobileProfilePage.jsx — Profil tab (DESIGN.md §11.8), cíl posledního
 * tlačítka v `MobileTabBar.jsx`. Hero karta s dekorativním pastelovým
 * pozadím + HRANATÝ avatar (na rozdíl od kulatého `Avatar.jsx` používaného
 * všude jinde — jediné místo, kde Connecteam screenshoty ukazují hranatý
 * tvar, viz §11.9). Pod tím plochý seznam (§11.3): jen položky, které appka
 * skutečně má (Nastavení, Odhlásit se) — „Moje aktivita"/„Osobní údaje"/
 * „Přepnout společnost" z Connecteamu VĚDOMĚ vynechány, nemají zde
 * funkční ekvivalent.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, LogOut, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import { signOut, roleLabel } from '../../services/orgAuth.js';

function initialsOf(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

function ProfileRow({ icon: Icon, label, onClick, danger }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 border-b border-border-subtle px-4 py-3.5 text-left last:border-b-0"
    >
      <Icon size={20} strokeWidth={1.75} className={danger ? 'text-danger-600' : 'text-ink-500'} />
      <span className={danger ? 'flex-1 text-sm font-medium text-danger-600' : 'flex-1 text-sm text-ink-800'}>
        {label}
      </span>
      {!danger && <ChevronRight size={18} strokeWidth={1.75} className="text-ink-300" />}
    </button>
  );
}

export default function MobileProfilePage() {
  const navigate = useNavigate();
  const { currentUser, role } = useAuthStore();
  const name = currentUser?.displayName ?? currentUser?.email ?? '';

  async function handleSignOut() {
    await signOut();
    navigate('/login', { replace: true });
  }

  return (
    <div>
      <div className="relative mb-5 overflow-hidden rounded-2xl border border-border-subtle bg-white p-5">
        <span className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full bg-brand-50" />
        <span className="pointer-events-none absolute right-10 top-16 h-10 w-10 rounded-full bg-entity-bio-bg" />
        <span className="pointer-events-none absolute -right-2 bottom-2 h-14 w-14 rounded-full bg-entity-family-bg" />
        <div className="relative flex items-center gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-500 text-xl font-bold text-white">
            {initialsOf(name)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-lg font-bold text-ink-900">{name}</p>
            <p className="text-sm text-ink-500">{roleLabel(role)}</p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border-subtle bg-white">
        <ProfileRow icon={Settings} label="Nastavení" onClick={() => navigate('/nastaveni')} />
        <ProfileRow icon={LogOut} label="Odhlásit se" onClick={handleSignOut} danger />
      </div>
    </div>
  );
}
