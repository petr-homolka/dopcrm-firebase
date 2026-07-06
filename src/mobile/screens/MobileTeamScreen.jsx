/**
 * MobileTeamScreen.jsx — Tým, čistě mobilní (STRICT UI/UX DESIGN MANDATE,
 * 2026-07-05). Pro vedouci_pobocky/teamleader — rodiny klíčových osob ve
 * vlastní podřízenosti, jen ke čtení. Reuse `useTeamDashboard` hook (data),
 * žádná sdílená JSX s desktop TeamDashboard.jsx.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import Avatar from '../../components/ui/Avatar.jsx';
import useTeamDashboard from '../../modules/admin/useTeamDashboard.js';
import MobileTopNav from '../ui/MobileTopNav.jsx';
import { NativeGroupedList, NativeListRow } from '../ui/NativeListRow.jsx';
import { NativeEmptyState, NativeChip } from '../ui/NativeBits.jsx';

const STATUS_LABEL = { active: 'Aktivní', paused: 'Pozastaveno', exited: 'Ukončeno' };

function familyCountLabel(n) {
  if (n === 1) return '1 rodina';
  if (n >= 2 && n <= 4) return `${n} rodiny`;
  return `${n} rodin`;
}

export default function MobileTeamScreen() {
  const navigate = useNavigate();
  const { loading, error, groups } = useTeamDashboard();

  return (
    <div>
      <MobileTopNav title="Tým" />

      {loading && <p className="py-16 text-center text-[15px] text-native-textMuted">Načítám…</p>}
      {!loading && error && <p className="px-4 py-6 text-center text-[15px] text-native-danger">{error}</p>}

      {!loading && !error && groups.length === 0 && (
        <div className="mx-4 mt-6">
          <NativeEmptyState
            icon={Users}
            title="Nemáte žádné podřízené klíčové osoby"
            description="Přiřazení do vaší podřízenosti (pole „nadřízený“) nastavuje administrátor organizace."
          />
        </div>
      )}

      {!loading && !error && groups.map(({ ko, families }) => (
        <div key={ko.id} className="mt-5">
          <div className="flex items-center gap-3 px-4 pb-2">
            <Avatar name={ko.displayName} size="lg" tone="native" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-semibold text-native-text">{ko.displayName}</p>
              <p className="text-[13px] text-native-textMuted">{familyCountLabel(families.length)}</p>
            </div>
          </div>

          {families.length === 0 ? (
            <p className="px-4 text-[13px] text-native-textMuted">Zatím nemá přiřazené žádné rodiny.</p>
          ) : (
            <div className="mx-4">
              <NativeGroupedList>
                {families.map((family, i) => (
                  <NativeListRow
                    key={family.id}
                    icon={Users}
                    iconBg="bg-native-primary"
                    label={family.name}
                    trailing={
                      <NativeChip tone={family.status === 'active' ? 'primary' : family.status === 'paused' ? 'warning' : 'muted'}>
                        {STATUS_LABEL[family.status] ?? family.status}
                      </NativeChip>
                    }
                    onClick={() => navigate(`/admin/terenni/${family.id}`)}
                    isLast={i === families.length - 1}
                  />
                ))}
              </NativeGroupedList>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
