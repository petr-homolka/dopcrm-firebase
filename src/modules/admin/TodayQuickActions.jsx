/**
 * TodayQuickActions.jsx — rychlé akce na obrazovce Dnes, vytaženo z
 * TodayPage.jsx (CLAUDE.md limit 300 řádků). DESKTOP POUZE od STRICT UI/UX
 * DESIGN MANDATE (2026-07-05) — mobil má vlastní `src/mobile/screens/
 * MobileHomeScreen.jsx` se dvěma rounded-2xl dlaždicemi, žádné `lg:`
 * mixování tady. `primary`/stub rozlišení zůstává (jen „Naplánovat
 * návštěvu" je skutečně funkční, zbytek `toast.info` stuby).
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UserPlus, CalendarPlus, Megaphone, FileText } from 'lucide-react';
import { toast } from '../../store/toastStore.js';

function QuickActionButton({ icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-9 shrink-0 items-center gap-2 rounded-full border border-brand-200 px-4 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
    >
      <Icon size={16} strokeWidth={1.75} />
      {label}
    </button>
  );
}

export default function TodayQuickActions() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const actions = [
    { icon: UserPlus, label: t('today.quickActions.addFamily'), onClick: () => toast.info(t('today.quickActions.notAvailable')) },
    { icon: CalendarPlus, label: t('today.quickActions.scheduleVisit'), onClick: () => navigate('/kalendar') },
    { icon: Megaphone, label: t('today.quickActions.sendAnnouncement'), onClick: () => toast.info(t('today.quickActions.announcementsNotAvailable')) },
    { icon: FileText, label: t('today.quickActions.fillReport'), onClick: () => toast.info(t('today.quickActions.reportsNotAvailable')) },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((a) => <QuickActionButton key={a.label} {...a} />)}
    </div>
  );
}
