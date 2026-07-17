# 07 — Poctivá inventura hotového

Legenda: ✅ hotové a nasazené · 🟡 hotové UI/model, čeká na infrastrukturu
(seam) · 🔴 jen návrh/dokument. „Nasazené" = dev + prod hosting (bundle mluví
s DEV backendem — prototyp).

## Jádro evidence

- ✅ Organizace: self-service registrace, superadmin správa, slug
- ✅ Zaměstnanci: CRUD, role, nadřízený; hierarchická viditelnost až po dítě
- ✅ Rodiny: CRUD, typy péče, statusy, přiřazení KO, kapacita max 25
- ✅ Děti: plná karta (identita s RČ validací a dopočtem data narození,
  doklady, adresy, škola, OSPOD, soud + rozsudky, biologická rodina
  REL_TYPES + průvodce otcem, sociální prostor, poznámky, historie)
- ✅ Časová osa rodiny: záznamy, filtry, pin (max 3), editace (immutabilita
  pozastavena), optimistické UI s retry, stránkování
- ✅ Návštěva s časomírou a GPS (mobil): start → localStorage + banner →
  ukončení → zápis do osy + lastVisitAt batch
- ✅ Respit + SPVPP: limity, vykázáno/reálně, nadstandard, peněženky
- ✅ Vzdělávání: kurzy per pěstoun, roční limity 24/24/18, přehledová
  stránka „pod plánem"
- ✅ Kalendář: desktop (agenda+týden, publish) i mobil (swipe dny + hodinový
  rozvrh), vlastní typy událostí per organizace (číselník)

## Komunikace a dokumenty

- ✅ Chat rodiny se 4 úrovněmi soukromí + filtr; desktop i mobil; notifikace
  protistraně
- ✅ Notifikace: zvonek s odznakem (desktop poll 60 s), plná stránka,
  mobilní zvonek; typy message/document/visit
- ✅ Dokumenty: markdown editor s verzemi, stavový automat schvalování
  (KO ↔ pěstoun ↔ vedení, uzavření s výhradou, odeslání OSPOD/soud, uložení),
  auditní stopa, viditelnost pro pěstouna
- ✅ Reporty pro OSPOD: generátor z časové osy za období → dokument → workflow
  → Tisk/PDF
- ✅ Příjem dokumentů (ingest) s ručním „přečteným textem" → zápis do osy
- 🟡 Nahrávání souborů (PDF/foto/DOCX) — model+UI připravené, **Firebase
  Storage není na dev zapnuté**; náhledy/stažení až s ním
- 🟡 OCR — seam `org/ocr.js` (vrací prázdno), čeká na Vertex
- 🟡 E-mailový příjem (pestoun.jmeno@doprovazeni.com) — model + simulace,
  chybí MX/parser backend
- 🔴 Datová schránka, podpisy šablon s TSA — jen ve vizi (část je hotová ve
  starším vanilla prototypu, ne tady)

## Pěstounská appka a externí účastníci

- ✅ Pěstoun: Auth účet, magic-link pozvánka + přihlášení, /moje/* (děti
  read-only, chat s KO, schvalování/komentování dokumentů)
- ✅ EP modul: pozvání, katalog oprávnění, časově verzované granty + časová
  okna + 3-krokové schválení citlivých, neměnný audit, EP appka /ucastnik/*
  (jen aktivní oprávnění + vlastní audit); desktop i mobil správa
- 🟡 EP gated data-views (skutečné dokumenty/osa/foto dle grantu) — TODO
- 🟡 EP „úřední chat" (bez mazání, hash příloh, PDF export pro soud) — TODO
- 🟡 Per-oprávnění vynucení na DB úrovni (Cloud Functions/claims) — TODO
- 🔴 A/V hovory s přepisem pro soud — POUZE návrh
  (`docs/domain/av-hovory-navrh.md`, Daily.co doporučeno). NEIMPLEMENTOVAT
  bez pokynu.

## Desktop workspace a nástroje

- ✅ Třípanelový workspace, sbalitelný rail (64px), topbar, ⌘K palette
- ✅ Úkoly (kanban dle termínu, Moje/Všechny), Instituce (adresář), Mapa
  v profilu (privacy on-demand OSM)
- ✅ Role dashboardy (KO/org_admin/vedení/superadmin), read-only gating

## Průřezové

- ✅ i18n pattern: desktop nové obrazovky kompletně (`dsk.*` + starší přes
  cs.json); mobil ČÁSTEČNĚ (7 souborů `m.*`, ~30 zbývá)
- ✅ PWA (manifest, SW, auto-update), theme #007AFF
- ✅ Seed skripty pro dev (účty všech rolí, kalendář)
- ✅ Poslední checkpoint commit `f822878`; větev 39 commitů před origin
  (push zatím neproveden)
- 🔴 Monetizace/FUP/AI tarify — jen paměťová poznámka „později"
- 🔴 Šablony karet (superadmin) + globální číselník institucí — TODO
- 🔴 Branding/barvy per organizace v Nastavení — TODO (tokeny na to nejsou
  připravené, viz kap. 11)
