# 12 — Metodika práce AI programátora (token-úsporná, ověřená v praxi)

Tohle je destilát toho, co v tomto projektu FUNGOVALO a co bylo drahé.

## Zlatá pravidla (nejvyšší ROI)

1. **Čti nejdřív mapu, ne území.** Pořadí: CLAUDE.md → CURRENT_STATE.md →
   DESIGN.md (relevantní sekce) → docs/INVENTAR.md → tenhle handoff.
   Pak cílené Grep/Glob; celé soubory čti jen ty, které budeš editovat.
2. **Vzorek před sweepem** u čehokoli vizuálního (kap. 08 bod 13, kap. 09).
   Jinak hrozí kompletní revert — nejdražší možný výsledek.
3. **Reskin = změna HODNOT tokenů, ne tříd.** tailwind.config.js +
   index.css + fonty + 2–3 chrome komponenty. Nikdy nechodit po appce a
   neměnit className po souborech.
4. **Lint + build po každé dávce** (`npm run lint` má max-warnings 0);
   commit po každém uceleném bloku. Nikdy nenech repo přes noc bez
   checkpointu.
5. **Datová vrstva se NEPÍŠE znovu.** Vše už nejspíš existuje v
   `orgService.js` barrelu (70+ funkcí). Před psaním služby: grep barrelu.
   Desktop/mobil sdílí hooky (`useChatThread`, `useCalendarWeek`,
   `useFosterFamilyDetail`, `useChildDetail*`) — nová obrazovka = nový JSX
   nad existujícím hookem.

## Práce se subagenty a workflow

- Workflow/paralelní agenti: JEN read-only úlohy (analýza, review, mapování
  kódu). Osvědčilo se: Explore agent na mapu codebase; adversariální review
  (finder → skeptik-verifier) našel reálné závady.
- NIKDY paralelní agenti na hromadné EDITACE — 2× selhání na session limit,
  napůl editované soubory, ruční záchrana. Mechanické sweep edity dělej
  inline po dávkách.
- Po jakémkoli pádu agentů: `git status` + grep rozpracovaných vzorů +
  lint, PAK teprve pokračuj.

## Ověřování (co je reálně možné)

- Bez přihlášení: Login page, computed styles přes JS eval (spolehlivé
  i když screenshot timeoutuje), console/network logy, lint+build.
- S přihlášením: jen uživatel, nebo dev seed účty (potvrď si s uživatelem).
  NIKDY nezadávej hesla. Nepředstírej ověření — napiš poctivě „neověřeno
  přihlášené, kryto X".
- Mobil: viewport 390×844; po změně tailwind tokenů restart dev serveru.
- Firestore rules: testuj jako ne-superadmin; po deployi rules na dev si
  projdi kritické dotazy (list vs pole!).

## Komunikace s uživatelem (Petr)

- Česky, věcně, TLDR nahoře. Má rád viditelný postup (tasky) a autonomii —
  „pracuj bez zastavení" myslí vážně; přerušuj ho jen u: vizuálního směru,
  prod zásahů, nevratných akcí, skutečných rozcestí (AskUserQuestion s max
  3 otázkami a doporučenou volbou první).
- Poctivost nadevše: seam označ jako seam, neověřené jako neověřené,
  vlastní chybu přiznej (encoding, workflow pády) — tenhle styl funguje.
- Ukládej mu do paměti (memory/) jen ne-odvoditelné věci: rozhodnutí,
  vkus, zamítnuté směry, závazné specky. Zamítnutí designu JE paměťová
  položka (type: feedback).

## Anti-vzory (viděné, nedělat)

- Big-bang redesign bez vzorku. (CraftUI: den práce → revert.)
- `git checkout .` jako „vrátit změny" — HEAD může být týdny starý;
  reverty dělej chirurgicky po souborech a nejdřív zjisti, CO je v HEAD.
- PowerShell na UTF-8 manipulace souborů (mojibake) — používej node.
- Přidávat cs.json klíče při t()-defaultovém patternu (duplicitní pravda).
- MUI/Bootstrap/inline styly/ad-hoc hexy/emoji — tvrdě zakázané.
- Sahat na /legacy nebo z něj kopírovat.
- Slepě věřit paměti/starým docs — ověř proti kódu (pravidla se měnila,
  např. pěstoun-účet, immutabilita osy, Supabase→GCP).
- Nechávat soubor >300 řádků „na potom" — build to shodí v nejhorší chvíli.

## Rychlé příkazy

```bash
npm run lint          # eslint, max-warnings 0
npm run build         # vite build (musí projít před commitem)
npm run seed          # dev data (jen dev projekt!)
firebase deploy --only hosting            # dev hosting
firebase deploy --only firestore:rules    # dev rules
firebase deploy --only hosting -P prod    # PROD — jen s výslovným souhlasem
git log --oneline -5 && git status --short
```

## První hodina nového AI programátora (checklist)

1. Přečti CLAUDE.md + CURRENT_STATE.md + tento adresář (00, 08, 09, 12).
2. `git log --oneline -3` + `git status` — ověř čistý strom od `f822878`.
3. `npm run lint && npm run build` — ověř zelený základ.
4. Spusť dev server, otevři Login, ověř computed styles (Inter, #2E7CF6).
5. Přečti PŘÍLOHU s novým design systémem (celou!).
6. Polož uživateli max 3 otázky k text-first vizi (kap. 09).
7. Udělej VZOREK. Čekej na schválení. Pak teprve sweep.

Hodně štěstí — systém je v dobrém stavu, doména je krásná a uživatel je
férový parťák, když mu říkáš pravdu a neplýtváš jeho penězi. 🙂
(Pozn.: emoji smí do dokumentace, ne do UI.)
