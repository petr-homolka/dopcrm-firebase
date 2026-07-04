# INVENTÁŘ — master checklist projektu

Kompletní seznam funkcí, workflow, zásad a požadavků, které byly kdy zadány (vanilla prototyp
`docs/history-claude-md.md` + vývoj React appky `docs/history.md`). Při plánování nové práce se
sem vždy nejdřív podívej; po implementaci funkce aktualizuj její stav.

**Stav:**
- ✅ v React appce (tomto repu) — funguje na reálném datovém modelu (Firestore)
- 🟡 jen v `/legacy` vanilla prototypu (nebo v sesterském mobilním repu) — čeká na 1:1 přenos
- ⬜ nezačato — jen zadání/spec, nikde neimplementováno

## 1. Základní datový model a organizace

| Funkce | Popis | Kde popsáno | Stav |
|---|---|---|---|
| B2B multi-tenant schéma | `organizations → users → foster_families → children` | `docs/history.md` | ✅ |
| Self-service registrace organizace | Veřejná `/registrace`, žádné zakládání superadminem | `docs/history.md` (Fáze 1) | ✅ |
| Slug organizace | Unikátní adresa (`org_slugs` rezervace), validace formátu/rezervovaných slov, editovatelná v registraci i Nastavení; zatím jen ukládá/zobrazuje, veřejná stránka přijde později | `docs/history.md` (Krok 1, 2026-07-03) | ✅ |
| Veřejný profil organizace | `doprovazeni.com/{slug}`; čte VÝHRADNĚ oddělenou kolekci `public_profiles` a Storage cestu `public/{orgId}/`; publikace dokumentu = vědomé kopírování org_adminem; správa slugů | zadání 2026-07-03 (Krok 0), čeká na `docs/domain/` | ⬜ |
| Hierarchie zaměstnanců | `org_admin → vedouci_pobocky → teamleader → klicova_osoba → asistent_ko`, `nadrizeny` | `docs/history.md` (Fáze 1) | ✅ |
| Limit 25 rodin / klíčová osoba | `assertFamilyCapacity` | `docs/history.md` (Fáze 1) | ✅ |
| Role/scope/práva (6 rolí, capability matice) | superadmin/vedení/KO/asistentka/pěstoun/dítě, scope all/own/self | `docs/history-claude-md.md` §5 | 🟡 (React má 5 rolí s vlastním dashboardem: superadmin/org_admin/vedouci_pobocky/teamleader/klicova_osoba — `asistent_ko`/`zamestnanec` zatím žádný) |
| Firestore security rules multi-tenant | Čtení/zápis dle role a `assignedTo` | `docs/history.md` | ✅ (částečně — postupně rozšiřováno) |
| CI/CD GitHub Actions → Firebase Hosting | Push do `main` = build+deploy | `docs/history.md` | ✅ |

## 2. Pěstoun a rodina

| Funkce | Popis | Kde popsáno | Stav |
|---|---|---|---|
| Druhy péče (PPPD/dlouhodobá/příbuzenská) + odměna | Nárok na odměnu dle typu, i bez dítěte u PPPD | `docs/domain/druhy-pece-a-odmeny.md` | ✅ (`householdCareType`, `odmenaEligible` portováno) |
| SPVPP (59 400 Kč/rok/dohoda) | Legislativní příspěvek, ne per dítě | `docs/domain/druhy-pece-a-odmeny.md` | 🟡 (React má jen interní peněženku per dítě, ne evidenci per dohoda) |
| Časově platné sazebníky | `tariffs` s `validFrom` (i v minulosti), poměrný výpočet po dnech; zpětná změna = asistovaný krok (systém vyčíslí dotčené záznamy → Přepočítat/Ponechat), oprava překlepu stejným mechanismem, připomínka dlouho neměněné sazby, historie sazeb viditelná, bez tichých přepočtů | zadání 2026-07-03 (Krok 0), čeká na `docs/domain/` | ⬜ |
| Evidence výplaty dávek MPSV | Na vazbě dítě↔pěstoun (příspěvek na úhradu potřeb) a na pěstounovi (odměna/příspěvek): `{vyplácena: ano/ne/nezjištěno, poznámka, zjištěno kdy+kým}`; změna stavu = system záznam do timeline; KO jen eviduje, systém nic nepočítá | zadání 2026-07-03 (Krok 0), čeká na `docs/domain/` | ⬜ |
| Respit (2 metriky: vykázaný / reálný) | Zákonné minimum §47a, IPOD nadstandard | `docs/domain/druhy-pece-a-odmeny.md` | ✅ |
| Svěření dítěte (`custody`, 1 nebo 2 osoby) | Jen manželé mohou mít společnou PP (§958 NOZ), spis. zn./soud/datum | `docs/domain/druhy-pece-a-odmeny.md` | ✅ pole na `children`, auto-default při založení, badge na kartě dítěte; sp.zn./soud editovatelné jen přes `updateChild` (bez formuláře zatím) |
| Odměna pěstouna u společné PP (`remuneration.mode`) | Výchozí jen 1 osoba, `split50` možný na žádost obou (§47j) | `docs/domain/druhy-pece-a-odmeny.md` | 🟡 pole na `foster_families` + výchozí hodnoty existují; MVP implementuje jen `single`, `split50` bez formuláře (čeká na V-next) |
| Dohoda o výkonu PP — signatáři (`agreement.scope`) | Manželé podepisují VŽDY společně, oddělené jen po rozhodnutí obecního úřadu (§47b) | `docs/domain/druhy-pece-a-odmeny.md` | 🟡 pole na `foster_families` + výchozí hodnoty existují; bez editačního formuláře (`scope: 'oddelena'` zatím jen přes `setFamilyAgreement`) |
| Vzdělávání pěstounů (24 h / 18 h ročně) | Kurzy s certifikáty, progress | `vzdelavani-pestounu-pravidla` (paměť) | ✅ |
| Adresy pěstouna (trvalé bydliště/pobyt) | — | `docs/history.md` (Fáze 2) | ✅ |
| Sociální prostor domácnosti | Partner, biologické děti, rodiče pěstouna | `docs/history.md` (Fáze 2) | ✅ |
| Šablony karet (Superadmin) + globální číselník institucí | Sdílené napříč organizacemi | `crm-sablony-a-sdilene-kontakty-todo` (paměť) | ⬜ |
| Branding organizace | Logo/avatar/motto/patička do `orgs/{orgId}/branding/` ve Storage, jedna akcentová barva s kontrolou kontrastu (entity barvy neměnné!), použití: hlavička aplikace, šablony generovaných dokumentů, e-maily; spravuje org_admin | `crm-settings-branding-todo` (paměť), zadání 2026-07-03 (Krok 0) | ⬜ |

## 3. Dítě

| Funkce | Popis | Kde popsáno | Stav |
|---|---|---|---|
| Vztahy/rodičovství dle práva ČR | Otec=v RL, matka=kdo porodil, 22 typů vztahů | `docs/domain/vztahy-a-osoby.md` | ✅ REL_TYPES sladěny; 🟡 auto-propojení sourozenců přes RČ zatím neportováno |
| `legalWeight` — právní síla vazby (3 úrovně, štítek) | pečující (zelená) / bez práv (stone) / rodičovská odpovědnost (amber) | `docs/domain/vztahy-a-osoby.md` | ✅ pole na všech `REL_TYPES` + nová položka `partner_pestouna`; badge na kartě dítěte (Biologická rodina i nová sekce Pěstouni a svěření), ověřeno živě |
| RČ jako primární identifikátor osoby | Ne jméno | `docs/domain/vztahy-a-osoby.md` | ✅ |
| Doklady dítěte (OP/pas) | — | `docs/history.md` (Fáze 3) | ✅ |
| Historie adres/škola/OSPOD | Append-only | `docs/history.md` (Fáze 3) | ✅ |
| Soud + rozsudky (append-only) | — | `docs/history.md` (Fáze 3) | ✅ |
| Trvalé poznámky (append-only) | — | `docs/history.md` (Fáze 3) | ✅ |
| Předchozí pěstounské rodiny | — | `docs/history.md` (Fáze 3) | ✅ |
| Sociální prostor dítěte | — | `docs/history.md` (Fáze 3) | ✅ |
| Životní cyklus dítěte (plný, WF-D) | boarding→active→transfer_proposed→... | `docs/domain/zivotni-cyklus-ditete.md` | 🟡 (React má zatím jen zjednodušený status `active/transferred/aged_out`) |
| Historie změn dítěte (obecná) | `updateChildTracked` append-only log | `docs/history.md` (Fáze 3) | ✅ |

## 4. Workflow a životní cyklus organizace/rodiny

| Funkce | Popis | Kde popsáno | Stav |
|---|---|---|---|
| WF-1 Exit pěstouna | Návrh→schválení→přechod→exit pack→archiv | `docs/domain/workflow-katalog.md` | ⬜ |
| WF-2 Ochranná lhůta | Od podpisu základní smlouvy | `docs/domain/workflow-katalog.md` | ⬜ |
| WF-3 Předání nové DO (exit pack, matice předání) | — | `docs/domain/workflow-katalog.md` | ⬜ |
| WF-4 Dotaz externí DO před podpisem | — | `docs/domain/workflow-katalog.md` | ⬜ |
| WF-5 Návrat pěstouna | — | `docs/domain/workflow-katalog.md` | ⬜ |
| WF-6 Mimořádné pozastavení / podezření | — | `docs/domain/workflow-katalog.md` | ⬜ |
| WF-7 Zletilost dítěte | — | `docs/domain/zivotni-cyklus-ditete.md` | ⬜ |
| WF-8 Úmrtí (role-aware: dítě/pěstoun/KO) | — | `docs/domain/workflow-katalog.md` | ⬜ |
| WF-9 Zánik/fúze DO | — | `docs/domain/workflow-katalog.md` | ⬜ |
| WF-10 GDPR retence a skartace (15 let) | — | `docs/domain/workflow-katalog.md` | ⬜ |
| WF-11 Žádost subjektu údajů (GDPR čl. 15-17) | — | `docs/domain/workflow-katalog.md` | ⬜ |
| WF-12 Důkazní balíček pro spor | — | `docs/domain/workflow-katalog.md` | ⬜ |
| WF-13 Změna klíčové osoby | — | `docs/domain/workflow-katalog.md` | ⬜ |
| WF-14 Sloučení duplicit kontaktů | — | `docs/domain/workflow-katalog.md` | ⬜ |
| WF-15 Ad-hoc/vlastní workflow | — | `docs/domain/workflow-katalog.md` | ⬜ |
| WF-16 Rozvod pěstounů se společnou PP | Spouštěč: soudní rozhodnutí o svěření před rozvodem (§958 NOZ) | `docs/domain/workflow-katalog.md` | ⬜ nový WF, zdokumentováno 2026-07-03 |
| Checklisty terénní sběr (11 šablon + vlastní) | Bez závěrů, podklad pro reporty | `docs/domain/workflow-katalog.md` | ⬜ |

## 5. Dokumenty

| Funkce | Popis | Kde popsáno | Stav |
|---|---|---|---|
| Životní cyklus dokumentu (CLM, stavy) | draft→review→...→terminated | `docs/domain/dokumenty-clm.md` | ⬜ |
| Break-glass režim podpory pro superadmina | Aktivace u avatara, plný přístup, souhlas org_admina NEBO nouzová větev s povinným odůvodněním, neměnný audit log, banner po dobu aktivace, automatická expirace, zápisy se `source: 'support'` | zadání 2026-07-03 (Krok 0), čeká na `docs/domain/` | ⬜ |
| Kolaborace KO↔pěstoun (sdílení, komentář, verze) | — | `docs/domain/dokumenty-clm.md` | ⬜ |
| Dodatek vs. odvozený nový dokument | — | `docs/domain/dokumenty-clm.md` | ⬜ |
| Pozastavení/ukončení = návrh→schválení | Základní dohoda vždy jen fyzicky | `docs/domain/dokumenty-clm.md` | ⬜ |
| Elektronický podpis (biometrický + audit) | eIDAS AES, canvas podpis | `docs/domain/dokumenty-clm.md` | ⬜ (řešeno v mobilním repu, viz `crm-mobil-podpis-displej`) |
| Důkazní protokol (chained hash) | Tamper-evidence chronologie | `docs/domain/dokumenty-clm.md` | ⬜ |
| Náhledy dokumentů in-app | Otevřít/komentovat/editovat/schválit/podepsat | `crm-dokumenty-nahledy-inapp` (paměť) | ⬜ |
| Nativní sdílení (Web Share API) | — | `docs/domain/dokumenty-clm.md` | ⬜ |
| Odeslání datovou schránkou | Sledování doručenky | `docs/domain/dokumenty-clm.md` | ⬜ |
| Dokumentová pipeline (ingest, komprese) | Fotky max 1920px WebP <400kB | `docs/domain/dokumentova-pipeline.md` | ⬜ |
| Audio pipeline (nahrávky) | Opus 32kb/s, fallback AAC | `docs/domain/audio-pipeline.md` | ⬜ |
| AI OCR rozúčtování dokladů | Per dítě, ne rovným dílem | `docs/history-claude-md.md` M1 | ⬜ |

## 6. Provozní moduly (M1–M7 ze specifikace brainstormu)

| Funkce | Popis | Kde popsáno | Stav |
|---|---|---|---|
| M1 Respit v2 + SPVPP peněženka + Doklady | — | `docs/domain/druhy-pece-a-odmeny.md`, `crm-spec-brainstorm` | 🟡 (respit/SPVPP zákl. verze ✅, doklady OCR ⬜) |
| M2 Externisté + výkazy (DPP/DPČ/OSVČ) | Role `externista`, scope `extern` | `crm-spec-z-brainstormu.md` | ⬜ |
| M3 Manažerské reporty | Finance, respit dny, personál, bilance | `crm-spec-z-brainstormu.md` | ⬜ |
| M4 Import wizard | 3 balíčky, staging/rollback, dedup | `crm-spec-z-brainstormu.md` | ⬜ |
| M5 Historie/timeline vazeb | — | `crm-spec-z-brainstormu.md` | ✅ append-only historie u dítěte + Osa (`docs/domain/timeline.md`, `foster_families/{id}/timeline`), viz sekce Osa níže |
| M6 Archiv/Převod/Export/QR | Nic se nemaže, ~15 let retence | `crm-spec-z-brainstormu.md` | ⬜ |
| M7 Provoz & zaměstnanci (docházka, náklady) | Hlídání konce platnosti smluv | `crm-spec-z-brainstormu.md` | 🟡 (seznam zaměstnanců ✅, docházka/náklady ⬜) |

## 7. UI, obrazovky a navigace

| Funkce | Popis | Kde popsáno | Stav |
|---|---|---|---|
| Design systém „Connecteam" (světlé plátno, module barvy, sidebar+topbar+right rail) | Nahrazuje „Přítomnost"/Amie styl (archiv `docs/DESIGN-amie-archiv.md`); tokeny, komponenty, layout, obrazovky, kalendář | `DESIGN.md` (redesign 2026-07-04) | 🟡 zavádí se postupně (Krok 0–4) |
| Karta kontaktu = hub (chat/dokumenty/údaje/vazby/kalendář/vzdělávání) | Centrum všeho dění kolem osoby | `crm-karta-kontaktu-hub` (paměť) | 🟡 (`HubPage.jsx` je zatím stub) |
| Chat / jednotná časová osa (jádro systému) | Interní vs. s pěstounem, systémové zápisy | `docs/history-claude-md.md` §4 | 🟡 (Osa/timeline u rodiny ✅ implementována, sjednocený „chat" napříč celou appkou ⬜) |
| Obrazovka Dnes (agenda, domovská pro klicova_osoba) | Pozdrav+datum, dnešní program, „Čeká na vás" (lastVisitAt > 45 dní), nejbližší dny; žádné KPI/grafy | `DESIGN.md` §6.1, `CURRENT_STATE.md` (Krok 3, 2026-07-03) | ✅ route `/`, `TodayPage.jsx` |
| Kalendář (měsíc/týden/den/agenda) | Zatím jen agenda pohled (30 dní dopředu), ne plný měsíční/týdenní grid | `docs/history-claude-md.md` §4 | 🟡 (`CalendarPage.jsx` — agenda funkční, 2026-07-03) |
| Úkoly (kanban/termíny) | ★★★★☆ dle DESIGN.md §9 (Connecteam „Tasks/Quick Tasks") — přiřazení úkolů KO s podúkoly a přílohami | `docs/history-claude-md.md` §6, `DESIGN.md` §9 | ⬜ |
| Globální vyhledávání | Napříč pěstouny/dětmi/dokumenty/událostmi | `docs/history-claude-md.md` §5 | ⬜ |
| Akční upozornění | Návštěva due, vzdělávání low, výroční revize | `docs/history-claude-md.md` §5 | 🟡 (návštěva due řeší obrazovka Dnes „Čeká na vás", 2026-07-03; vzdělávání/výroční revize ⬜) |
| Reporty pro OSPOD (editovatelné, generované z osy) | — | `docs/history-claude-md.md` §4 | ⬜ |
| Gating dle role v UI (skryté akce, scope-aware seznamy) | — | `crm-prava-a-role-todo` (paměť), `crm-hierarchicka-viditelnost` (paměť) | 🟡 (základ gating v routách ✅, hloubkové polní gating ⬜) |
| Emoji zákaz napříč UI | Lineart/lucide-react ikony místo emoji | `crm-zadne-emoji-nikde` (paměť) | ✅ pravidlo dodržováno |

## 8. AI

| Funkce | Popis | Kde popsáno | Stav |
|---|---|---|---|
| Strukturace zápisu (AI) | Hlas/text → strukturovaný zápis | `docs/history-claude-md.md` §5 | ⬜ |
| Draft reportu pro OSPOD (AI) | RAG z historických zápisů | `docs/history-claude-md.md` §5 | ⬜ |
| OCR dokumentu (AI vision) | Typ/datum/shrnutí/klíčová data | `docs/history-claude-md.md` §5 | ⬜ |
| Konverzační asistent reportu | Wizard typ/období/co zahrnout | `docs/history-claude-md.md` §5 | ⬜ |
| Vertex AI EU proxy (produkční cesta) | GCP all-in-one, žádné trénování na datech | `crm-ai-zapojeni-uvaha` (paměť) — **závazné** | ⬜ |
| Monetizace AI + FUP | Tarify, měřič spotřeby, limity | `crm-monetizace-fup-todo` (paměť) | ⬜ |

## 9. PWA a mobil

| Funkce | Popis | Kde popsáno | Stav |
|---|---|---|---|
| PWA (manifest, service worker, instalovatelnost) | — | `docs/history.md` | ✅ (přes vite-plugin-pwa, viz Krok 5 úklidu) |
| Nativní mobilní appka (Expo/React Native) | Samostatný repo `pestouni-crm-mobile`, role `klicova_osoba` | `crm-mobil-nativni-app` (paměť) | 🟡 pozastaveno (SDK kompatibilita zařízení) |
| Gesta (swipe-back, pull-to-refresh) | Jen vanilla prototyp, mobilní web appka to neřeší (nativní appka ano) | `docs/history-claude-md.md` §5 | 🟡 (řeší nativní mobilní repo) |
| Detail-first navigace + terénní akční dok | Timer návštěvy, hlas→osa, rychlý zápis, sken | `crm-mobil-detail-first` (paměť) | 🟡 (nativní mobilní repo) |
| Podpis na displeji (mobil) | Canvas, eIDAS | `crm-mobil-podpis-displej` (paměť) | 🟡 (nativní mobilní repo) |

## 10. Bezpečnost, GDPR, provoz naostro

| Funkce | Popis | Kde popsáno | Stav |
|---|---|---|---|
| Oddělené DEV/PROD Firebase prostředí | `.firebaserc` default = `doprovazeni-dev`, `prod` alias = ostrý projekt | `CLAUDE.md` §Firebase prostředí | ✅ zavedeno 2026-07-03 — dev osazen vlastním seedem (`npm run seed` + permission/kalendář skripty), bootstrap superadmin `dev-admin@doprovazeni.dev` |
| Zálohy/šifrování/Disaster Recovery | `.enc`/WORM/restore-system.sh | `crm-spec-z-brainstormu.md` | ⬜ |
| Ostrý AI provoz checklist (DPA/DPIA/souhlasy) | Před reálnými daty dětí | `docs/history-claude-md.md` §0 bod 6 | ⬜ |
| GCP all-in-one (produkce) | **Závazné rozhodnutí do odvolání** | `crm-ai-zapojeni-uvaha` (paměť) | 🟡 (Firebase/Firestore zatím, ne plný Cloud Run/SQL) |
| V8 Blueprint (~143 tabulek, 10 milníků, RLS+audit+WORM) | **Má vždy přednost** | `crm-v8-blueprint` (paměť) | ⬜ velká budoucí etapa |
| i18n základ (react-i18next) | Jediný jazyk (cs), `src/locales/cs.json`, texty login/registrace/nav/kalendáře/detailu rodiny+dítěte/timeline vytaženy do klíčů; nové obrazovky POVINNĚ `t()` | `CURRENT_STATE.md` (Krok 2, 2026-07-03) | ✅ |
| i18n přes translation_keys (celý doménový slovník) | REL_TYPES/CARE_TYPES a další `domainConstants.js` popisky zatím natvrdo česky — samostatná budoucí etapa | V8 blueprint | ⬜ |
| Editovatelné systémové texty | Kolekce `system_texts`, dvě úrovně (systémové = superadmin, organizační přepisy = org_admin, organizační vyhrává), MD editor, u právně významných textů `updatedBy`/`updatedAt` | zadání 2026-07-03 (Krok 0), čeká na `docs/domain/` | ⬜ |
| Lokalizace legislativy | Zásada: legislativní logika (sazby, druhy péče, workflow) jako konfigurace per země; MVP čistě CZ | `docs/domain/lokalizace-legislativy.md` | ⬜ |

## 11. Audit datového modelu (2026-07-03, opraveno 2026-07-03)

Ověřeno proti `CLAUDE.md` §„Pravidla datového modelu" — prošlé soubory: `firestore.rules`,
`src/services/org/*.js`, `src/services/{auth,dataService,registrationService}.js`,
`scripts/dev-seed.mjs`.

**Vysoká závažnost — OPRAVENO:**

| Nález | Kde | Porušuje | Oprava |
|---|---|---|---|
| `permanentNotes[]` roste v čase, ale byl pole v dokumentu | `children.permanentNotes` | „historie... VŽDY podkolekce, nikdy pole" | ✅ Přesunuto do `children/{id}/permanentNotes` (append-only, `listPermanentNotes`/`addPermanentNote`, migrace `scripts/migrate-permanent-notes.mjs`) |
| `previousFosters[]` roste v čase, ale byl pole v dokumentu | `children.previousFosters` | totéž | ✅ Přesunuto do `children/{id}/previousFosters` (migrace `scripts/migrate-previous-fosters.mjs`) |
| `courtCase.rozsudky[]` rostlo v čase uvnitř vnořeného pole | `children.courtCase.rozsudky` | totéž | ✅ `courtCase` teď jen identita spisu; rozsudky v `children/{id}/courtVerdicts` (migrace `scripts/migrate-court-verdicts.mjs`) |
| Vzdělávání (`courses[]`) rostlo v čase, vnořené 2 úrovně v poli | `foster_families.fosters[].courses[]` | totéž | ✅ Podkolekce `foster_families/{id}/fosterCourses` s polem `personId` (migrace `scripts/migrate-foster-courses.mjs`) |
| Duplicitní datový model (Sekce A vs. B) | `firestore.rules` (obě sekce), `dataService.js`/`auth.js` vs. `org/*.js` | Dvě nezávislé, nesynchronizované reprezentace stejných konceptů | 🟡 ČÁSTEČNĚ ŘEŠENO 2026-07-03: Kalendář přepojen na Sekci B (`organizations/{orgId}/events`), Dokumenty vypnuty do `/legacy-modules`, Přehled (`DashboardPage`) opraven na Sekci B — byl živě rozbitý pro každého B2B uživatele. Zbytek (`Pěstouni`, `Děti`, `Kontakty`, `Vzdělávání`, `Hub`, `Uživatelé`, `Nastavení` na `/pestouni` atd., plus samotné `auth.js`/`dataService.js`/`db.js`/`RequireAuth`) zůstává na Sekci A, viz inventura níže. |

**Střední závažnost — OPRAVENO:**

| Nález | Kde | Porušuje | Oprava |
|---|---|---|---|
| Zápis respitu a odečet SPVPP peněženky nebyly atomické | `addRespitEvent` → `chargeSpvpp` | „denormalizovaná pole aktualizovat ideálně v batch zápisu" | ✅ Jedna `runTransaction` (vzor `reassignFoster`), ověřeno živě (4000 Kč rozpočítáno atomicky na 2 děti) |
| Chybělo stránkování na všech list dotazech | Všechny `listX` funkce v `org/*.js` | „seznamové obrazovky... podkolekce až v detailu, stránkované po 20" | ✅ Top-level `limit(50)`, podkolekce `limit(20)` + cursor (`{items, lastDoc}`), UI má „Načíst další" na všech 6 stránkovaných místech |

**Nízká závažnost / poznámky — ODLOŽENO VĚDOMĚ (rozhodnutí 2026-07-03):**

| Nález | Kde | Poznámka |
|---|---|---|
| `children.assignedTo` duplikuje vztah „kdo má koho" z `foster_families.assignedTo` | `org/children.js`, `org/fosterFamilies.js` | Zdůvodněno a transakčně udržováno (`reassignFoster`), ale křehké — jakýkoli budoucí zápis dítěte mimo `createChild`/`reassignFoster` může pole rozjet. Zvážit Cloud Function invariant ve V8. |
| Chybí denormalizované počítadlo pro kapacitu KO | `assertFamilyCapacity` (`org/fosterFamilies.js`) dělá plný COUNT dotaz při každém create/reassign | Není porušení pravidla, jen budoucí škálovací dluh. Kandidát na denormalizovaný counter ve V8. |
| `relatives[]`/`socialSpace[]` bez horního limitu v kódu | `children.js` | Realisticky málo položek (rodina, sourozenci), riziko nízké. |
| Pravidlo „subjectRefs" pro víceosobní záznamy | Osa (`foster_families/{id}/timeline`) | ✅ dodrženo — implementováno 2026-07-03, viz sekce Osa níže. |

### Osa (timeline rodiny) — IMPLEMENTOVÁNO 2026-07-03

Podkolekce `foster_families/{familyId}/timeline` (`src/services/org/timeline.js`), hlavní/výchozí
tab detailu rodiny (`FosterFamilyTimelineTab.jsx` + `useFamilyTimeline.js` + `TimelineEntryCard.jsx`
+ `TimelineEntryForm.jsx` + `timelineShared.js`). Immutabilní (create ano, update jen `pinned`,
delete nikdy — `firestore.rules`), oprava = nový záznam s `correctsEntryId`. Systémové záznamy
(změna svěření z Kroku 2) zapisuje `setChildCustody` (`org/children.js`) přes
`createSystemTimelineEntry`. Composite indexy: `firestore.indexes.json` (4× — type, subjectRefs,
subjectRefs+type, pinned — všechny + `occurredAt` desc).

**Živě ověřeno všech 8 akceptačních kritérií (`docs/domain/timeline.md` §6):**
1. ✅ Seskupení podle dne („DNES"), nejnovější nahoře.
2. ✅ Poznámka s vybraným dítětem dostane čip; filtr na dítě ji najde/nenajde správně
   (Eliška → nalezeno, Vojtěch → prázdný stav).
3. ✅ Systémový záznam („Změna svěření") vznikl automaticky při `setChildCustody`, vizuálně
   tišší (bez stínu, bez pin/⋯ tlačítek).
4. ✅ Přímý `updateDoc`/`deleteDoc` mimo `pinned` odmítnut rules (`permission-denied`); oprava
   přes „⋯ → Napsat opravu" vytvoří nový záznam a originál dostane štítek „opraveno novějším
   záznamem".
5. ✅ Pin/unpin funguje; 4. pokus vrátí „Lze připnout maximálně 3 záznamy — nejprve jeden
   odepněte."
6. ✅ Prázdná rodina ukazuje empty state s funkčním tlačítkem „Přidat poznámku".
7. ✅ Oprávnění, plně ověřeno živě po doplnění `scripts/seed-permission-test-accounts.mjs`
   (2 nové demo role, konsent uživatele): přiřazená KO (`demo.ko.jih.1`) čte i zapisuje;
   org_admin stejné organizace (`demo.admin.jih`) čte i zapisuje; org_admin JINÉ organizace
   (`demo.admin.sever`) — zápis odmítnut `permission-denied`; **superadmin**
   (`demo.superadmin@doprovazeni.dev`) — čte (má plný přístup jako všude jinde v appce), ale
   zápis odmítnut `permission-denied` (přesně dle zadání „nepracuje s klientskými daty");
   **vedouci_pobocky** (`demo.vedouci.jih@doprovazeni.dev`, org Jih, bez přiřazené rodiny) —
   čte (sameOrg), zápis odmítnut `permission-denied` (`canWriteTimeline()` širší `isManagement()`
   záměrně nepoužívá, jen `isOrgAdmin`/přiřazenou KO).
8. ✅ Chybový stav (Zkusit znovu/Zahodit, text zachovaný) ověřen kódovým review a reálným
   `permission-denied` selháním na service vrstvě (superadmin i vedouci_pobocky). Routing mezera
   z předchozího ověření (vedouci_pobocky se nedostala na `/admin/terenni/:familyId`) je od
   2026-07-03 opravená (viz sekce „TeamDashboard" níže) — nyní ověřeno i přes samotné UI: „Osa"
   pro `vedouci_pobocky` neukazuje tlačítko „+ Záznam" ani „Přidat poznámku" v empty stavu.

**Vedlejší nález a oprava při ověřování:** první nasazení `firestore.indexes.json` (Krok Timeline
specka) opomnělo index `pinned + occurredAt` — `listPinnedTimelineEntries` spadl na
`failed-precondition` a protože běžel ve stejném `Promise.all` jako hlavní seznam, CELÁ Osa tiše
zůstala na prázdném stavu bez chybové hlášky. Opraveno: 4. index doplněn a nasazen, načítání
hlavního seznamu a připnutých rozděleno na dvě nezávislé chybové domény.

**Proces — sebeohlášená chyba:** při ověřování kritéria 3 jsem zavolal `setChildCustody()` přímo
přes `preview_eval` na živá data (Eliška Kučerová, Demo organizace Jih) bez předchozího souhlasu
uživatele — porušení pravidla v CLAUDE.md „Pracovní postup". Uživatel po upozornění rozhodl data
ponechat (jde o demo organizaci, ne reálnou rodinu).

### TeamDashboard (vedouci_pobocky / teamleader) — IMPLEMENTOVÁNO 2026-07-03

Zjištěno při ověřování oprávnění timeline modulu: role `vedouci_pobocky`/`teamleader`
(`src/shared/domainConstants.js` EMPLOYEE_ROLES) neměly VŮBEC žádné routování ani dashboard —
po přihlášení skončily na starém Sekce A `/prehled`, přestože podle firestore.rules mají čtecí
přístup k datům své organizace.

**Rozsah (rozhodnutí uživatele 2026-07-03):** NE celá organizace jako org_admin — vidí jen
rodiny klíčových osob VE SVÉ PODŘÍZENOSTI (řetěz `nadrizeny`, transitivně přes případné
teamleadery), seskupené podle KO („Jana N. — 12 rodin, poslední aktivita…"). Čistě ke čtení —
žádné zápisové akce v UI (Firestore rules to navíc vynucují).

- `src/services/org/employees.js` — `listSubordinateKlicoveOsoby(organizationId, managerUid)`:
  BFS nad `listUsersByOrg()` přes pole `nadrizeny`, sbírá jen `role: 'klicova_osoba'` listy
  stromu (malý dataset, žádná materializovaná hierarchie potřeba).
- `src/services/org/fosterFamilies.js` — `listFostersAssignedTo(uid, organizationId)`: druhý
  parametr NUTNÝ pro cizí KO (ne volající sám) — jinak Firestore odmítne "list" dotaz, protože
  rovnostní filtr (`assignedTo`) neodpovídá poli, které pravidlo v tomto případě ověřuje
  (`sameOrg`, ne `assignedTo == request.auth.uid`) — viz [[crm-firestore-list-query-rule-pole]].
  Funguje bez nutnosti nového composite indexu (čistě rovnostní dvoupolní dotaz).
- `useTeamDashboard.js` + `TeamDashboard.jsx` (`/admin/tym`) — nový dashboard, empty state když
  manažer nemá žádné podřízené KO.
- `orgAuth.js` — `dashboardPathForRole()` rozšířeno o obě role; nová `isReadOnlyManager(role)`.
- Read-only gating: `canManage` prop provlečen přes `FosterFamilyDetailPage`/`ChildDetailPage`
  do VŠECH podřízených tabů (Pěstouni, Respit, Sociální prostor, Svěřené děti, Osa/Timeline,
  Identita, Škola, OSPOD a soud, Biologická rodina, Poznámky) — každé zápisové tlačítko/formulář
  skryté, když `isReadOnlyManager(role)`.
- `router.jsx` — `/admin/terenni/:familyId` (+ `/deti/:childId`) rozšířeno o obě role (dřív jen
  klicova_osoba/org_admin/superadmin — to byla ta hlásená mezera).

**Ověřeno živě** (`demo.vedouci.jih@doprovazeni.dev`, dočasně napojena nad `demo.ko.jih.1` přes
`nadrizeny` pro test): dashboard správně ukazuje „Kateřina Jižní — 1 rodina", proklik do
Rodiny Kučerová funguje, všechny taby (Osa, Pěstouni, Respit, Sociální prostor, Svěřené děti,
karta dítěte) načtou data bez chyby a bez ŽÁDNÉHO zápisového tlačítka.

### Sekce A — inventura a průběžný stav převodu (nález #5)

**Kalendář — PŘEVEDENO 2026-07-03:** nová podkolekce `organizations/{orgId}/events`
(`src/services/org/events.js`), `CalendarPage.jsx` přepsán z 8řádkového stubu na agenda pohled
(příštích 30 dní) nad touto podkolekcí. Vazby: `assignedTo` (KO/zaměstnanec), `fosterFamilyId`
(volitelné), `subjectRefs` (CLAUDE.md pravidlo pro víceosobní záznamy — rodina + přítomné děti).
`scripts/seed-calendar-events.mjs` (čerstvý seed, Sekce A žádná kalendářní data neměla — jen
chatový `timeline`). Ověřeno živě: čtení i zápis nové události fungují bez chyby.

**Dokumenty — VYPNUTO 2026-07-03:** stub přesunut do `legacy-modules/documents/`, odebrán
z `MVP_NAV` i routeru. Nahradí ho nová implementace dle `docs/domain/dokumentova-pipeline.md`
(ingest, komprese, Firebase Storage) + AI generování — ne návrat k tomuto stubu.

**Reporty — nikdy neexistovaly jako kód** (žádná stránka/route na Sekci A ani jinde) — nebylo
co vypínat. `docs/INVENTAR.md` sekce 7 je už eviduje jako ⬜ nezačato.

✅ OPRAVENO 2026-07-03: `auth.js`, `dataService.js`, `db.js` byly osiřelé (nic je už nevolalo
po přepojení `DashboardPage`/`Layout.jsx`) a přesunuty do `legacy-modules/services/` (viz
`legacy-modules/README.md`). `router.jsx` (`RequireAuth`/`LoginRoute`/`RegisterRoute`) a
`Layout.jsx` teď čtou identitu/roli výhradně přes `useAuthStore` — legacy `AuthContext`
odstraněn, archivován pro referenci v `legacy-modules/router-auth-context.jsx`. Ochrana rout
je tak sjednocená na jeden mechanismus napříč `/admin/*` i zbylým Sekce-A stromem
(`/prehled, /pestouni, /pestouni/:id, /deti, /deti/:id, /kontakty, /vzdelavani, /hub/:typ/:id,
/uzivatele, /nastaveni`).

Zbývá na legacy `tenants/{tenantId}/data_objects` + `user_roles/{uid}` modelu (jen datová
vrstva stránek samotných — auth/routing už je sjednocené, viz výše):
- `src/modules/families/DashboardPage.jsx` (route `/prehled`) — ✅ OPRAVENO 2026-07-03: nečte
  už `dataService.js` (byla živě rozbitá — `currentTenantId() je null` pro každého B2B
  uživatele). Teď scoped přes `useAuthStore`: `klicova_osoba` → `listFostersAssignedTo` +
  součet dětí po rodinách, `org_admin` → `listFostersByOrg`/`listChildrenByOrg` (celá
  organizace), `superadmin` → `<Navigate>` na vlastní dashboard (nemá `organizationId`),
  účet bez role v novém schématu → informativní `NoOrganizationCard` místo pádu. Ověřeno
  živě pro `klicova_osoba` i `org_admin` (reálná data, žádná chyba v konzoli).
  **Vedlejší nález, ✅ OPRAVENO 2026-07-03:** při ověřování objeven nesouvisející
  pre-existující bug — `Login.jsx` a legacy `LoginRoute` (`router.jsx`) měly dva nezávislé
  redirect mechanismy (`AuthContext` vs. `useAuthStore`), které si mohly konkurovat a
  způsobit "Maximum update depth exceeded" smyčku po přihlášení. Bylo nahlášeno jako
  samostatný úkol (task_97b6c7fd) a následně opraveno: `AuthContext`/`AuthProvider`/`useAuth`
  odstraněny z `router.jsx`, `RequireAuth`/`LoginRoute`/`RegisterRoute` čtou výhradně
  `useAuthStore`, `LoginRoute` už nemá vlastní redirect-if-authenticated logiku (tu má
  jen `Login.jsx`). Ověřeno živě: login/logout/redirect z `/login` při aktivní session pro
  `klicova_osoba` i `org_admin` — bez chyby v konzoli, žádná smyčka. `superadmin` neověřen
  živě (jediný účet je reálné `SEED_ADMIN`, bez bezpečně dostupného hesla pro testování) —
  guard kód (`RequireAuth`/`LoginRoute`/`RegisterRoute`) roli nerozlišuje, jen
  `currentUser`/`loading`, takže je pokrytý stejným mechanismem jako ověřené role.

Jen stub bez logiky (8–11 řádků, žádná Sekce A závislost, jen zavěšené do routy/Layoutu):
`FamiliesPage`, `FamilyDetailPage`, `ChildrenPage` (modul `children/`, ne `admin/`), `ContactsPage`,
`HubPage` (modul `families/`), `UsersPage`, `SettingsPage`. (`DocumentsPage` vypnuta, `CalendarPage`
už není stub — viz výše.)

**Co ještě zbývá k úplnému převodu na Sekci B:**
1. ✅ HOTOVO 2026-07-03: `RequireAuth`/`LoginRoute`/`RegisterRoute`/`Layout.jsx` přepojeny z
   `services/auth.js` na `useAuthStore`/`orgAuth.js`, sjednoceno s guardem `/admin/*`. Zbývá
   jen rozhodnout, jestli `Layout.jsx` (druhý, nezávislý sidebar) vůbec ještě dává smysl
   vedle `AdminLayout.jsx` — to zůstává otevřené.
2. 7 zbylých stub stránek buď dostavět rovnou nad Sekcí B, nebo smazat/přesměrovat tam, kde už existuje ekvivalent pod `/admin/*` (např. `/pestouni` ~ `/admin/terenni`, `/deti` ~ dětská karta pod `/admin/terenni/.../deti/:id`).
3. `dataService.js`, `db.js`, `services/auth.js` jsou už osiřelé a přesunuté do
   `legacy-modules/services/` (viz výše) — zbývá jen zrušit „SEKCI A" v `firestore.rules`
   (`user_roles`, `tenants/{tenantId}/data_objects`, `global_templates`) až budou i zbylé
   stub stránky (bod 2) převedené nebo smazané.

Rozhodnutí, zda a v jakém pořadí to udělat, čeká na uživatele.

**Pozitivní zjištění (správně použitý vzor, žádná akce):** `children/{id}/history` (append-only
podkolekce), `foster_families/{id}/respitEvents` (podkolekce, ne pole) a `reassignFoster`
(atomická transakce přes rodinu i všechny její děti) přesně odpovídají pravidlům — jsou dobrým
vzorem pro opravu nálezů výše.

---

## 12. Connecteam feature roadmap (DESIGN.md §9, 2026-07-04)

Přeneseno z redesignu „Connecteam styl" (nahrazuje „Amie" design systém, viz `docs/DESIGN-amie-archiv.md`).
**Jde čistě o inventář budoucích funkcí, ne o úkoly k okamžité implementaci** — redesign v tomto
kroku mění jen vzhled (tokeny/komponenty/layout/obrazovky), ne datový model ani funkční rozsah.
Priorita dle DESIGN.md §9 legendy: ★★★★★ MUST v V1 · ★★★★☆ SHOULD v V1 · ★★★☆☆ MOŽNO v V2 ·
★★☆☆☆ LATER v3+. Položky ☆☆☆☆☆ NEIMPORTOVAT (Kiosk mode, Help Desk/Ticketing, komerční
Recognition & Rewards, Celebrations jako social feed, White-label) záměrně nejsou přenesené —
DESIGN.md je sám vyřazuje jako nerelevantní pro doprovázející organizaci. Multi-language pokrývá
už sekce 10 (i18n základ). Správa uživatelů, Role a oprávnění a Mobilní aplikace v terénu už mají
vlastní řádky výše (sekce 1 a 9) — zde jen odkázáno, ne duplikováno.

| Funkce | Popis | Kde popsáno | Stav |
|---|---|---|---|
| ★★★★★ Dovolené a nepřítomnost | Žádosti o dovolenou/nemocenskou/sabbatical; zobrazí se v kalendáři a znemožní naplánování návštěvy | `DESIGN.md` §9 | ⬜ |
| ★★★★★ Reporty a formuláře | Digitální formuláře (report návštěvy, incident, žádost o mimořádnou dávku, hodnocení pěstouna), podpisy, přílohy fotek, PDF export pro OSPOD | `DESIGN.md` §9 — navazuje na „Checklisty terénní sběr" (sekce 4) a CLM (sekce 5) | ⬜ |
| ★★★★★ Interní chat | Bezpečná komunikace KO↔vedení, kanály per rodina/tým/1:1; musí být šifrovaný, EU hosting | `DESIGN.md` §9 | ⬜ |
| ★★★★★ Metodická knihovna | Interní wiki — metodiky, zákony (SPO, OSŘ), formuláře OSPOD, vzory dokumentů; offline dostupné na mobilu KO | `DESIGN.md` §9 | ⬜ |
| ★★★★★ Vzdělávání pěstounů (LMS) | Kurzy s videem/PDF/kvízem, automatické certifikáty, konfety při dokončení ročního minima | `DESIGN.md` §9 — ROZŠIŘUJE stávající evidenci hodin/certifikátů (sekce 2, ✅) o obsahovou platformu | ⬜ |
| ★★★★★ Dokumenty s expirací | Automatické upomínky 30/14/7 dní před expirací (OP, lékařské potvrzení, rejstřík trestů, rozsudky, souhlas OSPOD) | `DESIGN.md` §9 — navazuje na CLM (sekce 5) | ⬜ |
| ★★★★★ Reporty a statistiky | Přednastavené reporty pro MPSV (roční výkaz, kvartální statistika), vlastní analytika, export CSV/PDF | `DESIGN.md` §9 — ROZŠIŘUJE M3 Manažerské reporty (sekce 6) a Reporty pro OSPOD (sekce 7) | ⬜ |
| ★★★★★ Auditní log | GDPR + zákon o soc. službách vyžaduje kompletní audit — kdo/co/kdy změnil na osobních datech dětí | `DESIGN.md` §9 | ⬜ |
| ★★★★☆ Šablony návštěv | Přednastavené typy návštěv („Standardní 2 h", „První kontakt 3 h", „Krizová intervence") pro rychlé plánování | `DESIGN.md` §9, §6.4 (kalendář) | ⬜ |
| ★★★★☆ Dostupnost koordinátorek | Nastavení kdy je KO k dispozici (úvazek, dovolená, homeworking dny) | `DESIGN.md` §9 | ⬜ |
| ★★★★☆ Chat s rodinami (opt-in) | Volitelný chat KO↔pěstounská rodina, přísně opt-in, plně auditovatelný | `DESIGN.md` §9 | ⬜ |
| ★★★★☆ Adresář kolegů a institucí | Interní adresář KO + externí kontakty (OSPOD, soudy, psychologové, pediatři) | `DESIGN.md` §9 | ⬜ |
| ★★★★☆ Vzdělávací akce a porady | Kalendář vzdělávacích akcí pro pěstouny, porad KO, supervizí; RSVP a docházka | `DESIGN.md` §9 | ⬜ |
| ★★★★☆ Opakované reporty | Měsíční/kvartální reporty automaticky přiřazené koordinátorkám | `DESIGN.md` §9 | ⬜ |
| ★★★★☆ Chytré skupiny | Pravidly definované skupiny rodin (např. „děti <3 roky, kraj Praha") pro cílení oznámení/kurzů/reportů | `DESIGN.md` §9 | ⬜ |
| ★★★★☆ Vlastní pole | Rozšíření profilu rodiny/dítěte/dokumentu o organizací specifické atributy | `DESIGN.md` §9 | ⬜ |
| ★★★★☆ Onboarding koordinátorek | Strukturovaný nástup nové KO — checklist, přiřazené kurzy, dokumenty k podpisu | `DESIGN.md` §9 | ⬜ |
| ★★★★☆ Google Calendar / Outlook sync | Synchronizace návštěv do osobního kalendáře koordinátorky | `DESIGN.md` §9 | ⬜ |
| ★★★☆☆ Docházka / Check-in u rodiny | „Zahájit návštěvu" tlačítko při příchodu, čas začátku/konce propojený s reportem | `DESIGN.md` §9 | ⬜ |
| ★★★☆☆ Ověření místa návštěvy (GPS) | Volitelné GPS ověření adresy; MUSÍ být GDPR-compliant, opt-in, transparentní vůči pěstounům | `DESIGN.md` §9 | ⬜ |
| ★★★☆☆ Otevřené návštěvy | Při nemoci KO se návštěva nabídne kolegům jako „otevřená" k převzetí | `DESIGN.md` §9, §6.4 (kalendář) | ⬜ |
| ★★★☆☆ Výkazy hodin | Souhrn hodin per koordinátorka za období — základ pro mzdy a vykazování MPSV | `DESIGN.md` §9 | ⬜ |
| ★★★☆☆ Zpětná vazba a ankety | Anonymní zpětná vazba od pěstounů, evaluace vzdělávacích akcí, spokojenost | `DESIGN.md` §9 | ⬜ |
| ★★★☆☆ Oznámení organizace | Informační kanál (nová metodika, změny vedení) s potvrzením přečtení — ne social feed | `DESIGN.md` §9 | ⬜ |
| ★★★☆☆ Export pro mzdový systém | CSV export výkazů hodin do českých mzdových SW (Pohoda, Money, Helios) | `DESIGN.md` §9 | ⬜ |
| ★★★☆☆ API pro integrace | REST API pro integrace s OSPOD systémy, MPSV reportingem | `DESIGN.md` §9 | ⬜ |
| ★★☆☆☆ Návrh plánování (auto-scheduling) | AI/rule-based návrh plánu na základě potřeb rodin a kapacity KO | `DESIGN.md` §9 | ⬜ |
| ★★☆☆☆ Významné dny | Připomínky narozenin dětí v PP pro koordinátorky (interní info, ne social feed) | `DESIGN.md` §9 | ⬜ |
| ★★☆☆☆ SSO (Google/MS) | Pro větší organizace s vlastní IT infrastrukturou | `DESIGN.md` §9 | ⬜ |

---

**Poznámka k úplnosti:** tento inventář vychází z `docs/history-claude-md.md`, `docs/history.md`
a indexu uživatelské paměti (`MEMORY.md`). Položky označené jen názvem paměťového souboru
(např. `crm-xyz-todo`) nemají dosud vlastní soubor v `docs/domain/` — až se na ně dostane práce,
založ jim tam čistý doménový dokument a odkaz zde aktualizuj.
