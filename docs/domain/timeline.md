# Timeline — závazná specifikace
# Uložit jako docs/domain/timeline.md

Timeline je SRDCE aplikace: chronologický příběh rodiny. Vše, co se v rodině stane
(návštěvy, poznámky, fotky, dokumenty, změny svěření), se zapisuje sem a odsud čtou
ostatní moduly (obrazovka Dnes, AI generování zpráv, mobilní appka).

> **POZASTAVENO 2026-07-05 (do odvolání):** Immutabilita popsaná níže (§1, §2, §4,
> §6 bod 4) NEPLATÍ — na žádost produktového vlastníka se dokud nevznikne sada
> pravidel per typ záznamu (dokončené vs. rozpracované/plánované) může KAŽDÝ
> záznam rozkliknout a upravit (`updateTimelineEntry`, `body`/`title`/`occurredAt`/
> `subjectRefs`). Původní text sekcí zůstává jako referenční popis PŮVODNÍHO
> (a budoucího cílového) chování — implementace teď odpovídá tomuto pozastavení,
> ne textu níže. Až vznikne finální sada pravidel, tento dokument se přepíše
> a poznámka zmizí.

## 1) Datový model

Podkolekce `foster_families/{familyId}/timeline/{entryId}`:

```
type:        'visit' | 'note' | 'audio_note' | 'photo' | 'document' | 'system'
title:       string (krátký titulek, např. "Návštěva v rodině", "Poznámka ke škole")
body:        string (markdown; u visit strukturovaný zápis, u note volný text)
subjectRefs: [{kind: 'child'|'foster', id}]  — koho se týká; prázdné = celá rodina
occurredAt:  timestamp (kdy se UDÁLOST stala — u návštěvy den návštěvy)
createdAt:   timestamp (kdy vznikl záznam)
createdBy:   {uid, displayName}  — displayName denormalizované (jméno se nemění zpětně)
attachments: [{docId, thumb, kind}] max 10 — odkazy do /documents (foto, sken…)
source:      'web' | 'mobile' | 'ai' | 'system'
pinned:      bool (připnuto nahoru, max 3 na rodinu)
correctsEntryId: string | null  — vyplněno jen u opravných záznamů (viz §4)
```

- Systémové záznamy (`type: system`): změna svěření, změna klíčové osoby, nová dohoda,
  ukončení péče… Píše je VÝHRADNĚ services vrstva při dané akci (batch se změnou),
  `createdBy` = kdo akci provedl, `body` = lidsky čitelná věta („Dítě Tereza svěřeno
  do společné PP manželům Novákovým, sp. zn. 12 P 34/2026").
- **Immutabilita:** záznamy se NEUPRAVUJÍ ani NEMAŽOU (rules: create ano, update jen
  pole `pinned`, delete nikdy) — je to důkazní kronika práce KO. Oprava = nový záznam
  typu note s odkazem `correctsEntryId` na opravovaný; UI pak u původního zobrazí
  jemný štítek „opraveno novějším záznamem" (viz §4 pro interakci).
- **subjectRefs prázdné pole = celá rodina — potvrzený záměr, ne neúplná data.**
  Příslušnost k rodině plyne z umístění v podkolekci (`foster_families/{familyId}/…`),
  takže explicitní ref na rodinu samotnou by byl redundantní. Tohle je vědomá odchylka
  od obecného pravidla `subjectRefs` v CLAUDE.md (kde víceosobový záznam nese explicitní
  refy na všechny zúčastněné) — zde je nositelem kontextu už cesta dokumentu. Odpovídající
  poznámka je i v CLAUDE.md u pravidla `subjectRefs`.
- Čtení: `orderBy(occurredAt, desc)`, `limit(20)` + cursor („Načíst starší"). Filtr podle
  typu a podle osoby (viz §3) se kombinuje **jedním Firestore dotazem** (`where('type', '==', …)`
  + `where('subjectRefs', 'array-contains', …)` + `orderBy('occurredAt', 'desc')`) — vyžaduje
  složené indexy, viz §2b.
- Timeline dítěte NEEXISTUJE jako kolekce — je to dotaz na timeline rodiny filtrovaný
  přes `subjectRefs` (+ u dítěte s minulostí ve více rodinách dotazy přes
  previousFosters, sloučené klientsky; V8, v MVP stačí aktuální rodina).

## 2) Oprávnění (firestore.rules)

- **Zápis (create) a pin/unpin (update pole `pinned`):** přiřazená klíčová osoba rodiny
  (`assignedTo == request.auth.uid`) a `org_admin` téže organizace. `superadmin` NE —
  nepracuje s klientskými (citlivými) daty rodin, jen se správou systému.
- **Čtení:** přiřazená KO rodiny, její nadřízení v hierarchii (`vedouci_pobocky`/
  `teamleader` nad ní dle `nadrizeny` řetězce) a `org_admin` téže organizace.
- Update na cokoli mimo `pinned` a jakýkoli delete: vždy `false`, bez výjimky (i pro
  superadmina/org_admina) — immutabilita z §1 platí bez ohledu na roli.
- Systémové záznamy (`type: 'system'`) zapisuje jen server-side services vrstva v rámci
  transakce, která je vyvolala — ne přímo z UI formuláře.

## 2b) Indexy

`firestore.indexes.json` — composite indexy pro `timeline` (queryScope `COLLECTION`,
platí pro podkolekci v každé rodině):

1. `type` (ASC) + `occurredAt` (DESC) — filtr jen podle typu.
2. `subjectRefs` (CONTAINS) + `occurredAt` (DESC) — filtr jen podle osoby.
3. `subjectRefs` (CONTAINS) + `type` (ASC) + `occurredAt` (DESC) — kombinovaný filtr
   typ AND osoba (viz §1, §3).
4. `pinned` (ASC) + `occurredAt` (DESC) — sekce „Připnuto" (§2, §3). Chybělo v prvním
   nasazení (2026-07-03) — bez něj `listPinnedTimelineEntries` spadne na
   `failed-precondition` a celé načtení Osy tiše zůstane na prázdném stavu (žádná
   chyba v UI), protože obě dílčí načtení běžela v jednom `Promise.all`. Opraveno:
   index doplněn a načítání připnutých/hlavních záznamů rozděleno na dvě nezávislé
   chybové domény (selhání jednoho nesmí zablokovat druhé).

Přidat do stejného deploy kroku jako rules (`firebase deploy --only firestore:rules,firestore:indexes`).

## 3) Vzhled (DESIGN.md platí; toto je upřesnění)

- Svislá osa: tenká linka (stone-200) vlevo, na ní tečka v barvě dle typu záznamu;
  karty vpravo (rounded-2xl, shadow-sm, bez borderu).
- **Seskupení podle dne:** lepivý mini-nadpis „středa 2. července" (text-xs, uppercase,
  stone-400); záznamy téhož dne pod ním. Dnešek = „Dnes".
- Karta záznamu: řádek 1 = ikona typu (lucide, 18px, barva typu) + title (font-medium)
  + čas (text-xs stone-400) vpravo; řádek 2 = body zkrácené na 3 řádky (line-clamp-3,
  „…zobrazit více" rozbalí inline — NE modál); řádek 3 = čipy subjektů (mini avatar
  + jméno, entity barvy: dítě green, pěstoun green-700 tmavší, celá rodina bez čipu)
  + náhledy příloh (čtverečky 48px, rounded-lg, klik → dokument).
- Barvy/ikony typů: visit = primary/`footprints`, note = stone/`sticky-note`,
  audio_note = primary/`mic`, photo = green/`camera`, document = blue/`file-text`,
  system = stone-400/`git-commit-horizontal` (systémové karty vizuálně tišší:
  bg-stone-50, menší padding, bez stínu).
- Připnuté záznamy: sekce „Připnuto" nad osou (max 3, ikona `pin`).
- **Chybový stav karty (selhání zápisu):** karta zůstává viditelná, orámování/ikona
  v error barvě (Tailwind `red-*` dle DESIGN.md), ikona `alert-circle` místo ikony typu,
  pod textem popisek „Nepodařilo se uložit" + dvě tlačítka: „Zkusit znovu" (primary) a
  „Zahodit" (ghost, text-stone-500). Text záznamu zůstává v kartě beze změny — viz §4.
- Prázdný stav: ilustrace + „Zatím žádné záznamy. Začněte první poznámkou." + tlačítko.
- Mobilní web: identická struktura, jen bez levé linky (úspora šířky), tečka se
  přesouvá do karty před ikonu.

## 4) Interakce

- Hlavní tab detailu rodiny (první, výchozí). Nahoře řádek filtrů jako čipy:
  Vše · Návštěvy · Poznámky · Dokumenty · Systém + čipy dětí (filtr přes subjectRefs).
  Filtry se kombinují (typ AND osoba), řeší se jedním dotazem (§1, §2b), ne klientsky.
- Tlačítko „+ Záznam" (primary, vpravo nahoře nad osou) → zatím jediná volba
  „Poznámka": bottom sheet (mobil) / pravý panel (desktop) s poli: titulek (nepovinný,
  default „Poznámka"), text (MD editor light — bold/kurzíva/odrážky), datum události
  (default dnes), čipy koho se týká (default celá rodina), Uložit.
- **Oprava záznamu:** karty typu `visit`/`note`/`audio_note` mají v pravém horním rohu
  menu „⋯" s jedinou položkou „Napsat opravu". Otevře stejný formulář jako „+ Záznam",
  ale předvyplněný: titulek „Oprava: {titulek původního záznamu}", `correctsEntryId`
  nastaveno na ID opravovaného záznamu (skryté pole, needitovatelné). Po uložení dostane
  PŮVODNÍ záznam jemný štítek „opraveno novějším záznamem" (odkaz na nový záznam).
  Systémové záznamy (`type: 'system'`) menu „⋯" NEMAJÍ — opravu vždy zakládá jen services
  vrstva novým systémovým zápisem, ne uživatel ručně.
- Optimistické UI: záznam se objeví okamžitě se stavem „ukládám" (jemná pulzace), po
  potvrzení serverem ztuhne. **Při selhání zápisu (síť/rules)** karta NEZMIZÍ — přejde do
  chybového stavu popsaného v §3 („Nepodařilo se uložit" + Zkusit znovu/Zahodit), text
  zůstává zachovaný v kartě, aby o něj KO nepřišla. „Zkusit znovu" zopakuje zápis se
  stejným obsahem; „Zahodit" kartu i koncept smaže z UI (do Firestore se stejně nikdy
  nezapsal).
- Klik na kartu visit/note = rozbalení inline; klik na document/photo = otevře dokument.

## 5) Napojení (teď a výhledově)

- Krok 2 právního modelu: změny svěření zapisují system záznamy (v batch transakci).
- Kalendář: dokončená událost typu návštěva nabídne „Zapsat návštěvu" → předvyplněný
  visit záznam (V-next, ne teď — jen nechat v events připravené pole timelineEntryId).
- Mobilní capture (foto/audio) a AI zápisy budou zapisovat přes stejný timelineService
  se `source: 'mobile'|'ai'`— služba musí mít čisté API createEntry(familyId, data).
- AI generování zpráv bude timeline číst za období — proto occurredAt oddělené od
  createdAt (zpětné dopsání poznámky nesmí rozbít chronologii).

## 6) Akceptační kritéria (ověř živě před commitem)

1. Záznamy se zobrazují seskupené podle dne, nejnovější nahoře, stránkují po 20.
2. Ruční poznámka: vytvoření s výběrem 1 dítěte → čip dítěte na kartě; filtr na
   dítě ji najde, filtr na jiné dítě ne; kombinovaný filtr typ+osoba vrátí správný
   průnik (ne jen jednu z podmínek).
3. Systémový záznam vznikne automaticky při změně svěření, je vizuálně tišší a nemá
   menu „⋯" (nejde u něj založit opravu).
4. Záznam nejde upravit ani smazat (ověř i přímým voláním služby, ne jen UI). Existující
   záznam JDE opravit přes „⋯ → Napsat opravu" — vznikne nový záznam s `correctsEntryId`,
   původní dostane štítek.
5. Pin/unpin funguje, max 3 — čtvrtý pin vrátí srozumitelnou chybu.
6. Prázdná rodina ukazuje empty state s funkčním tlačítkem.
7. Oprávnění: KO jiné rodiny (nepřiřazená) nevidí ani nezapíše záznam; superadmin
   zápis/pin odmítnut rules; org_admin téže organizace čte i zapisuje bez omezení.
8. Vynucené selhání zápisu (např. dočasně odpojená síť) ukáže chybovou kartu s textem
   „Nepodařilo se uložit" a funkčním „Zkusit znovu"; text záznamu nikdy tiše nezmizí.
