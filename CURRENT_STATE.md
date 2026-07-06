# CURRENT_STATE
**Verze:** 2.1.0 (Connecteam blok 1: kalendář-agenda + rekapitulace návštěvy, 2026-07-06)

## 2026-07-06 — Kalendář jako týdenní agenda + rekapitulace návštěvy (autonomní blok)

První dva přenosy z `docs/design/connecteam-analyza-2026-07-05.md` (uživatel: „postupuj
dle svého uvážení"):

- **Mobilní Kalendář přepsán na týdenní agendu** (`MobileCalendarScreen.jsx`, Connecteam
  vzor „agenda s datum-railem"): pás dnů s tečkami u dnů s událostmi, souhrn
  „Tento týden · X návštěv · Y rodin", agenda celého týdne s velkým číslem dne vlevo,
  klepnutí na den v pásu = plynulý scroll na jeho skupinu. Prázdný den nabízí čárkovaný
  „+ Přidat" řádek.
- **Události jdou nově ZAKLÁDAT z mobilu** (`calendar/MobileEventSheet.jsx`) — do teď
  kalendář jen četl. Sheet: typ (EVENT_TYPES), rodina volitelně (KO vidí jen své —
  `listFostersAssignedTo`), chytrý název („Návštěva — Rodina X" jako fallback), datum
  přednastavené z klepnutého dne. `useCalendarWeek` dostal `reload` pro refresh po založení.
- **Rekapitulace návštěvy** (`MobileVisitTimerScreen.jsx`, Connecteam „konec směny"):
  „Ukončit návštěvu" už nezapisuje hned — otevře sheet se souhrnem (rodina, trvání,
  poloha) a polem „Poznámka z návštěvy" → zápis vzniká na místě v terénu. Zavření sheetu
  = návštěva dál běží. Poznámka se ukládá do `body` timeline záznamu.
- **Detail události** (`calendar/MobileEventDetailSheet.jsx`, Connecteam „ťuk na směnu"):
  klepnutí na kartu v agendě → sheet se souhrnem (typ, den, čas, místo, chip Koncept
  u nepublikované) a akcemi Zahájit návštěvu / Otevřít kartu rodiny / Upravit / Smazat
  (dvoukrokové potvrzení na tlačítku, žádný window.confirm). Upravit/Smazat dle
  `canEditEvent` (calendarShared.js — zrcadlí firestore.rules: KO svoje, management vše).
  `MobileEventSheet` umí edit mode (prop `event` → updateEvent; `location` se přepisuje
  jen při ZMĚNĚ rodiny, ruční místo z desktopu zůstává). Nový sdílený `toJsDate()`.
- **Dnes = ranní vstupní bod KO** (Connecteam „home → směna → clock-in"): klepnutí na
  událost v Dnešním programu otevírá stejný detail sheet (Zahájit návštěvu přímo z Dnes);
  mrtvá stub dlaždice „Přidat rodinu" (KO rodiny zakládat nesmí — firestore.rules) nahrazena
  dlaždicí „Zahájit návštěvu" → sheet „U koho jste na návštěvě?" se seznamem rodin KO
  (z familiesById, žádný další dotaz) → rovnou Giant Timer. `useTodayPage` má `reload`.
- Ověřeno end-to-end na 390×844 (agenda → + Přidat út → sheet s rodinou → karta 14:00
  v agendě + přepočet souhrnu; karta → detail → Upravit 16:00 → Smazat → den zase prázdný;
  FAB speed-dial → timer → Ukončit → souhrn 00:19 + poznámka → záznam na Ose s textem
  i odznakem trvání; Dnes → událost → detail; Dnes → dlaždice → výběr rodiny → timer).
  Lint+build čisté, nasazeno na doprovazeni-dev.
  Pozn. k ověřování: timeout `preview_screenshot` po startu čerstvého serveru bývá přechodný
  (první Vite dep-optimalizace) — `preview_snapshot` projde a druhý screenshot už také.

## 2026-07-05 — Zpětná vazba v2 + Connecteam jako závazný vzor

Pět bodů uživatele k Detailu rodiny + strategické rozhodnutí (bod 6):

- **Naplánovat návštěvu FUNGUJE** — dřívější odskok na /kalendar nikam nevedl; teď sheet
  přímo v hlavičce rodiny (`MobileFamilyHeader.jsx`) → `createEvent` typu `visit` s vazbou
  na rodinu, KO a adresou; ověřeno end-to-end (událost viditelná v Kalendáři vč. tečky).
- **Jedna řada přepínačů** — filtry Osy už nejsou druhá řada pillů; kompaktní pilulka
  „Filtr" vpravo otevírá sheet (typ záznamu + dítě), aktivní filtr se propisuje do popisku.
- **Hlavička bez trvalé adresy/telefonu** — místo kontaktní karty kruhové rychlé akce
  (Zavolat = tel:, E-mail = mailto:, Mapa = adresa v mapách, Naplánovat); chybějící údaj
  akci ztlumí. Vzor iOS Kontakty/Connecteam.
- **Zámek polí ZRUŠEN** (rozhodnutí uživatele „jen to zdržuje") — useEditLock.js a
  LockBanner smazány ze všech sheetů.
- **Jedno FAB se speed-dial menu** (`NativeFab.jsx`, vzor Things) — scrim + pojmenované
  akce „Zahájit návštěvu"/„Nový záznam"; dvě FAB nad sebou zrušena.
- **Connecteam = závazný vzor ~90 %** (PWA i desktop): 56 screenshotů analyzováno 5 agenty,
  výstup v `docs/design/connecteam-analyza-2026-07-05.md` (top vzory + obrazovka po
  obrazovce co přenést). Existující kód není překážka.

## 2026-07-05 — UI redesign v3: konec kroužení kolem designu

**Zadání:** „celé to předělej" — UI působilo nekonzistentně (upatlaně) a místy zeleně/teal,
přestože tokeny říkaly modrá. Příčiny a řešení:

- **Kořenová příčina „zelené":** 25 obrazovek (SuperAdmin, OrgDetail, Login, všechny Child*
  taby/modály…) stále používalo LEGACY Amie tokeny `primary-600` = **teal #1A6B64** + `stone-*`.
  Hromadně převedeno na `brand-*/ink-*/danger-*` (Connecteam modrá). Druhá příčina: dlouho
  běžící Vite dev server drží zastaralou Tailwind JIT cache po změně tokenů — „ověřovací"
  screenshoty ukazovaly starý teal i po opravě configu. **Po změně tailwind.config.js VŽDY
  restart dev serveru.**
- **DESIGN.md §12** — nová ZÁVAZNÁ mobilní spec v3: jediná typo škála (10/12/13/15/17/22/56),
  radius jen 18/10/pill, barvy jen `native.*` (+ tinty /10 a /15), žádná zelená, žádné stíny,
  komponenty výhradně ze `src/mobile/ui/`.
- **`src/mobile/ui/NativeBits.jsx`** — sdílené `SectionLabel`/`NativeChip`/`NativeEmptyState`/
  `StatTile` (+ `NATIVE_EVENT_BORDER`: návštěva na mobilu modrý proužek, ne zelený shift-visit);
  lokální kopie z pěti obrazovek smazány. `NativeButton` secondary = tint výplň (ne outline),
  `NativeSegmented` varianty primary/filter (konec dvou řad plných pillů na Ose).
- Obrazovky sjednoceny dle §12: Home (tinty místo raw blue/orange-50, empty s radou), Rodiny
  (vložená grouped karta + zaoblený search), Kalendář (nový header měsíc+rok, šipky po
  stranách), Detail rodiny (NativeChip stavy, „Naplánovat"), Osa (filtr variant, Připnuté jako
  sekce, empty s radou), Tým (grouped karta, stavové chipy), Respit (sdílený StatTile 28px).
- Ověřeno živě na čerstvém serveru (390 px: Rodiny/Detail/Osa/Kalendář/Timer/Home/Login;
  1280 px: OrgAdmin dashboard) — modrá #007AFF všude, `npm run build`+`lint` čisté, nasazeno
  na doprovazeni-dev. Pozn.: subagenti nedostupní (session limit), audit proveden v hlavní smyčce.

## 2026-07-03 — Krok 3: Obrazovka Dnes

**Zadání:** nová domovská obrazovka pro `klicova_osoba` na `/` (DESIGN.md §6.1) — agenda dne,
NE dashboard s KPI dlaždicemi/grafy. Pozdrav+datum, dnešní program, "Čeká na vás" (rodiny bez
návštěvy >45 dní), nejbližší dva dny.

- **Routing (zásadní změna):** `/` už NENÍ index route staršího `RequireAuth`+`Layout.jsx`
  (Sekce A sidebar) — přesunuto na VLASTNÍ top-level route group se stejným `AdminLayout`
  shellem jako zbytek `/admin/*` (topbar, ne stará sidebar), gated `RequireOrgRole
  allowed={['klicova_osoba']}`. Důvod: kdyby `/` zůstalo pod starým `Layout`, klíčová osoba by
  na své nové domovské stránce viděla legacy MVP sidebar (odkazy na 8řádkové stub stránky
  `/pestouni`, `/deti`…), ne skutečnou B2B navigaci. `IndexRedirect` (starý komponent pro index
  route) smazán — jeho roli teď dělá `RequireOrgRole` samo (fallback pro roli mimo `allowed`
  pole = `homePathForRole(role)`).
- `orgAuth.js` — nová `homePathForRole(role)`: `klicova_osoba` → `/` (Dnes), ostatní role beze
  změny (`dashboardPathForRole` zůstává platná, jen přestala být VÝCHOZÍ landing page — pořád
  se používá např. jako cíl "zobrazit vše" u sekce Čeká na vás → `/admin/terenni`). Použito v
  `Login.jsx` (přesměrování po loginu) a `router.jsx` (`RequireOrgRole`, `RegisterRoute`).
- `src/services/org/timeline.js` — `createTimelineEntry` nově zapisuje `foster_families.
  lastVisitAt` v JEDNOM `writeBatch` VŽDY, když `type === 'visit'` (CLAUDE.md: denormalizovaná
  pole aktualizovat v batch se změnou, která je vyvolala — `lastVisitAt` je v pravidle přímo
  jmenovaný příklad). Poznámka: v appce zatím NEEXISTUJE UI cesta k založení timeline záznamu
  typu `visit` (jen `note` — "Záznam v terénu/capture" je budoucí ⬜ funkce) — hook je tedy
  připravený do budoucna, ověřen jen nepřímo (testovací `lastVisitAt` v seedu je zapsané přímo,
  ne přes tuto cestu, viz níže).
- `src/services/org/events.js` — nová `listEventsForAssignee(organizationId, uid, {from,to})`
  (na rozdíl od `listEventsInRange` filtruje navíc `assignedTo`) + nový composite index
  (`assignedTo`+`start`) v `firestore.indexes.json`, nasazeno na dev.
- `src/modules/admin/TodayPage.jsx` + `useTodayPage.js` (nové) — max 25 rodin/KO (CLAUDE.md)
  → řazení/filtrování "Čeká na vás" klidně na klientovi, žádný další index/stránkování potřeba.
  Barva levého proužku dle typu události (`visit`=zelená/family, `meeting`=primary, `deadline`=
  terakota, `education`=amber) a dle stáří návštěvy (>60 dní = terakota `entity-crisis`, 45–60
  = amber, nikdy nenavštíveno = amber). Vokativ jména ("Jano" z "Jana") záměrně neřešen (1. pád).
- i18n: nový namespace `today.*` v `cs.json`, plurál `daysAgo_one/_few/_other`.
- Seed (`scripts/dev-seed.mjs`, `scripts/seed-calendar-events.mjs`): Rodina Kučerová dostala
  testovací `lastVisitAt` 65 dní zpět (terakota), Rodina Nováková 50 dní zpět (amber), ostatní
  bez pole (nikdy nenavštíveno); první rodina KAŽDÉ organizace dostala kalendářní návštěvu NA
  DNES, druhá NA ZÍTRA — pokrývá všechny 3 scénáře ze zadání (den s událostmi/bez/stará návštěva)
  napříč 3 demo KO účty, aniž by bylo nutné cokoli ručně překlikávat.

**Ověřeno živě v Preview** (po dobuildění Firestore composite indexu, ~2,5 min): `demo.ko.jih.1`
(dnešní návštěva Rodiny Kučerová v 13:00 se zelenou entity-family barvou, "Čeká na vás" s
terakotovou `#C2410C` barvou a textem "Návštěva před 65 dny"), `demo.ko.sever.1` (dnešní událost
+ amber `#FBBF24` u Nováková/50 dní i Svobodová/"Zatím žádná návštěva"), `demo.ko.sever.2`
(prázdný den — "Dnes nemáte naplánované žádné události.", sekce "Nejbližší dny" → "Zítra" s
návštěvou Dvořákové). `org_admin` (`demo.admin.jih`) po loginu i při přímé návštěvě `/` správně
skončí na `/admin/organizace`, ne na obrazovce Dnes. Mobilní viewport (390×844) ověřen přes
`scrollWidth`/`getBoundingClientRect` (bez horizontálního přetečení, karty na plnou šířku,
nadpis se zalamuje) — `preview_screenshot` v této session opakovaně timeoutoval (nesouvisející s
kódem), ověření tedy funkční/strukturální, ne vizuální snímek. `npm run build`/`npm run lint`
čisté po celou dobu.

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

*(Starší záznamy — Fáze 1 self-service, Fáze 2+3 obohacení entit, datový model dle vanilla
prototypu, UI/UX úklid — přesunuty do docs/history.md.)*

---
