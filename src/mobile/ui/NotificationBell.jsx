/**
 * NotificationBell.jsx — zvonek s odznakem počtu nepřečtených (2026-07-06).
 * Klepnutí otevře notifikační centrum (/oznameni). Počet se načte při
 * připojení a při každém návratu appky do popředí (visibilitychange) —
 * bez realtime subscription (jednoduché, stačí pro odznak).
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bell } from 'lucide-react';
import { countUnread } from '../../services/orgService.js';

export default function NotificationBell({ tone = 'default' }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [count, setCount] = useState(0);

  const refresh = useCallback(() => {
    countUnread().then(setCount).catch(() => {});
  }, []);

  useEffect(() => {
    refresh();
    const onVis = () => { if (document.visibilityState === 'visible') refresh(); };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [refresh]);

  const iconColor = tone === 'hero' ? 'text-white' : 'text-native-text';

  return (
    <button
      type="button"
      onClick={() => navigate('/oznameni')}
      aria-label={count > 0 ? t('m.notif.bellWithCount', 'Oznámení ({{count}} nepřečtených)', { count }) : t('m.notif.bell', 'Oznámení')}
      className="relative flex h-10 w-10 items-center justify-center"
    >
      <Bell size={22} strokeWidth={2} className={iconColor} />
      {count > 0 && (
        <span className="absolute right-1 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-native-danger px-1 text-[10px] font-bold leading-none text-white">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  );
}
