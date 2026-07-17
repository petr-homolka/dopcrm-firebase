# 09 — Design: historie 4 iterací a NOVÁ text-first vize (tvoje zadání)

## Proč je tahle kapitola nejdůležitější

Design je v tomto projektu **nejrizikovější oblast** — uživatel má silný,
konkrétní vkus a už 2× vrátil/odmítl velkou vizuální práci. Než napíšeš
jediný řádek stylů, přečti si tuto kapitolu celou.

## Historie iterací (ať víš, co už NEzkoušet)

1. **„Amie" (soft/playful, teal)** — původní systém. Nahrazen. Archiv:
   `docs/DESIGN-amie-archiv.md`; legacy tokeny `primary.*` ještě v configu.
2. **Connecteam (2026-07-04/05) — AKTUÁLNÍ DESKTOP.** Uživatel dodal 56
   screenshotů Connecteamu jako „90% vzor" (analýza
   `docs/design/connecteam-analyza-2026-07-05.md`). Modrá #2E7CF6, bílý
   sidebar s barevnými dlaždicemi, karty se shadow-sm, DESIGN.md §2–§11.
3. **iOS/Lidl mobil (2026-07-05/06) — AKTUÁLNÍ MOBIL.** Mobil = nativní feel:
   iOS modrá #007AFF, Noto Sans, ŽÁDNÁ zelená, radius 18/10, bez stínů
   (DESIGN.md §12). Lidl Plus přidal: modrý hero, label-vlevo/hodnota-vpravo,
   velké písmo 17px, hodinový kalendář. Uživatel Lidl výslovně chválil.
4. **CraftUI/Pěstouni (2026-07-17) — IMPLEMENTOVÁN A VRÁCEN TENTÝŽ DEN.**
   Klidná modro-šedá #4A6B8C, Lato+Source Sans Pro, tmavý sidebar, UID
   odznaky, desaturovaná sémantika. Kompletně hotové a nasazené; verdikt
   uživatele: „naše minulá verze byla o hodně lepší. vrať vše do původního
   stavu." Kit zůstává na disku (`c:\_____ClaudeAI\craftui-crm-design-system\`)
   — NEAPLIKOVAT, NEnavrhovat znovu.

Poučení z toho všeho: uživateli se líbí **živé, syté, „appkové" UI**
(Connecteam/Lidl energie), NE kalné/desaturované/„enterprise klidné" palety.
Zároveň teď chce zkusit **text-first minimalismus** — to je legitimní nový
experiment, ale MUSÍ projít vzorkem.

## NOVÁ VIZE (tvoje zadání): čistý, téměř pouze textový web à la claude.ai

Uživatel: „vize je naprosto čistý a téměř pouze textový web jako je např.
homepage https://claude.ai/chat/". K tomu posílá design systém v příloze —
**nejdřív si ho vyžádej/najdi a přečti celý** (u CraftUI byl bundle
s README → `project/readme.md` → tokens/ → primární ui_kit; očekávej
podobnou strukturu).

Co „claude.ai styl" znamená prakticky (pokud příloha neurčí jinak):
- Typografie nese VŠECHNU hierarchii: velké klidné nadpisy (často serif
  nebo charakterní sans), čitelný text ~16px, štědrý line-height.
- Skoro žádné rámečky, stíny, barevné dlaždice a odznaky — místo nich
  bílý prostor, jemné 1px linky, max 1 akcentní barva + neutrály.
- Málo chrome: navigace textová, tlačítka decentní (často jen text/outline),
  ikony minimálně.
- POZOR na konflikt s doménou: systém potřebuje stavové signály (krize,
  po termínu, workflow stavy). Text-first ≠ bez sémantických barev —
  redukuj je na tenké tečky/text, ale NEODSTRAŇUJ význam. A zachovej
  funkční hustotu pro KO (25 rodin = tabulky/seznamy musí zůstat použitelné).

## ZÁVAZNÝ postup redesignu (podle draze zaplacených lekcí)

1. **Přečti si přiložený design systém celý** (README → tokeny → primární
   ukázka). Neber nic z CraftUI kitu.
2. **Polož max 3 ostré otázky** (AskUserQuestion s doporučeními): rozsah
   (desktop / mobil / oboje?), co s barevnými signály stavů, co s tmavým/
   světlým režimem — JEN pokud to příloha neurčuje.
3. **VZOREK PŘED SWEEPEM (nejdůležitější krok):** předělej JEN Login +
   jednu klíčovou obrazovku (Dnes nebo detail rodiny), nasaď NA DEV
   (doprovazeni-dev.web.app — bez souhlasu; prod až po schválení!) nebo dej
   screenshot, a **počkej na výslovné schválení**. Teprve pak pokračuj.
4. **Technika reskinuů (ověřená, levná):** měň HODNOTY tokenů
   v `tailwind.config.js` + `src/index.css` + fonty přes @fontsource —
   názvy tokenů (`brand`, `ink`, `surface`, `native.*`…) NEMĚŇ a třídy
   v komponentách nech být. Celá appka (desktop i mobil) se reskinne
   z ~4 souborů + pár chrome komponent (Sidebar/Topbar/Login). CraftUI
   redesign to potvrdil: kompletní vizuální výměna = ~10 souborů; a stejně
   levný byl i revert.
5. **Struktura se NEMĚNÍ bez explicitního zadání:** workspace třípanel,
   sbalitelný rail, mobilní tab bar, Lidl formulářové vzory na mobilu —
   to vše uživatel opakovaně potvrdil. Text-first = nový kabát, ne nová kostra.
6. Po schválení vzorku: sweep po logických dávkách s lint+build po každé,
   commit po každé dávce, deploy dev; prod až na pokyn.
7. Aktualizuj DESIGN.md (nová sekce, označ starou za nahrazenou), CURRENT_STATE
   a paměť uživatele — a do paměti zapiš i případné odmítnutí.

## Co ze současného designu při text-first redesignu pravděpodobně přežije

- Struktura navigace a všech obrazovek (jen vizuál položek).
- Sémantika Badge tónů (family/ospod/court/bio/crisis + stavové) — zjemni
  provedení, zachovej rozlišitelnost (DESIGN.md §8: „nesmí regresovat").
- Mobilní vzory: hero může zesvětlit (bílý hero s velkou typografií?), ale
  rozhodnutí nech na vzorku.
- Empty-state vzor (ikona v kroužku + titulek + popis + akce) — funguje,
  jen ho odlehči.
