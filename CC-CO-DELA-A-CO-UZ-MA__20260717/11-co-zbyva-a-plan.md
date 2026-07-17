# 11 — Co zbývá a jak to dodělat

Seřazeno podle doporučené priority. U každé položky je i JAK — ať nezačínáš
od nuly. Master checklist udržuj v `docs/INVENTAR.md`.

## 0) Nová text-first vize (tvůj první úkol)

Postup ZÁVAZNĚ podle kap. 09: přečti přílohu → max 3 otázky → VZOREK
(Login + 1 obrazovka) → schválení → sweep přes token-hodnoty → docs+paměť.
Odhad: vzorek ~1 hod práce; sweep 1–2 hodiny; NEZAČÍNEJ sweepem.

## 1) Dokončit mobilní i18n (~30 souborů)

Mechanika hotová a idempotentní: `t('m.<oblast>.<klíč>', 'přesný původní
text')`, useTranslation do komponent, NEobalovat číselníky ani module-level
konstanty, klíče NEpřidávat do cs.json. Hotovo: MobileHomeScreen,
MobileFamiliesScreen, MobileFamilyDetailScreen, MobileChildDetailScreen,
MobileRespitTab, MobileCalendarScreen, MobileNotificationsScreen (+ zbytek
zkontroluj grepem `useTranslation`). Dělej inline po dávkách 5–7 souborů
s lint+build; NE paralelním workflow (2× spadl na limity a nechal
rozpracované soubory).

## 2) Firebase Storage + nahrávání souborů

Zapnout Storage na dev projektu (konzole) → storage.rules per rodina
(zrcadli fosterOfFamily/isStaff vzory) → upload v `MobileDocumentsTab`/
`FamilyDocumentsTab` s klientskou kompresí (WebP 1920px <400 kB — spec
`docs/domain/dokumentova-pipeline.md`) → náhledy v DocumentDetail
(`createFileDocument` už existuje, `storagePath` pole připravené).

## 3) EP dotažení (největší funkční dluh)

- Gated data-views: EPHomeScreen → skutečné seznamy dokumentů/osy dle
  aktivních grantů (`hasPermission` už existuje; rules rozšířit o čtení
  foster_families podkolekcí pro EP s grantem — POZOR na vzor „list vs pole",
  pravděpodobně to bude chtít denormalizované kopie nebo Functions).
- Úřední chat EP↔KO (audience nová `official`? — navrhni; bez mazání/úprav,
  hash příloh, PDF export pro soud).
- Per-oprávnění vynucení: Cloud Functions (onCall) jako jediná zapisovací
  cesta pro citlivé operace, nebo custom claims sync grantů.

## 4) Backend integrace

- E-mail ingest: MX na pestoun.*@doprovazeni.com → parser (Functions) →
  `ingestDocument` (klientská verze existuje jako vzor payloadu).
- OCR: Vertex Vision v `org/ocr.js` seamu.
- SMS/WhatsApp magic link (placené kanály — až na pokyn).
- A/V hovory: JEN až uživatel řekne; návrh je v docs/domain/av-hovory-navrh.md.

## 5) Menší dluhy

- Rollout workspace vzoru na Kalendář/Tým (dnes klasické stránky).
- Chat: skupiny/kanály/DM (zbytek spec B); stránkování zpráv.
- Notifikace: web-push (SW už existuje) místo/vedle pollingu.
- Branding per organizace v Nastavení (tokeny nejsou připravené — návrh:
  CSS custom properties nad tailwind tokeny, per-org hodnoty z Firestore).
- Šablony karet (superadmin) + globální číselník institucí.
- Vokativ/oslovení — jen pokud uživatel dodá slovník.
- i18n číselníků přes translation_keys (V8 vzor).
- Skutečné UID schéma entit (V8) — dnes neexistuje žádné (CraftUI UID
  odznaky byly odstraněny s revertem).
- Push commitů na origin (uživatel zatím neodsouhlasil push).

## 6) V8 migrace (velký horizont)

Blueprint (~143 tabulek, 10 milníků) má přednost. Drž vrstvy čisté
(services/rules/docs), ať je přenos 1:1 možný. Cíl infrastruktury dle
poslední závazné poznámky: GCP all-in-one (ne Supabase/Vercel), Vertex AI
ověřený. Před začátkem V8 si vyžádej od uživatele potvrzení stacku.

## Jak plánovat práci (proces)

1. Před každým blokem se podívej do `docs/INVENTAR.md` a CURRENT_STATE.md.
2. Větší zadání rozbij na tasky (TaskCreate) — uživatel průběh sleduje.
3. Po bloku: lint + build + (dev deploy) + CURRENT_STATE zápis + commit.
4. Prod deploy a jakékoli prod data VŽDY jen s výslovným souhlasem.
5. Uživatel má rád autonomii („pracuj bez zastavení", „na nic se neptej") —
   ALE ne u vizuálních rozhodnutí a ne u prod zásahů. Tam se ptej vždy.
