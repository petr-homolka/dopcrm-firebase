# CURRENT_STATE
**Verze:** 2.3.0 (Chat 3 úrovně soukromí + notifikace + pěstounská PWA, 2026-07-06)

## 2026-07-06 — Program dokumenty/workflow/přihlášení (spec A–E) — průběžně

Uživatel zadal velký program (`docs/domain/dokumenty-workflow-a-prihlaseni.md`),
zpracovávat postupně, průběžně nasazovat na moje.doprovazeni.com **bez schvalování**
(stálý souhlas 2026-07-06). Stav:

- **C. Dokumentový modul — HOTOVO, nasazeno.** `documents` podkolekce + verze + audit;
  interní markdown editor (bezpečný mini-renderer bez závislosti), stavový chip, seznam na
  kartě rodiny; pěstoun vidí jen `visibleToFoster`. Nahrané soubory (PDF/obrázek/DOCX) přes
  Storage = TODO (Storage na dev zatím neprovozováno) — model připraven, náhled/stažení až s ním.
- **D. Schvalovací workflow — HOTOVO, ověřeno end-to-end.** Stavový automat draft→foster_review→
  commented/approved→final→mgmt_review→closed(±výhrada)→sent/filed; fáze A (KO↔pěstoun opakovaně),
  fáze B (vedení, schvalovatel), uzavření s výhradou, auditní stopa. Ověřeno přes 4 role: audit
  = created→sent_foster→foster_commented→marked_final→sent_mgmt→mgmt_approved→sent_authority.
- **E. Příjem + časová osa + OCR — jádro HOTOVO.** `ingestDocument` (příchozí dokument →
  záznam + zápis do ČASOVÉ OSY s přečteným textem = data v čase pro AI); KO UI „Zaznamenat
  příchozí dokument". ⚠️ Binární upload (Storage), reálné OCR (Vertex) a e-mailový příjem
  (`pestoun.jmeno@doprovazeni.com`, MX/parser) = infrastruktura → seam + model hotové,
  napojení TODO (docs/INVENTAR.md).
- **A. Magic-link přihlášení pěstouna — HOTOVO, nasazeno.** `foster_invitations/{email}`,
  `sendFosterMagicLink` (Firebase email-link), completion `/prihlaseni` (MagicLinkScreen)
  vč. bootstrapu profilu z pozvánky; rules přepsány — `fosterOfFamily` nově přes
  `users/{uid}.fosterFamilyId` (pěstoun už nezapisuje foster_families). Ověřeno (pěstoun
  vidí děti+chat, spis denied; KO vytvoří pozvánku). Odeslání e-mailu + klik nelze
  automatizovaně otestovat. SMS/WhatsApp = TODO (placené kanály).
- **B. Chat — 4. kategorie „Pro OSPOD" + filtr kategorií — HOTOVO, nasazeno.** Cílení na
  skupiny/kanály/DM = zbývá.
- **C. Dokumentový modul** (model, Storage, markdown editor, DOCX/PDF/obrázek náhled, verze) — ZBÝVÁ.
- **D. Schvalovací workflow** (stavový automat Koncept→…→Uzavřeno, audit, schvalovatel+náhradník,
  uzavření s výhradou) — ZBÝVÁ.
- **E. Příjem dokumentů + časová osa + OCR** — ZBÝVÁ; e-mail ingest (`pestoun.jmeno@…`) a OCR
  vyžadují backend (MX/parser, Vertex AI) — postaví se model+UI+simulace+seam, produkční
  napojení = TODO (docs/INVENTAR.md).

## 2026-07-06 — Chat, notifikace a pěstounská PWA (nová vrstva systému)

Zadání: chat KO↔pěstoun se třemi úrovněmi soukromí + notifikace + samostatná
omezená appka pěstouna s vlastním přihlášením. Spec: `docs/domain/chat-a-pestounska-appka.md`.

- **Role `pestoun`** = nově Auth uživatel (revize závazného pravidla, potvrzeno uživatelem).
  Zakládá se pozvánkou KO/vedení (`inviteFoster`, sekundární Auth instance jako `createEmployee`),
  navázán na rodinu přes `foster_families.fosterUserIds`. Dítě zůstává bez účtu.
- **Chat** (`foster_families/{id}/messages`, `org/messages.js`): úrovně `private` (jen autor),
  `internal` (tým, směrování na příjemce), `foster` (KO↔pěstoun). KO tab „Chat" na kartě
  rodiny s výběrem úrovně; pěstoun ve své appce vidí a píše jen `foster`.
- **Notifikace** (`users/{uid}/notifications`, `org/notifications.js`): zvonek s odznakem
  na Dnes i pěstounské Domů, centrum `/oznameni`; zakládají se klientsky při odeslání zprávy.
- **Pěstounská PWA** `/moje/*` (role pestoun): Domů (moje děti + chat + dokumenty prázdné),
  omezený profil dítěte (jen jméno/datum/škola — NE spis), chat s KO. MobileShell foster taby.
- **BEZPEČNOSTNÍ HRANICE ve firestore.rules** (ne jen UI): `sameOrg` větev u rodin, dětí,
  uživatelů, ORG podkolekcí i CELÉHO spisu (timeline, respit, kurzy, historie, poznámky,
  soud) OMEZENA na `isStaff()` — pěstoun má stejné `organizationId`, takže bez toho by přes
  holé `sameOrg` viděl vše. Pěstoun čte jen svou rodinu (`fosterUserIds`), své děti a
  úroveň `foster`. **Únik do spisu odhalen a opraven při ověřování.**
- Ověřeno end-to-end na dev (KO i pěstoun): pěstoun vidí jen `foster` zprávu (ne `private`/
  `internal`), spis/pinned/jiné rodiny/zaměstnance = permission-denied, vlastní děti + chat OK,
  smí poslat jen `foster` (internal/private create denied). Lint+build čisté, rules na DEV.
  **Prod hosting + rules: čeká na revizi pravidel s uživatelem (slíbeno).**

## 2026-07-06 — Lidl v4: profily, formuláře, kalendář a Rodiny dle Lidl Plus

Šest bodů zpětné vazby uživatele („LIDL APLIKACE JE MOC PĚKNÁ… NECHCEŠ SE INSPIROVAT?"),
vzor uložen v paměti [[crm-lidl-vzor-profily-formulare]]:

- **Formulářové řádky horizontálně** (bod 4) — `NativeFormRow` je nově label vlevo / hodnota
  vpravo (iOS Nastavení). Textarea/široký obsah → prop `stacked`. Nový `NativeInfoRow`
  (čtecí řádek: název vlevo / hodnota vpravo, prázdné = „—").
- **Modrý hero na detailech** (bod 6) — `NativeHero` + `HeroAction` + `HeroBody` +
  `MobileTopNav variant="hero"`: detail rodiny i dítěte mají velké bílé jméno na modré,
  chipy, kruhové akce (Zavolat/E-mail/Mapa/Naplánovat), obsah najíždí zaoblenou hranou.
  Vzor Lidl Plus účet.
- **Profily jako tabulky** (bod 6) — Pěstouni, Biologická rodina, Sociální prostor (rodina
  i dítě), Identita/Škola/OSPOD dítěte, Respit/SPVPP: každá osoba karta se jménem 17px
  a tabulkou `NativeInfoRow`; konec „RČ · telefon" nahusto. Telefon/e-mail proklikávací.
- **Kalendář = hodinový den** (body 1+2) — pás dnů swipovatelný prstem (touch → prev/next
  týden), klepnutí na den → dole rozvrh pracovního dne 7–19 h; událost v řádku své hodiny,
  prázdná hodina se ťukne → nová událost s předvyplněným časem.
- **Číselník typů událostí** (bod 3) — `organizations/{id}/codelists/eventTypes`
  (`codelists.js`, rules `codelists` = management zápis / org čtení). Select typu čte merge
  vestavěných + vlastních; management má „+ Nový typ…" inline, plná správa v Nastavení
  (`EventTypesPanel`). Vlastní typ nese denormalizovaný `typeLabel` na události.
- **Rodiny jako titulní stránka lidí** (bod 5) — segmenty Rodiny / Pěstouni / Děti,
  seskupování (abecedně / město / druh PP / poslední návštěva, volba se pamatuje), bohatší
  řádky (město, druh PP, termín poslední návštěvy s varováním po 45 dnech). Session cache
  (stale-while-revalidate) řeší „stránka se dlouho načítá" při návratu na tab.
- Sweep tabů provedl workflow (3 agenti hotovo, 2 spadli na session limitu → dodělány ručně:
  MobileSocialTab). Ověřeno živě 390×844 (hero rodiny i dítěte, info tabulky pěstounů,
  hodinový kalendář, formulář label/hodnota, segmenty Rodiny/Pěstouni/Děti). Lint+build
  čisté, všechny soubory < 300 řádků. DESIGN.md §12.4 rozšířeno o Lidl vzor.
- **Profil uživatele** dostal stejný modrý hero (jméno + chip role + e-mail řádek), pod ním
  grouped list Nastavení/Odhlásit. Ověřeno + nasazeno na moje.doprovazeni.com i dev.

## 2026-07-06 — moje.doprovazeni.com: nový build + oprava env past (KRITICKÉ)

Uživatel na mobilu viděl starou zelenou appku a chybu „query requires an index" z PROD
projektu. Dvě příčiny:

- **Doména moje.doprovazeni.com je připojená k HOSTINGU PROD projektu**
  (`opportune-cairn-500111-b-b2bea`), ne k doprovazeni-dev.web.app, kam šly deploye.
  Vyřešeno: `firebase deploy --only hosting -P prod` (se souhlasem uživatele) — doména teď
  servíruje aktuální build.
- **Vite past: `.env.production.local` se při `npm run build` AUTOMATICKY načítá**
  (priorita nad `.env.local`) — všechny buildy tiše pekly PROD Firebase config do bundle,
  zatímco `npm run dev` běžel proti dev (proto lokální ověření prošlo a nasazená appka
  padala na chybějícím prod indexu). Soubor přejmenován na `.env.prod.credentials.local`
  (Vite ho nenačítá, gitignore `.env.*.local` platí dál), CLAUDE.md opraven — tvrdil
  „nikdy se automaticky nenačítá".
- Ověřeno: bundle na moje.doprovazeni.com obsahuje jen `doprovazeni-dev` (0× opportune-cairn),
  theme_color #007AFF. Přihlášení = dev demo účty (demo.ko.sever.2@doprovazeni.dev funguje —
  dev-seed ho zakládá). Prod Firestore/Auth zůstaly nedotčené (deploy jen statického hostingu).

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
- **PWA: poslední zbytek teal + auto-aktualizace** — manifest a index.html měly pořád
  `theme_color #1A6B64` (stavový pruh INSTALOVANÉ appky svítil tou „zelenou" i po celém
  redesignu) → `#007AFF`. `main.jsx` nově registruje SW s kontrolou aktualizace při návratu
  appky do popředí + každou hodinu — nový build se natáhne bez úplného zabití appky
  (dřív bylo nutné PWA zavřít a otevřít). Ikona (žlutá s „D") ponechána — branding
  je rozhodnutí uživatele, viz `crm-settings-branding-todo`.
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

## 2026-07-02 — Velký úklid repozitáře (podle UKLID-PROMPT.md)

Vanilla prototyp přesunut do `/legacy` (zamčený archiv, jen pro člověka). Nový `CLAUDE.md` +
`DESIGN.md` (design systém „Přítomnost", soft/playful, Tailwind) nahradily starý handoff dokument
(archivován do `docs/history-claude-md.md`). Tento soubor ořezán na ~200 řádků, starší záznamy
přesunuty do `docs/history.md`. Následuje: extrakce doménové dokumentace do `docs/domain/`,
`docs/INVENTAR.md`, přechod MUI → Tailwind, sjednocení PWA přes vite-plugin-pwa.

*(Starší záznamy — Fáze 1 self-service, Fáze 2+3 obohacení entit, datový model dle vanilla
prototypu, UI/UX úklid — přesunuty do docs/history.md.)*

---
