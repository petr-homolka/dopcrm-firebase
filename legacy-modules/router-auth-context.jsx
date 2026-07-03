/**
 * router-auth-context.jsx — ARCHIVOVANÝ kód, ne živý soubor (nikam se
 * neimportuje, nekompiluje se jako součást buildu).
 *
 * Původně žil v src/core/router.jsx jako `AuthContext`/`AuthProvider`/`useAuth`.
 * Odstraněno 2026-07-03 (audit nálezu #5) — způsoboval redirect smyčku po
 * přihlášení: existovaly DVA nezávislé mechanismy rozhodující o přesměrování
 * z /login (tento kontext přes `LoginRoute`, a Login.jsx's vlastní efekt nad
 * `useAuthStore`), které si mohly konkurovat ("Maximum update depth exceeded").
 *
 * Ochrana rout je teď VÝHRADNĚ přes `useAuthStore` (Zustand, viz
 * src/store/authStore.js) — jediný zdroj pravdy o přihlášení i roli.
 *
 * Ponecháno jen jako reference, kdyby bylo někdy potřeba pochopit původní
 * chování. Import `initAuth`/`currentUser` mířil na legacy-modules/services/auth.js
 * (taky archivováno stejného dne).
 */

import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { initAuth, currentUser } from './services/auth.js';

const AuthContext = createContext(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) throw new Error('useAuth musí být uvnitř <AuthProvider>');
  return ctx;
}

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => ({
    loading: true,
    session: currentUser() ? { user: currentUser() } : null,
  }));
  const unsubRef = useRef(null);

  useEffect(() => {
    unsubRef.current = initAuth((session) => {
      setAuthState({ loading: false, session });
    });
    return () => unsubRef.current?.();
  }, []);

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
}
