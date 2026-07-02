# Dokumentová pipeline (ingest) — závazná specifikace
# Uložit jako docs/domain/dokumentova-pipeline.md

Každý soubor vstupující do systému (fotka, sken, nahrávka, příloha) prochází VŽDY tímto
procesem. Žádná obrazovka nenahrává do Storage napřímo — vše jde přes službu
`src/services/ingestService.js`. Audio větev detailně: `audio-pipeline.md`.

## Fáze 1 (MVP, na klientu — zdarma)
1. KOMPRESE: fotky před uploadem zmenšit na max 1920px, WebP ~80 % (cíl < 400 kB).
   Originál se nikam neposílá. PDF beze změny.
2. UPLOAD: Storage cesta `orgs/{orgId}/families/{familyId}/{docId}`, metadata: typ, kdo,
   kdy, zařízení. Offline: fronta v IndexedDB, sync při signálu, indikátor stavu.
3. ZÁZNAM: do Firestore podkolekce /documents jen metadata + thumb (miniatura ~20 kB
   base64 pro rychlé seznamy).

## Fáze 2 (V8, Cloud Function po uploadu)
4. KLASIFIKACE: AI určí typ (rozsudek / zpráva / vysvědčení / účtenka / faktura / jiné)
   → předvyplní štítek, uživatel potvrdí.
5. EXTRAKCE dle typu:
   - vysvědčení → předměty a známky (strukturovaně, do vývoje dítěte)
   - rozsudek → AI souhrn + spisová značka + soud + datum
   - účtenka/faktura → částka, datum, dodavatel (pro čerpání SPVPP)
   - nahrávka → přepis (Speech-to-Text cs) → strukturovaný zápis do timeline
6. INDEX: extrakt se ukládá do Firestore (prohledávatelný), originál zůstává ve Storage
   a načítá se JEN po kliknutí na dokument.

## Fáze 3 (provozní úspory)
7. LIFECYCLE: uzavřený spis → soubory do Coldline (retence 15 let), po retenci
   anonymizace dle WF-10.

## Pravidla
- Nikdy externí úložiště (Disk, FTP, hosting) — jen Firebase Storage se security rules
  zděděnými z rodiny.
- AI dostává jen nezbytné minimum, EU region, extrakt vždy schvaluje člověk před
  zápisem k dítěti.
- Seznamy dokumentů čtou jen metadata + thumb; plný soubor až v detailu.
