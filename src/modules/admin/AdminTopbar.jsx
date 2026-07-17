/**
 * AdminTopbar.jsx — topbar dle DESIGN.md §4.3 (Connecteam redesign).
 * DESKTOP POUZE. Global search je rodiny (klientský filtr); zvonek je napojený
 * na službu `notifications` (odznak, dropdown, proklik). „?" nápověda zatím
 * jen toast (help drawer §5.13 mimo rozsah).
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Bell, HelpCircle, ChevronDown, CheckCheck, MessageSquare, FileText, CalendarClock } from 'lucide-react';
import { cn } from '../../components/ui/cn.js';
import { useAuthStore } from '../../store/authStore.js';
import { signOut, roleLabel } from '../../services/orgAuth.js';
import {
  listFostersByOrg, listFostersAssignedTo,
  listMyNotifications, countUnread, markAllNotificationsRead, markNotificationRead,
} from '../../services/orgService.js';
import { toDate } from './useTodayPage.js';
import { toast } from '../../store/toastStore.js';

const NOTIF_ICON = { message: MessageSquare, document: FileText, visit: CalendarClock };

function initials(user) {
  if (!user) return '?';
  const name = user.displayName ?? user.email ?? '';
  return name.split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('') || '?';
}

function notifTime(v) {
  const d = toDate(v);
  if (!d) return '';
  return d.toLocaleString('cs-CZ', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AdminTopbar({ title }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, role, organizationId } = useAuthStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [notifs, setNotifs] = useState([]);
  const [notifsLoading, setNotifsLoading] = useState(false);
  const searchTimer = useRef(null);

  const refreshUnread = useCallback(() => {
    countUnread().then(setUnread).catch(() => setUnread(0));
  }, []);

  useEffect(() => {
    if (!currentUser) return undefined;
    refreshUnread();
    const id = setInterval(refreshUnread, 60000);
    return () => clearInterval(id);
  }, [currentUser, refreshUnread]);

  async function openBell() {
    const next = !bellOpen;
    setBellOpen(next);
    if (next) {
      setNotifsLoading(true);
      try { setNotifs(await listMyNotifications(20)); }
      catch (err) { console.error('[AdminTopbar] Notifikace:', err); }
      finally { setNotifsLoading(false); }
    }
  }

  async function openNotif(n) {
    setBellOpen(false);
    if (!n.read) {
      try { await markNotificationRead(n.id); refreshUnread(); } catch { /* ignore */ }
    }
    if (n.link) navigate(n.link);
  }

  async function handleMarkAll() {
    try { await markAllNotificationsRead(); setNotifs((xs) => xs.map((n) => ({ ...n, read: true }))); setUnread(0); }
    catch (err) { console.error('[AdminTopbar] markAll:', err); }
  }

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
      <div className="relative w-full max-w-[420px]">
        <Search size={16} strokeWidth={1.75} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
        <input
          value={query}
          onChange={handleSearchChange}
          onFocus={() => setSearchOpen(true)}
          onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
          placeholder={t('dsk.top.searchPlaceholder', 'Hledat rodiny…')}
          className="h-9 w-full rounded-lg border border-transparent bg-surface-canvas pl-9 pr-14 text-sm text-ink-800 placeholder:text-ink-400 focus:border-brand-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-border-default bg-white px-1.5 py-0.5 text-[10px] font-medium text-ink-400 md:block" title={t('dsk.top.globalSearch', 'Globální hledání')}>⌘K</kbd>
        {searchOpen && query.trim() && (
          <div className="absolute left-0 right-0 top-11 z-40 max-h-80 overflow-y-auto rounded-xl border border-border-subtle bg-white py-1.5 shadow-lg">
            {results.length === 0 ? (
              <p className="px-3.5 py-2.5 text-sm text-ink-400">{t('dsk.top.searchEmpty', 'Žádné rodiny neodpovídají hledání.')}</p>
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

      {title && <span className="hidden text-sm text-ink-400 md:inline">{title}</span>}

      <span className="hidden shrink-0 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 sm:inline-flex">
        {t('dsk.top.orgBadge', 'Doprovázející org')}
      </span>

      <button
        type="button"
        onClick={() => toast.info(t('dsk.top.helpToast', 'Nápověda zatím není k dispozici.'))}
        aria-label={t('dsk.top.help', 'Nápověda')}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-500 hover:bg-surface-muted"
      >
        <HelpCircle size={18} strokeWidth={1.75} />
      </button>

      <div className="relative shrink-0">
        <button
          type="button"
          onClick={openBell}
          aria-label={t('dsk.notif.title', 'Oznámení')}
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 hover:bg-surface-muted"
        >
          <Bell size={18} strokeWidth={1.75} />
          {unread > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-500 px-1 text-[10px] font-bold text-white">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
        {bellOpen && (
          <div className="absolute right-0 top-11 z-40 w-80 overflow-hidden rounded-xl border border-border-subtle bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-border-subtle px-4 py-2.5">
              <span className="text-sm font-semibold text-ink-900">{t('dsk.notif.title', 'Oznámení')}</span>
              {notifs.some((n) => !n.read) && (
                <button type="button" onClick={handleMarkAll} className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700">
                  <CheckCheck size={13} strokeWidth={2} /> {t('dsk.notif.markAllShort', 'Označit vše')}
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifsLoading && <p className="px-4 py-6 text-center text-sm text-ink-400">{t('dsk.common.loading', 'Načítám…')}</p>}
              {!notifsLoading && notifs.length === 0 && (
                <p className="px-4 py-8 text-center text-sm text-ink-400">{t('dsk.notif.none', 'Zatím žádná oznámení.')}</p>
              )}
              {!notifsLoading && notifs.map((n) => {
                const Icon = NOTIF_ICON[n.type] ?? Bell;
                return (
                  <button
                    key={n.id}
                    type="button"
                    onMouseDown={() => openNotif(n)}
                    className={cn('flex w-full items-start gap-3 border-b border-border-subtle px-4 py-3 text-left last:border-b-0 hover:bg-surface-muted', !n.read && 'bg-surface-tint/60')}
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                      <Icon size={15} strokeWidth={1.75} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-ink-800">{n.title}</span>
                        {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />}
                      </span>
                      {n.body && <span className="mt-0.5 block truncate text-xs text-ink-500">{n.body}</span>}
                      <span className="mt-0.5 block text-[11px] text-ink-400">{notifTime(n.createdAt)}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onMouseDown={() => { setBellOpen(false); navigate('/oznameni'); }}
              className="block w-full border-t border-border-subtle px-4 py-2.5 text-center text-sm font-medium text-brand-600 hover:bg-surface-muted"
            >
              {t('dsk.notif.showAll', 'Zobrazit vše')}
            </button>
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
              {t('dsk.nav.settings', 'Nastavení')}
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="block w-full px-3.5 py-2 text-left text-sm text-danger-600 hover:bg-surface-muted"
            >
              {t('dsk.top.signOut', 'Odhlásit se')}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
