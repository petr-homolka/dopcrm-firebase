# Lokalizace legislativy — zásada

Legislativní logika (sazby, druhy péče, workflow) se modeluje jako **konfigurace per země**,
ne natvrdo v kódu. Důvod: doménová pravidla (druhy pěstounské péče, výše dávek, workflow
schvalování) vycházejí z konkrétní národní legislativy (ČR: zákon 359/1999 Sb., MPSV sazby) a
při budoucí expanzi mimo ČR by je nešlo přepsat bez zásahu do jádra aplikace.

**MVP (tento repozitář, 2026):** čistě CZ — žádná abstrakce navíc, žádný výběr země v UI.
Konfigurovatelnost (číselníky druhů péče, sazebníky, WF šablony jako data, ne kód) se zavádí
až ve chvíli, kdy vznikne reálná potřeba druhé země — ne dopředu.

Viz `docs/INVENTAR.md` sekce 10 a [[crm-v8-blueprint]] (i18n přes translation_keys je příbuzná,
ale oddělená otázka — týká se UI textů, ne legislativní logiky).
