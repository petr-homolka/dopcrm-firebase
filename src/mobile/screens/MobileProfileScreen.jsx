/**
 * MobileProfileScreen.jsx — Profil, čistě mobilní (STRICT UI/UX DESIGN
 * MANDATE, 2026-07-05). Nahrazuje starší `modules/admin/MobileProfilePage.jsx`
 * (ten používal desktop tokeny/komponenty — porušení striktního oddělení).
 * Hero karta s hranatým avatarem + iOS grouped list (`NativeListRow.jsx`).
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import { signOut, roleLabel } from '../../services/orgAuth.js';
import MobileTopNav from '../ui/MobileTopNav.jsx';
import { NativeGroupedList, NativeListRow } from '../ui/NativeListRow.jsx';

function initialsOf(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

export default function MobileProfileScreen() {
  const navigate = useNavigate();
  const { currentUser, role } = useAuthStore();
  const name = currentUser?.displayName ?? currentUser?.email ?? '';

  async function handleSignOut() {
    await signOut();
    navigate('/login', { replace: true });
  }

  return (
    <div>
      <MobileTopNav title="Profil" />

      <div className="p-4">
        <div className="flex items-center gap-4 rounded-native-card bg-native-surface p-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-native-card bg-native-primary text-xl font-bold text-white">
            {initialsOf(name)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[17px] font-semibold text-native-text">{name}</p>
            <p className="text-[15px] text-native-textMuted">{roleLabel(role)}</p>
          </div>
        </div>

        <div className="mt-5">
          <NativeGroupedList>
            <NativeListRow
              icon={Settings}
              iconBg="bg-native-textMuted"
              label="Nastavení"
              onClick={() => navigate('/nastaveni')}
              isLast
            />
          </NativeGroupedList>
        </div>

        <div className="mt-5">
          <NativeGroupedList>
            <NativeListRow
              icon={LogOut}
              iconBg="bg-native-danger"
              label="Odhlásit se"
              onClick={handleSignOut}
              danger
              showChevron={false}
              isLast
            />
          </NativeGroupedList>
        </div>
      </div>
    </div>
  );
}
