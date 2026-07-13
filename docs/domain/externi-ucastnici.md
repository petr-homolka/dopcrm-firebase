# External Participants — Externí účastníci případu (návrh architektury, 2026-07-06)

Nový modul: obecný účet **External Participant (EP)** pro kohokoli mimo organizaci,
kdo se dotýká případu dítěte — biologický rodič, prarodič, sourozenec, psycholog,
škola, lékař… **Žádné z těchto rolí v systému neexistují.** Existuje jen EP; jeho
význam je dán VÝHRADNĚ: vztahem ke konkrétnímu dítěti + přidělenými oprávněními +
schválenými workflow + auditní historií. Systém nepředpokládá žádná implicitní práva.

Pěstoun (`pestoun`) je fakticky speciální případ EP s přednastaveným balíkem
oprávnění; zůstává zatím samostatný (funkční), migrace na EP je budoucí volitelný krok.

## 1. Datový model

```
external_participants/{epId}
  { organizationId, displayName, email, phone, authUid|null,
    status: 'invited'|'active'|'suspended', note, createdBy, createdAt }

  access/{childId}                     # vztah k JEDNOMU dítěti (0..N dětí)
    { childId, childName, organizationId, relationLabel /*popisný, NE role*/, createdBy, createdAt }

  grants/{grantId}                     # JEDNO oprávnění, verzované v čase
    { childId, permissionKey, status: 'requested'|'approved'|'active'|'revoked'|'expired',
      validFrom, validTo|null,         # platnost od–do (auto-expirace)
      timeWindows: [ { type:'daily'|'weekly', days:[0..6], from:'15:00', to:'18:00',
                       weekParity:'all'|'odd'|'even' } ],   # okna komunikace s dítětem
      reason, reasonType, sourceType, sourceDocId|null,     # doklad u citlivých
      requestedBy, requestedAt, approvedBy, approvedAt, activatedBy, activatedAt,
      revokedBy, revokedAt, createdAt }

  audit/{auditId}                      # NEMĚNNÝ (create-only)
    { ts, actorUid, actorName, actorRole, ip|null, device, action, objectType, objectId, result }
```

**Verzování v čase:** oprávnění se NEPŘEPISUJE — každá změna je nový `grant` dokument
s vlastní platností `validFrom`/`validTo`. Historicky tak lze doložit, že např. rodič
směl komunikovat s dítětem jen 1. 9.–15. 11. na základě konkrétního rozhodnutí a poté
oprávnění automaticky skončilo. „Aktivní teď" = grant se `status:'active'`, `validFrom<=now`,
(`validTo==null || now<=validTo`) a (žádné okno NEBO `now` uvnitř některého `timeWindow`).

## 2. Katalog oprávnění (`src/shared/externalPermissions.js`)

Jemnozrnná, každé zvlášť, VÝCHOZÍ STAV = vše zakázáno. Přidání dalšího = jeden řádek
v katalogu (`{ key, label, category, sensitive }`). Citlivá (`sensitive:true`) vyžadují
doklad + schválení. Výchozí sada: ViewDocuments, ViewTimeline, ViewPhotos, ViewSchool,
**ViewMedical**\*, ViewReports, ViewCalendar, UploadFiles, DownloadFiles,
**SignDocuments**\*, ChatWithCaseWorker, ChatWithFosterParent, **ChatWithChild**\*,
ReceiveNotifications, ConfirmVisits, **VideoCalls**\*  (\* = citlivé).

## 3. Vytvoření účtu (jen Klíčová osoba)

Veřejná registrace NEEXISTUJE. Workflow: KO vytvoří předregistraci (jméno/e-mail/telefon
+ vztah k dítěti) → pozvánka Magic Linkem (e-mail; SMS/WhatsApp jako kanály později,
stejný `sendMagicLink` seam) → pozvaný dokončí registraci → účet aktivní až po dokončení.
Po vytvoření nemá EP ŽÁDNÁ oprávnění.

## 4. Aktivace citlivých oprávnění + schvalovací workflow

Citlivé oprávnění (zejm. `ChatWithChild`) nelze aktivovat bez dokladu. Každá aktivace nese:
`reason`, `reasonType` (soudní rozhodnutí / pokyn OSPOD / rozhodnutí vedení / terapeutický
plán / jiný doložený podklad), `sourceType`, `sourceDocId` (odkaz na existující dokument
nebo nový upload).

**Tři oddělené kroky (různí aktéři), vše auditované:**
- **Requested By** — kdo/co oprávnění iniciuje (např. soudní rozhodnutí; zaznamená KO).
- **Approved By** — kdo schvaluje (např. vedoucí organizace).
- **Activated By** — kdo fakticky aktivuje (klíčová osoba).

Nesmí je provést jeden krok. Necitlivá oprávnění mohou request+approve+activate splynout
do jedné akce KO (stále auditováno). Citlivá vyžadují všechny tři.

## 5. Audit (neměnný)

Každá významná akce: přihlášení/odhlášení, otevření/stažení dokumentu, otevření fotky,
zobrazení osy/školy, odeslání/přečtení zprávy, změna/schválení oprávnění. Pole: datum,
čas, uživatel, IP (jen pokud právní režim dovolí — na klientu nedostupná, doplní backend),
zařízení (user-agent), akce, objekt, výsledek. **Neměnný**: `allow update, delete: if false`.
EP vidí VLASTNÍ audit; administrace kompletní.

## 6. Chat = úřední komunikace

Nelze mazat / upravovat / odvolávat zprávy. Přílohy auditované + **hash** (SHA-256).
Export do PDF a „pro soud". Kompletní audit všech událostí (odesláno/doručeno/přečteno).
Technicky nadstavba stávajícího `messages` modelu s `immutable:true` a bez update/delete rule.

## 7. Dítě jako uživatel

Účet dítěte = EP se `subjectKind:'child'` (odkaz na `children/{id}`). Přístup NENÍ dán věkem
natvrdo — rozsah určuje organizace přes stejný grantový systém. Žádná speciální logika.

## 8. Bez natvrdo zadaných právních omezení

Systém = bezpečný, auditovatelný, konfigurovatelný rámec. Konkrétní oprávnění se nastavují
dle legislativy / soudu / OSPOD / interních pravidel. Model je na změny legislativy připraven
(nová/změněná oprávnění = úprava katalogu + nové granty, bez zásahu do schématu).

## 9. Vynucování (bezpečnost)

Hranice se vynucuje ve VÍCE vrstvách: (a) katalog + grantový engine (`evaluatePermission`,
`isWithinTimeWindows`) v service vrstvě gatuje UI i data-fetch; (b) firestore.rules izolují
EP na jeho vlastní dokumenty a audit dělají append-only; (c) produkčně: přesun kontrol
citlivých čtení do Cloud Functions / custom claims (per-oprávnění na úrovni DB) — DOTÁHNOUT
(docs/INVENTAR.md). V prototypu je engine + audit + izolace EP; plné per-oprávnění DB
vynucení všech typů dat je follow-up.

## 10. A/V hovory (NÁVRH — zatím NEIMPLEMENTOVÁNO)

Audio/videohovor dítě ↔ oprávněná osoba se chová jako chat (úřední, auditovaný, uložitelný
pro soud), ale je náročnější. Návrh viz §samostatná sekce v `docs/domain/av-hovory-navrh.md`.
Klíč: gate přes `VideoCalls` grant + časová okna; nahrávání + úložiště (Storage/Coldline,
retence dle WF-10); **přepis (transcription)** použitelný pro reporty/exporty OSPOD/soud;
možnost běžet mimo naši platformu (Daily/Twilio/LiveKit) nebo self-host WebRTC, ale vždy
s auditní stopou a záznamem.

## 11. Pořadí realizace
EP-1 návrh (tento doc) → EP-2 jádro (katalog+engine+audit+rules) → EP-3 KO správa →
EP-4 EP appka + úřední chat + export → EP-5 A/V (jen návrh). Průběžné nasazování na
moje.doprovazeni.com (stálý souhlas).
