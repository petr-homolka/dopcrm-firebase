/**
 * MobileHomeScreen.jsx — Dnes, čistě mobilní implementace (STRICT UI/UX
 * DESIGN MANDATE, 2026-07-05). Žádná sdílená JSX s desktop TodayPage.jsx —
 * jen datový hook `useTodayPage.js`. Struktura věrně dle Connecteam Home
 * screenshotu: pozdrav bez karty (avatar 56px + text, plátno `native.bg`
 * prosvítá skrz), dvě rounded-native-card dlaždice vedle sebe (NE pill — to je
 * tvar tlačítek, ne dlaždic), pak ploché sekce s native kartami.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CalendarPlus, UserPlus, ClipboardCheck } from 'lucide-react';
import Avatar from '../../components/ui/Avatar.jsx';
import { cn } from '../../components/ui/cn.js';
import { useAuthStore } from '../../store/authStore.js';
import { EVENT_BORDER_CLASS } from '../../shared/domainConstants.js';
import { toast } from '../../store/toastStore.js';
import useTodayPage, { toDate } from '../../modules/admin/useTodayPage.js';
import { SectionLabel, NativeEmptyState, NATIVE_EVENT_BORDER } from '../ui/NativeBits.jsx';

function greetingFor(hour) {
  if (hour < 12) return 'Dobré ráno';
  if (hour < 18) return 'Dobré odpoledne';
  return 'Dobrý večer';
}

function formatTime(date) {
  if (!date) return '';
  return date.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
}

function HomeTile({ icon: Icon, label, onClick, tintClass }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn('flex flex-1 flex-col items-center gap-2 rounded-native-card py-4 transition-transform duration-100 active:scale-[0.97]', tintClass)}
    >
      <Icon size={24} strokeWidth={1.75} />
      <span className="text-[13px] font-semibold text-native-text">{label}</span>
    </button>
  );
}

function EventRow({ event, familyName, onOpen }) {
  const start = toDate(event.start);
  return (
    <button
      type="button"
      onClick={() => event.fosterFamilyId && onOpen(event.fosterFamilyId)}
      disabled={!event.fosterFamilyId}
      className={cn(
        'flex w-full items-center gap-3 border-l-4 bg-native-surface px-4 py-3 text-left transition-transform duration-100 active:scale-[0.98] disabled:active:scale-100',
        NATIVE_EVENT_BORDER[event.type] ?? EVENT_BORDER_CLASS[event.type] ?? EVENT_BORDER_CLASS.other
      )}
    >
      <span className="w-12 shrink-0 text-[13px] font-semibold text-native-textMuted">
        {event.allDay ? '' : formatTime(start)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-medium text-native-text">{event.title}</p>
        {familyName && <p className="truncate text-[13px] text-native-textMuted">{familyName}</p>}
      </div>
    </button>
  );
}

export default function MobileHomeScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { loading, error, todayEvents, waitingShown, familiesById } = useTodayPage();

  const firstName = (profile?.displayName ?? profile?.email?.split('@')[0] ?? '').split(' ')[0];
  const now = new Date();

  function openFamily(familyId) {
    navigate(`/admin/terenni/${familyId}`);
  }

  if (loading) {
    return <div className="py-16 text-center text-[15px] text-native-textMuted">{t('common.loading')}</div>;
  }
  if (error) {
    return <div className="m-4 rounded-native-card bg-native-danger/10 px-4 py-3 text-[15px] text-native-danger">{error}</div>;
  }

  return (
    <div className="pb-6">
      <div className="flex items-center gap-3 px-4 pt-4">
        <Avatar name={profile?.displayName ?? profile?.email} size="xl" tone="native" />
        <p className="text-[22px] font-bold leading-tight text-native-text">
          {greetingFor(now.getHours())}, {firstName}
        </p>
      </div>

      <div className="mt-5 flex gap-3 px-4">
        <HomeTile
          icon={CalendarPlus}
          label="Naplánovat návštěvu"
          tintClass="bg-native-primary/10 text-native-primary"
          onClick={() => navigate('/kalendar')}
        />
        <HomeTile
          icon={UserPlus}
          label="Přidat rodinu"
          tintClass="bg-native-warning/10 text-native-warning"
          onClick={() => toast.info(t('today.quickActions.notAvailable'))}
        />
      </div>

      <SectionLabel className="px-4">Dnešní program</SectionLabel>
      {todayEvents.length === 0 ? (
        <p className="px-4 text-[15px] text-native-textMuted">Dnes nemáte naplánované žádné události.</p>
      ) : (
        <div className="flex flex-col gap-2 px-4">
          {todayEvents.map((ev) => (
            <div key={ev.id} className="overflow-hidden rounded-native-card">
              <EventRow event={ev} familyName={familiesById[ev.fosterFamilyId]?.name} onOpen={openFamily} />
            </div>
          ))}
        </div>
      )}

      {waitingShown.length > 0 && (
        <>
          <SectionLabel className="px-4">Čeká na vás</SectionLabel>
          <div className="flex flex-col gap-2 px-4">
            {waitingShown.map(({ family, days }) => (
              <button
                key={family.id}
                type="button"
                onClick={() => openFamily(family.id)}
                className="flex items-center justify-between gap-3 rounded-native-card border-l-4 border-native-warning bg-native-surface px-4 py-3 text-left transition-transform duration-100 active:scale-[0.98]"
              >
                <span className="truncate text-[15px] font-medium text-native-text">{family.name}</span>
                <span className="shrink-0 text-[13px] text-native-textMuted">
                  {days === null ? 'nikdy navštíveno' : `před ${days} dny`}
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      {todayEvents.length === 0 && waitingShown.length === 0 && (
        <div className="mx-4 mt-4">
          <NativeEmptyState
            icon={ClipboardCheck}
            title="Nic k vyřešení"
            description="Až budou čekat naplánované návštěvy nebo rodiny bez nedávného kontaktu, objeví se tady."
          />
        </div>
      )}
    </div>
  );
}
