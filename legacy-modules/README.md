# legacy-modules

Odstavené moduly Sekce A (`tenants/{tenantId}/data_objects`), vypnuté z navigace
a routeru — čekají na náhradu novou implementací na Sekci B.

Na rozdíl od `/legacy` (zamčený archiv vanilla prototypu, viz CLAUDE.md — tam se
nesahá) jsou tohle React/Tailwind soubory z tohoto repa, jen dočasně mimo provoz.
Než se sem něco vrátí do provozu, musí být přepsané na `src/services/org/*.js`
(Sekce B), ne jen znovu zapojené se starým `dataService.js`/`db.js`.

## Dokumenty (`documents/`)

Vypnuto 2026-07-03 (audit nálezu #5, `docs/INVENTAR.md` §11). Nahradí ho nová
implementace podle `docs/domain/dokumentova-pipeline.md` (ingest, komprese,
Firebase Storage) a AI generování dokumentů — ne návrat k tomuto stubu.
