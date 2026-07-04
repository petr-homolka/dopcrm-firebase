/**
 * TodayQuickActions.jsx — rychlé akce na obrazovce Dnes, vytaženo z
 * TodayPage.jsx (CLAUDE.md limit 300 řádků). Dva vizuální varianty pro
 * stejné 4 akce: mobil (<lg) 2×2 pill dlaždice (DESIGN.md §11.2, reálné
 * Connecteam screenshoty 2026-07-04), desktop (lg+) řádek malých obrysových
 * tlačítek (Krok 3a). `primary` dlaždice = jediná skutečně funkční akce
 * (Naplánovat návštěvu) — ostatní tři jsou `toast.info` stuby, odlišené
 * neutrální barvou, ať nepředstírají funkčnost, kterou appka ještě nemá.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UserPlus, CalendarPlus, Megaphone, FileText } from 'lucide-react';
import { cn } from '../../components/ui/cn.js';
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

function QuickActionTile({ icon: Icon, label, onClick, primary }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-2.5 rounded-2xl px-4 py-4 text-left transition',
        primary ? 'bg-brand-50 text-brand-700' : 'bg-surface-muted text-ink-700'
      )}
    >
      <Icon size={20} strokeWidth={1.75} className="shrink-0" />
      <span className="text-sm font-semibold leading-tight">{label}</span>
    </button>
  );
}

export default function TodayQuickActions() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const actions = [
    { icon: UserPlus, label: t('today.quickActions.addFamily'), onClick: () => toast.info(t('today.quickActions.notAvailable')) },
    { icon: CalendarPlus, label: t('today.quickActions.scheduleVisit'), onClick: () => navigate('/kalendar'), primary: true },
    { icon: Megaphone, label: t('today.quickActions.sendAnnouncement'), onClick: () => toast.info(t('today.quickActions.announcementsNotAvailable')) },
    { icon: FileText, label: t('today.quickActions.fillReport'), onClick: () => toast.info(t('today.quickActions.reportsNotAvailable')) },
  ];

  return (
    <>
      <div className="grid grid-cols-2 gap-3 lg:hidden">
        {actions.map((a) => <QuickActionTile key={a.label} {...a} />)}
      </div>
      <div className="hidden flex-wrap gap-2 lg:flex">
        {actions.map((a) => <QuickActionButton key={a.label} {...a} />)}
      </div>
    </>
  );
}
