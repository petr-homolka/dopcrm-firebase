/**
 * authStore.js — globální auth state (Zustand)
 *
 * Nahrazuje jen STATE MANAGEMENT vrstvu z "core/router.jsx" AuthContext pro
 * nové B2B SaaS schéma (viz services/orgAuth.js). AuthContext v core/router.jsx
 * zůstává pro starší moduly (legacy user_roles), ale nové stránky (SuperAdmin/
 * OrgAdmin/Klíčová osoba dashboardy, nový Login) čtou VÝHRADNĚ z tohoto store.
 *
 * Obsah:
 *   currentUser       — Firebase Auth User (nebo null)
 *   profile           — dokument users/{uid} (role, organizationId, ...)
 *   organizationId    — zkratka profile.organizationId
 *   role              — zkratka profile.role ('superadmin'|'org_admin'|'klicova_osoba')
 *   loading           — true dokud Firebase nepotvrdí stav session
 *   initialized       — bootstrapAuthStore() proběhl alespoň jednou
 *
 * Bootstrap: zavolat jednou bootstrapAuthStore() při startu appky (main.jsx).
 */

import { create } from 'zustand';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../services/firebase.js';

export const useAuthStore = create((set) => ({
  currentUser: null,
  profile: null,
  organizationId: null,
  role: null,
  loading: true,
  initialized: false,

  /** Interní: nastaví profil (users/{uid} dokument) a odvozené hodnoty. */
  _setProfile(profile) {
    set({
      profile,
      organizationId: profile?.organizationId ?? null,
      role: profile?.role ?? null,
    });
  },
}));

let _profileUnsub = null;

/**
 * Bootstrap store — volat jednou při startu appky.
 * Vrací unsubscribe funkci (pro cleanup, typicky se nikdy nevolá).
 */
export function bootstrapAuthStore() {
  return onAuthStateChanged(auth, (user) => {
    _profileUnsub?.();
    _profileUnsub = null;

    if (!user) {
      useAuthStore.setState({
        currentUser: null,
        profile: null,
        organizationId: null,
        role: null,
        loading: false,
        initialized: true,
      });
      return;
    }

    useAuthStore.setState({ currentUser: user, loading: true, initialized: true });

    // Real-time subscription na users/{uid} — role/organizace se může změnit za běhu
    // (superadmin může uživatele přeřadit) bez nutnosti nového přihlášení.
    _profileUnsub = onSnapshot(
      doc(db, 'users', user.uid),
      (snap) => {
        const profile = snap.exists() ? { id: snap.id, ...snap.data() } : null;
        useAuthStore.getState()._setProfile(profile);
        useAuthStore.setState({ loading: false });
      },
      (err) => {
        console.error('[authStore] users/{uid} subscription selhala:', err);
        useAuthStore.getState()._setProfile(null);
        useAuthStore.setState({ loading: false });
      }
    );
  });
}

// ── Synchronní čtení mimo React komponenty (services, guardy) ──
export function getAuthState() {
  return useAuthStore.getState();
}
