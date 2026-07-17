/**
 * Router (React Router v6). Ochrana rout VÝHRADNĚ přes useAuthStore (Zustand);
 * role z Firestore users/{uid}, nikdy z Custom Claims. Lazy stránky v
 * ./routerPages.js, MVP_NAV v ./navConfig.js (CLAUDE.md limit 300 řádků).
 */

import React, { Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { homePathForRole } from '../services/orgAuth.js';
import {
  LoginPage, RegisterPage, DashboardPage, FamiliesPage, FamilyDetailPage,
  ChildrenPage, ChildDetailPage, ContactsPage, CalendarPage, UsersPage,
  SettingsPage, HubPage, Layout, AdminLayout, SuperAdminDashboard,
  OrgAdminDashboard, TeamDashboard, FosterFamilyDetailPage,
  OrganizationDetailPage, AdminChildDetailPage, TodayPage,
  FamiliesWorkspace, WorkspaceHome, DocumentDetailPanel, ParticipantDetailPanel, NotificationsPage,
  TasksPage, EducationPage, InstitutionsPage,
  Responsive, MobileHomeScreen, MobileFamiliesScreen, MobileCalendarScreen, MobileProfileScreen,
  MobileFamilyDetailScreen, MobileTeamScreen, MobileSettingsScreen, MobileChildDetailScreen,
  MobileVisitTimerScreen, MobileNotificationsScreen, MagicLinkScreen, MobileDocumentDetailScreen,
  MobileParticipantDetailScreen,
  FosterHomeScreen, FosterChildScreen, FosterChatScreen, FosterDocumentScreen,
  EPHomeScreen, EPAuditScreen,
} from './routerPages.js';

// Legacy AuthContext ODSTRANĚN 2026-07-03 (redirect smyčka) — viz
// legacy-modules/router-auth-context.jsx. MVP_NAV je v ./navConfig.js.

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

// ── Nový B2B SaaS role guard (Zustand authStore, ne legacy AuthContext) ──
// Používá se jen na /admin/* větvi — starší /prehled apod. zůstávají na
// RequireAuth výše (jen ověří přihlášení, ne konkrétní roli).

function RequireOrgRole({ allowed }) {
  const { loading, currentUser: user, role } = useAuthStore();
  const location = useLocation();

  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!allowed.includes(role)) {
    // Přihlášen, ale jiná role — pošli na JEHO domovskou stránku, ne na login.
    return <Navigate to={homePathForRole(role)} replace />;
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
  if (currentUser) return <Navigate to={role ? homePathForRole(role) : '/prehled'} replace />;
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
  // Dokončení magic-link přihlášení pěstouna (2026-07-06 §A) — veřejné,
  // sem míří odkaz z e-mailu; obrazovka sama dokončí sign-in a přesměruje.
  { path: '/prihlaseni', element: <Suspense fallback={<Loading />}><MagicLinkScreen /></Suspense> },

  {
    element: <RequireAuth />,
    children: [
      { path: '/prehled',         element: <Suspense fallback={<Loading />}><DashboardPage /></Suspense> },
      { path: '/pestouni',        element: <Suspense fallback={<Loading />}><FamiliesPage /></Suspense> },
      { path: '/pestouni/:id',    element: <Suspense fallback={<Loading />}><FamilyDetailPage /></Suspense> },
      { path: '/deti',            element: <Suspense fallback={<Loading />}><ChildrenPage /></Suspense> },
      { path: '/deti/:id',        element: <Suspense fallback={<Loading />}><ChildDetailPage /></Suspense> },
      { path: '/kontakty',        element: <Suspense fallback={<Loading />}><ContactsPage /></Suspense> },
      { path: '/vzdelavani',      element: <Suspense fallback={<Loading />}><FamiliesPage /></Suspense> },
      { path: '/hub/:typ/:id',    element: <Suspense fallback={<Loading />}><HubPage /></Suspense> },
      { path: '/uzivatele',       element: <Suspense fallback={<Loading />}><UsersPage /></Suspense> },

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

  // Obrazovka Dnes (Krok 3, 2026-07-03) — domovská stránka klíčové osoby na
  // kořeni "/", stejný AdminLayout shell jako zbytek /admin/* (NE legacy
  // sidebar Layout výš — ten patří starším Sekce A stubům). Jiná role na "/"
  // dostane RequireOrgRole přesměrování na svůj vlastní dashboard.
  {
    element: <Suspense fallback={<Loading />}><AdminLayout title="Dnes" /></Suspense>,
    children: [{
      element: <RequireOrgRole allowed={['klicova_osoba']} />,
      children: [
        { path: '/', element: <Suspense fallback={<Loading />}><Responsive mobile={MobileHomeScreen} desktop={TodayPage} /></Suspense> },
      ],
    }],
  },
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
        { path: '/admin/organizace', element: <Suspense fallback={<Loading />}><Responsive mobile={MobileFamiliesScreen} desktop={OrgAdminDashboard} /></Suspense> },
      ],
    }],
  },
  {
    // Case-management workspace (2026-07-13): desktop = FamiliesWorkspace
    // (master seznam + <Outlet>); mobil průchozí. Data hlídají firestore.rules.
    element: <Suspense fallback={<Loading />}><AdminLayout title="Terén" variant="workspace" /></Suspense>,
    children: [{
      element: <RequireOrgRole allowed={['klicova_osoba', 'org_admin', 'superadmin', 'vedouci_pobocky', 'teamleader']} />,
      children: [{
        element: <Suspense fallback={<Loading />}><FamiliesWorkspace /></Suspense>,
        children: [
          { path: '/admin/terenni', element: <Suspense fallback={<Loading />}><Responsive mobile={MobileFamiliesScreen} desktop={WorkspaceHome} /></Suspense> },
          { path: '/admin/terenni/:familyId',            element: <Suspense fallback={<Loading />}><Responsive mobile={MobileFamilyDetailScreen} desktop={FosterFamilyDetailPage} /></Suspense> },
          { path: '/admin/terenni/:familyId/deti/:childId', element: <Suspense fallback={<Loading />}><Responsive mobile={MobileChildDetailScreen} desktop={AdminChildDetailPage} /></Suspense> },
          // Měření času návštěvy + GPS (2026-07-06) — čistě terénní/mobilní,
          // žádný desktop ekvivalent (viz MobileVisitTimerScreen.jsx).
          { path: '/admin/terenni/:familyId/navsteva',    element: <Suspense fallback={<Loading />}><MobileVisitTimerScreen /></Suspense> },
          { path: '/admin/terenni/:familyId/dokumenty/:docId', element: <Suspense fallback={<Loading />}><Responsive mobile={MobileDocumentDetailScreen} desktop={DocumentDetailPanel} /></Suspense> },
          { path: '/admin/terenni/:familyId/deti/:childId/ucastnici/:epId', element: <Suspense fallback={<Loading />}><Responsive mobile={MobileParticipantDetailScreen} desktop={ParticipantDetailPanel} /></Suspense> },
        ],
      }],
    }],
  },
  {
    element: <Suspense fallback={<Loading />}><AdminLayout title="Tým" /></Suspense>,
    children: [{
      element: <RequireOrgRole allowed={['vedouci_pobocky', 'teamleader']} />,
      children: [
        { path: '/admin/tym', element: <Suspense fallback={<Loading />}><Responsive mobile={MobileTeamScreen} desktop={TeamDashboard} /></Suspense> },
      ],
    }],
  },
  {
    // Úkoly / termíny a Vzdělávání (2026-07-13) — zaměstnanci organizace.
    element: <Suspense fallback={<Loading />}><AdminLayout title="Úkoly" /></Suspense>,
    children: [{
      element: <RequireOrgRole allowed={['klicova_osoba', 'org_admin', 'vedouci_pobocky', 'teamleader', 'superadmin']} />,
      children: [
        { path: '/admin/ukoly', element: <Suspense fallback={<Loading />}><TasksPage /></Suspense> },
        { path: '/admin/vzdelavani', element: <Suspense fallback={<Loading />}><EducationPage /></Suspense> },
        { path: '/admin/instituce', element: <Suspense fallback={<Loading />}><InstitutionsPage /></Suspense> },
      ],
    }],
  },
  {
    // Kalendář — pod AdminLayout pro VŠECHNY Sekce B role.
    element: <Suspense fallback={<Loading />}><AdminLayout title="Kalendář" /></Suspense>,
    children: [{
      element: <RequireOrgRole allowed={['klicova_osoba', 'org_admin', 'vedouci_pobocky', 'teamleader', 'superadmin']} />,
      children: [
        { path: '/kalendar', element: <Suspense fallback={<Loading />}><Responsive mobile={MobileCalendarScreen} desktop={CalendarPage} /></Suspense> },
      ],
    }],
  },
  {
    // Profil — cíl tab v MobileShell.jsx (mobil). Desktop bez odkazu (tam
    // funkci plní avatar dropdown v AdminTopbar).
    element: <Suspense fallback={<Loading />}><AdminLayout title="Profil" /></Suspense>,
    children: [{
      element: <RequireOrgRole allowed={['klicova_osoba', 'org_admin', 'vedouci_pobocky', 'teamleader', 'superadmin', 'pestoun', 'external']} />,
      children: [
        { path: '/profil', element: <Suspense fallback={<Loading />}><MobileProfileScreen /></Suspense> },
      ],
    }],
  },

  {
    // Notifikační centrum (2026-07-06) — všechny role včetně pěstouna.
    element: <Suspense fallback={<Loading />}><AdminLayout title="Oznámení" /></Suspense>,
    children: [{
      element: <RequireOrgRole allowed={['klicova_osoba', 'org_admin', 'vedouci_pobocky', 'teamleader', 'superadmin', 'pestoun']} />,
      children: [
        { path: '/oznameni', element: <Suspense fallback={<Loading />}><Responsive mobile={MobileNotificationsScreen} desktop={NotificationsPage} /></Suspense> },
      ],
    }],
  },

  {
    // Pěstounská PWA (2026-07-06, docs/domain/chat-a-pestounska-appka.md) —
    // omezený strom /moje/*, VÝHRADNĚ role pestoun. Ostatní role sem nesmí
    // (RequireOrgRole je pošle na jejich domovskou stránku).
    element: <Suspense fallback={<Loading />}><AdminLayout title="Moje" /></Suspense>,
    children: [{
      element: <RequireOrgRole allowed={['pestoun']} />,
      children: [
        { path: '/moje', element: <Suspense fallback={<Loading />}><FosterHomeScreen /></Suspense> },
        { path: '/moje/chat', element: <Suspense fallback={<Loading />}><FosterChatScreen /></Suspense> },
        { path: '/moje/deti/:childId', element: <Suspense fallback={<Loading />}><FosterChildScreen /></Suspense> },
        { path: '/moje/dokumenty/:docId', element: <Suspense fallback={<Loading />}><FosterDocumentScreen /></Suspense> },
      ],
    }],
  },

  {
    // Appka externího účastníka (2026-07-06, docs/domain/externi-ucastnici.md) —
    // strom /ucastnik/*, VÝHRADNĚ role external. Vidí jen povolené (granty).
    element: <Suspense fallback={<Loading />}><AdminLayout title="Účastník" /></Suspense>,
    children: [{
      element: <RequireOrgRole allowed={['external']} />,
      children: [
        { path: '/ucastnik', element: <Suspense fallback={<Loading />}><EPHomeScreen /></Suspense> },
        { path: '/ucastnik/audit', element: <Suspense fallback={<Loading />}><EPAuditScreen /></Suspense> },
      ],
    }],
  },

  {
    // Nastavení — dřív mimo AdminLayout (legacy sidebar Sekce A, žádný tab
    // bar/topbar Sekce B) — opraveno 2026-07-06, viz AdminTopbar/AdminSidebar
    // odkazy i MobileProfileScreen.jsx.
    element: <Suspense fallback={<Loading />}><AdminLayout title="Nastavení" /></Suspense>,
    children: [{
      element: <RequireOrgRole allowed={['klicova_osoba', 'org_admin', 'vedouci_pobocky', 'teamleader', 'superadmin']} />,
      children: [
        { path: '/nastaveni', element: <Suspense fallback={<Loading />}><Responsive mobile={MobileSettingsScreen} desktop={SettingsPage} /></Suspense> },
      ],
    }],
  },

  { path: '*', element: <Navigate to="/prehled" replace /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
