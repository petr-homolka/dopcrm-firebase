# Doprovázení CRM — kontext projektu (handoff)

> Tento soubor je kompletní předávací kontext. Je psaný tak, aby jakýkoli další vývojář / AI mohl plynule pokračovat bez znalosti předchozí konverzace.
> **Pracovní adresář / kód:** `C:\_____ClaudeAI\pestouni-crm-prototyp\`
> **Živý náhled:** https://claude.doprovazeni.com (FTP deploy, viz níže)
> **Stav k:** červen 2026 · prototyp v aktivním vývoji

---

## 0) PŘEDÁNÍ PRÁCE (HANDOFF) — ČTI JAKO PRVNÍ

> Tato sekce je aktuální „stav světa" pro nového vývojáře/AI. Níže (§1+) je podrobný kontext a historie.

**Stav: červen 2026, prototyp běží na https://claude.doprovazeni.com.**
**Aktuální verze: `app.js?v=65`, `style.css?v=35`, `mobile.js?v=66`, `mobile.css?v=37`.**

> **Rodné číslo (RČ) = primární identifikátor osob (app.js v65, 2026-06-28):** děti `kids[].rc`, příbuzní `{n,rel,rc?}`. Shody (auto-sourozenci `linkedSiblings`, obousměrné `addChildRelative`) jdou **primárně přes RČ** (`_personKey`/`childByRC`), jméno jen fallback → stejné jméno + jiné RČ se NEPROPOJÍ (ověřeno). RČ pole ve formuláři „přidat příbuzného" (desktop+mobil) + zobrazení u dítěte i příbuzných. Viz [[crm-vztahy-rodicovstvi]].

> **Obousměrné propojení sourozenců + premium desktop UI (2026-06-28):**
> – `App.addChildRelative` je **obousměrné**: přidám-li sourozence jménem dítěte v systému, zapíše reciproční vazbu i u něj (pozn. „automaticky propojeno"). Ověřeno. Viz [[crm-vztahy-rodicovstvi]].
> – **Premium admin polish** (skill ui-ux-pro-max → principy aplikované jako blok na konci `style.css?v=35`): rafinovaná **elevation škála** (--shadow-xs/card/md/pop), hairline border + hover-lift karet (.card/.pcard/.panel/.stat), **KPI karty** (uppercase label, num 32px, accent proužek nahoře na hover), tlačítka (stavy+lift+active scale), **focus-ring** inputů dle motivu (color-mix accent), **sidebar aktivní akcentový proužek**, hover tabulek (.vrow), tabulární číslice u dat, jemné scrollbary, hlubší drawer/scrim, **dark (Shadcn) override stínů**, `prefers-reduced-motion`. Vše přes tokeny → drží všechny 3 motivy i `--care-*`. (Screenshoty v náhledu padají na backdrop-blur – ověřeno computed-styly, 0 chyb v konzoli.)

> **Auto-propojení sourozenců + „přidat příbuzného" na mobilu (app.js v63 / mobile.js v65, 2026-06-28):** viz [[crm-vztahy-rodicovstvi]].
> – `App.linkedSiblings(kidId)` – jiné DĚTI V SYSTÉMU se sdíleným bio rodičem (i napříč rodinami), typ přes `siblingType`. Seed: Tereza↔Nela polorodí (sdílí bio matku, různé rodiny). Zobrazeno v kartě dítěte (desktop drawer + mobil Údaje), klikací.
> – **„Přidat příbuzného" i na mobilu**: karta dítěte → segment Údaje → blok Příbuzní/rodiče (seskupené, badge práva/bez práv) + Sourozenci v systému + tlačítko Přidat (`MApp.relAdd`, číselník + průvodce otcem). Sdílený `App.addChildRelative`.

> **Rodičovství dle práva ČR + „přidat příbuzného" v kartě dítěte (app.js v62, 2026-06-28):** viz [[crm-vztahy-rodicovstvi]].
> – `App.REL_TYPES` (22 typů, {key,g,label,legal,hint}) – Otec (v RL / sociální / bio-pravděpodobný / bio-domnělý / nezapsán / popřen), Matka (v RL / mimo RL / fikcí / adoptivní / genetická / náhradní), Osvojitel/poručník/opatrovník, sourozenci (vlastní/polorodý/nevlastní), širší rodina. `legal`: true=práva (v RL), false=bez práv, 'rep'=zákonný zástupce, 'na'. `App.relMeta/relGroups/siblingType`.
> – **Princip:** otec = vždy muž v RL (práva má jen on); matka = kdo porodil (§775). Domnělí/nevlastní/mimo RL = bez práv.
> – **`deti.html`:** v kartě dítěte „**+ přidat příbuzného**" (modal: číselník po skupinách + nápověda) + **průvodce „Pomoct s otcem (RL)"** (2 otázky → navrhne správný zápis). Příbuzní vykresleni seskupeně s badgem práva/bez práv. Seed Terezy ukazuje bio rodiče, nevlastního otce i 3 typy sourozenců.

> **Vztahy v rodině + víc šablon + snadná tvorba checklistu (app.js v60 / mobile.js v64, 2026-06-28):**
> – **Model vztahů:** `REL_TYPES` (bio matka/otec, **nevlastní matka/otec** (i opakovaně), **vlastní / polorodý / nevlastní sourozenec**, prarodič, teta, strýc), `siblingType(shareMother,shareFather)` odvodí typ, `relGroup(rel)`. Seed Terezy ukazuje všechny typy. Vše se propisuje do `checklistPresentCandidates` (jmenovitě) i `deti.html`.
> – **Šablony checklistů +5:** Lékař/zdraví, OSPOD/jednání s úřadem, Krizová/mimořádná návštěva, Soud/opatrovnické jednání, Vzdělávání pěstouna (celkem 11 vestavěných).
> – **Snadná tvorba vlastního checklistu:** „Vyjít ze vzoru" (klonuje existující šablonu, `clClone`) + chytrý parser řádků: „a/b/c" výběr, „a/b/c +" víc voleb, „?" ano/ne, „!" označit, „Kdo…" osoby. Viz [[crm-checklisty]].

> **Checklisty CHYTŘE + jmenní bio příbuzní (app.js v59 / mobile.js v63 / mobile.css v37, 2026-06-28):**
> – **Datový model opraven:** `kids[].relatives` je teď **pole `{n,rel}` (jmenovitě bio matka/otec/sourozenec)**, ne počet. `deti.html` upraveno na `relCount()` + reálná jména v detailu. Seed doplněn skutečnými jmény.
> – **Checklist tap-to-select** (`.m-clchip` chips): typy `single/multi/flag/text`, promyšlené otázky + odpovědi. **Chytré „kdo přítomen"** `checklistPresentCandidates(eid,scope)` = pěstouni + svěřené děti + **jmenní bio rodiče/sourozenci** + role dle typu + **zapamatované osoby** (`rememberPerson`, localStorage `crm-present-mem`). Vlastní šablona chytře parsuje („Otázka: a/b/c" → výběr, „Otázka?" → ano/ne, „Kdo…" → osoby). Viz [[crm-checklisty]].

> **Checklisty + ad-hoc workflow (app.js v58 / mobile.js v62, 2026-06-28):**
> – **Checklisty** ([[crm-checklisty]]): terénní sběr KO (kdo přítomen + situace, BEZ závěrů). Šablony obecná/škola/volný čas/bio rodina/sousedé/rozhovor s dítětem + **vlastní** (`checklistTemplates/saveChecklistTemplate/checklistFill/checklistFills`, localStorage `crm-checklists`). Vyplnění → otisk + **zápis do Osy** (podklad pro reporty). Obrazovka: **mobilní dok karty → 5. akce „Checklist"** (IC.check); sdílený engine i pro desktop.
> – **Ad-hoc / vlastní workflow** (WF-15): `customWorkflows/saveCustomWorkflow/applyWorkflow/wfStepToggle` (localStorage `crm-customwf`). KO/vedení si poskládá pojmenovaný postup, uloží, aplikuje na rodinu, odškrtává kroky. Obrazovka: `archiv.html` → toolbar „Vlastní workflow (ad-hoc)" + Exit&WF modál → sekce „Vlastní postup".

> **Úmrtí role-aware + WF-9/10/14 dokončeny (app.js v57, 2026-06-28) — VŠECH WF-1..14 + životní cyklus dítěte implementováno:**
> – **Úmrtí (WF-8) role-aware:** `childDeath` (dítě→`deceased`, uzávěrka SPVPP), `fosterDeath` (pěstoun→spis zmrazen + děti `transfer_proposed` k přemístění soudem), `koDeath(koName,newKO)` (KO→rodiny převezme jiná KO). Obrazovka: Exit&WF → „Úmrtí" → picker osoby.
> – **WF-9** `orgDissolution(successorDO)` (hromadný převod), **WF-10** `retentionList/retentionDue/anonymizeHousehold` (retence 15 let), **WF-14** `mergeContacts(keepId,dupId)`. Obrazovka: archiv toolbar (Zánik DO / Retenční přehled / Sloučit duplicity).

> **Druhy PP + odměna + životní cyklus dítěte + WF-6..13 (app.js v56, 2026-06-28):**
> – **Druhy PP / odměna** (research MPSV, [[crm-druhy-pp-odmena]]): `householdCareType`/`setHouseholdCareType` (cache na rodině), `odmenaEligible`/`odmenaStatus`. **PPPD (temp) = odměna i bez svěřeného dítěte (pohotovost); dlouhodobá/příbuzenská jen po dobu svěření.** Dohoda může být i bez dítěte. SPVPP legal `SPVPP_DOHODA_ROK=59400`/rok/dohoda (NE per dítě; per-dítě peněženka = interní rozpočet).
> – **Životní cyklus dítěte** (`CHILD_STATES`, `childData`): boarding→active→transfer_proposed→transferred_in/out→returned_bio/aged_out. `childProposeTransfer`(i mimo systém)/`childSignTransfer`(**podepisuje stávající pěstoun, ne dítě**)/`childFinalizeTransfer`(spis předán); `childReturnBio` (soud→bio rodina); `childAgeOut` (zletilost). Soud může svěřit komukoli i mimo náš systém.
> – **WF-6..13 engine:** `householdEmergencySuspend/ClearSuspend` (WF-6 podezření), `householdDeath` (WF-8 zmrazení), `gdprRequest/gdprRequests` (WF-11), `familyEvidencePack` (WF-12), `changeKO` (WF-13). Katalog [[workflow-popisy-implementace-a-reseni]].
> – **Obrazovka:** vše v `archiv.html` → tlačítko „Exit & WF" (sekce Odměna/druh PP, Děti–životní cyklus, Další procesy WF-6/8/11/12/13). Ověřeno end-to-end.

> **Exit / převod pěstouna + workflow katalog (app.js v54, 2026-06-28):**
> – **`doklady.html` opraven** (null-byte přepsán celý + lineart kamera). **Emoji = 0** v celém systému.
> – **Workflow katalog** v paměti: `workflow-popisy-implementace-a-reseni.md` (WF-1..WF-14, vč. scénářů domyšlených AI: úmrtí, zletilost, zánik DO, GDPR retence/žádost, podezření na ohrožení, změna KO, sloučení duplicit). Zdroj pro budoucí Návod/FAQ.
> – **Exit engine** (app.js, per household, navazuje na `dohodaStav`): fáze `active→protected→exit_proposed→exit_approved→exiting→exited(archiv)`+`returning` (`EXIT_PHASES`, `exitData`). **Ochranná lhůta** `protectedUntil` (default +90 dní, od podpisu zákl. smlouvy). `proposeExit` (pěstoun jen NAVRHUJE), `approveExit` (KO, spustí přechodné období +60 dní), `generateExitPack`/`exitPack` (3 adresáti: pěstoun/OSPOD/nová DO), `finalizeExit` (→ARCHIV, dohledatelné OSPOD/soud), `logExternalDOInquiry` (kontakt externí DO BEZ podrobností), `handoverCategories`+`setHandover`+`exportHandover` (matice předání: vzdělávání/respit povinné, **poznámky KO z Osy citlivé+default vyloučené**), `proposeReturn`/`approveReturn`/`rejectReturn`. Základní smlouva = fyzicky (systém řídí proces kolem). **Obrazovka:** `archiv.html` → tlačítko „Exit & WF" + fázové badge. Ověřeno celé end-to-end.

> **Životní cyklus dokumentu (CLM) + nativní sdílení + důkazní protokol + bez emoji (app.js v53, 2026-06-28) — sdílené mobil i desktop:**
> – **Emoji pryč všude** (perl sweep piktogramy `1F000-1FAFF`+⚠✉✈, ponechány typografické ✓✕→). Desktop ikony lineart. Výjimka: `doklady.html` (null-byte v souboru → neřešeno).
> – **Nativní sdílení** (`docNativeShare` → Web Share API = systémový share sheet iOS/Android/Win/macOS; fallback `_docShareFallback` s odkazy). Nahradilo custom `SHARE_CH` tlačítka v náhledu.
> – **CLM stavy** `DOC_STATES` (draft/review/commented/to_sign/signed/suspend_proposed/suspended/term_proposed/terminated) + `docStatusBadge`. Pole na dokumentu: `status/version/versions[]/docClass/parentId/derivedFrom/lifecycle`.
> – **Kolaborace KO↔pěstoun:** `docShareInternal` (KO→pěstoun k vyjádření, stav review), `docFosterCommentDone` (pěstoun odešle vyjádření), `docNewVersion` (KO zapracuje → verze++, snapshot do `versions[]`), opakovatelné. `docAmend` (dodatek, `parentId`), `docDeriveNew` (nový z existujícího, `derivedFrom`).
> – **Pozastavení/ukončení = návrh→schválení:** `docProposeLifecycle('suspend'|'terminate')` – pěstoun jen NAVRHUJE (čeká na KO), KO navrhuje pěstounovi; `docApproveLifecycle` (KO schválí), `docFinalizeLifecycle` (ukončení zruší podpisy), `docResume`. **Základní dohoda** (`docClass==='base_agreement'`, detekce dle názvu „Dohoda o výkonu/doprovázení") = `_baseLocked` blokuje online edit/podpis/ukončení → POUZE FYZICKY.
> – **Důkazní protokol** (`openDocEvidence`/`evidencePrint`): chronologie audit+podpisy+verze s aktéry/rolemi + **řetězený otisk `_hashStr` (chained hash, tamper-evidence)**; tisk/PDF. Auditní stopa `_docAudit` s `seq`+`chash`, významné události i do OSA (timeline). Tlačítko „Protokol" v hlavičce náhledu + „Důkazní protokol" u auditní stopy. Cíl V8: WORM + kval. razítko + reálné PDF.

> **Sdílené náhledy + plný podpis (app.js v52, 2026-06-28) — mobil i desktop:**
> – **Univerzální náhled dokumentu in-app** (preferováno před stažením): `App.docOpen(idNeboSeedObjekt)` + `importSeedDoc` (seed dokumenty z `DOCS` se lazy-importují do `_docs2` s generovanou SVG „stránkou" `_pageSvg`). `_docPvRender` rozšířen: **responzivní** (1 sloupec na mobilu `<760px`), akce **Podepsat / Upravit (KO, `_docEditToggle/_docEditSave`) / Stáhnout (`_docDownload`, nepreferované)**, sekce **Podpisy** + komentáře/sdílení/schválení/audit (původní). Mobil: doc řádky (hub segment, globální Dokumenty) → `App.openDocPreview`. Desktop `hub.html`: `Hub.openDocShared(gi)` (seed) / `App.openDocPreview` (uložené); grid slučuje `model.docs` + `App.docList(ID)` (jinak se podepsané/skenované nezobrazovaly). `_dDate` guard proti dvojímu formátu data.
> – **Podpis (sdílený, eIDAS AES):** `App.signNewDoc(eid,signer,role)` (modal: **šablona** `docTemplates()` s textem GDPR/foto/poučení/předání/IPOD + podepisující + **BankID/NIA volitelně**) → vytvoří dokument z šablony → `signOpenDoc` (`<canvas>` prst/myš, body křivky+čas) → `_sigDone`: uloží do `d.signatures[]` (jméno/role/čas/**hash**/**TSA sim. razítko**/BankID/dataURL) + audit + zápis do osy; `signedDocPrint(id)` = **PDF** (tisk: tělo dokumentu + podpisy + certifikát + eIDAS doložka). Mobil dock „Podpis" → `MApp.signNew` (prefill pěstoun). Desktop sekce Dokumenty → „Připravit k podpisu". Gated `docs.upload`. Ověřeno end-to-end mobil i desktop.
> – **Lineart napříč desktopem:** `hub.html` composer (mic/AI), sken, report tlačítka, AI overlay tituly → lineart SVG (desktop jinak už SVG přes `HI()/A()`). **Zbývá:** `doklady.html` 1 emoji (soubor má null-byte, neřešeno kvůli riziku); desktop WhatsApp barvy bublin (sdílí `.msg.them .bubble` se špendlíky dokumentu → neřešeno kvůli riziku).

> **Mobil – vizuál karty/osy (v59/v36, 2026-06-28):** Avatar pěstouna **centrovaný + vedle něj klikací avatary dětí v péči** (`.m-hubfaces/.m-hubkid` → `hub.html?typ=dite&id`). **Velké „Volat" skryto** (telefon klikací v Údajích). **Osa = WhatsApp styl** (`chatStream`): KO bubliny **zelené `#d9fdd3`** (ne černé), protistrana bílá, béžové pozadí `#efeae2`, dark = WhatsApp tmavá (`body[data-mode=dark]`); **významné systémové záznamy** (doc/report/podpis/založení…) ve **vlastní bílé bublině** (`.m-sysbubble`). **ZBÝVÁ (zadáno, další vlny):** plná realizace podpisu (PDF+časové razítko+více podepisujících+šablony, BankID volitelně); **náhledy dokumentů in-app** (otevřít/komentovat/editovat/schválit/podepsat, stažení až fallback) na mobilu i desktopu; **desktop parita** (avatar+děti, WhatsApp osa, skrýt Volat) + **lineart ikony napříč desktopem**. Při změně sdíleného souboru ZVEDNI `?v=N` ve VŠECH HTML a nasaď na FTP (viz §Deploy). Datum je v prototypu napevno `2026-06-20`.

### Co je HOTOVÉ a funkční (NEZAČÍNAT ZNOVU)
- **Desktop** (vzhled Yandex) + **samostatná mobilní PWA** (`mobile.js`/`mobile.css`, ne @media přelití).
- **Role/scope/práva** (6 rolí, scope all/own/self/extern, capability matice), **verzování v1**, **šablony karet + globální číselník institucí**, **branding** (i do mobilu/theme-color), **vzdělávání** (zákonné hodiny), **AI** (živé Gemini přes Vertex AI EU proxy + mock fallback; disclaimer řídí superadmin), **reporty pro OSPOD** (editovatelné, generované z časové osy).
- **Moduly 1–7 ze spec**: Respit+SPVPP+Doklady (M1), Externisté+výkazy (M2), Manažerské reporty (M3), Import wizard (M4), Historie/timeline (M5), Archiv/Převod/QR (M6), Provoz/zaměstnanci (M7). Backstage rozcestník `sprava.html` (gated `users.manage`).
- **Reporting v2**: `reporty.html` (role-scoped, výběr období, grafy zap/vyp = ApexČSV-styl SVG grafy v `App.chartBars/chartDonut/chartLine/chartGauge`, exporty PDF/XLS/CSV/MD/XML/JSON přes `App.exportReport`, SPVPP pacing = nad/podčerpání); `report-nastaveni.html` (šablony+branding+automatizace `App.reportJobs`); `monetizace.html` (**superadmin DEFINUJE tarify + sleduje platby**, vedení platí; měřič AI/FUP; model = **paušál za DO + cena za klíčovou osobu**, `App.aiMonthlyCost/aiFup/orgsBilling`).
- **Mobilní backstage NATIVNĚ** (Více → Správa): Doklady, Externisté (schvalování výkazů), Archiv (export sekcí), Provoz, Tarify&AI (role-aware), Nastavení reportů (automatizace). Import + Manažerské reporty = ZÁMĚRNĚ desktop (nativní stub s vysvětlením). Mobilní **sdílení + schvalování dokumentů** hotové.
- **TŘI DESIGNY**: přepínač **Yandex / Google / Shadcn** (`data-theme=""` / `"b"` / `"c"`), **perzistentní** (`localStorage 'crm-theme'`, `App.applyTheme/themeKey`), auto-aplikace na každé stránce i na mobilu (Více → Vzhled). Google = Material (akcent **#1A73E8**). **Shadcn = vanilla replikace** (HSL tokeny, radius, ring, neutrální black primary) s **light/dark** (`localStorage 'crm-mode'`, `App.modeKey/applyMode`, `data-mode`). Přepínač light/dark = tlačítko `#modetoggle` (slunce/měsíc), které `App.initTheme` **injektuje samo** (zobrazí se jen u Shadcn); initTheme rovněž **samo doplní 3. tlačítko motivu** do všech 19 přepínačů (nemuselo se editovat 19 HTML). Mobil: Více → Vzhled má i segment Režim (`MApp.modeSet`). Shadcn styly jsou scoped `body[data-theme="c"]` (komponenty: btn/input/seg/chip/badge/nav/card, focus-ring; dark má i tónované alerty + tmavé scrollbary). Care barvy (`--care-*`) zůstávají nezávislé. ⚠️ Pozor: base `.btn-primary` má `transition:background` → u Shadcn jsme background z tranzice vyřadili (jinak na loadu blikne brand-žlutá→accent; Yandex/Google to dělají taky, je to pre-existující). ⚠️ **Modernize „New" design byl ZRUŠEN a kompletně smazán — nepoužívat, neobnovovat.**
- **Gating dle role**: scope-aware kalendář/úkoly (`App.visibleEvents()`, `App.visibleTasks()`), skrytá „+Nový" tlačítka (`App.gateAdd(cap)`; `data-add` na netradičních), mobilní FAB skryt pro self/extern (`App.canManageAgenda()`). **Úkoly sjednocené** do `App.allTasks()` (sdílí desktop kanban i mobil; pole `col/prio/care/owner`).
- **Gating v hubu (DOTAŽENO, Krok 1)**: `hub.html` má teď úplný polní gating přes `App.can(cap)` + guardy v handlerech (defense-in-depth): chat composer + `send()`/`addPin` (`notes.add`; bez práva read-only lišta), sidebar tlačítka „+Nový zápis"/„Vytvořit report"/„Přidat záložku" (`notes.add`/`reports.generate`/`contacts.edit`), změna avataru a „Sdílet odkazem" a „+přidat osobu" v sociálním prostoru a vlastní záložka-textarea (`contacts.edit`), „+Zaznamenat hlídání" (`tasks.manage`). Dříve hotové: edit profilu, upload/mazání dokumentů, vzdělávání, reporty/AI, respit. Ověřeno simulací rolí pěstoun/dítě/vedení (0 chyb).

### Mobil – terénní UX (2026-06-28, detail-first)
- **Detail-first navigace:** ťuk na **záznam** otevře jeho **detail** (ne celou kartu). Hotovo: úkol→`MApp.taskDetail` (přes `mTasks.indexOf`), instituce v „Ostatní"→`MApp.instDetail` (dřív mrtvý proklik `'#'`). Ťuk na jméno/rodinu/dítě → karta (záměrně). Sedí s §8.8.
- **Terénní akční dok na kartě (`hubDock` v `scrHub`, spodní lišta):** primární nástroj jedné KO pro dokumentaci návštěv „tady a teď". **● Začít / ⏹ Ukončit návštěvu** = živá časomíra (`MApp.visitToggle`, `visit={typ,id,t0}` + 1s interval `#m-visit-t`); po ukončení otevře předvyplněný zápis „Návštěva (X min)". **🎤 Hlas→osa / ✍️ Rychlý zápis** = `MApp.quickCapture(typ,id,voice)` → bottom-sheet (kategorie visit/contact/note + scope interní/pěstoun + textarea + mic Web Speech cs-CZ + **✨ Strukturovat (AI)** přes `App.AI.structureNote`, sama přepne kategorii) → `App.chatAdd` do časové osy. **📷 Vyfotit doklad** = reuse `MApp.aiScan` (OCR). Vše gated `notes.add`/`docs.upload`. CSS `.m-hubdock/.m-visitbtn/.m-hubquick` v `mobile.css`. Ověřeno v náhledu: časomíra běží, ukončení→předvyplněný zápis→uložení do osy (4→5), AI live rozpoznala „Kontakt" + úkol.

### Mobil – Osa, lineart ikony, podepisování (2026-06-28, v58/v35)
- **„Chat" → „Osa"** (syntéza chat + časová osa = jeden proud `App.chatList`). Osa je **segment v kartě** (`chatStream(id,scope)`), **výchozí po kliknutí na Rodina/Pěstoun/Dítě** (`hubSec` default dle `typ`, init i v `go()`). U institucí (Ostatní) zůstává kontaktní info (`instDetail`). Horní tlačítko „Chat" odebráno (Volat na celou šířku); `scrChat`/`__chat__` zůstává, ale z karty se nevolá.
- **Lineart ikony místo emoji** (Feather styl, `currentColor`): nové `IC.mic/camera/edit/ai/stop/sign`. Nahrazeno v doku (Hlas/Foto/Zápis/Podpis), Osa composeru (mic/AI), skenu dokumentů, rychlém zápisu, report-AI tlačítkách; emoji odstraněny i z titulků AI sheetů. (Share-kanály `SHARE_CH` mají dál vlastní emoji – záměrně.)
- **Podepisování na displeji (`MApp.signStart/signPad/_sigInit/sigClear/sigConfirm`):** 4. akce doku „Podpis". Flow: vyber dokument (GDPR souhlas, foto souhlas, poučení, předávací protokol, IPOD) + podepisující (členové domácnosti) → `<canvas>` podpis prstem (touch/mouse, zaznamenává body křivky + čas) → `sigConfirm` uloží přes `App.docSave` (src PNG + thumb + `keyData`: Podepsal/Role/Čas/Otisk hash/Body) + systémový zápis do osy + jednoduchý binding-hash dokument↔podpis. **Právní rámec:** eIDAS 910/2014 – podpis prstem = elektronický podpis; holý obrázek = slabá důkazní váha, proto **dynamický biometrický podpis + auditní stopa → posun k AES (čl. 26)**. QES/BankID pro vysoké riziko = až V8. Gated `docs.upload`.
- **Oprava (pre-existující):** segment Dokumenty v hubu slučuje `allDocs()` (seed) **+ `docList(id)` (`_docs2` – uložené skenem/podpisem)**; dřív se uložené dokumenty v seznamu nezobrazovaly. Uložené → `App.openDocPreview(id)`, thumb jako avatar, počet v záložce sečten.

### DALŠÍ KROKY (v pořadí a PROČ) — nic nového nezačínat mimo tento seznam
1. ~~**Dotáhnout gating přímo v hubu** (`hub.html`)~~ — **HOTOVO** (viz „Gating v hubu" výše): kompletní polní gating přes `App.can(cap)` + guardy v handlerech, ověřeno simulací rolí. *Proč:* aby pěstoun/dítě/asistent neviděli akce, na které nemají právo, i uvnitř karty.
2. **Verzování dalších entit + historie na mobilu**: rozšířit „nic se nepřepisuje" (`App.histAdd/histList`) na dokumenty, vzdělávání, sociální prostor; zobrazit historii i v mobilním hubu (zatím read-only segmenty). *Proč:* auditovatelnost je požadavek blueprintu (WORM ve V8).
3. **Šablony karet → řídit `buildModel` v `hub.html`** (nová karta z šablony) + CRUD kontaktních osob/přiřazení u institucí. *Proč:* dokončuje šablonový systém (M1.x blueprintu).
4. **Doladění dvou designů** (Google Material polish, sjednotit drobné rozdíly). *Proč:* uživatelská priorita; vzhled se ladí ke konci.
5. **Spec prohloubení (jen UX/spec do V8)**: export ZIP + dokumenty (teď JSON), reálný šifrovaný QR předávací protokol, zálohy/šifrování/DR (.enc/WORM/restore-system.sh). Viz `crm-spec-z-brainstormu.md`.
6. **Před ostrým AI provozem s reálnými daty**: splnit `ostra-ai-checklist.md` (DPA, DPIA, souhlasy, pseudonymizace, audit, retence).
7. **Monetizace naostro**: Google Cloud Billing (Vertex AI EU) + platební brána (GoPay/Stripe) + faktury + opakované platby + schvalování navýšení DO.
8. **🎯 V8 přechod (GCP all-in-one)** — největší etapa, dělat až po doladění prototypu: Cloud Run (Next.js) + Cloud SQL PostgreSQL/pgvector + Cloud Storage + Identity Platform + Vertex AI EU. **Reálná perzistence** (teď VŠE žije jen v paměti session!). RLS + audit + WORM zálohy + DR test + bezpečnostní audit jako brána před go-live. i18n přes `translation_keys`. ~143 tabulek / 10 milníků dle **V8 blueprintu (má vždy přednost)**. Plán: `pritomnost-ai-plan-v8.md`.

### Závazná pravidla (viz §8)
- Prototyp do odvolání, dělaný pro **1:1 přenos do V8**; **blueprint má přednost**.
- **Mobil = samostatná nativní vrstva**, nikdy ne `@media` přelití desktopu; po změně vždy interně otestovat (mobilní viewport + DOM/ screenshot).
- **Produkce = vše na Google (GCP all-in-one), do odvolání.**
- Po každé změně **nasadit na FTP** + zvednout `?v=N`.
- **Bezpečnost:** FTP heslo v tomto souboru je jen pro předání — při ostrém provozu rotovat a nedávat do veřejného repozitáře. API klíče zadává uživatel sám v Apps Scriptu, nikdy nesdílet v chatu.
- Paměť (persistuje napříč sezeními): `C:\Users\Petr Homolka\.claude\projects\C-------ClaudeAI\memory\` — zejména `MEMORY.md` (index), `crm-dva-designy-a-gating.md`, `crm-v8-blueprint.md`, `crm-spec-brainstorm.md`, `crm-monetizace-fup-todo.md`, `crm-ai-zapojeni-uvaha.md`.

---

## 1) Co vyvíjíme

**CRM pro doprovázení pěstounských rodin** pro organizaci **Doprovázení, z.s.** (doprovázející organizace – DO).
Systém slouží klíčovým osobám (KO) a vedení DO k vedení agendy pěstounských rodin: kontakty (pěstouni, děti, příbuzní, instituce), návštěvy a události, úkoly/termíny, dokumenty, vzdělávání pěstounů, reporty pro OSPOD.

Cílový rozsah (dle blueprintu): ~1000 souběžných organizací + ~10 000 mobilních uživatelů, citlivá data o dětech → musí být GDPR/EU-OK, robustní, auditovatelné.

Dvě tváře produktu:
- **Organization (desktop)** — třísloupcové rozhraní, detail in-place. Pro vedení a kancelářskou práci.
- **Worker (mobil)** — **samostatná nativní mobilní aplikace** (PWA), ne responsivní web. Pro KO v terénu. Styl „Things + WhatsApp“, chat je jádro.

---

## 2) Jak vyvíjíme

**Čistý client-side prototyp — žádný build, žádný backend.** Plain HTML + CSS + vanilla JS.

- **Sdílený engine `app.js`** — globální objekt `App` (data + helpery). Každá stránka ho načítá a renderuje svůj obsah inline `<script>`.
- **`style.css`** — desktop vizuál (Yandex 360 styl).
- **Samostatná mobilní vrstva `mobile.js` + `mobile.css`** — viz sekce architektury níže. Aktivuje se na úzké šířce / dotyku / `?m=1`, na desktopu se nespustí.
- **Cache-busting:** každá stránka odkazuje `app.js?v=N`, `style.css?v=N`, `mobile.js?v=N`, `mobile.css?v=N`. **Při změně sdíleného souboru se MUSÍ zvednout verze ve VŠECH HTML** (jinak prohlížeč servíruje cache).
- **Deploy přes FTP** po každé změně (viz sekce Deploy).
- **Lokální test:** malý Node statický server + Claude Preview MCP (mobilní viewport 375×812), ověření přes DOM eval + screenshoty. Přímý HTTPS fetch ze sandboxu je blokovaný → ověřuje se FTP download-back + grep.
- **Syntax check JS:** `node --check mobile.js` / `node --check app.js`; pro inline skript stránky: `awk '/^<script>$/{f=1;next} /<\/script>/{f=0} f' kalendar.html > /tmp/x.js && node --check /tmp/x.js`.

**Datum je v prototypu napevno `2026-06-20`** (`App.todayISO`, `TODAY` v `mobile.js` i `kalendar.html`). „Dnes“ = tento den.

---

## 3) Podle čeho vyvíjíme (principy)

- **Vizuál Yandex 360** (desktop) — čisté bílé plochy, jemné stíny, zaoblení, akcentová barva.
- **Mobil = samostatná propracovaná nativní app** (iOS / Material) s **Yandex feeling**. Vzory: Yandex Disk / Calendar / Mail / Documents. **NIKDY ne jen `@media` přelití desktopu.** (Závazné — viz dohody.)
- **Prototyp = jen prototyp do odvolání**, ale vše se dělá s cílem **1:1 přenosu do V8** (čistá struktura, sdílená data, žádné natvrdo hacky, kde to jde).
- **Blueprint V8 má vždy přednost** před ad-hoc rozhodnutími.
- **Karta kontaktu = hub** — profil je centrum: chat, dokumenty, údaje, vazby, kalendář, vzdělávání.
- **Historizace** — „nic se nepřepisuje“ (verzování změn jako cíl).

---

## 4) Co už máme hotové

### Desktop (style.css + jednotlivé HTML)
- **Přehled** (`prehled.html`) — statistiky, „vyžaduje pozornost“, nadcházející návštěvy, rozpad péče.
- **Pěstouni** (`pestouni.html`), **Děti** (`deti.html`), **Ostatní** (`ostatni.html`) — seznamy/tabulky kontaktů, filtry, drawer detail.
- **Kalendář** (`kalendar.html`) — pohledy **Měsíc / Týden / Den / Agenda**, dynamické plnění výšky okna, scroll v rámci dne (default 6–18 h), týdenní výběr, vyhledávání napříč kalendáři s našeptáváním, zvýraznění dneška, „nyní“ čára, modál Nová událost, boční panel Detail události + poznámky/chat, dovolená/pracovní doba KO.
- **Úkoly** (`ukoly.html`) — kanban / termíny.
- **Dokumenty** (`dokumenty.html`) — DMS, kategorie, náhled v modálu, vazba na kontakt.
- **Hub kontaktu** (`hub.html`) — sekce: Chat, Profil, Dokumenty, Sociální prostor, Vzdělávání, Respit, Hlídání, Reporty, Mapa, Upozornění, Kalendář; sub-taby; editace karty; sdílení přes odkaz.
- **Nastavení** (`nastaveni.html`) — organizace & branding, **barvy** (akcent, typy péče, stavy), integrace (Google/Outlook – přepínače), kontakty organizace, práva a role (zatím popis).
- **Reporty pro OSPOD** — sekce Reporty v hubu (desktop) + segment Report (mobil); výběr období → tisknutelná „Zpráva o průběhu náhradní rodinné péče“ → Uložit jako PDF. **Editovatelné** (Yandex styl: režim Upravit, contenteditable text/buňky, +/✕ řádky, Uložit → zápis zpět do chatu).
- **Chat = jednotná časová osa (jádro systému)** — sdílený zdroj `App.chatList(eid)` v `app.js`: KO píše poznámky (kategorie Poznámka/Návštěva/Kontakt), **systém zapisuje automaticky** (dokumenty, vygenerované reporty, založení kontaktu), dva oddělené proudy **Interní (DO)** vs **S pěstounem**. Desktop hub chat i mobilní chat čtou/píšou do stejné osy. **Reporty se generují z těchto dat.**
- **Login** (`login.html`) — magic-link (prototyp). `index.html`/`profil.html` = jen přesměrování.
- Sdílené: rail navigace, témata (Klasický/Čistý), upozornění (zvonek), avatary, branding uložený v localStorage.

### Mobilní aplikace (mobile.js + mobile.css) — SAMOSTATNÁ VRSTVA, SPA
- **Nativní shell**: velké tučné nadpisy, spodní **tab bar** (Přehled / Rodiny / Kalendář / Úkoly / Více), **FAB**, **bottom-sheet** modály, segmentové přepínače, inset-grouped seznamy s chevrony, safe-area nahoře.
- **SPA routování s přechody** (push zprava / pop zleva / crossfade), historie přes `history` API (funguje hardwarové/gesto Zpět), žádné přenačítání mezi taby.
- **Obrazovky:** Přehled (statistiky + sekce), Pěstouni/Rodiny (hledání), Děti, Ostatní, **Kalendář** (Agenda / Den / **Týden** / Měsíc), Úkoly (dle termínu), Dokumenty, **Hub** (segmenty: Údaje / Dokumenty / Kalendář / Vzdělávání), **Chat** (bubliny + composer), Nastavení, Login, „Více“ sheet, **Upozornění** sheet.
- **Týden (mobil):** hodiny **pevně vlevo**, dny scrollují **horizontálně přes hranice týdnů** (vykresleno 10 týdnů souvisle), nadpis = číslo týdne (mění se při scrollu), default na **dnešek** + scroll na 6:00, „nyní“ čára.
- **Nová událost / Nový úkol** — plnohodnotné nativní bottom-sheety (vč. Od/Do, výběru typu, navázání na kontakty přes chipy).
- **Detail události** — typ, datum/čas, KO, navázaný kontakt (proklik), místo + mapa + „Navigovat v telefonu“, akce Upravit / Smazat. **Detail dokumentu** a **detail úkolu** (vč. „Označit jako hotové“).
- Navigace/křížky tmavé a viditelné (dřív byly žluté na bílé – opraveno).
- **Sdílená data**: kalendářové události přesunuty do `App.calEvents()` (jeden zdroj pro desktop i mobil).

---

## 5) Co máme rozpracované

- **(nic akutního)** — poslední dokončené: Reporty, Chat/časová osa, Vyhledávání, Akční upozornění, **PWA**, **Gesta**, **Práva a role (v1)**, **Verzování dat (v1)**, **Šablony karet + číselník institucí (v1)**, **Branding do mobilu (v1)**, **Vzdělávání jako obrazovka**, **Šablony napojené na karty**. Hlavní provozní roadmapa (body 5–11) hotová ve v1 — další práce = prohloubení (viz „zbývá" u jednotlivých bodů) nebo přechod na V8.

> **Branding do mobilu + theme-color (v1) — HOTOVO**: `applyBrand` nově obarvuje `<meta name=theme-color>` dle akcentu (projeví se ve standalone PWA / status baru na mobilu) a aktualizuje i mobilní brand prvky (`.m-brand-logo/.m-brand-name/.m-brand-branch`). Mobilní „Více" sheet má hlavičku s logem (akcentový čtverec) + názvem organizace z `App.loadBrand()`. Barvy (akcent, typy péče, stavy) se na mobilu propisovaly už přes CSS proměnné. Ověřeno: změna akcentu → theme-color i `--accent`; mobilní brand v „Více".
> **Vzdělávání jako obrazovka — HOTOVO** (desktop `vzdelavani.html` + mobil `scrVzdelavani`): sledování zákonných hodin (24/18 h). Položka v railu (desktop) i ve „Více" (mobil). Přehled všech pěstounů s `eduBar`, stav low/mid/done (Pod plánem/Rozpracováno/Splněno), filtry + počty, souhrn (počet pěstounů, % splněnosti, kolik pod plánem). Respektuje role (`App.visibleFosters()` — KO vidí jen své). Proklik na `hub.html?...&sec=vzdelavani`.
> **Prohloubení v1 (verzování dokumentů/vzdělávání, mazání jen Superadmin, lokální instituce) — HOTOVO**:
> – **Mazání jen Superadmin (fakticky):** výchozí matice `ROLE_CAPS_DEFAULT` — `contacts.delete` a `docs.delete` má nově **jen superadmin** (vedení je ztratilo). Bulkbar „Smazat" v tabulkách a ✕ na kartách dokumentů se zobrazí jen s daným právem.
> – **Verzování dokumentů:** `hub.html` `Hub.addDoc` (gate `docs.upload`) i nový `Hub.delDoc(idx)` (gate `docs.delete`, s `confirm`) zapisují do `App.histAdd` + časové osy („nahrán: …" / „smazán"). ✕ tlačítko na `.doc-card` jen s `docs.delete`.
> – **Verzování vzdělávání:** `Hub.addEdu()` (gate `contacts.edit`) — zápis kurzu (prompt název+hodiny) navýší `model.edu.done`, přidá kurz, zapíše verzi „Vzdělávání (h): X → Y" + osu. Napojeno na tlačítko „+ Zapsat absolvované vzdělávání".
> – **Lokální kopie institucí per organizace:** `App.institutions()` = globální základ (`_instBase`, spravuje Superadmin) **+ lokální override** organizace (`'crm-institutions-local'`, `setInstitutionLocal/resetInstitutionLocal`), překryté záznamy mají `_local:true`. V `ostatni.html` drawer „Upravit pro naši organizaci" (gate `contacts.edit`) → upraví org/poznámku **bez dotčení globálního číselníku**; „Zrušit lokální úpravu"; marker „lokálně upraveno" v seznamu i banner v detailu. Ověřeno: globální základ po lokální úpravě netknutý; 0 chyb.

> **AI asistent — MOCK v prototypu — HOTOVO** (ŽÁDNÉ reálné API, žádná data ven; jen ověření UX flow před V8): mock modul `App.AI` v `app.js` (`structureNote/draftReport/ocrDoc` + `disclaimer`). Vše označeno „✨ Návrh AI – ke kontrole". Tři vstupní body v `hub.html`: **(1) Strukturace zápisu** — ✨ tlačítko v chat composeru → `Hub.aiStructure()` overlay (kategorie, shrnutí, navržené úkoly, obavy, flag „zvážit OSPOD"), „Vložit jako zápis" → `Hub.aiApply()`; gate `notes.add`. **(2) Draft reportu pro OSPOD** — tlačítko „✨ Navrhnout draft (AI)" v sekci Reporty → `repAIDraft()` vyplní souhrn z `App.reportData` do editovatelného reportu + banner; gate `reports.generate`. **(3) OCR dokumentu** — po `Hub.addDoc` se zobrazí overlay `Hub.aiOcr` (rozpoznaný typ dle názvu vč. normalizace diakritiky, datum, shrnutí, klíčová data, návrh akce). Overlay helper `aiOverlay()`. Reálná AI pro produkci = **self-host v EU/ČR** (rozhodnuto) až ve V8 — viz `pritomnost-ai-plan-v8.md` (v1.1) a [[crm-ai-zapojeni-uvaha]].

> **DEMO reálná AI přes Google (Gemini) — HOTOVO** (volitelné, zdarma): `App.AI` je nově **Promise-based s fallbackem** — když je v `localStorage 'crm-ai-endpoint'` nastavená URL Google Apps Script proxy, volá **reálné Gemini**; jinak/při chybě padá na deterministický **mock** (demo funguje vždy). Proxy: `apps-script-ai-proxy.gs` + návod `apps-script-ai-navod.md` (Apps Script web app drží `GEMINI_API_KEY`, model `gemini-1.5-flash`, akce `structure`/`report`). Endpoint se nastavuje v **Nastavení → Integrace → AI asistent (demo)** (`SetUI.saveAI/clearAI`, badge mock/živé). Hub `aiStructure`/`repAIDraft` jsou `async` (await + „AI pracuje…"). OCR zůstává mock (potřebuje reálné bajty souboru → V8). ⚠️ **Jen fiktivní data** (Gemini free tier může trénovat); reálná data dětí až self-host / Vertex AI EU.
> **AI i v mobilním hubu + ověřen živý průchod — HOTOVO:** mobilní vrstva má teď AI taky — `MApp.aiStructure`/`aiApply` (✨ v chat composeru → bottom-sheet se strukturou → Vložit jako zápis) a `MApp.repAIDraft` (✨ v reportu → vyplní souhrn). Sdílí `App.AI` (stejný kontrakt). Živý režim ověřen end-to-end proti reálné HTTP proxy (lokální „Vertex-like" stub vracející tvar Vertexu s markerem `[Vertex EU]`) na **webu i mobilu** — App.AI.live()=true, odpovědi z proxy (ne mock), graceful fallback při výpadku. Tj. „jako ostrý provoz" — stačí v Nastavení vyměnit URL za reálnou Vertex EU proxy. Pozn.: dev `\.claude/serve.js` má testovací `/ai-proxy` endpoint (jen lokální test, nenasazuje se na FTP).
> **Přechodové řešení pro OSTROU verzi (připraveno dopředu):** `apps-script-ai-proxy-vertex-eu.gs` = stejná proxy, ale volá **Vertex AI Gemini v EU** (europe-west3, placené → bez tréninku, EU residency, OAuth token místo klíče). Splnit `ostra-ai-checklist.md` (DPA, DPIA, souhlasy, pseudonymizace, audit, retence) PŘED reálnými daty. Appka se nemění (proxy stejný kontrakt). Plán `pritomnost-ai-plan-v8.md` §8b. Cíl = self-host. Ověřeno: mock fallback, graceful pád při vadné proxy, async overlay, nastavení endpointu; 0 chyb.

> **Šablony napojené na karty — HOTOVO**: `hub.html` po `buildModel` aditivně doplní pole z `App.cardTemplates()` (mapování typ→šablona pestoun/dite/instituce); existující hodnoty zůstávají, nová pole ze šablony se přidají prázdná před sekci „Další pole". Tj. když Superadmin přidá pole do šablony (Nastavení → Šablony karet), objeví se na všech kartách daného typu. Ověřeno: pole „Datová schránka" přidané do šablony pěstouna se zobrazí v sekci Pěstounská péče na kartě.

> **Šablony karet + globální číselník institucí (v1) — HOTOVO** (správa Superadmin; cíl V8 = sdílené tabulky šablon/institucí, M1.x): nová capability **`templates.manage`** (jen superadmin; vedení ji nemá — číselník je globální napříč organizacemi). **Globální číselník institucí:** `App.institutions()` (seed 11 institucí s `id/cat/type/name/org/persons/assigned`), taxonomie `App.instCats()` (3 skupiny / 11 kategorií), `instCatLabel`; CRUD `addInstitution/removeInstitution/resetInstitutions/saveInstitutions` (localStorage `'crm-institutions'`). **Sjednoceno z 3 původních kopií** → `ostatni.html` (desktop), `scrOstatni` (mobil) i `searchAll` čtou ze sdíleného registru. **Šablony karet:** `App.cardTemplates()` (seed pestoun/dite/instituce = sekce + pole {label,type}), `saveCardTemplates/resetCardTemplates/tplAddField/tplRemoveField/tplAddSection` (localStorage `'crm-templates'`). **Správa v Nastavení** (2 nové sekce jen pro superadmin): „Šablony karet" (přidat/odebrat pole, přidat sekci, reset) a „Číselník institucí" (přidat formulářem, odebrat, reset, seskupeno dle kategorie). Ověřeno: superadmin přidá instituci → propíše se do `ostatni.html` (12 položek) i mobilu; přidání pole do šablony; vedení nové sekce nevidí; 0 chyb.
> **Zbývá (navazující):** šablony fakticky řídit `buildModel` v `hub.html` (nová karta z šablony), CRUD kontaktních osob/přiřazení u institucí, verzování změn číselníku, i18n labelů (translation_keys ve V8).

> **Verzování dat / historie změn (v1) — HOTOVO** (desktop hub; cíl V8 = audit log + WORM): „nic se nepřepisuje". Sdílené úložiště `App.histList(eid)` / `App.histAdd(eid,{field,from,to,by,at})` v `app.js` (export i `todayISO`). V `hub.html`: vstup do editace profilu (`Hub.toggleEdit`) udělá **snapshot** hodnot polí (`state.editSnapshot`); při odchodu se každé změněné pole zaznamená jako verze (`histAdd`, autor = `App.currentUser()`, datum = dnešní prototypové) + systémový zápis do časové osy (`chatAdd` „Změna pole …: stará → nová"); původní hodnota zůstává **šedě** u pole jako `<stará> · aktivní do <dnešek>` (`f.old`). Sub-tab **Profil → Historie změn** (`historieHtml`) čte reálně z `histList` (seed při založení: „Karta kontaktu založena" + původní změna telefonu). **Gating:** editace jen s `contacts.edit` — jinak tlačítko nahrazeno badge „Jen pro čtení (role)", pole read-only, `toggleEdit` odmítnut (asistentka/pěstoun). Ověřeno: vedení edituje → verze + osa + šedá hodnota; asistentka read-only; 0 chyb.
> **Zbývá k verzování (navazující):** verzování i u dalších záznamů (dokumenty, vzdělávání, sociální prostor), „mazat smí jen Superadmin" fakticky u mazacích akcí, zobrazení historie i na mobilu (mobilní hub je zatím read-only segmenty), diff u select/datum polí. Sjednotit s auditním logem napříč entitami.

> **Práva a role (v1) — HOTOVO** (desktop i mobil; cíl V8 = Supabase RLS + audit): model v `app.js`. **6 rolí** (`App.ROLES`): superadmin, vedení/admin DO, KO, asistentka, pěstoun, dítě 12+ — každá má `scope` (rozsah dat: `all` / `own` = přidělené rodiny dle `worker` / `self` = vlastní karta dle `linkId`). **12 schopností** (`App.CAPS`, skupiny Data/Kontakty/Záznamy/Dokumenty/Provoz/Reporty/Správa). **Matice** role→[cap] (`App.rolePerms()`, default `ROLE_CAPS_DEFAULT`, perzistence `localStorage 'crm-roles'`, `setRoleCap/resetPerms`; superadmin vždy plná, needitovatelný). **Uživatelé** `App.ORG_USERS` (7 ukázkových: superadmin, vedení, 2× KO, asistentka, pěstoun=f1, dítě=k3); přiřazení role editovatelné (`setUserRole`, `'crm-userroles'`). **Aktuální uživatel** `crm-cur` (default `u_admin`=vedení → vidí vše, zpětně kompatibilní); `currentUser/roleOf/can(cap)/scopeOf`. **Náhled „Zobrazit jako"** = `App.openRoleSwitcher()` (desktop overlay reuse `.gs-bg`, mobil `MApp.roleSwitch()` sheet) → `App.switchUser(id)` (reload). **Gating v UX:** `renderRail` – self-scope vidí jen Moje karta/Kalendář/Dokumenty, ikona Nastavení jen s `settings.access`; `.account` v sidebaru auto-plněn aktuálním uživatelem + klik = přepínač (`App.initAccount`, bez úprav markupu stránek). **Scoping dat:** `visibleHouseholds/visibleFosters/visibleChildren` použity v `prehled/pestouni/deti` (desktop) i `scrPrehled/scrPestouni/scrDeti` (mobil). **Akce:** `chatAdd` (ruční zápis vyžaduje `notes.add`), `saveReport` (`reports.generate`), bulkbar v `Table` (mazat/přiřadit dle `contacts.delete`/`contacts.edit`). **Nastavení → Práva a role**: editovatelná matice (checkboxy), seznam uživatelů s výběrem role, přepínač náhledu; sekce filtrovány dle práv, přístup bez `settings.access` blokován. ⚠️ **Pozn.:** stránka `nastaveni.html` má controller přejmenovaný `Set`→`SetUI` (kolidoval s vestavěným `Set` v `app.js` přes sdílený globální scope klasických skriptů). Ověřeno simulací 4 rolí (vedení/KO/pěstoun/dítě) na desktop i mobil, 0 chyb.
> **Zbývá k právům (navazující):** hloubkové polní gating přímo v hubu (skrýt edit profilu / mazání dokumentů / generování reportu dle práv), filtrování událostí/úkolů v kalendáři dle scope, „+ Nový" tlačítka dle `contacts.edit`. Provázat s verzováním (audit kdo co změnil).

> **Gesta (mobil) — HOTOVO** (desktop nedotčen): `initGestures(app)` v `mobile.js`, navázáno jednou v `start()` na `#m-app` (delegovaně). **Swipe-zpět:** start ≤26 px od levé hrany + `navDepth>0` → tah `.m-screen.m-top` doprava se stínem; uvolnění nad 92 px spustí `MApp.back()` (`history.back()`), jinak se vrátí. Odlišení od vertikálního scrollu/týdenního horizontálního scrollu (gesto jen od hrany). **Pull-to-refresh:** na `.m-scroll` se `scrollTop<=0`, tah dolů → rotující indikátor `.m-ptr` (CSS v `mobile.css`); uvolnění nad 54 px → `render('replace')` (zachová scroll) + toast „Aktualizováno ✓“. Vše `passive` listenery, bez `preventDefault`. Ověřeno simulací TouchEvents v mobilním viewportu (swipe hub→přehled, PTR toast), 0 chyb v konzoli.

> **PWA — HOTOVO** (instalovatelná appka + offline): `manifest.webmanifest` (standalone, start_url `prehled.html`, ikony 192/512), `sw.js` (service worker, cache `dop-crm-v1`, strategie stale-while-revalidate, precache app shell), `icon-192.png`/`icon-512.png` (brandové „D", generované Node skriptem – viz `/tmp/mkicon.js` postup). Registrace SW v `app.js` (`navigator.serviceWorker.register('sw.js')` na load). V HTML hlavičkách: `<link rel=manifest>`, `theme-color`, apple-touch-icon + `apple-mobile-web-app-*` metas, `viewport-fit=cover` (kvůli safe-area v standalone). **Vyžaduje HTTPS** (claude.doprovazeni.com OK). Na iPhonu: Sdílet → „Přidat na plochu" → běží bez prohlížečové lišty, offline po první návštěvě.

> **Akční upozornění — HOTOVO** (desktop i mobil): `App.buildNotifs()` má `kind` (visit-due / edu-low / annual-review) + `typ/eid`; `App.notifActions(x)` vrací tlačítka. Desktop panel (`App.openNotifs`) i mobilní sheet (`MApp.notifs`) zobrazují akce: **Naplánovat návštěvu** / **Vzdělávání** / **Vytvořit report** + **Otevřít kartu**. Cíle: `kalendar.html?new=1&typ&eid` (otevře formulář nové události s předvyplněným kontaktem), `hub.html?...&sec=reporty|vzdelavani` (otevře sekci karty). Mobil má vlastní `MApp.notifAct(kind,typ,eid)` (SPA – nepoužívá desktop hrefy).

> **Globální vyhledávání — HOTOVO** (desktop i mobil): `App.searchAll(q)` hledá napříč pěstouny / dětmi / rodinami / institucemi / dokumenty / událostmi / úkoly. Desktop: ikona „Hledat" v railu → command-palette overlay (`App.openSearch()`, `.gs-*` styly, esc zavírá). Mobil: ikona v hlavičce Přehledu + položka ve „Více" → obrazovka `__search__` s živým filtrem (results-only re-render kvůli udržení fokusu). Výsledky seskupené dle typu, proklik na detail.

> **Reporty pro OSPOD — HOTOVO** (desktop i mobil/tablet, **editovatelné**): sdílený generátor `App.reportData()` + `App.reportInnerHtml(d,editable)` v `app.js`; tisk `.report-doc` + `@media print` (izolace přes `#reportPrint`). Editace: `report-editing` třída, `contenteditable`, `App.repAddRow/repDelRow`, `App.saveReport(eid,name,html)` → uloží + zapíše do chatu. Desktop: sekce Reporty v hubu (presety/od-do, ✎ Upravit, 💾 Uložit, Tisk). Mobil: segment Report → `__report__` s edit/save/tisk.
> **Chat / časová osa — HOTOVO** (jádro systému): `App.CHAT_CATS`, `App.chatList(eid)` (lazy seed z dat + ruční poznámky), `App.chatAdd(eid,entry)`. Entry: `{cat,scope:'internal'|'pestoun',who:'me'|'them'|'sys',text,date,time,doc?}`. Mobil chat (scope toggle + kategorie + systémové zápisy), desktop hub chat zrcadlí zápisy do sdílené osy. Reporty čtou z osy.

---

## 6) Co ještě zbývá naprogramovat (návrhy, priorita shora)

**Nejvyšší hodnota — HOTOVO:**
- ~~Reporty pro OSPOD (editovatelné)~~ ✓
- ~~Chat / časová osa jako jádro~~ ✓
- ~~Globální vyhledávání~~ ✓
- ~~Akční upozornění~~ ✓ (viz sekce 5)

**Provozní (před ostrým během / V8):**
5. ~~**Práva a role** — Superadmin / vedení DO / KO / asistentka / pěstoun(omezený) / dítě 12+; kdo co vidí a smí (fakticky i v UX).~~ — **HOTOVO v1** (viz sekce 5; navazující hloubkové gating v hubu zbývá).
6. ~~**Verzování dat / historie změn** — „nic se nepřepisuje” konzistentně.~~ — **HOTOVO v1** (editace profilu v hubu se verzuje; viz sekce 5; rozšíření na další entity + mobil zbývá).
7. ~~**Šablony karet (Superadmin) + globální číselník institucí** (sdílené napříč organizacemi).~~ — **HOTOVO v1** (viz sekce 5; napojení šablon na buildModel hubu zbývá).
8. ~~**Branding/barvy per organizace** — dotáhnout, ať se projeví i v mobilu a logu.~~ — **HOTOVO v1** (theme-color + mobilní brand; viz sekce 5).

**Nativní appka naostro (mobil):**
9. ~~PWA — manifest + ikona + offline shell~~ — **HOTOVO** (viz sekce 5).
10. ~~**Gesto swipe-zpět** a **pull-to-refresh**~~ — **HOTOVO** (viz sekce 5).
11. ~~**Vzdělávání pěstounů** jako sledovaná obrazovka (zákonné hodiny **24 h** dlouhodobá/přechodná, **18 h** příbuzenská; „kdo je pod plánem“).~~ — **HOTOVO** (`vzdelavani.html` + mobil; viz sekce 5).

---

## 7) Zadávací dokumentace

- **⚠️ ZÁVAZNÉ ROZHODNUTÍ 2026-06-24 (do odvolání): produkční verze = GCP ALL-IN-ONE — VŠE na službách Google.** Cloud Run (Next.js) + Cloud SQL PostgreSQL/pgvector + Cloud Storage + Identity Platform/Firebase Auth + Vertex AI, EU region, Google Cloud DPA. Ostatní varianty (Supabase+Vercel, self-host) **odsunuté, nemazat**. GCP projekt `opportune-cairn-500111-b2`, Vertex AI ověřeno funkční (Gemini přes Apps Script proxy). Plán: `pritomnost-ai-plan-v8.md` §2.
- **Specifikace z brainstormu (2026-06-25):** `C:\_____ClaudeAI\crm-spec-z-brainstormu.md` — kompletní zadání modulů: Respit (na dohodu, 2 metriky, hodina=den), SPVPP peněženky dětí, Doklady přijaté Respit (AI OCR rozúčtování), Externisté + omezené rozhraní (GDPR), reporting/výroční zprávy, Zaměstnanci, Provozní náklady, Import wizard (3 balíčky, staging/rollback), Historie/timeline vazeb, Export/Převod/QR/Archiv (nic se nemaže, ~15 let), Zálohy/šifrování/Disaster Recovery. Většina = V8 backend; prototyp = UX mock. Pořadí realizace v §12.
- **V8 FosterFlow Blueprint** — **závazné cílové zadání** (cca **143 tabulek, 10 milníků**). Má vždy přednost. Klíčové principy: karta kontaktu jako jednotný koncept (`persons` pro dítě/pěstouna/příbuzného/okolí); historizace; RLS + audit + WORM zálohy + DR test + bezpečnostní audit jako gate před go-live; i18n přes `translation_keys` (žádný natvrdo text); `DataGridView` konfigurovatelné tabulky (M1.9); Worker = mobil PWA + Organization = desktop třísloupec (M1.8); typy péče A/B/C; `households` jako plnohodnotná entita s `lifecycle_state`.
- **Cílová architektura (V8):** Supabase + Vercel.
- Doplňující kontext (uživatelská paměť, persistuje napříč sezeními) je v:
  `C:\Users\Petr Homolka\.claude\projects\C-------ClaudeAI\memory\`
  – zejména: `crm-v8-blueprint.md`, `project-doprovazeni-crm.md`, `crm-prototyp-pracovni-rezim.md`, `crm-mobil-nativni-app.md`, `crm-karta-kontaktu-hub.md`, `crm-prava-a-role-todo.md`, `crm-sablony-a-sdilene-kontakty-todo.md`, `crm-settings-branding-todo.md`, `vzdelavani-pestounu-pravidla.md`, `deploy-ftp-doprovazeni.md`. (Při předání na jiný účet je vhodné tyto soubory přiložit.)

---

## 8) Na čem jsme se dohodli (závazná rozhodnutí z konverzace)

1. **Prototyp do odvolání**, ale dělaný pro **1:1 přenos do V8**. Blueprint má přednost.
2. **Mobil = samostatná propracovaná nativní app** (iOS/Material + Yandex feeling), referenční vzory Yandex Disk/Calendar/Mail/Documents. **Nikdy ne jen responsivní `@media` přelití.** Před předložením vždy **interně otestovat** (mobilní viewport + screenshot).
3. **Nasazovat na claude.doprovazeni.com po každé změně** (FTP).
4. **Dropdown / rozbalovací menu jednotně bílá** ve stylu „Filtr kontaktu“ napříč celou appkou; nikdy systémové černé. Datum/čas pickery světlé (`color-scheme:light`).
5. **Branding a barvy organizace** musí jít měnit v Nastavení (akcent, typy péče, stavy, logo).
6. **Vzdělávání pěstounů** = sledovaná metrika (zákonné hodiny 24/18 h).
7. **Karta kontaktu = hub** (chat, dokumenty, údaje, vazby, kalendář, vzdělávání).
8. Konkrétní UX dohody z vývoje kalendáře a mobilu:
   - Kalendář desktop: plné vyplnění výšky okna ve všech pohledech; default viditelné okno 6–18 h; „3 dny“ pohled zrušen; týdenní badge klikací; stacked hlavičky dnů; zvýraznění dneška + „nyní“ čára; vyhledávání napříč kalendáři s našeptáváním.
   - Mobilní týden: fixní hodiny vlevo, souvislý scroll přes týdny, nadpis = číslo týdne, default dnešek.
   - Navigace/křížky musí být **viditelné** (tmavé), ne akcentově žluté na bílém pozadí; zavírací křížek standardní.
   - Proklik nesmí vždy končit „na holém profilu“ — události → detail události, dokumenty → detail dokumentu, úkoly → detail úkolu, karta má sekce.
9. **Další krok = Reporty pro OSPOD.**

---

## Architektura & soubory (pro rychlý start)

```
pestouni-crm-prototyp/
├─ app.js          # SDÍLENÝ engine: data + helpery. Globální `App`.
├─ style.css       # desktop vizuál (Yandex 360)
├─ mobile.js       # SAMOSTATNÁ mobilní SPA vrstva (aktivace na úzké šířce/?m=1)
├─ mobile.css      # nativní mobilní vizuál
├─ prehled.html pestouni.html deti.html ostatni.html
├─ kalendar.html ukoly.html dokumenty.html hub.html vzdelavani.html
├─ nastaveni.html login.html
├─ index.html      # → redirect na prehled.html
├─ profil.html     # → redirect na hub.html
├─ manifest.webmanifest  # PWA manifest
├─ sw.js                 # PWA service worker (offline shell)
└─ icon-192.png icon-512.png  # PWA ikony (brand „D")
```

### `App` (export v `app.js`) – hlavní data a helpery
- Data: `households` (5 domácností; každá `fosters[]`, `kids[]`, `worker` (KO), `next`/`last` návštěva, `status`), `allFosters()`, `allChildren()`, `allDocs()` (DOCS), `allTasks()` (TASKS), `calEvents()` (události kalendáře – **sdílené**), `vacations()`.
- Číselníky: `CARE` (long/temp/kin + barvy + roční hodiny 24/24/18), `STATUS` (ok/warn/due), `DOC_CATS`, `EVTYPES`.
- Helpery: `avatar()`, `careBadge()`, `statusBadge()`, `eduBar()`, `fmtDate()`, `fmtDateTime()`, `dayDiff()`, `dateBucket()`, `isoWeek()`, `holidaysFor()` (svátky+jmeniny ČR), `workerFull()`, `renderRail()`, `initTheme()`, `buildNotifs()`, `openNotifs()`, branding (`loadBrand/saveBrand/applyBrand/BRAND_DEFAULTS`), integrace (`integLoad/integSave`).
- `todayISO = '2026-06-20'`.

### `mobile.js` (SPA) – jak to funguje
- Guard: spustí se jen když `matchMedia('(max-width:760px)')` / `?m=1` (a `?m=0` ho vypne).
- `body.m-active` skryje desktop layout; vykresluje do `#m-app` panely `.m-screen` (push/pop přechody).
- Router: `MApp.go(href)`, `route={page,params}`, `history.pushState({route,depth})`, `popstate`. Detailní obrazovky (`hub.html`, pseudo-route `__chat__`) = push.
- Klíčové API: `MApp.go/back/more/notifs/search/calView/pickDay/monNav/dayNav/weekNav/weekSlot/openEv/saveEv/evDetail/editEv/updEv/delEv/openTask/saveTask/taskDetail/doneTask/docDetail/hubSec/openChat/chatSend/toast`.
- Session data v paměti: `mEvents` (z `App.calEvents()`), `mTasks` (z `App.allTasks()`), `chatStore`.
- Týden: konstanty `WK_HH=46` (výška hodiny), `WK_WD=110` (šířka dne), souvislý rozsah `WEEK_DAYS=70`, scroll-sync hodin/hlaviček přes `wireWeek()` (dvojitý rAF kvůli ořezu scrollLeft).

---

## Deploy (FTP) — claude.doprovazeni.com

```bash
# nahrání jednoho souboru (úspěch = kód 226)
curl -s -T <soubor> "ftp://ftp.doprovazeni.com/<soubor>" --user "claude.doprovazeni.com:Claude777" -w "%{http_code}\n"

# ověření zpět (přímý HTTPS fetch ze sandboxu bývá blokovaný)
curl -s "ftp://ftp.doprovazeni.com/<soubor>" --user "claude.doprovazeni.com:Claude777" | grep <marker>
```
- Host: `ftp.doprovazeni.com` · uživatel: `claude.doprovazeni.com` · heslo: `Claude777`
  ⚠️ Heslo je zde pro úplnost předání — při ostrém provozu rotovat a nedávat do veřejného repozitáře.
- **Při změně `app.js` / `style.css` / `mobile.js` / `mobile.css` zvednout `?v=N` ve VŠECH HTML** a nahrát vše dotčené.
- Aktuální verze (k handoffu): `app.js?v=49`, `style.css?v=32`, `mobile.js?v=51`, `mobile.css?v=33`. (Nové stránky proti handoffu: `reporty.html`, `report-nastaveni.html`, `monetizace.html` + dříve `sprava.html`, `doklady.html`, `externiste.html`, `vykaz.html`, `reporty-manazerske.html`, `provoz.html`, `import.html`, `archiv.html`, `vzdelavani.html`.)
> **Moduly 2–7 ze spec (backstage, desktop) — HOTOVO v1 (vše živé, mock dat v paměti):**
> – **M2 Externisté + výkazy** (`externiste.html` + omezené rozhraní `vykaz.html`, role **`externista`** scope `extern`): číselník (prima_pece/provozni_rezie, sazebník, DPP/DPČ/OSVČ), výkaz hodin → schválení → `App.vykazApprove` spočítá Kč → přímá péče = SPVPP + den respitu / režie = provoz. Externista vidí JEN výkaz + přiřazené děti (visibleHouseholds=0). `App.externiste/vykazAdd/vykazApprove/vykazSum`.
> – **M3 Manažerské reporty** (`reporty-manazerske.html`): date-picker (presety+vlastní), agregace finance SPVPP / respit dny (vykázané vs reálné) / personál / bilance; export výkazů CSV; tisk.
> – **M7 Provoz & zaměstnanci** (`provoz.html`): zaměstnanci + docházka/absence + mzdový náklad; provozní náklady/smlouvy s **hlídáním konce platnosti** (`provozExpiring`). `App.zamestnanci/provozNaklady`.
> – **M4 Import** (`import.html`): wizard, 3 balíčky (importTym/importKmen/importAdresarOstatni), CSV vstup, **autopilot sanitizace** (trim/telefon/RČ), **error grid** (oprava v UI), **staging + Rollback**, deduplikace, nameSplitter/ageCheck zmíněny.
> – **M5 Historie/časová osa** (v hubu, sub-tab Historie změn): `App.dohodaHist` (organizace/KO od–do, přechody) + `App.diteHist` (školy/odborníci) jako timeline.
> – **M6 Archiv/Převod/Export** (`archiv.html`): stavy dohody (`App.DOHODA_STAVY`, `dohodaSetStav`), digitální převod (cílová org + datum → uzamčení), export min. míry (JSON, bez soukromých poznámek KO, `transferPayload`), **šifrovaný QR** předávací protokol (qrserver), archiv read-only, nic se nemaže.
> **Backstage rozcestník `sprava.html`** (rail ikona „Správa", gated `users.manage`) → dlaždice na všech 6 modulů. Doklady mají vlastní rail ikonu. Vše gated jen vedení/superadmin (NE KO/pěstoun/dítě). Ověřeno: výkaz→750 Kč SPVPP, režie 1200 Kč mimo SPVPP, převod→archiv, externista 0 rodin, 0 chyb. Pozn.: data modulů jen v paměti session (cíl V8 = Cloud SQL). Spec: `crm-spec-z-brainstormu.md`.
> **Modul 1 ze spec (Respit v2 + SPVPP + Doklady) — HOTOVO (v1):** sdílené v `app.js`: `respitData/respitAddEvent/respitVykazano/respitRealny/respitLimit` (respit per **household**, limit 14 + IPOD nadstandard, „hodina=den"), `spvppWallet/spvppCharge/spvppZustatek` (peněženka per dítě), `doklady/dokladAdd/dokladAllocate` (rozúčtování **POLOŽKOVĚ per dítě, NE rovným dílem** → SPVPP + dny respitu jeho pěstounovi). **Hub Respit v2** (`respitHtml`+`Hub.respitOpen/respitSave/respitSetNad`): dvě metriky **Vykázaný vs. Skutečný odpočinek** (dny kdy všechny děti pryč) + ⚠️ varování souběhu + čerpání s checkboxy dětí + IPOD pole; u **dítěte** SPVPP peněženka (semafor zůstatku) + **Větev B** `Hub.spvppAddCost` (ruční podíl z dokladu). **Desktop modul `doklady.html`** (backstage, rail ikona gated `users.manage`): nahrát fakturu → `App.AI.ocrInvoice` (vision, položky) → editovatelná rozúčtovací tabulka (dítě→částka) → „Schválit a rozúčtovat". Mobil: read-only respit přehled + SPVPP zůstatek v hub Údaje. Ověřeno: vykázaný 13 vs reálný 7 (různé týdny), doklad k1=5000/k3=3000 přes 2 různé rodiny. ⚠️ `invoice` akce **vyžaduje přenasazení Vertex proxy** (jinak prázdné položky → ruční doplnění). Spec: `crm-spec-z-brainstormu.md`.
> **Dokumenty: zdroj+náhled+vnořený chat+špendlíky+sdílení+schválení s auditem — HOTOVO (v1, desktop i mobil):** sdílený modul v `app.js`: **progress bar** (`progressStart/Stop`, auto v `AI._call` + u načítání souboru), `docSave/docGet/docList/docComment/docPin/docShare/docApprove`, `makeThumb` (canvas), `openDocPreview` (velký modál). Tok: foto/sken → reálné OCR → overlay s **poznámkou** → „Uložit" uloží **originál + miniaturu + AI souhrn + poznámku + keyData**, propíše do **časové osy** (`chatAdd` s `docId`) i historie, a otevře **velký náhled**. Náhled: obrázek s **klikacími špendlíky+komentář**, **vnořený chat** k dokumentu, **sdílení** (interní/pěstoun=ke schválení, e-mail/SMS/WhatsApp/Signal/Telegram/Messenger/odkaz), **schválení** (Schválit/Zamítnout+komentář; smí pěstoun/dítě dle scope) a **auditní stopa** všech akcí. V seznamu Dokumenty miniatura + 📎 + proklik do náhledu. **(2)** OCR sjednoceno – drag&drop i příloha v chatu jdou přes `Hub._scanFile` (obrázky → vision OCR). **(1)** osvědčení → „+ Započítat h vzdělávání" (hotovo dřív). Pozn.: zdroje fotek jen v paměti session (cíl V8 = Cloud Storage); náhledový modál je sdílený (funguje web i mobil).
> **AI asistent — prohloubení 1+2+3 (desktop i mobil) — HOTOVO:** (1) **Reálné OCR z foto/skenu** — `Hub.aiScan`/`MApp.aiScan` (file input image, mobil `capture=environment`) → bajty→base64→`App.AI.ocrImage`→ Vertex **vision** (proxy akce `ocr`, `vertex(prompt,[inline_data])`) přečte typ/datum/shrnutí/keyData/hodiny/akce; overlay+sheet s výsledkem; **Q&A nad dokumentem** (`App.AI.askDoc`→`generate`). Uložení dokumentu i s daty (`model._docOcr`). (2) **Využití v reportech** — z osvědčení „+ Započítat X h vzdělávání" (`Hub.ocrEdu`, zápis do historie); report-asistent při zaškrtnutí „Dokumenty" vkládá přečtený obsah (`model._docOcr`) do promptu. (3) **Hlubší dialog** — wizard má **Zaměření** (celá rodina / konkrétní dítě), tlačítko „Nech AI navrhnout upřesňující otázky" (`Hub.raQuestions`), a každá vygenerovaná zpráva se **uloží jako verze** (`App.saveReport` → víc verzí v „Uložené reporty"). **Stav proxy (ověřeno):** akce `structure`/`report`/`generate`/`ocr` nasazené; `vertex(prompt,extraParts)` posílá obrázek jako `inlineData{mimeType,data}` (camelCase!); model-loop `['gemini-3.5-flash','gemini-2.5-flash','gemini-2.0-flash-001']` bere první funkční a čte první textovou část odpovědi. **Vision OCR funguje přes `gemini-2.5-flash`** (gemini-3.5-flash u obrázku v projektu hlásí „not found" → loop ho přeskočí; pro text 3.5 funguje). Pozn.: Apps Script – po úpravě VŽDY „Spravovat nasazení → Upravit → Verze: Nová verze", jinak `/exec` servíruje starou verzi (health `doGet` ukazuje aktivní `models`).
> **AI asistent A+B+C (desktop i mobil) — HOTOVO (v1):** (A) **Hlasový diktát** 🎤 v chat composeru (web `Hub.aiVoice`, mobil `MApp.aiVoice`) přes **Web Speech API** (cs-CZ, zdarma v Chrome) → text do inputu → ✨ strukturace (reálné Gemini). Audio se neukládá (jen přepis). Produkce = Vertex Speech-to-Text EU. (B) **Dokumenty** — capture/upload → `aiOcr` mock OCR (typ/datum/data/akce); reálné čtení obsahu + Q&A až ve V8 (potřebuje bajty/Cloud Storage). (C) **Konverzační report** — „💬 Asistent zprávy (AI)" v Reportech (web `Hub.reportAssistant`+overlay wizard, mobil `MApp.reportAssistant`+sheet): vybere typ (OSPOD/Interní/Pro soud/Shrnutí pro pěstouna), období, co zahrnout (checkboxy), volný pokyn → sestaví **prompt** → `App.AI.generate` → vyplní editovatelnou zprávu. Víc typů/verzí, ne jen jedna. Nová AI akce **`generate`** (volný prompt→text) v `App.AI.generate` + Vertex proxy (akce nasazena, ověřeno reálné Gemini web i mobil — typy zpráv „OSPOD/Interní/Pro soud/Shrnutí pro pěstouna", pokyny se promítají). Vize celé v `pritomnost-ai-plan-v8.md` §3b.
> **AI: živé Gemini ve výchozím stavu + Superadmin disclaimer — HOTOVO.** `App.AI` má **zadrátovaný výchozí endpoint** (Vertex AI EU proxy) → demo „samo jede" na všech zařízeních bez nastavování; `localStorage 'crm-ai-endpoint'='off'` = mock, jinak vlastní URL, `resetEndpoint()` = výchozí. **Disclaimer řídí Superadmin** (`App.aiConfigLoad/Save`, `crm-ai-config`): `disclaimerShow` (zobrazení v UI náhledech, default ano), `disclaimerPrint` (vytisknout v reportu pro OSPOD, default NE), `disclaimerText` (editovatelný). UI v Nastavení → Integrace: proxy (Uložit/Vypnout/Výchozí) viditelná s `settings.access`; **blok „AI disclaimer (jen Superadmin)" gated `templates.manage`**. Disclaimer se v AI overlayech (web i mobil) i v tištěném reportu (`reportInnerHtml` → `.rd-ai-note`) zobrazí jen dle konfigurace. Reálný Vertex ověřen (Gemini `gemini-3.5-flash`, region `europe-west1`).
- **Nové soubory (PWA):** `manifest.webmanifest`, `sw.js`, `icon-192.png`, `icon-512.png` (nahrávat také na FTP; PNG se přenáší binárně).

## Lokální test (volitelné)
- Statický Node server servíruje složku na portu 8765; náhled v mobilním viewportu 375×812.
- Ověřování přes DOM (`MApp.*`, `document.querySelectorAll`) + screenshoty. Pozn.: nástroj na screenshoty se občas „zasekne“ pod backdrop-blur — fallback je ověření přes eval.
