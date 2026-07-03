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

import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { dashboardPathForRole } from '../services/orgAuth.js';

// Legacy AuthContext/AuthProvider/useAuth (Firebase session přes services/auth.js)
// ODSTRANĚNO 2026-07-03 — způsobovalo redirect smyčku po přihlášení, protože
// existovaly DVA nezávislé mechanismy rozhodující o přesměrování z /login
// (tento kontext + Login.jsx's useAuthStore efekt). Ochrana rout je teď VÝHRADNĚ
// přes useAuthStore (Zustand) — jediný zdroj pravdy. Původní kód (pro referenci)
// je v legacy-modules/router-auth-context.jsx.

// ── Lazy-loaded MVP stránky ───────────────────────────────────
const LoginPage        = lazy(() => import('../modules/users/Login.jsx'));
const RegisterPage     = lazy(() => import('../modules/users/RegisterPage.jsx'));
const DashboardPage    = lazy(() => import('../modules/families/DashboardPage'));
const FamiliesPage     = lazy(() => import('../modules/families/FamiliesPage'));
const FamilyDetailPage = lazy(() => import('../modules/families/FamilyDetailPage'));
const ChildrenPage     = lazy(() => import('../modules/children/ChildrenPage'));
const ChildDetailPage  = lazy(() => import('../modules/children/ChildDetailPage'));
const ContactsPage     = lazy(() => import('../modules/companies/ContactsPage'));
const CalendarPage     = lazy(() => import('../modules/calendar/CalendarPage'));
const UsersPage        = lazy(() => import('../modules/users/UsersPage'));
const SettingsPage     = lazy(() => import('../modules/users/SettingsPage'));
const HubPage          = lazy(() => import('../modules/families/HubPage'));
const Layout           = lazy(() => import('./Layout.jsx'));

// ── Nové B2B SaaS dashboardy (2026-07-01, viz modules/admin) ──
const AdminLayout            = lazy(() => import('../modules/admin/AdminLayout.jsx'));
const SuperAdminDashboard    = lazy(() => import('../modules/admin/SuperAdminDashboard.jsx'));
const OrgAdminDashboard      = lazy(() => import('../modules/admin/OrgAdminDashboard.jsx'));
const KlicovaOsobaDashboard  = lazy(() => import('../modules/admin/KlicovaOsobaDashboard.jsx'));
const TeamDashboard          = lazy(() => import('../modules/admin/TeamDashboard.jsx'));
const FosterFamilyDetailPage = lazy(() => import('../modules/admin/FosterFamilyDetailPage.jsx'));
const OrganizationDetailPage = lazy(() => import('../modules/admin/OrganizationDetailPage.jsx'));
const AdminChildDetailPage   = lazy(() => import('../modules/admin/ChildDetailPage.jsx'));

// Non-MVP (zakomentováno):
// const WorkflowPage     = lazy(() => import('../modules/workflow/WorkflowPage'));
// const MarketplacePage  = lazy(() => import('../modules/marketplace/MarketplacePage'));
// const AIAgentsPage     = lazy(() => import('../modules/ai/AIAgentsPage'));
// const OCRPage          = lazy(() => import('../modules/documents/OCRPage'));
// const AdvancedReports  = lazy(() => import('../modules/reports/AdvancedReportsPage'));
// const MonetizationPage = lazy(() => import('../modules/admin/MonetizationPage'));

// ── Navigační definice (odpovídá RAIL v prototypu) ───────────

// Datová konstanta sdílená s Layout.jsx, ne komponenta.
// eslint-disable-next-line react-refresh/only-export-components
export const MVP_NAV = [
  { path: '/prehled',    label: 'Přehled',     icon: 'grid' },
  { path: '/pestouni',   label: 'Pěstouni',    icon: 'user' },
  { path: '/deti',       label: 'Děti',        icon: 'child' },
  { path: '/kontakty',   label: 'Kontakty',    icon: 'building' },
  { path: '/kalendar',   label: 'Kalendář',    icon: 'calendar' },
  { path: '/vzdelavani', label: 'Vzdělávání',  icon: 'book' },
];

// Dokumenty vypnuty (audit #5, docs/INVENTAR.md §11) — viz legacy-modules/README.md.
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
  const { loading, currentUser } = useAuthStore();
  const location = useLocation();

  if (loading) return <Loading />;
  if (!currentUser) return <Navigate to="/login" state={{ from: location }} replace />;

  return (
    <Suspense fallback={<Loading />}>
      <Layout />
    </Suspense>
  );
}

// ── Index route (kořen "/") ──────────────────────────────────
// Bug (2026-07-02): byl to natvrdo <Navigate to="/prehled">, takže KAŽDÝ
// přihlášený uživatel (i superadmin/org_admin/klíčová osoba z nového B2B
// schématu) skončil v LEGACY MVP shellu místo svého /admin/* dashboardu —
// legacy Layout navíc hlásil chybu "currentTenantId() je null", protože noví
// uživatelé žádný user_roles/{uid} záznam nemají. Teď se rozhoduje podle role
// z nového authStore (Zustand); jen uživatelé BEZ nové role (staré demo účty)
// padají na legacy /prehled.
function IndexRedirect() {
  const { loading, role } = useAuthStore();
  if (loading) return <Loading />;
  if (role) return <Navigate to={dashboardPathForRole(role)} replace />;
  return <Navigate to="/prehled" replace />;
}

// ── Nový B2B SaaS role guard (Zustand authStore, ne legacy AuthContext) ──
// Používá se jen na /admin/* větvi — starší /prehled apod. zůstávají na
// RequireAuth výše (jen ověří přihlášení, ne konkrétní roli).

function RequireOrgRole({ allowed }) {
  const { loading, currentUser: user, role } = useAuthStore();
  const location = useLocation();

  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!allowed.includes(role)) {
    // Přihlášen, ale jiná role — pošli na JEHO vlastní dashboard, ne na login.
    return <Navigate to={dashboardPathForRole(role)} replace />;
  }
  return <Outlet />;
}

// ── Login route ───────────────────────────────────────────────
// Čeká jen na vyřešení session (spinner) a vždy vykreslí <LoginPage>.
// Rozhodnutí "už jsem přihlášený, přesměruj mě pryč" dělá VÝHRADNĚ
// Login.jsx samo (vlastní useEffect nad useAuthStore) — kdyby o tom
// rozhodovaly obě místa najednou, vznikala by redirect smyčka (opraveno
// 2026-07-03, viz komentář nahoře u odstraněného AuthContextu).

function LoginRoute() {
  const { loading } = useAuthStore();
  if (loading) return <Loading />;

  return (
    <Suspense fallback={<Loading />}>
      <LoginPage />
    </Suspense>
  );
}

// ── Registrace route ─────────────────────────────────────────
// Veřejná, sebeobslužná (2026-07-02) — kdokoli přihlášený už má svůj
// dashboard, takže sem nepatří; nepřihlášený vidí formulář.

function RegisterRoute() {
  const { loading, currentUser, role } = useAuthStore();
  if (loading) return <Loading />;
  if (currentUser) return <Navigate to={role ? dashboardPathForRole(role) : '/prehled'} replace />;
  return (
    <Suspense fallback={<Loading />}>
      <RegisterPage />
    </Suspense>
  );
}

// ── MVP Router ────────────────────────────────────────────────

const router = createBrowserRouter([
  { path: '/login', element: <LoginRoute /> },
  { path: '/registrace', element: <RegisterRoute /> },

  {
    element: <RequireAuth />,
    children: [
      { index: true,              element: <IndexRedirect /> },
      { path: '/prehled',         element: <Suspense fallback={<Loading />}><DashboardPage /></Suspense> },
      { path: '/pestouni',        element: <Suspense fallback={<Loading />}><FamiliesPage /></Suspense> },
      { path: '/pestouni/:id',    element: <Suspense fallback={<Loading />}><FamilyDetailPage /></Suspense> },
      { path: '/deti',            element: <Suspense fallback={<Loading />}><ChildrenPage /></Suspense> },
      { path: '/deti/:id',        element: <Suspense fallback={<Loading />}><ChildDetailPage /></Suspense> },
      { path: '/kontakty',        element: <Suspense fallback={<Loading />}><ContactsPage /></Suspense> },
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

  // ── Nové B2B SaaS dashboardy (2026-07-01) ────────────────────
  // Vlastní AdminLayout (topbar, ne stará sidebar), guard přes RequireOrgRole.
  {
    element: <Suspense fallback={<Loading />}><AdminLayout title="SuperAdmin" /></Suspense>,
    children: [{
      element: <RequireOrgRole allowed={['superadmin']} />,
      children: [
        { path: '/admin/superadmin', element: <Suspense fallback={<Loading />}><SuperAdminDashboard /></Suspense> },
        { path: '/admin/superadmin/organizace/:orgId', element: <Suspense fallback={<Loading />}><OrganizationDetailPage /></Suspense> },
      ],
    }],
  },
  {
    element: <Suspense fallback={<Loading />}><AdminLayout title="Organizace" /></Suspense>,
    children: [{
      element: <RequireOrgRole allowed={['org_admin']} />,
      children: [
        { path: '/admin/organizace', element: <Suspense fallback={<Loading />}><OrgAdminDashboard /></Suspense> },
      ],
    }],
  },
  {
    element: <Suspense fallback={<Loading />}><AdminLayout title="Terén" /></Suspense>,
    children: [
      {
        // "Moje rodiny" — vlastní scoped dashboard klíčové osoby (org_admin smí nahlédnout).
        element: <RequireOrgRole allowed={['klicova_osoba', 'org_admin']} />,
        children: [
          { path: '/admin/terenni', element: <Suspense fallback={<Loading />}><KlicovaOsobaDashboard /></Suspense> },
        ],
      },
      {
        // Detail rodiny/dítěte — sdílená cílová stránka hierarchického prokliku
        // ze všech rolí (superadmin z OrganizationDetailPage, org_admin z
        // FosterFamiliesPanel, klicova_osoba z vlastního dashboardu, vedouci_pobocky/
        // teamleader z TeamDashboard — poslední dva jen ke čtení, viz
        // isReadOnlyManager() v orgAuth.js). Čtení řeší firestore.rules (sameOrg),
        // tady jen povolení routy.
        element: <RequireOrgRole allowed={['klicova_osoba', 'org_admin', 'superadmin', 'vedouci_pobocky', 'teamleader']} />,
        children: [
          { path: '/admin/terenni/:familyId',            element: <Suspense fallback={<Loading />}><FosterFamilyDetailPage /></Suspense> },
          { path: '/admin/terenni/:familyId/deti/:childId', element: <Suspense fallback={<Loading />}><AdminChildDetailPage /></Suspense> },
        ],
      },
    ],
  },
  {
    element: <Suspense fallback={<Loading />}><AdminLayout title="Tým" /></Suspense>,
    children: [{
      element: <RequireOrgRole allowed={['vedouci_pobocky', 'teamleader']} />,
      children: [
        { path: '/admin/tym', element: <Suspense fallback={<Loading />}><TeamDashboard /></Suspense> },
      ],
    }],
  },

  { path: '*', element: <Navigate to="/prehled" replace /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
