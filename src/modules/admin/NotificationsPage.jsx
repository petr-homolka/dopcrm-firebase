/**
 * NotificationsPage.jsx (desktop) — plné notifikační centrum (2026-07-13,
 * desktop varianta MobileNotificationsScreen). Seznam posledních oznámení
 * aktuálního uživatele; klik označí přečtené a přejde na cíl, tlačítko
 * označí vše. Renderuje se v běžném AdminLayout (stránkový variant).
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Bell, MessageSquare, FileText, CalendarClock, CheckCheck } from 'lucide-react';
import { cn } from '../../components/ui/cn.js';
import { listMyNotifications, markNotificationRead, markAllNotificationsRead } from '../../services/orgService.js';
import { toDate } from './useTodayPage.js';
import Button from '../../components/ui/Button.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';

const NOTIF_ICON = { message: MessageSquare, document: FileText, visit: CalendarClock };

function notifTime(v) {
  const d = toDate(v);
  return d ? d.toLocaleString('cs-CZ', { day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
}

export default function NotificationsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await listMyNotifications(100)); }
    catch (err) { console.error('[NotificationsPage] Načtení selhalo:', err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function open(n) {
    if (!n.read) {
      try { await markNotificationRead(n.id); setItems((xs) => xs.map((x) => (x.id === n.id ? { ...x, read: true } : x))); } catch { /* ignore */ }
    }
    if (n.link) navigate(n.link);
  }

  async function markAll() {
    try { await markAllNotificationsRead(); setItems((xs) => xs.map((n) => ({ ...n, read: true }))); }
    catch (err) { console.error('[NotificationsPage] markAll:', err); }
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-ink-900">{t('dsk.notif.title', 'Oznámení')}</h1>
        {items.some((n) => !n.read) && (
          <Button variant="secondary" size="sm" onClick={markAll}>
            <CheckCheck size={15} strokeWidth={1.75} /> {t('dsk.notif.markAll', 'Označit vše jako přečtené')}
          </Button>
        )}
      </div>

      {loading && <p className="py-10 text-center text-sm text-ink-400">{t('dsk.common.loading', 'Načítám…')}</p>}

      {!loading && items.length === 0 && (
        <div className="rounded-xl border border-border-subtle bg-white shadow-sm">
          <EmptyState icon={<Bell size={28} strokeWidth={1.5} />} title={t('dsk.notif.emptyTitle', 'Žádná oznámení')} description={t('dsk.notif.emptyDesc', 'Nové zprávy, dokumenty ke schválení a upozornění se objeví tady.')} />
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border-subtle bg-white shadow-sm">
          {items.map((n, i) => {
            const Icon = NOTIF_ICON[n.type] ?? Bell;
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => open(n)}
                className={cn('flex w-full items-start gap-3 px-4 py-3.5 text-left hover:bg-surface-muted', i > 0 && 'border-t border-border-subtle', !n.read && 'bg-surface-tint/50')}
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                  <Icon size={16} strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-ink-900">{n.title}</p>
                    {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />}
                  </div>
                  {n.body && <p className="mt-0.5 text-sm text-ink-600">{n.body}</p>}
                  <p className="mt-0.5 text-xs text-ink-400">{notifTime(n.createdAt)}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
