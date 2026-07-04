/**
 * AdminLayout.jsx — shell pro B2B SaaS dashboardy (Connecteam redesign,
 * Krok 2, DESIGN.md §4). Nahrazuje starý jednoduchý topbar-only shell:
 * teď sidebar (AdminSidebar) + topbar (AdminTopbar) + obsah max 1280 px na
 * plátně `surface-canvas`. `title` prop zůstává (router.jsx ho pořád
 * předává), zobrazuje se jako tichý label v topbaru.
 */

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar.jsx';
import AdminTopbar from './AdminTopbar.jsx';

export default function AdminLayout({ title }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-dvh bg-surface-canvas">
      <AdminSidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar title={title} onOpenMobileSidebar={() => setMobileOpen(true)} />
        <main className="flex-1">
          <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
