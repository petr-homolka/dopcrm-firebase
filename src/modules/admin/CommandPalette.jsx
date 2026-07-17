/**
 * CommandPalette.jsx — globální hledání napříč systémem (2026-07-13, vzor:
 * command palette z desktopového prototypu). Otevře se Ctrl/⌘+K odkudkoli,
 * hledá v rodinách a dětech organizace (role-aware), výsledky seskupené,
 * klávesnice (↑/↓/Enter/Esc) i myš. Data se načtou jednou při prvním otevření.
 *
 * DESKTOP POUZE — mountuje se ve `AdminLayout` (desktop větev). Na mobilu je
 * hledání součástí mobilních obrazovek.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Search, Users, Baby, CornerDownLeft } from 'lucide-react';
import { cn } from '../../components/ui/cn.js';
import Avatar from '../../components/ui/Avatar.jsx';
import { useAuthStore } from '../../store/authStore.js';
import { listFostersByOrg, listFostersAssignedTo, listChildrenByOrg } from '../../services/orgService.js';

export default function CommandPalette() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, role, organizationId } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [families, setFamilies] = useState([]);
  const [children, setChildren] = useState([]);
  const [query, setQuery] = useState('');
  const [sel, setSel] = useState(0);
  const inputRef = useRef(null);

  const load = useCallback(async () => {
    if (loaded || !organizationId) return;
    try {
      const [fams, kids] = await Promise.all([
        role === 'klicova_osoba' ? listFostersAssignedTo(currentUser.uid, organizationId) : listFostersByOrg(organizationId),
        listChildrenByOrg(organizationId).catch(() => []),
      ]);
      setFamilies(fams); setChildren(kids); setLoaded(true);
    } catch (err) { console.error('[CommandPalette] Načtení selhalo:', err); }
  }, [loaded, organizationId, role, currentUser]);

  // Globální zkratka Ctrl/⌘+K (a „/" mimo pole) otevře paletu.
  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open) { load(); setSel(0); setTimeout(() => inputRef.current?.focus(), 30); }
    else { setQuery(''); }
  }, [open, load]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const fam = families
      .filter((f) => f.name?.toLowerCase().includes(q))
      .slice(0, 6)
      .map((f) => ({ type: 'family', id: f.id, label: f.name, to: `/admin/terenni/${f.id}` }));
    const kids = children
      .filter((c) => `${c.firstName ?? ''} ${c.lastName ?? ''}`.toLowerCase().includes(q))
      .slice(0, 6)
      .map((c) => ({
        type: 'child', id: c.id,
        label: `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim(),
        to: c.fosterFamilyId ? `/admin/terenni/${c.fosterFamilyId}/deti/${c.id}` : null,
      }))
      .filter((r) => r.to);
    return [...fam, ...kids];
  }, [query, families, children]);

  function go(r) {
    if (!r?.to) return;
    setOpen(false);
    navigate(r.to);
  }

  function onInputKey(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(s + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); go(results[sel]); }
  }

  if (!open) return null;

  const famResults = results.filter((r) => r.type === 'family');
  const kidResults = results.filter((r) => r.type === 'child');

  function row(r, groupIndexOffset) {
    const idx = groupIndexOffset + (r.type === 'family' ? famResults.indexOf(r) : kidResults.indexOf(r));
    const active = idx === sel;
    return (
      <button
        key={`${r.type}-${r.id}`}
        type="button"
        onMouseEnter={() => setSel(idx)}
        onMouseDown={() => go(r)}
        className={cn('flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left', active ? 'bg-surface-tint' : 'hover:bg-surface-muted')}
      >
        <Avatar name={r.label} size="sm" />
        <span className={cn('flex-1 truncate text-sm', active ? 'font-semibold text-brand-700' : 'text-ink-800')}>{r.label}</span>
        {active && <CornerDownLeft size={14} strokeWidth={2} className="text-ink-400" />}
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-[12vh]" onMouseDown={() => setOpen(false)}>
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-border-subtle bg-white shadow-lg" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-border-subtle px-4">
          <Search size={18} strokeWidth={1.75} className="shrink-0 text-ink-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSel(0); }}
            onKeyDown={onInputKey}
            placeholder={t('dsk.search.placeholder', 'Hledat rodiny a děti…')}
            className="h-12 flex-1 bg-transparent text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
          />
          <kbd className="rounded border border-border-default bg-surface-canvas px-1.5 py-0.5 text-[11px] font-medium text-ink-400">Esc</kbd>
        </div>

        <div className="max-h-[52vh] overflow-y-auto p-2">
          {!query.trim() && <p className="px-3 py-8 text-center text-sm text-ink-400">{t('dsk.search.hint', 'Začněte psát — hledá napříč rodinami a dětmi.')}</p>}
          {query.trim() && results.length === 0 && <p className="px-3 py-8 text-center text-sm text-ink-400">{t('dsk.search.empty', 'Nic nenalezeno.')}</p>}
          {famResults.length > 0 && (
            <>
              <p className="flex items-center gap-1.5 px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400"><Users size={12} strokeWidth={2} /> {t('dsk.search.families', 'Rodiny')}</p>
              {famResults.map((r) => row(r, 0))}
            </>
          )}
          {kidResults.length > 0 && (
            <>
              <p className="flex items-center gap-1.5 px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-ink-400"><Baby size={12} strokeWidth={2} /> {t('dsk.search.children', 'Děti')}</p>
              {kidResults.map((r) => row(r, famResults.length))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
