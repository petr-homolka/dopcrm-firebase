# CURRENT_STATE
**Verze:** 1.2.1 (Oprava bílé obrazovky v produkci — chybějící Firebase env proměnné v CI, 2026-07-02)

## 2026-07-02 — Incident: bílá obrazovka na moje.doprovazeni.com (VYŘEŠENO)

**Příčina:** GitHub Actions build (`npm ci && npm run build`) neměl nastavené `VITE_FIREBASE_*`
proměnné (jen lokální `.env.local`, gitignored) → Vite zapekl `apiKey: undefined` do bundlu →
`getAuth(app)` spadl synchronně před prvním renderem, appka bez error boundary → bílá stránka.
Neprojevilo se dřív, protože předchozí 2 CI běhy byly bajtově identické s dřívějším ručním deployem
(viz historie níže) — commit `d6bd949` byl první SKUTEČNÝ CI-driven deploy, proto se chyba objevila.

**Oprava (commit `d422989`, 2026-07-01):**
- `.github/workflows/*.yml` — build krok teď čte `VITE_FIREBASE_*` z GitHub repo secrets.
- `firebase.json` — `no-cache` na `index.html`/`sw.js`/manifest, dlouhý immutable cache na
  `/assets/**`, zúžený rewrite (chybějící hashovaný asset → skutečné 404, ne maskované jako HTML) —
  brání stejnému symptomu po budoucích deployích i z jiné příčiny.
- `src/core/ErrorBoundary.jsx` (+ `App.js`) — defense-in-depth, budoucí neočekávaná chyba v renderu
  ukáže hlášku místo tiché bílé obrazovky.
- Uživatel doplnil 7 GitHub secrets (`VITE_FIREBASE_API_KEY/AUTH_DOMAIN/PROJECT_ID/STORAGE_BUCKET/
  MESSAGING_SENDER_ID/APP_ID/MEASUREMENT_ID`) do `dopcrm-firebase` repa — tento commit je jen
  bezobsahový trigger pro nový CI běh, aby se secrets skutečně použily.

---

## 2026-07-01 — B2B SaaS hierarchie (SuperAdmin → Organizace → Zaměstnanci → Pěstouni → Děti)

**Zadání dne:** vedle stávajícího generického prototypového modelu (`tenants/{tenantId}/data_objects`,
role superadmin/vedeni/ko/asistent/pestoun/dite/externista, viz níže „Beze změny od v0.9.8") postavit
**nové, explicitní multi-tenant Firestore schéma** odpovídající SaaS hierarchii: SaaS Poskytovatel →
Doprovázející organizace (tenant) → Zaměstnanci (Management/Service/Klíčové osoby) → Pěstouni → Děti.
**Obě vrstvy běží vedle sebe** (staré moduly Kalendář/Dokumenty/Reporty/Workflow dál používají starý model
beze změny) — nové je jen `/login` + tři nové dashboardy na `/admin/*`.

### Firestore schéma (root kolekce, NE subkolekce tenanta)

```
organizations/{orgId}
  name, plan, status: 'trial'|'active'|'suspended'|'cancelled'
  createdAt, createdBy, updatedAt

users/{uid}                         // JEN zaměstnanci — pěstouni/děti zde NEJSOU (nemají Auth účet)
  email, displayName
  role: 'superadmin' | 'org_admin' | 'klicova_osoba'
  organizationId: string | null     // null jen pro superadmina
  department: 'management' | 'service' | 'terenni' | null
  active: boolean
  createdAt, createdBy, updatedAt

foster_families/{familyId}          // klientské rodiny — NEJSOU Auth uživatelé
  organizationId, name, address, contactPhone, contactEmail
  assignedTo: uid                   // klíčová osoba odpovědná za rodinu
  status: 'active' | 'paused' | 'exited'
  note
  createdAt, createdBy, updatedAt

children/{childId}
  organizationId, assignedTo        // DENORMALIZOVÁNO z rodičovské foster_family (kvůli rules/dotazům)
  fosterFamilyId, firstName, lastName, birthDate
  status: 'active' | 'transferred' | 'aged_out'
  note
  createdAt, updatedAt
```

Indexy: `firestore.indexes.json` (foster_families×organizationId/createdAt,
foster_families×assignedTo/createdAt, children×fosterFamilyId, users×organizationId/role).

### Firestore Security Rules (`firestore.rules`, „SEKCE B" — nová, přidaná vedle staré „SEKCE A")

- **superadmin** — plný přístup napříč organizacemi.
- **org_admin** — plné CRUD `users`/`foster_families`/`children` VE VLASTNÍ organizaci; nesmí založit
  superadmina ani zasahovat do cizí organizace.
- **klicova_osoba** — **čte** celou svou organizaci (přehled/zastupitelnost kolegů), ale **zapisuje/maže**
  jen `foster_families`/`children`, kde `assignedTo == její uid`. Nesmí zakládat nové rodiny (to řeší
  org_admin/superadmin).
- `organizations` — čtení jen vlastní organizace, zápis jen superadmin.

### Web (React) — nové soubory

- `src/store/authStore.js` — **Zustand** store (`currentUser`, `profile`, `organizationId`, `role`,
  `loading`), `bootstrapAuthStore()` volaný v `main.jsx`, real-time `onSnapshot` na `users/{uid}`.
- `src/services/orgAuth.js` — `signIn/signOut/dashboardPathForRole` pro nové schéma (odděleno od
  legacy `services/auth.js`, který zůstává pro starší moduly).
- `src/services/orgService.js` — CRUD `organizations/users/foster_families/children`. Zvláštnost:
  `createEmployee()` řeší, že Firebase Auth na klientovi nemá „vytvoř účet, ale nepřihlas mě jako něj" —
  používá **dočasnou sekundární Firebase App instanci** (`initializeApp(config, 'secondary-...')`), aby
  založení nového zaměstnance neodhlásilo aktuálního superadmina/org_admina. **TODO V8:** nahradit Cloud
  Function (Admin SDK, `onCall`) — připraveno jako komentář v souboru.
- `src/modules/admin/AdminLayout.jsx` — jednoduchý topbar shell (ne stará sidebar `core/Layout.jsx`).
- `src/modules/admin/SuperAdminDashboard.jsx` — `/admin/superadmin`: seznam organizací + modal
  „Nová organizace" (založí org + rovnou jejího prvního `org_admin`).
- `src/modules/admin/OrgAdminDashboard.jsx` — `/admin/organizace`: seznam zaměstnanců organizace +
  modal „Přidat zaměstnance" (role `org_admin`/`klicova_osoba`, oddělení), aktivace/deaktivace.
- `src/modules/admin/KlicovaOsobaDashboard.jsx` — `/admin/terenni`: Bento Grid karty přidělených
  pěstounských rodin (`listFostersAssignedTo`).
- `src/modules/admin/FosterFamilyDetailPage.jsx` — `/admin/terenni/:familyId`: detail rodiny + seznam
  svěřených dětí (přístupné i `org_admin` pro čtení).
- `src/modules/users/Login.jsx` — přepracováno na `orgAuth.signIn` + `authStore`; po přihlášení redirect
  na `dashboardPathForRole(role)`.
- `src/core/router.jsx` — přidán `RequireOrgRole` guard (Zustand, nezávislý na legacy `AuthContext`) +
  routy `/admin/superadmin`, `/admin/organizace`, `/admin/terenni`, `/admin/terenni/:familyId`.

**Nová závislost:** `zustand` (`^5.0.14`).

**⚠️ Bootstrap prvního superadmina (nutný ruční krok, jinak se nikdo nedostane dovnitř nového systému):**
Appka umí založit organizaci + org_admina JEN pokud už je někdo přihlášený jako superadmin — pro úplně
první účet je potřeba jednorázově ručně:
1. Firebase Console → Authentication → Add user (e-mail/heslo).
2. Firebase Console → Firestore → kolekce `users` → nový dokument s ID = **UID** toho uživatele:
   `{ email, displayName, role: "superadmin", organizationId: null, department: null, active: true }`.
3. Přihlásit se na `/login` — appka pozná roli a přesměruje na `/admin/superadmin`.

### Mobil (Expo) — Krok 4, terénní modul klíčové osoby

Viz `pestouni-crm-mobile/CURRENT_STATE.md` pro detail — shrnutí: appka je teď postavená na stejném
`users/foster_families/children` schématu, session v `expo-secure-store`, Firestore
`persistentLocalCache` (offline-first), hlavní obrazovka = jen rodiny přidělené přihlášené klíčové osobě.

### Ověření (2026-07-01)

- `npm run build` (web) — ✅ bez chyb.
- `npx expo export --platform web` a `--platform android` (mobil) — ✅ bez chyb (625, resp. 940 modulů).
- Vizuální ověření `/login` v Preview (Bento styl, MUI) — načítá se a renderuje správně; jediné console
  warningy jsou pre-existující MUI prop-forwarding hlášky (`textAlign`/`InputProps` na DOM elementu),
  nesouvisí s dnešní změnou.
- **`firebase deploy --only firestore:rules,firestore:indexes`** — ✅ nasazeno do produkčního projektu
  `opportune-cairn-500111-b-b2bea` (rules zkompilovány a released, indexy nasazeny).
- End-to-end proklik SuperAdmin→OrgAdmin→KlíčováOsoba **nebyl** ověřen živě (chybí jen bootstrap
  prvního superadmin účtu, viz výše — appka i pravidla jsou už nasazená a připravená).

### Chybí / TODO (nové schéma)

- Bootstrap prvního superadmina (ruční, viz výše) — zvážit jednorázový seed skript pro V8.
- `createEmployee()` (sekundární Firebase App instance) nahradit Cloud Function (Admin SDK) ve V8 —
  bezpečnější a nevyžaduje duplicitní `firebaseConfig` na klientovi.
- Reálné end-to-end ověření (založit org → org_admin přidá KO → přiřadit rodinu → KO vidí na
  webu i mobilu) — po bootstrapu prvního superadmina už nic dalšího nebrání.
- Sjednotit/legacy: staré moduly (`Pěstouni`/`Děti`/`Kontakty` v MVP_NAV) pořád běží na
  `tenants/{tenantId}/data_objects` — do budoucna zvážit migraci na nové schéma nebo explicitní zánik.

---

**Verze:** 1.1.0 (CI/CD — automatický deploy z GitHubu)
**Živá URL:** https://opportune-cairn-500111-b-b2bea.web.app
**Vlastní doména:** https://moje.doprovazeni.com (CNAME → opportune-cairn-500111-b-b2bea.web.app, Firebase Hosting custom domain, status: successfully verified)
**GitHub repo:** https://github.com/petr-homolka/dopcrm-firebase (branch `main`)
**Aktuální cíl:** Rozšířit Bento Grid layout na další moduly (Pěstouni, Děti, Kontakty…), naplnit Firestore testovacími daty.

**Mobil (pestouni-crm-mobile) — POZASTAVENO (2026-06-30):**
Expo Go na zařízení uživatele stále hlásí nekompatibilitu i po downgradu na SDK 56 a aktualizaci appky.
Mobilní vývoj se dál neřeší dnes — viz `pestouni-crm-mobile/CURRENT_STATE.md` pro plný stav a TODO,
až se k tomu vrátíme. Web pokračuje samostatně.

**CI/CD — GitHub → Firebase Hosting (2026-06-30, NOVĚ HOTOVO):**
- Git repo (lokální, `main` branch) propojen s GitHubem: `git remote origin` → `https://github.com/petr-homolka/dopcrm-firebase.git`
- **Push permission fix:** uložený git credential na tomto PC patřil účtu „Doprovazeni" bez zápisu do repa → uživatel přidal „Doprovazeni" jako collaborator s právem zápisu → push funguje
- `firebase init hosting:github` (spuštěno uživatelem interaktivně, autorizace GitHub App v prohlížeči jako `petr-homolka`):
  - Vytvořen GCP service account `github-action-1285520940` s Firebase Hosting Admin právy
  - JSON klíč nahrán jako GitHub secret `FIREBASE_SERVICE_ACCOUNT_OPPORTUNE_CAIRN_500111_B_B2BEA` (repo Settings → Secrets)
  - `.github/workflows/firebase-hosting-merge.yml` — **push do `main`** → `npm ci && npm run build` → deploy na live kanál (`moje.doprovazeni.com`)
  - `.github/workflows/firebase-hosting-pull-request.yml` — PR → preview deploy (vygenerováno automaticky, i když jsme původně chtěli jen merge-deploy; ponecháno, nevadí)
- **Od teď: `git push` do `main` = automatický build + deploy.** `npm run deploy` (ruční) zůstává funkční jako fallback, ale už není potřeba.
- Workflow soubory zacommitované a pushnuté (`98f7e7e`) — první automatický běh spuštěn tímto pushem, ověřit stav na https://github.com/petr-homolka/dopcrm-firebase/actions

**Firebase Hosting — konfigurace:**
- `firebase.json` — `hosting.public = "dist"`, `ignore` (firebase.json, dotfiles, node_modules), `rewrites` `**` → `/index.html` (SPA fallback)
- `.firebaserc` — `default` projekt `opportune-cairn-500111-b-b2bea`
- `package.json` → skript `"deploy": "vite build && firebase deploy --only hosting"` (ruční fallback)
- `firebase-tools` jako devDependency

**Co je funkční (web, beze změny od v0.9.8):**
- Firebase Auth (Email/Password, uživatel petr.homolka@doprovazeni.com)
- Firestore databáze (europe-west3), kolekce `user_roles`
- RBAC: role `superadmin` načtena z `user_roles/Me2AINlkoofbBrLQkcz9DAbufED3`
- MUI (Material Design 3) + **Bento Grid styl**: `theme.js` export `bento` (radius 20, shadow scale, hover scale 1.02), `MuiCard` override
- `DashboardPage.jsx` v bento layoutu: hero pozdrav karta (span 2) + 2× KPI karta + full-width karta s tabulkou posledních rodin
- `Layout.jsx` (MUI Drawer/AppBar), `Login.jsx` (MUI), `dataService.js`
- Production build ověřen bez chyb (978 modulů)

**Vite dev server:** `npm run dev` → localhost:5173 (nebo 5174 je-li 5173 obsazený)
**Vanilla prototyp:** stále funkční (prehled.html, hub.html atd. — nedotčeno), FTP deploy nezměněn

**Tenant:** `tenantId: "doprovazeni-brno"` (v user_roles dokumentu)

**Známá neškodná chyba CI/CD (2026-07-01):** První 2 automatické běhy skončily červeně —
`FAILED_PRECONDITION: Can't release ... supplied version is the current active version`.
Příčina: push obsahoval jen změny v `.md`/`.yml` souborech, ne v `src/`, takže `npm run build`
vyprodukoval bajt-přesně stejný `dist/` jako už nasazená verze (z předchozího ručního
`npm run deploy`) → Firebase odmítne "vydat" verzi, která je už aktivní. **Appka zůstává
správně nasazená a funkční**, jde jen o kosmetický červený status. Ověří se automaticky
zeleně při příštím pushi se skutečnou změnou v `src/`.

**Chybí / TODO (nasazení):**
- Ověřit v GitHubu (Actions tab), že při příští reálné změně kódu (`src/`) proběhne běh zeleně
- Zvážit nasazení Firestore Security Rules zároveň (`firebase deploy --only hosting,firestore:rules`), zatím test mode
- `FIREBASE_SERVICE_ACCOUNT_...` secret obsahuje citlivý JSON klíč — nikdy ho nevypisovat do chatu/logů, spravovat jen přes GitHub repo Settings → Secrets

**Chybí / TODO (web, obecně):**
- Bento Grid layout rozšířit na ostatní stub stránky (Pěstouni, Děti, Kontakty, Kalendář, Dokumenty, Vzdělávání, Uživatelé, Nastavení, Hub)
- V Firestore zatím neexistují žádné `data_objects` dokumenty typu `family`/`child` → Dashboard zobrazí 0 / „Žádné rodiny k zobrazení" (očekávané, čeká na reálná data)
- Firestore Security Rules nasadit (`firebase deploy --only firestore:rules`)
- Přepnout Firestore z test mode na produkční rules před ostrým provozem
