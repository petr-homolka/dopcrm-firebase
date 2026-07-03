# CURRENT_STATE
**Verze:** 1.7.0 (Krok 0+1+2 — Inventář, slug organizace, i18n základ, 2026-07-03)

## 2026-07-03 — Krok 2: i18n základ (react-i18next)

**Zadání:** zavést react-i18next s jediným jazykem (cs), vytáhnout texty existujících obrazovek
do klíčů, žádný jazykový přepínač zatím. Rozsah: login, registrace, navigace, kalendář, detail
rodiny/dítěte, timeline.

- `src/i18n.js` — inicializace, `src/locales/cs.json` bundlovaný staticky (žádný
  i18next-http-backend, zbytečné pro jediný jazyk), `lng`/`fallbackLng: 'cs'`. Import jako
  side-effect v `main.jsx` PŘED renderem `<App>`.
- Konvence: `const { t } = useTranslation()` v komponentě/hooku, klíče `modul.podmodul.klic`
  (`auth.login.*`, `auth.register.*`, `nav.*`, `calendar.*`, `family.detail.*`, `child.detail.*`,
  `timeline.*`), sdílené ubikvitní řetězce v `common.*` (back/loading/save/saving/cancel/close).
  Datové konstanty MIMO komponenty (`MVP_NAV` v router.jsx, `TIMELINE_FILTERS` v
  timelineShared.js) nesou `labelKey` misto `label` — `t()` volá až konzument v render, protože
  konstanta samotná není komponenta/hook a nemůže si `useTranslation()` zavolat sama; podobně
  `formatDayHeading(date, t)` bere `t` jako parametr (plain funkce, ne hook).
- **Rozsah vytažení:** login/registrace/nav/kalendář vlastnoručně; detail rodiny (kontejner +
  Osa/timeline) vlastnoručně; zbylé taby detailu rodiny (Pěstouni/Respit/Sociální
  prostor/Svěřené děti + `useFosterFamilyDetail.js`) a celý detail dítěte (7 tabů +
  `useChildDetailForms.js`) přes 2 paralelní subagenty (mechanická extrakce, stejná
  konvence) — výsledné JSON fragmenty ručně sloučeny do `cs.json`, `ChildFormModal.jsx`
  (sdílený modál obou) udělán zvlášť aby nedošlo ke konfliktu.
- **Vědomě MIMO rozsah:** popisky odvozené z `domainConstants.js` (REL_TYPES, CARE_TYPES,
  `careLabel()`, `odmenaStatusLabel()`, `relGroups()` apod.) — samostatný budoucí úkol „i18n přes
  translation_keys" (V8 blueprint, `docs/INVENTAR.md` sekce 10). Jde o datový slovník, ne
  obrazovkový text.
- Pravidlo pro nové obrazovky (POVINNĚ `t()`) zapsáno do `CLAUDE.md` → Stack.
- **Poučení (past incident v této session, oprava hned při psaní):** regex na odstranění
  diakritiky psaný jako `/[̀-ͯ]/` se v editačním pipeline dvakrát proměnil na doslovné
  kombinující Unicode znaky v character-class (vizuálně nerozeznatelné od správného zápisu, jiný
  byte obsah) — v `slugUtils.js` i v `CURRENT_STATE.md` samotném. Oprava: `new
  RegExp('[\\u0300-\\u036f]', 'g')` (string, ne regex literál) je bezpečná forma zápisu.

**Ověřeno živě v Preview** (`demo.ko.jih.1`): login → dashboard → Rodina Kučerová (Osa, Pěstouni,
Respit a SPVPP se všemi interpolacemi `{{count}}`/částky, Sociální prostor, Svěřené děti) → karta
dítěte Eliška (7 tabů: Identita/Škola/OSPOD a soud/Biologická rodina/Sociální prostor/Poznámky/
Historie) → Kalendář (agenda + formulář nové události). Žádný chybějící klíč, žádná chyba v
konzoli nesouvisející se změnou. `npm run build`/`npm run lint` čisté po každém dílčím kroku i po
finálním sloučení. Nezávislý skript zkontroloval všech 319 klíčů v `cs.json` proti všem `t()`
voláním v `src/` — 0 chybějících (2 falešně nahlášené byly správná i18next pluralizace
`_one/_few/_other`, 2 dynamické klíče v Login/RegisterPage ověřeny ručně).

## 2026-07-03 — Krok 1: Slug organizace

**Zadání:** unikátní adresa organizace (`{slug}`), zatím jen ukládat/zobrazovat — veřejná
stránka (`doprovazeni.com/{slug}`) přijde později (viz INVENTAR.md "Veřejný profil organizace").

- `src/shared/slugUtils.js` (nové) — `sanitizeSlugInput`/`slugify`/`validateSlugFormat`,
  `RESERVED_SLUGS` (admin/api/www/app/registrace/login/superadmin/…). Diakritika se odstraňuje
  přes `normalize('NFD')` + odstranění kombinujících znaků v rozsahu Unicode U+0300 až U+036F
  (poučení: regex na tenhle rozsah psát jako `new RegExp('[\\u0300-\\u036f]', 'g')`, NIKDY
  vepsat doslovné kombinující znaky přímo do regex literálu — vizuálně nerozeznatelné od
  správného zápisu, ale jiný byte obsah, matoucí k údržbě).
- `src/components/ui/SlugField.jsx` (nové, sdílené) — debounced (400 ms) kontrola dostupnosti,
  vizuální stavy idle/checking/ok/taken/invalid, `onStatusChange` callback pro gating submit
  tlačítka v rodiči.
- **Uniqueness bez transakce na klientovi:** `org_slugs/{slug}` (doc ID == slug) — Firestore
  vyhodnotí zápis na JIŽ EXISTUJÍCÍ doc jako `update`, ne `create`; `allow update: if false`
  proto fakticky brání komukoli slug "ukrást", i při souběžném zápisu dvou uživatelů ve stejný
  okamžik (Firestore serializuje zápisy na stejný dokument). `src/services/org/organizations.js`
  — `isSlugAvailable`, `reserveOrgSlug(orgId, slug, uid)` (první rezervace, explicitní `uid`
  kvůli stejnému race jako u `registrationService.js` — store ještě nemusí mít session),
  `changeOrganizationSlug(orgId, newSlug)` (transakce: ověří volnost nového, zapíše, přepne
  `organizations.slug`, uvolní starý — vzor `reassignFoster`).
- `registrationService.js` — slug se ukládá na `organizations` rovnou při založení; rezervace
  (`reserveOrgSlug`) běží AŽ PO zápisu `users/{uid}` (ne dřív), protože `org_slugs` create rule
  vyžaduje `isOrgAdmin() && myOrgId()==orgId`, což platí až jakmile vlastní zaměstnanecký profil
  existuje — vyhnuli jsme se tak závislosti na `get()` nad ještě neexistujícím uživatelem.
  Selhání rezervace (vzácný race) NEBLOKUJE registraci — org_admin si slug opraví v Nastavení.
- `RegisterPage.jsx` — pole "Adresa URL organizace" s auto-návrhem ze jména organizace (dokud
  uživatel slug ručně needitoval), submit uzamčen dokud `slugStatus !== 'ok'`.
- `SettingsPage.jsx` — PRVNÍ reálný obsah (dřív 8řádkový stub s inline styly): editace slugu
  pro `org_admin`, ostatní role vidí `EmptyState` "může upravovat jen administrátor organizace".
- `firestore.rules` — nová top-level kolekce `org_slugs` (čtení veřejné — slug se má stát
  veřejnou URL), `scripts/dev-seed.mjs` — `DEMO_ORGS[].slug` + rezervace při seedu,
  `wipeAllData` nově maže i `org_slugs` (jinak by druhý `npm run seed` narazil na "already
  taken" ze starého běhu).
- Nasazeno na **dev** (`firebase deploy --only firestore:rules`, `npm run seed` 2× pro ověření
  idempotence — druhý běh správně smazal a znovu založil 2 rezervace).

**Ověřeno živě v Preview:** auto-návrh slugu z názvu s diakritikou (`Testovací Organizace Ř` →
`testovaci-organizace-r`), kolize s obsazeným (`demo-organizace-sever` → "obsazená"), rezervované
slovo (`admin` → odmítnuto), celá registrace end-to-end (org+user+rezervace založeny, dashboard
funkční), změna slugu v Nastavení (nový rezervován, starý se ihned uvolnil — ověřeno opětovným
zadáním starého slugu, ukázal "volná"). Testovací organizace po ověření smazána (`npm run seed`).

## 2026-07-03 — Krok 0: Inventář rozšířen o 7 položek

Do `docs/INVENTAR.md` doplněno (všechny ⬜, specifikace budou dodány později): break-glass režim
podpory pro superadmina, editovatelné systémové texty (`system_texts`), časově platné sazebníky
(`tariffs`), evidence výplaty dávek MPSV, branding organizace (rozšířen existující řádek),
veřejný profil organizace, lokalizace legislativy jako zásada (+ krátká poznámka
`docs/domain/lokalizace-legislativy.md`).

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

*(Starší záznamy — datový model dle vanilla prototypu, UI/UX úklid — přesunuty do docs/history.md.)*

---
