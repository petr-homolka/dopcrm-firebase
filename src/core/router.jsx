/**
 * MVP Router — React Router v6
 *
 * Povolené cesty (MVP):
 *   login, organizace, uživatelé, děti, pěstouni, rodiny,
 *   kontakty, návštěvy, zápisy, dokumenty, kalendář
 *
 * Auth: Firebase onAuthStateChanged přes initAuth() ze services/auth.js
 *   — role se NIKDY nečtou z Custom Claims, vždy z Firestore user_roles/{uid}
 *
 * ZAKOMENTOVÁNO (non-MVP — doplnit až po MVP release):
 *   - Workflow Engine (WF-1..14, exit, převody, GDPR retence)
 *   - AI agenti (strukturace, draft reportu, konverzační asistent)
 *   - OCR integrace (sken dokladu, OCR faktury)
 *   - Pokročilé reporty (manažerské grafy, automatizované joby)
 *   - Monetizace / FUP
 */

import React, { lazy, Suspense, useState, useEffect, useRef, createContext, useContext } from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet, useLocation } from 'react-router-dom';
import { initAuth, currentUser } from '../services/auth.js';

// ── Auth context ──────────────────────────────────────────────
// Sdílí stav přihlášení napříč stromem komponent.
// Hodnota: null = nepřihlášen, { user, role } = přihlášen.

const AuthContext = createContext(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) throw new Error('useAuth musí být uvnitř <AuthProvider>');
  return ctx;
}

/**
 * AuthProvider — obaluje celý strom, volá initAuth() jednou při mountu.
 * `loading=true` dokud Firebase nepotvrdí stav session (zabrání bliknutí redirectu).
 */
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

// ── Lazy-loaded MVP stránky ───────────────────────────────────
const LoginPage        = lazy(() => import('../modules/users/Login.jsx'));
const DashboardPage    = lazy(() => import('../modules/families/DashboardPage'));
const FamiliesPage     = lazy(() => import('../modules/families/FamiliesPage'));
const FamilyDetailPage = lazy(() => import('../modules/families/FamilyDetailPage'));
const ChildrenPage     = lazy(() => import('../modules/children/ChildrenPage'));
const ChildDetailPage  = lazy(() => import('../modules/children/ChildDetailPage'));
const ContactsPage     = lazy(() => import('../modules/companies/ContactsPage'));
const DocumentsPage    = lazy(() => import('../modules/documents/DocumentsPage'));
const CalendarPage     = lazy(() => import('../modules/calendar/CalendarPage'));
const UsersPage        = lazy(() => import('../modules/users/UsersPage'));
const SettingsPage     = lazy(() => import('../modules/users/SettingsPage'));
const HubPage          = lazy(() => import('../modules/families/HubPage'));
const Layout           = lazy(() => import('./Layout.jsx'));

// Non-MVP (zakomentováno):
// const WorkflowPage     = lazy(() => import('../modules/workflow/WorkflowPage'));
// const MarketplacePage  = lazy(() => import('../modules/marketplace/MarketplacePage'));
// const AIAgentsPage     = lazy(() => import('../modules/ai/AIAgentsPage'));
// const OCRPage          = lazy(() => import('../modules/documents/OCRPage'));
// const AdvancedReports  = lazy(() => import('../modules/reports/AdvancedReportsPage'));
// const MonetizationPage = lazy(() => import('../modules/admin/MonetizationPage'));

// ── Navigační definice (odpovídá RAIL v prototypu) ───────────

export const MVP_NAV = [
  { path: '/prehled',    label: 'Přehled',     icon: 'grid' },
  { path: '/pestouni',   label: 'Pěstouni',    icon: 'user' },
  { path: '/deti',       label: 'Děti',        icon: 'child' },
  { path: '/kontakty',   label: 'Kontakty',    icon: 'building' },
  { path: '/kalendar',   label: 'Kalendář',    icon: 'calendar' },
  { path: '/dokumenty',  label: 'Dokumenty',   icon: 'file' },
  { path: '/vzdelavani', label: 'Vzdělávání',  icon: 'book' },
];

// Non-MVP položky (zakomentováno):
// { path: '/reporty-manazerske', label: 'Manažerské reporty', icon: 'chart' },
// { path: '/workflow',           label: 'Workflow Engine',     icon: 'flow' },
// { path: '/monetizace',         label: 'Monetizace',          icon: 'credit-card' },

// ── Fallback loader ───────────────────────────────────────────

function Loading() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100dvh', fontFamily: 'system-ui, sans-serif',
      fontSize: '14px', color: '#888',
    }}>
      Načítám…
    </div>
  );
}

// ── Protected route ───────────────────────────────────────────
// Počká na vyřešení Firebase session (loading=true → spinner).
// Nepřihlášený → /login, přihlášený → <Layout> s <Outlet>.

function RequireAuth() {
  const { loading, session } = useAuth();
  const location = useLocation();

  if (loading) return <Loading />;
  if (!session) return <Navigate to="/login" state={{ from: location }} replace />;

  return (
    <Suspense fallback={<Loading />}>
      <Layout />
    </Suspense>
  );
}

// ── Login route ───────────────────────────────────────────────
// Pokud je uživatel přihlášen, přesměruje na dashboard.

function LoginRoute() {
  const { loading, session } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname ?? '/prehled';

  if (loading) return <Loading />;
  if (session) return <Navigate to={from} replace />;

  return (
    <Suspense fallback={<Loading />}>
      <LoginPage />
    </Suspense>
  );
}

// ── MVP Router ────────────────────────────────────────────────

const router = createBrowserRouter([
  { path: '/login', element: <LoginRoute /> },

  {
    element: <RequireAuth />,
    children: [
      { index: true,              element: <Navigate to="/prehled" replace /> },
      { path: '/prehled',         element: <Suspense fallback={<Loading />}><DashboardPage /></Suspense> },
      { path: '/pestouni',        element: <Suspense fallback={<Loading />}><FamiliesPage /></Suspense> },
      { path: '/pestouni/:id',    element: <Suspense fallback={<Loading />}><FamilyDetailPage /></Suspense> },
      { path: '/deti',            element: <Suspense fallback={<Loading />}><ChildrenPage /></Suspense> },
      { path: '/deti/:id',        element: <Suspense fallback={<Loading />}><ChildDetailPage /></Suspense> },
      { path: '/kontakty',        element: <Suspense fallback={<Loading />}><ContactsPage /></Suspense> },
      { path: '/dokumenty',       element: <Suspense fallback={<Loading />}><DocumentsPage /></Suspense> },
      { path: '/kalendar',        element: <Suspense fallback={<Loading />}><CalendarPage /></Suspense> },
      { path: '/vzdelavani',      element: <Suspense fallback={<Loading />}><FamiliesPage /></Suspense> },
      { path: '/hub/:typ/:id',    element: <Suspense fallback={<Loading />}><HubPage /></Suspense> },
      { path: '/uzivatele',       element: <Suspense fallback={<Loading />}><UsersPage /></Suspense> },
      { path: '/nastaveni',       element: <Suspense fallback={<Loading />}><SettingsPage /></Suspense> },

      // Non-MVP cesty (zakomentováno):
      // { path: '/workflow',             element: <WorkflowPage /> },
      // { path: '/archiv',               element: <ArchivPage /> },
      // { path: '/reporty-manazerske',   element: <AdvancedReports /> },
      // { path: '/monetizace',           element: <MonetizationPage /> },
      // { path: '/ai-agenti',            element: <AIAgentsPage /> },
    ],
  },

  { path: '*', element: <Navigate to="/prehled" replace /> },
]);

export default function AppRouter() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
