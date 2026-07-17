# 08 — Lekce a pasti (ČTI PRVNÍ — každá nás stála čas/tokeny)

## Firebase / Firestore

1. **Vite env past (KRITICKÁ, stala se):** `.env.production.local` Vite při
   `npm run build` AUTOMATICKY načte s prioritou nad `.env.local` → prod
   credentials se TIŠE zapečou do bundle. Prod klíče patří JEN do
   `.env.prod.credentials.local` (gitignored přes `.env.*.local`).
2. **„List dotaz vs. pole v pravidle" (stala se 2×):** Firestore povolí list
   dotaz jen když je staticky dokazatelný proti rules. Rovnostní filtry
   dotazu musí zrcadlit pole v pravidle; autorský disjunkt musí být
   nepodmíněný. Testuj VŽDY jako ne-superadmin.
3. **`sameOrg` bez `isStaff` = únik dat (stala se):** pěstoun/EP sdílí
   organizationId → holé sameOrg jim otevře celou organizaci. Každé pravidlo
   s sameOrg musí být `isStaff() && sameOrg(...)` + úzké disjunkty.
4. **Firestore odmítá `undefined`** — defaultuj na `null`
   (`mimeType = null`), jinak runtime chyba při addDoc.
5. Composite index chybí = runtime chyba dotazu s odkazem na vytvoření.
   Rozhodnutí: pro malé kolekce řadit na klientovi (bez orderBy), indexy
   jen pro timeline/events (jsou v `firestore.indexes.json`).

## Build / tooling

6. **Tailwind JIT cache „lže"** — po změně tokenů v tailwind.config.js
   RESTARTUJ dev server, jinak vidíš staré barvy a honíš neexistující bug.
7. **eslint max-lines 300** shodí build. Dělej split PŘI psaní (hook + taby +
   modaly), ne až po chybě. router.jsx drž štíhlý mazáním komentářů.
8. **Import depth** — soubory ve 3. úrovni (`screens/foster/...`) potřebují
   `../../../` na store/services a `../../ui/`; opakovaná chyba.
9. **`children` je rezervovaný React prop** — eslint `react/no-children-prop`;
   používej `childrenList`.
10. **PowerShell 5.1 kóduje zrádně (stala se, poškodila soubory):**
    `Get-Content` bez -Encoding čte UTF-8 (bez BOM) jako ANSI → mojibake;
    `Set-Content -Encoding utf8` přidá BOM. Pro manipulaci s UTF-8 soubory
    používej **node skript**, ne PowerShell pipeline. (Opravili jsme reverzí
    přes iconv-lite, pár znaků ručně.)
11. **Neescapované JSX entity** — `"` v textu JSX chce `&quot;`/typografické
    uvozovky „" (eslint react/no-unescaped-entities).
12. **npm balíčky fontů**: fontsource; při odebrání fontu odeber i importy
    v `src/index.css`, jinak build spadne.

## Proces / AI-workflow (nejdražší lekce)

13. **DESIGN SE NIKDY NENASAZUJE BIG-BANG.** Historie: uživatel opakovaně
    odmítal odhadnuté vizuály („kroužení kolem designu", 2026-07-05), a
    2026-07-17 byl KOMPLETNÍ CraftUI redesign (implementovaný a nasazený)
    vrácen slovy „naše minulá verze byla o hodně lepší". → VŽDY: 1) zeptej se
    na směr s ukázkami, 2) udělej JEDEN vzorek (Login + jedna obrazovka),
    3) screenshot → schválení, 4) teprve pak sweep. Ušetříš desítky tisíc
    tokenů a celé nasazení.
14. **Commituj checkpointy.** 11 dní práce bylo nezacommitovaných; revert
    designu musel být chirurgický ruční (git HEAD byl moc starý). Po každém
    uceleném bloku: lint + build + commit.
15. **Subagenti/workflow mají tokenové limity.** Paralelní workflow na hromadné
    editace nám 2× spadl na session limit (9 agentů, 1M tokenů, 0–2 výstupy)
    a zanechal soubory NAPŮL editované. Poučení: hromadné mechanické edity
    dělej inline po dávkách s průběžným lint/build; workflow jen na
    read-only analýzy/review. Po pádu agentů VŽDY zkontroluj rozpracované
    soubory (grep + lint).
16. **AI nikdy nezadává hesla** do formulářů — přihlášené ověření dělá
    uživatel, nebo se ověřuje bez přihlášení (Login page, computed styles)
    + lint/build. Řekni to poctivě do reportu, nepředstírej ověření.
17. **Screenshot nástroj se občas zasekne** — fallback: `get_page_text`,
    `read_console_messages`, JS eval computed styles. Funguje spolehlivě.
18. **Klasifikátor/limit může dočasně blokovat i Bash** — počkej a zopakuj,
    mezitím read-only práce.
19. **Encoding commit zpráv**: repo je na Windows (CRLF warnings jsou OK);
    commit subjecty píšeme ASCII bez diakritiky (konvence repa).
20. **/legacy je zakázaný adresář** — nečti, needituj, nekopíruj z něj.
    Doménová znalost je v docs/domain/.
21. **Deploy souhlasy:** dev = volně; **JAKÝKOLI zásah do prod (deploy, data)
    = výslovný souhlas v dané session**. Stálý souhlas na prod hosting
    existoval v minulé session — NEPŘENÁŠEJ ho automaticky do své.
22. **Neměň chování při refactoru dokumentace** — CURRENT_STATE drž <300
    řádků přesunem starých sekcí do docs/history.md (a dej pozor na bod 10!).

## Doménové zrady

23. Pěstoun je od 2026-07-06 Auth uživatel (dřív nebyl) — starší texty/kód
    mohou tvrdit opak; platí CLAUDE.md.
24. Vokativ českých jmen NEskloňujeme (nespolehlivé bez slovníku) —
    „Dobrý den, Jana" je záměr.
25. Datum v starším vanilla prototypu je napevno 2026-06-20 — nepřenášet.
26. `odmenaEligible`: PPPD (přechodná) má odměnu i bez dítěte — nezjednodušuj.
27. Respit: „i hodina = celý den"; počítá se přes children.length
    (respitRealny) — logika v domainConstants, needuplikuj ji v UI.
