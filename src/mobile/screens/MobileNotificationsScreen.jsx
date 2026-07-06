/**
 * MobileNotificationsScreen.jsx — notifikační centrum (2026-07-06,
 * docs/domain/chat-a-pestounska-appka.md). Seznam notifikací uživatele,
 * klepnutí označí přečtené a přejde na cíl (link). „Označit vše" nahoře.
 * Sdílené všemi rolemi (KO/vedení i pěstoun).
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, MessageSquare, FileText, CalendarClock } from 'lucide-react';
import { cn } from '../../components/ui/cn.js';
import { listMyNotifications, markNotificationRead, markAllNotificationsRead } from '../../services/orgService.js';
import { toDate } from '../../modules/admin/useTodayPage.js';
import MobileTopNav from '../ui/MobileTopNav.jsx';
import { NativeEmptyState } from '../ui/NativeBits.jsx';

const TYPE_ICON = { message: MessageSquare, document: FileText, visit: CalendarClock };

function timeLabel(v) {
  const d = toDate(v);
  return d ? d.toLocaleString('cs-CZ', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
}

export default function MobileNotificationsScreen() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await listMyNotifications());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function openItem(n) {
    if (!n.read) await markNotificationRead(n.id).catch(() => {});
    if (n.link) navigate(n.link);
    else load();
  }

  async function markAll() {
    await markAllNotificationsRead().catch(() => {});
    load();
  }

  const hasUnread = items.some((n) => !n.read);

  return (
    <div>
      <MobileTopNav
        title="Oznámení"
        onBack={() => navigate(-1)}
        right={hasUnread ? (
          <button type="button" onClick={markAll} className="text-[13px] font-medium text-native-primary">Označit vše</button>
        ) : null}
      />

      {loading && <p className="py-16 text-center text-[15px] text-native-textMuted">Načítám…</p>}

      {!loading && items.length === 0 && (
        <div className="mx-4 mt-6">
          <NativeEmptyState icon={Bell} title="Žádná oznámení" description="Nové zprávy a upozornění se objeví tady." />
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="mx-4 mt-3 overflow-hidden rounded-native-card bg-native-surface">
          {items.map((n, i) => {
            const Icon = TYPE_ICON[n.type] ?? Bell;
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => openItem(n)}
                className={cn('flex w-full items-start gap-3 px-4 py-3.5 text-left active:bg-native-bg', i > 0 && 'border-t border-native-separator')}
              >
                <span className={cn('mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full', n.read ? 'bg-native-textMuted/10 text-native-textMuted' : 'bg-native-primary/10 text-native-primary')}>
                  <Icon size={18} strokeWidth={2} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className={cn('text-[15px]', n.read ? 'text-native-text' : 'font-semibold text-native-text')}>{n.title}</p>
                  {n.body && <p className="truncate text-[13px] text-native-textMuted">{n.body}</p>}
                  <p className="mt-0.5 text-[12px] text-native-textMuted">{timeLabel(n.createdAt)}</p>
                </div>
                {!n.read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-native-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
