/**
 * routerPages.js — lazy-loaded stránky pro router.jsx, vytaženo do
 * vlastního souboru (CLAUDE.md limit 300 řádků). Čistě deklarace, žádná
 * logika — router.jsx zůstává směrovač/konfigurace.
 */

import { lazy } from 'react';

// ── Lazy-loaded MVP stránky (Sekce A) ──────────────────────────
export const LoginPage        = lazy(() => import('../modules/users/Login.jsx'));
export const RegisterPage     = lazy(() => import('../modules/users/RegisterPage.jsx'));
export const DashboardPage    = lazy(() => import('../modules/families/DashboardPage'));
export const FamiliesPage     = lazy(() => import('../modules/families/FamiliesPage'));
export const FamilyDetailPage = lazy(() => import('../modules/families/FamilyDetailPage'));
export const ChildrenPage     = lazy(() => import('../modules/children/ChildrenPage'));
export const ChildDetailPage  = lazy(() => import('../modules/children/ChildDetailPage'));
export const ContactsPage     = lazy(() => import('../modules/companies/ContactsPage'));
export const CalendarPage     = lazy(() => import('../modules/calendar/CalendarPage'));
export const UsersPage        = lazy(() => import('../modules/users/UsersPage'));
export const SettingsPage     = lazy(() => import('../modules/users/SettingsPage'));
export const HubPage          = lazy(() => import('../modules/families/HubPage'));
export const Layout           = lazy(() => import('./Layout.jsx'));

// ── Nové B2B SaaS dashboardy (2026-07-01, viz modules/admin) ──
export const AdminLayout            = lazy(() => import('../modules/admin/AdminLayout.jsx'));
export const SuperAdminDashboard    = lazy(() => import('../modules/admin/SuperAdminDashboard.jsx'));
export const OrgAdminDashboard      = lazy(() => import('../modules/admin/OrgAdminDashboard.jsx'));
export const KlicovaOsobaDashboard  = lazy(() => import('../modules/admin/KlicovaOsobaDashboard.jsx'));
export const TeamDashboard          = lazy(() => import('../modules/admin/TeamDashboard.jsx'));
export const FosterFamilyDetailPage = lazy(() => import('../modules/admin/FosterFamilyDetailPage.jsx'));
export const OrganizationDetailPage = lazy(() => import('../modules/admin/OrganizationDetailPage.jsx'));
export const AdminChildDetailPage   = lazy(() => import('../modules/admin/ChildDetailPage.jsx'));
export const TodayPage              = lazy(() => import('../modules/admin/TodayPage.jsx'));

// ── Mobilní obrazovky (STRICT UI/UX DESIGN MANDATE, 2026-07-05) — vlastní
// strom src/mobile/, Responsive.jsx vybírá mobil/desktop, žádné sdílení JSX.
export const Responsive             = lazy(() => import('../mobile/Responsive.jsx'));
export const MobileHomeScreen       = lazy(() => import('../mobile/screens/MobileHomeScreen.jsx'));
export const MobileFamiliesScreen   = lazy(() => import('../mobile/screens/MobileFamiliesScreen.jsx'));
export const MobileCalendarScreen   = lazy(() => import('../mobile/screens/MobileCalendarScreen.jsx'));
export const MobileProfileScreen    = lazy(() => import('../mobile/screens/MobileProfileScreen.jsx'));
export const MobileFamilyDetailScreen = lazy(() => import('../mobile/screens/MobileFamilyDetailScreen.jsx'));
export const MobileTeamScreen       = lazy(() => import('../mobile/screens/MobileTeamScreen.jsx'));
export const MobileSettingsScreen   = lazy(() => import('../mobile/screens/MobileSettingsScreen.jsx'));
export const MobileChildDetailScreen = lazy(() => import('../mobile/screens/MobileChildDetailScreen.jsx'));
export const MobileVisitTimerScreen  = lazy(() => import('../mobile/screens/MobileVisitTimerScreen.jsx'));
export const MobileNotificationsScreen = lazy(() => import('../mobile/screens/MobileNotificationsScreen.jsx'));
export const MagicLinkScreen   = lazy(() => import('../mobile/screens/MagicLinkScreen.jsx'));

export const MobileDocumentDetailScreen = lazy(() => import('../mobile/screens/documents/MobileDocumentDetailScreen.jsx'));

// ── Pěstounská PWA (2026-07-06, docs/domain/chat-a-pestounska-appka.md) ──
// Omezená appka role `pestoun` — vlastní strom /moje/*.
export const FosterHomeScreen  = lazy(() => import('../mobile/screens/foster/FosterHomeScreen.jsx'));
export const FosterChildScreen = lazy(() => import('../mobile/screens/foster/FosterChildScreen.jsx'));
export const FosterChatScreen  = lazy(() => import('../mobile/screens/foster/FosterChatScreen.jsx'));
export const FosterDocumentScreen = lazy(() => import('../mobile/screens/foster/FosterDocumentScreen.jsx'));

// Non-MVP (zakomentováno):
// export const WorkflowPage     = lazy(() => import('../modules/workflow/WorkflowPage'));
// export const MarketplacePage  = lazy(() => import('../modules/marketplace/MarketplacePage'));
// export const AIAgentsPage     = lazy(() => import('../modules/ai/AIAgentsPage'));
// export const OCRPage          = lazy(() => import('../modules/documents/OCRPage'));
// export const AdvancedReports  = lazy(() => import('../modules/reports/AdvancedReportsPage'));
// export const MonetizationPage = lazy(() => import('../modules/admin/MonetizationPage'));
