/**
 * OrgAdminDashboard.jsx — Krok 3 zadání (2026-07-01), obohaceno 2026-07-02
 *
 * Pohled managementu vlastní organizace: pěstounské rodiny (a jejich děti)
 * i zaměstnanci — plná hierarchická viditelnost vlastní organizace, ne jen
 * seznam zaměstnanců.
 */

import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore.js';
import { cn } from '../../components/ui/cn.js';
import OrgEmployeesPanel from './OrgEmployeesPanel.jsx';
import FosterFamiliesPanel from './FosterFamiliesPanel.jsx';

const TABS = [
  { value: 'rodiny', label: 'Pěstounské rodiny' },
  { value: 'zamestnanci', label: 'Zaměstnanci' },
];

export default function OrgAdminDashboard() {
  const { organizationId } = useAuthStore();
  const [tab, setTab] = useState('rodiny');

  return (
    <div>
      <h1 className="mb-3 text-lg font-semibold text-ink-800 sm:text-xl">Naše organizace</h1>

      <div className="mb-6 flex gap-2 overflow-x-auto border-b border-border-subtle">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTab(t.value)}
            className={cn(
              'shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium transition duration-150',
              tab === t.value
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-ink-500 hover:text-ink-700'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'rodiny' && <FosterFamiliesPanel organizationId={organizationId} basePath="/admin/terenni" />}
      {tab === 'zamestnanci' && <OrgEmployeesPanel organizationId={organizationId} />}
    </div>
  );
}
