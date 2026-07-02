# CURRENT_STATE
**Verze:** 1.5.0 (Fáze 2+3 — Pěstoun/Dítě hloubkově obohaceni, opraven kritický routing/rules bug, 2026-07-02)

## 2026-07-02 — Velký úklid repozitáře (podle UKLID-PROMPT.md)

Vanilla prototyp přesunut do `/legacy` (zamčený archiv, jen pro člověka). Nový `CLAUDE.md` +
`DESIGN.md` (design systém „Přítomnost", soft/playful, Tailwind) nahradily starý handoff dokument
(archivován do `docs/history-claude-md.md`). Tento soubor ořezán na ~200 řádků, starší záznamy
přesunuty do `docs/history.md`. Následuje: extrakce doménové dokumentace do `docs/domain/`,
`docs/INVENTAR.md`, přechod MUI → Tailwind, sjednocení PWA přes vite-plugin-pwa.

## 2026-07-02 — Fáze 2+3: hloubkové obohacení Pěstouna a Dítěte + kritické opravy routingu a Firestore pravidel

**Zadání:** dokončit zbývající dvě fáze z velkého datového modelu (viz Fáze 1 výše) — Pěstoun
(adresy, vzdělávání, respit, SPVPP, sociální prostor) a Dítě (doklady, adresy/škola/OSPOD s
historií, soud, biologická rodina, sociální prostor, trvalé poznámky). Legislativa ověřena přes
web (MPSV, sancedetem.cz) a `podpora.doprovazeni.com` — dlouhodobá/přechodná (PPPD)/příbuzenská
péče potvrzeny jako platné 3 kategorie, žádná korekce vůči prototypu nebyla potřeba.
Respit/SPVPP/CARE_TYPES/REL_TYPES portovány přímo z **živého vanilla prototypu**
(`claude.doprovazeni.com/app.js`) — **ne** z lokálního `app.js` v tomto repu, který je jen
odlehčený MVP stub bez těchto dat (viz [[crm-port-prototyp-pred-novym-schematem]]).

**1) REL_TYPES sladěny 1:1 s prototypem** (`domainConstants.js`) — klíče/labely/hinty přesně
odpovídají `app.js` (otec_rl/otec_soc/biootec_prav/.../matka_rl/biomatka_mimo/matka_fikce/...),
`legal` přidána hodnota `'na'` pro sourozence/širší rodinu (dřív nesprávně `false`). Přidány
`otec_nevlastni`/`matka_nevlastni` (prototyp je řešil jen volným textem, tady potřeba formální
položka pro select).

**2) Pěstoun — `orgService.js`:**
- `addFosterPerson`/`updateFosterPerson`/`addFosterCourse` — osoby v `fosters[]` mají teď stabilní
  `id`, adresy (trvalé bydliště/pobyt) a `courses[]` (kód/kde/kdy/forma/pořadatel/hodiny/certifikát).
- Respit (`RESPIT_LIMIT=14` dní/rok dle §47a zák. 359/1999 Sb.) — `foster_families/{id}/respitEvents`
  subkolekce (`addRespitEvent`/`listRespitEvents`), `respitNadstandard` pole (IPOD), čisté funkce
  `respitVykazano`/`respitRealny`/`respitLimitFor` v `domainConstants.js` (1:1 logika z prototypu:
  vykázaný = součet dní událostí, reálný = průnik dní kdy VŠECHNY děti mimo domov).
- SPVPP peněženka (`children/{id}.spvpp = {rok,rozpocet,vycerpano}`, default 48 000 Kč/rok) —
  `chargeSpvpp`; respit s uvedenou částkou ji rozpočítá rovným dílem mezi vybrané děti.
- Odměna pěstouna (`SPVPP_DOHODA_ROK=59400`, `odmenaEligible`/`odmenaStatusLabel`) — PPPD (temp)
  má nárok i bez svěřeného dítěte (pohotovost), dlouhodobá/příbuzenská jen s dítětem v péči.
- Sociální prostor domácnosti (`socialSpace: {partner, biologicalChildren[], parents[]}`).
- UI: `FosterFamilyDetailPage.jsx` přepracováno na Tabs (Pěstouni / Respit a SPVPP / Sociální
  prostor / Svěřené děti) — vzdělávání s progress barem proti `CARE_TYPES.requiredHours`, dialog
  pro zápis respitu s výběrem dětí (checkboxy) a volitelnou částkou.

**3) Dítě — `orgService.js`:**
- Historie změn (`children/{id}/history` subkolekce, append-only — "nic se nepřepisuje", port
  `App.histAdd/histList`) — `addChildHistory`/`listChildHistory`, `updateChildTracked()` (obecná
  pomůcka: upraví pole + zaloguje historii v jednom volání).
- Doklady (OP/pas — `idCard`/`passport`, doplnitelné později), adresy (`addressPermanent`/
  `addressResidence`), škola, OSPOD (`ospod: {nazev, osoba}`), soud (`courtCase` + `rozsudky[]`
  append-only přes `addCourtVerdict`), trvalé poznámky (`permanentNotes[]` append-only přes
  `addPermanentNote`), předchozí pěstounské rodiny (`previousFosters[]` přes `addPreviousFoster`),
  sociální prostor (`socialSpace[]`, stejný tvar jako `relatives[]` ale bez biologické vazby).
- UI: `ChildDetailPage.jsx` přepracováno na 7 tabů (Identita / Škola / OSPOD a soud / Biologická
  rodina / Sociální prostor / Poznámky / Historie).

**4) KRITICKÁ OPRAVA (objevena při ověřování Fáze 2, ne teoreticky — reálně blokovala appku):**
- **Routing bug:** index route `/` byl natvrdo `<Navigate to="/prehled">` (legacy MVP) — PRO
  KAŽDÉHO přihlášeného uživatele, i nového org_admin/klíčovou osobu/superadmina. Po přihlášení
  appka skončila v legacy shellu s chybou "currentTenantId() je null", ne na `/admin/*` dashboardu
  dané role. Root cause: `explicitFrom` (deep-link po loginu) bral i holé `/` jako "skutečný"
  odkaz, protože legacy `RequireAuth` zagarduje index route ještě PŘED vlastním přesměrováním.
  Oprava: nový `IndexRedirect` (`router.jsx`) rozhoduje dle role z `authStore`; `Login.jsx`
  ignoruje `/` jako `explicitFrom`. **Tohle byl blokující bug pro VŠECHNY nové role od Fáze 1.**
- **Firestore "list" dotaz vs. pravidlo:** Firestore zamítne CELÝ list/query, pokud rovnostní
  pole ve `where()` neodpovídá poli kontrolovanému v security rules (nezávisle na tom, že by
  jednotlivé dokumenty pravidlu vyhověly) — objeveno na `listChildrenByFamily` (filtr
  `fosterFamilyId`, pravidlo `organizationId` → "Missing or insufficient permissions" pro
  KOHOKOLI kromě superadmina). Opraveno: `listChildrenByFamily`/`reassignFoster` teď dotazují
  i `organizationId` jako druhý rovnostní filtr; `firestore.rules` pro `foster_families`/`children`
  READ mají nový `assignedTo == request.auth.uid` disjunkt (pokrývá `listFostersAssignedTo` —
  "Moje rodiny" klíčové osoby); `users` READ rozšířeno ze `isOrgAdmin()` na `sameOrg()` (kdokoli
  ze stejné organizace vidí zaměstnanecký rozpis — potřeba pro zobrazení jmen KO u rodin).
  **Bez týhle opravy nefungovalo "Moje rodiny" pro klíčovou osobu ani proklik rodina→děti pro
  nikoho kromě superadmina — od úplného začátku Fáze 1.**

**Ověřeno end-to-end v Preview** (demo org_admin i klicova_osoba účty): přihlášení → správný
`/admin/*` dashboard; proklik organizace→rodina→dítě; zápis respitu (8 dní, 2000 Kč → SPVPP
1000 Kč/dítě, reálný odpočinek 8 dní, odměna "Nárok"); "Celá organizace" pohled klíčové osoby
se jmény kolegů. `npm run build` čistý.

## 2026-07-02 — Fáze 1: SaaS sebeobsloužení (self-service registrace) + plná hierarchie + kapacitní limit

**Zadání (verbatim, kriticky důležité):** *"Provozovatel systému nebude zakládat do systému
Organizaci, ale na webu po základní registraci si to bude dělat VŽDY kdokoli sám! ...
STAVÍME PLNĚ AUTOMATIZOVANÝ SYSTÉM, KTERÝ MÁ POMÁHAT SE SPRÁVOU PRÁCE KLÍČOVÝCH OSOB A NIKOLI
KOMPLIKOVAT NA KAŽDÉM KROKU."* Otáčí to celý model založení organizace ze
Superadmin-zakládá na plně self-service (analogie ke Gmailu — registrace a systém se dál řídí sám).
Toto je **Fáze 1 ze 3** většího zadání (viz paměť), Fáze 2 (Pěstoun) a Fáze 3 (Dítě) hluboké
obohacení entit ještě zbývají.

**1) Self-service registrace organizace (`/registrace`, veřejná route):**
- `src/services/registrationService.js` (nové) — `registerOrganization()`: založí Firebase Auth účet,
  `organizations` dokument (IČO, datová schránka, adresa sídla, adresa provozovny — volitelně stejná
  jako sídlo, `createdBy: uid`), a `users/{uid}` profil s rolí `org_admin`. Používá PRIMÁRNÍ Auth
  instanci (na rozdíl od `orgService.createEmployee()`) — uživatel má po registraci zůstat přihlášen
  jako sám sebe.
- `src/modules/users/RegisterPage.jsx` (nové) — veřejný formulář (název/IČO/datová schránka, adresa
  sídla, checkbox „adresa provozovny stejná jako sídlo", údaje zástupce vč. RČ/telefonu, e-mail/heslo).
- `firestore.rules` — `organizations` create povoleno i nepřihlášenému-nově-registrovanému uživateli,
  pokud `request.resource.data.createdBy == request.auth.uid`; `users/{uid}` create má novou větev pro
  sebe-registraci org_admina (ověří přes `get()`, že práv vytvořená organizace patří stejnému uid).
  Nasazeno (`firebase deploy --only firestore:rules`).
- `Login.jsx` — odkaz „Nemáte organizaci v systému? Založte si ji zdarma" → `/registrace`.
- `createOrganization()` v `orgService.js` (Superadmin-cesta) zůstává jako sekundární/fallback nástroj,
  není už primární cesta založení organizace.

**2) Plná hierarchie zaměstnanců (`EMPLOYEE_ROLES` v `domainConstants.js`):**
`org_admin` (zástupce/ředitel) → `vedouci_pobocky` → `teamleader` → `klicova_osoba` →
`asistent_ko`; `zamestnanec` (administrativa, mimo řídicí řetězec). Každý zaměstnanec má
`nadrizeny` (uid nadřízeného) — tvoří reportovací řetězec. `OrgEmployeesPanel.jsx` přepracován:
dropdown rolí ze seznamu, select „Nadřízený" (populovaný ze stávajících zaměstnanců organizace),
pole Funkce/Telefon; sloupec „Oddělení" zrušen (nahrazen granulárními rolemi). `firestore.rules` —
`isManagement()` (`org_admin`/`vedouci_pobocky`/`teamleader`) nahradilo `isOrgAdmin()` u zápisu
`foster_families`/`children`.

**3) Limit 25 pěstounských rodin na klíčovou osobu:** `orgService.js` —
`MAX_FAMILIES_PER_KO=25`, `assertFamilyCapacity()` kontroluje počet rodin přiřazených dané KO
(`assignedTo`) při `createFoster()` a `reassignFoster()`; nad limit vyhodí chybu s návrhem
přiřadit jiné klíčové osobě.

**Ověřeno:** `npm run build` čistý; `/registrace` ověřeno v Preview (formulář se vykresluje
kompletně, žádné blokující chyby — jen pre-existující MUI prop-forwarding warningy nesouvisející
s touto změnou).

**Další kroky (Fáze 2/3, viz task list):** hloubkové obohacení Pěstouna (adresy, druh péče,
vzdělávání s certifikáty, respit, sociální prostor — vyžaduje nastudovat legislativní druhy péče
a respit z vanilla prototypu) a Dítěte (doklady, historie adres/škol/OSPOD, soud, biologická
rodina s historií, sociální prostor).

---

## 2026-07-02 — Datový model dotažen dle vanilla prototypu + plný proklik hierarchie

**Zpětná vazba:** nové schéma (v1.2.x) nemělo RČ jako primární identifikátor osob (existuje v
`app.js` odjakživa), REL_TYPES/CARE_TYPES, ani hierarchickou viditelnost dotaženou do UI —
SuperAdmin/OrgAdmin viděli jen zaměstnance, ne rodiny/děti. Detail viz paměť
`crm-port-prototyp-pred-novym-schematem.md` a `crm-hierarchicka-viditelnost.md`.

**Schéma (rozšířeno, `src/services/orgService.js` + `src/shared/domainConstants.js`):**
- `organizations` — `ico`, `address`, `contactEmail`, `contactPhone`
- `users` (zaměstnanci) — `rc`
- `foster_families` — `careType` ('long'|'temp'|'kin'), `fosters[]` (osoby: name/rc/phone/email)
- `children` — `rc`, `relatives[]` ({name, rc, rel: REL_TYPES key, legal, note}), `careType`
- `REL_TYPES` (22 typů vztahů s `legal` flagem) a `CARE_TYPES` — konstanty v kódu, port z `app.js`

**Plný proklik hierarchie (nové/upravené soubory v `src/modules/admin/`):**
- `FosterFamiliesPanel.jsx` — sdílený seznam rodin organizace, použitý v `OrganizationDetailPage`
  (superadmin), `OrgAdminDashboard` (org_admin), `KlicovaOsobaDashboard` (KO, záložka „Celá
  organizace", `canCreate=false`)
- `FosterFamilyDetailPage.jsx` — obohaceno o `fosters[]` (pěstouni s RČ) + klikací děti
- `ChildDetailPage.jsx` (nové, route `/admin/terenni/:familyId/deti/:childId`) — identita dítěte
  (RČ, datum narození) + `relatives[]` s typem vztahu a právním statusem
- `OrganizationDetailPage`/`OrgAdminDashboard` — MUI Tabs (Pěstounské rodiny / Zaměstnanci) místo
  jen seznamu zaměstnanců — řeší i „prázdný" layout
- Router: `/admin/terenni/:familyId` a `/admin/terenni/:familyId/deti/:childId` rozšířeny o
  `superadmin` v `RequireOrgRole` (dřív jen klicova_osoba/org_admin)

**Seed data (`scripts/dev-seed.mjs`)** aktualizován na bohatá data odpovídající prototypu
(sdílená bio matka napříč dvěma rodinami jako v `app.js` seed Terezy/Nely, nevlastní otec,
polorodí sourozenci, příbuzenská péče u babičky) — `npm run seed` znovu spuštěno.

**Známý bug (2026-07-02, neověřeno vyřešeno):** proklik na řádek organizace v SuperAdmin dashboardu
nefungoval hned po prvním nasazení — pravděpodobná příčina: Service Worker v prohlížeči servíroval
starou verzi JS (viz PWA cache poznámka u bílé obrazovky výše). Doporučeno „Clear site data" v
DevTools. Nepotvrzeno uživatelem, zda to bug vyřešilo.

---


## 2026-07-02 — UI/UX vylepšení, emoji pryč, testovací data (mimo web bundle)

**Zpětná vazba uživatele:** (1) dashboardy jsou "formálně správně, ale z lidského pohledu se na
to nedá koukat" — přepracovat UI/UX; (2) žádné emoji ikony nikde (platí odjakživa i pro vanilla
prototyp); (3) systém nesmí být nikdy úplně prázdný pro vývoj/nastavování, ale **testovací data
nesmí a nebudou v ostrém provozu**.

**1) UI/UX:** nová sdílená `src/modules/admin/EmptyState.jsx` (ikona v kolečku + nadpis + popisek
+ CTA) nahrazuje fádní "prázdnou tabulku" v `SuperAdminDashboard.jsx` (0 organizací) i
`KlicovaOsobaDashboard.jsx` (0 přidělených rodin) — KPI karty se zobrazí až když jsou reálná data,
jinak jeden jasný "hero" empty-state. Design tokeny (barvy/stíny/radius) ověřeny proti vanilla
prototypu (`style.css`) — MUI theme (`core/theme.js`, `bento.*`) už na ně byl navržen konzistentně.

**2) Emoji:** jediný nález v celém React/mobil kódu byl `⚠` v `src/core/ErrorBoundary.jsx` (a
neškodná `⚠️` v komentáři `orgService.js`, neviditelná v UI). Nahrazeno inline lineart SVG (Feather
styl, bez závislosti na @mui/icons-material — boundary musí přežít i chybu v MUI stromu).

**3) Testovací data — `scripts/dev-seed.mjs` (⚠️ DŮLEŽITÉ POUČENÍ):**
Původní implementace žila v `src/services/devSeedService.js` a byla volaná dynamickým `import()`
z UI zabaleného v `{import.meta.env.DEV && ...}` v `SuperAdminDashboard.jsx`. **Po ověření přímo v
`dist/` se ukázalo, že Vite/Rollup dynamický import i tak zabalí do samostatného chunku v
produkčním buildu** — i když se tlačítko nikdy nevykreslí, KÓD (a jeho texty) v nasazeném bundlu
FYZICKY BYL. To nesplňovalo výslovné zadání "v ostrém provozu tam být nesmí a nebudou" — přesunuto
do **`scripts/dev-seed.mjs`**, samostatného Node skriptu MIMO `src/` (appka ho nikdy neimportuje →
nemůže se dostat do `vite build` grafu → ověřeno `grep` přes `dist/`, 0 výskytů).
- `npm run seed` — smaže stará testovací data a založí 2 demo organizace (org_admin + klíčové
  osoby + přiřazené pěstounské rodiny s dětmi); idempotentní (lze spouštět opakovaně).
- `npm run seed:wipe` — jen smaže (organizace/uživatelé kromě vlastního účtu/rodiny/děti).
- Vyžaduje `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` v `.env.local` (gitignored, stejně jako
  `VITE_FIREBASE_*`) — skript se pod tímto účtem přihlásí, firestore.rules pak zápis povolí.
- Omezení: Firebase Auth účty demo zaměstnanců nejde z klienta smazat (jen Firestore dokumenty) —
  proto idempotence přes rozpoznání existujícího e-mailu (přihlásí se místo založení).
- **Poučení pro V8/budoucí práci:** cokoli, co "nesmí být v produkci", patří MIMO `src/` (samostatný
  skript/nástroj), NE za `import.meta.env.DEV` uvnitř appky — dynamický import bundler
  nespolehlivě odstraní, i když se cesta k němu za běhu nikdy nevykoná.

---
