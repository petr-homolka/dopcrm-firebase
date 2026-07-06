/**
 * MobileFamiliesScreen.jsx — Rodiny, čistě mobilní (STRICT UI/UX DESIGN
 * MANDATE, 2026-07-05). Vzor „Uživatelé" ze skutečných Connecteam
 * screenshotů: kulatý avatar 44px vlevo, jméno + status vpravo, 1px
 * oddělovač začíná za avatarem (ne od okraje), search bar nahoře. Žádná
 * sdílená JSX s desktop `FosterFamiliesPanel.jsx` — jen datové služby.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, Users } from 'lucide-react';
import Avatar from '../../components/ui/Avatar.jsx';
import { cn } from '../../components/ui/cn.js';
import { useAuthStore } from '../../store/authStore.js';
import { listFostersAssignedTo, listFostersByOrg } from '../../services/orgService.js';
import { careLabel } from '../../shared/domainConstants.js';
import MobileTopNav from '../ui/MobileTopNav.jsx';
import { NativeEmptyState } from '../ui/NativeBits.jsx';

const STATUS_LABEL = { active: 'Aktivní', paused: 'Pozastaveno', exited: 'Ukončeno' };

export default function MobileFamiliesScreen() {
  const navigate = useNavigate();
  const { role, organizationId, currentUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [families, setFamilies] = useState([]);
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    try {
      const data = role === 'klicova_osoba'
        ? await listFostersAssignedTo(currentUser.uid, organizationId)
        : await listFostersByOrg(organizationId);
      setFamilies(data);
    } finally {
      setLoading(false);
    }
  }, [organizationId, role, currentUser]);

  useEffect(() => { load(); }, [load]);

  const filtered = families.filter((f) => f.name?.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div>
      <MobileTopNav title="Rodiny" />

      <div className="px-4 pb-2 pt-3">
        <div className="relative">
          <Search size={16} strokeWidth={2} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-native-textMuted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Vyhledávání"
            className="h-11 w-full rounded-native-input bg-native-surface pl-9 pr-3 text-[16px] text-native-text placeholder:text-native-textMuted focus:outline-none"
          />
        </div>
      </div>

      {loading && <p className="px-4 py-6 text-center text-[15px] text-native-textMuted">Načítám…</p>}

      {!loading && filtered.length > 0 && (
        <div className="mx-4 overflow-hidden rounded-native-card bg-native-surface">
          {filtered.map((family, i) => (
            <button
              key={family.id}
              type="button"
              onClick={() => navigate(`/admin/terenni/${family.id}`)}
              className="flex w-full items-center gap-3 pl-4 text-left active:bg-native-bg"
            >
              <Avatar name={family.name} size="lg" tone="native" />
              <div className={cn(
                'flex min-w-0 flex-1 items-center gap-2 py-2.5 pr-4',
                i < filtered.length - 1 && 'border-b border-native-separator'
              )}>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[17px] text-native-text">{family.name || '(bez jména)'}</p>
                  <p className="truncate text-[13px] text-native-textMuted">
                    {careLabel(family.careType)} · {STATUS_LABEL[family.status] ?? family.status}
                  </p>
                </div>
                <ChevronRight size={18} strokeWidth={2} className="shrink-0 text-native-textMuted" />
              </div>
            </button>
          ))}

        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="mx-4 mt-2">
          <NativeEmptyState
            icon={Users}
            title={families.length === 0 ? 'Zatím žádné pěstounské rodiny' : 'Nic neodpovídá hledání'}
            description={families.length === 0
              ? 'Rodiny vám přiřadí administrátor vaší organizace.'
              : 'Zkuste kratší část názvu rodiny.'}
          />
        </div>
      )}
    </div>
  );
}
