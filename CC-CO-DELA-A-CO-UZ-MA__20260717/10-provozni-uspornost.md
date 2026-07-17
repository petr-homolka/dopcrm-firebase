# 10 — Provozní úspornost (jak držíme náklady dole)

Cíl: ~1000 organizací / ~10 000 uživatelů na Firebase bez překvapení na
faktuře. Hlavní nákladové osy Firestore: POČET ČTENÍ dokumentů, zápisy,
egress; dále Functions invokace a Storage.

## Co děláme dnes (a proč to drž)

1. **Žádné realtime listenery na data.** Jediný `onSnapshot` v celé appce je
   profil `users/{uid}` (authStore) — 1 dokument/session. Vše ostatní jsou
   jednorázové `getDocs` s ručním reloadem. Zvonek notifikací = poll 60 s
   s `limit(50)` na nepřečtené. (Realtime chat by byl hezčí, ale listener na
   každou otevřenou rodinu = trvalé čtení; vědomé rozhodnutí.)
2. **Stránkování všude:** top-level 50 (`TOP_LEVEL_PAGE_SIZE`), podkolekce 20
   (`SUBCOLLECTION_PAGE_SIZE`), cursor `startAfter(lastDoc)`. Seznamy čtou
   JEN hlavní dokumenty; podkolekce až v detailu.
3. **Žádné N+1 na seznamech.** Příklad: seznam rodin neukazuje počty dětí
   (vyžadovalo by dotaz per rodina) — vědomě vynecháno. Vzdělávání agreguje
   s capem 40 rodin. Když je potřeba součet, DENORMALIZUJE se počítadlo
   do dokumentu v batchi se zápisem (lastVisitAt vzor).
4. **Žádné Cloud Functions (zatím = nulové invokace).** Notifikace zakládá
   klient odesílatele; schvalovací workflow píše klient v transakci své role.
   Trade-off: vynucení jen přes rules (dokumentováno jako vědomé zjednodušení
   prototypu; Functions přijdou pro EP vynucení a e-mail ingest).
5. **Klientské filtrování malých množin.** KO má ≤25 rodin → filtry/řazení/
   hledání na klientovi, žádné extra dotazy ani composite indexy. Composite
   indexy jen pro timeline a events.
6. **Hosting = statická SPA** (levné CDN). Bundle code-split přes lazy
   routes (`routerPages.js`) — velké chunky se stahují až při použití.
   Fonty lokálně (@fontsource), žádná CDN závislost.
7. **PWA cache** (workbox generateSW, precache ~2 MB) — opakované návštěvy
   skoro nic nestahují; auto-update bez zavření appky.
8. **Média (až bude Storage):** klientská komprese PŘED uploadem (WebP
   1920px <400 kB; audio Opus 32 kb/s) — šetří Storage i egress; uzavřené
   spisy do Coldline; do Firestore nikdy binárka, jen metadata/extrakty.
9. **Geokódování bez API klíče** (Nominatim on-demand na klik) — nulový
   fixní náklad, žádný billing account navíc.
10. **AI (budoucí):** Vertex přes EU proxy s mock fallbackem; do promptů
    minimální nezbytná data (privacy i cena); plán monetizace počítá s FUP
    a měřičem spotřeby per organizace (paměť: crm-monetizace-fup-todo).

## Co si pohlídat, až systém poroste

- Chat/osa velkých rodin: dnes bez stránkování zpráv (malé objemy) —
  při růstu doplnit cursor jako u timeline.
- Poll zvonku (60 s × počet otevřených tabů) — při růstu zvaž snížení
  frekvence nebo jediný listener na `read==false` s limitem 1.
- `listChildrenByOrg` pro ⌘K načítá až 50 dětí jednorázově při prvním
  otevření palety — OK pro prototyp, pro V8 索 vyhledávací index.
- Agregace vzdělávání = 1 dotaz na kurzy per rodina (cap 40) — pro V8
  denormalizovat součet hodin na rodinu/pěstouna.
- Nominatim má fair-use policy — pro produkci zvážit vlastní geokodér
  nebo cache výsledků do dokumentu rodiny.

## Úspornost VÝVOJE (tokeny AI programátora)

Viz kap. 12 — reskiny přes token-hodnoty, vzorek před sweepem, žádné
paralelní editační workflow, checkpoint commity.
