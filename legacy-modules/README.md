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

## Auth kontext a legacy služby (`router-auth-context.jsx`, `services/`)

Přesunuto 2026-07-03 při opravě redirect smyčky po přihlášení (audit nálezu #5).
`router-auth-context.jsx` je archivovaný `AuthContext`/`AuthProvider`/`useAuth`
ze `src/core/router.jsx` — způsoboval smyčku, protože existovaly dva nezávislé
mechanismy rozhodující o přesměrování z `/login` (tenhle kontext + `Login.jsx`
vlastní efekt nad `useAuthStore`). `services/auth.js`, `services/db.js` a
`services/dataService.js` se staly plně osiřelými v okamžiku, kdy `Layout.jsx`
přestal číst identitu/roli přes tenhle kontext a přešel na `useAuthStore` —
nic jiného je už nevolalo. Jejich `./firebase.js` importy jsou teď rozbité
(zůstal v `src/services/firebase.js`) — záměrně neopraveno, tyhle soubory se
už nemají spouštět, jen sloužit jako reference.
