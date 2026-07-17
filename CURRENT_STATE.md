# CURRENT_STATE
**Verze:** 2.5.0 (Desktop: rail, Reporty OSPOD, hledání ⌘K, Úkoly, Vzdělávání, 2026-07-13)

## 2026-07-17 — CraftUI redesign PROVEDEN A VRÁCEN (na žádost uživatele)

Import design systému CraftUI/Pěstouni (modro-šedá #4A6B8C, Lato+Source Sans Pro, tmavý
sidebar, domain komponenty) byl kompletně implementován a nasazen, ale uživatel rozhodl:
„naše minulá verze byla o hodně lepší" → VŠE vráceno do stavu před změnou (Connecteam
desktop + iOS mobil). Revert byl chirurgický — git HEAD je starší než workspace/rail/
Reporty/Úkoly/…, takže se vracely POUZE soubory redesignu (tokeny, fonty, sidebar,
TodayPage z gitu, FosterFamilyDetailPage, smazané src/components/domain/ + uid.js +
FamilyCaseHeader/Rail, DESIGN.md §13, PWA theme). CraftUI kit zůstává na disku
(c:_____ClaudeAIcraftui-crm-design-system) — NEAPLIKOVAT bez výslovného pokynu.

## 2026-07-13 v3 — Doplnění funkcí z prototypu (`inspirace-pak-smazat/`) na desktop

Po sbalitelném railu (v2) uživatel zadal: doplnit postupně VŠE, co má desktopový prototyp
a nám chybí. Nasazeno dev+prod hosting (bundle běží proti dev backendu, rules na dev).

- **Reporty pro OSPOD (HOTOVO).** `org/reports.js` — `generateOspodReport` sestaví „Zprávu
  o průběhu NRP" (markdown) z časové osy (návštěvy/poznámky), svěřených dětí a vzdělávání za
  období → založí DOKUMENT (koncept), který projde stávajícím schvalovacím workflow.
  UI: tlačítko „Vyplnit report" v detailu rodiny → `ReportGenerateDrawer` (výběr období).
  Tisk/PDF: `DocumentDetailPanel` má „Tisk / PDF" (čisté tiskové okno, md→HTML).
- **Globální hledání ⌘K (HOTOVO).** `CommandPalette` mount v `AdminLayout` (desktop), Ctrl/⌘+K,
  hledá rodiny + děti (role-aware), klávesnice ↑/↓/Enter/Esc, proklik. Topbar má „⌘K" hint.
- **Úkoly / termíny (HOTOVO).** Nová top-level kolekce `tasks` + firestore.rules (isStaff+sameOrg,
  create s createdBy==uid). Služba `org/tasks.js`. Stránka `tasks/TasksPage` = kanban dle termínu
  (Po termínu/Dnes/Tento týden/Později), checkbox=hotovo, `TaskFormDrawer` (termín+řešitel+poznámka),
  filtr Moje/Všechny. Route `/admin/ukoly` + nav v railu.
- **Vzdělávání (HOTOVO).** `education/EducationPage` — agregace hodin kurzů (`course.personId`)
  napříč pěstouny vůči limitu (24/24/18 h z CARE_TYPES), „pod plánem" + progres bary, proklik na
  rodinu. Route `/admin/vzdelavani` + nav v railu.
- **Mapa v profilu (HOTOVO).** Tab „Mapa" v detailu rodiny (`FamilyMapTab`). PRIVACY: adresa se
  nikam neodesílá automaticky — mapa (Nominatim geokód + vložený OpenStreetMap) se načte až na
  klik „Zobrazit mapu"; „Otevřít v Mapách" je odkaz spouštěný uživatelem. Bez API klíče.
- **Ostatní / instituce (HOTOVO).** NOVÁ top-level kolekce `institutions` + firestore.rules
  (isStaff+sameOrg); `org/institutions.js` (typy OSPOD/soud/škola/lékař/jiné); stránka
  `institutions/InstitutionsPage` (seskupení dle typu + hledání + CRUD) + `/admin/instituce`
  + nav „Ostatní".
- **Ověření:** lint (max-warnings 0) + build čisté; firestore.rules zkompilovány a nasazeny na dev.
  ⚠️ Přihlášené proklikání neověřeno (dev i prod session odhlášené; heslo nezadávám). Datové
  vrstvy jsou přímočaré a znovupoužívají ověřené služby.
- **i18n nových desktop souborů (HOTOVO).** ~18 souborů převedeno na `t('dsk.<oblast>.<klíč>',
  'český default')`; klíče se do `cs.json` NEpřidávají — default v kódu je zdroj pravdy i bezpečná
  síť (jediný jazyk cs; 2. jazyk = naplnit z defaultů). Číselníky dle výjimky CLAUDE.md nezměněny.
- **Zbývá:** mobil má i nadále natvrdo cs (budoucí sweep); rollout workspace vzoru na kalendář/tým.

## 2026-07-13 — Desktop: profesionální case-management workspace + moduly na desktopu

Zadání: „ať vše funguje i na desktopu a desktop vypadá o mnoho profesionálněji." Dosud všechny
nové moduly (chat, dokumenty, externí účastníci, notifikace) žily jen v mobilní vrstvě
(`src/mobile/`, render <1024px); na širokém desktopu je uživatel neviděl. Zvolený směr
(potvrzeno uživatelem): **case-management workspace** — třípanel sidebar │ master seznam │ detail.

- **Sbalitelný levý rail (2026-07-13 v2, nasazeno dev+prod).** `AdminSidebar` je nově
  sbalitelný: výchozí = úzký **64px ikonový rail** (jen ikony + tooltip, aktivní levý proužek,
  logo, dole toggle + Nastavení), rozbalení na 240px s popisky; stav v `localStorage`
  (`dop.sidebar.collapsed`). Uvolňuje místo detailu profilu. Vzor = rail z desktopového
  prototypu (`inspirace-pak-smazat/`). ⚠️ Přihlášený screenshot railu neověřen (dev i prod
  session odhlášené; heslo nezadávám) — ověřeno lintem+buildem, deterministická layout změna.
- **Workspace shell — HOTOVO, nasazeno dev+prod.** `AdminLayout` má `variant='workspace'`
  (full-bleed, 100dvh−topbar). `workspace/FamiliesWorkspace.jsx` = master seznam rodin
  (hledání, segment Aktivní/Archiv, přepínač *Moje/Celá organizace* pro KO, „+ Nová") +
  `<Outlet>` detailu; na mobilu průchozí (jen `<Outlet>`, žádný fetch). `WorkspaceHome.jsx`
  = uvítací pravý panel. Sidebar vizuálně dotažen (moduly + Nastavení dole), topbar zvonek
  **napojen na reálnou službu notifications** (odznak, dropdown, „Označit vše", „Zobrazit vše").
- **Detail rodiny = panel** s hero (avatar, jméno, stavy, kontakt, akce) + taby Osa/Pěstouni/
  Respit/Sociální/Děti/**Chat**/**Dokumenty**. Chat i Dokumenty jsou nové desktopové moduly
  (`FamilyChatTab`, `FamilyDocumentsTab`) — sdílí datovou vrstvu s mobilem (`useChatThread`,
  `orgService`). Detail dokumentu + schvalovací workflow na desktopu (`documents/DocumentDetailPanel`
  + `DocumentActionsBar` + `MarkdownView`).
- **Externí účastníci na desktopu** — tab „Účastníci" v detailu dítěte (`participants/
  ChildParticipantsTab`), detail s katalogem oprávnění (`ParticipantDetailPanel`) a drawer
  pro necitlivá (1 krok) i citlivá (3-krokové schválení + platnost + časová okna,
  `PermissionGrantDrawer`). Desktopová stránka Oznámení (`NotificationsPage`).
- **Router** `/admin/terenni` přepojen na `FamiliesWorkspace` s `<Outlet>`; desktop varianty
  doplněny do `Responsive` pro dokumenty/:docId, ucastnici/:epId a /oznameni. `KlicovaOsobaDashboard`
  je tím nahrazen workspacem (zůstává v repu, není routován).
- **Ověřeno:** lint (max-warnings 0) + build čisté; živý proklik na desktop viewportu (workspace,
  chat, dokumenty+detail+workflow, dítě, účastníci, zvonek s reálnými daty, regrese Kalendáře);
  adversariální review workflow (5 dimenzí, částečně přerušen session limitem) → 3 kosmetické
  nálezy opraveny (i18n taby, inline style→Tailwind, sjednocení tabů dítěte na `<Tabs>`).
- **Vědomě mobilní-only** (žádný desktop ekvivalent): měření času návštěvy `/navsteva`.
- **Zbývá:** plná i18n nových desktop souborů (teď natvrdo `cs`, stejně jako mobil — dluh);
  binární upload (Storage), reálné OCR, e-mailový příjem, A/V hovory — beze změny.

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

