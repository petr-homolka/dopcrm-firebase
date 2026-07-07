# Dokumenty, schvalovací workflow, chat a přihlášení pěstouna (2026-07-06)

Master specifikace většího programu ze zadání uživatele. Doplňuje
`docs/domain/chat-a-pestounska-appka.md`. Zdroj pravdy — nic se nesmí zapomenout.

## A. Přihlášení pěstouna — magic link (napříč platformami)

Cíl: pěstoun se hlásí **jednorázovým odkazem** (žádné trvalé heslo), opakovaně
zasílatelným, aby fungoval stejně na webu, PWA i budoucích iOS/Android (Expo).

- **E-mailový magic link** — Firebase `sendSignInLinkToEmail` + `signInWithEmailLink`
  (nativně web i React Native, jeden mechanismus). Pozvánka od KO/vedení = odeslání
  odkazu; opakované zaslání kdykoli ze správy. Completion route `/prihlaseni`.
- **Invitation-first model:** KO zakládá `foster_invitations/{email}` (rodina, org,
  jméno). Při prvním přihlášení odkazem se z pozvánky materializuje `users/{uid}`
  (role pestoun) + doplní `foster_families.fosterUserIds`. Bez Cloud Functions to dělá
  klientský bootstrap při prvním sign-in (viz orgAuth).
- **SMS (Firebase Phone Auth)** a **WhatsApp** (přes poskytovatele + custom token) =
  placené kanály, DOMYSLET později. Rozhraní `sendFosterInvite(channel)` je připraveno.
- Staré heslo (inviteFoster password) zůstává jako fallback pro dev/testy.

## B. Chat — doplnění na plnou spec

- **4. kategorie „Pro OSPOD"** (`audience: 'ospod'`) — komunikace/dokumenty k úřadu;
  pěstoun NIKDY. Čte tým (isStaff).
- **Filtr podle kategorie** v chatu (jako na Ose).
- **Cílení na skupiny/jednotlivce** — `recipients[]` UI: konkrétní kolega, nebo skupina
  (všechny KO, vedení, region). Řídí notifikace.
- **Týmové kanály + přímé zprávy (DM)** — `organizations/{id}/channels` (budoucí větší
  krok; per-rodinné vlákno je hotové).

## C. Dokumentový modul

`foster_families/{id}/documents/{docId}` (+ vazby na dítě/rodinu). Metadata v Firestore,
obsah v Firebase Storage (dědí rules rodiny). Pole: `title, kind (md|docx|pdf|image),
status, storagePath, currentVersion, subjectRefs[], source (manual|email|foster),
extractedText, createdAt/By`.

- **Interní markdown editor** — nativní dokumenty píše/edituje KO v appce (md).
- **DOCX** — čtení přes mammoth (DOCX→HTML náhled). Editace DOCX v prohlížeči není
  spolehlivá → fallback: stáhnout → upravit → nahrát novou verzi (uživatel odsouhlasil).
- **PDF / obrázky** — náhled (pdf.js / img). 
- **Verze** — `documents/{docId}/versions/{v}` (append-only): kdo, kdy, co (u md diff textu).

## D. Schvalovací workflow (stavový automat)

Stavy: `draft` (Koncept) → `foster_review` (U pěstouna ke schválení) →
[`commented` (Komentováno) / `approved_foster` (Schváleno pěstounem)] → `final` (Konečný)
→ `mgmt_review` (U vedení) → `closed` (Uzavřeno) → `sent` (Odesláno soud/OSPOD) | `filed` (Uloženo).

- **Fáze A (KO↔Pěstoun, opakovatelně):** KO pošle → pěstoun Schválí / Komentuje.
  Po komentáři KO (a) upraví → nová verze → znovu ke schválení, nebo (b) pošle
  nezměněně s vyjádřením. Konec fáze A: pěstoun schválí NEBO KO označí „Konečný".
- **Fáze B (Vedení):** schvalovatel + náhradník uloženi v nastavení KO
  (`users/{uid}.docApprover`, `.docApproverBackup`). Vedení schválí → `closed`;
  neschválí → zpět do fáze A.
- **Výjimka (vedení přímo):** může uzavřít s výhradou → závěrečné varianty:
  `closed`, `closed_foster_unapproved`, `closed_ko_unapproved`, `closed_both_unapproved`.
- **Po uzavření:** teprve `closed*` lze `sent` (soud/OSPOD) nebo `filed`.
- **Auditní stopa:** `documents/{docId}/audit/{id}` — každý krok (verze, souhlas/nesouhlas
  kdo+kdy, změna stavu vč. výhrady). Append-only, nemazatelné.

## E. Příjem dokumentů + časová osa (AI-ready)

- **Nahrání pěstounem** — z jeho appky (foto/PDF) → `documents` se `source='foster'` →
  notifikace KO → záznam do timeline.
- **Příjem e-mailem** (`pestoun.jmeno@doprovazeni.com`) — NOVÁ funkce. Systém dle adresy
  zařadí do spisu pěstouna; KO pak přiřadí rodině/dítěti/kombinaci.
  ⚠️ Vyžaduje inbound e-mail infrastrukturu (MX + parser + webhook/Cloud Function) —
  NELZE provozovat čistě klientsky. Postaveno: datový model (`source='email'`, inbox
  KO „k zařazení"), UI pro zařazení, a DEV nástroj „simulovat příchozí e-mail". Produkční
  napojení = TODO (docs/INVENTAR.md).
- **OCR/extrakce** — příchozí PDF/obrázek se přečte (text) → uloží `extractedText` →
  vloží do **timeline** (data v čase pro AI reporty OSPOD/soud). ⚠️ Vyžaduje Vertex AI /
  Document AI (backend). Postaveno: extrakční rozhraní + timeline zápis + placeholder
  extractor; napojení Vertex = TODO.

## Pořadí realizace
A → B → C → D → E. Průběžné nasazování na dev i moje.doprovazeni.com (stálý souhlas
uživatele 2026-07-06). Co čeká na infrastrukturu, je výše označeno ⚠️.
