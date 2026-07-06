# Connecteam mobilní app — analýza 56 screenshotů (2026-07-05)

Zdroj: `c:/_____ClaudeAI/nahledy-connecteam-mobil-app/converted/` (IMG_7754–7811), analyzováno 5 paralelními agenty.

**ZÁVAZNÝ směr od produktového vlastníka (2026-07-05):** PWA i desktop mají vypadat a fungovat na ~90 % jako Connecteam, přizpůsobeno doprovázení pěstounských rodin (směna→návštěva, lokace→rodina). Existující kód není překážka — může se změnit cokoli.

## Nejsilnější opakující se vzory

- Jedna dominantní primární akce na obrazovku: vždy jediné plné modré pill/kruhové CTA (Přihlášení, Ověřit, Začátek směny), sekundární akce jen jako textový link nebo outline pill — jasná hierarchie, ideální pro terénní použití CRM (Zahájit návštěvu).
- Stavový flow start→běh→konec se stálým vizuálním jazykem: modrá = start/běží, červená = ukončit, po konci rekapitulační bottom sheet s Upravit/Hotovo. Přímo mapovatelné na životní cyklus návštěvy v rodině.
- GPS + čas jako důkazní stopa: každé odpíchnutí nese adresu ('Příchod označen v:') a souhrn od–do; pro doprovázení to je auditovatelný podklad výkazů pro OSPOD/MPSV bez ručního psaní.
- Barevné kódování entity napříč celým flow: vínový proužek/tečka/tag 'Location A' se opakuje na dashboardu, timeru, detailu i souhrnu — v CRM stejně barva rodiny/typu návštěvy na kartě, v kalendáři i v souhrnu.
- Karty a pilulky na šedém podkladu: bílé zaoblené karty (radius 16–24 px), pill tlačítka, pastelové dlaždice s lineart ikonou (fialová/broskvová/krémová) — měkký, přátelský vzhled bez ostrých hran; ladí s Yandex stylem CRM a s pravidlem lineart ikon bez emoji.
- Červené číselné badge pro nepřečtené/čekající: zvonek '3', Chat '2', Časový rozvrh '1' — konzistentní upozornění; v CRM na Ose, úkolech a změnách v kalendáři.
- Konverzační jednokrokové formuláře: 'Jaké je vaše telefonní číslo?' → OTP buňky → hotovo; jedna otázka na obrazovku, velké fonty, správná klávesnice, floating label — vzor pro passwordless login pěstounů i průvodce (přidání dítěte/příbuzného).
- Progressive disclosure přes řádky s chevronem a bottom sheety: kompaktní řádek (směna na dashboardu) → detail tapem → modal sheet pro potvrzení; obsah se vrství, nikdy nezahlcuje jednu obrazovku — vhodné pro detail-first mobilní koncept CRM.
- Agenda s datum-railem vlevo (velké číslo dne + zkratka) a kartami událostí vpravo — přehlednější než klasický kalendářní grid; pro seznam návštěv ideál.
- Inline akce přímo na kartě v seznamu: outline 'Odmítnout' + plná modrá 'Potvrdit' pilulka — rozhodnutí bez otevírání detailu; pro potvrzování termínů pěstounem klíčové.
- Bottom sheet pro potvrzení akce: ilustrace + otázka + kontextová věta + volitelná poznámka + dvojice tlačítek (outline sekundární, plná zelená primární) — jeden vzor pro potvrzení návštěvy, schválení dokumentu i přijetí respitu.
- Stavová sémantika barvou: barevný levý proužek karty a rohová kolečka (zelená fajfka = potvrzeno, červený křížek = odmítnuto, modrá = probíhá) + pastelové pozadí karty podle typu události.
- Horizontální týdenní pás s vybraným dnem v plném kruhu a tečkami pod dny s událostmi + rozbalovací drag-handle na měsíc; doplněný scope-přepínačem 'Jen já / Všichni' ve spodním baru.
- Červené kruhové badge s počtem na tabech a řádcích modulů — agregace 'co čeká na mou akci' (zprávy, schválení); pro Správce tab vedoucí služby.
- Notifikace: kruhová barevná ikona modulu + relativní čas + nepřečtené jako modrý levý proužek a tónované pozadí řádku.
- Souhrnné widgety s poctivým prázdným stavem (čárkované placeholdery, '--') a mini bar chartem — vzor pro výkaz hodin doprovázení a plnění vzdělávání 24/18 h.
- Plnobarevné karty událostí jako nosič stavu: potvrzená/cizí směna = celá karta v barvě (zelená/modrá/červená) s bílým textem a avatarem vpravo; nepotvrzená = bílá karta s barevným levým proužkem a akcemi přímo uvnitř. Pro CRM: barva karty návštěvy = stav/typ úkonu, akce Potvrdit/Odmítnout přímo v kartě bez otevírání detailu.
- Týdenní pás dnů (po–ne) nahoře + agendový list seskupený po dnech pod ním: vybraný den plný modrý kruh, tečky pod dny s událostmi, velké číslo dne vlevo u skupiny, sticky pruh 'Shrnutí týdne · N směn' mezi týdny a inline '+ Přidat' u prázdných dnů.
- Dvojice pill tlačítek pro rozhodnutí všude stejně: primární plná modrá ('Potvrdit') + sekundární outlined ('Odmítnout'/'Zrušit'), v bottom sheetu doplněná kruhovým tlačítkem s košem — konzistentní potvrzovací gramatika napříč kartami i formuláři.
- Jednotný prázdný stav: šedá kruhová ikona fajfky s tečkami kolem + text 'Žádné položky k zobrazení', opakovaný identicky ve všech sekcích (i dvakrát na jedné obrazovce) — přesně vzor empty-state, který má CRM mít.
- Bottom sheet jako standard pro mobilní formuláře: X + centrovaný titul, řádky s toggly ('Celý den'), hodnoty modře (datum), šedé zaoblené time inputy od–do, volitelná poznámka, opakování, sticky footer s akcemi.
- Role-aware UI: jiný spodní tab bar pro zaměstnance (Jen já/Všichni/Moje dostupnost/Výměny) vs. správce (Rozvrh/Žádosti/Poloha/Činnost), tab 'Správce' s korunkou v globální navigaci a upsell banner s korunkou u admin funkcí — gating rolí viditelný, ne skrytý.
- Granulární notifikace jako seznam řádků: lineart ikona v kroužku + iOS toggle per typ události ('směna přidělena/upravena/odstraněna'), oddělené sekce push vs. e-mail, hodnota 'O hodinu dříve' jako tapnutelný modrý text; plus ICS feed pro sync do osobního kalendáře.
- Systémové bot kanály v jednom inboxu s lidskými chaty: avatar modulu v barvě, automatické zprávy jako karty se souhrnem a CTA 'Zobrazit podrobnosti', červené unread badge, filtry čipy (Všichni/Nepřečtené/Týmy) a inline feedback 'Je zpráva užitečná? Ano/Ne' — ideální vzor pro Osu v CRM.
- Jednotná hlavička: šipka zpět vlevo + centrovaný titul + kontextová akce vpravo (i, tužka, fajfka) — žádné hamburgery, každá obrazovka je 'push' v navigačním stacku
- Propracované empty states všude: šedá lineart ikona s dekorativními tečkami + krátká věta ('Žádné fotografie/příspěvky k zobrazení') — nikdy prázdná bílá plocha
- Avatar systém: kruhové foto, fallback barevný kruh s iniciálami (PH oranžově); u událostí overlap avataru s barevnou ikonou modulu — identita osoby je vždy vizuálně přítomná
- Barevné kódování modulů: každý modul má svou barvu ikony (kalendář oranžový, chat růžový, time clock modrý, historie fialová) na jinak střídmém bílo-modrém UI s jednou primární modrou
- Badge jazyk: červený kruh s číslem = nepřečtené (tab Chat), zelený/modrý pill s číslem = čekající položky, zelený outline pill s textem = role ('Správce skupiny')
- Listy místo karet pro data: řádky s ikonou vlevo, textem, hodnotou/stavem vpravo a chevronem, oddělené 1px linkami a šedými section headery — karty jen pro 'hero' obsah (průkazka, uvítání ve skupině)
- Gating práv vysvětlený textem: zakázané akce se nezamlčují, ale zobrazí se šedý pruh s důvodem a kým to řešit ('Nemůžete ukončit uzamčenou skupinu, kontaktujte správce') a disabled položky mají podtitulek ('již přidán(a) do týmu')
- Časové filtrování jako pilulkový pager: ← 'rozsah týdne' → nad seznamem + segmented control 'Moje / Sdíleno se mnou' — přímo použitelné pro výkazy návštěv a checklistů
- Oddělený admin režim jako 5. tab s korunkou, uvedený onboarding carouselem (gradient, skip, dots, kruhové tlačítko dál) — vzor pro hierarchickou viditelnost vedoucích v CRM
- Barevné kruhové ikony modulů jako identita napříč celou appkou: každý modul má svou barvu + bílou lineart ikonu v kruhu (modrá stopky = Time Clock, oranžový/zelený kalendář = Schedule, růžová/žlutá bublina = Chat) a ta se konzistentně opakuje v onboardingu, dashboardu, aktivitě, chatu i badgích. Pro CRM: pevná paleta modulů Návštěvy/Kalendář/Dokumenty/Osa/Checklisty.
- Pilulka (pill) jako univerzální tvar: chipy filtrů, stavové chipy s číslem (2 Zpoždění), date-pager, datové oddělovače na timeline, CTA tlačítka i kontextové akce — vše silně zaoblené, minimum ostrých rohů a rámečků, dělení jen dividery a stíny.
- Stavové chipy = filtr + KPI zároveň: barevné číslo + název stavu (červená Zpoždění, oranžová Nepotvrzeno) nahoře nad seznamem; barva stavu se pak propisuje do plnobarevné karty záznamu. Pro CRM: stav návštěv/zpráv/podpisů stejným mechanismem.
- Timeline/audit log s dvojitým avatarem 'kdo + co': kruhový avatar aktéra překrytý menším barevným kruhem s ikonou modulu, svislá spojnice, datum jako modrý pill oddělovač, čas šedě pod textem — přímo použitelné pro Osu i důkazní protokol.
- Gating rolí viditelný v UI: tab 'Správce' s korunkou jen pro adminy, korunka jako mini-badge na avataru, onboarding to explicitně vysvětluje; mobil je zjednodušený klient a plná konfigurace se přátelsky odkazuje na desktop (empty-state s ilustrací, ne chybová hláška).
- FAB jako primární tvůrčí akce na každém seznamu (přidat osobu, směnu, konverzaci), při více možnostech se rozbalí do blur-overlay menu s velkými pilulkami včetně varianty 'ze šablony' — mapuje se na naše superadmin šablony návštěv/checklistů.
- Systémové kanály v chatu: moduly posílají automatické zprávy ('Směna skončila') do vyhrazených konverzací vedle lidských chatů, s unread badge na řádku i na tabu — vzor pro automatické notifikace CRM (návštěva ukončena, dokument podepsán, limit vzdělávání).
- Multi-select picker s počtem v CTA: list avatar+jméno+kulatý checkbox vpravo, sticky lišta dole 'Cancel / Add 3 contacts' — standard pro výběr účastníků návštěv, dětí do reportů a hromadné akce.

## Obrazovka po obrazovce — co přenést

### IMG_7754.jpg — Onboarding / welcome obrazovka po instalaci — rozcestník: přihlásit se, nebo založit novou firmu (tenant).
Stejný vzor pro CRM: welcome obrazovka s orbitální ilustrací modulů (Osa/chat, dokumenty, kalendář návštěv, kontakty) → 'Přihlášení' (pěstoun/klíčový pracovník) + textový link 'Registrace organizace'. Verze appky dole se hodí pro support. Pill tlačítka + jediná primární akce na obrazovce.

### IMG_7755.jpg — Login krok 1 — zadání telefonního čísla (passwordless přihlášení přes SMS), prázdný stav.
Pro CRM mobilní app: passwordless login pěstounů přes SMS kód (pěstouni nemusí mít firemní e-mail ani si pamatovat heslo). Vzor 'jedna otázka = jedna obrazovka' s konverzačním nadpisem se hodí i pro průvodce (přidání dítěte, příbuzného). Výběr předvolby s vlajkou převzít 1:1.

### IMG_7756.jpg — Login krok 1 — totéž s vyplněným číslem: předvolba se přepnula na +420 s českou vlajkou.
Detail k převzetí: velký font pro zadávané číslo (čitelnost v terénu), auto-detekce/přepnutí země. V CRM při ověřování telefonu pěstouna při onboardingu rodiny stejný vzor — velké pole, jedna akce.

### IMG_7757.jpg — Login krok 2 — zadání 4místného SMS ověřovacího kódu (OTP).
OTP obrazovku převzít pro: (a) SMS login pěstounů, (b) potvrzení podpisu na displeji SMS kódem (vyšší důkazní úroveň k eIDAS protokolu). Vzor 'Neobdrželi jste kód? → Další možnosti' je nutný fallback pro starší pěstouny.

### IMG_7758.jpg — Domovský dashboard (Home) po přihlášení — osobní pozdrav, rychlé akce, karta nadcházející směny s CTA, onboarding obsah pro admina.
Nejpřenosnější obrazovka. Pro klíčového pracovníka: 'Dobré ráno, Petro' + avatar + zvonek; quick čipy 'Návštěvy' a 'Kalendář'; karta 'Dnešní návštěva: rodina Novákovi, 9:00–11:00' s barevným proužkem rodiny + CTA 'Zahájit návštěvu' (směna→návštěva). Tab bar: Domů / Hledat / Osa-chat / Profil / Správce (gating role stejně jako korunka u admin tabu). Coach-mark tooltipy pro onboarding nových pracovníků. Bez emoji (mávající ruka nahradit textem).

### IMG_7759.jpg — Time Clock — obrazovka před začátkem směny: mapa polohy, karta přiřazené směny a obří tlačítko pro odpíchnutí.
Přímo model pro 'Zahájení návštěvy' v terénu: mapa + GPS potvrzení příjezdu do rodiny, karta plánované návštěvy (rodina, čas, barva), obří kruhové tlačítko 'Zahájit návštěvu'. 'Moje požadavky' → 'Moje úkoly/požadavky na respit', 'Časový rozvrh' s badgem → 'Kalendář návštěv' s počtem změn. Kruhový hero button je skvělý pro práci jednou rukou v terénu.

### IMG_7760.jpg — Time Clock — běžící směna těsně po odpíchnutí: živý timer, GPS potvrzení příchodu, prostor pro přílohy/poznámky, ukončení směny.
1:1 'časomíra návštěvy': po Zahájení návštěvy modrá karta s běžícím časem + GPS 'Příchod označen v: [adresa rodiny]' (důkaz výkonu doprovázení pro OSPOD reporty). Taby 'Přílohy' / 'Můj denní protokol' → 'Záznamy z návštěvy' / 'Checklist' (terénní sběr KO). 'Přidat poznámku' prázdný stav → rychlá poznámka do Osy. Červené 'Konec návštěvy' dole sticky.

### IMG_7761.jpg — Time Clock — běžící směna po 1 minutě, s vyplněnou poznámkou (ukazuje editovaný stav téže obrazovky).
Poznámka zapisovatelná PRŮBĚŽNĚ během návštěvy (ne až po konci) — přesně to potřebuje klíčový pracovník: postřehy zapisuje v reálném čase a při ukončení se propíšou do záznamu návštěvy/Osy. Floating label nad vyplněnou hodnotou převzít do celého CRM formulářového stylu.

### IMG_7762.jpg — Detail směny (Podrobnosti o směně) — read-only karta se všemi informacemi o přiřazené směně + instrukce od admina.
Šablona pro 'Detail návštěvy': název rodiny + barevný tag, datum, čas s délkou, adresa jako tapnutelný odkaz do map (navigace ke klientovi), přílohy (dohoda, checklist), instrukce od vedoucího. Slide-to-confirm → 'potvrzuji seznámení s pokyny' (auditovatelné). FAB s tužkou pro editaci jen s oprávněním.

### IMG_7763.jpg — Souhrn po ukončení směny — bottom sheet 'Směna skončila' s rekapitulací času, míst a poznámky, s možností opravy.
Přesně vzor pro 'Souhrn návštěvy' po Konci návštěvy: bottom sheet s rodinou, od–do časy + GPS oběma směry, celková délka (podklad pro výkaz doprovázení), poznámka → záznam do Osy, 'Upravit' pro korekci a 'Hotovo' pro uložení. Sheet místo nové obrazovky = rychlé potvrzení bez ztráty kontextu dashboardu.

### IMG_7766.jpg — Spodní část domovského dashboardu: onboardingové akce (přidat uživatele, poslat zprávu, prozkoumat kartu správce) + přehled odpracovaných hodin a směn v týdnu.
Souhrn hodin → widget 'hodiny doprovázení tento měsíc' a plnění zákonného vzdělávání pěstounů (24/18 h) se stejným prázdným stavem (čárky) a mini bar chartem. Onboarding action-karty → 'Přidejte první rodinu', 'Naplánujte první návštěvu'. Badge na Chatu → nepřečtené zprávy v Ose. Korunka + tooltip → gating role (klíčový pracovník vs. vedoucí) v hubu, což už v CRM řešíme.

### IMG_7767.jpg — Centrum oznámení (notifikace) se seznamem systémových zpráv seskupených podle dne.
Přímo použitelný vzor pro notifikace CRM: 'Nová zpráva od pěstounky', 'Blíží se termín zprávy pro OSPOD', 'Podpis dohody čeká'. Nepřečtené = modrý levý proužek + tónované pozadí je jemnější než badge. Kruhové barevné ikony rozliší moduly (návštěvy, dokumenty, vzdělávání) — v našem případě lineart varianty bez emoji.

### IMG_7768.jpg — Onboarding slide 1/6: uvítání do rozvrhu zaměstnanců, ukázka jak vypadá agenda směn.
Celý agenda vzor 1:1 pro 'Moje návštěvy': datum-rail vlevo, karta návštěvy s časem, rodinou a stavem (fajfka = potvrzena pěstounem, křížek = zrušena). '3/5 shift tasks complete' → plnění checklistu KO na návštěvě přímo z přehledu. 'Comments' → počet záznamů v Ose k návštěvě. Onboarding carousel se Přeskočit + FAB je hotový vzor pro první spuštění appky pěstounem.

### IMG_7769.jpg — Onboarding slide 2/6: vysvětlení typů směn (týmová, individuální, otevřená k převzetí).
Typologie směn → typologie událostí CRM: individuální návštěva (1 pracovník), společná akce/klub pěstounů (avatar stack), 'otevřená' = nepřiřazený respit nebo vzdělávací seminář s volnými místy (badge s počtem volných kapacit). Avatar stack pro účastníky akce a pastelové barevné kódování typu události přebrat rovnou.

### IMG_7770.jpg — Onboarding slide 3/6: co všechno může směna obsahovat — lokace, poznámky, přílohy, akční tlačítka, checklist úkolů.
Toto je přesně anatomie detailu návštěvy v našem CRM: mapa/adresa rodiny, instrukce pro pracovníka ('vezmi podepsanou dohodu'), přiložené dokumenty, checklist KO (už máme ve spec — obecný/speciální/vlastní) a akční tlačítka 'Zahájit návštěvu' (Check-in → časomíra), 'Dokončit', 'Zrušit'. Barevná sémantika zelená/modrá/červená pro akce je čitelná i v terénu.

### IMG_7771.jpg — Onboarding slide 4/6: dostupnost a výměny směn — kdo je nedostupný a jak požádat kolegu o záskok.
Výměna → předání návštěvy/rodiny kolegovi při nemoci či dovolené: UI se dvěma avatary a swap ikonou je srozumitelná metafora pro 'předat klíčového pracovníka'. Růžový panel nedostupnosti → přehled 'kdo z týmu je tento týden nedostupný' pro vedoucího při plánování návštěv a respitů. Avatar-row jako kompaktní zobrazení více osob.

### IMG_7772.jpg — Onboarding slide 5/6: administrace z mobilu — Admin tab s aktivními moduly (Time clock, Workflows, Shift scheduling).
Vzor 'Správce tab' = mobilní administrace pro vedoucí služby: seznam modulů (Návštěvy ke schválení, Výkazy, Dohody k podpisu) s červenými badge počtů čekajících položek. Badge na tab-baru agreguje vše, co vyžaduje pozornost vedoucího — přesně to potřebuje hierarchická viditelnost v našem CRM (vedoucí vidí vše podřízené).

### IMG_7773.jpg — Onboarding slide 6/6: závěrečná výzva — vyzkoušej si předpřipravené ukázkové směny.
Vzor 'sample data k osahání': po registraci organizace předgenerovat ukázkovou rodinu, návštěvu a dohodu, ať si pracovník appku proklikne bez strachu z reálných dat — a na konci onboardingu jedno velké CTA 'Pojďme na to'. (3D ilustraci nahradit lineart stylem, drží se to našeho zákazu emoji/hravých assetů.)

### IMG_7774.jpg — Reálný rozvrh (Schedule) přihlášeného uživatele: týdenní pás + agenda směn čekajících na potvrzení.
Nejcennější obrazovka. Přímé mapování: směna → návštěva v rodině; Potvrdit/Odmítnout inline → pěstoun potvrzuje navržený termín návštěvy bez otevírání detailu; iniciály v kruhu → pracovník; adresa → bydliště rodiny. Scope-přepínač 'Jen já / Všichni' dole = přesně náš scope-aware kalendář (moje návštěvy vs. celá organizace). 'Shrnutí týdne · 2 směny' → 'Tento týden · 3 návštěvy, 2 h vzdělávání'. Inline '+ Přidat' na prázdném dni → rychlé naplánování návštěvy.

### IMG_7775.jpg — Potvrzovací bottom sheet pro přijetí směny ('Přijmout Location B?') s volitelnou poznámkou.
Univerzální vzor potvrzení pro CRM: 'Potvrdit návštěvu 12. 7. v 9:00?' s volitelnou poznámkou, která se rovnou zapíše do Osy rodiny. Zelené = souhlas, kontextová věta 'začíná v…' snižuje omyl. Stejný sheet použít pro schválení dokumentu, přijetí respitu nebo potvrzení účasti na vzdělávání. Ilustraci palce nahradit lineart ikonou.

### IMG_7776.jpg — Fullscreen editor poznámky ke směně s možností přiložit fotku, nad otevřenou klávesnicí.
Přesně vzor pro terénní zápis do Osy: velké pole na text + jedno ťuknutí na fotoaparát (fotka z návštěvy, podepsaný papír, stav domácnosti) — bez procházení galerie. Dvojice Zahodit/Uložit se stejnou sémantikou outline vs. plná. Pro naše KO je to rychlejší než formulář; strukturu dodá checklist, poznámka zůstane volná.

### IMG_7777.jpg — Stejný potvrzovací sheet jako IMG_7775, ale s již vyplněnou poznámkou — stav před finálním odesláním.
Flow 'akce + poznámka jedním odesláním': pěstoun potvrdí návštěvu a rovnou připíše 'přijďte až po obědě' — obojí dorazí pracovníkovi jako jedna událost do Osy. Důležitý detail: poznámka napsaná ve fullscreen editoru se vrací do kompaktního sheetu k finální kontrole před odesláním — žádné slepé odeslání.

### IMG_7778.jpg — Rozvrh zaměstnance (tab 'Jen já') — agenda mých směn s možností potvrdit/odmítnout přidělenou směnu.
Směna→návštěva v rodině: pěstoun/pracovník dostane návrh termínu a přímo v kartě 'Potvrdit/Odmítnout'. Barevný levý proužek = stav návštěvy (navržená/potvrzená/proběhlá). Týdenní pás s tečkami = dny s návštěvami. 'Shrnutí týdne · 2 směny' → '· 2 návštěvy / 3 h vzdělávání'. Taby Jen já/Všichni = Moje návštěvy vs. celý tým (hierarchická viditelnost vedoucí→pracovník).

### IMG_7779.jpg — Denní pohled správce rozvrhu — všechny směny dne podle lokalit, s počtem nepotvrzených a publikací rozvrhu.
Denní dispečink návštěv pro vedoucí: pager po dnech, čip 'X nepotvrzeno' = kolik rodin ještě nepotvrdilo termín. Barva karty podle typu úkonu (návštěva/respit/vzdělávání) nebo rodiny. 'Denní součty' → denní součet hodin doprovázení / počtu úkonů. FAB + = nová návštěva. 'Publikovat' = rozeslat plán rodinám najednou.

### IMG_7780.jpg — Žádosti (admin) — tab 'Nárokované směny': fronta žádostí zaměstnanců o volné směny za zvolený týden; zde prázdná.
Fronta žádostí pěstounů: segmenty 'Žádosti o respit' | 'Změny termínů' (nebo žádosti o čerpání SPVPP). Týdenní pager pro filtrování období. Jednotný prázdný stav (ikona + 'Žádné položky') přesně odpovídá požadovanému empty-state vzoru z UI/UX polish memory.

### IMG_7781.jpg — Žádosti — tab 'Výměny': výměny směn mezi zaměstnanci rozdělené na Nevyřízené a Historii; obě sekce prázdné.
Vzor 'Nevyřízené / Historie' pro jakékoli schvalování v CRM: žádosti o změnu termínu návštěvy, schválení dokumentu, žádost o proplacení respitu. Pending nahoře, audit trail dole — jedna obrazovka, žádné přepínání.

### IMG_7782.jpg — Rozvrh — tab 'Všichni': agenda směn celého týmu po dnech, včetně mé nepotvrzené směny s akcemi.
Týmový kalendář pro vedoucí klíčových pracovníků: vidím své návštěvy akčně (potvrdit), kolegů jen informativně. Barva = typ úkonu, avatar = kdo jede do rodiny. Přesně naplňuje memory 'hierarchická viditelnost' — nadřízený vidí vše podřízené v jednom listu.

### IMG_7783.jpg — Nastavení plánovače — granulární notifikace (push + e-mail) per typ události a synchronizace kalendáře.
Notifikační centrum CRM 1:1: 'Před návštěvou' → připomínka hodinu/den dříve; toggly 'Návštěva mi byla přidělena / upravena / zrušena', 'Plán zveřejněn', 'Žádost o změnu termínu'. Oddělit push vs. e-mail sekcí. Lineart ikony v kroužku ladí se zákazem emoji.

### IMG_7784.jpg — Synchronizace kalendáře — ICS feed odkaz pro odběr směn v osobním kalendáři (Google/Outlook/Apple).
Export návštěv do osobního kalendáře pracovníka i pěstouna přes ICS feed (read-only URL + Kopírovat). Levné a hodnotné: pěstoun vidí návštěvy doprovázející organizace ve svém Google/Apple kalendáři bez instalace čehokoli navíc.

### IMG_7785.jpg — Moje dostupnost — týdenní přehled, kdy je zaměstnanec k dispozici; výchozí stav 'K dispozici – celý den' u každého dne.
Dostupnost klíčového pracovníka (kdy může do terénu) i dostupnost rodiny (kdy je vhodné přijet na návštěvu). Výchozí 'k dispozici celý den' + výjimky. Overflow '...' pro rychlé akce (kopírovat na další týden, smazat).

### IMG_7786.jpg — Bottom sheet 'Deklarovat nedostupnost' — formulář pro zadání, kdy zaměstnanec nemůže pracovat (den/hodiny, poznámka, opakování).
Univerzální vzor formuláře v bottom sheetu pro mobilní CRM: nahlášení nedostupnosti rodiny ('jsme na dovolené'), přesun návštěvy, rychlé zadání úkonu. Trojice footer akcí (smazat/zrušit/potvrdit) a 'Celý den' toggle + od–do časy jde 1:1 do plánování návštěv a respitů.

### IMG_7787.jpg — Zdroje / Vyhledávání — rozcestník modulů (Workspace hub): Time Clock, Schedule, Chat jako velké dlaždice.
Domovský hub CRM: dlaždice modulů s barevnými kruhy a lineart ikonami — Návštěvy (kalendář), Rodiny (lidé), Dokumenty, Osa/Chat, Vzdělávání. Tab 'Správce' s korunkou = vstup do admin režimu gated podle role. Konzistentní barva modulu napříč appkou (ikonka v chatu, v hubu, v notifikaci).

### IMG_7788.jpg — Konverzace — seznam chatů: systémové bot kanály (Time & Attendance, Connecteam Tips) a týmový chat, s filtry a unread badgi.
Osa/chat v CRM: konverzace per rodina + systémové kanály ('Deník návštěv', 'Připomínky vzdělávání') se stejným vzorem avatar-název-náhled-čas-badge. Filtry Všichni/Nepřečtené/Rodiny. Automatické zprávy systému se v náhledu ukazují jako běžný chat — jeden inbox pro lidi i systém.

### IMG_7789.jpg — Detail bot kanálu 'Time & Attendance' — automatická zpráva se souhrnem odpracované směny a zpětnovazební prompt.
Time Clock→časomíra návštěvy: po ukončení návštěvy systém pošle do Osy kartu 'Návštěva ukončena: datum, 14:00–15:30, celkem 1,5 h' s tlačítkem 'Zobrazit podrobnosti' (→ záznam návštěvy/checklist). Feedback vzor 'užitečné? ponechat/přestat' pro ladění automatických notifikací. Intro karta kanálu = samovysvětlující onboarding každého systémového kanálu.

### IMG_7790.jpg — Detail týmového chatu (konverzace 'All users' team chat') těsně po založení — prázdná konverzace s uvítací kartou.
Osa/chat na kartě rodiny: stejný vzor — světle modré pozadí vlákna, uvítací karta 'Osa rodiny Novákovi, založena …' jako první prvek, dole pilulkový input s + (foto/dokument z KO) a mikrofonem (hlasová poznámka z terénu). Ikona (i) v hlavičce → info o rodině/skupině.

### IMG_7791.jpg — Informace o skupině (nastavení chatu): úprava názvu, oprávnění členů, notifikace, fotogalerie, seznam členů.
Nastavení 'skupiny' = nastavení rodinného vlákna: toggle 'pěstoun může psát', notifikace per rodina, galerie fotek z návštěv (empty state stejným stylem), seznam členů (klíčová pracovnice s badge 'Správce', pěstouni, externisté) + 'Přidat členy' pro přizvání kolegy/supervizora. Outline pill badge pro roli je přesně vzor pro role v CRM.

### IMG_7792.jpg — Tatáž obrazovka 'Informace o skupině' odscrollovaná dolů — celý seznam členů a zámek skupiny.
Vzor 'vysvětli, proč akce nejde' je zlatý pro gating práv v CRM: místo skrytého tlačítka šedý pruh 'Klíč rodiny nelze změnit, kontaktujte vedoucího'. Iniciálové avatary s barvou dle osoby → kontakty bez fotky (pěstouni, děti, OSPOD).

### IMG_7793.jpg — Přidat členy do skupiny — výběr osob ze seznamu s vyhledáváním a potvrzením.
Picker kontaktů pro CRM: přidání účastníků k návštěvě/KO, přizvání kolegy k rodině. Podtitulek 'již přidán(a)' → 'již je v týmu rodiny' / 'nemá přístup ke složce dítěte'. Hlavička se zpět + fajfkou = jednotný vzor všech výběrových obrazovek.

### IMG_7794.jpg — Tab 'Profil' — osobní rozcestník uživatele: digitální kartička zaměstnance + odeslané formuláře + nastavení.
Profil pracovníka v CRM: digitální 'průkazka doprovázející organizace' (jméno, role, organizace, od kdy) — použitelná i jako prokázání se v rodině. 'Moje příspěvky' → 'Moje záznamy z návštěv/checklisty'. Badge na tabu Chat → nepřečtené zprávy v Ose. Tab 'Správce' s korunkou → oddělený admin režim pro vedoucí (hierarchická viditelnost).

### IMG_7795.jpg — Tab 'Profil' odscrollovaný dolů — kompletní menu: aktivita, osobní údaje, nastavení, podpora, přepnutí společnosti, odhlášení.
Struktura profilového menu 1:1 do CRM mobilu: Moje aktivita (log práce s rodinami), Osobní údaje, Nastavení, Nápověda/Návod (napojit na Workflow katalog/FAQ), 'Přepnout společnost' → přepnutí organizace pro multi-tenant B2B SaaS schéma, červené Odhlásit se dole. Červená vyhrazená pro destruktivní akce.

### IMG_7796.jpg — Činnost (audit log / aktivita uživatele) — chronologická časová osa událostí seskupená podle dne.
Přímo vzor pro Osu rodiny/dítěte: den jako modrý chip, události s dvojitým avatarem (kdo + ikona typu: návštěva, dokument, podpis, checklist), čas pod textem. Stejně tak audit log pro důkazní protokol dokumentů (CLM) — kdo kdy co zveřejnil/podepsal.

### IMG_7797.jpg — Osobní údaje — editovatelný formulář profilu rozdělený do sbalitelných sekcí (osobní, firemní, platební údaje).
Karta kontaktu/pěstouna: sekce 'Osobní údaje', 'Dohoda a doprovázení', 'Vzdělávání' jako sbalitelné bloky; prázdné pole jako modrý label = jemná výzva doplňit data bez červených hvězdiček. Pozor na plnou lokalizaci (v CRM vše česky). Tečkovaná linka = editovatelné pole, plná = readonly.

### IMG_7798.jpg — Nastavení aplikace — notifikace, domovská stránka, aktualizace, systémové info (verze, kód společnosti, PIN kiosku), právní odkazy, smazání účtu.
Nastavení CRM mobilu: notifikace, přizpůsobení domovské stránky (pořadí panelů huby), verze appky + ID organizace (užitečné pro podporu), GDPR odkazy povinně; 'smazat účet' jako textový odkaz do podpory — přesně odpovídá GDPR workflow (WF v katalogu), kdy mazání řeší správce, ne jedno tlačítko.

### IMG_7799.jpg — Odeslání formulářů — přehled vlastních odeslaných formulářů s filtrem období, přepínačem zdroje a vyhledáváním; zde prázdný stav.
Seznam záznamů z návštěv/checklistů pracovníka: taby 'Moje záznamy / Sdíleno se mnou', týdenní pager pro výkaznictví (návštěvy za týden, vzdělávací hodiny), počitadlo '3 návštěvy', jednotný empty state. Týdenní navigace se hodí i pro přehled respitů a výkaz SPVPP.

### IMG_7800.jpg — Onboarding tabu 'Správce' — uvítací carousel vysvětlující mobilní admin konzoli (mini-dashboard s grafem aktivity, dlaždicemi a seznamem aktivních modulů).
Admin/vedoucí režim CRM na mobilu: dashboard s grafem aktivity organizace, dlaždice 'Pracovníci', 'Rodiny', 'Nastavení organizace' (branding/barvy z TODO), seznam modulů s badge počtu čekajících (ke schválení: záznamy, dokumenty, dohody). Onboarding carousel se skip + dots použít při prvním spuštění mobilní appky pro pěstouny i pracovníky.

### IMG_7801.jpg — Onboardingový slide (2/4) vysvětlující gating: admin funkce (karta Správce) vidí jen správci, řadoví zaměstnanci ne.
Stejný vzor pro CRM: onboarding vysvětlující role — 'kartu Správce vidí jen vedoucí, klíčová pracovnice vidí jen své rodiny'. Korunka/zámek jako vizuální jazyk gatingu práv (máme hierarchickou viditelnost). Tab 'Správce' viditelný jen adminům = přesně náš gating v hubu.

### IMG_7802.jpg — Onboardingový slide (3/4) 'Síla mobilu' — přidání uživatelů přímo z kontaktů telefonu (multi-select picker).
Multi-select picker s počtem v CTA ('Přidat 3 kontakty') je skvělý vzor pro: přidání účastníků návštěvy/vzdělávání, výběr dětí do reportu, přidání členů rodiny. Import pěstounů z kontaktů telefonu pro terénní klíčové pracovnice. Kulaté checkboxy vpravo + avatar vlevo = náš standard výběrových listů.

### IMG_7803.jpg — Poslední onboardingový slide — teaser funkcí (Time clock, Shift scheduling, Workflows, Chat, Many more) + CTA 'Pojďme na to!'.
Barevné kruhové ikony modulů = přímo použitelné pro naše moduly: Návštěvy (stopky→časomíra návštěvy), Kalendář, Checklisty (clipboard), Osa/Chat. Jedna barva na modul, důsledně všude (dlaždice, aktivita, chat). Feature-pill teaser použít v prázdné kartě 'co vás čeká' při onboardingu organizace.

### IMG_7804.jpg — Admin dashboard (tab Správce): graf aktivity uživatelů za posledních 5 dní + navigační karty a rychlý přístup k modulům.
Přímý vzor pro dashboard vedoucího: graf 'aktivita klíčových pracovnic / návštěvy v týdnu', karty 'Uživatelé a role' a 'Aktivita (audit log)', Rychlý přístup = dlaždice 'Kalendář návštěv' a 'Časomíra návštěvy'. Pastelová dlaždice + bílý kruh s ikonou je hezčí než plochý MUI grid (odpovídá požadavku na UI polish).

### IMG_7805.jpg — Karta Správce — seznam aktivních zdrojů (modulů) + empty-state/upsell odkazující na plnou správu na desktopu.
Pro CRM: mobilní appka klíčové pracovnice zobrazí jen aktivní moduly organizace; správa/konfigurace zůstává na desktopu — přesně tento empty-state ('Plné nastavení najdete na moje.doprovazeni.com') použít místo prázdné obrazovky. Odpovídá našemu vzoru propracovaných empty-states.

### IMG_7806.jpg — Správa uživatelů: seznam členů organizace se segmentací Uživatelé / Správci / Archivovat a FAB pro přidání.
1:1 pro správu členů organizace v CRM: taby 'Pracovnice / Správci / Archiv' (archivace místo mazání — máme v GDPR workflow). Korunka-badge na avataru = okamžitě čitelná role bez sloupce navíc. Iniciálové avatary s barvou dle jména už používáme, tady potvrzený vzor. FAB = 'přidat pěstouna/dítě/pracovnici'.

### IMG_7807.jpg — Audit log / časová osa aktivity: chronologický protokol akcí (přihlášení, check-in, aktivace modulů, publikace).
Toto je přesně naše 'Osa' na kartě rodiny/dítěte: avatar pracovnice + ikona typu události (návštěva, dokument, checklist, podpis), datum jako pill oddělovač, čas u záznamu. Dvojitá ikona (kdo+co) řeší čitelnost smíšené osy. Zároveň vzor pro důkazní protokol/audit log, který v CLM potřebujeme.

### IMG_7808.jpg — Rozvrh směn (Schedule) pro daný den: denní pohled se směnami zaměstnanců a stavovými filtry (Zpoždění, Nepotvrzeno).
Směna→návštěva: denní seznam návštěv klíčové pracovnice jako barevné karty (čas, adresa rodiny, jméno pěstouna, avatar). Stavové chipy nahoře = 'Nepotvrzeno / Zpožděná zpráva z návštěvy' jako filtr i metrika. Barva karty podle stavu (červená = po termínu zprávy). 'Denní součty' → denní souhrn hodin v terénu. Vlastní tab bar modulu = sekce Kalendář/Žádosti o respit/Mapa/Aktivita.

### IMG_7809.jpg — Kontextové menu FAB na rozvrhu: volby 'Přidat směnu', 'Přidat směnu ze šablony', 'Přidat denní poznámku' nad rozmazaným pozadím.
FAB s rozbalením více akcí pro CRM kalendář: 'Přidat návštěvu', 'Přidat návštěvu ze šablony' (máme šablony karet/checklistů — analogicky šablony návštěv), 'Přidat poznámku ke dni'. Varianta 'ze šablony' jako druhá akce je přesně náš vzor superadmin šablon. Blur-sheet je hezčí než plný modal pro 2-3 akce.

### IMG_7810.jpg — Seznam konverzací (Chat): systémové kanály, týmový chat a tipy, s filtry a badgi nepřečtených.
Model 'systémový kanál' je zlatý pro naši Osu/chat: automatické zprávy ('Návštěva ukončena', 'Dokument podepsán', 'Blíží se limit vzdělávání') chodí do kanálu vedle lidské konverzace s rodinou. Filtry Všichni/Nepřečtené/Týmy → Všichni/Nepřečtené/Rodiny. Unread badge na tabu i řádku. Bez emoji u nás — místo ✅ lineart ikona.

### IMG_7811.jpg — Nová zpráva: výběr příjemce — rychlé akce (Nová skupina, Vysílat zprávu/broadcast) nad abecedním seznamem kontaktů.
Pro CRM 'Nová zpráva / Nový záznam do Osy': nahoře rychlé akce 'Nová skupina (rodina)' a 'Hromadná zpráva' (broadcast pěstounům = pozvánky na vzdělávání!), pod tím kontakty. Broadcast je přesně nástroj pro pozvánky na respitní akce a školení. Vzor akce-nad-seznamem použít i v pickeru dětí/rodin.

