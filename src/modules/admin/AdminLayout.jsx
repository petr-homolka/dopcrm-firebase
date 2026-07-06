/**
 * AdminLayout.jsx — shell pro B2B SaaS dashboardy. STRICT UI/UX DESIGN
 * MANDATE (2026-07-05): mobil a desktop jsou teď dva ÚPLNĚ ODDĚLENÉ
 * layouty, žádné responsivní `lg:` mixování v jedné JSX větvi. Desktop:
 * sidebar (AdminSidebar) + topbar (AdminTopbar) + obsah max 1280px na
 * plátně `surface-canvas` (Connecteam redesign Krok 2, DESIGN.md §4) —
 * BEZE ZMĚNY. Mobil: `MobileShell.jsx` (src/mobile/) — spodní tab bar dle
 * iOS HIG, vlastní plátno `native.bg`, žádný sdílený sidebar/topbar kód.
 * `title` prop se na mobilu ignoruje (každá mobilní obrazovka má vlastní
 * `MobileTopNav`).
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar.jsx';
import AdminTopbar from './AdminTopbar.jsx';
import useIsMobile from '../../mobile/useIsMobile.js';
import MobileShell from '../../mobile/MobileShell.jsx';

export default function AdminLayout({ title }) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileShell />;
  }

  return (
    <div className="flex min-h-dvh bg-surface-canvas">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar title={title} />
        <main className="flex-1">
          <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
