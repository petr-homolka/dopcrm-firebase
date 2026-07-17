# 03 — Jak funguje desktop

Desktop = „case-management workspace" pro kancelářskou práci. Směr zvolil
uživatel explicitně (2026-07-13) z nabídky variant: **hustý třípanelový
master-detail**, ne minimalistický dashboard. (Pozn.: nová text-first vize
z 2026-07-17 mění VIZUÁL, ne tuto strukturu — viz kap. 09.)

## Shell

- **`AdminLayout.jsx`** — přepíná mobil (`MobileShell`) vs. desktop
  (sidebar + topbar + obsah). Má `variant`:
  - `'page'` (default) — centrovaný obsah max-w 1280px, stránka scrolluje.
  - `'workspace'` — full-bleed, `<Outlet>` dostane 100dvh−topbar a řídí si
    vlastní sloupce a scroll (používá jen /admin/terenni).
- **`AdminSidebar.jsx`** — SBALITELNÝ: výchozí 64px ikonový rail (tooltip,
  aktivní levý proužek), rozbalení na 240px; stav v localStorage
  (`dop.sidebar.collapsed`). Položky per role: KO = Dnes, Moje rodiny,
  Kalendář, Úkoly, Vzdělávání, Ostatní; org_admin = Organizace + …;
  vedoucí/TL = Tým + …; superadmin = Organizace. Dole Nastavení + toggle.
  Barevné dlaždice modulů (module.* tokeny).
- **`AdminTopbar.jsx`** — hledání rodin (klientský filtr, debounce 300 ms),
  „⌘K" hint, org badge, „?" (toast stub), **zvonek napojený na reálné
  notifikace** (odznak počtu nepřečtených, poll 60 s, dropdown posledních 20,
  Označit vše, proklik na `n.link`), avatar dropdown (Nastavení, Odhlásit).
- **`CommandPalette.jsx`** — Ctrl/⌘+K globální hledání rodin + dětí
  (role-aware; data se načtou jednou při prvním otevření), ↑/↓/Enter/Esc.

## Workspace (/admin/terenni)

`workspace/FamiliesWorkspace.jsx` = třípanel:
- Střední MASTER sloupec 340px: seznam rodin (hledání, segment Aktivní/Archiv,
  přepínač **Moje/Celá organizace** pro KO — hierarchická viditelnost,
  „+ Nová" → NewFamilyModal), řazení česky (`localeCompare('cs')`), aktivní
  řádek zvýrazněn, footer s počtem.
- Pravý DETAIL přes `<Outlet>` — sem se renderují všechny detailové routy.
- **Na mobilu je workspace průchozí** — vrací jen `<Outlet>`, fetch je za
  `if (!isMobile)` (mobilní obrazovky mají vlastní full-screen layout).

Vnořené routy (guard: klicova_osoba, org_admin, superadmin, vedouci_pobocky,
teamleader; poslední dva read-only přes `canManage`):
- `/admin/terenni` → desktop `WorkspaceHome` (uvítací panel) / mobil seznam
- `/admin/terenni/:familyId` → `FosterFamilyDetailPage`
- `.../deti/:childId` → `ChildDetailPage` (admin)
- `.../dokumenty/:docId` → `DocumentDetailPanel`
- `.../deti/:childId/ucastnici/:epId` → `ParticipantDetailPanel`
- `.../navsteva` → jen mobilní (GPS časomíra), desktop ekvivalent neexistuje záměrně

## Detail rodiny (`FosterFamilyDetailPage`)

Panelový hero (avatar, jméno, badge typu péče + stavu, kontakty, poznámka,
akce „Naplánovat návštěvu" → /kalendar a „Vyplnit report" → ReportGenerateDrawer)
+ podtržené taby:
- **Osa** — timeline rodiny (`FosterFamilyTimelineTab` + `useFamilyTimeline`):
  filtr typu a dítěte, připnuté záznamy (max 3), optimistické přidávání
  s retry/discard, tap-to-edit (immutabilita pozastavena), stránkování po 20.
- **Pěstouni (N)** — osoby + vzdělávací kurzy s ročním součtem vs. limit.
- **Respit a SPVPP** — vykázáno/reálně/limit, nadstandard, události respitu.
- **Sociální prostor** — partner, biologické děti, rodiče (s interním id).
- **Svěřené děti (N)** — proklik na kartu dítěte, přidání dítěte (RČ→datum).
- **Chat** — `FamilyChatTab`, sdílí `useChatThread` s mobilem; 4 úrovně
  soukromí (Poznámka sobě / Interní / Pěstounovi / Pro OSPOD), filtr, bubliny,
  Ctrl+Enter odešle, mazání jen vlastních.
- **Dokumenty** — `FamilyDocumentsTab`: seznam se stavy workflow, Nový
  dokument (markdown koncept), Zaznamenat příchozí (ingest → časová osa).
- **Mapa** — `FamilyMapTab`: PRIVACY-first — adresa se NIKAM neposílá
  automaticky; na klik geokód (Nominatim) + vložený OpenStreetMap iframe;
  „Otevřít v Mapách" je běžný odkaz. Bez API klíče.

## Detail dítěte (`ChildDetailPage` + `ChildDetailTabs`)

8 tabů: Identita (RČ/OP/pas, adresy), Škola, OSPOD a soud (+ rozsudky),
Biologická rodina (REL_TYPES + předchozí pěstouni), Sociální prostor,
Poznámky (append-only), Historie (append-only), **Účastníci** (EP seznam +
pozvání magic linkem → `ChildParticipantsTab`).

## Dokumenty a reporty

- `DocumentDetailPanel` — markdown náhled/editace (verze), připomínka
  pěstouna, **Tisk/PDF** (čisté tiskové okno, vlastní md→HTML), verze, audit.
- `DocumentActionsBar` — stavový automat: Poslat pěstounovi → Označit Konečný
  → Poslat vedení (výběr schvalovatele) → Schválit a uzavřít / Neschválit /
  Uzavřít s výhradou → Odeslat na úřad / Uložit do spisu. Vedení = org_admin,
  vedoucí, teamleader, superadmin.
- `ReportGenerateDrawer` + `org/reports.js` — vybereš období →
  `generateOspodReport` stáhne časovou osu za období (stránkuje s early-stop),
  sestaví markdown „Zprávy o průběhu NRP" (průběh, návštěvy, vzdělávání,
  shrnutí k doplnění) a založí BĚŽNÝ dokument → jde stejným workflow až na
  OSPOD. Report tedy není zvláštní entita — je to dokument.

## Správa externích účastníků (desktop)

`ParticipantDetailPanel` — katalog VŠECH oprávnění po kategoriích se stavem
(Vypnuto / Požádáno / Schváleno / Aktivní / Mimo platnost) + auditní stopa.
`PermissionGrantDrawer` — necitlivé oprávnění: zapnout 1 krokem (platnost
od–do); citlivé: 3 kroky Požádat (doklad: typ + zdroj + důvod) → Schválit
(vedení) → Aktivovat (KO), + časová okna (denně / týdně, den, lichý/sudý
týden, od–do HH:MM). Detail v kap. 05.

## Další stránky

- **Dnes (`TodayPage`)** — agenda KO: pozdrav, quick actions, „K vyřešení"
  (empty state), dnešní program (event karty s barevným levým proužkem dle
  typu), „Čeká na vás" (rodiny bez návštěvy >45 dní, krize >60), příští 3 dny,
  pravý rail (statistika týdne).
- **Kalendář** — agenda + týdenní mřížka, zakládání/úprava/mazání událostí,
  publish workflow, vlastní typy událostí z číselníku organizace (codelists).
- **Úkoly** (`TasksPage`) — kanban dle termínu (Po termínu/Dnes/Tento týden/
  Později), checkbox hotovo (optimistické), filtr Moje/Všechny, drawer.
- **Vzdělávání** (`EducationPage`) — agregace hodin kurzů přes rodiny
  (cap 40 rodin), progress bary vs. 24/24/18 h, filtr Pod plánem/Vše.
- **Ostatní** (`InstitutionsPage`) — adresář institucí dle typu (OSPOD, soud,
  škola, lékař, jiné), hledání, CRUD v draweru.
- **Oznámení** (`NotificationsPage`) — plný seznam, označování přečtených.
- **Nastavení** — profil organizace, slug, číselník typů událostí; TODO
  branding/barvy organizace (viz kap. 11).
- Dashboardy rolí: `OrgAdminDashboard` (zaměstnanci + rodiny),
  `TeamDashboard` (read-only, seskupení dle podřízených KO),
  `SuperAdminDashboard` + `OrganizationDetailPage`.
