# 02 — Technologie a architektura

## Stack (jediný povolený — CLAUDE.md)

| Vrstva | Technologie | Poznámka |
|--------|-------------|----------|
| UI | React 18 + Vite | SPA, lazy routes |
| Styly | Tailwind CSS | VŠECHNY barvy jen z tokenů v `tailwind.config.js`; zakázané: inline `style={{}}`, ad-hoc hexy, MUI, Bootstrap, jQuery |
| Ikony | lucide-react | jediný ikonový systém, žádná emoji |
| Routing | react-router-dom v6 | `createBrowserRouter`, vnořené `<Outlet>` |
| State | zustand (`authStore`) | jediný globální store; zbytek lokální state + hooky |
| i18n | react-i18next, jen `cs` | pattern `t('klíč', 'český default')` — viz níže |
| Backend | Firebase: Auth, Firestore, Hosting | Storage a Functions v2 zatím NEPROVOZOVÁNY (dev projekt je nemá zapnuté) |
| AI | Vertex AI (Gemini) přes EU proxy | zatím jen plán/seam; mock fallback |
| PWA | vite-plugin-pwa | generateSW, auto-update bez zavření appky |
| Fonty | @fontsource-variable/inter (desktop), noto-sans (mobil) | lokálně bundlované, žádné CDN |

## Prostředí (KRITICKÉ — nauč se hned)

- `.firebaserc` default = **doprovazeni-dev** (dev Firebase projekt, prázdný od
  reálných dat, vlastní seed). Všechno bez `-P` flagu jde SEM.
- **prod** = alias `opportune-cairn-500111-b-b2bea` (na něm doména
  moje.doprovazeni.com). Deploy na prod VŽDY jen s výslovným souhlasem
  uživatele v dané session (`firebase deploy --only hosting -P prod`).
- ⚠️ Prod credentials jsou v `.env.prod.credentials.local` (gitignored).
  NIKDY je nedávat do `.env.production.local` — Vite ho při `npm run build`
  automaticky načte a zapeče prod config do bundle (už se stalo, viz kap. 08).
- Bundle nasazený na prod hosting ZÁMĚRNĚ mluví s DEV backendem (prototyp).
- Dev seed: `npm run seed`, `scripts/seed-permission-test-accounts.mjs`,
  `scripts/seed-calendar-events.mjs`; bootstrap superadmin
  `dev-admin@doprovazeni.dev` (heslo v `.env.local`).

## Struktura kódu

```
src/
├── core/            router.jsx (JEN skládání rout), routerPages.js (lazy),
│                    navConfig.js, Layout.jsx (LEGACY sekce A — nesahat)
├── modules/         DESKTOP stránky po doménách:
│   ├── admin/       ~vše podstatné: workspace/, documents/, participants/,
│   │                TodayPage, FosterFamilyDetailPage, ChildDetailPage,
│   │                AdminLayout/Sidebar/Topbar, CommandPalette…
│   ├── calendar/    CalendarPage + useCalendarWeek (sdílený hook s mobilem)
│   ├── tasks/ education/ institutions/ users/ families(stub)/ children(stub)/
├── mobile/          SAMOSTATNÁ mobilní vrstva (viz kap. 04) — vlastní
│                    ui/ primitivy (Native*) a screens/; render <1024px
├── components/ui/   sdílená DESKTOP knihovna (Button, Card, Badge, Tabs,
│                    Table, Drawer, Modal, Input, Avatar, EmptyState, Toast…)
├── services/
│   ├── orgService.js   BARREL — jediný import bod pro komponenty
│   ├── org/*.js        doménové služby (fosterFamilies, children, events,
│   │                   timeline, messages, notifications, documents,
│   │                   documentWorkflow, externalParticipants, externalGrants,
│   │                   externalAudit, tasks, institutions, reports, codelists,
│   │                   fosterAccess, ocr[seam], shared.js[interní helpery])
│   ├── orgAuth.js      role helpery, signOut, magic-link, homePathForRole
│   └── firebase.js     init
├── shared/          domainConstants.js (role, CARE_TYPES, REL_TYPES, respit
│                    matematika), chatConstants, documentConstants,
│                    externalPermissions (permission engine!), rcUtils, idUtils
├── store/           authStore.js (zustand + onSnapshot na users/{uid}),
│                    toastStore.js
└── locales/cs.json  + i18n.js (returnNull:false)
```

## Klíčové architektonické vzory

1. **Komponenty NIKDY nevolají Firestore přímo** — vždy přes services.
   Služby čtou aktuálního uživatele přes `useAuthStore.getState()`.
2. **Barrel `orgService.js`** re-exportuje všechny org/* služby — komponenty
   importují z jednoho místa. POZOR: `signOut`/`roleLabel` jsou v `orgAuth.js`,
   ne v barrelu (častá chyba importu).
3. **Mobil/desktop = dvě oddělené UI vrstvy, sdílená datová vrstva.**
   `Responsive.jsx` vybírá komponentu per route podle `useIsMobile()`
   (<1024px). Žádné sdílené JSX, žádné `lg:` míchání. Sdílí se: services,
   hooky bez UI (`useChatThread`, `useCalendarWeek`, `useTodayPage`,
   `useChildDetailForms/Lists`, `useFosterFamilyDetail`).
4. **Tvrdý limit 300 řádků/soubor v src/** (eslint `max-lines`, build spadne).
   Dělící vzor: stránka = kompozice; state do `useXxx.js` hooku; taby do
   `XxxTab.jsx`; dialogy do `XxxModals.jsx`.
5. **i18n pattern**: `t('prefix.klíč', 'český default')` — default v kódu je
   zdroj pravdy, klíče se do `cs.json` NEPŘIDÁVAJÍ (jednojazyčná appka;
   2. jazyk = naplnit klíče z defaultů). Prefixy: `dsk.` desktop, `m.` mobil.
   Výjimka: popisky z `domainConstants.js`/`*Constants.js` (číselníky) se
   NEobalují — jejich i18n je budoucí úkol přes translation_keys.
   Starší obrazovky používají klasické klíče z `cs.json` (`family.detail.*`,
   `today.*`) — nech je být.
6. **Deploy**: `npm run lint` (max-warnings 0) + `npm run build` musí projít
   před každým nasazením/commitem. `firebase deploy --only hosting` (dev),
   `-P prod` (jen se souhlasem). Rules: `firebase deploy --only firestore:rules`.
7. **Denormalizace**: počítadla (lastVisitAt…) aktualizuje výhradně služba,
   v jednom `writeBatch` se zápisem, který je vyvolal.

## Jak se appka spouští a ověřuje

- Dev server: přes preview nástroj (launch.json name `vite-dev`, port 5173).
- Ověřování UI: každou obrazovku na 390×844 (mobil) i desktopu; při
  problémech se screenshotem funguje ověření computed styles přes JS eval.
- ⚠️ AI programátor NIKDY nezadává hesla do přihlašovacích formulářů
  (bezpečnostní pravidlo). Pro přihlášené ověření: požádej uživatele, nebo
  si na DEV nech od uživatele potvrdit použití seed účtů.
