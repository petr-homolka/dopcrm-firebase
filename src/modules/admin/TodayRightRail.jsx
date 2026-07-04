/**
 * TodayRightRail.jsx — pravý sloupec obrazovky Dnes (DESIGN.md §4.5/§6.1).
 * Krok 3a zadání výslovně BEZ QR promo karty (mobilní appka ještě není v
 * obchodech). "Novinky" (org chat) taky vynechány — Interní chat je zatím
 * jen položka roadmapy (docs/INVENTAR.md §12), žádná data k zobrazení.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarCheck } from 'lucide-react';
import Card from '../../components/ui/Card.jsx';

export default function TodayRightRail({ visitsThisWeek }) {
  const { t } = useTranslation();

  return (
    <Card>
      <h2 className="mb-3 text-sm font-semibold text-ink-800">{t('today.stats.title')}</h2>
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-module-calendar/10 text-module-calendar">
          <CalendarCheck size={18} strokeWidth={1.75} />
        </span>
        <div>
          <p className="text-lg font-semibold text-ink-900">{visitsThisWeek}</p>
          <p className="text-xs text-ink-500">{t('today.stats.visitsThisWeek')}</p>
        </div>
      </div>
    </Card>
  );
}
