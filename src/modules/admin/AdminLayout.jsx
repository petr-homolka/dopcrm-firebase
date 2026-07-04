/**
 * AdminLayout.jsx — shell pro B2B SaaS dashboardy. Desktop (lg+):
 * sidebar (AdminSidebar) + topbar (AdminTopbar) + obsah max 1280 px na
 * plátně `surface-canvas` (Connecteam redesign Krok 2, DESIGN.md §4).
 * Mobil: BEZ sidebaru — `MobileTabBar.jsx` dole (DESIGN.md §11.1), obsah
 * dostává `pb-20` navíc, ať poslední řádek nezakryje pevný tab bar.
 * `title` prop zůstává (router.jsx ho pořád předává), zobrazuje se jako
 * tichý label v topbaru na desktopu.
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar.jsx';
import AdminTopbar from './AdminTopbar.jsx';
import MobileTabBar from './MobileTabBar.jsx';

export default function AdminLayout({ title }) {
  return (
    <div className="flex min-h-dvh bg-surface-canvas">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar title={title} />
        <main className="flex-1 pb-20 lg:pb-0">
          <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-8">
            <Outlet />
          </div>
        </main>
      </div>
      <MobileTabBar />
    </div>
  );
}
