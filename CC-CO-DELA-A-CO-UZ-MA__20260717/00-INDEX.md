# CO DĚLÁME A CO UŽ MÁME — kompletní handoff (2026-07-17)

Napsal: Claude Code (Fable 5), AI programátor tohoto projektu od začátku.
Pro: nového AI programátora, který přebírá projekt a bude implementovat
**novou text-first design vizi** (čistý, téměř pouze textový web ve stylu
homepage claude.ai). A pro porovnání přístupů s druhým AI programátorem.

Tento dokument je psán **maximálně pravdivě** — včetně slepých cest, chyb,
zamítnutých designů a věcí, které jen předstírají hotovost (seamy). Nic
nepřikrášluji; co je TODO, je označeno TODO.

## Jak číst

1. Nejdřív **08 (lekce a pasti)** a **12 (metodika práce)** — ušetří ti
   nejvíc tokenů a času.
2. Pak **01–02** (co a jak stavíme), **09** (design historie + nová vize —
   TVOJE hlavní zadání).
3. Zbytek podle potřeby jako referenci.

## Kapitoly

| # | Soubor | Obsah |
|---|--------|-------|
| 01 | `01-co-a-proc-stavime.md` | Produkt, doména, uživatel, dva repozitáře, prototyp vs. V8 |
| 02 | `02-technologie-a-architektura.md` | Stack, struktura kódu, klíčové vzory |
| 03 | `03-desktop.md` | Jak funguje desktop (workspace, shell, obrazovky) |
| 04 | `04-mobil.md` | Jak funguje mobil (samostatná vrstva, PWA, obrazovky) |
| 05 | `05-role-a-bezpecnost.md` | Role, firestore.rules vzory, externí účastníci, magic linky |
| 06 | `06-datovy-model-a-firestore.md` | Kolekce, podkolekce, pravidla modelu |
| 07 | `07-hotove-funkce-inventura.md` | Poctivá inventura hotového vč. seamů |
| 08 | `08-lekce-a-pasti.md` | ⚠️ Na co jsme narazili — čti PRVNÍ |
| 09 | `09-design-historie-a-nova-vize.md` | 4 designové iterace + JAK dělat text-first redesign |
| 10 | `10-provozni-uspornost.md` | Jak držíme provozní náklady dole |
| 11 | `11-co-zbyva-a-plan.md` | Co zbývá dodělat a jak |
| 12 | `12-metodika-prace-ai.md` | Token-úsporný pracovní postup pro AI programátora |
| 13 | `13-workflow-podrobne.md` | Workflow krok za krokem (dokumenty, návštěvy, granty, magic linky…) + katalog WF-1..16 |

## Klíčové soubory projektu (zdroje pravdy, v tomto pořadí)

1. `CLAUDE.md` — závazná pravidla práce (limity, zákazy, prostředí)
2. `DESIGN.md` — závazný design systém (aktuálně Connecteam §2–11 + iOS mobil §12)
3. `CURRENT_STATE.md` — deník stavu (max 300 řádků, starší → `docs/history.md`)
4. `docs/INVENTAR.md` — master checklist funkcí
5. `docs/domain/*.md` — doménové specifikace (chat, dokumenty, EP, timeline…)
6. `firestore.rules` — JEDINÝ zdroj pravdy o oprávněních
7. Paměť uživatele: `C:\Users\Petr Homolka\.claude\projects\C-------ClaudeAI\memory\`

## Stav k 2026-07-17

- Verze 2.5.0, commit `f822878` (checkpoint), větev `main` 39 commitů před origin.
- Nasazeno: dev `doprovazeni-dev.web.app` + prod `moje.doprovazeni.com` (hosting).
- Design: Connecteam (desktop modrá #2E7CF6) + iOS (mobil #007AFF). CraftUI
  redesign byl DNES implementován a NA ŽÁDOST VRÁCEN — viz kapitola 09.
