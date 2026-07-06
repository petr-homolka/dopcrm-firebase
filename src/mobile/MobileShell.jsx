/**
 * MobileShell.jsx — spodní tab bar + obsah pro mobilní appku (STRICT UI/UX
 * DESIGN MANDATE, 2026-07-05). Přesné iOS rozměry (Apple HIG, ne odhad):
 * tab bar content 49pt + `env(safe-area-inset-bottom)`, ikony 26px, label
 * 10px — to jsou dokumentované Apple konstanty pro UITabBar, ne můj odhad.
 * Ploché bílé pozadí (`native.surface`) + 1px `native.separator` nahoře —
 * BEZ blur efektu, protože na reálných Connecteam screenshotech je tab bar
 * plný, ne glassmorphism. ŽÁDNÉ emoji — jen lucide-react ikony.
 */

import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Home, Users, Calendar, BarChart3, Building2, UserCircle2, MessageSquare } from 'lucide-react';
import { cn } from '../components/ui/cn.js';
import { useAuthStore } from '../store/authStore.js';
import ActiveVisitBanner from './ui/ActiveVisitBanner.jsx';

const TAB_META = {
  today: { label: 'Dnes', icon: Home, path: '/' },
  families: { label: 'Rodiny', icon: Users, path: '/admin/terenni' },
  calendar: { label: 'Kalendář', icon: Calendar, path: '/kalendar' },
  team: { label: 'Tým', icon: BarChart3, path: '/admin/tym' },
  organization: { label: 'Organizace', icon: Building2, path: '/admin/organizace' },
  admin: { label: 'Organizace', icon: Building2, path: '/admin/superadmin' },
  profile: { label: 'Profil', icon: UserCircle2, path: '/profil' },
  // Pěstounská appka (2026-07-06) — omezené taby role pestoun.
  fosterHome: { label: 'Domů', icon: Home, path: '/moje' },
  fosterChat: { label: 'Chat', icon: MessageSquare, path: '/moje/chat' },
};

function tabsForRole(role) {
  switch (role) {
    case 'klicova_osoba':
      return ['today', 'families', 'calendar', 'profile'];
    case 'org_admin':
      return ['organization', 'calendar', 'profile'];
    case 'vedouci_pobocky':
    case 'teamleader':
      return ['team', 'calendar', 'profile'];
    case 'superadmin':
      return ['admin', 'profile'];
    case 'pestoun':
      return ['fosterHome', 'fosterChat', 'profile'];
    default:
      return ['profile'];
  }
}

export default function MobileShell() {
  const { role } = useAuthStore();
  const keys = tabsForRole(role);

  return (
    <div className="flex min-h-dvh flex-col bg-native-bg font-native">
      <ActiveVisitBanner />
      <div className="flex-1 overflow-y-auto pb-[calc(49px+env(safe-area-inset-bottom))]">
        <Outlet />
      </div>

      <nav className="fixed inset-x-0 bottom-0 flex border-t border-native-separator bg-native-surface pb-[env(safe-area-inset-bottom)]">
        {keys.map((key) => {
          const meta = TAB_META[key];
          const Icon = meta.icon;
          return (
            <NavLink
              key={key}
              to={meta.path}
              end={meta.path === '/' || meta.path === '/moje'}
              className={({ isActive }) => cn(
                'flex flex-1 flex-col items-center justify-center gap-1 pt-1.5',
                'text-[10px] font-medium leading-none',
                isActive ? 'text-native-primary' : 'text-native-textMuted'
              )}
              style={{ height: '49px' }}
            >
              {({ isActive }) => (
                <>
                  <Icon size={26} strokeWidth={isActive ? 2.25 : 1.75} />
                  <span>{meta.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
