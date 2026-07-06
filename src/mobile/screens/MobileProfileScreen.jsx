/**
 * MobileProfileScreen.jsx — Profil přihlášeného uživatele, čistě mobilní.
 *
 * v4 (2026-07-06, Lidl vzor): modrý hero s velkým jménem a chipem role
 * (MobileTopNav variant="hero" + NativeHero), pod ním bílá plocha (HeroBody)
 * s iOS grouped listem akcí. Nahrazuje dřívější hranatou avatar-kartu.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import { signOut, roleLabel } from '../../services/orgAuth.js';
import MobileTopNav from '../ui/MobileTopNav.jsx';
import NativeHero, { HeroBody } from '../ui/NativeHero.jsx';
import { NativeGroupedList, NativeListRow } from '../ui/NativeListRow.jsx';

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
      <MobileTopNav variant="hero" title="Profil" />

      <NativeHero
        title={name}
        subtitle={
          <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-1 text-[12px] font-semibold text-white">
            {roleLabel(role)}
          </span>
        }
      />

      <HeroBody>
        <div className="p-4">
          {currentUser?.email && (
            <div className="mb-5 rounded-native-card bg-native-surface px-4">
              <div className="flex items-center justify-between gap-4 py-3.5">
                <span className="shrink-0 text-[15px] text-native-textMuted">E-mail</span>
                <a href={`mailto:${currentUser.email}`} className="min-w-0 flex-1 truncate text-right text-[15px] font-medium text-native-primary">
                  {currentUser.email}
                </a>
              </div>
            </div>
          )}

          <NativeGroupedList>
            <NativeListRow
              icon={Settings}
              iconBg="bg-native-textMuted"
              label="Nastavení"
              onClick={() => navigate('/nastaveni')}
              isLast
            />
          </NativeGroupedList>

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
      </HeroBody>
    </div>
  );
}
