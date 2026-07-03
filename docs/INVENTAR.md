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
| Hierarchie zaměstnanců | `org_admin → vedouci_pobocky → teamleader → klicova_osoba → asistent_ko`, `nadrizeny` | `docs/history.md` (Fáze 1) | ✅ |
| Limit 25 rodin / klíčová osoba | `assertFamilyCapacity` | `docs/history.md` (Fáze 1) | ✅ |
| Role/scope/práva (6 rolí, capability matice) | superadmin/vedení/KO/asistentka/pěstoun/dítě, scope all/own/self | `docs/history-claude-md.md` §5 | 🟡 (React má jen 3 role zatím: superadmin/org_admin/klicova_osoba) |
| Firestore security rules multi-tenant | Čtení/zápis dle role a `assignedTo` | `docs/history.md` | ✅ (částečně — postupně rozšiřováno) |
| CI/CD GitHub Actions → Firebase Hosting | Push do `main` = build+deploy | `docs/history.md` | ✅ |

## 2. Pěstoun a rodina

| Funkce | Popis | Kde popsáno | Stav |
|---|---|---|---|
| Druhy péče (PPPD/dlouhodobá/příbuzenská) + odměna | Nárok na odměnu dle typu, i bez dítěte u PPPD | `docs/domain/druhy-pece-a-odmeny.md` | ✅ (`householdCareType`, `odmenaEligible` portováno) |
| SPVPP (59 400 Kč/rok/dohoda) | Legislativní příspěvek, ne per dítě | `docs/domain/druhy-pece-a-odmeny.md` | 🟡 (React má jen interní peněženku per dítě, ne evidenci per dohoda) |
| Respit (2 metriky: vykázaný / reálný) | Zákonné minimum §47a, IPOD nadstandard | `docs/domain/druhy-pece-a-odmeny.md` | ✅ |
| Vzdělávání pěstounů (24 h / 18 h ročně) | Kurzy s certifikáty, progress | `vzdelavani-pestounu-pravidla` (paměť) | ✅ |
| Adresy pěstouna (trvalé bydliště/pobyt) | — | `docs/history.md` (Fáze 2) | ✅ |
| Sociální prostor domácnosti | Partner, biologické děti, rodiče pěstouna | `docs/history.md` (Fáze 2) | ✅ |
| Šablony karet (Superadmin) + globální číselník institucí | Sdílené napříč organizacemi | `crm-sablony-a-sdilene-kontakty-todo` (paměť) | ⬜ |
| Branding organizace (barvy, logo, theme-color) | Musí jít měnit v Nastavení | `crm-settings-branding-todo` (paměť) | ⬜ |

## 3. Dítě

| Funkce | Popis | Kde popsáno | Stav |
|---|---|---|---|
| Vztahy/rodičovství dle práva ČR | Otec=v RL, matka=kdo porodil, 22 typů vztahů | `docs/domain/vztahy-a-osoby.md` | ✅ REL_TYPES sladěny; 🟡 auto-propojení sourozenců přes RČ zatím neportováno |
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
| Checklisty terénní sběr (11 šablon + vlastní) | Bez závěrů, podklad pro reporty | `docs/domain/workflow-katalog.md` | ⬜ |

## 5. Dokumenty

| Funkce | Popis | Kde popsáno | Stav |
|---|---|---|---|
| Životní cyklus dokumentu (CLM, stavy) | draft→review→...→terminated | `docs/domain/dokumenty-clm.md` | ⬜ |
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
| M5 Historie/timeline vazeb | — | `crm-spec-z-brainstormu.md` | 🟡 (append-only historie u dítěte ✅, obecný timeline modul ⬜) |
| M6 Archiv/Převod/Export/QR | Nic se nemaže, ~15 let retence | `crm-spec-z-brainstormu.md` | ⬜ |
| M7 Provoz & zaměstnanci (docházka, náklady) | Hlídání konce platnosti smluv | `crm-spec-z-brainstormu.md` | 🟡 (seznam zaměstnanců ✅, docházka/náklady ⬜) |

## 7. UI, obrazovky a navigace

| Funkce | Popis | Kde popsáno | Stav |
|---|---|---|---|
| Design systém „Přítomnost“ (soft/playful, Tailwind) | Barvy, typografie, komponenty | `DESIGN.md` | ⬜ (právě zaváděno, Krok 4 úklidu) |
| Karta kontaktu = hub (chat/dokumenty/údaje/vazby/kalendář/vzdělávání) | Centrum všeho dění kolem osoby | `crm-karta-kontaktu-hub` (paměť) | 🟡 (`HubPage.jsx` je zatím stub) |
| Chat / jednotná časová osa (jádro systému) | Interní vs. s pěstounem, systémové zápisy | `docs/history-claude-md.md` §4 | ⬜ |
| Kalendář (měsíc/týden/den/agenda) | — | `docs/history-claude-md.md` §4 | 🟡 (`CalendarPage.jsx` stub) |
| Úkoly (kanban/termíny) | — | `docs/history-claude-md.md` §6 | ⬜ |
| Globální vyhledávání | Napříč pěstouny/dětmi/dokumenty/událostmi | `docs/history-claude-md.md` §5 | ⬜ |
| Akční upozornění | Návštěva due, vzdělávání low, výroční revize | `docs/history-claude-md.md` §5 | ⬜ |
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
| Zálohy/šifrování/Disaster Recovery | `.enc`/WORM/restore-system.sh | `crm-spec-z-brainstormu.md` | ⬜ |
| Ostrý AI provoz checklist (DPA/DPIA/souhlasy) | Před reálnými daty dětí | `docs/history-claude-md.md` §0 bod 6 | ⬜ |
| GCP all-in-one (produkce) | **Závazné rozhodnutí do odvolání** | `crm-ai-zapojeni-uvaha` (paměť) | 🟡 (Firebase/Firestore zatím, ne plný Cloud Run/SQL) |
| V8 Blueprint (~143 tabulek, 10 milníků, RLS+audit+WORM) | **Má vždy přednost** | `crm-v8-blueprint` (paměť) | ⬜ velká budoucí etapa |
| i18n přes translation_keys | Žádný natvrdo text | V8 blueprint | ⬜ |

## 11. Audit datového modelu (2026-07-03)

Ověřeno proti `CLAUDE.md` §„Pravidla datového modelu" — prošlé soubory: `firestore.rules`,
`src/services/org/*.js`, `src/services/{auth,dataService,registrationService}.js`,
`scripts/dev-seed.mjs`. Nic z tohoto auditu nebylo opraveno, jen zaznamenáno — viz jednotlivé
nálezy níže pro návrh opravy.

**Vysoká závažnost:**

| Nález | Kde | Porušuje | Návrh opravy |
|---|---|---|---|
| `permanentNotes[]` roste v čase, ale je pole v dokumentu | `children.permanentNotes` (`org/children.js`, `addPermanentNote`) | „historie... VŽDY podkolekce, nikdy pole" | Přesunout do `children/{id}/permanentNotes` (stejný vzor jako už existující `children/{id}/history`) |
| `previousFosters[]` roste v čase, ale je pole v dokumentu | `children.previousFosters` (`addPreviousFoster`) | totéž | Přesunout do `children/{id}/previousFosters` |
| `courtCase.rozsudky[]` roste v čase uvnitř vnořeného pole | `children.courtCase.rozsudky` (`addCourtVerdict`) | totéž | `courtCase` nechat jen jako identitu/aktuální stav (spisZnačka, soud, kontakt); rozsudky do `children/{id}/courtVerdicts` |
| Vzdělávání (`courses[]`) roste v čase, vnořené 2 úrovně v poli | `foster_families.fosters[].courses[]` (`addFosterCourse`) | totéž (vzdělávání je v pravidle výslovně jmenováno jako příklad „co roste") | Vlastní podkolekce, např. `foster_families/{id}/fosterCourses` s polem `personId` odkazujícím na konkrétního pěstouna |
| Duplicitní datový model (Sekce A vs. B) | `firestore.rules` (obě sekce), `dataService.js`/`auth.js` vs. `org/*.js` | Dvě nezávislé, nesynchronizované reprezentace stejných konceptů (rodina, dítě) — `tenants/{id}/data_objects`+`user_roles` (legacy MVP_NAV moduly) vs. `organizations/users/foster_families/children` (nové dashboardy) | Naplánovat migraci legacy modulů (Kalendář, Dokumenty, Reporty, Kontakty) na Sekci B, nebo je explicitně označit k zániku — dnes běží trvale vedle sebe bez cesty k synchronizaci |

**Střední závažnost:**

| Nález | Kde | Porušuje | Návrh opravy |
|---|---|---|---|
| Zápis respitu a odečet SPVPP peněženky nejsou atomické | `addRespitEvent` → `chargeSpvpp` (`org/respit.js`) — `addDoc` + samostatný `Promise.all` mimo transakci | „denormalizovaná pole aktualizovat ideálně v batch zápisu se změnou, která je vyvolala" | Obalit zápis respitové události a odečet(y) SPVPP do jedné `runTransaction` (vzor už existuje v `reassignFoster`) |
| Chybí stránkování na všech list dotazech | `listFostersByOrg/AssignedTo`, `listChildrenByOrg/ByFamily`, `listUsersByOrg`, a i detailové `listChildHistory`, `listRespitEvents` — nikde není `limit()` | „seznamové obrazovky... podkolekce až v detailu, stránkované po 20" | Doplnit `limit(20)` + `startAfter` kurzor aspoň na `listChildHistory`/`listRespitEvents`; u organizačních seznamů zvážit dle očekávaného objemu |

**Nízká závažnost / poznámky (spíš zdokumentovaná výjimka než chyba):**

| Nález | Kde | Poznámka |
|---|---|---|
| `children.assignedTo` duplikuje vztah „kdo má koho" z `foster_families.assignedTo` | `org/children.js`, `org/fosterFamilies.js` | Zdůvodněno a transakčně udržováno (`reassignFoster`), ale křehké — jakýkoli budoucí zápis dítěte mimo `createChild`/`reassignFoster` může pole rozjet. Zvážit Cloud Function invariant nebo to jasně vynutit jako jediné dva povolené zápisové body. |
| Chybí denormalizované počítadlo pro kapacitu KO | `assertFamilyCapacity` (`org/fosterFamilies.js`) dělá plný COUNT dotaz při každém create/reassign | Není porušení pravidla (to řeší JAK counter aktualizovat, ne JESTLI musí existovat), ale při větším objemu dat = zbytečné plné čtení. Kandidát na denormalizovaný counter ve V8. |
| `relatives[]`/`socialSpace[]` bez horního limitu v kódu | `children.js` | Realisticky málo položek, ale nikde neověřeno vůči limitu ~20 z pravidla. |
| Pravidlo „subjectRefs" pro víceosobní záznamy zatím nemá co porušit | — | Timeline/zápisy modul ještě neexistuje (`docs/INVENTAR.md` sekce 7, ⬜) — hlídat při jeho stavbě. |

**Pozitivní zjištění (správně použitý vzor, žádná akce):** `children/{id}/history` (append-only
podkolekce), `foster_families/{id}/respitEvents` (podkolekce, ne pole) a `reassignFoster`
(atomická transakce přes rodinu i všechny její děti) přesně odpovídají pravidlům — jsou dobrým
vzorem pro opravu nálezů výše.

---

**Poznámka k úplnosti:** tento inventář vychází z `docs/history-claude-md.md`, `docs/history.md`
a indexu uživatelské paměti (`MEMORY.md`). Položky označené jen názvem paměťového souboru
(např. `crm-xyz-todo`) nemají dosud vlastní soubor v `docs/domain/` — až se na ně dostane práce,
založ jim tam čistý doménový dokument a odkaz zde aktualizuj.
