/**
 * AdminTopbar.jsx — topbar dle DESIGN.md §4.3 (Connecteam redesign, Krok 2).
 * DESKTOP POUZE — mobil má od STRICT UI/UX DESIGN MANDATE (2026-07-05)
 * úplně samostatný layout (`src/mobile/MobileShell.jsx` + `MobileTopNav.jsx`
 * per obrazovka), avatar dropdown nahrazuje `src/mobile/screens/
 * MobileProfileScreen.jsx` (tab „Profil").
 *
 * Global search je zatím JEN rodiny (zadání Kroku 2) — přes existující
 * `listFostersByOrg`/`listFostersAssignedTo`, klientský filtr podle jména
 * (žádný dedikovaný search index zatím neexistuje). Zvonek zatím prázdný,
 * "?" nápověda zatím jen toast (help drawer §5.13 není v rozsahu Kroku 2).
 */

import React, { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, HelpCircle, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import { signOut, roleLabel } from '../../services/orgAuth.js';
import { listFostersByOrg, listFostersAssignedTo } from '../../services/orgService.js';
import { toast } from '../../store/toastStore.js';

function initials(user) {
  if (!user) return '?';
  const name = user.displayName ?? user.email ?? '';
  return name.split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('') || '?';
}

export default function AdminTopbar({ title }) {
  const navigate = useNavigate();
  const { currentUser, role, organizationId } = useAuthStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const searchTimer = useRef(null);

  const runSearch = useCallback(async (q) => {
    if (!q.trim() || !organizationId) { setResults([]); return; }
    try {
      const families = role === 'klicova_osoba'
        ? await listFostersAssignedTo(currentUser.uid, organizationId)
        : await listFostersByOrg(organizationId);
      const needle = q.trim().toLowerCase();
      setResults(families.filter((f) => f.name?.toLowerCase().includes(needle)).slice(0, 8));
    } catch (err) {
      console.error('[AdminTopbar] Hledání rodin selhalo:', err);
      setResults([]);
    }
  }, [organizationId, role, currentUser]);

  function handleSearchChange(e) {
    const q = e.target.value;
    setQuery(q);
    setSearchOpen(true);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => runSearch(q), 300);
  }

  function openFamily(familyId) {
    setSearchOpen(false);
    setQuery('');
    navigate(`/admin/terenni/${familyId}`);
  }

  async function handleSignOut() {
    await signOut();
    navigate('/login', { replace: true });
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border-default bg-white px-4 lg:px-6">
      <div className="relative w-full max-w-[400px]">
        <Search size={16} strokeWidth={1.75} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
        <input
          value={query}
          onChange={handleSearchChange}
          onFocus={() => setSearchOpen(true)}
          onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
          placeholder="Hledat rodiny…"
          className="h-10 w-full rounded-lg border-none bg-surface-canvas pl-9 pr-3 text-sm text-ink-800 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
        {searchOpen && query.trim() && (
          <div className="absolute left-0 right-0 top-11 z-40 max-h-80 overflow-y-auto rounded-xl border border-border-subtle bg-white py-1.5 shadow-lg">
            {results.length === 0 ? (
              <p className="px-3.5 py-2.5 text-sm text-ink-400">Žádné rodiny neodpovídají hledání.</p>
            ) : (
              results.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onMouseDown={() => openFamily(f.id)}
                  className="block w-full px-3.5 py-2 text-left text-sm text-ink-800 hover:bg-surface-muted"
                >
                  {f.name}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="flex-1" />

      {title && <span className="text-sm text-ink-400">{title}</span>}

      {/* Plán/org badge (DESIGN.md §4.3) — zatím statický text, dokud topbar
          nenačítá `organizations/{orgId}.plan`/`.status` (mimo rozsah Kroku 2). */}
      <span className="inline-flex shrink-0 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
        Doprovázející org
      </span>

      <button
        type="button"
        onClick={() => toast.info('Nápověda zatím není k dispozici.')}
        aria-label="Nápověda"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-500 hover:bg-surface-muted"
      >
        <HelpCircle size={18} strokeWidth={1.75} />
      </button>

      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => setBellOpen((v) => !v)}
          aria-label="Notifikace"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-surface-muted"
        >
          <Bell size={18} strokeWidth={1.75} />
        </button>
        {bellOpen && (
          <div className="absolute right-0 top-10 z-40 w-64 rounded-xl border border-border-subtle bg-white p-4 text-sm text-ink-500 shadow-lg">
            Zatím žádná oznámení.
          </div>
        )}
      </div>

      <div className="relative shrink-0">
        <button type="button" onClick={() => setAvatarOpen((v) => !v)} className="flex items-center gap-1 rounded-lg p-1 hover:bg-surface-muted">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700">
            {initials(currentUser)}
          </span>
          <ChevronDown size={14} strokeWidth={1.75} className="text-ink-400" />
        </button>
        {avatarOpen && (
          <div className="absolute right-0 top-11 z-40 w-56 rounded-xl border border-border-subtle bg-white py-1.5 shadow-lg">
            <div className="border-b border-border-subtle px-3.5 py-2.5">
              <p className="truncate text-sm font-medium text-ink-800">{currentUser?.displayName ?? currentUser?.email}</p>
              <p className="text-xs text-ink-400">{roleLabel(role)}</p>
            </div>
            <button
              type="button"
              onClick={() => { setAvatarOpen(false); navigate('/nastaveni'); }}
              className="block w-full px-3.5 py-2 text-left text-sm text-ink-700 hover:bg-surface-muted"
            >
              Nastavení
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="block w-full px-3.5 py-2 text-left text-sm text-danger-600 hover:bg-surface-muted"
            >
              Odhlásit se
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
