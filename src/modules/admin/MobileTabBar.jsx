/**
 * MobileTabBar.jsx — spodní tab bar pro mobil (DESIGN.md §11.1), nahrazuje
 * hamburger + sidebar drawer z Kroku 2. Connecteam má 5 pevných ikon (Domů/
 * Vyhledávání/Chat/Profil/Správce) — náš app nemá chat ani univerzální
 * vyhledávání a role mají různé sady funkcí, takže položky jsou per-roli
 * (3–4), stejná role→routa mapa jako `AdminSidebar.navItemsForRole`.
 *
 * Na rozdíl od sidebaru NEMAJÍ tab ikony barevné kolečko (screenshoty:
 * bottom tab bar je čistě outline/plná ikona + label, barevné kruhy jsou
 * jen uvnitř obsahu — §11.3).
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, LineChart, Building2, Settings, User } from 'lucide-react';
import { cn } from '../../components/ui/cn.js';
import { useAuthStore } from '../../store/authStore.js';

const TAB_META = {
  today: { label: 'Dnes', icon: LayoutDashboard, path: '/' },
  families: { label: 'Rodiny', icon: Users, path: '/admin/terenni' },
  calendar: { label: 'Kalendář', icon: Calendar, path: '/kalendar' },
  team: { label: 'Tým', icon: LineChart, path: '/admin/tym' },
  organization: { label: 'Organizace', icon: Building2, path: '/admin/organizace' },
  admin: { label: 'Organizace', icon: Settings, path: '/admin/superadmin' },
  profile: { label: 'Profil', icon: User, path: '/profil' },
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
    default:
      return ['profile'];
  }
}

export default function MobileTabBar() {
  const { role } = useAuthStore();
  const keys = tabsForRole(role);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border-default bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
      aria-label="Hlavní navigace"
    >
      {keys.map((key) => {
        const meta = TAB_META[key];
        const Icon = meta.icon;
        return (
          <NavLink
            key={key}
            to={meta.path}
            end={meta.path === '/'}
            className={({ isActive }) => cn(
              'flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium transition',
              isActive ? 'text-brand-600' : 'text-ink-400'
            )}
          >
            {({ isActive }) => (
              <>
                <Icon size={22} strokeWidth={isActive ? 2.25 : 1.75} />
                <span>{meta.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
