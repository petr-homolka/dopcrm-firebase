# Chat, notifikace a pěstounská PWA (2026-07-06)

Závazná specifikace nové vrstvy: komunikace KO ↔ pěstoun, notifikace a
samostatná omezená appka pěstouna. Zdroj pravdy pro `firestore.rules` a UI.

## 1. Role `pestoun` — REVIZE dřívějšího pravidla

Dřívější pravidlo „Pěstouni a děti NEJSOU Auth uživatelé" (CLAUDE.md) je
**pro pěstouna zrušeno** (rozhodnutí uživatele 2026-07-06). Pěstoun nově má
vlastní Firebase Auth účet a přihlášení. **Dítě zůstává bez účtu.**

- `users/{uid}` pěstouna: `{ role: 'pestoun', organizationId, fosterFamilyId,
  displayName, email }`. Zakládá se pozvánkou od KO/vedení (e-mail + heslo,
  vzor `createEmployee` přes sekundární Auth instanci) — `inviteFoster()`.
- Na dokumentu `foster_families/{id}` přibývá pole `fosterUserIds: []` (uid
  pěstounských účtů rodiny) — jediný zdroj pravdy pro „kdo z pěstounů smí
  vidět tuto rodinu"; pravidla se na něj odkazují bez denormalizace jinam.

## 2. Chat — jedno vlákno, tři úrovně soukromí (`messages`)

`foster_families/{famId}/messages/{msgId}` (podkolekce — roste v čase):
```
{ authorUid, authorRole, authorName, body, audience, recipients[], attachments[], createdAt }
```
`audience`:
- **`private`** — poznámka KO „sobě": čte JEN autor. Nikdo jiný, ani kolegové.
- **`internal`** — spis týmu: čtou zaměstnanci organizace (management/KO/
  asistent/superadmin). `recipients[]` (uid nebo klíč skupiny) = KOMU je
  příspěvek určen → řídí notifikace a zvýraznění, NENÍ to tvrdé ACL (celý
  tým do interního spisu vidí). **Pěstoun `internal` NIKDY nevidí.**
- **`foster`** — zpráva mezi KO a pěstounem: čtou zaměstnanci organizace
  I pěstoun této rodiny. **Jediná úroveň, kterou pěstoun vidí.**

### Hranice soukromí (VYNUCENO v firestore.rules, ne jen v UI)
- Pěstoun čte `messages` jen své rodiny a jen `audience == 'foster'`.
- Pěstoun vytváří `messages` jen své rodiny a jen `audience == 'foster'`
  (jednosměrně: pěstoun píše KO). Nesmí založit `private`/`internal`.
- `private` čte jen `authorUid` (i před ostatními zaměstnanci).
- Úprava/smazání jen vlastní zprávy (autor).

## 3. Notifikace (`users/{uid}/notifications`)

`{ type, title, body, link, read, fromName, createdAt }`. Per-uživatel
podkolekce. Odznak = počet nepřečtených. Čte/označuje/maže jen vlastník;
zakládat smí jiný přihlášený uživatel ze STEJNÉ organizace (get() na
`users/{uid}.organizationId`). Typy: `message` (nová zpráva), `document`
(dokument ke schválení — až bude dokumentový modul), `visit` (návštěva po
termínu — zatím počítáno klientsky na Dnes, bez zápisu).

Kdo koho notifikuje:
- KO pošle `foster` zprávu → notifikace pěstounům rodiny (`fosterUserIds`).
- Pěstoun pošle zprávu → notifikace KO rodiny (`assignedTo`).
- Interní `recipients` → notifikace uvedeným zaměstnancům.

## 4. Pěstounská PWA — omezená appka (role `pestoun`)

Samostatný routing `/moje/*`, spodní tab bar: Domů · Chat · Profil.
Pěstoun vidí VÝHRADNĚ:
- svůj profil (jméno, kontakt),
- profily svých svěřených dětí — **omezené** (jméno, datum narození, škola),
  NE spis/OSPOD/soud/historie,
- finální verze dokumentů + jejich schválení/komentář (dokumentový modul
  zatím není → poctivý prázdný stav),
- chat s KO (`foster` vlákno) + odesílání fotek/dokumentů (příprava, upload
  až s dokumentovým modulem).

Pěstoun NEVIDÍ: časovou osu/spis, interní poznámky, jiné rodiny, kalendář
týmu, respit/SPVPP, sociální prostor rodiny — nic z „kuchyně" KO.

## 5. Co ZATÍM není (vědomě, INVENTAR)
- Dokumentový modul v B2B schématu (upload, verze, schvalování) — pěstounská
  sekce Dokumenty je prázdný stav; příprava rozhraní hotová.
- Skupiny příjemců interních zpráv (zatím jen jednotlivci).
- Cloud Function pro server-side notifikace (zakládají se klientsky).
