/**
 * AdminLayout.jsx — shell pro B2B SaaS dashboardy. STRICT UI/UX DESIGN
 * MANDATE (2026-07-05): mobil a desktop jsou teď dva ÚPLNĚ ODDĚLENÉ
 * layouty, žádné responsivní `lg:` mixování v jedné JSX větvi. Desktop:
 * sidebar (AdminSidebar) + topbar (AdminTopbar) + obsah. Mobil:
 * `MobileShell.jsx` (src/mobile/) — spodní tab bar dle iOS HIG, vlastní
 * plátno `native.bg`, žádný sdílený sidebar/topbar kód. `title` prop se na
 * mobilu ignoruje (každá mobilní obrazovka má vlastní `MobileTopNav`).
 *
 * `variant` (2026-07-13, desktop case-management workspace):
 *   - undefined/'page' — klasická centrovaná stránka (max-w 1280px, padding),
 *     stránka scrolluje jako celek. Používá většina dashboardů.
 *   - 'workspace' — full-bleed: `<Outlet>` dostane celou plochu pod topbarem
 *     (100dvh − topbar) a sám si řídí sloupce a jejich vnitřní scroll
 *     (třípanelový master-detail, DESIGN.md §4.1 „Rozvržení celé aplikace").
 * Na mobilu se `variant` ignoruje (MobileShell má vlastní chrome).
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar.jsx';
import AdminTopbar from './AdminTopbar.jsx';
import CommandPalette from './CommandPalette.jsx';
import useIsMobile from '../../mobile/useIsMobile.js';
import MobileShell from '../../mobile/MobileShell.jsx';

export default function AdminLayout({ title, variant = 'page' }) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileShell />;
  }

  const isWorkspace = variant === 'workspace';

  return (
    <div className={isWorkspace ? 'flex h-dvh overflow-hidden bg-surface-canvas' : 'flex min-h-dvh bg-surface-canvas'}>
      <CommandPalette />
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar title={title} />
        {isWorkspace ? (
          <main className="min-h-0 flex-1">
            <Outlet />
          </main>
        ) : (
          <main className="flex-1">
            <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-8">
              <Outlet />
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
